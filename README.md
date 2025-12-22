# Auto Proxy Switcher

Cursor 扩展，用于自动检测 AI 服务连接状态并智能配置代理。

## 使用场景

当你需要通过网络代理访问 AI 服务（如 Claude、OpenAI），但 VPN 不支持 TUN 模式（或不方便开启全局模式）时，需要在 Cursor 中手动配置 HTTP 代理 `http://127.0.0.1:7890`。

本扩展提供**自动切换**功能，根据网络环境自动配置或移除代理。

## 主要功能

- ✅ **启动时自动检测**：打开 Cursor 时自动检测网络环境
- ✅ **智能询问模式**：无法访问 AI 服务时询问是否启用代理
- ✅ **一键切换**：状态栏点击即可启用/禁用代理
- ✅ **定时检测**：后台定时检测网络变化（可配置）
- ✅ **国际化支持**：自动识别系统语言（中文/英文）

## 快速安装

```bash
cd /Users/yusw/Documents/workspace_cursor/auto_open_proxy
./install.sh
```

重启 Cursor 即可。

## 使用方法

### 1. 状态栏操作
- `🌐 代理: 直连` → 点击启用代理
- `🌐 代理: 已启用` → 点击禁用代理

### 2. 命令面板
按 `Cmd+Shift+P`，输入 `Auto Proxy`：
- **检查 AI 服务连接状态** - 手动触发检测
- **启用代理** - 手动启用代理配置
- **禁用代理** - 手动清空代理配置
- **启动/停止自动检测** - 控制自动检测功能

### 3. 弹窗交互
- **无法访问 AI 服务时**：弹窗询问是否启用代理
- **可以访问 AI 服务时**：提示网络正常

## 配置选项

打开 Cursor 设置（`Cmd+,`），搜索 `autoProxy`：

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `autoProxy.enabled` | `true` | 是否启用自动检测 |
| `autoProxy.checkInterval` | `60` | 检测间隔（秒） |
| `autoProxy.proxyUrl` | `http://127.0.0.1:7890` | 代理地址 |
| `autoProxy.testUrls` | AI 服务 URLs | 测试连接的 URL 列表 |
| `autoProxy.timeout` | `5000` | 连接超时（毫秒） |

### 修改代理端口

如果你的代理不在 7890 端口，修改配置：

```json
{
  "autoProxy.proxyUrl": "http://127.0.0.1:你的端口"
}
```

常见代理软件端口：
- **Clash**: 7890
- **V2Ray**: 10808
- **Shadowsocks**: 1080

## 开发调试

1. 在 Cursor 中打开本项目目录
2. 按 `F5` 启动调试
3. 在新窗口中测试扩展功能

## 工作原理

1. **启动时**：检测 AI 服务（Claude、OpenAI 等）连接状态
2. **无法连接**：询问是否配置代理 `http://127.0.0.1:7890`
3. **能够连接**：自动移除代理配置
4. **定时检测**：每 60 秒（可配置）后台检测并自动调整

## 故障排查

### 扩展未加载
- 检查扩展目录：`~/.cursor/extensions/auto-proxy-switcher`
- 重启 Cursor
- 查看开发者工具 Console（`Help` → `Toggle Developer Tools`）

### 代理配置无效
- 确认代理服务正在运行（Clash/V2Ray）
- 测试代理：`curl -x http://127.0.0.1:7890 https://www.google.com`
- 重启 Cursor

### 频繁弹窗
- 增加检测间隔：`autoProxy.checkInterval` 设为 `120` 或更大
- 或点击"不再提示"停止自动检测

## 许可证

MIT License

## 技术栈

- TypeScript
- VS Code Extension API
- node-fetch
- Webpack
