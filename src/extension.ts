import * as vscode from 'vscode';
import * as os from 'os';
import fetch from 'node-fetch';
import { initI18n, t } from './i18n';
import { invalidateSystemProxyDetectCache } from './proxyDetect';
import { prepareProxyUrlForUse } from './proxyPrompt';

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
 * 清除用户设置中的 http.proxy。
 * Cursor 等宿主禁止将 http.proxy 写入工作区/文件夹作用域，故只更新 Global，否则会报错。
 */
async function clearHttpProxyUserScope(): Promise<void> {
    const root = vscode.workspace.getConfiguration('http');
    await root.update('proxy', undefined, vscode.ConfigurationTarget.Global);
    if (getCurrentProxy()?.trim()) {
        await root.update('proxy', '', vscode.ConfigurationTarget.Global);
    }
    if (getCurrentProxy()?.trim()) {
        void vscode.window.showWarningMessage(t('msgHttpProxyMayRemainFromWorkspace'));
    }
}

/**
 * 设置代理
 */
async function setProxy(proxyUrl: string): Promise<void> {
    const config = vscode.workspace.getConfiguration('http');
    await config.update('proxy', proxyUrl, vscode.ConfigurationTarget.Global);

    // 保存当前设置的代理地址
    const autoProxyConfig = vscode.workspace.getConfiguration('autoProxy');
    await autoProxyConfig.update('lastUsedProxyUrl', proxyUrl, vscode.ConfigurationTarget.Global);

    isProxyEnabled = true;
    updateStatusBar();
    console.log(`[Auto Proxy] ${t('logProxyWritten')}: ${proxyUrl}`);
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
        console.log(`[Auto Proxy] ${t('logPersistedProxyAddress')}: ${currentProxy}`);
    }

    await clearHttpProxyUserScope();

    isProxyEnabled = false;
    updateStatusBar();
    console.log(`[Auto Proxy] ${t('logHttpProxyClearedShort')}`);
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
 * 执行连接检查（询问模式 - 启动时使用）
 */
async function performCheckAndAsk(): Promise<void> {
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
            // 当前没有代理，询问是否启用（启用时会确认/输入端口，尤其是系统检测结果）
            const action = await vscode.window.showWarningMessage(
                `${t('msgNetworkFail')}\n${t('msgNetworkFailConfirmHint')}`,
                { modal: false },
                t('msgAction_EnableProxy'),
                t('msgAction_DontEnable'),
                t('msgAction_NoMoreTips')
            );

            if (action === t('msgAction_EnableProxy')) {
                const proxyUrl = await prepareProxyUrlForUse();
                if (!proxyUrl) {
                    return;
                }
                await setProxy(proxyUrl);
                vscode.window.showInformationMessage(
                    `${t('msgProxyEnabled')}: ${proxyUrl}\n${t('msgProxyEnsureRunning')}`,
                    t('msgAction_DisableProxy'),
                    t('msgAction_OpenSettings'),
                    t('msgAction_Ok')
                ).then(async (btn) => {
                    if (btn === t('msgAction_DisableProxy')) {
                        await removeProxy();
                        vscode.window.showInformationMessage(t('msgProxyDisabled'));
                    } else if (btn === t('msgAction_OpenSettings')) {
                        await vscode.commands.executeCommand('workbench.action.openSettings', 'autoProxy.proxyUrl');
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
                `${t('msgKeepProxyWhileUnreachable')}\n${currentProxy}`,
                t('msgAction_DisableProxy'),
                t('msgAction_Ok')
            ).then(async (action) => {
                if (action === t('msgAction_DisableProxy')) {
                    await removeProxy();
                    vscode.window.showInformationMessage(t('msgProxyDisabled'));
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

    const currentProxy = getCurrentProxy();

    console.log(`[Auto Proxy] ${t('logCheckStarted')}`);

    const canConnect = await checkAIServiceConnection();

    if (canConnect) {
        // 可以连接，不需要代理
        console.log(`[Auto Proxy] ${t('networkAccessible')}`);
        
        if (currentProxy && currentProxy.trim() !== '') {
            // 当前有代理配置，自动移除并提示
            await removeProxy();
            console.log(`[Auto Proxy] ${t('logProxyRemovedBecauseDirect')}`);
            showAutoCloseMessage(t('msgAutoCheckDirectRemovedProxy'), 10000);
        }
    } else {
        // 无法连接，需要代理
        console.log(`[Auto Proxy] ${t('networkNotAccessible')}`);
        
        if (!currentProxy || currentProxy.trim() === '') {
            showAutoCloseMessage(t('msgAutoCheckBanner'), 10000);

            const action = await vscode.window.showWarningMessage(
                `${t('msgNetworkFail')}\n${t('msgNetworkFailConfirmHint')}`,
                { modal: false },
                t('msgAction_EnableProxy'),
                t('msgAction_DontEnable'),
                t('msgAction_StopCheck')
            );

            if (action === t('msgAction_EnableProxy')) {
                const proxyUrl = await prepareProxyUrlForUse();
                if (!proxyUrl) {
                    return;
                }
                await setProxy(proxyUrl);
                showAutoCloseMessage(`${t('msgProxyEnabled')}: ${proxyUrl}`, 10000);
                vscode.window
                    .showInformationMessage(
                        `${t('msgProxyEnabled')}: ${proxyUrl}\n${t('msgProxyEnsureRunning')}`,
                        t('msgAction_DisableProxy'),
                        t('msgAction_OpenSettings'),
                        t('msgAction_Ok')
                    )
                    .then(async (btn) => {
                        if (btn === t('msgAction_DisableProxy')) {
                            await removeProxy();
                            vscode.window.showInformationMessage(t('msgProxyDisabled'));
                        } else if (btn === t('msgAction_OpenSettings')) {
                            await vscode.commands.executeCommand('workbench.action.openSettings', 'autoProxy.proxyUrl');
                        }
                    });
            } else if (action === t('msgAction_StopCheck')) {
                const cfg = vscode.workspace.getConfiguration('autoProxy');
                await cfg.update('enabled', false, vscode.ConfigurationTarget.Global);
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
            console.log(`[Auto Proxy] ${t('logNetworkChangeTriggered')}`);
            showAutoCloseMessage(t('msgNetworkChangeRechecking'), 10000);
            
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
    console.log(`[Auto Proxy] ${t('logNetworkMonitorOn')}`);
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
    console.log(`[Auto Proxy] ${t('logAutoCheckStoppedShort')}`);
}

/**
 * 插件激活
 */
export function activate(context: vscode.ExtensionContext) {
    // 初始化国际化
    initI18n(vscode.env.language);
    
    console.log(`[Auto Proxy] ${t('logActivated')}`);
    console.log(`[Auto Proxy] ${t('logExtensionReady')}`);

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
    console.log(`[Auto Proxy] ${t('logStatusBarCreated')}`);

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
            const proxyUrl = await prepareProxyUrlForUse();
            if (!proxyUrl) {
                return;
            }
            console.log(`[Auto Proxy] ${t('logManualEnableProxy')}: ${proxyUrl}`);
            await setProxy(proxyUrl);
            vscode.window
                .showInformationMessage(
                    `${t('msgProxyEnabled')}: ${proxyUrl}\n${t('msgProxyEnsureRunning')}`,
                    t('msgAction_DisableProxy'),
                    t('msgAction_OpenSettings'),
                    t('msgAction_Ok')
                )
                .then(async (action) => {
                    if (action === t('msgAction_DisableProxy')) {
                        await removeProxy();
                        vscode.window.showInformationMessage(t('msgProxyDisabled'));
                    } else if (action === t('msgAction_OpenSettings')) {
                        await vscode.commands.executeCommand('workbench.action.openSettings', 'autoProxy.proxyUrl');
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
            ).then(async (action) => {
                if (action === t('msgAction_EnableProxy')) {
                    const proxyUrl = await prepareProxyUrlForUse();
                    if (proxyUrl) {
                        await setProxy(proxyUrl);
                    }
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
    console.log(`[Auto Proxy] ${t('logCommandsRegistered')}`);

    // 监听配置变化
    const configChangeListener = vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('autoProxy')) {
            invalidateSystemProxyDetectCache();
            console.log(`[Auto Proxy] ${t('logSettingsChangedRestartAutoCheck')}`);
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
        console.log(`[Auto Proxy] ${t('logWillRunAutoCheckImmediate')}`);
        startAutoCheck(true);
    } else {
        console.log(`[Auto Proxy] ${t('logAutoCheckDisabledNoInitial')}`);
    }
    
    console.log(`[Auto Proxy] ${t('logExtensionActivateComplete')}`);
}

/**
 * 插件停用
 */
export function deactivate() {
    stopAutoCheck();
    stopNetworkMonitor();
    console.log(`[Auto Proxy] ${t('logDeactivated')}`);
}

