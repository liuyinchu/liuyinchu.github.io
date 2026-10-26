# 网站架构与开发入口

更新日期：2026-10-26。源码核对基线：`main` 分支的 `c1c3b96`。

本文记录当前实现的入口、边界与定位方法。行为描述来自源码阅读；除非明确标注，不代表已经在浏览器运行或完成跨设备验证。
内容与数据编辑见 [SITE_EDITING_GUIDE.md](SITE_EDITING_GUIDE.md)，交互细节见 [INTERACTIVE_FEATURES.md](INTERACTIVE_FEATURES.md)，运行和发布见 [DEVELOPMENT_AND_DEPLOYMENT.md](DEVELOPMENT_AND_DEPLOYMENT.md)。
历史背景见 [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)，待确认问题见 [KNOWN_ISSUES.md](KNOWN_ISSUES.md)。

## 1. 应用入口与技术边界

当前项目是 Vue 3 单页网站，以 Vite 构建，Vue Router 使用 HTML5 History。
技术版本以 [package.json](../package.json) 的声明及锁文件为准；文档不把版本范围当成已安装版本。

- [src/main.js](../src/main.js) 导入全局样式、APlayer 样式，创建 Vue 应用，安装 Router，挂载 `#app`。
- [src/App.vue](../src/App.vue) 管理站点 Header/Footer、路由切换过渡以及新视图挂载信号。
- [src/router/index.js](../src/router/index.js) 定义全部活动路由、兼容重定向及滚动恢复。
- Home 静态导入；其余路由页面由动态 `import()` 加载。
- 多数页面通过根路径读取 `public/` 静态内容；说说由 Vite 插件扫描 `public/post-it/` 下的 Markdown，通过虚拟模块自动组成页面与轮播共用的条目列表。
- 富文本、公式、图表及音乐所用依赖集中声明在 `package.json`；不同页面仍有各自的呈现方式。
- WebGL 星场、技术栈键盘、Canvas 织机均为项目内实现；不要假设存在统一的三维引擎或全局动画管理器。

运行链路：

```text
index.html → src/main.js → App.vue
                            ├─ Header.vue（按已显示路由决定）
                            ├─ RouterView → src/pages/*.vue
                            └─ Footer.vue（按已显示路由决定）
src/router/index.js ← App.vue 的 markRouteViewReady(path)
页面与组件 → public/ 静态数据 / 所需的外部服务
```

这是一条定位链路，不表示所有页面都有相同的生命周期或数据加载协议。
使用 `window`、Canvas、WebGL 和媒体查询的页面较多；当前代码不能直接当成服务端渲染组件复用。

## 2. 目录职责

| 路径 | 当前职责 | 维护入口 |
| --- | --- | --- |
| [src/pages/](../src/pages/) | 路由级页面、页面布局及部分交互实现 | 先从 Router 找对应组件 |
| [src/components/](../src/components/) | 跨页面组件与按功能分组的组件 | 保留组件与页面的数据职责边界 |
| [src/components/common/](../src/components/common/) | 站点图标等公共界面组件 | Header/Footer 使用 `SiteIcon` |
| [src/components/journal/](../src/components/journal/) | 随记精选轨道、说说 ticker 与说说卡片 | `Space1.vue`、`Talk.vue` 组合使用 |
| [public/post-it/](../public/post-it/) | 每条独立的说说 Markdown 与 title/date 元数据 | Vite 插件递归自动收录，无需编号或手工索引；相对文件路径去扩展名作为 id |
| [src/components/about/](../src/components/about/) | 内容星图、技术栈键盘及键盘几何 | `AboutMe.vue` 组合使用 |
| [src/components/effects/](../src/components/effects/) | 可复用视觉效果 | 星场详细接口见其组件 README |
| [src/components/space4/](../src/components/space4/) | 星穹文库背景、星环和年表 | 与共享 WebGL 星场是不同实现 |
| [src/components/frontier/](../src/components/frontier/) | AI Frontier 相关界面 | 详细编辑入口见内容编辑指南 |
| [src/router/](../src/router/) | 路由与跨页面滚动协调 | `index.js` |
| [src/utils/](../src/utils/) | Markdown 组件与阅读时长辅助逻辑 | `markdownComponents.js`、`readingTime.js` |
| [src/portal/](../src/portal/) | Portal 应用注册及窗口模型 | `apps.js`、`windowModel.mjs` |
| [src/weather/](../src/weather/) | 天气模型、城市和数据模块 | Portal 等相关功能按引用定位 |
| [public/](../public/) | 运行时读取的 JSON、Markdown、图片、音乐和文件 | URL 从站点根路径开始 |
| [scripts/](../scripts/) | Markdown 检查、说说虚拟模块插件、构建后的 SEO 生成 | 以现有 npm scripts 为准 |
| [tests/e2e/](../tests/e2e/) | Playwright 路由、排版及交互回归 | 测试清单与发布文档互相参照 |
| [docs/](./) | 项目上下文、维护说明与已知问题 | [文档目录](README.md) |

说说的 [vite-post-it.mjs](../scripts/vite-post-it.mjs) 在开发和构建时递归扫描 `public/post-it/` 内 `.md` / `.MD`，过滤不规范的 title/date 并生成 `virtual:post-it`；开发时监听新增、修改、删除并重新加载。[postIt.js](../src/data/postIt.js) 导出 `postItEntries`，含 id、title、date、content、summary 和 href；[postIt.mjs](../src/utils/postIt.mjs) 负责简单 frontmatter、日期与摘要解析。条目按真实时间倒序，同一时刻按 id 字典序排列；文件相对路径决定 id，移动或重命名改变永久链接，正式站点仍需正常构建发布。普通文章继续沿用 public 中的索引和正文。TalkCard 通过 MarkdownViewer 的 embed 模式渲染正文，仅在说说中传入条目专属 anchorPrefix，隔离标题/脚注锚点。
`public/` 中的数据不全部共用一个 schema，改动前先定位真实消费者。

## 3. 全部活动路由

以下是 [router/index.js](../src/router/index.js) 中的 **45 条活动路由记录**，包含 3 条重定向和兜底。
注释中的 `/notes`、`/postit` 不参与运行，不能当成可访问入口。
“标准”表示由 App 提供 Header/Footer；“独立”表示 App 隐藏这两部分，并不表示页面没有自己的导航。

| # | 路径 | 页面 / 行为 | App 外壳 |
| --- | --- | --- | --- |
| 1 | `/` | [Home.vue](../src/pages/Home.vue)：首页 | 标准；无 route-flow |
| 2 | `/code` | [Code.vue](../src/pages/Code.vue)：代码与项目 | 标准 |
| 3 | `/music-box` | [MusicBox.vue](../src/pages/MusicBox.vue)：音乐机关盒 | 独立 |
| 4 | `/stellar-field` | [StellarField.vue](../src/pages/StellarField.vue)：星间 | 标准 |
| 5 | `/resource` | [Resource.vue](../src/pages/Resource.vue)：资源入口页 | 标准 |
| 6 | `/space1` | [Space1.vue](../src/pages/Space1.vue)：随记 | 标准 |
| 7 | `/space2` | [Space2.vue](../src/pages/Space2.vue)：网络邻居 | 标准 |
| 8 | `/space3` | [Space3.vue](../src/pages/Space3.vue)：赛博会客厅 | 标准 |
| 9 | `/space4` | [Space4.vue](../src/pages/Space4.vue)：星穹文库 | 标准；Footer 变体 |
| 10 | `/talk` | [Talk.vue](../src/pages/Talk.vue)：说说 | 标准 |
| 11 | `/visitor-center` | [VisitorCenter.vue](../src/pages/VisitorCenter.vue)：访客中心 | 标准 |
| 12 | `/space1/post_it` | 重定向至 `/talk` | 随目标 |
| 13 | `/space1/:id` | [ArticleView.vue](../src/pages/ArticleView.vue)：随记正文 | 标准 |
| 14 | `/about` | [About.vue](../src/pages/About.vue)：关于目录 | 标准 |
| 15 | `/about/me` | [AboutMe.vue](../src/pages/AboutMe.vue)：关于我 & 关于本站 | 标准 |
| 16 | `/about/site` | 重定向至 `/about/me`，保留 query/hash | 随目标 |
| 17 | `/about/self` | 重定向至 `/about/me`，保留 query/hash | 随目标 |
| 18 | `/credit` | [Credit.vue](../src/pages/Credit.vue)：版权说明 | 标准 |
| 19 | `/portal` | [Portal.vue](../src/pages/Portal.vue)：桌面 Portal | 独立 |
| 20 | `/labreport` | [LabReport.vue](../src/pages/LabReport.vue)：实验报告 | 标准 |
| 21 | `/ysy-latex` | [YsyLatex.vue](../src/pages/YsyLatex.vue) | 标准 |
| 22 | `/ysy-data-analysis-helper` | [YsyDataAnalysisHelper.vue](../src/pages/YsyDataAnalysisHelper.vue) | 标准 |
| 23 | `/brisk-nexus` | [BriskNexus.vue](../src/pages/BriskNexus.vue) | 标准 |
| 24 | `/paper-switch-brush` | [PaperSwitchBrush.vue](../src/pages/PaperSwitchBrush.vue) | 标准 |
| 25 | `/cyber-match` | [CyberMatch.vue](../src/pages/CyberMatch.vue) | 标准 |
| 26 | `/lyc2048` | [LYC2048.vue](../src/pages/LYC2048.vue) | 标准 |
| 27 | `/rd` | [ResourceDirectory.vue](../src/pages/ResourceDirectory.vue)：资源目录 | 标准 |
| 28 | `/rliterature` | [ResourceLiterature.vue](../src/pages/ResourceLiterature.vue)：文献资源 | 标准 |
| 29 | `/rprogramming` | [ResourceProgramming.vue](../src/pages/ResourceProgramming.vue)：编程资源 | 标准 |
| 30 | `/rmaterials` | [ResourceMaterials.vue](../src/pages/ResourceMaterials.vue)：资料资源 | 标准 |
| 31 | `/rcomputer` | [ResourceComputer.vue](../src/pages/ResourceComputer.vue)：计算机资源 | 标准 |
| 32 | `/rtools` | [ResourceTools.vue](../src/pages/ResourceTools.vue)：工具资源 | 标准 |
| 33 | `/rfiles` | [ResourceFiles.vue](../src/pages/ResourceFiles.vue)：文件资源 | 标准 |
| 34 | `/academic-plot-guide` | [AcademicGuide.vue](../src/pages/AcademicGuide.vue)：学术作图指南 | 标准 |
| 35 | `/life-tree` | [LifeTree.vue](../src/pages/LifeTree.vue)：生命树当前织机作品 | 标准 |
| 36 | `/modern-control-course` | [ModernControlCourse.vue](../src/pages/ModernControlCourse.vue) | 标准 |
| 37 | `/markdown-components` | [MarkdownComponents.vue](../src/pages/MarkdownComponents.vue)：Markdown 组件展示 | 标准 |
| 38 | `/precision-physkit` | [PrecisionPhyskit.vue](../src/pages/PrecisionPhyskit.vue) | 标准 |
| 39 | `/cli-tools` | [CliTools.vue](../src/pages/CliTools.vue) | 标准 |
| 40 | `/tzbox` | [TZBox.vue](../src/pages/TZBox.vue) | 标准 |
| 41 | `/ai-frontier` | [AIFrontier.vue](../src/pages/AIFrontier.vue) | 独立 |
| 42 | `/ai-frontier/skills` | [FrontierDocument.vue](../src/pages/FrontierDocument.vue)，`src=/ai-frontier/skills.md` | 独立 |
| 43 | `/ai-frontier/trivia` | [FrontierDocument.vue](../src/pages/FrontierDocument.vue)，`src=/ai-frontier/trivia.md` | 独立 |
| 44 | `/ai-frontier/arena/:arenaId` | [AVIS3Arena.vue](../src/pages/AVIS3Arena.vue) | 独立 |
| 45 | `/:pathMatch(.*)*` | [NotFound.vue](../src/pages/NotFound.vue)：全站兜底 | 标准 |

`/space1/post_it` 是显式兼容路由，不应被当成文章 id。
`/about/site`、`/about/self` 是旧入口别名；真实内容只由 `/about/me` 承担。
当前没有 `/research`、`/academic` 路由，访问时进入全站 NotFound；不要把它们写成已存在的学术页。
`/resource` 与 `/rd` 当前都是真实页面，不是互相重定向。

路由未声明统一的页面标题元信息。
AI Frontier 的四类路由声明 `meta.anchorOffset = 108`；其余路径的 hash 滚动默认偏移为 88。
`FrontierDocument` 的标题、眉题、说明和 Markdown 地址由两个路由的静态 `props` 提供。

## 4. 外壳、过渡与滚动

### 4.1 App 的显示路径

[App.vue](../src/App.vue) 同时保留 `route.path` 和 `displayedPath`。

- `route.path` 决定当前 RouterView 组件和 key。
- `displayedPath` 在新组件的 `@vue:mounted` 中更新，用于 Header/Footer 的独立页面判断。
- 这让旧视图离场时继续保留对应外壳，避免刚发起导航就换掉旧页面的头尾。
- 独立页面判断只包含 `/portal`、`/music-box`、三个 AI Frontier 固定路径，以及 `/ai-frontier/arena/` 前缀。
- 新增独立页面时只加路由不会自动隐藏全站外壳，需要同时核对这段判断。

首页直接渲染，不使用 `route-flow`；其他页面采用 `mode="out-in"`。
离场时最多保留一个视口的高度，进入非 fixed 页面时临时设置 `min-height`，完成后恢复原值。
过渡期间 Footer 使用 `visibility: hidden` 保留位置。
减少动态效果偏好下 CSS 过渡被关闭。

组件 key 是 `route.path`，不是 `fullPath`。
因此文章 id 等 path 变化会重建页面；仅 query/hash 变化不会因此重建。
需要响应 query 的页面应显式监听路由，而不是依赖重新挂载。

### 4.2 Router 的滚动协议

`markRouteViewReady(path)` 由 App 在视图挂载、下一次 Vue 更新后报告。
Router 的 `scrollBehavior` 等待这个信号，避免对已经离场的页面执行滚动。

当前规则依次为：

1. 新导航释放旧的等待；若等待期间又发生导航，旧导航不继续控制位置。
2. 浏览器历史返回提供 `savedPosition` 时，优先恢复该位置。
3. 恢复前观察文档高度；高度足够后稳定 100ms，最长等待 1500ms。
4. 等待期间 wheel、touchstart、pointerdown 或 keydown 会取消恢复，尊重用户输入。
5. 有新 hash 时定位元素；同页换 hash 且允许动画才使用 smooth，跨页使用 instant。
6. 同页、相同 hash 的 query 变化保持阅读位置。
7. 其余导航滚到左上角。

等待历史位置时临时关闭浏览器滚动锚定，完成后恢复。
这套协议特别照顾随记列表和异步文章正文，不保证任何任意延迟内容都能恢复到像素一致位置。
页面自己的章节导航（例如 AboutMe 的 `goTo`）还会自行设置焦点和滚动，需要一起核对。

## 5. 导航入口与同步点

[Header.vue](../src/components/Header.vue) 的 `navItems` 目前有六组主导航：
随记、说说、资源链接、代码与项目、赛博会客厅、关于。
每组的 `to` 是入口，`match` 是高亮范围；匹配允许对应子路径前缀。
例如 `/space4` 归入随记，`/about/me` 因前缀归入关于。

Header 为 sticky；下滚会收起，上滚、回到顶部或路由变化时恢复。
移动菜单 Teleport 到 body，打开时保存并锁定 html/body 的 overflow，关闭或卸载时恢复。
Escape 关闭菜单并将焦点送回切换按钮。

[Footer.vue](../src/components/Footer.vue) 用 `footerColumns` 维护分组链接，提供 GitHub 和邮箱复制。
`/space4` 额外应用 `site-footer--space4` 样式。
[Home.vue](../src/pages/Home.vue) 的 `homeSections` 维护首页入口卡片，不直接读取 Header 导航配置。

新增或改名栏目时，按实际需要同步核对：

- Router 路径、页面组件、兼容入口。
- Header 的入口和高亮范围。
- Footer 分组与 Home 入口。
- About 的目录入口和内容星图。
- Portal 应用/搜索入口、SEO 生成数据及现有路由测试清单。

这些入口目前没有单一注册表；不要假设修改其中一处会自动更新其余位置。
当前 Header 的代码项目高亮列表没有列入 `/paper-switch-brush`、`/cli-tools`、`/tzbox`；这属于待确认的导航覆盖差异，而非本文新增的约定。

## 6. 全局样式与页面视觉

[src/style.css](../src/style.css) 使用 Catppuccin Mocha 变量设置深色基底。
根变量包括背景、文字、surface、强调色、状态色、间距及动效节奏。
基础正文使用 Inter / Helvetica Neue / Segoe UI 回退；具体页面还会覆盖字体。
样式通过外部 CSS 导入 Catppuccin、Pacifico、霞鹜文楷、Fira Code 和数学/衬线字体；离线或外部资源不可用时要检查回退效果。

关键全局行为：

- `box-sizing: border-box`、横向 overflow 裁切、focus-visible 轮廓和细滚动条。
- html 的 `scroll-padding-top` 取头部高度加 1rem。
- `--site-header-height` 默认 72px，在宽度不大于 860px 时为 68px。
- 860px 以下补充媒体最大宽度、表单字号、内容最小宽度和移动端换行规则。
- 粗指针下按钮、summary 等交互目标有 2.75rem 最小高度。
- 减少动态效果偏好会缩短全局 CSS 动画与过渡；Canvas/WebGL 仍由各模块自行处理。

断点不是全站统一集合：Header 主要用 860px；Footer 使用 980/680/420px；
About 目录用宽度 980px 或高度 640px 切模式；AboutMe 有 760px 和多组矮屏适配；
星间有 640px 与矮屏规则；Space4 的默认交互模式还受 760px 和粗指针影响。
修改断点前应先确认页面自己的布局和脚本媒体查询，不能只改全局 CSS。

主要视觉家族：

| 页面 | 当前实现 |
| --- | --- |
| Home | 六段背景图入口，首次进入条件下的单词开场动画 |
| Space1 | 深色编辑式随记列表、精选轨道、搜索、分页与说说 ticker |
| Talk | 标题/全文搜索及键盘快捷键，三/二/一列说说卡片瀑布流；卡片日期、标题永久链接、复制回退与返回列表顶部，正文复用共享 Markdown 渲染 |
| Space2/Space3 | 网格、终端/显示器意象的友链与会客厅 |
| Space4 | 固定视口 Canvas 星空、3D CSS 星环、年份年表 |
| About | 打字机介绍与目录两屏；紧凑布局改用原生滚动 |
| AboutMe / StellarField | 黑色 sticky 星场舞台叠加原生文档叙事 |
| LifeTree | Canvas 织机、纹理、线头记忆与可选声音 |

这些页面有自己的 scoped 样式；调整通用 `.card` 不一定会影响它们。

## 7. About 与视觉特效开发入口

### 7.1 关于目录与六章叙事

[About.vue](../src/pages/About.vue) 负责 `/about`。
宽屏且高度足够时锁定文档滚动，通过滚轮、纵向触摸和方向键/PageUp/PageDown/空格切换两屏。
交互元素内的键盘输入会被放过；过渡锁约 520ms。
紧凑媒体查询匹配时恢复原生文档滚动；卸载恢复原 overflow。
这一页不拥有六形态星场。

[AboutMe.vue](../src/pages/AboutMe.vue) 负责 `/about/me`，章节如下：

| 章节 id | 主题 | 星场稳定形态 |
| --- | --- | --- |
| `about-space` | 这个空间 | 交错星轨，progress 0 |
| `about-names` | 名字偏航 | 智慧表情，0.2 |
| `about-purpose` | 想法落点 | 立体指针，0.4 |
| `about-wander` | 随处逛逛 | 四簇内容星图，0.6 |
| `about-making` | 一边搭建 | 与键盘对齐的星光猫，0.8 |
| `about-curiosity` | 未完待续 | 开放交错星带，1 |

进度按相邻章节距离计算，每章占五分之一形态区间，不按整页总高度简单均分。
`activeChapter` 使用舞台内的阅读线判断；键盘显示进度单独计算。
因此调高键盘章节高度时，不应直接重写星场进度映射。

章节索引会先聚焦 section，再按 sticky 舞台顶部滚动。
舞台、仪表层和正文分属不同层级；改 pointer-events 或 z-index 时，需要检查目录链接、键盘和底部控制是否仍能操作。
页面挂载时设置标题，卸载恢复；滚动/resize 使用 RAF 合并，ResizeObserver 负责重新测量。

### 7.2 内容星图与数据

[ConstellationDirectory.vue](../src/components/about/ConstellationDirectory.vue) 提供四类原生链接：
`notes → /space1`、`talk → /talk`、`resources → /rd`、`projects → /code`。
星场只发出归一化锚点；DOM 组件根据 Canvas 相对舞台的位置换算像素坐标。
矮屏、锚点不可见或不在舞台范围时，会使用普通链接布局。

预览数据分别读取 `/articles.json`、`/resource/programming.json`、`/code_proj.json`。
随记和资源取首项；项目优先挑选 `category === 'toy'`，再回退首项。
说说使用固定简介，不在本组件请求说说正文。
请求失败保留默认内容，卸载中止请求。
栏目图标打开栏目，预览标题可打开具体文章、资源或项目，两者职责不同。

### 7.3 共享星场、猫与键盘边界

共享组件为 [effects/StellarField.vue](../src/components/effects/StellarField.vue)，
完整接口见 [stellar-field/README.md](../src/components/effects/stellar-field/README.md)。

- [shapes.js](../src/components/effects/stellar-field/shapes.js)：基础粒子数量、数字 6、指针、花结与散点。
- [about-shapes.js](../src/components/effects/stellar-field/about-shapes.js)：About 六形态、DOM 锚点投影、猫姿态与屏幕映射。
- [renderer.js](../src/components/effects/stellar-field/renderer.js)：WebGL2、着色器、输入、帧调度和 GPU 资源。
- [StackKeyboard.vue](../src/components/about/StackKeyboard.vue)：18 个真实按钮、技术说明、输入状态和原生降级。
- [stack-keyboard/renderer.js](../src/components/about/stack-keyboard/renderer.js)：键盘独立 WebGL2 渲染器、键帽运动与点击投影。
- [stack-keyboard/geometry.js](../src/components/about/stack-keyboard/geometry.js)：键盘相机、按键命中区域、猫的坐标框。
- [cat-geometry.js](../src/components/about/stack-keyboard/cat-geometry.js)：由内嵌参考帧建立猫点云；当前隐藏脱离身体的敲击线条。
- [bongo-reference.js](../src/components/about/stack-keyboard/bongo-reference.js)：猫的内嵌双帧参考数据，不是键盘渲染代码。

AboutMe 获取键盘的 `getCatFrame()`，传给星场 `catFrame`；
星场发出 `cat-strike('left'|'right')`，页面转给键盘 `tapByCat(side)`。
猫不是额外贴在星场上的第二个 Canvas。
第五章关闭星场直接旋转并暂停自主漂移，通过独立 `catMotion` 维持猫敲击；全局暂停按钮仍会停猫和键盘运动。
减少动态效果偏好下保留静态形态与原生操作。

### 7.4 Space4 与 LifeTree

[Space4.vue](../src/pages/Space4.vue) 和 Space1 读取同一个 `/articles.json`，但采用不同浏览方式。
Space4 搜索标题、简介、作者和日期，排序后分成星环或年份年表。
默认减少动态效果、窄屏或粗指针进入时间航线；运行时变紧凑会从星环切到年表，恢复宽屏不会强制切回。
`OrbitCarousel` 提供拖拽、滚轮、方向键和 Enter；`ChronologyAtlas` 使用原生文章链接。
`StarfieldBackground` 是 Canvas 2D 固定视口背景，独立管理像素预算和标签页可见性，与共享 StellarField 无代码复用关系。

[LifeTree.vue](../src/pages/LifeTree.vue) 当前是织机作品，不能按旧“天气树”界面介绍。
它组合双 Canvas 2D、纬线选择、拨动/打结、卷布记录和用户主动开启的 Web Audio。
运行时读取 `/life-tree/autonomy.json`，失败保留内置 loom。
本地存储键为 `life-tree-loom-v4`，并包含读取 `life-tree-weather-v3` 旧记忆的逻辑。
卸载时中止数据请求、清理观察器/事件/计时器/RAF、保存记忆并关闭音频。
视觉与状态逻辑主要集中于该页面大文件；具体行为和验证入口见交互功能文档。

## 8. 旧文件的当前接入状态

源码保留了一些旧页面，但“文件还在”不等于“仍有入口”。

| 文件 | 本次判断依据 |
| --- | --- |
| [HomeOld.vue](../src/pages/HomeOld.vue) | Router 使用 Home；src/scripts/tests/.github 未检出该文件名引用 |
| [PostIt_old.vue](../src/pages/PostIt_old.vue) | Router 的 PostIt 导入/路由已注释，旧随记路径重定向 Talk；未检出文件名引用 |
| [Notes_old.vue](../src/pages/Notes_old.vue) | Router 的 Notes 导入/路由已注释；未检出文件名引用 |
| [YsyDataAnalysisHelper_old.vue](../src/pages/YsyDataAnalysisHelper_old.vue) | 当前路径引用无 old 后缀版本；未检出旧文件名引用 |
| [YsyModernControlCourseWork.vue](../src/pages/YsyModernControlCourseWork.vue) | 当前课程路由引用 ModernControlCourse；未检出旧文件名引用 |

以上是限定于现有入口和名称引用的静态判断，不是删除授权，也不是完整运行时可达性证明。
保留文件可能用于历史参考；清理应作为单独任务，先确认意图和内容边界。

## 9. 常见改动定位与验证

| 需求 | 首先定位 | 关联检查 |
| --- | --- | --- |
| 新增/迁移页面 | Router + 对应 pages 组件 | App 外壳、导航、SEO、路由清单、旧链接 |
| 调整全站头尾 | Header / Footer / style.css | 独立页面、移动菜单、sticky 高度、长文返回 |
| 改首页入口 | Home 的 homeSections | Header/Footer 是否同义、图片和移动版 |
| 改随记信息 | 内容编辑指南列出的 JSON/Markdown | Space1、Space4、About 预览及正文 |
| 改说说 | public/post-it、Vite 插件、postItEntries 与 TalkCard | 自动收录/过滤、真实时间顺序、卡内锚点、搜索、瀑布流、复制回退和 Space1 ticker |
| 改 About 文案 | AboutMe 的章节及 About 入口 | 章节 id、索引、SEO/Portal 名称 |
| 改星场形态 | shapes / about-shapes | 两种 profile、WebGL 与 SVG、减少动态效果 |
| 改猫与键盘对齐 | keyboard geometry + AboutMe + about-shapes | 两套渲染器正常/降级的组合、窄屏和矮屏 |
| 改 Space4 视觉 | Space4 + space4 组件 | 搜索、默认模式、触控、离开视口的帧停止 |
| 改织机 | LifeTree + autonomy 数据 | 本地记忆、静音、减少动画、离开页面清理 |

现有测试入口包括 [routes.spec.js](../tests/e2e/routes.spec.js)、
[special-routes.spec.js](../tests/e2e/special-routes.spec.js)、
[about-story.spec.js](../tests/e2e/about-story.spec.js)、
[article-typography.spec.js](../tests/e2e/article-typography.spec.js)、
[talk.spec.js](../tests/e2e/talk.spec.js) 及功能专项测试。
`route-manifest.js` 是测试路由清单，不能替代 Router 成为运行时路由源。

About 测试现有源码覆盖完整章节、入口/别名、目录预览、键盘、减少动态效果、WebGL 不可用及 Portal 搜索等场景。
是否在某次任务实际通过，应以该次运行记录为准；本文未执行构建或浏览器测试。
功能修改的验证建议与已执行结果需分开记录，勿把检查清单写成完成证据。
