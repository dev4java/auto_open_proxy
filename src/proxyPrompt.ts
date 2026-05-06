import * as vscode from 'vscode';
import { detectSystemProxyUrl } from './proxyDetect';
import { t } from './i18n';

export type ProxyResolution =
    | { kind: 'explicit'; url: string }
    | { kind: 'detected'; url: string }
    | { kind: 'none' };

interface ActionPickItem extends vscode.QuickPickItem {
    readonly action: 'use' | 'port' | 'full';
}

interface MissingPickItem extends vscode.QuickPickItem {
    readonly action: 'port' | 'full' | 'settings';
}

function parseProxyParts(urlStr: string): { scheme: string; host: string; port: string } {
    try {
        const u = new URL(urlStr);
        let scheme = u.protocol.replace(/:$/, '').toLowerCase();
        if (scheme === 'socks') {
            scheme = 'socks5';
        }
        if (scheme === 'https') {
            scheme = 'http';
        }
        return {
            scheme: scheme === 'socks5' ? 'socks5' : 'http',
            host: u.hostname || '127.0.0.1',
            port: u.port || '',
        };
    } catch {
        return { scheme: 'http', host: '127.0.0.1', port: '' };
    }
}

function buildProxyUrl(scheme: string, host: string, port: string): string {
    const sch = scheme === 'socks' ? 'socks5' : scheme;
    return `${sch}://${host}:${port}`;
}

function validatePortText(input: string): string | undefined {
    const v = input.trim();
    if (!v || !/^\d+$/.test(v)) {
        return t('proxyInputPortInvalid');
    }
    const n = Number(v);
    if (n < 1 || n > 65535) {
        return t('proxyInputPortInvalid');
    }
    return undefined;
}

function validateAbsoluteUrl(input: string): string | undefined {
    const s = input.trim();
    if (!s) {
        return t('proxyInputFullInvalid');
    }
    try {
        const u = new URL(s);
        if (!u.hostname) {
            return t('proxyInputFullInvalid');
        }
        return undefined;
    } catch {
        return t('proxyInputFullInvalid');
    }
}

async function confirmDetectedProxyUrl(detectedUrl: string): Promise<string | undefined> {
    const items: ActionPickItem[] = [
        {
            label: `$(check) ${t('proxyPickUseDetected')}`,
            description: detectedUrl,
            action: 'use',
        },
        {
            label: `$(edit) ${t('proxyPickChangePort')}`,
            description: t('proxyPickChangePortDesc'),
            action: 'port',
        },
        {
            label: `$(symbol-field) ${t('proxyPickEnterFullUrl')}`,
            description: t('proxyPickEnterFullDesc'),
            action: 'full',
        },
    ];

    const picked = await vscode.window.showQuickPick<ActionPickItem>(items, {
        title: t('proxyConfirmDetectedTitle'),
        placeHolder: t('proxyConfirmDetectedPlaceholder'),
        ignoreFocusOut: true,
    });

    if (!picked) {
        return undefined;
    }

    if (picked.action === 'use') {
        return detectedUrl;
    }

    const parts = parseProxyParts(detectedUrl);

    if (picked.action === 'port') {
        const port = await vscode.window.showInputBox({
            title: t('proxyInputPortTitle'),
            prompt: t('proxyInputPortPrompt'),
            value: parts.port,
            placeHolder: '7890 / 9810 …',
            ignoreFocusOut: true,
            validateInput: validatePortText,
        });
        if (!port?.trim()) {
            return undefined;
        }
        return buildProxyUrl(parts.scheme, parts.host, port.trim());
    }

    const full = await vscode.window.showInputBox({
        title: t('proxyInputFullTitle'),
        prompt: t('proxyInputFullPrompt'),
        value: detectedUrl,
        ignoreFocusOut: true,
        validateInput: validateAbsoluteUrl,
    });
    return full?.trim();
}

async function promptProxyWhenMissing(): Promise<string | undefined> {
    const items: MissingPickItem[] = [
        {
            label: `$(terminal) ${t('proxyMissingEnterPort')}`,
            description: t('proxyMissingEnterPortDesc'),
            action: 'port',
        },
        {
            label: `$(link) ${t('proxyMissingEnterFull')}`,
            description: t('proxyMissingEnterFullDesc'),
            action: 'full',
        },
        {
            label: `$(gear) ${t('msgAction_OpenSettings')}`,
            description: 'autoProxy.proxyUrl',
            action: 'settings',
        },
    ];

    const picked = await vscode.window.showQuickPick<MissingPickItem>(items, {
        title: t('proxyMissingTitle'),
        placeHolder: t('proxyMissingPlaceholder'),
        ignoreFocusOut: true,
    });

    if (!picked) {
        return undefined;
    }

    if (picked.action === 'settings') {
        await vscode.commands.executeCommand('workbench.action.openSettings', 'autoProxy.proxyUrl');
        return undefined;
    }

    if (picked.action === 'port') {
        const port = await vscode.window.showInputBox({
            title: t('proxyInputPortTitle'),
            prompt: t('proxyInputPortPrompt'),
            placeHolder: '9810',
            ignoreFocusOut: true,
            validateInput: validatePortText,
        });
        if (!port?.trim()) {
            return undefined;
        }
        return buildProxyUrl('http', '127.0.0.1', port.trim());
    }

    const full = await vscode.window.showInputBox({
        title: t('proxyInputFullTitle'),
        prompt: t('proxyInputFullPrompt'),
        placeHolder: 'http://127.0.0.1:9810',
        ignoreFocusOut: true,
        validateInput: validateAbsoluteUrl,
    });
    return full?.trim();
}

/**
 * 解析代理来源：仅 autoProxy.proxyUrl / 系统与环境检测 / 无。
 * 不在此读取 lastUsedProxyUrl：未开代理时点「启用」不应自动套用上次的地址。
 */
export async function resolveProxyResolution(): Promise<ProxyResolution> {
    const config = vscode.workspace.getConfiguration('autoProxy');
    const manual = (config.get<string>('proxyUrl', '') ?? '').trim();
    if (manual) {
        return { kind: 'explicit', url: manual };
    }
    const autoDetect = config.get<boolean>('autoDetectSystemProxy', true);
    if (!autoDetect) {
        return { kind: 'none' };
    }
    const detected = await detectSystemProxyUrl();
    if (detected) {
        console.log(`[Auto Proxy] ${t('logProxyDetected')}: ${detected}`);
        return { kind: 'detected', url: detected };
    }
    return { kind: 'none' };
}

/**
 * 启用代理前的最终 URL：显式配置直接使用；检测结果必须经用户确认或改端口；无则引导输入。
 */
export async function prepareProxyUrlForUse(): Promise<string | undefined> {
    const resolution = await resolveProxyResolution();
    if (resolution.kind === 'explicit') {
        return resolution.url;
    }
    if (resolution.kind === 'detected') {
        return confirmDetectedProxyUrl(resolution.url);
    }
    return promptProxyWhenMissing();
}
