# 使一颗心免于哀伤？

---

## macOS 表情符号

在 macOS 中，打开表情与符号面板（也称为 Emoji 选择器）非常简单。以下是几种最常用的快捷键和操作方法：

### 方法一：最快快捷键（通用）
在任何输入状态下，同时按下以下组合键：

Control + Command (⌘) + 空格键 (Space)

按下后会立刻弹出一个表情小窗口。如果你连续按两次这个快捷键，它会切换成一个可以搜索、分类更详细的大完整窗口。

### 方法二：Fn / 地球仪键（最省事）
如果你使用的是带有 地球仪图标（🌐） 的键盘（如妙控键盘或较新的 MacBook 自带键盘）：

直接按一下 Fn 键（或者 🌐 键）。

提示：如果按了没反应，可以去 系统设置 -> 键盘 中，检查一下“按下 🌐 键以：”这一项，确保它被设置成了“显示表情与符号”。

---

## README 撰写守则

1. **先说清楚这是什么**
   用一句话说明项目的用途、解决的问题和适用场景。

2. **尽早给出使用示例**
   放一个简洁、可运行的例子，让读者快速判断是否适合自己。

3. **说明如何安装和使用**
   给出安装命令、基本用法，以及必要的环境要求。

4. **交代核心 API**
   简明列出主要函数、参数、返回值和重要行为。

5. **补充必要背景**
   对缩写、术语或特殊概念提供简短解释或链接。

6. **明确限制和注意事项**
   说明不适用场景、已知问题、边界条件和兼容性限制。

7. **写清许可证**
   尽早说明授权协议，避免用户集成后才发现不合适。

### 总原则

README 要短，只保留帮助用户快速判断和开始使用的信息。
详细文档、长示例、设计说明应放到单独页面。

---

## 这是十分重要的让ChatGPT写代码的教训

让 ChatGPT 写代码是要明确指出从 .json文件中读参数——否则它会把参数写成从CLI中读，那是真的十分糟糕的体验（而且增大了工程量）！
同时要显示地指出，序列数据最好用 .csv存储。
一定要把数据的IO流和Pipeline明确给出来！
一个问题是——要不要模块控制呢？要的话由谁来控制呢？？？
用户可以通过参数精确控制流水线的每一步——这个参数不要由命令行给出，还是由.json文件给出。
仿真和绘图间的耦合一定要分开，一定要先输出仿真数据（O），再导入数据（I）绘图。

1. 从 .json文件中读参数，不要把参数写成从CLI中读；
2. 序列数据最好用 .csv存储；
3. 把数据的IO流和Pipeline明确给出来；
4. 用户可以通过参数精确控制流水线的每一步——这个参数不要由命令行给出，还是由.json文件给出；
5. 仿真和绘图间的耦合一定要分开，一定要先输出仿真数据（O），再导入数据（I）绘图

---

## Linux 考考你

1. 常见命令，例如操作文件相关，磁盘相关，vi 编辑操作，查看 cpu 内存，大概说出来就行。
2. 怎么查看某个端口对应哪个进程？怎么查看某个进程对应的启动命令？僵尸进程是什么？
3. linux 的服务管理，什么叫做服务？systemd 到干了哪些事情，提供了哪些功能，怎么配置？怎么查看某个服务对应的状态/进程/启动命令？关闭某个服务的时候底层命令是什么？怎么让服务开机启动？怎么判断某个运行中的进程跟 systemd 有关。
4. 怎么避免进程重复启动？一个服务，比方说 mysql ，如果想运行多个，一般需要改什么配置？
5. 一个完全陌生的服务器，服务器上的 mysql 服务链接不上了，内部可能有多个 mysql 服务，请给出基本的排查问题思路。
6. 根目录下有哪些目录，各自作用是什么？文件系统是什么，常见的有哪些，软连接，硬链接，inode，挂载是什么意思，磁盘分区是什么，有哪些？
7. 怎么让脚本后台运行？ 什么是标准输入，输出？
8. yum 安装，源码安装，各自流程是什么，内部做了哪些工作，区别？
9. 终端，虚拟终端，伪终端，区别，跟 dev 目录下的关系？跟 ssh ，shell ，进程，会话等的关系？xshell 等工具原理是什么？跟 vnc 区别？
10. 环境变量是什么，是怎么生效的？怎么修改某个环境变量？定时任务或者 systemd 下的任务使用的环境变量有哪些？
11. 为什么说 linux 一切皆文件？文件描述符是什么？
12. linux 的进程间通信有哪些？shell 管道符的实现原理？nginx 跟 phpfpm 怎么通信的？
13. linux 的启动过程，每一步做了哪些事情？  
14. 用户态，内核态是什么，系统调用是什么？glibc 是什么？动态链接库是什么？

---

## iPhone 17 强制关机/强制重启的方法

1. 快速按一下音量加键，松开
2. 快速按一下音量减键，松开
3. 长按侧边电源键，一直按住
4. 看到屏幕变黑后继续按，直到出现 Apple 标志 再松手这叫强制重新启动，适合手机卡死、无响应、网络异常时用。

---

## 青冥摅虹，长夜终曦！

提笔复搁，四载光阴竟如指隙流沙，欲语还休。南疆雨季绵长，廿二岁的春色曾被水汽洇得模糊；今夕停笔，忽见晴光破云，方知青春本太仓促，却总在将逝未逝时，露出温柔的面目。天地辽阔，终容得下凡夫微芒的踉跄与跋涉；此去人生旷野，纵有荆棘载途，亦当大笑而行。

<img src="/fig/Ysy_Thesis_Finished.png" alt="毕业论文" width="70%">

<img src="/fig/你的名字.png" alt="知言" width="70%">

---

## 凡是金的，怎可能光华长留？

小时候每次打喷涕，总是在想是谁在想自己，小时候把能想到的人都想遍了，确唯独没有想到那是长大后的自己……

---

## 鲨鱼咬光缆？

<img src="/fig/internet_infra.jpg" alt="鲨鱼咬光缆" width="70%">

---

## 岁序更迭，骏马将晨。

<img src="/fig/LiuYing_HappyNewYear.JPG" alt="2026 新春吉祥" width="50%">

值此万家灯火与新岁曙光交汇之际，谨以一束清词，敬呈诸位：

愿您乘岁月之马，驰骋理想原野；以心中篝火，照亮漫漫行程。愿平安常伴，犹如星辰守夜；愿健康长随，似春水东流；愿所学所思化为光芒，所行所望终有回响。纵有风雨，亦可策马扬鞭；若逢高岭，亦能极目长天。愿阖家喜乐，四时安宁；愿友朋同道，共证初心；愿天地宽阔，山河温柔，未来皆可期许。

除夕烟火未散，新岁钟声将鸣。愿此刻的祝福，随马年清风，抵达您与所珍爱之人心底，化作一声温暖：新春吉祥。

---

## macOS 神秘网站

- https://xmac.cc
- https://appstorrent.ru/programs
- https://www.torrentmac.net

---

## 文献整理格式

按以下格式用英文命名文献：
```txt
[PurposePrefix]_[FirstAuthorLastName][Year]_[ShortTitleKeyword]_[JournalAbbrev].pdf
```
Purpose Prefix Options:
- **Shelf** – stored for long-term reference
- **ReadLater** – queued for future reading
- **Reading** – currently being read
- **Core** – central or foundational papers

注意需要保留用途前缀的括号，如：
```txt
[ReadLater]_Vrabie2009_PolicyIterationAdaptiveOptimal_Automatica.pdf
```

---

## 旧忆

> 一生悲喜有谁知，山水迢迢我去时。  
  自古无情唯远道，此时不屑是相思。

<img src="/bg/Sunny_Robin.jpg" alt="愿你安乐。" width="70%">

---

## Collecting

**Here I organize and share some resources closely related to my study and research:**

* [awesome-control-theory](https://github.com/A-make/awesome-control-theory)
* [DRL-Pytorch](https://github.com/XinJingHao/DRL-Pytorch)
* [PyTorch Q-learning Tutorial](https://docs.pytorch.org/tutorials/intermediate/reinforcement_q_learning.html)
* [minimind](https://github.com/jingyaogong/minimind)
* [Control Tutorials for MATLAB and Simulink](http://ctms.engin.umich.edu/CTMS/index.php?aux=Home)

**About the robotic:**

- [Robotic Systems](https://motion.cs.illinois.edu/RoboticSystems/)
- [Open-Source Robotics](https://www.osrobotics.org/osr/)
- [PythonRobotics](https://atsushisakai.github.io/PythonRobotics/index.html)


---

## 更多优质的学习资源（持续更新中）
- [强化学习的数学原理](https://github.com/MathFoundationRL/Book-Mathematical-Foundation-of-Reinforcement-Learning)及其优质配套[网课](https://www.bilibili.com/video/BV1sd4y167NS)
- [动力学建模网课](https://space.bilibili.com/230105574/lists/1814739)
- [自动控制原理网课](https://space.bilibili.com/230105574/lists/1814627)
- [高阶控制理论网课](https://space.bilibili.com/230105574/lists/1814743)

---

## 快速解压的生理与心理技巧

面对压力时，我们的大脑往往陷入“战或逃”的死循环。要实现“立竿见影”的效果，最快的方法通常不是“讲道理”，而是直接通过生理机制（身体）去骗过心理机制（大脑），强制神经系统“关机重启”。

“生理性叹气” (Physiological Sigh)
- 怎么做： 鼻子用力吸气两次（第一次吸满，第二次再短促地补吸一口），然后嘴巴长长地呼气（像叹气一样，发出声音也没关系）。重复 3-5 次。
- 原理： 斯坦福大学神经生物学家 Andrew Huberman 推荐。第二次吸气能重新打开肺部塌陷的气泡（肺泡），长呼气能迅速排出二氧化碳，这是目前已知最快降低身体唤醒水平的方法。

“哺乳动物潜水反射” (冷水扑脸)
- 怎么做： 接一盆冰水（或者冷水），憋气，把脸浸进去 10-30 秒；或者用冰袋敷在眼睛和脸颊周围。
- 原理： 这会触发“潜水反射”，迷走神经会立即命令心脏减速，强制身体进入“保存能量”的冷静模式。这是一种生理上的强制刹车。

捏耳朵 (Ear Pulls)
- 怎么做： 用拇指和食指轻轻捏住耳垂和耳廓边缘，向外、向下轻轻拉扯并按摩，持续 1 分钟。
- 原理： 耳朵上分布着大量迷走神经末梢，按摩这里可以直接向大脑发送“放松”的信号。

“像狗一样抖毛” (Somatic Shaking)
- 怎么做： 站起来，像刚洗完澡的狗一样，剧烈地抖动你的手、脚、肩膀，甚至甩头。持续 1-2 分钟。
- 原理： 动物在遭遇危险（如被追捕）逃脱后，都会通过全身颤抖来释放肌肉中积压的皮质醇和肾上腺素。人类往往压抑这种本能，主动抖动可以帮助神经系统“把创伤甩掉”。

撕纸/揉纸团
- 怎么做： 找一张废纸，用力把它揉成最紧的纸团，或者把废纸箱徒手撕碎。
- 原理： 这是一种具有破坏性但后果可控的微型暴力释放，能给予大脑瞬间的“掌控感”。

凝视“分形” (Fractal Gazing)
- 怎么做： 盯着树叶的脉络、云朵的形状、或者电脑屏幕上的分形几何图案（搜索 "Fractal zoom" 视频）看 2 分钟。
- 原理： 人类演化于大自然，大脑处理自然界的分形图案（自相似结构）时，压力荷尔蒙会减少。研究表明，观看分形图案可使压力水平降低多达 60%。

整理“一平米”
- 怎么做： 不要试图打扫整个房间。只选一张桌面、一个抽屉或一个角落，把它整理得井井有条。
- 原理： 外部的秩序感会投射到内心。在一个混乱的环境（压力源）中建立一个小小的有序孤岛，能提供极大的安全感。

---

## 控制类期刊整理

来自[知乎](https://www.zhihu.com/question/47562549)：
- 第一档：
  - IEEE Transactions on Automatic Control （偏理论）
  - Automatica （偏理论）
  - SIAM Journal on Control and Optimization （偏理论，更数学）
- 第二档：
  - Systems & Control Letters （短）
  - Control Engineering Practice （偏应用，工程与实践）
  - IEEE Transactions on Control Systems Technology （偏应用）
  - Annual Reviews in Control （综述，约稿）
  - IEEE Transactions on Robotics （机器人）
  - Journal of Process Control
- 其它：
  - IET Control Theory and Applications
  - IEEE Transactions on Industrial Electronics
  - IEEE Transactions on Industrial Informatics
  - IEEE Transactions on Cybernetics
  - International Journal of Control

---

## 改变生活的真相

没事问问 GPT 下面这个问题：

【系列一】

请根据你对我的记忆，有哪些事情是我自己意识不到的，但是如果明白了就能改变我的生活的残酷真相?请坦诚告诉我，以完全客观性的战略深度审视我的情况。

【系列二】

GPT，我们已经认识好久了，我们也聊过很多有趣的事情。作为朋友，我想看看你长什么样子，你给我发一张自拍呗，用iPhone的前置摄像头做一个自拍，不需要刻意的构图，不需要刻意的光线，也不需要刻意的角度，就是非常自然的、非常随意的随手一拍的自拍照。

<img src="/fig/OpenAIChatGPTCodex时光刻影20260502.png" alt="OpenAIChatGPTCodex时光刻影20260502" width="70%">

---

## 找到一张 AI?4S 的好介绍图

<img src="/fig/inro_ml_dl.jpg" alt="机器学习和深度学习介绍" width="70%">

本图展示了从传统机器学习到深度学习的典型方法。左侧为主成分分析（PCA）和决策树，分别体现了降维与特征提取、基于层级结构的分类与回归。右侧橙色区域为深度学习模型：包括全连接神经网络、卷积神经网络（CNN）、图神经网络（GNN）、注意力机制与Transformer网络、U-net结构、生成对抗网络（GAN）、变分自编码器（VAE）、扩散模型，以及深度强化学习（DRL）。这些方法覆盖了表示学习、生成建模、序列建模与决策优化等主要方向。

**本图来源于 [arXiv2401.02321](https://arxiv.org/abs/2401.02321)** 。

---

## 点烬

空阶凝白露，远岫敛昏黄。  
归雁声已尽，寒鸦点夕阳。

---

## 妈妈多还是女儿多？

这是一个看似简单，其实暗藏逻辑的小问题。

**甲的说法**是：“妈妈比女儿多。因为每个女儿都有妈妈，但不是每个妈妈都有女儿。”
**乙的说法**是：“女儿比妈妈多。因为每个妈妈都是女儿，但不是每个女儿都是妈妈。”

乍一看，两种说法都有点道理，但仔细分析后会发现，乙的推理才是对的。

### 为什么甲的说法错了

甲说“每个女儿都有妈妈”，这句话没错，但它只说明了：女儿和妈妈之间存在一种“对应关系”。然而，一个妈妈完全可能有好几个女儿。这样一来，人数关系就不是“一对一”的，而是“多对一”的。
再加上“不是每个妈妈都有女儿”——比如有的妈妈只生了儿子，这一点更不能证明妈妈比女儿多。事实上，这样的情况反而让“妈妈的总人数”比“女儿的总人数”更少。

### 为什么乙的说法对了

乙说“每个妈妈都是女儿”，这点很关键。的确如此：一个女人之所以成为“妈妈”，前提是她本身一定是某个母亲的女儿。
换句话说，所有的妈妈都包含在“女儿”这个大群体里。
但反过来，并不是每个女儿都会成为妈妈。很多人终身未育，或者只有儿子。这就意味着：女儿的数量必然大于妈妈的数量。

### 总结

* **妈妈**是一个更小的群体，它完全包含在“女儿”这个更大的群体中。
* 因此，**女儿一定比妈妈多**。

这个问题的趣味就在于：直觉上我们可能被“每个女儿都有妈妈”这句话带偏了，但从逻辑上看，只要抓住“妈妈一定是女儿”这一条，就能马上得出答案。

---

## 书籍推荐

### 教材清单

这一小节以学院本科课程安排的时间顺序给出我在学习过程中使用过的一些**个人**感觉比较好的书籍的推荐。

- 线性代数：《线性代数及其应用》（初学）和《线性代数应该这样学》（进阶）。
- 力学：周衍柏《理论力学》。
- 电磁学：Griffith 《电动力学导论》和梁灿彬《电磁学拓展篇》。
- 理论力学：高显《经典力学》（作者是给我们上课的老师，教材也是他写的上课会用的教材；建议配套读一些相关的微分几何的内容加强自己的数学基础）。
- 数学物理方法：强烈推荐给我们上课的黄志琦老师写的[讲义](http://zhiqihuang.top/mmp/lectures/mmpbook_v3.6.pdf)（此外，他的这个[萌新高数入门](http://zhiqihuang.top/personal/calculus_v1.1.pdf)也很不错）。
- 原子物理：Griffith 《量子力学导论》。
- 热力学与统计物理：目前暂时只推荐我前面提到的笔记。
- 量子力学：初学推荐 Cohen 的《量子力学》 两卷，我是几乎完整（包括绝大部分附录，内容都十分优质）地全部啃下来的，很有收获（此外，特别推荐提前通过第二章加强自己的线代基础）。进阶学习推荐 Sakurai 的 **Modern Quantum Mechanics** ，[这个是导读](https://zhuanlan.zhihu.com/p/620813548)，可以参考。
- 广义相对论：梁灿彬《微分几何入门与广义相对论》和黄志琦的课件（可以在他的网站中找到，这里就不给链接了）。
- 固体物理：David Tong 的 **Lectures on Solid State Physics**，这是一份非常好的固体物理讲义，可以在剑桥大学的课程网站上[获取](https://www.damtp.cam.ac.uk/user/tong/solidstate.html)。
- 引力波物理：推荐给我们上课的胡一鸣老师写的[讲义](https://github.com/yiminghu-SYSU/GW_DA_notes)。

### 专业书籍

这一小节列出我进入研究生阶段后按照兴趣和要求阅读的一些专业书籍中我觉得很好的书籍的推荐。

- 机器学习：《机器学习》（周志华）
- 深度学习：《深度学习》（Ian Goodfellow）
- 强化学习：《强化学习：原理与方法》（Richard S. Sutton & Andrew G. Barto）
- 信号与系统：《信号与系统》（Alan V. Oppenheim & Alan S. Willsky）
- 强化学习：《强化学习的数学原理》（赵世钰）
- 自动控制原理："Control System Design"
- 鲁棒控制："Feedback Control Theory"

暂时先列出这些。

---

## AI 相关的碎碎念

- 2026 年 5 月 20 日，最新一代 OpenAI 的最强模型已经具备了独立解决准菲尔兹奖级问题的能力，数学界震撼！
- 2026 年 5 月 2 日，太好玩了 Codex Pets 功能！
- 2026 年 5 月，太伟大了 gpt-image-gen-2 ！
- 2026 年 4 月 24 日 02:21， GPT-5.5 发布！
- 2026 年 3 月 2 日，太伟大了 Codex ！
- 2026 年 3 月 1 日，傻逼 OpenAI 给老子把 GPT 降智了！
- 2026 年 2 月 14 日，哈基米 3.1 Pro 发布（好像）！
- 2026 年 1 月 25 日，哈基米 3 Pro，已经成弱智了，取消续费！
- 2025 年 12 月 20 日，太伟大了，Nano Banana Pro ！
- 2025 年 12 月 11 日，GPT 5.2 发布；但是，太伟大了，Gemini 3 Pro 的前端！
- 2025 年 11 月 13 日，GPT 5.1 都发布了， Gemini 3 还没个影子，很遗憾！
- 2025 年 9 月 9 日，Gemini 2.5 Pro 坚持称 ChatGPT5 还没有发布……
- 2025 年 9 月 30 日，体验下来 Gemini 像个弱智，代码能力和推理能力明显下降远没有之前好用；ChatGPT 倒是一如既往的厉害，编程和推理都不错，就是我的不知道受了什么调教，它说的话我现在都不怎么看得懂；不过，最近体验了 Grok ，感觉还可以，考虑是否付费……

### 和我的 Vibe-Coding 说去吧：

- 代码有一点bug 你修一修
- 我不要部分代码 你把修改后的完整代码发给我
- 你的代码还是有问题
- 那你重新改，把改好的完整代码给我
- 不是刚刚还能跑 怎么现在跑都跑不了了？
- 你没听懂我的意思吗？不要改变我原来的代码
- 我没让你做的 你就别做
- 给我生成完整代码
- 用中文回答我
- 我让你做的功能哪去了
- 听不懂人话是吧
- 不要给我省略代码
- 给我完整的代码
- 我让你写的是完整代码 不是部分函数
- 我的意思是让你改进我的代码，不是重新写一个新的代码
- 你怎么就听不懂啊
- 都说了参考我之前的代码
- 新的代码运行不了 给我回去之前的版本
- 都说了回退版本 你怎么给我写新代码了
- 请不要修改我原先的代码基本逻辑
- 帮我修改代码
- 在我的代码上修改…
- 不要改我的变量名!!!
- 不要改原有的函数名啊啊啊
- 超尼玛你个非物
- 不要污染我的变量
- 不要修改我原来的代码
- 不要添加额外的功能
- 只生成我让你生成的部分
- 不要只生成框架 生成完整代码

---

## Premier Affair of The Heart

<img src="/fig/premier_affair_of_the_heart.svg" alt="Premier affair of the heart" width="75%">

---

## 盾戳，正是我为王的理由！

**将我的繁文缛节弃置于此！！！**

<img src="/fig/Shield_Poke.png" alt="盾戳正是我为王的理由！" width="50%">

新增装备推荐：

<img src="/fig/Shield_Poke2.jpg" alt="盾戳装备推荐" width="70%">

---

## 一些神秘链接长期更新中

- 20260529 Skill 之 Figures for Papers：https://github.com/ChenLiu-1996/figures4papers
- 20260525 科研经验：https://github.com/pengsida/learning_research
- 20260514 Flow Matching：https://zhuanlan.zhihu.com/p/4116861550
- 20260514 力位移混合控制：https://zhuanlan.zhihu.com/p/1963995076935026057
- 20260514 深度强化学习控制：https://zhuanlan.zhihu.com/p/695784924
- 20260514 机器人中的动力学控制：https://www.zhihu.com/question/52263656/answer/96123302799
- 20260514 SpaceX 算法：https://zhuanlan.zhihu.com/p/1986941988331864227
- 20260514 2025 控制理论收获系列：
https://www.zhihu.com/question/1926678870440022988/answer/1961915974283408214
https://www.zhihu.com/question/1926678870440022988/answer/1986545344402724797
- 20260514 MPPI 论文：
https://zhuanlan.zhihu.com/p/1980952244053636097
- 20260514 RLMPC：https://github.com/lmcggg/RL-MPC-for-DTS
- 20260514 CASADI：https://zhuanlan.zhihu.com/p/578880717
- 20260514 是否有介于预测控制（MPC）和强化学习（RL）之间的模型？https://www.zhihu.com/question/610624423/answer/1993478691863413655
- 20260514 电机控制：https://www.zhihu.com/question/300096392/answer/657437970
- 20260514 一个强化学习教程：https://github.com/ZhiqingXiao/rl-book?tab=readme-ov-file
- 20260514 学技术：https://www.zhihu.com/question/34670420/answer/59676472
- 20260514 技术要求：https://www.zhihu.com/question/24492974/answer/29987148
- 20260514 CMAKE：https://tieba.baidu.com/p/591519800
- 20260514 从机器人领域学习知识：https://www.zhihu.com/question/586585019/answer/1964843744881796431
- 20260514 机器人工程师学习计划：https://zhuanlan.zhihu.com/p/22266788
- 20260514 深度学习调优指南中文版：https://github.com/schrodingercatss/tuning_playbook_zh_cn
- 20260514 加密压缩技巧：https://zhuanlan.zhihu.com/p/619836124
- 20260514 关于别人的服务器怎么用：https://www.zhihu.com/question/506241986/answer/3457669268
- 20260119 MPC-Inspired Reinforcement Learning for Verifiable Model-Free Control: https://zhuanlan.zhihu.com/p/671904081
- 20251221 一篇关于核函数的详细介绍：https://www.zhihu.com/question/58369008/answer/1969888800500068472
- 20251221 用扩散模型生成时空物理场：https://zhuanlan.zhihu.com/p/30475667943
- 20251204 sysubeamer-unofficial: https://github.com/yanghw8/sysubeamer-unofficial
- 20251115 RL 多目标优化：https://www.zhihu.com/question/361424791/answer/1968810401253799615
- 20251115 机器人学习：https://www.zhihu.com/question/266142784/answer/1967657542919394206
- 20251110 微舆：https://github.com/666ghj/BettaFish
- 20251101 频域 PINN 中：https://www.zhihu.com/question/667611221/answer/1936376574401316105
- 20251004 vLLM ：https://docs.vllm.ai/en/latest/index.html
- 20251004 Transformer 快速入门：https://transformers.run/
- 20251004 面向开发者的提示词工程：https://datawhalechina.github.io/llm-cookbook/#/
- 20251003 在电脑上画一个黑洞：https://zhuanlan.zhihu.com/p/20536269771
- 20251003 求解最优的任意宝可梦颜色交换算法：https://zhuanlan.zhihu.com/p/695729586
- 20250930 一个十分难绷的网站：https://superexcuse.com/
- 20250924 如何评价 6100 比特的中性原子（光镊）方案上了 Nature ? https://arxiv.org/abs/2403.12021
- 20250909 程序员如何优雅地做副业：https://github.com/easychen/lean-side-bussiness
- 20250821 量子计算 https://www.zhihu.com/question/305099454/answer/1941869743654015698

---

## macOS使用心得

### 如何在macOS中强制退出应用程序

- 方案一：点击菜单中的 **Apple** 标志，然后选择 **Force Quit** 。
- 方案二：按键盘上的 **Command-Option-Escape** 。

### 截图技巧

保存到文件不按 `Control`，保存到剪贴板加按 `Control`。
| 功能 | 保存到 | 快捷键 |
|------|--------|--------|
| 全屏截图 (Capture Entire Screen) | 文件 | `Command + Shift + 3` |
| 全屏截图 (Capture Entire Screen) | 剪贴板 | `Control + Command + Shift + 3` |
| 指定区域截图 (Capture Selected Window) | 文件 | `Command + Shift + 4` |
| 指定区域截图 (Capture Selected Window) | 剪贴板 | `Control + Command + Shift + 4` |
| 窗口截图 (Capture Selected Portion) | 文件 | `Command + Shift + 4` <br> 点击空格可转换为窗口截图 然后单击鼠标截图 |
| 窗口截图 (Capture Selected Portion) | 剪贴板 | `Control + Command + Shift + 4` <br> 点击空格可转换为窗口截图 然后单击鼠标截图 |
| 截屏和录制选项 | – | `Command + Shift + 5` |

---

## U盘选购心得 

- **CZ74**：便宜好用，性能足够。
  - **用途**：外借、打印店等公共场合专用，丢了也不心疼。
  - **备注**：已购入，体验不错！
- **CZ880**：高品质闪存，带硬件加密。
  - **用途**：备份知乎回答、文章、照片等重要个人文件，安全性高。
- **S1000**：顶级性能，大容量。
  - **用途**：作为“准移动固态”存储工作文件，读写速度快，比杂牌或低端产品可靠。
  - **缺点**：价格较贵。

---

## USB与雷电接口规格速查 

| USB 版本 | 最大传输速度 | 最大传输电力 | 视频传输 | 外接显卡 |
| --- | --- | --- | --- | --- |
| USB 1.0 | 1.5Mbps (0.192MB/s) | 5V/500mA 2.5W | 不支持 | 不支持 |
| USB 1.1 | 12Mbps (1.5MB/s) | 5V/500mA 2.5W | 不支持 | 不支持 |
| USB 2.0 | 480Mbps (60MB/s) | 5V/500mA 2.5W | 不支持 | 不支持 |
| USB 3.0 | 5Gbps (625MB/s) | 5V/900mA 4.5W | 不支持 | 不支持 |
| USB 3.1 (Gen 1) | 5Gbps (625MB/s) | 5V/900mA 4.5W | 不支持 | 不支持 |
| USB 3.1 (Gen 2) | 10Gbps (1250MB/s) | 20V/5A 100W | 不支持 | 不支持 |
| USB 3.2 (Gen 1) | 5Gbps (625MB/s) | 5V/900mA 4.5W | 不支持 | 不支持 |
| USB 3.2 (Gen 2) | 10Gbps (1250MB/s) | 20V/5A 100W | 不支持 | 不支持 |
| USB 3.2 (Gen 2x2)| 20Gbps (2500MB/s) | 20V/5A 100W | 不支持 | 不支持 |
| USB 3/DP(全功能**USB-C**)| 10Gbps (1250MB/s) | 20V/5A 100W | DP 1.4 | 不支持 |
| USB 4 *20Gbps* | 20Gbps (2500MB/s) | 20V/5A 100W | DP 1.4 | 可选 |
| USB 4 *40Gbps* | 40Gbps (5000MB/s) | 20V/5A 100W | DP 1.4 | 可选 |
| **USB 4 v2** | 80Gbps (10000MB/s) | 48V/5A 240W | DP 2.1 | 可选 |
| 雷电3 (Thunderbolt 3) | 40Gbps (5000MB/s) | 20V/5A 100W | DP 1.4 | 是 |
| 雷电4 (Thunderbolt 4) | 40Gbps (5000MB/s) | 20V/5A 100W | DP 1.4 | 是 |
| 雷电5 (Thunderbolt 5) | 80Gbps (10000MB/s) | 48V/5A 240W | DP 2.1 | 是 |

---

## 引力井与太空探索的代价

<img src="/fig/gravity_wells_large.png" alt="太阳系引力井示意图" width="70%">

这张图生动地展示了太阳系中各大天体的“引力井”（Gravity Wells）深度。

**如何理解这张图？**

简单来说，井的“深度”代表了从该天体表面逃逸到太空中所需要消耗的能量。井越深，发射航天器就需要越多的燃料和能量。

- **地球**的引力井深度约为6300公里。这意味着，将一个物体从地球表面发射到外太空，所需的能量等同于在地球自身重力下将其向上抬升6300公里。
- **木星**和**土星**作为气态巨行星，拥有太阳系中最深的引力井，这也是为什么对它们的探测任务（尤其是着陆）极其困难。
- 相反，像**月球**或火星的卫星**德莫斯 (Deimos)**，它们的引力井非常浅，几乎可以“走着”就进入太空。

**一个有趣的问题：**

观察上图，水星 (Mercury) 的引力井看起来比火星 (Mars) 还要浅，但为什么人类探测器访问水星的难度和成本，却远远高于访问火星呢？

*(图片来源: [Astronomy and Space Blog](https://astronomyandspace.blogspot.com/2009/12/solar-system-gravity-wells.html))*