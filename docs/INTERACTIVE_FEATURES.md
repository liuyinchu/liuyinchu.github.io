# 交互模块开发说明

- 核对日期：2026-10-26。
- 代码基线：`main`，`c1c3b96`。
- 本文依据源码静态核对；未启动页面、运行测试、构建或调用外部服务。
- 本文覆盖交互状态、数据约定和资源生命周期；全站结构见 [ARCHITECTURE.md](ARCHITECTURE.md)，内容编辑见 [SITE_EDITING_GUIDE.md](SITE_EDITING_GUIDE.md)。
- 文档入口见 [README.md](README.md)；构建与测试命令以 [DEVELOPMENT_AND_DEPLOYMENT.md](DEVELOPMENT_AND_DEPLOYMENT.md) 为准。
- 已知限制统一汇总到 [KNOWN_ISSUES.md](KNOWN_ISSUES.md)；本文的建议用例不表示已经通过。

## 1. 模块定位与依赖地图

| 模块 | 实现入口 | 状态与依赖 |
| --- | --- | --- |
| Portal 工作台 | [Portal.vue](../src/pages/Portal.vue) | 注册应用、窗口模型、Spotlight、Launchpad、Dock、玻璃渲染 |
| Portal 应用注册 | [apps.js](../src/portal/apps.js) | Calendar、ToDoList、Weather、PortalMusic；每个应用单实例 |
| 窗口状态与几何 | [windowModel.mjs](../src/portal/windowModel.mjs) | 无 DOM 的 reducer、布局、序列化与恢复 |
| 日历与提醒事项 | [Calendar.vue](../src/components/Calendar.vue)、[ToDoList.vue](../src/components/ToDoList.vue) | 本地存储加 window 自定义事件联动 |
| 天气 | [Weather.vue](../src/components/Weather.vue)、[weather](../src/weather/) | 城市与时区、三段天气请求、独立加载/错误状态 |
| Portal 音乐播放器 | [PortalMusic.vue](../src/components/portal/PortalMusic.vue) | APlayer 和 Portal 曲目数据 |
| MusicBox 创作工坊 | [MusicBox.vue](../src/pages/MusicBox.vue)、[music-box](../src/components/music-box/) | 物理模拟、曲谱调度、Web Audio 合成、编辑历史 |
| LifeTree 无手织机 | [LifeTree.vue](../src/pages/LifeTree.vue) | Canvas 自主织布、拨弦、记忆继承；当前不是树或天气仪表盘 |
| 记忆配对与 2048 | [CyberMatch.vue](../src/pages/CyberMatch.vue)、[LYC2048.vue](../src/pages/LYC2048.vue) | 本地游戏逻辑；配对纪录持久化，2048 局面仅驻留内存 |
| Paper Switch Brush | [PaperSwitchBrush.vue](../src/pages/PaperSwitchBrush.vue) | 外部每日论文、单卡翻页、按数据日期收藏 |
| 学术绘图辅助 | [AcademicGuide.vue](../src/pages/AcademicGuide.vue) | 纯前端尺寸换算与配色复制 |
| 访客中心 | [VisitorCenter.vue](../src/pages/VisitorCenter.vue) | 第三方 IP 定位、本地世界地图、SVG 地球仪 |
| 控制课程 | [ModernControlCourse.vue](../src/pages/ModernControlCourse.vue) | 双语 Markdown、页内主题、目录跟随、页面环境恢复 |

Portal Music 与独立 MusicBox 是两个产品入口：前者播放现成音频，后者通过碰撞和曲谱生成声音。
About 页的键盘猫和相关背景机制见 [ARCHITECTURE.md](ARCHITECTURE.md)，不在本文重复展开。

## 2. Portal：注册、窗口与启动入口

### 2.1 注册表是应用边界

[apps.js](../src/portal/apps.js) 导出 `portalApps`，Portal 把它赋给 `topApps`。
当前四个 id 为 `todo`、`music`、`weather`、`calendar`。
每条注册项含 `id/label/title/icon/component/windowClass/shellClass/defaultSize/minSize`。
可选 `props(context)` 将工作台数据映射到组件属性；Music 使用 `musicTracks` 和 `loadingData`。
默认尺寸/最小尺寸分别为：

| id | 默认宽 × 高 | 最小宽 × 高 |
| --- | --- | --- |
| todo | 600 × 480 | 340 × 320 |
| music | 700 × 420 | 420 × 280 |
| weather | 720 × 640 | 320 × 320 |
| calendar | 490 × 488 | 320 × 300 |

`map` 和 `dock` 分别表示 Spotlight、Launchpad 覆盖层，不进入普通窗口注册和持久化模型。
新增普通应用应进入注册表，避免把局部业务状态塞进 Portal 的窗口状态。

### 2.2 窗口状态和 reducer 合同

[windowModel.mjs](../src/portal/windowModel.mjs) 的工作区状态为：
`windows[id] = { open, minimized, maximized, rect: { x, y, width, height } }`，加 `order` 和 `focusedId`。
`rect` 始终表示未最大化时的桌面几何；最大化展示由 Portal 计算，不覆盖这份还原坐标。
`order` 从后向前寻找可见窗口来恢复焦点，聚焦操作将窗口移到数组末尾。

| action.type | 主要行为 |
| --- | --- |
| open | 打开或还原已有实例，取消最小化并置顶 |
| focus | 仅把已打开、未最小化的窗口置顶 |
| minimize / restore | 保留 open；隐藏或恢复窗口，并结算焦点 |
| close | 清除 open/minimized/maximized，从 order 删除，保留普通 rect |
| toggleMaximize | 仅切换可见窗口的最大化状态 |
| setRect | 检查有效矩形，再按工作区与应用最小尺寸约束 |
| fit | 所有应用矩形适配当前可用工作区 |
| tile | 对可见窗口寻找容纳最小尺寸与 16px 间隔的网格 |
| resetLayout | 恢复居中并按注册顺序错开 24px 的默认位置，退出最大化 |

reducer 复制输入状态与 rect，不直接修改传入对象。
平铺算法遍历列数，比较网格与应用默认宽高比的偏离；空间不足时不可平铺。
`canTileWorkspace` 与实际平铺共用同一规划逻辑，菜单禁用条件应继续使用该函数。

### 2.3 几何、指针与窄屏

Portal 的可用区域扣除顶部菜单、底部 Dock 和边缘留白，坐标基于桌面根元素布局。
拖动起点用 `getBoundingClientRect` 减根元素边界，再加根元素 scrollLeft/scrollTop。
`moveRect` 限制整体矩形；`resizeRect` 固定对边，只移动指定方向边缘。
小视口允许可用区域覆盖应用最小尺寸，避免窗口被最小尺寸挤出工作区。
指针操作使用 pointer capture，并在 window 上临时监听 move/up/cancel。
拖动中的 `setRect` 不持久化；结束时处理 pointerup 的最后坐标、移除监听、释放捕获并保存。
右下角缩放还提供方向键操作：默认 10px，Shift 为 40px。
切换布局、关闭/最小化/最大化及卸载前都会结束当前指针操作。
窄屏判断为宽度不超过 1100px，或不超过 1366px 且无悬停、粗指针。
窄屏保留普通桌面 rect，禁用拖动、缩放、平铺和最大化入口，使用紧凑展示。
首次进入桌面或桌面缩小时执行 fit；回到尺寸未变的已知桌面保留 rect。
视口适配后用 180ms 定时器保存，修改这些规则应同时检查触屏横竖屏与桌面恢复。

### 2.4 持久化与组件生存期

工作区保存在 `portal.workspace.v1`，JSON 为 `{ version: 1, windows, order, focusedId }`。
恢复仅接受 version 1；未知应用被忽略，非法矩形使用默认值，order 去重并补齐已打开应用。
`preserveRects` 用于紧凑布局恢复，避免手机加载时改写桌面几何。
存储读取失败回退到默认工作区；工作区 hydration 完成后才开始保存。
窗口壳同时使用 `v-if="...open"` 和 `v-show="isWindowVisible(...)"`。
最小化保留组件实例、事件监听和播放器状态；关闭则卸载组件并触发其清理。
因此不能依赖 onBeforeUnmount 在最小化时暂停音频或网络；若产品需求变化，应显式传递可见性。
覆盖层激活时普通窗口设置 inert/aria-hidden，关闭后尝试恢复原先焦点。

### 2.5 Spotlight、Launchpad 与全局按键

Spotlight 使用 `map` 覆盖层，Cmd/Ctrl+K 打开，方向键选择，Enter 激活，Escape 关闭。
激活结果调用 `window.open(path, '_blank', 'noopener,noreferrer')`；站内结果也会打开新标签页。
搜索输入变化会重置选择，结果变化会裁剪选中索引；覆盖层关闭后恢复来源焦点。
Launchpad 使用 `dock` 覆盖层，按组展示链接并过滤；触屏优先聚焦面板，桌面优先搜索框。
全局 Escape 先关闭活动菜单，再关闭当前覆盖层或活动窗口；组件局部菜单可先拦截该事件。
搜索来源包括内置 fallback，以及以下同源地址：
`/data/search-index.json`、`/articles.json`、`/code_proj.json`、`/friends.json`，
以及 `/resource/{literature,programming,computer,materials,tools,files}.json`。
`fetchJsonArray` 对非 2xx、非数组、解析/请求失败返回空数组，保留内置搜索入口。
搜索索引按名称与路径去重，并以标题、分类、路径、提示文本等计算相关度。

### 2.6 Portal 数据合同与失败联动

[portal-music.json](../public/data/portal-music.json) 根为数组，单项为 `{ name, artist, url, cover }`。
这些字段直接交给 APlayer；同源 `url` 指向 public 下的音频，`cover` 指向封面资源。
[portal-dock.json](../public/data/portal-dock.json) 根为分组数组：
`{ name, color, links: [{ name, url }] }`，用于 Launchpad 分组与外链。
`loadPortalData` 先并行获取 Music/Dock，检查二者 HTTP 状态，再依次解析，最后加载搜索来源。
任一基础请求或解析异常会写入共享 `dataError`；错误横幅出现在每个打开窗口及 Launchpad。
这表示天气、日历本身仍可能正常，但也会展示 Portal 数据错误。
搜索各来源失败则局部退化为空，不使用相同错误横幅。
修改加载逻辑时应区分“基础数据加载失败”和“搜索来源缺项”，避免误称所有应用均不可用。
PortalMusic 监听 tracks/loading，在 DOM 就绪、数据非空且尚未创建播放器时实例化 APlayer。
播放器 autoplay 为 false；补充播放控件 aria-label，并让非 button 控件支持 Enter/空格。
卸载时先清空 APlayer 列表，再 destroy；最小化不执行该流程。
当前 watcher 不替换已存在播放器的曲目列表，热更新播放数据的行为需单独设计与验证。

### 2.7 新窗口的最小扩展步骤

1. 新建自包含组件，明确 props、本地存储、网络请求和卸载清理。
2. 在 apps.js 导入并添加唯一 id、标题、图标、类名、默认/最小尺寸。
3. 需要 Portal 数据时通过 props(context) 映射，并在 applicationProps 使用的上下文中提供。
4. 核对 Portal 内按注册表建立的窗口/动画映射与菜单、Dock 展示，避免额外硬编码 id。
5. 如需 Spotlight 可发现性，添加合适搜索入口；Launchpad 外链数据不等于窗口注册。
6. 验证打开/重复打开、聚焦、最小化还原、关闭重开、持久化、窄屏、键盘焦点和资源释放。

## 3. Calendar 与 ToDoList：同页事件联动

Calendar 使用浏览器本地日期，月历固定生成 42 格，支持翻月、今天、选中与标红。
选中日期持久化并广播 `app:date-change`，detail 为 `{ date: 'YYYY-MM-DD' }`。
点击底部标红日期列表按钮时同时广播 `app:set-mode`，detail 为 `{ mode: 'daily' }`。
ToDoList 在 mounted 监听这两个 window 事件，在 unmounted 移除；这不是独立的事件总线库。
ToDoList 分 global/daily 两种模式，daily 仅显示 task.date 等于当前选中日期的任务。
新增全局任务 date 为 null，新增每日任务 date 为选中日期；任务含 `id/text/completed/date`。
旧字符串任务迁移为对象，旧对象补全缺省字段；任务列表 deep watch 后写回。
共享日期键使后来打开的 ToDoList 能读取选中日期；模式切换事件本身不会排队。
Calendar 的方向键按天/周移动，PageUp/PageDown 按月，Home/End 到月首/月尾，T 到今天。
修改日期逻辑需同时核对跨月和任务过滤，不要把本地日历日期改成 UTC 字符串。
部分 localStorage 访问仍直接执行而未 catch，不能据此保证禁用存储时两个组件都完整可用。

## 4. Weather：时区、数据分段与请求归属

### 4.1 三层职责

- [weatherCities.mjs](../src/weather/weatherCities.mjs)：城市 id、展示名、服务 location 与 IANA timeZone。
- [weatherData.mjs](../src/weather/weatherData.mjs)：current/hourly/daily 分段状态与并行刷新。
- [weatherModel.mjs](../src/weather/weatherModel.mjs)：数字清洗、时间/日期格式化、温度条、日照、UV 纯函数。
- [Weather.vue](../src/components/Weather.vue)：城市菜单、请求归属、交互、DOM 尺寸与显示。

城市列表包含珠海香洲、成都武侯、广州天河、尔湾、Waikiki、南充顺庆，默认珠海。
国内城市用 Asia/Shanghai，尔湾用 America/Los_Angeles，Waikiki 用 Pacific/Honolulu。
服务 location 可为城市编码，也可为“经度,纬度”；城市 id 与 location 不应混为一项。
只保存选中城市 id，异常 id 通过 findWeatherCity 回落默认城市。

### 4.2 请求、重试与取消竞态

三段端点为 `/v7/weather/now`、`/v7/weather/24h`、`/v7/weather/7d`。
每段保存 `{ data, updatedAt, error, loading }`，Promise.all 并发但各段独立结算。
当前实况要求对象；小时/日预报要求非空数组；错误只影响自己的 section。
同城刷新开始时保留已有 data；失败后仍显示上次观测，并提供分段 Retry。
首次失败没有旧值时显示空态；界面最多呈现 24 小时、7 天。
Weather.vue 创建 AbortController，并用递增 requestId、城市 id、disposed 共同判定响应归属。
切城先失效旧请求再 abort，清空所有分段及小时/日期选择，保存新城市，再请求。
因此“保留旧值”指同城刷新；切城不会把上一城市天气当作新城市旧数据。
busy 时普通 refresh 不启动新批次；切城通过重置 sections 解除旧 loading 状态。
卸载使 requestId 失效并 abort，阻止迟到回调写入当前组件。

### 4.3 时间与外部配置

格式化函数接收城市 timeZone；日预报 fxDate 是日历日期，不以浏览器时区改写。
日照通过城市时区求 sunrise/sunset 对应时刻，包含夏令时偏移求解。
一分钟本地定时器只更新日期标签/日照进度，不等于自动轮询天气接口。
天气图标取同源 `/weather-icons/{code}.svg`，非法编号或加载错误回退 999.svg。
QWeather 凭据与 API Host 目前定义在 Weather.vue 的核心配置区域：
`QWEATHER_API_KEY` 和 `QWEATHER_WEATHER_API_HOST`，请求通过 `X-QW-Api-Key` header 发送。
本文不复制其值或专属主机；前端常量会进入浏览器交付物，不能视为服务端秘密。
变更配置应先确定服务商权限与部署方式；本文没有迁移配置，也没有验证凭据有效性。
城市菜单使用 ResizeObserver 和捕获阶段 Escape，避免先触发 Portal 的关闭窗口快捷键。

## 5. MusicBox：编辑器、物理、曲谱与合成

### 5.1 代码职责与修改入口

| 需求 | 优先入口 |
| --- | --- |
| 工具栏、选中、拖动、试听、快捷键、历史、保存 | [MusicBox.vue](../src/pages/MusicBox.vue) |
| 音阶、画板尺寸、零件默认值、预设与曲谱 | [presets.js](../src/components/music-box/presets.js) |
| 弹珠动力学、碰撞、触发与轨迹 | [simulation.js](../src/components/music-box/simulation.js) |
| beat、循环、曲段与发射点调度 | [sequencer.js](../src/components/music-box/sequencer.js) |
| 音频图、铃/鼓、音量、声部回收 | [audio.js](../src/components/music-box/audio.js) |
| 拨弦采样 | [string-synthesis.js](../src/components/music-box/string-synthesis.js) |
| 小提琴/大提琴持续弓弦 | [bowed-synthesis.js](../src/components/music-box/bowed-synthesis.js) |

默认预设为“灯火弦歌”；还有弦上焰火、焰火游行、铃声瀑布、午后庭院、空白画布。
画板逻辑尺寸 800 × 600，编辑零件上限 64，类型为 bell/drum/string/bowed/ramp。
id 使用 crypto.randomUUID；零件含 type/x/y/angle/note，bowed 另含 voice/holdBeats。
增加零件类型需同步工具 UI、保存校验、默认值、几何碰撞和发声分派。

### 5.2 物理与时间推进

物理固定步长 1/240 秒，重力 780；最多 24 颗弹珠，存活上限 22 秒。
铃/鼓按圆碰撞，弦/弓弦/斜坡按有角度线段碰撞；斜坡改变运动但不发声。
撞击速度门限与接触状态/冷却用于避免接触期间连续触发同一零件。
requestAnimationFrame 驱动页面，单帧 dt 限制 0.04 秒；模拟器本身也限制输入步长。
暂停保留弹珠与曲谱位置；resetPerformance 清空弹珠、命中和曲谱进度，但保留编排。
无 score 时按 tempo 连续从 emitterX 投球；有 score 时 sequencer 按 beat 事件发射。
曲谱包含 id/name/lengthBeats/beatsPerBar、emitters、events、sections。
emitters 含 id/label/x，events 含 beat/emitterId，sections 含 beat/label。
sequencer 游标让 beat 0 和循环边界的事件各执行一次，setScore 会重置进度。
预设按 beat 排序事件；保存读取校验未检查事件顺序，扩展输入来源时须验证这个前提。

### 5.3 合成、解锁与持续声部

铃声使用振荡器调频和包络；鼓使用三角波、噪声与滤波；拨弦使用 Karplus–Strong 采样。
弓弦使用 PeriodicWave 谐波、琴体/琴桥滤波、轻微弓噪与持续包络，支持 violin/cello。
持续声部按零件 id 复用，holdBeats 与 tempo 决定保持时长；暂停、移除声部或卸载时释放。
所有声音在本地 Web Audio 中生成，MusicBox 不请求外部采样或音乐服务。
用户开始、单次投球或试听时才调用 audio.unlock 创建/恢复 AudioContext。
withAudio 用 interactionEpoch 防止暂停、隐藏或卸载后的迟到解锁重新启动。
解锁失败仍允许编辑与观看；静音只调整音频输出，演奏和物理仍继续。
隐藏页面取消拖动并暂停，回来后需再次点击开始；窗口 blur 仅取消拖动。
卸载移除 document/window 监听、停止动画与弓弦定时器，并 dispose 音频图。
audio.dispose 停止/断开声源，清除采样缓存与弓弦，断开 master/compressor 并关闭 AudioContext。

### 5.4 撤销、保存与数据边界

编辑快照为布局加 presetId/selectedId；历史比较忽略纯选择变化，撤销栈最多保留 50 项。
拖动和连续滑条调整合并为一次编辑，取消拖动恢复起点；新编辑清空 redo。
Cmd/Ctrl+Z 撤销，Shift+同组合重做；输入框内避免抢占文本编辑。
空格播放/暂停；Delete/Backspace 删除选中零件；方向键移动 5px，Shift 为 20px。
保存键 `music-box-layout-v1`，内容为 `{ version: 1, parts, emitterX, tempo, score }`。
不保存当前弹珠、运行进度、音量/静音、选中项或撤销历史；自动读回也不自动播放。
读取校验零件类型/坐标/音符/弓弦选项及曲谱基本结构，再约束位置、角度、速度与落球点。
异常数据或存储失败显示提示并保留当前画板；dirty 用布局序列化与上次保存布局比较。

## 6. LifeTree：当前产品是“无手织机”

[autonomy.json](../public/life-tree/autonomy.json) 根元信息和 LifeTree.vue fallback 一致：
title 为“无手织机”，subtitle 为“THE LOOM WITHOUT HANDS”，version 为 `v4.0-loom-without-hands`。
保留 LifeTree 文件名是实现入口，当前行为是自主织布；旧版天气仅用于记忆继承。
页面包含静态布面与活动 Canvas、经线拨动、触碰成结、自动换线、卷布账本与本地记忆。
内置 fallbackLoom 提供完整缺省内容；挂载请求 `/life-tree/autonomy.json`，失败继续使用 fallback。
normalizeLoom 合并 yarns/lexicon/seed/instructions/ledger/handoff，并约束线束数值。
外部文件可改声明、词库、线束与代际账本；修改动态规则仍需改 LifeTree.vue。
`life-tree-loom-v4` 保存 visits/plucks/boltsEver/bolts/savedThreads/lastYarn/lastVisit。
最多保留 6 匹账本、24 个待恢复线结；当前结上限 28；它不保存逐像素画布。
首次无 v4 记忆时读取 `life-tree-weather-v3`，把旧 disturbance/marks/lastClimate 转成继承线头。
这是迁移读取，不表示页面还请求外部天气，也不是 Weather 组件的数据源。
定时机制含梭子调度、卷布、23 秒自主换线、13 秒闲置语句、2.5 秒脏记忆刷盘。
减少动态效果时改用静态绘制与低频重绘；隐藏时停帧/梭子并刷盘，返回时最多补 8 梭。
声音由明确的声音开关启用 AudioContext，拨弦/织机声本地生成；关声淡出后延迟关闭。
卸载会 abort 内容请求、disconnect observer、移除可见性/媒体查询监听、清除动画与定时器并刷盘。
mounted 的 await 之后仍设置 interval，快速离开且请求恰在此时结束的清理顺序需专门测试，本文未复现泄漏。

## 7. 游戏与论文刷卡

### 7.1 CyberMatch

配对卡面是本地 `/bg/card/card-01.png` 至 31，背面为 `/bg/card/card-back.png`。
三模式 rift/eclipse/apotheosis 分别为 8/10/18 对；每局随机抽卡再洗牌。
配对增加基础分和连击加成，失配扣 15 分并短暂锁定后翻回，结束停止计时。
记录按模式保存最高分；同分优先更短时间，单项为 score/turns/time/accuracy。
切换模式、重开和卸载均清除延迟翻牌与计时器；当前局面不写入本地存储。
卡面替换无需改变玩法；新增模式需同时核对列数、pairs、revealDelay、scoreBase 与窄屏布局。

### 7.2 LYC2048

4 × 4 局面与分数只在内存，进入/重开生成两块；新增块为 90% 的 2、10% 的 4。
单行先压缩再一次合并，相同方向通过转置/反转复用；只有局面变化才新增块和检查终局。
按键只绑定可聚焦游戏容器，方向键阻止默认滚动；不在 window 注册全局按键。
触摸单指位移达到 24px 后按主方向移动，cancel 清理触摸起点。
当前无继续游戏、最高分或撤销持久化；新增存储时应先定义兼容版本与恢复合同。

### 7.3 Paper Switch Brush

数据从 GitHub raw 的 paper-radar/main/out 读取 `DD_MM_YY_Daily_Arxiv.json`。
先尝试浏览器本地今天，再尝试昨天；均失败时 items 为空，不继续向更早日期探测。
单项约定 title/date/theme/problem/method/result，以及精确字段：
`author list`（数组）、`arXiv id`、`arXiv pdf adress`（保留现有拼写）。
目前模板直接对 author list 调用 join；外部数据结构变化需要兼容或错误展示。
pageIdx 为 -1 时展示介绍，0..N-1 为论文，N 为汇总；460ms 防止过渡期间连续翻页。
滚轮只在卡片内响应，内部内容未滚到底/顶时先滚内容；触摸同样检查可滚区域边界。
键盘要求卡片本身聚焦，支持方向键、PageUp/PageDown 和空格；按钮/链接触摸不触发翻页。
轻量 Markdown 先转义，再处理粗体、斜体、行内代码、HTTP(S) 链接和换行。
`paperbrush_likes` 是 `{ [实际加载日期键]: [arXiv id, ...] }`，回退昨天时也归入昨天。
汇总复制收藏标题，Clipboard API 失败后用 textarea/execCommand 回退，再清空当日收藏。
挂载保存并修改 html/body overflow、隐藏全站页眉页脚；卸载恢复原 inline 样式。
请求没有 AbortController，460ms 过渡 timeout 也未保留清理句柄；快速离页需验证迟到回调。
日期文件名用本地日期，汇总 todayISO 用 UTC 日期切片；跨午夜展示一致性尚未实测。

## 8. 学术工具、课程与访客边界

AcademicGuide 在浏览器计算行列、基准宽度、缩放比例和子图高宽比。
输出子图/整体的 mm、inch、pt，以及按列数选择的字号、刻度字号与线宽；不运行 Python。
配色硬编码在页面，点击使用 Clipboard API；无网络请求、文件导出或本地存储。
input 的 min/max 是界面约束，computed 未额外归一化参数；空值/零列等边界应作为验证用例。
ModernControlCourse 请求 `/markdown/pages/modern-control-course.md`，交由 MarkdownViewer 显示。
使用 `<!-- modern-control:zh -->` / `<!-- modern-control:en -->` 分段；找不到指定块时回退全文。
目录显示二/三级标题，在文章容器内同步 heading；滚动通过 requestAnimationFrame 合并更新。
切目录写 URL hash 并 smooth scroll；语言/主题分别写本地键，标题随语言更新。
挂载记录 document.title、添加 body route class；卸载移除监听/帧/class 并恢复原标题。
课程样式通过 body class 隐藏页眉页脚；不是 PaperBrush 那种直接覆盖 display 的做法。

VisitorCenter 通过 ipapi.co 获取出口 IP 的地区/时区/坐标，并从 navigator 估计浏览器和系统。
这是 IP 近似定位，不请求浏览器 Geolocation，也不能证明用户精确位置或真实身份。
失败时明确提示定位不可用，地球仪回到默认珠海；地图轮廓取同源 GeoJSON，失败留空。
地球仪使用 SVG 投影与指针捕获拖动，滚动进度驱动缩放/偏移，不依赖第三方地图 SDK。
卸载移除 scroll/resize 监听并取消滚动帧；两个 fetch 当前没有 abort，需验证快速切页。
[FriendCard.vue](../src/components/FriendCard.vue) 另以站点域名加载 favicon：icon.horse → Google favicon → 生成头像 → 本地默认头像。

## 9. 存储键与外部服务速查

所有下表存储均为浏览器 localStorage；没有用户账户同步或后端数据库的合同。

| 功能 | 键 | 内容/边界 |
| --- | --- | --- |
| Portal 工作区 | portal.workspace.v1 | version 1、窗口状态、顺序、焦点 |
| Calendar 标红 | portal.redDates | YYYY-MM-DD 字符串数组 |
| Calendar/ToDo 共享日期 | portal.selectedDate | 本地日历日期字符串 |
| ToDo 任务 | myToDoList | 任务对象数组，兼容旧字符串项 |
| ToDo 模式 | myToDoMode | global / daily |
| Weather 城市 | portal.weather.city | weatherCities 中的 id；不缓存天气分段 |
| MusicBox | music-box-layout-v1 | version 1 编排，不含运行态/历史 |
| 无手织机 | life-tree-loom-v4 | 访问、拨弦、账本、线结与线束 |
| 无手织机旧版继承 | life-tree-weather-v3 | 仅在无当前记忆时尝试读取 |
| CyberMatch | cyber-match-records-v2 | 模式 id 到最好纪录 |
| PaperBrush | paperbrush_likes | 数据日期键到论文 id 数组 |
| 控制课程语言 | modern-control-lang | zh / en |
| 控制课程主题 | modern-control-theme | light / dark |

| 外部服务/能力 | 发起模块 | 用途与退化 |
| --- | --- | --- |
| QWeather | Weather | 三段天气；分段错误与同城旧值保留，配置位置见 4.3 |
| GitHub raw paper-radar | PaperBrush | 今天/昨天论文；失败为空列表 |
| ipapi.co | VisitorCenter | IP 地区定位；失败使用默认珠海并提示 |
| icon.horse / Google favicon | FriendCard | 图标逐级回退，最终使用本地头像 |
| 浏览器 Clipboard | AcademicGuide / PaperBrush | 复制配色/标题；PaperBrush 有旧式回退 |
| 浏览器 Web Audio | MusicBox / 无手织机 | 手势解锁、本地合成；不等于远端音乐服务 |
| Portal 外链与搜索结果 | Portal | 用户点击打开；不把链接存在等同于接口可用 |

同源 JSON、Markdown、音频、封面、GeoJSON、图标仍依赖部署资源路径正确。
外部服务的实时可用性、配额、CORS 与凭据有效性不在本次静态核对结论内。

## 10. 生命周期与验证建议

| 生命周期风险点 | 现有处理 | 建议验证 |
| --- | --- | --- |
| Portal 拖动/缩放 | pointer capture + 临时 window 监听，结束/卸载清理 | 拖出窗口、取消触摸、切屏时不残留拖动 |
| Portal 玻璃效果 | RAF、WebGL、observer、媒体查询/可见性监听与资源销毁 | 无 WebGL、减少动态、关闭页面后资源回收 |
| Portal 最小化/关闭 | v-show 保留 / v-if 卸载 | 音乐最小化继续、关闭停播、重开无重复实例 |
| Weather | requestId + city id + disposed + abort | A→B 快切、旧响应晚到、单段失败、关闭后请求完成 |
| MusicBox | RAF/弓弦 gate/音频图清理，隐藏暂停 | 延迟解锁后离开、长音删除、重复进入退出无余音 |
| 无手织机 | 内容 abort、observer、帧/梭子/定时器、刷盘、音频关闭 | 请求未完成离页、隐藏恢复、减少动态、旧记忆迁移 |
| CyberMatch | 翻牌 timeout 和秒表清理 | 失配等待中重开/切模式/离开不影响新局 |
| PaperBrush | 页面 overflow/display 恢复 | 快速离页、内部滚动、复制失败、昨天回退、日期边界 |
| 控制课程 | title/body class/scroll RAF 恢复 | 中英/明暗恢复、目录滚动、离页标题与页眉恢复 |
| VisitorCenter | 滚动监听/帧清理 | 定位/地图各自失败、拖动取消、请求期间离开 |

建议优先给纯函数模型补行为测试：窗口 reducer/geometry/restore、天气时间与分段刷新、物理碰撞和曲谱循环。
UI 验证应覆盖键盘、触屏、窄屏、存储不可用、外部请求失败和页面切换，而非只看首次正常加载。
测试范围与已有命令见 [DEVELOPMENT_AND_DEPLOYMENT.md](DEVELOPMENT_AND_DEPLOYMENT.md)；本文没有执行这些建议。
可确认的实现事实与尚未复现的影响应分开记录到 [KNOWN_ISSUES.md](KNOWN_ISSUES.md)，不要把静态疑点写成实测故障。
