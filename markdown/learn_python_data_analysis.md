# Python 数据分析 · 学习 & 使用心得

> 人生苦短，我学 Python ！
> 掌握 Python 语言，享受完美人生！

---

## 绘图工具：从 Matplotlib 到 Plotly

本节旨在记录如何在已有不错的基础的情况下快速上手更现代的 Python 绘图工具 —— `Plotly.py`。

**Plotly 的两种主要画图方式：**

1.  **Plotly Express (`plotly.express`，通常导入为 `px`)**

      * 这是**强烈推荐的入门方式**，也是最快的方式。
      * 它非常高级，通常**一行代码**就能创建一个完整的、漂亮的图表。
      * 它非常适合处理数据框 (Pandas DataFrame)。
      * **类比**：它就像是 `matplotlib.pyplot`，提供了很多便捷的函数。

2.  **Plotly Graph Objects (`plotly.graph_objects`，通常导入为 `go`)**

      * 这是一种更底层的、面向对象的方式。
      * 你需要手动创建 `go.Figure()`，然后向其中添加 `go.Scatter()`（轨迹/Traces），再更新 `fig.update_layout()`（布局）。
      * 它提供了 100% 的控制权，但也更复杂。你之前看的 `plot-schema.json` 文件，定义的就是所有这些 `go` 对象的属性。
      * **类比**：这更像是 `matplotlib` 里操作 `Figure` 和 `Axes` 对象的底层方法。

### 速通：`iplot(...)` 模块

以下是一个常用的 Plotly 快速绘图封装：
```python
def iplot(
    x,
    y,
    legend_name,
    plot_title: str = '',
    x_label: str = 'X',
    y_label: str = 'Y',
    plot_type: str = 'curve',
    legend_title: str = '',
    return_fig: bool = True,
    show_fig: bool = False,
):
    """
    Plotly 实现的标准绘图函数，使用前请导入：`import plotly.graph_objects as go`。

    参数：
        x : array-like
        y : array-like 或多个 y 的元组/列表
        legend_name : str 或 str 列表
        plot_title : 图标题
        x_label : X轴标签
        y_label : Y轴标签
        plot_type : 'curve' 或 'scatter'
        legend_title : 图例标题
        return_fig : bool, default True
            如果为 True，则返回 `plotly.graph_objects.Figure`；否则返回 None。
        show_fig: bool, defualt False
    """
    fig = go.Figure()

    # 多条曲线情况（按要求：仅判断 y 是否为 list/tuple）
    if isinstance(y, (list, tuple)):
        for i, yi in enumerate(y):
            name = legend_name[i] if isinstance(legend_name, (list, tuple)) else f'Line {i}'
            mode = 'lines' if plot_type == 'curve' else 'markers'
            fig.add_trace(go.Scatter(
                x=x, y=yi, mode=mode, name=name,
                hovertemplate='x=%{x:.2f}<br>y=%{y:.2f}<extra></extra>'
            ))
    else:
        # 单条曲线
        mode = 'lines' if plot_type == 'curve' else 'markers'
        fig.add_trace(go.Scatter(
            x=x, y=y, mode=mode, name=legend_name,
            hovertemplate='x=%{x:.2f}<br>y=%{y:.2f}<extra></extra>'
        ))

    fig.update_layout(
        title=dict(text=plot_title, x=0.5, xanchor='center', font=dict(size=20)),
        xaxis=dict(title=dict(text=x_label, font=dict(size=16)), tickfont=dict(size=14)),
        yaxis=dict(title=dict(text=y_label, font=dict(size=16)), tickfont=dict(size=14)),
        legend=dict(title=dict(text=legend_title, font=dict(size=16)), font=dict(size=14)),
        template='plotly_white',   # 固定样式
        hovermode='closest'
    )
    if show_fig:
        fig.show()
    return fig if return_fig else None
```

推荐使用方式：
```python
fig = iplot(x, y, 'curve')
# ...
```

### `plt.` $\rightarrow$ `px.`

可以把 `matplotlib.pyplot as plt` 和 Plotly 的 `plotly.express as px` 看作是解决相似问题的两种工具，但是它们的设计理念有些不同。

  * **Matplotlib (`plt`)**：你通常是“一步一步地”构建图表。你先用 `plt.figure()` 创建一个“画布”，然后用 `plt.plot()` 或 `plt.scatter()` 在上面“画”东西，再用 `plt.title()`、`plt.xlabel()` 添加标题和标签，最后用 `plt.show()` "显示" 这张静态图片。
  * **Plotly (`px`)**：你通常是“一次性地”描述你想要的图表。你用一个函数（比如 `px.scatter()`）告诉它你需要的数据 (x, y)、标题 (title)、标签 (labels) 等，它会 *返回* 一个完整的、可交互的图表对象（通常叫 `fig`）。然后你调用 `fig.show()` 来显示这个交互式图表。

假设我们有这些数据：

```python
x_data = [1, 2, 3, 4, 5]
y_data = [10, 13, 8, 11, 15]
```

利用 `matplotlib.pyplot` 绘图：
```python
import matplotlib.pyplot as plt

x_data = [1, 2, 3, 4, 5]
y_data = [10, 13, 8, 11, 15]

plt.figure()  # 1. 创建画布
plt.scatter(x_data, y_data)  # 2. 画散点
plt.title("My Matplotlib Plot")  # 3. 添加标题
plt.xlabel("X-Axis")  # 4. 添加X轴标签
plt.ylabel("Y-Axis")  # 5. 添加Y轴标签
plt.show()  # 6. 显示静态图
```
利用 `plotly.express` 绘图：
```python
import plotly.express as px
import pandas as pd

# Plotly Express 最好是配合 Pandas DataFrame 使用
df = pd.DataFrame({
    "X-Axis": [1, 2, 3, 4, 5],
    "Y-Axis": [10, 13, 8, 11, 15]
})

# 1. 一行代码创建整个图表对象！
# 我们在这一行里就指定了数据、x轴、y轴、标题
fig = px.scatter(df, 
                 x="X-Axis", 
                 y="Y-Axis", 
                 title="My Plotly Express Plot"
                )

# 2. 显示图表
# 当你运行这行代码时 (例如在 Jupyter Notebook 中),
# 会显示一个可以缩放、平移、悬停查看数据的交互式图表！
fig.show()
```

**如果不想用 Pandas，`px` 也支持直接使用列表：**

```python
import plotly.express as px

x_data = [1, 2, 3, 4, 5]
y_data = [10, 13, 8, 11, 15]

# 注意：当直接用列表时，x 和 y 轴的标签需要单独设置
fig = px.scatter(x=x_data, 
                 y=y_data, 
                 title="My Plotly Express Plot",
                 labels={'x': 'X-Axis', 'y': 'Y-Axis'} # 用 'labels' 参数设置轴标签
                )
fig.show()
```

**总结一下关键转变：**

1.  **导入**: `import matplotlib.pyplot as plt`  $\rightarrow$  `import plotly.express as px`
2.  **创建**: 从 `plt.figure()` + `plt.plot()` + `plt.title()`... (多步) 变为 `fig = px.scatter(...)` (一步)。
3.  **显示**: `plt.show()`  $\rightarrow$  `fig.show()`
4.  **最大区别**: `plt` 生成的是**静态图片**，而 `px` (Plotly) 生成的是**交互式 HTML 图表**。

### `Figure` & `Axes` $\rightarrow$ `go.Figure()`

`plotly.graph_objects`（通常导入为 `go`）是 Plotly 的**核心**，而`go` 的核心思想是一切皆对象。

与 `matplotlib` “一步一步画” 的模式不同，`go` 的模式是 **“构建一个图表对象”**。

您可以把一个图表（Figure）想象成一个\*\*“大盒子”\*\*（`go.Figure`）。这个大盒子里必须装两样东西：

1.  **`data` (数据)**：这是一个**列表**，包含了您想画的所有“轨迹”(Traces)。

      * `go.Scatter` 是一个“轨迹”对象，用来画散点图或折线图。
      * `go.Bar` 是一个“轨迹”对象，用来画柱状图。
      * `go.Pie` 是一个“轨迹”对象，用来画饼图。
      * ...等等。

2.  **`layout` (布局)**：这是一个**对象**，用来描述图表长什么样（除了数据本身）。

      * `title` (标题)
      * `xaxis` (X轴的所有设置)
      * `yaxis` (Y轴的所有设置)
      * `legend` (图例)
      * ...等等。

**`Figure = data (一个轨迹列表) + layout (一个布局对象)`**

我们来画一个最简单的散点图，X轴是 `[1, 2, 3]`，Y轴是 `[4, 5, 6]`。

```python
import plotly.graph_objects as go
```

我们想画一个散点图，所以我们需要一个 `go.Scatter` 对象。

```python
# 定义一个“轨迹”对象
# mode='markers' 的意思是只画点 (散点图)
# 如果是 'lines' 则是折线图
trace1 = go.Scatter(
    x=[1, 2, 3],
    y=[4, 5, 6],
    mode='markers',
    name='我的数据点' # 这个名字会显示在图例中
)
```

我们的 `data` “食材”准备好了。它是一个列表，目前只包含 `trace1`。
`data = [trace1]`

现在我们创建那个“大盒子” `go.Figure`，并把“食材” `data` 传进去。

```python
# data 参数必须是一个轨迹对象的列表
fig = go.Figure(data=[trace1])
```

*（思考：我们还没定义 `layout` 怎么办？没关系，Plotly 会使用一套默认的布局。）*

```python
fig.show()
```

由此给出一个**可以交互**的散点图。但它没有标题，轴标签也是默认的。

现在我们知道了 `Figure = data + layout`。上面那个图的 `layout` 是空的，我们来把它补上。

在 `go` 中，有两种最常见的方式来设置 `layout`：

1.  **方式一：在创建 `go.Figure` 时传入 (推荐)**
    ```python
    import plotly.graph_objects as go

    # 1. 准备 Data (和上面一样)
    trace1 = go.Scatter(
        x=[1, 2, 3],
        y=[4, 5, 6],
        mode='markers',
        name='我的数据点'
    )

    # 2. 准备 Layout 对象
    my_layout = go.Layout(
        title='我的第一个 GO 图表',  # 设置标题
        xaxis_title='X 轴标签',    # 设置 X 轴标题
        yaxis_title='Y 轴标签'     # 设置 Y 轴标题
    )

    # 3. 组装 Figure，同时传入 data 和 layout
    fig = go.Figure(data=[trace1], layout=my_layout)

    # 4. 显示
    fig.show()
    ```
2.  **方式二：使用 `fig.update_layout()` (常用)**

    这种方式更常见，因为它允许您先创建一个图表，然后再去“更新”它的布局。

    ```python
    import plotly.graph_objects as go

    # 1. 准备 Data
    trace1 = go.Scatter(
        x=[1, 2, 3],
        y=[4, 5, 6],
        mode='markers',
        name='我的数据点'
    )

    # 2. 组装 Figure (只传入 data)
    fig = go.Figure(data=[trace1])

    # 3. 使用 update_layout() 方法来添加/修改布局
    fig.update_layout(
        title='我的第一个 GO 图表 (更新版)',
        xaxis_title='X 轴标签',
        yaxis_title='Y 轴标签',
        # 还可以设置更多...
        paper_bgcolor='rgba(230, 230, 230, 0.5)' # 设置图表背景色
    )

    # 4. 显示
    fig.show()
    ```

### 其它小技巧
1. 将坐标设为`log`：如果在 `px.` 中，可以直接传递参数 `x_log=True` ；如果使用的是 `go.` ，则需要用布局更新 `fig.layout.xaxis.type = 'log'` ；或者在最开始就设置也是个不错的方案 `fig = go.Figure(layout=go.Layout(xaxis=dict(type='log')))` 。
2. 注意如果在 **VS Code Notebook** 里使用，请先设置：
    ```python
    import plotly.io as pio
    pio.renderers.default = "browser"
    ```

### 示例：画一张 Bode 图
```python
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import scipy.signal as signal
import numpy as np

num = [8]
den = [1, 6, 11, 6]
system = signal.TransferFunction(num, den)
w_rad_range = np.logspace(-2, 2, 100000)
w, mag, phase = signal.bode(system, w_rad_range)

gm_db, pm, gm_freq, pm_freq = (np.nan, np.nan, np.nan, np.nan)
try:
    gain_crossover_indices = np.where(np.diff(np.sign(mag)))[0]
    if len(gain_crossover_indices) > 0:
        idx = gain_crossover_indices[0]
        log_w = np.log10(w)
        log_pm_freq = np.interp(0.0, [mag[idx+1], mag[idx]], [log_w[idx+1], log_w[idx]])
        pm_freq = 10**log_pm_freq
        phase_at_pm_freq = np.interp(log_pm_freq, log_w, phase)
        pm = phase_at_pm_freq + 180.0
    else:
        print("未找到增益穿越频率 (0 dB 穿越点)，无法计算 PM。")
    phase_crossover_indices = np.where(np.diff(np.sign(phase + 180.0)))[0]
    if len(phase_crossover_indices) > 0:
        idx = phase_crossover_indices[0]
        log_w = np.log10(w)
        log_gm_freq = np.interp(-180.0, [phase[idx+1], phase[idx]], [log_w[idx+1], log_w[idx]])
        gm_freq = 10**log_gm_freq
        mag_at_gm_freq = np.interp(log_gm_freq, log_w, mag)
        gm_db = -mag_at_gm_freq
    else:
        print("未找到相位穿越频率 (-180 deg 穿越点)，无法计算 GM。")
except Exception as e:
    print(f"计算裕度时发生错误: {e}")

# 创建一个 2 行 1 列的子图，并共享 X 轴
fig = make_subplots(rows=2, cols=1,
                    shared_xaxes=True,
                    vertical_spacing=0.0, # 减少子图间距
                    subplot_titles=("", ""))

# --- 绘图 1: 幅度 (Magnitude) ---
fig.add_trace(go.Scatter(
    x=w, y=mag,
    mode='lines',
    name='Gain',
    line=dict(color='blue')
), row=1, col=1)

# 添加 0 dB 水平线
fig.add_shape(type="line",
    x0=w[0], y0=0, x1=w[-1], y1=0,
    line=dict(color="black", width=2, dash="dash"),
    row=1, col=1
)

# --- 绘图 2: 相位 (Phase) ---
fig.add_trace(go.Scatter(
    x=w, y=phase,
    mode='lines',
    name='Phase',
    line=dict(color='red')
), row=2, col=1)

# 添加 -180 deg 水平线
fig.add_shape(type="line",
    x0=w[0], y0=-180, x1=w[-1], y1=-180,
    line=dict(color="black", width=2, dash="dash"),
    row=2, col=1
)

# 标注 PM
if not np.isnan(pm_freq) and not np.isnan(pm):
    fig.add_shape(type="line",
        x0=pm_freq, y0=np.min(mag), x1=pm_freq, y1=np.max(mag),
        line=dict(color="black", width=2, dash="dash"),
        row=1, col=1
    )
    phase_at_pm_freq = np.interp(np.log10(pm_freq), np.log10(w), phase)
    fig.add_shape(type="line",
        x0=pm_freq, y0=np.min(phase), x1=pm_freq, y1=np.max(phase),
        line=dict(color="black", width=2, dash="dash"),
        row=2, col=1
    )
    fig.add_shape(type="line",
        x0=pm_freq, y0=-180, x1=pm_freq, y1=phase_at_pm_freq,
        line=dict(color="red", width=3),
        row=2, col=1
    )

# 标注 GM
if not np.isnan(gm_freq) and not np.isnan(gm_db):
    mag_at_gm_freq = -gm_db
    fig.add_shape(type="line",
        x0=gm_freq, y0=np.min(mag), x1=gm_freq, y1=np.max(mag),
        line=dict(color="black", width=2, dash="dash"),
        row=1, col=1
    )
    fig.add_shape(type="line",
        x0=gm_freq, y0=mag_at_gm_freq, x1=gm_freq, y1=0,
        line=dict(color="blue", width=3),
        row=1, col=1
    )
    fig.add_shape(type="line",
        x0=gm_freq, y0=np.min(phase), x1=gm_freq, y1=np.max(phase),
        line=dict(color="black", width=2, dash="dash"),
        row=2, col=1
    )

# 关键：设置X轴为对数尺度 (lgFreq)
fig.update_xaxes(type="log", title_text="Frequency (rad/s)")
fig.update_xaxes(type="log", title_text="", row=1, col=1)

# 更新Y轴标签
fig.update_yaxes(title_text="Magnitude (dB)", row=1, col=1)
fig.update_yaxes(title_text="Phase (deg)", row=2, col=1)

# 整理布局
fig.update_layout(
    title_text=f"Bode Plot for P(s) with GM = {gm_db:.2f} dB (@ {gm_freq:.2f} rad/s), PM = {pm:.2f} deg (@ {pm_freq:.2f} rad/s)",
    showlegend=True,
    hovermode="x unified", # 统一显示x轴的悬停信息
)
fig.show()
```

### 如何导出图片？

详见[官方教程](https://plotly.com/python/static-image-export/)。

```python
import plotly.io as pio
fig.write_image("fig.png")
fig.write_image("images/fig1.jpeg")
fig.write_image("images/fig1.svg")
fig.write_image("images/fig1.pdf")
```
> 但注意，Colab 中需 `pip install -U kaleido plotly` ，并配置chrome `pio.get_chrome()` 。
> 此外，还有：`conda install -c conda-forge python-kaleido` 。

> 除了图像格式之外，`to_image` 和 `write_image` 函数还提供了参数来指定图像的宽度和高度（以逻辑像素为单位）。它们还提供了一个缩放参数，可用于增加（scale > 1）或减少（scale < 1）结果图像的物理分辨率。

通过导出图片，我们有另一种在 Notebook 中使用的方式：

```python
img_bytes = fig.to_image(format="png", width=600, height=350, scale=2)
Image(img_bytes)
```
- `width=600`：图像宽度为 600 像素
- `height=350`：图像高度为 350 像素
- `scale = 1` → 原始分辨率
- `scale > 1` → 提高分辨率（更清晰、更大文件）
- `scale < 1` → 降低分辨率（更模糊、更小文件）
- 返回的是图片的 字节数据（bytes）
- `Image(img_bytes)` 通常用于 Jupyter Notebook，把字节流显示为实际图片

### 快速上手用 Plotly 创建动画

基于以下代码，可以创建用于监视深度学习训练过程的基于 `Plotly.py` 的可视化图表：

```python
import plotly.graph_objects as go
import numpy as np
from IPython import display
import time

# 设置图表的布局（包含坐标轴标题和样式）
layout = go.Layout(
    xaxis_title='Time Step',  # x轴标题
    yaxis_title='Value',      # y轴标题
    template='plotly_white'   # 使用 plotly_white 模板
)

# 初始化空图表
fig = go.Figure(data=[], layout=layout)

# 循环绘制 100 次图表
for i in range(0, 100):
    display.clear_output(wait=True)  # 清空输出区域，避免图表叠加
    x = np.linspace(0, i, 100 * i)  # 生成 x 轴数据，步长随着 i 增大
    y = np.sin(x)  # y 轴数据，正弦波

    fig.data = []  # 清空之前的图形数据
    fig.update_layout(title=f'Step {i}')  # 更新图表标题，显示当前的步数

    # 创建新的折线图 trace
    trace = go.Scatter(x=x, y=y, mode='lines', name=f'Trace {i}')
    fig.add_trace(trace)  # 将新创建的折线图添加到图表中

    # 显示当前图表
    display.display(fig)

    # 暂停 0.5 秒，以便更新图表
    time.sleep(0.5)
```

以下是一个便捷且有用的封装：

```python
import plotly.graph_objects as go
import numpy as np

duration_layout = go.Layout(
    xaxis_title='Episode',
    yaxis_title='Duration',
    template='plotly_white'
)
duration_fig = go.Figure(data=[], layout=duration_layout)

def plotly_durations(show_result: bool = False):
    """
    使用 Plotly 动态更新训练时长曲线，
    等价于原来的 matplotlib 版本。
    """
    global duration_fig

    # 将全局 episode_durations 转为 tensor
    durations_t = torch.tensor(episode_durations, dtype=torch.float)

    # 每次调用都清空输出并重绘（对应原来的 plt.clf + display.clear_output）
    if not show_result:
        display.clear_output(wait=True)

    # 清空旧曲线
    duration_fig.data = []

    # 设置标题
    title = 'Result' if show_result else 'Training...'
    duration_fig.update_layout(title=title)

    # Episode 轴
    x = np.arange(1, len(durations_t) + 1)

    # 原始时长曲线
    trace_duration = go.Scatter(
        x=x,
        y=durations_t.numpy(),
        mode='lines',
        name='Duration'
    )
    duration_fig.add_trace(trace_duration)

    # 100 回合滑动平均曲线（保留原来的 unfold 逻辑）
    if len(durations_t) >= 100:
        means = durations_t.unfold(0, 100, 1).mean(1).view(-1)
        means = torch.cat((torch.zeros(99), means))

        trace_mean = go.Scatter(
            x=x,
            y=means.numpy(),
            mode='lines',
            name='100-episode mean'
        )
        duration_fig.add_trace(trace_mean)

    # 显示图像
    display.display(duration_fig)
```

## 如何对数据进行时频分析

**省流：**

> STFT 可以调用 SciPy 的接口，具体是 [`scipy.signal.ShortTimeFFT`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.ShortTimeFFT.html#scipy.signal.ShortTimeFFT)，详解使用文档。

> CWT 可以调用 PyWavelets 的接口，具体是 [`pywt.cwt(data, scales, wavelet, sampling_period=1.0, method='conv', axis=-1, *, precision=12)`](https://pywavelets.readthedocs.io/en/latest/ref/cwt.html)，详见使用文档。

**...**

完成 STFT 计算、去趋势与亮度补偿之后，时频结果通常以二维矩阵形式进入可视化阶段。以 `ShortTimeFFT` 的输出为例，`stft_analysis` 返回的 `S` 是按频率行、时间列排列的幅度矩阵（或经补偿后的幅度矩阵），而 `extent` 提供了与该矩阵一致的物理坐标范围。绘图的关键在于：确保矩阵索引方向与物理坐标轴一致，确保频率轴的对数映射与色标含义一致，并显式处理边界效应与动态范围，以避免视觉上产生可被误解的结构。

在 Matplotlib 中，`imshow` 默认把矩阵的第 0 行画在图像上方，而时频谱图通常希望“低频在下、高频在上”。因此常用 `origin="lower"` 将第 0 行放在图像底部，与 `ShortTimeFFT` 输出频率数组 `sft.f` 从低到高的顺序一致。与此同时，`extent` 将像素坐标映射到物理坐标，典型形式为 $[t_{\min}, t_{\max}, f_{\min}, f_{\max}]$，并与 `imshow` 的横纵轴范围同步，使得每一个像素块对应具体的时间—频率矩形区域。由于 `extent` 由 `sft.extent(n)` 直接生成，且内部已考虑窗在两端造成的时间扩展，绘图时出现信号起止之外的时间区间是正常现象；若需要在图中强调有效信号区间，可进一步叠加竖线标注 $t=0$ 与 $t=n/F_s$，或用半透明阴影标示窗未完全落入信号范围的边缘带，但这属于展示选择而非必须步骤。

频率轴的对数显示通常通过 `plt.yscale("log")` 完成，此时 `extent` 的频率上下限必须为正数，且 `ylim` 需避开 0。对数扫频等宽带跨度较大的场景中，对数频轴能更直观地展示频率随时间的比例变化，并与前述“亮度补偿”形成一致的度量体系。示例中使用 `plt.ylim((0.001, 0.01))` 等价于将关注频带裁剪到 $[1\,\mathrm{mHz}, 10\,\mathrm{mHz}]$，这一裁剪不仅提升可读性，也能减少色标被无关频段主导的风险。若频带裁剪发生在绘图阶段而非计算阶段，矩阵仍包含全频信息，但显示只取其中一部分；这与后续需要做定量分析时“保留全矩阵”并不冲突。

`aspect="auto"` 常用于谱图绘制，原因是时间与频率轴的物理单位不同，且时间跨度与频带跨度可能相差数个量级，强行设为等比例会使图像过度拉伸，难以辨认结构。`imshow` 的插值在不同 Matplotlib 版本中可能有默认行为差异；若频率或时间采样较稀，插值可能造成平滑的视觉错觉，尤其在对数频轴下更明显。为保证“所见即所算”，可以将插值显式设为最近邻或无插值风格（例如 `interpolation="nearest"` 或 `interpolation="none"`），从而使每个像素块对应一个真实的 STFT 栅格单元；是否采用由展示偏好与分辨率情况共同决定。

色标的含义取决于 `S` 的定义。示例中 `S` 来自 `np.abs(sft.stft(...))` 并乘以 $\sqrt{f}$ 做亮度补偿，因此色标反映的是“幅度型量的补偿结果”，其平方与 $f|S|^2$ 成比例，更接近对数频率度量下的功率密度展示。在动态范围很大的情况下，线性色标往往导致弱结构不可见，此时可以对显示量做对数压缩，例如绘制 $\log_{10}(S+\epsilon)$ 或 $\mathrm{dB}$ 标度（$20\log_{10}S$ 对幅度、$10\log_{10}$ 对功率），其中 $\epsilon$ 用于避免对数的数值问题；不过一旦做对数压缩，色标单位与解释也随之改变，需要在图例或色条标签中体现。即便保持线性色标，`plt.colorbar(im)` 也应被视为必需的定量参照，因为谱图中的“亮/暗”并不具有绝对含义，只有在色条的映射下才可比较不同图或不同区域的强度。

综合上述要点，一种紧凑且物理一致的绘图流程可概括为：使用 `imshow` 直接绘制 `S`，用 `origin="lower"` 保证频率方向符合直觉，用 `extent` 完成时间—频率物理坐标映射，用 `yscale("log")` 与 `ylim` 聚焦目标频带，并通过 `colorbar` 固化强度参照。示例代码中的核心片段正对应这一流程：先计算得到 `sft_out['S']` 与 `sft_out['extent']`，再以 `imshow(..., extent=..., origin="lower", aspect="auto")` 显示，并配合对数频轴与频带裁剪完成最终谱图呈现。

具体细节详见相关笔记。以下是参考代码：

```python
import numpy as np
import pandas as pd

import matplotlib.pyplot as plt
%matplotlib inline
%config InlineBackend.figure_format = 'retina'

from scipy import signal, interpolate
from scipy.signal import welch
from scipy.interpolate import interp1d
from scipy.signal import chirp
from scipy.signal import ShortTimeFFT
from scipy.signal.windows import gaussian, hann, dpss
from scipy.signal import hilbert

def cwt_analysis(data, fs, f1, f2, Df):

    import pywt

    dt = 1 / fs

    # 1. 频率轴（log-chirp 友好）
    freqs = np.arange(f1, f2 + Df, Df)

    # 2. 小波参数
    f_ref = np.sqrt(f1 * f2)
    B = (f_ref / Df)**2
    C = 1.0
    wavelet = f'cmor{B:.2f}-{C}'

    # 3. 尺度
    fc = pywt.central_frequency(wavelet)
    scales = fc / (freqs * dt)

    # 4. CWT
    coeffs, frequencies = pywt.cwt(
        data,
        scales,
        wavelet,
        sampling_period=dt
    )

    S = np.abs(coeffs)
    S_plot = S * np.sqrt(frequencies[:, None])
    t = np.arange(S.shape[1]) / fs
    extent=[t[0], t[-1], frequencies[0], frequencies[-1]]

    return {
        'S': S,
        'S_plot': S_plot,
        't': t,
        'f': frequencies,
        'extent': extent
    }

def sft_setup(Fs, Df, win_func=hann, xi=0.9):
    if win_func == gaussian:
        std = Fs / (2 * np.pi * Df)
        win_len = int(np.ceil(6 * std))
        hop = int(np.ceil(std / 2))
        win = win_func(win_len, std=std, sym=True)
    elif win_func == dpss:
        m_win = int(Fs / Df)
        win = dpss(m_win, NW=2.5, Kmax=1)[0]
        hop = int(m_win - int(xi * m_win))
    else:
        m_win = int(Fs / Df)
        win = win_func(m_win)
        hop = int(m_win - int(xi * m_win))

    return ShortTimeFFT(
        win=win,
        hop=hop,
        fs=Fs,
        scale_to='magnitude'
        )

def stft_analysis(data, sft, correct_S=True, move_dc=True, move_move_dc=False):
    if move_dc:
        input = signal.detrend(data, type='constant')
    else:
        input = data
    if move_move_dc:
        S = np.abs(sft.stft_detrend(input, detr='constant'))
    else:
        S = np.abs(sft.stft(input))
    if correct_S:
        S = S * np.sqrt(sft.f[:, None])       
    extent = sft.extent(len(input))
    return {
        'S': S,
        'extent': extent
    }

Df = 0.0003
sft = sft_setup(fs_new, Df, win_func=gaussian)
sft_out = stft_analysis(out['y2'], sft, correct_S=True, move_move_dc=True, move_dc=True)\

plt.figure()

im = plt.imshow(
    sft_out['S'],
    origin="lower",
    aspect="auto",
    extent=sft_out['extent']
)
plt.plot(out['t'], f1 * (f2/f1)**(out['t']/T), color='red', label='line')

plt.xlabel("Time [s]")
plt.ylabel("Frequency [Hz]")
plt.yscale("log")
plt.ylim((0.001, 0.01))
plt.legend()

plt.colorbar(im)
plt.show()
```






