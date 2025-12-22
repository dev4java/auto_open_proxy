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
    
    // 日志消息
    logActivated: string;
    logDeactivated: string;
    logCheckStarted: string;
    logInterval: string;
    logConfigCleared: string;
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
    
    // 日志消息
    logActivated: '========== 插件开始激活 ==========',
    logDeactivated: '插件已停用',
    logCheckStarted: '定时检测 AI 服务连接状态...',
    logInterval: '已启动自动检查，间隔',
    logConfigCleared: '已清空代理配置',
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
    
    // Log messages
    logActivated: '========== Extension Activated ==========',
    logDeactivated: 'Extension deactivated',
    logCheckStarted: 'Scheduled AI service check...',
    logInterval: 'Auto check started, interval',
    logConfigCleared: 'Proxy config cleared',
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

