# LaTeX 实用小技巧·个人版

## 公式

- 正体：`\mathrm{}`
- 正体粗体：`\mathbb{}`

## 表格

- 表格太高了怎么办？把表格宽度改为大于一倍 `\textwidth` 并搭配 `\resizebox{}`　使用。例子如下：
  ```latex
    \begin{table}[h!]
    \centering
    \renewcommand{\arraystretch}{1.25}
    \resizebox{\textwidth}{!}{
    \begin{tabularx}{1.28\textwidth}{cXXXXXX}
        \hline
        年份 &
        项目/机构 \& 系统 &
        控制策略 \& 特点 &
        关键传感器 &
        致动器类型 &
        $0.1$--$1\,\mathrm{Hz}$ 振动衰减性能 &
        有效隔振频段 \\
        \hline
        
        2023 &
        LIGO A+ 隔振悬挂（美/英合作）\cite{10.1063/5.0117605} &
        三级隔振（被动+主动）；传感器融合（地震计+加速度计+位置传感）；前馈地面扰动补偿 + 反馈 $PID$ 控制；部分采用 $H_\infty$ 优化 &
        改进型 BOSEM 光学传感器（$4.5\times10^{-11}\,\mathrm{m}/\sqrt{\mathrm{Hz}}@1\,\mathrm{Hz}$）；Trillium~240 地震计 &
        线圈--磁铁作动器（真空兼容，低噪声） &
        对 $0.14\,\mathrm{Hz}$ 微震峰衰减约 $10$ 倍；对 $0.2$--$1\,\mathrm{Hz}$ 地运动衰减约 $20\,\mathrm{dB}$ &
        $0.1$--$30\,\mathrm{Hz}$（$<0.1\,\mathrm{Hz}$ 受限于 tilt 噪声） \\
        \hline
        
        2023 &
        E-TEST 低频隔振（ET 欧盟项目）\cite{andric2025geminiundergroundtestbedseismic} &
        双层隔振平台（主动 Stage-1 悬浮在无源 Stage-0 上）；$MIMO$ 反馈控制（6 自由度）；传感融合（Trillium 加速度计 + COBRI 干涉位移计）；地下部署降低环境噪声 &
        $3\times$ Trillium~T360 宽带地震计（$10\,\mathrm{mHz}$ 起）；COBRI 激光干涉仪（6~DoF 相对位移） &
        线圈--磁力作动（3 腿，每腿 3 个驱动线圈） &
        预期 $0.1\,\mathrm{Hz}$ 衰减 $>90\%$；$0.1$--$1\,\mathrm{Hz}$ 目标衰减 $>30$--$40\,\mathrm{dB}$ &
        $0.04$--$20\,\mathrm{Hz}$（由 T360 带宽决定） \\
        \hline
        
        2025 &
        冷原子重力仪主动隔振（中国科大等）\cite{Xie_2021} &
        被动隔振台 + 主动反馈（数字控制）；融合地震计与干涉绝对重力读数；自适应调参 $PID$；振动前馈补偿用于扣除剩余噪声 &
        $1\times$ GS-13 地震计（固有频率 $0.8\,\mathrm{Hz}$）+ 干涉绝对重力读数 &
        音圈作动器（驱动被动气垫台） &
        闭环将系统固有频率从 $0.8\,\mathrm{Hz}$ 降至 $0.015\,\mathrm{Hz}$；$0.01$--$1\,\mathrm{Hz}$ 噪声额外衰减最高 $500$ 倍（约 $54\,\mathrm{dB}$） &
        $0.01$--$10\,\mathrm{Hz}$（融合主动+被动，$>0.1\,\mathrm{Hz}$ 总衰减 $>1000$ 倍） \\
        \hline
        
        2025 &
        机载压电 Stewart 平台（中科院光机所）\cite{fang2025research} &
        6-DOF Stewart 主动隔振；前馈逆模型补偿压电迟滞 + 反馈线性化控制；引入 sky-hook 阻尼控制刚体模态 &
        $6\times$ 应变片位移传感（腿长变化）+ $6\times$ 加速度计（平台运动） &
        $6\times$ 压电陶瓷致动器（每腿驱动，行程放大机构） &
        $1$--$5\,\mathrm{Hz}$ 平台微振动幅值降低 $10$--$15\,\mathrm{dB}$；定位精度提高 $3$--$5$ 倍 &
        $1$--$50\,\mathrm{Hz}$（$<1\,\mathrm{Hz}$ 由载体被动隔振处理） \\
        \hline
        
        2024 &
        主动气浮隔振系统（宁波大学等）\cite{XU2024111705} &
        单自由度主动气浮台；$H_\infty$ 鲁棒控制（频率加权设计）；前馈+反馈（扰动观测 + 位移/压力反馈）；考虑阀控电压饱和保护 &
        $1\times$ 位移传感器（负载位移）+ $1\times$ 压力传感器（气腔压力） &
        电控比例阀 + 气囊弹簧（集成式作动/支撑） &
        $0.1$--$10\,\mathrm{Hz}$ 传递率最高降低 $60\,\mathrm{dB}$；$0.6$--$1\,\mathrm{Hz}$ 共振处达 $60\,\mathrm{dB}$；$<0.5\,\mathrm{Hz}$ 背景扰动衰减约 $20$--$30\,\mathrm{dB}$ &
        $0.1$--$50\,\mathrm{Hz}$（$>50\,\mathrm{Hz}$ 被动隔振占优） \\
        \hline
        
        2025 &
        GEMINI 双平台隔振试验台（意大利 LNGS 地下实验室）\cite{andric2025geminiundergroundtestbedseismic} &
        双平台间距 $3\,\mathrm{m}$ 同步隔振；架构借鉴 LIGO HAM-ISI；改进 MIMO 控制以适应地下限高与低高差；引入干涉测距实现跨平台测量 &
        每平台 $3\times$ Trillium~T360 地震计（惯性测量）；多组 COBRI 干涉仪（平台间 6~DoF 相对位移） &
        每腿 $3\times$ 电磁作动器（线圈--磁铁，低磁串扰设计） &
        设计目标：$0.1\,\mathrm{Hz}$ 处平台相对运动 $<1\,\mathrm{nm}/\sqrt{\mathrm{Hz}}$；低频性能预计较 HAM-ISI 提高 $5$--$10$ 倍 &
        $0.05$--$40\,\mathrm{Hz}$（地下环境降低 $>40\,\mathrm{Hz}$ 高频地噪） \\
        \hline
        
    \end{tabularx}}
    \caption{近五年典型低频主动隔振系统的参数与性能比较。这些案例涵盖引力波探测、精密计量、工业与空间等领域，体现出低频隔振技术多方面的创新和应用。可以看出，<1 Hz的有效隔振在实验室环境已逐步实现（如0.05–0.1 Hz起始频率），但在工程实践中仍面临传感噪声、倾斜耦合等瓶颈，需要通过更先进的传感器融合、智能控制和机械设计来克服。}
    \label{tab:tab1}
    \end{table}
    ```

## 参考文献

- 使用 `.bib` + BibTex：
    ```latex
    % 导言区
    \usepackage{gbt7714}
    \bibliographystyle{gbt7714-numerical}

    % 参考文献生成
    \bibliography{contents/ref}
    ```
- 引用：`\cite{}`