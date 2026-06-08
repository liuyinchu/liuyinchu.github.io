# 第四部分：声子

本文整理自 David Tong "Solid State Physics" 第四部分 "Phonons" 的学习笔记。

## 4.1 一维晶格振动

固体中的原子并不固定在平衡位置，而是围绕平衡位置振动。小振动可以近似为耦合谐振子。对这些集体振动进行量子化后，得到的准粒子称为声子。

### 4.1.1 单原子链

考虑一条由 $N$ 个相同原子组成的一维链。第 $n$ 个原子的平衡位置为 $na$，实际位移记为 $u_n(t)$。若只考虑最近邻弹性相互作用，哈密顿量为

$$
H=\sum_n\frac{p_n^2}{2m}
+\frac{\lambda}{2}\sum_n (u_n-u_{n-1})^2,
$$

其中 $m$ 为原子质量，$\lambda$ 为有效弹簧常数。

由哈密顿方程可得运动方程

$$
m\ddot u_n=-\lambda(2u_n-u_{n-1}-u_{n+1}).
$$

由于系统具有离散平移对称性，取平面波试探解

$$
u_n(t)=A e^{-i\omega t+ikna}.
$$

代入运动方程，得到色散关系

$$
\omega^2=\frac{4\lambda}{m}\sin^2\left(\frac{ka}{2}\right),
$$

即

$$
\omega(k)=2\sqrt{\frac{\lambda}{m}}
\left|\sin\left(\frac{ka}{2}\right)\right|.
$$

周期性边界条件 $u_{n+N}=u_n$ 给出离散波矢

$$
k=\frac{2\pi l}{Na},
$$

且独立物理波矢可限制在第一布里渊区

$$
k\in\left[-\frac{\pi}{a},\frac{\pi}{a}\right].
$$

长波极限 $ka\ll1$ 下，

$$
\omega\simeq a\sqrt{\frac{\lambda}{m}}\,|k|.
$$

因此声速为

$$
c_s=a\sqrt{\frac{\lambda}{m}}
=\sqrt{\frac{\lambda a^2}{m}}.
$$

对一般 $k$，需要区分相速度和群速度：

$$
v_p(k)=\frac{\omega}{k},\qquad
v_g(k)=\frac{d\omega}{dk}.
$$

对 $0\le k\le\pi/a$，

$$
v_g(k)=a\sqrt{\frac{\lambda}{m}}\cos\left(\frac{ka}{2}\right).
$$

在布里渊区中心，群速度退化为声速；在布里渊区边界，群速度为零，对应驻波。

### 4.1.2 双原子链

双原子链由两种不同质量的原子交替排列。设偶数位点质量为 $m$，奇数位点质量为 $M$，最近邻弹簧常数均为 $\lambda$。运动方程为

$$
m\ddot u_{2n}
=-\lambda(2u_{2n}-u_{2n-1}-u_{2n+1}),
$$

$$
M\ddot u_{2n+1}
=-\lambda(2u_{2n+1}-u_{2n}-u_{2n+2}).
$$

基本重复单元包含两个原子，周期为 $2a$，因此第一布里渊区缩小为

$$
k\in\left[-\frac{\pi}{2a},\frac{\pi}{2a}\right].
$$

取

$$
u_{2n}=A e^{-i\omega t+i k(2na)},\qquad
u_{2n+1}=B e^{-i\omega t+i k(2n+1)a}.
$$

代入后得到本征值方程。非平凡解要求行列式为零，最终色散关系为

$$
\omega^2_{\pm}(k)
=\lambda\left(\frac{1}{m}+\frac{1}{M}\right)
\pm
\lambda\sqrt{
\left(\frac{1}{m}+\frac{1}{M}\right)^2
-\frac{4}{mM}\sin^2(ka)
}.
$$

负号分支 $\omega_-(k)$ 为声学支。它在 $k\to0$ 时满足 $\omega_-\to0$，对应两种原子近似同相运动，即整个原胞作为整体平动。正号分支 $\omega_+(k)$ 为光学支。它在 $k\to0$ 时有有限频率

$$
\omega_+^2(0)=2\lambda\left(\frac{1}{m}+\frac{1}{M}\right),
$$

对应同一原胞内两种原子反相振动。若两类原子带有相反电荷，这种反相振动会产生振荡偶极矩，因此能与电磁波耦合，称为光学支。

在布里渊区边界 $k=\pi/(2a)$ 处，若 $m<M$，两支频率满足

$$
\omega_+^2=\frac{2\lambda}{m},\qquad
\omega_-^2=\frac{2\lambda}{M}.
$$

两支之间存在频率禁带。其能量宽度为

$$
\Delta E
=\hbar(\omega_+-\omega_-)
=\hbar\sqrt{2\lambda}
\left|\frac{1}{\sqrt m}-\frac{1}{\sqrt M}\right|.
$$

若 $m=M$，禁带消失，双原子链退化为单原子链的折叠表示。

更一般地，若交替弹簧常数为 $\lambda_1,\lambda_2$，一个原胞长度为 $L=a+b$，则声子色散由

$$
mM\omega^4
-(\lambda_1+\lambda_2)(m+M)\omega^2
+2\lambda_1\lambda_2[1-\cos(kL)]=0
$$

决定。仍然会得到声学支和光学支，但禁带宽度、声速和光学频率取决于质量、键强度与原胞长度。

对三维晶体，若每个原胞含 $p$ 个原子，则共有 $3p$ 条声子分支。其中 3 条为声学支，在 $k\to0$ 时频率趋于零；其余 $3p-3$ 条为光学支，在 $k\to0$ 时一般具有非零频率。

### 4.1.3 Peierls 跃迁

Peierls 跃迁说明，一维半填充导体在低温下对晶格二聚化不稳定，并可自发转变为绝缘体。

考虑单原子一维链，每个格点贡献一个电子。由于自旋简并，能带为半填充，费米波矢为

$$
k_F=\frac{\pi}{2a}.
$$

若晶格保持周期 $a$，费米能级位于能带内部，体系为金属。若晶格发生二聚化，相邻键长交替变化，新的周期变为 $2a$。对应倒格矢减小为 $\pi/a$，新的布里渊区边界恰好位于

$$
k=\pm\frac{\pi}{2a}=\pm k_F.
$$

因此畸变在费米面处打开能隙。

在费米点附近线性化原始能带，令

$$
q=k-\frac{\pi}{2a},\qquad
E_0(k)\simeq \mu+vq.
$$

畸变引入的周期势耦合 $q$ 与 $-q$，形成能隙 $\Delta$。两条能带变为

$$
E_{\pm}(q)=\mu\pm\sqrt{v^2q^2+\frac{\Delta^2}{4}}.
$$

填充的低能带整体下降，使电子能量降低。估算结果包含

$$
U_{\rm electron}\sim -\Delta^2\log\Delta
$$

型贡献。另一方面，晶格弹性能代价近似为

$$
U_{\rm lattice}\sim (\delta x)^2,
$$

且 $\Delta\propto\delta x$。当 $\Delta\to0$ 时，对数项使电子能量收益相对于弹性能代价占优。因此一维半填充金属在低温下倾向于形成非零畸变，打开能隙并成为绝缘体或半导体。

这个机制的物理本质是：二聚化使费米面变成新的布里渊区边界，布拉格反射在最低能量成本处打开能隙；所有已占据态因此获得能量降低。

若用平均场理论估计临界温度，可将能隙 $\Delta$ 作为序参量，写总自由能

$$
F(\Delta,T)=F_{\rm electron}(\Delta,T)+F_{\rm lattice}(\Delta).
$$

平衡条件

$$
\frac{\partial F}{\partial\Delta}=0
$$

给出类似 BCS 理论的自洽间隙方程。临界温度在 $\Delta\to0$ 极限下求得，典型形式为

$$
k_BT_c\sim \Omega\,e^{-1/\lambda_{\rm eff}},
$$

其中 $\Omega$ 是声子或电子能量截止尺度，$\lambda_{\rm eff}$ 是有效电子-声子耦合常数。严格一维体系中热涨落会削弱长程有序，因此平均场结果应理解为对准一维材料的近似估计。

### 4.1.4 晶格振动的量子化

经典单原子链可通过傅里叶变换分解为一组互不耦合的简正模式。量子化时，将位移和动量提升为算符，并施加正则对易关系

$$
[u_n,p_{n'}]=i\hbar\delta_{nn'}.
$$

对每个非零波矢模式，引入产生和湮灭算符 $a_k^\dagger,a_k$，满足

$$
[a_k,a_{k'}^\dagger]=\delta_{kk'},\qquad
[a_k,a_{k'}]=[a_k^\dagger,a_{k'}^\dagger]=0.
$$

哈密顿量化为

$$
H=\sum_{k\ne0}
\left(a_k^\dagger a_k+\frac12\right)\hbar\omega_k,
$$

其中 $k=0$ 模式对应整个晶体的平动，通常单独处理或令总动量为零。去掉不影响动力学的零点能后，

$$
H=\sum_{k\ne0}\hbar\omega_k\,a_k^\dagger a_k.
$$

基态 $|0\rangle$ 满足 $a_k|0\rangle=0$。作用 $a_k^\dagger$ 会产生一个能量为 $\hbar\omega_k$、晶体动量为 $\hbar k$ 的声子。一般激发态为

$$
|\{n_k\}\rangle
=\prod_k\frac{(a_k^\dagger)^{n_k}}{\sqrt{n_k!}}|0\rangle,
$$

能量为

$$
E=\sum_k n_k\hbar\omega_k.
$$

由于产生算符彼此对易，同一模式可容纳任意多个声子，因此声子是玻色型准粒子。

双原子链的量子化类似，只是每个 $k$ 有两个分支 $s=\pm$。相应算符 $a_s(k)$ 和 $a_s^\dagger(k)$ 分别湮灭和产生声学支或光学支声子。

### 4.1.5 穆斯堡尔效应

穆斯堡尔效应说明固体中原子核可发生无反冲的伽马射线共振吸收或发射。它是声子量子化和晶格集体响应的重要实验体现。

孤立原子核吸收能量为 $E_\gamma$ 的伽马光子时，还必须吸收光子动量

$$
p_\gamma=\frac{E_\gamma}{c}.
$$

若反冲由单个原子核承担，反冲能为

$$
E_{\rm recoil}
=\frac{p_\gamma^2}{2M}
=\frac{E_\gamma^2}{2Mc^2}.
$$

因此吸收所需能量约为

$$
E_\gamma=E_{\rm excite}+E_{\rm recoil},
$$

而发射光子能量约为

$$
E_\gamma'=E_{\rm excite}-E_{\rm recoil}.
$$

对核跃迁而言，反冲能常远大于自然线宽，因此自由原子中的发射线和吸收线难以重合。

在固体中，原子核被束缚在晶格中。反冲动量可以通过两种方式被吸收：

- 激发一个或多个声子；
- 不激发声子，而由整个晶体承担反冲动量。

后一种过程称为无反冲过程。此时反冲能为

$$
E_{\rm recoil}^{\rm crystal}
=\frac{p_\gamma^2}{2M_{\rm crystal}},
$$

由于 $M_{\rm crystal}$ 是宏观质量，该能量可忽略，伽马射线能量几乎不发生反冲偏移，共振吸收得以发生。

无反冲过程具有量子概率。其概率称为无反冲分数，也常与 Debye-Waller 因子联系：

$$
f\simeq e^{-\langle(\mathbf K\cdot\mathbf u)^2\rangle},
$$

常见各向同性写法为

$$
f\simeq e^{-K^2\langle u^2\rangle_T}.
$$

其中 $\mathbf K$ 为动量转移，$\langle u^2\rangle_T$ 为温度 $T$ 下原子均方位移。温度越高，晶格振动越强，$\langle u^2\rangle_T$ 越大，无反冲分数越小。

穆斯堡尔谱学具有极高能量分辨率，可探测核能级的微小移动和分裂，包括同质异能位移、四极分裂和塞曼分裂。以 $^{57}{\rm Fe}$ 为例，穆斯堡尔谱可直接探测铁基材料中的局域磁场，并用于研究磁相变和微观化学环境。

自然线宽由激发态寿命决定。若激发态寿命为 $\tau$，能量-时间不确定关系给出

$$
\Gamma\sim\frac{\hbar}{\tau}.
$$

寿命越短，谱线越宽；寿命越长，谱线越窄。核跃迁线宽极窄，这既使普通反冲造成严重失配，也使无反冲共振吸收成为高分辨探针。

## 4.2 从原子到场

离散晶格模型适用于波长与晶格常数量级相近的振动。长波极限下，固体可视为连续介质，原子位移 $u_n(t)$ 被连续位移场 $u(x,t)$ 取代。

### 4.2.1 一维连续介质极限

令

$$
u_n(t)\simeq u(x=na,t).
$$

对相邻位移作泰勒展开：

$$
u(x\pm a,t)
=u(x,t)\pm a\partial_xu
+\frac{a^2}{2}\partial_x^2u+\cdots.
$$

代入离散运动方程

$$
m\ddot u_n=-\lambda(2u_n-u_{n-1}-u_{n+1}),
$$

得到

$$
\partial_t^2u=\frac{\lambda a^2}{m}\partial_x^2u.
$$

定义线质量密度和一维弹性模量

$$
\rho=\frac{m}{a},\qquad E=\lambda a,
$$

则

$$
\partial_t^2u=\frac{E}{\rho}\partial_x^2u.
$$

这就是一维连续介质波动方程，波速为

$$
v=\sqrt{\frac{E}{\rho}}
=a\sqrt{\frac{\lambda}{m}}.
$$

其通解可写为左右传播波之和：

$$
u(x,t)=f(x-vt)+g(x+vt).
$$

该结果与单原子链长波极限下的声速一致。

连续理论也可由作用量给出：

$$
S=\int dt\,dx
\left[
\frac{\rho}{2}(\partial_tu)^2
-\frac{E}{2}(\partial_xu)^2
\right].
$$

### 4.2.2 三维弹性场与声子

三维固体中的位移是矢量场 $\mathbf u(\mathbf x,t)$。小变形由应变张量

$$
u_{ij}
=\frac12(\partial_i u_j+\partial_j u_i)
$$

描述。对各向同性固体，弹性能由两个 Lamé 系数 $\lambda,\mu$ 决定，作用量可写为

$$
S=\int dt\,d^3x
\left[
\frac{\rho}{2}(\partial_t\mathbf u)^2
-\mu u_{ij}u_{ij}
-\frac{\lambda}{2}u_{kk}^2
\right].
$$

运动方程为

$$
\rho\partial_t^2u_i
=\mu\nabla^2u_i+(\lambda+\mu)\partial_i(\partial_j u_j).
$$

取平面波

$$
\mathbf u(\mathbf x,t)=\boldsymbol\epsilon\,e^{i(\mathbf k\cdot\mathbf x-\omega t)},
$$

可分为一条纵波和两条横波。纵波极化方向平行于 $\mathbf k$，声速为

$$
c_L=\sqrt{\frac{\lambda+2\mu}{\rho}}.
$$

横波极化方向垂直于 $\mathbf k$，声速为

$$
c_T=\sqrt{\frac{\mu}{\rho}}.
$$

连续介质理论只适用于 $ka\ll1$ 的长波区域，不能描述布里渊区边界附近的色散弯曲、声学/光学分支分裂和频率禁带。

对连续场量子化时，将位移场和共轭动量密度

$$
\pi_i(\mathbf x)=\rho\,\partial_tu_i(\mathbf x)
$$

提升为算符，并施加

$$
[u_i(\mathbf x),\pi_j(\mathbf x')]
=i\hbar\delta_{ij}\delta^3(\mathbf x-\mathbf x').
$$

展开为各极化分支的产生和湮灭算符后，哈密顿量具有形式

$$
H=\sum_s\int\frac{d^3k}{(2\pi)^3}
\hbar\omega_s(\mathbf k)
a_s^\dagger(\mathbf k)a_s(\mathbf k),
$$

其中 $s$ 标记纵波或横波极化。每个 $a_s^\dagger(\mathbf k)$ 产生一个动量为 $\hbar\mathbf k$、能量为 $\hbar\omega_s(\mathbf k)$ 的声子。

## 本部分小结

声子理论的主线可以概括为：

- 小振动的一维单原子链给出声学色散，长波极限恢复连续声波。
- 双原子链因原胞中有两个自由度而产生声学支和光学支，并可出现频率禁带。
- Peierls 跃迁说明一维半填充金属可通过二聚化在费米面处打开能隙。
- 晶格简正模式量子化后得到声子；声子是玻色型准粒子。
- 穆斯堡尔效应体现了固体中无反冲核共振吸收以及声子激发的量子概率。
- 长波极限下，离散晶格可粗粒化为弹性位移场；量子化该场再次得到声子。
