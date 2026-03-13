# 🚀 快速发布指南

## 📦 macOS 版本已打包完成！

您已经成功打包了 macOS 版本：

```
✅ NovelWriter-1.0.0-x64.dmg (134 MB) - Intel Mac
✅ NovelWriter-1.0.0-arm64.dmg (129 MB) - Apple Silicon (M1/M2/M3)
```

## 🎯 下一步：创建 GitHub Release

### 方式一：自动化发布（推荐）

```bash
# 运行发布脚本
./release.sh
```

这个脚本会：
1. ✅ 检查代码状态
2. ✅ 更新版本号
3. ✅ 创建 Git 标签
4. ✅ 推送到 GitHub
5. ✅ 触发 GitHub Actions 自动构建 Windows 版本

### 方式二：手动发布

1. **创建并推送标签**
   ```bash
   git add .
   git commit -m "Release v1.0.0"
   git tag v1.0.0
   git push origin main
   git push origin v1.0.0
   ```

2. **等待 GitHub Actions 构建**
   - 访问仓库的 "Actions" 页面
   - 等待构建完成（约 10-20 分钟）

3. **查看 Release**
   - 构建完成后，访问 "Releases" 页面
   - 所有平台的安装包会自动上传

### 方式三：手动上传 macOS 版本

如果您不想等待 GitHub Actions：

1. **在 GitHub 上创建 Release**
   - 访问仓库 → Releases → Draft a new release
   - 选择标签：v1.0.0
   - 填写 Release Notes

2. **上传 macOS 安装包**
   - 上传 `dist/NovelWriter-1.0.0-x64.dmg`
   - 上传 `dist/NovelWriter-1.0.0-arm64.dmg`

3. **发布 Release**

Windows 版本可以稍后用 GitHub Actions 单独构建。

## 🪟 Windows 版本

### 最简单的方式：GitHub Actions

已经配置好了 `.github/workflows/release.yml`，只需：

```bash
# 推送标签，GitHub 会自动构建 Windows 版本
git push origin v1.0.0
```

### Windows 用户如何安装

1. 从 GitHub Release 下载 `NovelWriter-1.0.0-x64.exe`
2. 双击运行安装程序
3. 如果 Windows 拦截，点击"更多信息" → "仍要运行"
4. 按照安装向导完成安装

详细说明请查看：[WINDOWS_BUILD.md](./WINDOWS_BUILD.md)

## 📚 相关文档

- [RELEASE_GUIDE.md](./RELEASE_GUIDE.md) - 完整发布指南
- [WINDOWS_BUILD.md](./WINDOWS_BUILD.md) - Windows 打包指南
- [USER_GUIDE.md](./USER_GUIDE.md) - 用户使用指南
- [CHANGELOG.md](./CHANGELOG.md) - 更新日志

## ✨ 推荐流程

```bash
# 1. 运行发布脚本
./release.sh

# 2. 等待 GitHub Actions 构建

# 3. 在 Releases 页面查看所有平台的安装包

# 完成！🎉
```

就这么简单！

---

**提示**：首次发布建议使用方式三（手动上传 macOS 版本），因为 GitHub Actions 可能需要配置。后续版本更新可以使用自动化流程。