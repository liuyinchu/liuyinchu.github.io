# 随记文章专用封面

生成日期：2026-10-20。使用内置 imagegen 工具，每篇单独生成；原始 PNG 经系统 sips 转为质量 85 的 JPEG，保留原始尺寸。科学主题图片用于概念封面，不作为精确教学示意图。

图片由 public/articles.json 的 image 字段引用，列表和文章页共用。构图兼顾 16:9 横幅和中心方形裁切，图内不叠文章标题。

## 逐篇处理清单

| 文章 | 原封面 | 新封面 |
| --- | --- | --- |
| 我们的时代中 | `/bg/blog_cover_rainbow_4k.jpg` | [`in_our_time.jpg`](in_our_time.jpg) |
| 高度近视配镜复盘，从眼健康检查到蔡司网配 | `/bg/blog_cover_black_deep_space_4k.jpg` | [`eyeglasses_note_2026.jpg`](eyeglasses_note_2026.jpg) |
| precision-physkit：把精密测量数据处理整理成可复现的工作流 | `/bg/blog_cover_purple_white_4k.jpg` | [`precision_physkit_blog.jpg`](precision_physkit_blog.jpg) |
| 开篇与导论：实验数据处理作为参数估计 | `/bg/heroine.jpg` | [`lab_guide_intro.jpg`](lab_guide_intro.jpg) |
| H∞ 鲁棒控制简明教程 | `/bg/Qingming_Xi.JPG` | [`hinf_robust_control_tutorial.jpg`](hinf_robust_control_tutorial.jpg) |
| 现代性与饮食：把世界吞入腹中 | `/bg/thinking_and_writing.png` | [`modernity_and_diet.jpg`](modernity_and_diet.jpg) |
| 系统辨识教程：从 PRBS 激励到状态空间子空间辨识 | `/bg/Qingming_Xi.JPG` | [`system_identification_teaching.jpg`](system_identification_teaching.jpg) |
| AI Agent 工程化使用指南 | `/bg/random_gradient_blue_1.jpg` | [`ai_agent_blog.jpg`](ai_agent_blog.jpg) |
| 基于功率谱密度的随机时域序列生成方法 | `/bg/heroine.jpg` | [`measured_psd_to_noise_generator.jpg`](measured_psd_to_noise_generator.jpg) |
| 从受激拉曼跃迁到 Mølmer-Sørensen 门 | `/bg/visitor.jpeg` | [`raman_ms_gate_note.jpg`](raman_ms_gate_note.jpg) |
| 强化学习介绍 | `/bg/research.png` | [`rl_intro.jpg`](rl_intro.jpg) |
| uv 使用技巧速查 | `/bg/spring.jpg` | [`uv_cheatsheet.jpg`](uv_cheatsheet.jpg) |
| 时频分析小技巧 | `/bg/heroine.jpg` | [`t_f_analysis.jpg`](t_f_analysis.jpg) |
| Python 现代开发小技巧 | `/bg/spring.jpg` | [`learn_python_dev.jpg`](learn_python_dev.jpg) |
| Python 数据分析小技巧 | `/bg/spring.jpg` | [`learn_python_data_analysis.jpg`](learn_python_data_analysis.jpg) |
| LaTeX 实用小技巧 | `/bg/Skadi_by_the_Sea.jpg` | [`latex_cheatsheet.jpg`](latex_cheatsheet.jpg) |
| 智能增强的非线性动力学数据驱动建模 | `/bg/Qingming_Xi.JPG` | [`ddm_intro.jpg`](ddm_intro.jpg) |
| 学习如何规范排版 A4 大小的文章 | `/bg/Skadi_by_the_Sea.jpg` | [`A_First_Look_at_A4_Layout.jpg`](A_First_Look_at_A4_Layout.jpg) |
| 矩阵的奇异值分解及其应用简介 | `/bg/Qingming_Xi.JPG` | [`svd_intro.jpg`](svd_intro.jpg) |
| 深度学习实用指南 | `/bg/neighbor.jpeg` | [`deep_learning_playnote.jpg`](deep_learning_playnote.jpg) |
| 学习 PyTorch | `/bg/research.png` | [`learn_pytorch.jpg`](learn_pytorch.jpg) |
| 动力学与控制·基础 | `/bg/Qingming_Xi.JPG` | [`control_personal_note.jpg`](control_personal_note.jpg) |
| AI4S 实用指南 | `/bg/neighbor.jpeg` | [`astro_ml_guide.jpg`](astro_ml_guide.jpg) |
| An Introduction to the Two-Stage Torsion Pendulum | `/bg/Qingming_Xi.JPG` | [`Introduction_to_the_Two_Stage_Torsion_Pendulum.jpg`](Introduction_to_the_Two_Stage_Torsion_Pendulum.jpg) |
| Rust 学习笔记 | `/bg/sakura_valley.png` | [`learn_rust.jpg`](learn_rust.jpg) |
| Linux 云主机学习笔记 | `/bg/sakura_valley.png` | [`note_of_configure_server.jpg`](note_of_configure_server.jpg) |
| 终端模拟器 kitty 个人配置笔记 | `/bg/sakura_valley.png` | [`kitty_config_log.jpg`](kitty_config_log.jpg) |
| 固体物理笔记（二）：能带论 | `/bg/visitor.jpeg` | [`solid_physics_note2.jpg`](solid_physics_note2.jpg) |
| 固体物理笔记（三）：电子动力学 | `/bg/visitor.jpeg` | [`solid_physics_note3.jpg`](solid_physics_note3.jpg) |
| 固体物理笔记（四）：声子 | `/bg/visitor.jpeg` | [`solid_physics_note4.jpg`](solid_physics_note4.jpg) |
| 规范命名建议 & 倡议 | `/bg/neighbor.jpeg` | [`naming_guide.jpg`](naming_guide.jpg) |
| Python 小技巧 | `/bg/spring.jpg` | [`learn_python.jpg`](learn_python.jpg) |

## 保留的已有专用封面

- 给 AI 编程助手补一份项目记忆：聊聊 claude-mem：`/bg/claude_mem_intro.png`
- 两个值得安利的开源工具：RQ 与 Worktrunk：`/bg/rq_worktrunk_note.jpg`
- 直到我冲向风车，你才想起我也姓唐：`/bg/knight_and_doctor_1.png`
- 键影罗成方寸谱，轴声敲入半生笺：`/bg/keyboards_blog.png`

## 最终提示词

以下为各张最终采用图片的完整提示词。后续替换图片时使用同名文件，或同步更新 articles.json。

### in_our_time

```text
Use case: illustration-story. A reflective summer graduation walk: a solitary young adult from behind on an old stone arched bridge, river glinting below, leafy tree shadows and tiled eaves, distant ordinary city crowds. Painterly editorial illustration with soft grain, muted jade and warm late-afternoon gold, thoughtful and open-ended. The bridge and walker form one central scene.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### eyeglasses_note_2026

```text
Use case: product-mockup. An elegant small titanium eyeglass frame centered on an optician's workbench, a pair of detached high-index lenses and a discreet measuring caliper nearby, soft refractions and clean curved edges. High-quality realistic product illustration, charcoal teal background with warm lens highlights, precise and calm. No branded instruments or readable measurements.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### precision_physkit_blog

```text
Use case: stylized-concept. A miniature precision measurement workstation whose transparent data ribbon travels through three machined processing gates: gapped time samples become a clean wave then a single narrow spectral resonance peak on a dark glass panel. No glyphs or labels. Tactile editorial 3D illustration, graphite and cool teal with small amber accents, reproducibility and orderly workflow.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### lab_guide_intro

```text
Use case: scientific-educational. A brushed-metal vernier caliper measuring a small metal rod on an ivory laboratory notebook. A tasteful translucent row of repeated observation dots converges around one central estimate, with a few simple vertical uncertainty bars behind the rod. Clear physical subject, realistic technical still life, slate blue and warm paper palette, no written scales or labels.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### hinf_robust_control_tutorial

```text
Use case: stylized-concept. A central precision mechanical plant connected by one continuous closed feedback loop of fine blue light; an amber disturbance ripple enters from the side but the output becomes a calm steady cyan line inside a subtle protective performance envelope. Dark navy engineered tabletop, sculptural wires and frosted glass, sophisticated conceptual control-system cover, no pseudo-equations.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### modernity_and_diet

```text
Use case: illustration-story. An intimate overhead editorial still life of a modern breakfast table: a ceramic cup of coffee, torn bread, a small bowl of spices, a red chili, a potato and a small fermentation jar. Subtle threadlike ocean-travel curves connect these foods across a barely suggested paper map texture underneath. Rich earthy terracotta, cream and ink blue, thoughtful cultural essay illustration with natural material detail. Food is the clear subject, not a map infographic.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### system_identification_teaching

```text
Use case: stylized-concept. A laboratory black box centered on a dark table: a crisp two-level binary pulse ribbon enters at left and a smooth measured response ribbon exits at right; behind it, neat translucent matrix tiles and a descending staircase of singular-value bars reveal the hidden system. Polished scientific editorial 3D, deep teal, cobalt and a restrained amber input, no labels or numeric axes.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### ai_agent_blog

```text
Use case: stylized-concept. A focused miniature developer workbench with three connected objects forming an elegant circular workflow: a file tray, a terminal-like dark glass pane of abstract short line blocks, and a small testing fixture with one green status light. A single precise repaired component lies in the center. Tactile editorial 3D with warm ivory, muted violet and dark navy, deliberate engineering rather than humanoid robots. No readable code or checkmark letters.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### measured_psd_to_noise_generator

```text
Use case: stylized-concept. One central dark glass instrument transforms a smooth target spectral envelope with a sharp resonance into a cloud of fine phase-bearing frequency needles and then an irregular continuous colored-noise waveform. Keep these as one flowing spatial sculpture rather than separate panels. Deep indigo, violet and amber, precise scientific editorial illustration, no labels or axes numbers.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### raman_ms_gate_note

```text
Use case: scientific-educational. Two tiny glowing trapped ions suspended between elegant gold ion-trap electrodes, crossed by a pair of coherent crimson and violet laser beams. Above them a delicate abstract three-level Lambda transition motif; behind them a single closed luminous phase-space loop suggesting an entangling operation. Cinematic scientific illustration, midnight blue and restrained gold, keep ions and electrodes physically plausible, no text or equations.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### rl_intro

```text
Use case: stylized-concept. An autonomous small geometric explorer in a compact maze-like environment, with a luminous loop returning from a golden reward beacon back to the explorer; a pair of subtle observation and action paths close the interaction cycle. Sophisticated tactile miniature, midnight teal, aqua and warm yellow. Clear agent-environment-reward metaphor, not a humanoid robot, no text, no UI labels.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### uv_cheatsheet

```text
Use case: stylized-concept. A fast and tidy software toolkit visualized as four small precise command-line capsules docking into one project environment case, with a sealed dependency ledger and neatly aligned package cubes. A slender violet light trail suggests speed and reproducible setup. Editorial tactile 3D, charcoal, lavender and white, one compact central arrangement; no readable command strings or logos.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### t_f_analysis

```text
Use case: scientific-educational. A luminous chirp waveform passes through a short translucent sliding analysis window and unfolds into a richly colored spectrogram with a clear upward-curving frequency ridge. A wider ghost window nearby suggests the time-versus-frequency resolution tradeoff. Ink-blue ground, turquoise and amber spectral glow, clean scientific editorial illustration with no numbers, labels or fake equations.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### learn_python_dev

```text
Use case: stylized-concept. Asset: wide personal technical journal cover about modern Python development. Show ONLY a compact object-focused miniature software-assembly workstation on a plain dark teal studio background. Nested ivory project-folder trays, interlocking teal and violet dependency-package blocks on a short precision conveyor, a small transparent isolated-environment dome at center, and a discreet unlabeled terminal glass card behind. The assembled project and environment are the unmistakable central subject. Tactile refined technical editorial 3D, clean shapes, soft studio light. Absolutely no people, hands, faces, animals, plants, scenery, mountains, lakes or sunsets. No readable text, names, code or logos.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### learn_python_data_analysis

```text
Use case: stylized-concept. An elegant central scientific plotting desk: a translucent interactive scatter plot with a fitted curve, two aligned amplitude-and-phase response traces on glass cards, and a faint sequence of moving data points indicating animation. Make the curves readable as visual shapes without labels. Deep sapphire with warm amber points and cyan traces, refined editorial technical illustration, no random financial charts.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### latex_cheatsheet

```text
Use case: stylized-concept. A beautifully typeset ivory scientific manuscript emerging from an orderly dark source-card holder, with crisp abstract equation strokes, a perfectly aligned small table and tiny bibliography-like blocks. An ink pen and restrained binder clip complete the central desktop scene. Editorial paper sculpture with realistic shadows, warm ivory and dark forest green. No actual letters, readable mathematics or gibberish.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### ddm_intro

```text
Use case: scientific-educational. A single luminous nonlinear attractor with scattered measured points; one side of its flow is supported by a sparse network of precise rods suggesting a physical model, the other by a subtle connected learning lattice, both meeting in the same continuous trajectory. No literal formulas. Dark slate, electric cyan and restrained copper, elegant scientific editorial 3D, central attractor recognizable in square crop.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### A_First_Look_at_A4_Layout

```text
Use case: product-mockup. A single portrait-oriented A4 sheet centered on a dark warm drafting table, neat abstract text blocks and image placeholders within a carefully balanced page area, delicate margin guides, a metal ruler and typographic spacing samples at the edges. High-end editorial paper still life, warm white, charcoal and a small vermilion alignment accent. No numbers, letters, diagrams with labels or visible brand.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### svd_intro

```text
Use case: scientific-educational. A translucent unit sphere transformed into an elongated ellipsoid through two elegant rotated orthogonal coordinate frames and three differently scaled axis rods; a delicate ribbon indicates rotate, stretch, rotate as one continuous spatial composition. Clean conceptual linear algebra sculpture, ink blue background, icy cyan glass with small coral axis accents. No equations, letters or numeric axes.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### deep_learning_playnote

```text
Use case: stylized-concept. A central careful experiment station for neural training: three orderly data trays, a small layered network of connected nodes, and two smooth training/validation loss traces that descend together before one begins to diverge. Several restrained hyperparameter trial markers sit on a small glass surface. Tactile editorial scientific 3D, deep plum, cool blue and warm amber, no text or charts with numbers.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### learn_pytorch

```text
Use case: stylized-concept. Bright modular tensor blocks arranged as a compact three-dimensional array, one layer slides and reshapes into a new rectangular tensor; a subtle transparent computational graph curls behind it, and a tiny cart with an upright balancing pole on a short rail grounds the reinforcement-learning example. Sophisticated technical 3D cover, graphite with ember orange and pale cyan, no flame logos, labels or readable code.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
Keep this object-focused in a quiet studio or laboratory. Do not add people, animals, scenic mountains, lakes or sunsets.
```

### control_personal_note

```text
Use case: scientific-educational. A physical two-degree-of-freedom mass-spring-damper model on a neat laboratory base: two metal masses connected by visible coil springs and piston dashpots, with a small base disturbance and a smooth decaying oscillation ribbon behind. Realistic mechanical miniature with correct connections, midnight blue, brushed silver and warm orange, no equations or labels.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
Keep this object-focused in a quiet studio or laboratory. Do not add people, animals, scenic mountains, lakes or sunsets.
```

### astro_ml_guide

```text
Use case: stylized-concept. A careful AI-for-science research tabletop combining a small physical laboratory specimen, measured data points with uncertainty whiskers, and a transparent learned response surface that is compared against a fine physical-model curve. An orderly open experiment notebook anchors reproducibility. Refined editorial scientific illustration, dark teal, warm paper and coral points. No astronomy, planets or space theme; this article is general scientific machine-learning practice.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
Keep this object-focused in a quiet studio or laboratory. Do not add people, animals, scenic mountains, lakes or sunsets.
```

### Introduction_to_the_Two_Stage_Torsion_Pendulum

```text
Use case: scientific-educational. Wide editorial cover of a two-stage torsion pendulum, a precision suspended laboratory device. EXACT PHYSICAL STRUCTURE: one fixed support at the top; one very thin vertical fiber from this support down to the center of an upper horizontal brass bar with two end masses; another thin fiber from the center of that upper bar down to the center of a lower horizontal silver test bar with two end masses. The lower bar hangs FREELY in midair. There is absolutely NO fiber, stem, rod, pedestal, contact or connection BELOW the lower bar. Clearly visible empty air below the lower stage, above the distant dark optical table. Both bars near level, tiny curved twist arcs about the vertical axis, sparse warm highlights on machined brass and steel against a quiet navy laboratory. Central device fits within the central 55% of the horizontal canvas. Elegant realistic scientific instrument illustration, no people or unrelated scenery, no clock and no swinging pendulum.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
```

### learn_rust

```text
Use case: stylized-concept. A small copper-toned systems-programming workbench: one carefully machined cube transfers along a single solid ownership rail between two sockets, while a few delicate temporary borrowing threads touch it without copying it; neatly stacked memory blocks and a simple open tool crate complete the central scene. Dark graphite with rust-orange and cream, tactile technical editorial 3D, no crab mascot, readable code or logos.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
Keep this object-focused in a quiet studio or laboratory. Do not add people, animals, scenic mountains, lakes or sunsets.
```

### note_of_configure_server

```text
Use case: stylized-concept. A warm local laptop-like terminal pane connected by one secure luminous cable through a small key-shaped joint to a compact remote server cabinet emerging from a subtle translucent cloud layer. The server is the central recognizable object with neat ports and one quiet green status light. Editorial technical 3D, deep midnight teal and warm ivory, no readable screen text, brand logos or floating padlock clutter.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
Keep this object-focused in a quiet studio or laboratory. Do not add people, animals, scenic mountains, lakes or sunsets.
```

### kitty_config_log

```text
Use case: stylized-concept. A beautifully crafted dark terminal window floating as one central frosted-glass object, a clear top tab strip with small unlabeled colored tabs, tidy abstract code-line blocks, and a luminous pastel cursor leaving a soft short motion trail. Catppuccin-like mocha charcoal, lavender, peach and sage palette. Refined editorial digital still life, no cat animal, actual code text, letters or logos.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
Keep this object-focused in a quiet studio or laboratory. Do not add people, animals, scenic mountains, lakes or sunsets.
```

### solid_physics_note2

```text
Use case: scientific-educational. A short periodic crystal chain of luminous atomic orbitals gently overlapping; above the center, two clean allowed energy-band ribbons approach and open a visibly empty forbidden gap at the zone boundary. Use one coherent layered sculpture rather than a chart collage. Dark navy, cool cyan and warm amber, precise elegant quantum materials editorial illustration, no labels, equations or misleading electron planetary orbits.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
Keep this object-focused in a quiet studio or laboratory. Do not add people, animals, scenic mountains, lakes or sunsets.
```

### solid_physics_note3

```text
Use case: scientific-educational. A luminous translucent Fermi surface in momentum space centered above a subtle crystalline plane, with one clean closed cyclotron orbit and a few gently curved charge trajectories bending sideways in an indicated magnetic field of faint parallel lines. Elegant scientific editorial sculpture, midnight indigo, teal and coral, no text, numbers or planetary atom iconography.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
Keep this object-focused in a quiet studio or laboratory. Do not add people, animals, scenic mountains, lakes or sunsets.
```

### solid_physics_note4

```text
Use case: scientific-educational. A one-dimensional diatomic crystal chain with alternating large and small spheres connected by spring-like bonds; a traveling collective displacement wave passes through it. Above the chain, two subtle smooth branches, one rising from zero and one remaining higher, evoke acoustic and optical phonons. Tactile polished scientific illustration, dark slate blue with turquoise and warm gold, no labels, letters or equations.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
Keep this object-focused in a quiet studio or laboratory. Do not add people, animals, scenic mountains, lakes or sunsets.
```

### naming_guide

```text
Use case: stylized-concept. A tactile editorial file-organizing scene: a few irregular loose paper tags enter a simple precise alignment jig and emerge as neatly ordered folders with consistent short abstract dash-and-line markings, grouped in an orderly chronological sequence. One central before-to-after flow, warm paper, forest green and burnt orange, soft studio shadows. No readable filenames, dates, letters or random typography.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
Keep this object-focused in a quiet studio or laboratory. Do not add people, animals, scenic mountains, lakes or sunsets.
```

### learn_python

```text
Use case: stylized-concept. A compact thoughtful programming toolbox visualizing Python idioms: small modular class containers, one looping iterator track carrying a sequence of colored tokens, and nested package drawers that fit together cleanly. One unified central mechanical-paper sculpture, sapphire blue and warm yellow on a dark neutral desk. Distinct from a generic coding screen, no snake mascot, readable code, logos or labels.
Create ONE polished standalone editorial cover for a personal Chinese technical journal. Wide 16:9 horizontal composition, 1920x1080 feel, fully illustrated edge-to-edge. Use tactile materials, coherent lighting and restrained detail; sophisticated, not a generic wallpaper. Keep the recognizable main subject in the central 55% of the canvas so a centered square crop still works. Lower-left should have calm low-detail space for the site's white title overlay. No titles, captions, labels, letters, code text, numerals, logos, watermarks, borders, grids of multiple covers, or decorative random symbols. This is a conceptual cover, not a labeled teaching diagram.
Keep this object-focused in a quiet studio or laboratory. Do not add people, animals, scenic mountains, lakes or sunsets.
```
