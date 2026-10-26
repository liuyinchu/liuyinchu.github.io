# AI Frontier 内容维护

核对日期：2026-10-26。源码基线：`c1c3b96`。
本文保留公开数据合同与发布边界；下文日期、数量和版本是当前快照，不是长期常量。
常规站点编辑见 [内容编辑指南](SITE_EDITING_GUIDE.md)，文档入口见 [README](README.md)。

AI Frontier 公开 AVIS3 的项目介绍、正式评测规则、已核验成绩、AI 前沿札记、Skill 收集和 AI Trivia。
页面使用独立 NASA-punk 浅色主题、响应式排版与 Markdown 目录；不读取或改变主站主题。

## 1. 页面、内容与代码入口

| 页面 / 资料 | 数据源 | 实现 |
| --- | --- | --- |
| `/ai-frontier` 总览与札记 | AVIS3 JSON、远端 index.md | [AIFrontier.vue](../src/pages/AIFrontier.vue) |
| `/ai-frontier/skills` | [skills.md](../public/ai-frontier/skills.md) | [FrontierDocument.vue](../src/pages/FrontierDocument.vue) |
| `/ai-frontier/trivia` | [trivia.md](../public/ai-frontier/trivia.md) | FrontierDocument.vue |
| `/ai-frontier/arena/avis3` | [avis3.json](../public/ai-frontier/avis3.json)、[avis3.md](../public/ai-frontier/arena/avis3.md) | [AVIS3Arena.vue](../src/pages/AVIS3Arena.vue) |
| 频谱发布清单 | [spectra/manifest.json](../public/ai-frontier/arena/avis3/spectra/manifest.json) | 归档与发布核对使用 |
| 单轮频谱 | `public/ai-frontier/arena/avis3/spectra/contestant-N/round-XX.json` | [Avis3Spectra.vue](../src/components/frontier/Avis3Spectra.vue) |

旧演示榜单、虚构数据、S/A/B/C/D 档位和站内札记样刊已移除。
当前真实成绩不应标成演示数据；札记的内容状态也不决定 AVIS3 的核验状态。

公共外壳在 [FrontierShell.vue](../src/components/frontier/FrontierShell.vue)，使用局部 `data-theme="light"`。
[useAvis3Data.js](../src/components/frontier/useAvis3Data.js) 负责成绩加载、排序与四位小数格式，
同时定义远端札记的仓库和 Raw URL。
[FrontierContents.vue](../src/components/frontier/FrontierContents.vue) 接收正文生成的目录。

## 2. Skill 收集与 AI Trivia

两页的标题、眉题、简介和正文地址在 [路由](../src/router/index.js) 的 props 中维护。
正文不需要 front matter，也不必重复页面标题。
修改本仓库 Markdown 后，需要让静态托管部署新文件；页面刷新后会重新请求已部署正文。

本次快照中，两份正文都已有实际内容，AI Trivia 已不是空白初始页。
Skill 收集沿用 Markdown 列表：`- [名称](完整链接)：说明`。
FrontierDocument 按行首这个链接列表格式统计 Skill 数量，并为顶层列表提供专用卡片排版；
改变列表结构时要核对计数与显示，不要只看 Markdown 是否能解析。

两页可复用共享富组件语法，例如 badge、tip、alert。
具体支持范围见 [内容编辑指南](SITE_EDITING_GUIDE.md) 与 [组件手册](../public/markdown/pages/markdown-components.md)。
“初始为空”仅是历史状态，不能作为当前维护说明。

## 3. AI 前沿札记的远端来源

札记在独立仓库 [liuyinchu/deepsight-ai-today](https://github.com/liuyinchu/deepsight-ai-today) 维护。
浏览器进入总览时，直接读取：

`https://raw.githubusercontent.com/liuyinchu/deepsight-ai-today/main/index.md`

该 URL 来自 useAvis3Data.js 的 `NOTES_SOURCE`，不是站点打包时复制的本地样刊。
请求使用 `cache: 'no-cache'`，没有定时轮询；更新远端 Markdown 不需要重新构建本站。
已经打开的页面通过刷新，或加载失败后的“重新加载”按钮再取正文。
GitHub Raw 可能有短时缓存，应以实际显示的正文确认更新。

内容采用普通 Markdown，无 front matter；所有来源链接和图片使用完整 HTTPS URL。
渲染器不按远端 Markdown 地址解析相对资源，`./image.png` 不会自动指向远端仓库。
写作规范由札记仓库维护，本仓库文档不把任何初始编辑说明当作当前线上内容。
本轮没有请求线上 Raw 正文，因此也不声称当天札记已经更新或当前网络一定可达。

## 4. Markdown 加载、共享渲染与错误处理

[FrontierMarkdown.vue](../src/components/frontier/FrontierMarkdown.vue) 是加载与样式包装：
它先取得正文，再将文本传给 [MarkdownViewer.vue](../src/components/MarkdownViewer.vue)，使用 `variant="frontier"`。
代码高亮、复制、任务列表、脚注、富组件、MathJax 和 Mermaid 复用共享链路，
Frontier 局部样式负责浅色阅读体验，并单独调整行内公式溢出。
修改共享解析器可能影响随记、通用页与 Frontier，验证时应覆盖相关使用场景。

当前加载合同：

- 显式传入 content 时直接使用文本；未传 content 且有 src 时发起请求。
- src / content 改变或用户重试时创建 AbortController，并清理上一请求。
- 请求携带 signal 与 `cache: 'no-cache'`；HTTP 非成功状态进入错误态。
- 响应 Content-Type 含 `text/html` 时拒绝正文，防止把站点 HTML 回退页作为 Markdown 展示。
- 中止的请求不会写回已切换页面；失败会清空目录并显示“重新加载”按钮。
- 成功正文通过共享渲染器的事件提供目录和原始文本。

HTML 检查针对响应头，不应描述为完整正文格式校验。
MathJax 仍需从 jsDelivr 运行时加载；Mermaid 由共享渲染器按需导入。
主站文章的 Enhanced 偏好不会在 Frontier 启用；浅色主题也不意味着使用另一套 Markdown 解析器。

成绩数据由 useAvis3Data 请求 `/ai-frontier/avis3.json`，检查 contestants / results 为数组，
出错时由页面提供成绩重试按钮；这不是完整的发布数据校验器。
字段一致性、数值与公开范围仍需发布者按下面合同核对。

## 5. AVIS3 数据合同

根对象只维护同一组评测版本下，各选手**最新的完整正式验收结果**：

| 字段 | 含义 |
| --- | --- |
| `evaluationVersion` | 评测条件版本，快照为 `avis3-v1` |
| `release` | 发布版本，快照为 `0.1.0-candidate.3` |
| `evaluatedAt` / `verifiedAt` | 最近完整验收日期 / 数据复核日期 |
| `timezone` | 日期口径，快照为 `Asia/Shanghai` |
| `publishedAt` | 网页发布时间；未确定时保留 null，不冒用验收日期 |
| `scoring` | 评价名称、单位、方向、理论上限和正式轮数 |
| `contestants` | id、model、harness；编号只作身份标识 |
| `results` | 已核验成绩；没有可公布数据时为空数组 |

scoring 包含 `label`、`unit`、`higherIsBetter`、`theoreticalMax`、`roundCount`。
当前原始积分越高越好，理论上限为 857.375，正式验收为 10 轮。
它不是百分制，样本标准差也不是置信区间。

每条结果包含：

| 字段 | 含义 |
| --- | --- |
| `contestantId` | 对应 contestants 中的 id |
| `mean` | 原始积分均值，数值类型 |
| `std` | 样本标准差，ddof = 1；未知时为 null |
| `rounds` / `failures` | 正式轮数 / 失败轮数 |
| `roundScores` | 按轮次排列的原始积分数组；未公布时为 null |

均值、标准差和逐轮积分展示四位小数，title 提供原始值；JSON 保留完整数值。
排序、并列判断和柱长使用原始值，不根据已四舍五入的文本排序。
只在原始均值完全相等时并列，名次采用 1、1、3。
同分时 ID 字典序只决定显示顺序，不以标准差、失败数或编号破同分。
实现见 [Avis3Leaderboard.vue](../src/components/frontier/Avis3Leaderboard.vue)。

每组必须取得完整终态后才能替换旧成绩；即使新均值更低，也保留最新完整结果，不保留历史最高分。
基础设施中断或取消、未完成整组时，继续保留上一完整结果。
评测条件改变使用新版本，不混排不同版本。
规则崩溃、非法输出或数值发散导致的失败轮次按正式规则记为 -1，并参与完整组统计；
不能把尚未完成的基础设施中断补造成十轮规则失败。

当前公开结果来自经内部主进程复核并获准公开的快照：
最近完整验收为 2026-10-09，复核为 2026-10-11。
三个模型与运行工具组合各有 10 轮，失败轮数均为 0。
各选手同编号轮次不是相同随机场景，逐轮展示不构成配对比较。

## 6. 真实频谱快照与运行时选图

2026-10-12 从竞技场主进程归档接收了 2026-10-09 的 30 轮正式验收频谱，
与当前榜单绑定的运行、提交和逐轮分数一致。
来源与处理记录见 [manifest](../public/ai-frontier/arena/avis3/spectra/manifest.json)，
计算与读图说明见 [avis3.md](../public/ai-frontier/arena/avis3.md)。

每轮保留 10,000 个正频率点（0.01–100 Hz），受控真值和同初态、同扰动零控制基线各有三路位移等效 ASD。
导出未重采样、四舍五入、平滑或归一化。
`frequency_hz[j]` 对应 `controlled_asd[j][i]` 和 `baseline_asd[j][i]`；
两类数组为 10000×3，`channels` 为 y1 / y2 / y3，布局为 frequency_major。
单位为 Hz 与 m/√Hz，不要把通道改成未经标定的 XYZ 方向。
公开元数据保留评测 / 发布版本、选手、轮次、分数、运行 / 提交标识与 Welch 参数。

manifest 是**发布与来源清单**，不参与浏览器运行时选图。
Avis3Spectra 根据榜单 results 生成选手选项，轮数优先取该选手 roundScores 长度，
再回退到 scoring.roundCount 或默认值。
文件路径直接由 contestantId 与补成两位的轮次拼接：
`/ai-frontier/arena/avis3/spectra/{contestantId}/round-{XX}.json`。
因此只更新 manifest 不会改变页面选项，也不能修复错误的数据文件路径。

查看器切换时只请求当前一份 JSON，使用 AbortController 取消旧请求，
核对响应的 `contestant_id` 与 `round_index`，失败时允许“重新加载频谱”。
它从真实数组生成 SVG 路径，不使用截图或示意曲线替代数据。
[avis3SpectraPlot.js](../src/components/frontier/avis3SpectraPlot.js) 使用全部导出频率点，
检查 y1/y2/y3、数组长度、频率范围和正的有限 ASD 值，再绘制双对数坐标。

每通道纵轴按该通道两条曲线的实际正值范围决定：最低值乘 0.9，最高值乘 1.1 留白。
切换轮次、选手或通道，纵轴可以改变；不能只凭画面中的线条高度作跨图绝对比较。
不同选手的同编号轮次不是同一场景。
优先读同一轮、同一通道的受控 / 基线关系，再结合刻度和多轮结果解释。

当前快照不包含 DC、其他频段、相位、互谱、相干性、置信区间或原始时域轨迹。
ASD 是赛后诊断，不进入正式积分评分，也不向参测规则提供真值。
频谱来自真实速度输出的位移等效换算，不等同于直接观测到的位移轨迹或实物验证。

## 7. 更新流程与发布边界

### 本仓库内容

1. 编辑 skills / trivia Markdown；标题与简介变化时同步路由 props。
2. 修改 AVIS3 时先取得获准公开的完整终态数据，再同步 avis3.json 与 avis3.md。
3. 核对 contestantId、模型与 harness、均值、样本标准差、轮数、失败数、逐轮顺序和日期口径。
4. 若有新频谱，按同一来源绑定更新每轮 JSON 与 manifest，核对清单分数和榜单逐轮分数。
5. 保留完整数值，未知字段不补零、不估算；publishedAt 未确定时继续为 null。
6. 把获准公开的静态文件随网站部署，再在实际路径验证。

### 远端札记

在 deepsight-ai-today 更新 index.md，并按该仓库规范核验来源与完整 HTTPS 链接。
本站无需重建，但应刷新实际总览确认内容、目录、外链与图片。
更换远端来源地址属于本站代码修改，应同步 NOTES_SOURCE 和拦截该地址的相关测试。

### 不改变的公开边界

- AVIS3 在内部 HPC 私有部署，不添加公开仓库、公开参赛入口、内部地址或原始运行产物下载地址。
- 仅收录获准公开且经过核验的模型名称、运行环境、规则、成绩与诊断快照。
- 不将当前提交表现写成普遍 AI 产品排名，不将仿真写成实物验证，不宣称绝无过拟合。
- 开发预算、人工帮助与完整开发过程未统一审计，不补写未经验证的公平性结论。
- 未核验的图像不作为性能证据，频谱诊断不参与积分评分。

## 8. 发布前验证

静态核对：JSON 结构、身份映射、完整版本、日期、均值 / 标准差与逐轮记录一致。
频谱核对：当前快照的 30 份文件与榜单对应，频率范围、数组方向、单位、来源绑定一致；
运行时的浅检查不能替代这一步，也不需要新增散列校验。

浏览器核对：总览和详情完整数值、排序与并列、柱状量程、目录、浅色主题，
以及桌面 / 手机的选手轮次切换、图例刻度、错误重试和快速切换时的加载竞态。
同时核对 Skill 计数、Trivia 内容、远端札记实际请求、公式和富组件。
若未访问真实 Raw 地址，应明确保留“线上可用性未验证”。

按 [开发与发布](DEVELOPMENT_AND_DEPLOYMENT.md) 执行适用的构建、Markdown 检查和相关 E2E。
现有测试入口为 [frontier.spec.js](../tests/e2e/frontier.spec.js)；
[frontier-fixture.js](../tests/e2e/frontier-fixture.js) 拦截固定 Raw URL，
[avis3-spectra-fixture.js](../tests/e2e/avis3-spectra-fixture.js) 提供频谱测试数据。
这些测试能验证受控内容下的页面行为，**fixture 通过不代表线上 Raw 可访问、当天正文正确或真实谱快照已经逐文件核验**。

本轮为文档与源码核对，未运行构建、Markdown 检查或 E2E。
相关结构见 [架构](ARCHITECTURE.md)，交互契约见 [INTERACTIVE_FEATURES](INTERACTIVE_FEATURES.md)，
问题与待复现项见 [KNOWN_ISSUES](KNOWN_ISSUES.md)，项目背景见 [PROJECT_CONTEXT](PROJECT_CONTEXT.md)。
