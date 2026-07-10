<!-- modern-control:zh -->

## 课堂实践：两级质量-弹簧-阻尼系统

课堂实践使用一个两级质量-弹簧-阻尼系统作为贯穿例子。这个例子足够简单，可以手算状态空间模型、传递函数、可控性和可观性；同时它又包含基座扰动、相对位移输出、模态耦合等隔振问题中会反复出现的结构。

系统由两个质量块、两组弹簧阻尼元件和一个运动基座组成。质量块 $m_1$ 通过弹簧 $k_1$ 与阻尼 $c_1$ 连接到基座，质量块 $m_2$ 通过弹簧 $k_2$ 与阻尼 $c_2$ 连接到 $m_1$。基座位移扰动记为 $w(t)$，控制力 $f(t)$ 作用在 $m_1$ 上，常用输出为两质量块相对位移

$$
\Delta x=x_2-x_1.
$$

### 建模假设

本实践默认采用以下假设：

- 只讨论工作点附近的小振动；
- 弹簧满足线性力-位移关系，阻尼满足线性粘性阻尼关系；
- 重力造成的静挠度已经被吸收到平衡点中，不再显式出现在动态方程里；
- $m_1>0,m_2>0$，通常取 $k_1,k_2,c_1,c_2\ge0$；
- 竖直向上取为正方向，$x_1,x_2,w$ 均为相对同一惯性参考系的绝对位移。

取广义坐标

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

系统的动能、势能和 Rayleigh 阻尼函数分别为

$$
T=\frac{1}{2}m_1\dot{x}_1^2+\frac{1}{2}m_2\dot{x}_2^2,
$$

$$
V=\frac{1}{2}k_1(x_1-w)^2+\frac{1}{2}k_2(x_2-x_1)^2,
$$

$$
\mathcal{D}=\frac{1}{2}c_1(\dot{x}_1-\dot{w})^2+\frac{1}{2}c_2(\dot{x}_2-\dot{x}_1)^2.
$$

带耗散的 Lagrange 方程写作

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

其中 $Q_1=f,Q_2=0$。整理可得

$$
\begin{aligned}
m_1\ddot{x}_1
&=-k_1(x_1-w)-c_1(\dot{x}_1-\dot{w})
+k_2(x_2-x_1)+c_2(\dot{x}_2-\dot{x}_1)+f,\\
m_2\ddot{x}_2
&=-k_2(x_2-x_1)-c_2(\dot{x}_2-\dot{x}_1).
\end{aligned}
$$

### 绝对坐标模型

在绝对坐标 $\boldsymbol{q}=[x_1,x_2]^\top$ 下，系统方程为

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

这个形式直接保留了 $w$ 与 $\dot{w}$ 两个基座输入项，适合从绝对坐标出发检查力、速度项和位移项的物理来源。

取状态

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
$$

$$
\mathbf{B}=
\begin{bmatrix}
0&0&0\\
0&0&0\\
\dfrac{1}{m_1}&\dfrac{k_1}{m_1}&\dfrac{c_1}{m_1}\\[2mm]
0&0&0
\end{bmatrix}.
$$

若输出取 $x_1,x_2,\Delta x$，则

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

### 相对基座坐标模型

在隔振问题中，基座加速度常常比基座位移更自然。定义相对基座位移

$$
r_1=x_1-w,\qquad r_2=x_2-w,\qquad
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

代入绝对坐标方程后可得

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

相对坐标的优点是扰动只通过 $a_\mathrm{g}=\ddot{w}$ 进入，不需要把 $w$ 与 $\dot{w}$ 同时当作独立输入。取

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
$$

系统矩阵仍为 $\mathbf{A}$，输入矩阵变为

$$
\mathbf{B}_\mathrm{r}=
\begin{bmatrix}
0&0\\
0&0\\
\dfrac{1}{m_1}&-1\\[2mm]
0&-1
\end{bmatrix}.
$$

### 传递函数与模态含义

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

分母 $P(s)$ 的根是系统极点。阻尼较小时，这些极点通常对应两个振动模态：低频模态近似表现为两个质量块同向运动，高频模态表现为两质量块之间有明显相对运动。精确模态形状由广义特征值问题给出：

$$
\left(\mathbf{K}-\omega_n^2\mathbf{M}\right)\boldsymbol{\phi}=\boldsymbol{0}.
$$

### 可控性与可观性

分析可控性时，只能把真实可施加的控制力 $f$ 计入控制输入，基座扰动不应计入控制输入矩阵。绝对坐标下控制输入列为

$$
\mathbf{B}_\mathrm{u}=
\begin{bmatrix}
0\\
0\\
\dfrac{1}{m_1}\\
0
\end{bmatrix}.
$$

可控性矩阵为

$$
\mathcal{C}_\mathrm{c}=
\begin{bmatrix}
\mathbf{B}_\mathrm{u}&
\mathbf{A}\mathbf{B}_\mathrm{u}&
\mathbf{A}^2\mathbf{B}_\mathrm{u}&
\mathbf{A}^3\mathbf{B}_\mathrm{u}
\end{bmatrix}.
$$

对该四阶模型可直接得到

$$
\det \mathcal{C}_\mathrm{c}
=
-\frac{k_2^2}{m_1^4m_2^2}.
$$

因此在 $m_1>0,m_2>0,k_2\ne0$ 时，系统对输入 $f$ 完全可控。物理解释是：控制力直接作用在 $m_1$ 上，$m_2$ 只能通过中间弹簧 $k_2$ 间接受控；若 $k_2=0$，$m_2$ 与受控质量块脱开，系统不可控。

可观性必须结合实际输出矩阵 $\mathbf{C}$ 判断。若输出包含 $x_1$ 和 $x_2$，速度状态通常可以通过位置输出的动态关系反映到可观性矩阵中。若只测量 $\Delta x$，系统可能无法区分公共运动分量，因此必须构造

$$
\mathcal{O}=
\begin{bmatrix}
\mathbf{C}\\
\mathbf{C}\mathbf{A}\\
\mathbf{C}\mathbf{A}^2\\
\mathbf{C}\mathbf{A}^3
\end{bmatrix}
$$

并检查 $\operatorname{rank}(\mathcal{O})$。如果某些状态不可观，观测器即使形式上稳定，也不能从测量中恢复这些状态；在反馈控制中，这会表现为估计偏差、低频残余振动、谱峰抬升或带宽受限。

### 课堂实践需要完成的内容

<div class="course-requirement-grid">
<div><strong>模型推导</strong><p>写出绝对坐标与相对基座坐标下的运动方程，并说明每个输入项的物理来源。</p></div>
<div><strong>状态空间</strong><p>构造 $\mathbf{A},\mathbf{B},\mathbf{C},\mathbf{D}$，区分控制输入、扰动输入和测量输出。</p></div>
<div><strong>频域分析</strong><p>推导 $F(s)\to\Delta X(s)$ 与 $W(s)\to\Delta X(s)$，解释公共分母和两个模态。</p></div>
<div><strong>可控可观</strong><p>检查只使用控制力 $f$ 时的可控性，并比较不同测量输出下的可观性。</p></div>
</div>

<div class="course-button-row">
<a class="course-download" href="/modern-control-course/downloads/classroom-practice-simulink.slx" download>下载课堂实践 Simulink 模型</a>
</div>

## 大作业模型：三自由度主动隔振系统

期末大作业使用三自由度主动隔振系统作为控制对象。系统来自已发表论文中的主动隔振平台建模与控制问题，但本课程关注的是控制理论训练：理解 MIMO 模型，完成解耦，分析可控性与可观性，设计状态观测器和 MIMO 控制器，并用统一频域标准评定控制效果。

### 自由度、执行器与传感器

平台质心处建立全局坐标系 $O$。模型把隔振平台视为刚体，虽然刚体本身有六个自由度，但在研究频段内只保留三个主要自由度：

$$
\boldsymbol{x}_O=
\begin{bmatrix}
x_O\\
z_O\\
\phi_{YO}
\end{bmatrix},
$$

其中 $x_O$ 为沿 $X_O$ 轴的水平平动，$z_O$ 为沿 $Z_O$ 轴的竖直平动，$\phi_{YO}$ 为绕 $Y_O$ 轴的转动。其余自由度与这三个方向耦合较弱，在本模型中不作为主要控制对象。

平台由左右对称布置的弹簧支撑，竖向弹簧提供竖向隔振，水平柔性元件提供水平隔振。主动控制力由三个执行器提供：两个竖向执行器和一个水平执行器。两只三轴惯性传感器安装在平台上，并相对质心沿 $X_O$ 方向对称布置。控制器根据传感器测得的平台运动信号调节执行器力，从而抑制平台振动。

平台质量为 $m=60\,\mathrm{kg}$，绕 $Y_O$ 轴转动惯量为 $J_{yy}=4.5\,\mathrm{kg\,m^2}$；竖向刚度 $k_s=4200\,\mathrm{N/m}$，水平刚度 $k_h=2060\,\mathrm{N/m}$；竖向阻尼 $d_s=100\,\mathrm{Ns/m}$，水平阻尼 $d_h=70\,\mathrm{Ns/m}$。这些参数用于说明模型量级；实际大作业应以给定仿真文件中的参数为准。

### 平台动力学方程

在全局坐标下，平台、弹簧、阻尼、执行器、地面扰动和惯性传感器反作用可统一写成

$$
\mathbf{M}\ddot{\boldsymbol{x}}_O
+
\mathbf{D}\dot{\boldsymbol{x}}_O
+
\mathbf{K}\boldsymbol{x}_O
=
\mathbf{D}\dot{\boldsymbol{x}}_d
+
\mathbf{K}\boldsymbol{x}_d
+
\mathbf{F}_u\boldsymbol{u}
+
\mathbf{N}_f\boldsymbol{F}_n
+
\mathbf{N}_m\boldsymbol{M}_n.
$$

这里

$$
\boldsymbol{x}_d=
\begin{bmatrix}
x_d\\
z_d\\
\phi_{yd}
\end{bmatrix}
$$

表示基座或地面运动引起的外部扰动，

$$
\boldsymbol{u}=
\begin{bmatrix}
u_1\\
u_2\\
u_3
\end{bmatrix}
$$

表示三个执行器力，$\boldsymbol{F}_n$ 与 $\boldsymbol{M}_n$ 表示惯性传感器内部检验质量对平台产生的反作用力和反作用矩。矩阵 $\mathbf{F}_u,\mathbf{N}_f,\mathbf{N}_m$ 负责把局部作用点处的力和力矩映射到质心处的广义力。

质量矩阵为

$$
\mathbf{M}=
\begin{bmatrix}
m&0&0\\
0&m&0\\
0&0&J_{yy}
\end{bmatrix}.
$$

阻尼矩阵和刚度矩阵由水平/竖向元件及其安装位置共同决定。由于弹簧和阻尼不是全部作用在质心处，平动与转动项会通过几何力臂耦合起来。这是学生需要理解的第一点：即使每个元件本身是线性的，空间布置也会让质心坐标下的模型天然成为 MIMO 系统。

### 惯性传感器为什么会影响模型

惯性传感器不是“理想测量器”。传感器内部有检验质量、柔性支撑、框架和读出单元。当平台加速时，检验质量相对框架运动并产生读数；同时，检验质量也会通过支撑结构向平台施加反作用力和反作用矩。

$$
F_{nzi}=-m_{ni}\ddot{z}_{ni},
\qquad
F_{nxi}=-m_{ni}\ddot{x}_{ni}
$$

描述传感器检验质量沿竖直和水平方向产生的反作用力。绕 $Y_O$ 轴的反作用矩还会受到检验质量转动惯量、几何距离、重力投影和外部转动激励影响。

因此，完整模型可以看成三个子系统互联：主动隔振平台、左侧惯性传感器、右侧惯性传感器。平台接收控制力、地面扰动以及传感器反作用；传感器接收平台加速度并输出测量信号，同时把反作用反馈给平台。这个互联关系解释了为什么只建立一个“平台刚体模型”是不够的：传感器动力学和传感器反作用会改变被控对象，尤其会影响高频段和通道耦合。

### 局部坐标到质心坐标的解耦

原始输入输出是局部的：执行器安装在不同位置，传感器读数也来自不同位置和方向。直接用这些局部通道设计控制器，会遇到强烈通道耦合：一个执行器既可能激发竖向运动，也可能激发转动；一个传感器读数也可能同时包含平动与转动贡献。

使用执行器和传感器的 Jacobian 矩阵把局部坐标投影到质心逻辑坐标。概念上可以理解为：

- 执行器侧：把三个局部执行器力组合成质心处的竖向广义力、转动广义力和水平广义力；
- 传感器侧：把局部传感器读数组合成质心处的竖向、转动和水平运动估计；
- 解耦后得到三输入三输出模型，输入和输出都对应同一参考点处的逻辑自由度。

这个过程不是把耦合“消灭”，而是把控制问题整理到更清楚的坐标系中。解耦后的传递函数矩阵中，对角项应当代表各自由度的主响应，非对角项应当明显减小。实际上，水平和转动方向之间存在残余耦合，原因是水平惯性传感器难以完全区分真实平动加速度和由转动、重力投影引起的等效测量。

### 动态特性与设计难点

平台存在三个主要共振峰：竖向约 $1.8\,\mathrm{Hz}$，水平约 $1.3\,\mathrm{Hz}$，绕 $Y_O$ 轴转动约 $2.6\,\mathrm{Hz}$。这些共振频率落在主动隔振控制最关心的低频段内，因此控制器需要在低频提供足够扰动抑制能力。

同时，惯性传感器和安装误差会引入倾斜-平动耦合。某些输入输出组合会出现右半平面零点，使对应 SISO 通道成为非最小相位对象，从而限制可实现的开环增益；另一些组合虽没有右半平面零点，但可能在特定频率附近丧失单通道控制能力。因此，本大作业不应只看单个 Bode 图，而应关注 MIMO 模型的通道耦合、奇异值、可控性和可观性。

### 扰动与噪声

仿真中需要区分两类外部影响。

第一类是地面运动造成的外部扰动，也就是基座扰动 $\boldsymbol{x}_d$。它通过刚度项和阻尼项进入平台动力学：

$$
\mathbf{D}\dot{\boldsymbol{x}}_d+\mathbf{K}\boldsymbol{x}_d.
$$

地面微振动的能量通常集中在 $10\,\mathrm{Hz}$ 以下，这一频段也是低频隔振性能的主要评价区间。对于主动控制而言，基座扰动决定了平台实际承受的环境输入。

第二类是传感器噪声。测量信号可统一写成

$$
\boldsymbol{y}(t)=\boldsymbol{y}_0(t)+\boldsymbol{n}(t),
$$

其中 $\boldsymbol{y}_0(t)$ 是真实输出，$\boldsymbol{n}(t)$ 是传感器及测量链路引入的噪声。惯性测量在超低频段往往不是理想白噪声，而具有明显有色特征，例如 $1/f$ 噪声、姿态-平动耦合造成的低频抬升，以及实测环境中的谱峰。实测噪声底接近传感器噪声水平时，继续提高反馈增益可能不再改善隔振效果，反而会把测量噪声注入闭环。

本大作业建议使用两组输入条件：

- 白噪声组：使用理想白噪声构造可重复、可比较的基准工况；
- 实测噪声组：使用实测地震噪声和实测传感噪声，体现实际环境和测量链路对闭环性能的限制。

若需要根据给定的单边 ASD 幅值 $A_0$ 构造离散白噪声，可使用

$$
n[k]=A_0\sqrt{\frac{f_s}{2}}\eta[k],
\qquad
\eta[k]\sim\mathcal{N}(0,1),
$$

其中 $f_s$ 为采样频率。这个幅值修正保证离散白噪声的谱密度量级与设定的单边 ASD 相匹配。仿真报告中应明确说明每个输入通道使用的是白噪声还是实测噪声，以及它是作为外部扰动还是测量噪声进入系统。

## 大作业内容与完成要求

这一部分就是大作业需要完成的任务。

### 1. 模型理解与解耦

阅读给定模型，明确以下对象：

- 状态变量是什么；
- 控制输入 $\boldsymbol{u}$ 是什么；
- 地面扰动 $\boldsymbol{x}_d$ 如何进入系统；
- 传感器噪声 $\boldsymbol{n}$ 如何叠加到测量输出；
- 原始局部执行器/传感器坐标如何映射到质心逻辑坐标。

在此基础上完成模型解耦，得到适合控制设计的三输入三输出逻辑模型。报告中需要比较解耦前后的通道耦合情况，例如通过传递函数矩阵、频率响应或奇异值说明对角通道是否成为主响应，非对角通道是否被抑制。

可选任务：在解耦模型基础上设计分布式 SISO 控制器，把它作为 MIMO 控制器的性能基线。

### 2. 可控性与可观性分析

针对用于控制设计的状态空间模型，构造可控性矩阵

$$
\mathcal{C}=
\begin{bmatrix}
\mathbf{B}&
\mathbf{A}\mathbf{B}&
\cdots&
\mathbf{A}^{n-1}\mathbf{B}
\end{bmatrix}
$$

和可观性矩阵

$$
\mathcal{O}=
\begin{bmatrix}
\mathbf{C}\\
\mathbf{C}\mathbf{A}\\
\cdots\\
\mathbf{C}\mathbf{A}^{n-1}
\end{bmatrix}.
$$

报告中不能只写矩阵秩。还需要解释：

- 不可控状态对应什么物理运动或内部动态；
- 不可观状态是否来自传感器布置、测量方向或传感器动力学；
- 如果某些状态不可观，Kalman 滤波器如何受到影响；
- 不可观状态会不会通过反馈通道影响控制力，进而造成低频残余、谱峰抬升或闭环带宽下降。

### 3. Kalman 滤波器状态观测

设计 Kalman 滤波器作为状态观测器，并用于给定模型。必须说明 $Q$ 与 $R$ 的选择依据：$Q$ 代表模型不确定性和过程扰动，$R$ 代表测量噪声强度。若使用实测传感噪声，应说明如何从噪声水平估计 $R$。

测试时，不只展示时域曲线。需要比较真实状态、测量输出和估计状态的频域 ASD，特别关注 $0.01$ 到 $100\,\mathrm{Hz}$。报告应说明滤波器是否保留了目标频段内的有效状态信息，是否抑制了传感噪声，以及是否在低频或共振附近引入不可接受的估计误差。

### 4. MIMO 控制器设计

在解耦后的模型上设计 MIMO 控制器。推荐方法包括 LQG 与 $H_\infty$，也允许尝试其它方法。控制器设计部分至少需要说明：

- 控制器使用哪些测量量或状态估计量；
- 控制目标是抑制哪些自由度、哪些频段的振动；
- 控制力是否存在过大放大或高频噪声注入；
- 控制器是否保持闭环稳定；
- Control off 与 Control on 的结果是否使用同一扰动、同一噪声和同一评价代码。

<div class="course-button-row">
<a class="course-download" href="/modern-control-course/downloads/final-project-package.zip" download>下载期末大作业 ZIP 包</a>
</div>

## 方法说明：KF、LQG 与 H∞

### Kalman 滤波器 / LQE

Kalman 滤波器用于在测量含噪且状态不能全部直接测量时估计系统状态。离散线性模型可写成

$$
\begin{aligned}
\boldsymbol{x}_k &= \mathbf{A}_k\boldsymbol{x}_{k-1}+\mathbf{B}_k\boldsymbol{u}_k+\boldsymbol{w}_k,
\qquad \boldsymbol{w}_k\sim\mathcal{N}(\boldsymbol{0},\mathbf{Q}_k),\\
\boldsymbol{z}_k &= \mathbf{H}_k\boldsymbol{x}_k+\boldsymbol{v}_k,
\qquad \boldsymbol{v}_k\sim\mathcal{N}(\boldsymbol{0},\mathbf{R}_k).
\end{aligned}
$$

预测步骤为

$$
\hat{\boldsymbol{x}}_{k|k-1}
=
\mathbf{A}_k\hat{\boldsymbol{x}}_{k-1}
+
\mathbf{B}_k\boldsymbol{u}_k,
\qquad
\mathbf{P}_{k|k-1}
=
\mathbf{A}_k\mathbf{P}_{k-1}\mathbf{A}_k^\top+\mathbf{Q}_k.
$$

更新步骤为

$$
\tilde{\boldsymbol{y}}_k
=
\boldsymbol{z}_k-\mathbf{H}_k\hat{\boldsymbol{x}}_{k|k-1},
\qquad
\mathbf{S}_k
=
\mathbf{H}_k\mathbf{P}_{k|k-1}\mathbf{H}_k^\top+\mathbf{R}_k,
$$

$$
\mathbf{K}_k
=
\mathbf{P}_{k|k-1}\mathbf{H}_k^\top\mathbf{S}_k^{-1},
\qquad
\hat{\boldsymbol{x}}_k
=
\hat{\boldsymbol{x}}_{k|k-1}+\mathbf{K}_k\tilde{\boldsymbol{y}}_k.
$$

协方差建议使用 Joseph 形式更新：

$$
\mathbf{P}_k
=
(\mathbf{I}-\mathbf{K}_k\mathbf{H}_k)\mathbf{P}_{k|k-1}
(\mathbf{I}-\mathbf{K}_k\mathbf{H}_k)^\top
+
\mathbf{K}_k\mathbf{R}_k\mathbf{K}_k^\top.
$$

对本大作业而言，Kalman 滤波器的重点不是“滤波后曲线更平滑”，而是说明观测器如何在模型预测和带噪测量之间折中。$Q$ 取大时，滤波器更不信任模型；$R$ 取大时，滤波器更不信任测量。若某些状态不可观或弱可观，即使调参看起来平滑，也可能无法得到可信状态估计。

### LQG

LQG 由 LQR 状态反馈和 Kalman 状态估计组成。连续时间 LQR 的二次型指标可写为

$$
J=\int_0^\infty
\left(
\boldsymbol{x}^\top\mathbf{Q}_c\boldsymbol{x}
+
\boldsymbol{u}^\top\mathbf{R}_c\boldsymbol{u}
\right)\mathrm{d}t.
$$

在满足稳定化与可检测条件时，求解代数 Riccati 方程得到状态反馈增益 $\mathbf{K}_c$，控制律为

$$
\boldsymbol{u}(t)=-\mathbf{K}_c\boldsymbol{x}(t).
$$

实际系统中状态不可全部测量，因此用 Kalman 滤波器给出估计 $\hat{\boldsymbol{x}}(t)$，最终 LQG 控制律为

$$
\boldsymbol{u}(t)=-\mathbf{K}_c\hat{\boldsymbol{x}}(t).
$$

分离原理说明，在标准线性高斯假设下，控制增益和估计器增益可以分开设计。但这不意味着 LQG 自动具备强鲁棒性。对于主动隔振系统，应检查控制力幅值、高频噪声注入、闭环极点和模型误差敏感性。

### H∞ 与环路整形

$H_\infty$ 控制关注最坏情形下的增益上界，适合处理模型不确定性、通道耦合和频域性能约束。主动隔振的典型目标是：低频提高开环增益以抑制地面扰动，高频降低开环增益以避免放大传感噪声和未建模动态。

对 SISO 系统，常用灵敏度函数为

$$
S=(1+GK)^{-1},
\qquad
T=GK(1+GK)^{-1},
\qquad
KS=K(1+GK)^{-1}.
$$

$S$ 反映抗扰和跟踪误差，$T$ 反映噪声传递和互补灵敏度，$KS$ 反映控制力需求。MIMO 系统中应使用奇异值理解这些量，而不是只看单个通道。

环路整形的思想是先用权重塑造被控对象，再进行鲁棒稳定化：

$$
G_\mathrm{s}=W_2GW_1,
\qquad
K=W_1K_\infty W_2.
$$

其中 $W_1,W_2$ 的选择应服务于频域目标：低频段提升扰动抑制能力，交越频率附近保持平滑，高频段抑制噪声和未建模模态。若整形过于激进，鲁棒稳定裕度会变小，控制器可能在仿真中表现很好但对模型误差非常敏感。

### 可选方法

允许尝试上述方法以外的控制方法，包括但不限于 MPC、RL、扰动观测器、DOB、$\mu$ 综合和数据驱动控制。无论采用何种方法，都必须使用相同的 Control off / Control on 仿真条件和相同的 ASD 评定代码。

## 统一结果评定标准与可视化代码

每个方案至少需要进行两组仿真：

- Control off：控制关闭，仿真时长不少于 $1000\,\mathrm{s}$；
- Control on：控制开启，仿真时长不少于 $1000\,\mathrm{s}$。

采样率固定为 $f_s=10\,\mathrm{kHz}$。仿真导出的时域数据为速度等效量，因此应先使用 Welch 方法估计速度功率谱密度，再通过 $2\pi f$ 完成从速度 ASD 到位移 ASD 的换算。频率分辨率固定为 $\Delta f=0.01\,\mathrm{Hz}$，绘制 $0.01$ 到 $100\,\mathrm{Hz}$ 频段内的 Control off / Control on 位移 ASD 对比图。下面代码同时完成 Welch 估计、速度到位移的换算和统一绘图。

```python
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from scipy import signal


FS = 10_000
DF = 0.01
F_MIN = 0.01
F_MAX = 100.0

FIG_W_MM = 120.0
FIG_H_MM = 90.0
FONT_BASE_PT = 10.5
FONT_TICK_PT = 9.5
LINE_WIDTH_PT = 1.5


def displacement_asd_from_velocity(
    velocity,
    fs=FS,
    df=DF,
):
    """Convert velocity samples to displacement ASD."""
    velocity = np.asarray(velocity, dtype=float)
    nperseg = int(round(fs / df))
    if velocity.size < nperseg:
        raise ValueError(
            f"Need {nperseg} samples; "
            f"got {velocity.size}."
        )

    freq, velocity_psd = signal.welch(
        velocity,
        fs=fs,
        nperseg=nperseg,
        noverlap=nperseg // 2,
        detrend="constant",
        scaling="density",
    )
    omega = 2.0 * np.pi * freq
    omega_epsilon = np.finfo(float).eps
    displacement_asd = (
        np.sqrt(velocity_psd)
        / (omega + omega_epsilon)
    )
    return freq, displacement_asd


def band_mask(freq, f_min=F_MIN, f_max=F_MAX):
    freq = np.asarray(freq, dtype=float)
    return (freq >= f_min) & (freq <= f_max)


def positive_ylim(*asd_arrays, margin=0.08):
    values = np.concatenate(
        [
            np.asarray(item, dtype=float).ravel()
            for item in asd_arrays
        ]
    )
    values = values[np.isfinite(values) & (values > 0)]
    if values.size == 0:
        raise ValueError("No positive finite ASD values.")
    return (
        values.min() / (1.0 + margin),
        values.max() * (1.0 + margin),
    )


def plot_asd_comparison(
    velocity_off,
    velocity_on,
    *,
    fs=FS,
    df=DF,
    title="Displacement ASD comparison",
    ylabel=r"Displacement ASD [m/$\sqrt{\mathrm{Hz}}$]",
    output=None,
):
    freq_off, asd_off = displacement_asd_from_velocity(
        velocity_off,
        fs=fs,
        df=df,
    )
    freq_on, asd_on = displacement_asd_from_velocity(
        velocity_on,
        fs=fs,
        df=df,
    )

    mask_off = band_mask(freq_off)
    mask_on = band_mask(freq_on)
    y_min, y_max = positive_ylim(
        asd_off[mask_off],
        asd_on[mask_on],
    )

    plt.rcParams.update(
        {
            "font.size": FONT_BASE_PT,
            "axes.labelsize": FONT_BASE_PT,
            "axes.titlesize": FONT_BASE_PT,
            "xtick.labelsize": FONT_TICK_PT,
            "ytick.labelsize": FONT_TICK_PT,
            "legend.fontsize": FONT_TICK_PT,
            "lines.linewidth": LINE_WIDTH_PT,
        }
    )

    fig, ax = plt.subplots(
        figsize=(FIG_W_MM / 25.4, FIG_H_MM / 25.4)
    )
    ax.loglog(
        freq_off[mask_off],
        asd_off[mask_off],
        label="Control off",
    )
    ax.loglog(
        freq_on[mask_on],
        asd_on[mask_on],
        label="Control on",
    )

    ax.set_xlim(F_MIN, F_MAX)
    ax.set_ylim(y_min, y_max)
    ax.set_xlabel("Frequency [Hz]")
    ax.set_ylabel(ylabel)
    ax.set_title(title)
    ax.grid(True, which="both", alpha=0.28)
    ax.legend(frameon=False)
    fig.tight_layout()

    if output is not None:
        output = Path(output)
        output.parent.mkdir(parents=True, exist_ok=True)
        fig.savefig(output, dpi=300, bbox_inches="tight")

    return fig, ax


# Example:
# fig, ax = plot_asd_comparison(
#     velocity_off=velocity_control_off,
#     velocity_on=velocity_control_on,
#     title="Vertical displacement ASD",
#     output="figures/vertical_displacement_asd.png",
# )
```

每个关键自由度或关键输出至少给出一张 ASD 对比图。同一张图中必须同时包含 Control off 与 Control on，且两条曲线必须来自相同扰动、相同噪声、相同采样率和相同 Welch 参数。

## 提交要求与截止日期

<div class="course-deadline">
<strong>2026-08-31 23:59</strong>
<p>提交完整 PDF 报告到课程指定邮箱；基于报告制作答辩 Slides，提交报告后一周内进行答辩。</p>
</div>

报告至少包含：

1. 模型说明与解耦过程；
2. 可控性与可观性分析；
3. Kalman 滤波器设计、参数选择与测试；
4. 控制器设计，包括控制结构、权重或性能指标选择；
5. Control off / Control on 仿真设置；
6. ASD 对比图与性能解释；
7. 方法局限、失败案例或可改进方向。

<!-- modern-control:en -->

## Classroom Practice: Two-Stage Mass-Spring-Damper System

The classroom practice uses a two-stage mass-spring-damper system as the running example. The model is simple enough for hand derivation of state-space equations, transfer functions, controllability, and observability, while still containing base disturbance, relative displacement output, and modal coupling.

Mass $m_1$ is connected to the moving base by $k_1,c_1$, and mass $m_2$ is connected to $m_1$ by $k_2,c_2$. The base displacement disturbance is $w(t)$, the control force $f(t)$ acts on $m_1$, and the common output is

$$
\Delta x=x_2-x_1.
$$

### Modeling Assumptions

- only small vibrations around the operating point are considered;
- springs and dampers are linear;
- static gravity deflection is absorbed into the equilibrium point;
- $m_1>0,m_2>0$ and normally $k_1,k_2,c_1,c_2\ge0$;
- $x_1,x_2,w$ are absolute displacements in the same inertial frame.

With $\boldsymbol{q}=[x_1,x_2]^\top$, the absolute-coordinate model is

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

where

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
\end{bmatrix}.
$$

Using relative base coordinates $r_1=x_1-w,r_2=x_2-w$, the disturbance enters only through base acceleration:

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

The force-to-relative-displacement transfer function is

$$
\frac{\Delta X(s)}{F(s)}
=
-\frac{m_2s^2}{P(s)},
$$

and the base-displacement-to-relative-displacement transfer function is

$$
\frac{\Delta X(s)}{W(s)}
=
-\frac{m_2s^2(c_1s+k_1)}{P(s)}.
$$

For the force input alone, the system is controllable when $m_1>0,m_2>0,k_2\ne0$. Observability must be checked from the actual output matrix. A relative displacement sensor alone can fail to distinguish common-mode motion, so the observability matrix must be built from the chosen measurement output.

<div class="course-requirement-grid">
<div><strong>Model Derivation</strong><p>Derive the equations in absolute and relative coordinates and identify the physical source of each input term.</p></div>
<div><strong>State Space</strong><p>Build $\mathbf{A},\mathbf{B},\mathbf{C},\mathbf{D}$ while separating control inputs, disturbance inputs, and measured outputs.</p></div>
<div><strong>Frequency Response</strong><p>Derive $F(s)\to\Delta X(s)$ and $W(s)\to\Delta X(s)$ and explain the two modes.</p></div>
<div><strong>Control Analysis</strong><p>Check controllability under force input and compare observability under different sensor choices.</p></div>
</div>

<div class="course-button-row">
<a class="course-download" href="/modern-control-course/downloads/classroom-practice-simulink.slx" download>Download Classroom Simulink Model</a>
</div>

## Final-Project Model: 3-DOF Active Vibration Isolation

The final project uses a 3-DOF active vibration isolation system as the control plant. The task is to understand the MIMO model, decouple it, analyze controllability and observability, design an observer and a MIMO controller, and evaluate the result with a unified ASD standard.

The global frame is attached to the platform center of mass. Although a rigid body has six degrees of freedom, only the three dominant degrees of freedom in the target frequency band are retained:

$$
\boldsymbol{x}_O=
\begin{bmatrix}
x_O\\
z_O\\
\phi_{YO}
\end{bmatrix},
$$

where $x_O$ is horizontal translation, $z_O$ is vertical translation, and $\phi_{YO}$ is rotation about the $Y_O$ axis. The platform is supported by symmetric vertical and horizontal springs, controlled by two vertical actuators and one horizontal actuator, and measured by two inertial sensors mounted symmetrically on the platform.

The platform mass is $m=60\,\mathrm{kg}$ and its rotational inertia about $Y_O$ is $J_{yy}=4.5\,\mathrm{kg\,m^2}$. The vertical and horizontal stiffnesses are $k_s=4200\,\mathrm{N/m}$ and $k_h=2060\,\mathrm{N/m}$; the corresponding damping coefficients are $d_s=100\,\mathrm{Ns/m}$ and $d_h=70\,\mathrm{Ns/m}$. These values establish the scale of the model; use the parameters in the supplied simulation files for the final project.

The coupled platform dynamics can be written as

$$
\mathbf{M}\ddot{\boldsymbol{x}}_O
+
\mathbf{D}\dot{\boldsymbol{x}}_O
+
\mathbf{K}\boldsymbol{x}_O
=
\mathbf{D}\dot{\boldsymbol{x}}_d
+
\mathbf{K}\boldsymbol{x}_d
+
\mathbf{F}_u\boldsymbol{u}
+
\mathbf{N}_f\boldsymbol{F}_n
+
\mathbf{N}_m\boldsymbol{M}_n.
$$

Here $\boldsymbol{x}_d$ is ground disturbance, $\boldsymbol{u}$ is actuator force, and $\boldsymbol{F}_n,\boldsymbol{M}_n$ are the reaction forces and moments from inertial sensor proof masses. This matters because the sensors are not ideal readout devices: their internal proof masses both measure platform motion and feed reaction dynamics back into the platform.

The original actuator and sensor channels are local. Decoupling maps these local channels to center-of-mass logical coordinates. The resulting 3-input 3-output plant should have dominant diagonal responses for vertical, rotational, and horizontal channels, with reduced off-diagonal coupling. Residual horizontal-rotational coupling can remain because inertial sensors cannot perfectly distinguish translation from tilt-induced apparent acceleration.

The platform has main resonances around $1.8\,\mathrm{Hz}$ vertical, $1.3\,\mathrm{Hz}$ horizontal, and $2.6\,\mathrm{Hz}$ rotational. Sensor misalignment and tilt-translation coupling can introduce non-minimum phase behavior or weak SISO controllability at particular frequencies, which is why MIMO analysis is required.

### Disturbance and Noise

Two effects must be modeled separately. Ground disturbance enters through the base-motion terms $\mathbf{D}\dot{\boldsymbol{x}}_d+\mathbf{K}\boldsymbol{x}_d$ and is usually dominant below $10\,\mathrm{Hz}$. Sensor noise appears in the measurement equation:

$$
\boldsymbol{y}(t)=\boldsymbol{y}_0(t)+\boldsymbol{n}(t).
$$

Low-frequency inertial sensing noise is colored rather than ideal white noise. It may include $1/f$ components, tilt-translation coupling, and measured spectral peaks. The project should compare both white-noise inputs for reproducible baselines and measured-noise inputs for realistic performance limits.

If a one-sided ASD level $A_0$ is used to generate discrete white noise, use

$$
n[k]=A_0\sqrt{\frac{f_s}{2}}\eta[k],
\qquad
\eta[k]\sim\mathcal{N}(0,1).
$$

## Final-Project Requirements

### 1. Model Understanding and Decoupling

Identify the states, control inputs, disturbance inputs, noise inputs, and measured outputs. Decouple local actuator and sensor channels into center-of-mass logical coordinates, then compare coupling before and after decoupling.

### 2. Controllability and Observability

Build the controllability and observability matrices for the control-design model. Explain what uncontrollable or unobservable states mean physically, and how unobservable states can affect estimation and feedback performance.

### 3. Kalman Filter State Observation

Design a Kalman filter. Explain the choice of $Q$ and $R$, then compare true, measured, and estimated states using ASD in the $0.01$ to $100\,\mathrm{Hz}$ band.

### 4. MIMO Controller Design

Design a MIMO controller on the decoupled plant using LQG, $H_\infty$, or another justified method. Evaluate stability, control effort, high-frequency noise injection, and Control off / Control on ASD performance under the same simulation conditions.

<div class="course-button-row">
<a class="course-download" href="/modern-control-course/downloads/final-project-package.zip" download>Download Final-Project ZIP Package</a>
</div>

## Method Guide: KF, LQG, and H∞

Kalman filtering estimates states from noisy measurements by balancing model prediction and measurement innovation. The discrete prediction and update equations are:

$$
\hat{\boldsymbol{x}}_{k|k-1}
=
\mathbf{A}_k\hat{\boldsymbol{x}}_{k-1}
+
\mathbf{B}_k\boldsymbol{u}_k,
\qquad
\mathbf{P}_{k|k-1}
=
\mathbf{A}_k\mathbf{P}_{k-1}\mathbf{A}_k^\top+\mathbf{Q}_k,
$$

$$
\mathbf{K}_k
=
\mathbf{P}_{k|k-1}\mathbf{H}_k^\top
(\mathbf{H}_k\mathbf{P}_{k|k-1}\mathbf{H}_k^\top+\mathbf{R}_k)^{-1},
\qquad
\hat{\boldsymbol{x}}_k
=
\hat{\boldsymbol{x}}_{k|k-1}
+
\mathbf{K}_k(\boldsymbol{z}_k-\mathbf{H}_k\hat{\boldsymbol{x}}_{k|k-1}).
$$

LQG combines LQR state feedback with Kalman state estimation:

$$
\boldsymbol{u}(t)=-\mathbf{K}_c\hat{\boldsymbol{x}}(t).
$$

It is systematic for noisy MIMO systems, but robustness and high-frequency noise injection still need to be checked.

$H_\infty$ control shapes worst-case frequency-domain behavior. Loop shaping first forms

$$
G_\mathrm{s}=W_2GW_1,
\qquad
K=W_1K_\infty W_2.
$$

Weights should increase low-frequency disturbance rejection while reducing high-frequency noise amplification and sensitivity to unmodeled modes. Overly aggressive shaping reduces robust-stability margin: a controller can look strong in nominal simulation while remaining highly sensitive to model error.

Other methods, including MPC, RL, DOB, $\mu$ synthesis, and data-driven control, are allowed if they use the same simulation and ASD evaluation standard.

## Unified Evaluation Standard and Plotting Code

Run at least two simulations:

- Control off: controller disabled, at least $1000\,\mathrm{s}$;
- Control on: controller enabled, at least $1000\,\mathrm{s}$.

Use $f_s=10\,\mathrm{kHz}$ and Welch estimation with $\Delta f=0.01\,\mathrm{Hz}$. The exported simulation signals are velocity-equivalent time series, so estimate their velocity PSD first and divide the resulting velocity ASD by $2\pi f$ to obtain displacement ASD. Plot the Control off / Control on displacement ASD from $0.01$ to $100\,\mathrm{Hz}$ using the same conditions and plotting standard.

```python
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from scipy import signal


FS = 10_000
DF = 0.01
F_MIN = 0.01
F_MAX = 100.0
FIG_W_MM = 120.0
FIG_H_MM = 90.0
FONT_BASE_PT = 10.5
FONT_TICK_PT = 9.5
LINE_WIDTH_PT = 1.5


def displacement_asd_from_velocity(
    velocity,
    fs=FS,
    df=DF,
):
    """Convert velocity samples to displacement ASD."""
    velocity = np.asarray(velocity, dtype=float)
    nperseg = int(round(fs / df))
    if velocity.size < nperseg:
        raise ValueError(
            f"Need {nperseg} samples; "
            f"got {velocity.size}."
        )
    freq, velocity_psd = signal.welch(
        velocity,
        fs=fs,
        nperseg=nperseg,
        noverlap=nperseg // 2,
        detrend="constant",
        scaling="density",
    )
    omega = 2.0 * np.pi * freq
    omega_epsilon = np.finfo(float).eps
    displacement_asd = (
        np.sqrt(velocity_psd)
        / (omega + omega_epsilon)
    )
    return freq, displacement_asd


def plot_asd_comparison(
    velocity_off,
    velocity_on,
    *,
    fs=FS,
    df=DF,
    title="Displacement ASD comparison",
    ylabel=r"Displacement ASD [m/$\sqrt{\mathrm{Hz}}$]",
    output=None,
):
    freq_off, asd_off = displacement_asd_from_velocity(
        velocity_off,
        fs=fs,
        df=df,
    )
    freq_on, asd_on = displacement_asd_from_velocity(
        velocity_on,
        fs=fs,
        df=df,
    )
    mask_off = (freq_off >= F_MIN) & (freq_off <= F_MAX)
    mask_on = (freq_on >= F_MIN) & (freq_on <= F_MAX)

    values = np.concatenate(
        [asd_off[mask_off], asd_on[mask_on]]
    )
    values = values[np.isfinite(values) & (values > 0)]
    y_min = values.min() / 1.08
    y_max = values.max() * 1.08

    plt.rcParams.update(
        {
            "font.size": FONT_BASE_PT,
            "axes.labelsize": FONT_BASE_PT,
            "axes.titlesize": FONT_BASE_PT,
            "xtick.labelsize": FONT_TICK_PT,
            "ytick.labelsize": FONT_TICK_PT,
            "legend.fontsize": FONT_TICK_PT,
            "lines.linewidth": LINE_WIDTH_PT,
        }
    )

    fig, ax = plt.subplots(
        figsize=(FIG_W_MM / 25.4, FIG_H_MM / 25.4)
    )
    ax.loglog(
        freq_off[mask_off],
        asd_off[mask_off],
        label="Control off",
    )
    ax.loglog(
        freq_on[mask_on],
        asd_on[mask_on],
        label="Control on",
    )
    ax.set_xlim(F_MIN, F_MAX)
    ax.set_ylim(y_min, y_max)
    ax.set_xlabel("Frequency [Hz]")
    ax.set_ylabel(ylabel)
    ax.set_title(title)
    ax.grid(True, which="both", alpha=0.28)
    ax.legend(frameon=False)
    fig.tight_layout()

    if output is not None:
        output = Path(output)
        output.parent.mkdir(parents=True, exist_ok=True)
        fig.savefig(output, dpi=300, bbox_inches="tight")
    return fig, ax


# Example:
# fig, ax = plot_asd_comparison(
#     velocity_off=velocity_control_off,
#     velocity_on=velocity_control_on,
#     title="Vertical displacement ASD",
#     output="figures/vertical_displacement_asd.png",
# )
```

Each key DOF or output should have at least one ASD comparison figure. Control off and Control on curves must use the same disturbance, noise, sample rate, and Welch parameters.

## Submission and Deadline

<div class="course-deadline">
<strong>2026-08-31 23:59</strong>
<p>Submit a complete PDF report to the course email address. Prepare defense slides based on the report; the defense is scheduled one week after report submission.</p>
</div>

The report should include:

1. model explanation and the decoupling procedure;
2. controllability and observability analysis;
3. Kalman filter design, parameter selection, and testing;
4. controller design, including control structure, weighting, or performance-index choices;
5. Control off / Control on simulation settings;
6. ASD comparison figures and performance interpretation;
7. method limitations, failed cases, or possible improvements.
