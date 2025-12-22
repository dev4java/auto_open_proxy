#!/bin/bash

# Auto Proxy Switcher - 安装脚本

echo "🚀 开始安装 Auto Proxy Switcher 扩展..."
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 检查是否已构建
if [ ! -f "$SCRIPT_DIR/dist/extension.js" ]; then
    echo "❌ 未找到构建文件，正在构建..."
    cd "$SCRIPT_DIR"
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ 构建失败，请检查错误信息"
        exit 1
    fi
    echo "✅ 构建成功"
    echo ""
fi

# 尝试多个可能的扩展目录
CURSOR_EXTENSIONS_DIR="$HOME/.cursor/extensions"
VSCODE_EXTENSIONS_DIR="$HOME/.vscode/extensions"
TARGET_DIR=""

if [ -d "$CURSOR_EXTENSIONS_DIR" ]; then
    TARGET_DIR="$CURSOR_EXTENSIONS_DIR/auto-proxy-switcher"
    echo "📁 找到 Cursor 扩展目录: $CURSOR_EXTENSIONS_DIR"
elif [ -d "$VSCODE_EXTENSIONS_DIR" ]; then
    TARGET_DIR="$VSCODE_EXTENSIONS_DIR/auto-proxy-switcher"
    echo "📁 找到 VS Code 扩展目录: $VSCODE_EXTENSIONS_DIR"
else
    echo "⚠️  未找到扩展目录，将创建 Cursor 扩展目录"
    mkdir -p "$CURSOR_EXTENSIONS_DIR"
    TARGET_DIR="$CURSOR_EXTENSIONS_DIR/auto-proxy-switcher"
fi

echo "📋 目标目录: $TARGET_DIR"
echo ""

# 如果目标目录已存在，询问是否覆盖
if [ -d "$TARGET_DIR" ]; then
    echo "⚠️  扩展已存在，是否覆盖？(y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "❌ 安装已取消"
        exit 0
    fi
    echo "🗑️  删除旧版本..."
    rm -rf "$TARGET_DIR"
fi

# 复制文件到扩展目录
echo "📦 复制文件到扩展目录..."
mkdir -p "$TARGET_DIR"
cp -r "$SCRIPT_DIR/dist" "$TARGET_DIR/"
cp "$SCRIPT_DIR/package.json" "$TARGET_DIR/"
cp "$SCRIPT_DIR/README.md" "$TARGET_DIR/"
cp -r "$SCRIPT_DIR/node_modules" "$TARGET_DIR/"

if [ $? -eq 0 ]; then
    echo "✅ 文件复制成功"
else
    echo "❌ 文件复制失败"
    exit 1
fi

echo ""
echo "🎉 安装完成！"
echo ""
echo "下一步："
echo "1. 完全退出 Cursor"
echo "2. 重新启动 Cursor"
echo "3. 查看右下角状态栏，应该会显示代理状态"
echo "4. 按 Cmd+Shift+P，输入 'proxy' 查看可用命令"
echo ""
echo "如需配置，请打开 Cursor 设置 (Cmd+,) 搜索 'autoProxy'"
echo ""
echo "📖 详细使用说明请查看: README.md"
echo "❓ 安装问题请查看: INSTALL.md"

