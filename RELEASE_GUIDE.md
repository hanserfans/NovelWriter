# GitHub Release 发布指南

## 📋 发布前准备

### 1. 更新版本号

编辑 `package.json`，更新版本号：

```json
{
  "version": "1.0.0"
}
```

### 2. 准备 Release Notes

创建更新日志，记录本次版本的更新内容。

### 3. 打包应用

确保已经打包好所有平台的安装包。

## 🚀 创建 GitHub Release

### 方法一：手动创建（推荐新手）

#### 步骤 1: 创建 Git 标签

```bash
# 提交所有更改
git add .
git commit -m "Release v1.0.0"

# 创建标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送到 GitHub
git push origin main
git push origin v1.0.0
```

#### 步骤 2: 在 GitHub 上创建 Release

1. 访问您的 GitHub 仓库
2. 点击右侧 "Releases"
3. 点击 "Draft a new release"
4. 选择标签：`v1.0.0`
5. 填写 Release 信息：

**Release title:**
```
NovelWriter v1.0.0 - 首个正式版本
```

**Release notes:** （复制下面的模板）

```markdown
# 🎉 NovelWriter v1.0.0

首个正式版本发布！

## ✨ 新功能

### 核心功能
- 📚 项目管理：多项目管理、分卷分章管理
- ✍️ 富文本编辑器：专业的章节编辑器，支持实时字数统计
- 🎭 知识库：角色、场景、情节线、世界观设定管理
- 💾 数据安全：本地 SQLite 数据库，自动保存

### AI 功能
- 🤖 AI 审查：多维度审查文字质量（逻辑、角色、场景、情感等）
- 🎨 AI 格式整理：智能优化排版、段落、标点
- 📝 AI 续写：AI 辅助创作
- ✨ AI 润色：文字润色优化

### 导出功能
- 📄 TXT 导出（UTF-8 编码，完美支持中文）
- 📝 Word 导出（.docx 格式）
- 📊 PDF 导出（完美中文支持）

### 统计功能
- 📊 实时字数统计
- 📈 中英文分别统计
- ⏱️ 预计阅读时间
- 📝 段落、句子统计

## 📥 下载安装

### macOS

- **Intel Mac**: 下载 `NovelWriter-1.0.0-x64.dmg`
- **Apple Silicon (M1/M2/M3)**: 下载 `NovelWriter-1.0.0-arm64.dmg`
- 双击 DMG 文件安装

### Windows

- 下载 `NovelWriter-1.0.0-x64.exe`
- 双击运行安装程序

### Linux

- 下载 `NovelWriter-1.0.0-x64.AppImage`
- 添加执行权限：`chmod +x NovelWriter-1.0.0-x64.AppImage`
- 双击运行

## 📚 使用文档

- [用户指南](./USER_GUIDE.md)
- [打包说明](./PACKAGING.md)

## 🐛 已知问题

- macOS 首次打开需要右键 → "打开" 或执行 `xattr -cr /Applications/NovelWriter.app`
- Windows 版本需要在本仓库的 Actions 中构建

## 🔮 下一步计划

- [ ] 自动更新功能
- [ ] 更多 AI 功能
- [ ] 云同步支持
- [ ] 协作写作功能

## 💬 反馈

如有问题或建议，请提交 [Issue](../../issues)

---

**完整更新日志**: 查看 [CHANGELOG.md](./CHANGELOG.md)
```

#### 步骤 3: 上传文件

点击 "Attach binaries"，上传以下文件：

**macOS:**
- `dist/NovelWriter-1.0.0-x64.dmg`
- `dist/NovelWriter-1.0.0-arm64.dmg`
- `dist/NovelWriter-1.0.0-x64.zip` (可选)
- `dist/NovelWriter-1.0.0-arm64.zip` (可选)

**Windows:**（如果有）
- `dist/NovelWriter-1.0.0-x64.exe`

**Linux:**（如果有）
- `dist/NovelWriter-1.0.0-x64.AppImage`

#### 步骤 4: 发布

点击 "Publish release" 完成发布！

---

### 方法二：使用 GitHub CLI

```bash
# 安装 GitHub CLI
brew install gh

# 创建 Release
gh release create v1.0.0 \
  --title "NovelWriter v1.0.0" \
  --notes-file RELEASE_NOTES.md \
  dist/NovelWriter-1.0.0-*.dmg \
  dist/NovelWriter-1.0.0-*.zip
```

---

### 方法三：使用 GitHub Actions 自动化（推荐）

创建 `.github/workflows/release.yml`：

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Build macOS
        if: matrix.os == 'macos-latest'
        run: npm run build:mac
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Build Windows
        if: matrix.os == 'windows-latest'
        run: npm run build:win
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Build Linux
        if: matrix.os == 'ubuntu-latest'
        run: npm run build:linux
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}
          path: dist/*

      - name: Release
        uses: softprops/action-gh-release@v1
        with:
          files: dist/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

这样每次推送 tag 就会自动构建并发布！

## 📝 Release Notes 最佳实践

### 版本号规则

- **主版本号 (Major)**: 重大更新，不兼容的 API 修改
- **次版本号 (Minor)**: 新功能，向下兼容
- **修订号 (Patch)**: Bug 修复

示例：
- `v1.0.0` - 首个正式版本
- `v1.1.0` - 添加新功能
- `v1.0.1` - 修复 Bug

### Release Notes 结构

1. **亮点功能** - 本次更新最重要的功能
2. **新功能** - 列出所有新增功能
3. **改进** - 优化和改进
4. **修复** - Bug 修复
5. **已知问题** - 当前版本的问题
6. **下载链接** - 各平台下载地址

## 🎯 发布检查清单

发布前确认：

- [ ] 更新版本号
- [ ] 测试应用功能
- [ ] 打包所有平台版本
- [ ] 编写 Release Notes
- [ ] 创建 Git 标签
- [ ] 上传安装包
- [ ] 发布 Release
- [ ] 在社交媒体宣传

## 💡 提示

1. **测试先行**: 发布前充分测试应用
2. **备份重要**: 保留每个版本的源代码和安装包
3. **文档完善**: 确保用户文档更新
4. **收集反馈**: 关注用户反馈，及时修复问题