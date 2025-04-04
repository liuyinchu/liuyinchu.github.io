# 量子力学课程相关

---

## 第二次作业

### 中文翻译

**问题1**

一个一维简谐振子，其固有频率为 \(\omega\)，初态为：

\[
|\alpha\rangle = \frac{1}{\sqrt{2}} |0\rangle + \frac{e^{i\delta}}{\sqrt{2}} |1\rangle
\]

其中 \(\delta\) 是一个实数。

(a) 找到时间相关的波函数 \(\langle x' | \alpha; t\rangle\)，并在态 \(|\alpha; t\rangle\) 中计算（时间相关的）期望值 \(\langle x \rangle\) 和 \(\langle p \rangle\)，即在薛定谔绘景下进行计算。

(b) 现在在海森堡绘景下计算 \(\langle x \rangle\) 和 \(\langle p \rangle\) 并比较结果。

**问题2**

考虑一个一维的粒子，其哈密顿量为：

\[
H = \frac{p^2}{2m} + V(x)
\]

通过计算 \([ [H, x], x ]\) 来证明

\[
\sum_{a'} |\langle a'' | x | a' \rangle|^2 (E_{a'} - E_{a''}) = \frac{\hbar^2}{2m}
\]

其中 \(|a'\rangle\) 是能量本征态，其本征值为 \(E_{a'}\)。

**问题3**

一个电子在一维无限深势阱中自由运动，势阱的边界位于 \(x = 0\) 和 \(x = a\)。如果电子最初处于势阱的基态（\(n = 1\)），并且我们突然将势阱的大小扩大四倍（即，右侧边界瞬间从 \(x = a\) 移动到 \(x = 4a\)），计算电子处于以下状态的概率：

(a) 新势阱的基态；

(b) 新势阱的第一激发态。

**问题4**

质量为 \(m\) 的粒子在一维势场中运动，其势能为：

\[
V(x) = 
\begin{cases} 
0, & \text{如果 } |x| > a \\ 
-V_0, & \text{如果 } |x| < a 
\end{cases}
\]

(a) 在宽度 \(a\) 固定的情况下，势阱需要多深，才能使第一激发能级的能量 \(E_1 = -\frac{1}{2}V_0\) 存在？

(b) 如果粒子处于对应于第一激发能级的哈密顿量的本征态中，那么找到它在经典禁区中的概率是多少？

(c) 该系统有多少个束缚态？

**问题5**

考虑一个质量为 \(m\) 的粒子，受到如下势能作用：

\[
V(x) = 
\begin{cases} 
\infty, & x \leq 0 \\ 
-V_0 \delta(x - a), & x > 0 
\end{cases}
\]

其中 \(V_0 > 0\)。讨论束缚态的存在性，并以 \(a\) 的大小为依据。

**问题6**

令 \(H = \frac{p^2}{2m} + V(q)\) 为一个质量为 \(m\) 的粒子在一维空间中的哈密顿量。该粒子处于 \(H\) 的一个本征态，其位置的概率密度为

\[
\rho(x) = |\psi(x)|^2 = \frac{N^2}{(x^2 + a^2)^2}。
\]

(a) 判断该态是否唯一确定，若是，请写出其波函数 \(\psi(x)\)。

(b) 计算在该态下的 \(p\) 和 \(q\) 的平均值。

(c) 判断该态是否为最小不确定性态，即 \(\Delta p \Delta q = \hbar / 2\)。

(d) 利用薛定谔方程确定势能 \(V(x)\)。

(e) 判断 \(H\) 是否存在属于离散本征值的奇本征态。

### 相关资料

#### 函数极小值分析

要分析函数 \( f(x) = x + \frac{x}{\tanh(a x)} \) 在 \( x > 0 \) 是否有极小值，首先需要计算其导数并分析其单调性。

**步骤1：计算导数**

将函数写为：
\[ f(x) = x + \frac{x}{\tanh(a x)} = x + x \coth(a x) \]

因此，导数为：
\[ f'(x) = 1 + \coth(a x) - a x \, \text{csch}^2(a x) \]

其中，\(\coth(a x) = \frac{\cosh(a x)}{\sinh(a x)}\)，\(\text{csch}(a x) = \frac{1}{\sinh(a x)}\)。

**步骤2：求解 \( f'(x) = 0 \)**

设 \( f'(x) = 0 \)，得到：
\[ 1 + \coth(a x) = a x \, \text{csch}^2(a x) \]

通过代数变换，得到：
\[ \sinh^2(a x) + \sinh(a x) \cosh(a x) = a x \]

利用双曲函数恒等式，可以将左侧化简为：
\[ \frac{1}{2} (e^{2 a x} - 1) = a x \]

进一步简化为：
\[ e^{2 a x} = 1 + 2 a x \]

**步骤3：分析方程 \( e^{2 a x} = 1 + 2 a x \) 的解**

对于 \( x > 0 \)，指数函数 \( e^{2 a x} \) 增长速度快于线性函数 \( 1 + 2 a x \)。因此，在 \( x > 0 \) 的范围内，方程没有实数解。这意味着导数 \( f'(x) > 0 \) 对于所有 \( x > 0 \) 成立。

**步骤4：结论**

由于 \( f'(x) > 0 \) 对于所有 \( x > 0 \)，函数 \( f(x) \) 在该区间上是严格增的，没有极小值。

**回答：**

没有；因为在 x＞0 上函数的导数始终大于零，所以它没有极小值。

要找到函数 \( f(x) = x + \dfrac{x}{\tanh(a x)} \) 在 \( x > 0 \) 上的最小值，我们需要计算当 \( x \) 趋近于 \( 0^+ \) 时的极限。

**步骤1：计算函数在 \( x \to 0^+ \) 时的极限**

首先，考虑当 \( x \to 0^+ \) 时，双曲正切函数的近似：

\[
\tanh(a x) \approx a x - \dfrac{(a x)^3}{3} + \dfrac{2(a x)^5}{15} - \cdots
\]

但在 \( x \to 0^+ \) 的极限下，主要项是 \( \tanh(a x) \approx a x \)。

因此，

\[
\frac{x}{\tanh(a x)} \approx \frac{x}{a x} = \frac{1}{a}
\]

**步骤2：计算函数的近似值**

将近似值代入函数 \( f(x) \)：

\[
f(x) = x + \frac{x}{\tanh(a x)} \approx x + \frac{1}{a}
\]

当 \( x \to 0^+ \) 时，\( x \) 很小，可以忽略不计，因此：

\[
\lim_{x \to 0^+} f(x) = \frac{1}{a}
\]

**步骤3：结论**

由于函数 \( f(x) \) 在 \( x > 0 \) 上是严格递增的，并且当 \( x \to 0^+ \) 时趋近于 \( \dfrac{1}{a} \)，因此函数在 \( x > 0 \) 上的最小值为 \( \dfrac{1}{a} \)。

**回答：**

函数在 \( x > 0 \) 上的最小值是 \( \dfrac{1}{a} \)。

#### 无限势壁对 δ 函数势阱的影响

**背景：**

在量子力学中，对于一个自由空间中的 δ 函数势阱 \( V(x) = -V_0 \delta(x) \)，无论 \( V_0 \) 多小，它总是存在一个束缚态。这是因为 δ 函数势虽然范围无限小，但其深度足以在局部区域内束缚粒子。

然而，在我们讨论的系统中，势能包含一个位于 \( x = 0 \) 的无限高势壁和一个位于 \( x = a \) 的 δ 函数势阱：

\[
V(x) =
\begin{cases}
\infty, & x \leq 0 \\
 -V_0 \delta(x - a), & x > 0
\end{cases}
\]

粒子被限制在 \( x > 0 \) 的区域内。

**问题：**

为什么在这个系统中，束缚态的存在性依赖于 \( a \) 的大小？当 δ 函数势阱离 \( x = 0 \) 处的无限高势壁太近时，为什么会导致束缚态消失？其背后的物理图像和机制是什么？

**回答：**

在这个系统中，束缚态的存在性依赖于 δ 函数势阱与无限高势壁之间的距离 \( a \)，其背后的物理机制与量子力学中波函数的空间分布和匹配条件有关。

**1. 波函数的空间限制：**

无限高势壁位于 \( x = 0 \)，这意味着粒子在 \( x \leq 0 \) 区域的波函数必须为零，即 \( \psi(0) = 0 \)。这限制了粒子的运动只能在 \( x > 0 \) 的区域内。

**2. 波函数的形式：**

在 \( 0 < x < a \) 和 \( x > a \) 的区域内，势能为零（除了 \( x = a \) 处的 δ 函数势阱），因此波函数满足自由粒子的薛定谔方程。对于能量 \( E < 0 \) 的束缚态，波函数在这两个区域分别是指数衰减的形式：

- 在 \( 0 < x < a \) 区域：
  \[ \psi_I(x) = A \sinh(\kappa x) \]
- 在 \( x > a \) 区域：
  \[ \psi_{II}(x) = C e^{-\kappa x} \]
其中 \( \kappa = \frac{\sqrt{-2mE}}{\hbar} \)。

**3. 匹配条件：**

在 \( x = a \) 处，波函数必须满足以下条件：

- **连续性条件：**
  \[ \psi_I(a) = \psi_{II}(a) \]
- **导数的不连续性条件：**
  \[ \psi_{II}'(a^+) - \psi_{I}'(a^-) = -\frac{2mV_0}{\hbar^2} \psi(a) \]

**4. 解的存在性依赖于 \( a \)：**

通过上述匹配条件，我们可以得到一个关于 \( \kappa \) 的超越方程：

\[
\kappa = \frac{mV_0}{\hbar^2} [1 - e^{-2\kappa a}]
\]

当 \( a \) 很大时，\( e^{-2\kappa a} \) 很小，近似为零，方程变为：

\[
\kappa \approx \frac{mV_0}{\hbar^2}
\]

这对应于自由空间中的 δ 函数势阱，总是存在束缚态。

但是，当 \( a \) 逐渐减小时，\( e^{-2\kappa a} \) 增大，右侧的有效势深度减小。当 \( a \) 足够小时，方程可能不再有实数正解 \( \kappa \)，意味着不存在束缚态。

**5. 物理机制：**

当 δ 函数势阱靠近无限高势壁时，粒子的可活动区域（从 \( x = 0 \) 到 \( x = a \)）变得非常狭窄。量子力学中，粒子的波函数需要在空间上延展以满足不确定性原理。狭窄的空间限制增加了粒子的动能，抵消了 δ 函数势阱提供的束缚效应。

此外，δ 函数势阱的束缚能力有限，当它离无限高势壁太近时，无法提供足够的势能来形成束缚态。无限高势壁阻止了波函数在 \( x < 0 \) 区域的延展，削弱了 δ 函数势阱对粒子的束缚能力。

**结论：**

因此，束缚态的存在性取决于 δ 函数势阱与无限高势壁之间的距离 \( a \)。当 \( a \) 太小时，粒子无法在有限的空间内满足束缚态的条件，导致束缚态消失。这体现了量子力学中势阱的束缚能力与空间维度和边界条件密切相关。

**总结：**

当 δ 函数势阱靠近无限高势壁时，有限的空间限制和波函数的边界条件导致束缚态消失。这是由于粒子需要足够的空间来满足量子力学的束缚条件，而无限高势壁的存在削弱了 δ 函数势阱的束缚能力。

当δ函数势阱靠近无限高势壁时，由于空间受限和波函数匹配条件的限制，束缚态消失；这是因为粒子需要足够的空间来形成束缚态，而无限高势壁的存在削弱了δ函数势阱的束缚能力，导致束缚态的存在性依赖于距离 \( a \)。

---

## 第三次作业（中文翻译+提示）

**问题1**

令 \(\mathbf{A}\) 和 \(\mathbf{B}\) 为常量实向量，尝试将 \(e^{i \boldsymbol{\sigma} \cdot \mathbf{A}} e^{i \boldsymbol{\sigma} \cdot \mathbf{B}}\) 表示为单位矩阵 \(\mathbf{I}\) 和泡利矩阵 \(\sigma_i \, (i = 1, 2, 3)\) 的线性叠加形式。

>Puali算子恒等式:
$$
(\boldsymbol{\sigma}\cdot\mathbf{A})(\boldsymbol{\sigma}\cdot\mathbf{B}) = \mathbf{A}\cdot\mathbf{B} + i\boldsymbol{\sigma}\cdot(\mathbf{A}\times\mathbf{B})
$$

**问题2**

证明：

\[
e^{i \lambda \mathbf{n} \cdot \boldsymbol{\sigma}} \, \boldsymbol{\sigma} \, e^{-i \lambda \mathbf{n} \cdot \boldsymbol{\sigma}} = \mathbf{n} (\mathbf{n} \cdot \boldsymbol{\sigma}) + \mathbf{n} \times \boldsymbol{\sigma} \sin 2\lambda + (\mathbf{n} \times \boldsymbol{\sigma}) \times \mathbf{n} \cos 2\lambda
\]

其中 \(\lambda\) 是一个标量常数，\(\mathbf{n}\) 是一个单位向量。

>Pauli算子性质：
$$
e^{i \lambda \mathbf{n} \cdot \boldsymbol{\sigma}} = \cos \lambda \, I + i \sin \lambda \, (\mathbf{n} \cdot \boldsymbol{\sigma}),
$$ $$
[\mathbf{A} \cdot \boldsymbol{\sigma}, \boldsymbol{\sigma}] = -2 i \mathbf{A} \times \boldsymbol{\sigma},
$$ $$
(\mathbf{n} \cdot \boldsymbol{\sigma})^2 = (\mathbf{n} \cdot \mathbf{n}) I = I,
$$ $$
\boldsymbol{\sigma}(\boldsymbol{\sigma}\cdot\mathbf{A}) - \mathbf{A} = \mathbf{A} - (\boldsymbol{\sigma}\cdot\mathbf{A}) = i\mathbf{A}\times\boldsymbol{\sigma}.
$$

**问题3**

考虑一个自旋为 \(\frac{1}{2}\) 的粒子。我们用 \(|\pm\rangle\) 表示 \(\sigma_z\) 的本征态：\(\sigma_z |\pm\rangle = \pm |\pm\rangle\)，并用 \(|\pm \hat{n}\rangle\) 表示 \(\sigma_n \equiv \boldsymbol{\sigma} \cdot \hat{n}\) 的本征态：\(\sigma_n |\pm \hat{n}\rangle = \pm |\pm \hat{n}\rangle\)。对于自旋态，一个绕轴 \(\hat{q}\) 逆时针旋转角度 \(\phi\) 的算符为：

\[
U(\hat{q}, \phi) = e^{-i \phi \frac{\boldsymbol{\sigma} \cdot \hat{q}}{2}} = \cos(\phi/2) - i \boldsymbol{\sigma} \cdot \hat{q} \sin(\phi/2)。
\]

(a) 在特殊情况下，令 \(\hat{q}\) 平行于 \(z\) 轴，计算：

\[
\sigma_i' = U(\hat{z}, \phi) \sigma_i U^{-1}(\hat{z}, \phi), \quad i = 1, 2, 3。
\]

如果 \(|s\rangle\) 是任意自旋态，求 \(U(\hat{q}, 2\pi)|s\rangle\)。

(b) 已知 \(|+\hat{n}\rangle\)、\(|+\hat{m}\rangle\) 并且 \(\hat{q}\) 垂直于 \(\hat{n}\) 和 \(\hat{m}\)，确定 \(\phi\) 使得 \(U(\hat{q}, \phi)|+\hat{n}\rangle = |+\hat{m}\rangle\)。计算内积 \(\langle +\hat{n}|+\hat{m}\rangle\)，特别是在 \(\hat{n} \perp \hat{m}\) 的情况下。

(c) 将 \(|+\hat{n}\rangle\) 表示为 \(\sigma_z\) 的本征态的线性叠加。

>Tips: It is helpful to think in physical terms of geometric rotations.

**问题4** 纠缠态的生成（A. Harrow）

一对自旋为 \(\frac{1}{2}\) 的粒子通过以下哈密顿量相互作用：

\[
\hat{H} = \hbar \omega \sigma_3 \otimes \sigma_3,
\]

其中 \(\omega\) 是具有频率单位的标量。像往常一样，\(|\pm\rangle \equiv |z;\pm\rangle\)，\(|x;\pm\rangle \equiv \frac{1}{\sqrt{2}}(|+\rangle \pm |-\rangle)\)。对于两粒子态，将 \(Z\)-基定义为：\(|1\rangle = |+\,+\rangle\)，\(|2\rangle = |+\,-\rangle\)，\(|3\rangle = |-\,+\rangle\)，\(|4\rangle = |-\, -\rangle\)，其中 \(|+\,+\rangle \equiv |+\rangle \otimes |+\rangle\) 等。

(a) 写出哈密顿量 \(\hat{H}\) 和矩阵 \(e^{-i\hat{H}t/\hbar}\) 在 \(Z\)-基中的表示。

(b) 计算态 \(e^{-i\hat{H}t/\hbar}|x;+\rangle \otimes |x;+\rangle\) 在 \(Z\)-基中的表达式。对于哪些 \(t\) 值，该状态不是纠缠态？

>纠缠态：其关键特征是系统的量子态无法写成各粒子单独态的张量积形式。例：$
|\psi\rangle = \frac{1}{\sqrt{2}} (|00\rangle + |11\rangle)$。

>张量积：
$$
(A^{(1)}\ket{\varphi^{(1)}})\otimes(B^{(2)}\ket{\psi^{(2)}}) = (A^{(1)}\otimes B^{(2)})(\ket{\varphi^{(1)}}\otimes\ket{\psi^{(2)}})
$$

>纠缠度:
$$ 
C = |detA| = |A_{11}A_{22}-A_{12}A_{21}|,
$$ 当且仅当$C=0$时为非纠缠态。

**问题5**

对于一个包含两个不相同的自旋 \(\frac{1}{2}\) 粒子的系统，其哈密顿量为：

\[
\hat{H} = \frac{\epsilon_0}{\hbar^2} \left( \hat{\mathbf{S}}_1^2 + \hat{\mathbf{S}}_2^2 \right) - \frac{\epsilon_0}{\hbar} \left( \hat{S}_{1z} + \hat{S}_{2z} \right),
\]

其中 \(\epsilon_0\) 是具有能量维度的常数。

求该系统的能级及其简并度。

>Tips: Shouldn't be difficult.

---

## 第二次小测

**问题1**

证明以下等式：

(a) \(\hat{\mathbf{p}} \times \hat{\mathbf{L}} + \hat{\mathbf{L}} \times \hat{\mathbf{p}} = 2i\hbar \hat{\mathbf{p}}\)

(b) \(\hat{\mathbf{p}} \times \hat{\mathbf{L}} - \hat{\mathbf{L}} \times \hat{\mathbf{p}} = \frac{i}{\hbar} [\hat{\mathbf{p}}, \hat{\mathbf{L}}^2]\)
>It's just a math problem, skip it.

**问题2**

假设两个自旋-\(\frac{1}{2}\) 的粒子处于**单态**配置：

\[
|00\rangle = \frac{1}{\sqrt{2}} \left( |+\rangle_1 |-\rangle_2 - |-\rangle_1 |+\rangle_2 \right)=\frac{1}{\sqrt{2}}(\ket{\uparrow\downarrow}-\ket{\downarrow\uparrow})
\]

令 \(S_a^{(1)}\) 表示粒子1沿由向量 \(\mathbf{a}\) 定义的方向的自旋角动量分量。类似地，令 \(S_b^{(2)}\) 表示粒子2沿由向量 \(\mathbf{b}\) 定义的方向的自旋角动量分量。证明：

\[
\left\langle S_a^{(1)} S_b^{(2)} \right\rangle = -\frac{\hbar^2}{4} \cos\theta,
\]

其中 \(\theta\) 是向量 \(\mathbf{a}\) 和 \(\mathbf{b}\) 之间的夹角。
>对于自旋-½粒子，沿单位向量 \(\mathbf{n}\) 的自旋算符为：
\[
S_n = \frac{\hbar}{2} \mathbf{n} \cdot \boldsymbol{\sigma},
\]
>
>其中 \(\boldsymbol{\sigma} = (\sigma_x, \sigma_y, \sigma_z)\) 为泡利矩阵。
>因此：
\[
\left\langle S_a^{(1)} S_b^{(2)} \right\rangle = \left( \frac{\hbar}{2} \right)^2 \left\langle 00 \left| \left( \mathbf{a} \cdot \boldsymbol{\sigma}^{(1)} \right) \left( \mathbf{b} \cdot \boldsymbol{\sigma}^{(2)} \right) \right| 00 \right\rangle.
\]
>
>在单态 \(|00\rangle\) 中，\(\boldsymbol{\sigma}^{(1)}\) 和 \(\boldsymbol{\sigma}^{(2)}\) 的乘积的期望值为：
\[
\left\langle 00 \left| \sigma_i^{(1)} \sigma_j^{(2)} \right| 00 \right\rangle = -\delta_{ij}.
\]
>
>所以：
\[
\left\langle S_a^{(1)} S_b^{(2)} \right\rangle = -\left( \frac{\hbar}{2} \right)^2 \sum_{i} a_i b_i = -\frac{\hbar^2}{4} \mathbf{a} \cdot \mathbf{b}.
\]
对于单位向量，因为 \(\mathbf{a} \cdot \mathbf{b} = \cos\theta\)，所以：
\[
\left\langle S_a^{(1)} S_b^{(2)} \right\rangle = -\frac{\hbar^2}{4} \cos\theta.
\]
>
>得证！
>
>然而，上述证明中利用了**单态**（考考你呀：单态是什么？）的一个重要性质，以下给出详细证明：
>
>要证明：
\[
\left\langle 00 \left| \sigma_i^{(1)} \sigma_j^{(2)} \right| 00 \right\rangle = -\delta_{ij},
\]
>
>其中 \(|00\rangle\) 是两个自旋-\(\frac{1}{2}\) 粒子的单态，\(\sigma_i^{(1)}\) 和 \(\sigma_j^{(2)}\) 是分别作用在粒子1和粒子2上的泡利矩阵。
>
>注意到：
\[
|00\rangle = \frac{1}{\sqrt{2}} \left( |+\rangle_1 |-\rangle_2 - |-\rangle_1 |+\rangle_2 \right),
\]
>以及，泡利矩阵 \(\sigma_i\) 的作用为：
>- **\(\sigma_x\)：**
  \[
  \sigma_x |+\rangle = |-\rangle, \quad \sigma_x |-\rangle = |+\rangle.
  \]
>- **\(\sigma_y\)：**
  \[
  \sigma_y |+\rangle = i|-\rangle, \quad \sigma_y |-\rangle = -i|+\rangle.
  \]
>- **\(\sigma_z\)：**
  \[
  \sigma_z |+\rangle = |+\rangle, \quad \sigma_z |-\rangle = -|-\rangle.
  \]
>
>我们需要计算：
\[
\left\langle 00 \left| \sigma_i^{(1)} \sigma_j^{(2)} \right| 00 \right\rangle = \frac{1}{2} \left( \langle +|_1 \langle -|_2 - \langle -|_1 \langle +|_2 \right) \sigma_i^{(1)} \sigma_j^{(2)} \left( |+\rangle_1 |-\rangle_2 - |-\rangle_1 |+\rangle_2 \right).
\]
>
>展开后有四个项，需要逐一计算：
\[
\left\langle 00 \left| \sigma_i^{(1)} \sigma_j^{(2)} \right| 00 \right\rangle = \frac{1}{2} \left( T_1 - T_2 - T_3 + T_4 \right),
\]
>
>其中：\( T_1 = \langle +|_1 \sigma_i^{(1)} |+\rangle_1 \langle -|_2 \sigma_j^{(2)} |-\rangle_2 \)，\( T_2 = \langle +|_1 \sigma_i^{(1)} |-\rangle_1 \langle -|_2 \sigma_j^{(2)} |+\rangle_2 \)，\( T_3 = \langle -|_1 \sigma_i^{(1)} |+\rangle_1 \langle +|_2 \sigma_j^{(2)} |-\rangle_2 \)以及\( T_4 = \langle -|_1 \sigma_i^{(1)} |-\rangle_1 \langle +|_2 \sigma_j^{(2)} |+\rangle_2 \)
>
>**计算 \(T_1\)：**
>- 对于 \(\sigma_x\) 和 \(\sigma_y\)，对角元素为零，即 \(\langle +| \sigma_x |+\rangle = 0\)，\(\langle -| \sigma_x |-\rangle = 0\)。
>
>- 对于 \(\sigma_z\)：
$
  \langle +| \sigma_z |+\rangle = 1, \quad \langle -| \sigma_z |-\rangle = -1.
$
>
>因此，仅当 \(i = j = z\) 时，\( T_1 = (1)(-1) = -1 \)。
>
>**计算 \(T_2\) 和 \(T_3\)：**
>
>对于 \(\sigma_x\)：\(\langle +| \sigma_x |-\rangle = 1\)，\(\langle -| \sigma_x |+\rangle = 1\)，所以 \( T_2 = (1)(1) = 1 \)，\( T_3 = (1)(1) = 1 \)。
>对于 \(\sigma_y\)：\(\langle +| \sigma_y |-\rangle = i\)，\(\langle -| \sigma_y |+\rangle = -i\)，所以 \( T_2 = (i)(-i) = 1 \)，\( T_3 = (-i)(i) = 1 \)。
>对于 \(\sigma_z\)：\(\langle +| \sigma_z |-\rangle = 0\)，所以 \( T_2 = T_3 = 0 \)。
>
>**计算 \(T_4\)：** 
>
>同 $T_1$，仅当 \(i = j = z\) 时，\( T_4 = (-1)(1) = -1 \)；其他情况下，\( T_4 = 0 \)。
>
>对上述计算结果做汇总：
>- **当 \(i = j = x\) 或 \(i = j = y\) 时：**
  \[
  T_1 = 0, \quad T_2 = 1, \quad T_3 = 1, \quad T_4 = 0.
  \]\[
  \left\langle 00 \left| \sigma_i^{(1)} \sigma_i^{(2)} \right| 00 \right\rangle = \frac{1}{2} (0 - 1 - 1 + 0) = -1.
  \]
>- **当 \(i = j = z\) 时：**
  \[
  T_1 = -1, \quad T_2 = 0, \quad T_3 = 0, \quad T_4 = -1.
  \]\[
  \left\langle 00 \left| \sigma_z^{(1)} \sigma_z^{(2)} \right| 00 \right\rangle = \frac{1}{2} (-1 - 0 - 0 - 1) = -1.
  \]
>- **当 \(i \ne j\) 时：**
  各项相乘后由于正交性，结果为零。因此：
  \[
  \left\langle 00 \left| \sigma_i^{(1)} \sigma_j^{(2)} \right| 00 \right\rangle = 0.
  \]
>
>综上所述：
>
>- 当 \(i = j\) 时：
  \[
  \left\langle 00 \left| \sigma_i^{(1)} \sigma_i^{(2)} \right| 00 \right\rangle = -1.
  \]
>- 当 \(i \ne j\) 时：
  \[
  \left\langle 00 \left| \sigma_i^{(1)} \sigma_j^{(2)} \right| 00 \right\rangle = 0.
  \]
>
>因此：
\[
\left\langle 00 \left| \sigma_i^{(1)} \sigma_j^{(2)} \right| 00 \right\rangle = -\delta_{ij}.
\]
>得证！

**问题3** 电子-正电子系统  

在均匀磁场 \(\mathbf{B} = B \hat{\mathbf{k}}\) 作用下，电子-正电子系统的自旋依赖哈密顿量可以表示为：

\[
\hat{H} = \lambda \hat{\mathbf{S}}_1 \cdot \hat{\mathbf{S}}_2 + \left(\frac{eB}{m}\right)(\hat{S}_{1z} - \hat{S}_{2z}),
\]

其中 \(\lambda\) 是一个实数，\(\hat{\mathbf{S}}_1\) 和 \(\hat{\mathbf{S}}_2\) 分别是电子和正电子的自旋算符。

(a) 假设系统的自旋波函数为 \(\left| \frac{1}{2} \right\rangle_{e^-} \otimes \left| -\frac{1}{2} \right\rangle_{e^+}\)。在 \(\lambda = 0\)、\(B \neq 0\) 的情况下，判断该态是否为 \(\hat{H}\) 的本征态。如果是，求出其能量本征值；如果不是，计算 \(\hat{H}\) 的期望值。

(b) 重复 (a) 的计算，但设 \(B = 0\)、\(\lambda \neq 0\)。

(c) 在一般情况下（\(\lambda \neq 0\)、\(B \neq 0\)），求出系统的能量本征态及其对应的能量本征值。
>**(a)** 当 \(\lambda = 0\)、\(B \neq 0\) 时，哈密顿量简化为：
\[
\hat{H} = \left( \frac{eB}{m} \right) (\hat{S}_{1z} - \hat{S}_{2z})
\]
>
>则
\[
\hat{H} | \uparrow \downarrow \rangle = \left( \frac{eB}{m} \right) \left( \frac{\hbar}{2} - \left( -\frac{\hbar}{2} \right) \right) | \uparrow \downarrow \rangle = \left( \frac{eB}{m} \right) \hbar | \uparrow \downarrow \rangle
\]
>
>因此，该态是 \(\hat{H}\) 的本征态，对应的能量本征值为：
\[
E = \left( \frac{eB}{m} \right) \hbar
\]
>**(b)** 当 \(B = 0\)、\(\lambda \neq 0\) 时，哈密顿量为：
\[
\hat{H} = \lambda \hat{\mathbf{S}}_1 \cdot \hat{\mathbf{S}}_2
\]
>
>态 \(| \uparrow \downarrow \rangle\) 不是 \(\hat{H}\) 的本征态，因为 \(\hat{\mathbf{S}}_1 \cdot \hat{\mathbf{S}}_2\) 在该基底上不是对角的。我们需要计算期望值：
\[
\langle \hat{H} \rangle = \lambda \langle \uparrow \downarrow | \hat{\mathbf{S}}_1 \cdot \hat{\mathbf{S}}_2 | \uparrow \downarrow \rangle
\]
>
>对于两个自旋-\(\frac{1}{2}\) 粒子系统的总自旋算符 \(\hat{\mathbf{S}} = \hat{\mathbf{S}}_1 + \hat{\mathbf{S}}_2\)，有以下恒等式：
\[
\hat{\mathbf{S}}_1 \cdot \hat{\mathbf{S}}_2 = \frac{1}{2} \left( \hat{\mathbf{S}}^2 - \hat{\mathbf{S}}_1^2 - \hat{\mathbf{S}}_2^2 \right)
\]
>
>注意到对单个自旋-\(\frac{1}{2}\) 粒子的自旋平方算符期望值为：
\[
\hat{\mathbf{S}}_1^2 = \hat{\mathbf{S}}_2^2 = s(s+1)\hbar^2 = \frac{3}{4} \hbar^2
\]
>
>接下来我们只需要考虑态 \(| \uparrow \downarrow \rangle\) 下的总自旋平方期望值 \(\langle \hat{\mathbf{S}}^2 \rangle\)。
>
>注意到对于两个自旋-\(\frac{1}{2}\) 粒子，其总自旋可以是 \(S = 1\)（三重态）或 \(S = 0\)（单重态）。对应的总自旋态为：
>- 三重态（对称态）：
  \[
  | S = 1, M = 1 \rangle = | \uparrow \uparrow \rangle \\
  | S = 1, M = 0 \rangle = \frac{1}{\sqrt{2}} \left( | \uparrow \downarrow \rangle + | \downarrow \uparrow \rangle \right) \\
  | S = 1, M = -1 \rangle = | \downarrow \downarrow \rangle
  \]
>- 单重态（反对称态）：
  \[
  | S = 0, M = 0 \rangle = \frac{1}{\sqrt{2}} \left( | \uparrow \downarrow \rangle - | \downarrow \uparrow \rangle \right)
  \]
>
>因此，态 \(| \uparrow \downarrow \rangle\) 可以表示为总自旋态的线性组合：
\[
| \uparrow \downarrow \rangle = \frac{1}{\sqrt{2}} \left( | S = 1, M = 0 \rangle + | S = 0, M = 0 \rangle \right)
\]
>所以：
\[
\langle \hat{\mathbf{S}}^2 \rangle = \langle \uparrow \downarrow | \hat{\mathbf{S}}^2 | \uparrow \downarrow \rangle = \left( \frac{1}{\sqrt{2}} \left( \langle 1,0 | + \langle 0,0 | \right) \right) \hat{\mathbf{S}}^2 \left( \frac{1}{\sqrt{2}} \left( | 1,0 \rangle + | 0,0 \rangle \right) \right)
\]
>
>展开后得到：
\[
\langle \hat{\mathbf{S}}^2 \rangle = \frac{1}{2} \left( \langle 1,0 | \hat{\mathbf{S}}^2 | 1,0 \rangle + \langle 1,0 | \hat{\mathbf{S}}^2 | 0,0 \rangle + \langle 0,0 | \hat{\mathbf{S}}^2 | 1,0 \rangle + \langle 0,0 | \hat{\mathbf{S}}^2 | 0,0 \rangle \right)
\]
>
>由于不同总自旋态正交，且 \(\hat{\mathbf{S}}^2\) 在总自旋态上作用为：
\[
\hat{\mathbf{S}}^2 | S, M \rangle = S(S+1) \hbar^2 | S, M \rangle
\]
>
>因此：
>- \(\langle 1,0 | \hat{\mathbf{S}}^2 | 1,0 \rangle = 1(1+1) \hbar^2 = 2\hbar^2\)
>- \(\langle 0,0 | \hat{\mathbf{S}}^2 | 0,0 \rangle = 0(0+1) \hbar^2 = 0\)
>- \(\langle 1,0 | \hat{\mathbf{S}}^2 | 0,0 \rangle = \langle 0,0 | \hat{\mathbf{S}}^2 | 1,0 \rangle = 0\)
>
>因此：
\[
\langle \hat{\mathbf{S}}^2 \rangle = \frac{1}{2} \left( 2\hbar^2 + 0 + 0 + 0 \right) = \hbar^2
\]
>
>综上所述：
\[
\langle \hat{\mathbf{S}}_1 \cdot \hat{\mathbf{S}}_2 \rangle = \frac{1}{2} \left( \langle \hat{\mathbf{S}}^2 \rangle - \langle \hat{\mathbf{S}}_1^2 \rangle - \langle \hat{\mathbf{S}}_2^2 \rangle \right) = \frac{1}{2} \left( \hbar^2 - \frac{3}{4} \hbar^2 - \frac{3}{4} \hbar^2 \right)=-\frac{\hbar^2}{4}
\]
>
>将结果代入哈密顿量的期望值公式：
\[
\langle \hat{H} \rangle = \lambda \langle \hat{\mathbf{S}}_1 \cdot \hat{\mathbf{S}}_2 \rangle = \lambda \left( -\frac{\hbar^2}{4} \right) = -\frac{\lambda \hbar^2}{4}
\]
>
>**(c)** 在一般情况下，我们需要对哈密顿量进行对角化。首先，将哈密顿量表示为矩阵形式，选取基底：
\[
\{|1\rangle = | \uparrow \uparrow \rangle,|2\rangle = | \uparrow \downarrow \rangle,|3\rangle = | \downarrow \uparrow \rangle,|4\rangle = | \downarrow \downarrow \rangle\}
\]
>
>哈密顿量在此基底上的矩阵为：
\[
\hat{H} = \begin{pmatrix}
\frac{\lambda \hbar^2}{4} & 0 & 0 & 0 \\
0 & -\frac{\lambda \hbar^2}{4} + \left( \frac{eB}{m} \right) \hbar & \frac{\lambda \hbar^2}{2} & 0 \\
0 & \frac{\lambda \hbar^2}{2} & -\frac{\lambda \hbar^2}{4} - \left( \frac{eB}{m} \right) \hbar & 0 \\
0 & 0 & 0 & \frac{\lambda \hbar^2}{4}
\end{pmatrix}
\]
>
>它具有以下形式：
\[
\hat{H} = \begin{pmatrix}
E_{11} & 0 & 0 & 0 \\
0 & E_{22} & V & 0 \\
0 & V & E_{33} & 0 \\
0 & 0 & 0 & E_{44}
\end{pmatrix}
\]
>
>值得注意的是非对角项 $V$的计算：
>
>利用耦合项的升降算符表达：
\[
\hat{\mathbf{S}}_1 \cdot \hat{\mathbf{S}}_2 = \hat{S}_{1z} \hat{S}_{2z} + \frac{1}{2} \left( \hat{S}_{1+} \hat{S}_{2-} + \hat{S}_{1-} \hat{S}_{2+} \right)
\]
>
>计算 \(\hat{S}_{1+} \hat{S}_{2-}\) 和 \(\hat{S}_{1-} \hat{S}_{2+}\) 对态的作用： 
\[
\langle \uparrow \downarrow | \hat{\mathbf{S}}_1 \cdot \hat{\mathbf{S}}_2 | \downarrow \uparrow \rangle = \langle \uparrow \downarrow | \frac{1}{2} \hat{S}_{1+} \hat{S}_{2-} | \downarrow \uparrow \rangle = \frac{1}{2} \hbar^2
\]\[
\langle \downarrow \uparrow | \hat{\mathbf{S}}_1 \cdot \hat{\mathbf{S}}_2 | \uparrow \downarrow \rangle = \frac{1}{2} \hbar^2
\]
>
>观察这个矩阵，对于能量本征态，我们发现，显然，\(| \uparrow \uparrow \rangle\) 和 \(| \downarrow \downarrow \rangle\) 是哈密顿量的本征态，对应能量为 \(\frac{\lambda \hbar^2}{4}\)。
>
>所以接下来主要对中心的 2×2 子矩阵进行研究，这将是一个标准的二能级体系的通用研究方法（可参考笔记§4.2和相关Topic）。
>
>注意到非对角元 $V$ 是实数，因此参数 $\phi=0$ 。而参数 $\theta$ 满足：
\[
\tan \theta = \dfrac{2\times\frac{\lambda \hbar^2}{2}}{(-\frac{\lambda \hbar^2}{4} + \left( \frac{eB}{m} \right) \hbar) - (-\frac{\lambda \hbar^2}{4} - \left( \frac{eB}{m} \right) \hbar)} = \dfrac{\lambda \hbar m}{2eB}
\]
>
>由此给出本征态：
\[
| \psi_{\pm} \rangle = \cos \frac{\theta}{2} | \uparrow \downarrow \rangle \pm \sin \frac{\theta}{2} | \downarrow \uparrow \rangle
\]
>
>对应能量本征值为：
\[
E_{\pm} = -\frac{\lambda \hbar^2}{4} \pm \sqrt{ \left( \frac{eB}{m} \hbar \right)^2 + \left( \frac{\lambda \hbar^2}{2} \right)^2 }
\]
>
>总之，能量本征态包括两个纯态和两个混合态，能量本征值如上所示。

**问题4**

设 \(\hat{F}\) 为一个与角动量算符 \(\hat{\mathbf{J}}\) 对易的标量算符。证明在 \(\hat{\mathbf{J}}^2\) 和 \(\hat{J}_z\) 的共同本征态 \(|j, m\rangle\) 中，\(\hat{F}\) 的期望值与磁量子数 \(m\) 无关。  

提示：使用升降算符 \(\hat{J}_\pm\)，证明以下关系：
\[
\langle j, m+1|\hat{F}|j, m+1\rangle = \langle j, m|\hat{F}|j, m\rangle。
\]

>要证明在 \(|j, m\rangle\) 态中，算符 \(\hat{F}\) 的期望值与磁量子数 \(m\) 无关，即证明 \(\langle j, m|\hat{F}|j, m\rangle\) 不依赖于 \(m\)。
>
>由于 \(\hat{F}\) 是一个与角动量算符 \(\hat{\mathbf{J}}\) 对易的标量算符，即满足
\[
[\hat{F}, \hat{\mathbf{J}}] = 0。
\]
>
>因此，\(\hat{F}\) 与 \(\hat{J}_x\)、\(\hat{J}_y\)、\(\hat{J}_z\) 以及升降算符 \(\hat{J}_\pm\) 都对易：
\[
[\hat{F}, \hat{J}_\pm] = 0。
\]
>注意到升降算符作用在 \(|j, m\rangle\) 上为：
\[
\hat{J}_\pm |j, m\rangle = \hbar \sqrt{j(j+1) - m(m \pm 1)} |j, m \pm 1\rangle。
\]
>
>基于此，我们考虑 \(\langle j, m|\hat{F}|j, m\rangle\) 和 \(\langle j, m+1|\hat{F}|j, m+1\rangle\) 之间的关系。利用算符对易性，我们有：
\[
\langle j, m|\hat{F}|j, m\rangle = \frac{1}{C_{m}} \langle j, m+1|\hat{J}_+ \hat{F} \hat{J}_-|j, m+1\rangle，
\]
>
>其中 \(C_{m} = \hbar^2 [j(j+1) - m(m+1)]\)。
>
>由于 \(\hat{F}\) 与 \(\hat{J}_\pm\) 对易，我们可以将 \(\hat{F}\) 移动：
\[
\langle j, m|\hat{F}|j, m\rangle = \frac{1}{C_{m}} \langle j, m+1|\hat{F} \hat{J}_+ \hat{J}_-|j, m+1\rangle。
\]
>
>接下来自然考虑\(\hat{J}_+ \hat{J}_-\) 的作用：
\[
\hat{J}_+ \hat{J}_- = \hat{J}^2 - \hat{J}_z^2 + \hbar \hat{J}_z。
\]
>
>作用在 \(|j, m+1\rangle\) 上：
\[
\hat{J}_+ \hat{J}_-|j, m+1\rangle = \left[ j(j+1)\hbar^2 - (m+1)^2\hbar^2 + (m+1)\hbar^2 \right] |j, m+1\rangle。
\]
>
>简化后得：
\[
\hat{J}_+ \hat{J}_-|j, m+1\rangle = \hbar^2 [j(j+1) - m(m+1)] |j, m+1\rangle。
\]
>
>将上式代入期望值的表达式：
\[
\langle j, m|\hat{F}|j, m\rangle = \frac{\hbar^2 [j(j+1) - m(m+1)]}{C_{m}} \langle j, m+1|\hat{F}|j, m+1\rangle。
\]
>
>由于 \(C_{m} = \hbar^2 [j(j+1) - m(m+1)]\)，所以分子和分母相等，约掉后得到：
\[
\langle j, m|\hat{F}|j, m\rangle = \langle j, m+1|\hat{F}|j, m+1\rangle。
\]
>
>由于上述关系对于任意的 \(m\) 都成立，因此 \(\langle j, m|\hat{F}|j, m\rangle\) 与 \(m\) 无关，即在 \(|j, m\rangle\) 态中，算符 \(\hat{F}\) 的期望值不依赖于磁量子数 \(m\)。

---

## 第四次作业

**问题1：势阱中的两个费米子**

两个不相同的粒子，均具有自旋 \(\frac{1}{2}\) 和质量 \(m\)，被限制在长度为 \(L\) 的线段上运动，并通过以下势相互作用：

\[
V = k \mathbf{S}_1 \cdot \mathbf{S}_2。
\]

(a) 计算哈密顿量的本征值和本征函数。

(b) 如果粒子是相同的，情况会发生怎样的变化？

**问题2：相反宇称本征态的正交性**

如果 \(\psi_+(r)\) 和 \(\psi_-(r)\) 是宇称算符对应的偶宇称和奇宇称本征态的本征函数，证明它们是正交的。

**问题3：线段上的粒子：方形微扰**

质量为 \(m\) 的粒子被限制在长度为 \(L\) 的线段上运动，并受到一个小的势阱作用，其总势能为：

\[
V(x) = 
\begin{cases} 
\infty, & \text{如果 } x < 0 \text{ 或 } x > L, \\ 
-V_0, & \text{如果 } 0 < x < \frac{L}{2}, \\ 
0, & \text{如果 } \frac{L}{2} < x < L。
\end{cases}
\]

将 \(0\) 到 \(\frac{L}{2}\) 的小势阱视为对无限深势阱的微扰，计算在一阶微扰近似下的能量本征值。

**问题4：外场中的电偶极转子**

一个具有转动惯量 \(I\) 和电偶极矩 \(\mu\) 的转子在平面内执行转动运动。当转子受到位于转动平面内的电场 \(\mathcal{E}\) 作用时，估算能级的一阶和二阶修正项。

---

## 2022年期末试卷