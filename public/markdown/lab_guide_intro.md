# 开篇与导论：实验数据处理作为参数估计

物理实验的目标通常可以用一句话概括：通过有限观测，获得某个物理量的可靠数值判断。以测量一根杆的长度为例，实验者真正关心的并不是游标卡尺或传感器显示了多少，而是“这根杆的长度是多少”。这里的“长度”在教学中常被称为真值；在更严谨的计量学表述中，更推荐称为被测量的值，或者待估计参数的值。因为测量并不是直接接触一个抽象的“真值”，而是要先规定被测量、测量方法和测量程序。例如，若要以微米精度给出一根钢杆的长度，就必须说明长度是在什么温度、压力和状态下定义的。

这一区分不是文字上的谨慎，而是实验数据处理的出发点。任何实际测量都受到仪器分辨率、环境扰动、读数方式、模型假设、有限采样和系统效应的影响。即使同一个人、同一仪器、同一根杆重复测量，也不会得到完全相同的一列数。因此，实验数据处理不是把“杂乱数据整理成一个好看的数”，而是在明确被测量和测量模型之后，从含有不确定性的观测中构造估计，并说明这个估计在多大程度上可信。

从数学上看，这正是参数估计问题。导论的核心任务，是把实验课中常见的平均值、标准差、误差、最小二乘和不确定度，放到同一个参数估计框架中理解。

## 1. 点估计：从参数估计开始

设希望估计的总体参数为 $\theta$。一次实验得到的观测数据记为

$$
X_1,X_2,\ldots,X_n.
$$

在实验完成以前，$X_1,\ldots,X_n$ 应看作随机变量。它们的随机性来自读数波动、仪器噪声、环境扰动、样本差异和其他未完全控制的因素。点估计的任务，是用这些随机变量构造一个统计量：

$$
\hat{\theta}
=
g(X_1,X_2,\ldots,X_n).
$$

这里 $\hat{\theta}$ 称为 $\theta$ 的点估计量，$g$ 是估计规则。这个定义本身并不要求 $g$ 一定接近 $\theta$；任意样本函数都可以称为统计量，但只有统计性质合适的统计量才是好的估计量。

当实验已经完成，观测值变为具体数据 $x_1,x_2,\ldots,x_n$，同一个规则给出

$$
\hat{\theta}_\mathrm{obs}
=
g(x_1,x_2,\ldots,x_n).
$$

这个数称为估计值。估计量是随机变量，估计值是一次实验后得到的具体数值。后续讨论期望、方差、偏差和均方误差时，讨论对象都是估计量；实验报告中写出的数值，则是估计值。

## 2. 期望：估计量在所有可能样本上的平均

期望不是对已经得到的数据再取一次平均，而是在重复实验意义下，对所有可能样本的加权平均。若随机样本

$$
\boldsymbol{X}
=
(X_1,X_2,\ldots,X_n)
$$

具有联合密度函数 $f(\boldsymbol{x};\theta)$，估计量为

$$
\hat{\theta}
=
g(\boldsymbol{X}),
$$

则它的数学期望为

$$
\mathbb{E}_{\theta}[\hat{\theta}]
=
\int_{\mathbb{R}^n}
g(x_1,x_2,\ldots,x_n)
f(x_1,x_2,\ldots,x_n;\theta)
\,\mathrm{d}x_1\mathrm{d}x_2\cdots\mathrm{d}x_n.
$$

若 $X_1,\ldots,X_n$ 独立同分布，且每个样本的密度为 $f(x;\theta)$，则联合密度为

$$
f(x_1,x_2,\ldots,x_n;\theta)
=
\prod_{i=1}^{n}
f(x_i;\theta),
$$

于是

$$
\mathbb{E}_{\theta}[\hat{\theta}]
=
\int_{\mathbb{R}^n}
g(x_1,x_2,\ldots,x_n)
\prod_{i=1}^{n}f(x_i;\theta)
\,\mathrm{d}x_1\mathrm{d}x_2\cdots\mathrm{d}x_n.
$$

这就是“期望等于所有可能样本上的加权平均”的严格含义。权重来自样本在统计模型下出现的概率，而不是实验者对已观测数据主观指定的权重。

这个定义也解释了估计量的二重性。符号 $\hat{\theta}$ 在理论分析中是随机变量；把观测数据代入后，$\hat{\theta}_\mathrm{obs}$ 才是一次实验得到的数。若估计规则为样本均值，则

$$
\bar{X}
=
\frac{1}{n}
\sum_{i=1}^{n}X_i
$$

是估计量，而

$$
\bar{x}
=
\frac{1}{n}
\sum_{i=1}^{n}x_i
$$

是估计值。前者可以谈期望和方差，后者是某一次实验结果。

## 3. 真值、被估计量与两层误差

物理实验中还要比纯数学参数估计多区分一层对象。设物理上希望测得的真实量为 $\Theta$。在理想叙述中，它可以被称为真值；但在实际测量中，真值往往依赖被测量的定义、实验条件和测量程序。例如一根钢杆的长度必须说明温度、支撑状态和测量方式，否则“真值”本身并不明确。

为了处理数据，实验者会建立物理模型、测量模型和统计模型，并在这些模型中定义一个可估计的总体参数 $\theta$。可以把 $\theta$ 理解为模型对 $\Theta$ 的可操作化表达。若模型、修正项和实验条件完全正确，可以近似认为

$$
\Theta=\theta.
$$

若二者不一致，则

$$
\Delta_\mathrm{sys}
=
\Theta-\theta
$$

对应系统误差或模型误差。它来自零点偏移、校准误差、温度修正遗漏、模型假设不充分等因素。

在统计估计层面，我们用观测数据构造估计量 $\hat{\theta}$，再由一次实验得到估计值 $\hat{\theta}_\mathrm{obs}$。相对于总体参数 $\theta$，测量误差可写为

$$
\mathrm{err}
=
\theta-\hat{\theta}.
$$

若把最终估计结果与物理真值 $\Theta$ 比较，则总误差可分解为

$$
\Theta-\hat{\theta}
=
(\Theta-\theta)
+
(\theta-\hat{\theta})
=
\Delta_\mathrm{sys}
+
\mathrm{err}.
$$

这就是两层估计关系：$\theta$ 是测量模型中对真值 $\Theta$ 的表示，$\hat{\theta}$ 是根据随机样本对 $\theta$ 的估计。前一层差异主要对应系统误差，后一层差异主要对应随机测量误差。

实验完成后，把估计量替换为估计值，可写成

$$
\mathrm{Err}_\mathrm{obs}
=
\Theta-\hat{\theta}_\mathrm{obs}
=
(\Theta-\theta)
+
(\theta-\hat{\theta}_\mathrm{obs}).
$$

这个式子表达的是本次实验结果相对物理真值的有符号误差分解；它通常无法直接计算，因为 $\Theta$ 和 $\theta$ 都不是直接可知的量。

<img src="/fig/parameter-estimation-two-layer-error.png" alt="两层估计与两层误差" width="70%">

图示说明：$\Theta$ 到 $\theta$ 的差异对应系统误差，$\theta$ 到 $\hat{\theta}$ 的差异对应随机测量误差。

实验数据处理通常更关注后一层。原因不是系统误差不重要，而是系统误差往往需要通过校准、修正、实验设计和模型改进处理；在进入统计数据处理时，通常已经把被测量定义为 $\theta$，并假定主要系统效应已经修正或计入不确定度。因此，后文说“误差”时，若没有特别说明，主要指

$$
\mathrm{err}
=
\theta-\hat{\theta},
$$

也就是估计量相对于总体参数的测量误差。若进一步在简化叙述中把 $\Theta=\theta$ 视为成立，则它也可看作相对于真值的误差。

偏差采用统计学中的标准约定：

$$
\mathrm{Bias}_{\theta}(\hat{\theta})
=
\mathbb{E}_{\theta}[\hat{\theta}]
-
\theta.
$$

注意，偏差的符号方向与上面定义的 $\mathrm{err}=\theta-\hat{\theta}$ 相反。因此

$$
\mathbb{E}_{\theta}[\mathrm{err}]
=
\theta-\mathbb{E}_{\theta}[\hat{\theta}]
=
-
\mathrm{Bias}_{\theta}(\hat{\theta}).
$$

这不是矛盾，而是符号约定不同。统计学通常把 bias 定义为“估计量的期望减去参数”，而实验中口头说“误差”时常说“真值减去测量值”。在推导时必须固定一种符号方向。

残差是第三个对象，它属于拟合后的数据分析层面。设拟合模型为

$$
y_i
=
f(x_i;\boldsymbol{\theta})
+
\varepsilon_i.
$$

得到参数估计值 $\hat{\boldsymbol{\theta}}$ 后，拟合值为

$$
\hat{y}_i
=
f(x_i;\hat{\boldsymbol{\theta}}),
$$

第 $i$ 个残差定义为

$$
r_i
=
y_i-\hat{y}_i.
$$

残差可以计算，因为 $y_i$ 和 $\hat{y}_i$ 都已知。真实误差项

$$
\varepsilon_i
=
y_i-f(x_i;\boldsymbol{\theta})
$$

通常不可计算，因为真实参数 $\boldsymbol{\theta}$ 未知。误差属于真实数据生成过程，残差属于拟合后的诊断工具，二者不能混用。

## 4. 总体参数与估计量：无偏估计的基本例子

无偏估计的定义是

$$
\mathbb{E}_{\theta}[\hat{\theta}]
=
\theta.
$$

也就是说，在所有可能样本上求平均时，估计量的期望等于被估计的总体参数。无偏性是估计规则的重复实验性质，不表示某一次估计值一定等于真值。

第一个例子是数学期望与样本均值。设随机变量 $X$ 的总体均值为

$$
\mu
=
\mathbb{E}[X].
$$

从总体中独立抽取样本 $X_1,\ldots,X_n$，用样本均值估计 $\mu$：

$$
\hat{\mu}
=
\bar{X}
=
\frac{1}{n}
\sum_{i=1}^{n}X_i.
$$

由期望线性性可得

$$
\mathbb{E}[\bar{X}]
=
\frac{1}{n}
\sum_{i=1}^{n}
\mathbb{E}[X_i]
=
\mu.
$$

因此，样本均值是总体均值的无偏估计量。

第二个例子是高斯均值与样本均值。若

$$
X_i
\sim
\mathcal{N}(\mu,\sigma^2),
\qquad
i=1,2,\ldots,n,
$$

且样本独立同分布，则 $\mu$ 是高斯分布的总体参数，而 $\bar{X}$ 是它的估计量。仍然有

$$
\mathbb{E}[\bar{X}]
=
\mu,
$$

因此 $\bar{X}$ 是高斯均值 $\mu$ 的无偏估计量。实验中若把重复测量值近似看作来自均值为 $l$ 的正态分布，则 $l$ 是测量模型中的总体参数，$\bar{X}$ 是它的估计量，$\bar{x}$ 是本次实验给出的估计值。

第三个例子是总体方差与样本方差。总体方差定义为

$$
\sigma^2
=
\mathrm{Var}(X)
=
\mathbb{E}\left[(X-\mu)^2\right].
$$

若直接用

$$
S_n^2
=
\frac{1}{n}
\sum_{i=1}^{n}
(X_i-\bar{X})^2
$$

估计 $\sigma^2$，由于 $\bar{X}$ 已经由同一组样本估计出来，会消耗一个自由度。利用恒等式

$$
\sum_{i=1}^{n}
(X_i-\bar{X})^2
=
\sum_{i=1}^{n}
(X_i-\mu)^2
-
n(\bar{X}-\mu)^2,
$$

取期望得

$$
\mathbb{E}
\left[
\sum_{i=1}^{n}
(X_i-\bar{X})^2
\right]
=
(n-1)\sigma^2.
$$

因此

$$
S^2
=
\frac{1}{n-1}
\sum_{i=1}^{n}
(X_i-\bar{X})^2
$$

满足

$$
\mathbb{E}[S^2]
=
\sigma^2,
$$

是总体方差 $\sigma^2$ 的无偏估计量。相反，

$$
\mathbb{E}[S_n^2]
=
\frac{n-1}{n}\sigma^2,
$$

所以 $S_n^2$ 是有偏估计量。

这些例子共同说明：总体参数是模型中的量，估计量是样本的函数，估计值是代入观测数据后的数。数学期望与样本均值、高斯均值与样本均值、总体方差与样本方差，都是这一区分的具体体现。

## 5. 均方误差、均值估计与 $S/\sqrt{n}$

在上面的符号约定中，测量误差为

$$
\mathrm{err}
=
\theta-\hat{\theta}.
$$

均方误差必须定义为误差平方的期望：

$$
\mathrm{MSE}_{\theta}(\hat{\theta})
=
\mathbb{E}_{\theta}
\left[
\mathrm{err}^2
\right]
=
\mathbb{E}_{\theta}
\left[
\left(
\theta-\hat{\theta}
\right)^2
\right].
$$

这里必须平方。若只写 $\mathbb{E}_{\theta}[\mathrm{err}]$，得到的是有符号平均误差，它只反映偏差方向，不能反映随机波动大小。

由于平方消去了符号，

$$
\mathbb{E}_{\theta}
\left[
\left(
\theta-\hat{\theta}
\right)^2
\right]
=
\mathbb{E}_{\theta}
\left[
\left(
\hat{\theta}-\theta
\right)^2
\right].
$$

将 $\hat{\theta}-\theta$ 分解为

$$
\hat{\theta}-\theta
=
\left(
\hat{\theta}
-
\mathbb{E}_{\theta}[\hat{\theta}]
\right)
+
\left(
\mathbb{E}_{\theta}[\hat{\theta}]
-
\theta
\right),
$$

可得偏差-方差分解：

$$
\mathrm{MSE}_{\theta}(\hat{\theta})
=
\mathrm{Var}_{\theta}(\hat{\theta})
+
\left[
\mathrm{Bias}_{\theta}(\hat{\theta})
\right]^2.
$$

这说明估计量的误差规模由两部分组成：随机波动导致的方差，以及估计量相对总体参数的平均偏离所导致的偏差平方。这里的偏差是统计意义下的 bias，不等同于前文物理层面的系统误差。无偏估计量的均方误差等于其方差；有偏估计量仍可能因为方差较小而具有较小 MSE。

<img src="/fig/bias-variance-mse-diagram.png" alt="Bias、Variance 与 MSE" width="70%">

图示说明：Bias 描述估计量分布中心相对 $\theta$ 的偏离，Variance 描述估计量自身的随机分散。

回到重复测量。若

$$
X_i
=
\theta+\varepsilon_i,
\qquad
\mathbb{E}[\varepsilon_i]=0,
\qquad
\mathrm{Var}(\varepsilon_i)=\sigma^2,
$$

且各次测量独立，则采用样本均值

$$
\hat{\theta}
=
\bar{X}
=
\frac{1}{n}
\sum_{i=1}^{n}X_i
$$

作为 $\theta$ 的估计量时，有

$$
\mathbb{E}[\bar{X}]
=
\theta,
$$

并且

$$
\begin{aligned}
\mathrm{Var}(\bar{X})
&=
\mathrm{Var}\left(
\frac{1}{n}
\sum_{i=1}^{n}X_i
\right) \\
&=
\frac{1}{n^2}
\sum_{i=1}^{n}
\mathrm{Var}(X_i) \\
&=
\frac{\sigma^2}{n}.
\end{aligned}
$$

因此 $\bar{X}$ 是无偏估计量，且

$$
\mathrm{MSE}(\bar{X})
=
\frac{\sigma^2}{n}.
$$

这就是均值估计的误差规模。由于真实的总体标准差 $\sigma$ 通常未知，实验处理中先用无偏样本方差

$$
S^2
=
\frac{1}{n-1}
\sum_{i=1}^{n}
(X_i-\bar{X})^2
$$

估计 $\sigma^2$，再用

$$
\hat{u}(\bar{X})
=
\frac{S}{\sqrt{n}}
$$

估计样本均值的标准不确定度。严格地说，$S^2$ 是 $\sigma^2$ 的无偏估计量，$S$ 本身并不是 $\sigma$ 的严格无偏估计量；但 $S/\sqrt{n}$ 是实验数据处理中评定均值标准误差的基本方法。

<img src="/fig/sample-mean-standard-error.png" alt="均值估计误差缩小" width="70%">

图示说明：重复测量取均值会使均值估计的标准误差按 $1/\sqrt{n}$ 缩小。

若样本之间存在相关性，则不能直接使用 $\sigma^2/n$。一般应写为

$$
\mathrm{Var}(\bar{X})
=
\frac{1}{n^2}
\sum_{i=1}^{n}
\sum_{j=1}^{n}
\mathrm{Cov}(X_i,X_j).
$$

只有在独立或相关性可忽略时，协方差和中的非对角项才可以忽略，$S/\sqrt{n}$ 的解释才成立。

从 MSE 角度看，样本方差的例子还说明无偏性不是唯一标准。若总体正态，

$$
X_i
\sim
\mathcal{N}(\mu,\sigma^2),
$$

则

$$
\hat{\sigma}^2_\mathrm{MLE}
=
\frac{1}{n}
\sum_{i=1}^{n}
(X_i-\bar{X})^2
=
S_n^2
$$

是正态模型下方差的最大似然估计量。它有偏，但它回答的是“哪个 $\sigma^2$ 使当前样本最可能出现”。无偏样本方差 $S^2$ 回答的是“哪个统计量的重复实验期望等于 $\sigma^2$”。若总体正态，还可以证明

$$
\mathrm{MSE}(S^2)
=
\frac{2\sigma^4}{n-1},
\qquad
\mathrm{MSE}(S_n^2)
=
\frac{2n-1}{n^2}\sigma^4.
$$

当 $n\gt1$ 时，$S_n^2$ 的 MSE 小于 $S^2$。因此，评价估计量时需要同时考虑偏差、方差、MSE、模型假设、样本量和使用目的。

## 6. 最大似然估计：由概率模型选择参数

最大似然估计把“拟合数据”转化为一个明确的概率问题。设观测数据为

$$
\boldsymbol{x}
=
(x_1,x_2,\ldots,x_n),
$$

统计模型为

$$
p_\mathrm{model}(\boldsymbol{x}\mid\boldsymbol{\theta}).
$$

在最大似然估计中，数据 $\boldsymbol{x}$ 已经固定，参数 $\boldsymbol{\theta}$ 是待选择的量。似然函数定义为

$$
L(\boldsymbol{\theta})
=
p_\mathrm{model}(\boldsymbol{x}\mid\boldsymbol{\theta}).
$$

最大似然估计为

$$
\hat{\boldsymbol{\theta}}_\mathrm{MLE}
=
\operatorname*{arg\,max}_{\boldsymbol{\theta}}
p_\mathrm{model}(\boldsymbol{x}\mid\boldsymbol{\theta}).
$$

若样本独立同分布，则

$$
p_\mathrm{model}(\boldsymbol{x}\mid\boldsymbol{\theta})
=
\prod_{i=1}^{n}
p_\mathrm{model}(x_i\mid\boldsymbol{\theta}).
$$

由于乘积形式不便计算，通常取对数似然：

$$
\ell(\boldsymbol{\theta})
=
\log L(\boldsymbol{\theta})
=
\sum_{i=1}^{n}
\log p_\mathrm{model}(x_i\mid\boldsymbol{\theta}).
$$

对数函数单调递增，所以

$$
\hat{\boldsymbol{\theta}}_\mathrm{MLE}
=
\operatorname*{arg\,max}_{\boldsymbol{\theta}}
\ell(\boldsymbol{\theta}).
$$

也常写成最小化负对数似然：

$$
\hat{\boldsymbol{\theta}}_\mathrm{MLE}
=
\operatorname*{arg\,min}_{\boldsymbol{\theta}}
\left[
-
\ell(\boldsymbol{\theta})
\right].
$$

这说明许多“损失函数”并不是任意选取的惩罚项，而是来自噪声模型的负对数似然。例如，高斯噪声给出平方损失，拉普拉斯噪声给出绝对值损失，伯努利观测给出交叉熵损失。若没有说明噪声模型，损失函数只是计算准则；若说明了噪声模型，它才具有明确的统计含义。

还要区分 MLE 与 MSE。MLE 是一种估计规则，它根据似然函数选择参数；MSE 是评价估计量长期性能的指标。一个估计量可以由 MLE 得到，也可以再用 MSE 衡量它的好坏。二者不在同一层次上，不能把“最大似然”和“最小均方误差”简单混为一谈。

## 7. 最大后验估计：把先验信息纳入估计

最大后验估计从贝叶斯公式出发。对事件形式，贝叶斯公式可写为

$$
P(A\mid B)
=
\frac{
P(B\mid A)P(A)
}{
P(B)
}.
$$

在参数估计中，令 $A$ 对应参数取值，$B$ 对应观测数据，可得连续参数形式：

$$
p(\boldsymbol{\theta}\mid\boldsymbol{x})
=
\frac{
p(\boldsymbol{x}\mid\boldsymbol{\theta})
p(\boldsymbol{\theta})
}{
p(\boldsymbol{x})
}.
$$

其中 $p(\boldsymbol{\theta})$ 是先验分布，表示观测数据之前对参数的认识；$p(\boldsymbol{\theta}\mid\boldsymbol{x})$ 是后验分布，表示观测数据之后对参数的认识；$p(\boldsymbol{x})$ 是证据项：

$$
p(\boldsymbol{x})
=
\int
p(\boldsymbol{x}\mid\boldsymbol{\theta})
p(\boldsymbol{\theta})
\,\mathrm{d}\boldsymbol{\theta}.
$$

在求使后验最大的 $\boldsymbol{\theta}$ 时，$p(\boldsymbol{x})$ 与 $\boldsymbol{\theta}$ 无关，因此

$$
\hat{\boldsymbol{\theta}}_\mathrm{MAP}
=
\operatorname*{arg\,max}_{\boldsymbol{\theta}}
p(\boldsymbol{\theta}\mid\boldsymbol{x})
=
\operatorname*{arg\,max}_{\boldsymbol{\theta}}
p(\boldsymbol{x}\mid\boldsymbol{\theta})
p(\boldsymbol{\theta}).
$$

取对数得到

$$
\hat{\boldsymbol{\theta}}_\mathrm{MAP}
=
\operatorname*{arg\,max}_{\boldsymbol{\theta}}
\left[
\log p(\boldsymbol{x}\mid\boldsymbol{\theta})
+
\log p(\boldsymbol{\theta})
\right].
$$

若先验在参数范围内近似为常数，则 $\log p(\boldsymbol{\theta})$ 是常数，MAP 退化为 MLE。若先验不是常数，MAP 会把实验数据和先验知识共同纳入估计。例如，参数非负、参数接近标称值、某些解在物理上不合理，这些信息都可以通过先验或约束进入估计过程。

从优化角度看，MAP 常等价于负对数似然加正则项。若

$$
\boldsymbol{\theta}
\sim
\mathcal{N}(\boldsymbol{0},\tau^2\mathbb{1}),
$$

则

$$
\log p(\boldsymbol{\theta})
=
\mathrm{const}
-
\frac{1}{2\tau^2}
\boldsymbol{\theta}^{\mathsf{T}}
\boldsymbol{\theta}.
$$

于是

$$
\hat{\boldsymbol{\theta}}_\mathrm{MAP}
=
\operatorname*{arg\,min}_{\boldsymbol{\theta}}
\left[
-
\log p(\boldsymbol{x}\mid\boldsymbol{\theta})
+
\frac{1}{2\tau^2}
\boldsymbol{\theta}^{\mathsf{T}}
\boldsymbol{\theta}
\right].
$$

若似然来自同方差高斯噪声，这就是平方残差加二次正则化。先验越集中，$\tau^2$ 越小，正则项越强，估计结果越倾向于靠近先验中心。机器学习中常把这一形式称为权重衰减或岭回归；在实验数据处理中，它可以解释为对物理合理参数范围的定量表达。

需要强调，似然 $p(\boldsymbol{x}\mid\boldsymbol{\theta})$ 不是“参数为真的概率”。在频率学派框架中，参数是固定未知量，数据是随机变量；在贝叶斯框架中，参数也用概率分布描述。MLE 与 MAP 的差异，正来自这两种视角对未知参数的处理方式不同。

## 8. 最小二乘：高斯噪声下的最大似然

最小二乘是实验拟合中最常用的方法。设观测模型为

$$
y_i
=
f(x_i;\boldsymbol{\theta})
+
\varepsilon_i,
\qquad
i=1,2,\ldots,n.
$$

给定参数 $\boldsymbol{\theta}$ 时，残差为

$$
r_i(\boldsymbol{\theta})
=
y_i
-
f(x_i;\boldsymbol{\theta}).
$$

普通最小二乘选择使残差平方和最小的参数：

$$
\hat{\boldsymbol{\theta}}_\mathrm{LS}
=
\operatorname*{arg\,min}_{\boldsymbol{\theta}}
\sum_{i=1}^{n}
\left[
y_i
-
f(x_i;\boldsymbol{\theta})
\right]^2.
$$

这个准则可以从最大似然推出。若误差独立同分布，并且

$$
\varepsilon_i
\sim
\mathcal{N}(0,\sigma^2),
$$

则

$$
p(y_i\mid x_i,\boldsymbol{\theta})
=
\frac{1}{\sqrt{2\pi}\sigma}
\exp
\left[
-
\frac{
\left(
y_i
-
f(x_i;\boldsymbol{\theta})
\right)^2
}{
2\sigma^2
}
\right].
$$

独立样本的对数似然为

$$
\ell(\boldsymbol{\theta})
=
-
\frac{n}{2}\log(2\pi)
-
n\log\sigma
-
\frac{1}{2\sigma^2}
\sum_{i=1}^{n}
\left[
y_i
-
f(x_i;\boldsymbol{\theta})
\right]^2.
$$

当 $\sigma$ 与 $\boldsymbol{\theta}$ 无关时，最大化 $\ell(\boldsymbol{\theta})$ 等价于最小化残差平方和。因此，在独立同方差高斯噪声假设下，最小二乘就是最大似然估计。

这也解释了深度学习和实验拟合中常见的平方误差损失。若模型输出被解释为高斯分布的均值，

$$
p_\mathrm{model}(y\mid x)
=
\mathcal{N}
\left(
y;
f(x;\boldsymbol{\theta}),
\sigma^2
\right),
$$

则负对数似然中与 $\boldsymbol{\theta}$ 有关的部分就是平方误差。若采用不同的输出分布，损失函数也会随之改变。

线性模型下，最小二乘还有解析形式。设

$$
\boldsymbol{y}
=
\mathbf{A}\boldsymbol{\theta}
+
\boldsymbol{\varepsilon},
$$

其中 $\mathbf{A}$ 是设计矩阵。普通最小二乘的目标函数为

$$
Q(\boldsymbol{\theta})
=
\left(
\boldsymbol{y}
-
\mathbf{A}\boldsymbol{\theta}
\right)^{\mathsf{T}}
\left(
\boldsymbol{y}
-
\mathbf{A}\boldsymbol{\theta}
\right).
$$

对 $\boldsymbol{\theta}$ 求梯度：

$$
\nabla_{\boldsymbol{\theta}}Q
=
-
2\mathbf{A}^{\mathsf{T}}
\left(
\boldsymbol{y}
-
\mathbf{A}\boldsymbol{\theta}
\right).
$$

令梯度为零，得到正规方程

$$
\mathbf{A}^{\mathsf{T}}\mathbf{A}
\hat{\boldsymbol{\theta}}
=
\mathbf{A}^{\mathsf{T}}
\boldsymbol{y}.
$$

若 $\mathbf{A}^{\mathsf{T}}\mathbf{A}$ 可逆，则

$$
\hat{\boldsymbol{\theta}}_\mathrm{OLS}
=
\left(
\mathbf{A}^{\mathsf{T}}\mathbf{A}
\right)^{-1}
\mathbf{A}^{\mathsf{T}}
\boldsymbol{y}.
$$

若

$$
\mathrm{Cov}(\boldsymbol{\varepsilon})
=
\sigma^2\mathbb{1},
$$

则

$$
\mathrm{Cov}
\left(
\hat{\boldsymbol{\theta}}_\mathrm{OLS}
\right)
=
\sigma^2
\left(
\mathbf{A}^{\mathsf{T}}\mathbf{A}
\right)^{-1}.
$$

当 $\sigma^2$ 未知时，常用残差平方和估计：

$$
\hat{\sigma}^2
=
\frac{1}{n-p}
\sum_{i=1}^{n}
r_i^2,
$$

其中 $p$ 是参数个数。分母使用 $n-p$，是因为拟合 $p$ 个参数消耗了 $p$ 个自由度。

若不同数据点具有不同标准不确定度 $u_i$，应采用加权最小二乘：

$$
\hat{\boldsymbol{\theta}}_\mathrm{WLS}
=
\operatorname*{arg\,min}_{\boldsymbol{\theta}}
\sum_{i=1}^{n}
\frac{
\left[
y_i
-
f(x_i;\boldsymbol{\theta})
\right]^2
}{
u_i^2
}.
$$

若

$$
\varepsilon_i
\sim
\mathcal{N}(0,u_i^2),
$$

且各误差独立，则上式同样来自最大似然。权重越大，表示该数据点不确定度越小，对拟合结果的约束越强。

若数据点之间存在相关性，应使用广义最小二乘。在线性模型

$$
\boldsymbol{y}
=
\mathbf{A}\boldsymbol{\theta}
+
\boldsymbol{\varepsilon},
\qquad
\mathrm{Cov}(\boldsymbol{\varepsilon})
=
\mathbf{C}
$$

下，广义最小二乘最小化

$$
Q_\mathrm{GLS}(\boldsymbol{\theta})
=
\left(
\boldsymbol{y}
-
\mathbf{A}\boldsymbol{\theta}
\right)^{\mathsf{T}}
\mathbf{C}^{-1}
\left(
\boldsymbol{y}
-
\mathbf{A}\boldsymbol{\theta}
\right).
$$

令梯度为零，得到

$$
\mathbf{A}^{\mathsf{T}}\mathbf{C}^{-1}
\mathbf{A}
\hat{\boldsymbol{\theta}}
=
\mathbf{A}^{\mathsf{T}}
\mathbf{C}^{-1}
\boldsymbol{y},
$$

因此

$$
\hat{\boldsymbol{\theta}}_\mathrm{GLS}
=
\left(
\mathbf{A}^{\mathsf{T}}\mathbf{C}^{-1}\mathbf{A}
\right)^{-1}
\mathbf{A}^{\mathsf{T}}\mathbf{C}^{-1}
\boldsymbol{y}.
$$

其协方差矩阵为

$$
\mathrm{Cov}
\left(
\hat{\boldsymbol{\theta}}_\mathrm{GLS}
\right)
=
\left(
\mathbf{A}^{\mathsf{T}}\mathbf{C}^{-1}\mathbf{A}
\right)^{-1}.
$$

当 $\mathbf{C}$ 为对角矩阵时，GLS 退化为加权最小二乘；当 $\mathbf{C}=\sigma^2\mathbb{1}$ 时，它退化为普通最小二乘。

拟合完成后，不能只看参数是否“合理”，还必须检查残差结构。若模型正确、误差估计合理，残差应近似表现为独立、零均值、方差稳定的随机波动。常用的拟合优度量包括

$$
\chi^2
=
\sum_{i=1}^{n}
\frac{r_i^2}{u_i^2},
$$

以及约化卡方

$$
\chi_\nu^2
=
\frac{\chi^2}{n-p}.
$$

其中 $p$ 是拟合参数个数，$n-p$ 是自由度。若模型和不确定度估计都较合理，$\chi_\nu^2$ 通常应在 $1$ 附近。若明显大于 $1$，可能说明模型不足、误差被低估或存在异常点；若明显小于 $1$，可能说明不确定度被高估，或数据之间存在未考虑的相关性。残差图、正态性检查、离群点检查和模型充分性检查，是拟合完成后的必要诊断。

## 9. 误差分析：直接测量与间接测量

前面得到的结论

$$
\hat{u}(\bar{X})
=
\frac{S}{\sqrt{n}}
$$

构成了误差分析的最基本原理：当采用样本均值 $\bar{X}$ 作为总体参数 $\theta$ 的估计量时，均值估计误差的标准尺度由总体标准差的 $1/\sqrt{n}$ 给出；总体标准差未知时，用无偏样本标准差 $S$ 代替。这里仍然只讨论测量误差，不讨论系统误差。也就是说，暂时认为主要系统效应已经修正，或已经被纳入后续不确定度来源；本节关心的是 $\theta-\hat{\theta}$ 这一层误差。

先看直接测量量。设直接测得的物理量为 $l$，重复测量模型为

$$
X_i
=
l+\varepsilon_i,
\qquad
\mathbb{E}[\varepsilon_i]=0,
\qquad
\mathrm{Var}(\varepsilon_i)=\sigma^2.
$$

若各次测量独立，采用

$$
\hat{l}
=
\bar{X}
=
\frac{1}{n}
\sum_{i=1}^{n}X_i
$$

估计 $l$，则测量误差随机变量为

$$
\mathrm{err}_l
=
l-\bar{X}.
$$

由于 $\mathbb{E}[\bar{X}]=l$，有

$$
\mathbb{E}[\mathrm{err}_l]
=
0.
$$

误差的方差为

$$
\mathrm{Var}(\mathrm{err}_l)
=
\mathrm{Var}(\bar{X})
=
\frac{\sigma^2}{n}.
$$

因此直接测量的误差标准尺度为

$$
\sqrt{\mathbb{E}[\mathrm{err}_l^2]}
=
\frac{\sigma}{\sqrt{n}}.
$$

在真实实验中 $\sigma$ 未知，于是先用

$$
S^2
=
\frac{1}{n-1}
\sum_{i=1}^{n}
(X_i-\bar{X})^2
$$

估计 $\sigma^2$，再用

$$
\frac{S}{\sqrt{n}}
$$

估计直接测量均值的误差标准尺度。需要强调，这不是对本次有符号误差 $\mathrm{err}_l$ 的直接计算；真实误差仍然未知。它给出的是误差可能波动的统计尺度。

再看间接测量量。设输出量由若干输入量决定：

$$
Y
=
f(X_1,X_2,\ldots,X_m).
$$

设输入量的真实值为 $x_1,\ldots,x_m$，估计值为 $\hat{x}_1,\ldots,\hat{x}_m$。输出真值与输出估计值分别为

$$
y
=
f(x_1,x_2,\ldots,x_m),
\qquad
\hat{y}
=
f(\hat{x}_1,\hat{x}_2,\ldots,\hat{x}_m).
$$

令输入误差为

$$
e_i
=
x_i-\hat{x}_i.
$$

当输入误差较小且 $f$ 在估计点附近可微时，对 $f$ 作一阶泰勒展开：

$$
f(x_1,\ldots,x_m)
\approx
f(\hat{x}_1,\ldots,\hat{x}_m)
+
\sum_{i=1}^{m}
\left.
\frac{\partial f}{\partial x_i}
\right|_{\hat{x}_1,\ldots,\hat{x}_m}
(x_i-\hat{x}_i).
$$

因此间接测量量的误差为

$$
e_y
=
y-\hat{y}
\approx
\sum_{i=1}^{m}
c_i e_i,
$$

其中

$$
c_i
=
\left.
\frac{\partial f}{\partial x_i}
\right|_{\hat{x}_1,\ldots,\hat{x}_m}
$$

称为灵敏系数。若输入误差的均值均为零，则

$$
\mathbb{E}[e_y]
\approx
0.
$$

若输入误差的协方差为

$$
\mathrm{Cov}(e_i,e_j)
=
u(x_i,x_j),
$$

则输出误差方差近似为

$$
\mathrm{Var}(e_y)
\approx
\sum_{i=1}^{m}
c_i^2\mathrm{Var}(e_i)
+
2\sum_{i=1}^{m-1}
\sum_{j=i+1}^{m}
c_i c_j\mathrm{Cov}(e_i,e_j).
$$

若记输入误差标准尺度为 $u(x_i)$，则

$$
\mathrm{Var}(e_y)
\approx
\sum_{i=1}^{m}
c_i^2u^2(x_i)
+
2\sum_{i=1}^{m-1}
\sum_{j=i+1}^{m}
c_i c_j u(x_i,x_j).
$$

若输入误差相互独立，协方差项为零：

$$
\mathrm{Var}(e_y)
\approx
\sum_{i=1}^{m}
c_i^2u^2(x_i).
$$

这就是误差合成公式的基本原理。它并不是凭空规定的“误差传播公式”，而是由一阶泰勒展开和方差运算得到的。对于线性模型，这个公式是精确的；对于非线性模型，它是局部线性近似。

矩阵形式更紧凑。令

$$
\boldsymbol{e}_{\boldsymbol{x}}
=
\boldsymbol{x}-\hat{\boldsymbol{x}},
\qquad
\boldsymbol{c}
=
\left[
c_1,\ c_2,\ \ldots,\ c_m
\right]^{\mathsf{T}},
$$

则

$$
e_y
\approx
\boldsymbol{c}^{\mathsf{T}}
\boldsymbol{e}_{\boldsymbol{x}}.
$$

若

$$
\mathbf{C}_{\boldsymbol{x}}
=
\mathrm{Cov}(\boldsymbol{e}_{\boldsymbol{x}}),
$$

则

$$
\mathrm{Var}(e_y)
\approx
\boldsymbol{c}^{\mathsf{T}}
\mathbf{C}_{\boldsymbol{x}}
\boldsymbol{c}.
$$

若输出量本身也是矢量，$\boldsymbol{y}=\boldsymbol{f}(\boldsymbol{x})$，令 $\mathbf{J}$ 为雅可比矩阵，则

$$
\boldsymbol{e}_{\boldsymbol{y}}
\approx
\mathbf{J}
\boldsymbol{e}_{\boldsymbol{x}},
\qquad
\mathbf{C}_{\boldsymbol{y}}
\approx
\mathbf{J}
\mathbf{C}_{\boldsymbol{x}}
\mathbf{J}^{\mathsf{T}}.
$$

这条公式也解释了为什么拟合参数之间的相关性不能随意忽略。只报告每个参数的标准误差，而忽略协方差，可能会低估组合量的误差尺度。

## 10. 不确定度评定：A 类、B 类、合成与扩展

误差分析讨论的是“真实误差如何由输入误差传到输出误差”。不确定度评定讨论的是另一件事：真实误差不可直接知道时，怎样用数据、仪器信息和模型假设给出误差尺度的定量评定。不确定度不是已经发生的真实误差，而是对被测量值可能分散范围的描述。

标准不确定度记为 $u(x)$，它与标准差具有相同量纲。对直接重复测量，A 类评定来自观测数据的统计分析。设对同一输入量 $x$ 重复测量得到

$$
x_1,x_2,\ldots,x_n,
$$

样本均值为

$$
\bar{x}
=
\frac{1}{n}
\sum_{i=1}^{n}x_i,
$$

样本标准差为

$$
s
=
\sqrt{
\frac{1}{n-1}
\sum_{i=1}^{n}
(x_i-\bar{x})^2
}.
$$

若以 $\bar{x}$ 作为输入量估计值，则其 A 类标准不确定度为

$$
u_\mathrm{A}(\bar{x})
=
\frac{s}{\sqrt{n}},
$$

对应自由度为

$$
\nu=n-1.
$$

B 类评定来自非重复观测的信息，例如仪器说明书、校准证书、分辨率、环境条件、经验判断和先验实验。它仍然要被转化为标准不确定度。若只知道误差落在区间 $[-a,a]$ 内，且认为区间内各值等可能，即矩形分布，则

$$
u_\mathrm{B}
=
\frac{a}{\sqrt{3}}.
$$

若误差更可能靠近零，可用三角分布近似，则

$$
u_\mathrm{B}
=
\frac{a}{\sqrt{6}}.
$$

若校准证书给出扩展不确定度 $U$ 和覆盖因子 $k$，则标准不确定度为

$$
u_\mathrm{B}
=
\frac{U}{k}.
$$

若同一输入量有多个相互独立的不确定度来源，可以先合成为该输入量的标准不确定度：

$$
u^2(x)
=
u_\mathrm{A}^2(x)
+
u_{\mathrm{B},1}^2(x)
+
u_{\mathrm{B},2}^2(x)
+
\cdots.
$$

对于间接测量量

$$
y=f(x_1,x_2,\ldots,x_m),
$$

采用估计值

$$
\hat{y}
=
f(\hat{x}_1,\hat{x}_2,\ldots,\hat{x}_m),
$$

并令

$$
c_i
=
\left.
\frac{\partial f}{\partial x_i}
\right|_{\hat{x}_1,\ldots,\hat{x}_m},
$$

则合成标准不确定度为

$$
u_c^2(y)
\approx
\sum_{i=1}^{m}
c_i^2u^2(x_i)
+
2\sum_{i=1}^{m-1}
\sum_{j=i+1}^{m}
c_i c_j u(x_i,x_j).
$$

若输入量相互独立，则

$$
u_c^2(y)
\approx
\sum_{i=1}^{m}
c_i^2u^2(x_i).
$$

<img src="/fig/error-propagation-uncertainty.png" alt="误差传播与不确定度" width="70%">

图示说明：输入量的不确定度经灵敏系数进入输出量，相关项由协方差项表示。

这里的公式形式与上一节的误差方差传播一致。区别在于，上一节从真实误差出发推导误差如何传播；本节把无法直接知道的误差尺度替换为可评定的标准不确定度。

合成标准不确定度还需要自由度信息。若各不确定度分量相互独立，且第 $i$ 个分量对输出的贡献为

$$
u_i(y)
=
|c_i|u(x_i),
$$

其自由度为 $\nu_i$，则常用 Welch-Satterthwaite 公式估计有效自由度：

$$
\nu_\mathrm{eff}
\approx
\frac{
u_c^4(y)
}{
\sum_{i=1}^{m}
\frac{u_i^4(y)}{\nu_i}
}.
$$

对于 A 类重复测量，通常有 $\nu_i=n_i-1$。对于 B 类分量，若来源可靠且自由度很大，可近似认为 $\nu_i=\infty$；若资料有限，则应根据来源可靠性给出有限自由度。

最终报告常使用扩展不确定度：

$$
U
=
k u_c(y),
$$

其中 $k$ 是覆盖因子。若输出量近似服从正态分布且有效自由度较大，约 $95\%$ 覆盖水平常取

$$
k\approx 2.
$$

更一般地，若希望给出覆盖概率 $p$，可用 $t$ 分布取

$$
k
=
t_{\nu_\mathrm{eff},(1+p)/2}.
$$

例如 $p=0.95$ 时，

$$
k
=
t_{\nu_\mathrm{eff},0.975}.
$$

于是测量结果可写为

$$
y
=
\hat{y}\pm U,
\qquad
U=ku_c(y).
$$

若给出具体数值，应同时说明单位、覆盖因子、有效自由度或覆盖概率，以及主要不确定度来源。例如

$$
L
=
(100.02\pm0.03)\,\mathrm{mm},
\qquad
k=2.
$$

这不是说真实误差已经等于 $0.03\,\mathrm{mm}$，而是说在所采用的测量模型、数据和不确定度评定方法下，被测量值相对估计值的合理分散尺度由 $U$ 表达。

相对不确定度常写为

$$
u_r
=
\frac{u_c(y)}{|\hat{y}|},
$$

扩展相对不确定度则为

$$
U_r
=
\frac{U}{|\hat{y}|}.
$$

若需要描述“精度”，可以用相对不确定度的倒数作粗略表征：

$$
P
=
\frac{1}{u_r}.
$$

这比用不可知的真实相对误差定义精度更符合实验实际。

## 11. 实验数据处理的总体流程

由以上讨论可以看出，实验数据处理的任务不是“计算平均值”“画图”“拟合曲线”这些孤立操作，而是围绕被测量或模型参数形成完整链条：

$$
\text{实验设计}
\rightarrow
\text{数据采集}
\rightarrow
\text{预处理}
\rightarrow
\text{建模}
\rightarrow
\text{参数估计}
\rightarrow
\text{不确定度评定}
\rightarrow
\text{结果表达}.
$$

在数据采集阶段，需要明确采样对象、采样间隔、传感器带宽、仪器分辨率、触发方式、同步方式和环境条件。若记录的是时间信号，采样频率 $f_\mathrm{s}$ 与信号最高有效频率 $f_\mathrm{max}$ 的关系尤其重要。理想情况下，为避免混叠，应满足

$$
f_\mathrm{s}
\gt
2f_\mathrm{max}.
$$

对于长度为 $N$、采样频率为 $f_\mathrm{s}$ 的时间记录，总采样时长为

$$
T
=
\frac{N}{f_\mathrm{s}},
$$

频率分辨率约为

$$
\Delta f
=
\frac{1}{T}
=
\frac{f_\mathrm{s}}{N}.
$$

因此，提高采样频率并不自动提高频率分辨率；若 $N$ 不随之增加，记录时长反而可能不足。噪声不是数据处理之后才出现的问题，而是从采集阶段就进入了整个估计链条。

预处理阶段的目标，是把原始记录转化为适合建模和估计的数据。常见工作包括单位换算、零点修正、基线漂移校正、缺失值处理、异常点识别、数据同步、重采样、归一化和初步可视化。预处理必须保留物理含义，不能为了让曲线“更平滑”而随意滤除真实信号，也不能在没有说明的情况下删除不符合预期的数据点。

从估计角度看，预处理本身也是测量模型的一部分。例如零点修正可写为

$$
Y
=
X-b,
$$

其中 $b$ 是零点估计值。若 $X$ 与 $b$ 独立，则

$$
u^2(Y)
=
u^2(X)
+
u^2(b).
$$

这说明修正并不会让不确定度消失。校准、插值、滤波和同步也类似，它们改变的是数据和噪声的统计结构。任何会影响幅值、相位、时间戳、单位或样本相关性的处理，都应在报告中留下可追溯记录。

信号处理方法用于从时域或频域数据中提取稳定特征。若把离散滤波写成线性变换

$$
\boldsymbol{z}
=
\mathbf{H}\boldsymbol{y},
$$

则滤波后协方差为

$$
\mathbf{C}_{\boldsymbol{z}}
=
\mathbf{H}
\mathbf{C}_{\boldsymbol{y}}
\mathbf{H}^{\mathsf{T}}.
$$

因此，平滑后的曲线看起来更稳定，并不意味着每个点都变成了独立且低不确定度的观测。滤波常会引入样本相关性，后续拟合若仍按独立样本处理，参数不确定度可能被低估。

拟合、优化与机器学习方法用于处理更复杂的估计任务。简单线性模型可用解析最小二乘求解；非线性模型通常需要迭代优化；含有先验知识或物理约束的问题可采用 MAP 或贝叶斯估计；高维复杂关系可采用机器学习模型。但无论方法多复杂，实验数据处理仍要回答同样的问题：模型是什么，参数代表什么，噪声如何建模，估计结果的不确定度如何评定，模型是否经过验证。

机器学习模型不应被理解为替代参数估计的黑箱捷径。若模型输出的是某个物理量的预测值，那么它仍然是估计量；若模型中含有可解释参数，那么训练过程仍然是在某个损失函数下进行参数估计。训练集、验证集、归一化方式、损失函数、正则化、模型容量和外推范围，都会影响估计偏差与方差。对于实验报告而言，模型预测值本身不足以构成结论，还需要给出误差评估、适用范围和失败条件。

结果展示是数据处理的最后环节，但不只是美化图表。图像应准确表达数据、模型、残差和不确定度。对于拟合结果，应同时展示原始数据、拟合曲线、误差棒、残差图和关键参数表。一个完整的参数结果表，至少应包含参数名称、估计值、单位、标准不确定度或置信区间、主要相关系数、自由度或样本量、采用的模型和主要假设。若只给出拟合曲线和一个 $R^2$，读者无法判断参数是否可辨识、误差是否被低估、残差是否存在结构，也无法复现实验结论。

## 12. 本讲义的基本观点

本讲义将围绕一个统一观点展开：实验数据处理的本质，是在物理模型和统计模型共同约束下进行参数估计。

物理模型回答“我们要测什么、变量之间有什么关系”；统计模型回答“观测为何会波动、误差如何分布、不确定度如何传播”；估计方法回答“怎样从数据得到参数”；诊断与展示回答“结果是否可信、如何表达”。平均值、标准差、最小二乘、最大似然、滤波、峰分析、误差传播和可视化，都是这一框架中的具体工具。

因此，学习实验数据处理时，不应把重点放在记忆公式，而应建立三层意识。

第一，任何测量都必须先定义被测量。没有清楚的被测量，就没有清楚的误差，也没有可解释的不确定度。

第二，任何估计都必须区分估计量和估计值。估计量有期望、方差、偏差和均方误差；估计值是一次实验给出的数。实验报告中的不确定度，来自估计量和测量模型的统计性质，而不是来自某个数字本身。

第三，任何数据处理都必须说明假设。平均值隐含独立重复观测和误差均值为零的假设；最小二乘隐含关于残差结构的假设；频域分析隐含采样和周期延拓假设；不确定度传播隐含局部线性化或分布传播假设。方法的适用性，取决于这些假设是否与实验相符。

最终，一个合格的实验结果应当至少包含四个要素：

$$
\text{估计值}
\quad+\quad
\text{不确定度}
\quad+\quad
\text{测量与数据处理方法}
\quad+\quad
\text{适用条件与主要假设}.
$$

这也是本讲义后续各章的主线：从原始实验数据出发，经过采样、预处理、统计建模、参数估计、误差分析、信号处理、拟合诊断和结果展示，得到一个既有数值结论、又有可信度说明的实验结果。
