# NovelWriter 应用打包指南

## 📦 快速打包

### macOS 打包

```bash
# 1. 确保代码已编译
npm run build

# 2. 打包 macOS 应用（支持 Intel 和 Apple Silicon）
npm run build:mac
```

打包完成后，在 `dist` 目录下会生成：
- `NovelWriter-1.0.0-arm64.dmg` - Apple Silicon 版本
- `NovelWriter-1.0.0-x64.dmg` - Intel 版本
- `NovelWriter-1.0.0-arm64.zip` - Apple Silicon 压缩包
- `NovelWriter-1.0.0-x64.zip` - Intel 压缩包

## 🎨 应用图标设置

### macOS 图标 (.icns)

1. 准备一个 1024x1024 的 PNG 图片
2. 使用在线工具转换为 .icns 格式：
   - https://iconverticons.com/online/
   - https://cloudconvert.com/png-to-icns
3. 将生成的 `icon.icns` 放到 `build/` 目录

### Windows 图标 (.ico)

1. 准备一个 256x256 的 PNG 图片
2. 转换为 .ico 格式：
   - https://iconifier.net/
   - https://cloudconvert.com/png-to-ico
3. 将生成的 `icon.ico` 放到 `build/` 目录

### Linux 图标

在 `build/icons/` 目录下放置不同尺寸的 PNG 图标：
- 16x16.png
- 32x32.png
- 48x48.png
- 64x64.png
- 128x128.png
- 256x256.png
- 512x512.png

## 🔧 打包配置说明

### 支持的平台

- **macOS**: DMG 和 ZIP 格式（支持 Intel x64 和 Apple Silicon arm64）
- **Windows**: NSIS 安装程序和 ZIP 格式
- **Linux**: AppImage 和 DEB 格式

### 自定义配置

编辑 `package.json` 中的 `build` 字段：

```json
{
  "build": {
    "appId": "com.novelwriter.app",
    "productName": "NovelWriter",
    "mac": {
      "category": "public.app-category.productivity"
    }
  }
}
```

## 📋 打包前检查清单

- [ ] 更新版本号（package.json 中的 version）
- [ ] 准备应用图标（build/icon.icns、icon.ico）
- [ ] 测试应用功能是否正常
- [ ] 检查依赖是否完整
- [ ] 确保 AI API 配置说明文档完整

## 🚀 发布流程

### 1. 本地测试

```bash
# 编译并测试
npm run build
npm run preview

# 测试打包应用
npm run build:unpack
```

### 2. 正式打包

```bash
# macOS
npm run build:mac

# Windows（需要在 Windows 系统上）
npm run build:win

# Linux
npm run build:linux
```

### 3. 测试打包后的应用

- macOS: 打开 dist 目录下的 .dmg 文件安装测试
- Windows: 运行 .exe 安装程序测试
- Linux: 运行 .AppImage 或安装 .deb 测试

## ⚠️ 注意事项

### macOS 签名（可选）

如果需要分发给其他用户，建议进行代码签名：

1. 申请 Apple Developer 证书
2. 在 package.json 中配置证书信息
3. 或使用 `ad-hoc` 签名：

```bash
# 打包后手动签名
codesign --deep --force --verify --verbose --sign - dist/mac-arm64/NovelWriter.app
```

### Windows 签名（可选）

1. 获取代码签名证书
2. 配置 electron-builder 签名选项

### Native 依赖

项目使用了 native 模块（better-sqlite3、keytar），确保：

1. 在目标平台上编译
2. 或使用 electron-rebuild 重新编译：

```bash
npm run postinstall
```

## 📦 分发方式

### 直接分发

1. 将 `dist/` 目录下的安装包上传到云存储
2. 提供下载链接给用户

### GitHub Releases

1. 创建 GitHub Release
2. 上传打包文件
3. 编写更新日志

### 自动更新（可选）

项目已集成 electron-updater，可以配置自动更新：

1. 配置 publish 选项（package.json）
2. 部署更新服务器
3. 实现自动更新逻辑

## 🐛 常见问题

### 打包失败

1. 检查 Node.js 版本（建议 18+）
2. 清理并重新安装依赖：

```bash
rm -rf node_modules
npm install
```

### 应用无法打开（macOS）

```bash
# 允许运行未签名应用
xattr -cr dist/mac-arm64/NovelWriter.app
```

### Native 模块错误

```bash
# 重新编译 native 模块
npm run postinstall
```

## 📚 更多资源

- [Electron Builder 文档](https://www.electron.build/)
- [Electron 打包指南](https://www.electronjs.org/docs/latest/tutorial/application-distribution)
- [代码签名指南](https://www.electronjs.org/docs/latest/tutorial/code-signing)