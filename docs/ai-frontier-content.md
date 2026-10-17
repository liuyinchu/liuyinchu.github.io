# AI Frontier 内容维护

AI Frontier 公开 AVIS3 的项目介绍、正式评测规则、已核验成绩、AI 前沿札记、Skill 收集和 AI Trivia。页面使用独立 NASA-punk 浅色主题、响应式排版与 Markdown 目录；不读取或改变主站主题。

## 页面与文件入口

- 总览：`/ai-frontier`
- Skill 收集：`/ai-frontier/skills`，正文 `public/ai-frontier/skills.md`
- AI Trivia：`/ai-frontier/trivia`，正文 `public/ai-frontier/trivia.md`
- AVIS3 详情：`/ai-frontier/arena/avis3`
- AVIS3 数据：`public/ai-frontier/avis3.json`
- AVIS3 说明：`public/ai-frontier/arena/avis3.md`
- 频谱索引：`public/ai-frontier/arena/avis3/spectra/manifest.json`
- 频谱数据：`public/ai-frontier/arena/avis3/spectra/contestant-N/round-XX.json`

旧演示榜单、虚构数据、S/A/B/C/D 档位和站内札记样刊已移除。

## Skill 收集与 AI Trivia

两页共用 Frontier 的独立导航、报告页标题与 Markdown 阅读样式。Skill 收集从说说的同名章节迁入；AI Trivia 的 Markdown 初始为空，可直接编辑。标题与简介在路由中维护，正文文件不需要 front matter，也不必重复页面标题。正文按运行时请求读取，更新后刷新页面即可查看。

## AI 前沿札记

札记在独立仓库 [liuyinchu/deepsight-ai-today](https://github.com/liuyinchu/deepsight-ai-today) 维护。浏览器进入页面时直接读取：

`https://raw.githubusercontent.com/liuyinchu/deepsight-ai-today/main/index.md`

使用 `cache: 'no-cache'`，没有轮询。更新 Markdown 不需要重新构建网站；已经打开的页面通过刷新或失败后的重试读取正文。GitHub Raw 可能有短时缓存，应以实际展示的正文确认更新。

内容采用普通 Markdown，无 front matter，所有来源链接和图片使用完整 HTTPS URL。渲染器不按远端 Markdown 地址解析相对资源。写作规范由札记仓库维护。

初始内容是诚实的编辑说明，不是真实新闻。札记的内容状态与真实 AVIS3 结果分别维护，不对真实成绩添加演示标签。

## AVIS3 数据合同

根对象只维护一组评测版本下各选手最新的完整正式验收结果：

| 字段 | 含义 |
| --- | --- |
| `evaluationVersion` | 评测条件版本，当前为 `avis3-v1` |
| `release` | 发布版本，当前为 `0.1.0-candidate.3` |
| `evaluatedAt` / `verifiedAt` | 最近完整验收日期 / 数据复核日期 |
| `timezone` | 日期口径，当前为 `Asia/Shanghai` |
| `publishedAt` | 网页发布时间；未确定时保留为 `null`，不冒用验收日期 |
| `scoring` | 评价名称、单位、方向、理论上限和正式轮数 |
| `contestants` | `id`、`model`、`harness`；编号只作身份标识 |
| `results` | 已核验成绩；没有可公布数据时为空数组 |

`scoring` 包含 `label`、`unit`、`higherIsBetter`、`theoreticalMax`、`roundCount`。当前原始积分越高越好，理论上限为 857.375，正式验收为 10 轮。它不是百分制，标准差也不是置信区间。

每条结果包含：

| 字段 | 含义 |
| --- | --- |
| `contestantId` | 对应选手标识 |
| `mean` | 原始积分均值，数值类型 |
| `std` | 样本标准差，ddof = 1；未知时为 `null` |
| `rounds` / `failures` | 正式轮数 / 失败轮数 |
| `roundScores` | 按轮次排列的原始积分数组；未公布时为 `null` |

页面上的均值、标准差和逐轮分数统一展示四位小数，title 提供精确原始值；JSON 保留完整数值，排序、并列判断和柱长继续使用原始值。只在原始均值完全相等时并列，名次采用 1、1、3。并列时选手 ID 的字典序只决定显示顺序，不以标准差、失败数或编号破同分。

每组必须完整终态后才能替换旧成绩，即使新均值更低也保留最新完整结果，不保留历史最高分。基础设施中断时继续保留上一完整结果。不同条件使用新版本，不混排不同版本。

当前结果是经内部主进程复核并获准公开的快照，最近完整验收为 2026-10-09，复核日期为 2026-10-11。各选手同编号轮次不是相同随机场景，逐轮展示不构成配对比较。

## 更新与发布核对

1. 只收录获准公开且经过核验的模型名称、运行环境、规则与成绩。
2. 同步 JSON 与说明 Markdown，核对选手、均值、样本标准差和逐轮记录。未知字段不补零或估算。
3. AVIS3 在内部 HPC 私有部署，不添加公开仓库、公开参赛入口、内部地址或原始运行产物下载地址。
4. 不把当前提交表现写成普遍 AI 产品排名，不将仿真写成实物验证，不宣称绝无过拟合。开发预算、人工帮助和完整开发过程未统一审计。
5. 频谱诊断不参与积分评分，未核验的图像不作为性能证据。
6. 检查总览和详情的完整数值、排序、量程、目录与主题，并验证桌面和手机排版。
7. 运行构建、Markdown 检查和相关 E2E。札记测试拦截固定 raw URL，使用 fixture，不依赖当天线上正文。

## 真实频谱快照

2026-10-12 从竞技场主进程归档接收 2026-10-09 的 30 轮正式验收频谱，与当前榜单绑定的运行、提交和逐轮分数一致。每轮保留 10,000 个正频率点（0.01–100 Hz），以及受控真值和同初态、同扰动零控制基线各三路位移等效 ASD；未重采样、四舍五入、平滑或归一化。

每份 JSON 的 `frequency_hz[j]` 对应 `controlled_asd[j][i]` 与 `baseline_asd[j][i]`，两类数组为 10000×3，`channels` 为 y1/y2/y3。单位 Hz 与 m/√Hz；不要把通道改成未经标定的 XYZ 方向。元数据保留评测/发布版本、选手、轮次、分数、运行/提交标识与 Welch 参数。

查看器按选手与轮次加载单份数据，使用双对数坐标绘制真实点值。每通道纵轴由两条曲线正值范围决定，最低值乘 0.9、最高值乘 1.1 留白；切换轮次时纵轴可以改变，不能仅凭图中线条高度作跨图比较。不同选手的同编号轮次并非同一场景。

当前快照不包含 DC、其他频段、相位、互谱、相干性、置信区间或原始时域轨迹。ASD 是赛后诊断，不进入正式积分评分，也不向参测规则提供真值。发布前应将 30 份文件的逐轮分数与 `avis3.json` 对照，核对频率范围、数组方向、单位和源绑定，并检查桌面/手机的切换、图例、刻度、错误重试与数据加载竞态。
