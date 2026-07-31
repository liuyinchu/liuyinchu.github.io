# precision-physkit 文档

:badge[v0.1.0]{tone="success"} :badge[Python 3.12+]{tone="info"} :badge[Rust + PyO3]{tone="warning"}

`precision-physkit` 是面向精密物理与工程时序数据的分析工具包。它把数据身份与处理溯源、信号预处理、谱估计、拟合、优化、峰分析和科研绘图放进同一套可复现工作流，并将计算密集型算法下沉到释放 GIL 的 Rust 内核。

::alert{type="info" title="文档范围"}
本文档对应源码发行版 **v0.1.0**，覆盖 `meta`、`preprocess`、`filters`、`spectral`、`fitting`、`optimize`、`peaks` 与 `plotting` 八个公共子模块。每一节都同时说明签名、形状、异常、数值边界、适用范围与可执行示例。
::

## 阅读路线

::steps
{01 · 建立可信数据链}

从安装与 Python–Rust 边界开始，为原始观测建立身份、元数据和仅追加的处理日志；最后用统一样式导出可复现图形。

{02 · 条件化并理解信号}

整理时间轴与缺口，选择物理频带，再按问题选择 Welch 或 LPSD，检查谱、互谱、相干性与传递函数。

{03 · 从数据得到参数}

检测候选峰，选择模型与优化策略，检查协方差、残差、秩、收敛状态和面积定义。
::

::columns{columns="2"}
### 快速定位

- [源码安装与验证](#sec-architecture-install)
- [数据治理流程](#sec-pipeline-governance)
- [预处理与滤波决策表](#part-preprocess)
- [Welch 与 LPSD 的选择](#welch-与-lpsd-的选择及验收)
- [拟合、优化与峰分析](#part-fitting)

### 贯穿全文的约定

- 单通道时序使用 `(N,)`，多通道使用 `(N, C)`。
- 采样率、坐标和物理量必须带单位。
- 每次数据变换都记录参数、版本、随机种子与输出。
- `success=True` 只表示求解器满足终止条件，不替代科学诊断。
::

::folding{title="开始之前：环境与数据约定"}
当前版本只发布源码，需要 Python 3.12+、`uv`、稳定版 Rust 工具链与平台 C 链接器。原始数据写入 `data/raw/` 后保持只读；所有派生数据、图与报告写入 `artifacts/`，并通过 `data/meta/` 中的 schema 1 TOML 追踪。
::

::stream-button{title="查看项目源码" eyebrow="GITHUB" href="https://github.com/pifuyuini/precision-physkit"}
打开仓库，配合本文档运行示例与测试。
::

---

<a id="part-architecture"></a>

## 架构、数据治理、元数据与绘图

<a id="sec-architecture-overview"></a>

### 1. precision-physkit v0.1.0 的定位

`precision-physkit` 用于处理精密物理与工程时序数据。发行名使用连字符
`precision-physkit`，Python 导入名使用下划线 `precision_physkit`。同一个源码
发行包包含 Python API 和计算密集型 Rust 内核，覆盖：

- 数据集身份与处理溯源；
- 重采样、插值、缺口填补、白化与数字滤波；
- Welch 与对数频率 LPSD 谱估计、互谱、相干性和传递函数；
- 非线性拟合、截断 SVD、迭代加权最小二乘、通用优化和峰分析；
- 可复现的样式管理与快速绘图。

当前版本只提供源码发行，不提供预编译 wheel。因此安装时需要 Python 3.12 或更新版本、
`uv`、稳定版 Rust 工具链和平台 C 链接器。Linux 通常需要发行版的编译工具链，macOS
需要 Xcode Command Line Tools，Windows 需要 Microsoft C++ Build Tools。

<a id="sec-architecture-install"></a>

### 2. 从源码安装、构建与验证

干净克隆后的推荐流程是：

```bash
git clone https://github.com/pifuyuini/precision-physkit.git
cd precision-physkit
uv sync --locked
```

`uv sync --locked` 创建项目环境，并通过 `pyproject.toml` 中的 maturin 构建后端编译、
安装 `precision_physkit._core`。若开发分支暂时还没有锁文件，可先运行 `uv sync` 完成
解析；一旦生成并提交 `uv.lock`，可复现环境就应回到 `--locked` 模式。

验证 Python 包与 Rust 扩展是否同时可导入：

```bash
uv run python -c "import precision_physkit, precision_physkit._core; print(precision_physkit.__version__)"
```

运行两侧测试：

```bash
uv run pytest -q
uv run cargo test --manifest-path rust/Cargo.toml --locked
```

格式和静态检查可用：

```bash
uv run ruff check src tests examples
cargo fmt --manifest-path rust/Cargo.toml --check
```

仓库环境应通过 `uv` 和 maturin 配置安装，避免用 `pip install` 绕过锁文件。
验证时还需导入 Rust 扩展，单独导入纯 Python 模块不足以确认安装完整。

<a id="sec-architecture-layout"></a>

### 3. 包布局与 Python–Rust 边界

| 路径 | 职责 |
|---|---|
| `src/precision_physkit/` | Python 包与公共 API |
| `rust/src/` | Rust 内核及 PyO3 绑定 |
| `tests/` | Python 测试 |
| `rust/src/tests.rs` | Rust 测试 |
| `examples/` | 可执行的端到端范例 |
| `docs/` | 架构、教程和 API 参考 |
| `data/raw/` | 写入后不可覆盖的原始观测 |
| `data/meta/` | 每个数据集一份 schema 1 TOML |
| `artifacts/` | 每次运行产生的数据、图和报告 |
| `reference/` | 版本化的可复现参考快照 |

`src/precision_physkit/__init__.py` 暴露八个子模块：
`meta`、`preprocess`、`filters`、`spectral`、`fitting`、`optimize`、`peaks` 和
`plotting`。包版本是 `precision_physkit.__version__ == "0.1.0"`。

Rust 模块注册为 `precision_physkit._core`，提供五个 LPSD 家族内核
（PSD、CSD、相干性、$\hat{H}_1$ 传递函数、完整 CSD 矩阵）以及截断 SVD 和多通道迭代加权
最小二乘。计算时释放 GIL，并用 Rayon 按频点并行。Rust 侧的 `CoreError` 在 PyO3
边界映射为 Python `ValueError`，且 crate 禁止 `unsafe`。

Python 子模块对 `_core` 采用延迟导入：元数据、绘图、SciPy 预处理等纯 Python 能力
不依赖扩展；只有调用 LPSD 或 Rust 拟合内核时才要求 `_core` 已构建。导入包时不会
立即加载本地扩展，因此仍需单独验证 `_core`，才能确认安装完整。

<a id="sec-pipeline-governance"></a>

### 4. 数据治理与典型处理流程

推荐的数据流是：

```text
data/raw
  └─ 登记 → data/meta
                └─ 预处理 → 分析 → artifacts/{data,figures,reports}
                                    └─ 与 reference/ 对照
```

核心契约如下。

1. 原始文件一旦进入 `data/raw/` 就只读，不把派生结果写回原文件。
2. 每个数据集立即建立 `data/meta/<name>.meta.toml`。
3. 每一步操作完成后立即调用 `meta.log_stage`，记录函数全限定名、软件版本、关键参数、
   随机种子和输出。
4. 运行时产物写入 `artifacts/data/`、`artifacts/figures/` 和
   `artifacts/reports/`；同一任务的文件共享 `NN_` 前缀。
5. `reference/` 只保存经过挑选、用于回归比较的参考快照；普通运行输出写入
   `artifacts/`。
6. 审计时读取 `meta.load_meta(path)["processing"]`，逐项核对 `outputs` 与磁盘文件。

典型时序处理流程是“登记 → 补缺口 → 任务相关的抗混叠低通 → 降采样 → 谱分析 →
导出 → 审计”。每个阶段都单独记账。若第 $n$ 步之前的处理日志为 $P_n$，追加一条
记录 $e_n$ 后的契约是：

$$
P_{n+1} = P_n \mathbin{\Vert} [e_n],
$$

其中 $\Vert$ 表示按时间顺序追加，不覆盖或重排。日志遵循仅追加（append-only）治理约定；
`log_stage` 对传入字典会原地追加，对传入路径则依次读取、追加、校验并写回。

一个最小的登记与导出骨架如下：

```python
from precision_physkit import __version__, meta

meta_path = "data/meta/01_run.meta.toml"
doc = meta.create_meta(
    "01-run",
    files=["01_run_raw.npz"],
    format="npz",
    fs=2048.0,
    n_samples=122_880,
    channels=[{"name": "sensor_a", "unit": "V", "quantity": "voltage"}],
)
meta.save_meta(doc, meta_path)
meta.log_stage(
    meta_path,
    "acquire",
    "acquisition",
    __version__,
    params={"fs": 2048.0, "seed": 20260720},
    outputs=["data/raw/01_run_raw.npz"],
)
```

<a id="sec-meta-overview"></a>

### 5. `precision_physkit.meta`：数据身份与处理溯源

`meta.py` 的公开导出由 `__all__` 明确限定为：

```text
SCHEMA_VERSION
create_meta
validate_meta
save_meta
load_meta
log_stage
```

该模块没有公开类。以下划线开头的 TOML 序列化辅助函数属于实现细节，不应直接调用。
读取使用标准库 `tomllib`；写入使用内置的最小 TOML 序列化器。时间戳存成带引号的
ISO 8601 字符串，使 load/save 后的 Python 类型保持稳定；值为 `None` 的可选字段
在写出时省略。

<a id="api-meta-schema-version"></a>

#### 5.1 常量 `SCHEMA_VERSION`

##### 值与约束

```python
from precision_physkit.meta import SCHEMA_VERSION

assert SCHEMA_VERSION == 1
```

它是 `create_meta` 写入的元数据 schema 版本，也是 `validate_meta` 接受的唯一版本。
类型为 `int`，无参数、无返回值、不会主动抛异常。

##### 工作原理与边界

文档顶层的 `schema_version` 必须是整数 1；布尔值虽然是 Python `int` 的子类，但校验
会明确拒绝。应用代码应保持该模块常量不变，遇到未知未来版本时也必须执行校验。该
常量适合做显示和断言；schema 迁移需要另行实现。

<a id="api-meta-create-meta"></a>

#### 5.2 `create_meta`

##### 签名

```text
create_meta(
    name: str,
    *,
    instrument: str = "",
    experiment: str = "",
    operator: str = "",
    description: str = "",
    files: list[str] | None = None,
    format: str = "csv",
    fs: float | None = None,
    n_samples: int | None = None,
    t_start: float | None = None,
    t_end: float | None = None,
    channels: list[dict[str, str]] | None = None,
) -> dict[str, Any]
```

##### 参数与返回值

创建 schema 1 的嵌套字典。它自动生成 RFC 4122 UUID 和当前 UTC 秒级 ISO 8601
时间，`processing` 初始为空。`fs` 单位为 $\mathrm{Hz}$；`n_samples` 是每通道样本数；
`channels` 每项必须含非空 `name`，可选 `unit`、`quantity`。未知的可选数值保持
`None`，序列化时会省略。

##### 异常与边界

- `name` 或 `format` 为空、`fs` 非正、`n_samples` 为负、`t_end` 早于 `t_start`，
  抛 `ValueError`。
- 通道项不是字典，抛 `TypeError`；通道名为空，抛 `ValueError`。
- `instrument` 等来源字段允许空串，但真实实验应尽量填写。

##### 工作原理

函数把标量归一化为 `str`、`float` 或 `int`，把缺失的 files/channels 变为空列表；
它不访问数据文件，也不会确认采样率和样本数是否与文件一致。

##### 示例

```python
from precision_physkit import meta

doc = meta.create_meta(
    "scope-run",
    instrument="scope-01",
    files=["scope-run.csv"],
    fs=1000.0,
    channels=[{"name": "ch1", "unit": "V", "quantity": "voltage"}],
)
assert doc["processing"] == []
assert meta.validate_meta(doc) == []
```

##### 适用范围

新数据集第一次登记时使用。重建已有数据集会改变 UUID 和创建时间，因此已有文档应
使用 [`load_meta`](#api-meta-load-meta)。

<a id="api-meta-validate-meta"></a>

#### 5.3 `validate_meta`

##### 签名

```text
validate_meta(d: dict[str, Any]) -> list[str]
```

##### 返回值与校验范围

一次收集 schema 问题，返回形如 `"data.fs: must be > 0, got -1.0"` 的字符串列表；
空列表表示合法。它检查顶层键、版本、UUID、时间、来源字符串、数据字段、通道和每条
processing 记录。

##### 异常与边界

该函数的正常契约是不因 schema 问题抛异常；输入不是字典时返回单条问题。它只校验
结构和类型，不检查文件是否存在、outputs 是否真的生成，也无法确认数值是否科学合理。

##### 工作原理与示例

```python
from precision_physkit import meta

doc = meta.create_meta("bad-example")
doc["data"]["fs"] = -1.0
problems = meta.validate_meta(doc)
assert problems == ["data.fs: must be > 0, got -1.0"]
```

##### 适用范围

可用于保存前预览全部问题、CI 审计或用户输入校验。返回 `[]` 只说明结构与类型合法；
文件与物理量仍需独立核对。

<a id="api-meta-save-meta"></a>

#### 5.4 `save_meta`

##### 签名

```text
save_meta(d: dict[str, Any], path: str | pathlib.Path) -> None
```

##### 返回值与写入过程

先调用 `validate_meta`，再以 UTF-8 把字典写成 TOML；成功返回 `None`。已存在文件会
覆盖。序列化器支持字符串、整数、浮点数、布尔、标量数组、表、表数组和内联表；
不支持任意 Python 对象或嵌套表数组。

##### 异常与边界

- schema 非法时抛含全部问题的 `ValueError`，且不会写出非法文档；
- 遇到不支持的值类型或不支持的嵌套表数组时抛 `TypeError`；
- 路径权限、父目录不存在等错误按 Python 文件 I/O 异常传播。

“非法文档不落盘”是内容层保证，不代表跨进程事务或临时文件原子替换；并发写同一路径
需要调用方另行同步。

##### 示例

```python
from pathlib import Path
from tempfile import TemporaryDirectory
from precision_physkit import meta

with TemporaryDirectory() as tmp:
    path = Path(tmp) / "run.meta.toml"
    meta.save_meta(meta.create_meta("run"), path)
    assert path.read_text(encoding="utf-8").startswith("schema_version = 1")
```

##### 适用范围

适用于创建或有意更新合法元数据。该序列化器只面向本 schema，不用于任意 TOML
配置；并发维护同一文件时，调用方需要先协调写入。

<a id="api-meta-load-meta"></a>

#### 5.5 `load_meta`

##### 签名

```text
load_meta(path: str | pathlib.Path) -> dict[str, Any]
```

##### 返回值与读取过程

以二进制方式读取 TOML，交给标准库 `tomllib.load` 解析，再调用 `validate_meta`。
返回经过校验的嵌套字典。

##### 异常与边界

- 路径不存在：`FileNotFoundError`；
- TOML 语法错误：`tomllib.TOMLDecodeError`；
- 语法合法但不符合 schema：`ValueError`。

它不检查记录中的文件路径是否存在。

##### 示例

```python
from pathlib import Path
from tempfile import TemporaryDirectory
from precision_physkit import meta

with TemporaryDirectory() as tmp:
    path = Path(tmp) / "run.meta.toml"
    meta.save_meta(meta.create_meta("run"), path)
    loaded = meta.load_meta(path)
    assert loaded["id"]["name"] == "run"
```

##### 适用范围

恢复身份、审计处理链和断点续跑时使用。只想解析任意 TOML 配置时应直接用
`tomllib`，因为 `load_meta` 必须通过 schema 1 校验。

<a id="api-meta-log-stage"></a>

#### 5.6 `log_stage`

##### 签名

```text
log_stage(
    path_or_dict: str | pathlib.Path | dict[str, Any],
    stage: str,
    tool: str,
    tool_version: str,
    params: dict[str, Any] | None = None,
    outputs: list[str] | None = None,
) -> dict[str, Any]
```

##### 参数与返回值

追加一条处理记录并返回更新后的字典。`stage` 是短阶段名；`tool` 应是函数全限定名；
`tool_version` 通常使用 `precision_physkit.__version__`；`params` 记录决定结果的参数；
`outputs` 记录生成文件。`at` 自动写当前 UTC 时间。

若 `path_or_dict` 是路径，函数调用 `load_meta`、追加、再调用 `save_meta` 写回；若是
字典，则通过 `setdefault("processing", [])` 原地追加，但不会自动执行整份文档校验。

##### 异常与边界

- 空 `stage` 抛 `ValueError`；
- `path_or_dict` 既不是路径也不是字典，抛 `TypeError`；
- `params` 仅支持 `None`、字符串、整数、浮点数、布尔以及它们嵌套的 list/tuple/dict，
  其他值抛 `TypeError`；
- 路径模式还会传播 [`load_meta`](#api-meta-load-meta) 和
  [`save_meta`](#api-meta-save-meta) 的异常。

NumPy 标量不在允许类型白名单中，必须先执行 `float(value)` 或 `int(value)`。该函数
不会验证 `outputs` 中的路径是否存在，也不会阻止调用方重复记录相同 `stage`。

##### 示例

```python
from precision_physkit import __version__, meta

doc = meta.create_meta("run")
updated = meta.log_stage(
    doc,
    "lowpass",
    "precision_physkit.filters.lowpass",
    __version__,
    params={"cutoff": 50.0, "order": 4},
    outputs=["artifacts/data/run_lowpass.npz"],
)
assert updated is doc
assert doc["processing"][-1]["stage"] == "lowpass"
```

##### 适用范围

每次改变数据或导出结果后立即使用。纯读取审计无需新增 stage。该函数记录科学处理
溯源；调试消息仍由应用日志系统处理。

<a id="sec-plotting-overview"></a>

### 6. `precision_physkit.plotting`：样式层与快速绘图

`plotting.py` 的公共导出为：

```text
__version__
PRESET_STYLES
temp_style
mamplot
plot
print_preset_styles
get_academic_style
get_adaptive_subplot_style
```

模块没有公开类。`_StyleContextOrDecorator` 与 `_draw` 是私有实现；前者只能通过
[`temp_style`](#api-plotting-temp-style) 创建。绘图模块负责样式和便利封装，不应
承担数据清洗、拟合或谱估计。

<a id="api-plotting-version"></a>

#### 6.1 常量 `__version__`

```python
from precision_physkit import plotting

assert plotting.__version__ == "1.11.1"
```

这是绘图子模块自身的移植版本，不是发行包版本 `precision_physkit.__version__`。
它是字符串，无参数、无返回值、不会主动抛异常。记录整体分析软件版本时优先使用包
版本；只有审计绘图层演进时才单独记录该值。

<a id="api-plotting-presets"></a>

#### 6.2 常量 `PRESET_STYLES`

`PRESET_STYLES: dict[str, str]` 把预设名映射为 Matplotlib `.mplstyle` 文本。布局
预设包括：

```text
sci, science, ysy_academic, ieee, nature, ysy_sans, ysy_tnr, sci_new, gp
```

颜色/主题预设包括：

```text
catppuccin_mocha, catppuccin_latte, ysy_firefly_1, science_color,
catppuccin_farppe, sky, ysy_firefly_2, cold_nature, ieee_color,
warm_nature, matlab, tableau10, tab10, lancet, winter_sunny, morandi,
waiting, 6blue_orange, 6blue_red, 2blue_red, 5blue_red, 4blue_red,
4blue_orange, tab4, tab8
```

##### 示例

```python
from precision_physkit import plotting

assert "ysy_academic" in plotting.PRESET_STYLES
style_text = plotting.PRESET_STYLES["tab4"]
assert "axes.prop_cycle" in style_text
```

字典查找未知键会抛 `KeyError`；通过 `temp_style` 使用未知键则抛 `ValueError`。虽然
它是可变字典，但修改全局预设会影响进程中后续绘图，不适合在库代码里原地改写。
临时调整应使用 `extra_style`。

<a id="api-plotting-temp-style"></a>

#### 6.3 上下文管理器/装饰器 `temp_style`

##### 签名

```text
temp_style(
    style_keys: Iterable[str] | None = None,
    extra_style: str = "",
)
```

##### 返回值与执行过程

普通调用返回一个同时实现上下文管理器和函数装饰器协议的私有对象；裸装饰器
`@temp_style` 也受支持。进入时按顺序拼接预设和 `extra_style`，写入系统临时
`.mplstyle` 文件，再调用 `matplotlib.style.use`；退出时恢复 Matplotlib 默认
rcParams 并删除临时文件。

##### 异常与边界

- 未知 style key 抛 `ValueError`；
- 非法 mplstyle 内容由 Matplotlib 报告；
- 退出时删除临时文件遇到 `FileNotFoundError` 或 `PermissionError` 会被忽略；
- 退出时恢复默认样式，无法恢复进入前的样式栈，因此嵌套使用不能保留外层样式。

##### 示例

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from precision_physkit import plotting

with plotting.temp_style(
    ["ysy_academic", "tab4"],
    extra_style="legend.frameon: False\n",
):
    fig, ax = plt.subplots()
    ax.plot([0, 1], [0, 1])
    plt.close(fig)
```

##### 适用范围

适用于让一段绘图代码共享确定样式。一次性设置某个 `Axes` 属性时，直接操作
Matplotlib 更清楚。若需保留调用前的全局样式，则不能依赖该上下文管理器。

<a id="api-plotting-plot-common"></a>

#### 6.4 `plot` 与 `mamplot` 的公共参数契约

两个函数签名相同：

```text
plot(
    x,
    y,
    legend_name,
    plot_title="",
    x_label="X Axis",
    y_label="Y Axis",
    plot_type="curve",
    legend_title="",
    data_point=None,
    *,
    legend_out=True,
    legend_up=False,
    legend_fancy=True,
    svg_save=False,
    pdf_save=False,
    fig_show=True,
    x_log=False,
    y_log=False,
    return_fig=False,
    x_lim=None,
    y_lim=None,
    adjust=False,
    line_alpha=1.0,
) -> tuple[matplotlib.figure.Figure, matplotlib.axes.Axes] | None
```

`y` 可以是一条序列，也可以是多条序列组成的 list/tuple。多序列时 `legend_name`
必须是等长 list/tuple。`plot_type` 仅支持 `"curve"` 和 `"scatter"`。
`data_point=(x0,y0)` 只为单序列额外标出一个 `x` 形点。

图例优先级是 `legend_up`（上方横排）高于 `legend_out`（右侧外置）；两者都关闭时
图例置于图内。`x_log`、`y_log` 控制对数轴，`x_lim`、`y_lim` 控制范围，
`adjust=True` 调用 `tight_layout()`。

`svg_save`/`pdf_save` 直接保存到当前工作目录。文件基名取 `plot_title`，空标题退化为
`figure`，并用正则把非字母数字、连字符、下划线字符替换为下划线。`fig_show=True`
会强制关闭返回值；只有 `fig_show=False, return_fig=True` 才返回 `(fig, ax)`。

无效 `plot_type`，或多序列和图例名数量不匹配，抛 `ValueError`。Matplotlib 的形状、
对数轴非正值和文件 I/O 错误按原样传播。

<a id="api-plotting-plot"></a>

#### 6.5 `plot`

##### 执行过程

调用私有 `_draw`，使用当前 rcParams，不自动加任何样式。适合已经通过
[`temp_style`](#api-plotting-temp-style) 或应用级主题设好样式的代码。

##### 示例

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from precision_physkit import plotting

fig, ax = plotting.plot(
    [0, 1, 2],
    [0, 1, 4],
    "measurement",
    x_label="t / s",
    y_label="x / m",
    fig_show=False,
    return_fig=True,
)
assert ax.get_ylabel() == "x / m"
plt.close(fig)
```

##### 适用范围

快速生成单面板折线或散点图时使用。复杂网格、误差棒、色图、双轴或精细 artist
控制应直接使用 Matplotlib；该 API 没有这些专门参数。

<a id="api-plotting-mamplot"></a>

#### 6.6 `mamplot`

##### 返回值与异常

参数、返回值和异常与 [`plot`](#api-plotting-plot-common) 完全相同，但函数定义带有
`@temp_style(["ysy_academic", "tab4"])`，因此自动应用内置学术布局和四色色板，结束
后恢复 Matplotlib 默认 rcParams。

##### 示例

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from precision_physkit import plotting

fig, ax = plotting.mamplot(
    [0, 1, 2],
    [[0, 1, 4], [0, 1, 2]],
    ["quadratic samples", "linear samples"],
    fig_show=False,
    return_fig=True,
)
assert len(ax.lines) == 2
plt.close(fig)
```

##### 适用范围

需要零配置复现内置样式时使用。已有项目主题或需要样式组合时优先选择
`temp_style(...) + plot(...)`，避免 `mamplot` 重置全局 rcParams 的退出语义。

<a id="api-plotting-print-presets"></a>

#### 6.7 `print_preset_styles`

##### 签名与行为

```text
print_preset_styles() -> None
```

向标准输出打印推荐加载格式、布局预设和颜色主题清单，返回 `None`，源码没有显式异常。

##### 示例

```python
from precision_physkit import plotting

result = plotting.print_preset_styles()
assert result is None
```

适合交互式发现预设，不适合机器读取；程序化枚举应使用
[`PRESET_STYLES`](#api-plotting-presets)。

<a id="api-plotting-academic-style"></a>

#### 6.8 `get_academic_style`

##### 签名

```text
get_academic_style(
    rows: int = 1,
    cols: int = 1,
    base_width_mm: float = 150,
    use_surplus: float = 1.0,
    ratio: float = 0.75,
    verbose: bool = True,
) -> str
```

##### 参数与返回值

为期刊式多面板图生成 mplstyle 文本。`base_width_mm` 是整图基准宽度，
`use_surplus` 是整体尺寸倍率，`ratio` 是单面板高宽比。`verbose=True` 会打印毫米、
英寸、磅和自适应样式报告。

若行列数分别为 $m,n$，则源码使用：

$$
w_\mathrm{panel} = \frac{W_\mathrm{base}}{n}, \qquad
h_\mathrm{panel} = r w_\mathrm{panel},
$$

$$
W_\mathrm{fig} = s W_\mathrm{base}, \qquad
H_\mathrm{fig} = s m h_\mathrm{panel}, \qquad
1\,\mathrm{in} = 25.4\,\mathrm{mm}.
$$

列数为 1、2、至少 3 时分别选择递减的字体、线宽和 marker 基准，并保证 tick 字号
不低于 $8\,\mathrm{pt}$。

##### 异常与边界

源码没有显式参数校验；例如 `cols=0` 会触发 `ZeroDivisionError`，负尺寸可能生成
Matplotlib 无法接受的样式。调用方应保证 `rows` 和 `cols` 均不小于 1，且
`base_width_mm`、`use_surplus`、`ratio` 均为正数。

##### 示例

```python
from precision_physkit import plotting

style = plotting.get_academic_style(
    rows=1, cols=2, base_width_mm=150, verbose=False
)
assert "figure.figsize" in style
```

##### 适用范围

期刊毫米制版面和严格 serif 图形时使用。屏幕仪表盘或需要固定单图英寸尺寸时，
[`get_adaptive_subplot_style`](#api-plotting-adaptive-style) 更直接。

<a id="api-plotting-adaptive-style"></a>

#### 6.9 `get_adaptive_subplot_style`

##### 签名

```text
get_adaptive_subplot_style(
    rows: int = 1,
    cols: int = 1,
    width: float = 4.7,
    ratio: float = 0.75,
    font_family: str = "sans-serif",
    font_base_size: float = 14.0,
    verbose: bool = True,
) -> str
```

##### 参数与返回值

按总宽度和子图密度生成 mplstyle 文本。单面板固定为
$4.7 \times 3.525\,\mathrm{in}$。多面板令单面板宽
$w_\mathrm{p}=W/n$、高 $h_\mathrm{p}=r w_\mathrm{p}$、整图高
$H=m h_\mathrm{p}$。自适应尺度为：

$$
s = \mathrm{clip}\left[
\left(\frac{w_\mathrm{p}}{4.7}\right)^{0.42}
m^{-0.18}
\left(\frac{r}{0.75}\right)^{0.12},
\,0.42,\,1.15
\right].
$$

源码随后用 $s$ 的不同幂次缩放字体、轴线、网格、曲线和 marker，并分别施加上下限；
serif 使用 Computer Modern 数学字体，sans-serif 使用 DejaVu Sans 数学字体。

##### 异常与边界

`rows` 或 `cols` 小于 1、`width` 或 `ratio` 非正，或 `font_family` 不属于
`{"sans-serif", "serif"}` 时抛 `ValueError`。源码没有单独拒绝非正
`font_base_size`；调用方仍应传正数。单面板时 `width` 和 `ratio` 不参与几何尺寸，
这是有意的固定模板行为。

##### 示例

```python
from precision_physkit import plotting

style = plotting.get_adaptive_subplot_style(
    rows=2,
    cols=2,
    width=7.0,
    font_family="sans-serif",
    verbose=False,
)
assert "figure.figsize" in style
```

##### 适用范围

多面板密度变化、希望自动压缩但保持可读下限时使用。期刊要求明确毫米宽度时改用
[`get_academic_style`](#api-plotting-academic-style)；它只生成样式文本，不创建 Figure。

<a id="sec-plotting-production-pattern"></a>

### 7. 推荐的生产绘图模式

样式生成与数据绘制应分成两个阶段：

```python
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

from precision_physkit import plotting

x = np.linspace(0.0, 1.0, 200)
y = np.sin(2.0 * np.pi * x)

style = plotting.get_adaptive_subplot_style(verbose=False)
with plotting.temp_style(["tab4"], extra_style=style):
    fig, ax = plt.subplots()
    ax.plot(x, y, label="signal")
    ax.set(xlabel="t / s", ylabel="x / V")
    ax.legend(frameon=False)
    fig.savefig("artifacts/figures/01_signal.pdf", bbox_inches="tight")
    plt.close(fig)
```

无头环境必须在导入 `matplotlib.pyplot` 前选择 `Agg`。样式块内只描述数据和语义；
逐线覆盖颜色、线宽和字体会破坏统一样式。每张图仍需人工检查标签裁切、图例遮挡、
面板不一致、对数轴非正数据以及 PDF 字体替代。参考图放 `reference/`，本次运行图放
`artifacts/figures/`。

<a id="sec-public-symbol-coverage"></a>

### 8. 本章公开符号覆盖清单

`precision_physkit.meta`：

- `SCHEMA_VERSION`
- `create_meta`
- `validate_meta`
- `save_meta`
- `load_meta`
- `log_stage`

`precision_physkit.plotting`：

- `__version__`
- `PRESET_STYLES`
- `temp_style`（上下文管理器与装饰器入口）
- `plot`
- `mamplot`
- `print_preset_styles`
- `get_academic_style`
- `get_adaptive_subplot_style`

两个模块均无公开类；`_StyleContextOrDecorator` 等下划线符号仅解释其公开入口的工作
原理，不作为可依赖 API。



::alert{type="success" title="第一部分完成：数据现在可追踪、可复现"}
到这里，数据已经具备稳定身份、只读原始来源、仅追加处理记录和确定的绘图样式。下一部分在不破坏这条审计链的前提下，进入时间轴整理、滤波与频域分析。
::

::link-card{title="继续：预处理、滤波与谱分析" eyebrow="PART II" href="#part-preprocess"}
从“先做哪一步”的决策表出发，把原始观测变成可解释的谱与传递函数。
::

---

<a id="part-preprocess"></a>

## 预处理、滤波与谱分析

测量数据进入谱估计前，通常需要先整理时间轴和缺失样本，再按物理频带滤波。本章覆盖这条处理链，并说明功率谱、互谱、相干性与传递函数的估计方法。三个模块统一从包入口导入：

```python
import numpy as np
from precision_physkit import filters, preprocess, spectral
```

本文记采样率为 $f_\mathrm{s}$，采样间隔为 $\Delta t=1/f_\mathrm{s}$，序列长度为 $N$，Nyquist 频率为 $f_\mathrm{s}/2$。除非某个 API 明确提供 `axis`，一维输入写成 `(N,)`；多通道谱分析写成 `(N, C)`，第 0 轴是时间、第 1 轴是通道。滤波器默认沿最后一轴工作，因此 `(N, C)` 数据通常要转置后滤波再转回，或在支持 `axis` 的 API 中显式传 `axis=0`。

### 先做哪一步：一张决策表

| 问题 | 首选 API | 选择理由 |
|---|---|---|
| 整数倍降低采样率 | `preprocess.downsample` | 内置抗混叠滤波 |
| 整数倍提高采样率 | `preprocess.upsample` | 多相 FIR 抗成像 |
| 任意采样率转换 | `preprocess.resample` | 有理数近似与多相滤波 |
| 非均匀时间戳重网格 | `preprocess.interpolate` | 显式坐标插值，区间外不外推 |
| 填补 NaN 缺口 | `preprocess.fill_gaps` | 区分内部缺口与首尾缺口，可加入匹配噪声 |
| 为检测或拟合压平噪声底 | `preprocess.whiten` | 以 Welch PSD 预白化 |
| 有明确通带或阻带 | Butterworth 系列 | 平滑、无通带纹波，SOS 数值稳定 |
| 去除 $50/60\,\mathrm{Hz}$ 窄线 | `filters.notch` | 用品质因数直接控制陷波宽度 |
| 保峰形的平滑或求导 | `filters.savgol` | 局部多项式最小二乘 |
| 快速趋势平滑 | `filters.moving_average` | 简单，但频率选择性较差 |
| 固定频率分辨率、精确定位谱线 | Welch 系列 | 线性频率轴 |
| 跨多个数量级观察噪声 | LPSD 系列 | 低频长段、高频短段的对数频率轴 |

---

### `preprocess`：时间轴、缺口与白化

本模块所有函数都返回新数组，不原地修改输入。

#### `preprocess.downsample`

```python
downsample(x, q, axis=-1, zero_phase=True, ftype="iir")
```

以整数因子 $q$ 降采样时，先用低通滤波器抑制新 Nyquist 频率 $f_\mathrm{s}/(2q)$ 以上的能量，再抽取。直接使用 `x[::q]` 会产生混叠：

$$
y[m]=(x\ast h)[mq].
$$

实现封装 `scipy.signal.decimate`。`ftype="iir"` 使用 8 阶 Chebyshev I 型低通，过渡带陡、计算量低；`ftype="fir"` 使用 30 抽头 Hamming 窗 FIR，单程时具有线性相位但过渡带较缓。

`x` 可为任意维数组，只沿 `axis` 处理。`q` 必须是至少 1 的整数。输出其余轴不变，目标轴长度约为原长度除以 $q$，精确长度遵循 SciPy。`zero_phase=True` 前后向滤波，无群延迟但等效幅频响应平方、等效阶数加倍；`False` 是因果单程滤波并引入群延迟。

当 $q\lt 1$ 时，函数明确抛出 `ValueError`；非法 `ftype`、非法轴或过短数据的错误由 SciPy 继续抛出。高于新 Nyquist 的真实成分会被有意删除；若需保留它们，就不能降低到该采样率。因果模式的时间对齐不能直接与原信号比较。

示例：

```python
import numpy as np
from precision_physkit import preprocess

fs = 1000.0
t = np.arange(2000) / fs
x = np.sin(2 * np.pi * 20 * t) + 0.2 * np.sin(2 * np.pi * 300 * t)
y = preprocess.downsample(x, q=4)
assert y.shape == (500,)
```

一般离线分析使用默认 IIR 与零相位；对线性相位有明确要求时选择 FIR；实时流处理可用 `zero_phase=False`，并单独处理延迟。

#### `preprocess.upsample`

```python
upsample(x, q, axis=-1)
```

以整数因子 $q$ 提高采样率。概念上先在原样本之间插入 $q-1$ 个零，再用低通 FIR 去除频谱镜像：

$$
x_\uparrow[n]=
\begin{cases}
x[n/q], & n\bmod q=0,\\
0, & \mathrm{otherwise},
\end{cases}
\qquad y=x_\uparrow\ast h.
$$

实现调用 `scipy.signal.resample_poly(x, up=q, down=1)`，使用 Kaiser 窗多相 FIR；新增样本来自带限插值，并非简单重复原值。

`x` 可为任意维并沿 `axis` 处理，且 $q\ge 1$。输出目标轴长度约为原长度的 $q$ 倍，其余轴不变。

当 $q\lt 1$ 时抛出 `ValueError`；非法轴由 NumPy/SciPy 抛错。提高采样率不会创造超过原 Nyquist 频率的新信息，也不能提升原测量的真实带宽。

示例：

```python
import numpy as np
from precision_physkit import preprocess

x = np.sin(2 * np.pi * 0.05 * np.arange(100))
y = preprocess.upsample(x, q=4)
assert y.shape == (400,)
```

目标速率是整数倍时使用本函数；非整数倍率直接使用 `resample`，不要连续堆叠多次整数变换。

#### `preprocess.resample`

```python
resample(x, fs_in, fs_out, axis=-1, max_denominator=100_000)
```

本函数把任意输入采样率转换到目标采样率。代码先把比值

$$
r=\frac{f_{\mathrm{out}}}{f_{\mathrm{in}}}
$$

近似为分数 $p/q$，其中分母不超过 `max_denominator`，再调用多相重采样：

$$
f_{\mathrm{eff}}=f_{\mathrm{in}}\frac{p}{q}.
$$

多相 FIR 同时承担降采样时的抗混叠和升采样时的抗成像。

`fs_in`、`fs_out` 必须为正，`max_denominator` 不小于 1。`x` 可为任意维并沿 `axis` 处理。输出长度约为 `round(N * fs_out / fs_in)`，实际有效采样率由分数近似决定。

非正采样率或非法最大分母会触发 `ValueError`。分母限制太小会产生可观的采样率误差；限制极大则可能增加 FIR 的计算成本。该实现不采用 FFT 周期延拓，因而比 `scipy.signal.resample` 更适合一般非周期测量，但端点仍会受到有限长滤波器的瞬态影响。

示例：

```python
import numpy as np
from precision_physkit import preprocess

fs_in, fs_out = 44_100.0, 48_000.0
t = np.arange(4410) / fs_in
x = np.sin(2 * np.pi * 440 * t)
y = preprocess.resample(x, fs_in, fs_out)
assert y.shape[0] == 4800
```

任意速率转换可默认选择本函数。如果速率比恰为简单整数且只降采样，`downsample` 的控制项更直接。

#### `preprocess.interpolate`

```python
interpolate(t, x, t_new, method="linear")
```

本函数将一维观测 $(t_i,x_i)$ 映射到新坐标 `t_new`。线性插值在相邻点间使用

$$
\hat{x}(t)=x_i+\frac{x_{i+1}-x_i}{t_{i+1}-t_i}(t-t_i).
$$

另外三种方法是：`"cubic"` 的三次样条最光滑，但可能过冲；`"pchip"` 是保单调的分段三次 Hermite，通常适合测量数据；`"akima"` 使用局部斜率加权，对局部异常更稳健，但光滑度较低。可选方法共四种，包含 Akima。

`t` 与 `x` 都必须是一维、等长且至少包含两个点，`t` 严格递增。`t_new` 可为任意形状，输出与它同形。超出 $[t_0,t_{N-1}]$ 的位置统一写为 NaN，不做外推。

维度、长度、样本数、时间单调性或方法名不合法时抛出 `ValueError`。实现没有单独拒绝 `t`/`x` 内的 NaN 或 Inf；它们可能让底层插值器失败或传播非有限值，调用前应自行检查。插值过程不含重采样所需的抗混叠滤波；把高采样率数据映射到稀疏网格时，需要另行限带。

示例：

```python
import numpy as np
from precision_physkit import preprocess

t = np.array([0.0, 0.11, 0.21, 0.32])
x = np.sin(2 * np.pi * t)
t_new = np.arange(0.0, 0.33, 0.01)
y = preprocess.interpolate(t, x, t_new, method="pchip")
assert y.shape == t_new.shape
```

重建单调曲线或需要避免假峰时选择 PCHIP；数据很平滑且允许轻微过冲时选择 cubic；存在局部异常时可比较 Akima；需要透明且假设较少的结果时选择 linear。若目标是改变均匀序列采样率，应选择 `resample`。

#### `preprocess.fill_gaps`

```python
fill_gaps(x, method="pchip", fill_noise=False, noise_std=None, seed=None)
```

本函数把一维序列中的 NaN 连续区段识别为缺口。内部缺口按有效样本插值；首尾缺口无法双侧插值，因此用最近有效样本常值延拓。`fill_noise=True` 时，对每个缺口叠加零均值高斯扰动。自动噪声估计优先使用缺口前后各 50 个样本的有效邻域：

$$
\hat{\sigma}=\frac{\mathrm{std}(\Delta x)}{\sqrt{2}},
$$

这对慢趋势不太敏感；邻域不足时退回全局估计，极短有效块则可能得到 0。

`x` 必须为 `(N,)`；方法同 `interpolate`，默认 PCHIP。`noise_std` 若给出则覆盖每个缺口的局部估计并必须非负。`seed` 传给 `numpy.random.default_rng`。返回同长度副本；没有缺口时也返回副本。

非一维、未知方法、负噪声标准差或少于两个有效样本均会触发 `ValueError`。只有 NaN 被视为缺失标记；Inf 会进入插值并可能污染结果。填补值是合成数据，无法恢复缺失区间内未知的快速动力学；缺口长度接近或超过最高相关频率的周期时尤其难以解释。加噪可缓解填补区间过于光滑的问题，但不能恢复真实相位，也不能使填补样本相互独立。

示例：

```python
import numpy as np
from precision_physkit import preprocess

x = np.sin(2 * np.pi * np.arange(64) / 16)
x[20:24] = np.nan
y = preprocess.fill_gaps(x, method="pchip", fill_noise=True, seed=42)
assert np.isfinite(y).all()
```

小而稀疏的内部缺口可用 PCHIP；谱统计对局部方差敏感时，可设置 `fill_noise=True` 并固定种子。对于长缺口，应切段分析、标记无效区间或使用物理状态空间模型，不能把插值值视为观测。

#### `preprocess.whiten`

```python
whiten(x, fs, method="psd", nperseg=None)
```

本函数用 Welch 方法估计 PSD $\hat{S}_\mathrm{xx}(f)$，插值到整段实 FFT 的频率格点，再计算

$$
X_{\mathrm w}(f)=\frac{X(f)}
{\sqrt{\max\!\left(\hat{S}_\mathrm{xx}(f),\,10^{-12}\max \hat{S}_\mathrm{xx}\right)}},
\qquad
x_{\mathrm w}=\mathrm{irfft}(X_{\mathrm w}).
$$

理想情况下，输出噪声谱近似平坦。PSD 下限避免谱线之间接近零的估计导致数值爆炸。

只接受至少两个样本的一维实序列，且 $f_\mathrm{s}\gt 0$。目前 `method` 只能是 `"psd"`。`nperseg` 直接交给 `scipy.signal.welch`；`None` 使用 SciPy 默认的 256。返回与输入等长的一维浮点数组。

维度、长度、采样率、方法名不合法，或整个 PSD 没有正值时抛出 `ValueError`。源码没有显式拒绝 NaN/Inf，调用前必须清理。FFT 假定首尾周期连接，边界跳变会产生环绕伪影；可先去趋势或舍弃输出边缘。Welch 与整段 FFT 的归一化不同，因此输出的绝对幅值没有直接物理意义。强窄线可能因 PSD 平滑而未被完全压平。

示例：

```python
import numpy as np
from precision_physkit import preprocess

rng = np.random.default_rng(0)
t = np.arange(4096) / 1000.0
x = np.sin(2 * np.pi * 50 * t) + 0.1 * rng.normal(size=t.size)
xw = preprocess.whiten(x, fs=1000.0, nperseg=512)
assert xw.shape == x.shape
```

白化适用于峰检测、匹配滤波前的条件化，或减少低频噪声对时域最小二乘的影响。不要用白化后的幅值做绝对标定。窄线需要更精细的 PSD 时可增大 `nperseg`，代价是估计方差变大。

---

### `filters`：频带选择、陷波与平滑

#### Butterworth 的共同约定

`lowpass`、`highpass`、`bandpass`、`bandstop` 都以二阶节（SOS）实现，默认沿最后一轴工作。Butterworth 的特点是通带幅频响应最大平坦。以模拟低通原型说明，单程功率响应可写成

$$
|H(f)|^2=\frac{1}{1+(f/f_\mathrm{c})^{2n}},
$$

其中 $n$ 是阶数，$f_\mathrm{c}$ 是截止频率。数字滤波器由 SciPy 按给定 `fs` 设计。`zero_phase=True` 先正向再反向滤波，复合幅度为 $|H|^2$，功率响应进一步平方；相位延迟被消除，但总幅频响应与单程滤波不同。

共同约束为：`fs` 必须为正且有限，`order` 是正整数，所有截止频率严格处于 $0$ 与 $f_\mathrm{s}/2$ 之间。前后向 SOS 滤波需要边界填充，短序列可能由 SciPy 抛出 padding 相关 `ValueError`。

#### `filters.lowpass`

```python
lowpass(x, fs, cutoff, order=4, zero_phase=True)
```

本函数保留低于 `cutoff` 的慢变化，抑制高频噪声，常用于降采样前预限带。`cutoff` 是单程设计的 $-3\,\mathrm{dB}$ 截止频率。

`x` 可为任意维，沿最后一轴处理并返回同形数组。非法采样率、阶数或 `cutoff` 会触发 `ValueError`；数据过短时，`sosfiltfilt` 也可能抛错。截止频率过低会衰减真实的慢动态，零相位模式会使截止附近的总衰减强于单程设计。

示例：

```python
import numpy as np
from precision_physkit import filters

t = np.arange(2000) / 1000.0
x = np.sin(2*np.pi*5*t) + 0.5*np.sin(2*np.pi*200*t)
y = filters.lowpass(x, fs=1000.0, cutoff=50.0)
assert y.shape == x.shape
```

有明确上限带宽时使用。若下一步降采样，截止频率必须低于新 Nyquist，并留出过渡带。

#### `filters.highpass`

```python
highpass(x, fs, cutoff, order=4, zero_phase=True)
```

本函数抑制 DC、漂移和低频背景，保留高于 `cutoff` 的成分。参数、最后轴约定、返回形状和异常与 `lowpass` 相同。

高通会改变阶跃与慢趋势的边缘形状；前后向边界瞬态可能被误认为事件。若数据含很大的 DC 偏置，先减均值有助于数值解释。

示例：

```python
import numpy as np
from precision_physkit import filters

t = np.arange(2000) / 1000.0
x = 0.01*t + np.sin(2*np.pi*40*t)
y = filters.highpass(x, fs=1000.0, cutoff=5.0)
assert y.shape == x.shape
```

本函数可用于去漂移，但不能替代基线建模。若基线本身具有物理意义，应对其建模或另存未滤波数据。

#### `filters.bandpass`

```python
bandpass(x, fs, cutoff, order=4, zero_phase=True)
```

本函数仅保留 `(f_low, f_high)` 内的频带，由一个带通 SOS 同时施加高通与低通约束。`cutoff` 必须正好可拆成两个数且满足

$$
0\lt f_\mathrm{low}\lt f_\mathrm{high}\lt f_\mathrm{s}/2.
$$

函数沿最后一轴处理并返回同形数组。截止对无法解包、次序错误、越过 Nyquist，或共同参数不合法时抛出 `ValueError`。带宽过窄或阶数过高会增加瞬态和数值敏感性；SOS 实现已经降低了直接多项式实现的病态程度。

示例：

```python
import numpy as np
from precision_physkit import filters

t = np.arange(4000) / 1000.0
x = np.sin(2*np.pi*5*t) + np.sin(2*np.pi*100*t)
y = filters.bandpass(x, fs=1000.0, cutoff=(80.0, 120.0))
assert y.shape == x.shape
```

已知目标共振或载波频带时使用本函数。搜索未知峰时不要预先使用过窄的带通，否则会把选择偏差带入结果。

#### `filters.bandstop`

```python
bandstop(x, fs, cutoff, order=4, zero_phase=True)
```

本函数拒绝 `(f_low, f_high)`，保留两侧频带。参数、形状、返回和异常与 `bandpass` 相同。

宽阻带会删掉大量真实信号。若窄阻带只针对单根工频线，`notch` 的中心频率和 $Q$ 更容易解释。

示例：

```python
import numpy as np
from precision_physkit import filters

t = np.arange(4000) / 1000.0
x = np.sin(2*np.pi*10*t) + np.sin(2*np.pi*100*t)
y = filters.bandstop(x, fs=1000.0, cutoff=(95.0, 105.0))
assert y.shape == x.shape
```

去除已知宽干扰带时选择本函数；单频干扰优先使用 `notch`。

#### `filters.notch`

```python
notch(x, fs, f0, q=30, zero_phase=True)
```

本函数构造二阶 IIR 陷波器，去除中心频率 `f0`，典型用途是抑制 $50/60\,\mathrm{Hz}$ 工频。品质因数定义为

$$
Q=\frac{f_0}{B},
$$

其中 $B$ 是约 $-3\,\mathrm{dB}$ 带宽；源码文档给出的近似边界为
$f_0(1\pm 1/(2Q))$。$Q$ 越大，陷波越窄。

`x` 可为任意维，但始终沿最后一轴处理；中心频率满足 $0\lt f_0\lt f_\mathrm{s}/2$，品质因数满足 $Q\gt 0$。函数返回同形数组。零相位时使用 `filtfilt`，否则使用因果 `lfilter`。

非法 `fs`、`f0` 或非正 `q` 会触发 `ValueError`；短序列的前后向填充也可能失败。实际电网频率会漂移，过高的 $Q$ 可能漏掉漂移后的能量，过低的 $Q$ 则会影响邻近物理谱线。若有多个谐波，需要分别陷波。

示例：

```python
import numpy as np
from precision_physkit import filters

t = np.arange(2000) / 1000.0
x = np.sin(2*np.pi*10*t) + np.sin(2*np.pi*50*t)
y = filters.notch(x, fs=1000.0, f0=50.0, q=30)
assert y.shape == x.shape
```

只在原始谱已经确认干扰频率时使用，并比较陷波前后的目标频带。不要把所有窄峰都视为干扰。

#### `filters.savgol`

```python
savgol(x, window_length, polyorder, deriv=0, axis=-1)
```

在每个中心位置，本函数对窗口内样本用最小二乘拟合 `polyorder` 阶多项式

$$
p(u)=\sum_{k=0}^{d}a_k u^k,
$$

输出 $p(0)$ 或其 `deriv` 阶导数。相较移动平均，它更能保留低阶多项式趋势、峰高和峰宽。

`window_length` 必须为正奇数且不能超过所选轴长度；`polyorder` 是非负整数且小于窗口；`deriv` 是 `0` 到 `polyorder` 的整数。`axis` 可显式选择。返回同形数组。边界采用 SciPy 默认的 `"interp"`：用最近完整窗口的拟合多项式外评到边缘。

模块对窗口、阶数和导数阶显式抛出 `ValueError`；窗口超过轴长度等错误由 SciPy 抛出。源码固定 `delta=1`，因此一阶导数单位是“每样本”。物理导数应除以 $\Delta t$，一般 $r$ 阶导数除以 $(\Delta t)^r$。窗口过大会抹平窄峰，阶数过高会放大噪声并使边缘方差增大。

示例：

```python
import numpy as np
from precision_physkit import filters

fs = 100.0
t = np.arange(200) / fs
x = np.sin(2*np.pi*2*t) + 0.1*np.random.default_rng(0).normal(size=t.size)
dx_dt = filters.savgol(x, 11, 3, deriv=1) * fs
assert dx_dt.shape == x.shape
```

需要平滑并保留峰形或计算平滑导数时选择本函数。窗口应跨越多个噪声样本，但明显短于希望保留的结构尺度。

#### `filters.moving_average`

```python
moving_average(x, window, axis=-1)
```

本函数对长度 $M$ 的窗口做等权平均：

$$
y[i]=\frac1M
\sum_{j=i-\lfloor M/2\rfloor}^{i+\lfloor(M-1)/2\rfloor}x[j].
$$

其频率响应呈 sinc/Dirichlet 形，旁瓣较大，适合平滑，不适合高质量的频带分离。

`window` 是正整数，奇偶均可；沿 `axis` 处理，返回同形数组。偶数窗口按 `scipy.ndimage.uniform_filter1d(origin=0)` 的半样本约定居中。边界使用 `mode="nearest"` 复制最近端点，不补零。

非正或非整数窗口会触发 `ValueError`。大窗口会显著压低窄峰，边界处包含较少的不同样本；旁瓣使其无法干净地阻断带外能量。

示例：

```python
import numpy as np
from precision_physkit import filters

x = np.arange(10.0)
y = filters.moving_average(x, window=3)
assert y.shape == x.shape
```

本函数适合快速显示趋势或构造简单基线。需要明确截止频率时使用 Butterworth，需要保留峰形时使用 Savitzky–Golay。

#### 多通道滤波的轴

Butterworth 与 notch 没有 `axis` 参数，固定沿最后轴；Savitzky–Golay 和移动平均可指定轴：

```python
import numpy as np
from precision_physkit import filters

data = np.random.default_rng(0).normal(size=(2000, 3))  # (N, C)
low = filters.lowpass(data.T, fs=1000.0, cutoff=100.0).T
smooth = filters.savgol(data, window_length=51, polyorder=3, axis=0)
assert low.shape == smooth.shape == data.shape
```

---

### `spectral.Spectrum`：统一结果容器

所有公开谱估计器都返回 `Spectrum`：

```text
Spectrum(f, values, kind, scale, method, meta=<new empty dict>)
```

#### 属性

- `f`：形状 `(J,)`、单位为 $\mathrm{Hz}$ 的频率轴。
- `values`：`(J,)`、`(J, C)` 或 `lcsd_matrix` 的 `(J, C, C)`。
- `kind`：`"psd"`、`"csd"`、`"coherence"`、`"transfer"` 或 `"asd"`。
- `scale`：Welch 的 `"linear"` 或 LPSD 的 `"log"`。
- `method`：当前是 `"welch"` 或 `"lpsd"`。
- `meta`：估计参数字典；省略时会为每个实例新建独立空字典。Welch 包括
  `fs`、请求的 `nperseg`、`noverlap`、`window`、`detrend` 和
  `n_segments`，LPSD 包括 `fs`、`Jdes`、`Kdes`、`xi`。

PSD/ASD/coherence 是实值，CSD/transfer 是复值。直接构造 dataclass 时不会额外校验这些字段的一致性；正常使用应由估计器创建。

示例：

```python
import numpy as np
from precision_physkit import spectral

s = spectral.Spectrum(
    f=np.array([1.0, 2.0]),
    values=np.array([4.0, 9.0]),
    kind="psd", scale="linear", method="manual",
)
assert s.values.shape == s.f.shape
```

下游代码应读取 `kind`、`scale` 与 `meta`，不要根据函数名或数组形状猜测物理量。

#### `Spectrum.to_asd`

```python
spectrum.to_asd()
```

PSD 的单位是 $\mathrm{u}^2/\mathrm{Hz}$，ASD 定义为

$$
\mathrm{ASD}(f)=\sqrt{\mathrm{PSD}(f)},
$$

单位为 $\mathrm{u}/\sqrt{\mathrm{Hz}}$。方法仅接受 `kind="psd"` 或已经是 `"asd"` 的对象；其他种类抛出 `ValueError`。PSD 输入返回新的频率轴副本和逐元素平方根，`kind` 变为 `"asd"`，`meta["derived_from"]="psd"`。ASD 输入返回 dataclass 浅副本并复制 `meta`。

若手工构造的 PSD 含负值，平方根会产生 NaN。正常估计器的结果理论上非负，但仍应检查舍入或外部修改的影响。CSD、相干性和传递函数没有可解释的 ASD，不能取平方根。

示例：

```python
import numpy as np
from precision_physkit import spectral

psd = spectral.Spectrum(np.array([1.0]), np.array([4.0]), "psd", "linear", "demo")
asd = psd.to_asd()
assert asd.kind == "asd" and asd.values[0] == 2.0
```

展示噪声幅度底通常使用 ASD；做功率积分、方差核对或互谱运算时保留 PSD。

#### `Spectrum.to_dataframe`

```python
spectrum.to_dataframe()
```

一维 `values` 生成以 `kind` 命名的一列；二维 `(J,C)` 生成 `ch0` 到 `ch{C-1}`；`f` 成为名为 `"frequency"` 的索引，复数保持复数 dtype。三维 CSD 矩阵或其他形状抛 `ValueError`。Pandas 在调用时才导入。

示例：

```python
import numpy as np
from precision_physkit import spectral

s = spectral.Spectrum(np.array([1.0, 2.0]), np.array([3.0, 4.0]),
                      "psd", "linear", "demo")
df = s.to_dataframe()
assert df.index.name == "frequency" and list(df.columns) == ["psd"]
```

一维或逐通道谱可用本方法导出表格。`(J,C,C)` 矩阵应保存为 NPZ、HDF5，或拆成长表，不能直接调用本方法。

---

### Welch 系列：固定分辨率的分段平均

把长度 $L$ 的第 $k$ 段去趋势、乘窗 $w[n]$，再计算 DFT $X_k(f)$。PSD 的核心是窗口归一化后的平均周期图：

$$
\hat{S}_\mathrm{xx}(f)=\frac{1}{K}\sum_{k=1}^K
\frac{|X_k(f)|^2}{f_\mathrm{s}\sum_n w[n]^2},
$$

实信号的一侧谱除 DC/Nyquist 外包含相应倍增。频率间隔约为
$\Delta f=f_\mathrm{s}/L$。增大 `nperseg` 会提高频率分辨率，但减少平均次数并增加方差；减小它则相反。

四个函数共同接受 `(N,)` 或 `(N,C)`，多通道时按列独立或成对计算，返回 `(J,)` 或 `(J,C)`。`x` 与 `y` 必须同形。`fs` 必须是正有限标量。默认

$$
L=\min\!\left(N,\max(8,\lfloor N/8\rfloor)\right),
$$

重叠默认 `L // 2`。`window`、`detrend`、非法 `nperseg/noverlap` 的错误由 SciPy 抛出。代码只验证维度和非空，不拒绝 NaN/Inf；非有限值通常会传播到输出。

#### `spectral.welch_psd`

```python
welch_psd(x, fs, nperseg=None, noverlap=None,
          window="hann", detrend="constant")
```

本函数估计单通道或逐列自功率谱，返回 `kind="psd"`、`scale="linear"`、`method="welch"`。`values` 为 `(J,)` 或 `(J,C)`，`meta["n_segments"]` 给出按有效步长推算的段数。

非法 `fs`、输入维度不是 1 或 2、输入为空时会触发 `ValueError`。SciPy 可能调整过大的 `nperseg` 并发出警告，而本模块写入 `meta` 的仍是调用处变量，因此应主动设定合理值。短记录的谱方差很大；窗口会展宽窄线。

示例：

```python
import numpy as np
from precision_physkit import spectral

fs = 1000.0
t = np.arange(4096) / fs
x = np.sin(2*np.pi*50*t)
psd = spectral.welch_psd(x, fs, nperseg=1024)
assert psd.kind == "psd" and psd.values.shape == psd.f.shape
```

需要恒定 $\Delta f$、精确谱线定位或与传统频谱仪结果对照时，可优先选择本函数。

#### `spectral.welch_csd`

```python
welch_csd(x, y, fs, nperseg=None, noverlap=None,
          window="hann", detrend="constant")
```

本函数估计互功率谱

$$
\hat{S}_\mathrm{xy}(f)=\frac{1}{K}\sum_k X_k^*(f)Y_k(f),
$$

使用 SciPy 的共轭约定。相位 $\arg \hat{S}_\mathrm{xy}(f)$ 描述 `y` 相对 `x` 的频率相关相位。返回 `kind="csd"` 的复数组，形状 `(J,)` 或逐列 `(J,C)`。

除共同异常外，`x`、`y` 形状不同时会触发 `ValueError`。互谱绝对值同时受两路幅值影响，不能直接解释为传递增益；应结合自谱或使用 transfer。低信噪比处的相位会随机波动。

示例：

```python
import numpy as np
from precision_physkit import spectral

fs = 1000.0
t = np.arange(4096) / fs
x = np.sin(2*np.pi*40*t)
y = 2*np.sin(2*np.pi*40*t + 0.2)
csd = spectral.welch_csd(x, y, fs, nperseg=1024)
assert np.iscomplexobj(csd.values)
```

研究共同频率成分和相位时使用本函数；估计输入到输出的系统响应时使用 `welch_transfer`。

#### `spectral.welch_coherence`

```python
welch_coherence(x, y, fs, nperseg=None, noverlap=None,
                window="hann", detrend="constant")
```

本函数计算幅值平方相干性

$$
\hat{\gamma}_\mathrm{xy}^2(f)=
\frac{|\hat{S}_\mathrm{xy}(f)|^2}
{\hat{S}_\mathrm{xx}(f)\hat{S}_\mathrm{yy}(f)},
\qquad 0\le\hat{\gamma}_\mathrm{xy}^2(f)\le1.
$$

返回 `kind="coherence"` 的实数组 `(J,)` 或 `(J,C)`。

形状和共同参数不合法时抛出 `ValueError`，底层 SciPy 参数错误继续传播。有限样本下相干估计存在正偏差，尤其平均段数少时。高相干只说明该频点上存在稳定线性关系，不能证明因果，也不能排除共同驱动。段长短于系统长记忆时，相干性和 H1 估计可能同时偏置。

示例：

```python
import numpy as np
from precision_physkit import spectral

rng = np.random.default_rng(0)
x = rng.normal(size=8192)
y = np.convolve(x, [0.5, 0.3], mode="same") + 0.1*rng.normal(size=x.size)
coh = spectral.welch_coherence(x, y, fs=1000.0, nperseg=1024)
assert coh.kind == "coherence"
```

相干性可用作互谱、相位或传递函数的质量指标，不能单独证明变量之间存在关系。阈值应按任务和自由度制定；0.9 是严格门控示例，不是通用常数。

#### `spectral.welch_transfer`

```python
welch_transfer(x, y, fs, nperseg=None, noverlap=None,
               window="hann", detrend="constant",
               with_coherence=False)
```

本函数计算从输入 `x` 到输出 `y` 的 H1 估计：

$$
\hat{H}_1(f)=\frac{\hat{S}_\mathrm{xy}(f)}{\hat{S}_\mathrm{xx}(f)}.
$$

它适合输入测量噪声较小、主要噪声加在输出端的情形。返回 `kind="transfer"` 的复数组；`with_coherence=True` 时再计算一次相干性并存入 `meta["coherence"]`。

共同参数与形状错误会触发 `ValueError`。当 $\hat{S}_\mathrm{xx}(f)=0$ 时，除法得到 Inf/NaN；函数保留非有限值，不抛异常。输入噪声显著时 H1 存在向低偏差。冲激响应相对段长过长会带来泄漏偏差，应比较多个 `nperseg`。

相干门控示例：

```python
import numpy as np
from precision_physkit import spectral

rng = np.random.default_rng(0)
x = rng.normal(size=16384)
y = np.convolve(x, [0.2, 0.5, 0.2], mode="same") + 0.05*rng.normal(size=x.size)
H = spectral.welch_transfer(x, y, fs=1000.0, nperseg=2048,
                            with_coherence=True)
good = np.isfinite(H.values) & (H.meta["coherence"] > 0.9)
f_good, H_good = H.f[good], H.values[good]
assert f_good.shape == H_good.shape
```

输入端近似干净时可使用 H1，并配合相干门控和有限值检查。若输入噪声不可忽略，则需要误差变量模型或其他估计器；当前 API 没有 H2。

---

### LPSD 系列：对数频率轴与 Rust 内核

LPSD 为每个频点选择不同段长。Rust 频率规划从

$$
f_\mathrm{min}=\frac{f_\mathrm{s}}{N},\qquad
f_\mathrm{max}=\frac{f_\mathrm{s}}{2}
$$

开始，但循环条件是 $f_j\lt f_\mathrm{max}$，因此没有 DC，最后一个点严格低于 Nyquist。目标几何步进因子为

$$
g=\left(\frac{N}{2}\right)^{1/(J_\mathrm{des}-1)}-1,
$$

平均次数约束给出

$$
r_\mathrm{avg}=f_\mathrm{min}
\left[1+(1-\xi)(K_\mathrm{des}-1)\right].
$$

每个频点先取 $r_0=f_jg$；若 $r_0\lt r_\mathrm{avg}$，使用
$r_j=\sqrt{r_0r_\mathrm{avg}}$，再把它的下限限制为 $f_\mathrm{min}$。随后量化段长

$$
L_j=\left\lfloor\frac{f_\mathrm{s}}{r_j}\right\rfloor,\qquad
r_j\leftarrow\frac{f_\mathrm{s}}{L_j},\qquad
f_{j+1}=f_j+r_j.
$$

重叠比例 `xi` 对应跳步

$$
D_j=\max\!\left(1,\left\lfloor(1-\xi)L_j\right\rfloor\right),
\qquad
K_j=\left\lfloor\frac{N-L_j}{D_j}\right\rfloor+1.
$$

`Jdes`、`Kdes` 都是规划目标，不保证输出点数等于 $J$，也不保证每点的实际平均次数等于 $K_j$；频率轴应读取返回的 `Spectrum.f`。

每段先减均值，再乘对称 Hann 窗

$$
w[\ell]=\frac12\left[1-\cos\left(\frac{2\pi\ell}{L_j-1}\right)\right],
$$

然后只在目标频率计算

$$
A_k(f_j)=\sum_{\ell=0}^{L_j-1}
(x_k[\ell]-\bar{x}_k)w[\ell]
e^{-\mathrm{j}2\pi f_j\ell/f_\mathrm{s}}.
$$

一侧 PSD 的归一化为

$$
\hat{S}_\mathrm{xx}(f_j)=
\frac{2}{f_\mathrm{s}\sum_\ell w[\ell]^2K_j}
\sum_{k=1}^{K_j}|A_k(f_j)|^2.
$$

实现用预计算正余弦表避免递推相位漂移；不同频点可由 Rayon 并行，Python 调用期间释放 GIL。对称 Hann 的 $L=2$ 情况全零，规划若出现该段长会明确报错。

#### LPSD 共同参数、形状与异常

- `fs` 必须正且有限，`Jdes` 与 `Kdes` 均不小于 2，`xi` 满足 $0\le\xi\lt 1$。
- 数据至少两个样本、所有值有限；Rust 会拒绝 NaN/Inf。
- `parallel=True` 按频点并行；`False` 适合调试或避免线程争用。
- `lpsd` 接受 `(N,)` 或 `(N,C)`；pairwise API 接受同形的 `(N,)` 或 `(N,C)` 并逐列计算。
- 原生转换层把 `(1,N)` 行向量视为单向量，但 Python pairwise 包装会先按 `(N,C)` 逐列拆分。为避免 Welch/LPSD 解释不一致，公开代码不要传 `(1,N)`：单通道使用 `(N,)`，多通道使用 `(N,C)`。
- 数据太短、频率规划为空、最低频点所需段长超过记录长度，或规划出现 $L=2$ 时，Rust `CoreError` 映射为 Python `ValueError`。未构建 `precision_physkit._core` 时调用抛 `ImportError`。

#### `spectral.lpsd`

```python
lpsd(x, fs, Jdes=200, Kdes=100, xi=0.5, parallel=True)
```

本函数估计对数频率轴上的一侧 PSD。单通道返回 `(J,)`，多通道返回 `(J,C)`；容器为 `kind="psd"`、`scale="log"`、`method="lpsd"`。

不要自行重建对数轴，也不要假定频率轴包含 DC 或 Nyquist 点。低频分辨率取决于总记录长度；提高 `Kdes` 会改变规划，并可能牺牲低频细节。宽频段噪声展示可优先使用本函数，窄线精确定位则优先使用 Welch。

示例：

```python
import numpy as np
from precision_physkit import spectral

x = np.random.default_rng(0).normal(size=32768)
psd = spectral.lpsd(x, fs=1024.0, Jdes=120, Kdes=40)
assert psd.scale == "log" and psd.values.shape == psd.f.shape
```

#### `spectral.lcsd`

```python
lcsd(x, y, fs, Jdes=200, Kdes=100, xi=0.5, parallel=True)
```

本函数使用

$$
\hat{S}_\mathrm{xy}(f_j)=
\frac{2}{f_\mathrm{s}\sum_\ell w[\ell]^2K_j}
\sum_k A_{\mathrm{x},k}^*(f_j)A_{\mathrm{y},k}(f_j)
$$

估计复互谱。若 $Y(f)=H(f)X(f)$，该共轭约定给出
$\hat{S}_\mathrm{xy}(f)=H(f)\hat{S}_\mathrm{xx}(f)$。返回 `(J,)` 或逐列 `(J,C)`，`kind="csd"`。

除共同异常外，`x`、`y` 形状必须相同。低相干频点的相位不可解释。需要跨数量级分析共同成分与相位时选择本函数；需要固定分辨率时选择 `welch_csd`。

示例：

```python
import numpy as np
from precision_physkit import spectral

rng = np.random.default_rng(0)
x = rng.normal(size=32768)
y = np.roll(x, 2) + 0.1*rng.normal(size=x.size)
Sxy = spectral.lcsd(x, y, fs=1024.0, Jdes=100, Kdes=30)
assert np.iscomplexobj(Sxy.values)
```

#### `spectral.lcoherence`

```python
lcoherence(x, y, fs, Jdes=200, Kdes=100, xi=0.5, parallel=True)
```

本函数按 LPSD 分段估计

$$
\hat{\gamma}_\mathrm{xy}^2(f)=
\frac{|\hat{S}_\mathrm{xy}(f)|^2}
{\hat{S}_\mathrm{xx}(f)\hat{S}_\mathrm{yy}(f)}.
$$

Rust 将有限结果夹在 `[0,1]`；分母为零时返回 NaN。输出 `(J,)` 或 `(J,C)` 的实值 `Spectrum(kind="coherence")`。

共同异常和配对形状约束同样适用。相干估计仍受有限平均次数、共同输入和长记忆偏差影响。它可用于评价 `lcsd` 或 `ltransfer` 的可信频点，不能单独用于推断因果。

示例：

```python
import numpy as np
from precision_physkit import spectral

rng = np.random.default_rng(0)
x = rng.normal(size=32768)
y = x + 0.2*rng.normal(size=x.size)
coh = spectral.lcoherence(x, y, fs=1024.0, Jdes=100, Kdes=30)
assert coh.kind == "coherence"
```

#### `spectral.ltransfer`

```python
ltransfer(x, y, fs, Jdes=200, Kdes=100, xi=0.5,
          parallel=True, with_coherence=False)
```

本函数计算 LPSD 网格上的 H1 估计：

$$
\hat{H}_1(f_j)=
\frac{\hat{S}_\mathrm{xy}(f_j)}{\hat{S}_\mathrm{xx}(f_j)}.
$$

输出复数 `(J,)` 或 `(J,C)`，`kind="transfer"`。`with_coherence=True` 会再次运行成对 LPSD 相干性估计并存入 `meta["coherence"]`，因此运行时间大致加倍。

共同异常同样适用；$\hat{S}_\mathrm{xx}(f)=0$ 时返回复 NaN，不抛异常。H1 的输入噪声偏差、段长相对冲激响应不足等问题与 Welch 相同。结果必须同时经过有限值检查和相干门控。

门控示例：

```python
import numpy as np
from precision_physkit import spectral

rng = np.random.default_rng(0)
x = rng.normal(size=32768)
y = np.convolve(x, [0.3, 0.5, 0.2], mode="same") + 0.05*rng.normal(size=x.size)
H = spectral.ltransfer(x, y, fs=1024.0, Jdes=120, Kdes=40,
                       with_coherence=True)
good = np.isfinite(H.values) & (H.meta["coherence"] > 0.9)
assert good.shape == H.values.shape
```

跨多个数量级观察系统响应时使用本函数。如果需要精确的等间隔频率响应，或需要与固定 FFT 设置比较，则使用 `welch_transfer`。

#### `spectral.lcsd_matrix`

```python
lcsd_matrix(X, fs, Jdes=200, Kdes=100, xi=0.5, parallel=True)
```

本函数一次构造所有通道对的矩阵

$$
\hat{\mathbf{S}}(f_j)_{ab}=
\frac{2}{f_\mathrm{s}\sum_\ell w[\ell]^2K_j}
\sum_k A_{a,k}^*(f_j)A_{b,k}(f_j).
$$

每个 `(C,C)` 切片都是 Hermitian 矩阵，满足
$\hat{\mathbf{S}}_{ba}=\hat{\mathbf{S}}_{ab}^*$；对角线是各通道的实 PSD，虚部按构造为零。

Python API 明确要求二维数组 `X.shape == (N,C)`，返回 `values.shape == (J,C,C)`，并在 `meta["n_channels"]` 中记录 $C$。`Spectrum.to_dataframe()` 不支持这个三维结果。

非二维输入先由 Python 抛出 `ValueError`；之后适用全部 LPSD 有限性和规划异常。不要传 `(1,N)`：虽然它能通过二维检查，但原生层会按行向量语义视为一个通道，Python 元数据则按第二维记录通道数，两者语义不一致。输入必须整理为真正的 `(N,C)`。内存量随 $JC^2$ 增长。

示例：

```python
import numpy as np
from precision_physkit import spectral

rng = np.random.default_rng(0)
x = rng.normal(size=32768)
X = np.column_stack([x, x + 0.2*rng.normal(size=x.size)])
S = spectral.lcsd_matrix(X, fs=1024.0, Jdes=80, Kdes=30)
assert S.values.shape[1:] == (2, 2)
assert np.allclose(S.values, np.swapaxes(S.values.conj(), 1, 2))
```

多传感器阵列、模态分析或后续矩阵分解需要所有通道对时使用本函数；只关心少数配对时，逐对调用 `lcsd` 更节省内存。

---

### Welch 与 LPSD 的选择及验收

1. 先保证输入可解释。 明确 `fs`，处理 NaN/Inf，非均匀时间戳先重网格；缺口填补必须记录处理溯源。
2. 按目标选频率轴。 Welch 的 $\Delta f=f_\mathrm{s}/L$ 固定，适合谱线定位；LPSD 的频点和段长随频率变化，适合跨数量级噪声。
3. 检查形状。 单通道用 `(N,)`，多通道用 `(N,C)`，避免 `(1,N)`。
4. 检查统计自由度。 Welch 查看 `meta["n_segments"]`；LPSD 的实际 $K_j$ 不暴露在 Python `meta` 中，不能把 `Kdes` 当成每点精确平均次数。
5. 传递函数必须门控。

```python
import numpy as np
from precision_physkit import spectral

def trusted_transfer(x, y, fs, *, log_axis=False, threshold=0.9):
    estimator = spectral.ltransfer if log_axis else spectral.welch_transfer
    result = estimator(x, y, fs, with_coherence=True)
    coherence = np.asarray(result.meta["coherence"])
    mask = np.isfinite(result.values) & np.isfinite(coherence)
    mask &= coherence >= threshold
    return result.f[mask], result.values[mask]
```

阈值必须结合平均次数、误报代价和物理带宽确定。相干门控能排除明显不可信频点，但不能修复不平稳、共同驱动、输入噪声或段长短于系统记忆造成的系统偏差。

### 公开 API 覆盖清单

- `preprocess`：`downsample`、`upsample`、`resample`、`interpolate`、`fill_gaps`、`whiten`。
- `filters`：`lowpass`、`highpass`、`bandpass`、`bandstop`、`notch`、`savgol`、`moving_average`。
- `spectral`：`Spectrum` 及其 `to_asd`、`to_dataframe`；`welch_psd`、`welch_csd`、`welch_coherence`、`welch_transfer`；`lpsd`、`lcsd`、`lcoherence`、`ltransfer`、`lcsd_matrix`。



::alert{type="tip" title="第二部分完成：先判断信息是否可信，再进入参数推断"}
谱峰、相干频带和传递函数已经给出候选结构；但峰的位置、线宽、面积和模型参数仍需要显式拟合。进入下一部分前，请保留未滤波数据，并记录缺口填补、滤波器和谱估计的全部参数。
::

::link-card{title="继续：拟合、优化与峰分析" eyebrow="PART III" href="#part-fitting"}
把候选结构转化为带不确定度、残差与收敛诊断的参数结果。
::

---

<a id="part-fitting"></a>

## 拟合、优化与峰分析

三个模块分别承担拟合、优化和峰分析：

- `precision_physkit.fitting`：把观测数据映射为带协方差和拟合优度的参数估计；
- `precision_physkit.optimize`：直接最小化标量目标或残差平方和；
- `precision_physkit.peaks`：从序列中检测峰、拟合线形并计算峰面积。

常见分析顺序是“检测候选峰 → 选择物理模型 → 拟合参数 → 检查协方差、残差与收敛状态”。不能只看 `success`：病态矩阵可以成功求出截断解，全局优化器也不能证明找到了全局最优点。

```python
import numpy as np

from precision_physkit import fitting, optimize, peaks
```

### 统一理解拟合结果：`fitting.FitResult`

构造签名对应的数据类字段为：

```text
fitting.FitResult(
    params, perr, cov, resid, success, message, stats=<new empty dict>
)
```

通常不直接构造它，而是接收 `curve_fit`、`linear_lstsq`、`iterative_multichannel` 或 `polyfit` 的返回值。

- `params: dict[str, float]`：按名称组织的参数估计；
- `perr: dict[str, float]`：由协方差对角线计算的 $1\,\sigma$ 标准不确定度，
  $\sigma_{\hat{\theta}_j}=\sqrt{\widehat{\mathrm{Cov}}(\hat{\boldsymbol{\theta}})_{jj}}$；
- `cov: ndarray`：参数协方差矩阵；
- `resid: ndarray`：未加权残差
  $\boldsymbol{r}=\boldsymbol{y}-\hat{\boldsymbol{y}}$；
- `success: bool` 与 `message: str`：求解状态及说明；
- `stats: dict`：通用统计量及求解器专属诊断；省略时会为每个实例新建独立空字典。

通用统计量采用

$$
\chi^2 =
\begin{cases}
\sum_i (r_i/\sigma_i)^2, & \boldsymbol{\sigma}\in\mathbb{R}^{N},\\
\sum_i r_i^2, & \mathrm{otherwise},
\end{cases}
$$

$$
\chi_\nu^2=\frac{\chi^2}{N-P},\qquad
R^2=1-\frac{\sum_i r_i^2}{\sum_i(y_i-\bar{y})^2}.
$$

对应键为 `chi2`、`redchi`、`r2` 和 `dof`。当 $N\le P$ 时 `redchi` 为 `nan`；当 $y$ 为常数、总平方和为零时 `r2` 为 `nan`。二维 `sigma` 虽会传给 SciPy 参与拟合，但当前包装器的 `stats["chi2"]` 不使用其逆协方差，而退回未加权残差平方和。

下面用一次线性拟合查看这些字段：

```python
x = np.linspace(0.0, 1.0, 20)
y = 1.0 + 2.0 * x
result = fitting.polyfit(x, y, deg=1)

print(result.params)          # {'c0': ..., 'c1': ...}
print(result.perr)
print(result.success, result.message)
print(result.stats["rank"], result.stats["r2"])
```

`fitting` 中的公开估计器都返回 `FitResult`。审计时统一读取该对象；报告参数时至少同时检查 `success`、`message`、`perr`、残差和相关的秩或迭代信息。

### 非线性曲线拟合：`fitting.curve_fit`

签名：

```text
fitting.curve_fit(
    model,
    x,
    y,
    p0=None,
    sigma=None,
    bounds=(-np.inf, np.inf),
    param_names=None,
    raise_on_failure=False,
    **kw,
) -> fitting.FitResult
```

它是 `scipy.optimize.curve_fit` 的薄包装，拟合

$$
y_i=f(x_i;\boldsymbol{\theta})+\varepsilon_i
$$

并最小化残差平方和；给出一维 `sigma` 时，目标相当于加权最小二乘

$$
\min_{\boldsymbol{\theta}}
\sum_i\left[\frac{y_i-f(x_i;\boldsymbol{\theta})}{\sigma_i}\right]^2.
$$

参数说明：

- `model(x, *params)` 返回模型值，独立变量必须是第一个参数；
- `x`、`y` 是观测数组；
- `p0` 是初值；省略时由 SciPy 检查函数签名并以 1 初始化参数；
- `sigma` 可是一维标准差或二维观测协方差；
- `bounds=(lower, upper)` 给出逐参数边界；
- `param_names` 显式指定结果字典中的名称；
- `raise_on_failure=False` 时把异常转换为失败结果，设为 `True` 时原样重抛；
- `**kw` 原样传给 SciPy，例如 `absolute_sigma=True`、`maxfev=...`。

参数名先取显式 `param_names`；未提供时从 `model` 的位置参数推断；仍无法推断时自动生成 `p0`、`p1`……。显式名称不足时会补自动名称，过多时会截断到参数个数。

`absolute_sigma` 决定协方差尺度。若已知测量标准差的绝对值，应使用 `sigma=...` 和 `absolute_sigma=True`；否则 SciPy 会按拟合后的约化卡方缩放协方差。平坦方向或参数不可辨识时，协方差及 `perr` 可能出现 `inf`；负的协方差对角元素会映射为 `nan`。

下面拟合带已知噪声的 Gaussian：

```python
rng = np.random.default_rng(7)
x = np.linspace(-2.0, 4.0, 400)

def gaussian(x, amplitude, center, sigma):
    return amplitude * np.exp(-0.5 * ((x - center) / sigma) ** 2)

y_sigma = np.full(x.size, 0.02)
y = gaussian(x, 2.5, 1.3, 0.4) + rng.normal(0.0, y_sigma)

result = fitting.curve_fit(
    gaussian,
    x,
    y,
    p0=[2.0, 1.0, 0.5],
    sigma=y_sigma,
    absolute_sigma=True,
    bounds=([0.0, x.min(), 1e-6], [np.inf, x.max(), np.inf]),
)
if not result.success:
    raise RuntimeError(result.message)

print(result.params["center"], result.perr["center"])
print(result.stats["redchi"], result.stats["r2"])
```

失败时，默认返回 `success=False`，`message` 保留异常类型和文本，已知参数名映射到 `nan`，`cov` 为 `(0, 0)` 空矩阵，`resid` 为空。初值差、边界不合理、参数高度相关、数据点少于参数数目都可能失败或产生无意义协方差。

模型可直接写成 $y=f(x;\boldsymbol{\theta})$，且分析需要命名参数和协方差时，适合使用该函数。若问题天然写成残差向量，或需要稳健损失和更细的最小二乘控制，则使用 `optimize.least_squares`。

### 截断 SVD 线性最小二乘：`fitting.linear_lstsq`

签名：

```text
fitting.linear_lstsq(
    design, y, rcond=None, param_names=None
) -> fitting.FitResult
```

它通过 Rust 内核求解

$$
\min_{\boldsymbol{\theta}}
\left\|\mathbf{A}\boldsymbol{\theta}-\boldsymbol{y}\right\|_2.
$$

对设计矩阵作奇异值分解

$$
\mathbf{A}=\mathbf{U}\mathbf{\Sigma}\mathbf{V}^{\mathsf{T}},
$$

仅保留满足

$$
s_i\gt \mathrm{rcond}\,s_\mathrm{max}
$$

的奇异值，并计算

$$
\hat{\boldsymbol{\theta}}
=\mathbf{V}\mathbf{\Sigma}^{+}\mathbf{U}^{\mathsf{T}}\boldsymbol{y}.
$$

`rcond=None` 时，Rust 内核采用

$$
\mathrm{rcond}=\max(N,P)\,\epsilon_{\mathrm{f64}}.
$$

截断会阻止 $1/s_i$ 放大噪声，但把被舍弃方向投影掉，因此是在方差与偏差之间取舍。`stats["rank"]` 是保留奇异值的个数，`stats["rcond"]` 保存调用时传入的值；默认时该键仍为 `None`，不是内核展开后的数值。

Rust 内核的协方差估计为

$$
\widehat{\mathrm{Cov}}(\hat{\boldsymbol{\theta}})
=\hat{\sigma}^2
\mathbf{V}_{r_\mathrm{rank}}
\mathrm{diag}\!\left(s_i^{-2}\right)
\mathbf{V}_{r_\mathrm{rank}}^{\mathsf{T}},
\qquad
\hat{\sigma}^2
=\frac{\|\boldsymbol{r}\|_2^2}{N-r_\mathrm{rank}},
$$

其中 $r_\mathrm{rank}$ 是数值秩。`FitResult.stats["dof"]` 的通用统计实现使用 $N-P$，协方差内部则使用 $N-r_\mathrm{rank}$；秩亏时两者不同。

参数要求：`design` 必须是 `(N, P)` 二维矩阵，`y` 必须是长度 `N` 的一维数组；Rust 内核还拒绝空矩阵、`NaN`、`Inf` 及非正或非有限 `rcond`。扩展未构建时抛出 `ImportError`。

下面从随机设计矩阵恢复三个系数：

```python
rng = np.random.default_rng(8)
A = rng.normal(size=(200, 3))
theta_true = np.array([1.5, -2.0, 0.7])
y = A @ theta_true + 0.01 * rng.normal(size=A.shape[0])

result = fitting.linear_lstsq(
    A, y, param_names=["offset", "gain", "drift"]
)
theta = np.array([result.params[k] for k in ("offset", "gain", "drift")])
print(theta)
print(result.stats["rank"], result.message)
```

秩亏时，截断子空间仍有合法的最小范数解，因此 `success` 保持 `True`，`message` 则报告 $r_\mathrm{rank}\lt P$。这表示部分模型参数不可辨识。

该函数适合对参数线性的模型，也能稳定处理共线或近共线设计。优先通过中心化、缩放和重新参数化改善条件数；不要仅靠增大 `rcond` 掩盖错误模型。

### 多通道迭代加权最小二乘：`fitting.iterative_multichannel`

签名：

```text
fitting.iterative_multichannel(
    design,
    y,
    group_sizes,
    max_iter=100,
    tol=1e-12,
    param_names=None,
) -> fitting.FitResult
```

它用于多个通道共享同一参数向量、各通道噪声方差未知且不同的线性系统。`design` 和 `y` 的行必须按通道连续堆叠，`group_sizes=(n_1,\ldots,n_G)` 描述每个连续块。

第 $k$ 轮先解

$$
\hat{\boldsymbol{\theta}}^{(k)}
=\operatorname*{arg\,min}_{\boldsymbol{\theta}}
\sum_{g=1}^{G}
\hat{w}_g^{(k)}
\left\|\mathbf{A}_g\boldsymbol{\theta}-\boldsymbol{y}_g\right\|_2^2,
$$

实现上把第 $g$ 块的行乘以 $\sqrt{\hat{w}_g^{(k)}}$，再调用默认阈值的截断 SVD。随后根据未缩放模型的残差估计

$$
\hat{\sigma}_g^2
=\frac{
\left\|\boldsymbol{y}_g-\mathbf{A}_g\hat{\boldsymbol{\theta}}^{(k)}\right\|_2^2
}{n_g},
\qquad
\tilde{w}_g=\frac{1}{\hat{\sigma}_g^2},
$$

并归一化为均值 1：

$$
\hat{w}_g=\frac{\tilde{w}_g}{G^{-1}\sum_h\tilde{w}_h}.
$$

公共缩放不改变参数解，只改善数值尺度。零残差方差会被抬到 `f64::MIN_POSITIVE`，避免除零。初始权重全为 1，所以第一轮是普通最小二乘。

从第二轮起，当

$$
\frac{
\left\|\hat{\boldsymbol{\theta}}^{(k)}
-\hat{\boldsymbol{\theta}}^{(k-1)}\right\|_2
}{
\max\!\left(
\left\|\hat{\boldsymbol{\theta}}^{(k-1)}\right\|_2,
10^{-300}
\right)
}
\lt \mathrm{tol}
$$

时收敛。`stats` 额外包含 `n_iter`、均值为 1 的 `weights` 和 `tol`。不收敛时仍返回终止时的参数，但 `success=False`，应检查 `message`。

下面构造噪声标准差相差十倍的两个通道：

```python
rng = np.random.default_rng(9)
n1 = n2 = 300
t = np.linspace(0.0, 1.0, n1)
A1 = np.column_stack([np.ones(n1), t])
A2 = np.column_stack([np.ones(n2), t])
A = np.vstack([A1, A2])
theta_true = np.array([2.0, 3.0])
y = np.concatenate([
    A1 @ theta_true + 0.05 * rng.normal(size=n1),
    A2 @ theta_true + 0.50 * rng.normal(size=n2),
])

result = fitting.iterative_multichannel(
    A, y, (n1, n2), param_names=["offset", "slope"]
)
print(result.params)
print(result.stats["weights"])  # 低噪声通道获得更大权重
print(result.stats["n_iter"], result.success)
```

若两个通道标准差之比约为 $10$，权重比理论上约为 $10^2$。最终 `cov` 是归一化权重下的
$(\mathbf{A}^{\mathsf{T}}\mathbf{W}\mathbf{A})^+$，没有乘回未知的公共噪声尺度；因此 `perr` 不能直接解释为绝对测量不确定度，需要根据已知的公共尺度重标定。

`group_sizes` 必须非空、均为正数且总和为 `N`；`max_iter` 必须至少为 1，`tol` 必须为正且有限。还应警惕通道内相关噪声：当前权重模型只估计每通道一个标量方差，不表示完整噪声协方差。

多台传感器或多段数据共享物理参数、噪声水平不同且未知时，可用该函数联合估计。已知完整协方差时应直接构造相应 GLS/WLS，无需重新估计通道标量权重。

### 多项式拟合：`fitting.polyfit`

签名：

```text
fitting.polyfit(x, y, deg) -> fitting.FitResult
```

它建立升幂 Vandermonde 矩阵

$$
\mathbf{A}_{ij}=x_i^j,\qquad j=0,\ldots,d,
$$

再调用 `linear_lstsq`。返回参数按

$$
p(x)=c_0+c_1x+\cdots+c_dx^d
$$

排列，即 `c0` 是常数项、`cdeg` 是最高次项。这与 `numpy.polyfit` 的降幂顺序相反。

二次多项式示例：

```python
x = np.linspace(-2.0, 2.0, 101)
y = 0.5 - 1.0 * x + 2.0 * x**2
result = fitting.polyfit(x, y, deg=2)

y_hat = sum(result.params[f"c{i}"] * x**i for i in range(3))
print(result.params)
print(np.max(np.abs(y - y_hat)))
```

`x`、`y` 必须是一维等长数组，且 $d\ge 0$。高次 Vandermonde 矩阵极易病态；实现文档建议约 5–7 次以上先对 `x` 做中心化和尺度归一，并检查 `stats["rank"]`。

低阶趋势、标定曲线或需要升幂命名系数时，可用 `polyfit`。高阶外推、宽动态范围横坐标或需要正交基时，应改用缩放变量、Chebyshev 等更稳定的基。

### 统一理解优化结果：`optimize.OptimizeResult`

数据类字段为：

```python
optimize.OptimizeResult(
    x, fun, success, message, n_eval, history=None
)
```

- `x`：求得的参数向量；
- `fun`：标量目标值；对 `least_squares` 特指
  $\frac{1}{2}\sum_i r_i^2$；
- `success`、`message`：SciPy 的终止状态；
- `n_eval`：目标或残差函数求值次数 `nfev`；
- `history`：为未来迭代历史预留，当前始终为 `None`。

返回字段可直接读取：

```python
result = optimize.minimize(lambda v: (v[0] - 2.0) ** 2, x0=[0.0])
print(result.x, result.fun, result.n_eval, result.history)
```

三个优化包装器都返回此对象。非收敛通常不抛异常，所以每次都要检查 `success` 和 `message`；输入非法、方法未知或初值不可行等配置错误仍会抛异常。

### 局部标量优化：`optimize.minimize`

签名：

```text
optimize.minimize(
    func,
    x0,
    method="Nelder-Mead",
    bounds=None,
    jac=None,
    **kw,
) -> optimize.OptimizeResult
```

目标是

$$
\min_{\boldsymbol{x}} f(\boldsymbol{x}).
$$

`func(x)` 返回标量，`x0` 是起点；`method`、`bounds`、`jac` 及 `**kw` 直接交给 `scipy.optimize.minimize`。默认 Nelder–Mead 不需要梯度，适合低维、带噪或不够光滑的目标，但它是局部方法且尺度敏感。光滑高维问题可选择 `L-BFGS-B` 等方法并提供梯度；边界只有在所选方法支持时才生效。

带边界示例：

```python
def objective(v):
    return (v[0] - 10.0) ** 2

result = optimize.minimize(
    objective,
    x0=[0.0],
    method="L-BFGS-B",
    bounds=[(-5.0, 5.0)],
)
print(result.x, result.fun)  # 受约束最优点位于 5
```

`success=True` 仅表示满足该算法的终止判据。应从多个初值重复、缩放参数、检查边界和目标有限性；梯度错误、平台区、局部极小或达到迭代上限都可能造成误判。

已有可信初值或目标近似单峰时，可从该局部优化器开始；多峰目标先全局搜索再局部精修。

### 全局标量优化：`optimize.global_minimize`

签名：

```text
optimize.global_minimize(
    func,
    bounds,
    method="differential_evolution",
    seed=None,
    **kw,
) -> optimize.OptimizeResult
```

当前唯一支持的方法是 `"differential_evolution"`；其他字符串立即触发 `ValueError`。差分进化维护边界盒内的种群，通过个体差分构造候选，不需要梯度，也不需要 `x0`。`bounds` 必须为每个参数给出有限的 `(min, max)`。

Rastrigin 函数示例：

```python
def rastrigin(v):
    v = np.asarray(v)
    return float(
        10.0 * v.size
        + np.sum(v**2 - 10.0 * np.cos(2.0 * np.pi * v))
    )

result = optimize.global_minimize(
    rastrigin,
    bounds=[(-5.12, 5.12), (-5.12, 5.12)],
    seed=42,
)
print(result.x, result.fun, result.success)
```

`seed` 可为整数或 `numpy.random.Generator`。科研流水线应固定并记录 seed；还可通过 `maxiter`、`popsize`、`tol`、`polish`、`workers` 等 `**kw` 控制 SciPy。相同 seed 用于相同环境时可复现搜索路径。

`success=True` 不是全局最优证明，只说明算法正常终止。应检查多 seed 一致性、边界是否足够宽、最优点是否贴边，以及局部精修后是否稳定。

多峰、非凸、缺少可靠初值且参数有有限物理边界时，可用差分进化搜索。维数高或单次目标计算昂贵时成本会很大，应结合领域约束缩小搜索盒。

### 残差形式的非线性最小二乘：`optimize.least_squares`

签名：

```text
optimize.least_squares(
    residual,
    x0,
    bounds=(-np.inf, np.inf),
    **kw,
) -> optimize.OptimizeResult
```

它最小化

$$
F(\boldsymbol{x})
=\frac{1}{2}\sum_{i=1}^{M}r_i(\boldsymbol{x})^2.
$$

并支持参数盒约束。`residual(x)` 必须返回一维残差向量，`x0` 必须位于边界内；`method`、`loss="soft_l1"`、`x_scale` 等选项通过 `**kw` 传递给 SciPy。

指数衰减残差示例：

```python
rng = np.random.default_rng(10)
t = np.linspace(0.0, 5.0, 200)
y = 2.5 * np.exp(-t / 0.7) + 0.01 * rng.normal(size=t.size)

def residual(p):
    amplitude, tau = p
    return amplitude * np.exp(-t / tau) - y

result = optimize.least_squares(
    residual,
    x0=[1.0, 1.0],
    bounds=([0.0, 1e-6], [np.inf, np.inf]),
)
print(result.x, result.fun)
print(np.allclose(result.fun, 0.5 * np.sum(residual(result.x) ** 2)))
```

返回值不含残差向量、参数协方差或命名参数；需要时应再次计算 `residual(result.x)`。不可行初值、形状不一致等 `ValueError` 会由 SciPy 传播。稳健损失改变目标的统计解释，不能再把 `2*fun` 直接当作普通高斯残差的卡方。

残差有自然分块、需要稳健损失或自定义 Jacobian 时，`least_squares` 更合适。需要观测 `sigma`、自动参数名和协方差时使用 `fitting.curve_fit`。

### 检测峰记录：`peaks.Peak`

不可变数据类的字段为：

```python
peaks.Peak(
    index,
    position,
    height,
    prominence,
    width,
    fwhm,
    area,
    left_base,
    right_base,
)
```

- `index` 是峰顶样本索引；
- `position` 是 `x_axis[index]`，未给坐标轴时为浮点样本索引；
- `height` 是相对零点的原始高度，不扣背景；
- `prominence` 是峰顶到最低等高线的垂直距离；
- `width` 是 `rel_height=1.0` 的 prominence 基底全宽；
- `fwhm` 是 `rel_height=0.5` 的半 prominence 全宽；
- `area` 是左右基底间原始信号的梯形积分，包含背景；
- `left_base`、`right_base` 始终是插值得到的分数样本索引，与物理坐标无关。

从检测结果读取记录：

```python
axis = np.linspace(-5.0, 5.0, 1001)
signal = np.exp(-0.5 * (axis / 0.4) ** 2)
detected = peaks.find_peaks(signal, prominence=0.2, x_axis=axis)
peak = detected.peaks[0]
print(peak.index, peak.position, peak.fwhm, peak.area)
```

`Peak` 保存一次快速检测的几何描述。定量报告净峰面积时，不应直接使用其含背景的 `area`。

### 检测结果容器：`peaks.PeakAnalysisResult`

构造字段与公开行为：

```python
peaks.PeakAnalysisResult(peaks, x_axis=None)
```

- `len(result)` 调用 `__len__` 返回峰数；
- `iter(result)` 调用 `__iter__`，按检测位置顺序遍历 `Peak`；
- `positions`、`heights`、`prominences`、`fwhms` 属性分别返回 NumPy 数组；
- `x_axis` 保存物理坐标数组；样本坐标模式下为 `None`。

容器支持批量读取和迭代：

```python
signal = np.array([0.0, 1.0, 0.0, 2.0, 0.0])
result = peaks.find_peaks(signal, prominence=0.5)
print(len(result), result.positions, result.heights)
for peak in result:
    print(peak.index, peak.prominence)
```

空结果是正常状态：`len(result) == 0`，各向量属性为空数组，不抛异常。

该容器便于批量筛选、绘图，也可把候选索引交给 `fit_peaks`。

### 峰检测：`peaks.find_peaks`

签名：

```text
peaks.find_peaks(
    x,
    height=None,
    prominence=None,
    distance=None,
    width=None,
    x_axis=None,
) -> peaks.PeakAnalysisResult
```

`x` 是要搜索的一维信号；这里的参数名 `x` 表示信号值，不是坐标。`height`、`prominence`、`distance`、`width` 传给 `scipy.signal.find_peaks`：

- `height`：最低原始峰高；
- `prominence`：最低突出度，较能抵抗缓慢背景；
- `distance`：相邻峰最小样本间距；
- `width`：半 prominence 处的最小样本宽度；
- `x_axis`：可选的一维严格递增物理坐标，长度必须与信号相同。

即使给出 `x_axis`，用于筛选的 `distance` 和 `width` 仍按样本数解释；仅返回的 `position`、`width`、`fwhm` 和 `area` 会换算到物理坐标。

FWHM 是半突出度宽度。峰位于近零平坦背景时，它近似通常所说的半高全宽；背景复杂或峰重叠时，两者可能不同。面积使用分数索引处线性插值端点和梯形积分。

下面检测两条 Gaussian 谱线：

```python
frequency = np.linspace(0.0, 100.0, 2001)
spectrum = (
    1.5 * np.exp(-0.5 * ((frequency - 30.0) / 0.3) ** 2)
    + 2.0 * np.exp(-0.5 * ((frequency - 70.0) / 0.6) ** 2)
)
result = peaks.find_peaks(
    spectrum,
    prominence=0.1,
    distance=100,
    x_axis=frequency,
)
print(result.positions, result.fwhms)
```

输入不是一维、`x_axis` 形状不符或不严格递增时抛 `ValueError`。阈值过低会把噪声当峰，过高会漏检；重叠峰的 prominence 基底和宽度也会相互影响。

`find_peaks` 适合快速、非参数地获得候选峰。若需要亚采样峰心、物理线宽、共享背景或参数不确定度，再调用 `fit_peaks`。

### 拟合后的单峰记录：`peaks.FittedPeak`

不可变数据类字段为：

```python
peaks.FittedPeak(
    center, amplitude, fwhm, area, params, errors
)
```

- `center`：拟合峰心；
- `amplitude`：共享常数基线以上的峰高；
- `fwhm`：模型半高全宽；
- `area`：排除基线后的解析面积；
- `params`：`center`、`amplitude`、`sigma`，Voigt 另有 `gamma`；
- `errors`：上述参数及 `fwhm` 的 $1\,\sigma$ 不确定度。

实现细节：Lorentzian 的第三个宽度参数在数学上是 $\gamma$，但当前结果字典仍存为 `params["sigma"]`，且不额外提供 `gamma` 键；只有 Voigt 同时提供 `sigma` 和 `gamma`。

拟合单峰后读取字段：

```python
axis = np.linspace(-5.0, 5.0, 1001)
signal = 3.0 * np.exp(-0.5 * ((axis - 0.5) / 0.4) ** 2)
idx = [p.index for p in peaks.find_peaks(signal, prominence=0.5)]
fitted = peaks.fit_peaks(axis, signal, idx).peaks[0]
print(fitted.center, fitted.errors["center"])
print(fitted.fwhm, fitted.area)
```

`area` 没有对应的 `errors["area"]`。如需面积不确定度，必须使用 `PeakFitResult.covariance` 对面积函数作 delta method 传播，或从联合参数分布进行 Monte Carlo 传播，不能把幅度误差单独当成面积误差。

报告单个模型峰的参数与 $1\,\sigma$ 误差时使用该对象。

### 峰拟合结果容器：`peaks.PeakFitResult`

构造字段为：

```python
peaks.PeakFitResult(
    model,
    peaks,
    baseline,
    baseline_error,
    x,
    y_fit,
    covariance,
)
```

- `model` 是 `"gaussian"`、`"lorentzian"` 或 `"voigt"`；
- `peaks` 按输入 `peak_indices` 的顺序保存 `FittedPeak`；
- `baseline` 与 `baseline_error` 是共享常数背景及其 $1\,\sigma$；
- `x` 是完整输入坐标；
- `y_fit` 是在完整 `x` 上计算的“背景 + 所有峰”，即使拟合只使用了局部窗口；
- `covariance` 的参数顺序是
  `[baseline, (center, amplitude, sigma[, gamma]) per peak]`。

下面读取联合结果：

```python
axis = np.linspace(-5.0, 5.0, 1001)
signal = np.exp(-0.5 * ((axis + 1.0) / 0.3) ** 2)
indices = [p.index for p in peaks.find_peaks(signal, prominence=0.2)]
result = peaks.fit_peaks(axis, signal, indices)
print(result.model, result.baseline, result.baseline_error)
print(result.y_fit.shape, result.covariance.shape)
```

需要联合背景、完整拟合曲线或跨峰参数相关性时，应读取 `PeakFitResult`。跨峰相关性必须从完整协方差矩阵读取，不能只看各自 `errors`。

### 线形联合拟合：`peaks.fit_peaks`

签名：

```text
peaks.fit_peaks(
    x,
    y,
    peak_indices,
    model="gaussian",
    window=None,
) -> peaks.PeakFitResult
```

模块没有单数形式的公开 `fit_peak`。拟合一个峰时同样传入单元素列表：

```python
fit = peaks.fit_peaks(x, y, peak_indices=[one_index])
```

联合模型为

$$
\hat{y}(x)=b+\sum_{k=1}^{K}L_k(x).
$$

所有峰共享常数基线 $b$。支持的峰形如下。

Gaussian：

$$
L(x)=A\exp\left[-\frac{(x-c)^2}{2\sigma^2}\right],
\quad
\mathrm{FWHM}=2\sqrt{2\ln2}\,\sigma,
\quad
\mathcal{A}=A\sigma\sqrt{2\pi}.
$$

Lorentzian：

$$
L(x)=A\frac{\gamma^2}{(x-c)^2+\gamma^2},
\quad
\mathrm{FWHM}=2\gamma,
\quad
\mathcal{A}=A\pi\gamma.
$$

Voigt 使用 `scipy.special.voigt_profile`，并按中心值归一化使 $A$ 表示峰高：

$$
L(x)=A\frac{V(x-c;\sigma,\gamma)}{V(0;\sigma,\gamma)},
\quad
\mathcal{A}=\frac{A}{V(0;\sigma,\gamma)}.
$$

其 FWHM 使用 Olivero–Longbothum 近似：

$$
f_\mathrm{G}=2\sqrt{2\ln2}\,\sigma,
\qquad
f_\mathrm{L}=2\gamma.
$$

$$
\mathrm{FWHM}\approx
0.5346f_\mathrm{L}
+\sqrt{0.2166f_\mathrm{L}^2+f_\mathrm{G}^2}.
$$

初值来自候选峰：峰心取 `x[index]`；基线取左右各 10% 样本合并后的中位数；振幅取 `max(y[index]-baseline, 1e-12)`；宽度由半 prominence 样本宽度换算。退化宽度回退为 3 个样本。峰心被限制在数据范围内，振幅非负，宽度下界为 `median(diff(x))*1e-3`。

`window` 是每个初始峰心两侧的物理半宽。非 `None` 时，所有局部窗口的并集参与同一次联合拟合；`window=None` 使用全部样本。优化由带界 `scipy.optimize.curve_fit` 完成，`max_nfev=10000`。

下面联合拟合两个 Gaussian 峰：

```python
rng = np.random.default_rng(11)
axis = np.linspace(0.0, 10.0, 2001)
signal = (
    1.5 * np.exp(-0.5 * ((axis - 3.0) / 0.2) ** 2)
    + 2.0 * np.exp(-0.5 * ((axis - 7.0) / 0.4) ** 2)
    + 0.02 * rng.normal(size=axis.size)
)
detected = peaks.find_peaks(signal, prominence=0.5, x_axis=axis)
result = peaks.fit_peaks(
    axis,
    signal,
    [p.index for p in detected],
    model="gaussian",
    window=1.5,
)
for peak in result.peaks:
    print(peak.center, peak.errors["center"], peak.fwhm, peak.area)
```

输入 `x`、`y` 必须是一维等长数组且至少 3 点，`x` 必须严格递增；`peak_indices` 不得为空或越界；模型名必须受支持；`window` 必须为正。输入错误抛 `ValueError`，SciPy 不收敛会传播 `RuntimeError`。

不确定度来自 `curve_fit` 协方差对角线。Gaussian 和 Lorentzian 的 FWHM 误差按线性关系传播；Voigt 的 FWHM 误差对 $(\sigma,\gamma)$ 使用步长 `1e-6` 的数值梯度和对应 $2\times2$ 协方差块传播。面积虽为解析值，但当前不传播面积误差。

Voigt 的 $\sigma$ 与 $\gamma$ 在单个低信噪比峰上常高度相关；优先用于高信噪比或多个峰的联合拟合。窗口过窄会截掉翼部，过宽则让无关背景结构进入常数背景模型。模型选择应由展宽机制和残差决定，不能只凭视觉效果。

候选峰已知，且需要亚采样峰心、模型线宽、净面积及参数协方差时，可调用 `fit_peaks`。

### 数值峰面积：`peaks.peak_area`

签名：

```text
peaks.peak_area(
    x,
    y,
    left,
    right,
    baseline=None,
) -> float
```

它在线性插值的边界值与区间内部样本上使用梯形积分：

$$
\mathcal{A}
=\int_{x_\mathrm{left}}^{x_\mathrm{right}}
\left[y(x)-b(x)\right]\,\mathrm{d}x.
$$

背景选项：

- `None`：积分原始信号；
- 数值：减去常数背景；
- `"edge"`：减去连接
  $(x_\mathrm{left},y(x_\mathrm{left}))$ 与
  $(x_\mathrm{right},y(x_\mathrm{right}))$ 的直线，即谷到谷背景。

边界超出数据范围时，`numpy.interp` 以最近端点值作常数延拓，并仍积分到请求的 `left`、`right`；这种外推通常缺乏合理的科学解释，应尽量让积分区间位于观测范围内。

三种背景约定的结果可直接比较：

```python
axis = np.linspace(-5.0, 5.0, 1001)
signal = 0.3 + np.exp(-0.5 * (axis / 0.5) ** 2)

raw_area = peaks.peak_area(axis, signal, -2.0, 2.0)
net_area = peaks.peak_area(
    axis, signal, -2.0, 2.0, baseline=0.3
)
edge_area = peaks.peak_area(
    axis, signal, -2.0, 2.0, baseline="edge"
)
print(raw_area, net_area, edge_area)
```

`x`、`y` 必须一维等长且至少 2 点，`x` 严格递增，且
$x_\mathrm{left}\lt x_\mathrm{right}$；背景只接受 `None`、Python
`int`/`float` 或 `"edge"`。违规时抛 `ValueError`。

该函数只返回标量，不估计不确定度。可通过重复测量、自助法（bootstrap），或对带协方差的信号样本传播梯形积分权重来估计面积不确定度，并在报告中明确背景约定和积分边界。

不假设 Gaussian/Lorentzian/Voigt 线形，或只需要固定区间的数值面积时，可用 `peak_area`。峰重叠严重时，联合 `fit_peaks` 通常更容易分离各分量。

### 选择指南与诊断清单

| 问题 | 首选 API | 必查诊断 |
|---|---|---|
| 已知非线性模型、需要参数协方差 | `fitting.curve_fit` | 初值、边界、`perr`、`redchi`、残差 |
| 对参数线性的模型 | `fitting.linear_lstsq` | 数值秩、条件数、`rcond` 敏感性 |
| 多通道共享参数、方差未知且不同 | `fitting.iterative_multichannel` | 权重、迭代数、收敛、公共尺度 |
| 低阶多项式趋势 | `fitting.polyfit` | 升幂系数顺序、缩放、秩 |
| 有可信初值的标量目标 | `optimize.minimize` | 多初值、边界、方法与 Jacobian |
| 有限边界内的多峰目标 | `optimize.global_minimize` | 多 seed、贴边解、局部精修 |
| 自然残差向量或稳健损失 | `optimize.least_squares` | 初值可行性、损失函数、残差 |
| 快速找候选峰 | `peaks.find_peaks` | prominence、样本分辨率、漏检/误检 |
| 峰形参数和净面积 | `peaks.fit_peaks` | 模型、窗口、协方差、背景、残差 |
| 无模型的区间面积 | `peaks.peak_area` | 边界、背景定义、面积不确定度 |

最终报告至少应写明：数据与坐标单位、模型公式、初值与边界、优化方法、随机种子、收敛状态、秩或条件数、背景与积分定义，以及不确定度是否为绝对尺度。



---

## 从 API 到可复现分析

::steps
{保存原始观测}

原始文件只读；登记采样率、通道、单位、仪器与数据集 UUID。

{记录每次变换}

缺口填补、滤波、重采样、谱估计和拟合都立即写入处理日志，并保留决定结果的参数与随机种子。

{同时报告结果与诊断}

参数必须伴随不确定度、残差、秩或收敛状态；谱与传递函数必须说明频率规划、平均次数和相干门控。

{固化可比较输出}

运行产物进入 `artifacts/`，通过测试和 `reference/` 快照确认算法、数值结果与科研图形没有意外漂移。
::

::alert{type="warning" title="报告前的最后检查"}
至少写明数据与坐标单位、模型公式、初值与边界、优化方法、随机种子、收敛状态、秩或条件数、背景与积分定义，以及不确定度是否代表绝对尺度。不要只报告一张“看起来合理”的图或一个 `success=True`。
::

::stream-button{title="回到项目源码" eyebrow="PRECISION PHYSKIT" href="https://github.com/pifuyuini/precision-physkit"}
继续查看实现、测试和可执行示例。
::
