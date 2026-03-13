# 应用图标准备指南

## 📐 图标尺寸要求

### macOS (.icns)

需要以下尺寸的图标：
- 16x16 px
- 32x32 px
- 64x64 px
- 128x128 px
- 256x256 px
- 512x512 px
- 1024x1024 px

### Windows (.ico)

需要以下尺寸的图标：
- 16x16 px
- 24x24 px
- 32x32 px
- 48x48 px
- 64x64 px
- 128x128 px
- 256x256 px

### Linux (.png)

建议提供以下尺寸：
- 16x16.png
- 32x32.png
- 48x48.png
- 64x64.png
- 128x128.png
- 256x256.png
- 512x512.png

## 🎨 制作方法

### 方法一：在线工具（推荐）

1. **准备源图**
   - 创建一个 1024x1024 的 PNG 图片
   - 建议使用简洁的设计，避免过多细节
   - 背景建议透明或纯色

2. **转换为 .icns (macOS)**
   - 访问：https://iconverticons.com/online/
   - 上传 1024x1024 的 PNG 图片
   - 下载生成的 .icns 文件
   - 将文件放到 `build/icon.icns`

3. **转换为 .ico (Windows)**
   - 访问：https://iconifier.net/
   - 上传 1024x1024 的 PNG 图片
   - 下载生成的 .ico 文件
   - 将文件放到 `build/icon.ico`

4. **Linux 图标**
   - 使用图片编辑工具调整尺寸
   - 将不同尺寸的 PNG 文件放到 `build/icons/` 目录

### 方法二：使用设计软件

**使用 Figma/Sketch/Photoshop:**

1. 创建 1024x1024 的画布
2. 设计图标（建议使用简洁风格）
3. 导出为 PNG
4. 使用在线工具转换为各平台格式

## 🎯 设计建议

### 小说写作软件图标设计要点

1. **主题元素**
   - 书本、笔、墨水
   - 羽毛笔、钢笔
   - 文档、纸张
   - 灯泡（创意）

2. **配色建议**
   - 书香风格：棕色、米色、深蓝
   - 现代风格：蓝色、白色、灰色
   - AI风格：紫色、蓝色渐变

3. **风格选择**
   - 扁平化设计
   - 简约现代
   - 书香典雅

### 设计参考

- Scrivener: 书本 + 笔
- Ulysses: 羽毛笔
- iA Writer: 字母 "A"
- Notion: 方块 + 笔

## 📁 文件结构

```
build/
├── icon.icns          # macOS 图标
├── icon.ico           # Windows 图标
├── icons/             # Linux 图标
│   ├── 16x16.png
│   ├── 32x32.png
│   ├── 48x48.png
│   ├── 64x64.png
│   ├── 128x128.png
│   ├── 256x256.png
│   └── 512x512.png
└── entitlements.mac.plist
```

## ⚠️ 注意事项

1. **图标格式**
   - macOS: .icns 格式
   - Windows: .ico 格式
   - Linux: .png 格式

2. **图标内容**
   - 避免使用受版权保护的图片
   - 确保图标清晰可辨
   - 在不同背景下都要清晰可见

3. **测试**
   - 在实际应用中测试图标显示效果
   - 检查在 Finder/Dock/任务栏中的显示

## 🔧 临时方案

如果暂时没有图标，可以使用默认图标：

```bash
# 使用 Electron 默认图标进行打包
npm run build:mac
```

打包后再替换图标重新打包。

## 💡 快速生成示例图标

如果需要快速开始，可以使用文字生成简单图标：

1. 使用 Canva/Figma 创建文字图标
2. 输入 "NW" 或 "NovelWriter"
3. 设置合适的字体和颜色
4. 导出为 PNG
5. 转换为各平台格式