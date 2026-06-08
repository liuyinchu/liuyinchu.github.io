# 第二部分：能带论

本文整理自 David Tong "Solid State Physics"第二部分 "Band Theory" 的学习笔记。

## 2.1 一维模型

一维模型给出了能带论最基本的两种直观图像：紧束缚模型从局域原子轨道出发，说明原子间跃迁如何把离散能级展开为能带；近自由电子模型从自由电子出发，说明弱周期势如何在布里渊区边界打开能隙。两者的出发点相反，但共同结果都是布洛赫波和能带结构。

### 2.1.1 紧束缚模型

考虑一条由 $N$ 个等间距原子组成的一维晶格，晶格常数为 $a$。紧束缚近似假设电子主要局域在原子轨道上，但可以通过量子隧穿跃迁到相邻格点。若 $|n\rangle$ 表示电子局域在第 $n$ 个格点的态，最简单的最近邻哈密顿量可写为

$$
H=\sum_n E_0 |n\rangle\langle n|
-t\sum_n \left(|n\rangle\langle n+1|+|n+1\rangle\langle n|\right),
$$

其中 $E_0$ 是原位能量，$t>0$ 是最近邻跃迁振幅。

周期性边界条件要求

$$
\psi_{N+1}=\psi_1.
$$

取离散平面波形式

$$
\psi_n=e^{ikna},
$$

则

$$
e^{ikNa}=1,\qquad
k=\frac{2\pi m}{Na},\quad m\in\mathbb Z.
$$

因此有限晶体中的 $k$ 值是离散的；在第一布里渊区

$$
k\in\left[-\frac{\pi}{a},\frac{\pi}{a}\right)
$$

中恰有 $N$ 个不同的 $k$ 态，与 $N$ 个格点一一对应。

将平面波代入哈密顿量，得到一维最近邻紧束缚色散关系

$$
E(k)=E_0-2t\cos(ka).
$$

这是一条余弦能带。其最低能量为 $E_0-2t$，最高能量为 $E_0+2t$，带宽为 $4t$。在 $k=0$ 附近，

$$
\cos(ka)\simeq 1-\frac{(ka)^2}{2},
$$

于是

$$
E(k)\simeq E_0-2t+ta^2k^2.
$$

与自由粒子的色散

$$
E_{\rm free}=\frac{\hbar^2 k^2}{2m}
$$

比较，可定义带底附近的有效质量

$$
m^*=\frac{\hbar^2}{2ta^2}.
$$

这说明，尽管电子的微观运动受晶格和跃迁控制，在能带底部附近仍可近似为具有有效质量的自由粒子。

紧束缚模型还展示了一个重要事实：即使跃迁振幅 $t$ 很小，也会将原先高度简并的局域态组合成遍布整个晶格的布洛赫态。也就是说，任意非零的格点间耦合都会把孤立原子的离散能级展开为连续的能带。

### 2.1.2 傅里叶对偶与第一布里渊区

一维紧束缚模型体现了傅里叶变换中的两个基本对偶关系。

首先，空间有限会导致动量离散。周期性边界条件把长度为 $Na$ 的晶体视为闭合环，因此允许的波矢只能取

$$
k=\frac{2\pi m}{Na}.
$$

其次，空间离散会导致动量周期。由于晶格点间距为 $a$，波矢 $k$ 与 $k+2\pi/a$ 给出相同的格点相因子：

$$
e^{i(k+2\pi/a)na}=e^{ikna}.
$$

因此所有物理上不同的准动量都可归约到第一布里渊区。概括地说，傅里叶空间中存在如下对应：

| 实空间性质 | 动量空间性质 |
| --- | --- |
| 空间有限 | 动量离散 |
| 空间离散 | 动量周期 |
| 周期晶格 | 倒格子与布里渊区 |

### 2.1.3 近自由电子模型

近自由电子模型从自由电子出发，把周期性晶格势 $V(x)$ 视为微扰。自由电子能量为

$$
E_0(k)=\frac{\hbar^2k^2}{2m}.
$$

若周期势具有晶格周期 $a$，则它的傅里叶展开只包含倒格矢

$$
G_n=\frac{2\pi n}{a}.
$$

因此势能矩阵元只会耦合动量相差一个倒格矢的态：

$$
\langle k|V|k'\rangle\ne 0
\quad\Longrightarrow\quad
k-k'=G_n.
$$

在布里渊区内部，通常没有简并，自由电子能量只受到常数项和较小的高阶微扰修正。物理上，当

$$
k\ll \frac{\pi}{a}
$$

时，电子德布罗意波长远大于晶格常数，电子对微观周期势不敏感，能谱仍近似为自由电子抛物线。

在布里渊区边界处，情况发生根本变化。若

$$
k=\frac{n\pi}{a},
$$

则 $|k\rangle$ 与 $|-k\rangle$ 具有相同自由电子能量，并被周期势耦合。此时必须使用简并微扰理论。对应的 $2\times2$ 本征值问题为

$$
\begin{pmatrix}
E_0(k)+V_0 & V_n\\
V_n^* & E_0(k)+V_0
\end{pmatrix}
\begin{pmatrix}
\alpha\\
\beta
\end{pmatrix}
=E
\begin{pmatrix}
\alpha\\
\beta
\end{pmatrix}.
$$

本征能量为

$$
E=E_0(k)+V_0\pm |V_n|.
$$

因此在布里渊区边界处产生大小为

$$
\Delta E=2|V_n|
$$

的能隙。周期势的傅里叶分量越强，对应边界处的能隙越大。

靠近边界时，令

$$
k=\frac{n\pi}{a}+\delta,\qquad |\delta|\ll 1,
$$

色散关系在带边附近重新变成二次型。此时群速度

$$
v_g=\frac{1}{\hbar}\frac{dE}{dk}
$$

在带边处趋于零，电子的有效质量由能带曲率决定。

近自由电子图像的核心结论是：周期势不会在所有动量处显著改变自由电子能谱，但会在满足布拉格反射条件的位置打开能隙，从而把自由电子抛物线切分为一系列能带。

### 2.1.4 一维布洛赫定理

若哈密顿量在晶格平移下不变，即

$$
[H,T_a]=0,
$$

则能量本征态可同时取为晶格平移算符 $T_a$ 的本征态。由于 $T_a$ 是酉算符，其本征值为单位模相因子：

$$
T_a\psi_k(x)=\psi_k(x+a)=e^{ika}\psi_k(x).
$$

这说明 $k$ 是晶格平移对称性的量子数，称为晶体动量或准动量。由于

$$
e^{i(k+2\pi/a)a}=e^{ika},
$$

$k$ 与 $k+2\pi/a$ 描述同一晶体动量。

布洛赫定理进一步说明，一维周期势中的本征态都可写为

$$
\psi_k(x)=e^{ikx}u_k(x),
$$

其中

$$
u_k(x+a)=u_k(x).
$$

因此布洛赫波是平面波与晶格周期函数的乘积。平面波部分携带准动量，周期函数部分反映晶格势对波函数的调制。

描述能带时常用两种等价图像：

- 扩展区方案：让 $k$ 在整个实轴上延展，能带在不同布里渊区中连续展开。
- 简约区方案：把所有 $k$ 通过加减倒格矢折回第一布里渊区，在同一布里渊区内用能带指标 $n$ 区分不同能带。

简约区方案更常用于实际能带图，因为它直接展示同一准动量处不同能带之间的能隙和交叉结构。

## 2.2 晶格与倒空间

三维能带论需要系统描述晶体的实空间周期性及其倒空间表示。核心对象是布拉菲格子、基元、倒格子和布里渊区。

### 2.2.1 布拉菲格子与基元

布拉菲格子是由一组原始基矢生成的无限周期点阵。在三维中，

$$
\Lambda=\{\mathbf r=n_1\mathbf a_1+n_2\mathbf a_2+n_3\mathbf a_3\mid n_i\in\mathbb Z\}.
$$

每个格点在几何和物理环境上完全等价。原胞是能够通过格矢平移无重叠地铺满整个空间的最小区域。原胞不唯一，但其体积固定：

$$
V=|\mathbf a_1\cdot(\mathbf a_2\times\mathbf a_3)|.
$$

Wigner-Seitz 原胞是一种特殊原胞。它以某个格点为中心，取所有离该格点比离其他格点更近的点构成的区域，因此保留了晶格的全部点群对称性。

并非所有周期结构都是布拉菲格子。一般晶体结构应写为

$$
\text{晶体结构}=\text{布拉菲格子}+\text{基元}.
$$

若每个布拉菲格点附着一组内部原子位置 $\{\mathbf d_i\}$，则晶体中所有原子位置为

$$
\bigcup_i(\Lambda+\mathbf d_i).
$$

蜂窝晶格就是典型例子：它不是布拉菲格子，而是三角布拉菲格子加上两个子晶格组成的二原子基元。

常见三维布拉菲格子包括：

- 简单立方格子：基矢沿三个笛卡尔方向，原胞体积为 $a^3$。
- 体心立方格子（BCC）：每个立方体中心增加一个等价格点，原胞体积为 $a^3/2$。
- 面心立方格子（FCC）：每个面中心增加等价格点，原胞体积为 $a^3/4$。

金刚石和 NaCl 等结构不是简单布拉菲格子，但可以统一理解为 FCC 布拉菲格子加非平凡基元。

### 2.2.2 倒格子

给定布拉菲格子 $\Lambda$，倒格子 $\Lambda^*$ 由基矢 $\mathbf b_i$ 生成：

$$
\Lambda^*=\{\mathbf q=m_1\mathbf b_1+m_2\mathbf b_2+m_3\mathbf b_3\mid m_i\in\mathbb Z\},
$$

并满足

$$
\mathbf a_i\cdot \mathbf b_j=2\pi\delta_{ij}.
$$

在三维中，

$$
\mathbf b_1=\frac{2\pi}{V}\mathbf a_2\times\mathbf a_3,\qquad
\mathbf b_2=\frac{2\pi}{V}\mathbf a_3\times\mathbf a_1,\qquad
\mathbf b_3=\frac{2\pi}{V}\mathbf a_1\times\mathbf a_2.
$$

等价定义是：若 $\mathbf r\in\Lambda$ 且 $\mathbf q\in\Lambda^*$，则

$$
e^{i\mathbf q\cdot\mathbf r}=1.
$$

倒格子的常见关系包括：

- 简单立方格子的倒格子仍为简单立方格子。
- BCC 的倒格子是 FCC。
- FCC 的倒格子是 BCC。
- 倒格子的倒格子回到原格子。

倒格子的物理意义来自傅里叶分析。若 $f(\mathbf x)$ 满足晶格周期性

$$
f(\mathbf x+\mathbf r)=f(\mathbf x),\qquad \mathbf r\in\Lambda,
$$

则它的傅里叶展开只包含倒格矢：

$$
f(\mathbf x)=\sum_{\mathbf q\in\Lambda^*} f_{\mathbf q}e^{i\mathbf q\cdot\mathbf x}.
$$

这意味着周期性势场只能向电子提供或吸收倒格矢大小的晶体动量。在散射、衍射和能带形成中，倒格子都是自然语言。

### 2.2.3 布里渊区

第一布里渊区定义为倒格子的 Wigner-Seitz 原胞。它是倒空间中离原点最近的所有点的集合。

一维晶格的实空间周期为 $a$，倒格子周期为 $2\pi/a$，第一布里渊区为

$$
k\in\left[-\frac{\pi}{a},\frac{\pi}{a}\right].
$$

高维情形中，布里渊区通过连接原点与邻近倒格点并作垂直平分面构造。第一布里渊区包含离原点最近的区域；第二、第三布里渊区可理解为跨过一个、两个等数量的倒格子中垂面后到达的区域。

布里渊区边界上的等价点需要识别。因为

$$
\mathbf k\sim \mathbf k+\mathbf G,\qquad \mathbf G\in\Lambda^*,
$$

第一布里渊区并不是普通的有边界区域，而是带有周期性识别的紧空间。一维布里渊区拓扑上等价于圆 $S^1$；$d$ 维布里渊区拓扑上等价于 $d$ 维环面 $\mathbb T^d$。这一点在 Berry 相位、Chern 数和拓扑能带理论中非常重要。

现实材料的布里渊区是三维几何体，能带图通常不能展示完整三维函数 $E_n(\mathbf k)$，因此实际作图常沿高对称点之间的路径绘制。常用符号包括：

| 符号 | 含义 |
| --- | --- |
| $\Gamma$ | 布里渊区中心，$\mathbf k=0$ |
| X、M、R | 简单立方晶格中的面心、边中点、角点等高对称点 |
| N、H、P | BCC 相关布里渊区中的高对称点 |
| L、W、K、U | FCC 相关布里渊区中的高对称点 |

这些符号为不同材料的能带图提供统一坐标语言。

## 2.3 三维能带结构

三维能带论是前述一维思想的系统推广。周期势保证布洛赫定理成立；倒格子决定晶体动量的等价关系；布里渊区成为能带函数 $E_n(\mathbf k)$ 的自然定义域。

### 2.3.1 三维布洛赫定理

设电子在周期势中运动：

$$
V(\mathbf x+\mathbf r)=V(\mathbf x),\qquad \mathbf r\in\Lambda.
$$

则哈密顿量与所有晶格平移算符对易。能量本征态可取为平移算符本征态：

$$
\psi_{\mathbf k}(\mathbf x+\mathbf r)=e^{i\mathbf k\cdot\mathbf r}\psi_{\mathbf k}(\mathbf x).
$$

因此波函数可写成布洛赫形式

$$
\psi_{\mathbf k}(\mathbf x)=e^{i\mathbf k\cdot\mathbf x}u_{\mathbf k}(\mathbf x),
\qquad
u_{\mathbf k}(\mathbf x+\mathbf r)=u_{\mathbf k}(\mathbf x).
$$

晶体动量 $\mathbf k$ 只在模倒格矢意义下有定义：

$$
\mathbf k\sim \mathbf k+\mathbf G,\qquad \mathbf G\in\Lambda^*.
$$

因此每个布洛赫态可在简约区方案中用第一布里渊区内的 $\mathbf k$ 和能带指标 $n$ 标记：

$$
E_n(\mathbf k),\qquad \mathbf k\in {\rm BZ}.
$$

### 2.3.2 三维近自由电子模型

三维近自由电子模型从平面波

$$
\langle \mathbf x|\mathbf k\rangle\propto e^{i\mathbf k\cdot\mathbf x},
\qquad
E_0(\mathbf k)=\frac{\hbar^2k^2}{2m}
$$

出发，将周期势展开为

$$
V(\mathbf x)=\sum_{\mathbf G\in\Lambda^*}V_{\mathbf G}e^{i\mathbf G\cdot\mathbf x}.
$$

其矩阵元满足选择规则

$$
\langle \mathbf k|V|\mathbf k'\rangle\ne 0
\quad\Longrightarrow\quad
\mathbf k-\mathbf k'=\mathbf G.
$$

因此晶体势只耦合相差倒格矢的自由电子态。非简并区域可用普通微扰理论；若

$$
E_0(\mathbf k)=E_0(\mathbf k+\mathbf G),
$$

则必须使用简并微扰理论。该条件等价于

$$
2\mathbf k\cdot\mathbf G+G^2=0,
$$

其几何意义正是 $\mathbf k$ 位于某个布里渊区边界上。周期势在这些位置打开能隙。

有限晶体中还需引入 Born-von Karman 周期性边界条件：

$$
\psi(\mathbf x+N_i\mathbf a_i)=\psi(\mathbf x).
$$

由此得到允许波矢

$$
\mathbf k=\sum_i\frac{m_i}{N_i}\mathbf b_i.
$$

若晶体含 $N=N_1N_2N_3$ 个原胞，则第一布里渊区内有 $N$ 个不同的 $\mathbf k$ 点。考虑自旋后，每条能带可容纳 $2N$ 个电子。

### 2.3.3 Wannier 函数

布洛赫函数是延展态，适合描述能量本征态；Wannier 函数是其傅里叶变换后的局域基底，适合描述局域轨道、杂质和紧束缚模型。

对单条能带，定义

$$
w_{\mathbf r}(\mathbf x)=\frac{1}{\sqrt N}\sum_{\mathbf k}
e^{-i\mathbf k\cdot\mathbf r}\psi_{\mathbf k}(\mathbf x).
$$

它局域在格点 $\mathbf r$ 附近，并满足平移性质

$$
w_{\mathbf r}(\mathbf x)=w(\mathbf x-\mathbf r).
$$

反过来，

$$
\psi_{\mathbf k}(\mathbf x)=\frac{1}{\sqrt N}\sum_{\mathbf r\in\Lambda}
e^{i\mathbf k\cdot\mathbf r}w(\mathbf x-\mathbf r).
$$

若布洛赫函数正交，则 Wannier 函数也正交：

$$
\int d^3x\,w^*(\mathbf x-\mathbf r')w(\mathbf x-\mathbf r)
=\delta_{\mathbf r,\mathbf r'}.
$$

Wannier 函数并不唯一。相位规范变换

$$
\psi_{\mathbf k}(\mathbf x)\rightarrow e^{i\chi(\mathbf k)}\psi_{\mathbf k}(\mathbf x)
$$

不改变能带能量，却会改变 Wannier 函数的形状、局域性和对称性。实际构造局域轨道时，这一规范自由度非常重要。

### 2.3.4 三维紧束缚模型

三维紧束缚模型假设电子主要局域于格点 $\mathbf r$ 附近，并可跃迁到邻近格点。取 $|\mathbf r\rangle$ 为局域轨道基底，最近邻哈密顿量可写为

$$
H=\sum_{\mathbf r}
\left[
E_0|\mathbf r\rangle\langle\mathbf r|
-\sum_{\mathbf a}t_{\mathbf a}|\mathbf r\rangle\langle\mathbf r+\mathbf a|
\right],
$$

其中 $\mathbf a$ 遍历最近邻位移。

取布洛赫形式

$$
|\psi(\mathbf k)\rangle
=\frac{1}{\sqrt N}\sum_{\mathbf r}
e^{i\mathbf k\cdot\mathbf r}|\mathbf r\rangle,
$$

可得能量

$$
E(\mathbf k)=E_0-\sum_{\mathbf a}t_{\mathbf a}\cos(\mathbf k\cdot\mathbf a),
$$

其中已假设 $t_{\mathbf a}=t_{-\mathbf a}$。

对简单立方晶格，最近邻位移为

$$
(\pm a,0,0),\quad (0,\pm a,0),\quad (0,0,\pm a),
$$

且各方向跃迁相同 $t_{\mathbf a}=t$。能带为

$$
E(\mathbf k)=E_0-2t\left[
\cos(k_xa)+\cos(k_ya)+\cos(k_za)
\right].
$$

其能量范围为

$$
E_{\min}=E_0-6t,\qquad E_{\max}=E_0+6t,
$$

带宽为 $12t$。在 $\mathbf k=0$ 附近，

$$
E(\mathbf k)\simeq E_0-6t+ta^2(k_x^2+k_y^2+k_z^2),
$$

因此仍可定义

$$
m^*=\frac{\hbar^2}{2ta^2}.
$$

紧束缚模型强调局域轨道之间的跃迁；近自由电子模型强调周期势对自由电子态的散射。两种方法适用于不同极限，但都由布洛赫定理统一。

## 本部分小结

能带论的基本结构可以概括为以下几点：

- 周期性晶格使电子本征态具有布洛赫形式。
- 实空间离散性使晶体动量只在第一布里渊区内独立。
- 倒格子给出周期势的傅里叶分量，也决定允许的布拉格散射。
- 近自由电子模型说明能隙来自布里渊区边界处的简并劈裂。
- 紧束缚模型说明原子轨道间跃迁会把孤立能级展开为能带。
- Wannier 函数提供了布洛赫延展态的局域化表示，是连接能带论和局域模型的重要工具。
