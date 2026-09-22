# StellarField

独立实现的 Vue 3 / 原生 WebGL2 星尘组件。视觉灵感来自 OpenAI 的 GPT Astra 发布页（https://openai.com/zh-Hans-CN/index/gpt-6-astra/）；几何、采样和着色器为本项目重新实现，未使用或执行参考网站脚本，也不将视觉调参宣称为官方参数。

## 嵌入

父容器必须有明确高度和宽度。组件填满父容器，不改变 document 滚动、不包含导航。
```vue
<div style="height: 70vh">
  <StellarField ref="field" :progress="progress" :paused="paused" :interactive="true" />
</div>
```

- `progress: Number = 0`，限制到 0–1；由父页面根据滚动计算。
- `paused: Boolean = false`，暂停自主漂移、闪烁和惯性；滚动形变、直接操作、显式回放仍有效。
- `interactive: Boolean = true`，控制拖拽、悬停视差、方向键及 Home 回正。
- `ready` 在 WebGL 初始化完成时发出；`unavailable` 在不支持、初始化失败或上下文丢失时发出。恢复上下文后可再次 ready。

| progress | 形态 |
| --- | --- |
| 0 | 银河数字 6，底部亮核 |
| .25 | 散向边缘、留出中央的星空 |
| .5 | 圆角导航箭头 |
| .75 | 散向边缘的星空 |
| 1 | 六瓣交织花结 |

锚点间平滑插值并沿深度弧线移动，保留粒子对应关系。首次挂载从散点聚拢至当前形态，约 1.8 秒；减少动画偏好下跳过入场。暴露 `replay()`：当前形态先散开再聚拢，约两秒；`resetView()`：平滑回正拖拽角度。减少动画偏好下使用直接更新。

鼠标双轴旋转，松手阻尼惯性；触屏只在横向手势确定后接管，`touch-action: pan-y` 保留纵向页面滚动。方向键旋转，Home 回正。无全局键盘拦截。

隐藏标签页或离开视口停止帧循环；恢复可见后继续。支持容器 ResizeObserver、有限像素预算、WebGL context lost/restored。卸载释放 RAF、事件、Observer 和 GPU Buffer/VAO/Program。WebGL 不可用显示简洁静态 SVG；不模拟互动成功。

组件根元素的 `data-renderer`、`data-phase`、`data-progress`、`data-paused` 提供可见 QA 状态，不公开 WebGL 对象。几何采样参数在 shapes.js，点精灵和插值视觉参数在 renderer.js。
