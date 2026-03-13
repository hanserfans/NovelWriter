# Windows 版本打包指南

## ⚠️ 重要说明

由于您的项目使用了 native 模块（better-sqlite3、keytar），**Windows 版本必须在 Windows 系统上打包**，或者使用 GitHub Actions 进行跨平台构建。

## 🖥️ 方法一：在 Windows 系统上打包（推荐）

### 准备工作

1. **准备 Windows 电脑或虚拟机**
   - Windows 10 或 Windows 11
   - 至少 8GB 内存

2. **安装开发环境**
   ```powershell
   # 安装 Node.js 18+
   # 下载: https://nodejs.org/

   # 安装 Windows Build Tools（编译 native 模块需要）
   npm install -g windows-build-tools
   npm install -g node-gyp
   ```

3. **安装 Visual Studio Build Tools**
   - 下载：https://visualstudio.microsoft.com/downloads/
   - 选择 "Desktop development with C++"

### 打包步骤

```powershell
# 1. 克隆项目
git clone https://github.com/yourusername/novel-writer.git
cd novel-writer

# 2. 安装依赖
npm install

# 3. 重新编译 native 模块
npm run postinstall

# 4. 打包 Windows 版本
npm run build:win
```

打包完成后，在 `dist/` 目录会生成：
- `NovelWriter-1.0.0-x64.exe` - 安装程序
- `NovelWriter-1.0.0-x64.zip` - 便携版

---

## 🤖 方法二：使用 GitHub Actions 自动打包（推荐）

这是最简单的方式！无需 Windows 电脑，GitHub 自动为您打包。

### 步骤 1: 创建 GitHub Actions 配置

创建文件 `.github/workflows/release.yml`：

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to build'
        required: false

jobs:
  build:
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies (macOS/Linux)
        if: runner.os != 'Windows'
        run: npm ci

      - name: Install dependencies (Windows)
        if: runner.os == 'Windows'
        run: npm ci
        env:
          npm_config_build_from_source: true

      - name: Build application
        run: npm run build

      - name: Build macOS
        if: matrix.os == 'macos-latest'
        run: npx electron-builder --mac --publish never
        env:
          ELECTRON_MIRROR: https://npmmirror.com/mirrors/electron/

      - name: Build Windows
        if: matrix.os == 'windows-latest'
        run: npx electron-builder --win --publish never

      - name: Build Linux
        if: matrix.os == 'ubuntu-latest'
        run: npx electron-builder --linux --publish never
        env:
          ELECTRON_MIRROR: https://npmmirror.com/mirrors/electron/

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.os }}-build
          path: |
            dist/*.dmg
            dist/*.exe
            dist/*.zip
            dist/*.AppImage
            dist/*.deb

  release:
    needs: build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Download macOS artifacts
        uses: actions/download-artifact@v4
        with:
          name: macos-latest-build
          path: dist/

      - name: Download Windows artifacts
        uses: actions/download-artifact@v4
        with:
          name: windows-latest-build
          path: dist/

      - name: Download Linux artifacts
        uses: actions/download-artifact@v4
        with:
          name: ubuntu-latest-build
          path: dist/

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: dist/*
          generate_release_notes: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 步骤 2: 推送到 GitHub

```bash
# 添加 GitHub Actions 配置
git add .github/workflows/release.yml

# 提交
git commit -m "Add GitHub Actions for automated builds"

# 推送
git push origin main
```

### 步骤 3: 触发构建

有两种方式触发自动构建：

#### 方式 A: 创建标签自动触发

```bash
# 创建标签
git tag v1.0.0

# 推送标签
git push origin v1.0.0
```

GitHub 会自动构建所有平台版本并创建 Release！

#### 方式 B: 手动触发

1. 访问 GitHub 仓库
2. 点击 "Actions" 标签
3. 选择 "Build and Release" workflow
4. 点击 "Run workflow"

---

## 📦 Windows 安装包说明

### 安装程序 (NSIS)

- 文件：`NovelWriter-1.0.0-x64.exe`
- 大小：约 80-100 MB
- 包含安装向导
- 创建桌面快捷方式
- 创建开始菜单
- 支持卸载

### 便携版

- 文件：`NovelWriter-1.0.0-x64.zip`
- 解压即用，无需安装
- 适合 U 盘运行

---

## 👥 Windows 用户安装步骤

### 安装步骤

1. **下载安装程序**
   - 从 GitHub Release 下载 `NovelWriter-1.0.0-x64.exe`

2. **运行安装程序**
   - 双击 `.exe` 文件
   - 如果 Windows Defender 拦截，点击"更多信息" → "仍要运行"

3. **安装向导**
   - 选择安装位置（默认：`C:\Users\[用户名]\AppData\Local\Programs\NovelWriter`）
   - 选择是否创建桌面快捷方式
   - 点击"安装"

4. **启动应用**
   - 安装完成后点击"运行 NovelWriter"
   - 或从桌面快捷方式/开始菜单启动

### 首次运行

如果遇到"Windows 已保护你的电脑"提示：

1. 点击"更多信息"
2. 点击"仍要运行"
3. 这是因为应用未签名，是安全的

### 卸载

- 方式 1: 运行 `C:\Users\[用户名]\AppData\Local\Programs\NovelWriter\Uninstall NovelWriter.exe`
- 方式 2: 控制面板 → 程序和功能 → NovelWriter → 卸载

---

## ⚙️ Windows 特定配置

### 代码签名（可选）

如果想要消除安全警告，需要购买代码签名证书：

1. **购买证书**
   - DigiCert、Sectigo、GlobalSign 等
   - 价格：$100-400/年

2. **配置签名**
   在 `package.json` 中添加：

   ```json
   {
     "build": {
       "win": {
         "certificateFile": "path/to/certificate.pfx",
         "certificatePassword": "your-password",
         "sign": "./sign.js"
       }
     }
   }
   ```

### 自定义安装选项

编辑 `package.json` 的 `nsis` 配置：

```json
{
  "build": {
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "installerIcon": "build/icon.ico",
      "uninstallerIcon": "build/icon.ico",
      "installerHeaderIcon": "build/icon.ico",
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "NovelWriter"
    }
  }
}
```

---

## 🐛 Windows 常见问题

### 1. 安装失败

**问题**: 安装程序无法运行

**解决方案**:
- 右键 → 以管理员身份运行
- 临时关闭杀毒软件
- 检查是否有足够的磁盘空间

### 2. 应用无法启动

**问题**: 双击图标无反应

**解决方案**:
- 检查是否被杀毒软件拦截
- 尝试重新安装
- 检查 Windows 事件查看器错误日志

### 3. Native 模块错误

**问题**: better-sqlite3 或 keytar 加载失败

**解决方案**:
- 确保在 Windows 上打包
- 使用 GitHub Actions 自动构建
- 检查 Node.js 版本匹配

---

## 📊 打包大小对比

| 平台 | 格式 | 大小 |
|------|------|------|
| macOS (Intel) | .dmg | ~134 MB |
| macOS (ARM) | .dmg | ~129 MB |
| Windows | .exe | ~80-100 MB |
| Linux | .AppImage | ~90 MB |

---

## 💡 最佳实践

### 1. 使用 GitHub Actions

- ✅ 无需 Windows 电脑
- ✅ 自动化构建
- ✅ 多平台支持
- ✅ 可追溯的构建记录

### 2. 版本一致性

- 所有平台使用相同的版本号
- 同步发布所有平台版本
- 统一的更新日志

### 3. 测试覆盖

- 在真实 Windows 设备上测试
- 测试不同 Windows 版本（10/11）
- 测试安装、运行、卸载流程

---

## 🚀 快速开始

**最简单的方式：**

1. 创建 `.github/workflows/release.yml` 文件
2. 推送到 GitHub
3. 创建并推送标签 `v1.0.0`
4. 等待 GitHub Actions 自动构建
5. 在 Releases 页面下载 Windows 安装包

就是这么简单！🎉