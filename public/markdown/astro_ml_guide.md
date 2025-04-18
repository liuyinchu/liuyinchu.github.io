# “天文+机器学习”实用指南

> 基于文献：***"How to set up your first machine learning project in astronomy"***  (Buchner & Fotopoulou, *Nat Rev Phys*, 2024)

---

## I. 科研导向的机器学习：开篇思路

- ML 项目不等于“模型竞赛”；核心任务是**解决科学问题**。
- 项目的起点应是清晰的**科学目标**，而非“尝试一下某种模型”。
- 必须明确：**谁在用你的模型？模型将被用于什么决策？输出结果如何反馈科学分析？**

## II. 项目设计（Your New Project）

### 1. 写出科学问题的决策句
- "给定 X，我们应该做 A 还是 B？"
- 明确输入输出、预测目标、结果用途。

### 2. 明确成功定义与评估指标
- 不同科学任务需匹配不同 metric（精度、召回率、F1、后验分布等）。
- 明确 baseline 的得分。

### 3. 设定 baseline
- Dummy baseline（全为多数类、均值预测等）
- Historical baseline（文献中经典模型）
- Initial baseline（你能快速跑通的模型）

### 4. 识别问题的结构与难点
- 是否存在假阳性/假阴性非对称代价？
- 输入特征中是否泄露未来信息？
- 数据分布是否与目标一致？（Covariate shift）

## III. 工作环境（Work Environment）

- 明确你是为谁工作：天文学家？调度系统？后续模型使用者？
- 与数据背后的物理建立联系，理解测量、偏差、缺失机制。
- 采用 human-in-the-loop 思维：为人工审查与干预保留通道。
- 明确团队中各个角色（物理、ML、工程、管理）及其边界与沟通接口。
- 写下假设（assumptions）与限制条件，保持科研透明性。

## IV. 起点与基线（The Starting Point）

- 不从复杂模型开始，而是从最基本、最透明的 baseline 开始：dummy → historical → personal prototype
- 初始目标：**跑通端到端流程**（数据→训练→评估→可视化）
- 输出结构化的训练日志、loss 曲线、样例预测，建立实验对比框架。

## V. 有效服务于科学（Being Useful for Science）

### 1. 输出必须具有**不确定性**
- Bayesian NN, dropout, ensembles, quantile regression 皆可用。
- 区分 aleatoric / epistemic 不确定性。

### 2. 处理 Covariate Shift
- 训练数据与实际部署数据不一致是常态。
- 使用 domain adaptation、importance weighting、fine-tuning 等方法。

### 3. 科学价值高于数值精度
不要追求“0.01 的精度提升”，要追求“物理可解释性 + 泛化能力”。

## VI. 人类学习（Human Learning）

### 1. 用模型学物理，而不仅仅是让模型学得好。

### 2. 方法：
- Feature importance（如 SHAP, permutation importance）
- 模型内部可视化（中间层、attention、latent space）
- 消融实验（ablation study）检验模型结构的贡献性

### 3. 把模型当科研伙伴：“你为什么这么预测？”
鼓励“对模型提问”，建立基于解释的信任。

## VII. 科研沟通（Communication）

### 1. 不能只报告分数，要报告行为：
错误分布、边界案例、分类热图、置信度分布等

### 2. 开放完整流程（not just code）
- 开源：代码、配置、模型权重、训练记录、说明文档
- 工具建议：GitHub + W&B/MLflow + Jupyter

### 3. 写清每一个科研决策
- 为什么选择了某个模型？
- 为什么采用这个输入？
- 实验失败的尝试也要写！

### 4. 使用图表作为主语言
confusion matrix、PR/ROC 曲线、t-SNE 可视化、saliency heatmap 等

## VIII. 十条黄金建议（全章总结）

1. 从明确的科学问题出发，而非“尝试模型”
2. 在训练前定义“成功”的衡量方式
3. 建立 baseline，从 dummy 开始
4. 深入理解数据来源、偏差与测量误差
5. 考虑训练集和实际应用集的分布偏移
6. 给预测结果加上可信度（uncertainty）
7. 分析模型行为，解释其物理意义
8. 确保工作可复现，可复查，可交接
9. 善用可视化传达复杂现象与结果
10. 你的目标是“对科学有用”，而不只是“更准一点”