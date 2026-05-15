# 从受激拉曼跃迁到 Mølmer-Sørensen 门

本文整理从三能级受激拉曼跃迁到离子阱 Mølmer-Sørensen 门的推导。全文统一使用角频率记号；若无特别说明，哈密顿量保留 $\hbar$，态矢量的能量本征值写为 $\hbar\omega_i$。推导中采用的主要近似是旋转波近似、远失谐绝热消去、Lamb-Dicke 近似以及边带旋转波近似。

## 1. 记号与基本模型

考虑 $\Lambda$ 型三能级体系：

$$
\ket{0},\qquad \ket{1},\qquad \ket{e},
$$

其中 $\ket{0}$ 与 $\ket{1}$ 是量子比特基态，$\ket{e}$ 是光学激发态。定义

$$
\omega_{01}=\omega_1-\omega_0 .
$$

自由哈密顿量为

$$
H_0=\hbar\omega_0\ket{0}\bra{0}
    +\hbar\omega_1\ket{1}\bra{1}
    +\hbar\omega_e\ket{e}\bra{e}.
$$

两束拉曼光场记为 $a,b$：

$$
\mathbf E(\mathbf x,t)=\sum_{\ell=a,b}\frac{\mathbf A_\ell}{2}
\left[
e^{i(\mathbf k_\ell\cdot \mathbf x-\omega_\ell t+\phi_\ell)}
+e^{-i(\mathbf k_\ell\cdot \mathbf x-\omega_\ell t+\phi_\ell)}
\right].
$$

电偶极相互作用为

$$
V(t)=-\mathbf d\cdot \mathbf E(\mathbf x,t).
$$

只保留 $\ket{0},\ket{1}$ 与 $\ket{e}$ 之间的偶极耦合，写为

$$
\mathbf d
=\mathbf d_{e0}\ket e\bra 0+\mathbf d_{0e}\ket 0\bra e
+\mathbf d_{e1}\ket e\bra 1+\mathbf d_{1e}\ket 1\bra e,
$$

其中 $\mathbf d_{0e}=\mathbf d_{e0}^\ast$，$\mathbf d_{1e}=\mathbf d_{e1}^\ast$。态矢量取

$$
\ket{\psi(t)}
=c_0(t)\ket 0+c_1(t)\ket 1+c_e(t)\ket e,
\qquad
c_j(t)=C_j(t)e^{-i\omega_jt}.
$$

代入薛定谔方程 $i\hbar\partial_t\ket{\psi}=H\ket{\psi}$。以 $\ket 0$ 分量为例：

$$
i\hbar\dot c_0
=\hbar\omega_0c_0-\mathbf d_{0e}\cdot\mathbf E\,c_e.
$$

又因为

$$
i\hbar\dot c_0
=i\hbar \dot C_0e^{-i\omega_0t}
+\hbar\omega_0C_0e^{-i\omega_0t},
$$

所以自由演化项抵消，得到

$$
i\hbar \dot C_0e^{-i\omega_0t}
=-\mathbf d_{0e}\cdot\mathbf E\,C_ee^{-i\omega_et}.
$$

即

$$
\dot C_0
=\frac{i}{\hbar}\mathbf d_{0e}\cdot\mathbf E\,C_e
e^{-i(\omega_e-\omega_0)t}.
$$

同理有

$$
\dot C_1
=\frac{i}{\hbar}\mathbf d_{1e}\cdot\mathbf E\,C_e
e^{-i(\omega_e-\omega_1)t},
$$

$$
\dot C_e
=\frac{i}{\hbar}\mathbf d_{e0}\cdot\mathbf E\,C_0
e^{i(\omega_e-\omega_0)t}
+\frac{i}{\hbar}\mathbf d_{e1}\cdot\mathbf E\,C_1
e^{i(\omega_e-\omega_1)t}.
$$

## 2. 旋转波近似后的拉曼方程

定义单光子失谐

$$
\Delta_{q\ell}=\omega_e-\omega_q-\omega_\ell,
\qquad q\in\{0,1\},\quad \ell\in\{a,b\},
$$

并定义复耦合强度

$$
g_{q\ell}(\mathbf x)
=\frac{\mathbf d_{qe}\cdot \mathbf A_\ell}{2\hbar}
e^{-i(\mathbf k_\ell\cdot\mathbf x+\phi_\ell)}.
$$

这个定义已经包含光场相位和空间相位。将电场代入上一节方程后，含
$e^{\pm i(\omega_e-\omega_q+\omega_\ell)t}$ 的项以光学频率快速振荡，在旋转波近似下舍去；保留近共振项得到

$$
\dot C_q
=i\sum_{\ell=a,b}g_{q\ell} C_e e^{-i\Delta_{q\ell}t},
\qquad q=0,1,
$$

$$
\dot C_e
=i\sum_{q=0,1}\sum_{\ell=a,b}g_{q\ell}^\ast C_q e^{i\Delta_{q\ell}t}.
$$

为了突出有效二能级跃迁，先考虑最常用的一对拉曼路径：光束 $a$ 将
$\ket0$ 虚激发到 $\ket e$，光束 $b$ 将 $\ket e$ 退激发到 $\ket1$。设

$$
\Delta_{0a}\equiv\Delta,
$$

并令两束光的频差接近量子比特频率：

$$
\omega_a-\omega_b=\omega_{01}+\mu.
$$

这里 $\mu$ 是相对于载波跃迁 $\ket0\leftrightarrow\ket1$ 的双光子失谐。因此

$$
\Delta_{1b}
=\omega_e-\omega_1-\omega_b
=\omega_e-\omega_0-\omega_a+\omega_a-\omega_b-\omega_{01}
=\Delta+\mu.
$$

在舍去与 $\omega_{01}$ 量级快速振荡的交叉耦合后，慢变量满足

$$
\dot C_0=ig_{0a}C_ee^{-i\Delta t},
$$

$$
\dot C_1=ig_{1b}C_ee^{-i(\Delta+\mu)t},
$$

$$
\dot C_e
=ig_{0a}^\ast C_0e^{i\Delta t}
+ig_{1b}^\ast C_1e^{i(\Delta+\mu)t}.
$$

注意这里所有频率关系都只涉及频率差。例如 $\Delta_{1b}=\Delta+\mu$，不是 $\Delta+\mu+\omega_1+\omega_0$；量子比特频率进入推导时应当以 $\omega_1-\omega_0$ 的形式出现。

## 3. 绝热消去激发态

假设远失谐条件

$$
|\Delta|\gg |g_{0a}|,\ |g_{1b}|,\ |\mu|.
$$

在时间尺度 $1/|\Delta|$ 上，$C_0,C_1$ 近似不变。若激发态初始振幅可忽略，则对 $\dot C_e$ 积分得

$$
C_e(t)
\simeq
C_0\frac{g_{0a}^\ast(e^{i\Delta t}-1)}{\Delta}
+C_1\frac{g_{1b}^\ast(e^{i(\Delta+\mu)t}-1)}{\Delta+\mu}.
$$

其中常数项在代回 $\dot C_0,\dot C_1$ 后会生成 $e^{-i\Delta t}$ 或
$e^{-i(\Delta+\mu)t}$ 的快速振荡项。对慢动力学再次作旋转波近似，只保留不含大失谐频率的项，并用 $\Delta+\mu\simeq\Delta$，得到

$$
C_e(t)\ \longrightarrow\
\frac{g_{0a}^\ast C_0e^{i\Delta t}
+g_{1b}^\ast C_1e^{i(\Delta+\mu)t}}{\Delta}.
$$

代回基态方程：

$$
\dot C_0
=ig_{0a}e^{-i\Delta t}
\frac{g_{0a}^\ast C_0e^{i\Delta t}
+g_{1b}^\ast C_1e^{i(\Delta+\mu)t}}{\Delta},
$$

于是

$$
\dot C_0
=\frac{i}{\Delta}
\left(
|g_{0a}|^2C_0+g_{0a}g_{1b}^\ast e^{i\mu t}C_1
\right).
$$

同理

$$
\dot C_1
=\frac{i}{\Delta}
\left(
g_{1b}g_{0a}^\ast e^{-i\mu t}C_0+|g_{1b}|^2C_1
\right).
$$

因此在 $\{\ket0,\ket1\}$ 子空间中

$$
i\hbar\frac{d}{dt}
\begin{pmatrix}
C_0\\ C_1
\end{pmatrix}
=H_{\rm eff}
\begin{pmatrix}
C_0\\ C_1
\end{pmatrix},
$$

其中

$$
H_{\rm eff}
=-\frac{\hbar}{\Delta}
\begin{pmatrix}
|g_{0a}|^2 & g_{0a}g_{1b}^\ast e^{i\mu t}\\
g_{1b}g_{0a}^\ast e^{-i\mu t} & |g_{1b}|^2
\end{pmatrix}.
$$

对角元是 AC Stark shift；若它们相等，只贡献整体相位。若不相等，则产生等效的 $\sigma_z$ 光移，需要实验上补偿或在有效失谐中计入。

若有多个激发态 $\ket{e_r}$，例如精细结构或 Zeeman 分裂导致的多个虚能级，则只需对虚路径求和：

$$
H_{01}^{\rm eff}
=-\hbar\sum_r \frac{g_{0a}^{(r)}g_{1b}^{(r)\ast}}{\Delta_r}e^{i\mu t},
$$

对角光移也类似地对 $r$ 求和。

## 4. 有效拉曼哈密顿量的相位形式

取

$$
\sigma_+=\ket1\bra0,\qquad
\sigma_-=\ket0\bra1.
$$

将 $g_{q\ell}$ 中的空间和光学相位显式分离：

$$
g_{q\ell}(\mathbf x)
=\tilde g_{q\ell}
e^{-i(\mathbf k_\ell\cdot\mathbf x+\phi_\ell)}.
$$

于是

$$
g_{1b}g_{0a}^\ast
\propto
e^{i[(\mathbf k_a-\mathbf k_b)\cdot\mathbf x+\phi_a-\phi_b]},
$$

可将非对角耦合写成

$$
H_{\rm R}^{\rm flip}
=\frac{\hbar\Omega_R}{2}
\left[
\sigma_+e^{-i\mu t+i\Phi(\mathbf x)}
+\sigma_-e^{i\mu t-i\Phi(\mathbf x)}
\right],
$$

其中

$$
\Phi(\mathbf x)=\Delta\mathbf k\cdot\mathbf x+\Delta\phi+\phi_d,
\qquad
\Delta\mathbf k=\mathbf k_a-\mathbf k_b,
\qquad
\Delta\phi=\phi_a-\phi_b.
$$

$\phi_d$ 吸收偶极矩阵元和失谐符号带来的常数相位。令

$$
\mathcal A
=-\sum_r\frac{\tilde g_{1b}^{(r)}\tilde g_{0a}^{(r)\ast}}{\Delta_r},
$$

则可取

$$
\Omega_R=2|\mathcal A|,
\qquad
\phi_d=\arg\mathcal A.
$$

实际使用时通常只保留 $\Omega_R$ 的正实数大小，并把所有固定相位并入 $\Phi$。若采用相反的 $\sigma_+$ 定义或相反的双光子失谐定义，上式会整体复共轭；这是相位约定差异，不改变物理结果。

## 5. 加入声子自由演化

考虑单个正则模，频率为 $\nu$。运动自由哈密顿量为

$$
H_{\rm m}=\hbar\nu\left(a^\dagger a+\frac12\right),
$$

量子化位移为

$$
x=x_0(a+a^\dagger),
\qquad
x_0=\sqrt{\frac{\hbar}{2m\nu}}.
$$

拉曼波矢差沿该模方向的 Lamb-Dicke 参数为

$$
\eta=\Delta k\,x_0.
$$

在运动相互作用绘景中

$$
a(t)=ae^{-i\nu t},
\qquad
a^\dagger(t)=a^\dagger e^{i\nu t}.
$$

所以

$$
\Delta k\,x(t)=\eta\left(ae^{-i\nu t}+a^\dagger e^{i\nu t}\right).
$$

将它代入有效拉曼哈密顿量，并把常数相位记为 $\phi$：

$$
H_I(\mu,\phi)
=\frac{\hbar\Omega}{2}
\left[
\sigma_+e^{-i\mu t+i\phi}
e^{i\eta(ae^{-i\nu t}+a^\dagger e^{i\nu t})}
+\sigma_-e^{i\mu t-i\phi}
e^{-i\eta(ae^{-i\nu t}+a^\dagger e^{i\nu t})}
\right].
$$

在 Lamb-Dicke 区域

$$
\eta\sqrt{\langle (a+a^\dagger)^2\rangle}\ll 1,
$$

一阶展开

$$
e^{\pm i\eta(ae^{-i\nu t}+a^\dagger e^{i\nu t})}
\simeq
1\pm i\eta(ae^{-i\nu t}+a^\dagger e^{i\nu t}).
$$

于是

$$
\begin{aligned}
H_I
\simeq
&\frac{\hbar\Omega}{2}
\left(
\sigma_+e^{-i\mu t+i\phi}
+\sigma_-e^{i\mu t-i\phi}
\right)\\
&+\frac{i\hbar\eta\Omega}{2}
\left[
\sigma_+a^\dagger e^{i(\nu-\mu)t+i\phi}
+\sigma_+a e^{-i(\nu+\mu)t+i\phi}\right.\\
&\hspace{5.7em}\left.
-\sigma_-a e^{-i(\nu-\mu)t-i\phi}
-\sigma_-a^\dagger e^{i(\nu+\mu)t-i\phi}
\right].
\end{aligned}
$$

第一行是载波项；第二、三行分别包含蓝边带、红边带以及远离共振的高频项。

## 6. 红边带与蓝边带

设 $\mu>0$ 表示拉曼频差相对载波的偏移量大小，并令

$$
\delta=\nu-\mu.
$$

当一束双光子驱动位于蓝边带附近，即频差为 $\omega_{01}+\mu$ 且 $\mu\simeq\nu$ 时，边带旋转波近似保留
$\sigma_+a^\dagger$ 和 $\sigma_-a$：

$$
H_{\rm BSB}
\simeq
\frac{i\hbar\eta\Omega}{2}
\left(
\sigma_+a^\dagger e^{i\delta t+i\phi_b}
-\sigma_-a e^{-i\delta t-i\phi_b}
\right).
$$

当另一束双光子驱动位于红边带附近，即频差为 $\omega_{01}-\mu$ 时，相当于在上一节公式中取载波失谐 $-\mu$，保留
$\sigma_+a$ 和 $\sigma_-a^\dagger$：

$$
H_{\rm RSB}
\simeq
\frac{i\hbar\eta\Omega}{2}
\left(
\sigma_+a e^{-i\delta t+i\phi_r}
-\sigma_-a^\dagger e^{i\delta t-i\phi_r}
\right).
$$

两者相加：

$$
\begin{aligned}
H_{\rm BSB}+H_{\rm RSB}
=\frac{i\hbar\eta\Omega}{2}
\Big[
&a^\dagger e^{i\delta t}
\left(\sigma_+e^{i\phi_b}-\sigma_-e^{-i\phi_r}\right)\\
+&a e^{-i\delta t}
\left(\sigma_+e^{i\phi_r}-\sigma_-e^{-i\phi_b}\right)
\Big].
\end{aligned}
$$

定义

$$
\theta=\frac{\phi_b+\phi_r}{2},
\qquad
\phi_s=\frac{\phi_b-\phi_r}{2},
$$

以及一个厄米的自旋相位算符

$$
\sigma_\theta
\equiv
i\left(\sigma_+e^{i\theta}-\sigma_-e^{-i\theta}\right).
$$

则

$$
H_{\rm BSB}+H_{\rm RSB}
=\frac{\hbar\eta\Omega}{2}\,
\sigma_\theta
\left(
a^\dagger e^{i(\delta t+\phi_s)}
+a e^{-i(\delta t+\phi_s)}
\right).
$$

$\theta$ 决定自旋空间中受力方向，$\phi_s$ 是运动相位。通过选择光学相位，可以取 $\sigma_\theta=\sigma_x$；若得到 $-\sigma_x$，只会改变后续耦合相位或门角符号。

## 7. 多离子多模 MS 相互作用

对第 $j$ 个离子、第 $k$ 个正则模，记

$$
\eta_{j,k}=b_{j,k}\Delta k\sqrt{\frac{\hbar}{2M\nu_k}},
$$

其中 $b_{j,k}$ 是第 $k$ 个模在第 $j$ 个离子上的归一化模振幅。选择相位使自旋方向为 $\sigma_x$，并把运动相位并入 $a_k$ 的初始相位，则 MS 相互作用可写为

$$
H_{\rm MS}(t)
=\hbar\sum_{j,k}g_{j,k}\sigma_x^j
\left(
a_k^\dagger e^{i\delta_k t}
+a_k e^{-i\delta_k t}
\right),
$$

其中

$$
g_{j,k}=\frac{\eta_{j,k}\Omega_j}{2},
\qquad
\delta_k=\nu_k-\mu.
$$

这个形式是厄米的，因为 $a_k^\dagger e^{i\delta_k t}+a_ke^{-i\delta_k t}$ 本身是厄米算符，$\sigma_x^j$ 也是厄米算符。

## 8. Magnus 展开

时间演化算符写为

$$
U(t)=\mathcal T\exp\left[-\frac{i}{\hbar}\int_0^tH_{\rm MS}(t_1)\,dt_1\right]
=\exp[M_1(t)+M_2(t)+\cdots].
$$

其中

$$
M_1(t)=-\frac{i}{\hbar}\int_0^tH_{\rm MS}(t_1)\,dt_1,
$$

$$
M_2(t)=\frac12\left(-\frac{i}{\hbar}\right)^2
\int_0^t dt_1\int_0^{t_1}dt_2\,
[H_{\rm MS}(t_1),H_{\rm MS}(t_2)].
$$

由于所有自旋算符都沿同一轴，$\sigma_x^j$ 与 $\sigma_x^l$ 对易；而声子对易子给出的是 $c$ 数。因此二阶对易子只含自旋乘积，并与 $H_{\rm MS}$ 对易，三阶及更高阶 Magnus 项为零。

### 8.1 一阶项：自旋依赖位移

直接积分：

$$
\begin{aligned}
M_1(t)
&=-i\sum_{j,k}g_{j,k}\sigma_x^j
\left[
a_k^\dagger\int_0^t e^{i\delta_k t_1}\,dt_1
+a_k\int_0^t e^{-i\delta_k t_1}\,dt_1
\right]\\
&=\sum_{j,k}\sigma_x^j
\left[
\alpha_{j,k}(t)a_k^\dagger-\alpha_{j,k}^\ast(t)a_k
\right],
\end{aligned}
$$

其中

$$
\alpha_{j,k}(t)
=\frac{g_{j,k}}{\delta_k}
\left(1-e^{i\delta_k t}\right)
=\frac{\eta_{j,k}\Omega_j}{2\delta_k}
\left(1-e^{i\delta_k t}\right).
$$

$M_1$ 描述相空间中的自旋依赖闭合轨迹。若希望门结束时自旋与声子解缠，需要

$$
\alpha_{j,k}(\tau)=0
\quad\Longleftrightarrow\quad
\delta_k\tau=2\pi n_k,\qquad n_k\in\mathbb Z.
$$

单模门可直接选 $\tau=2\pi/|\delta|$。多模情形通常需要选取合适的 $\mu$、脉冲整形或分段振幅，使所有相关模的 $\alpha_{j,k}(\tau)$ 同时接近零。

### 8.2 二阶项：有效自旋-自旋相位

先计算声子对易子。令

$$
B_k(t)=a_k^\dagger e^{i\delta_k t}+a_ke^{-i\delta_k t}.
$$

利用

$$
[a_k,a_m^\dagger]=\delta_{km},
\qquad
[a_k^\dagger,a_m]=-\delta_{km},
$$

得到

$$
\begin{aligned}
[B_k(t_1),B_m(t_2)]
&=[a_k^\dagger,a_m]e^{i\delta_k t_1-i\delta_m t_2}
+[a_k,a_m^\dagger]e^{-i\delta_k t_1+i\delta_m t_2}\\
&=\delta_{km}
\left[
e^{-i\delta_k(t_1-t_2)}
-e^{i\delta_k(t_1-t_2)}
\right]\\
&=-2i\delta_{km}\sin[\delta_k(t_1-t_2)].
\end{aligned}
$$

因此

$$
[H_{\rm MS}(t_1),H_{\rm MS}(t_2)]
=-2i\hbar^2
\sum_{j,l,k}g_{j,k}g_{l,k}
\sigma_x^j\sigma_x^l
\sin[\delta_k(t_1-t_2)].
$$

代入 $M_2$：

$$
M_2(t)
=i\sum_{j,l,k}g_{j,k}g_{l,k}\sigma_x^j\sigma_x^l
\int_0^t dt_1\int_0^{t_1}dt_2\,
\sin[\delta_k(t_1-t_2)].
$$

积分部分为

$$
\begin{aligned}
I_k(t)
&=\int_0^t dt_1\int_0^{t_1}dt_2\,
\sin[\delta_k(t_1-t_2)]\\
&=\int_0^t dt_1\,\frac{1-\cos(\delta_k t_1)}{\delta_k}\\
&=\frac{t}{\delta_k}-\frac{\sin(\delta_k t)}{\delta_k^2}
=\frac{\delta_k t-\sin(\delta_k t)}{\delta_k^2}.
\end{aligned}
$$

于是

$$
M_2(t)
=i\sum_{j,l}\Theta_{j,l}(t)\sigma_x^j\sigma_x^l,
$$

其中

$$
\Theta_{j,l}(t)
=\sum_k
\frac{\eta_{j,k}\eta_{l,k}\Omega_j\Omega_l}{4}
\frac{\delta_k t-\sin(\delta_k t)}{\delta_k^2}.
$$

如果希望写成 $e^{-iX\sigma_x^j\sigma_x^l}$ 的形式，只需定义

$$
X_{j,l}(t)=-\Theta_{j,l}(t).
$$

这个负号没有独立物理意义，取决于前面对光学相位、$\sigma_\theta$ 以及 $\delta_k$ 符号的约定。

## 9. 闭合轨迹后的两离子门

当所有相关模满足 $\alpha_{j,k}(\tau)=0$ 时，演化算符只剩自旋部分：

$$
U(\tau)
=\exp\left[
i\sum_{j,l}\Theta_{j,l}(\tau)\sigma_x^j\sigma_x^l
\right].
$$

对两个离子、单个声子模，有

$$
\sigma_x^1=\sigma_x\otimes I,
\qquad
\sigma_x^2=I\otimes\sigma_x.
$$

因此

$$
\begin{aligned}
\sum_{j,l=1}^2\Theta_{j,l}\sigma_x^j\sigma_x^l
&=\Theta_{11}I_4+\Theta_{12}(\sigma_x\otimes\sigma_x)
+\Theta_{21}(\sigma_x\otimes\sigma_x)+\Theta_{22}I_4\\
&=(\Theta_{11}+\Theta_{22})I_4
+(\Theta_{12}+\Theta_{21})(\sigma_x\otimes\sigma_x).
\end{aligned}
$$

这里 $j=l$ 项不是零；它们因为 $(\sigma_x^j)^2=I$ 只给出整体相位。整体相位不可观测，可以丢弃。令

$$
\beta=-(\Theta_{12}+\Theta_{21}),
$$

则两离子 MS 门可写成标准形式

$$
U_{\rm MS}(\beta)
\doteq
\exp[-i\beta(\sigma_x\otimes\sigma_x)].
$$

其中 $\doteq$ 表示忽略整体相位。由于

$$
(\sigma_x\otimes\sigma_x)^2=I_4,
$$

指数可直接展开：

$$
U_{\rm MS}(\beta)
=I_4\cos\beta
-i(\sigma_x\otimes\sigma_x)\sin\beta.
$$

在计算基

$$
\{\ket{00},\ket{01},\ket{10},\ket{11}\}
$$

下

$$
\sigma_x\otimes\sigma_x
=
\begin{pmatrix}
0&0&0&1\\
0&0&1&0\\
0&1&0&0\\
1&0&0&0
\end{pmatrix},
$$

所以

$$
U_{\rm MS}(\beta)
=
\begin{pmatrix}
\cos\beta&0&0&-i\sin\beta\\
0&\cos\beta&-i\sin\beta&0\\
0&-i\sin\beta&\cos\beta&0\\
-i\sin\beta&0&0&\cos\beta
\end{pmatrix}.
$$

当

$$
|\beta|=\frac{\pi}{4}
$$

时得到最大纠缠门。例如取 $\beta=\pi/4$：

$$
U_{\rm MS}\left(\frac{\pi}{4}\right)
=\frac{1}{\sqrt2}
\begin{pmatrix}
1&0&0&-i\\
0&1&-i&0\\
0&-i&1&0\\
-i&0&0&1
\end{pmatrix}.
$$

不同实验文献中也常见 $+\!i$ 或绕 $y$ 轴的等价形式；它们来自红蓝边带光学相位、$\sigma_\theta$ 轴选择以及局域单比特相位约定的不同。

## 10. 推导中需要特别注意的点

1. 单光子失谐和双光子失谐必须区分。若 $\omega_a-\omega_b=\omega_{01}+\mu$，则 $\Delta_{1b}=\Delta+\mu$。
2. 量子比特频率只应以差频 $\omega_{01}=\omega_1-\omega_0$ 出现，不应写成 $\omega_1+\omega_0$。
3. 绝热消去时积分得到的常数项不是有效慢动力学；它们代回基态方程后对应大失谐频率的快速振荡项，应在第二次旋转波近似中舍去。
4. Lamb-Dicke 展开后，红边带与蓝边带的近共振项分别是 $\sigma_+a$、$\sigma_-a^\dagger$ 与 $\sigma_+a^\dagger$、$\sigma_-a$。
5. 声子对易关系中 $[a^\dagger,a]=-[a,a^\dagger]$。二阶 Magnus 项的符号最容易在这里出错。
6. 两离子推导中的 $j=l$ 项不是“自耦合为零”，而是整体相位；只有在忽略整体相位后才可从可观测门操作中去掉。
