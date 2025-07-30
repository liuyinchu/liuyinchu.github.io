# **经典力学笔记**

*这篇笔记是我转段面试前复习时写给自己看的，复习的主要是自己上课看书时写的手写笔记。书是**高显**老师写的教材，课是高显老师上的，真的非常好，所以我强烈推荐**直接去看书学书**而不是看这个~~简明垃圾笔记~~。*

---

## 大纲

1 Lagrange力学  
1.1 变分法  
1.1.1 泛函与变分（泛函一阶求导方法）  
1.1.2 Euler-Lagrange方程详细推导  
1.2 相对论时空观  
1.2.1 位形流形（位形、时空点、世界线、广义坐标、广义坐标变换、广义速度、约束、自由度、相对性原理、洛伦兹变换）  
1.2.2 度规（定义、典型、指标运算、协变逆变）  
1.3 最小作用量原理  
1.3.1 最小作用量原理（内容、给出广义动量）  
1.3.2 自由粒子（基于前述相对论时空观从世界线线长、四维形式S 与 EL方程、自然给出4-动量与4-速度、同理三维形式S 与 EL方程、以及自然非相对论极限、3-动量和3-速度）  
1.3.3 外场中的粒子（标量场、矢量场、张量场，每个都分四维形式、三维形式、非相对论极限总结）  
1.3.4 辅助变量与Lagrange乘子法  
1.4 对称性与守恒律  
1.4.1 运动常数与守恒量  
1.4.2 广义动量守恒与广义能量守恒  
1.4.3 作用量的形式变换  
2 经典问题  
2.1 两体问题  
2.1.1 两体系统（按前述原理从拉格朗日量出发、然后引入两体系统的解耦与零动量参考系、接下来考虑碰撞问题、接着进一步讲散射重点给出微分散射截面、最后讲位力定理）  
2.1.2 中心势场与开普勒问题（同样从拉格朗日力学原理出发给出动力学方程、自然引入角动量、然后由此代换得到轨道方程并引入有效势、接下来进入具体问题先从开普勒三大定律开始、然后给出求星体物理学参量和轨道参量两类星体轨道问题、最后补充LRL矢量）  
2.2 振动与微扰  
2.2.1 机械振动（从基本原理出发讲如何描述、然后引入简谐振动、在此基础上讲受迫振动并拓展到一般工程中的振动与隔振、重点是共振与频率图）  
2.2.2 微扰论（从基本原理出发讲微扰展开、并给出详细方法、然后结合稳定平衡位形附近的微扰展开做例子讲讲）  
2.2.3 小振动（重点讲自由振动与本征方程、然后引入简正模和简正坐标、最后补充声子）  
2.3 转动与刚体  
2.3.1 保度规变换（坐标变换与基变换关系、保度规、正交变换、主动观点与被动观点与绘景）  
2.3.2 无穷小转动与有限转动（无穷小转动、转动群、生成元、李代数、二维欧氏转动、三维欧氏转动、指数映射）  
2.3.3 角速度（角速度矩阵、角加速度、三维中的例子、编时操作）  
2.3.4 刚体的描述（质点系、质心系、平动、转动、相对运动、欧拉角是重点、惯量张量也是重点）  
2.3.5 刚体的运动（刚体的欧拉方程、刚体的拉格朗日力学、定轴转动、平面平行运动、定点转动、自由陀螺、进动与章动）  
3 Hamilton力学  
3.1 Hamilton正则方程（Hamilton量、Legendre变换、哈密顿正则方程、相图、例子）  
3.2 Poisson括号  
3.2.1 相空间的辛结构（辛空间与辛形式、哈密顿矢量场、辛内积与泊松括号）  
3.2.2 泊松括号（性质、雅可比恒等式、基本泊松括号、计算方法）  
3.2.3 用泊松括号表达力学量的演化（泊松括号形式的动力学方程、运动常数、泊松定理、角动量的泊松括号）  
3.2.4 时空变换算子（时间演化算子、空间平移算子、空间转动算子）  
3.3 正则变换  
3.3.1 正则变换（保辛、正则不变量、点变换、4种基本生成函数是重点、刘维尔定理）  
3.3.2 单参数正则变换（无穷小正则变换、演化即是正则变换、生成元与对称性）  
3.4 哈密顿雅可比理论（哈密顿雅可比方程、哈密顿主函数、分离变量法、哈密顿特征函数、求解例子、哈密顿主函数即是经典作用量）  


---

## **第一部分：Lagrange力学**

Lagrange力学是经典力学的一种的表述，它从能量的角度出发，通过求解一组微分方程（即Lagrange方程）来描述物体的运动。与牛顿力学相比，Lagrange力学在处理受约束的系统时尤其显示出其优越性。其核心数学工具是变分法。

### **1.1 变分法 (Calculus of Variations)**

变分法是处理泛函极值问题的数学分支。在物理学中，许多基本原理都可以通过变分原理来表述，例如分析力学中的哈密顿原理（最小作用量原理）、光学中的费马原理（最短光程原理）等。

#### **1.1.1 泛函与变分 (Functional and Variation)**

**泛函 (Functional)**

* **定义**：泛函是一种特殊的映射，它的定义域是一个函数空间，而值域是实数或复数。简单来说，泛函就是“函数的函数”。

* **与普通函数的对比**：
    * 普通函数 $f(x)$：输入一个或多个变量（数值），输出一个数值。
    * 泛函 $J[y(x)]$：输入一个函数 $y(x)$，输出一个数值。

* **一个典型的例子**：考虑连接平面上两点 $(x_1, y_1)$ 和 $(x_2, y_2)$ 的所有可能曲线 $y(x)$。计算每条曲线长度的积分就是一个泛函：
    $$
    J[y(x)] = \int_{x_1}^{x_2} \sqrt{1 + (y'(x))^2} dx
    $$
    这里，输入是函数 $y(x)$，输出是曲线的长度（一个标量）。我们的目标是找到一条曲线，使得这个泛函 $J$ 取最小值。

**变分 (Variation)**

变分是泛函分析中的一个核心概念，类似于普通函数中的微分。它描述了当输入函数 $y(x)$ 发生一个微小的变化 $\delta y(x)$ 时，泛函 $J[y(x)]$ 的值的线性主部变化 $\delta J$。

* **函数的微小变化**：我们考虑对函数 $y(x)$ 施加一个微小的扰动，得到一个新的函数 $\tilde{y}(x)$：
    $$
    \tilde{y}(x) = y(x) + \epsilon \eta(x)
    $$
    其中：
    * $y(x)$ 是我们正在研究的“基准”函数。
    * $\eta(x)$ 是一个任意的、在边界点为零的连续可微函数，即 $\eta(x_1) = \eta(x_2) = 0$。这保证了所有比较的函数都通过相同的端点。
    * $\epsilon$ 是一个无穷小参数。

    这个微小的函数变化量 $\delta y(x)$ 就定义为：
    $$
    \delta y(x) = \epsilon \eta(x)
    $$

* **泛函的一阶变分**：现在，我们将新的函数 $\tilde{y}(x)$ 代入泛函 $J$ 中，得到一个依赖于 $\epsilon$ 的普通函数：
    $$
    J(\epsilon) = J[y(x) + \epsilon \eta(x)] = \int_{x_1}^{x_2} F(x, y + \epsilon \eta, y' + \epsilon \eta') dx
    $$
    其中 $F(x, y, y')$ 是被积函数。

    泛函 $J$ 的**一阶变分** $\delta J$ 定义为 $J(\epsilon)$ 在 $\epsilon = 0$ 处的关于 $\epsilon$ 的一阶导数乘以 $\epsilon$：
    $$
    \delta J = \left. \frac{d J(\epsilon)}{d \epsilon} \right|_{\epsilon=0} \cdot \epsilon
    $$
    或者更常见地，我们直接定义为：
    $$
    \delta J = \left. \frac{d}{d\epsilon} J[y(x) + \epsilon \eta(x)] \right|_{\epsilon=0}
    $$
    （在实际计算中，通常将 $\delta J$ 定义为不含 $\epsilon$ 的部分，即 $\delta J = \int (\dots) \eta(x) dx$）。

* **泛函极值的必要条件**：与普通函数 $f(x)$ 在极值点处一阶导数为零（$df/dx = 0$）相类似，一个泛函 $J[y(x)]$ 在函数 $y_0(x)$ 处取得极值（极大值或极小值）的**必要条件**是它的一阶变分为零：
    $$
    \delta J = 0
    $$
    对于所有满足边界条件的任意函数 $\eta(x)$ 都成立。

#### **1.1.2 Euler-Lagrange方程详细推导**

Euler-Lagrange方程是使得泛函取极值的函数 $y(x)$ 所必须满足的微分方程。

**推导过程**

我们从泛函极值的必要条件 $\delta J = 0$ 出发。考虑泛函：
$$J[y(x)] = \int_{x_1}^{x_2} F(x, y(x), y'(x)) dx$$

1.  **计算泛函的变分**：
    $$
    \delta J = \delta \int_{x_1}^{x_2} F(x, y, y') dx = \int_{x_1}^{x_2} \delta F(x, y, y') dx
    $$
    由于 $x$ 是自变量，其变分为零 $\delta x = 0$。我们对 $F$ 进行全变分：
    $$
    \delta F = \frac{\partial F}{\partial y} \delta y + \frac{\partial F}{\partial y'} \delta y'
    $$
    这里，$\delta y = \epsilon \eta(x)$，并且
    $$
    \delta y' = \delta \left(\frac{dy}{dx}\right) = \frac{d}{dx}(\delta y) = \frac{d}{dx}(\epsilon \eta(x)) = \epsilon \eta'(x)
    $$
    所以，变分运算和微分运算可以交换次序：$\delta(y') = (\delta y)'$。

2.  **代入积分**：
    $$
    \delta J = \int_{x_1}^{x_2} \left( \frac{\partial F}{\partial y} \delta y + \frac{\partial F}{\partial y'} \delta y' \right) dx = 0
    $$

3.  **使用分部积分 (Integration by Parts)**：
    为了将 $\delta y'$ 上的依赖转移到 $\delta y$ 上，我们对第二项进行分部积分：
    $$
    \int_{x_1}^{x_2} \frac{\partial F}{\partial y'} \delta y' dx = \int_{x_1}^{x_2} \frac{\partial F}{\partial y'} \frac{d(\delta y)}{dx} dx
    $$
    根据分部积分公式 $\int u dv = uv - \int v du$，令 $u = \frac{\partial F}{\partial y'}$，$dv = \frac{d(\delta y)}{dx} dx$，则 $du = \frac{d}{dx}\left(\frac{\partial F}{\partial y'}\right) dx$，$v = \delta y$。
    $$
    \int_{x_1}^{x_2} \frac{\partial F}{\partial y'} \delta y' dx = \left[ \frac{\partial F}{\partial y'} \delta y \right]_{x_1}^{x_2} - \int_{x_1}^{x_2} \frac{d}{dx}\left(\frac{\partial F}{\partial y'}\right) \delta y dx
    $$

4.  **利用边界条件**：
    由于所有比较的路径都必须通过固定的端点 $(x_1, y_1)$ 和 $(x_2, y_2)$，所以扰动函数 $\eta(x)$ 在边界点必须为零，即 $\eta(x_1) = \eta(x_2) = 0$。
    因此，$\delta y(x_1) = \epsilon \eta(x_1) = 0$ 和 $\delta y(x_2) = \epsilon \eta(x_2) = 0$。
    这使得分部积分中的边界项为零：
    $$
    \left[ \frac{\partial F}{\partial y'} \delta y \right]_{x_1}^{x_2} = 0
    $$

5.  **合并积分项**：
    将分部积分的结果代回到 $\delta J$ 的表达式中：
    $$
    \delta J = \int_{x_1}^{x_2} \frac{\partial F}{\partial y} \delta y dx - \int_{x_1}^{x_2} \frac{d}{dx}\left(\frac{\partial F}{\partial y'}\right) \delta y dx = 0
    $$
    合并成一个积分：
    $$
    \int_{x_1}^{x_2} \left[ \frac{\partial F}{\partial y} - \frac{d}{dx}\left(\frac{\partial F}{\partial y'}\right) \right] \delta y dx = 0
    $$

6.  **变分法基本引理 (Fundamental Lemma of Calculus of Variations)**：
    这个积分等式必须对**任意**满足条件的扰动函数 $\delta y = \epsilon \eta(x)$ 都成立。根据变分法基本引理，如果一个连续函数 $g(x)$ 与任意一个在区间端点为零的函数 $\eta(x)$ 的乘积在区间 $[x_1, x_2]$ 上的积分为零，那么这个函数 $g(x)$ 在该区间上必然恒等于零。
    因此，被积函数必须处处为零：
    $$
    \frac{\partial F}{\partial y} - \frac{d}{dx}\left(\frac{\partial F}{\partial y'}\right) = 0
    $$

**最终形式**

这就是著名的**Euler-Lagrange方程**:
$$\frac{\partial F}{\partial y} - \frac{d}{dx}\left(\frac{\partial F}{\partial y'}\right) = 0$$
任何使得泛函 $J[y(x)]$ 取极值的函数 $y(x)$ 都必须满足这个二阶常微分方程。在Lagrange力学中，这里的函数 $F$ 就是拉格朗日量 $L$，而自变量 $x$ 则是时间 $t$。

---

### **1.2 相对论时空观 (Relativistic Spacetime View)**

经典Lagrange力学建立在牛顿的绝对时空观之上，即时间和空间是相互独立的。然而，狭义相对论揭示了时间和空间是一个统一的四维整体，我们称之为“时空”。物理定律需要在满足相对性原理的洛伦兹变换下保持形式不变。

#### **1.2.1 位形流形与时空概念 (Configuration Manifold and Spacetime Concepts)**

在深入相对论之前，我们先回顾和梳理经典力学中的一些基本概念，然后将它们与相对论中的概念进行对比。

**经典框架 (Classical Framework):**

* **位形 (Configuration)**: 一个力学系统在某一瞬时所有质点位置的总体布局。对于一个由$N$个质点组成的系统，其位形可以由$3N$个笛卡尔坐标来描述。

* **约束 (Constraint)**: 限制系统运动的条件。例如，刚体上任意两点间距离保持不变。

* **自由度 (Degrees of Freedom)**: 独立确定系统位形所需要的最小坐标数目。记为$n$。约束的存在会减少系统的自由度。

* **广义坐标 (Generalized Coordinates)**: 为描述具有$n$个自由度的系统而引入的$n$个相互独立的坐标 $\{q_1, q_2, \dots, q_n\}$。它们不一定是长度量纲，可以是角度、面积等。

* **位形流形 (Configuration Manifold)**: 一个$n$维的抽象空间，其每个点都唯一地对应着力学系统的一种可能位形。系统的运动过程可以看作是位形流形中的一条轨迹。

* **广义速度 (Generalized Velocity)**: 广义坐标对时间的一阶导数，$\{\dot{q}_1, \dot{q}_2, \dots, \dot{q}_n\}$。系统的**状态**由其广义坐标和广义速度 $(q_i, \dot{q}_i)$ 完全确定。

* **广义坐标变换 (Generalized Coordinate Transformation)**: 描述同一系统可以选用不同的广义坐标系，它们之间可以通过函数关系进行变换：$Q_i = Q_i(q_1, \dots, q_n, t)$。Lagrange方程的优越性之一在于其形式在任意广义坐标变换下保持不变。

**相对论框架 (Relativistic Framework):**

* **时空点 / 事件 (Spacetime Point / Event)**: 在相对论中，一个物理事件由它发生的时间和地点共同确定。它是在四维时空中的一个点，坐标通常记为 $x^\mu = (x^0, x^1, x^2, x^3) = (ct, x, y, z)$。

* **世界线 (World Line)**: 一个物体在四维时空中的运动轨迹。它是一条连接了一系列无穷近的时空点的曲线，描述了物体在所有时刻的空间位置。

* **相对性原理 (Principle of Relativity)**: 这是狭义相对论的两个基本公设之一。
    1.  **物理定律的协变性**: 所有物理定律（包括力学、电磁学等）在一切惯性参考系中都具有相同的数学形式。
    2.  **光速不变原理**: 在所有惯性系中，真空中光速的大小恒为$c$，与光源和观察者的运动状态无关。

* **洛伦兹变换 (Lorentz Transformation)**: 连接两个相对做匀速直线运动的惯性系时空坐标的变换关系。它取代了经典力学中的伽利略变换，并确保了光速不变。
    对于一个沿$x$轴以速度$v$相对于$S$系运动的$S'$系，其坐标变换关系为：
    $$
    \begin{pmatrix} ct' \\ x' \\ y' \\ z' \end{pmatrix} =
    \begin{pmatrix}
    \gamma & -\beta\gamma & 0 & 0 \\
    -\beta\gamma & \gamma & 0 & 0 \\
    0 & 0 & 1 & 0 \\
    0 & 0 & 0 & 1
    \end{pmatrix}
    \begin{pmatrix} ct \\ x \\ y \\ z \end{pmatrix}
    $$
    其中 $\beta = v/c$，$ \gamma = (1 - \beta^2)^{-1/2} $ 是洛伦兹因子。

#### **1.2.2 度规 (Metric)**

为了在时空中定义“距离”和几何结构，我们引入了度规张量的概念。

* **定义 (Definition)**: 度规张量 $g_{\mu\nu}$ 是一个二阶对称张量，它定义了时空的几何。通过度规，我们可以计算两个无限近的时空点 $x^\mu$ 和 $x^\mu + dx^\mu$ 之间的**时空间隔**（或称不变距离）的平方 $ds^2$：
    $$
    ds^2 = g_{\mu\nu} dx^\mu dx^\nu
    $$
    这里我们使用了爱因斯坦求和约定（Einstein Summation Convention），即对重复出现的上、下指标进行求和。$ds^2$ 的值在洛伦兹变换下保持不变，是一个标量。

* **典型度规 (Typical Metric) - 闵可夫斯基度规**: 在狭义相对论的平直时空中，度规被称为闵可夫斯基度规（Minkowski Metric），记为 $\eta_{\mu\nu}$。其矩阵形式通常有两种约定：
    * $(+,-,-,-)$ 约定（常见于粒子物理）：
        $$
        \eta_{\mu\nu} = \begin{pmatrix} 1 & 0 & 0 & 0 \\ 0 & -1 & 0 & 0 \\ 0 & 0 & -1 & 0 \\ 0 & 0 & 0 & -1 \end{pmatrix}
        $$
    * $(-,+,+,+)$ 约定（常见于广义相对论）：
        $$
        \eta_{\mu\nu} = \begin{pmatrix} -1 & 0 & 0 & 0 \\ 0 & 1 & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 1 \end{pmatrix}
        $$
    两种约定在物理上是等价的，只是符号上的差别。我们将采用第一种 $(+,-,-,-)$ 约定。

* **协变与逆变 (Covariant and Contravariant)**: 在时空几何中，矢量和张量有两种不同的分量形式。
    * **逆变分量 (Contravariant Components)**: 用上指标表示，如四维位置矢量 $x^\mu = (ct, x, y, z)$。它们在坐标变换下的变换规律与坐标基矢的变换规律相反。
    * **协变分量 (Covariant Components)**: 用下指标表示，如四维梯度算子 $\partial_\mu = (\frac{\partial}{\partial x^0}, \frac{\partial}{\partial x^1}, \frac{\partial}{\partial x^2}, \frac{\partial}{\partial x^3})$。它们的变换规律与坐标基矢的变换规律相同。

* **指标运算 (Index Manipulation)**: 度规张量的核心作用是在逆变分量和协变分量之间进行转换，这个过程被称为**升降指标**。
    * **降指标 (Lowering an index)**:
        $$
        A_\mu = g_{\mu\nu} A^\nu
        $$
        例如，对于闵氏度规，位置矢量的协变分量为 $x_\mu = \eta_{\mu\nu} x^\nu = (ct, -x, -y, -z)$。
    * **升指标 (Raising an index)**: 需要使用逆度规 $g^{\mu\nu}$，它被定义为度规 $g_{\mu\nu}$ 的矩阵逆，满足 $g^{\mu\rho}g_{\rho\nu} = \delta^\mu_\nu$ (Kronecker delta)。
        $$
        A^\mu = g^{\mu\nu} A_\nu
        $$
        对于闵氏度规，其逆度规 $\eta^{\mu\nu}$ 在数值上与 $\eta_{\mu\nu}$ 完全相同。

通过这些工具，我们可以用一种几何化的、与坐标系选择无关的语言来优美地表述物理定律。

---

### **1.3 最小作用量原理 (Principle of Least Action)**

最小作用量原理，更准确地说是**哈密顿原理 (Hamilton's Principle)** 或**平稳作用量原理 (Principle of Stationary Action)**，是经典力学和现代物理学的基石之一。它指出，一个动力学系统从一个状态到另一个状态的真实运动路径，是使其“作用量”泛函取平稳值（通常是最小值）的那一条。

#### **1.3.1 最小作用量原理与广义动量**

* **内容 (Content)**:
    对于一个由Lagrangian $L(q, \dot{q}, t)$ 描述的系统，其在时间 $t_1$ 到 $t_2$ 之间的**作用量 (Action)** $S$ 定义为：
    $$
    S = \int_{t_1}^{t_2} L(q_i, \dot{q}_i, t) dt
    $$
    最小作用量原理断言：在所有连接起始位形 $q(t_1)$ 和终点位形 $q(t_2)$ 的可能路径中，系统实际遵循的物理路径是使得作用量 $S$ 的变分 $\delta S$ 为零的路径。
    $$
    \delta S = \delta \int_{t_1}^{t_2} L(q_i, \dot{q}_i, t) dt = 0
    $$
    我们之前已经证明，这个条件直接导出了Euler-Lagrange方程：
    $$
    \frac{d}{dt}\left(\frac{\partial L}{\partial \dot{q}_i}\right) - \frac{\partial L}{\partial q_i} = 0
    $$

* **广义动量 (Generalized Momentum)**:
    在Lagrange力学中，与广义坐标 $q_i$ 共轭的**广义动量**（或称**正则动量**）$p_i$ 定义为Lagrangian对相应广义速度 $\dot{q}_i$ 的偏导数：
    $$
    p_i \equiv \frac{\partial L}{\partial \dot{q}_i}
    $$
    这个定义非常重要。例如，如果Lagrangian $L$ 不显含某个广义坐标 $q_k$（即 $\partial L / \partial q_k = 0$），那么对应的广义动量 $p_k$ 就是守恒的：
    $$
    \frac{d p_k}{dt} = 0 \implies p_k = \text{const}
    $$
    这种坐标被称为**循环坐标 (cyclic coordinate)**。

#### **1.3.2 自由粒子 (Free Particle)**

我们现在用最小作用量原理来描述一个不受外力的自由粒子，并展示其相对论和非相对论形式。

* **四维形式 (4D Formulation)**
    1.  **世界线与作用量**: 在相对论中，一个自由粒子的运动轨迹是其在闵可夫斯基时空中的**世界线**。其作用量 $S$ 必须是一个洛伦兹不变量。最自然的选择是正比于世界线的“长度”，即固有时 $\tau$。时空间隔 $ds = c d\tau = \sqrt{\eta_{\mu\nu}dx^\mu dx^\nu}$ 是不变量。因此，我们定义作用量为：
        $$
        S = -mc \int_a^b ds = -mc \int_{\tau_1}^{\tau_2} \sqrt{\eta_{\mu\nu}\frac{dx^\mu}{d\tau}\frac{dx^\nu}{d\tau}} d\tau
        $$
        其中 $-mc$ 是为了保证在非相对论极限下得到正确结果而选择的比例常数。
    2.  **四维速度与四维动量**: 四维速度定义为 $u^\mu = \frac{dx^\mu}{d\tau}$。四维形式的Lagrangian可以视为 $L_{4D} = -mc\sqrt{\eta_{\mu\nu}u^\mu u^\nu}$。应用E-L方程可得到正确的运动方程。
        一个更简洁的方法是引入一个辅助变量（见1.3.4），或直接从作用量定义**四维动量** $p^\mu$。根据协变性，它必然与四维速度 $u^\mu$ 共线：
        $$
        p^\mu = m u^\mu = m \frac{dx^\mu}{d\tau}
        $$
        将 $u^\mu = \gamma(c, \mathbf{v})$ 代入，得到：
        $$
        p^\mu = \left( \frac{E}{c}, \mathbf{p} \right) = m \gamma (c, \mathbf{v})
        $$
        其中 $E=\gamma mc^2$ 是相对论能量，$\mathbf{p} = \gamma m\mathbf{v}$ 是相对论三维动量。对于自由粒子，E-L方程的结果就是 $\frac{dp^\mu}{d\tau}=0$，即四维动量守恒。

* **三维形式 (3D Formulation)**
    1.  **Lagrangian与E-L方程**: 将 $ds = c\sqrt{1-v^2/c^2}dt$ 代入作用量表达式，我们得到以实验室时间 $t$ 为积分变量的作用量：
        $$
        S = \int_{t_1}^{t_2} \left(-mc^2 \sqrt{1 - \frac{\mathbf{v}^2}{c^2}}\right) dt
        $$
        因此，相对论自由粒子的Lagrangian是：
        $$
        L = -mc^2 \sqrt{1 - \frac{\mathbf{v}^2}{c^2}}
        $$
    2.  **三维动量**: 根据广义动量的定义，我们计算三维动量 $\mathbf{p}$：
        $$
        \mathbf{p} = \frac{\partial L}{\partial \mathbf{v}} = -mc^2 \frac{-\mathbf{v}/c^2}{\sqrt{1 - \mathbf{v}^2/c^2}} = \frac{m\mathbf{v}}{\sqrt{1 - \mathbf{v}^2/c^2}} = \gamma m\mathbf{v}
        $$
        这与我们从四维形式中得到的结果一致。由于 $L$ 不显含位置坐标 $\mathbf{x}$，所以 $\frac{\partial L}{\partial \mathbf{x}}=0$，E-L方程给出 $\frac{d\mathbf{p}}{dt}=0$，即三维动量守恒。

* **非相对论极限 (Non-Relativistic Limit)**
    当速度 $v \ll c$ 时，我们对Lagrangian进行泰勒展开：
    $$
    L = -mc^2 \left(1 - \frac{v^2}{2c^2} + O\left(\frac{v^4}{c^4}\right)\right) = -mc^2 + \frac{1}{2}mv^2 + \dots
    $$
    忽略常数项 $-mc^2$（它不影响运动方程），我们得到经典的非相对论Lagrangian：
    $$
    L_{NR} \approx \frac{1}{2}mv^2 = T
    $$
    此时，三维动量为 $\mathbf{p} = \frac{\partial L_{NR}}{\partial \mathbf{v}} = m\mathbf{v}$，恢复了牛顿力学的形式。

#### **1.3.3 外场中的粒子 (Particle in an External Field)**

当粒子处在外场中时，我们需要在作用量中加入描述相互作用的项 $S_{int}$。
$$S = S_{\text{free}} + S_{\text{int}} = \int (-mc \, ds + L_{int}'d\tau)$$

* **标量场 (Scalar Field) $\phi(x^\mu)$**
    * **四维形式**: 相互作用项必须是洛伦兹标量。最简单的形式是 $-g\int \phi ds$，其中$g$是耦合常数。
    * **三维形式**: $L_{int} = -g\phi(t, \mathbf{x}) \sqrt{1-v^2/c^2}$。
    * **非相对论极限**: 场变化缓慢时， $L \approx \frac{1}{2}mv^2 - g\phi(t, \mathbf{x})$。这对应于一个势能为 $V(\mathbf{x}) = g\phi(\mathbf{x})$ 的场。

* **矢量场 (Vector Field) $A_\mu(x^\nu)$ - 电磁场**
    * **四维形式**: 相互作用项由四维矢量势 $A_\mu$ 和粒子四维速度 $u^\mu$ 构造，形式为 $-\frac{q}{c}\int A_\mu dx^\mu$。总作用量为：
        $$S = \int \left(-mc \, ds - \frac{q}{c} A_\mu dx^\mu\right)$$
        这给出了协变的洛伦兹力方程。
    * **三维形式**: 令 $A^\mu = (\Phi, \mathbf{A})$，其中 $\Phi$ 是标势，$\mathbf{A}$ 是矢势。$A_\mu dx^\mu = \eta_{\mu\nu}A^\nu dx^\mu = (\Phi c dt - \mathbf{A}\cdot d\mathbf{x})$。作用量中的被积函数（Lagrangian）为：
        $$L = -mc^2 \sqrt{1 - v^2/c^2} - q\Phi + \frac{q}{c}\mathbf{A}\cdot\mathbf{v}$$
    * **非相对论极限**:
        $$L_{NR} \approx \frac{1}{2}mv^2 - q\Phi + \frac{q}{c}\mathbf{A}\cdot\mathbf{v}$$
        这是带电粒子在电磁场中运动的经典Lagrangian。

* **张量场 (Tensor Field) $g_{\mu\nu}(x)$ - 引力场**
    * **四维形式**: 在广义相对论中，引力不是一种“力”，而是时空弯曲的表现。自由粒子（不受非引力作用）在弯曲时空中沿**测地线**运动。其作用量形式上与无场粒子完全相同，但度规 $g_{\mu\nu}$ 不再是闵可夫斯基度规，而是由爱因斯坦场方程决定的、随位置变化的张量场。
        $$S = -mc \int ds = -mc \int \sqrt{g_{\mu\nu}(x) dx^\mu dx^\nu}$$
        对该作用量求变分，得到的就是弯曲时空中的测地线方程。
    * **三维形式**: 形式非常复杂，通常不使用。
    * **非相对论极限**: 在弱引力场、低速情况下（$g_{00} \approx -(1+2\Phi_N/c^2)$，其中$\Phi_N$是牛顿引力势），测地线方程可以近似还原为牛顿第二定律 $\mathbf{a} = -\nabla\Phi_N$。

#### **1.3.4 辅助变量与Lagrange乘子法**

处理诸如 $L = -mc^2\sqrt{1-v^2/c^2}$ 这样的带有平方根的复杂Lagrangian时，直接计算变分很麻烦。我们可以引入辅助变量来简化问题。

* **辅助变量法 (Auxiliary Variable Method)**:
    以相对论自由粒子为例，我们可以引入一个辅助变量（或称“einbein”）$e(\tau)$，并构造一个新的作用量：
    $$
    S[x^\mu, e] = \int \frac{1}{2}\left(e^{-1}(\tau) g_{\mu\nu}\frac{dx^\mu}{d\tau}\frac{dx^\nu}{d\tau} - e(\tau)m^2c^2\right)d\tau
    $$
    这个新的作用量对于 $x^\mu$ 是二次的，求变分变得简单。
    1.  对 $e(\tau)$ 进行变分并令其为零，$\frac{\delta S}{\delta e}=0$，可以解出 $e(\tau)$。
    2.  将解出的 $e(\tau)$ 代回原作用量 $S[x^\mu, e]$，可以证明它会还原为我们最初的平方根形式的作用量 $S = -mc\int ds$。
    3.  因此，对这个二次型作用量直接求解 $x^\mu$ 的运动方程，其结果与从原始作用量出发是等价的。

* **Lagrange乘子法 (Lagrange Multiplier Method)**:
    这是一种更通用的处理约束的方法。如果系统运动需要满足一个约束条件 $\phi(q_i)=0$，我们可以将此约束通过一个Lagrange乘子 $\lambda(t)$ 添加到作用量中：
    $$
    S' = \int L(q_i, \dot{q}_i, t) dt + \int \lambda(t) \phi(q_i) dt
    $$
    在这里，我们将 $\lambda(t)$ 视为一个新的动力学变量。
    * 对 $\lambda$ 的变分 $\delta S' / \delta \lambda = 0$ 会自然地给出约束方程 $\phi(q_i)=0$。
    * 对 $q_i$ 的变分则会给出修改后的E-L方程，其中包含了由约束产生的广义约束力项。

---

### **1.4 对称性与守恒律 (Symmetry and Conservation Laws)**

在物理学中，“对称性”意味着系统在某种变换下保持不变。一个惊人的深刻联系在于，物理系统的每一种连续对称性，都对应着一个守恒的物理量。这一基本原理（诺特定理）为我们理解守恒律的起源提供了根本性的见解。

#### **1.4.1 运动常数与守恒量 (Constants of Motion and Conserved Quantities)**

* **定义**:
    * **运动常数 (Constant of Motion)**: 一个关于系统的广义坐标、广义速度和时间的函数 $F(q, \dot{q}, t)$，如果它的值沿着系统的真实运动轨迹不随时间改变，那么它就是一个运动常数。数学上，其全时间导数为零：
        $$
        \frac{dF}{dt} = \frac{\partial F}{\partial t} + \sum_i \left( \frac{\partial F}{\partial q_i} \dot{q}_i + \frac{\partial F}{\partial \dot{q}_i} \ddot{q}_i \right) = 0
        $$
        在计算时，需要代入由拉格朗日方程决定的 $\ddot{q}_i$。
    * **守恒量 (Conserved Quantity)**: 通常特指那些由于系统具有某种根本的对称性而导致保持不变的运动常数。例如，能量、动量、角动量都是守恒量。

    虽然两者常被混用，但“守恒量”一词的内涵更深，它揭示了不变性背后的对称性根源。

#### **1.4.2 广义动量守恒与广义能量守恒**

这里我们探讨两种最基本的对称性：空间平移对称性和时间平移对称性。

* **广义动量守恒 (空间平移对称性)**
    * **对称性**: 如果系统在某个方向（由广义坐标 $q_k$ 描述）上平移任意距离，其物理性质（即Lagrangian）保持不变，我们就说系统具有该方向上的空间平移对称性。
    * **Lagrangian的性质**: 这意味着Lagrangian $L$ 不显式地依赖于该广义坐标 $q_k$。这种坐标被称为**循环坐标 (Cyclic Coordinate)**。
        $$
        \frac{\partial L}{\partial q_k} = 0
        $$
    * **守恒律**: 将此条件代入Euler-Lagrange方程：
        $$
        \frac{d}{dt}\left(\frac{\partial L}{\partial \dot{q}_k}\right) - \frac{\partial L}{\partial q_k} = 0 \quad \implies \quad \frac{d}{dt}\left(\frac{\partial L}{\partial \dot{q}_k}\right) = 0
        $$
        根据广义动量的定义 $p_k = \partial L / \partial \dot{q}_k$，我们立即得到：
        $$
        \frac{dp_k}{dt} = 0 \quad \implies \quad p_k = \text{常数}
        $$
    * **结论**: **如果系统的Lagrangian不显含某个广义坐标，则该坐标对应的广义动量守恒。**
        * **平移对称性 $\Leftrightarrow$ 动量守恒**
        * **转动对称性 $\Leftrightarrow$ 角动量守恒** (若L不显含某个转角 $\phi$，则对应的角动量 $p_\phi$ 守恒)

* **广义能量守恒 (时间平移对称性)**
    * **对称性**: 如果系统的物理规律不随时间的推移而改变，我们就说系统具有时间平移对称性。
    * **Lagrangian的性质**: 这意味着Lagrangian $L$ 不显式地依赖于时间 $t$。
        $$
        \frac{\partial L}{\partial t} = 0
        $$
    * **推导**: 考虑Lagrangian的全时间导数：
        $$
        \frac{dL}{dt} = \sum_i \left( \frac{\partial L}{\partial q_i}\dot{q}_i + \frac{\partial L}{\partial \dot{q}_i}\ddot{q}_i \right) + \frac{\partial L}{\partial t}
        $$
        利用E-L方程 $\frac{\partial L}{\partial q_i} = \frac{d}{dt}\left(\frac{\partial L}{\partial \dot{q}_i}\right)$ 代入上式：
        $$
        \frac{dL}{dt} = \sum_i \left( \frac{d}{dt}\left(\frac{\partial L}{\partial \dot{q}_i}\right) \dot{q}_i + \frac{\partial L}{\partial \dot{q}_i}\ddot{q}_i \right) + \frac{\partial L}{\partial t}
        $$
        注意到求和项正好是乘积的导数规则：$\frac{d}{dt}(AB) = \dot{A}B + A\dot{B}$。因此：
        $$
        \frac{dL}{dt} = \sum_i \frac{d}{dt} \left( \frac{\partial L}{\partial \dot{q}_i} \dot{q}_i \right) + \frac{\partial L}{\partial t}
        $$
        移项整理得：
        $$
        \frac{d}{dt} \left( \sum_i \frac{\partial L}{\partial \dot{q}_i} \dot{q}_i - L \right) = - \frac{\partial L}{\partial t}
        $$
    * **守恒量**: 我们定义括号内的量为系统的**广义能量**或**哈密顿量 (Hamiltonian)** $H$:
        $$
        H \equiv \sum_i p_i \dot{q}_i - L
        $$
    * **结论**: **如果系统的Lagrangian不显含时间 $t$，则其广义能量（哈密顿量）$H$ 守恒。**
        $$
        \frac{dH}{dt} = 0 \quad \implies \quad H = \text{常数}
        $$
        **注意**: 广义能量 $H$ **不一定**等于系统的机械能 $E=T+V$。但当势能 $V$ 与速度无关，且坐标变换不含时，两者是相等的。

#### **1.4.3 作用量的形式变换**

一个物理系统的Lagrangian不是唯一的。我们可以对Lagrangian进行某种变换，而保持其描述的物理（即运动方程）不变。

* **变换**: 考虑将一个Lagrangian $L$ 变换为一个新的Lagrangian $L'$，两者之差是某个函数 $F(q, t)$ 的全时间导数：
    $$
    L'(q, \dot{q}, t) = L(q, \dot{q}, t) + \frac{dF(q, t)}{dt}
    $$

* **对作用量的影响**: 新的作用量 $S'$ 与原作用量 $S$ 的关系为：
    $$
    S' = \int_{t_1}^{t_2} L' dt = \int_{t_1}^{t_2} \left(L + \frac{dF}{dt}\right) dt = S + \int_{t_1}^{t_2} dF
    $$   $$
    S' = S + \left[ F(q, t) \right]_{t_1}^{t_2} = S + F(q(t_2), t_2) - F(q(t_1), t_1)
    $$
    新的作用量 $S'$ 与原作用量 $S$ 只相差一个边界项。

* **对变分的影响**: 计算 $S'$ 的变分：
    $$
    \delta S' = \delta S + \delta \left[ F(q(t_2), t_2) - F(q(t_1), t_1) \right]
    $$
    根据最小作用量原理，所有比较路径的端点是固定的，即 $\delta q(t_1) = \delta q(t_2) = 0$。因此，边界项的变分为零：
    $$
    \delta \left[ F(q(t_2), t_2) - F(q(t_1), t_1) \right] = 0
    $$

* **结论**:
    $$
    \delta S' = \delta S
    $$
    这意味着，如果一条路径使 $S$ 取平稳值（$\delta S = 0$），它也必然使 $S'$ 取平稳值（$\delta S' = 0$）。因此，$L$ 和 $L'$ 描述的是完全相同的动力学，它们导出的Euler-Lagrange方程是等价的。

* **意义**: 这一性质被称为Lagrangian的**规范自由度 (Gauge Freedom)**。它表明，判断一个理论的对称性时，我们要求的不是Lagrangian在变换下严格不变，而是它最多只能改变一个全时间导数项。这是诺特定理更一般形式的出发点。

---

## **第二部分：经典问题**

### **2.1 两体问题 (The Two-Body Problem)**

两体问题是理论力学中为数不多的可以精确求解的动力学问题之一，它构成了天体力学、散射理论等领域的基础。

#### **2.1.1 两体系统 (Two-Body System)**

* **从Lagrangian出发**
    考虑一个由质量为 $m_1$、位置为 $\mathbf{r}_1$ 和质量为 $m_2$、位置为 $\mathbf{r}_2$ 的两个质点组成的孤立系统。若它们之间的相互作用势仅与相对距离有关，即 $V = V(|\mathbf{r}_1 - \mathbf{r}_2|)$，则系统的Lagrangian为：
    $$
    L = T - V = \frac{1}{2}m_1\dot{\mathbf{r}}_1^2 + \frac{1}{2}m_2\dot{\mathbf{r}}_2^2 - V(|\mathbf{r}_1 - \mathbf{r}_2|)
    $$

* **系统解耦：质心坐标与相对坐标**
    直接求解上述6个自由度的系统是困难的。我们引入**质心坐标 $\mathbf{R}$** 和**相对坐标 $\mathbf{r}$**：
    $$
    \mathbf{R} = \frac{m_1\mathbf{r}_1 + m_2\mathbf{r}_2}{m_1+m_2}, \quad \mathbf{r} = \mathbf{r}_1 - \mathbf{r}_2
    $$
    将 $\mathbf{r}_1, \mathbf{r}_2$ 反解出来并代入Lagrangian，经过代数运算，Lagrangian可以被**解耦**为两部分：
    $$
    L = \left(\frac{1}{2}M\dot{\mathbf{R}}^2\right) + \left(\frac{1}{2}\mu\dot{\mathbf{r}}^2 - V(r)\right) = L_{CM} + L_{rel}
    $$
    其中：
    * $M = m_1+m_2$ 是系统的**总质量**。
    * $\mu = \frac{m_1 m_2}{m_1 + m_2}$ 是系统的**折合质量 (Reduced Mass)**。
    * $L_{CM}$ 描述了质心的运动，其E-L方程为 $M\ddot{\mathbf{R}}=0$，表明系统质心做匀速直线运动。
    * $L_{rel}$ 描述了相对运动，它等效于一个质量为 $\mu$ 的单一粒子在固定势心 $V(r)$ 中的运动。
    * **零动量参考系 (Zero-Momentum Frame)**：即质心系。在此参考系中，总动量 $\mathbf{P} = M\dot{\mathbf{R}} = 0$，质心静止。两体问题被严格简化为单体在中心势场中的运动问题。

* **碰撞与散射 (Collision and Scattering)**
    当两个粒子相互靠近并作用，然后分开，这一过程称为散射。
    * **微分散射截面 (Differential Scattering Cross-Section)**: 这是描述散射过程的核心物理量，记为 $\frac{d\sigma}{d\Omega}$。它衡量了入射粒子被散射到某个立体角 $d\Omega$ 方向的概率。
    * **定义**: 设想一束粒子射向散射中心，单位时间内垂直于入射方向通过单位面积的粒子数为 $J$（入射通量）。若单位时间内散射到 $(\theta, \phi)$ 方向的立体角 $d\Omega$ 内的粒子数为 $dN$，则定义：
        $$
        \frac{d\sigma}{d\Omega} = \frac{dN/dt}{J}
        $$
    * **计算**: 对于轴对称散射，通过建立**瞄准参数 $b$**（入射粒子初始速度方向与散射中心的垂直距离）和**散射角 $\theta$** 之间的函数关系 $\theta(b)$，可以计算微分散射截面：
        $$
        \frac{d\sigma}{d\Omega} = \frac{b}{\sin\theta} \left| \frac{db}{d\theta} \right|
        $$
        著名的**卢瑟福散射公式** ($V \propto 1/r$) 就是一个经典例子，它完美解释了$\alpha$粒子散射实验。

* **位力定理 (Virial Theorem)**
    对于一个在有限空间内运动的、稳定的多粒子系统（如星系、被引力束缚的星团），其动能的时间平均值 $\langle T \rangle$ 与其内力的位力 $\langle \sum_i \mathbf{F}_i \cdot \mathbf{r}_i \rangle$ 之间存在一个普适关系。
    * **定理**:
        $$
        2\langle T \rangle + \langle \sum_i \mathbf{F}_i \cdot \mathbf{r}_i \rangle = 0
        $$
    * **对于平方反比中心力**: 若粒子间的相互作用势为 $V \propto r^{-1}$（如引力、库仑力），则 $\sum \mathbf{F}_i \cdot \mathbf{r}_i = -V$。定理简化为：
        $$
        2\langle T \rangle = -\langle V \rangle
        $$
        这个关系在天体物理中有重要应用，例如可以通过观测星系中成员的动能来估算星系的总质量（包括暗物质）。

#### **2.1.2 中心势场与开普勒问题 (Central Potential and Kepler Problem)**

现在我们聚焦于已简化的单体问题，其中质量为 $\mu$ 的粒子在中心势 $V(r)$ 中运动。

* **动力学方程与角动量**
    在极坐标 $(r, \phi)$ 下，系统的Lagrangian为 $L = \frac{1}{2}\mu(\dot{r}^2 + r^2\dot{\phi}^2) - V(r)$。
    * 由于 $\phi$ 是循环坐标 ($\partial L / \partial \phi = 0$)，其共轭动量守恒：
        $$
        p_\phi = \frac{\partial L}{\partial \dot{\phi}} = \mu r^2 \dot{\phi} \equiv l = \text{常数}
        $$
        $l$ 就是系统的**角动量**大小。角动量守恒是中心力场问题的共性，源于其空间转动对称性。
    * 对 $r$ 的E-L方程为： $\mu\ddot{r} - \mu r\dot{\phi}^2 + \frac{dV}{dr} = 0$。

* **轨道方程与有效势**
    将角动量守恒 $\dot{\phi} = l/(\mu r^2)$ 代入径向方程，消去 $\dot{\phi}$：
    $$
    \mu\ddot{r} - \frac{l^2}{\mu r^3} + \frac{dV}{dr} = 0
    $$
    这个方程可以看作一个一维问题，粒子在**有效势 (Effective Potential)** $V_{eff}(r)$ 中运动：
    $$
    V_{eff}(r) = V(r) + \frac{l^2}{2\mu r^2}
    $$
    其中 $\frac{l^2}{2\mu r^2}$ 称为**离心势垒**，它来源于角动量，体现了“排斥”效应，防止粒子落入势心（除非$l=0$）。通过分析系统的总能量 $E$ 与 $V_{eff}(r)$ 的关系，可以判断轨道是有界（椭圆、圆）还是无界（抛物线、双曲线）。

* **开普勒问题 ($V(r) = -k/r$)**
    这是最重要的中心力问题，其中 $k=GM\mu$ สำหรับ引力。
    1.  **开普勒第一定律 (轨道定律)**: 行星绕太阳的轨道是一个椭圆，太阳位于椭圆的一个焦点上。
        * 这是通过求解 $V=-k/r$ 时的轨道方程得到的，轨道方程的通解为 $r = \frac{p}{1+e\cos\phi}$，正是圆锥曲线的极坐标方程。
    2.  **开普勒第二定律 (面积定律)**: 行星和太阳的连线在相等的时间间隔内扫过相等的面积。
        * 这直接是**角动量守恒**的几何体现。单位时间的掠扫面积 $\frac{dA}{dt} = \frac{1}{2}r^2\dot{\phi} = \frac{l}{2\mu}$，是一个常数。
    3.  **开普勒第三定律 (周期定律)**: 行星轨道周期的平方与其轨道半长轴的立方成正比。
        $$
        P^2 = \left(\frac{4\pi^2\mu}{k}\right) a^3
        $$
        对于太阳系，代入 $k=GM_{sun}\mu$，有 $P^2 = \frac{4\pi^2}{GM_{sun}}a^3$。

* **轨道问题求解**
    * **求天体物理参数**: 利用开普勒第三定律，通过观测卫星的周期 $P$ 和轨道半长轴 $a$，就可以精确计算出中心天体（如太阳、地球）的质量 $M$。
    * **求轨道参数**: 通过天体的初始位置 $\mathbf{r}_0$ 和速度 $\mathbf{v}_0$，可以计算出系统的总能量 $E$ 和角动量 $l$。进而可以确定轨道的几何参数，如半长轴 $a = -k/(2E)$ 和偏心率 $e=\sqrt{1+2El^2/(\mu k^2)}$。

* **补充: LRL矢量 (Laplace-Runge-Lenz Vector)**
    对于 $1/r$ 势，除了能量和角动量外，还有一个额外的守恒量，即LRL矢量：
    $$
    \mathbf{A} = \mathbf{p} \times \mathbf{l} - \mu k \hat{\mathbf{r}}
    $$
    其中 $\mathbf{p}=\mu\mathbf{v}$。$\mathbf{A}$ 的守恒保证了轨道的近日点（或远日点）方向固定不变，即轨道是闭合的。这种额外的守恒性源于开普勒问题一个更深层次的“动力学对称性”（SO(4)对称性）。

---

### **2.2 振动与微扰 (Vibration and Perturbation)**

#### **2.2.1 机械振动 (Mechanical Vibration)**

机械振动是自然界和工程中极为常见的现象。其最基本的形式是简谐振动。

* **简谐振动 (Simple Harmonic Motion - SHM)**
    考虑一个系统在稳定平衡点 $q_0$ 附近运动。我们可以将势能 $V(q)$ 在该点附近作泰勒展开：
    $$
    V(q) \approx V(q_0) + V'(q_0)(q-q_0) + \frac{1}{2}V''(q_0)(q-q_0)^2 + \dots
    $$
    在稳定平衡点，受力为零 $V'(q_0)=0$，且势能为极小值 $V''(q_0) = k > 0$。令位移 $x=q-q_0$，忽略常数项，小位移下的Lagrangian为 $L = \frac{1}{2}m\dot{x}^2 - \frac{1}{2}kx^2$。其E-L方程为：
    $$
    m\ddot{x} + kx = 0 \quad \text{或} \quad \ddot{x} + \omega_0^2 x = 0
    $$
    其中 $\omega_0 = \sqrt{k/m}$ 是系统的**固有角频率**。这就是简谐振动的运动方程，其通解为 $x(t) = A\cos(\omega_0 t + \phi)$，描述了一种等幅的周期振动。

* **受迫振动 (Forced Vibration)**
    在实际系统中，通常存在阻尼（如摩擦力，设为 $-b\dot{x}$）和外部驱动力（设为 $F(t) = F_0\cos(\omega t)$）。系统的运动方程变为：
    $$
    m\ddot{x} + b\dot{x} + kx = F_0 \cos(\omega t)
    $$
    或者写为标准形式：
    $$
    \ddot{x} + 2\beta\dot{x} + \omega_0^2 x = f_0 \cos(\omega t)
    $$
    其中 $\beta = b/(2m)$ 是阻尼系数，$f_0 = F_0/m$。系统的解包含一个随时间衰减的暂态解和一个最终起主导作用的稳态解。稳态解的形式为 $x(t) = A(\omega)\cos(\omega t - \delta)$，其**振幅响应 $A(\omega)$** 和**相位滞后 $\delta$** 分别为：
    $$
    A(\omega) = \frac{f_0}{\sqrt{(\omega_0^2 - \omega^2)^2 + (4\beta^2\omega^2)}}
    $$   $$
    \tan\delta = \frac{2\beta\omega}{\omega_0^2 - \omega^2}
    $$

* **共振、响应曲线与隔振**
    * **共振 (Resonance)**：当驱动频率 $\omega$ 接近系统的固有频率 $\omega_0$ 时，振动幅度 $A(\omega)$ 会急剧增大的现象。当阻尼 $\beta$ 很小时，共振峰值非常尖锐。共振频率 $\omega_R = \sqrt{\omega_0^2-2\beta^2}$，在小阻尼下约等于 $\omega_0$。
    * **响应曲线**: 将振幅 $A(\omega)$ 和相位 $\delta$ 作为驱动频率 $\omega$ 的函数绘制成图，可以直观地理解系统响应。
        * **振幅-频率图**: 显示了在共振频率处振幅达到峰值，远离共振区则振幅减小。阻尼越大，峰值越低越平缓。
        * **相位-频率图**: 显示了响应相对于驱动力的相位滞后。在低频时，响应与驱动同相 ($\delta \approx 0$)；在共振时，响应滞后 $\pi/2$；在高频时，响应与驱动反相 ($\delta \approx \pi$)。
    * **隔振 (Vibration Isolation)**：工程中的一个重要课题。目标是减小不必要的振动传递。例如，将设备安装在弹性支座上。关键在于，为实现有效隔振，需要使支座系统的固有频率 $\omega_0$ 远低于外部干扰的振动频率 $\omega$（即 $ \omega / \omega_0 \gg \sqrt{2} $）。这通常通过使用“软”弹簧（小的$k$值）来实现。

#### **2.2.2 微扰论 (Perturbation Theory)**

当一个我们无法精确求解的问题，与一个我们能够精确求解的理想问题“差别很小”时，微扰论提供了一个系统性的方法来求近似解。

* **基本原理与方法**
    假设一个系统的方程中含有一个小参数 $\epsilon \ll 1$，例如 $m\ddot{x} + kx + \epsilon h(x, \dot{x}) = 0$。微扰法的核心思想是，将解 $x(t)$ 展开成 $\epsilon$ 的幂级数：
    $$
    x(t) = x_0(t) + \epsilon x_1(t) + \epsilon^2 x_2(t) + \dots
    $$
    基本步骤如下：
    1.  将级数解代入原方程。
    2.  按照 $\epsilon$ 的不同幂次，将方程整理成一个方程组。
    3.  依次求解：
        * **零阶方程 ($\epsilon^0$)**: 这通常是理想化的、可精确求解的未扰动问题，解为 $x_0(t)$。
        * **一阶方程 ($\epsilon^1$)**: 这是一个关于一阶修正项 $x_1(t)$ 的方程，其形式通常依赖于零阶解 $x_0(t)$。
        * 以此类推，逐级求解更高阶的修正。

* **例子：稳定平衡位形附近的非线性振动**
    考虑一个非线性振子，其势能为 $V(x) = \frac{1}{2}kx^2 + \frac{1}{6}\alpha x^3$。运动方程为：
    $$
    m\ddot{x} + kx + \frac{1}{2}\alpha x^2 = 0
    $$
    假设非线性项是微扰，我们令 $\epsilon = \alpha$，并寻找 $x = x_0 + \epsilon x_1 + \dots$
    * **零阶 ($\epsilon^0$)**: $m\ddot{x}_0 + kx_0 = 0$。解为简谐振动 $x_0(t) = A\cos(\omega_0 t)$。
    * **一阶 ($\epsilon^1$)**: 代入整理得：
        $$
        m\ddot{x}_1 + kx_1 + \frac{1}{2}x_0^2 = 0 \implies \ddot{x}_1 + \omega_0^2 x_1 = -\frac{1}{2m}(A\cos(\omega_0 t))^2 = -\frac{A^2}{4m}(1+\cos(2\omega_0 t))
        $$
    这个方程描述了一阶修正 $x_1$ 的行为。它是一个受驱动的谐振子，驱动力中包含了零频（常数）项和两倍频 $2\omega_0$ 项。这表明，非线性效应会引入**高次谐波**，使振动不再是纯粹的正弦或余弦形式。

#### **2.2.3 小振动 (Small Oscillations)**

对于有 $n$ 个自由度的系统，在稳定平衡点附近的小振动问题。

* **自由振动与本征方程**
    设系统的广义坐标为 $\{q_1, \dots, q_n\}$，在平衡点附近，令位移为 $\eta_i$。Lagrangian可近似为：
    $$
    L \approx \frac{1}{2}\sum_{i,j} T_{ij}\dot{\eta}_i\dot{\eta}_j - \frac{1}{2}\sum_{i,j} V_{ij}\eta_i\eta_j
    $$
    其中 $\mathbf{T}$ 和 $\mathbf{V}$ 分别是常数的质量矩阵和势能矩阵。系统的运动方程为一组耦合的线性微分方程：
    $$
    \mathbf{T}\ddot{\boldsymbol{\eta}} + \mathbf{V}\boldsymbol{\eta} = 0
    $$
    我们寻找形如 $\boldsymbol{\eta}(t) = \mathbf{a}e^{i\omega t}$ 的振动解，代入上式得到一个关于振幅向量 $\mathbf{a}$ 的代数方程组：
    $$
    (\mathbf{V} - \omega^2\mathbf{T})\mathbf{a} = 0
    $$
    这是一个**广义本征方程 (Generalized Eigenvalue Equation)**。为了得到非零解 $\mathbf{a}$，系数矩阵的行列式必须为零：
    $$
    \det(\mathbf{V} - \omega^2\mathbf{T}) = 0
    $$
    这个方程称为**久期方程 (Secular Equation)**，解出的是系统所有可能的振动频率的平方 $\omega_k^2$，这些 $\omega_k^2$ 称为系统的**本征频率**。

* **简正模与简正坐标 (Normal Modes and Normal Coordinates)**
    * **简正模 (Normal Modes)**: 对应于每个本征频率 $\omega_k$，都有一个对应的本征矢量 $\mathbf{a}_k$。这个矢量描述了系统在该频率下振动时，各个分量位移的相对比例和相位关系。这种集体运动模式，即系统中所有部分都以相同的频率和相位（或反相）振动，称为一个**简正模**。
    * **简正坐标 (Normal Coordinates)**: 任何复杂的耦合振动，都可以看作是所有这些独立的简正模的线性叠加。我们可以通过坐标变换，找到一组新的广义坐标 $\boldsymbol{\xi} = \{\xi_1, \dots, \xi_n\}$，称为**简正坐标**。在简正坐标下，系统的Lagrangian可以对角化，即写成 $n$ 个互不相关的谐振子的Lagrangian之和：
        $$
        L = \sum_{k=1}^n \left(\frac{1}{2}\dot{\xi}_k^2 - \frac{1}{2}\omega_k^2\xi_k^2\right)
        $$
    运动方程也随之解耦：
    $$
    \ddot{\xi}_k + \omega_k^2\xi_k = 0 \quad (k=1, 2, \dots, n)
    $$
    通过引入简正坐标，我们将一个复杂的、多自由度的耦合振动问题，成功地分解为了一组简单的、可以独立求解的单自由度简谐振动问题。

---

### **2.3 转动与刚体 (Rotation and Rigid Bodies)**

刚体动力学研究的是当物体自身的形状和尺寸不可忽略时，其在外力作用下的运动规律。其核心是处理物体的转动。

#### **2.3.1 保度规变换 (Metric-Preserving Transformation)**

转动是一种保持物体形状和大小不变的变换，在数学上，这对应于一种保持度规（即距离和角度）不变的变换。

* **坐标变换与保度规**:
    在欧几里得空间中，两个矢量 $\mathbf{x}$ 和 $\mathbf{y}$ 之间的距离和角度由其内积（点积）$\mathbf{x}^T\mathbf{y}$ 决定。一个线性变换 $\mathbf{x}' = \mathbf{R}\mathbf{x}$ 如果保持内积不变，则称为**保度规变换**或**等距变换**。
    $$
    (\mathbf{x}')^T(\mathbf{y}') = \mathbf{x}^T\mathbf{y}
    $$
    代入变换关系：
    $$
    (\mathbf{R}\mathbf{x})^T(\mathbf{R}\mathbf{y}) = \mathbf{x}^T\mathbf{R}^T\mathbf{R}\mathbf{y} = \mathbf{x}^T\mathbf{y}
    $$
    为了使上式对任意矢量都成立，必须满足：
    $$
    \mathbf{R}^T\mathbf{R} = \mathbf{I}
    $$
    其中 $\mathbf{I}$ 是单位矩阵。

* **正交变换 (Orthogonal Transformation)**:
    满足 $\mathbf{R}^T\mathbf{R} = \mathbf{I}$ 的矩阵 $\mathbf{R}$ 称为**正交矩阵**，该变换称为**正交变换**。其性质包括：
    * $\mathbf{R}^{-1} = \mathbf{R}^T$。
    * 行列式 $\det(\mathbf{R}) = \pm 1$。
        * $\det(\mathbf{R}) = +1$ 对应于**真转动 (Proper Rotation)**，它保持了坐标系的“手性”。
        * $\det(\mathbf{R}) = -1$ 对应于**瑕转动 (Improper Rotation)**，它包含了一个镜像反演。在刚体动力学中，我们主要关心真转动。

* **主动观点与被动观点 (Active vs. Passive Views)**:
    * **主动观点**: 坐标系固定，物体（或矢量）自身进行转动。矢量从 $\mathbf{x}$ 变为 $\mathbf{x}' = \mathbf{R}\mathbf{x}$。
    * **被动观点**: 物体（或矢量）固定，坐标系进行转动。矢量在新坐标系中的分量 $\mathbf{x}'$ 与原分量 $\mathbf{x}$ 的关系为 $\mathbf{x}' = \mathbf{R}^{-1}\mathbf{x}$。
    * 这两种观点描述的是相对转动，在物理上等价，但在数学上所用的变换矩阵是互逆的。
    * **与绘景的联系**: 这类似于量子力学中的**海森堡绘景**（主动观点，状态演化）和**薛定谔绘景**（被动观点，基矢/算符演化）。

#### **2.3.2 无穷小转动与有限转动 (Infinitesimal and Finite Rotations)**

* **无穷小转动**:
    一次绕某轴的无穷小转动可以表示为 $\mathbf{R} \approx \mathbf{I} + \delta\mathbf{\Theta}$，其中 $\delta\mathbf{\Theta}$ 是一个无穷小矩阵。代入正交条件 $\mathbf{R}^T\mathbf{R} = \mathbf{I}$ 并保留一阶小量，可得：
    $$
    (\mathbf{I} + \delta\mathbf{\Theta}^T)(\mathbf{I} + \delta\mathbf{\Theta}) \approx \mathbf{I} + \delta\mathbf{\Theta}^T + \delta\mathbf{\Theta} = \mathbf{I}
    $$
    这要求 $\delta\mathbf{\Theta}^T = -\delta\mathbf{\Theta}$，即**无穷小转动矩阵是一个反对称矩阵**。

* **转动群、生成元与李代数**:
    * **转动群 SO(n)**: n维空间中所有真转动矩阵构成的集合，在矩阵乘法下构成一个群，称为特殊正交群 $SO(n)$。
    * **生成元 (Generator)**: 任何一个n维反对称矩阵都可以由一组基底线性组合而成。这些基底矩阵被称为转动群的**生成元**。对于 $SO(3)$，可以写为 $\delta\mathbf{\Theta} = -i\sum_{k=1}^3 \delta\theta_k J_k$，其中 $J_k$ 是生成元。
    * **李代数 so(n)**: 转动群的生成元构成的向量空间，以及它们之间定义的**对易关系（李括号）**，共同构成一个李代数，记为 $so(n)$。对于 $so(3)$，其对易关系为：
        $$
        [J_i, J_j] = i\epsilon_{ijk}J_k
        $$

* **指数映射 (Exponential Map)**:
    有限转动可以看作是无穷多次无穷小转动的累积。这在数学上通过**指数映射**实现，它建立了李代数（生成元）与李群（转动矩阵）之间的联系：
    $$
    \mathbf{R}(\boldsymbol{\theta}) = \exp(-i\boldsymbol{\theta} \cdot \mathbf{J})
    $$
    其中 $\boldsymbol{\theta}$ 是一个矢量，其方向为转轴，大小为转角。

#### **2.3.3 角速度 (Angular Velocity)**

* **角速度矩阵**:
    考虑一个随时间变化的转动 $\mathbf{x}(t) = \mathbf{R}(t)\mathbf{x}_0$。对时间求导：
    $$
    \dot{\mathbf{x}}(t) = \dot{\mathbf{R}}(t)\mathbf{x}_0 = \dot{\mathbf{R}}(t)\mathbf{R}^{-1}(t)\mathbf{x}(t)
    $$
    我们定义**角速度矩阵 $\mathbf{\Omega}(t)$** 为：
    $$
    \mathbf{\Omega}(t) = \dot{\mathbf{R}}(t)\mathbf{R}^T(t)
    $$
    可以证明它是一个反对称矩阵。于是，点的速度可以写为 $\dot{\mathbf{x}} = \mathbf{\Omega}\mathbf{x}$。

* **三维中的例子**:
    在三维空间中，任何反对称矩阵 $\mathbf{\Omega}$ 都可以和一个矢量 $\boldsymbol{\omega}$ 对应：
    $$
    \mathbf{\Omega} = \begin{pmatrix} 0 & -\omega_z & \omega_y \\ \omega_z & 0 & -\omega_x \\ -\omega_y & \omega_x & 0 \end{pmatrix} \quad \longleftrightarrow \quad \boldsymbol{\omega} = (\omega_x, \omega_y, \omega_z)
    $$
    矩阵乘法 $\mathbf{\Omega}\mathbf{x}$ 的结果等效于矢量叉乘 $\boldsymbol{\omega} \times \mathbf{x}$。因此，我们恢复了熟悉的形式：
    $$
    \mathbf{v} = \boldsymbol{\omega} \times \mathbf{r}
    $$

* **编时操作 (Time-Ordering)**:
    当角速度 $\boldsymbol{\omega}(t)$ 的方向随时间变化时（即 $[\mathbf{\Omega}(t_1), \mathbf{\Omega}(t_2)] \neq 0$），从 $\dot{\mathbf{R}} = \mathbf{\Omega}\mathbf{R}$ 求解 $\mathbf{R}(t)$ 不能简单地写成 $\exp(\int \mathbf{\Omega} dt')$。正确的解需要用到**戴森级数 (Dyson Series)**，其形式解为：
    $$
    \mathbf{R}(t) = \mathcal{T} \exp\left(\int_0^t \mathbf{\Omega}(t') dt'\right)
    $$
    其中 $\mathcal{T}$ 是**编时算符**，它将乘积中的矩阵按照时间从早到晚排序。

#### **2.3.4 刚体的描述**

* **运动分解**: 刚体的任意运动，都可以分解为**质心的平动**和**绕质心的转动**。
    $$
    L = T_{trans} + T_{rot} - V
    $$

* **欧拉角 (Euler Angles)** - 重点
    为描述刚体在空间的取向，我们引入欧拉角 $(\psi, \theta, \phi)$，它通过三次连续的转动将空间固定坐标系 $(x,y,z)$ 变换到刚体固定坐标系 $(x',y',z')$：
    1.  **进动 (Precession)**: 绕 $z$ 轴转动 $\psi$ 角。
    2.  **章动 (Nutation)**: 绕新的 $x'$ 轴（称为**节线**）转动 $\theta$ 角。
    3.  **自旋 (Spin)**: 绕最终的 $z'$ 轴转动 $\phi$ 角。
    总的转动矩阵为 $\mathbf{R} = \mathbf{R}_{z'}(\phi)\mathbf{R}_{x'}(\theta)\mathbf{R}_{z}(\psi)$。欧拉角是描述刚体取向的三个广义坐标。

* **惯量张量 (Inertia Tensor)** - 重点
    刚体绕质心的转动动能为 $T_{rot} = \frac{1}{2}\sum_i m_i (\boldsymbol{\omega} \times \mathbf{r}_i)^2$。经过代数变形，可以写成二次型的形式：
    $$
    T_{rot} = \frac{1}{2} \boldsymbol{\omega}^T \mathbf{I} \boldsymbol{\omega} = \frac{1}{2} \sum_{j,k} I_{jk} \omega_j \omega_k
    $$
    其中 $\mathbf{I}$ 就是**惯量张量**，它是一个 $3 \times 3$ 的对称矩阵，描述了刚体质量相对于转轴的分布情况。其分量为：
    * **转动惯量 (对角元)**: $I_{xx} = \int \rho(r) (y^2+z^2) dV$
    * **惯量积 (非对角元)**: $I_{xy} = - \int \rho(r) xy dV$
    由于 $\mathbf{I}$ 是实对称矩阵，总可以找到一个坐标系（**主轴系**），使得 $\mathbf{I}$ 在该系下为对角阵。这三个坐标轴称为**惯量主轴**，对应的对角元 $I_1, I_2, I_3$ 称为**主转动惯量**。在主轴系下，$T_{rot} = \frac{1}{2}(I_1\omega_1^2 + I_2\omega_2^2 + I_3\omega_3^2)$。

#### **2.3.5 刚体的运动**

* **刚体的欧拉方程 (Euler's Equations)**
    在随刚体转动的**主轴系**下，描述刚体转动的动力学方程为**欧拉方程**。它是牛顿第二定律转动形式 $\boldsymbol{\tau} = d\mathbf{L}/dt$ 在非惯性系下的体现：
    $$
    \begin{aligned}
    \tau_1 &= I_1 \dot{\omega}_1 + (I_3 - I_2) \omega_2 \omega_3 \\
    \tau_2 &= I_2 \dot{\omega}_2 + (I_1 - I_3) \omega_3 \omega_1 \\
    \tau_3 &= I_3 \dot{\omega}_3 + (I_2 - I_1) \omega_1 \omega_2
    \end{aligned}
    $$
    其中 $\boldsymbol{\tau}$ 是外力矩，$\boldsymbol{\omega}$ 是角速度，两者均在刚体主轴系下度量。

* **刚体的拉格朗日力学**:
    我们可以用欧拉角作为广义坐标，写出刚体的Lagrangian $L = T_{rot} - V$。动能 $T_{rot}$ 是欧拉角速度 $\dot{\psi}, \dot{\theta}, \dot{\phi}$ 的复杂二次函数。通过求解拉格朗日方程，可以得到完整的运动信息。

* **特殊运动形式**:
    * **定点转动**: 刚体上一点固定。这是陀螺仪等问题的模型。
    * **自由陀螺 (Free Top)**: 不受外力矩作用的刚体（$\boldsymbol{\tau}=0$）。其角动量 $\mathbf{L}$ 在空间中守恒，而角速度矢量 $\boldsymbol{\omega}$ 则会绕着 $\mathbf{L}$ 进动。
    * **重陀螺与进动、章动 (Heavy Top, Precession and Nutation)**:
        受重力作用的对称陀螺（$I_1=I_2$）是刚体动力学中最经典的问题。其运动非常复杂：
        * **进动 (Precession)**: 自转轴绕着竖直方向（重力方向）缓慢转动。
        * **章动 (Nutation)**: 自转轴在绕竖直方向进动的同时，自身还在做小幅度的快速“点头”或“摇头”运动。
        这些都可以通过求解拉格朗日方程或欧拉方程精确描述。

---

## **第三部分：Hamilton力学 (Hamiltonian Mechanics)**

哈密顿力学是经典力学的另一种重述，由威廉·哈密顿在19世纪30年代建立。它将拉格朗日力学从基于位形空间（由广义坐标$q$描述）的理论，提升到了基于**相空间**（由广义坐标$q$和广义动量$p$共同描述）的理论。这一转变不仅在数学上更为优美，也为后来的统计力学和量子力学奠定了基础。

与求解$n$个二阶微分方程的拉格朗日力学不同，哈密顿力学通过求解$2n$个一阶微分方程来描述系统，这在理论分析和数值计算中都具有优势。

### **3.1 Hamilton正则方程 (Hamilton's Canonical Equations)**

#### **3.1.1 Hamilton量 (The Hamiltonian)**

我们曾在1.4.2节中定义了广义能量，它就是哈密顿量（简称哈密顿量或Hamiltonian）。其定义为：
$$H(q, \dot{q}, t) = \sum_i p_i \dot{q}_i - L(q, \dot{q}, t)$$
其中 $p_i = \partial L / \partial \dot{q}_i$ 是广义动量。

这个定义中的$H$是广义坐标$q$、广义速度$\dot{q}$和时间的函数。然而，哈密顿力学的核心思想是**将广义坐标$q$和广义动量$p$视为独立的变量**。因此，我们需要将上式中的$\dot{q}$全部用$p$来表示。

具体步骤是：
1.  从定义式 $p_i = \partial L / \partial \dot{q}_i$ 中，反解出 $\dot{q}_i$。
2.  将得到的表达式 $\dot{q}_i = \dot{q}_i(q, p, t)$ 代入广义能量的定义式中。
3.  最终得到的完全以 $(q, p, t)$ 为变量的函数，才是严格意义上的**哈密顿量 $H(q, p, t)$**。

**注意**：当势能$V$与速度无关，且从笛卡尔坐标到广义坐标的变换不显含时间时，哈密顿量$H$就等于系统的总机械能 $T+V$。

#### **3.1.2 Legendre变换 (Legendre Transformation)**

从以 $\dot{q}$ 为变量的拉格朗日量 $L(q, \dot{q}, t)$ 转换到以 $p$ 为变量的哈密顿量 $H(q, p, t)$ 的过程，在数学上是一个标准的**勒让德变换**。

* **基本思想**: 对于一个函数 $f(x)$，其信息完全包含在它所有点的切线集合中。勒让德变换就是一种从“点坐标-函数值” $(x, f(x))$ 的描述，转换到“切线斜率-截距” $(u, g(u))$ 描述的系统方法。
* **定义**: 设 $u = df/dx$，则 $f(x)$ 的勒让德变换 $g(u)$ 定义为：
    $$
    g(u) = ux - f(x)
    $$
    要完成变换，必须利用 $u = df/dx$ 反解出 $x=x(u)$ 并代入上式。
* **与哈密顿力学的联系**:
    * 拉格朗日量 $L(q, \dot{q}, t)$ 对应于 $-f(x)$。
    * 广义速度 $\dot{q}$ 对应于 $x$。
    * 广义动量 $p = \partial L / \partial \dot{q}$ 对应于 $u$。
    * 因此，哈密顿量 $H = \sum p_i \dot{q}_i - L$ 正是拉格朗日量 $L$ 对广义速度 $\dot{q}$ 的勒让德变换。

#### **3.1.3 哈密顿正则方程 (Hamilton's Canonical Equations)**

这是哈密顿力学的核心运动方程。我们可以通过对哈密顿量 $H(q, p, t)$ 求全微分来推导它。
$$dH = \sum_i \left(\frac{\partial H}{\partial q_i}dq_i + \frac{\partial H}{\partial p_i}dp_i\right) + \frac{\partial H}{\partial t}dt$$
另一方面，从定义式 $H = \sum p_i \dot{q}_i - L$ 出发求微分：
$$dH = \sum_i (d p_i \dot{q}_i + p_i d\dot{q}_i) - dL = \sum_i (d p_i \dot{q}_i + p_i d\dot{q}_i) - \left(\sum_i \frac{\partial L}{\partial q_i}dq_i + \sum_i \frac{\partial L}{\partial \dot{q}_i}d\dot{q}_i + \frac{\partial L}{\partial t}dt \right)$$
利用 $p_i = \partial L / \partial \dot{q}_i$ 和拉格朗日方程 $\dot{p}_i = \partial L / \partial q_i$，上式化简为：
$$dH = \sum_i (\dot{q}_i dp_i - \dot{p}_i dq_i) - \frac{\partial L}{\partial t}dt$$
比较两种方式得到的 $dH$ 的系数，我们可以得到一组美妙对称的方程，即**哈密顿正则方程**:
$$\dot{q}_i = \frac{\partial H}{\partial p_i}$$
$$\dot{p}_i = - \frac{\partial H}{\partial q_i}$$
此外，还有关系 $\frac{\partial H}{\partial t} = - \frac{\partial L}{\partial t}$。如果 $H$ 不显含时间 $t$，则 $H$ 本身是一个守恒量。

#### **3.1.4 相空间与相图 (Phase Space and Phase Portrait)**

* **相空间 (Phase Space)**: 一个具有 $2n$ 维的抽象空间，其坐标由系统的 $n$ 个广义坐标 $q_i$ 和 $n$ 个广义动量 $p_i$ 构成。
    * 系统在任一时刻的**状态**，由相空间中的一个点 $(q_1, \dots, q_n, p_1, \dots, p_n)$ 完全确定。
    * 系统随时间的演化，在相空间中描绘出一条**相轨迹 (Phase Trajectory)**。
    * 哈密顿正则方程定义了相空间中的一个矢量场 $(\dot{\boldsymbol{q}}, \dot{\boldsymbol{p}})$，相轨迹就是该矢量场的积分曲线。

* **相图 (Phase Portrait)**: 对于自由度较低的系统（如$n=1$，相空间为二维平面），我们可以画出不同初始条件下所有可能的相轨迹，构成的图形就是相图。通过分析相图的拓扑结构（如不动点、闭合曲线等），可以直观地了解系统的动力学行为。

##### **3.1.5 例子：一维简谐振子**

* **1. 建立哈密顿量**
    Lagrangian: $L = T - V = \frac{1}{2}m\dot{q}^2 - \frac{1}{2}kq^2$.
    广义动量: $p = \frac{\partial L}{\partial \dot{q}} = m\dot{q}$. 反解得 $\dot{q} = p/m$.
    Hamiltonian:
    $$
    H = p\dot{q} - L = p\left(\frac{p}{m}\right) - \left(\frac{1}{2}m\left(\frac{p}{m}\right)^2 - \frac{1}{2}kq^2\right) = \frac{p^2}{2m} + \frac{1}{2}kq^2
    $$
    可见，$H$ 等于系统的总能量 $T+V$。

* **2. 写出正则方程**
    $$
    \dot{q} = \frac{\partial H}{\partial p} = \frac{p}{m}
    $$ $$
    \dot{p} = -\frac{\partial H}{\partial q} = -kq
    $$

* **3. 求解与分析**
    将第一个方程对时间求导，$\ddot{q} = \dot{p}/m$，再将第二个方程代入，得到 $\ddot{q} = -kq/m$，即 $\ddot{q}+\omega_0^2 q=0$，这正是我们熟悉的简谐振动方程。

* **4. 绘制相图**
    由于系统能量守恒，$H(q,p) = E = \text{常数}$。
    $$
    \frac{p^2}{2m} + \frac{kq^2}{2} = E \quad \implies \quad \frac{q^2}{(\sqrt{2E/k})^2} + \frac{p^2}{(\sqrt{2mE})^2} = 1
    $$
    这是一个在 $(q,p)$ 相平面上的椭圆方程。对于不同的初始能量 $E$，相轨迹是一簇围绕原点的同心椭圆。这表明系统做着周而复始的周期运动，运动状态永远被束缚在一条闭合的轨道上。

---

### **3.2 Poisson括号 (Poisson Brackets)**

#### **3.2.1 相空间的辛结构 (Symplectic Structure of Phase Space)**

哈密顿力学的相空间不仅仅是一个$2n$维的普通空间，它具有一种特殊的几何结构，称为**辛结构**，这种结构是哈密顿动力学的根基。

* **辛空间与辛形式 (Symplectic Space and Symplectic Form)**:
    一个辛空间是一个偶数维的向量空间，其上定义了一个非退化的、反对称的双线性形式 $\omega$，称为**辛形式**。在相空间的标准坐标 $\mathbf{z}=(q_1,...,q_n,p_1,...,p_n)^T$ 下，辛形式 $\omega$ 的矩阵表示为 $\mathbf{J}$：
    $$
    \mathbf{J} = \begin{pmatrix} \mathbf{0}_{n \times n} & \mathbf{I}_{n \times n} \\ -\mathbf{I}_{n \times n} & \mathbf{0}_{n \times n} \end{pmatrix}
    $$
    其中 $\mathbf{0}$ 和 $\mathbf{I}$ 分别是 $n \times n$ 的零矩阵和单位矩阵。$\mathbf{J}$ 满足 $\mathbf{J}^T = -\mathbf{J}$ 和 $\mathbf{J}^2 = -\mathbf{I}$。

* **哈密顿矢量场 (Hamiltonian Vector Field)**:
    利用矩阵 $\mathbf{J}$，哈密顿正则方程可以被写成一个极为紧凑的几何形式。令 $\dot{\mathbf{z}} = (\dot{q}, \dot{p})^T$ 为相空间中的速度矢量，$\nabla_{\mathbf{z}} H = (\partial H/\partial q, \partial H/\partial p)^T$ 为哈密顿量的梯度，则正则方程为：
    $$
    \dot{\mathbf{z}} = \mathbf{J} (\nabla_{\mathbf{z}} H)
    $$
    由哈密顿量 $H$ 诱导出的这个相空间矢量场 $\mathbf{X}_H = \mathbf{J} (\nabla_{\mathbf{z}} H)$ 就被称为**哈密顿矢量场**。系统的演化就是沿着该矢量场的积分曲线（流）进行的。

* **泊松括号的几何定义**:
    辛结构不仅定义了动力学流，还为相空间上的任意两个光滑函数 $f(\mathbf{z})$ 和 $g(\mathbf{z})$ 定义了一种新的“乘法”——**泊松括号** $\{f, g\}$。其几何定义是辛形式作用在两个函数对应的哈密顿矢量场上：
    $$
    \{f, g\} \equiv \omega(\mathbf{X}_f, \mathbf{X}_g) = (\nabla_{\mathbf{z}} f)^T \mathbf{J} (\nabla_{\mathbf{z}} g)
    $$

#### **3.2.2 泊松括号 (Poisson Brackets)**

从几何定义出发，我们可以得到泊松括号在坐标下的具体计算公式。

* **定义**: 对于相空间中的任意两个函数 $f(q,p,t)$ 和 $g(q,p,t)$，它们的泊松括号定义为：
    $$
    \{f, g\} = \sum_{i=1}^n \left( \frac{\partial f}{\partial q_i} \frac{\partial g}{\partial p_i} - \frac{\partial f}{\partial p_i} \frac{\partial g}{\partial q_i} \right)
    $$

* **性质**:
    1.  **反对称性**: $\{f, g\} = -\{g, f\}$。
    2.  **双线性**: 对两个变量都是线性的。
    3.  **莱布尼茨律 (乘积法则)**: $\{f, gh\} = \{f, g\}h + g\{f, h\}$。
    4.  **雅可比恒等式 (Jacobi Identity)**:
        $$
        \{f, \{g, h\}\} + \{g, \{h, f\}\} + \{h, \{f, g\}\} = 0
        $$
        这个性质至关重要，它表明相空间上的光滑函数在泊松括号运算下构成一个**李代数**。

* **基本泊松括号**:
    将广义坐标和广义动量自身代入泊松括号的定义，可以得到一组基本关系：
    $$
    \{q_i, q_j\} = 0
    $$ $$
    \{p_i, p_j\} = 0
    $$ $$
    \{q_i, p_j\} = \delta_{ij}
    $$
    其中 $\delta_{ij}$ 是克罗内克符号。这些关系是哈密顿力学的基石，也是量子力学中对易关系的经典对应。

#### **3.2.3 用泊松括号表达力学量的演化**

泊松括号提供了一种极其优雅和普适的方式来描述物理量的演化。

* **泊松括号形式的动力学方程**:
    考虑相空间中任意一个物理量 $F(q,p,t)$，其全时间导数为：
    $$
    \frac{dF}{dt} = \frac{\partial F}{\partial t} + \sum_i \left(\frac{\partial F}{\partial q_i}\dot{q}_i + \frac{\partial F}{\partial p_i}\dot{p}_i\right)
    $$
    将哈密顿正则方程 $\dot{q}_i=\partial H/\partial p_i$ 和 $\dot{p}_i = -\partial H/\partial q_i$ 代入，我们发现求和项正好是泊松括号 $\{F,H\}$。于是得到：
    $$
    \frac{dF}{dt} = \{F, H\} + \frac{\partial F}{\partial t}
    $$
    这是物理量随时间演化的最终方程。哈密顿正则方程本身就是它的特例（令 $F=q_i$ 或 $F=p_i$）。

* **运动常数**:
    一个不显含时间的物理量 $F$ 如果是守恒量（运动常数），则 $\frac{dF}{dt}=0$。根据上述方程，守恒的条件是：
    $$
    \{F, H\} = 0
    $$
    即**任何与哈密顿量泊松括号为零的物理量都是一个守恒量**。

* **泊松定理 (Poisson's Theorem)**:
    如果 $F$ 和 $G$ 是两个运动常数，那么它们的泊松括号 $\{F, G\}$ 也是一个运动常数。
    * **证明**: 利用雅可比恒等式：$\{\{F,G\}, H\} = -\{\{G,H\},F\} - \{\{H,F\},G\}$。因为 $F,G$ 是守恒量，所以 $\{G,H\}=0$ 和 $\{H,F\}=0$。因此，$\{\{F,G\},H\}=0$，证明了 $\{F,G\}$ 也是守恒量。

* **角动量的泊松括号**:
    定义角动量 $L_i = \epsilon_{ijk}q_j p_k$。通过直接计算可以证明其分量之间的泊松括号关系为：
    $$
    \{L_i, L_j\} = \epsilon_{ijk}L_k
    $$
    这表明角动量的三个分量在泊松括号下构成一个封闭的代数结构（李代数 $so(3)$），这正是空间转动对称性的体现。

#### **3.2.4 时空变换算子 (Spacetime Transformation Operators)**

泊松括号深刻地揭示了守恒量与对称性之间的生成关系。一个守恒量是相应对称变换的**生成元**。

* **无穷小变换**: 由一个函数 $G(q,p)$ 生成的无穷小变换定义为：
    $$
    \delta F = \epsilon \{F, G\}
    $$
    其中 $\epsilon$ 是一个无穷小参数。

* **时间演化算子**:
    根据动力学演化方程 $\frac{dF}{dt} = \{F,H\}$，在一个微小时间 $dt$ 内，物理量 $F$ 的变化为 $dF = dt\{F,H\}$。这表明：
    > **哈密顿量 $H$ 是时间演化的生成元。**

* **空间平移算子**:
    考虑沿 $q_k$ 轴的无穷小位移 $q_k \to q_k+\epsilon$。我们寻找生成元 $G$ 使得 $\delta q_k = \epsilon\{q_k, G\}=\epsilon$。根据基本泊松括号 $\{q_k, p_k\}=1$，我们发现 $G=p_k$。
    > **广义动量 $p_k$ 是沿广义坐标 $q_k$ 方向空间平移的生成元。**

* **空间转动算子**:
    考虑绕 $z$ 轴的无穷小转动。一个函数 $F$ 的变化为 $\delta F = \delta\phi \{F, L_z\}$。这表明：
    > **角动量 $L_k$ 是绕第 $k$ 轴空间转动的生成元。**

这一系列的对应关系（**对称性 $\Leftrightarrow$ 守恒律 $\Leftrightarrow$ 变换生成元**）是理论物理中最核心、最深刻的思想之一，它将动力学、守恒律和对称性完美地统一在哈密顿-泊松的框架之下。

---

### **3.3 正则变换 (Canonical Transformations)**

在哈密顿力学中，我们希望能在保持哈密顿方程形式不变的前提下，进行最广泛的坐标变换。这种特殊的、保持哈密顿体系“结构”的变换，就是**正则变换**。

#### **3.3.1 正则变换**

* **定义 (保辛变换)**:
    一个从旧坐标 $(q,p)$ 到新坐标 $(Q,P)$ 的相空间变换，如果存在一个新的哈密顿量 $K(Q,P,t)$，使得新坐标满足哈密顿正则方程：
    $$
    \dot{Q}_i = \frac{\partial K}{\partial P_i}, \quad \dot{P}_i = -\frac{\partial K}{\partial Q_i}
    $$
    则该变换称为**正则变换**。从几何上看，正则变换的本质是**保辛变换**，即保持相空间的辛结构 $\mathbf{J}$ 不变。其雅可比矩阵 $\mathbf{M}$ 必须满足 $\mathbf{M}^T\mathbf{J}\mathbf{M} = \mathbf{J}$。

* **正则不变量**:
    在正则变换下，基本泊松括号的结构保持不变，即 $\{Q_i, P_j\}_{(Q,P)} = \delta_{ij}$ 等。更一般地，任意两个函数之间的泊松括号也是不变量：
    $$
    \{f,g\}_{(q,p)} = \{f,g\}_{(Q,P)}
    $$

* **点变换**:
    最简单的一类正则变换是**点变换**，即新坐标只依赖于旧坐标：$Q_i = Q_i(q,t)$。这对应于拉格朗日力学中的广义坐标变换。

* **四种基本生成函数 (重点)**:
    验证正则变换的保辛条件很复杂。一个更具建设性的方法是使用**生成函数**来构造正则变换。其思想根源于哈密顿原理的等价性，要求 $p\dot{q}-H$ 和 $P\dot{Q}-K$ 最多只能相差某个函数 $F$ 的全时间导数。这导出了四种标准类型的生成函数：

    1.  **第一类生成函数 $F_1(q, Q, t)$**:
        以旧坐标 $q$ 和新坐标 $Q$ 为自变量。变换关系为：
        $$
        p_i = \frac{\partial F_1}{\partial q_i}, \quad P_i = -\frac{\partial F_1}{\partial Q_i}, \quad K = H + \frac{\partial F_1}{\partial t}
        $$

    2.  **第二类生成函数 $F_2(q, P, t)$**:
        通过对 $F_1$ 做勒让德变换得到，以旧坐标 $q$ 和新动量 $P$ 为自变量。**这是最常用的一种。**
        $$
        p_i = \frac{\partial F_2}{\partial q_i}, \quad Q_i = \frac{\partial F_2}{\partial P_i}, \quad K = H + \frac{\partial F_2}{\partial t}
        $$

    3.  **第三类生成函数 $F_3(p, Q, t)$**:
        以旧动量 $p$ 和新坐标 $Q$ 为自变量。
        $$
        q_i = -\frac{\partial F_3}{\partial p_i}, \quad P_i = -\frac{\partial F_3}{\partial Q_i}, \quad K = H + \frac{\partial F_3}{\partial t}
        $$

    4.  **第四类生成函数 $F_4(p, P, t)$**:
        以旧动量 $p$ 和新动量 $P$ 为自变量。
        $$
        q_i = -\frac{\partial F_4}{\partial p_i}, \quad Q_i = \frac{\partial F_4}{\partial P_i}, \quad K = H + \frac{\partial F_4}{\partial t}
        $$

* **刘维尔定理 (Liouville's Theorem)**:
    正则变换的一个深刻推论是刘维尔定理：**相空间中的体积元在哈密顿流下是守恒的**。
    $$
    \frac{d}{dt} \left( \prod_i dq_i dp_i \right) = 0
    $$
    这意味着，如果我们取相空间中一片区域，让这片区域中的每个点按照哈密顿方程演化，那么这片区域的形状可能会改变，但其总体积保持不变。这在统计力学中是系综理论的基石。

#### **3.3.2 单参数正则变换**

* **无穷小正则变换 (ICT)**:
    由一个生成元 $G(q,p)$ 和一个无穷小参数 $\epsilon$ 生成的变换 $\delta z = \epsilon\{z,G\}$ 是一种正则变换。

* **演化即是正则变换**:
    系统的哈密顿演化本身就是一族连续的正则变换。从时间 $t$ 到 $t+dt$ 的演化，就是一个由哈密顿量 $H$ 生成的无穷小正则变换：
    $$
    dz = \dot{z}dt = \{z,H\}dt
    $$
    因此，**哈密顿流是一族以时间 $t$ 为参数、以哈密顿量 $H$ 为生成元的正则变换**。

* **生成元与对称性**:
    这一框架完美地诠释了对称性与守恒律的关系。
    * 考虑一个由 $G$ 生成的正则变换。
    * 如果系统的哈密顿量 $H$ 在此变换下保持不变（即系统具有该变换对应的对称性），则意味着 $\{H,G\}=0$。
    * 而 $\{H,G\}=0$ 正是 $G$ 成为一个守恒量的条件。
    * **结论**: **一个守恒量，正是与之对应的对称变换的生成元**。这一深刻的对偶关系是近代物理学的核心思想之一。

---

### **3.4 哈密顿-雅可比理论 (Hamilton-Jacobi Theory)**

哈密顿-雅可比（H-J）理论是经典力学的最高成就之一。它的目标是，通过一次绝妙的正则变换，将复杂的动力学问题变得“平庸”——即完全静止。

* **核心思想**:
    寻找一次正则变换 $(q,p) \to (Q,P)$，使得新的哈密顿量 $K$ 恒等于零，$K \equiv 0$。
    如果 $K=0$，那么新的正则方程就是：
    $$
    \dot{Q}_i = \frac{\partial K}{\partial P_i} = 0, \quad \dot{P}_i = -\frac{\partial K}{\partial Q_i} = 0
    $$
    这意味着新的坐标和动量都是**常数**！$Q_i = \alpha_i, P_i = \beta_i$。
    力学问题就此解开：只要我们能找到这次变换，然后通过反演变换 $q=q(\alpha, \beta, t)$，就能得到原始坐标随时间的演化规律。

* **哈密顿-雅可比方程 (H-J Equation) 与哈密顿主函数**:
    我们利用第二类生成函数 $F_2$ 来实现这次变换，并把这个特殊的生成函数称为**哈密顿主函数 $S(q,P,t)$**。
    根据生成函数理论，新旧哈密顿量的关系为 $K = H + \partial S/\partial t$。我们的目标是 $K=0$，因此：
    $$
    H + \frac{\partial S}{\partial t} = 0
    $$
    我们还知道旧动量 $p_i = \partial S/\partial q_i$。将此代入上式，便得到一个只含函数 $S$ 的方程：
    $$
    H\left(q, \frac{\partial S}{\partial q}, t\right) + \frac{\partial S}{\partial t} = 0
    $$
    这就是著名的**哈密顿-雅可比方程**。它是一个关于 $S$ 的一阶非线性偏微分方程。

* **分离变量法与哈密顿特征函数**:
    如果哈密顿量不显含时间（能量守恒，$H=E$），我们可以用**分离变量法**求解H-J方程。设：
    $$
    S(q, \alpha, t) = W(q, \alpha) - E t
    $$
    其中 $W(q, \alpha)$ 被称为**哈密顿特征函数**，它只依赖于坐标。代入H-J方程后，得到时间无关的H-J方程：
    $$
    H\left(q, \frac{\partial W}{\partial q}\right) = E
    $$
    如果这个方程还能进一步在坐标 $q_i$ 之间分离变量，求解就会大大简化。

* **求解例子 (一维谐振子)**:
    $H = \frac{p^2}{2m} + \frac{1}{2}kq^2 = E$。时间无关H-J方程为：
    $$
    \frac{1}{2m}\left(\frac{dW}{dq}\right)^2 + \frac{1}{2}kq^2 = E
    $$
    解出 $dW/dq$ 并积分，得到 $W(q,E) = \int \sqrt{2m(E-\frac{1}{2}kq^2)}dq$。
    根据正则变换的法则，新坐标（常数）$\beta = \partial S/\partial E = \partial W/\partial E - t$。计算此积分并整理，最终可以反解出：
    $$
    q(t) = \sqrt{\frac{2E}{k}} \sin(\omega_0(t+\beta))
    $$
    这正是谐振子的正确解。

* **哈密顿主函数与经典作用量**:
    H-J理论与作用量原理有着深刻的内在联系。沿着真实的物理路径，哈密顿主函数 $S$ 的全时间导数为：
    $$
    \frac{dS}{dt} = \frac{\partial S}{\partial t} + \sum_i \frac{\partial S}{\partial q_i}\dot{q}_i = (-H) + \sum_i p_i \dot{q}_i = L
    $$
    积分可得：
    $$
    S(t_2) - S(t_1) = \int_{t_1}^{t_2} L dt
    $$
    这表明，**哈密顿主函数 $S$ 正是经典力学中的作用量积分**。最小作用量原理 $\delta S=0$ 的内涵，在H-J理论中得到了全新的诠释，它也构成了从经典力学通往波动力学（如量子力学）的桥梁。
