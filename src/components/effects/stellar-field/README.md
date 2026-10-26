# StellarField 组件

更新日期：2026-10-26；按源码基线 `c1c3b96` 核对。

独立实现的 Vue 3 / 原生 WebGL2 星尘组件。视觉灵感来自 [OpenAI 的 GPT Astra 发布页](https://openai.com/zh-Hans-CN/index/gpt-6-astra/)；几何、采样和着色器为本项目重新实现，未使用或执行参考网站脚本，也不将视觉调参宣称为官方参数。

本文描述当前代码接口与调度逻辑，不代表本次已执行浏览器验证。网站整体入口见 [架构文档](../../../../docs/ARCHITECTURE.md)，交互与验证背景见 [INTERACTIVE_FEATURES.md](../../../../docs/INTERACTIVE_FEATURES.md)。

## 嵌入和职责

导入 [StellarField.vue](../StellarField.vue)，放入有明确宽高的容器。
组件填满父容器，不改变 document 滚动，不包含导航或叙事文案。

```vue
<script setup>
import { ref } from 'vue'
import StellarField from './components/effects/StellarField.vue'

const stars = ref(null)
const progress = ref(0)
const paused = ref(false)
</script>

<template>
  <div style="height: 70vh">
    <StellarField
      ref="stars"
      profile="stellar"
      :progress="progress"
      :paused="paused"
      :interactive="true"
    />
  </div>
</template>
```

示例导入路径按位于 `src/` 的父组件书写，实际使用需调整相对路径。
父页面负责把滚动位置变成 0–1 的 `progress`；组件负责形态插值、渲染、输入与静态降级。
现有消费者是 [星间页面](../../../pages/StellarField.vue) 和 [关于叙事页](../../../pages/AboutMe.vue)。
更改公共逻辑时应同时检查两种 profile。

## Props

| Prop | 类型 / 默认值 | 当前语义 |
| --- | --- | --- |
| `profile` | String / `'stellar'` | 约定使用 `stellar` 或 `about`；切换时销毁并重建渲染器 |
| `progress` | Number / `0` | 渲染器限制在 0–1；父页面控制的形态进度 |
| `paused` | Boolean / `false` | 停止自主时间、漂移、闪烁和松手惯性；不阻止进度更新、直接输入、回放和回正 |
| `interactive` | Boolean / `true` | 控制拖拽、鼠标悬停视差、Canvas 方向键及 Home；关闭时释放拖拽并清空惯性/悬停目标 |
| `activeNode` | String / `''` | About 内容星图高亮，取 `notes`、`talk`、`resources`、`projects`；空值表示不高亮 |
| `catFrame` | Object / `null` | About 猫的屏幕坐标框；通常由 StackKeyboard 的 `getCatFrame()` 提供 |
| `catMotion` | Boolean / `false` | 独立控制 About 猫的双姿态节拍与 `cat-strike`，不直接受 `paused` 控制 |

除 `profile` 外，上述状态通过渲染器 `update()` 更新，不会重建 GPU 几何。
`activeNode`、`catFrame`、`catMotion` 用于 About；基础 stellar 形态不消费它们。

`paused` 不是“禁用所有变化”的总开关。
例如 About 第五章需要停住星空自主漂移，同时继续猫敲击，因此页面传入
`paused = paused || activeChapter === 4` 与 `catMotion = activeChapter === 4 && !paused`。
调用者若想暂停猫，应同时将 `catMotion` 设为 false。

## 两种形态路径

所有形态保留同一组粒子对应关系，过渡包含深度弧线和散开路径，不是两张图的透明度交叉。

### stellar

| progress 锚点 | 形态 | 根元素 phase |
| --- | --- | --- |
| 0 | 银河数字 6，底部亮核 | `six` |
| 0.25 | 散向边缘、留出中央的星空 | `scatter` |
| 0.5 | 圆角立体导航指针 | `cursor` |
| 0.75 | 散向边缘的星空 | `scatter` |
| 1 | 六瓣交织花结 | `blossom` |

QA 的 `phase` 使用区间标签：
`<.125 six`、`<.375 scatter`、`<.625 cursor`、`<.875 scatter`，其余为 `blossom`。
它描述目标进度所在区间，不是 GPU 当前插值姿态的精确测量。

### about

| progress 锚点 | 形态 | 根元素 phase |
| --- | --- | --- |
| 0 | 倾斜交错的星尘轨道 | `orbit` |
| 0.2 | 贴脸眼镜、两颗门牙、握拳抬食指的智慧表情 | `expression` |
| 0.4 | 复用基础星场的立体指针 | `pointer` |
| 0.6 | 随记、说说、资源、项目四簇内容星图 | `contents` |
| 0.8 | 与技术栈键盘对齐的星光猫 | `field` |
| 1 | 两道扭转星带交错、向远处开放 | `open` |

QA phase 的切换界限为 .1/.3/.5/.7/.9。
渲染器把进度分为五个区间，以 smoothstep 形成形态停留与连续变化。
`AboutMe.vue` 根据各章位置计算进度；不要在此组件加入页面滚动或章节高度判断。

## Events

| 事件 | 参数 | 触发时机 |
| --- | --- | --- |
| `ready` | 无 | WebGL 程序初始化完成；上下文恢复后可能再次发出 |
| `unavailable` | 无 | 无 WebGL2、初始化失败或 context lost；组件改显示静态 SVG |
| `anchors` | Array<{ id, x, y, visible }> | About 内容锚点投影；WebGL 约最多 30Hz，停止连续渲染时也会报告；静态降级按更新/尺寸变化报告 |
| `cat-strike` | `'left'` 或 `'right'` | About 猫完整聚拢、允许 catMotion 且未启用减少动态效果时，按节拍交替发出 |

`ready` 是初始化通知，不是跨设备效果或性能验收的证明。
消费者应允许 `ready → unavailable → ready`，不要把首次 ready 当成永久能力状态。

`anchors` 中的 id 与 `activeNode` 相同，x/y 为 Canvas 范围内的归一化坐标。
`visible` 综合内容星图权重、回放、深度和屏幕范围；消费方应据此隐藏或回退链接。
父页面使用 `getCanvasRect()` 将其换算到 DOM 舞台坐标。
[ConstellationDirectory.vue](../../about/ConstellationDirectory.vue) 负责实际 RouterLink、预览与焦点，星场本身不提供可点击导航。

## Expose

| 方法 | 当前行为 |
| --- | --- |
| `replay()` | 当前形态先散开再聚拢；约 0.24 秒散开 + 1.8 秒聚拢 |
| `resetView()` | 清空惯性及悬停目标，并平滑回正拖拽旋转；减少动态效果时直接回正 |
| `getCanvasRect()` | 返回 Canvas 的 `getBoundingClientRect()`；挂载前可能无返回值 |

首次挂载默认从散点聚拢到当前形态，约 1.8 秒。
减少动态效果偏好下跳过入场和回放的动画。
WebGL 不可用时仍可读取 Canvas 尺寸，但没有可操作的渲染器，回放/回正不会模拟成功。
组件不暴露 WebGL 对象或内部粒子数组。

## About 猫与键盘的坐标协议

猫使用星场前景粒子，不额外创建猫 Canvas。
[about-shapes.js](about-shapes.js) 从共享猫几何建立初始/交替姿态、颜色、透明度与尺寸数据。
猫来源与实现保留在 [cat-geometry.js](../../about/stack-keyboard/cat-geometry.js)、
[bongo-reference.js](../../about/stack-keyboard/bongo-reference.js)；本说明不扩展其外部来源声明。

`catFrame` 结构为：

```js
{
  origin: [clientX, clientY],
  axisX: [vectorX, vectorY],
  axisY: [vectorX, vectorY],
}
```

origin 使用浏览器视口坐标的 CSS 像素；axisX/axisY 是同坐标系中的基向量，按参考帧宽度归一化。
不要将它们替换成页面滚动坐标或 Canvas 缓冲区像素。
无有效 frame 时，`resolveAboutCatFrame()` 使用 Canvas 尺寸提供默认位置；此时不保证两爪落在键帽上。

现有父页面的协作顺序：

1. [StackKeyboard.vue](../../about/StackKeyboard.vue) 的 `layout` 事件通知父页面重新取坐标。
2. 父页面调用 `keyboard.getCatFrame()`，把结果传给星场 `catFrame`。
3. 键盘正常渲染时通过相机投影计算；降级时通过原生按钮位置拟合。
4. 星场渲染猫并发出 `cat-strike`；页面转交 `keyboard.tapByCat(side)`。
5. 键盘左爪使用第一个键，右爪根据六列/四列布局选择对应键，并避开用户正在按住的键。

猫节拍以约 .34 秒为一拍，交替两套真实姿态。
只有猫形态权重已达到 .98、目标仍在猫形态、回放结束且 catMotion 开启时才继续推进猫时钟。
猫敲击不改变技术选中项；技术选择由原生按钮的 hover/focus/click 或快捷键负责。
当前猫几何保留原粒子 id，将源帧中脱离身体的敲击线条设为透明；不要重新添加浮动的敲击装饰。

键盘是独立的 WebGL2 渲染器，具有自己的状态、按键运动和资源清理。
星场 `ready` 不等于键盘 `ready`，两者可以分别降级。
页面全局暂停应同时更新键盘 `paused`，并关闭星场 `catMotion`。

## 输入与减少动态效果

- 鼠标拖动双轴旋转，松手有阻尼惯性；横向转角不受同样的上下限限制。
- 触屏只在横向位移超过阈值、方向确认后捕获指针；纵向手势留给页面滚动。
- Canvas 使用 `touch-action: pan-y`。
- WebGL 正常且 interactive 开启时 Canvas 可聚焦；方向键旋转，Home 回正。
- 键盘监听绑定 Canvas，不全局拦截方向键。
- interactive 关闭时 Canvas 不进入 Tab 顺序。
- 系统减少动态效果变化会被监听，关闭自主时间/惯性/猫节拍，形态进度直接更新；直接操作仍有效。
- 暂停时形态进度仍可随滚动变化，已发起的回放和回正仍可完成。

About 第五章把 Canvas 的指针交互关闭，保留键盘真实按钮作为输入层。
键盘快捷键局限于其组件表面；快捷键、选中信息及原生降级由 StackKeyboard 管理，不能从星场参数推断。

## 性能与生命周期

当前基础粒子配置在 [shapes.js](shapes.js)：11800 个尘点、132 个亮星、360 个背景点，共 12292 个。
About 复用基础指针数据，再加入自己的形态与猫数据。
该数量是当前实现值，不是对所有设备的性能承诺。

[renderer.js](renderer.js) 当前采取：

- WebGL2 点精灵和背景绘制，不依赖图片/视频来显示基础星场。
- 有限 DPR：不高于 1.8，并按约 360 万像素预算继续降低。
- ResizeObserver 跟踪容器；IntersectionObserver 跟踪离开视口。
- 标签页隐藏或 Canvas 离开视口时停止 RAF，恢复可见后按状态继续。
- 正常自主动画持续调度；暂停或减少动态效果时，状态稳定后停止连续帧，输入/进度/尺寸变化可重新唤醒。
- context lost 阻止默认处置、停帧并报告 unavailable；context restored 重建资源并可再次 ready。
- 卸载销毁 RAF、事件、媒体查询监听、观察器，以及 Buffer、VAO、Program。
- profile 变化先销毁旧 renderer，再初始化新 renderer。
- 组件自身另有 ResizeObserver，为静态降级布局和锚点更新服务，卸载时断开。

键盘渲染器另有 DPR 上限 2、约 160 万像素预算、可见性/视口观察和释放逻辑。
修改星场的调度不会自动修改键盘；双渲染器的暂停、降级和生命周期应分别核对。

## 静态降级

WebGL 不可用时，组件显示带无障碍描述的静态 SVG：

- stellar 使用简化数字 6、散点、指针或花结。
- about 使用对应阶段的轨道、表情点阵、指针、内容图标、猫或开放星带。
- 猫使用固定姿态，保留 catFrame 定位，提示“当前设备显示静态星光猫”。
- 内容星图仍发出静态锚点，DOM 导航保留可用。
- 不创建假拖拽、假回放或假猫敲击事件。

该降级保证信息与原生入口，不保证与 WebGL 每个过渡帧的视觉一致。

## QA 状态与验证入口

组件根元素提供以下可见状态：

| 属性 | 值 |
| --- | --- |
| `data-renderer` | `initializing` / `webgl2` / `unavailable` |
| `data-profile` | 当前 profile |
| `data-active-node` | 当前 activeNode |
| `data-phase` | 对应上文形态区间 |
| `data-progress` | 限制后的目标进度，三位小数 |
| `data-paused` | 当前 paused |
| Canvas 的 `data-dragging` | 指针开始/结束后反映捕获拖拽状态 |

phase/progress 来自 props，GPU 正常情况下会平滑追近目标，不能仅凭属性判断画面已稳定。
StackKeyboard 另有 `data-renderer=loading|ready|unavailable`、`data-selected`、
`data-testid=stack-keyboard` 和 `stack-keyboard-canvas`，不要与星场状态值混用。

现有 [about-story.spec.js](../../../../tests/e2e/about-story.spec.js) 包括章节完整性、目录投影、键盘、
减少动态效果、WebGL 不可用和入口兼容等回归场景。
运行方式与环境限制见 [DEVELOPMENT_AND_DEPLOYMENT.md](../../../../docs/DEVELOPMENT_AND_DEPLOYMENT.md)。

改动后的建议观察点是：两种 profile 的全部锚点、桌面/触屏输入、窄屏/矮屏、
暂停与回放、减少动态效果、两套渲染器分别不可用、上下文恢复、离开视口/切走路由。
这是维护检查清单；本文更新只进行了源码与文档核对，未执行构建、截图或浏览器测试。
