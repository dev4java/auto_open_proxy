# Auto Proxy Switcher

Automatically detect AI service connectivity and intelligently configure HTTP proxy for VS Code/Cursor.

自动检测 AI 服务连接状态并智能配置代理的 VS Code/Cursor 扩展。

---

## 📖 Use Case | 使用场景

### English
When you need to access AI services (like Claude, OpenAI) through a network proxy, but your VPN doesn't support TUN mode (or it's inconvenient to enable global mode), you have to manually configure HTTP proxy in VS Code/Cursor settings. This extension provides **automatic switching** functionality that configures or removes proxy based on your network environment.

### 中文
当你需要通过网络代理访问 AI 服务（如 Claude、OpenAI），但 VPN 不支持 TUN 模式（或不方便开启全局模式）时，需要在 VS Code/Cursor 中手动配置 HTTP 代理。本扩展提供**自动切换**功能，根据网络环境自动配置或移除代理。

---

## ✨ Features | 主要功能

| English | 中文 |
|---------|------|
| ✅ **Auto-detect on startup**: Detect network environment when VS Code/Cursor starts | ✅ **启动时自动检测**：打开 VS Code/Cursor 时自动检测网络环境 |
| ✅ **Smart prompt mode**: Ask whether to enable proxy when AI services are unreachable | ✅ **智能询问模式**：无法访问 AI 服务时询问是否启用代理 |
| ✅ **One-click toggle**: Click status bar to enable/disable proxy | ✅ **一键切换**：状态栏点击即可启用/禁用代理 |
| ✅ **Periodic check**: Background periodic network check (configurable) | ✅ **定时检测**：后台定时检测网络变化（可配置） |
| ✅ **Network change detection**: Automatically re-check when network changes | ✅ **网络变化检测**：检测到网络切换时自动重新检测 |
| ✅ **Proxy memory**: Remember your last used proxy configuration | ✅ **代理记忆**：记住你上次使用的代理配置 |
| ✅ **Shell environment sync**: Auto-sync proxy config to `~/.zshrc` for terminal use | ✅ **终端环境同步**：自动同步代理配置到 `~/.zshrc`，终端也能使用代理 |
| ✅ **i18n support**: Auto-detect system language (English/Chinese) | ✅ **国际化支持**：自动识别系统语言（中文/英文） |

---

## 📦 Installation | 安装

### Method 1: From VS Code Marketplace | 方式 1：从市场安装

1. Open VS Code/Cursor / 打开 VS Code/Cursor
2. Go to Extensions (`Cmd+Shift+X` or `Ctrl+Shift+X`) / 进入扩展页面
3. Search for "Auto Proxy Switcher" / 搜索 "Auto Proxy Switcher"
4. Click Install / 点击安装

### Method 2: From VSIX file | 方式 2：从 VSIX 文件安装

Download the `.vsix` file from [GitHub Releases](https://github.com/dev4java/auto_open_proxy/releases), then:

从 [GitHub Releases](https://github.com/dev4java/auto_open_proxy/releases) 下载 `.vsix` 文件，然后：

```bash
code --install-extension auto-proxy-switcher-1.0.4.vsix
```

**Restart VS Code/Cursor after installation. | 安装后重启 VS Code/Cursor。**

---

## 🚀 Usage | 使用方法

### 1. Status Bar Operation | 状态栏操作

| Status | Action | 状态 | 操作 |
|--------|--------|------|------|
| 🌐 Direct | Click to enable proxy | 🌐 代理: 直连 | 点击启用代理 |
| 🌐 Proxy Enabled | Click to disable proxy | 🌐 代理: 已启用 | 点击禁用代理 |

### 2. Command Palette | 命令面板

Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux), type `Auto Proxy`:

按 `Cmd+Shift+P` (macOS) 或 `Ctrl+Shift+P` (Windows/Linux)，输入 `Auto Proxy`：

| Command | Description | 命令 | 说明 |
|---------|-------------|------|------|
| Auto Proxy: Check Connection | Manually trigger detection | 检查 AI 服务连接状态 | 手动触发检测 |
| Auto Proxy: Enable Proxy | Manually enable proxy | 启用代理 | 手动启用代理配置 |
| Auto Proxy: Disable Proxy | Manually disable proxy | 禁用代理 | 手动清空代理配置 |
| Auto Proxy: Toggle Auto Check | Toggle auto-detection | 切换自动检测 | 启动/停止自动检测 |

### 3. Interactive Prompts | 弹窗交互

| Scenario | Behavior | 场景 | 行为 |
|----------|----------|------|------|
| AI services unreachable | Prompt to enable proxy | 无法访问 AI 服务 | 弹窗询问是否启用代理 |
| AI services accessible | Notify network is OK | 可以访问 AI 服务 | 提示网络正常 |

---

## ⚙️ Configuration | 配置选项

Open VS Code/Cursor settings (`Cmd+,` or `Ctrl+,`), search for `autoProxy`:

打开 VS Code/Cursor 设置（`Cmd+,` 或 `Ctrl+,`），搜索 `autoProxy`：

| Setting | Default | Description | 说明 |
|---------|---------|-------------|------|
| `autoProxy.enabled` | `true` | Enable auto-detection | 是否启用自动检测 |
| `autoProxy.checkInterval` | `60` | Check interval (seconds) | 检测间隔（秒） |
| `autoProxy.proxyUrl` | `http://127.0.0.1:7890` | Default proxy address | 默认代理地址 |
| `autoProxy.testUrls` | AI service URLs | URLs to test connectivity | 测试连接的 URL 列表 |
| `autoProxy.timeout` | `5000` | Connection timeout (ms) | 连接超时时间（毫秒） |

### Customize Proxy Address | 修改代理地址

The extension will use your configured proxy address (default: `http://127.0.0.1:7890`). If your proxy runs on a different port, modify the configuration:

扩展会使用你配置的代理地址（默认：`http://127.0.0.1:7890`）。如果你的代理运行在不同的端口，请修改配置：

```json
{
  "autoProxy.proxyUrl": "http://127.0.0.1:YOUR_PORT"
}
```

**Common proxy software ports | 常见代理软件端口:**

| Software | Port | 软件 | 端口 |
|----------|------|------|------|
| Clash | 7890 | Clash | 7890 |
| V2Ray | 10808 | V2Ray | 10808 |
| Shadowsocks | 1080 | Shadowsocks | 1080 |

> **Note:** The extension remembers your last manually configured proxy address, so if you change it in VS Code/Cursor settings, it will be used next time.
>
> **注意:** 扩展会记住你上次手动配置的代理地址，因此如果你在 VS Code/Cursor 设置中修改了代理，下次会使用你修改的地址。

---

## 🖥️ Shell Environment Sync | 终端环境同步

### English

When you **enable proxy**, the extension automatically adds proxy environment variables to your `~/.zshrc`:

```bash
# ======== Auto Proxy Switcher 代理配置 ========
# 由 VS Code Auto Proxy Switcher 扩展自动管理
export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890
export all_proxy=socks5://127.0.0.1:7891
# ============================================
```

When you **disable proxy**, the extension automatically removes these lines from `~/.zshrc`.

**Benefits:**
- ✅ Terminal commands (`curl`, `git`, `npm`, etc.) automatically use the same proxy
- ✅ No need to manually manage shell proxy configuration
- ✅ Proxy settings stay in sync between VS Code and terminal
- ✅ New terminal sessions will automatically have the correct proxy settings (after running `source ~/.zshrc`)

### 中文

当你**启用代理**时，扩展会自动在 `~/.zshrc` 中添加代理环境变量：

```bash
# ======== Auto Proxy Switcher 代理配置 ========
# 由 VS Code Auto Proxy Switcher 扩展自动管理
export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890
export all_proxy=socks5://127.0.0.1:7891
# ============================================
```

当你**禁用代理**时，扩展会自动从 `~/.zshrc` 中移除这些配置。

**优势：**
- ✅ 终端命令（`curl`、`git`、`npm` 等）自动使用相同的代理
- ✅ 无需手动管理 shell 代理配置
- ✅ VS Code 和终端的代理设置保持同步
- ✅ 新打开的终端会话自动生效（执行 `source ~/.zshrc` 后）

> **Note / 注意:** To apply changes in existing terminal sessions, run: `source ~/.zshrc` / 要在现有终端会话中应用更改，请运行：`source ~/.zshrc`

---

## 🔧 How It Works | 工作原理

### English:
1. **On startup**: Check AI service connectivity (Claude, OpenAI, etc.)
2. **If unreachable**: Prompt to enable proxy with configured address
3. **If accessible**: Automatically remove proxy configuration
4. **Periodic check**: Background check every 60 seconds (configurable) and auto-adjust
5. **Network change**: Detect network interface changes and re-check immediately

### 中文:
1. **启动时**：检测 AI 服务（Claude、OpenAI 等）连接状态
2. **无法连接**：询问是否配置代理（使用配置的地址）
3. **能够连接**：自动移除代理配置
4. **定时检测**：每 60 秒（可配置）后台检测并自动调整
5. **网络变化**：检测到网络接口变化时立即重新检测

---

## 🐛 Troubleshooting | 故障排查

### Extension not loaded | 扩展未加载

**English:**
- Check extension directory: `~/.vscode/extensions/` or `~/.cursor/extensions/`
- Restart VS Code/Cursor
- Open Developer Tools (`Help` → `Toggle Developer Tools`) and check Console

**中文:**
- 检查扩展目录：`~/.vscode/extensions/` 或 `~/.cursor/extensions/`
- 重启 VS Code/Cursor
- 打开开发者工具（`Help` → `Toggle Developer Tools`）查看控制台

### Proxy configuration not working | 代理配置无效

**English:**
- Ensure proxy service is running (Clash/V2Ray/Shadowsocks)
- Test proxy: `curl -x http://127.0.0.1:7890 https://www.google.com`
- Restart VS Code/Cursor

**中文:**
- 确认代理服务正在运行（Clash/V2Ray/Shadowsocks）
- 测试代理：`curl -x http://127.0.0.1:7890 https://www.google.com`
- 重启 VS Code/Cursor

### Frequent pop-ups | 频繁弹窗

**English:**
- Increase check interval: Set `autoProxy.checkInterval` to `120` or higher
- Or click "No more tips" to stop auto-detection

**中文:**
- 增加检测间隔：将 `autoProxy.checkInterval` 设为 `120` 或更大
- 或点击"不再提示"停止自动检测

---

## 💻 Development | 开发调试

### English:
1. Open this project in VS Code/Cursor
2. Press `F5` to start debugging
3. Test extension in the new Extension Development Host window

### 中文:
1. 在 VS Code/Cursor 中打开本项目
2. 按 `F5` 启动调试
3. 在新窗口中测试扩展功能

---

## 🛠️ Tech Stack | 技术栈

- TypeScript
- VS Code Extension API
- node-fetch
- Webpack

---

## 📄 License | 许可证

MIT License

---

## 🔗 Links | 链接

- [GitHub Repository](https://github.com/dev4java/auto_open_proxy)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=yusw.auto-proxy-switcher)
- [Report Issues](https://github.com/dev4java/auto_open_proxy/issues)

---

## 📝 Changelog | 更新日志

### 1.0.4 (Latest)
- ✅ **Shell environment sync**: Auto-sync proxy config to `~/.zshrc` for terminal use
- ✅ When enabling proxy: Automatically add environment variables to `~/.zshrc`
- ✅ When disabling proxy: Automatically remove environment variables from `~/.zshrc`
- ✅ Terminal commands now automatically use the same proxy settings

### 1.0.3
- ✅ Add custom globe/proxy icon for better visual identity
- ✅ Update all references from "Cursor" to "VS Code/Cursor" for broader compatibility
- ✅ Remove install.sh script (users can install from Marketplace directly)
- ✅ Fix README to remove personal path exposure
- ✅ Improve installation documentation

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

---

## 🌟 Support | 支持

If you find this extension helpful, please give it a ⭐️ on [GitHub](https://github.com/dev4java/auto_open_proxy)!

如果这个扩展对你有帮助，请在 [GitHub](https://github.com/dev4java/auto_open_proxy) 上给它一个 ⭐️！
