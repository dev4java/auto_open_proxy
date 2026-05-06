import { execFile } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';

const execFileAsync = promisify(execFile);

const CACHE_MS = 45_000;
let cache: { url: string; at: number } | undefined;

export function invalidateSystemProxyDetectCache(): void {
    cache = undefined;
}

function normalizeProxyUrl(raw: string): string | undefined {
    const s = raw.replace(/^["']|["']$/g, '').trim();
    if (!s) {
        return undefined;
    }
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) {
        return s;
    }
    return `http://${s}`;
}

function parseScutilProxy(stdout: string): Record<string, string> {
    const map: Record<string, string> = {};
    for (const line of stdout.split('\n')) {
        const m = line.match(/^\s*([^:]+)\s*:\s*(.+?)\s*$/);
        if (!m) {
            continue;
        }
        const key = m[1].trim();
        const value = m[2].trim();
        if (value.startsWith('<')) {
            continue;
        }
        map[key] = value;
    }
    return map;
}

async function fromMacScutil(): Promise<string | undefined> {
    try {
        const { stdout } = await execFileAsync('/usr/sbin/scutil', ['--proxy'], {
            timeout: 5000,
            maxBuffer: 256 * 1024,
        });
        const map = parseScutilProxy(stdout);
        if (map['HTTPEnable'] === '1' && map['HTTPProxy'] && map['HTTPPort']) {
            return `http://${map['HTTPProxy']}:${map['HTTPPort']}`;
        }
        if (map['HTTPSEnable'] === '1' && map['HTTPSProxy'] && map['HTTPSPort']) {
            return `http://${map['HTTPSProxy']}:${map['HTTPSPort']}`;
        }
        if (map['SOCKSEnable'] === '1' && map['SOCKSProxy'] && map['SOCKSPort']) {
            return `socks5://${map['SOCKSProxy']}:${map['SOCKSPort']}`;
        }
    } catch {
        // 无权限或命令不可用时忽略
    }
    return undefined;
}

async function fromWinNetsh(): Promise<string | undefined> {
    try {
        const { stdout } = await execFileAsync('netsh', ['winhttp', 'show', 'proxy'], {
            timeout: 5000,
            windowsHide: true,
            maxBuffer: 64 * 1024,
        });
        if (/Direct access/i.test(stdout)) {
            return undefined;
        }
        const m = stdout.match(/Proxy Server\(s\)\s*:\s*(\S+)/i);
        if (m) {
            return normalizeProxyUrl(m[1]);
        }
    } catch {
        // ignore
    }
    return undefined;
}

async function fromEnv(): Promise<string | undefined> {
    const candidates = [
        process.env.HTTPS_PROXY,
        process.env.ALL_PROXY ?? process.env.All_PROXY,
        process.env.HTTP_PROXY,
    ];
    for (const c of candidates) {
        const u = c ? normalizeProxyUrl(c) : undefined;
        if (u) {
            return u;
        }
    }
    return undefined;
}

/**
 * 从系统/环境推断本地代理 URL（不读取用户 shell 配置文件）。
 * macOS：优先解析「系统代理」设置（代理软件勾选「设置为系统代理」时可见）。
 * Windows：WinHTTP 代理。
 * 全平台：进程环境变量 HTTPS_PROXY / ALL_PROXY / HTTP_PROXY。
 */
export async function detectSystemProxyUrl(): Promise<string | undefined> {
    const now = Date.now();
    if (cache && now - cache.at < CACHE_MS) {
        return cache.url;
    }

    let url: string | undefined;
    const platform = os.platform();
    if (platform === 'darwin') {
        url = await fromMacScutil();
    } else if (platform === 'win32') {
        url = await fromWinNetsh();
    }
    if (!url) {
        url = await fromEnv();
    }

    if (url) {
        cache = { url, at: now };
    }
    return url;
}
