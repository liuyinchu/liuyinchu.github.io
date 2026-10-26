# LiuYinChu'Space

个人网站源码：随记、说说、资源目录、代码项目、关于介绍，以及 Portal、音乐机关盒、星场等交互页面。

站点使用 Vue 3、Vue Router 和 Vite；内容主要保存在 `public/` 的 JSON / Markdown 中。此仓库没有网站业务后端，部分功能直接访问第三方服务。

## 开发文档

从 [文档索引](docs/README.md) 开始；接手开发先读 [项目上下文](docs/PROJECT_CONTEXT.md)。

| 需要处理的工作 | 查阅文档 |
| --- | --- |
| 路由、布局、目录职责、页面与视觉组件 | [架构与代码入口](docs/ARCHITECTURE.md) |
| 发文章、改资源、维护项目与友链、Markdown 语法 | [编辑与维护指南](docs/SITE_EDITING_GUIDE.md) |
| Portal、天气、音乐、游戏、交互状态 | [交互模块开发](docs/INTERACTIVE_FEATURES.md) |
| 运行、验证、构建、Git 与发布 | [开发测试与部署](docs/DEVELOPMENT_AND_DEPLOYMENT.md) |
| AI 札记、Skill、Trivia、AVIS3 数据与频谱 | [AI Frontier 内容维护](docs/ai-frontier-content.md) |
| 已确认缺口、待复现疑点与后续验收 | [待处理问题](docs/KNOWN_ISSUES.md) |

## 在当前远端工作区运行

以下是远端开发示例；先将 `site-user@dev-host` 和 `/path/to/liuyinchu.github.io` 替换为实际连接目标与仓库路径，再执行：

```sh
ssh site-user@dev-host
cd /path/to/liuyinchu.github.io
npm run dev
```

在本地另开终端建立隧道：

```sh
ssh -N -L 5173:localhost:5173 site-user@dev-host
```

然后访问 [本地开发预览](http://localhost:5173/)。

启动前先检查已有服务。Vite 遇到端口占用可能自动改端口；只有确认服务属于本仓库后才能复用，实际服务端口与隧道目标必须一致。不要为了重新启动而终止其他任务的服务。

CI 使用 Node 24；2026-10-26 核对的远端环境为 Node 24.17.0 / npm 11.13.0。版本与安装情况以当前环境和锁文件为准，现有工作区不需要为每次启动重复安装依赖。非交互 SSH 若找不到 npm，参见开发文档的 shell/PATH 说明。

## 常用验证入口

以下为可用命令，不表示本次文档更新已执行这些检查：

```sh
npm run check:markdown
node --test tests/portal-window-model.test.mjs tests/weather-model.test.mjs
node --test tests/music-box-*.test.js
npm run test:e2e
npm run build
```

按改动选择最小验证范围。E2E 独占 4174 端口并生成报告；build 重写 `dist/`。仓库没有通用 `npm test`、lint 或类型检查脚本，具体覆盖与副作用见 [验证矩阵](docs/DEVELOPMENT_AND_DEPLOYMENT.md)。

## 发布与维护

推送到 `main` 或手动触发 GitHub Actions 后，工作流安装锁定依赖、构建，并将 `dist/` 发布到 `gh-pages`。创建本地 Git 提交不会触发远端部署；现有工作流没有自动运行测试。

内容修改优先更新 JSON / Markdown；只有结构、交互或视觉变化才需要改 Vue / JS / CSS。修改功能时同步相关专题文档、导航入口与必要的路由测试清单。

文档核对日期：2026-10-26，源码基线：`c1c3b96`。历史设计验收另见 [design-qa.md](design-qa.md)，其中的旧结果不代表当前版本已通过验收。
