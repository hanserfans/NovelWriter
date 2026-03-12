# NovelWriter

一款专为 macOS 设计的专业小说写作软件，集成 AI 写作助手。

## 功能特性

- 📚 项目管理：多项目管理、分卷分章管理
- ✍️ 富文本编辑器：专业的章节编辑器，支持实时字数统计
- 🎭 知识库：角色、场景、情节线、世界观设定管理
- 🤖 AI 助手：集成 OpenAI 和 Claude API，提供续写、润色等智能写作辅助
- 💾 数据安全：本地 SQLite 数据库，自动备份
- 📤 导出功能：支持导出为 TXT、Word、PDF 格式

## 技术栈

- **前端框架**: React 18 + TypeScript
- **桌面框架**: Electron 28
- **UI 组件**: Ant Design 5 + Tailwind CSS
- **富文本编辑器**: TipTap 2
- **数据库**: SQLite (better-sqlite3)
- **状态管理**: Zustand
- **构建工具**: Vite 5 + electron-vite 2

## 开发环境要求

- Node.js >= 18.0
- npm >= 9.0 或 yarn >= 1.22
- macOS >= 10.15 (Catalina)
- Xcode Command Line Tools

## 安装依赖

```bash
npm install
```

## 开发

```bash
npm run dev
```

## 构建

```bash
npm run build
```

## 打包 macOS 应用

```bash
npm run build:mac
```

## 许可证

MIT