# 项目上下文与开发接手说明

核对日期：2026-10-26。源码基线：`main` / `c1c3b96`。本文把仓库探索结论整理为接手入口；细节按 [文档索引](README.md) 分专题维护。

## 1. 网站是什么

LiuYinChu'Space 是个人内容网站与交互作品集合：既有随记、说说、资料与项目介绍，也有桌面式 Portal、机械音乐编辑器、星场、小游戏和实验性页面。不能把它当成只有文章列表的博客，也不能假定所有页面共用同一套布局与视觉。

站点为 Vue 3 前端，使用 Vite 构建、Vue Router history 路由。仓库没有网站业务后端或账户服务；内容主要从 `public/` 读取，一部分功能直接访问 GitHub Raw、天气服务、IP 定位或字体 CDN。

## 2. 快速架构图

```text
src/main.js
  └─ src/App.vue + src/router/index.js
       ├─ 公共 Header / Footer + 普通页面
       ├─ 独立壳：Portal / MusicBox / AI Frontier
       ├─ 内容页面
       │    ├─ public/*.json → 列表 / 导航 / 搜索
       │    ├─ public/markdown/*.md → MarkdownViewer
       │    ├─ src/content/post-it/*.md → postItEntries → Talk / TalkTicker
       │    └─ public/resource/*.json → ResourceDetailPage
       └─ 交互页面
            ├─ Portal registry + windowModel
            ├─ MusicBox 模拟 / 音序 / 音频
            └─ WebGL / Canvas / 本地存储 / 外部请求
```

实际路由与布局条件见 [架构文档](ARCHITECTURE.md)，数据合同见 [编辑指南](SITE_EDITING_GUIDE.md)。

## 3. 已确认的关键边界

| 边界 | 接手时需要知道的事实 |
| --- | --- |
| 入口与路由 | 首页同步导入，其余页面模块主要懒加载；45 条路由记录包括重定向、参数路由和兜底，并非 45 个独立页面文件 |
| 全站布局 | App 依据已呈现路径管理头尾与过渡；Portal、MusicBox、AI Frontier 有独立布局 |
| 状态 | 以组件状态、模块和 localStorage 为主；未见额外的全站状态管理插件 |
| 内容驱动 | 普通内容优先改 JSON / Markdown，不需要为新增条目改 Vue |
| Markdown | 大多数文章/文档走 MarkdownViewer，资源描述和课程等存在独立处理，不能默认所有语法全站一致 |
| 样式 | 主站暗色基调与全局变量在 style.css；AI Frontier 为独立浅色，AboutMe/星场另有视觉系统 |
| 持久化 | 文章排版、Portal 工作区、日历待办、天气城市、音乐编排与游戏记录有各自的本地存储 |
| 静态发布 | build 输出 dist；SEO 脚本复制入口并生成索引，不预渲染页面正文 |
| 第三方依赖 | 外部网络不可用时可能只影响某个模块；fixture 测试通过不能证明第三方实时可用 |

## 4. 主要模块与修改入口

| 模块 | 页面或入口 | 接手要点 |
| --- | --- | --- |
| 首页 | [Home.vue](../src/pages/Home.vue) | 六段全屏入口，含入场字幕与滚动锁；改文案与图片先看 homeSections |
| 随记与文库 | [Space1.vue](../src/pages/Space1.vue)、[Space4.vue](../src/pages/Space4.vue) | 共用文章索引；Space1 含精选/分页，Space4 提供星环与年份浏览 |
| 说说 | [Talk.vue](../src/pages/Talk.vue)、[TalkCard.vue](../src/components/journal/TalkCard.vue)、[post-it/](../src/content/post-it/) | 每条独立 Markdown 自动收录；标题/全文搜索、卡片瀑布流与轮播共用同一条目列表 |
| 文章与富组件 | [ArticleView.vue](../src/pages/ArticleView.vue)、[MarkdownViewer.vue](../src/components/MarkdownViewer.vue)、[markdownComponents.js](../src/utils/markdownComponents.js) | id 固定映射正文；异步公式/图表影响目录与滚动；Enhanced 仅文章显式启用 |
| 资源与项目 | [ResourceDirectory.vue](../src/pages/ResourceDirectory.vue)、[ResourceDetailPage.vue](../src/components/ResourceDetailPage.vue)、[Code.vue](../src/pages/Code.vue) | 资源两套入口并存；项目/资源新增主要编辑 JSON |
| 关于与视觉 | [AboutMe.vue](../src/pages/AboutMe.vue)、[about/](../src/components/about/)、[StellarField.vue](../src/components/effects/StellarField.vue) | 六章滚动叙事；星场和键盘是独立渲染器，靠投影坐标对齐猫与键帽 |
| Portal | [Portal.vue](../src/pages/Portal.vue)、[apps.js](../src/portal/apps.js)、[windowModel.mjs](../src/portal/windowModel.mjs) | 四个单实例窗口；最小化保活，关闭卸载；Spotlight 与 Launchpad 不同 |
| 天气与日历待办 | [weather/](../src/weather/)、[Weather.vue](../src/components/Weather.vue)、[Calendar.vue](../src/components/Calendar.vue)、[ToDoList.vue](../src/components/ToDoList.vue) | 时区、请求取消、分段失败、事件联动和旧存储兼容 |
| 音乐机关盒 | [MusicBox.vue](../src/pages/MusicBox.vue)、[music-box/](../src/components/music-box/) | 编辑器、物理、音序与声音合成分层，音频需用户操作解锁 |
| LifeTree | [LifeTree.vue](../src/pages/LifeTree.vue)、[autonomy.json](../public/life-tree/autonomy.json) | 当前作品是“无手织机”，不能按历史名称理解为普通树形页 |
| AI Frontier | [frontier/](../src/components/frontier/)、[内容指南](ai-frontier-content.md) | 独立浅色布局，复用公共 Markdown；外部札记与本地 AVIS3 数据分开维护 |
| 运行与交付 | [package.json](../package.json)、[scripts/](../scripts/)、[tests/](../tests/)、[部署工作流](../.github/workflows/deploy.yml) | 按改动选择验证；提交、push、构建和发布是不同步骤 |

## 5. 内容快照与维护原则

以下数量来自 2026-10-26 的索引核对，不是容量上限：

- 文章 36 条，均有对应 `public/markdown/{id}.md`；精选 6 条。
- 资源六分类共 66 条；代码项目 19 项；友链 8 项。
- Portal curated 搜索条目 21 条，音乐配置 80 首；Launchpad 配置与实际窗口 registry 分离。
- AVIS3 当前公开数据对应三名选手、每名十轮；30 份频谱由查看器按需加载，manifest 只作发布清单。

新增文章要同时维护索引、同名正文和封面，精选另引用文章 id。说说每条一个带 title/date 的 Markdown，按编号文件名保留原顺序；日期表示收录日，入口为 /talk#post-{id}。资源按数值 idx 排序。重要导航并非全数据驱动，Header、Footer、备用搜索项与静态索引可能需要同步。

详细字段、示例与新增步骤集中在 [编辑指南](SITE_EDITING_GUIDE.md)，避免仅凭上述概览直接修改数据合同。

## 6. 开发环境与验证入口

本次开发在用户指定的远端仓库完成，浏览器通过 SSH 隧道访问本地 5173；仓库文档中的连接账号、主机与路径使用占位示例，实际目标由开发任务上下文提供。具体步骤、PATH 和端口排查见 [开发测试与部署](DEVELOPMENT_AND_DEPLOYMENT.md)。

当前锁文件记录 Vue 3.5.17、Vue Router 4.5.1、Vite 6.3.5、Playwright 1.62.1；远端版本核对为 Node 24.17.0 / npm 11.13.0。锁定版本不等于本轮逐个核对过 node_modules 实装状态。

验证体系有四层：

1. Markdown 扩展内存断言：`npm run check:markdown`。
2. 说说内容、Portal/天气与音乐逻辑的 Node 测试。
3. Chromium 桌面、手机两个项目的 Playwright E2E。
4. build / preview / 实际部署深链检查。

E2E 使用独立 4174 开发服务，默认减弱动效，不复用 5173，也不验证构建产物。Frontier 使用固定 fixture。正式发布前仍需针对实际改动检查 dist、外部来源和需要正常动效的视觉状态。

## 7. 探索证据与验证边界

前一轮探索以 `b39f1fa` 为源码基线；本次文档重整重新核对到 `c1c3b96`，其中新增提交为 About 猫敲击视觉标记修复。

| 检查 | 记录与边界 |
| --- | --- |
| 源码探索 | 按架构/路由、内容、视觉、交互、测试部署分工；当前版再按文档专题定向核对 |
| 浏览器抽样 | 前轮已查看首页、Space1 列表与一篇文章、Code、About 键盘猫章节、AI Frontier 和 Portal，天气数据完成加载 |
| 访问性 | 前轮本地 5173 预览 HTTP 200，远端服务 cwd 与本仓库一致 |
| 内容抽查 | 校验文章索引与文件对应；频谱只抽样 schema，未重新核算30轮科学结果或完整来源链 |
| 文档更新 | 不改变应用行为；实际文档校验记录由此次 Git 提交的 Validation 部分给出 |
| 未声称通过 | 本次未因此宣称 build、E2E、全部移动端、线上发布配置或所有外部接口已通过 |

历史 [design-qa.md](../design-qa.md) 中的截图和通过结论仅属于原交付；它们不是当前版本的自动回归证明。

## 8. 接手后如何开展一个任务

1. 先明确目标页面、预期行为、允许修改范围和验收方式，检查当前 Git 工作区与暂存区。
2. 按索引进入相关专题和实际代码；先确认数据修改是否已足够，再决定是否需要改组件。
3. 保留现有用户/其他任务改动，新增路由时核对导航、搜索与测试清单，修改交互时核对本地存储及资源释放。
4. 只执行与改动匹配的验证，记录真实结果和未验证范围；构建/测试产物不混入源码提交。
5. 同步文档、按明确路径暂存并审查 index；使用项目约定的提交格式，提交后核对包含文件。是否推送由任务授权决定。

## 9. 已知事项与后续方向

[待处理问题](KNOWN_ISSUES.md) 区分已确认缺口、现有实现限制和待复现疑点。优先关注路由清单同步、前端天气配置、SEO/部署验证边界、外部依赖及少量 Markdown/动效疑点。

旧页面与旧组件仅标记当前引用状态，不因文件名带 old 就删除；未来清理应另设任务并验证导航与数据影响。本轮文档重整不顺便重构网站。
