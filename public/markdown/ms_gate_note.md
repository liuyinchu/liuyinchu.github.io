# MS-Gate推导

## 先看最一般的情况

重新把声子考虑进自由Hamilton量，其中$\sigma_z$是Pauli-z矩阵，即：

$$ H_0 = H_1 + H_2 = \left( a^\dagger a + \frac{1}{2} \right) \hbar \nu + \frac{1}{2} \hbar \omega_{01} \sigma_z. $$

考虑等效的一束光与离子相互作用，并利用关系$\Delta kx=\eta(a+a^{\dagger})$，得：

$$
\begin{aligned}
H_e &= -\vec{d} \cdot \vec{E} \\
&= \Omega\hbar \sigma_x \cos(\Delta k x - \omega t + \Delta\phi) \\
&= \frac{\Omega\hbar}{2} (\sigma_+ + \sigma_-) \left( e^{i(\eta(a + a^\dagger) - \omega t + \Delta\phi)} + e^{-i(\eta(a + a^\dagger) - \omega t + \Delta\phi)} \right).
\end{aligned}
$$

注意到$\Delta k$、$\Delta \phi$及$\omega$事实上都表示的是两束光叠加的作用。此外这里我们定义了拉比频率 $\Omega\hbar = -dE$，以及$x = x_0 (a + a^\dagger)$。这里，$x_0 = (\hbar / 2m\nu)^{1/2}$，引入 Lamb-Dicke 参数 $\eta = kx_0$。

在 Lamb-Dicke 体系中，我们可以做出近似：

$$ e^{\pm i\eta( a^\dagger +  a)} \approx 1 \pm i\eta( a^\dagger +  a). $$

于是有：

$$
\begin{aligned}
H_e &= \frac{\Omega\hbar}{2} (\sigma_+ + \sigma_-) \left( e^{i(\eta(a + a^\dagger) - \omega t + \Delta\phi)} + e^{-i(\eta(a + a^\dagger) - \omega t + \Delta\phi)} \right) \\
&= \frac{\Omega\hbar}{2} (\sigma_+ + \sigma_-) \left( \left(1 + i\eta(a + a^\dagger)\right)e^{-i(\omega t - \Delta\phi)} + \left(1 - i\eta(a + a^\dagger)\right)e^{i(\omega t - \Delta\phi)} \right) \\
&= \frac{\Omega\hbar}{2} (\sigma_+ + \sigma_-) \left( e^{-i(\omega t - \Delta\phi)} + e^{i(\omega t - \Delta\phi)} + i\eta(a + a^\dagger)\left( e^{-i(\omega t - \Delta\phi)} - e^{i(\omega t - \Delta\phi)} \right) \right).
\end{aligned}
$$

注意到上式事实上表达了张量积的含义：

$$ H_e = \frac{\Omega\hbar}{2} (\sigma_+ + \sigma_-) \otimes \left( e^{-i(\omega t - \Delta\phi)} + e^{i(\omega t - \Delta\phi)} + i\eta(a + a^\dagger)\left( e^{-i(\omega t - \Delta\phi)} - e^{i(\omega t - \Delta\phi)} \right) \right). $$

接下来我们需要将它写成相互作用绘景下的表达式：

$$ H_e^{(I)} = e^{i \frac{H_0 t}{\hbar}} H_e e^{-i \frac{H_0 t}{\hbar}} = U^\dagger H_e U = (U_2\otimes U_1)(\frac{\Omega\hbar}{2}\sigma_x\otimes\hat{A})(U_2^\dagger\otimes U_1^\dagger)=((U_2\sigma_x)\otimes(U_1\hat{A}))(U_2^\dagger\otimes U_1^\dagger)=(U_2\sigma_xU_2^\dagger)\otimes(U_1\hat{A}U_1^\dagger). $$

这说明我们可以分开考虑两次变换到相互作用绘景。

不妨先考虑$U_2=e^{iH_2t/\hbar}$的作用，注意到自旋算符在自由哈密顿量下的变换：
$$ \sigma_+ \rightarrow e^{iH_{2} t/\hbar} \sigma_+ e^{-iH_{2} t/\hbar} = \sigma_+ e^{i\omega_{01} t} ;$$ $$ \sigma_- \rightarrow e^{iH_{2} t/\hbar} \sigma_- e^{-iH_{2} t/\hbar} = \sigma_- e^{-i\omega_{01} t} .$$

代回得到：

$$ H_e^{(I_2)} = \frac{\Omega \hbar}{2} (\sigma_+ e^{i\omega_{01} t} + \sigma_- e^{-i\omega_{01} t}) \otimes \left( e^{-i(\omega t - \Delta\phi)} + e^{i(\omega t - \Delta\phi)} + i\eta(a + a^\dagger)\left( e^{-i(\omega t - \Delta\phi)} - e^{i(\omega t - \Delta\phi)} \right) \right) .$$

注意到有$\omega=\omega_a-\omega_b=\omega_{01}-\mu$（物理上对应红边带情形），因此上式合并后利用旋转波近似略去高频项，得：

$$ H_e^{(I_2)} = \frac{\Omega \hbar}{2}\left( \left( \sigma_+ \otimes (e^{i(\mu t + \Delta\phi)} + i\eta(a + a^\dagger)e^{i(\mu t + \Delta\phi)}) \right) + \left( \sigma_- \otimes (e^{-i(\mu t + \Delta\phi)} + i\eta(a + a^\dagger)e^{-i(\mu t + \Delta\phi)}) \right) \right).$$

接下来我们会看到，这正是我们在不考虑声子的情况下得到的受激Raman跃迁的相互作用绘景下的Hamilton量的非对角部分。

## 从受激Raman跃迁的Hamilton量出发

<!-- $$
\begin{aligned}
	H_{Raman}=\frac{1}{4\Delta} \begin{bmatrix}
		\mathcal{E}_a^2\left |g_{0e^+a}  \right | ^2+\mathcal{E}_b^2\left |g_{0e^+b}  \right | ^2+\mathcal{E}_a^2\left |g_{0e^-a}  \right | ^2+\mathcal{E}_b^2\left |g_{0e^-b}  \right | ^2& \mathcal{E}_a\mathcal{E}_bg_{0e^+a}g_{1e^+b}^{\ast}e^{i\mu t}+\mathcal{E}_a\mathcal{E}_bg_{0e^-a}g_{1e^-b}^{\ast}e^{i\mu t}\\
		\mathcal{E}_a\mathcal{E}_bg_{1e^+b}g_{0e^+a}^{\ast}e^{-i\mu t}+\mathcal{E}_a\mathcal{E}_bg_{1e^-b}g_{0e^-a}^{\ast}e^{-i\mu t}&\mathcal{E}_a^2\left |g_{1e^+a}  \right | ^2+\mathcal{E}_b^2\left |g_{1e^+b}  \right | ^2+\mathcal{E}_a^2\left |g_{1e^-a}  \right | ^2+\mathcal{E}_b^2\left |g_{1e^-b}  \right | ^2
	\end{bmatrix}
\end{aligned}
$$ -->

前面推导中我们得到$H_{Raman}$，形式为（注意到各矩阵元与态矢量的关系后，这个形式应当是对应的红边带情形）：

$$ 
\begin{bmatrix}
	H_{Raman}^{(11)} & |H_{Raman}^{(12)}|e^{i(\mu t + \Phi)} \\
	|H_{Raman}^{(12)}|e^{-i(\mu t + \Phi)} & H_{Raman}^{(11)}
\end{bmatrix}.
$$

现在我们只考虑它的非对角元，并记$ |H_{Raman}^{(12)}|=\frac{\Omega}{2} $，且注意到$\Phi$中$\Delta k=k_a-k_b,\ \Delta \phi=\phi_a-\phi_b+\pi/2$，则：

$$ \tilde{H}_{Raman}=\frac{\Omega\hbar}{2}(\sigma_+e^{i(\mu t + \Delta k x + \phi)} + \sigma_-e^{-i(\mu t + \Delta kx + \phi)}) .$$

重新把声子考虑进自由Hamilton量，其中$\sigma_z$是Pauli-z矩阵，即：

$$ H_0 = H_1 + H_2 = \left( a^\dagger a + \frac{1}{2} \right) \hbar \nu + \frac{1}{2} \hbar \omega_{01} \sigma_z. $$

利用关系$\Delta kx=\eta(a+a^{\dagger})$，得：

$$ \tilde{H}_{Raman}=\frac{\Omega\hbar}{2}(\sigma_+e^{i(\mu t + \eta(a+a^{\dagger}) + \phi)} + \sigma_-e^{-i(\mu t + \eta(a+a^{\dagger}) + \phi)}) .$$

在 Lamb-Dicke 体系中，我们可以做出近似：

$$ e^{\pm i\eta( a^\dagger +  a)} \approx 1 \pm i\eta( a^\dagger +  a). $$

就得到：

$$ \tilde{H}_{Raman} = \frac{\Omega \hbar}{2}\left( \left( \sigma_+ \otimes (e^{i(\mu t + \Delta\phi)} + i\eta(a + a^\dagger)e^{i(\mu t + \Delta\phi)}) \right) + \left( \sigma_- \otimes (e^{-i(\mu t + \Delta\phi)} + i\eta(a + a^\dagger)e^{-i(\mu t + \Delta\phi)}) \right) \right).$$

这正是$H_e^{(I_2)}$！

所以接下来的流程是我们要进一步将它写成“声子的”相互作用绘景下的表达式。按照前面的推导，我们只需要进一步把声子重新考虑进去就行。这里做如下考虑：

对于一个一般的声子态的哈密顿量 $H = H_0 + H_i = \hbar \nu a^\dagger a + a$，定义变换 $R = e^{iva^\dagger at}$，则：

$$
\tilde{H} = RHR^\dagger - iR \frac{dR^\dagger}{dt} = RaR^\dagger
$$

又由于：

$$
\frac{d(RaR^\dagger)}{dt} = ivRa^\dagger aaR^\dagger - ivRaa^\dagger aR^\dagger \\
= ivR \left[ a^\dagger, a \right] aR^\dagger \\
= -ivRaR^\dagger
$$

于是得到$RaR^\dagger = ae^{-ivt}$，因此对于声子有由Schrodinger绘景变为相互作用绘景为：

$$ a^{(I)}(t) = a e^{-i\nu t} ;$$ $$ a^{\dagger (I)}(t) = a^\dagger e^{i\nu t} .$$

代入上式，得：

$$ H_e^{(I)} = \frac{\Omega}{2} \sigma_- \otimes \left[\left( e^{i\mu t} - i\eta a^\dagger e^{-i((\mu + \nu)t++ \Delta\phi)} - i\eta a e^{-i((\mu - \nu)t+ \Delta\phi)} \right) + \text{h.c.}\right]. $$

注意到这个式子是我们基于原来的$H_{Raman}$导出的，它自然对应着红边带的情况，前文已经有相关说明。

## 由此得到蓝边带和红边带的Hamilton量

利用旋转波近似，略去载波与高频项，得：

$$ H_{BSB} \approx \frac{\Omega \hbar}{2} i \eta \left( \sigma_+ \otimes a^\dagger e^{i((\nu - \mu)t + \phi_b)} - \sigma_- \otimes a e^{-i((\nu - \mu)t + \phi_b)} \right) .$$

$$ H_{RSB} \approx \frac{\Omega \hbar}{2} i \eta \left(\sigma_+ \otimes a e^{i((\mu - \nu)t + \phi_r)} - \sigma_- \otimes a^\dagger e^{-i((\mu - \nu)t + \phi_r)} \right) .$$

<!-- $$H_{BSB}=\frac{\Omega \hbar}{2} \left( \sigma_+ e^{i(-\mu t + \phi_b)} + \sigma_- e^{-i(-\mu t + \phi_b)} \right) + \\
\frac{\Omega \hbar}{2} i \eta \left( \sigma_+ a^\dagger e^{i((\nu - \mu)t + \phi_b)} - \sigma_- a e^{-i((\nu - \mu)t + \phi_b)} \right) + \\
\frac{\Omega \hbar}{2} i \eta \left(\sigma_+ a e^{i(-(\nu + \mu)t + \phi_b)} - \sigma_- a^\dagger e^{-i(-(\nu + \mu)t + \phi_b)} \right).
$$

$$H_{RSB}=\frac{\Omega \hbar}{2} \left( \sigma_+ e^{i(\mu t + \phi_r)} + \sigma_- e^{-i(\mu t + \phi_r)} \right) + \\
\frac{\Omega \hbar}{2} i \eta \left( \sigma_+ a^\dagger e^{i((\nu + \mu)t + \phi_r)} - \sigma_- a e^{-i((\nu + \mu)t + \phi_r)} \right) + \\
\frac{\Omega \hbar}{2} i \eta \left(\sigma_+ a e^{i((\mu - \nu)t + \phi_r)} - \sigma_- a^\dagger e^{-i((\mu - \nu)t + \phi_r)} \right).$$ -->

最终得到总的Hamilton量为：

$$H=H_{BSB} + H_{RSB} = \frac{\Omega \hbar}{2} i \eta \left[  \left( \sigma_+ \otimes a^\dagger e^{i((\nu - \mu)t + \phi_b)} - \sigma_- \otimes a e^{-i((\nu - \mu)t + \phi_b)} \right) + \left(\sigma_+ \otimes a e^{i((\mu - \nu)t + \phi_r)} - \sigma_- \otimes a^\dagger e^{-i((\mu - \nu)t + \phi_r)} \right) \right]. $$

<!-- $$H=H_{BSB} + H_{RSB} \\ 
\approx \frac{\Omega \hbar}{2} i \eta [ (\sigma_+ a e^{i(-(\nu + \mu)t + \phi_b)} - \sigma_- a e^{-i((\nu - \mu)t + \phi_b)}) +\\
(\sigma_+ a e^{i(-(\nu + \mu)t + \phi_b)} - \sigma_- a^\dagger e^{-i(-(\nu + \mu)t + \phi_b)}) +\\
(\sigma_+ a^\dagger e^{i((\nu + \mu)t + \phi_r)} - \sigma_- a e^{-i((\nu + \mu)t + \phi_r)}) +\\
(\sigma_+ a e^{i((\mu - \nu)t + \phi_r)} - \sigma_- a^\dagger e^{-i((\mu - \nu)t + \phi_r)})]. $$ -->

## 接下来考虑把它写成一个好看的形式

先看含$a^{\dagger}e^{i\nu t}$项，令$\phi=\frac{\phi_r-\phi_b}{2}$和$\theta=\frac{\phi_r+\phi_b}{2}$，则记$\sigma_\theta=\sigma_+e^{i\theta}-\sigma_-e^{-i\theta}$，这一项可化为：

$$ i \frac{\Omega \hbar}{2} \eta \sigma_\theta e^{-i(\mu t + \phi)} \otimes a^{\dagger} e^{i\nu t}. $$

再看含$ae^{-i\nu t}$项，同理：

$$ i \frac{\Omega \hbar}{2} \eta \sigma_\theta e^{i(\mu t + \phi)} \otimes a e^{-i\nu t}. $$

综上，这个Hamilton量写为：

$$H = i \frac{\Omega \hbar}{2} \eta(\sigma_\theta e^{-i(\mu t + \phi)} \otimes a^{\dagger} e^{i\nu t} + \sigma_\theta e^{i(\mu t + \phi)} \otimes a e^{-i\nu t}) . $$

选定$\phi_b=\pi,\ \phi_r=0$，推得$\theta=\pi/2,\ \phi=-\pi/2$，则$\sigma_\theta=i\sigma_+-(-i)\sigma_-=i\sigma_x$得到：

$$ H=i \frac{\Omega \hbar}{2} \eta \sigma_x \otimes (a^{\dagger} e^{i\nu t} e^{-i\mu t} + a e^{-i\nu t} e^{i\mu t} ) .$$

接下来考虑它的各项$\Omega\to\Omega_j $只与离子有关，$\eta\to\eta_{j,k}$与离子和声子都有关，$\sigma_x\to\sigma_x^j$只与离子有关以及$ae^{-i\nu t}\to ae^{-i\nu_k t}_k$只与声子有关，然后将它推广到多离子和声子的体系：

$$ H_{M.I.} = \sum_{j,k} i \frac{\Omega_j \hbar}{2} \eta_{j,k} \sigma_x^j \otimes (a_k^{\dagger} e^{i\nu_k t} e^{-i\mu t} + a_k e^{-i\nu_k t} e^{i\mu t} ) .$$

然后我们将它代入时间演化算符，并利用Magnus展开$U(t)=e^{\sum_lM_l(t)}$，其中第一项为：

$$ M_1(t) = -\frac{i}{\hbar} \int_0^t H_{M.I.}(t_1) \, dt_1 .$$

第二项为：

$$ M_2(t) = \frac{1}{2} \left(-\frac{i}{\hbar}\right)^2 \int_0^t \int_0^{t_1} [H_{M.I.}(t_1), H_{M.I.}(t_2)] \, dt_2 \, dt_1. $$

第三项及以后由于$[M_2(t_1), H_{M.I.}(t_2)]=0$消失掉了。

## 分别计算：第一项

$$ M_1(t) = -\frac{i}{\hbar} \int_0^t H_{M.I.}(t_1) \, dt_1 \\
=\sum_{j,k} \sigma_x^j \otimes \eta_{j,k} \frac{\Omega_j}{2}(a_k^{\dagger}\int_0^te^{i(\nu_k-\mu)t_1}\, dt_1 - a_k\int_0^te^{-i(\nu_k-\mu)t}\, dt_1)\\
=\sum_{j,k} \sigma_x^j \otimes (a_k^{\dagger}\alpha_{j,k}(t)-a_k\alpha_{j,k}^*(t)) .$$

其中：

$$ \alpha_{j,k}(t) =-\eta_{j,k}\frac{\Omega_j}{2} \int_0^te^{i(\nu_k-\mu)t_1}\, dt_1\\
=-\dfrac{\eta_{j,k}\Omega_j(e^{i(\nu_k-\mu)t}-1)}{2i(\nu_k-\mu)} .$$

欲使它为0，则积分时间$t=\frac{2 N \pi}{\nu_k-\mu}$。

## 分别计算：第二项

$$ M_2(t) = \frac{1}{2} \left(-\frac{i}{\hbar}\right)^2 \int_0^t \int_0^{t_1} [H_{M.I.}(t_1), H_{M.I.}(t_2)] \, dt_2 \, dt_1\\
=-\frac{1}{2}\sum_{j,k}\sum_{l,m}\int_0^t \int_0^{t_1}\eta_{j,k} \frac{\Omega_j}{2} \eta_{l,m} \frac{\Omega_l}{2} [\sigma_x^j\otimes(a_k^{\dagger}e^{i(\nu_k-\mu) t_1} + a_ke^{-i(\nu_k-\mu) t_1}),\ \sigma_x^l\otimes(a_m^{\dagger}e^{i(\nu_m-\mu) t_2} + a_me^{-i(\nu_m-\mu) t_2})]\, dt_2 \, dt_1 .$$

要计算这个对易子$ [\sigma_x^j \otimes (a_k^\dagger e^{i(\nu_k - \mu) t_1} + a_k e^{-i(\nu_k - \mu) t_1}), \sigma_x^l \otimes (a_m^\dagger e^{i(\nu_m - \mu) t_2} + a_m e^{-i(\nu_m - \mu) t_2})]$，我们首先应用对于张量积算子 $ A \otimes B $ 和 $ C \otimes D $ 的对易子公式$ [A \otimes B, C \otimes D] = [A, C] \otimes (B D) + (C A) \otimes [B, D]. $

对于 Pauli-x 算子 $ \sigma_x $，我们有 $ [\sigma_x^j, \sigma_x^l] = 0 $ 恒成立。

接下来计算 $ [a_k^\dagger e^{i(\nu_k - \mu) t_1} + a_k e^{-i(\nu_k - \mu) t_1}, a_m^\dagger e^{i(\nu_m - \mu) t_2} + a_m e^{-i(\nu_m - \mu) t_2}] $。

这个对易子展开如下：

$ [a_k^\dagger e^{i(\nu_k - \mu) t_1} + a_k e^{-i(\nu_k - \mu) t_1}, a_m^\dagger e^{i(\nu_m - \mu) t_2} + a_m e^{-i(\nu_m - \mu) t_2}] $
$ = [a_k^\dagger, a_m^\dagger] e^{i((\nu_k - \mu) t_1 + (\nu_m - \mu) t_2)} + [a_k^\dagger, a_m] e^{i((\nu_k - \mu) t_1 - (\nu_m - \mu) t_2)} $
$ + [a_k, a_m^\dagger] e^{-i((\nu_k - \mu) t_1 - (\nu_m - \mu) t_2)} + [a_k, a_m] e^{-i((\nu_k - \mu) t_1 + (\nu_m - \mu) t_2)}. $

考虑产生和湮灭算子的对易关系：

$ [a_k, a_m^\dagger] = \delta_{km}, \quad [a_k, a_m] = 0, \quad [a_k^\dagger, a_m^\dagger] = 0, \quad [a_k^\dagger, a_m] = 0. $

整个对易子变为：

$ [\sigma_x^j \otimes (a_k^\dagger e^{i(\nu_k - \mu) t_1} + a_k e^{-i(\nu_k - \mu) t_1}), \sigma_x^l \otimes (a_m^\dagger e^{i(\nu_m - \mu) t_2} + a_m e^{-i(\nu_m - \mu) t_2})] = 0 \otimes (表达式) + (表达式) \otimes \delta_{km} e^{-i((\nu_k - \mu) t_1 - (\nu_m - \mu) t_2)} $

$ = \delta_{km} e^{-i((\nu_k - \mu) t_1 - (\nu_m - \mu) t_2)} \sigma_x^j \sigma_x^l. $

即这个积分最终可以表示为：

$$ M_2(t) = -\frac{1}{8}\sum_{j,l,k} \int_0^t \int_0^{t_1} \eta_{j,k}\eta_{l,k}\Omega_j\Omega_l\sigma_x^l\sigma_x^je^{-i(\nu_k-\mu)(t_1-t_2)} \, dt_2 \, dt_1 \\
=-i\sum_{k}\sum_{j,l}X_{j,l}^k\sigma_x^l\sigma_x^j .$$ 

## 接下来考虑单个声子的两离子系统

考虑单个声子，这时候指标k消失了。

$$ U(t,0) = \exp \left(\sum_{j} \sigma_x^j \otimes (a^{\dagger}\alpha_{j}(t)+a\alpha_{j}^*(t)) -i \sum_{j,l} X_{j,l}(t) \sigma_x^j \sigma_x^l \right). $$

对于两个离子，整个时间演化算符：

$$ U(t,0) = \exp \left(\sigma_x^1 \otimes (a^{\dagger}\alpha_{1}(t)-a\alpha_{1}^*(t)) + \sigma_x^2 \otimes (a^{\dagger}\alpha_{2}(t)-a\alpha_{2}^*(t)) -i ( X_{11}(t) \sigma_x^1 \sigma_x^1 + X_{12}(t) \sigma_x^1 \sigma_x^2 + X_{21}(t) \sigma_x^2 \sigma_x^1 + X_{22}(t) \sigma_x^2 \sigma_x^2 ) \right) .$$

下面仅考虑$M_2$项，在两离子系统中，$\sigma_x^1$ 和 $\sigma_x^2$ 是第 $1$ 个和第 $2$ 个离子的 Pauli-x 算子。我们将其表示为张量积形式：

$$ \sigma_x^1 = \sigma_x \otimes I, $$$$ \sigma_x^2 = I \otimes \sigma_x. $$

因此，表达式变为：

$$ U(t,0) = \exp \left( -i \left[ X_{11}(t) (\sigma_x \otimes I) (\sigma_x \otimes I) + X_{12}(t) (\sigma_x \otimes I) (I \otimes \sigma_x) + X_{21}(t) (I \otimes \sigma_x) (\sigma_x \otimes I) + X_{22}(t) (I \otimes \sigma_x) (I \otimes \sigma_x) \right] \right). $$

简化每项：$ (\sigma_x \otimes I) (\sigma_x \otimes I) = \sigma_x^2 \otimes I = I \otimes I = I_4 $，其中 $ I_4 $ 是 4x4 单位矩阵；$ (\sigma_x \otimes I) (I \otimes \sigma_x) = \sigma_x \otimes \sigma_x $；$ (I \otimes \sigma_x) (\sigma_x \otimes I) = \sigma_x \otimes \sigma_x $；$ (I \otimes \sigma_x) (I \otimes \sigma_x) = I \otimes \sigma_x^2 = I \otimes I = I_4 $。

于是，表达式简化为：

$$ U(t,0) = \exp \left( -i \left[ X_{11}(t) I_4 + (X_{12}(t) + X_{21}(t)) (\sigma_x \otimes \sigma_x) + X_{22}(t) I_4 \right] \right). $$

合并为：

$$ U(t,0) = \exp \left( -i \left[ (X_{11}(t) + X_{22}(t)) I_4 + (X_{12}(t) + X_{21}(t)) (\sigma_x \otimes \sigma_x) \right] \right). $$

令 $ \alpha(t) = X_{11}(t) + X_{22}(t) $ 和 $ \beta(t) = X_{12}(t) + X_{21}(t) $，则：

$$ U(t,0) = \exp \left( -i \left[ \alpha(t) I_4 + \beta(t) (\sigma_x \otimes \sigma_x) \right] \right). $$

因为 $ I_4 $ 和 $ \sigma_x \otimes \sigma_x $ 对易，我们可以将矩阵指数分解为：

$$ U(t,0) = \exp(-i \alpha(t) I_4) \exp(-i \beta(t) (\sigma_x \otimes \sigma_x)) $$

其中，$\exp(-i \alpha(t) I_4) = e^{-i \alpha(t)} I_4$。又我们知道 $ (\sigma_x \otimes \sigma_x)^2 = I_4 $，所以我们可以使用幂级数展开：$ \exp(-i \beta(t) (\sigma_x \otimes \sigma_x)) = I_4 \cos(\beta(t)) - i (\sigma_x \otimes \sigma_x) \sin(\beta(t)). $

因此，整个表达式为：

$$ U(t,0) = e^{-i \alpha(t)} \left[ I_4 \cos(\beta(t)) - i (\sigma_x \otimes \sigma_x) \sin(\beta(t)) \right]. $$

现在写出具体的矩阵形式：

$$ I_4 = \begin{pmatrix}
1 & 0 & 0 & 0 \\
0 & 1 & 0 & 0 \\
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1 \\
\end{pmatrix} ;$$$$ \sigma_x \otimes \sigma_x = \begin{pmatrix}
0 & 0 & 0 & 1 \\
0 & 0 & 1 & 0 \\
0 & 1 & 0 & 0 \\
1 & 0 & 0 & 0 \\
\end{pmatrix} .$$

接下来注意到对于耦合项，不存在离子与自身相耦合，因此$ \alpha(t) = X_{11}(t) + X_{22}(t) = 0 $，所以最终， $ U(t,0) $ 的矩阵形式为：

$$ U(t,0) = e^{-i \alpha(t)} \begin{pmatrix}
\cos(\beta(t)) & 0 & 0 & -i \sin(\beta(t)) \\
0 & \cos(\beta(t)) & -i \sin(\beta(t)) & 0 \\
0 & -i \sin(\beta(t)) & \cos(\beta(t)) & 0 \\
-i \sin(\beta(t)) & 0 & 0 & \cos(\beta(t)) \\
\end{pmatrix} ;$$即$$
U(t,0)=\begin{pmatrix}
\cos(\beta(t)) & 0 & 0 & -i \sin(\beta(t)) \\
0 & \cos(\beta(t)) & -i \sin(\beta(t)) & 0 \\
0 & -i \sin(\beta(t)) & \cos(\beta(t)) & 0 \\
-i \sin(\beta(t)) & 0 & 0 & \cos(\beta(t)) \\
\end{pmatrix} .$$

实验上通过设置合适的参数和相应的门演化时长$t$设置$\beta(t)$为$\pi/4$，则$U$可写为：

$$
U(t,0)=\dfrac{1}{\sqrt{2}}\begin{pmatrix}
1 & 0 & 0 & -i  \\
0 & 1 & -i  & 0 \\
0 & -i  & 1 & 0 \\
-i  & 0 & 0 & 1 \\
\end{pmatrix} .$$

进一步考虑，选择$\sigma_x$的本征态作为基矢：

$$ \ket{0_x} = \frac{1}{\sqrt{2}} (\ket{0} + \ket{1}) ;$$ $$\ket{1_x} = \frac{1}{\sqrt{2}} (\ket{0} - \ket{1}) .$$

又定义自旋态为：

$$\ket{0_x} = \ket{\downarrow_x} = \begin{pmatrix} 1 \\ 0 \end{pmatrix} \quad
\ket{1_x} = \ket{\uparrow_x} = \begin{pmatrix} 0 \\ 1 \end{pmatrix}
$$

