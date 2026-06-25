# LiuYinChu'Space 编辑与维护说明

本文记录当前站点常用内容的编辑入口、数据边界和新增流程。除非要改交互或视觉结构，优先改 JSON/Markdown 数据源，不直接改页面组件。

## 随记

- 列表页：`src/pages/Space1.vue`
- 文章页：`src/pages/ArticleView.vue`
- 文章目录：`public/articles.json`
- 正文文件：`public/markdown/{id}.md`

新增文章时：

1. 在 `public/articles.json` 增加一项，字段包括 `id`、`title`、`author`、`date`、`desc`、`image`。
2. 新建 `public/markdown/{id}.md`，其中 `{id}` 必须与 `articles.json` 中的 `id` 完全一致。
3. 访问路径自动变为 `/space1/{id}`。

当前随记仍通过 `articles.json` 添加新文章。文章正文使用统一的 `MarkdownViewer.vue` 渲染，文章页会根据 Markdown 自动生成目录和阅读时间。

## 资源页面

- 资源目录页：`src/pages/ResourceDirectory.vue`
- 单类资源页壳：`src/pages/ResourceLiterature.vue`、`src/pages/ResourceProgramming.vue` 等
- 单类资源渲染器：`src/components/ResourceDetailPage.vue`
- 资源数据：`public/resource/*.json`

新增资源时，优先编辑对应分类的 JSON：

- `public/resource/literature.json`
- `public/resource/programming.json`
- `public/resource/computer.json`
- `public/resource/materials.json`
- `public/resource/tools.json`
- `public/resource/files.json`

条目字段：

- `idx`：排序编号
- `name`：资源名
- `url`：外部链接，可为空
- `intro`：主要说明，支持 Markdown
- `add`：补充说明，支持 Markdown，可为空

资源目录页和各分类页都会读取这些 JSON。只要分类不变，新增资源不需要改 Vue。

## 统一 Markdown 页面

统一渲染器是 `src/components/MarkdownViewer.vue`。它目前支持：

- 数学公式
- Mermaid
- 代码高亮与复制按钮
- 表格、引用、任务列表
- 标题锚点与目录生成
- 图片、外链、新增容器块

通用页面建议采用“一份 Vue 壳 + 一份 Markdown”的方式：

1. 在 `public/markdown/pages/` 新增 Markdown 文件。
2. 新建或复用一个 Vue 页面壳：

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

3. 在 `src/router/index.js` 注册路由。
4. 如需在代码项目页、页脚或 Portal 中出现，再同步更新对应 JSON 或导航配置。

`BlockMarkdown.vue` 目前只是兼容层，内部也转调 `MarkdownViewer.vue`。已注册展示的项目页面应优先使用 `MarkdownViewer.vue + public/markdown/pages/*.md`。

## 友链 / 网络邻居

- 页面：`src/pages/Space2.vue`
- 卡片组件：`src/components/FriendCard.vue`
- 数据源：`public/friends.json`

新增友链时编辑 `public/friends.json`：

```json
{
  "name": "站点名称",
  "link": "https://example.com",
  "desc": "一句简短说明"
}
```

当前网络邻居仍通过 JSON 更新，不需要改 Vue。

## 代码与项目

- 页面：`src/pages/Code.vue`
- 数据源：`public/code_proj.json`
- 页脚入口：`src/components/Footer.vue`

新增项目时编辑 `public/code_proj.json`：

- `name`：项目名
- `desc`：项目说明
- `homepage`：站内或站外项目主页，可为空
- `repo`：GitHub 或其他仓库链接，可为空
- `category`：`code`、`project` 或 `toy`

如果这个项目应该出现在页脚，则还需要手动更新 `src/components/Footer.vue` 的“代码与项目”分组。

## 个人介绍页面

- 页面：`src/pages/AboutIntro.vue`
- 入口：`/about/self`
- 父级中枢：`src/pages/About.vue`

当前个人介绍内容直接写在 `AboutIntro.vue` 的 `chapters` 数组中。每一页由一个 chapter 对象控制：

- `index`
- `eyebrow`
- `title`
- `seal`
- `image`
- `imageAlt`
- `accent`
- `paragraphs`

如果只是改自我介绍文案或替换图片，改 `chapters` 即可。若要改翻页机制、C4D 新中式视觉或页面结构，再改 Vue 模板和样式。

## 学术主页与我的学术

学术相关页面分两层：

- `/research`：学术主页，偏完整综述
- `/academic`：我的学术，偏学术名片 / 组会汇报式 deck

学术主页：

- 页面壳：`src/pages/Research.vue`
- 内容源：`public/markdown/pages/research.md`
- `research.md` 中的 `name.svg` 入口会跳到 `/academic`

我的学术：

- 页面与交互：`src/pages/Academic.vue`
- 基础信息：`public/data/academic_brief.json`
- 当前工作：`public/data/highlight_work.md`
- 出版成果：`public/data/publications.json`
- 经历：`public/data/experience.json`
- 会议：`public/data/conferences.json`
- 签名图片：`public/fig/signature-shuyun-yang.png`

后续修改原则：

- 改名字、标题、研究方向、联系信息：优先改 `academic_brief.json`
- 改“当前工作”正文：改 `highlight_work.md`
- 改论文、经历、会议：改对应 JSON
- 改翻页、签名动画、PPT 风格：改 `Academic.vue`

## Portal 搜索

- 页面：`src/pages/Portal.vue`
- curated 静态索引：`public/data/search-index.json`
- Dock：`public/data/portal-dock.json`
- 音乐：`public/data/portal-music.json`

Portal 的 Spotlight 搜索现在会动态合并：

- 核心站内入口
- `public/data/search-index.json`
- `public/articles.json`
- `public/code_proj.json`
- `public/resource/*.json`
- `public/friends.json`

因此新增随记、资源、项目、友链后，Portal 搜索通常会自动命中。`search-index.json` 只用于维护核心入口、别名、关键词和特殊页面。

## 页眉页脚

- 页眉：`src/components/Header.vue`
- 页脚：`src/components/Footer.vue`

页脚不是完全数据驱动。新增重要站内入口后，如果希望它固定出现在页脚，需要手动加入 `Footer.vue` 的 `footerColumns`。
