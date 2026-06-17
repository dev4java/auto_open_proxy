/**
 * 国际化支持
 */

interface Messages {
    // 状态栏
    statusProxyEnabled: string;
    statusProxyDisabled: string;
    statusTooltipEnable: string;
    statusTooltipDisable: string;
    
    // 检测结果
    networkCheckStart: string;
    networkAccessible: string;
    networkNotAccessible: string;
    
    // 弹窗消息 - 可以直接访问
    msgNetworkOk: string;
    msgNetworkOkWithProxy: string;
    msgNetworkOkAction1: string;
    msgNetworkOkAction2: string;
    msgNetworkOkAction3: string;
    
    // 弹窗消息 - 无法访问
    msgNetworkFail: string;
    msgProxyNotRunning: string;
    msgAction_EnableProxy: string;
    msgAction_DontEnable: string;
    msgAction_NoMoreTips: string;
    msgAction_DisableProxy: string;
    msgAction_KeepProxy: string;
    msgAction_StopCheck: string;
    msgAction_Ok: string;
    msgAction_OpenSettings: string;
    
    // 代理操作消息
    msgProxyEnabled: string;
    msgProxyEnsureRunning: string;
    msgProxyDisabled: string;
    msgProxyCleared: string;

    // 自动检测消息
    msgAutoCheckStarted: string;
    msgAutoCheckStopped: string;
    msgAutoCheckPaused: string;
    msgAutoCheckResumed: string;
    msgAutoCheckBanner: string;
    msgAutoCheckDirectRemovedProxy: string;
    msgNetworkChangeRechecking: string;
    msgKeepProxyWhileUnreachable: string;

    // 日志消息
    logActivated: string;
    logDeactivated: string;
    logCheckStarted: string;
    logInterval: string;
    logConfigCleared: string;
    logProxyDetected: string;
    logProxyWritten: string;
    logPersistedProxyAddress: string;
    logHttpProxyClearedShort: string;
    logProxyRemovedBecauseDirect: string;
    logNetworkChangeTriggered: string;
    logNetworkMonitorOn: string;
    logAutoCheckStoppedShort: string;
    logStatusBarCreated: string;
    logCommandsRegistered: string;
    logSettingsChangedRestartAutoCheck: string;
    logWillRunAutoCheckImmediate: string;
    logAutoCheckDisabledNoInitial: string;
    logExtensionActivateComplete: string;
    logExtensionReady: string;
    logManualEnableProxy: string;
    
    // 配置提示
    msgProxyUrlNotConfigured: string;
    msgNetworkFailConfirmHint: string;
    msgHttpProxyMayRemainFromWorkspace: string;

    // 代理确认 / 输入（系统检测结果需用户确认端口）
    proxyConfirmDetectedTitle: string;
    proxyConfirmDetectedPlaceholder: string;
    proxyPickUseDetected: string;
    proxyPickChangePort: string;
    proxyPickChangePortDesc: string;
    proxyPickEnterFullUrl: string;
    proxyPickEnterFullDesc: string;
    proxyInputPortTitle: string;
    proxyInputPortPrompt: string;
    proxyInputPortInvalid: string;
    proxyInputFullTitle: string;
    proxyInputFullPrompt: string;
    proxyInputFullInvalid: string;
    proxyMissingTitle: string;
    proxyMissingPlaceholder: string;
    proxyMissingEnterPort: string;
    proxyMissingEnterPortDesc: string;
    proxyMissingEnterFull: string;
    proxyMissingEnterFullDesc: string;
    proxyCancel: string;
}

const zh_CN: Messages = {
    // 状态栏
    statusProxyEnabled: '代理: 已启用',
    statusProxyDisabled: '代理: 直连',
    statusTooltipEnable: '点击启用代理',
    statusTooltipDisable: '点击禁用代理',
    
    // 检测结果
    networkCheckStart: '开始检测 AI 服务连接状态...',
    networkAccessible: '✅ AI 服务可访问，无需代理',
    networkNotAccessible: '❌ AI 服务无法访问',
    
    // 弹窗消息 - 可以直接访问
    msgNetworkOk: '✅ 当前网络环境能正常访问 AI 服务',
    msgNetworkOkWithProxy: '✅ 当前网络环境能正常访问 AI 服务，无需代理\n当前已配置代理，是否禁用？',
    msgNetworkOkAction1: '禁用代理',
    msgNetworkOkAction2: '保持代理',
    msgNetworkOkAction3: '不再提示',
    
    // 弹窗消息 - 无法访问
    msgNetworkFail: '⚠️ 无法连接 AI 服务，是否启用代理？',
    msgProxyNotRunning: '💡 请确保代理服务正在运行',
    msgAction_EnableProxy: '启用代理',
    msgAction_DontEnable: '不启用',
    msgAction_NoMoreTips: '不再提示',
    msgAction_DisableProxy: '禁用代理',
    msgAction_KeepProxy: '保持代理',
    msgAction_StopCheck: '停止检测',
    msgAction_Ok: '确定',
    msgAction_OpenSettings: '打开设置',
    
    // 代理操作消息
    msgProxyEnabled: '✅ 已启用代理',
    msgProxyEnsureRunning: '请确保代理服务正在运行',
    msgProxyDisabled: '✅ 已禁用代理',
    msgProxyCleared: '✅ 已禁用代理，Cursor 现在可以正常使用了',

    // 自动检测消息
    msgAutoCheckStarted: '▶️ 已启动自动代理检测',
    msgAutoCheckStopped: '⏹️ 已停止自动代理检测',
    msgAutoCheckPaused: '⏸️ 已暂停自动检测（点击状态栏可重新启动）',
    msgAutoCheckResumed: '✅ 已启用自动代理检测',
    msgAutoCheckBanner: '⚠️ 无法连接 AI 服务，建议启用代理',
    msgAutoCheckDirectRemovedProxy: '✅ AI 服务可直接访问，已自动移除代理配置',
    msgNetworkChangeRechecking: '🔄 检测到网络变化，正在检测 AI 服务连接状态…',
    msgKeepProxyWhileUnreachable: 'ℹ️ AI 服务不可访问，将保留当前代理：',

    // 日志消息
    logActivated: '========== 插件开始激活 ==========',
    logDeactivated: '插件已停用',
    logCheckStarted: '定时检测 AI 服务连接状态...',
    logInterval: '已启动自动检查，间隔',
    logConfigCleared: '已清空代理配置',
    logProxyDetected: '已从系统/环境检测到代理',
    logProxyWritten: '代理已设置并保存',
    logPersistedProxyAddress: '已保存代理地址',
    logHttpProxyClearedShort: '代理配置已清空',
    logProxyRemovedBecauseDirect: '已自动移除代理配置',
    logNetworkChangeTriggered: '检测到网络变化，触发检测',
    logNetworkMonitorOn: '网络变化监听已启动',
    logAutoCheckStoppedShort: '已停止自动检查',
    logStatusBarCreated: '状态栏已创建',
    logCommandsRegistered: '所有命令已注册',
    logSettingsChangedRestartAutoCheck: '配置已更改，重启自动检查',
    logWillRunAutoCheckImmediate: '准备启动自动检查并立即执行检测',
    logAutoCheckDisabledNoInitial: '自动检测已禁用，不执行初始检测',
    logExtensionActivateComplete: '========== 插件激活完成 ==========',
    logExtensionReady: '插件已激活',
    logManualEnableProxy: '手动启用代理',

    msgProxyUrlNotConfigured:
        '未能得到可用的代理地址：请在设置中填写 Auto Proxy › Proxy Url，或在代理软件中开启「系统代理」并确认 autoProxy.autoDetectSystemProxy 已启用。',
    msgNetworkFailConfirmHint:
        '若启用代理，将请你确认或填写本地端口（例如 Clash Verge 混合端口可能是 9810，与系统代理显示不一致时请以客户端为准）。',
    msgHttpProxyMayRemainFromWorkspace:
        '已清除用户设置中的 http.proxy。若仍显示在使用代理，请检查工作区 .vscode/settings.json 或远程设置里是否还有 http.proxy（Cursor 中该项通常只能写在用户设置，扩展无法替你改工作区里的该项）。',

    proxyConfirmDetectedTitle: '确认本地代理地址',
    proxyConfirmDetectedPlaceholder: '系统/环境检测到的地址不一定等于实际 HTTP 混合端口，请核实',
    proxyPickUseDetected: '使用检测到的地址',
    proxyPickChangePort: '更改端口…',
    proxyPickChangePortDesc: '保留主机与协议，只改端口号',
    proxyPickEnterFullUrl: '手动输入完整 URL…',
    proxyPickEnterFullDesc: '例如 http://127.0.0.1:9810 或 socks5://127.0.0.1:7891',
    proxyInputPortTitle: '代理端口',
    proxyInputPortPrompt: '请输入本地代理端口（1–65535）',
    proxyInputPortInvalid: '请输入有效端口号（1–65535）',
    proxyInputFullTitle: '代理 URL',
    proxyInputFullPrompt: '请输入完整代理地址（须含协议与端口）',
    proxyInputFullInvalid: '请输入有效的绝对 URL（含协议与端口）',
    proxyMissingTitle: '未检测到可用代理',
    proxyMissingPlaceholder: '可选择输入端口、完整 URL，或打开设置',
    proxyMissingEnterPort: '仅输入端口',
    proxyMissingEnterPortDesc: '使用 http://127.0.0.1:你的端口',
    proxyMissingEnterFull: '输入完整代理 URL',
    proxyMissingEnterFullDesc: '支持 http(s):// 或 socks5://',
    proxyCancel: '$(close) 取消',
};

const en_US: Messages = {
    // Status bar
    statusProxyEnabled: 'Proxy: Enabled',
    statusProxyDisabled: 'Proxy: Direct',
    statusTooltipEnable: 'Click to enable proxy',
    statusTooltipDisable: 'Click to disable proxy',
    
    // Check results
    networkCheckStart: 'Checking AI service connection...',
    networkAccessible: '✅ AI service accessible, no proxy needed',
    networkNotAccessible: '❌ AI service not accessible',
    
    // Messages - Accessible
    msgNetworkOk: '✅ AI service is accessible',
    msgNetworkOkWithProxy: '✅ AI service is accessible without proxy\nProxy is currently configured, disable it?',
    msgNetworkOkAction1: 'Disable Proxy',
    msgNetworkOkAction2: 'Keep Proxy',
    msgNetworkOkAction3: 'No More Tips',
    
    // Messages - Not accessible
    msgNetworkFail: '⚠️ Cannot connect to AI service, enable proxy?',
    msgProxyNotRunning: '💡 Please ensure proxy service is running',
    msgAction_EnableProxy: 'Enable Proxy',
    msgAction_DontEnable: "Don't Enable",
    msgAction_NoMoreTips: 'No More Tips',
    msgAction_DisableProxy: 'Disable Proxy',
    msgAction_KeepProxy: 'Keep Proxy',
    msgAction_StopCheck: 'Stop Check',
    msgAction_Ok: 'OK',
    msgAction_OpenSettings: 'Open Settings',
    
    // Proxy actions
    msgProxyEnabled: '✅ Proxy enabled',
    msgProxyEnsureRunning: 'Please ensure proxy service is running',
    msgProxyDisabled: '✅ Proxy disabled',
    msgProxyCleared: '✅ Proxy disabled, Cursor is now working normally',

    // Auto check messages
    msgAutoCheckStarted: '▶️ Auto proxy check started',
    msgAutoCheckStopped: '⏹️ Auto proxy check stopped',
    msgAutoCheckPaused: '⏸️ Auto check paused (Click status bar to restart)',
    msgAutoCheckResumed: '✅ Auto proxy check enabled',
    msgAutoCheckBanner: '⚠️ Cannot reach AI services; proxy may be needed',
    msgAutoCheckDirectRemovedProxy: '✅ AI services reachable directly; proxy configuration removed',
    msgNetworkChangeRechecking: '🔄 Network changed; rechecking AI service connectivity…',
    msgKeepProxyWhileUnreachable: 'ℹ️ AI services unreachable; keeping current proxy:',

    // Log messages
    logActivated: '========== Extension Activated ==========',
    logDeactivated: 'Extension deactivated',
    logCheckStarted: 'Scheduled AI service check...',
    logInterval: 'Auto check started, interval',
    logConfigCleared: 'Proxy config cleared',
    logProxyDetected: 'Detected proxy from system/environment',
    logProxyWritten: 'Proxy saved to settings',
    logPersistedProxyAddress: 'Persisted proxy address',
    logHttpProxyClearedShort: 'HTTP proxy cleared',
    logProxyRemovedBecauseDirect: 'Removed proxy (direct access)',
    logNetworkChangeTriggered: 'Network change detected; triggering check',
    logNetworkMonitorOn: 'Network interface monitor started',
    logAutoCheckStoppedShort: 'Auto check stopped',
    logStatusBarCreated: 'Status bar created',
    logCommandsRegistered: 'Commands registered',
    logSettingsChangedRestartAutoCheck: 'Settings changed; restarting auto check',
    logWillRunAutoCheckImmediate: 'Starting auto check with immediate run',
    logAutoCheckDisabledNoInitial: 'Auto check disabled; skipping initial run',
    logExtensionActivateComplete: '========== Extension activation complete ==========',
    logExtensionReady: 'Extension active',
    logManualEnableProxy: 'Enable proxy (manual)',

    msgProxyUrlNotConfigured:
        'No usable proxy URL: set Auto Proxy › Proxy Url, or enable system proxy in your client and keep autoProxy.autoDetectSystemProxy on.',
    msgNetworkFailConfirmHint:
        'If you enable proxy, you will confirm or enter the local port (e.g. Clash Verge mixed port may be 9810 and differ from what system proxy shows).',
    msgHttpProxyMayRemainFromWorkspace:
        'Cleared http.proxy in User settings. If a proxy still appears active, check workspace .vscode/settings.json or remote settings for http.proxy (in Cursor this key is often user-scope only; the extension cannot edit it in workspace settings).',

    proxyConfirmDetectedTitle: 'Confirm local proxy',
    proxyConfirmDetectedPlaceholder:
        'Detected address may not match your real HTTP/mixed port — verify against your client',
    proxyPickUseDetected: 'Use detected address',
    proxyPickChangePort: 'Change port…',
    proxyPickChangePortDesc: 'Keep host/scheme, edit port only',
    proxyPickEnterFullUrl: 'Enter full URL…',
    proxyPickEnterFullDesc: 'e.g. http://127.0.0.1:9810 or socks5://127.0.0.1:7891',
    proxyInputPortTitle: 'Proxy port',
    proxyInputPortPrompt: 'Enter local proxy port (1–65535)',
    proxyInputPortInvalid: 'Enter a valid port (1–65535)',
    proxyInputFullTitle: 'Proxy URL',
    proxyInputFullPrompt: 'Enter full proxy URL (scheme + host + port)',
    proxyInputFullInvalid: 'Enter a valid absolute URL with scheme and port',
    proxyMissingTitle: 'No proxy detected',
    proxyMissingPlaceholder: 'Enter a port, full URL, or open settings',
    proxyMissingEnterPort: 'Enter port only',
    proxyMissingEnterPortDesc: 'Uses http://127.0.0.1:<port>',
    proxyMissingEnterFull: 'Enter full proxy URL',
    proxyMissingEnterFullDesc: 'Supports http(s):// or socks5://',
    proxyCancel: '$(close) Cancel',
};

let currentLanguage: string = 'en';
let messages: Messages = en_US;

export function initI18n(language: string): void {
    currentLanguage = language;
    
    if (language.startsWith('zh')) {
        messages = zh_CN;
    } else {
        messages = en_US;
    }
    
    console.log(`[Auto Proxy] Language set to: ${language}`);
}

export function t(key: keyof Messages): string {
    return messages[key] || key;
}

export function getCurrentLanguage(): string {
    return currentLanguage;
}

