# 奇异值分解及其应用 · 简介

本篇笔记受这一教程[视频](https://www.bilibili.com/video/BV1zPyHBKEhZ/)启发。

---

## 1. 奇异值与奇异向量从哪里来

给定实矩阵 $A\in\mathbb{R}^{m\times n}$。矩阵 $A^{\mathsf T}A\in\mathbb{R}^{n\times n}$ 是对称半正定矩阵，所以它有一组正交归一的特征向量 $\{v_i\}$，对应特征值 $\lambda_i\ge 0$：

$$
A^{\mathsf T}A\,v_i=\lambda_i v_i,\qquad v_i^{\mathsf T}v_j=\delta_{ij}.
$$

把这些特征值开平方，定义

$$
\sigma_i=\sqrt{\lambda_i}\quad (\sigma_i\ge 0),
$$

这组 $\sigma_i$ 就叫做 $A$ 的奇异值（通常按 $\sigma_1\ge \sigma_2\ge \cdots\ge \sigma_p\ge 0$ 排序，其中 $p=\min(m,n)$）。

当 $\sigma_i>0$ 时，再定义

$$
u_i=\frac{1}{\sigma_i}A v_i\in\mathbb{R}^{m}.
$$

可以立刻验证 $\{u_i\}$ 也是正交归一的，并且满足两条核心关系：

$$
A v_i=\sigma_i u_i,\qquad A^{\mathsf T}u_i=\sigma_i v_i\quad (\sigma_i>0).
$$

直观地说，$v_i$ 是“输入空间里的方向”，沿着它输入，$A$ 会把它拉伸 $\sigma_i$ 倍并转到 $u_i$ 这个“输出空间里的方向”。

令 $r=\mathrm{rank}(A)$，那么恰好有 $r$ 个奇异值严格大于零；也就是 $\sigma_1,\dots,\sigma_r>0$，而 $\sigma_{r+1}=\cdots=0$。

---

## 2. SVD 的标准形式、维度与块结构

**奇异值分解（SVD）定理**：存在正交矩阵

$$
U\in\mathbb{R}^{m\times m},\qquad V\in\mathbb{R}^{n\times n}
$$

以及“对角形”矩阵

$$
\Sigma\in\mathbb{R}^{m\times n},
$$

使得

$$
A=U\Sigma V^{\mathsf T}.
$$

这里的“对角形”是指 $\Sigma$ 只有主对角线上可能非零，且非零项就是奇异值。把秩 $r$ 显式写出来，最清晰的块结构是

$$
\Sigma=
\begin{bmatrix}
D_r & 0\\
0 & 0
\end{bmatrix},
\qquad
D_r=\mathrm{diag}(\sigma_1,\dots,\sigma_r),
$$

其中 $D_r$ 是 $r\times r$，其余零块的尺寸由 $m,n,r$ 自动匹配。

很多计算里更常用“经济型（薄）SVD”：

$$
A=U_r D_r V_r^{\mathsf T},
$$

其中 $U_r\in\mathbb{R}^{m\times r}$ 的列就是 $\{u_1,\dots,u_r\}$，$V_r\in\mathbb{R}^{n\times r}$ 的列就是 $\{v_1,\dots,v_r\}$。

---

## 3. 与 $A^{\mathsf T}A$、$AA^{\mathsf T}$ 的特征分解关系

由 $A=U\Sigma V^{\mathsf T}$ 直接推出

$$
A^{\mathsf T}A = V\Sigma^{\mathsf T}\Sigma V^{\mathsf T}
=V\,\mathrm{diag}(\sigma_1^2,\dots,\sigma_p^2)\,V^{\mathsf T},
$$

因此 $V$ 的列向量就是 $A^{\mathsf T}A$ 的特征向量，特征值是 $\sigma_i^2$。

同理，

$$
AA^{\mathsf T}=U\Sigma\Sigma^{\mathsf T}U^{\mathsf T}
=U\,\mathrm{diag}(\sigma_1^2,\dots,\sigma_p^2)\,U^{\mathsf T},
$$

因此 $U$ 的列向量就是 $AA^{\mathsf T}$ 的特征向量，特征值同样是 $\sigma_i^2$。

对应四个基本子空间的正交基：

- $\mathrm{Col}(A)=\mathrm{span}\{u_1,\dots,u_r\}$
- $\mathrm{Col}(A^{\mathsf T})=\mathrm{Row}(A)=\mathrm{span}\{v_1,\dots,v_r\}$
- $\mathrm{Null}(A)=\mathrm{span}\{v_{r+1},\dots,v_n\}$
- $\mathrm{Null}(A^{\mathsf T})=\mathrm{span}\{u_{r+1},\dots,u_m\}$

---

## 4. 几何意义：单位球被映成椭球

把任意向量 $x$ 在 $\{v_i\}$ 基下展开：$x=\sum_i \alpha_i v_i$。则

$$
Ax=\sum_{i=1}^{r}\alpha_i\,A v_i
=\sum_{i=1}^{r}\alpha_i \sigma_i u_i.
$$

所以 $A$ 的作用可以理解为：先用 $V^{\mathsf T}$ 把坐标转到 $v_i$ 的正交坐标系，再沿各坐标轴把长度缩放 $\sigma_i$，最后用 $U$ 旋转到输出坐标系。单位球因此被映成半轴长度为 $\sigma_i$ 的椭球，半轴方向就是 $u_i$。

---

## 5. 两个最常用的范数结论与截断近似

奇异值直接给出常用范数：

$$
\|A\|_2=\sigma_1,\qquad
\|A\|_F^2=\sum_{i=1}^{p}\sigma_i^2.
$$

当只保留最大的 $k$ 个奇异值（$k<r$）及对应奇异向量，得到截断 SVD：

$$
A_k=\sum_{i=1}^{k}\sigma_i u_i v_i^{\mathsf T}
=U_k D_k V_k^{\mathsf T}.
$$

它在“所有秩不超过 $k$ 的矩阵”里是对 $A$ 的最佳近似：无论用 $\|\cdot\|_2$ 还是 $\|\cdot\|_F$，$A_k$ 都能把误差做到最小（Eckart–Young–Mirsky 定理）。误差为：

$$
\|A-A_k\|_2=\sigma_{k+1},\qquad
\|A-A_k\|_F^2=\sum_{i>k}\sigma_i^2.
$$

---

## 6. 伪逆 $A^+$ 与最小二乘

把 $\Sigma$ 的非零对角元取倒数得到 $\Sigma^+$：对 $i\le r$ 令 $(\Sigma^+)_{ii}=1/\sigma_i$，其余为零。**Moore–Penrose 伪逆**为

$$
A^+=V\Sigma^+U^{\mathsf T}.
$$

经济型写法为

$$
A^+=V_r D_r^{-1} U_r^{\mathsf T}.
$$

它用于最小二乘问题

$$
\min_x \|Ax-b\|_2.
$$

一个标准结论是：$\hat x=A^+b$ 是所有最小二乘解中欧氏范数最小的那一个（“最小范数解”）。若 $A$ 满列秩（$r=n$），则退化为

$$
\hat x=(A^{\mathsf T}A)^{-1}A^{\mathsf T}b,
$$

但用 SVD 写法更稳健，因为能直接看到病态来自小奇异值（倒数放大噪声）。需要时可通过截断小奇异值来做数值“去噪”。

---

## 7. SVD 与 PCA：协方差、方差与奇异值的对应

设有 $N$ 个样本 $x^{(1)},\dots,x^{(N)}\in\mathbb{R}^{d}$，按列组成数据矩阵

$$
X=[x^{(1)},\dots,x^{(N)}]\in\mathbb{R}^{d\times N}.
$$

中心化步骤：

$$
m=\frac{1}{N}\sum_{i=1}^N x^{(i)},\qquad 
\tilde x^{(i)}=x^{(i)}-m,
$$

定义中心化矩阵 $\tilde X=[\tilde x^{(1)},\dots,\tilde x^{(N)}]$。样本协方差矩阵为

$$
S=\frac{1}{N-1}\tilde X\tilde X^{\mathsf T}\in\mathbb{R}^{d\times d}.
$$

其迹为

$$
\mathrm{tr}(S)=\sum_{j=1}^{d}\mathrm{Var}(x_j).
$$

PCA 等价于对 $S$ 做特征分解：

$$
S=P\Lambda P^{\mathsf T},
$$

其中 $P$ 的列向量是主成分方向，$\Lambda$ 的对角元 $\lambda_i$ 是每个主成分解释的方差。

SVD 与 PCA 的连接来自对 $\tilde X$ 做 SVD：

$$
\tilde X=U\Sigma V^{\mathsf T}.
$$

代回协方差：

$$
S=\frac{1}{N-1}U\Sigma\Sigma^{\mathsf T}U^{\mathsf T}.
$$

因此：

- 协方差的特征向量就是 $U$，  
- 协方差的特征值满足  
  $$
  \lambda_i=\frac{\sigma_i^2}{N-1}.
  $$

这解释了“奇异值平方对应解释方差”以及“总方差等于  
$\sum_i \lambda_i = \frac{1}{N-1}\sum_i \sigma_i^2$”。

---

## 8.总结与关键记忆点口诀

- 左奇异阵 $U$ 是 $AA^T$ 的特征向量；右奇异阵 $V$ 是 $A^T A$ 的特征向量；奇异值 $\sigma$ 是特征值的开方。
- 作用：$Av_i = \sigma_i u_i$ 描述了矩阵本质的拉伸与旋转。
- 计算：求逆矩阵很困难，但求伪逆 $A^+$ 利用 SVD 非常简单 ($V D^{-1} U^T$)。
- 物理意义：SVD 将一个复杂的矩阵变换分解为：旋转 ($V^T$) $\to$ 轴向拉伸 ($\Sigma$) $\to$ 旋转 ($U$)。