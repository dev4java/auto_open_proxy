# Auto Proxy Switcher

Automatically detect AI service connectivity and intelligently configure HTTP proxy for Cursor.

自动检测 AI 服务连接状态并智能配置代理的 Cursor 扩展。

---

## Use Case | 使用场景

**English:**

When you need to access AI services (like Claude, OpenAI) through a network proxy, but your VPN doesn't support TUN mode (or it's inconvenient to enable global mode), you have to manually configure HTTP proxy in Cursor settings.

This extension provides **automatic switching** functionality that configures or removes proxy based on your network environment.

**中文:**

当你需要通过网络代理访问 AI 服务（如 Claude、OpenAI），但 VPN 不支持 TUN 模式（或不方便开启全局模式）时，需要在 Cursor 中手动配置 HTTP 代理。

本扩展提供**自动切换**功能，根据网络环境自动配置或移除代理。

---

## Features | 主要功能

- ✅ **Auto-detect on startup** | **启动时自动检测**：Detect network environment when Cursor starts
- ✅ **Smart prompt mode** | **智能询问模式**：Ask whether to enable proxy when AI services are unreachable
- ✅ **One-click toggle** | **一键切换**：Click status bar to enable/disable proxy
- ✅ **Periodic check** | **定时检测**：Background periodic network check (configurable)
- ✅ **Network change detection** | **网络变化检测**：Automatically re-check when network changes
- ✅ **Proxy memory** | **代理记忆**：Remember your last used proxy configuration
- ✅ **i18n support** | **国际化支持**：Auto-detect system language (English/Chinese)

---

## Installation | 安装

### From VS Code Marketplace | 从市场安装

1. Open Cursor
2. Go to Extensions (`Cmd+Shift+X` or `Ctrl+Shift+X`)
3. Search for "Auto Proxy Switcher"
4. Click Install

### From VSIX file | 从 VSIX 文件安装

```bash
code --install-extension auto-proxy-switcher-1.0.1.vsix
```

Restart Cursor after installation | 安装后重启 Cursor。

---

## Usage | 使用方法

### 1. Status Bar | 状态栏操作

- `🌐 Direct` / `🌐 代理: 直连` → Click to enable proxy | 点击启用代理
- `🌐 Proxy Enabled` / `🌐 代理: 已启用` → Click to disable proxy | 点击禁用代理

### 2. Command Palette | 命令面板

Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux), type `Auto Proxy`:

- **Auto Proxy: Check Connection** | **检查 AI 服务连接状态** - Manually trigger detection
- **Auto Proxy: Enable Proxy** | **启用代理** - Manually enable proxy
- **Auto Proxy: Disable Proxy** | **禁用代理** - Manually disable proxy
- **Auto Proxy: Toggle Auto Check** | **切换自动检测** - Toggle auto-detection on/off

### 3. Interactive Prompts | 弹窗交互

- **When AI services are unreachable** | **无法访问 AI 服务时**: Prompt to enable proxy
- **When AI services are accessible** | **可以访问 AI 服务时**: Notify network is OK

---

## Configuration | 配置选项

Open Cursor settings (`Cmd+,` or `Ctrl+,`), search for `autoProxy`:

| Setting | Default | Description |
|---------|---------|-------------|
| `autoProxy.enabled` | `true` | Enable auto-detection |
| `autoProxy.checkInterval` | `60` | Check interval (seconds) |
| `autoProxy.proxyUrl` | `http://127.0.0.1:7890` | Default proxy address |
| `autoProxy.testUrls` | AI service URLs | URLs to test connectivity |
| `autoProxy.timeout` | `5000` | Connection timeout (ms) |

### Customize Proxy Address | 修改代理地址

The extension will use your configured proxy address (default: `http://127.0.0.1:7890`). If your proxy runs on a different port, modify the configuration:

扩展会使用你配置的代理地址（默认：`http://127.0.0.1:7890`）。如果你的代理运行在不同的端口，请修改配置：

```json
{
  "autoProxy.proxyUrl": "http://127.0.0.1:YOUR_PORT"
}
```

**Common proxy software ports | 常见代理软件端口:**
- **Clash**: 7890
- **V2Ray**: 10808
- **Shadowsocks**: 1080

**Note:** The extension remembers your last manually configured proxy address, so if you change it in Cursor settings, it will be used next time.

**注意:** 扩展会记住你上次手动配置的代理地址，因此如果你在 Cursor 设置中修改了代理，下次会使用你修改的地址。

---

## How It Works | 工作原理

**English:**
1. **On startup**: Check AI service connectivity (Claude, OpenAI, etc.)
2. **If unreachable**: Prompt to enable proxy with configured address
3. **If accessible**: Automatically remove proxy configuration
4. **Periodic check**: Background check every 60 seconds (configurable) and auto-adjust
5. **Network change**: Detect network interface changes and re-check immediately

**中文:**
1. **启动时**：检测 AI 服务（Claude、OpenAI 等）连接状态
2. **无法连接**：询问是否配置代理（使用配置的地址）
3. **能够连接**：自动移除代理配置
4. **定时检测**：每 60 秒（可配置）后台检测并自动调整
5. **网络变化**：检测到网络接口变化时立即重新检测

---

## Troubleshooting | 故障排查

### Extension not loaded | 扩展未加载

- Check extension directory: `~/.cursor/extensions/`
- Restart Cursor
- Open Developer Tools (`Help` → `Toggle Developer Tools`) and check Console

### Proxy configuration not working | 代理配置无效

- Ensure proxy service is running (Clash/V2Ray/Shadowsocks)
- Test proxy: `curl -x http://127.0.0.1:7890 https://www.google.com`
- Restart Cursor

### Frequent pop-ups | 频繁弹窗

- Increase check interval: Set `autoProxy.checkInterval` to `120` or higher
- Or click "No more tips" to stop auto-detection

---

## Development | 开发调试

1. Open this project in Cursor
2. Press `F5` to start debugging
3. Test extension in the new Extension Development Host window

---

## Tech Stack | 技术栈

- TypeScript
- VS Code Extension API
- node-fetch
- Webpack

---

## License | 许可证

MIT License

---

## Links | 链接

- [GitHub Repository](https://github.com/dev4java/auto_open_proxy)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=yusw.auto-proxy-switcher)
- [Report Issues](https://github.com/dev4java/auto_open_proxy/issues)

---

## Changelog | 更新日志

### 1.0.2
- ✅ Update README with bilingual content (English first, Chinese parallel)
- ✅ Fix async handling in removeProxy() callbacks to ensure configuration is cleared
- ✅ Enhance user feedback after disabling proxy
- ✅ Improve proxy address description to mention user configuration

### 1.0.1
- ✅ Remember last used proxy address
- ✅ Add network change detection
- ✅ Add i18n support (English/Chinese)

### 1.0.0
- 🎉 Initial release
