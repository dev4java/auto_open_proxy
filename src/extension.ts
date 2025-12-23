import * as vscode from 'vscode';
import * as os from 'os';
import fetch from 'node-fetch';
import { initI18n, t } from './i18n';

let checkInterval: NodeJS.Timeout | undefined;
let networkCheckInterval: NodeJS.Timeout | undefined;
let statusBarItem: vscode.StatusBarItem;
let isProxyEnabled = false;
let isAutoCheckRunning = false;
let lastNetworkState: string = '';

/**
 * 检测 URL 是否可访问
 */
async function checkUrl(url: string, timeout: number): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            redirect: 'follow',
        });

        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        return false;
    }
}

/**
 * 检测 AI 服务连接状态
 */
async function checkAIServiceConnection(): Promise<boolean> {
    const config = vscode.workspace.getConfiguration('autoProxy');
    const testUrls: string[] = config.get('testUrls', [
        'https://api.anthropic.com',
        'https://api.openai.com',
    ]);
    const timeout: number = config.get('timeout', 5000);

    // 尝试连接任意一个 AI 服务
    for (const url of testUrls) {
        const accessible = await checkUrl(url, timeout);
        if (accessible) {
            return true;
        }
    }

    return false;
}

/**
 * 获取当前代理配置
 */
function getCurrentProxy(): string | undefined {
    const config = vscode.workspace.getConfiguration('http');
    return config.get<string>('proxy');
}

/**
 * 设置代理
 */
async function setProxy(proxyUrl: string): Promise<void> {
    const config = vscode.workspace.getConfiguration('http');
    await config.update('proxy', proxyUrl, vscode.ConfigurationTarget.Global);
    isProxyEnabled = true;
    updateStatusBar();
}

/**
 * 移除代理
 */
async function removeProxy(): Promise<void> {
    // 保存当前代理配置（用户可能修改过）
    const currentProxy = getCurrentProxy();
    if (currentProxy && currentProxy.trim() !== '') {
        const autoProxyConfig = vscode.workspace.getConfiguration('autoProxy');
        await autoProxyConfig.update('lastUsedProxyUrl', currentProxy, vscode.ConfigurationTarget.Global);
        console.log(`[Auto Proxy] 已保存代理地址: ${currentProxy}`);
    }
    
    // 清空代理配置
    const httpConfig = vscode.workspace.getConfiguration('http');
    await httpConfig.update('proxy', undefined, vscode.ConfigurationTarget.Global);
    isProxyEnabled = false;
    updateStatusBar();
    console.log(`[Auto Proxy] 代理配置已清空`);
}

/**
 * 更新状态栏
 */
function updateStatusBar(): void {
    if (isProxyEnabled) {
        statusBarItem.text = `$(globe) ${t('statusProxyEnabled')}`;
        statusBarItem.tooltip = t('statusTooltipDisable');
        statusBarItem.command = 'auto-proxy.disableProxy';
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    } else {
        statusBarItem.text = `$(globe) ${t('statusProxyDisabled')}`;
        statusBarItem.tooltip = t('statusTooltipEnable');
        statusBarItem.command = 'auto-proxy.enableProxy';
        statusBarItem.backgroundColor = undefined;
    }
    statusBarItem.show();
}

/**
 * 获取要使用的代理地址（优先使用上次保存的）
 */
function getProxyUrlToUse(): string {
    const config = vscode.workspace.getConfiguration('autoProxy');
    const lastUsedProxy: string = config.get('lastUsedProxyUrl', '');
    const defaultProxy: string = config.get('proxyUrl', 'http://127.0.0.1:7890');
    return lastUsedProxy && lastUsedProxy.trim() !== '' ? lastUsedProxy : defaultProxy;
}

/**
 * 执行连接检查（询问模式 - 启动时使用）
 */
async function performCheckAndAsk(): Promise<void> {
    const proxyUrl = getProxyUrlToUse();
    const currentProxy = getCurrentProxy();

    console.log(`[Auto Proxy] ${t('networkCheckStart')}`);

    const canConnect = await checkAIServiceConnection();

    if (canConnect) {
        // 可以连接，不需要代理
        console.log(`[Auto Proxy] ${t('networkAccessible')}`);
        
        if (currentProxy && currentProxy.trim() !== '') {
            // 当前有代理配置，询问是否移除
            const action = await vscode.window.showInformationMessage(
                t('msgNetworkOkWithProxy'),
                t('msgNetworkOkAction1'),
                t('msgNetworkOkAction2'),
                t('msgNetworkOkAction3')
            );

            if (action === t('msgNetworkOkAction1')) {
                await removeProxy();
                vscode.window.showInformationMessage(t('msgProxyDisabled'));
            } else if (action === t('msgNetworkOkAction3')) {
                const config = vscode.workspace.getConfiguration('autoProxy');
                await config.update('enabled', false, vscode.ConfigurationTarget.Global);
                stopAutoCheck();
            }
        } else {
            // 没有代理，简单提示
            vscode.window.showInformationMessage(
                t('msgNetworkOk'),
                t('msgAction_Ok')
            );
        }
    } else {
        // 无法连接，询问是否启用代理
        console.log(`[Auto Proxy] ${t('networkNotAccessible')}`);
        
        if (!currentProxy || currentProxy.trim() === '') {
            // 当前没有代理，询问是否启用
            const action = await vscode.window.showWarningMessage(
                `${t('msgNetworkFail')} (${proxyUrl})`,
                { modal: false },
                t('msgAction_EnableProxy'),
                t('msgAction_DontEnable'),
                t('msgAction_NoMoreTips')
            );

            if (action === t('msgAction_EnableProxy')) {
                await setProxy(proxyUrl);
                vscode.window.showInformationMessage(
                    `${t('msgProxyEnabled')}\n${t('msgProxyEnsureRunning')}`,
                    t('msgAction_DisableProxy'),
                    t('msgAction_Ok')
                ).then((btn) => {
                    if (btn === t('msgAction_DisableProxy')) {
                        removeProxy();
                    }
                });
            } else if (action === t('msgAction_NoMoreTips')) {
                const config = vscode.workspace.getConfiguration('autoProxy');
                await config.update('enabled', false, vscode.ConfigurationTarget.Global);
                stopAutoCheck();
                vscode.window.showInformationMessage(t('msgAutoCheckStopped'));
            }
        } else {
            // 已有代理配置，提示状态
            vscode.window.showInformationMessage(
                `ℹ️ ${t('networkNotAccessible')}\n${t('msgAction_KeepProxy')}: ${currentProxy}`,
                t('msgAction_DisableProxy'),
                t('msgAction_Ok')
            ).then((action) => {
                if (action === t('msgAction_DisableProxy')) {
                    removeProxy();
                }
            });
        }
    }
}

/**
 * 执行连接检查（静默模式 - 定时检查使用）
 */
async function performAutoCheck(): Promise<void> {
    const config = vscode.workspace.getConfiguration('autoProxy');
    const enabled: boolean = config.get('enabled', true);
    
    if (!enabled) {
        return;
    }

    const proxyUrl = getProxyUrlToUse();
    const currentProxy = getCurrentProxy();

    console.log(`[Auto Proxy] 定时检测 AI 服务连接状态...`);

    const canConnect = await checkAIServiceConnection();

    if (canConnect) {
        // 可以连接，不需要代理
        console.log('[Auto Proxy] ✅ AI 服务可访问，无需代理');
        
        if (currentProxy && currentProxy.trim() !== '') {
            // 当前有代理配置，自动移除并提示
            await removeProxy();
            console.log('[Auto Proxy] 已自动移除代理配置');
            showAutoCloseMessage('✅ AI 服务可直接访问，已自动移除代理配置', 10000);
        }
    } else {
        // 无法连接，需要代理
        console.log('[Auto Proxy] ❌ AI 服务无法访问');
        
        if (!currentProxy || currentProxy.trim() === '') {
            // 当前没有代理，询问是否启用
            showAutoCloseMessage('⚠️ 无法连接 AI 服务，建议启用代理', 10000);
            
            const action = await vscode.window.showWarningMessage(
                `⚠️ 无法连接 AI 服务，是否启用代理？`,
                { modal: false },
                '启用代理',
                '不启用',
                '停止检测'
            );

            if (action === '启用代理') {
                await setProxy(proxyUrl);
                showAutoCloseMessage(`✅ 已自动启用代理: ${proxyUrl}`, 10000);
                vscode.window.showInformationMessage(
                    '✅ 已启用代理，请确保代理服务正在运行',
                    '禁用代理'
                ).then((btn) => {
                    if (btn === '禁用代理') {
                        removeProxy();
                    }
                });
            } else if (action === '停止检测') {
                const config = vscode.workspace.getConfiguration('autoProxy');
                await config.update('enabled', false, vscode.ConfigurationTarget.Global);
                stopAutoCheck();
            }
        }
    }
}

/**
 * 获取当前网络状态（用于检测网络变化）
 */
function getNetworkState(): string {
    const interfaces = os.networkInterfaces();
    const state = Object.keys(interfaces)
        .map(name => {
            const iface = interfaces[name];
            if (!iface) return '';
            return iface
                .filter(addr => !addr.internal)
                .map(addr => `${name}:${addr.address}`)
                .join(',');
        })
        .filter(s => s)
        .join('|');
    return state;
}

/**
 * 显示自动消失的提示
 */
function showAutoCloseMessage(message: string, timeoutMs: number = 10000): void {
    const disposable = vscode.window.setStatusBarMessage(message, timeoutMs);
    
    // 同时显示一个通知（不会自动关闭，但用户可以手动关闭）
    vscode.window.showInformationMessage(message);
}

/**
 * 监听网络变化
 */
function startNetworkMonitor(): void {
    // 每5秒检查一次网络接口变化
    networkCheckInterval = setInterval(() => {
        const currentState = getNetworkState();
        if (lastNetworkState && currentState !== lastNetworkState) {
            console.log('[Auto Proxy] 🔄 检测到网络变化，触发检测');
            showAutoCloseMessage('🔄 检测到网络变化，正在检测 AI 服务连接状态...', 10000);
            
            // 延迟1秒后检测，让网络稳定
            setTimeout(() => {
                performAutoCheck();
            }, 1000);
        }
        lastNetworkState = currentState;
    }, 5000);
}

/**
 * 停止网络监听
 */
function stopNetworkMonitor(): void {
    if (networkCheckInterval) {
        clearInterval(networkCheckInterval);
        networkCheckInterval = undefined;
    }
}

/**
 * 启动定时检查
 */
function startAutoCheck(runImmediately: boolean = false): void {
    const config = vscode.workspace.getConfiguration('autoProxy');
    const intervalSeconds: number = config.get('checkInterval', 60);
    
    // 清除现有的定时器
    if (checkInterval) {
        clearInterval(checkInterval);
    }

    // 如果需要立即执行一次检查
    if (runImmediately) {
        performCheckAndAsk();
    }

    // 设置定时检查
    checkInterval = setInterval(() => {
        performAutoCheck();
    }, intervalSeconds * 1000);

    // 启动网络监听
    lastNetworkState = getNetworkState();
    startNetworkMonitor();

    isAutoCheckRunning = true;
    updateStatusBar();
    console.log(`[Auto Proxy] ${t('logInterval')}: ${intervalSeconds}s`);
    console.log('[Auto Proxy] 网络变化监听已启动');
}

/**
 * 停止定时检查
 */
function stopAutoCheck(): void {
    if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = undefined;
    }
    stopNetworkMonitor();
    isAutoCheckRunning = false;
    updateStatusBar();
    console.log('[Auto Proxy] 已停止自动检查');
}

/**
 * 插件激活
 */
export function activate(context: vscode.ExtensionContext) {
    // 初始化国际化
    initI18n(vscode.env.language);
    
    console.log(`[Auto Proxy] ${t('logActivated')}`);
    console.log('[Auto Proxy] 插件已激活');

    // 创建状态栏项
    statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    
    // 检查当前代理状态
    const currentProxy = getCurrentProxy();
    isProxyEnabled = !!(currentProxy && currentProxy.trim() !== '');
    updateStatusBar();

    context.subscriptions.push(statusBarItem);
    console.log('[Auto Proxy] 状态栏已创建');

    // 注册命令：手动检查连接
    const checkConnectionCommand = vscode.commands.registerCommand(
        'auto-proxy.checkConnection',
        async () => {
            await performCheckAndAsk();
        }
    );

    // 注册命令：启用代理
    const enableProxyCommand = vscode.commands.registerCommand(
        'auto-proxy.enableProxy',
        async () => {
            const config = vscode.workspace.getConfiguration('autoProxy');
            // 优先使用上次保存的代理地址，如果没有才使用默认值
            const lastUsedProxy: string = config.get('lastUsedProxyUrl', '');
            const defaultProxy: string = config.get('proxyUrl', 'http://127.0.0.1:7890');
            const proxyUrl = lastUsedProxy && lastUsedProxy.trim() !== '' ? lastUsedProxy : defaultProxy;
            
            console.log(`[Auto Proxy] 启用代理: ${proxyUrl} (上次使用: ${lastUsedProxy || '无'})`);
            
            await setProxy(proxyUrl);
            vscode.window.showInformationMessage(
                `✅ 已启用代理: ${proxyUrl}\n请确保代理服务正在运行`,
                '禁用代理',
                '确定'
            ).then((action) => {
                if (action === '禁用代理') {
                    removeProxy();
                }
            });
        }
    );

    // 注册命令：禁用代理
    const disableProxyCommand = vscode.commands.registerCommand(
        'auto-proxy.disableProxy',
        async () => {
            await removeProxy();
            vscode.window.showInformationMessage(
                t('msgProxyDisabled'),
                t('msgAction_EnableProxy'),
                t('msgAction_Ok')
            ).then((action) => {
                if (action === t('msgAction_EnableProxy')) {
                    const proxyUrl = getProxyUrlToUse();
                    setProxy(proxyUrl);
                }
            });
        }
    );

    // 注册命令：切换自动检测
    const toggleAutoCheckCommand = vscode.commands.registerCommand(
        'auto-proxy.toggleAutoCheck',
        async () => {
            const config = vscode.workspace.getConfiguration('autoProxy');
            const enabled: boolean = config.get('enabled', true);
            
            await config.update('enabled', !enabled, vscode.ConfigurationTarget.Global);
            
            if (!enabled) {
                startAutoCheck();
                vscode.window.showInformationMessage(t('msgAutoCheckResumed'), t('msgAction_OpenSettings'));
            } else {
                stopAutoCheck();
                vscode.window.showInformationMessage(t('msgAutoCheckPaused'), t('msgAction_OpenSettings'));
            }
        }
    );
    
    // 注册命令：停止自动检测（独立命令）
    const stopAutoCheckCommand = vscode.commands.registerCommand(
        'auto-proxy.stopAutoCheck',
        async () => {
            const config = vscode.workspace.getConfiguration('autoProxy');
            await config.update('enabled', false, vscode.ConfigurationTarget.Global);
            stopAutoCheck();
            vscode.window.showInformationMessage(t('msgAutoCheckStopped'));
        }
    );
    
    // 注册命令：启动自动检测（独立命令）
    const startAutoCheckCommand = vscode.commands.registerCommand(
        'auto-proxy.startAutoCheck',
        async () => {
            const config = vscode.workspace.getConfiguration('autoProxy');
            await config.update('enabled', true, vscode.ConfigurationTarget.Global);
            startAutoCheck();
            vscode.window.showInformationMessage(t('msgAutoCheckStarted'));
        }
    );

    context.subscriptions.push(
        checkConnectionCommand,
        enableProxyCommand,
        disableProxyCommand,
        toggleAutoCheckCommand,
        stopAutoCheckCommand,
        startAutoCheckCommand
    );
    console.log('[Auto Proxy] 所有命令已注册');

    // 监听配置变化
    const configChangeListener = vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('autoProxy')) {
            console.log('[Auto Proxy] 配置已更改，重启自动检查');
            const config = vscode.workspace.getConfiguration('autoProxy');
            const enabled: boolean = config.get('enabled', true);
            
            if (enabled) {
                startAutoCheck();
            } else {
                stopAutoCheck();
            }
        }
    });

    context.subscriptions.push(configChangeListener);

    // 启动自动检查（立即执行一次检测）
    const config = vscode.workspace.getConfiguration('autoProxy');
    const enabled: boolean = config.get('enabled', true);
    
    console.log(`[Auto Proxy] autoProxy.enabled = ${enabled}`);
    
    if (enabled) {
        // 启动定时检查，并立即执行一次检测
        console.log('[Auto Proxy] 准备启动自动检查并立即执行检测');
        startAutoCheck(true);
    } else {
        console.log('[Auto Proxy] 自动检测已禁用，不执行初始检测');
    }
    
    console.log('[Auto Proxy] ========== 插件激活完成 ==========');
}

/**
 * 插件停用
 */
export function deactivate() {
    stopAutoCheck();
    stopNetworkMonitor();
    console.log(`[Auto Proxy] ${t('logDeactivated')}`);
}

