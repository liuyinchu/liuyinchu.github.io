# AI Frontier 内容维护

核对日期：2026-10-26。源码基线：`c1c3b96`。
AVIS3 正式榜与 Preview 归档说明于 2026-11-08 更新。
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
| `/ai-frontier/arena/avis3` 正式榜 | [evaluation-1108.json](../public/ai-frontier/evaluation-1108/evaluation-1108.json)、[methodology.md](../public/ai-frontier/evaluation-1108/methodology.md) | [AVIS3Arena.vue](../src/pages/AVIS3Arena.vue) |
| `/ai-frontier/arena/avis3-preview` 预览归档 | [avis3-preview.json](../public/ai-frontier/archive/avis3-preview.json)、[avis3-preview.md](../public/ai-frontier/archive/avis3-preview.md) | AVIS3Arena.vue |
| 正式频谱清单与曲线 | `public/ai-frontier/evaluation-1108/spectra/` | [Avis3Spectra.vue](../src/components/frontier/Avis3Spectra.vue) |
| Preview 频谱发布清单与单轮谱 | [spectra/manifest.json](../public/ai-frontier/arena/avis3/spectra/manifest.json)、`spectra/contestant-N/round-XX.json` | 旧路径保留，供 Preview 查看器使用 |

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

成绩数据由 useAvis3Data 默认请求 `/ai-frontier/evaluation-1108/evaluation-1108.json`，
Preview 请求 `/ai-frontier/archive/avis3-preview.json`。正式数据经适配后检查 contestants / results 为数组，
出错时由页面提供成绩重试按钮；这不是完整的发布数据校验器。
字段一致性、数值与公开范围仍需发布者按下面合同核对。

## 5. AVIS3 数据合同

正式入口沿用 `/ai-frontier/arena/avis3`，当前冻结批次为 Evaluation-1108。
主记录 [evaluation-1108.json](../public/ai-frontier/evaluation-1108/evaluation-1108.json) 保存完整精度数据；
useAvis3Data 的 `officialArena` 将原始 `entrants` 转成页面使用的 contestants / results。

| 字段 | 含义 |
| --- | --- |
| `evaluation_id` | 冻结批次，当前为 `Evaluation-1108` |
| `arena_version` / `release` | 评测条件 / 发布版本，当前为 `avis3-plus-v1` / `0.2.0-candidate.1` |
| `evaluation_date` / `timezone` | 评测日期 / 日期口径，当前为 2026-11-08 / Asia/Shanghai |
| `participant_count` / `distinct_model_count` | 14 个独立提交条目 / 12 个不同模型 |
| `total_rounds` / `failed_rounds` | 280 轮完成 / 0 轮规则失败 |
| `protocol` | 每条目 20 轮、每轮 1000 秒、10 kHz，以及共享私有场景等协议 |
| `scoring` | 原始积分、单位、统计口径和理论上限 |
| `entrants` | 身份、模型、harness、控制器摘要、自述、完整成绩与频谱路径 |

所有条目使用同一组 20 个私有场景，第 i 轮可以按相同场景对照。
01 / 14 号 GPT-6 Astra 与 07 / 08 号 DeepSeek 保留独立编号、成绩和排名，不合并或取最高分作为模型汇总。
总览显示前 5 名；完整榜显示 14 个条目，可展开 20 轮积分、控制器说明和提交自述。
自述原文反映提交时的历史状态，其中开发测试成绩不作为本次正式成绩。

当前原始积分越高越好，单位为积分秒（s），理论上限为 866.2936695331011。
`mean` 为 20 轮算术平均，`std` 为样本标准差（ddof = 1），`rounds` 按 index 保存逐轮 score。
均值、标准差和逐轮积分展示四位小数，title 提供原始值；JSON 保留完整数值。
排序、并列判断和柱长使用原始值，不根据已四舍五入的文本排序。
只在原始均值完全相等时并列，名次采用 1、1、3。
同分时 ID 字典序只决定显示顺序，不以标准差、失败数或编号破同分。
实现见 [Avis3Leaderboard.vue](../src/components/frontier/Avis3Leaderboard.vue)。

最大 3 轮对话属于评测协议；最高可用思考档位属于组织者提供的配置。
这些说明不构成对全部开发过程、人工帮助或配置执行的完整独立审计。
公开评测说明由源方 METHOD.md 同步为 [methodology.md](../public/ai-frontier/evaluation-1108/methodology.md)。

源数据只读同步，Evaluation-1108 的原始记录保持冻结。
后续批次应建立独立记录并注明版本与日期，不能直接改写这份冻结记录或混排不同条件。
规则崩溃、非法输出或数值发散导致的失败轮次按正式规则记为 -1，并参与完整组统计；
基础设施中断或取消按未完成处理，不补造完整轮次成绩。

### Preview 归档

旧入口内容归档到 `/ai-frontier/arena/avis3-preview`，数据与说明分别为
[avis3-preview.json](../public/ai-frontier/archive/avis3-preview.json) 和
[avis3-preview.md](../public/ai-frontier/archive/avis3-preview.md)。
它保留 `avis3-v1` / `0.1.0-candidate.3` 的三个参赛组合、各 10 轮结果与原始公开元数据；
最近完整验收为 2026-10-09，复核为 2026-10-11，失败轮数均为 0，原积分上限为 857.375。
Preview 同编号轮次使用独立随机场景，不能按正式批次的共享场景解释。
Preview 与 Plus 条件不同，成绩分别展示。

## 6. 真实频谱快照与运行时选图

正式谱位于 `public/ai-frontier/evaluation-1108/spectra/`。
共 32 份 JSON，包含 14 条目的 20 轮功率平均与统一第 1 轮曲线（共 28 份）、
两份对应的共享 baseline、frequency.json 和 index.json。
每份曲线的 `asd_by_channel` 为 3×10000，通道为 y1 / y2 / y3；
frequency.json 的 `values[j]` 对应每个通道的第 j 点。
频率保留全部 10,000 个正频率点（0.01–100 Hz），幅值保留 8 位有效数字，无抽稀。
单位为 Hz 与 m/√Hz，不要把通道改成未经标定的 XYZ 方向。

20 轮功率平均使用 `sqrt(mean(ASD²))`，受控曲线和无控制基线分别计算。
统一第 1 轮为所有条目的相同私有场景；它用于单轮对照，不能代表全部 20 轮。
频谱导出精度不影响完整精度积分成绩，ASD 诊断不进入正式积分评分。

Avis3Spectra 根据条目的 spectra 字段选择 pooled / round_01 曲线，
并读取共享频率与对应基线；共享文件在当前查看器实例内缓存。
页面打开频谱区后才挂载查看器，切换时按需请求当前曲线，
使用 AbortController 取消旧请求，检查条目、批次和选择模式，失败时允许“重新加载频谱”。
运行时把通道优先数组转为绘图器使用的频率优先数组，从真实数据生成 SVG。
[avis3SpectraPlot.js](../src/components/frontier/avis3SpectraPlot.js) 使用全部导出频率点，
检查 y1/y2/y3、数组长度、频率范围和正的有限 ASD 值，再绘制双对数坐标。
index 用于发布清单核对，运行时曲线路径取自成绩记录中的 spectra 字段。

每通道纵轴按该通道两条曲线的实际正值范围决定：最低值乘 0.9，最高值乘 1.1 留白。
切换模式、选手或通道，纵轴可以改变；不能只凭画面中的线条高度作跨图绝对比较。
优先读同一模式、同一通道的受控 / 基线关系，再结合刻度和多轮结果解释。
当前快照不包含 DC、其他频段、相位、互谱、相干性、置信区间或原始时域轨迹。
频谱来自真实速度输出的位移等效换算，不等同于直接观测到的位移轨迹或实物验证。

### Preview 频谱

旧 30 份单轮频谱继续保留在 `public/ai-frontier/arena/avis3/spectra/`，
来源与处理记录见 [manifest](../public/ai-frontier/arena/avis3/spectra/manifest.json)。
Preview 查看器按 contestantId 和两位轮次拼接 `{contestantId}/round-{XX}.json`，
轮数优先取 roundScores 长度，再回退到 scoring.roundCount。
旧数组为 frequency_major，`frequency_hz[j]` 对应
`controlled_asd[j][i]` 和 `baseline_asd[j][i]`，两类数组均为 10000×3。
旧导出保留原始精度，未重采样、四舍五入、平滑或归一化。
旧 manifest 不参与运行时选图；Preview 同编号轮次仍不能作配对比较。

## 7. 更新流程与发布边界

### 本仓库内容

1. 编辑 skills / trivia Markdown；标题与简介变化时同步路由 props。
2. 修改 AVIS3 时先取得获准公开的冻结批次，按源方记录只读同步 evaluation-1108.json 与 methodology.md；后续批次另建记录。
3. 核对 contestantId、模型与 harness、均值、样本标准差、轮数、失败数、逐轮顺序和日期口径。
4. 正式频谱同步 28 份条目曲线、两份基线、frequency 与 index，核对条目、批次、选择模式和数组方向；Preview 保留旧 30 份频谱与 manifest。
5. 积分保留完整数值，正式频谱幅值保留源方 8 位有效数字；未知字段不补零、不估算，归档中的 publishedAt 未确定时继续为 null。
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
频谱核对：正式快照的 32 份 JSON 与 14 个条目对应，另核对 Preview 的旧 30 份单轮谱；
频率范围、数组方向、单位、功率平均方式和来源绑定一致；
运行时的浅检查不能替代这一步，也不需要新增散列校验。

浏览器核对：总览和详情完整数值、排序与并列、柱状量程、目录、浅色主题，
以及桌面 / 手机的正式榜 14 行展开、20 轮分数、控制器与历史自述、频谱两种模式切换、图例刻度、错误重试和快速切换时的加载竞态。
核对总览前 5 名与完整榜一致，Preview 的 3 个组合、10 轮成绩及旧频谱仍可访问。
同时核对 Skill 计数、Trivia 内容、远端札记实际请求、公式和富组件。
若未访问真实 Raw 地址，应明确保留“线上可用性未验证”。

按 [开发与发布](DEVELOPMENT_AND_DEPLOYMENT.md) 执行适用的构建、Markdown 检查和相关 E2E。
正式数据与频谱合同检查见 [avis3-evaluation.test.mjs](../tests/avis3-evaluation.test.mjs)，按 Node 测试入口执行。
页面测试入口为 [frontier.spec.js](../tests/e2e/frontier.spec.js)；
[frontier-fixture.js](../tests/e2e/frontier-fixture.js) 拦截固定 Raw URL，
[avis3-spectra-fixture.js](../tests/e2e/avis3-spectra-fixture.js) 提供频谱测试数据。
这些测试能验证受控内容下的页面行为，**fixture 通过不代表线上 Raw 可访问、当天正文正确或真实谱快照已经逐文件核验**。

本轮为文档与源码核对，未运行构建、Markdown 检查或 E2E。
相关结构见 [架构](ARCHITECTURE.md)，交互契约见 [INTERACTIVE_FEATURES](INTERACTIVE_FEATURES.md)，
问题与待复现项见 [KNOWN_ISSUES](KNOWN_ISSUES.md)，项目背景见 [PROJECT_CONTEXT](PROJECT_CONTEXT.md)。
