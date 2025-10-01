# 关于两级扭摆系统的一个介绍

## 什么是扭摆？

在理解两级扭摆之前，我们首先要明白最简单的**一级扭摆**是什么。

想象一下，你用一根细丝（比如金属丝或石英丝）悬挂一个重物（通常是水平的哑铃或圆盘）。如果你将重物水平旋转一个很小的角度然后松手，重物并不会停下来，而是会在细丝的恢复力矩作用下，绕着悬挂点来回转动。这个系统就构成了一个**扭摆**。

当细丝被扭转一个角度 $\theta$ 时，它会产生一个试图恢复原状的力矩。这个力矩的大小与扭转角度成正比，方向相反。用公式表示就是 $\tau = -\kappa \theta$。这里的 $\kappa$ (kappa) 是细丝的**扭转常数**，代表了细丝的“硬度”，越难扭动，$\kappa$ 越大。悬挂的重物具有一个转动惯量 $I$，它衡量了物体抵抗转动状态改变的能力。在恢复力矩的作用下，整个系统会进行角简谐振动，其振动周期 $T = 2\pi\sqrt{\frac{I}{\kappa}}$。

一级扭摆对测量微小力矩非常敏感，因此被广泛用于各种精密测量实验中，例如卡文迪什扭秤测量万有引力常数 $G$。

## 为什么要引入“两级”？

虽然一级扭摆已经非常灵敏，但在进行更高精度的测量时，它会遇到一个难以克服的障碍：**地面振动噪声**。

来自地面、建筑物的振动（比如远处的汽车、地震波、甚至房间里的人走动）会通过悬挂点传递给扭摆，引起摆的晃动。这种晃动产生的噪声会淹没我们想要测量的、极其微弱的信号（例如引力波引起的微小力矩）。

为了解决这个问题，科学家们设计了**两级扭摆**，其核心思想是：**振动隔离 (Vibration Isolation)**。

两级扭摆，顾名思义，就是将两个扭摆串联起来。**第一级 (Upper Stage)** 由一个质量较大、转动惯量也较大的物体（我们称之为“上级质量”或“隔离体”）被一根粗一些的悬丝悬挂起来。这一级本身就是一个扭摆。**第二级 (Lower Stage)** 从第一级的物体下方，再用一根更细的悬丝悬挂一个质量较小的物体（我们称之为“下级质量”或“测试质量”）。这个下级物体通常是我们真正关心的探测器部分。

这个系统的精妙之处在于它有两个主要的扭转振动模式（normal modes）：**共模 (Common Mode)** ，即上下两个重物以**相同的方向**进行扭转振动。这种模式的振动频率较高。**差模 (Differential Mode)** ，上下两个重物以**相反的方向**进行扭转振动。这种模式的振动频率非常低。

现在，我们来分析噪声是如何被过滤掉的：首先，来自悬挂点的地面振动噪声会首先驱动**第一级（上级质量）**。这个振动要想传递到**第二级（测试质量）**，就必须通过连接它们的中间那根悬丝。噪声是“共模驱动”，从悬挂点传来的地面振动噪声，其本质是试图扭转整个悬挂系统。这种“从上而下”的驱动力，会非常自然、且强烈地激发整个系统一起运动的模式，也就是共模。所以，我们可以说噪声主要耦合到共模。

信号是“差模驱动”，我们真正关心的、想要测量的那个极其微弱的物理信号（例如检验万有引力定律时，旁边小质量球产生的引力力矩），通常是直接施加在第二级（下级）的测试质量上。这个力矩试图单独转动下级质量，而上级质量由于惯性会保持不动。这种“只作用于下方”的驱动力，会非常有效地激发上、下两级质量相对运动的模式，也就是差模。所以，信号主要耦合到差模。

通过巧妙地设计两级物体的质量、转动惯量以及悬丝的扭转常数，我们可以让这个系统的**差模频率**（$f_{diff}$）变得非常非常低（例如，周期长达数小时甚至数天）。大多数地面振动的频率（通常在 1 Hz 到 100 Hz 之间）远远高于这个差模频率 $f_{diff}$。对于一个振动系统来说，当驱动力的频率远高于其固有频率时，系统的响应会急剧减小。传递到第二级的振动幅度会以驱动频率的平方（$f^2$）甚至四次方（$f^4$）衰减。结果就是地面振动噪声在传递过程中被大大地抑制了。第一级就像一个“隔振平台”，有效地将第二级与外界的振动环境“隔离”开来，使得第二级能够在一个极其安静的环境中对我们关心的微弱信号进行测量。

## 数学建模

下面将给出两级扭摆在“小角度线性化”下完整、系统且可直接用于控制/识别的动力学建模。严格按拉格朗日法推导，并把结果组织成四个相互解耦的二维子系统：两条水平摆动方向各一组（x、y），再加上绕纤维轴的扭转（yaw）与轴向伸长（axial）。合起来共 8 个自由度。这正是工程上常用的“8-DoF 两级扭摆线性模型”。

### 结构、坐标与广义坐标

* 惯性坐标：${X,Y,Z}$，取 $Z$ 竖直向上，重力加速度 $g$ 取正值（势能写法更直观）。
* 上级刚体 $A$：悬点 $O_1$，质心 $G_1$，质量 $m_1$，关于质心主惯量 $\mathbf{I}_1=\mathrm{diag}(I_{1x},I_{1y},I_{1z})$。
* 下级刚体 $B$：悬点 $O_2$，质心 $G_2$，质量 $m_2$，主惯量 $\mathbf{I}_2=\mathrm{diag}(I_{2x},I_{2y},I_{2z})$。
* 上、下两根悬丝（或细纤维）静长分别 $l_1, l_2$，轴向等效刚度 $k_1,k_2$，扭转等效刚度 $\kappa_1,\kappa_2$。阻尼用瑞利耗散等效到各自由度（常系数），记 $c$。
* **小角度线性化**：所有摆角与扭角 $|\cdot|\ll 1$，忽略二阶小量的乘积。纤维横向弯曲刚度相对重力恢复力忽略。
* **横摆（X 平面）**：$\xi_1,\ \xi_2$（它们等于各级绕 $Y$ 轴的微小转角；对应质心的 $X$ 向位移近似为 $l,\xi$）
* **横摆（Y 平面）**：$\eta_1,\ \eta_2$（等于各级绕 $X$ 轴的微小转角；对应质心的 $Y$ 向位移近似为 $-l,\eta$）
* **扭转（绕纤维轴）**：$\phi_1,\ \phi_2$
* **轴向伸长**：$s_1,\ s_2$（相对静平衡长度的微小伸长）

<img src="/fig/8_DoFs_two_stage_torsion_pendulum_dark.jpg" alt="八自由度两级扭摆系统小角近似建模示意图" width="95%">

如上图所示，我们把它写成向量形式：
$$
q=\begin{bmatrix}\xi_1&\xi_2&\eta_1&\eta_2&\phi_1&\phi_2&s_1&s_2\end{bmatrix}^\top .
$$

### 小角近似到一阶下的运动学

* 方向余弦近似：上级纤维方向单位向量
  $\mathbf{n}_1 \approx \begin{bmatrix}\xi_1\\ -\eta_1\ 1\end{bmatrix}$，
  下级纤维方向 $\mathbf{n}_2 \approx \begin{bmatrix}\xi_2\\ -\eta_2\ 1\end{bmatrix}$。
* 质心位置与速度（忽略 $\mathcal{O}(\text{小量}^2)$ 的竖向项）：
  $$ \mathbf{r}_{G_1} \approx (l_1+s_1)\mathbf{n_1}, $$
  $$ \dot{\mathbf{r}}_{G_1} \approx l_1\begin{bmatrix}\dot{\xi}_1\\ -\dot{\eta}_1\\ 0\end{bmatrix}+\begin{bmatrix}0\\0\\\dot{s}_1\end{bmatrix}, $$
  $$ \mathbf{r}_{O_2} \approx (l_1+s_1)\mathbf{n}_1,$$
  $$\dot{\mathbf{r}}_{O_2} \approx l_1\begin{bmatrix}\dot{\xi}_1\\ -\dot{\eta}_1 \\ 0\end{bmatrix}+\begin{bmatrix}0 \\ 0 \\ \dot{s_1}\end{bmatrix}, $$
  $$ \mathbf{r}_{G_2} \approx \mathbf{r}_{O_2}+(l_2+s_2)\mathbf{n}_2, $$
  $$ \dot{\mathbf{r}}_{G_2} \approx
  l_1\begin{bmatrix}\dot{\xi}_1\\ -\dot{\eta}_1\\ 0\end{bmatrix}
  +l_2\begin{bmatrix}\dot{\xi}_2\\ -\dot{\eta}_2\\ 0\end{bmatrix}
  +\begin{bmatrix}0\\0\\\dot{s}_1+\dot{s}_2\end{bmatrix}.$$
* 刚体角速度（到一阶）：
  $$
  \boldsymbol\omega_1\approx\begin{bmatrix}\dot{\eta}_1\\ \dot{\xi}_1\\ \dot{\phi}_1\end{bmatrix},\quad
  \boldsymbol\omega_2\approx\begin{bmatrix}\dot{\eta}_2\\ \dot{\xi}_2\\ \dot{\phi}_2\end{bmatrix}.
  $$

### 动能 (T)、势能 (V)、瑞利耗散 (D)

- 动能
  $$
  \begin{aligned}
  T &= \tfrac12 m_1|\dot{\mathbf{r}}_{G_1}|^2+\tfrac12 m_2|\dot{\mathbf{r}}_{G_2}|^2
  +\tfrac12 \boldsymbol\omega_1^\top \mathbf{I}_1\boldsymbol\omega_1
  +\tfrac12 \boldsymbol\omega_2^\top \mathbf{I}_2\boldsymbol\omega_2\\
  &= \tfrac12\big[(m_1+m_2)l_1^2(\dot{\xi}_1^2+\dot{\eta}_1^2) + m_2 l_2^2(\dot{\xi}_2^2+\dot{\eta}_2^2) +2 m_2 l_1 l_2(\dot{\xi}_1\dot{\xi}_2+\dot{\eta}_1\dot{\eta}_2)\big]\\
  &\quad + \tfrac12\big[I_{1y}\dot{\xi}_1^2+I_{1x}\dot{\eta}_1^2+I_{1z}\dot{\phi}_1^2
  +I_{2y}\dot{\xi}_2^2+I_{2x}\dot{\eta}_2^2+I_{2z}\dot{\phi}_2^2\big]\\
  &\quad + \tfrac12\big[(m_1+m_2)\dot{s}_1^2+m_2(\dot{s}_1+\dot{s}_2)^2\big].
  \end{aligned}
  $$

- 势能（以静平衡为基准，去掉常数项，轴向重力线性项被平衡伸长吸收）
  $$
  \begin{aligned}
  V &= \underbrace{\tfrac12 (m_1+m_2)g l_1(\xi_1^2+\eta_1^2)+\tfrac12 m_2 g l_2(\xi_2^2+\eta_2^2)}_{\text{重力小角近似}}\\ 
  &\quad + \underbrace{\tfrac12 \kappa_1 \phi_1^2+\tfrac12 \kappa_2(\phi_2-\phi_1)^2}_{\text{扭转载荷}} + \underbrace{\tfrac12 k_1 s_1^2+\tfrac12 k_2 s_2^2}_{\text{轴向弹性}}.
  \end{aligned}
  $$
- 瑞利耗散（线性粘性等效）
  $$
  \begin{aligned}
  D&=\tfrac12 c_{1\xi}\dot{\xi}_1^2+\tfrac12 c_{2\xi}\dot{\xi}_2^2
  +\tfrac12 c_{1\eta}\dot{\eta}_1^2+\tfrac12 c_{2\eta}\dot{\eta}_2^2\\
  &\quad +\tfrac12 c_{1\phi}\dot{\phi}_1^2+\tfrac12 c_{2\phi}(\dot{\phi}_2-\dot{\phi}_1)^2
  +\tfrac12 c_{1s}\dot{s}_1^2+\tfrac12 c_{2s}\dot{s}_2^2.
  \end{aligned}
  $$
 
### 拉格朗日方程与**四个解耦 2×2 子系统**

拉格朗日方程（含阻尼与外广义力 $Q_q$）：
$$
\frac{d}{dt}\Big(\frac{\partial T}{\partial \dot q}\Big)-\frac{\partial T}{\partial q}
+\frac{\partial D}{\partial \dot q}+\frac{\partial V}{\partial q}=Q_q.
$$
在圆柱对称且小角近似下，${\xi}$、${\eta}$、${\phi}$、${s}$ 四个子空间完全解耦，均可写成
$\mathbf{M}\ddot{\mathbf{q}}+\mathbf{C}\dot{\mathbf{q}}+\mathbf{K}\mathbf{q}=\mathbf{Q}$。

### $X$ 平面摆动（$\mathbf{q}_x=[\xi_1,\ \xi_2]^\top$）

$$
\boxed{
  \underbrace{
    \begin{bmatrix}
  (m_1+m_2)l_1^2+I_{1y} & m_2 l_1 l_2 \\
  m_2 l_1 l_2 & m_2 l_2^2+I_{2y}
  \end{bmatrix}}_{\mathbf{M}_x}
  \ddot{\mathbf{q}}_x
  +\underbrace{\begin{bmatrix}
  c_{1\xi} & 0\\ 0 & c_{2\xi}
  \end{bmatrix}}_{\mathbf{C}_x}
  \dot{\mathbf{q}}_x
  +\underbrace{\begin{bmatrix}
  (m_1+m_2) g l_1 & 0\\
  0 & m_2 g l_2
  \end{bmatrix}}_{\mathbf{K}_x}
  \mathbf{q}_x
  = \mathbf{Q}_x.
}
$$（$\mathbf{Q}_x$ 为 $X$-向等效外力/底座扰动等对应的广义力。）

### $Y$ 平面摆动（$\mathbf{q}_y=[\eta_1,\ \eta_2]^\top$）

$$
\boxed{
\underbrace{\begin{bmatrix}
(m_1+m_2)l_1^2 + I_{1x} & m_2 l_1 l_2 \\
m_2 l_1 l_2 & m_2 l_2^2 + I_{2x}
\end{bmatrix}}_{\mathbf{M}_y}
\ddot{\mathbf{q}}_y
+
\underbrace{\begin{bmatrix}
c_{1\eta} & 0 \\
0 & c_{2\eta}
\end{bmatrix}}_{\mathbf{C}_y}
\dot{\mathbf{q}}_y
+
\underbrace{\begin{bmatrix}
(m_1+m_2) g l_1 & 0 \\
0 & m_2 g l_2
\end{bmatrix}}_{\mathbf{K}_y}
\mathbf{q}_y
= \mathbf{Q}_y
}
$$说明：两平面完全同构，仅惯量中的 $I_{1x}/I_{1y}, I_{2x}/I_{2y}$ 互换。

### 扭转（$\mathbf{q}_\phi=[\phi_1,\ \phi_2]^\top$）

$$
\boxed{
\underbrace{\begin{bmatrix}
I_{1z} & 0 \\
0 & I_{2z}
\end{bmatrix}}_{\mathbf{M}_\phi}
\ddot{\mathbf{q}}_\phi
+
\underbrace{\begin{bmatrix}
c_{1\phi}+c_{2\phi} & -c_{2\phi} \\
-c_{2\phi} & c_{2\phi}
\end{bmatrix}}_{\mathbf{C}_\phi}
\dot{\mathbf{q}}_\phi
+
\underbrace{\begin{bmatrix}
\kappa_1+\kappa_2 & -\kappa_2 \\
-\kappa_2 & \kappa_2
\end{bmatrix}}_{\mathbf{K}_\phi}
\mathbf{q}_\phi
= \mathbf{Q}_\phi
}
$$这是两级扭摆最常用的扭转 2-DOF 串联扭转刚度模型；$\kappa_2$ 作用在相对角 $\phi_2-\phi_1$ 上，因此刚度/阻尼矩阵呈“$+1,-1$”结构。

### 轴向伸长（$\mathbf{q}_s=[s_1,\ s_2]^\top$）

$$
\boxed{
\underbrace{\begin{bmatrix}
m_1+m_2 & m_2 \\
m_2 & m_2
\end{bmatrix}}_{\mathbf{M}_s}
\ddot{\mathbf{q}}_s
+
\underbrace{\begin{bmatrix}
c_{1s} & 0 \\
0 & c_{2s}
\end{bmatrix}}_{\mathbf{C}_s}
\dot{\mathbf{q}}_s
+
\underbrace{\begin{bmatrix}
k_1 & 0 \\
0 & k_2
\end{bmatrix}}_{\mathbf{K}_s}
\mathbf{q}_s
= \mathbf{Q}_s
}
$$轴向子系统来自 $\tfrac12(m_1+m_2)\dot s_1^2+\tfrac12 m_2(\dot s_1+\dot s_2)^2$ 与 $\tfrac12 k_1 s_1^2+\tfrac12 k_2 s_2^2$。

## 8-DoF 统一矩阵形式

把四个 2×2 方程按 $[\xi\ |\ \eta\ |\ \phi\ |\ s]$ 顺序在对角上拼接，可得
$$
\boxed{\;
\mathbf{M}\ddot{\mathbf{q}}+\mathbf{C}\dot{\mathbf{q}}+\mathbf{K}\mathbf{q}=\mathbf{Q}
\;}
$$

其中 $(\mathbf{M},\mathbf{C},\mathbf{K})$ 为 $8\times 8$ 的 **块对角** 矩阵：

$$
\mathbf{M}=\mathrm{blkdiag}(\mathbf{M}_x,\mathbf{M}_y,\mathbf{M}_\phi,\mathbf{M}_s),\quad \\
\mathbf{C}=\mathrm{blkdiag}(\mathbf{C}_x,\mathbf{C}_y,\mathbf{C}_\phi,\mathbf{C}_s),\quad \\
\mathbf{K}=\mathrm{blkdiag}(\mathbf{K}_x,\mathbf{K}_y,\mathbf{K}_\phi,\mathbf{K}_s).
$$

**外激励与广义力：**
- 若 $O_1$ 的支座（如六自由度平台）有小位移/角位移输入，可按虚功原理写入 $\mathbf{Q}$，或等效为基座加速度项移到左端（惯性力）。
- 直接施加在各级上的小力 $\mathbf{f}_i$ 与小力矩 $\boldsymbol{\tau}_i$ 的投影：
  - 在 X/Y 平面，$\mathbf{Q}_{x/y}$ 近似为水平力对 $\xi,\eta$ 的等效力臂 $l$ 投影与绕 $X/Y$ 的小力矩之和。
  - 在扭转子系统，$Q_{\phi}=[\tau_{1z},\ \tau_{2z}]^\top$。
  - 在轴向子系统，$Q_s=[f_{1z},\ f_{2z}]^\top$（沿纤维方向的分力）。

**模态/固有频率（闭式解）**
- **扭转 2-DOF** 的两条固有频率显式可写：
  $$
  \omega_{\phi,\pm}^2=\tfrac12\left(\frac{\kappa_1+\kappa_2}{I_{1z}}+\frac{\kappa_2}{I_{2z}}
  \pm \sqrt{\Big(\frac{\kappa_1+\kappa_2}{I_{1z}}-\frac{\kappa_2}{I_{2z}}\Big)^2+\frac{4\kappa_2^2}{I_{1z}I_{2z}}}\right).
  $$
- **横摆（x 或 y）** 的两条频率为 $\det(\mathbf{K}-\omega^2 \mathbf{M})=0$ 的 2×2 根；代入上面 $\mathbf{M}_{x/y},\mathbf{K}_{x/y}$ 即得（解析式可写但不必要时不展开）。
- **轴向** 同理：把 $\mathbf{K}_s,\mathbf{M}_s$ 代入 $\det(\mathbf{K}_s-\omega^2\mathbf{M}_s)=0$。

**上面模型在以下假设下严格成立（线性层面）：**
- **小角**与**小伸长**：$|\xi|,|\eta|,|\phi|,|s| \ll 1$，忽略二阶乘积；
- 悬丝横向弯曲刚度可忽略（横摆的恢复力主要来自重力）；
- $O_2$ 位于 $O_1$ 的同一竖直线上（无水平偏置）；各级主轴与纤维对齐；
- 各阻尼可用等效粘性近似。

**若需要更高保真度，可逐步加入：**
- $O_2$ 或 $G_i$ 的**水平偏置**与**偏心**（引入 $\xi$–$\eta$–$\phi$ 的弱耦合项）；
- **重力二阶项**（大角度近似），以及纤维**横向弯曲**能；
- **陀螺耦合**（若存在高速自旋元件）；
- 非对称**各向异性**（$I_{ix}\neq I_{iy}$、非对称气动阻尼等）。

## 阶段性总结

把参数收齐（$m_1,m_2,l_1,l_2,I_{1x},I_{1y},I_{1z},I_{2x},I_{2y},I_{2z},\kappa_1,\kappa_2,k_1,k_2$ 与各 $c$），直接用下列四组矩阵即可仿真/控制：

$$
\begin{aligned}
\mathbf{M}_x &= \begin{bmatrix}
(m_1+m_2)l_1^2+I_{1y} & m_2 l_1 l_2 \\
m_2 l_1 l_2 & m_2 l_2^2+I_{2y}
\end{bmatrix}, &
\mathbf{K}_x &= \begin{bmatrix}
(m_1+m_2) g l_1 & 0 \\
0 & m_2 g l_2
\end{bmatrix}; \\[6pt]
\mathbf{M}_y &= \begin{bmatrix}
(m_1+m_2)l_1^2+I_{1x} & m_2 l_1 l_2 \\
m_2 l_1 l_2 & m_2 l_2^2+I_{2x}
\end{bmatrix}, &
\mathbf{K}_y &= \begin{bmatrix}
(m_1+m_2) g l_1 & 0 \\
0 & m_2 g l_2
\end{bmatrix}; \\[6pt]
\mathbf{M}_\phi &= \begin{bmatrix}
I_{1z} & 0 \\
0 & I_{2z}
\end{bmatrix}, &
\mathbf{K}_\phi &= \begin{bmatrix}
\kappa_1+\kappa_2 & -\kappa_2 \\
-\kappa_2 & \kappa_2
\end{bmatrix}; \\[6pt]
\mathbf{M}_s &= \begin{bmatrix}
m_1+m_2 & m_2 \\
m_2 & m_2
\end{bmatrix}, &
\mathbf{K}_s &= \begin{bmatrix}
k_1 & 0 \\
0 & k_2
\end{bmatrix}.
\end{aligned}
$$

阻尼矩阵取对角（或扭转相对阻尼）：
$$
\mathbf{C}_x = \mathrm{diag}(c_{1\xi},c_{2\xi}),\quad
\mathbf{C}_y = \mathrm{diag}(c_{1\eta},c_{2\eta}),\quad \\
\mathbf{C}_\phi = \begin{bmatrix}
c_{1\phi}+c_{2\phi} & -c_{2\phi} \\
-c_{2\phi} & c_{2\phi}
\end{bmatrix},\quad
\mathbf{C}_s = \mathrm{diag}(c_{1s},c_{2s}).
$$
