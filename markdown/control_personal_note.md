# 动力学与控制基础笔记

本文整理动力学建模、信号与系统、频域分析、经典控制、状态空间方法、离散化以及扰动噪声建模。全文以两级质量-弹簧-阻尼系统作为贯穿示例，目标是把控制理论中常用的建模、分析和设计工具放在同一套符号体系下说明，便于后续推导、仿真和工程设计复用。

## 0 符号与基本约定

本文默认研究连续时间线性时不变系统（LTI）及其在工作点附近的小信号模型。标量变量采用斜体，如 $t$、$s$、$f$、$\omega$；矢量采用粗斜体，如 $\boldsymbol{x}$；矩阵采用粗正体，如 $\mathbf{A}$；描述性下标采用正体，如 $\boldsymbol{x}_\mathrm{g}$、$\mathbf{B}_\mathrm{u}$。拉普拉斯变量记为 $s$，频率记为 $f$，角频率记为 $\omega$，虚数单位统一写作 $\mathrm{j}$，因此频域替换写作 $s=\mathrm{j}\omega$。

常用的连续时间状态空间模型写作

$$
\dot{\boldsymbol{x}}(t)=\mathbf{A}\boldsymbol{x}(t)+\mathbf{B}\boldsymbol{u}(t),
\qquad
\boldsymbol{y}(t)=\mathbf{C}\boldsymbol{x}(t)+\mathbf{D}\boldsymbol{u}(t).
$$

若只讨论单输入单输出系统，则常把输入、输出写成 $u(t)$ 与 $y(t)$，传递函数写成

$$
G(s)=\frac{Y(s)}{U(s)},
$$

默认零初始条件。若存在非零初始条件，需要将零输入响应与零状态响应分开处理。

## 1 贯穿示例：两级质量-弹簧-阻尼系统

### 1.1 系统描述与建模假设

考虑下图所示的两级质量-弹簧-阻尼系统。质量块 $m_1$ 通过弹簧 $k_1$ 与阻尼 $c_1$ 连接到运动基座，质量块 $m_2$ 通过弹簧 $k_2$ 与阻尼 $c_2$ 连接到 $m_1$。基座位移扰动为 $w(t)$，外部控制力 $f(t)$ 作用在 $m_1$ 上，常用输出为两质量块相对位移 $\Delta x=x_2-x_1$。

![理想两级质量-弹簧-阻尼系统](attachments/Two_Stage_Mass_Spring_Damping_System_Inverted.png)

采用如下假设：

- 竖直向上为正方向；
- 元件满足线性弹簧与线性粘性阻尼关系；
- 仅考虑工作点附近的小振动；
- 重力导致的静挠度已吸收入平衡点，不在动态方程中显式出现；
- $m_1\gt0$、$m_2\gt0$，通常取 $k_1\ge0$、$k_2\ge0$、$c_1\ge0$、$c_2\ge0$。

令广义坐标为

$$
\boldsymbol{q}=
\begin{bmatrix}
x_1\\
x_2
\end{bmatrix},
\qquad
\boldsymbol{b}_\mathrm{f}=
\begin{bmatrix}
1\\
0
\end{bmatrix},
\qquad
\boldsymbol{b}_\mathrm{g}=
\begin{bmatrix}
1\\
1
\end{bmatrix}.
$$

系统动能、势能与 Rayleigh 阻尼函数分别为

$$
T=\frac{1}{2}m_1\dot{x}_1^2+\frac{1}{2}m_2\dot{x}_2^2,
$$

$$
V=\frac{1}{2}k_1(x_1-w)^2+\frac{1}{2}k_2(x_2-x_1)^2,
$$

$$
\mathcal{D}=\frac{1}{2}c_1(\dot{x}_1-\dot{w})^2+\frac{1}{2}c_2(\dot{x}_2-\dot{x}_1)^2.
$$

带耗散的 Lagrange 方程为

$$
\frac{\mathrm{d}}{\mathrm{d}t}
\left(
\frac{\partial T}{\partial \dot{x}_i}
\right)
-
\frac{\partial T}{\partial x_i}
+
\frac{\partial \mathcal{D}}{\partial \dot{x}_i}
+
\frac{\partial V}{\partial x_i}
=Q_i,
\qquad i=1,2,
$$

其中 $Q_1=f$、$Q_2=0$。整理得到

$$
\begin{aligned}
m_1\ddot{x}_1
&=-k_1(x_1-w)-c_1(\dot{x}_1-\dot{w})
+k_2(x_2-x_1)+c_2(\dot{x}_2-\dot{x}_1)+f,\\
m_2\ddot{x}_2
&=-k_2(x_2-x_1)-c_2(\dot{x}_2-\dot{x}_1).
\end{aligned}
$$

写成矩阵形式为

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
\boldsymbol{b}_0w,
$$

其中

$$
\mathbf{M}=
\begin{bmatrix}
m_1&0\\
0&m_2
\end{bmatrix},
\quad
\mathbf{C}_\mathrm{m}=
\begin{bmatrix}
c_1+c_2&-c_2\\
-c_2&c_2
\end{bmatrix},
\quad
\mathbf{K}=
\begin{bmatrix}
k_1+k_2&-k_2\\
-k_2&k_2
\end{bmatrix},
$$

$$
\boldsymbol{b}_1=
\begin{bmatrix}
c_1\\
0
\end{bmatrix},
\qquad
\boldsymbol{b}_0=
\begin{bmatrix}
k_1\\
0
\end{bmatrix}.
$$

该形式直接保留了基座位移 $w$ 与基座速度 $\dot{w}$ 的输入项，适合从绝对坐标推导传递函数，也适合检查力、位移、速度各项的物理来源。

### 1.2 相对基座坐标

在隔振、地面扰动和精密定位问题中，基座加速度常是更自然的扰动输入。定义相对基座位移

$$
r_1=x_1-w,
\qquad
r_2=x_2-w,
\qquad
\boldsymbol{r}=
\begin{bmatrix}
r_1\\
r_2
\end{bmatrix}.
$$

有

$$
\dot{\boldsymbol{q}}=\dot{\boldsymbol{r}}+\boldsymbol{b}_\mathrm{g}\dot{w},
\qquad
\ddot{\boldsymbol{q}}=\ddot{\boldsymbol{r}}+\boldsymbol{b}_\mathrm{g}\ddot{w}.
$$

代入绝对坐标方程并利用

$$
\mathbf{C}_\mathrm{m}\boldsymbol{b}_\mathrm{g}=
\begin{bmatrix}
c_1\\
0
\end{bmatrix},
\qquad
\mathbf{K}\boldsymbol{b}_\mathrm{g}=
\begin{bmatrix}
k_1\\
0
\end{bmatrix},
$$

可得相对坐标模型

$$
\mathbf{M}\ddot{\boldsymbol{r}}
+
\mathbf{C}_\mathrm{m}\dot{\boldsymbol{r}}
+
\mathbf{K}\boldsymbol{r}
=
\boldsymbol{b}_\mathrm{f}f
-
\mathbf{M}\boldsymbol{b}_\mathrm{g}\ddot{w}.
$$

展开为

$$
\begin{aligned}
m_1\ddot{r}_1+(c_1+c_2)\dot{r}_1-c_2\dot{r}_2+(k_1+k_2)r_1-k_2r_2
&=f-m_1\ddot{w},\\
m_2\ddot{r}_2-c_2\dot{r}_1+c_2\dot{r}_2-k_2r_1+k_2r_2
&=-m_2\ddot{w}.
\end{aligned}
$$

相对坐标形式的重要优点是扰动只通过 $\ddot{w}$ 进入方程，不需要把 $w$ 与 $\dot{w}$ 同时作为独立输入。测量量之间的关系为

$$
x_1=r_1+w,
\qquad
x_2=r_2+w,
\qquad
\Delta x=x_2-x_1=r_2-r_1.
$$

### 1.3 状态空间模型

取绝对坐标状态

$$
\boldsymbol{z}=
\begin{bmatrix}
x_1\\
x_2\\
\dot{x}_1\\
\dot{x}_2
\end{bmatrix},
\qquad
\boldsymbol{u}=
\begin{bmatrix}
f\\
w\\
\dot{w}
\end{bmatrix}.
$$

则

$$
\dot{\boldsymbol{z}}=\mathbf{A}\boldsymbol{z}+\mathbf{B}\boldsymbol{u},
$$

其中

$$
\mathbf{A}=
\begin{bmatrix}
0&0&1&0\\
0&0&0&1\\
-\dfrac{k_1+k_2}{m_1}&\dfrac{k_2}{m_1}&-\dfrac{c_1+c_2}{m_1}&\dfrac{c_2}{m_1}\\[2mm]
\dfrac{k_2}{m_2}&-\dfrac{k_2}{m_2}&\dfrac{c_2}{m_2}&-\dfrac{c_2}{m_2}
\end{bmatrix},
\qquad
\mathbf{B}=
\begin{bmatrix}
0&0&0\\
0&0&0\\
\dfrac{1}{m_1}&\dfrac{k_1}{m_1}&\dfrac{c_1}{m_1}\\[2mm]
0&0&0
\end{bmatrix}.
$$

若输出取

$$
\boldsymbol{y}=
\begin{bmatrix}
x_1\\
x_2\\
\Delta x
\end{bmatrix},
$$

则

$$
\boldsymbol{y}
=
\mathbf{C}_\mathrm{y}\boldsymbol{z}
+
\mathbf{D}_\mathrm{y}\boldsymbol{u},
\qquad
\mathbf{C}_\mathrm{y}=
\begin{bmatrix}
1&0&0&0\\
0&1&0&0\\
-1&1&0&0
\end{bmatrix},
\qquad
\mathbf{D}_\mathrm{y}=\mathbf{0}_{3\times3}.
$$

相对坐标下取

$$
\boldsymbol{z}_\mathrm{r}=
\begin{bmatrix}
r_1\\
r_2\\
\dot{r}_1\\
\dot{r}_2
\end{bmatrix},
\qquad
\boldsymbol{u}_\mathrm{r}=
\begin{bmatrix}
f\\
a_\mathrm{g}
\end{bmatrix},
\qquad
a_\mathrm{g}=\ddot{w}.
$$

此时系统矩阵仍为 $\mathbf{A}$，输入矩阵变为

$$
\mathbf{B}_\mathrm{r}=
\begin{bmatrix}
0&0\\
0&0\\
\dfrac{1}{m_1}&-1\\[2mm]
0&-1
\end{bmatrix}.
$$

若输出取相对位移与相对差动位移，

$$
\boldsymbol{y}_\mathrm{r}=
\begin{bmatrix}
r_1\\
r_2\\
r_2-r_1
\end{bmatrix},
$$

则输出矩阵仍可写为

$$
\mathbf{C}_{\mathrm{y},\mathrm{r}}=
\begin{bmatrix}
1&0&0&0\\
0&1&0&0\\
-1&1&0&0
\end{bmatrix},
\qquad
\mathbf{D}_{\mathrm{y},\mathrm{r}}=\mathbf{0}_{3\times2}.
$$

### 1.4 传递函数与模态含义

对绝对坐标模型作拉普拉斯变换，零初始条件下有

$$
\left(\mathbf{M}s^2+\mathbf{C}_\mathrm{m}s+\mathbf{K}\right)\boldsymbol{Q}(s)
=
\boldsymbol{b}_\mathrm{f}F(s)
+
\left(\boldsymbol{b}_1s+\boldsymbol{b}_0\right)W(s).
$$

定义动刚度矩阵

$$
\mathbf{Z}(s)=\mathbf{M}s^2+\mathbf{C}_\mathrm{m}s+\mathbf{K}
=
\begin{bmatrix}
Z_{11}(s)&Z_{12}(s)\\
Z_{21}(s)&Z_{22}(s)
\end{bmatrix},
$$

其中

$$
Z_{11}=m_1s^2+(c_1+c_2)s+(k_1+k_2),
\quad
Z_{22}=m_2s^2+c_2s+k_2,
\quad
Z_{12}=Z_{21}=-(c_2s+k_2).
$$

公共分母为

$$
\begin{aligned}
P(s)
&=\det \mathbf{Z}(s)\\
&=m_1m_2s^4+
\left[m_1c_2+m_2(c_1+c_2)\right]s^3\\
&\quad+
\left[m_1k_2+m_2(k_1+k_2)+c_1c_2\right]s^2
+(c_1k_2+c_2k_1)s+k_1k_2.
\end{aligned}
$$

从控制力到差动位移的传递函数为

$$
\frac{\Delta X(s)}{F(s)}
=
-\frac{m_2s^2}{P(s)}.
$$

从基座位移到差动位移的传递函数为

$$
\frac{\Delta X(s)}{W(s)}
=
-\frac{m_2s^2(c_1s+k_1)}{P(s)}.
$$

分母 $P(s)$ 的根是系统的固有极点。若阻尼较小，这些极点通常成共轭复数对，对应两个振动模态。低频模态通常表现为两个质量块近似同向运动，高频模态通常表现为两个质量块之间有明显相对运动。精确模态形状需要由广义特征值问题

$$
\left(\mathbf{K}-\omega_n^2\mathbf{M}\right)\boldsymbol{\phi}=\boldsymbol{0}
$$

求得，其中 $\omega_n$ 为无阻尼固有角频率，$\boldsymbol{\phi}$ 为模态向量。

### 1.5 可控性与可观性

若只有控制力 $f$ 可用，扰动 $w$、$\dot{w}$ 或 $\ddot{w}$ 不应计入控制输入矩阵。绝对坐标下控制输入列为

$$
\mathbf{B}_\mathrm{u}=
\begin{bmatrix}
0\\
0\\
\dfrac{1}{m_1}\\
0
\end{bmatrix}.
$$

可控性矩阵定义为

$$
\mathcal{C}_\mathrm{c}=
\begin{bmatrix}
\mathbf{B}_\mathrm{u}&
\mathbf{A}\mathbf{B}_\mathrm{u}&
\mathbf{A}^2\mathbf{B}_\mathrm{u}&
\mathbf{A}^3\mathbf{B}_\mathrm{u}
\end{bmatrix}.
$$

对该四阶模型直接计算可得

$$
\det \mathcal{C}_\mathrm{c}
=
-\frac{k_2^2}{m_1^4m_2^2}.
$$

因此在 $m_1\gt0$、$m_2\gt0$ 且 $k_2\ne0$ 时，系统对输入 $f$ 完全可控。物理上，这是因为控制力直接作用于 $m_1$，而 $m_2$ 只能通过两质量块之间的弹簧耦合间接受控；当 $k_2=0$ 时，$m_2$ 与被控质量块脱开，整体系统不可控。

若输出包含 $x_1$ 与 $x_2$，则速度状态可由位置输出的动态关系反映到可观测性矩阵中，该模型通常满秩可观。若只测量 $\Delta x$，则可观性需要重新检查。实际工程中，单一差动位移传感器可能无法区分某些公共运动分量或低频漂移，因此观测器设计前必须以实际传感器输出矩阵构造

$$
\mathcal{O}=
\begin{bmatrix}
\mathbf{C}\\
\mathbf{C}\mathbf{A}\\
\mathbf{C}\mathbf{A}^2\\
\mathbf{C}\mathbf{A}^3
\end{bmatrix}
$$

并检查 $\operatorname{rank}(\mathcal{O})$。

### 1.6 仿真模型骨架

以下 Python 代码给出与本文符号一致的状态空间矩阵。这里不依赖控制专用库，只构造矩阵，后续可接入 `scipy.signal.StateSpace`、数值积分器或自定义仿真框架。

```python
import numpy as np


def two_stage_model(m1, m2, c1, c2, k1, k2):
    A = np.array(
        [
            [0.0, 0.0, 1.0, 0.0],
            [0.0, 0.0, 0.0, 1.0],
            [-(k1 + k2) / m1, k2 / m1, -(c1 + c2) / m1, c2 / m1],
            [k2 / m2, -k2 / m2, c2 / m2, -c2 / m2],
        ],
        dtype=float,
    )

    B_abs = np.array(
        [
            [0.0, 0.0, 0.0],
            [0.0, 0.0, 0.0],
            [1.0 / m1, k1 / m1, c1 / m1],
            [0.0, 0.0, 0.0],
        ],
        dtype=float,
    )

    B_rel = np.array(
        [
            [0.0, 0.0],
            [0.0, 0.0],
            [1.0 / m1, -1.0],
            [0.0, -1.0],
        ],
        dtype=float,
    )

    C_y = np.array(
        [
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 0.0],
            [-1.0, 1.0, 0.0, 0.0],
        ],
        dtype=float,
    )

    D_abs = np.zeros((3, 3), dtype=float)
    D_rel = np.zeros((3, 2), dtype=float)
    return A, B_abs, B_rel, C_y, D_abs, D_rel
```

## 2 信号与 LTI 系统基础

### 2.1 信号分类

连续时间信号用 $x(t)$ 表示，自变量 $t$ 在连续时间轴上取值。离散时间信号用 $x[n]$ 表示，自变量 $n$ 为整数，通常来自对连续时间信号的采样：

$$
x[n]=x(nT_s),
\qquad
T_s=\frac{1}{f_s}.
$$

周期信号满足重复关系。连续时间信号若存在 $T_0\gt0$ 使得

$$
x(t+T_0)=x(t),
$$

则为周期信号。离散时间信号若存在正整数 $N_0$ 使得

$$
x[n+N_0]=x[n],
$$

则为周期信号。连续正弦信号总是周期的；离散正弦信号

$$
x[n]=A\cos(\Omega_0n+\phi)
$$

只有在 $\Omega_0/(2\pi)$ 为有理数时才是周期信号。

能量与平均功率定义为

$$
E=\int_{-\infty}^{\infty}|x(t)|^2\,\mathrm{d}t,
\qquad
P=\lim_{T\to\infty}\frac{1}{2T}\int_{-T}^{T}|x(t)|^2\,\mathrm{d}t,
$$

离散情形为

$$
E=\sum_{n=-\infty}^{\infty}|x[n]|^2,
\qquad
P=\lim_{N\to\infty}\frac{1}{2N+1}
\sum_{n=-N}^{N}|x[n]|^2.
$$

能量信号满足 $0\lt E\lt\infty$ 且 $P=0$；功率信号满足 $E=\infty$ 且 $0\lt P\lt\infty$。有限持续时间脉冲通常是能量信号，正弦波和常值信号通常是功率信号。

### 2.2 基本信号与常用运算

连续时间单位冲激 $\delta(t)$ 满足

$$
\delta(t)=0\quad (t\ne0),
\qquad
\int_{-\infty}^{\infty}\delta(t)\,\mathrm{d}t=1.
$$

其抽样性质为

$$
\int_{-\infty}^{\infty}x(t)\delta(t-t_0)\,\mathrm{d}t=x(t_0).
$$

连续时间单位阶跃为

$$
u(t)=
\begin{cases}
1,&t\ge0,\\
0,&t\lt0.
\end{cases}
$$

两者满足

$$
\delta(t)=\frac{\mathrm{d}u(t)}{\mathrm{d}t},
\qquad
u(t)=\int_{-\infty}^{t}\delta(\tau)\,\mathrm{d}\tau.
$$

离散时间单位冲激与阶跃为

$$
\delta[n]=
\begin{cases}
1,&n=0,\\
0,&n\ne0,
\end{cases}
\qquad
u[n]=
\begin{cases}
1,&n\ge0,\\
0,&n\lt0.
\end{cases}
$$

并满足

$$
\delta[n]=u[n]-u[n-1],
\qquad
u[n]=\sum_{k=-\infty}^{n}\delta[k].
$$

信号的时间变换包括时移、翻转和尺度变换。对 $y(t)=x(at-b)$，分析时应先求关键点映射：原信号中 $t_0$ 处的特征点在新信号中满足

$$
at-b=t_0,
\qquad
t=\frac{t_0+b}{a}.
$$

这样比凭直觉判断“左移”或“右移”更可靠，尤其在 $a\lt0$ 时可以同时处理翻转和缩放。

### 2.3 系统性质

系统是把输入信号映射为输出信号的规则，可写作 $y(t)=\mathcal{T}\{x(t)\}$。常见性质如下。

- 线性：满足齐次性与叠加性，

$$
\mathcal{T}\{\alpha x_1(t)+\beta x_2(t)\}
=
\alpha\mathcal{T}\{x_1(t)\}
+
\beta\mathcal{T}\{x_2(t)\}.
$$

- 时不变：若 $x(t)\mapsto y(t)$，则 $x(t-t_0)\mapsto y(t-t_0)$。
- 因果：任意时刻的输出只依赖当前与过去输入，不依赖未来输入。
- BIBO 稳定：任意有界输入产生有界输出。
- 有记忆：输出依赖当前以外的输入样本或内部状态；无记忆系统只依赖当前输入。

LTI 系统由冲激响应完全描述。连续时间卷积为

$$
y(t)=(h*x)(t)=\int_{-\infty}^{\infty}h(\tau)x(t-\tau)\,\mathrm{d}\tau,
$$

离散时间卷积为

$$
y[n]=(h*x)[n]=\sum_{k=-\infty}^{\infty}h[k]x[n-k].
$$

连续时间 LTI 系统 BIBO 稳定的充分必要条件是

$$
\int_{-\infty}^{\infty}|h(t)|\,\mathrm{d}t\lt\infty.
$$

离散时间 LTI 系统对应条件为

$$
\sum_{n=-\infty}^{\infty}|h[n]|\lt\infty.
$$

### 2.4 采样、重构与频率分辨率

采样过程可写成

$$
x[n]=x(nT_s),
\qquad
f_s=\frac{1}{T_s},
\qquad
\omega_s=2\pi f_s.
$$

理想冲激采样的频谱为

$$
X_s(\mathrm{j}\omega)
=
\frac{1}{T_s}
\sum_{k=-\infty}^{\infty}
X\left(\mathrm{j}(\omega-k\omega_s)\right).
$$

采样会使连续频谱以 $\omega_s$ 为周期复制。若原信号最高频率为 $f_\mathrm{max}$，无混叠采样需要

$$
f_s\ge2f_\mathrm{max}.
$$

$f_s/2$ 称为奈奎斯特频率。实际系统中，被采样信号通常不严格带限，因此采样前需要抗混叠低通滤波器。

理想重构使用理想低通滤波器保留中心频谱并去掉周期复制。实际数模转换常采用零阶保持（ZOH）或一阶保持（FOH）。ZOH 会引入幅值下垂和相位滞后，其频率响应含有类似 $\operatorname{sinc}$ 的包络，在高频控制系统中需要纳入带宽估计。

长度为 $M$ 的 FFT 对应频率格点间隔

$$
\Delta f=\frac{f_s}{M}.
$$

由于观测时长 $T_\mathrm{obs}=MT_s=M/f_s$，也可写成

$$
\Delta f=\frac{1}{T_\mathrm{obs}}.
$$

窗函数会改变主瓣宽度与旁瓣泄漏，因此 $\Delta f$ 是频箱间隔，不等同于任何窗函数下都能无歧义分辨两个相邻频率的实际能力。增大观测时长是提高低频分辨率的根本手段，单纯提高采样率只会扩大可分析频带。

### 2.5 傅里叶变换与拉普拉斯变换

连续时间傅里叶变换定义为

$$
X(\mathrm{j}\omega)
=
\mathcal{F}\{x(t)\}
=
\int_{-\infty}^{\infty}x(t)e^{-\mathrm{j}\omega t}\,\mathrm{d}t.
$$

反变换为

$$
x(t)=\frac{1}{2\pi}
\int_{-\infty}^{\infty}X(\mathrm{j}\omega)e^{\mathrm{j}\omega t}\,\mathrm{d}\omega.
$$

对 LTI 系统，复指数 $e^{\mathrm{j}\omega t}$ 是特征函数。若输入为 $x(t)=e^{\mathrm{j}\omega t}$，则

$$
y(t)=H(\mathrm{j}\omega)e^{\mathrm{j}\omega t},
$$

其中

$$
H(\mathrm{j}\omega)
=
\int_{-\infty}^{\infty}h(t)e^{-\mathrm{j}\omega t}\,\mathrm{d}t.
$$

因此频率响应就是冲激响应的傅里叶变换，表示系统对各频率正弦分量的幅值缩放与相位偏移。

拉普拉斯变换定义为

$$
X(s)=\mathcal{L}\{x(t)\}
=
\int_{0^-}^{\infty}x(t)e^{-st}\,\mathrm{d}t,
\qquad
s=\sigma+\mathrm{j}\omega.
$$

当收敛域包含虚轴时，令 $s=\mathrm{j}\omega$ 即得到频率响应。对由常系数线性微分方程描述的 SISO 系统，传递函数通常为有理函数

$$
G(s)=
\frac{b_ms^m+b_{m-1}s^{m-1}+\cdots+b_0}
{a_ns^n+a_{n-1}s^{n-1}+\cdots+a_0}.
$$

分子根为零点，分母根为极点。极点决定自然响应、稳定性和主要时间尺度；零点决定输入到输出通道中的抵消、相位特性和初始响应方向。

## 3 频域分析

### 3.1 Bode 图

对频率响应 $G(\mathrm{j}\omega)$，幅值和相位为

$$
M(\omega)=|G(\mathrm{j}\omega)|,
\qquad
\varphi(\omega)=\angle G(\mathrm{j}\omega).
$$

Bode 幅值图绘制

$$
20\log_{10}|G(\mathrm{j}\omega)|
$$

随对数频率的变化，相位图绘制 $\angle G(\mathrm{j}\omega)$。将传递函数分解为增益、零点和极点后，可用渐近线快速判断幅值斜率与相位变化：

- 常数增益 $K$ 只使幅值整体平移 $20\log_{10}|K|$；
- 实零点 $(1+s/\omega_z)$ 在 $\omega_z$ 后使斜率增加 $20\,\mathrm{dB}/\mathrm{dec}$，相位最多贡献约 $+90^\circ$；
- 实极点 $(1+s/\omega_p)^{-1}$ 在 $\omega_p$ 后使斜率减少 $20\,\mathrm{dB}/\mathrm{dec}$，相位最多贡献约 $-90^\circ$；
- 共轭复极点可能产生共振峰，峰值大小由阻尼比控制。

### 3.2 一阶与二阶典型环节

一阶惯性环节

$$
G(s)=\frac{K}{\tau s+1}
$$

对单位阶跃的响应为

$$
y(t)=K\left(1-e^{-t/\tau}\right)u(t).
$$

时间常数 $\tau$ 表示输出达到最终值约 $63.2\%$ 的时间。按 $2\%$ 误差带估计，调整时间约为 $4\tau$。

标准二阶环节为

$$
G(s)=
\frac{\omega_n^2}
{s^2+2\zeta\omega_ns+\omega_n^2},
$$

其中 $\omega_n$ 为无阻尼自然角频率，$\zeta$ 为阻尼比。欠阻尼情形 $0\lt\zeta\lt1$ 下，阻尼振荡频率为

$$
\omega_d=\omega_n\sqrt{1-\zeta^2}.
$$

典型瞬态指标包括峰值时间、超调量和调整时间：

$$
T_p=\frac{\pi}{\omega_d},
\qquad
M_p=e^{-\frac{\pi\zeta}{\sqrt{1-\zeta^2}}},
\qquad
T_s\approx\frac{4}{\zeta\omega_n}
\quad (2\%\ \mathrm{criterion}).
$$

频率响应为

$$
G(\mathrm{j}\omega)
=
\frac{\omega_n^2}
{\omega_n^2-\omega^2+\mathrm{j}2\zeta\omega_n\omega}.
$$

令 $\Omega=\omega/\omega_n$，有

$$
|G(\mathrm{j}\omega)|
=
\frac{1}
{\sqrt{(1-\Omega^2)^2+4\zeta^2\Omega^2}}.
$$

当 $\zeta\lt1/\sqrt{2}$ 时，幅频曲线存在共振峰。共振峰越尖，时域响应通常越容易出现超调和振铃。

### 3.3 稳定裕度与 Nyquist 判据

单位负反馈中，令开环环路传递函数为

$$
L(s)=C(s)G(s).
$$

闭环特征方程为

$$
1+L(s)=0.
$$

Bode 图中常用两个裕度衡量闭环离临界不稳定的距离。增益交叉频率 $\omega_\mathrm{gc}$ 满足

$$
|L(\mathrm{j}\omega_\mathrm{gc})|=1.
$$

相位裕度为

$$
\mathrm{PM}=180^\circ+\angle L(\mathrm{j}\omega_\mathrm{gc}).
$$

相位交叉频率 $\omega_\mathrm{pc}$ 满足

$$
\angle L(\mathrm{j}\omega_\mathrm{pc})=-180^\circ.
$$

增益裕度为

$$
\mathrm{GM}
=
\frac{1}{|L(\mathrm{j}\omega_\mathrm{pc})|},
\qquad
\mathrm{GM}_\mathrm{dB}
=
-20\log_{10}|L(\mathrm{j}\omega_\mathrm{pc})|.
$$

Nyquist 判据从复平面几何角度判断闭环稳定性：开环频率响应曲线对 $-1$ 点的环绕数，与开环右半平面极点数共同决定闭环右半平面极点数。工程上常先用 Bode 裕度快速判断，再在存在右半平面极点、纯延迟或复杂不确定性时回到 Nyquist 图核验。

## 4 经典 SISO 控制

### 4.1 单位负反馈与基本闭环函数

考虑单位负反馈结构。参考输入为 $R(s)$，误差信号为 $E(s)$，控制器为 $C(s)$，被控对象为 $G(s)$，输出为 $Y(s)$。

![SISO 环路分析](attachments/siso_loop_inverted.png)

环路传递函数定义为

$$
L(s)=C(s)G(s).
$$

忽略扰动和噪声时，有

$$
Y(s)=L(s)\left(R(s)-Y(s)\right).
$$

因此参考到输出的闭环传递函数为互补灵敏度函数

$$
T(s)=\frac{Y(s)}{R(s)}
=
\frac{L(s)}{1+L(s)}.
$$

误差到参考的传递函数为灵敏度函数

$$
S(s)=\frac{E(s)}{R(s)}
=
\frac{1}{1+L(s)}.
$$

二者满足

$$
S(s)+T(s)=1.
$$

这条恒等式说明，无法在同一频率点同时让 $|S|$ 与 $|T|$ 都任意小。典型设计策略是在低频提高 $|L|$，使 $|S|$ 小，从而改善跟踪和低频扰动抑制；在高频降低 $|L|$，使 $|T|$ 小，从而抑制测量噪声和高频未建模动态的影响。

### 4.2 扰动与测量噪声通道

若输入侧扰动 $D(s)$ 加在对象输入端，则

$$
Y(s)=G(s)\left(C(s)E(s)+D(s)\right).
$$

当 $R(s)=0$ 时，

$$
\frac{Y(s)}{D(s)}
=
\frac{G(s)}{1+L(s)}
=
G(s)S(s).
$$

因此在 $|L|\gg1$ 的频段，输入侧扰动被闭环显著压低。

若测量噪声 $N(s)$ 加在反馈测量端，即 $Y_\mathrm{m}(s)=Y(s)+N(s)$，则在 $R(s)=0$ 时

$$
\frac{Y(s)}{N(s)}
=
-\frac{L(s)}{1+L(s)}
=
-T(s).
$$

因此测量噪声主要由互补灵敏度 $T$ 传到输出。高频设计要求 $|T|$ 足够小，本质上要求高频环路增益 $|L|$ 足够低。

### 4.3 稳态误差与系统型别

对单位负反馈，误差为

$$
E(s)=S(s)R(s)=\frac{R(s)}{1+L(s)}.
$$

若闭环稳定，可用终值定理求稳态误差：

$$
e_\mathrm{ss}
=
\lim_{t\to\infty}e(t)
=
\lim_{s\to0}sE(s).
$$

开环 $L(s)$ 在原点的极点个数称为系统型别。型别越高，对低阶多项式参考输入的稳态误差越小。例如，单位阶跃参考 $R(s)=1/s$ 时，若 $L(0)$ 有足够大的直流增益，则稳态误差小；若 $L(s)$ 含积分环节，且闭环稳定，则阶跃稳态误差可为零。积分提高低频增益，但同时引入相位滞后，因此必须结合相位裕度一起设计。

### 4.4 PID 控制

带微分滤波的 PID 可写成

$$
C_\mathrm{PID}(s)
=
K_p
\left(
1+\frac{1}{T_is}
+\frac{T_ds}{\gamma_dT_ds+1}
\right),
$$

其中 $K_p$ 为比例增益，$T_i$ 为积分时间常数，$T_d$ 为微分时间常数，$\gamma_d$ 为微分滤波系数。比例项改变整体开环增益；积分项提升低频增益并降低稳态误差；微分项在中频提供相位超前，改善阻尼和相位裕度。理想微分会无限放大高频噪声，因此工程实现必须加入滤波。

并联形式常写作

$$
C_\mathrm{parallel}(s)
=
K_p+\frac{K_i}{s}
+\frac{K_ds}{\tau_fs+1}.
$$

串联形式常写作

$$
C_\mathrm{series}(s)
=
K_s
\left(1+\frac{1}{T_is}\right)
\left(1+\frac{T_ds}{\gamma_dT_ds+1}\right).
$$

不同参数化形式便于不同场景下整定，但最终都应回到开环 $L(\mathrm{j}\omega)$ 检查交叉频率、相位裕度、增益裕度和高频噪声放大。

经典整定法如 Ziegler-Nichols 振荡法和 Cohen-Coon 反应曲线法，适合作为初始参数来源。它们不应替代裕度检查、执行器饱和检查、噪声敏感性检查和实际工况验证。

### 4.5 超前、滞后与环路整形

一阶超前或滞后补偿器可统一写作

$$
C(s)=K\frac{\tau_1s+1}{\tau_2s+1}.
$$

当 $\tau_1\gt\tau_2$ 时，零点 $-1/\tau_1$ 比极点 $-1/\tau_2$ 更靠近虚轴，该环节在中频提供正相位，称为超前补偿。它常用于提高交叉频率附近的相位裕度。

![超前补偿器 Bode 图](attachments/lead_inverted.png)

当 $\tau_1\lt\tau_2$ 时，该环节主要提高低频相对增益，并在中频带来负相位，称为滞后补偿。它常用于改善稳态精度和低频扰动抑制，但必须避免在交叉频率附近损失过多相位裕度。

![滞后补偿器 Bode 图](attachments/lag_inverted.png)

环路整形的一般流程是：

1. 根据跟踪和扰动抑制要求确定低频 $|L|$；
2. 根据响应速度确定期望交叉频率或带宽；
3. 根据相位裕度、增益裕度和不确定性设置交叉附近的斜率与相位；
4. 根据噪声和未建模动态限制高频 $|L|$；
5. 反复检查 $S$、$T$、控制量 $U/R$ 以及扰动通道。

### 4.6 根轨迹与极点配置

闭环极点决定线性系统的主要瞬态形状。若开环为 $K G_0(s)$，单位负反馈闭环特征方程为

$$
1+KG_0(s)=0.
$$

当增益 $K$ 从 $0$ 变化到 $\infty$ 时，闭环极点在复平面中的轨迹称为根轨迹。根轨迹提供了从“增益变化”到“极点移动”的直观连接，可用于判断增益增大是否会带来更快响应、更多振荡或失稳风险。

在状态空间中，若 $(\mathbf{A},\mathbf{B})$ 可控，可用状态反馈

$$
\boldsymbol{u}=-\mathbf{K}_\mathrm{x}\boldsymbol{x}+\boldsymbol{r}
$$

把闭环矩阵

$$
\mathbf{A}_\mathrm{cl}
=
\mathbf{A}-\mathbf{B}\mathbf{K}_\mathrm{x}
$$

的极点配置到期望位置。极点配置可以精确指定名义闭环动态，但不会自动处理控制能量、测量噪声和模型不确定性，因此通常要结合鲁棒性与执行器约束检查。

## 5 状态空间与现代控制

### 5.1 状态空间模型与解

连续时间 LTI 系统为

$$
\dot{\boldsymbol{x}}=\mathbf{A}\boldsymbol{x}+\mathbf{B}\boldsymbol{u},
\qquad
\boldsymbol{y}=\mathbf{C}\boldsymbol{x}+\mathbf{D}\boldsymbol{u}.
$$

状态转移矩阵为

$$
\boldsymbol{\Phi}(t)=e^{\mathbf{A}t}.
$$

给定初始状态 $\boldsymbol{x}(0)$，解为

$$
\boldsymbol{x}(t)
=
e^{\mathbf{A}t}\boldsymbol{x}(0)
+
\int_{0}^{t}
e^{\mathbf{A}(t-\tau)}
\mathbf{B}\boldsymbol{u}(\tau)\,\mathrm{d}\tau.
$$

若对状态作相似变换 $\boldsymbol{x}=\mathbf{T}\boldsymbol{\xi}$，其中 $\mathbf{T}$ 非奇异，则

$$
\dot{\boldsymbol{\xi}}
=
\mathbf{T}^{-1}\mathbf{A}\mathbf{T}\boldsymbol{\xi}
+
\mathbf{T}^{-1}\mathbf{B}\boldsymbol{u},
\qquad
\boldsymbol{y}
=
\mathbf{C}\mathbf{T}\boldsymbol{\xi}
+
\mathbf{D}\boldsymbol{u}.
$$

相似变换不改变系统输入输出传递函数，也不改变矩阵 $\mathbf{A}$ 的特征值。

### 5.2 可控性与可观性

连续时间 LTI 系统的可控性矩阵为

$$
\mathcal{C}_\mathrm{c}
=
\begin{bmatrix}
\mathbf{B}&
\mathbf{A}\mathbf{B}&
\cdots&
\mathbf{A}^{n-1}\mathbf{B}
\end{bmatrix}.
$$

若

$$
\operatorname{rank}(\mathcal{C}_\mathrm{c})=n,
$$

则系统完全可控。可观性矩阵为

$$
\mathcal{O}
=
\begin{bmatrix}
\mathbf{C}\\
\mathbf{C}\mathbf{A}\\
\vdots\\
\mathbf{C}\mathbf{A}^{n-1}
\end{bmatrix}.
$$

若

$$
\operatorname{rank}(\mathcal{O})=n,
$$

则系统完全可观。

PBH 判据给出等价条件。系统可控当且仅当对 $\mathbf{A}$ 的任意特征值 $\lambda$，

$$
\operatorname{rank}
\begin{bmatrix}
\lambda\mathbb{1}-\mathbf{A}&\mathbf{B}
\end{bmatrix}
=n.
$$

系统可观当且仅当

$$
\operatorname{rank}
\begin{bmatrix}
\lambda\mathbb{1}-\mathbf{A}\\
\mathbf{C}
\end{bmatrix}
=n.
$$

可控性关注输入能否影响所有动态模态；可观性关注输出能否反映所有动态模态。不可控但稳定的模态不会影响可稳定性，不可观但稳定的模态不会影响可检测性。工程设计中，状态反馈至少需要可稳定，观测器至少需要可检测。

### 5.3 状态反馈、LQR 与积分增广

状态反馈控制律

$$
\boldsymbol{u}
=
-\mathbf{K}_\mathrm{x}\boldsymbol{x}
+
\mathbf{N}\boldsymbol{r}
$$

得到闭环系统

$$
\dot{\boldsymbol{x}}
=
\left(\mathbf{A}-\mathbf{B}\mathbf{K}_\mathrm{x}\right)\boldsymbol{x}
+
\mathbf{B}\mathbf{N}\boldsymbol{r}.
$$

若系统可控，可通过极点配置指定闭环极点。若需要在性能与控制能量之间折中，可采用线性二次型调节器（LQR），最小化

$$
J=
\int_{0}^{\infty}
\left(
\boldsymbol{x}^{\mathrm{T}}\mathbf{Q}\boldsymbol{x}
+
\boldsymbol{u}^{\mathrm{T}}\mathbf{R}\boldsymbol{u}
\right)
\mathrm{d}t,
$$

其中 $\mathbf{Q}\succeq0$、$\mathbf{R}\succ0$。反馈增益为

$$
\mathbf{K}_\mathrm{x}
=
\mathbf{R}^{-1}\mathbf{B}^{\mathrm{T}}\mathbf{P},
$$

$\mathbf{P}$ 满足连续代数 Riccati 方程

$$
\mathbf{A}^{\mathrm{T}}\mathbf{P}
+
\mathbf{P}\mathbf{A}
-
\mathbf{P}\mathbf{B}\mathbf{R}^{-1}\mathbf{B}^{\mathrm{T}}\mathbf{P}
+
\mathbf{Q}
=
\mathbf{0}.
$$

若需要消除阶跃参考或常值扰动造成的稳态误差，可引入积分状态。例如对输出误差 $\boldsymbol{e}=\boldsymbol{r}-\boldsymbol{y}$，定义

$$
\dot{\boldsymbol{x}}_\mathrm{I}=\boldsymbol{r}-\boldsymbol{y}.
$$

增广后对 $[\boldsymbol{x}^{\mathrm{T}},\boldsymbol{x}_\mathrm{I}^{\mathrm{T}}]^{\mathrm{T}}$ 设计反馈。积分增广会增加低频环路增益，同时也会增加相位滞后和饱和风险，必须配置抗积分饱和策略。

### 5.4 状态观测器与 Kalman 滤波

若状态不能全部测量，可构造 Luenberger 观测器

$$
\dot{\hat{\boldsymbol{x}}}
=
\mathbf{A}\hat{\boldsymbol{x}}
+
\mathbf{B}\boldsymbol{u}
+
\mathbf{L}
\left(
\boldsymbol{y}
-
\mathbf{C}\hat{\boldsymbol{x}}
-
\mathbf{D}\boldsymbol{u}
\right).
$$

估计误差 $\tilde{\boldsymbol{x}}=\boldsymbol{x}-\hat{\boldsymbol{x}}$ 满足

$$
\dot{\tilde{\boldsymbol{x}}}
=
\left(\mathbf{A}-\mathbf{L}\mathbf{C}\right)
\tilde{\boldsymbol{x}}.
$$

若 $(\mathbf{A},\mathbf{C})$ 可观，可配置 $\mathbf{A}-\mathbf{L}\mathbf{C}$ 的极点。观测器极点通常比控制闭环极点更快，但过快会放大测量噪声。

Kalman 滤波在随机扰动模型下选择最小均方误差估计器。设

$$
\dot{\boldsymbol{x}}
=
\mathbf{A}\boldsymbol{x}
+
\mathbf{B}\boldsymbol{u}
+
\mathbf{G}\boldsymbol{w},
\qquad
\boldsymbol{y}
=
\mathbf{C}\boldsymbol{x}
+
\boldsymbol{v},
$$

其中过程噪声与测量噪声协方差分别为 $\mathbf{Q}_\mathrm{w}$ 与 $\mathbf{R}_\mathrm{v}$。连续稳态 Kalman 增益为

$$
\mathbf{L}
=
\mathbf{P}\mathbf{C}^{\mathrm{T}}\mathbf{R}_\mathrm{v}^{-1},
$$

其中 $\mathbf{P}$ 满足

$$
\mathbf{A}\mathbf{P}
+
\mathbf{P}\mathbf{A}^{\mathrm{T}}
-
\mathbf{P}\mathbf{C}^{\mathrm{T}}
\mathbf{R}_\mathrm{v}^{-1}
\mathbf{C}\mathbf{P}
+
\mathbf{G}\mathbf{Q}_\mathrm{w}\mathbf{G}^{\mathrm{T}}
=
\mathbf{0}.
$$

LQR 与 Kalman 滤波组合得到 LQG 控制器。分离原理说明，在满足条件时，可分别设计状态反馈与状态估计器；但 LQG 的鲁棒裕度未必好，工程上仍需检查频域裕度和不确定性。

### 5.5 MIMO 系统要点

多输入多输出系统中，单个传递函数变为传递函数矩阵

$$
\mathbf{G}(s)=
\mathbf{C}(s\mathbb{1}-\mathbf{A})^{-1}\mathbf{B}
+
\mathbf{D}.
$$

MIMO 控制需要处理通道耦合。一个输入可能同时影响多个输出，一个输出也可能受多个输入共同影响。常用分析工具包括奇异值、相对增益阵（RGA）、解耦控制、LQR、模型预测控制和 $\mathcal{H}_\infty$ 控制。频域中常用最大奇异值 $\bar{\sigma}(\mathbf{G}(\mathrm{j}\omega))$ 描述最坏方向增益，用最小奇异值 $\underline{\sigma}(\mathbf{G}(\mathrm{j}\omega))$ 描述最弱方向增益。

## 6 连续系统的离散化与数字控制

### 6.1 零阶保持离散化

数字控制器以采样周期 $T_s$ 运行。若输入在采样间隔内由零阶保持器保持常值，连续系统

$$
\dot{\boldsymbol{x}}=\mathbf{A}\boldsymbol{x}+\mathbf{B}\boldsymbol{u}
$$

可精确离散为

$$
\boldsymbol{x}[k+1]
=
\mathbf{A}_\mathrm{d}\boldsymbol{x}[k]
+
\mathbf{B}_\mathrm{d}\boldsymbol{u}[k],
$$

其中

$$
\mathbf{A}_\mathrm{d}=e^{\mathbf{A}T_s},
\qquad
\mathbf{B}_\mathrm{d}
=
\int_{0}^{T_s}e^{\mathbf{A}\tau}\mathbf{B}\,\mathrm{d}\tau.
$$

若 $\mathbf{A}$ 非奇异，也可写作

$$
\mathbf{B}_\mathrm{d}
=
\mathbf{A}^{-1}
\left(e^{\mathbf{A}T_s}-\mathbb{1}\right)\mathbf{B}.
$$

连续极点 $s_i$ 映射为离散极点

$$
z_i=e^{s_iT_s}.
$$

连续稳定条件 $\operatorname{Re}(s_i)\lt0$ 对应离散稳定条件 $|z_i|\lt1$。

### 6.2 Tustin 双线性变换

Tustin 离散化采用双线性变换

$$
s=
\frac{2}{T_s}
\frac{1-z^{-1}}{1+z^{-1}}.
$$

对应频率映射为

$$
\Omega
=
2\arctan\left(\frac{\omega T_s}{2}\right),
$$

其中 $\Omega$ 为离散时间数字角频率。该映射会产生频率扭曲，高频附近尤其明显。若需要在指定频率 $\omega_0$ 处保持准确，可采用预畸变。

状态空间双线性离散化可写为

$$
\mathbf{A}_\mathrm{d}
=
\left(\mathbb{1}-\frac{T_s}{2}\mathbf{A}\right)^{-1}
\left(\mathbb{1}+\frac{T_s}{2}\mathbf{A}\right),
$$

$$
\mathbf{B}_\mathrm{d}
=
\left(\mathbb{1}-\frac{T_s}{2}\mathbf{A}\right)^{-1}
T_s\mathbf{B},
$$

$$
\mathbf{C}_\mathrm{d}
=
\mathbf{C}
\left(\mathbb{1}-\frac{T_s}{2}\mathbf{A}\right)^{-1},
$$

$$
\mathbf{D}_\mathrm{d}
=
\mathbf{D}
+
\frac{T_s}{2}
\mathbf{C}
\left(\mathbb{1}-\frac{T_s}{2}\mathbf{A}\right)^{-1}
\mathbf{B}.
$$

Tustin 法常用于把连续滤波器或补偿器离散化，因为左半平面会映射到单位圆内，稳定性保持较好。若仿真的是真实零阶保持控制系统，则对象离散化通常优先用 ZOH。

### 6.3 数字实现中的工程问题

数字控制实现需要同时考虑采样、计算延迟、量化、饱和和抗混叠。采样频率应显著高于闭环带宽，常见经验是至少为闭环带宽的 $10$ 到 $20$ 倍，但高带宽、高延迟或低相位裕度系统需要更保守。一次采样周期的纯延迟在频域近似贡献相位滞后

$$
\varphi_\mathrm{delay}(\omega)=-\omega T_s.
$$

因此采样和计算延迟会直接侵蚀相位裕度。实际部署前应把采样保持器、计算延迟、执行器饱和、传感器滤波和限幅逻辑纳入闭环仿真。

## 7 扰动与噪声建模

### 7.1 PSD、ASD 与离散白噪声缩放

连续随机信号常用功率谱密度（PSD）描述频率分布。若双边 PSD 为常数

$$
S_n^{(2)}(f)=S_0,
\qquad
f\in(-\infty,\infty),
$$

则幅度谱密度（ASD）为

$$
A_0=\sqrt{S_0}.
$$

用计算机生成离散白噪声时，若

$$
n[k]=\sigma w[k],
\qquad
w[k]\sim\mathcal{N}(0,1),
$$

则离散序列方差为 $\sigma^2$。离散时间 PSD 与物理频率下的双边 PSD 满足

$$
S_n^{(2)}(f)
=
T_sS_n^\mathrm{DT}\left(e^{\mathrm{j}2\pi fT_s}\right).
$$

若希望离散噪声对应连续双边 PSD $S_0$，需取

$$
\sigma^2=\frac{S_0}{T_s},
\qquad
n[k]=\sqrt{\frac{S_0}{T_s}}\,w[k].
$$

若以双边 ASD $A_0$ 给定，则

$$
n[k]=\frac{A_0}{\sqrt{T_s}}\,w[k].
$$

单边 PSD 与双边 PSD 的关系为

$$
S^{(1)}(f)=2S^{(2)}(f),
\qquad
f\gt0.
$$

因此不同软件或文献中出现 $\sqrt{2}$ 系数，通常来自单边与双边谱定义不同，而不是物理模型不同。

### 7.2 成形滤波与有色噪声

白噪声经稳定线性滤波器 $G_\mathrm{n}(s)$ 后得到有色噪声。若输入 PSD 为 $S_u(f)$，输出 PSD 为

$$
S_y(f)
=
\left|G_\mathrm{n}(\mathrm{j}2\pi f)\right|^2S_u(f).
$$

若输入是双边白噪声 $S_u(f)=S_0$，则

$$
S_y(f)
=
S_0
\left|G_\mathrm{n}(\mathrm{j}2\pi f)\right|^2,
\qquad
A_y(f)
=
\sqrt{S_0}
\left|G_\mathrm{n}(\mathrm{j}2\pi f)\right|.
$$

地面扰动、传感器本底噪声、执行器压力波动和材料厚度变化，都可以用“白噪声源加成形滤波器”的方式建模。这样做的优点是既保留随机性，又能把工程上可测的频谱形状纳入仿真。

### 7.3 地面扰动模型

地面位移扰动常表现为有色噪声，低频含慢漂移，中频可能有微震峰，高频能量随地层与结构传递快速衰减。一个示例成形滤波器可写为

$$
G_\mathrm{ground}(s)
=
K
\frac{(s-z_1)(s-z_2)}
{(s-p_1)(s-p_2)(s+\omega_h)^2},
$$

其中

$$
z_{1,2}=-\omega_z(1\pm\mathrm{j}),
\qquad
p_{1,2}=-\sigma\pm\mathrm{j}\omega_m.
$$

若取

$$
\omega_z=1.3\cdot2\pi,
\qquad
\sigma=0.03\cdot2\pi,
\qquad
\omega_m=0.18\cdot2\pi,
\qquad
\omega_h=20\cdot2\pi,
$$

则 $p_{1,2}$ 在约 $0.18\,\mathrm{Hz}$ 附近形成低阻尼峰，高频双极点提供约 $-40\,\mathrm{dB}/\mathrm{dec}$ 的滚降。对白噪声输入 $u_\mathrm{g}$，地面位移可写为

$$
x_\mathrm{g}=G_\mathrm{ground}*u_\mathrm{g}.
$$

其 PSD 为

$$
S_{x_\mathrm{g}}(f)
=
S_{u_\mathrm{g}}(f)
\left|G_\mathrm{ground}(\mathrm{j}2\pi f)\right|^2.
$$

### 7.4 传感器本底噪声模型

传感器噪声通常包含低频漂移、中频白噪声底和高频带宽限制。示例模型可写为

$$
G_\mathrm{sensor}(s)
=
K
\frac{(s+2)^4}
{(s+0.1)^4(s+\omega_b)},
\qquad
\omega_b=3000\cdot2\pi.
$$

低频四重极点模拟低频漂移或 $1/f$ 型噪声增强，中频零点使谱形趋于平坦，高频极点模拟电子带宽限制。测量信号可写为

$$
y_\mathrm{meas}(t)
=
y_\mathrm{true}(t)+n_\mathrm{sensor}(t).
$$

扰动与噪声频谱示意如下。

![扰动与噪声特性](attachments/GrdDis_and_SensorNoise.png)

### 7.5 广义系统组合

为了进行 LQG、$\mathcal{H}_\infty$ 或混合灵敏度设计，常把物理对象、扰动成形滤波器和传感器噪声滤波器组合为广义系统。设物理对象为

$$
\dot{\boldsymbol{x}}_\mathrm{p}
=
\mathbf{A}_\mathrm{p}\boldsymbol{x}_\mathrm{p}
+
\mathbf{B}_\mathrm{u}\boldsymbol{u}
+
\mathbf{B}_\mathrm{d}\boldsymbol{d},
$$

扰动滤波器为

$$
\dot{\boldsymbol{x}}_\mathrm{d}
=
\mathbf{A}_\mathrm{d}\boldsymbol{x}_\mathrm{d}
+
\mathbf{B}_\mathrm{d0}\boldsymbol{w}_\mathrm{d},
\qquad
\boldsymbol{d}
=
\mathbf{C}_\mathrm{d}\boldsymbol{x}_\mathrm{d},
$$

传感器噪声滤波器为

$$
\dot{\boldsymbol{x}}_\mathrm{n}
=
\mathbf{A}_\mathrm{n}\boldsymbol{x}_\mathrm{n}
+
\mathbf{B}_\mathrm{n0}\boldsymbol{w}_\mathrm{n},
\qquad
\boldsymbol{n}
=
\mathbf{C}_\mathrm{n}\boldsymbol{x}_\mathrm{n}.
$$

则增广状态

$$
\boldsymbol{x}_\mathrm{a}
=
\begin{bmatrix}
\boldsymbol{x}_\mathrm{p}\\
\boldsymbol{x}_\mathrm{d}\\
\boldsymbol{x}_\mathrm{n}
\end{bmatrix}
$$

满足块上三角结构

$$
\mathbf{A}_\mathrm{a}
=
\begin{bmatrix}
\mathbf{A}_\mathrm{p}&\mathbf{B}_\mathrm{d}\mathbf{C}_\mathrm{d}&\mathbf{0}\\
\mathbf{0}&\mathbf{A}_\mathrm{d}&\mathbf{0}\\
\mathbf{0}&\mathbf{0}&\mathbf{A}_\mathrm{n}
\end{bmatrix}.
$$

测量输出为

$$
\boldsymbol{y}_\mathrm{meas}
=
\mathbf{C}_\mathrm{p}\boldsymbol{x}_\mathrm{p}
+
\mathbf{C}_\mathrm{n}\boldsymbol{x}_\mathrm{n}.
$$

这种建模方式使控制器看到的不是抽象白噪声，而是具有明确频谱结构的扰动和测量误差。

## 8 工程设计流程

控制系统设计不应只停留在公式推导。一个较稳妥的流程如下。

1. 明确目标：列出跟踪精度、扰动抑制、响应速度、超调、控制力限制、噪声限制和安全约束。
2. 建立模型：从物理方程得到名义模型，识别执行器、传感器、延迟、饱和和主要非线性。
3. 线性化与验证：在工作点附近得到 LTI 模型，并用实验或高保真仿真检查主要频段内的误差。
4. 分析开环：检查极点、零点、模态、频率响应、可控性和可观性。
5. 选择结构：根据任务选择 PID、超前滞后、状态反馈、LQR、观测器、LQG 或鲁棒控制。
6. 设计与整形：同时检查 $S$、$T$、裕度、带宽、控制量和扰动通道，而不是只看参考跟踪。
7. 离散化实现：选择采样率、离散化方法、滤波器结构、限幅和抗积分饱和逻辑。
8. 仿真验证：覆盖标称参数、参数摄动、扰动谱、传感器噪声、初始条件和极端输入。
9. 实机调试：先低增益、低带宽、限幅运行，再逐步提高性能；保留回退参数和安全停机条件。
10. 记录结论：保存模型版本、参数、测试工况、频域图、时域响应和失败案例。

对本文贯穿示例而言，建议至少完成以下检查：

- $\mathbf{A}$ 的极点是否全部在左半平面；
- $(\mathbf{A},\mathbf{B}_\mathrm{u})$ 是否可控；
- 实际传感器输出对应的 $(\mathbf{A},\mathbf{C})$ 是否可观或可检测；
- $\Delta X/F$ 与 $\Delta X/W$ 的 Bode 图是否符合物理直觉；
- 设计闭环后 $S$ 是否在扰动主频段足够小；
- $T$ 是否在测量噪声主频段足够小；
- 控制力是否在最坏扰动和参考输入下超过执行器限制；
- 离散实现是否因采样、延迟或滤波造成明显相位裕度损失。
