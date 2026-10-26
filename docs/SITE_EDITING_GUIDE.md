# 内容编辑与维护指南

核对日期：2026-10-26。源码基线：`c1c3b96`。
本文说明当前内容入口与运行时合同；数量和版本均是本次快照，不能当作永久限制。
文档索引见 [README](README.md)，整体关系见 [架构说明](ARCHITECTURE.md)。

## 1. 先选择内容入口

普通内容优先修改 JSON 或 Markdown；新增路由、分类、固定导航或特殊交互才涉及 Vue。
下列路径相对于仓库根目录，浏览器路径不包含 `public`。

| 内容 | 可编辑数据源 | 页面 / 渲染入口 | 访问入口 |
| --- | --- | --- | --- |
| 随记元数据 | [articles.json](../public/articles.json) | [Space1](../src/pages/Space1.vue) | `/space1` |
| 随记正文 | `public/markdown/{id}.md` | [ArticleView](../src/pages/ArticleView.vue) | `/space1/{id}` |
| 人工精选 | [featured-articles.json](../public/featured-articles.json) | Space1 的精选栏 | `/space1` |
| 星穹文库 | 同一份 articles.json | [Space4](../src/pages/Space4.vue) | `/space4` |
| 说说 | [post_it.md](../public/markdown/post_it.md) | [Talk](../src/pages/Talk.vue)、[TalkTicker](../src/components/journal/TalkTicker.vue) | `/talk` |
| 资源旧页 | [resource.md](../public/markdown/pages/resource.md) | [Resource](../src/pages/Resource.vue) | `/resource` |
| 六类资源 | `public/resource/*.json` | [目录](../src/pages/ResourceDirectory.vue)、[分类详情](../src/components/ResourceDetailPage.vue) | `/rd` 及分类路径 |
| 代码与项目 | [code_proj.json](../public/code_proj.json) | [Code](../src/pages/Code.vue) | `/code` |
| 网络邻居 | [friends.json](../public/friends.json) | [Space2](../src/pages/Space2.vue) | `/space2` |
| 通用说明页 | `public/markdown/pages/*.md` | Vue 薄壳 + MarkdownViewer | 由路由指定 |
| 版权说明 | [credit.md](../public/markdown/pages/credit.md) | [Credit](../src/pages/Credit.vue) | `/credit` |
| 关于介绍 | [AboutMe.vue](../src/pages/AboutMe.vue) 中的正文 | AboutMe | `/about/me` |
| Portal 搜索 / 链接 / 音乐 | `public/data/*.json`，见第 8 节 | [Portal](../src/pages/Portal.vue) | `/portal` |
| AI Frontier | `public/ai-frontier/` 与远端札记 | Frontier 专用页面与共享渲染器 | `/ai-frontier` |

AI Frontier 的数据、来源和发布限制单列在 [内容合同](ai-frontier-content.md)；不要用普通文章流程替代它。

## 2. 随记：元数据、正文与封面

### 新增文章

1. 在 `public/articles.json` 数组中增加一项，保留现有条目。
2. 创建同名正文 `public/markdown/{id}.md`。
3. 将封面放到已有静态图片目录，`image` 填浏览器可访问路径。
4. 如需人工精选，再编辑 `public/featured-articles.json`。
5. 验证列表、正文、星穹文库与 Portal 搜索。

元数据只需使用实际读取的字段：

```json
{
  "id": "example_note",
  "title": "一篇新的随记",
  "author": "作者名",
  "date": "2026-10-26",
  "desc": "用于文章卡片和搜索的简短说明。",
  "image": "/bg/article-covers/example_note.jpg"
}
```

`id` 是稳定身份，应唯一，并与 Markdown 文件名的大小写完全一致。
文章页将路由参数转成字符串，再在索引中匹配 `String(article.id)`。
建议沿用现有简单文件名，不把目录分隔符、查询参数或完整 URL 放进 ID。

正文路径由 ArticleView **固定生成**为 `/markdown/{id}.md`。
在 JSON 里增加 `file` 或 `src` 不能改变它；文章也不会因单独新增 Markdown 而自动进入索引。
修改 ID 意味着修改公开文章路径，需要同步正文文件名、精选引用和手写站内链接。

`date` 沿用 `YYYY-MM-DD`，便于时间航线按字符串排序和提取年份。
`desc` 是卡片与搜索摘要，不是从正文自动提取的首段。
`image` 同时供文章卡片和文章页背景使用；列表没有为错误封面提供内容作者可配置的替代字段。
正文不解析 front matter；标题、作者、日期来自 JSON，不从正文反向更新。

### 排序、分页与搜索

- Space1 保留 JSON 数组顺序，不按日期重新排序；需要置顶时调整条目位置。
- 每页固定 7 篇；过滤后再分页，输入搜索词会回到第一页。
- 搜索对 `title`、`desc`、`author`、`date` 做去首尾空格、忽略大小写的子串匹配。
- 搜索不读取 Markdown 正文，也不把 ID 作为 Space1 的搜索字段。
- 当前页的大卡片从该页文章中随机选择；它与人工精选栏是两套机制。
- Space4 读取同一份索引，搜索字段相同；时间航线按日期倒序并按年份分组。
- Space4 的星环 / 时间航线只是浏览视图，点击仍进入 `/space1/{id}`。

### 人工精选

`featured-articles.json` 是引用清单，不复制文章标题、封面或正文：

```json
[
  { "id": "example_note", "label": "阅读推荐" }
]
```

精选按清单顺序展示；标签为空时使用“精选”。
无法在文章索引中找到的 ID 会被过滤，不会显示独立占位卡。
新增文章不要求加入精选，也无需为 Space4 新增一份数据。

### 正文加载与增强排版

文章元数据有加载、未找到、错误和重试状态；正文随后交给 MarkdownViewer。
目录来自渲染后带 ID 的 h1–h3，阅读时间由原始 Markdown 计算。
正文请求失败与文章 ID 未被索引是两个不同故障，应分别检查索引和正文 URL。

文章默认使用原版排版；目录控件可切换 Enhanced。
偏好写入当前浏览器的 `article-typography`，切换后刷新页面。
只有 ArticleView 显式传入 `enhanced`；渲染器本身不读取这个偏好。
小屏目录可折叠；没有标题的文章仍保留排版切换入口。
[markdown-enhanced.css](../src/components/markdown-enhanced.css) 是文章专用样式，不应扩散到通用页或 Frontier。
内容作者不需要为 Enhanced 复制或改写正文。

## 3. 说说：用二级标题划分条目

说说正文只有一份：[post_it.md](../public/markdown/post_it.md)。
Talk 读取它、去掉文件开头的一级文档标题，再用 `variant="page"` 和 CJK 字体渲染。
页面横幅标题在 Talk.vue 内维护，不来自 Markdown 的首个标题。

```markdown
# 文件文档标题

## 新的一条说说

先写一段能独立理解的短摘要，再展开正文。

## 下一条说说

另一段内容。
```

Space1 的 TalkTicker 也读取同一份文件，按正文出现顺序生成轮播：
真正的条目起点是行首 `## 标题`，三级标题不会创建新条目。
摘要取该标题下首个可用段落或列表项；代码围栏、图片、分隔线、标题和组件标记会被跳过或清理。
因此不要只写图片而期待轮播自动生成说明；需要摘要时明确写出一段文字。
轮播入口进入 `/talk`，不是为每条说说自动建立独立文章路由。
旧路径 `/space1/post_it` 跳转到 `/talk`。

## 4. 资源：旧说明页与结构化目录并行

两条路径内容独立，不会互相生成：

- `/resource` 使用 `public/markdown/pages/resource.md` 与共享 MarkdownViewer，保留旧版长说明页。
- `/rd` 汇总六份 JSON；分类薄壳复用 ResourceDetailPage。

| JSON | 分类入口 | 薄壳 |
| --- | --- | --- |
| `literature.json` | `/rliterature` | ResourceLiterature.vue |
| `programming.json` | `/rprogramming` | ResourceProgramming.vue |
| `computer.json` | `/rcomputer` | ResourceComputer.vue |
| `materials.json` | `/rmaterials` | ResourceMaterials.vue |
| `tools.json` | `/rtools` | ResourceTools.vue |
| `files.json` | `/rfiles` | ResourceFiles.vue |

各文件位于 `public/resource/`，根结构都是数组：

```json
[
  {
    "idx": 1,
    "name": "资源名称",
    "url": "https://example.com",
    "intro": "主要说明，支持 **Markdown**。",
    "add": null
  }
]
```

`idx` 用于数值升序和条目身份，显示时补至两位；同一分类内应唯一。
`url` 为空时不显示 Open 链接；`add` 可为 `null` 或补充说明字符串。
JSON 字符串中的换行需写作 `\n`，不要直接插入未转义换行。

ResourceDetailPage 自己创建 `MarkdownIt({ html: true, breaks: true, linkify: true })`。
`intro` / `add` 支持普通 Markdown 与 HTML，单个换行也会换行。
这里没有挂载共享渲染器的富组件、脚注扩展、MathJax、Mermaid 或代码复制流程。
需要这些复杂排版时，应放到普通 Markdown 页面并从资源条目链接过去。

目录页搜索只匹配资源名称；分类页搜索名称、主要说明、补充说明和 URL。
两者都按数值 `idx` 排序；目录搜索结果有 URL 才能打开外链。
现有六类中增删条目不需要改 Vue。
新增分类则要同步目录的 `categoryConfig`、详情导航、分类薄壳、路由和 Portal 的 `resourceSearchSources`。

## 5. 项目与网络邻居

### 代码与项目

编辑 [code_proj.json](../public/code_proj.json) 数组：

```json
{
  "name": "项目名称",
  "desc": "项目用途与当前状态。",
  "homepage": "/cli-tools",
  "repo": "https://github.com/example/project",
  "category": "code"
}
```

栏目按 `code`、`project`、`toy` 匹配分类，分别对应代码、项目、巧思；搜索匹配名称和说明。
`homepage` 可以是站内路径或外部 URL；`repo` 是仓库链接，任一为空就不显示对应按钮。
项目卡片不会由 JSON 创建新的 Vue 路由，站内主页必须已注册。
Portal 优先使用 homepage，缺少时使用 repo；两者都为空的项目不会加入 Portal 项目搜索。

### 网络邻居

编辑 [friends.json](../public/friends.json) 数组，顺序即显示顺序：

```json
{
  "name": "站点名称",
  "link": "https://example.com",
  "desc": "一句简短说明"
}
```

FriendCard 用 `new URL(link)` 获取域名，因此应填写完整有效的绝对 URL。
图标由域名服务与回退逻辑获取，没有读取作者自填头像字段。
项目与友链增删通常会自动进入 Portal 的动态索引。
固定页脚分组不会自动更新；需要常驻入口时手改 [Footer.vue](../src/components/Footer.vue) 的 `footerColumns`。
新增站内页面还应按第 8 节维护手工搜索别名与备用入口。

## 6. 通用 Markdown 页面与共享渲染合同

使用“一份 Vue 薄壳 + 一份 Markdown”，可参考 [Credit](../src/pages/Credit.vue)。
正文放到 `public/markdown/pages/example.md`，页面组件示例：

```vue
<script setup>
import MarkdownViewer from '../components/MarkdownViewer.vue'
</script>

<template>
  <main class="markdown-project-page">
    <MarkdownViewer
      src="/markdown/pages/example.md"
      variant="page"
      use-c-j-k
    />
  </main>
</template>
```

然后在 [router/index.js](../src/router/index.js) 导入组件并注册访问路径。
无需为了普通正文复制渲染器；布局、页眉或目录容器仍由 Vue 页面决定。
[BlockMarkdown](../src/components/common/BlockMarkdown.vue) 是兼容包装，内部以 `variant="embed"` 调用同一渲染器。

[MarkdownViewer](../src/components/MarkdownViewer.vue) 的属性与事件：

| 合同 | 当前行为 |
| --- | --- |
| `src` | 运行时请求 Markdown URL |
| `content` | 非空字符串时优先于 src；空字符串不会覆盖非空 src |
| `variant` | 默认 article；page、embed 调整容器布局，frontier 由 Frontier 包装层配色 |
| `useCJK` | Vue 模板写作 `use-c-j-k`，启用正文 CJK 字体类 |
| `enhanced` | 只在 variant 为 article 时启用文章增强样式 |
| `toc-generated` | 返回渲染后 h1–h3 的 level、text、id；页面自行决定是否显示目录 |
| `markdown-loaded` | 返回原始正文，用于阅读时间等页面逻辑 |

普通链接、表格、引用、任务列表、HTML、标题锚点和代码高亮由共享链路处理。
HTTP(S) Markdown 外链增加新窗口和 `noopener noreferrer`；原始 HTML 链接需作者自己写对应属性。
Markdown 图片会生成图注，图注取自 alt；链接包裹的图片也有专门布局。
代码语言有 highlight.js 支持时高亮，否则按普通文本显示；复制按钮有剪贴板与选择文本回退。
页面不从 front matter 生成路由、元数据或标题。

### 富组件

完整演示见站内 `/markdown-components`，源手册见 [markdown-components.md](../public/markdown/pages/markdown-components.md)。
语法实现位于 [markdownComponents.js](../src/utils/markdownComponents.js)。

- 行内：`:name[内容]{属性}`，支持 alert、blur、tip、badge、mark、progress。
- 块级：`::name{属性}` 起始，单独一行 `::` 结束。
- 兼容 `:alert` 开头、`::` 结束；嵌套建议内层增加冒号并使用匹配的结束标记。
- 块级支持 alert、blur、chat、folding、timeline、steps、gallery、columns、link-card、stream-button。
- 代码围栏中的组件示例不会展开；未知组件名不会自动变成 Vue 组件。
- 脚注支持 `[^id]` 引用与 `[^id]: 说明` 定义，可多次引用并返回正文。

```markdown
::alert{type="info" title="维护说明"}
普通 Markdown 可放在组件正文中。
::

::folding{title="详细步骤"}
:::steps
{准备}
先编辑数据源。
{核对}
再打开实际访问路径。
:::
::

::link-card{title="阅读随记" eyebrow="JOTTINGS" href="/space1"}
查看已有文章。
::
```

alert 的类型为 note、info、tip、success、question、warning、danger。
folding 用 title / summary 与 open；blur 用 label；tip 用 tip / text。
badge 的 tone 支持 accent、info、success、warning、danger、muted。
progress 内容按数值限制在 0–100，label 提供说明。
timeline / steps 用独立 `{标签}` 行划分项目；chat 用 `{.名字}`、`{名字}`、`{:系统提示}` 区分消息。
gallery / columns 用 columns（或 cols）配置 2–4 列，窄屏收拢；columns 以标题划分内容区。
link-card / stream-button 使用 title、eyebrow、href，正文作为说明。
两者的 href 只接受 HTTP(S)、mailto、单斜杠站内根路径或锚点；其他相对写法会退回 `#`。

### 公式与 Mermaid

公式优先使用 `$...$`、`$$...$$`。MathJax 配置也列出 `\(...\)`、`\[...\]`，
但当前自动排版入口先检查正文是否含美元符，不能假定只有反斜杠分隔符就一定触发加载。
MathJax 3 从 jsDelivr 运行时加载，启用 ams、autoload、physics 与 lazy；加载依赖浏览器网络。

Mermaid 使用语言为 `mermaid` 的代码围栏，模块按需导入，当前初始化为 dark 主题、loose 安全级别。
语法错误会在图容器中显示失败信息，不会自动修复图。
Frontier 复用该渲染链路，因此内容作者仍应实际核对公式和图在浅色页面中的可读性。

### 路径与链接

静态文件 `public/fig/example.png` 的浏览器地址为 `/fig/example.png`，不写 `/public/...`。
站内跳转使用实际路由，如 `/space1/example_note`；源码文件路径不是浏览器页面路径。
共享渲染器没有以 Markdown 的 src URL 重写相对链接或图片：`./image.png` 由浏览器按当前页面 URL 解析。
因此站内静态资源使用根路径；远端札记的来源和图片使用完整 HTTPS URL。
标题自动 ID 可能受重复标题、文字和插件规则影响，发布前点击真实锚点核对，不只凭标题猜写。
docs 中的维护文档链接则使用相对文件路径，例如 `[架构](ARCHITECTURE.md)`。

## 7. 关于与固定导航

[About](../src/pages/About.vue) 是介绍中枢；[AboutMe](../src/pages/AboutMe.vue) 直接保存介绍正文与布局。
修改昵称、建站原因、兴趣、介绍段落和技术描述，应编辑 AboutMe.vue，而不是寻找不存在的介绍 Markdown。
版权说明另由 `public/markdown/pages/credit.md` 维护。
`/about/site`、`/about/self` 是保留 query / hash 的客户端跳转，统一进入 `/about/me`。
已移除的 `/research`、`/academic` 没有恢复入口，继续由全站 404 处理。
新增或调整固定入口时同步路由、Footer 和 Portal；不能仅改可见标题而留下旧地址。

## 8. Portal：搜索、Launchpad 与音乐

| 数据源 / 代码 | 维护内容 |
| --- | --- |
| [search-index.json](../public/data/search-index.json) | 手工入口、别名、关键词与排序权重 |
| [portal-dock.json](../public/data/portal-dock.json) | Launchpad 的分组链接，文件名不代表顶部 Dock 小应用注册表 |
| [portal-music.json](../public/data/portal-music.json) | 音乐曲目、音频地址与封面 |
| [portal/apps.js](../src/portal/apps.js) | 顶部 Dock 小应用组件、图标、窗口尺寸与 props |
| Portal.vue | quickLinks、默认 / 备用搜索条目、资源分类搜索源等 |

搜索加载时合并备用条目、手工索引、文章、项目、友链和六类资源；不抓取 Markdown 全文。
空搜索显示默认核心入口；多个搜索词要求每个词都命中，按权重排序后最多显示 12 项。
手工条目可写 name、path、category、hint、keywords、rank；外链可写 external。
同一规范化名称与路径去重，先出现的备用条目优先；同名同路径的静态项不会覆盖备用关键词。
需要为核心入口修改关键词时，应同时核对 Portal.vue 的备用项。

Launchpad 示例：

```json
{ "name": "Tools", "color": "#94e2d5", "links": [
  { "name": "示例工具", "url": "https://example.com" }
] }
```

音乐示例：

```json
{ "name": "曲名", "artist": "作者", "url": "/music/example.m4a", "cover": "/music/cover/example.jpg" }
```

两份配置根结构均为数组。核对音频和封面真实存在；JSON 不会自动下载媒体。
Portal 先加载音乐和链接分组，再加载搜索索引；排查搜索缺失时也应检查这两份配置是否请求成功。
动态内容通常无需手工重建搜索索引；新特殊页面、别名和固定入口仍需同步手工配置。

## 9. 发布内容的最小核对

1. 检查 JSON 语法、数组结构和实际字段；不要把只写在文档里的新字段当成功能。
2. 核对文章 ID、正文文件名、封面路径、精选引用、资源 idx 与站内路由。
3. 在实际页面检查目录、图片、公式、Mermaid、代码复制、富组件和外链。
4. 检查搜索范围、分页、空结果与加载错误；桌面和窄屏各看一次。
5. 有固定入口变动时同步 Footer、Portal 备用项和手工索引。
6. 按 [开发与发布](DEVELOPMENT_AND_DEPLOYMENT.md) 选择必要的内容检查、构建和相关 E2E，并记录实际结果。

这份指南基于源码和少量正文样本核对，不能替代浏览器验收或证明外部链接持续可用。
项目背景见 [PROJECT_CONTEXT](PROJECT_CONTEXT.md)，交互行为见 [INTERACTIVE_FEATURES](INTERACTIVE_FEATURES.md)，已确认限制与待验证问题见 [KNOWN_ISSUES](KNOWN_ISSUES.md)。
