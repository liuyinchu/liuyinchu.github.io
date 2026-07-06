<!-- modern-control:zh -->

## 课程定位

这是《现代控制理论与技术》的课程实践网站草案。它服务于两件事：第一，课堂实践中用一个两级质量-弹簧-阻尼系统把状态空间建模、传递函数、可控性与可观性讲清楚；第二，期末大作业中把主动隔振平台作为完整 MIMO 控制对象，完成从建模理解、解耦、状态估计到控制器设计与频域评定的闭环训练。

<div class="course-stage-grid">
<div><strong>01 建模</strong><p>从力学方程、状态空间和传递函数建立对象模型。</p></div>
<div><strong>02 解耦</strong><p>从局部执行器/传感器坐标映射到质心逻辑坐标。</p></div>
<div><strong>03 估计</strong><p>用 Kalman 滤波器处理状态不可测与传感噪声。</p></div>
<div><strong>04 评定</strong><p>用统一 ASD 规范比较 Control off / on。</p></div>
</div>

::: note
本页是半官方课程页，默认截止日期、下载链接和邮箱均为占位信息，后续会按课程安排替换。
:::

## 课堂实践：两级质量-弹簧-阻尼系统

课堂实践使用两级质量-弹簧-阻尼系统作为贯穿例子。质量块 $m_1$ 通过 $k_1,c_1$ 与运动基座相连，质量块 $m_2$ 通过 $k_2,c_2$ 与 $m_1$ 相连；基座位移扰动记为 $w(t)$，控制力 $f(t)$ 作用在 $m_1$，常用输出为相对位移 $\Delta x=x_2-x_1$。

在绝对坐标 $\boldsymbol{q}=[x_1,x_2]^\top$ 下，模型可写为

$$
\mathbf{M}\ddot{\boldsymbol{q}}
+
\mathbf{C}_\mathrm{m}\dot{\boldsymbol{q}}
+
\mathbf{K}\boldsymbol{q}
=
\boldsymbol{b}_\mathrm{f}f
+
\boldsymbol{b}_1\dot{w}
+
\boldsymbol{b}_0 w.
$$

其中

$$
\mathbf{M}=\begin{bmatrix}m_1&0\\0&m_2\end{bmatrix},\quad
\mathbf{C}_\mathrm{m}=\begin{bmatrix}c_1+c_2&-c_2\\-c_2&c_2\end{bmatrix},\quad
\mathbf{K}=\begin{bmatrix}k_1+k_2&-k_2\\-k_2&k_2\end{bmatrix}.
$$

如果改用相对基座坐标 $r_1=x_1-w, r_2=x_2-w$，扰动只通过基座加速度 $a_\mathrm{g}=\ddot{w}$ 进入：

$$
\mathbf{M}\ddot{\boldsymbol{r}}
+
\mathbf{C}_\mathrm{m}\dot{\boldsymbol{r}}
+
\mathbf{K}\boldsymbol{r}
=
\boldsymbol{b}_\mathrm{f}f-
\mathbf{M}\boldsymbol{b}_\mathrm{g}a_\mathrm{g}.
$$

这两个模型应当被学生用来比较输入选择、状态定义和输出定义对后续控制问题的影响。课堂实践建议至少完成：

- 写出绝对坐标与相对坐标状态空间模型；
- 推导 $F(s)\to \Delta X(s)$ 与 $W(s)\to \Delta X(s)$ 的传递函数；
- 检查只用控制力 $f$ 时系统的可控性；
- 比较测量 $x_1,x_2$ 与只测量 $\Delta x$ 时的可观性差异；
- 解释低频同向模态和高频相对模态的物理含义。

<div class="course-button-row">
<span class="course-download is-disabled">下载课堂实践 Simulink 模型（待上传）</span>
</div>

## 期末大作业背景：主动隔振平台

期末大作业以主动隔振系统为背景。参考论文中使用的 3-DOF active vibration isolation system：平台主要考虑水平平动、竖直平动和绕 $Y$ 轴转动三个自由度，执行器提供主动控制力，惯性传感器测量平台运动。论文工作将模型解耦到质心逻辑坐标，并在此基础上设计 MIMO $H_\infty$ 环路整形控制器和虚拟传感器融合结构。

对本课程而言，不要求复现论文全部实验系统。你需要把论文中的工程问题抽象为如下控制任务：

- 原系统是多输入多输出对象，不同执行器和传感器通道之间存在耦合；
- 局部坐标下的执行器/传感器信号需要通过 Jacobian 或等效坐标变换映射到逻辑自由度；
- 传感器输出同时受到外部扰动与测量噪声影响；
- 高频未建模动态和传感噪声会限制控制器带宽；
- 控制性能应通过频域 ASD 而不是只看时域曲线评定。

### 扰动与噪声

在主动隔振问题中，闭环性能主要受两类输入限制：一类是地面运动引起的外部扰动，即基座扰动；另一类是传感器与测量链路引入的传感噪声。测量输出可以统一写作

$$
y(t)=y_0(t)+n(t),
$$

其中 $y_0(t)$ 是真实输出，$n(t)$ 是传感噪声。仿真时建议设置两组输入：一组白噪声用于基准比较，另一组实测噪声用于体现真实环境中的低频起伏、谱峰和非平坦特性。

<div class="course-figure-grid">

![扰动与噪声定义](/modern-control-course/figures/disturbance-noise-definition.png)

![传感噪声时域与频域对比](/modern-control-course/figures/sensing-noise-asd.png)

![地震噪声时域与频域对比](/modern-control-course/figures/seismic-noise-asd.png)

![白噪声组与实测噪声组说明](/modern-control-course/figures/noise-input-groups.png)

</div>

## 期末大作业任务

### 1. 模型理解与解耦

在充分理解给定模型的基础上，对模型进行解耦。建议把执行器和传感器的局部坐标映射到质心坐标，得到近似的垂向、转动和水平方向逻辑通道。可选任务：在解耦模型基础上设计分布式 SISO 控制器，作为后续 MIMO 控制器的基线。

### 2. 可控性与可观性分析

构造可控性矩阵与可观性矩阵，分别检查

$$
\mathcal{C}=\begin{bmatrix}\mathbf{B}&\mathbf{A}\mathbf{B}&\cdots&\mathbf{A}^{n-1}\mathbf{B}\end{bmatrix},\qquad
\mathcal{O}=\begin{bmatrix}\mathbf{C}\\\mathbf{C}\mathbf{A}\\\cdots\\\mathbf{C}\mathbf{A}^{n-1}\end{bmatrix}.
$$

报告中不仅要写秩，还要解释不可观状态如何影响控制性能。例如，若某些公共运动或转动分量无法由当前传感器区分，观测器的估计误差会通过反馈进入控制力，表现为低频残余、谱峰抬升或控制器带宽受限。

### 3. Kalman 滤波器测试

设计 Kalman 滤波器并作为状态观测器应用于该模型。建议明确写出 $Q,R$ 的选择依据，并比较各状态估计结果与真实状态的频域 ASD。重点不是只展示滤波器“看起来平滑”，而是说明它在目标频段是否保留有用状态信息、是否抑制测量噪声，以及是否引入不可接受的相位滞后。

### 4. MIMO 控制器设计与性能评定

基于 LQG、$H_\infty$ 或其它方法，对解耦后的模型设计 MIMO 控制器，并评定控制器性能。$H_\infty$ 环路整形可按如下逻辑理解：

$$
G \longrightarrow G_\mathrm{s}=W_2GW_1
\longrightarrow K_\infty
\longrightarrow K=W_1K_\infty W_2.
$$

低频希望开环增益足够高以抑制扰动，高频希望增益下降以避免放大传感噪声和未建模动态。LQG 方法则将 LQR 状态反馈与 Kalman 状态估计结合，依靠分离原理形成 $u(t)=-K\hat{x}(t)$ 的输出反馈结构。

<div class="course-button-row">
<span class="course-download is-disabled">下载期末大作业 ZIP 包（待上传）</span>
</div>

## 方法引导

<div class="course-method-grid">
<div><strong>KF / LQE</strong><p>用于状态不可完全测量且测量含噪的情形。报告应解释创新、协方差、Kalman 增益和 $Q,R$ 调参含义。</p></div>
<div><strong>LQG</strong><p>把 LQR 与 Kalman 滤波串联。适合把 MIMO 耦合、状态估计和能量型性能指标组织到同一框架。</p></div>
<div><strong>H∞ 环路整形</strong><p>先用权重塑造频域开环，再求鲁棒稳定化控制器。重点是性能-鲁棒性折中。</p></div>
</div>

建议的思考顺序：

1. 先画出对象的输入、输出、扰动和噪声通道；
2. 再决定哪些量用于控制输入，哪些量只是外部扰动；
3. 对 MIMO 对象先看奇异值和交叉通道，而不是只看单个 Bode 图；
4. 对 KF/LQG，先做可观性和噪声协方差解释，再展示估计效果；
5. 对 $H_\infty$，先说明权重设计意图，再展示 $S,T,KS$ 或闭环响应；
6. 所有方法最终都回到统一 ASD 评定标准。

允许尝试上述提示方法以外的控制方法，包括但不限于 RL、MPC、DOB、扰动观测器、$\mu$ 综合、数据驱动控制等。但无论采用何种方法，必须使用同一仿真条件和同一频域评定规范。

## 统一结果评定标准

每个方案至少需要进行两组仿真：

- Control off：控制关闭，仿真时长不少于 1000 s；
- Control on：控制开启，仿真时长不少于 1000 s。

采样率固定为 $f_s=10\,\mathrm{kHz}$。使用 Welch 方法估计 ASD，频率分辨率固定为 $\Delta f=0.01\,\mathrm{Hz}$，绘制 $0.01$ Hz 到 $100$ Hz 频段内的位移 ASD 对比图。

```python
import numpy as np
from scipy import signal


def displacement_asd(x, fs=10_000, df=0.01):
    """Return frequency and amplitude spectral density using the course standard."""
    x = np.asarray(x, dtype=float)
    nperseg = int(round(fs / df))
    if x.size < nperseg:
        raise ValueError("Simulation record is shorter than one Welch segment.")

    freq, psd = signal.welch(
        x,
        fs=fs,
        nperseg=nperseg,
        noverlap=nperseg // 2,
        detrend="constant",
        scaling="density",
    )
    return freq, np.sqrt(psd)


def asd_plot_limits(*asd_arrays, margin=0.08):
    values = np.concatenate([np.asarray(item, dtype=float).ravel() for item in asd_arrays])
    values = values[np.isfinite(values) & (values > 0)]
    y_min = values.min()
    y_max = values.max()
    factor = 1.0 + margin
    return y_min / factor, y_max * factor
```

绘图规范：

- 横轴固定为 $0.01$ Hz 到 $100$ Hz；
- 纵轴根据 $y_\min,y_\max$ 自适应，上下保留 5% 到 10% 余量；
- 图宽 120 mm，图高 90 mm；
- 基础字号 10.5 pt，刻度字号 9.5 pt；
- 线宽 1.5 pt；
- 同一张图中必须同时包含 Control off 与 Control on；
- 每个关键自由度或关键输出至少给出一张 ASD 对比图。

## 提交要求与截止日期

<div class="course-deadline">
<strong>2026-08-31 23:59</strong>
<p>默认占位截止日期。请提交一份完整 PDF 报告到课程指定邮箱；基于报告制作答辩 Slides，通常在报告提交后一周内进行答辩。</p>
</div>

报告至少应包含：

1. 模型说明与解耦过程；
2. 可控性与可观性分析；
3. Kalman 滤波器设计、参数选择与测试；
4. 控制器设计，包括控制结构、权重或性能指标选择；
5. Control off / on 仿真设置；
6. ASD 对比图与性能解释；
7. 方法局限、失败案例或可改进方向。

Slide 应服务于答辩，不是把报告缩小。建议控制在问题背景、模型、方法、结果、结论五个部分，并准备解释为什么某些状态不可观、为什么某些频段控制效果有限、为什么你选择的控制方法适合这个对象。

<!-- modern-control:en -->

## Course Positioning

This is a draft course website for Modern Control Theory and Technology. It supports two connected activities: classroom practice with a two-stage mass-spring-damper system, and a final project based on active vibration isolation. The intended learning path is modeling, decoupling, state estimation, MIMO controller design, and unified frequency-domain evaluation.

<div class="course-stage-grid">
<div><strong>01 Modeling</strong><p>Build equations of motion, state-space models, and transfer functions.</p></div>
<div><strong>02 Decoupling</strong><p>Map local actuator and sensor coordinates to logical center-of-mass coordinates.</p></div>
<div><strong>03 Estimation</strong><p>Use Kalman filtering to handle unmeasured states and sensing noise.</p></div>
<div><strong>04 Evaluation</strong><p>Compare Control off / on cases with a unified ASD standard.</p></div>
</div>

::: note
This is a semi-official draft. The deadline, email address, and download links are placeholders and will be updated according to the course schedule.
:::

## Classroom Practice: Two-Stage Mass-Spring-Damper System

The classroom practice uses a two-stage mass-spring-damper system as the running example. Mass $m_1$ is connected to the moving base through $k_1,c_1$, while mass $m_2$ is connected to $m_1$ through $k_2,c_2$. The base displacement disturbance is $w(t)$, the control force $f(t)$ acts on $m_1$, and a common output is the relative displacement $\Delta x=x_2-x_1$.

In absolute coordinates $\boldsymbol{q}=[x_1,x_2]^\top$, the model is

$$
\mathbf{M}\ddot{\boldsymbol{q}}
+
\mathbf{C}_\mathrm{m}\dot{\boldsymbol{q}}
+
\mathbf{K}\boldsymbol{q}
=
\boldsymbol{b}_\mathrm{f}f
+
\boldsymbol{b}_1\dot{w}
+
\boldsymbol{b}_0w.
$$

If relative base coordinates $r_1=x_1-w, r_2=x_2-w$ are used, the disturbance enters through base acceleration only:

$$
\mathbf{M}\ddot{\boldsymbol{r}}
+
\mathbf{C}_\mathrm{m}\dot{\boldsymbol{r}}
+
\mathbf{K}\boldsymbol{r}
=
\boldsymbol{b}_\mathrm{f}f-
\mathbf{M}\boldsymbol{b}_\mathrm{g}a_\mathrm{g}.
$$

Students should use this example to compare how coordinate choice, input definition, and output definition affect the later control problem. The practice should cover:

- state-space models in both absolute and relative coordinates;
- transfer functions from $F(s)$ and $W(s)$ to $\Delta X(s)$;
- controllability when only the force input $f$ is available;
- observability under different sensor-output choices;
- physical interpretation of the low-frequency common mode and the higher-frequency relative mode.

<div class="course-button-row">
<span class="course-download is-disabled">Download classroom Simulink model (coming soon)</span>
</div>

## Final Project Background: Active Vibration Isolation

The final project is based on active vibration isolation. The reference paper studies a 3-DOF active vibration isolation system with horizontal translation, vertical translation, and rotation about the $Y$ axis. Actuators generate active control forces, inertial sensors measure platform motion, and the plant is decoupled into center-of-mass logical coordinates before MIMO $H_\infty$ loop-shaping control and virtual sensor fusion are applied.

For this course, you are not required to reproduce the complete experimental platform. Instead, extract the control problem:

- the plant is a MIMO system with coupled actuator and sensor channels;
- local actuator and sensor signals must be transformed into logical DOF coordinates;
- measured outputs are affected by both external disturbances and sensing noise;
- high-frequency unmodeled dynamics and sensing noise restrict achievable bandwidth;
- performance should be evaluated with frequency-domain ASD, not only time histories.

### Disturbance and Noise

In active isolation, closed-loop performance is mainly limited by two input classes: base motion disturbance and sensing noise. The measured output can be written as

$$
y(t)=y_0(t)+n(t),
$$

where $y_0(t)$ is the true output and $n(t)$ is the sensing noise. Simulations should include both ideal white-noise inputs for baseline comparison and measured-noise inputs for realistic low-frequency rise, spectral peaks, and non-flat spectra.

<div class="course-figure-grid">

![Definition of disturbance and sensing noise](/modern-control-course/figures/disturbance-noise-definition.png)

![Time-domain and ASD comparison of sensing noise](/modern-control-course/figures/sensing-noise-asd.png)

![Time-domain and ASD comparison of seismic noise](/modern-control-course/figures/seismic-noise-asd.png)

![White-noise and measured-noise input groups](/modern-control-course/figures/noise-input-groups.png)

</div>

## Final Project Tasks

### 1. Model Understanding and Decoupling

Understand the given plant and decouple it. A recommended route is to map local actuator and sensor coordinates to center-of-mass coordinates and obtain vertical, rotational, and horizontal logical channels. Optional task: design decentralized SISO controllers on the decoupled model as a baseline.

### 2. Controllability and Observability

Construct the controllability and observability matrices and check their ranks:

$$
\mathcal{C}=\begin{bmatrix}\mathbf{B}&\mathbf{A}\mathbf{B}&\cdots&\mathbf{A}^{n-1}\mathbf{B}\end{bmatrix},\qquad
\mathcal{O}=\begin{bmatrix}\mathbf{C}\\\mathbf{C}\mathbf{A}\\\cdots\\\mathbf{C}\mathbf{A}^{n-1}\end{bmatrix}.
$$

The report should explain more than rank. Discuss how unobservable states affect control performance, such as residual low-frequency motion, raised spectral peaks, or bandwidth limitations caused by estimator uncertainty.

### 3. Kalman Filter Test

Design a Kalman filter as a state observer. Explain the choice of $Q$ and $R$, then compare the ASD of estimated and true states. The point is not merely to show a smooth signal. You should show whether useful state information is preserved in the target band, whether sensing noise is suppressed, and whether unacceptable phase lag is introduced.

### 4. MIMO Controller Design and Performance Evaluation

Design a MIMO controller for the decoupled model using LQG, $H_\infty$, or another justified method. A loop-shaping $H_\infty$ workflow can be summarized as

$$
G \longrightarrow G_\mathrm{s}=W_2GW_1
\longrightarrow K_\infty
\longrightarrow K=W_1K_\infty W_2.
$$

Low frequencies need sufficiently high loop gain for disturbance rejection, while high frequencies need reduced gain to avoid amplifying sensing noise and unmodeled dynamics. LQG combines LQR state feedback with Kalman state estimation and implements an output-feedback law $u(t)=-K\hat{x}(t)$.

<div class="course-button-row">
<span class="course-download is-disabled">Download final-project ZIP package (coming soon)</span>
</div>

## Method Guide

<div class="course-method-grid">
<div><strong>KF / LQE</strong><p>Use for noisy measurements and unmeasured states. Explain innovation, covariance, Kalman gain, and the role of $Q,R$.</p></div>
<div><strong>LQG</strong><p>Connect LQR and Kalman filtering. Useful when MIMO coupling, estimation, and energy-like performance criteria must be organized together.</p></div>
<div><strong>H∞ Loop Shaping</strong><p>Shape the open-loop plant with weights, then synthesize a robust stabilizing controller. The key issue is the performance-robustness trade-off.</p></div>
</div>

Recommended workflow:

1. Draw the plant inputs, outputs, disturbances, and noise channels;
2. separate control inputs from external disturbance inputs;
3. inspect MIMO singular values and cross-channel responses before relying on SISO Bode plots;
4. for KF/LQG, discuss observability and covariance choices before showing estimates;
5. for $H_\infty$, state the weighting intention before showing $S,T,KS$ or closed-loop response;
6. evaluate every method with the same ASD standard.

Other methods are welcome, including RL, MPC, DOB, disturbance observers, $\mu$ synthesis, and data-driven control. Regardless of method, use the same simulation and evaluation conditions.

## Unified Evaluation Standard

Each solution must include at least two simulations:

- Control off: controller disabled, duration no less than 1000 s;
- Control on: controller enabled, duration no less than 1000 s.

The sampling rate is fixed at $f_s=10\,\mathrm{kHz}$. Use Welch's method to estimate ASD with frequency resolution $\Delta f=0.01\,\mathrm{Hz}$, then plot displacement ASD from $0.01$ Hz to $100$ Hz.

```python
import numpy as np
from scipy import signal


def displacement_asd(x, fs=10_000, df=0.01):
    """Return frequency and amplitude spectral density using the course standard."""
    x = np.asarray(x, dtype=float)
    nperseg = int(round(fs / df))
    if x.size < nperseg:
        raise ValueError("Simulation record is shorter than one Welch segment.")

    freq, psd = signal.welch(
        x,
        fs=fs,
        nperseg=nperseg,
        noverlap=nperseg // 2,
        detrend="constant",
        scaling="density",
    )
    return freq, np.sqrt(psd)


def asd_plot_limits(*asd_arrays, margin=0.08):
    values = np.concatenate([np.asarray(item, dtype=float).ravel() for item in asd_arrays])
    values = values[np.isfinite(values) & (values > 0)]
    y_min = values.min()
    y_max = values.max()
    factor = 1.0 + margin
    return y_min / factor, y_max * factor
```

Plotting standard:

- x-axis fixed from $0.01$ Hz to $100$ Hz;
- y-axis based on $y_\min,y_\max$ with 5% to 10% margins;
- figure width 120 mm, height 90 mm;
- base font size 10.5 pt, tick font size 9.5 pt;
- line width 1.5 pt;
- Control off and Control on must appear in the same figure;
- each key DOF or key output should have at least one ASD comparison figure.

## Submission and Deadline

<div class="course-deadline">
<strong>2026-08-31 23:59</strong>
<p>Placeholder deadline. Submit a complete PDF report to the course email address. Prepare defense slides based on the report; the defense is normally scheduled about one week after submission.</p>
</div>

The report should include at least:

1. model explanation and decoupling procedure;
2. controllability and observability analysis;
3. Kalman filter design, parameter choices, and tests;
4. controller design, including structure, weights, or performance metrics;
5. Control off / on simulation setup;
6. ASD comparison plots and performance interpretation;
7. limitations, failed cases, or possible improvements.

Slides should support the defense rather than compress the whole report. A good structure is background, model, method, results, and conclusion. Be ready to explain why some states are unobservable, why some frequency bands remain difficult to control, and why your chosen control method fits the plant.
