# Python 学习 & 使用心得

> 人生苦短，我学 Python ！
> 掌握 Python 语言，享受完美人生！

---

## Python 的现代项目管理

> 得益于 AI 的火热，Python 生态（尤其是科学计算方面）得到了蓬勃发展，一大批更现代的工具诞生，这些都导致 conda 不再是一个好选择（即使对于新手来说）。

先看这些视频：
- [现代 Python 项目管理全流程梳理](https://b23.tv/D0gze5b)
- 项目化的包管理
    - [uv](https://b23.tv/ee9Tpbc)
    - [项目结构与打包](https://www.bilibili.com/video/BV12NgLzhEKx)
- 为科学计算服务，但是“现代 conda”：
    - [关于何为“现代 conda”的一个很好的介绍](https://www.bilibili.com/video/BV1Fm4ZzDEeY)

### uv

1. 安装 uv
    - 科学下载：`curl -LsSf https://astral.sh/uv/install.sh | sh` ；
    - 自动补全：`echo 'eval "$(uv generate-shell-completion zsh)"' >> ~/.zshrc` ；
    - 重载：`source ~/.zshrc` ；
    - 确认：输入`uv`，成功会出现帮助菜单。
2. 安装Python：
   - 如果你系统中已经安装了 Python（比如通过系统自带、pyenv、Homebrew 等安装的），那么 uv 自动发现并使用它。你不需要配置路径或环境变量。uv 内置了 Python 版本管理功能，而且是“即需即装”（on-demand install），你甚至可以在没有任何 Python 的系统上使用 uv 安装 Python！
   - 先查看目前已经有的：`uv python list` ；
   - `uv python install` ，这条命令会：安装最新版本的 Python，使用 Astral 提供的独立构建的 Python 发行版（python-build-standalone 项目），安装结果是只对 uv 可见的（不会覆盖或污染你系统自带的 Python）。uv 并不会把它安装的 Python 注册为全局 python 命令。
   - 2025年 7 月，推荐下载：`uv python install 3.12 3.11 3.10` 。
3. 跑一个脚本
	- `uv run script.py` ，自动管理依赖环境，无需手动创建 venv。若在项目中，默认使用项目环境（可加 --no-project 跳过）。
	- `uv run --with rich script.py` ，运行依赖脚本。
4. 搞个项目
	- 初始化：
		```bash
		# 快速创建
		uv init hello-world
		cd hello-world

		# 或者当前目录初始化
		mkdir hello-world && cd hello-world
		uv init
		```
	- 项目结构：
		```pgsql
		hello-world/
		├── .gitignore
		├── .python-version      ← 默认 Python 版本（可直接在这里修改）
		├── README.md            ← 项目简介
		├── main.py              ← 默认脚本
		├── pyproject.toml       ← 项目元数据 + 依赖声明（项目核心文件）
		└── （运行后自动生成）
			├── .venv/           ← 虚拟环境目录
			└── uv.lock          ← 精确依赖锁文件
		```
	- 即刻就可以运行：`uv run main.py` ；
	- 添加依赖：`uv add requests` ；
	- 移除依赖： `uv remove requests` ；
	- `pyproject.toml` ，依赖写在 `dependencies` 的列表里：
		```toml
		[project]
		name = "hello-world"
		version = "0.1.0"
		description = "Add your description here"
		readme = "README.md"
		dependencies = []
		```
	- 剩余内容参考前面**教程**就好。
5. 在进行项目的开发时，我又学到了一些新东西，记录如下（2025 年 9 月 14 日）：
	- 官方文档写到，如果您从 `requirements.txt` 文件迁移，则可以使用 `uv add -r` 从文件添加所有依赖项：
		```bash
		# Add all dependencies from requirements.txt.
		uv add -r requirements.txt 

		# 可选（如有）
		uv add -r requirements.txt -c constraints.txt
		```
	- 然后用 `uv sync` 同步。
	- 改变当前项目的 Python 版本：
		```bash
		# Use a specific Python version in the current directory:
		uv python pin 3.11
		# Pinned .python-version to 3.11

如果需要卸载：  
```bash
uv cache clean
rm -r "$(uv python dir)"
rm -r "$(uv tool dir)"
```

```bash
rm ~/.local/bin/uv ~/.local/bin/uvx
```

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

---

## 零散知识点

### Python中类的专有方法

在 Python 中，类的专有方法（也称为“魔术方法”或“dunder methods”）是以双下划线开头和结尾的方法，它们使类可以与内置的 Python 操作进行交互。这些方法通常不需要直接调用，而是通过特定的语法或操作自动触发。以下是一些常见的专有方法及其详细讲解：

#### 1. `__init__(self, ...)` —— 初始化方法
这是类的构造函数，当你创建一个类的实例时会自动调用这个方法。它通常用于对实例属性进行初始化。

```python
class MyClass:
    def __init__(self, name):
        self.name = name

obj = MyClass("Alice")
print(obj.name)  # 输出: Alice
```

#### 2. `__str__(self)` 和 `__repr__(self)` —— 字符串表示方法
- `__str__(self)`：定义类的实例通过 `str()` 或 `print()` 输出时的字符串表示，适合给用户看。
- `__repr__(self)`：定义类的实例通过 `repr()` 或直接在交互式解释器中输出时的字符串表示，适合开发人员调试。

```python
class MyClass:
    def __init__(self, name):
        self.name = name

    def __str__(self):
        return f"MyClass(name={self.name})"

    def __repr__(self):
        return f"MyClass('{self.name}')"

obj = MyClass("Alice")
print(str(obj))  # 输出: MyClass(name=Alice)
print(repr(obj))  # 输出: MyClass('Alice')
```

#### 3. `__len__(self)` —— 对象长度
`__len__()` 定义了 `len()` 函数对实例的行为。通常在类表示某种集合或容器时使用。

```python
class MyClass:
    def __init__(self, data):
        self.data = data

    def __len__(self):
        return len(self.data)

obj = MyClass([1, 2, 3])
print(len(obj))  # 输出: 3
```

#### 4. `__getitem__(self, key)` —— 访问元素
`__getitem__()` 允许我们使用 `[]` 来获取类的实例中的元素，通常用于实现自定义容器。

```python
class MyClass:
    def __init__(self, data):
        self.data = data

    def __getitem__(self, index):
        return self.data[index]

obj = MyClass([1, 2, 3])
print(obj[1])  # 输出: 2
```

#### 5. `__setitem__(self, key, value)` 和 `__delitem__(self, key)` —— 设置和删除元素
- `__setitem__(self, key, value)`：定义如何通过 `[]` 语法设置实例中的元素。
- `__delitem__(self, key)`：定义如何通过 `del` 语法删除实例中的元素。

```python
class MyClass:
    def __init__(self, data):
        self.data = data

    def __setitem__(self, index, value):
        self.data[index] = value

    def __delitem__(self, index):
        del self.data[index]

obj = MyClass([1, 2, 3])
obj[1] = 10
print(obj.data)  # 输出: [1, 10, 3]

del obj[1]
print(obj.data)  # 输出: [1, 3]
```

#### 6. `__iter__(self)` 和 `__next__(self)` —— 迭代器协议
- `__iter__(self)`：使类的实例成为一个可迭代对象，通常返回 `self` 或一个迭代器对象。
- `__next__(self)`：定义如何返回下一个元素，当没有更多元素时抛出 `StopIteration`。

```python
class MyClass:
    def __init__(self, data):
        self.data = data
        self.index = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.index < len(self.data):
            result = self.data[self.index]
            self.index += 1
            return result
        else:
            raise StopIteration

obj = MyClass([1, 2, 3])
for item in obj:
    print(item)  # 输出: 1 2 3
```

#### 7. `__call__(self, *args, **kwargs)` —— 使实例可调用
`__call__(self)` 使类的实例可以像函数一样被调用。

```python
class MyClass:
    def __call__(self, x):
        return x * 2

obj = MyClass()
print(obj(5))  # 输出: 10
```

#### 8. `__eq__(self, other)`、`__lt__(self, other)` 等比较运算符
这些方法定义了对象之间的比较行为，如 `==`、`<`、`>` 等。常用的方法有：
- `__eq__(self, other)`：相等 `==`
- `__lt__(self, other)`：小于 `<`
- `__le__(self, other)`：小于等于 `<=`
- `__gt__(self, other)`：大于 `>`
- `__ge__(self, other)`：大于等于 `>=`

```python
class MyClass:
    def __init__(self, value):
        self.value = value

    def __eq__(self, other):
        return self.value == other.value

obj1 = MyClass(10)
obj2 = MyClass(10)
print(obj1 == obj2)  # 输出: True
```

#### 9. `__enter__(self)` 和 `__exit__(self)` —— 上下文管理协议
这些方法允许类实例用于 `with` 语句，通常用于资源管理，如文件打开和关闭。

```python
class MyClass:
    def __enter__(self):
        print("Entering context")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        print("Exiting context")

with MyClass():
    print("Inside context")
```

输出：
```
Entering context
Inside context
Exiting context
```

#### 10. `__new__(cls, ...)` —— 创建实例
`__new__()` 是实例创建的方法，通常不直接使用，除非你想定制实例化的过程。它比 `__init__()` 先执行。

```python
class MyClass:
    def __new__(cls, *args, **kwargs):
        print("Creating instance")
        return super(MyClass, cls).__new__(cls)

    def __init__(self, name):
        self.name = name

obj = MyClass("Alice")
# 输出: Creating instance
```

### `__init__.py` 是什么？

`__init__.py` 是 Python 中一个非常特殊的文件。它的核心作用只有一个：**将一个普通的文件夹标记为一个 Python 包（Package）**。

当你创建一个包含 `__init__.py` 文件的文件夹时，Python 解释器就会把这个文件夹当作一个“包”来对待，从而允许你从这个文件夹（包）中导入模块（`.py` 文件）或者子包（包含 `__init__.py` 的子文件夹）。

如果一个文件夹中没有 `__init__.py` 文件，那么在 Python 3.3 之前的版本中，你完全无法将其作为包导入。虽然 Python 3.3+ 引入了“隐式命名空间包”的概念，允许没有 `__init__.py` 的文件夹也被当作包，但在绝大多数情况下，**为了代码的清晰、兼容和可控性，创建 `__init__.py` 仍然是最佳实践。**

一个 `__init__.py` 文件可以是空的，仅仅起到一个“标记”的作用。但它也可以包含 Python 代码，从而实现更强大的功能。

#### 声明一个目录为包（最基本的功能）

这是它存在的最根本原因。

假设你有如下目录结构：

```
my_project/
├── main.py
└── my_package/
    ├── __init__.py
    └── module1.py
```

因为 `my_package` 目录下有 `__init__.py` 文件，Python 就知道 `my_package` 是一个包。因此，你可以在 `main.py` 中这样写：

```python
# main.py
from my_package import module1

module1.some_function()
```

如果 `my_package` 目录下没有 `__init__.py`，在旧版 Python 中这行代码会直接报错 `ModuleNotFoundError`。

#### 执行包的初始化代码

`__init__.py` 文件中的代码会在这个包**第一次被导入**时执行。这个特性非常有用，可以用来执行一些包级别的初始化操作。

例如：

  * **加载配置**：从配置文件中读取设置。
  * **建立数据库连接**：初始化数据库连接池。
  * **注册插件**：动态地发现和注册包内的插件。

**示例：**

```python
# my_package/__init__.py

print(f"Initializing package 'my_package'...")

# 假设我们有一个配置模块
from . import config

# 加载配置
APP_CONFIG = config.load_config()

print("Package 'my_package' initialized.")
```

当其他文件第一次执行 `import my_package` 时，控制台会打印出这些信息，并且 `APP_CONFIG` 会被加载。

#### 简化导入路径，构建包的公共 API

这是 `__init__.py` 最常用也最强大的功能之一。它可以将包内部深层模块的功能“提升”到包的顶层命名空间，为用户提供一个更简洁、更稳定的接口（API）。

**没有使用 `__init__.py` 简化的场景：**

目录结构：

```
my_app/
└── services/
    ├── __init__.py
    ├── user_service.py   # 里面有函数 get_user
    └── product_service.py # 里面有函数 get_product
```

使用者必须知道内部的文件结构，导入方式很长：

```python
from my_app.services.user_service import get_user
from my_app.services.product_service import get_product

user = get_user(123)
product = get_product('abc')
```

**使用 `__init__.py` 简化后的场景：**

我们在 `services/__init__.py` 文件中写入以下代码：

```python
# services/__init__.py

# 从当前包的 user_service 模块导入 get_user 函数
from .user_service import get_user

# 从当前包的 product_service 模块导入 get_product 函数
from .product_service import get_product

print("Services API has been exposed.")
```

这里的 `.` 代表当前包目录。

现在，使用者的导入就变得非常简洁：

```python
from my_app import services

user = services.get_user(123)
product = services.get_product('abc')
```

使用者不再需要关心 `get_user` 函数具体是在哪个 `.py` 文件里定义的。`services` 包通过 `__init__.py` 提供了一个统一的、简洁的对外接口。如果未来你重构代码，把 `get_user` 移到了 `auth_service.py` 文件，你只需要修改 `services/__init__.py` 的导入语句，而使用者的代码完全不需要改动。

#### 使用 `__all__` 控制 `from package import *` 的行为

在 Python 中，`from package import *` 通常被认为是一种不好的实践，因为它会污染当前命名空间，且不清楚到底导入了哪些东西。

但是，如果你想明确地定义当用户使用 `import *` 时，哪些变量、函数或类应该被导出，你可以在 `__init__.py` 中使用 `__all__` 变量。

`__all__` 是一个字符串列表，定义了包的“公共 API”。

**示例：**

假设 `services/__init__.py` 如下：

```python
# services/__init__.py
from .user_service import get_user, _internal_helper
from .product_service import get_product

# 定义公共 API
__all__ = ['get_user', 'get_product']
```

现在，如果一个用户执行 `from my_app.services import *`：

  * `get_user` 和 `get_product` 会被成功导入。
  * `_internal_helper`（一个内部辅助函数）则不会被导入，因为它没有被包含在 `__all__` 列表中。

这是一种非常好的封装方式，可以清晰地向使用者展示哪些是你可以放心使用的公共接口，哪些是随时可能变化的内部实现。

#### 综合实例

让我们看一个更完整的项目结构：

```
ecommerce/
├── __init__.py         # 让 ecommerce 成为一个包
├── main.py
|
└── core/
|   ├── __init__.py     # 核心功能包
|   ├── models.py       # 包含 User, Product 类
|   └── utils.py        # 包含 format_price 函数
|
└── api/
    ├── __init__.py     # API 接口包
    └── routes.py       # 包含 get_user_route, get_product_route
```

**`core/__init__.py` 的内容 (简化 API):**

```python
# ecommerce/core/__init__.py

from .models import User, Product
from .utils import format_price

# 定义通过 from .core import * 能导入的内容
__all__ = ['User', 'Product', 'format_price']
```

**`main.py` 的使用方式:**

```python
# main.py

# 因为 core/__init__.py 已经将 User 和 format_price 提升了
# 我们可以直接从 core 导入，而不需要关心 models.py 或 utils.py
from ecommerce.core import User, format_price

# 如果没有在 __init__.py 中提升，就必须这样写：
# from ecommerce.core.models import User
# from ecommerce.core.utils import format_price

user = User(name="Alice")
price = format_price(99.9)

print(f"User: {user.name}, Price: {price}")
```

#### 总结与最佳实践

1.  **始终包含 `__init__.py`**：即使文件是空的，也请在你的包目录中包含它，以确保最好的兼容性和代码清晰度。
2.  **保持简洁**：`__init__.py` 应该保持简短和专注。复杂的逻辑应该放在其他模块中。
3.  **用于提供简洁的 API**：当你创建一个库或一个复杂的包时，使用 `__init__.py` 提升关键的类和函数，为用户提供一个干净的入口。
4.  **谨慎使用初始化代码**：在 `__init__.py` 中放置的代码不应该有太多的副作用（如长时间的 I/O 操作），因为它会在导入时执行，可能会拖慢程序启动速度。
5.  **明确定义 `__all__`**：如果你希望你的包支持 `from package import *`，请务必定义 `__all__`，以避免导出不必要的内部变量。

### Python 里的迭代器及应用

**迭代器**是一种可以顺序访问容器元素的对象。通过迭代器，我们可以不需要关心容器的底层结构，逐个获取元素，直到访问完所有元素。常见的迭代器例子：列表、字典、字符串、文件等。在 Python 中，迭代器有两个关键概念：迭代，即按顺序访问容器中的元素。惰性计算，不需要一次性加载所有元素，可以按需获取。

在 Python 中，迭代器对象实现了两个方法：
- `__iter__()`：返回迭代器对象本身，允许对象被迭代。
- `__next__()`：返回容器中的下一个元素。如果没有元素了，它会抛出 `StopIteration` 异常，表示迭代完成。

`map()` 函数：
```python
numbers = [1, 2, 3, 4, 5]
squared = map(lambda x: x ** 2, numbers)

# map 返回的是一个迭代器，我们需要通过迭代访问它
print(next(squared))  # 输出 1
print(next(squared))  # 输出 4
print(next(squared))  # 输出 9
```

`zip()` 函数：
```python
names = ['Alice', 'Bob', 'Charlie']
scores = [90, 85, 88]

zipped = zip(names, scores)

# 获取下一个元素
print(next(zipped))  # 输出 ('Alice', 90)
print(next(zipped))  # 输出 ('Bob', 85)
```

**来看一个很重要的例子：**

> 在强化学习中，每个 episode（回合）通常会包含多个时间步，每个时间步都有一个状态（state）。当智能体执行动作后，如果它达到了一个终止状态（比如 CartPole 摆倒了，或者游戏结束），下一个状态（`next_state`）就会是 `None`，表示 episode 已经结束。

```python
non_final_mask = torch.tensor(
    tuple(map(lambda s: s is not None, batch.next_state)),
    device=device,
    dtype=torch.bool
)
```
这行代码的目标是生成一个布尔掩码（mask），该掩码标记了哪些样本的下一状态不是 `None`。即，如果下一状态不是终止状态，掩码值为 `True`，否则为 `False`。
```python
# 假设 `batch.next_state` 是一个状态列表：
batch.next_state = [s1, s2, None, s4, None]
# 那么，我们想要的掩码 `non_final_mask` 就应该是：
non_final_mask = [True, True, False, True, False]
```

`map(lambda s: s is not None, batch.next_state)`
- `map()` 是 Python 中的内置函数，它将给定的函数应用到 可迭代对象（如列表、元组）中的每一个元素上。
- 这里，`lambda s: s is not None` 是一个匿名函数，检查每个状态是否不为 None。
- 输入：`batch.next_state = [s1, s2, None, s4, None]`
- 输出：`[True, True, False, True, False]

`map()` 会返回一个迭代器，所以要将其转换为 tuple 来获取最终结果。tuple(map(...)) 就是将迭代器转换成元组：
```python
tuple(map(lambda s: s is not None, batch.next_state))  # 输出：(True, True, False, True, False)
```

接下来就是把这个元组变为一个 PyTorch 张量，略。

### 如何理解 `batch = Transition(*zip(*transitions))` ？

`batch = Transition(*zip(*transitions))` 是强化学习代码中最典型的 Python“解包 + 转置”技巧之一。
我们来彻底拆开，从最底层的**数据结构变化**一步步看清楚它在干什么。

假设我们从 `ReplayMemory` 里采样了一个 batch：

```python
transitions = memory.sample(3)
```

此时 `transitions` 是一个长度为 3 的 **列表**，
每个元素都是一个 `Transition` 命名元组（包含 4 个字段）：

```python
Transition = namedtuple('Transition', ('state', 'action', 'next_state', 'reward'))

transitions =
[
  Transition(state=s1, action=a1, next_state=s1', reward=r1),
  Transition(state=s2, action=a2, next_state=s2', reward=r2),
  Transition(state=s3, action=a3, next_state=s3', reward=r3)
]
```

可以形象地画成一个二维表：

| 样本 | state | action | next_state | reward |
| -- | ----- | ------ | ---------- | ------ |
| 1  | s1    | a1     | s1'        | r1     |
| 2  | s2    | a2     | s2'        | r2     |
| 3  | s3    | a3     | s3'        | r3     |

我们要把它变成**每一列一个批量的张量**，即：

| 字段           | 批次内容            |
| ------------ | --------------- |
| `state`      | (s1, s2, s3)    |
| `action`     | (a1, a2, a3)    |
| `next_state` | (s1', s2', s3') |
| `reward`     | (r1, r2, r3)    |

那么 `zip(*transitions)` 在干嘛呢？

先看`zip` 的基本用法：

```python
a = [1, 2, 3]
b = ['A', 'B', 'C']
list(zip(a, b))
→ [(1, 'A'), (2, 'B'), (3, 'C')]
```

它会把“行”打包成“列”。

而在这里的 `*` 是“解包”，`*transitions` 会把列表解包成多个参数：

```python
zip(*transitions)
→ zip(t1, t2, t3)
```

（相当于调用 zip(t1, t2, t3)，每个 t_i 是一个 Transition）

由于每个 `Transition` 是一个包含 4 个元素的 tuple：

```python
t1 = (s1, a1, s1', r1)
t2 = (s2, a2, s2', r2)
t3 = (s3, a3, s3', r3)
```

那么 `zip(t1, t2, t3)` 就会**按位置配对**：

```python
list(zip(t1, t2, t3))
→ [
    (s1, s2, s3),
    (a1, a2, a3),
    (s1', s2', s3'),
    (r1, r2, r3)
  ]
```

也就是说，它把“行”转成了“列”：

* 第一个元组是一整批 state；
* 第二个元组是一整批 action；
* 第三个元组是一整批 next_state；
* 第四个元组是一整批 reward。

这就是为什么我们称它为“批的转置（batch transpose）”。

接下来，我们再用 `Transition(*...)` 封装回去。

现在我们有一个这样的 tuple 列表：

```python
zipped = zip(*transitions)
→ [(s1,s2,s3), (a1,a2,a3), (s1',s2',s3'), (r1,r2,r3)]
```

`*zipped` 会把它再解包成 4 个参数：

```python
Transition(*zipped)
→ Transition(
    state=(s1, s2, s3),
    action=(a1, a2, a3),
    next_state=(s1', s2', s3'),
    reward=(r1, r2, r3)
)
```

于是最终的 `batch` 是一个新的 `Transition` 命名元组，
但每个字段现在都包含了一个“批次”的所有样本。

示例效果：
```python
from collections import namedtuple

Transition = namedtuple('Transition', ('state', 'action', 'next_state', 'reward'))

t1 = Transition('s1', 'a1', "s1'", 'r1')
t2 = Transition('s2', 'a2', "s2'", 'r2')
t3 = Transition('s3', 'a3', "s3'", 'r3')

transitions = [t1, t2, t3]

batch = Transition(*zip(*transitions))
print(batch)
```

输出：
```txt
Transition(
  state=('s1', 's2', 's3'),
  action=('a1', 'a2', 'a3'),
  next_state=("s1'", "s2'", "s3'"),
  reward=('r1', 'r2', 'r3')
)
```

完美实现了“行列互换”！