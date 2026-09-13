# AI 前沿内容维护

AI 前沿把动态信息与榜单资料分开维护。日常编辑以 Markdown 和 JSON 为主；新增 benchmark 不需要为它新建 Vue 页面或单独注册路由。

总览地址：`/ai-frontier`。详情地址：`/ai-frontier/benchmarks/<id>`。主站的“代码与项目”已提供入口。

## 文件入口

- `public/ai-frontier/news.md`：信息区的唯一 Markdown 内容源。更新观察、新闻与编辑说明只需改这里。
- `public/ai-frontier/benchmarks.json`：榜单目录、模型、分数与档位。
- `public/ai-frontier/benchmarks/<id>.md`：某项 benchmark 的介绍、方法与完整说明。
- 本文档：内容约定与新增流程。

当前内容全部是演示：3 项 benchmark、每项 6 个虚构模型，模型名以 `DEMO` 开头，提供方以“虚构研究室”开头。分数为手工编写的展示数据，没有执行任何评测，也不构成真实或最新排名。`updatedAt` 表示内容更新日期，不是评测运行时间。

## JSON 契约

根对象固定包含：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `edition` | string | 内容期号，当前为 `"001"`，保留前导零 |
| `updatedAt` | string | `YYYY-MM-DD` 格式的更新日期 |
| `demo` | boolean | 当前为 `true`，明确标识虚构演示 |
| `benchmarks` | array | 按页面展示顺序维护的榜单 |

每项 benchmark 包含：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `id` | string | 唯一、稳定的标识，与详情文件名对应 |
| `name` / `shortName` | string | 完整名称与简短名称 |
| `category` | string | 任务分类 |
| `description` | string | 一至两句说明 |
| `version` | string | 评测或演示版本 |
| `scoreLabel` / `unit` | string | 分数名称与单位 |
| `maxScore` | number | 展示量程上限；当前全部为 `100` |
| `higherIsBetter` | boolean | 比较方向；当前全部为 `true` |
| `markdown` | string | 以 `/ai-frontier/benchmarks/` 开头的站内 Markdown 路径 |
| `rankings` | array | 已按表现从好到差排好的模型数据 |

每个模型包含 `id`、`name`、`provider`、`score`、`tier`。`score` 必须是数值，不能写成 `"96.2分"`；单位放在 benchmark 的 `unit` 中。同一虚构模型跨榜复用相同 ID，便于辨认。

## 分数方向与档位

当前三个演示榜全部使用百分制，**分数越高越好**：`higherIsBetter: true`，rankings 按 score 降序排列。页面也会按该方向排序。

若后续收录耗时、误差等**数值越低越好**的指标，应使用 `higherIsBetter: false`，将 rankings 按 score 升序排列，并在详情里写明方向与单位。不要仅把数组倒序而保留错误的方向标记；修改后需检查页面的排名和图形表达是否一致。

档位是作者提供的独立标签，不等于分数排序，也不应由读者自行猜测：

| tier | 展示标签 |
| --- | --- |
| `S` | 夯 |
| `A` | 顶级 |
| `B` | 人上人 |
| `C` | NPC |
| `D` | 拉完了 |

本演示手工采用 S ≥ 90、A ≥ 80、B ≥ 70、C ≥ 60、D < 60 的分档，并显式写入每条数据；这不是所有真实评测的统一标准。低值更好的指标需要另行定义档位，不能照搬这组阈值。

## 更新信息页

1. 编辑 `news.md`，使用标题、短段落、来源链接与必要的提示块。
2. 把事件日期与页面编辑日期区分开；涉及排名时写明榜单版本与适用范围。
3. 正式发布前移除相应的编辑占位文字。不要把演示数据或待证实消息改写成已发生的事实。

榜单 JSON 与信息 Markdown 没有自动互相改写：如果某次更新同时影响两处，就分别编辑并核对。

## 新增或更新 benchmark

1. 选取新的唯一 ID，例如 `new-task-demo`；已有 ID 尽量保持稳定。
2. 在 `benchmarks.json` 的 benchmarks 数组中增加完整对象，或修改已有对象。填写比较方向、量程与有序排名。
3. 新建 `public/ai-frontier/benchmarks/<id>.md`，并把 JSON 的 markdown 指向 `/ai-frontier/benchmarks/<id>.md`。
4. 详情至少包括介绍、方法流程、分数表，以及演示声明或可核验的真实数据来源。模型名称、顺序、分数、单位和档位须与 JSON 一致。
5. 更新 edition / updatedAt，并通过页面检查列表入口、详情正文与排序。新增数据项无需改页面代码。

详情 Markdown 可使用本站已有的 `:::note`、`::alert{type="info" title="标题"}`、`::folding{title="展开说明"}`、代码围栏与普通表格。折叠和 alert 以同数量的冒号结束。优先复用现有语法，不在内容文件中引入新的脚本。

## 发布前的最小核对

- JSON 能正常解析，各 benchmark ID 唯一，模型 ID 在单榜内唯一。
- 每个 markdown 路径都有对应文件，标题与内容相符。
- score 为数值，排序遵循 higherIsBetter，tier 只使用 S/A/B/C/D。
- JSON 与详情表格保持一致；只有演示数据时保留 `demo: true` 及显著的虚构声明。
- 只有替换为可核验数据、补齐方法与来源并清理所有演示声明后，才考虑将整份数据标为非演示；不要把真假数据混在 `demo: false` 的总声明下。
- 在桌面与窄屏各检查一次信息区、榜单表格与详情折叠块。
