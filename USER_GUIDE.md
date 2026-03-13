# NovelWriter 用户指南

## 📥 安装

### macOS

1. 下载 `NovelWriter-1.0.0-arm64.dmg`（Apple Silicon）或 `NovelWriter-1.0.0-x64.dmg`（Intel）
2. 双击打开 DMG 文件
3. 将 NovelWriter 拖拽到 Applications 文件夹
4. 首次打开时，右键点击应用，选择"打开"

### Windows

1. 下载 `NovelWriter-1.0.0-x64.exe`
2. 双击运行安装程序
3. 按照提示完成安装

### Linux

1. 下载 `NovelWriter-1.0.0-x64.AppImage`
2. 添加执行权限：`chmod +x NovelWriter-1.0.0-x64.AppImage`
3. 双击运行

## 🚀 快速开始

### 1. 创建项目

- 点击"新建项目"
- 填写项目名称、类型、描述
- 开始写作！

### 2. 章节管理

- 在项目页面点击"新建章节"
- 选择章节进行编辑
- 系统自动保存

### 3. AI 功能配置

要使用 AI 功能，需要配置 AI API：

1. 打开"设置" → "AI 配置"
2. 选择 AI 提供商（OpenAI 或 Claude）
3. 输入 API Key
4. 选择模型
5. 保存配置

### 4. 使用 AI 功能

#### AI 审查
- 选中文字（至少10个字符）
- 点击工具栏的"AI审查"按钮
- 选择审查类型
- 查看审查建议

#### AI 格式整理
- 选中文字
- 点击"AI整理"按钮
- 确认操作
- 自动替换为整理后的文字

## ✨ 主要功能

### 📝 富文本编辑器
- 支持加粗、斜体、下划线
- 多级标题
- 有序/无序列表
- 实时字数统计

### 📊 统计信息
- 总字数统计
- 中英文分别统计
- 段落数、句子数
- 预计阅读时间

### 📤 导出功能
- **TXT**: 纯文本格式
- **Word**: .docx 格式
- **PDF**: 完美支持中文

### 🎭 知识库管理
- **角色管理**: 创建角色卡片，记录角色信息
- **场景管理**: 管理故事场景
- **情节线**: 规划故事情节
- **世界观**: 构建世界观设定
- **时间线**: 管理故事时间线

### 🤖 AI 辅助功能
- **AI 审查**: 多维度审查文字质量
- **AI 格式整理**: 智能优化排版
- **AI 续写**: AI 辅助创作
- **AI 润色**: 文字润色优化

## 💡 使用技巧

### 自动保存
系统会自动保存您的编辑，无需手动保存

### 键盘快捷键
- `Ctrl/Cmd + B`: 加粗
- `Ctrl/Cmd + I`: 斜体
- `Ctrl/Cmd + U`: 下划线

### 数据安全
- 所有数据存储在本地 SQLite 数据库
- 建议定期导出备份

## ⚙️ 系统要求

### macOS
- macOS 10.15 (Catalina) 或更高版本
- 支持 Intel 和 Apple Silicon

### Windows
- Windows 10 或更高版本
- 64 位系统

### Linux
- Ubuntu 18.04+ 或其他主流发行版
- 64 位系统

## 🔒 隐私说明

- 所有数据存储在本地
- AI 功能需要联网调用 API
- API Key 安全存储在系统钥匙串中
- 不会上传任何个人数据

## 🆘 常见问题

### 无法打开应用（macOS）

```bash
# 允许运行未签名应用
xattr -cr /Applications/NovovelWriter.app
```

### AI 功能无法使用

1. 检查网络连接
2. 确认 API Key 是否正确
3. 检查 API 余额

### 导出乱码

- 确保 选择 UTF-8 编码
- PDF 导出已优化支持中文

## 📧 反馈与支持

如遇问题或有建议，请访问：
- GitHub Issues: https://github.com/novelwriter/novel-writer/issues
- 邮箱: support@novelwriter.app

## 📄 许可证

MIT License - 可自由使用、修改和分发