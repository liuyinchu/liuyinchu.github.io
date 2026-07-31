# precision-physkit：把精密测量数据处理整理成可复现的工作流

实验数据处理脚本很容易变成一次性工程。缺口怎么填、降采样前用了什么滤波器、频谱参数为何这样选，往往只留在代码片段或运行者的记忆里。等到论文复核或换一批数据时，重写 FFT 通常不费时间，困难的是还原当时的处理过程。

[precision-physkit](https://github.com/pifuyuini/precision-physkit) 针对这类问题组织了一套 Python 工具。它面向精密测量、均匀采样时序和频谱数据，覆盖预处理、数字滤波、谱估计、拟合、优化、峰分析、绘图和元数据记录。项目采用 MIT 许可证，当前版本是 v0.1.0，只提供源码安装。

::stream-button{title="项目主页" eyebrow="precision-physkit" href="/precision-physkit"}
使用案例与详细文档。
::

## 它解决什么问题

precision-physkit 把常见分析步骤放进同一套数据约定中，并保留 SciPy 和 NumPy 的常规使用方式。

原始数据有对应的 TOML 元数据；每次缺口填补、滤波、降采样或谱分析都可以追加处理记录；机器可读结果、图和报告使用一致的编号。这样得到的输出仍然是普通 NPZ、CSV、JSON、PNG 和 Markdown 文件，不依赖专用数据库，但处理参数可以追溯。

工具包分为八个公开模块：

| 模块 | 用途 |
|---|---|
| `meta` | 数据身份、TOML 校验和处理阶段日志 |
| `preprocess` | 重采样、插值、缺口填补和白化 |
| `filters` | Butterworth、陷波、Savitzky–Golay 和移动平均 |
| `spectral` | Welch、LPSD、互谱、相干性和传递函数 |
| `fitting` | 非线性拟合、截断 SVD 和多通道加权拟合 |
| `optimize` | 局部优化、全局优化和非线性最小二乘 |
| `peaks` | 峰检测、线形拟合和峰面积 |
| `plotting` | 可复用绘图样式和论文图辅助函数 |

NumPy 和 SciPy 负责大部分 Python 层操作。计算量较大的对数频率谱估计、截断 SVD 和迭代加权最小二乘由 Rust 扩展 `precision_physkit._core` 执行。调用者仍使用普通 Python API，不需要直接处理 Rust 类型。

## 从时序到可信频谱

一条典型流程可以写成：

```text
raw data
  -> metadata
  -> gap handling
  -> anti-alias filtering and resampling
  -> spectral estimation
  -> fitting or peak analysis
  -> data, figures, reports, provenance
```

这个顺序有明确的数值原因。含缺口的数据不能直接送入多数滤波器和 FFT；降采样前若没有抗混叠滤波，高于新 Nyquist 频率的能量会折叠到低频。频谱计算完成后，还要根据估计方差、频率分辨率和相干性判断结果是否可用。

Welch 方法把数据分段、加窗并平均周期图。若共有 $K$ 个数据段，其 PSD 估计可概括为

$$
\hat{S}_\mathrm{xx}(f)
=
\frac{1}{K}\sum_{k=1}^{K}\hat{S}_{\mathrm{xx},k}(f).
$$

增加平均段数通常能降低估计方差，但段长变短后，频率分辨率也会下降。窄带谱线定位适合使用 Welch；若数据同时包含毫赫兹附近的慢漂移和较高频噪声，固定线性频率轴往往不够经济，这时可以使用 LPSD。LPSD 按目标频率调整数据段长度，在对数频率轴上分配估计点，低频使用较长数据段，高频使用较短数据段。

传递函数估计还应结合相干性。工具包采用 H1 估计

$$
\hat{H}_1(f)=
\frac{\hat{S}_\mathrm{xy}(f)}
{\hat{S}_\mathrm{xx}(f)},
$$

对应的幅值平方相干性为

$$
\hat{\gamma}_\mathrm{xy}^2(f)=
\frac{\left|\hat{S}_\mathrm{xy}(f)\right|^2}
{\hat{S}_\mathrm{xx}(f)\hat{S}_\mathrm{yy}(f)}.
$$

低相干性频点上的传递函数通常没有稳定解释。高相干性也只说明该频点存在稳定的线性关系，不能单独证明因果。

## 一个最小例子

下面的例子生成带短缺口的 $50\,\mathrm{Hz}$ 信号，填补缺口后进行低通滤波，再计算幅度谱密度：

```python
import numpy as np

from precision_physkit import filters, preprocess, spectral

rng = np.random.default_rng(7)
fs = 1024.0
t = np.arange(int(8 * fs)) / fs
x = np.sin(2 * np.pi * 50.0 * t) + 0.15 * rng.normal(size=t.size)
x[2200:2240] = np.nan

x_filled = preprocess.fill_gaps(
    x,
    method="pchip",
    fill_noise=True,
    seed=7,
)
x_filtered = filters.lowpass(
    x_filled,
    fs,
    cutoff=200.0,
    order=4,
)

asd = spectral.welch_psd(
    x_filtered,
    fs,
    nperseg=2048,
).to_asd()

peak_frequency = asd.f[np.argmax(asd.values)]
print(f"Peak frequency: {peak_frequency:.2f} Hz")
```

这段代码适合说明接口，但不能替代实验判断。`fill_gaps` 合成的是缺失区间的估计值；缺口长于信号特征时间时，插值无法恢复真实波形。滤波截止频率和 Welch 段长也应根据测量带宽、记录时长和目标分辨率确定。

## 拟合结果与统计诊断

工具包把拟合结果放在统一的结果对象中。除参数外，`FitResult` 还记录协方差、参数标准差、残差、自由度、约化卡方和 $R^2$。这有助于区分“曲线看起来贴合”和“参数确实稳定”。

线性问题可以使用截断 SVD。若设计矩阵写成

$$
\mathbf{A}
=
\mathbf{U}\mathbf{\Sigma}\mathbf{V}^{\mathsf{T}},
$$

则小于阈值的奇异值不会进入伪逆。`rcond` 过小可能保留噪声主导方向，过大则会丢失有效参数方向；工具包因此同时返回有效秩和协方差信息。多通道数据噪声水平不同时，`iterative_multichannel` 会根据各组残差方差更新权重，比直接堆叠所有观测更合理。

峰分析分成检测和拟合两步。`find_peaks` 负责位置、prominence、FWHM 和数值面积；`fit_peaks` 使用 Gaussian、Lorentzian 或 Voigt 线形联合拟合多个峰。线形选择错误或基线模型过于简单时，中心频率、宽度和面积都会产生系统偏差，因此拟合结果仍需结合残差图检查。

## 适合哪些研究项目

我更愿意把 precision-physkit 推荐给两类工作。

一类是需要反复调整预处理和谱估计参数的长时序实验。统一的结果容器、元数据和处理日志能减少参数散落在脚本中的情况。另一类是准备发表或长期维护的分析项目。源码、锁文件、测试、示例和参考结果放在同一仓库中，其他人可以从明确版本重建环境并检查计算过程。

它并不适合所有任务。实时流处理、分布式计算、仪器控制和大型数据管理不在当前范围内；项目也暂未提供预编译 wheel，安装时需要 Python 3.12、uv、Rust 工具链和系统链接器。若只是临时绘制一条曲线，直接使用 NumPy、SciPy 或 Matplotlib 会更简单。

## 从源码安装

```bash
git clone https://github.com/pifuyuini/precision-physkit.git
cd precision-physkit
uv sync --locked
```

验证 Python 包和 Rust 扩展：

```bash
uv run python -c \
  "import precision_physkit, precision_physkit._core; print(precision_physkit.__version__)"
```

运行测试：

```bash
uv run pytest -q
uv run cargo test --manifest-path rust/Cargo.toml --locked
```

完整的架构、公式、参数说明和每个公开 API 的示例见[中文教程与 API 使用手册](precision-physkit-tutorial.md)。如果分析结果将进入论文，建议记录所用 Git 标签或提交哈希；`main` 分支会继续变化，不应充当软件版本号。
