# 系统辨识教程：从 PRBS 激励到状态空间子空间辨识

系统辨识的目标，是用实验数据建立一个能够解释和预测系统动态的数学模型。对于线性时不变系统，状态空间模型通常写为

$$
\boldsymbol{x}_{k+1}
=
\mathbf{A}\boldsymbol{x}_{k}
+
\mathbf{B}\boldsymbol{u}_{k}
+
\boldsymbol{w}_{k},
$$

$$
\boldsymbol{y}_{k}
=
\mathbf{C}\boldsymbol{x}_{k}
+
\mathbf{D}\boldsymbol{u}_{k}
+
\boldsymbol{v}_{k},
$$

其中 $\boldsymbol{x}_{k}\in\mathbb{R}^{n}$ 是状态向量，$\boldsymbol{u}_{k}\in\mathbb{R}^{m}$ 是输入向量，$\boldsymbol{y}_{k}\in\mathbb{R}^{\ell}$ 是输出向量。矩阵 $\mathbf{A}$、$\mathbf{B}$、$\mathbf{C}$、$\mathbf{D}$ 分别描述状态演化、输入到状态、状态到输出以及输入到输出的直接通道；$\boldsymbol{w}_{k}$ 和 $\boldsymbol{v}_{k}$ 分别表示过程噪声与输出噪声。

一条实用的系统辨识流程可以概括为：

1. 设计足够丰富且工程上安全的激励信号。
2. 采集输入输出数据，并进行去均值、去趋势、异常点处理和采样一致性检查。
3. 若状态可测，直接用矩阵最小二乘估计 $\mathbf{A}$、$\mathbf{B}$、$\mathbf{C}$、$\mathbf{D}$。
4. 若状态不可测，用块 Hankel 矩阵、投影和奇异值分解提取状态子空间。
5. 用独立验证数据检查模型阶次、预测误差、残差白噪声性和频率响应。

这篇教程按这个顺序展开，重点解释为什么 PRBS 激励常用于工业辨识，怎样把最小二乘写成紧凑矩阵形式，以及 N4SID 类子空间方法如何从输入输出数据中恢复状态空间模型。

---

## 1. 先设计激励信号

辨识算法只能从数据中提取已经被激发出来的信息。若输入信号过于单一、幅值过低、频率覆盖太窄，或者实验时间不足，那么回归矩阵和 Hankel 矩阵会秩亏或病态，最终得到的参数会高度不可靠。

### 1.1 持久激励的直观含义

对于一个线性回归模型

$$
y_{k}
=
\boldsymbol{\phi}_{k}^{\mathrm{T}}\boldsymbol{\theta}
+
e_{k},
$$

辨识依赖回归矩阵

$$
\boldsymbol{\Phi}
=
\begin{bmatrix}
\boldsymbol{\phi}_{1}^{\mathrm{T}}\\
\boldsymbol{\phi}_{2}^{\mathrm{T}}\\
\vdots\\
\boldsymbol{\phi}_{N}^{\mathrm{T}}
\end{bmatrix}.
$$

若 $\boldsymbol{\Phi}^{\mathrm{T}}\boldsymbol{\Phi}$ 接近奇异，就意味着不同参数组合能够产生几乎相同的输出，参数估计自然不稳定。所谓持久激励，就是要求输入信号在足够多的方向上提供独立变化，使待辨识参数能够被数据区分出来。

在状态空间辨识中，状态可测时需要矩阵

$$
\mathbf{Z}_{-}
=
\begin{bmatrix}
\mathbf{X}_{-}\\
\mathbf{U}_{-}
\end{bmatrix}
$$

具有足够行秩；状态不可测时，则需要由过去输入、过去输出、未来输入、未来输出构成的块 Hankel 矩阵包含足够的动态信息。

### 1.2 常见激励信号的取舍

实际工程中不存在对所有系统都最优的激励信号。选择激励时，需要同时考虑安全约束、执行器能力、实验时间、信噪比、频带覆盖和模型用途。

| 激励信号 | 适用场景 | 主要优点 | 主要限制 |
|---|---|---|---|
| 单频正弦 | 精确测量少数频点频响 | 解释清晰，容易与频域分析对应 | 实验耗时长，每次只覆盖一个主要频点 |
| 多正弦 | 需要指定频点频响 | 频点可控，可做相位优化 | 峰值因子可能较高，设计复杂 |
| 扫频信号 | 快速摸清大致频带 | 一次实验覆盖较宽频带 | 每个频点停留短，非平稳性较强 |
| 白噪声 | 理论分析和仿真 | 期望意义下频谱宽 | 有限样本谱起伏大，峰值因子高 |
| PRBS | 幅值受限、需要宽频激励、希望在线低成本生成 | 幅值固定、峰值因子低、可重复、频谱较均匀 | 二值切换可能触发非线性，周期和时钟需谨慎选择 |

PRBS 常被用作状态空间辨识的起点，不是因为它在任何情况下都绝对最好，而是因为它在“低峰值、宽频带、可重复、易生成”之间取得了很好的工程平衡。

### 1.3 PRBS 的生成与参数选择

PRBS 可以由线性反馈移位寄存器生成。若寄存器阶数为 $p$，且反馈多项式为本原多项式，则最大长度序列的周期为

$$
N_{\mathrm{p}}
=
2^{p}-1.
$$

把二值序列 $0/1$ 映射为 $-a/+a$ 后，得到幅值为 $a$ 的 PRBS。该信号的峰值因子为

$$
\mathrm{CF}
=
\frac{\max_{k}\left|u_{k}\right|}
{\sqrt{\frac{1}{N}\sum_{k=0}^{N-1}u_{k}^{2}}}
=
1,
$$

这意味着在相同均方根能量下，PRBS 的峰值压力很低，适合幅值受限的执行器。

PRBS 的关键参数包括：

- 阶数 $p$：决定周期长度 $N_{\mathrm{p}}$。较大的 $p$ 提供更长周期和更细频率分辨率，但实验时间增加。
- 幅值 $a$：应高于噪声主导区间，但不能触发饱和、保护逻辑或显著非线性。
- 时钟周期 $T_{\mathrm{c}}$：决定每个二值保持多长时间。若 $T_{\mathrm{c}}$ 太小，执行器可能跟不上；若 $T_{\mathrm{c}}$ 太大，高频动态会被遗漏。
- 重复周期数：重复完整周期有利于平均随机噪声，并便于周期同步分析。
- 多输入设计：MIMO 系统中不同输入通道不应高度相关，可使用不同延迟、不同序列或正交化处理。

如果系统的有效频带大致为 $0\lt f\lt f_{\mathrm{b}}$，采样频率为 $f_{\mathrm{s}}$，通常应保证 $f_{\mathrm{s}}$ 足够高，并让 PRBS 时钟频率 $1/T_{\mathrm{c}}$ 覆盖目标动态频带。经验上，先用小幅值 PRBS 做安全测试，再逐步提高幅值，是比一次性大幅激励更稳妥的做法。

---

## 2. 从最小二乘开始

最小二乘是许多辨识算法的基础。它不仅用于直接估计参数，也会出现在子空间辨识的后处理步骤中。

### 2.1 普通最小二乘

考虑单输出线性回归模型

$$
y_{k}
=
\boldsymbol{\phi}_{k}^{\mathrm{T}}\boldsymbol{\theta}
+
e_{k}.
$$

收集 $N$ 个样本后，有

$$
\boldsymbol{y}
=
\boldsymbol{\Phi}\boldsymbol{\theta}
+
\boldsymbol{e},
$$

其中

$$
\boldsymbol{y}
=
\begin{bmatrix}
y_{1}\\
y_{2}\\
\vdots\\
y_{N}
\end{bmatrix},
\qquad
\boldsymbol{\Phi}
=
\begin{bmatrix}
\boldsymbol{\phi}_{1}^{\mathrm{T}}\\
\boldsymbol{\phi}_{2}^{\mathrm{T}}\\
\vdots\\
\boldsymbol{\phi}_{N}^{\mathrm{T}}
\end{bmatrix}.
$$

最小二乘估计通过最小化残差平方和获得：

$$
J(\boldsymbol{\theta})
=
\left\|
\boldsymbol{y}
-
\boldsymbol{\Phi}\boldsymbol{\theta}
\right\|_{2}^{2}.
$$

令梯度为零，得到正规方程

$$
\boldsymbol{\Phi}^{\mathrm{T}}\boldsymbol{\Phi}
\hat{\boldsymbol{\theta}}
=
\boldsymbol{\Phi}^{\mathrm{T}}\boldsymbol{y}.
$$

若 $\boldsymbol{\Phi}^{\mathrm{T}}\boldsymbol{\Phi}$ 可逆，则

$$
\hat{\boldsymbol{\theta}}
=
\left(
\boldsymbol{\Phi}^{\mathrm{T}}\boldsymbol{\Phi}
\right)^{-1}
\boldsymbol{\Phi}^{\mathrm{T}}\boldsymbol{y}.
$$

数值实现时不建议显式计算逆矩阵。更稳妥的方式是使用 QR 分解、SVD 或线性最小二乘求解器。

### 2.2 加权最小二乘

若不同样本或不同方向的误差可信度不同，应使用加权最小二乘：

$$
J_{\mathrm{w}}(\boldsymbol{\theta})
=
\left(
\boldsymbol{y}
-
\boldsymbol{\Phi}\boldsymbol{\theta}
\right)^{\mathrm{T}}
\mathbf{W}
\left(
\boldsymbol{y}
-
\boldsymbol{\Phi}\boldsymbol{\theta}
\right),
$$

其中 $\mathbf{W}$ 是对称正定权重矩阵。求导可得

$$
\hat{\boldsymbol{\theta}}_{\mathrm{w}}
=
\left(
\boldsymbol{\Phi}^{\mathrm{T}}\mathbf{W}\boldsymbol{\Phi}
\right)^{-1}
\boldsymbol{\Phi}^{\mathrm{T}}\mathbf{W}\boldsymbol{y}.
$$

若误差协方差为

$$
\mathbf{V}
=
\mathrm{E}
\left[
\boldsymbol{e}\boldsymbol{e}^{\mathrm{T}}
\right],
$$

常取

$$
\mathbf{W}
=
\mathbf{V}^{-1}.
$$

这相当于让噪声较小、可信度较高的方向在目标函数中占更高权重。

### 2.3 多输出矩阵形式

当输出有 $\ell$ 个通道时，可以把多个输出方程合并为

$$
\mathbf{Y}
=
\boldsymbol{\Phi}\boldsymbol{\Theta}
+
\mathbf{E},
$$

其中 $\mathbf{Y}\in\mathbb{R}^{N\times \ell}$，$\boldsymbol{\Theta}\in\mathbb{R}^{q\times \ell}$。若所有输出共用同一个回归矩阵 $\boldsymbol{\Phi}$，则

$$
\hat{\boldsymbol{\Theta}}
=
\left(
\boldsymbol{\Phi}^{\mathrm{T}}\boldsymbol{\Phi}
\right)^{\dagger}
\boldsymbol{\Phi}^{\mathrm{T}}\mathbf{Y}.
$$

这里 $(\cdot)^{\dagger}$ 表示 Moore-Penrose 伪逆。若引入样本方向的权重，有

$$
\hat{\boldsymbol{\Theta}}_{\mathrm{w}}
=
\left(
\boldsymbol{\Phi}^{\mathrm{T}}\mathbf{W}\boldsymbol{\Phi}
\right)^{\dagger}
\boldsymbol{\Phi}^{\mathrm{T}}\mathbf{W}\mathbf{Y}.
$$

---

## 3. 状态可测时的状态空间辨识

若状态、输入和输出都能测量，状态空间模型可直接转化为一个矩阵最小二乘问题。

### 3.1 构造数据矩阵

定义

$$
\mathbf{X}_{-}
=
\begin{bmatrix}
\boldsymbol{x}_{0}&
\boldsymbol{x}_{1}&
\cdots&
\boldsymbol{x}_{N-1}
\end{bmatrix},
$$

$$
\mathbf{X}_{+}
=
\begin{bmatrix}
\boldsymbol{x}_{1}&
\boldsymbol{x}_{2}&
\cdots&
\boldsymbol{x}_{N}
\end{bmatrix},
$$

$$
\mathbf{U}_{-}
=
\begin{bmatrix}
\boldsymbol{u}_{0}&
\boldsymbol{u}_{1}&
\cdots&
\boldsymbol{u}_{N-1}
\end{bmatrix},
\qquad
\mathbf{Y}_{-}
=
\begin{bmatrix}
\boldsymbol{y}_{0}&
\boldsymbol{y}_{1}&
\cdots&
\boldsymbol{y}_{N-1}
\end{bmatrix}.
$$

把状态方程和输出方程按列堆叠，可得

$$
\begin{bmatrix}
\mathbf{X}_{+}\\
\mathbf{Y}_{-}
\end{bmatrix}
=
\begin{bmatrix}
\mathbf{A}&\mathbf{B}\\
\mathbf{C}&\mathbf{D}
\end{bmatrix}
\begin{bmatrix}
\mathbf{X}_{-}\\
\mathbf{U}_{-}
\end{bmatrix}
+
\begin{bmatrix}
\mathbf{W}_{-}\\
\mathbf{V}_{-}
\end{bmatrix}.
$$

记

$$
\mathbf{T}
=
\begin{bmatrix}
\mathbf{X}_{+}\\
\mathbf{Y}_{-}
\end{bmatrix},
\qquad
\mathbf{G}
=
\begin{bmatrix}
\mathbf{A}&\mathbf{B}\\
\mathbf{C}&\mathbf{D}
\end{bmatrix},
\qquad
\mathbf{Z}
=
\begin{bmatrix}
\mathbf{X}_{-}\\
\mathbf{U}_{-}
\end{bmatrix}.
$$

则紧凑形式为

$$
\mathbf{T}
=
\mathbf{G}\mathbf{Z}
+
\mathbf{E}.
$$

最小二乘估计为

$$
\hat{\mathbf{G}}
=
\mathbf{T}\mathbf{Z}^{\mathrm{T}}
\left(
\mathbf{Z}\mathbf{Z}^{\mathrm{T}}
\right)^{\dagger}.
$$

分块即可得到

$$
\hat{\mathbf{G}}
=
\begin{bmatrix}
\hat{\mathbf{A}}&\hat{\mathbf{B}}\\
\hat{\mathbf{C}}&\hat{\mathbf{D}}
\end{bmatrix}.
$$

### 3.2 估计噪声协方差

残差矩阵为

$$
\hat{\mathbf{E}}
=
\mathbf{T}
-
\hat{\mathbf{G}}\mathbf{Z}.
$$

若残差近似独立同分布，可用

$$
\hat{\boldsymbol{\Sigma}}_{\mathrm{e}}
=
\frac{1}{N-r}
\hat{\mathbf{E}}\hat{\mathbf{E}}^{\mathrm{T}}
$$

估计联合噪声协方差。这里 $r$ 是自由度修正项，可取回归矩阵有效秩或参数数目的近似值。

对于状态空间模型，联合协方差通常分块写为

$$
\hat{\boldsymbol{\Sigma}}_{\mathrm{e}}
=
\begin{bmatrix}
\hat{\mathbf{Q}}&\hat{\mathbf{S}}\\
\hat{\mathbf{S}}^{\mathrm{T}}&\hat{\mathbf{R}}
\end{bmatrix},
$$

其中 $\hat{\mathbf{Q}}$ 对应过程噪声协方差，$\hat{\mathbf{R}}$ 对应输出噪声协方差，$\hat{\mathbf{S}}$ 对应二者的互协方差。

### 3.3 这一方法的边界

状态可测最小二乘很直接，但有几个重要前提：

1. $\mathbf{Z}$ 必须具有足够行秩。
2. 输入必须足够激励，否则 $\hat{\mathbf{B}}$ 和 $\hat{\mathbf{D}}$ 会不稳定。
3. 若测得的 $\boldsymbol{x}_{k}$ 本身含噪，普通最小二乘会出现误差变量偏差。
4. 若噪声与输入相关，残差协方差不再能简单解释为真实噪声协方差。
5. 若实验进入强非线性区间，线性模型会把未建模非线性吸收到参数偏差和残差中。

---

## 4. 状态不可测时的子空间辨识

实际系统中，状态 $\boldsymbol{x}_{k}$ 往往不可直接测量。子空间辨识的核心思想，是直接从输入输出数据中恢复状态所在的低维线性子空间，再构造状态空间模型。

N4SID、MOESP、CVA 等方法的细节不同，但主线相似：

1. 用输入输出数据构造块 Hankel 矩阵。
2. 用投影把未来输入的直接影响从未来输出中分离出去。
3. 对投影矩阵做 SVD。
4. 用显著奇异值数量判断系统阶次。
5. 从左奇异向量估计扩展可观测矩阵。
6. 利用扩展可观测矩阵的移位结构估计 $\mathbf{A}$ 和 $\mathbf{C}$。
7. 用估计状态序列和最小二乘估计 $\mathbf{B}$ 和 $\mathbf{D}$。

### 4.1 构造块 Hankel 矩阵

给定输入序列 $\boldsymbol{u}_{k}$，取块行数 $i$ 和列数 $j$，过去输入 Hankel 矩阵可写为

$$
\mathbf{U}_{\mathrm{p}}
=
\begin{bmatrix}
\boldsymbol{u}_{0}&\boldsymbol{u}_{1}&\cdots&\boldsymbol{u}_{j-1}\\
\boldsymbol{u}_{1}&\boldsymbol{u}_{2}&\cdots&\boldsymbol{u}_{j}\\
\vdots&\vdots&&\vdots\\
\boldsymbol{u}_{i-1}&\boldsymbol{u}_{i}&\cdots&\boldsymbol{u}_{i+j-2}
\end{bmatrix}.
$$

类似地构造过去输出 $\mathbf{Y}_{\mathrm{p}}$、未来输入 $\mathbf{U}_{\mathrm{f}}$ 和未来输出 $\mathbf{Y}_{\mathrm{f}}$。过去数据矩阵写为

$$
\mathbf{W}_{\mathrm{p}}
=
\begin{bmatrix}
\mathbf{U}_{\mathrm{p}}\\
\mathbf{Y}_{\mathrm{p}}
\end{bmatrix}.
$$

扩展可观测矩阵定义为

$$
\boldsymbol{\Gamma}_{i}
=
\begin{bmatrix}
\mathbf{C}\\
\mathbf{C}\mathbf{A}\\
\vdots\\
\mathbf{C}\mathbf{A}^{i-1}
\end{bmatrix}.
$$

理想无噪声情形下，未来输出满足

$$
\mathbf{Y}_{\mathrm{f}}
=
\boldsymbol{\Gamma}_{i}\mathbf{X}_{\mathrm{f}}
+
\mathbf{H}_{i}\mathbf{U}_{\mathrm{f}},
$$

其中 $\mathbf{H}_{i}$ 是由 Markov 参数 $\mathbf{D}$、$\mathbf{C}\mathbf{B}$、$\mathbf{C}\mathbf{A}\mathbf{B}$ 等组成的块 Toeplitz 矩阵。子空间方法要做的事情，就是从 $\mathbf{Y}_{\mathrm{f}}$ 中分离出 $\boldsymbol{\Gamma}_{i}\mathbf{X}_{\mathrm{f}}$ 的列空间。

### 4.2 投影：去除未来输入的直接影响

未来输入 $\mathbf{U}_{\mathrm{f}}$ 会通过 $\mathbf{H}_{i}\mathbf{U}_{\mathrm{f}}$ 直接影响未来输出。如果不处理这部分影响，SVD 提取到的可能是输入直接通道，而不是真正的状态子空间。

定义到 $\mathbf{U}_{\mathrm{f}}$ 正交补空间的投影矩阵

$$
\boldsymbol{\Pi}_{\mathbf{U}_{\mathrm{f}}}^{\perp}
=
\mathbb{1}
-
\mathbf{U}_{\mathrm{f}}^{\mathrm{T}}
\left(
\mathbf{U}_{\mathrm{f}}\mathbf{U}_{\mathrm{f}}^{\mathrm{T}}
\right)^{\dagger}
\mathbf{U}_{\mathrm{f}}.
$$

一个便于理解的投影构造是

$$
\mathbf{O}_{i}
=
\mathbf{Y}_{\mathrm{f}}
\boldsymbol{\Pi}_{\mathbf{U}_{\mathrm{f}}}^{\perp}
\left(
\mathbf{W}_{\mathrm{p}}
\boldsymbol{\Pi}_{\mathbf{U}_{\mathrm{f}}}^{\perp}
\right)^{\dagger}
\mathbf{W}_{\mathrm{p}}
\boldsymbol{\Pi}_{\mathbf{U}_{\mathrm{f}}}^{\perp}.
$$

直观地说，$\mathbf{O}_{i}$ 保留了“未来输出中可由过去输入输出解释，且不属于未来输入直接作用”的部分。完整 N4SID 实现通常会使用更稳定的 QR 分解、加权投影和 oblique projection，但核心目的仍是估计状态子空间。

### 4.3 SVD 与阶次估计

对投影矩阵做奇异值分解：

$$
\mathbf{O}_{i}
=
\mathbf{U}\boldsymbol{\Sigma}\mathbf{V}^{\mathrm{T}}.
$$

若系统阶次为 $n$，且数据无噪声、激励充分，则 $\mathbf{O}_{i}$ 的秩为 $n$。因此，非零奇异值的数量对应系统阶次。实际数据有噪声，奇异值不会严格归零，阶次选择应结合：

- 奇异值谱是否存在明显断崖。
- 噪声底是否稳定。
- 不同阶次模型在验证集上的预测误差。
- 残差是否接近白噪声。
- 阶次是否符合物理结构和工程先验。

选定阶次 $\hat{n}$ 后，取前 $\hat{n}$ 个奇异值和奇异向量：

$$
\boldsymbol{\Sigma}_{1}
=
\mathrm{diag}
\left(
\sigma_{1},\sigma_{2},\ldots,\sigma_{\hat{n}}
\right).
$$

扩展可观测矩阵可估为

$$
\hat{\boldsymbol{\Gamma}}_{i}
=
\mathbf{U}_{1}\boldsymbol{\Sigma}_{1}^{1/2},
$$

相应的状态序列可估为

$$
\hat{\mathbf{X}}_{\mathrm{f}}
=
\boldsymbol{\Sigma}_{1}^{1/2}\mathbf{V}_{1}^{\mathrm{T}}.
$$

### 4.4 估计 $\mathbf{A}$ 和 $\mathbf{C}$

由于

$$
\boldsymbol{\Gamma}_{i}
=
\begin{bmatrix}
\mathbf{C}\\
\mathbf{C}\mathbf{A}\\
\vdots\\
\mathbf{C}\mathbf{A}^{i-1}
\end{bmatrix},
$$

矩阵 $\mathbf{C}$ 就是扩展可观测矩阵的第一块行：

$$
\hat{\mathbf{C}}
=
\hat{\boldsymbol{\Gamma}}_{i}(1:\ell,:).
$$

再把 $\hat{\boldsymbol{\Gamma}}_{i}$ 去掉最后一个输出块行，得到 $\hat{\boldsymbol{\Gamma}}_{\mathrm{up}}$；去掉第一个输出块行，得到 $\hat{\boldsymbol{\Gamma}}_{\mathrm{down}}$。二者满足近似移位关系

$$
\hat{\boldsymbol{\Gamma}}_{\mathrm{up}}
\hat{\mathbf{A}}
\approx
\hat{\boldsymbol{\Gamma}}_{\mathrm{down}}.
$$

因此

$$
\hat{\mathbf{A}}
=
\hat{\boldsymbol{\Gamma}}_{\mathrm{up}}^{\dagger}
\hat{\boldsymbol{\Gamma}}_{\mathrm{down}}.
$$

这里要特别注意状态空间模型的非唯一性。若 $\mathbf{T}$ 是可逆矩阵，令

$$
\boldsymbol{x}'_{k}
=
\mathbf{T}\boldsymbol{x}_{k},
$$

则有等价模型

$$
\mathbf{A}'
=
\mathbf{T}\mathbf{A}\mathbf{T}^{-1},
\qquad
\mathbf{B}'
=
\mathbf{T}\mathbf{B},
\qquad
\mathbf{C}'
=
\mathbf{C}\mathbf{T}^{-1},
\qquad
\mathbf{D}'
=
\mathbf{D}.
$$

所以，子空间辨识得到的 $\hat{\mathbf{A}}$、$\hat{\mathbf{B}}$、$\hat{\mathbf{C}}$ 不一定与某个仿真真值逐元素相同；真正应比较的是输入输出响应、极点、频率响应和预测误差。

### 4.5 估计 $\mathbf{B}$ 和 $\mathbf{D}$

得到估计状态序列后，可以回到矩阵最小二乘：

$$
\begin{bmatrix}
\hat{\mathbf{X}}_{+}\\
\mathbf{Y}_{-}
\end{bmatrix}
=
\begin{bmatrix}
\mathbf{A}&\mathbf{B}\\
\mathbf{C}&\mathbf{D}
\end{bmatrix}
\begin{bmatrix}
\hat{\mathbf{X}}_{-}\\
\mathbf{U}_{-}
\end{bmatrix}
+
\mathbf{E}.
$$

若 $\hat{\mathbf{A}}$ 和 $\hat{\mathbf{C}}$ 已由可观测矩阵确定，可以只估计 $\mathbf{B}$ 和 $\mathbf{D}$；也可以把四个矩阵统一放入一次最小二乘中重估。后者更便于构造紧凑程序，但要意识到它仍然在估计坐标系下工作。

---

## 5. 一个可复现实验的实现框架

完整实验可以按下面的程序结构实现。这里给出核心思路，便于把理论公式转化为代码。

### 5.1 生成 PRBS

PRBS 生成函数需要完成三件事：

1. 用 LFSR 产生 $0/1$ 最大长度序列。
2. 验证周期是否为 $2^{p}-1$。
3. 映射为 $-a/+a$ 的输入序列。

核心伪代码为：

```python
state = np.ones(order, dtype=np.uint8)
for step in range(1, 2**order + 1):
    bits.append(int(state[-1]))
    feedback = np.uint8(0)
    for tap in taps:
        feedback ^= state[-tap]
    state[1:] = state[:-1]
    state[0] = feedback
```

如果反馈 tap 不是本原组合，周期会短于 $2^{p}-1$，此时不能把该序列当作最大长度 PRBS 使用。

### 5.2 用状态可测数据估计矩阵

核心代码结构与公式

$$
\hat{\mathbf{G}}
=
\mathbf{T}\mathbf{Z}^{\mathrm{T}}
\left(
\mathbf{Z}\mathbf{Z}^{\mathrm{T}}
\right)^{\dagger}
$$

直接对应：

```python
z = np.vstack([x_now, u_now])
target = np.vstack([x_next, y_now])
theta = target @ z.T @ np.linalg.pinv(z @ z.T)
residual = target - theta @ z
residual_covariance = residual @ residual.T / dof
```

其中 `theta` 的上半部分给出 $\hat{\mathbf{A}}$ 和 $\hat{\mathbf{B}}$，下半部分给出 $\hat{\mathbf{C}}$ 和 $\hat{\mathbf{D}}$。

### 5.3 用输入输出数据估计状态子空间

子空间辨识实现可以分为四步：

1. 构造 $\mathbf{U}_{\mathrm{p}}$、$\mathbf{Y}_{\mathrm{p}}$、$\mathbf{U}_{\mathrm{f}}$、$\mathbf{Y}_{\mathrm{f}}$。
2. 计算到 $\mathbf{U}_{\mathrm{f}}$ 正交补空间的投影。
3. 对投影矩阵做 SVD 并选择阶次。
4. 用移位不变性和最小二乘估计状态空间矩阵。

核心代码结构为：

```python
projector_u_perp = np.eye(columns) - u_f.T @ np.linalg.pinv(u_f @ u_f.T) @ u_f
past_projected = w_p @ projector_u_perp
future_projected = y_f @ projector_u_perp
projection = future_projected @ np.linalg.pinv(past_projected) @ past_projected

u_svd, singular_values, vt = np.linalg.svd(projection, full_matrices=False)
gamma = u_svd[:, :order] @ np.diag(np.sqrt(singular_values[:order]))
x_hat = np.diag(np.sqrt(singular_values[:order])) @ vt[:order, :]
```

这段实现适合用于理解子空间方法的主线。若用于工程部署，还需要更系统的预处理、阶次选择、数值稳定化、闭环数据处理和验证流程。

---

## 6. 验证与诊断

一个辨识模型不能只看训练误差，还应进行至少以下检查。

### 6.1 数据检查

- 输入输出采样时间是否一致。
- 数据是否存在饱和、限幅、掉点或时间戳错位。
- 输入是否足够激励目标频带。
- 输出是否需要去均值或去趋势。
- 训练数据与验证数据是否分离。

### 6.2 参数检查

- $\hat{\mathbf{A}}$ 的特征值是否符合系统稳定性预期。
- $\hat{\mathbf{D}}$ 是否符合物理直接通道判断。
- 估计阶次 $\hat{n}$ 是否与奇异值谱、验证误差和物理结构一致。
- 噪声协方差 $\hat{\mathbf{Q}}$、$\hat{\mathbf{R}}$ 是否半正定或接近半正定。

### 6.3 残差检查

理想情况下，预测残差应接近白噪声，并且与过去输入不显著相关。若残差中仍存在明显周期结构，常见原因包括：

- 阶次过低。
- 激励频带不足。
- 未建模时滞。
- 系统存在非线性。
- 数据包含闭环反馈影响但模型未处理。

### 6.4 频域检查

若模型用于控制或振动分析，应比较频率响应。连续时间频域替换优先写为 $s=\mathrm{j}\omega$。离散模型可通过 $z=\mathrm{e}^{\mathrm{j}\omega T_{\mathrm{s}}}$ 计算频率响应，其中 $T_{\mathrm{s}}$ 是采样周期。比较重点不只是幅频曲线，还包括相频、共振峰位置、带宽和时滞影响。

---

## 7. 常见问题

### 7.1 为什么 PRBS 的幅值不能越大越好

较大幅值可以提高信噪比，但也更容易触发饱和、死区、摩擦非线性、保护逻辑或工况漂移。一旦系统离开局部线性区间，线性辨识模型会把非线性误差错误地吸收到参数中。实际实验通常从小幅值开始，确认安全后逐步增大。

### 7.2 为什么奇异值图不能机械判阶

噪声、有限样本、输入相关性和闭环反馈都会抬高小奇异值。若只看最大奇异值间隙，可能低估阶次；若只看非零奇异值，又可能高估阶次。可靠做法是结合奇异值谱、验证误差、残差检验和物理先验。

### 7.3 为什么子空间辨识的矩阵不等于真实矩阵

状态坐标本身不是唯一的。只要存在可逆变换 $\mathbf{T}$，不同矩阵组可以产生相同输入输出关系。因此，除非固定了状态坐标，否则不应逐元素比较 $\mathbf{A}$、$\mathbf{B}$、$\mathbf{C}$。更合理的比较对象是极点、零点、仿真输出、预测误差和频率响应。

### 7.4 什么时候不该直接使用开环 PRBS

若系统无法安全开环运行、输入切换会损伤设备、工况存在强漂移，或输出约束非常严格，就不应直接施加开环 PRBS。此时应考虑闭环辨识、受约束多正弦、低幅扫频、分段实验或基于安全约束的输入设计。

---

## 8. 参考资料

1. Lennart Ljung, *System Identification: Theory for the User*, 2nd ed., Prentice Hall, 1999. [Pearson](https://www.pearson.com/en-us/subject-catalog/p/system-identification-theory-for-the-user/P200000003282)。
2. P. Van Overschee and B. De Moor, “N4SID: Subspace Algorithms for the Identification of Combined Deterministic-Stochastic Systems,” *Automatica*, 1994. [ScienceDirect](https://www.sciencedirect.com/science/article/pii/0005109894902305)。
3. M. Verhaegen and P. Dewilde, “Subspace model identification. Part 1: The output-error state-space model identification class of algorithms,” *International Journal of Control*, 1992. [Taylor & Francis](https://www.tandfonline.com/doi/abs/10.1080/00207179208934233)。
4. MathWorks, System Identification Toolbox `n4sid` documentation. [n4sid](https://www.mathworks.com/help/ident/ref/n4sid.html)。
5. MathWorks, input signal generation documentation. [idinput](https://www.mathworks.com/help/ident/ref/idinput.html)。
6. NumPy documentation: [numpy.linalg.lstsq](https://numpy.org/doc/stable/reference/generated/numpy.linalg.lstsq.html), [numpy.linalg.svd](https://numpy.org/doc/stable/reference/generated/numpy.linalg.svd.html)。
