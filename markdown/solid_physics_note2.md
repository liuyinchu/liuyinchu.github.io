# 第二部分：能带论

—— 本人阅读David Tong的《Solid State Physics》的AI-Help笔记

原版英文讲义见[这里](
http://www.damtp.cam.ac.uk/user/tong/solidstate.html)，以下为个人笔记部分，由于这只是我的初尝试，因此它并不像第三部分和第四部分那样是完整连贯的，只记录一些我觉得重要的东西，要学还是去看讲义吧。

---
---

## 2.1 一维模型

### 2.1.1 The Tight-Binding Model

假设电子只能存在于原子位置上，而非整个空间中自由移动。电子被局域在晶格点（原子位置）上。每个晶格点可以理解为一个原子轨道。电子并非完全静止，而是有一定的跃迁概率跳到相邻原子。这个跳跃（hopping）就是量子隧穿效应的体现。构造一个“一维晶体”，含有N个原子，彼此间距为a。

---

> ❝We want $\psi_{N+1} = \psi_1$, which means $e^{i k N a} = 1$...❞

* 由于我们考虑**周期性边界条件**（环形晶体，首尾相连），要求波函数在第 $N+1$ 个晶格点处与第 1 个相同：

  $$
  \psi_{N+1} = \psi_1 \quad \Rightarrow \quad e^{i k N a} = 1
  $$
* 这意味着：

  $$
  k N a = 2\pi m \Rightarrow k = \frac{2\pi}{a N} m \quad (m \in \mathbb{Z})
  $$
* 所以波矢 $k$ 被**量子化**了，间隔为 $2\pi / (a N)$，在第一布里渊区中刚好有 $N$ 个不同的 $k$ 值，这与晶格中原子数 $N$ 一一对应。

> ❝States of the form (2.3) have the property $\psi_{n \pm 1} = e^{\pm i k a} \psi_n$...❞

* 这实际上是布洛赫波函数在离散格点上的表现形式：

  $$
  \psi_n = e^{i k n a}
  $$
* 移动一个格点（正向或负向），波函数只多乘一个因子 $e^{\pm i k a}$。

> ❝The energy eigenvalue: $E = E_0 - 2t \cos(ka)$...❞

这就是一维最近邻紧束缚模型的能带公式，其含义如下：

* $E_0$：原子轨道的本征能量（on-site energy）；
* $t$：跃迁矩阵元（hopping amplitude，通常为正）；
* $\cos(ka)$：来自于两个最近邻原子之间的干涉项；
* **能带宽度为 $4t$**，最小值为 $E_0 - 2t$，最大值为 $E_0 + 2t$。

这是一个**余弦能带**，在 $k = 0$ 处能量最低，称为**能带底**；在 $k = \pm\pi/a$ 处能量最高。

* 图中横轴是 $k$，范围为 $[-\pi, \pi]$，纵轴是能量 $E(k)$。
* 参数设置为：$a = t = 1$，$E_0 = 2$，因此公式为：

  $$
  E(k) = 2 - 2 \cos(k)
  $$
* 曲线呈下凹抛物线状，反映电子能量随波矢变化的周期性结构。

> ❝The states with $k > 0$ describe electrons moving to the right; those with $k < 0$ to the left.❞

* 在一维系统中，波矢 $k$ 决定电子的动量方向：

  * $k > 0$：波函数形如 $e^{i k x}$，向右传播；
  * $k < 0$：波函数形如 $e^{-i k x}$，向左传播；
* 尽管电子有质量，其群速度 $v_g = \frac{1}{\hbar} \frac{dE}{dk}$，由能带斜率决定。

---

**能量本征态是完全离域的（delocalized）**

> 即使 hopping $t$ 很小，也足以让所有能量本征态**完全扩展**到整个晶格。

* 初始的哈密顿量 $H_0$ 没有跃迁项，每个本征态就是局域在某个格点上的 $|n\rangle$；
* 一旦加入任意小的跃迁 $t$，这些局域本征态就被线性组合成**布洛赫波函数** $\psi_k \sim e^{i k n a}$，这些态本质上**完全离域**；
* 这体现了量子力学中**波函数干涉**与**耦合引起本征态转变**的本质：任意小的耦合即可导致**谱结构的巨大改变**。

**解除了简并性：形成了能带结构**

> 原本所有格点能量都是 $E_0$，是高度简并的；加上 hopping 项后形成了能带：

$$
E(k) = E_0 - 2t \cos(ka)
$$

* 此公式给出一个**能带**，能量范围为 $[E_0 - 2t,\ E_0 + 2t]$，宽度为 $4t$；
* 所以一个能级展开成一个带状结构，我们称其为**带宽（bandwidth）**。

**低动量近似：**

$$
k \ll \frac{\pi}{a} \Rightarrow E(k) \approx (E_0 - 2t) + t a^2 k^2
$$

* 在 $k$ 很小时可以对余弦展开：

  $$
  \cos(ka) \approx 1 - \frac{1}{2} (ka)^2
  \Rightarrow E(k) \approx E_0 - 2t + t a^2 k^2
  $$

**与自由粒子类比：**

与自由粒子能量关系

$$
E_{\text{free}} = \frac{\hbar^2 k^2}{2m}
$$

进行比较，得出：

$$
\boxed{m^* = \frac{\hbar^2}{2 t a^2}}
$$

即，电子在晶格中表现得像“具有有效质量 $m^*$”的自由粒子——尽管底层结构是晶格。这是凝聚态物理中的核心思想之一。

---

量子力学中非常深刻的一个**对偶性原则**：**动量与位置的傅里叶对偶关系（Fourier duality）**，它在紧束缚模型（tight-binding model）中表现得尤为清晰。
**空间有限 ⇒ 动量离散**

> ❝if space is made finite — for example, a particle in a box... then momentum becomes discrete.❞

这就是我们在量子力学课中学过的：

* **粒子在有限空间内运动**（如盒子中、环中）；
* 要求波函数满足边界条件（如 $\psi(0) = \psi(L) = 0$）；
* 结果：**只有某些特定的动量值**才被允许，比如

  $$
  p_n = \frac{2\pi \hbar}{L} n
  $$
* 即：**空间被压缩 ⇒ 动量谱变成离散点状结构**。

作者说：“这我们已经见过了”，就是指上面章节中采用周期性边界条件时，$k$ 被量子化为：

$$
k = \frac{2\pi}{Na} m
$$

**空间离散 ⇒ 动量周期**

> ❝our tight-binding model also exhibits the converse phenomenon...❞

这是最精彩的一句：

* 如果我们不是把空间变**有限**，而是变**离散**（即晶格结构）；
* 那么动量就不会变成“离散的点”，而是变成**周期性的**！

也就是说：

* 在紧束缚模型中，空间是由间距为 $a$ 的一系列格点组成的；
* 对应的动量空间中，波矢 $k$ 是一个**周期函数**，周期为 $2\pi/a$；
* 所以所有物理可区分的 $k$ 值可以归约到：

  $$
  k \in \left[-\frac{\pi}{a}, \frac{\pi}{a}\right)
  $$

  ——这就是**第一布里渊区**。

**总的原则——傅里叶变换中的对偶性**

> ❝More generally, discreteness is the Fourier transform of compactness.❞

这句话极其精炼地总结了前面两种情况的本质：

* **“紧致性 ↔ 离散性” 是傅里叶对的基本原则**

  | 空间            | 动量                      |
  | ------------- | ----------------------- |
  | 空间有限（compact） | 动量离散（discrete spectrum） |
  | 空间离散（lattice） | 动量周期（Brillouin zone）    |

数学上这可以归结为：

* 有限区间的傅里叶变换 → 离散频谱（Fourier series）
* 离散序列的傅里叶变换 → 周期函数（Discrete Fourier Transform）

这在量子物理、信号处理、晶体电子结构等领域都反复出现。

---

### 2.1.2 Nearly free Electrons

**低动量极限的非简并微扰**

公式 (2.12)：非简并微扰展开

$$
E(k) = \frac{\hbar^2 k^2}{2m} + \langle k|V|k\rangle + \sum_{k'\neq k} \frac{|\langle k|V|k'\rangle|^2}{E_0(k) - E_0(k')} + \cdots
$$

* 一阶修正是 $V_0 = \langle k|V|k\rangle$，与 $k$ 无关，仅是一个常数；
* 二阶修正主要来源于满足 $k' = k + \frac{2\pi n}{a}$ 的项（由公式2.11给出）；
* 当 $k \ll \frac{\pi}{a}$ 时，与其他 $k'$ 的能量差大 ⇒ 二阶修正很小；
* **物理图像：**

  * 此时电子的德布罗意波长 $\lambda \sim \frac{2\pi}{k} \gg a$，远大于晶格尺度；
  * 所以电子像“看不到”势场一样自由运动。

**布里渊区边界处的简并微扰与能隙形成**

简并点 $k = \pm \frac{n\pi}{a}$

此时 $|k\rangle$ 和 $|-k\rangle$ 是简并态，会因周期势 $V(x)$ 被耦合。我们用简并微扰理论处理。

公式 (2.13)：

构建 $2\times2$ 本征值问题（矩阵形式）：

$$
\begin{pmatrix}
\langle k|H|k\rangle & \langle k|H|k'\rangle \\
\langle k'|H|k\rangle & \langle k'|H|k'\rangle
\end{pmatrix}
\begin{pmatrix}
\alpha \\ \beta
\end{pmatrix}
= E \begin{pmatrix}
\alpha \\ \beta
\end{pmatrix}
$$

公式 (2.14)：

利用正交性、能量简并性和矩阵元公式：

$$
E_0(k) = E_0(k') = \frac{n^2\hbar^2\pi^2}{2ma^2}, \quad \langle k|V|k'\rangle = V_n
$$

解这个 $2 \times 2$ 矩阵的本征值问题，得：

公式 (2.15)：**能隙的出现**

$$
E = \frac{\hbar^2 n^2 \pi^2}{2ma^2} + V_0 \pm |V_n|
$$

说明：

* 在布里渊区边界 $k = \pm \frac{n\pi}{a}$ 处，能带出现“断裂”；
* 上、下两支能带间距为 $2|V_n|$，这就是**能隙（band gap）**。

对应波函数：

$$
\psi_\pm(x) \sim \cos\left(\frac{\pi x}{a}\right),\ \sin\left(\frac{\pi x}{a}\right)
$$

* $\psi_+$：最大值对齐势能的最大值 ⇒ 处于势垒 ⇒ 高能；
* $\psi_-$：最大值对齐势能谷 ⇒ 处于势阱 ⇒ 低能；
* 这解释了为何能量分裂方向是 $\pm |V_n|$。

**接近布里渊区边缘时的修正分析**

考虑 $k = \frac{n\pi}{a} + \delta$，$\delta\ll 1$：

公式 (2.16)：

仍然解 $2\times2$ 特征方程：

$$
\left(E_0(k) + V_0 - E\right)\left(E_0(k') + V_0 - E\right) - |V_n|^2 = 0
$$

用展开的 $E_0(k)$, $E_0(k')$，求出：

$$
E_\pm = \frac{\hbar^2}{2m}\left(\frac{n^2 \pi^2}{a^2} + \delta^2\right) + V_0 \pm \sqrt{|V_n|^2 + \left(\frac{\hbar^2 2n\pi \delta}{2ma}\right)^2}
$$

展开根号得：

近似形式：

$$
E_\pm \approx E_{\text{gap}} + V_0 \pm |V_n| + \frac{\hbar^2}{2m} \left(\frac{n^2 \pi^2}{a^2 |V_n|}\right)\delta^2
$$

* 意味着靠近能隙边缘时，能量关于动量偏移 $\delta$ 是二次型的；
* 带缘附近电子仍近似为有效质量粒子运动，但质量变了（带隙引入曲率）。

---

> ❝The original quadratic spectrum is deformed...❞

自由电子模型下，能量谱 $E(k) = \hbar^2 k^2 / 2m$ 是连续的抛物线。加入周期性势场后，能谱被**周期性扰动“剪断”**，呈现出一系列能带结构的典型特征：

**特征1：小动量 $k \ll \pi/a$ 处能谱保持不变**

* 在长波长极限，电子“看不到”周期势场（类比于波长远大于晶格间距时的光传播）；
* 此区域内 $E(k)$ 保持近似抛物线形式；
* 非简并微扰理论成立，仅有常数和很小的二阶修正。

**特征2：在 $k = n\pi/a$ 处打开能隙 ⇒ 出现能带分裂**

* 由于周期势将动量 $k$ 与 $k \pm 2\pi/a$ 发生耦合；
* 在 $k = \frac{n\pi}{a}$（即布里渊区边界）处 $|k\rangle$ 与 $|-k\rangle$ 简并，耦合产生分裂；
* 能隙大小为 $2|V_n|$，其中 $V_n$ 是势场的第 $n$ 个傅里叶系数。

**特征3：靠近带边缘时，能量关于动量为二次型**

> ❝...the spectrum is quadratic. In particular, $dE/dk \to 0$...❞

* 能带边缘的色散关系为：

  $$
  E(k) \approx E_0 \pm |V_n| + A\delta^2
  $$
* 即能量关于 $k$ 呈**抛物线展开**；
* 物理含义：群速度 $v_g = \frac{dE}{dk} \to 0$，电子变得“重” ⇒ 有效质量趋于无穷大。

**Brillouin Zone & 能带命名**

> ❝The region of momentum space corresponding to the nth energy band is called the nth Brillouin zone.❞

* **第 $n$ 带**指的是在动量空间的第 $n$ 个 Brillouin 区间（$k \in [(n-1)\pi/a, n\pi/a]$）内出现的能带；
* 第一个 Brillouin 区常简称为**the** Brillouin zone。

---

### 2.1.4 一维布洛赫定理

**第一部分：什么是平移对称性？**

> **公式 (2.21)** 表示的是：如果系统在任意平移 $l$ 下都不变，那哈密顿量 $H$ 与平移算符 $T_l$ 对易：

$$
[H, T_l] = 0
$$

这就叫**平移不变性**，也叫“平移对称性”。

**连续 vs 离散 平移对称性**

* **连续对称性**：所有 $l$ 都成立（即任意距离都不影响系统），就像自由粒子。
* **离散对称性**：只有当 $l$ 是晶格常数 $a$ 的整数倍（例如 $a, 2a, 3a$...）才成立。这就代表一个**晶体**或**周期性势场**。

**那动量呢？**

在自由空间，动量 $p$ 是守恒的（因为 $p$ 与 $H$ 对易）。
但在晶格中，$p$ 不再守恒——你不能再对角化 $p$ 和 $H$。

不过——
你可以对角化：

* **$T_a$**：晶格平移一个格距
* **$H$**：哈密顿量

所以：虽然不是“动量”守恒，但我们可以引入一个新标签 $k$，称为**准动量**或**晶格动量**，它是 $T_a$ 的本征值的标签。

**$T_a$ 的本征值长什么样？**

因为 $T_a$ 是一个**酉算符**，它的本征值是模为 1 的复数，也就是：

$$
T_a \psi_k(x) = e^{ika} \psi_k(x)
$$

这是布洛赫波函数的定义之一。你可以认为它满足：

* $\psi_k(x+a) = e^{ika} \psi_k(x)$

于是我们发现，**$k$** 是一个实数，但由于：

$$
e^{i(k+2\pi/a)a} = e^{ika}
$$

也就是说，**$k$ 和 $k + 2\pi/a$** 是等价的！

这就说明：**动量空间是周期性的**，我们可以把所有 $k$ 限制在一个“区间”里，例如：

$$
k \in \left[ -\frac{\pi}{a}, \frac{\pi}{a} \right)
$$

这个区间就叫做**第一布里渊区**。

**布洛赫定理**

我们可以证明：在周期性势场中，所有的解都可以写成下面的形式：

$$
\psi_k(x) = e^{ikx} u_k(x)
$$

其中：

* $e^{ikx}$ 是**平面波**，携带准动量 $k$
* $u_k(x)$ 是一个周期函数，满足 $u_k(x + a) = u_k(x)$

也就是说：**布洛赫波函数**是平面波乘以周期函数。

这很神奇，因为**你加了周期性势场，电子居然还是可以像自由粒子一样运动，但被周期性地调制了**。

两种绘图方式的区别：

这两张图展示了**相同的能带结构，但画法不同**：

图 19：Extended Zone Scheme

* 横轴继续扩展 $k$，不管周期
* 所有能带就“重复展开”，形成周期图

图 20：Reduced Zone Scheme

* 所有 $k$ 被压缩到第一布里渊区内
* 能带就“折叠起来”，变成一层层叠在一起的图

两种图都没错，只是**看问题的方式不同**。后者更常用于材料能带的实际分析，因为它强调了**能带之间的间隙（能隙）**。

总结一句话：

在周期性晶格中，电子的动量空间不是无限的，而是被限制在一个“动量区间”（布里渊区）内，能量谱因此变成**带状结构**，这正是**能带理论的核心**。布洛赫定理说明电子波函数虽然被调制，但它们依然具有波动性，这保证了电子可以自由运动（导电性）——除非**能隙阻断了它们的传播**（绝缘体）。

---

**什么叫“电子像自由粒子一样运动”？**

我们先来看自由粒子的波函数：

$$
\psi_k(x) = e^{ikx}
$$

这是一个**完美的平面波**，意思是：

* 没有障碍物（势能为 0）
* 粒子动量为 $p = \hbar k$
* 可以在空间中“自由传播”，没有受到任何限制

你可以把它想象成：

> 一列非常规则、均匀的波纹，在无阻碍的水面上传播。

**什么是“调制”？**

调制（modulation）这个词，在物理和工程里都有用，大致意思是：

> **在一个基础波上叠加周期性或非周期性的变化。**

用类比最容易理解：

想象你弹吉他的一根弦，它发出的纯音是：

$$
\psi(x) = \sin(kx)
$$

但如果你轻轻把手指搭在某点（形成“泛音”），它就会变成：

$$
\psi(x) = f(x) \cdot \sin(kx)
$$

这时候，$f(x)$ 就是**调制函数**，它影响波的**振幅、形状、周期性**。

**在布洛赫波函数中，怎么调制？**

布洛赫定理说：

$$
\psi_k(x) = e^{ikx} u_k(x)
$$

其中：

* $e^{ikx}$ 是原始的平面波（像自由粒子一样）
* $u_k(x)$ 是一个**周期函数**，满足 $u_k(x+a) = u_k(x)$

这意味着：

> 原本电子是平滑的波，现在它的“波幅”随空间周期性变化，被晶格势能“调制”了。

**这种“调制”是怎么来的？**

是**晶格势能 $V(x)$** 强行加入的。

想象你把自由电子放进一个周期性电势里（比如由原子核形成的周期性势阱），它原本想自由传播，但现在每隔 $a$ 会被“拦一下”：

* 它不能再完全自由传播；
* 但它仍然有传播的趋势，只不过“波形”发生了周期性的起伏。

于是最终的解不再是纯 $e^{ikx}$，而是：

$$
\psi_k(x) = e^{ikx} \underbrace{u_k(x)}_{\text{调制因子}}
$$

---

直白总结：

> **调制 = 原本自由传播的电子，在晶格周期性结构的影响下，波形被周期性地“打碎”“搅动”了一点点。**

* 电子“还是想自由运动”——这是 $e^{ikx}$；
* 但晶格“周期性地干扰”它——这就是 $u_k(x)$ 的作用。

---
---

## 2.2 晶格

### 2.1.1 Bravais Lattices

**Bravais 格子（Bravais Lattice）**

* 最简单的晶格类型，由一组原始向量 $\mathbf{a}_1, \mathbf{a}_2$ 生成的周期性点阵。
* 每个格点可以写成：

  $$
  \Lambda = \{ \mathbf{r} = n_1 \mathbf{a}_1 + n_2 \mathbf{a}_2 \,|\, n_i \in \mathbb{Z} \}
  $$
* 三维情况同理，只是加上了 $\mathbf{a}_3$。

**原胞（Primitive Unit Cell）**

* 能够平铺整个空间（不重叠、不留缝隙）的最小区域。
* 不唯一！不同的原胞可能形状不同，但都含一个晶格点，面积/体积相同。
* 原胞体积（面积）计算公式（三维）：

  $$
  V = |\mathbf{a}_1 \cdot (\mathbf{a}_2 \times \mathbf{a}_3)|
  $$

**Wigner-Seitz 原胞（Wigner-Seitz Cell）**

* 一种特别选取的原胞，具有晶格的全部对称性。
* 构造方式：以某个晶格点为中心，连接到所有邻近点 → 构造这些连线的垂直平分面 → 形成最靠近该点的区域（Voronoi 区域）。
* 常用于物理学中，因为它最大程度保持对称性。

**二维 Bravais 格子分类（共 5 类）**

1. **方格（Square）**

   * $|\mathbf{a}_1| = |\mathbf{a}_2|,\ \theta = \pi/2$，具有四重旋转对称性。

2. **三角形（Triangular）/六角形（Hexagonal）**

   * $|\mathbf{a}_1| = |\mathbf{a}_2|,\ \theta = \pi/3 \text{ 或 } 2\pi/3$，具有六重对称性。

3. **矩形（Rectangular）**

   * $|\mathbf{a}_1| \neq |\mathbf{a}_2|,\ \theta = \pi/2$，有镜像对称性。

4. **中心矩形（Centered Rectangular）**

   * $|\mathbf{a}_1| \neq |\mathbf{a}_2|,\ \theta \neq \pi/2$，但包含额外格点在中心。

5. **斜方（Oblique）**

   * 最一般的情况，无特殊对称性，仅 $|\mathbf{a}_1| \neq |\mathbf{a}_2|,\ \theta \neq \pi/2$。

---

**Not all Lattices are Bravais**

**什么是 Bravais 晶格？**

* **Bravais 晶格**是由一组**基矢** $\mathbf{a}_1, \mathbf{a}_2$ 在整个空间中以整数方式平移得到的点阵：

  $$
  \Lambda = \{ n_1 \mathbf{a}_1 + n_2 \mathbf{a}_2 \}
  $$

  * 每一个点在结构上与所有其它点完全相同。
  * 即，“从任意一个点看出去”都和从其它点看是一样的。

**Honeycomb 晶格 ≠ Bravais 晶格**

图中画的是石墨烯（graphene）的晶格，也叫**蜂窝晶格（honeycomb lattice）**。

* **为什么不是 Bravais？**

  * 虽然整个结构是周期的，但**并非所有点是“一样”的**！
  * 你可以看到图中的两个颜色的点（红色和白色）虽然都排布得很规整，但它们的局部环境不同：

    * 红点：左边有一个邻居，右上、右下各一个邻居；
    * 白点：右边有一个邻居，左上、左下各一个邻居。
  * 所以你不能通过单纯的平移把红点变成白点——**它们物理上不同**，所以不能看作一个 Bravais 晶格。

**如何构造蜂窝晶格？**

* 红色点构成了一个**三角晶格**（triangular lattice）！
* 它的基矢为：

  $$
  \mathbf{a}_1 = \frac{\sqrt{3}a}{2}(\sqrt{3}, 1), \quad \mathbf{a}_2 = \frac{\sqrt{3}a}{2}(\sqrt{3}, -1)
  $$

* 每个红点还伴随着一个白点，白点与红点之间的相对位置为：

  $$
  \mathbf{d} = (-a, 0)
  $$

  即：白点 = 红点 + 一个偏移。

**晶格构造的一般规则**：

我们可以把任意晶格结构理解为：

$$
\text{Lattice} = \bigcup_{i} \left( \Lambda + \mathbf{d}_i \right)
$$

* $\Lambda$：一个 Bravais 晶格；
* $\{ \mathbf{d}_i \}$：称为**基元（basis）**，表示每个 Bravais 点处附着的“原子群”结构；
* 每一个晶格结构 = “Bravais点 + 局部原子结构”。

---

**Examples of Bravais Lattices in 3D**

**Cubic（立方格子）**

* **基矢**：沿笛卡尔坐标轴，$\mathbf{a}_1 = a\hat{x}, \mathbf{a}_2 = a\hat{y}, \mathbf{a}_3 = a\hat{z}$。
* **体积**：$V = a^3$。
* **Wigner-Seitz 单元**：就是一个以晶格点为中心的立方体。

**Body-Centered Cubic (BCC，体心立方)**

* 在每个立方体中心增加一个点。
* **两种表示**：

  * 常规基矢：与 simple cubic 相同，第3个向量是对角线方向。
  * 对称基矢（常用）：三条对角线方向的组合，构成更对称的 primitive cell。
* **原胞体积**：$V = a^3/2$。
* 也可以看作 cubic 格子 + 两个原子基元，但它本身仍是 Bravais。

**Face-Centered Cubic (FCC，面心立方)**

* 每个立方体六个面中心各加一个点。
* **基矢**：分别连接不同面中心，形成 primitive cell。
* **原胞体积**：$V = a^3/4$。
* 也可以看作 cubic 格子上叠加了 4 个原子组成的基元。

**非 Bravais 格子示例（图 25-26）**

**Diamond（金刚石）**

* 实际上是两个交错的 FCC 格子（interlaced FCC lattices）。
* 例如碳原子分别位于：

  * $\mathbf{d}_1 = 0$
  * $\mathbf{d}_2 = \frac{a}{4}(\hat{x} + \hat{y} + \hat{z})$

**Salt（NaCl）**

* 基本框架是 FCC 格子，但 Na 和 Cl 占据交错的位置。
* Na 原子在 $\mathbf{d}_1 = 0$，Cl 原子在 $\mathbf{d}_2 = \frac{a}{2}(\hat{x} + \hat{y} + \hat{z})$

这些结构不满足“所有格点都等价”，因此不是 Bravais 格子，但可通过“Bravais 格子 + 基元”统一描述。

---

### 2.2.2 倒格子

**倒格子的定义与构造**

* 给定一个 Bravais 晶格 $\Lambda = \{\mathbf{r} = \sum n_i \mathbf{a}_i\}$，定义**倒格子** $\Lambda^*$ 是一组向量 $\mathbf{k} = \sum n_i \mathbf{b}_i$，满足：

  $$
  \mathbf{a}_i \cdot \mathbf{b}_j = 2\pi \delta_{ij}
  $$

* 在 3D 中构造公式：

  $$
  \mathbf{b}_1 = \frac{2\pi}{V} \mathbf{a}_2 \times \mathbf{a}_3 \quad \text{(其余依此类推)}
  $$

  其中 $V = |\mathbf{a}_1 \cdot (\mathbf{a}_2 \times \mathbf{a}_3)|$ 是原胞体积。

* 倒格子是一个“傅里叶空间晶格”，坐标单位是 $1/\text{length}$。

条件公式的另一种形式：

* 用复指数形式定义：

  $$
  e^{i\mathbf{k} \cdot \mathbf{r}} = 1 \quad \forall\, \mathbf{r} \in \Lambda,\, \mathbf{k} \in \Lambda^*
  $$

  即倒格子向量和原格子向量相互正交（mod $2\pi$）。

**常见倒格子示例**

* **立方格子 → 倒格子也是立方格子**；
* **BCC 格子 → 倒格子是 FCC 格子**；
* **FCC 格子 → 倒格子是 BCC 格子**。

这就是著名的双重关系：**倒格子的倒格子就是原格子**。

**傅里叶变换中的作用（关键！）**

* 若 $f(\mathbf{x})$ 在晶格 $\Lambda$ 上是周期性的（即 $f(\mathbf{x} + \mathbf{r}) = f(\mathbf{x})$，$\mathbf{r} \in \Lambda$），其傅里叶变换 $\tilde{f}(\mathbf{k})$ 只在**倒格子点**上非零。

  $$
  \tilde{f}(\mathbf{k}) = \sum_{\mathbf{r} \in \Lambda} e^{-i \mathbf{k} \cdot \mathbf{r}} \int_{\Gamma} d^3x\, e^{-i \mathbf{k} \cdot \mathbf{x}} f(\mathbf{x})
  $$

* 这可以写成：

  $$
  \tilde{f}(\mathbf{k}) = \Delta(\mathbf{k}) \cdot S(\mathbf{k})
  $$

  * $\Delta(\mathbf{k}) = \sum_{\mathbf{r} \in \Lambda} e^{-i\mathbf{k} \cdot \mathbf{r}}$，是个离散谱。
  * 只有当 $\mathbf{k} \in \Lambda^*$ 时，这个和不为 0。

离散谱行为：为什么是 delta 函数？

* $\Delta(\mathbf{k}) = 0$，除非 $\mathbf{k} \in \Lambda^*$；

* 更进一步，在无限大晶格极限下，$\Delta(\mathbf{k})$ 变成：

  $$
  \Delta(\mathbf{k}) = V^* \sum_{\mathbf{q} \in \Lambda^*} \delta(\mathbf{k} - \mathbf{q})
  $$

* 即傅里叶变换只在倒格子点上有**delta 峰**（这就是为什么能量带结构通常在倒格子中分析！）

**反变换**

你可以从傅里叶系数 $S(\mathbf{q})$ 恢复原函数 $f(\mathbf{x})$：

$$
f(\mathbf{x}) = \frac{V^*}{(2\pi)^3} \sum_{\mathbf{q} \in \Lambda^*} e^{i\mathbf{q} \cdot \mathbf{x}} S(\mathbf{q})
$$

这也说明**周期性函数就是一组平面波的叠加，其波矢属于倒格子！**

---

公式的核心是

$$
\mathbf b_i=\frac{2\pi}{V}\;\frac12\,\varepsilon_{ijk}\,
\mathbf a_j\times\mathbf a_k .
$$

* $\varepsilon_{ijk}$ 是 Levi-Civita 张量（全反对称）；
* $\mathbf a_j\times\mathbf a_k$ 是常规叉积。

为什么多出 $ \tfrac12$ ？

> **因为指标 $j,k$ 在求和时被计算了两次，需要除以 2 来消除重复。**

通常我们这样给倒格子基矢：

$$
\mathbf b_1=\frac{2\pi}{V}\,\mathbf a_2\times\mathbf a_3,\qquad
\mathbf b_2=\frac{2\pi}{V}\,\mathbf a_3\times\mathbf a_1,\qquad
\mathbf b_3=\frac{2\pi}{V}\,\mathbf a_1\times\mathbf a_2 .
$$

这里每条式子只出现一次叉积，没有重复计数。

为了把三条式子写成一条紧凑公式，要对 $j,k$ **全部求和**。
对固定的 $i$，$(j,k)$ 共有六个排列：

$$
(1,2),(2,1),(1,3),(3,1),(2,3),(3,2).
$$

但真正需要的只有 **三个互不相同的组合**；另外三个只是把 $j,k$ 交换了次序。

因为

$$
\mathbf a_j\times\mathbf a_k = -\,\mathbf a_k\times\mathbf a_j ,
\qquad
\varepsilon_{ijk} = -\,\varepsilon_{ikj},
$$

这对每一对交换的项来说，乘积
$\varepsilon_{ijk}\,\mathbf a_j\times\mathbf a_k$
**正好相等**，没有符号差。
于是同一内容被算了两遍 ⇒ 结果多出 **因子 2**。
为了恢复正确数值，就必须再乘 $\tfrac12$。

> **一句话**：$\tfrac12$ 是抵消 $\sum_{j,k}$ 中对称重复的“计数因子”。如果直接写三条分开的公式则没有这个系数。

---

我们要理解：

$$
\tilde{f}(\mathbf{k}) = \int d^3x\, e^{-i\mathbf{k}\cdot \mathbf{x}} f(\mathbf{x})
= \sum_{\mathbf{r} \in \Lambda} \int_{\Gamma} d^3x\, e^{-i\mathbf{k} \cdot (\mathbf{x} + \mathbf{r})} f(\mathbf{x} + \mathbf{r})
= \left( \sum_{\mathbf{r} \in \Lambda} e^{-i\mathbf{k} \cdot \mathbf{r}} \right)
\int_\Gamma d^3x\, e^{-i\mathbf{k} \cdot \mathbf{x}} f(\mathbf{x})
$$

对整个空间积分转为单位胞积分之和。

因为 $f(\mathbf{x})$ 是周期性函数，满足：

$$
f(\mathbf{x} + \mathbf{r}) = f(\mathbf{x}) \quad \forall \mathbf{r} \in \Lambda
$$

整个空间可以被布拉菲格子 $\Lambda$ 中的点平移的单位胞 $\Gamma$ 填满。

所以我们可以将整个空间积分写成对每个格点 $\mathbf{r} \in \Lambda$ 平移后的单位胞积分之和：

$$
\int_{\mathbb{R}^3} d^3x\, f(\mathbf{x}) = \sum_{\mathbf{r} \in \Lambda} \int_\Gamma d^3x\, f(\mathbf{x} + \mathbf{r})
$$

在傅里叶变换中同样地用这个分解方式：

$$
\tilde{f}(\mathbf{k}) = \int d^3x\, e^{-i\mathbf{k}\cdot \mathbf{x}} f(\mathbf{x})
= \sum_{\mathbf{r} \in \Lambda} \int_\Gamma d^3x\, e^{-i\mathbf{k} \cdot (\mathbf{x} + \mathbf{r})} f(\mathbf{x} + \mathbf{r})
$$

利用周期性将 $f(\mathbf{x} + \mathbf{r}) = f(\mathbf{x})$

$$
= \sum_{\mathbf{r} \in \Lambda} \int_\Gamma d^3x\, e^{-i\mathbf{k} \cdot (\mathbf{x} + \mathbf{r})} f(\mathbf{x})
$$

指数因子拆分，常数因子提到积分外：

$$
e^{-i\mathbf{k} \cdot (\mathbf{x} + \mathbf{r})} = e^{-i\mathbf{k} \cdot \mathbf{x}} e^{-i\mathbf{k} \cdot \mathbf{r}}
$$

所以

$$
= \sum_{\mathbf{r} \in \Lambda} e^{-i\mathbf{k} \cdot \mathbf{r}} \int_\Gamma d^3x\, e^{-i\mathbf{k} \cdot \mathbf{x}} f(\mathbf{x})
$$

我们得到最终结果：

$$
\tilde{f}(\mathbf{k}) = \left( \sum_{\mathbf{r} \in \Lambda} e^{-i\mathbf{k} \cdot \mathbf{r}} \right) \cdot \int_\Gamma d^3x\, e^{-i\mathbf{k} \cdot \mathbf{x}} f(\mathbf{x})
$$

* **前面是布拉菲格子求和**，称为：

  $$
  \Delta(\mathbf{k}) = \sum_{\mathbf{r} \in \Lambda} e^{-i\mathbf{k} \cdot \mathbf{r}}
  $$
* **后面是单位胞上的局部傅里叶变换**，称为结构因子 $S(\mathbf{k})$。

---

**The Reciprocal Lattice and Fourier Transforms**

**这部分内容在讲以上有非常详细的讲解与证明，请去看讲义。**

---

### 2.2.3 布里渊区（BZ）

**Brillouin Zone 布里渊区的定义、构造与图像表示**

> **“倒格子的 Wigner-Seitz 单元被称为 Brillouin 区（Brillouin Zone）。”**

这是一个**动量空间**（倒空间）中的几何构造，用来描述周期性系统中波矢 $\vec{k}$ 的对称性和能带结构。

一维布里渊区的例子

* **实空间晶格**间距为 $a$，晶格点位于 $r = n a$；
* **倒空间晶格**间距为 $b = \frac{2\pi}{a}$，格点为 $k = n b$；
* **一维 Wigner-Seitz 单元**（= Brillouin Zone）是：

  $$
  k \in \left[ -\frac{b}{2}, \frac{b}{2} \right] = \left[ -\frac{\pi}{a}, \frac{\pi}{a} \right]
  $$

也就是说，第一布里渊区就是**倒格子中，离原点最近的区域**（按对称性划分），正好对应于**一维自由电子模型中的 allowed k 区域**。

高阶布里渊区的定义：

* **第 n 个 Brillouin 区** = 距原点第 $n$ 近的倒格子区域；
* 所有 Brillouin 区都具有**相同体积**，是倒格子的一个天然划分。

**二维情形中 Brillouin 区的构造与图示**

**我的理解：一条中垂线都没跨过 —— 第一布里渊区，每跨过一条中垂线就加一。**  

图 Figure 28 解读（**二维方格子**）：

这是倒格子是一个二维方格子的情形，即倒格子点构成了一个 $\mathbb{Z}^2$ 的正方格结构。图中颜色说明如下：

* **黄色区域**：第一布里渊区
* **粉红色区域**：第二布里渊区（需跨越一个垂直平分线）
* **蓝色区域**：第三布里渊区（需跨越两个边界）

构造方法：

> “通过原点与其它倒格子点之间的**垂直平分线**构造布里渊区的边界。”

这在几何上对应于构造二维倒格子中**以原点为中心的 Wigner-Seitz 单元**，其边界正是所有距离原点最近的一圈倒格子点的**垂直中垂线**组成的多边形。

分区图像中的物理含义：

1. **第一布里渊区（黄）**：

   * 包含了所有最靠近原点的 $\vec{k}$ 值；
   * 常作为能带的定义区域；
   * 是 Reduced Zone Scheme 中的基本单元。

2. **第二布里渊区（粉红）**：

   * 是那些必须穿越**一个中垂线**才能到达的区域；
   * 不同能带（如自由电子模型中的第 n 个能带）在这一区域“出现”。

3. **第三布里渊区（蓝色）**：

   * 必须穿越两道边界；
   * 对应于更高的带。

**Reduced Zone Scheme 图像（Figure 29）：**

这个图把前面那张图的三圈区域“全部压缩”到第一布里渊区中，即：

> 把所有超出第一布里渊区的动量 $\vec{k}$，通过加上倒格矢 $\vec{G}$ 映射回第一布里渊区。

* 第一带（黄）保留原样；
* 第二带（粉红）被平移回第一布里渊区；
* 第三带（蓝）也同理。

这就是经典的**reduced zone scheme**——将所有能带结构在第一布里渊区中“层叠”呈现。

**我的理解：“以分界线为轴翻回去”，第二翻一次，第三就翻两次。**  

> “布里渊区的边界应该视为等价的，它们标记了同一个动量状态 $\vec{k}$。”

* 这与周期性边界条件相对应：在边界上连续，动量守恒；
* 在一维中，第一布里渊区是一个**圆形**（等价于单位圆上的动量）；
* 在高维中，**拓扑上**是一种**环面 $\mathbb{T}^d$**（周期性边界的 d 维空间）；
* 因此电子在动量空间中等价于在一个周期性空间内运动。

---

原文回顾（最后一段）：

> *"Finally, note that the edges of the Brillouin zone should be identified; they label the same momentum state $\vec{k}$. For one-dimensional lattices, this results in the Brillouin zone having the topology of a circle. For $d$-dimensional lattices, the Brillouin zone is topologically a torus $\mathbb{T}^d$."*

**“边界应该被识别（identified）”是什么意思？**

> 原文：“the edges of the Brillouin zone should be identified; they label the same momentum state $\vec{k}$”

**解释**：

* 在周期性晶体中，波函数满足：

  $$
  \psi(x + a) = e^{ika} \psi(x)
  $$

  因此 $\vec{k}$ 和 $\vec{k} + \vec{G}$（其中 $\vec{G}$ 是任意倒格矢）代表的是**相同物理态**。

这意味着：

* **第一布里渊区边界上的点，在物理上是“等价”的**；
* 它们不是两个不同的状态，而是**同一个准动量态的不同表示方式**。

**物理图像**：想象你走到布里渊区的右边界，其实等价于你从左边界“又走回来”了。

**一维情形：布里渊区是一个圆（拓扑为 $S^1$）**

> 原文：“For one-dimensional lattices, this results in the Brillouin zone having the topology of a circle.”

**解释**：

* 一维第一布里渊区：$k \in [-\pi/a, \pi/a]$；
* 左右两端点 $k = -\pi/a$ 与 $k = \pi/a$ 实际上是**等价动量态**；
* 把这两点粘起来，你得到一个 **闭合的圆环**。

直观地说：

> 一维布里渊区就像一个**环形跑道**，绕着一圈走，走到边缘就绕回原点。

这就是拓扑学意义下的**圆 $S^1$**。

**高维情形：拓扑为 $\mathbb{T}^d$（d维环面）**

> 原文：“For $d$-dimensional lattices, the Brillouin zone is topologically a torus $\mathbb{T}^d$.”

**解释**：

* 二维布里渊区是一个**有限的正方形区域**，比如 $[-\pi/a, \pi/a]^2$；
* 四个边界分别表示两个方向上的布里渊区边缘；
* 通过周期性识别（也就是“左右粘、上下粘”）：

  * 左右边识别 ⇒ 横向是一个圆；
  * 上下边识别 ⇒ 纵向是一个圆；
  * 两个方向同时周期 ⇒ 得到一个二维环面（圆 × 圆）。

就像二维游戏地图“左边走出去从右边回来、上边走出去从下边回来”——这是一个\*\*“甜甜圈形”空间\*\*。

拓扑上，这称为 **二维环面 $\mathbb{T}^2$**。

* 三维晶体中，类似地你会得到三维环面 $\mathbb{T}^3$，也就是立体“甜甜圈”的推广。

这些拓扑性质并非只是几何好玩，它们在**实际物理中有重要含义**：

* **能带拓扑**：拓扑不变量（如 Chern 数）定义在布里渊区，需要理解其为封闭的环面；
* **周期边界条件**：数值模拟中常将晶体看成在 $\mathbb{T}^d$ 上演化；
* **态的等价性**：识别布里渊区边界意味着态是“周期定义”的，有助于规范计算；
* **Berry 相位与拓扑绝缘体**：都依赖于布里渊区是一个环面而非平面。

---

**Crystallographic Notation**

> **“The Brillouin zone of real materials is a three-dimensional space...”**

* **现实材料的布里渊区是三维的**，即倒空间中是一个 3D 几何体；
* 但我们常常想要描述**电子能量随波矢 $\vec{k}$** 的变化图像（比如能带图）；
* 在纸面或屏幕上无法直接画出三维复杂的 Brillouin 区，所以必须\*\*“投影”\*\*或“简化”成 2D 或 1D 图像；
* 所以晶体学家发明了一种统一的符号记号系统来简化对称点的标记。

**高对称点用字母表示（比如 $\Gamma$，X，M，R……）**

> **“Certain, highly symmetric points in the Brillouin zone are labelled by letters...”**

* 在每种晶格结构（立方、六方等）中，都有一些**特别的动量点**，具有**高对称性**；

* 比如：原点、边中心、角点、面对称中心等等；

* 这些点被统一用字母标记，比如：

  | 符号       | 代表的动量点               |
  | -------- | -------------------- |
  | $\Gamma$ | 原点（动量 $\vec{k} = 0$） |
  | X        | 面的中心                 |
  | M        | 边的中心                 |
  | R        | 角落顶点                 |

* 这些符号具有一定“语义”：**你一看符号，就该知道它在哪个晶格结构中大概在哪个位置**。

**$\Gamma$ 是动量空间的“原点”**

> **“For example, all Brillouin zones have an origin... they call the origin $\Gamma$.”**

* 所有的 Brillouin 区都围绕一个“原点”，也就是动量 $\vec{k} = 0$；
* 在数学和物理里，几乎所有人都习惯称原点为 “0”；
* 但**晶体学家不用 0，而是用希腊字母 $\Gamma$**（发音类似“伽马”）表示；
* 你在能带图中经常会看到 $\Gamma \rightarrow X \rightarrow M$ 这样的路径，其实就是从动量原点出发走向某个特定方向的图示。

---

现在我们结合 **Figure 30** 的图像，对**不同晶体结构的第一布里渊区中的高对称点**进行详细讲解。这张图展示了\*\*三种晶格类型（立方、体心立方 BCC、面心立方 FCC）\*\*的倒空间结构，并标注了常用的晶体学对称点：Γ、X、M、R、N、P、H、L、W、U 等。

什么是“高对称点”？

在布里渊区中，有些动量点因晶体的对称性特别高，满足更多对称操作（如镜面对称、旋转对称等）。这些点是：

* **能带绘图的关键点**；
* **简并发生的位置**；
* **能带结构分析中最常关注的位置**。

这些点是绘制路径 $\Gamma \rightarrow X \rightarrow M \rightarrow \Gamma \rightarrow R$ 等的节点。

**Cubic Bravais Lattice（简单立方）**

倒格子是一个立方体，坐标轴沿 $b_1, b_2, b_3$ 方向。

| 点        | 位置（单位：$\frac{2\pi}{a}$） | 描述       |
| -------- | ----------------------- | -------- |
| $\Gamma$ | (0, 0, 0)               | 原点，最高对称  |
| X        | (1, 0, 0)               | 面心中心方向   |
| M        | (1, 1, 0)               | 边的中点     |
| R        | (1, 1, 1)               | 角落，对角线尽头 |

**路径**：

* $\Gamma \rightarrow X$：沿晶格轴向；
* $\Gamma \rightarrow M$：沿面对角线；
* $\Gamma \rightarrow R$：沿立方体对角线。

**BCC（体心立方晶格）**

倒格子为 **截断八面体**（也称立方体加八面体截断），具有更高的体心对称性。

| 点        | 描述           | 位置（单位：$\frac{2\pi}{a}$） |
| -------- | ------------ | ----------------------- |
| $\Gamma$ | 原点           | (0, 0, 0)               |
| N        | 面中心          | (1, 0, 0)               |
| H        | 棱中心（边缘）      | (1, 1, 0)               |
| P        | 体对角线端点（八面体尖） | (1, 1, 1)               |

**路径**：

* $\Gamma \rightarrow N \rightarrow P \rightarrow H$ 是常用对称路径。

特点：

* 因为实空间是体心立方，倒空间就变成面心立方（FCC）；
* 所以其 Brillouin 区是 FCC 的 Wigner-Seitz 单元。

FCC（面心立方晶格）

倒格子为 **立方体的切角体**，形状是“截断八面体”。

| 点        | 描述      | 位置（单位：$\frac{2\pi}{a}$） |
| -------- | ------- | ----------------------- |
| $\Gamma$ | 原点      | (0, 0, 0)               |
| X        | 面心中心方向  | (0, 1, 1)               |
| W        | 边的中心    | (1, 0.5, 0)             |
| K        | 三边交点    | (1.5, 0, 0)             |
| L        | 体对角终点   | (0.5, 0.5, 0.5)         |
| U        | 面上对角线中点 | (0.5, 1, 0)             |

**常用路径**：

* $\Gamma \rightarrow X \rightarrow W \rightarrow K \rightarrow \Gamma \rightarrow L \rightarrow U$；
* 特别用于绘制 FCC 结构（如金属铜、铝）的能带。

为什么这些点很重要？

1. **能带图通常只在这些对称点之间绘制路径**；

   * 因为这可以完整地刻画整个能带结构中的非平凡行为；
   * 对称点之间路径上容易出现能隙、简并、线性色散（如 Dirac 或 Weyl 点）；

2. **简化计算与展示**：

   * 用高对称路径作为“代表”，避免绘制整个 3D 空间中的 E(k)。

3. **所有能带图的 x 轴都是这些路径拼接而成的**，例如：

   ```
   Band Structure:   Γ → X → M → Γ → R
                     ↑    ↑    ↑    ↑
                    原点  面中心 边角  顶角
   ```

总结表

| 符号       | 对应位置       | 通常在哪种晶格出现  |
| -------- | ---------- | ---------- |
| $\Gamma$ | 原点，(0,0,0) | 所有         |
| X        | 面心中心方向     | Cubic, FCC |
| M        | 边中点        | Cubic      |
| R        | 空间对角点      | Cubic      |
| N        | 面中心        | BCC        |
| H        | 边缘点        | BCC        |
| P        | 体对角线顶端     | BCC        |
| L        | 对角中点       | FCC        |
| W        | 面边中点       | FCC        |
| K        | 边交点        | FCC        |
| U        | 面对角中点      | FCC        |

---
---

## 2.3 能带结构

### 2.3.1 Bloch's Theorem

我们考虑一个电子在一个具有布拉菲格子周期性的势场中运动：

$$
V(\mathbf{x} + \mathbf{r}) = V(\mathbf{x}) \quad \text{for all } \mathbf{r} \in \Lambda
$$

也就是说，势能在晶格平移下保持不变（即具有周期性）。

布洛赫定理告诉我们：

$$
\psi_{\vec{k}}(\vec{x}) = e^{i\vec{k}\cdot \vec{x}} u_{\vec{k}}(\vec{x})
$$

其中：

* $\psi_{\vec{k}}$：是薛定谔方程的本征态（即电子的波函数）；
* $u_{\vec{k}}(\vec{x})$：具有与晶格相同的周期性，即 $u_{\vec{k}}(\vec{x} + \vec{r}) = u_{\vec{k}}(\vec{x})$。

直观解释：

> 电子的波函数可以分解为一个**平面波因子**（自由粒子）乘以一个**周期性因子**（受到晶格调制）。

**为什么波函数可以这么写？**

我们来简单走一遍“群论 + 平移不变性”的思想证明。

因为势能 $V(\vec{x})$ 满足平移对称性，整个哈密顿量 $H$ 就和所有平移算符 $T_{\vec{r}}$ 对易：

$$
[H, T_{\vec{r}}] = 0
$$

这意味着：**能量本征态也是平移算符的本征态**。

平移算符组成阿贝尔群（即交换群），所有的晶格平移算符 $T_{\vec{r}}$ 构成一个群，满足：

$$
T_{\vec{r}} T_{\vec{r}'} = T_{\vec{r} + \vec{r}'}
$$

且它们是酉的（保持内积），本征值应是**纯相因子**。

我们设：

$$
T_{\vec{a}_i} \psi(\vec{x}) = \psi(\vec{x} + \vec{a}_i) = e^{i \theta_i} \psi(\vec{x})
$$

这是平移本征条件。对任意晶格矢量 $\vec{r} = \sum_i n_i \vec{a}_i$，推广可得：

$$
T_{\vec{r}} \psi(\vec{x}) = \psi(\vec{x} + \vec{r}) = e^{i \vec{k} \cdot \vec{r}} \psi(\vec{x})
$$

其中：

* $\vec{k} \cdot \vec{a}_i = \theta_i$
* 这就引入了波矢 $\vec{k}$，成为一个标签！

这时候，我们就可以定义一个函数：

$$
\psi_{\vec{k}}(\vec{x}) = e^{i\vec{k} \cdot \vec{x}} u_{\vec{k}}(\vec{x})
$$

代入后可验证 $u_{\vec{k}}(\vec{x} + \vec{r}) = u_{\vec{k}}(\vec{x})$，即具有晶格周期性。

这就是 Bloch’s Theorem！

**Crystal Momentum 晶体动量**

它是啥？

> 在周期性系统中，$\vec{k}$ 被称为“晶体动量”或“准动量（quasi-momentum）”。

但注意：

* 它**不是**动量算符 $\vec{p} = -i\hbar \nabla$ 的本征值；
* 除非 $u_{\vec{k}}(\vec{x})$ 是常数（即自由粒子），否则 $\psi$ 不是 $\vec{p}$ 的本征态；
* 然而，晶体动量仍然具有“动量”的很多特征，比如：

  * 是能带的标签；
  * 在散射中守恒（模倒格矢）；
  * 决定电子的速度 $\vec{v} = \frac{1}{\hbar} \nabla_{\vec{k}} E(\vec{k})$。

为什么晶体动量定义存在“模糊性”？

如果 $\vec{q} \in \Lambda^*$ 是倒格矢，我们可以构造：

$$
\psi_{\vec{k}'}(\vec{x}) = \psi_{\vec{k} + \vec{q}}(\vec{x}) = e^{i (\vec{k} + \vec{q}) \cdot \vec{x}} u_{\vec{k} + \vec{q}}(\vec{x})
$$

使用周期函数代换，可得：

$$
\psi_{\vec{k} + \vec{q}}(\vec{x}) = e^{i \vec{k} \cdot \vec{x}} \underbrace{e^{i \vec{q} \cdot \vec{x}} u_{\vec{k} + \vec{q}}(\vec{x})}_{\tilde{u}_{\vec{k}}(\vec{x})}
$$

注意到：

* $\tilde{u}_{\vec{k}}(\vec{x})$ 也具有晶格周期性；
* 所以这其实还是 $\psi_{\vec{k}}$ 的一种等价写法。

结论：**$\vec{k}$ 与 $\vec{k} + \vec{G}$ 是等价的晶体动量**（模倒格矢守恒）。

**Reduced Zone Scheme vs Extended Zone Scheme**

Reduced Zone Scheme（缩减区方案）

> 把所有 $\vec{k}$ 都“压缩”到第一布里渊区中。

* 每个 $\vec{k}$ 都限定在第一 Brillouin Zone；
* 每个 $\vec{k}$ 对应多个能带（标记为 $\psi_{\vec{k}, n}$）；
* 这样可以清楚看出不同能带之间的劈裂与开隙。

**常用于理论分析与能带图绘制。**

Extended Zone Scheme（扩展区方案）

> 所有能带都画在 $\vec{k} \in \mathbb{R}^d$ 中，无限延展。

* 每个能带在不同的布里渊区中出现；
* 可以显示色散关系的完整周期结构；
* 在某些实验中（如 ARPES）很有用。

**常用于实验解释和周期结构直观呈现。**

---

### 2.3.2 三维中的近自由电子模型

我们考虑电子在三维空间 $\mathbb{R}^3$ 中，在一个具有布拉菲格子周期性的**微弱周期性势能 $V(\vec{x})$** 中运动：

$$
V(\vec{x} + \vec{r}) = V(\vec{x}) \quad \text{for all } \vec{r} \in \Lambda
$$

这跟我们之前的 1D 模型类似，现在推广到 3D。

**零阶近似：自由电子**

我们先从自由电子出发：

$$
\langle \vec{x} | \vec{k} \rangle \sim e^{i \vec{k} \cdot \vec{x}}, \quad E_0(\vec{k}) = \frac{\hbar^2 k^2}{2m}
$$

这个波函数在没有势能的情况下是自由解。

**微扰处理：周期势的影响**

我们将势能 $V(\vec{x})$ 视为**微扰项**，计算：

$$
\langle \vec{k} | V(\vec{x}) | \vec{k}' \rangle = \frac{1}{\text{Vol}} \int d^3x \, e^{i(\vec{k}' - \vec{k}) \cdot \vec{x}} V(\vec{x})
$$

这就是**势能的傅里叶变换**。

利用周期函数的傅里叶展开（只在倒格矢 $\vec{q} \in \Lambda^*$ 上有非零分量）：

$$
V(\vec{x}) = \sum_{\vec{q} \in \Lambda^*} e^{i \vec{q} \cdot \vec{x}} V_{\vec{q}}
$$

所以只有当 $\vec{k} - \vec{k}' = \vec{q} \in \Lambda^*$ 时矩阵元才不为零。**晶体只能吸收/发射倒格矢的动量**。

> 所以：自由电子状态 $|\vec{k} \rangle$ 只能散射到 $|\vec{k} - \vec{q} \rangle$，其中 $\vec{q} \in \Lambda^*$。

**Bloch定理的另一种视角**

从上述散射结构，可以写：

$$
\psi_{\vec{k}}(\vec{x}) = \sum_{\vec{q} \in \Lambda^*} c_{\vec{k} - \vec{q}} e^{i (\vec{k} - \vec{q}) \cdot \vec{x}} = e^{i \vec{k} \cdot \vec{x}} \underbrace{\sum_{\vec{q}} c_{\vec{k} - \vec{q}} e^{-i \vec{q} \cdot \vec{x}}}_{u_{\vec{k}}(\vec{x})}
$$

因此自然得到 Bloch 形式：

$$
\psi_{\vec{k}}(\vec{x}) = e^{i \vec{k} \cdot \vec{x}} u_{\vec{k}}(\vec{x}), \quad u_{\vec{k}}(\vec{x} + \vec{r}) = u_{\vec{k}}(\vec{x})
$$

这给出了一个非常物理的直观：**Bloch 函数 = 所有“被晶格散射出来”的平面波的叠加**。

**能带结构与简并劈裂**

总体思想：

* 晶体势打破了自由电子的简并能谱，导致能带结构的形成；
* 波矢 $\vec{k}$ 是准动量，$E_n(\vec{k})$ 是对应能级；
* **能带结构 = Bloch 解的能谱结构**。

情况 1：**布里渊区内部的非简并点**

* 自由电子能量彼此差距大；
* 用**非简并微扰理论**计算能量修正即可。

情况 2：**Brillouin 边界附近的简并点**

当存在 $\vec{k}' = \vec{k} + \vec{q}$ 满足：

$$
E_0(\vec{k}) = E_0(\vec{k} + \vec{q}) \quad \text{with } \vec{q} \in \Lambda^*
$$

说明：

* 电子能量发生了简并；
* 必须使用**简并微扰理论**；
* 势能耦合这些态，导致**能隙（band gap）打开**。

条件推导（布里渊边界上的点）：

$$
k^2 = (\vec{k} + \vec{q})^2 \Rightarrow 2\vec{k} \cdot \vec{q} + q^2 = 0 \Rightarrow \vec{k} = -\frac{1}{2} \vec{q} + \vec{k}_\perp
$$

当 $\vec{k}$ 与某个倒格矢正交时，满足这一条件 ⇒ 就在布里渊区边界上。

图像解释：Figure 31

这是一张**二维方格晶格**中的能量等高线图。

* 原来自由电子是圆形等高线；
* 加上晶格势后，在布里渊区边界附近**产生劈裂和能隙**，变形明显。

**自由电子 vs 实际能带（Figure 32）**

图中左侧是：

* BCC 与 FCC 晶格的自由电子能带；
* 纵轴是能量，横轴是晶体动量沿高对称路径；

图中右侧是：

* 硅的真实能带结构；
* 能看到清晰的 **能隙**（band gap）在 $\Gamma \rightarrow X$ 方向开出，值约为 1.1 eV；
* 表明硅是一个**间接带隙半导体**。

**布里渊区中的状态数**

我们想问的问题：

**“一个有限晶体中，布里渊区中有多少个准动量状态？”**

设定：有限晶格体积 $V = N_1 N_2 N_3 \cdot |\text{unit cell volume}|$

我们把晶格限制在一个有限区域（周期性边界）：

$$
\psi(\vec{x} + N_i \vec{a}_i) = \psi(\vec{x}) \quad (i = 1,2,3)
$$

对应到动量空间，需要：

$$
e^{i N_i \vec{k} \cdot \vec{a}_i} = 1 \quad \Rightarrow \quad \vec{k} = \sum_i \frac{m_i}{N_i} \vec{b}_i
$$

这叫**Born-von Karman 边界条件**。

结果：

* 每个 $\vec{k}$ 状态由一组整数 $m_i$ 指定；
* 总共有 $N = N_1 N_2 N_3$ 个合法的 $\vec{k}$ 点；
* 每个状态占据的 $k$-空间体积为：

$$
\frac{V^*}{N}
$$

其中 $V^*$ 是第一布里渊区体积。

物理意义：

> “空间中有 $N$ 个晶格点，动量空间中就有 $N$ 个状态。”

你可以把这理解为“波矢也被量子化了”，动量空间被晶体周期“切片”成有限点。

**总结**

| 模块          | 重点                                                                    |
| ----------- | --------------------------------------------------------------------- |
| 自由电子出发      | $\psi_{\vec{k}} = e^{i \vec{k} \cdot \vec{x}}$，能量为 $\hbar^2 k^2 / 2m$ |
| 晶体势微扰       | 只耦合差一个倒格矢的态 ⇒ $\vec{k} - \vec{k}' = \vec{q} \in \Lambda^*$            |
| Bloch 函数的重构 | 所有被晶体“散射”的平面波叠加，仍满足 Bloch 形式                                          |
| 能带结构        | 势能打破简并，在 Brillouin 边界开出能隙                                             |
| 状态数         | 布里渊区中状态数 = 晶格点数，k 空间也被离散化                                             |

---

### 2.3.3 Wannier Functions

> 简单说：Wannier 函数是**布洛赫波函数的局域化版本**，是在晶格中局部化的一组完备正交基底。

根据 Bloch 定理，能量本征态写作：

$$
\psi_{\vec{k}}(\vec{x}) = e^{i \vec{k} \cdot \vec{x}} u_{\vec{k}}(\vec{x})
$$

* $\vec{k}$：准动量（处于第一布里渊区）
* $u_{\vec{k}}(\vec{x})$：晶格周期性函数
* **Bloch 波函数是遍布整个晶体的离域态**，在整个晶体上“荡漾”。

但是：在很多物理问题中，我们希望有一个**空间局域化的基底**（例如讨论局部电荷密度、构造 tight-binding 模型、处理杂质等等）。

我们定义 Wannier 函数如下：

$$
w_{\vec{r}}(\vec{x}) = \frac{1}{\sqrt{N}} \sum_{\vec{k}} e^{-i \vec{k} \cdot \vec{r}} \psi_{\vec{k}}(\vec{x}) \tag{2.32}
$$

含义解释：

* 这是对所有 Bloch 态 $\psi_{\vec{k}}$ 做“倒空间傅里叶变换”；
* 得到的 $w_{\vec{r}}(\vec{x})$ 是一个**空间局域化波函数**，以格点 $\vec{r} \in \Lambda$ 为中心；
* 可以理解为把“动量标签的本征态”换成了“空间位置标签的本征态”。

> 你可以把 $w_{\vec{r}}$ 看成**localized orbital at site $\vec{r}$**，例如一个 tight-binding 模型里的原子轨道。

**平移性**

文中指出：

> $w_{\vec{r} + \vec{r}'}(\vec{x} + \vec{r}') = w_{\vec{r}}(\vec{x})$

这意味着：

$$
w_{\vec{r}}(\vec{x}) = w(\vec{x} - \vec{r})
$$

也就是说：**所有 Wannier 函数都只是一个母函数 $w(\vec{x})$ 的平移版本。**

反过来我们也可以写：

$$
\psi_{\vec{k}}(\vec{x}) = \frac{1}{\sqrt{N}} \sum_{\vec{r} \in \Lambda} e^{i \vec{k} \cdot \vec{r}} w(\vec{x} - \vec{r}) \tag{2.33}
$$

这说明：

* Bloch 波函数其实是**所有 Wannier 函数的叠加**；
* 每个 Wannier 函数 $w(\vec{x} - \vec{r})$ 都集中在某个格点 $\vec{r}$，乘以相因子后叠加成平面波。

**正交性**

我们要证明：

$$
\int d^3x\, w^*(\vec{x} - \vec{r}') w(\vec{x} - \vec{r}) = \delta_{\vec{r}, \vec{r}'}
$$

用定义代入（从上式中代入 Bloch 展开式），展开积分：

$$
w(\vec{x} - \vec{r}) = \frac{1}{\sqrt{N}} \sum_{\vec{k}} e^{-i\vec{k} \cdot \vec{r}} \psi_{\vec{k}}(\vec{x})
$$

代入两个 Wannier 函数后：

$$
\int d^3x\, w^*(\vec{x} - \vec{r}') w(\vec{x} - \vec{r})
= \frac{1}{N} \int d^3x \sum_{\vec{k}, \vec{k}'} e^{i \vec{k}' \cdot \vec{r}'} e^{-i \vec{k} \cdot \vec{r}} \psi^*_{\vec{k}'}(\vec{x}) \psi_{\vec{k}}(\vec{x})
$$

利用 Bloch 函数正交性

$$
\int d^3x\, \psi^*_{\vec{k}'}(\vec{x}) \psi_{\vec{k}}(\vec{x}) = \delta_{\vec{k}, \vec{k}'}
$$

所以只保留 $\vec{k} = \vec{k}'$ 的项：

$$
= \frac{1}{N} \sum_{\vec{k}} e^{i \vec{k} \cdot (\vec{r}' - \vec{r})}
= \frac{1}{N} \sum_{\vec{k}} e^{i \vec{k} \cdot (\vec{r}' - \vec{r})} = \delta_{\vec{r}, \vec{r}'}
$$

这是倒空间傅里叶变换的基本恒等式，正交性成立！

**非唯一性**

文中强调：

> Wannier 函数不是唯一的！你可以随意改 Bloch 函数的相位：

$$
\psi_{\vec{k}}(\vec{x}) \rightarrow e^{i\chi(\vec{k})} \psi_{\vec{k}}(\vec{x})
$$

这并不会改变物理能量（因为哈密顿量不变），但会改变：

* Wannier 函数的形状；
* 其在晶格中“局域化”的程度；
* 对称性。

---

以下是一个很好的理解：

> 考虑无边界的自由空间，那么任意的波函数可以用平面波展开或者用Delta函数展开。平面波或者Delta函数有一些性质，比如正交性。在晶格中，周期势的存在使得平面波变成Bloch波，而Delta函数则对应为Wannier函数。Delta函数可以认为是严格局域在一点的函数，Wannier函数则是大概局域在一个格点周围的函数。性质方面，Wannier函数可以由Bloch函数叠加得到，而且是正交的。

---

### 2.3.4 三维中的紧束缚模型

**Tight-binding 模型**是假设：

> 电子平时被“紧紧束缚”在原子核附近，但可以以某个概率跳到周围的格点去。

* 类比成“井里电子”：每个格点是一个井；
* 电子处于某一格点 $\vec{r}$ 的状态表示为 $|\vec{r} \rangle$；
* 所有 $\vec{r} \in \Lambda$ 组成的格点状态组成了整个希尔伯特空间的基底。

先写出 tight-binding 模型最通用的哈密顿量形式：

$$
H = \sum_{\vec{r}} E_0 |\vec{r} \rangle \langle \vec{r}| - \sum_{\langle \vec{r} \vec{r}' \rangle} t_{\vec{r} - \vec{r}'} \left( |\vec{r} \rangle \langle \vec{r}'| + |\vec{r}' \rangle \langle \vec{r}| \right)
$$

* 第一项是**在原位**（格点 $\vec{r}$）的能量 $E_0$
* 第二项表示电子**从一个格点跳到相邻格点**的过程（称为 hopping）

符号 $\langle \vec{r} \vec{r}' \rangle$ 表示只考虑“最近邻”跳跃。

用向量 $\vec{a}$ 表示方向：

$$
H = \sum_{\vec{r}} \left[ E_0 |\vec{r}\rangle \langle \vec{r}| - \sum_{\vec{a}} t_{\vec{a}} |\vec{r}\rangle \langle \vec{r} + \vec{a}| \right] \tag{2.34}
$$

* $\vec{a}$ 是最近邻格点的位移向量（例如 $(a,0,0), (0,\pm a,0)$ 等）；
* $t_{\vec{a}}$：从 $\vec{r}$ 跳到 $\vec{r} + \vec{a}$ 的 hopping strength。

我们设定如下的波函数：

$$
|\psi(\vec{k})\rangle = \frac{1}{\sqrt{N}} \sum_{\vec{r}} e^{i \vec{k} \cdot \vec{r}} |\vec{r}\rangle \tag{2.35}
$$

这就是一个**Bloch 形式的波函数**：每个格点上的波函数都有一个 $e^{i\vec{k}\cdot\vec{r}}$ 的相因子。

这是 tight-binding 模型的标准解法路径：**Ansatz** 为 Bloch 波结构，然后带入 $H$ 计算本征值。

将 (2.35) 代入 Hamiltonian 可得：

$$
E(\vec{k}) = E_0 - \frac{1}{2} \sum_{\vec{a}} \left( t_{\vec{a}} + t_{-\vec{a}} \right) e^{i \vec{k} \cdot \vec{a}} = E_0 - \sum_{\vec{a}} t_{\vec{a}} \cos(\vec{k} \cdot \vec{a}) \tag{2.36}
$$

* 如果 $t_{\vec{a}} = t_{-\vec{a}}$，那上面变成余弦形式；
* 正是 Bloch 解中常见的能量依赖形式（cosine dispersion）；
* 这是 tight-binding 最经典的能带结构。

> 你现在可以看到，Bloch 波 $\psi_k$ 是能量本征态，色散关系由跳跃强度决定！

**举例：立方晶格（cubic lattice）**

设定：

* 最近邻格点偏移向量为：

  $$
  \vec{a} \in \left\{ (\pm a, 0, 0), (0, \pm a, 0), (0, 0, \pm a) \right\}
  $$
* 所有方向跳跃强度相同：$t_{\vec{a}} = t$

代入色散关系公式：

$$
E(\vec{k}) = E_0 - 2t\left[ \cos(k_x a) + \cos(k_y a) + \cos(k_z a) \right] \tag{2.37}
$$

**能带宽度、低能展开与有效质量**

带宽计算：

* 最大值：当 $\cos = -1$：$E_\text{max} = E_0 + 6t$
* 最小值：当 $\cos = +1$：$E_\text{min} = E_0 - 6t$

所以：

$$
\Delta E = E_\text{max} - E_\text{min} = 12t
$$

小 $\vec{k}$ 附近展开：

当 $\vec{k}$ 很小时，cos 可以泰勒展开为：

$$
\cos(k_x a) \approx 1 - \frac{1}{2}(k_x a)^2
$$

代入上式：

$$
E(\vec{k}) \approx \text{常数} + \frac{\hbar^2 k^2}{2m^*}, \quad m^* = \frac{\hbar^2}{2ta^2}
$$

这说明：

> 在布里渊区中心，tight-binding 色散关系 **类似自由粒子**，但带有一个**有效质量 $m^*$**。

**关于“$k_x \pm k_y = \pm \pi/a$”的能等线**

这是在 $k_z = 0$ 的平面上画等能曲线时，能量保持恒定的路径，因为：

* $$
  \cos(k_x a) + \cos(k_y a) = \text{常数}
  $$

  在这条线上成立；
* 是能带的“山谷线”或“山脊线”。

---

未完待续……