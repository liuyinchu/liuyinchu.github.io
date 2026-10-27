# 生日星球

- 隐藏路由：`/birthday-planet`。入口为首页第一屏右下角的小星星，不加入主导航或页脚。
- 生日为 **10 月 28 日**，以 **Asia/Shanghai** 日历日期计算；第一圈从 **2026 年**开始，不表示年龄。
- 页面、星球 SVG、样式与声音均独立。仅访问该路由才加载页面及生日模块。
- 轻触星球播放约 8.8 秒的原创旋律，再点一次停止。切换后台或离开页面会释放音频；减少动态效果时暂停装饰动画。
- 手机页面按标题、星球、祝福与写信入口排列；播放时显示轨道微光和明确的暂停提示。
- 暂时关闭信件弹窗后可继续当前草稿；草稿只在当前页面内保留，离开或刷新前请正式存好。
- 每一生日年轮可保存一封信，存于当前浏览器的 `birthday-planet-letters-v1` localStorage 中，**不上网、不跨设备同步**。同一年编辑保留原解封日期，下一次生日可阅读旧信并写新信。
- 信件只是一份浏览器本地纪念；清除浏览数据会丢失。页面提供复制留存，重新编辑也可读回未到期的当前年信件。
- 构建为彩蛋生成独立 HTML 深链并标记 noindex，不加入 sitemap。离开页面会移除彩蛋自己的 robots 标签并恢复标题；这不是身份验证或访问控制。

## 修改位置

- `src/pages/BirthdayPlanet.vue`：独立页面、视觉、信件对话框与生命周期。
- `src/birthday/letters.mjs`：上海日期、年轮、信件模型。
- `src/birthday/melody.js`：仅由点击启动的声音。
- `src/pages/Home.vue`：仅第一屏的小星星入口。
- `src/router/index.js`、`src/App.vue`：懒加载路由与独立布局名单。
- `scripts/generate-seo.mjs`：彩蛋的静态入口与搜索排除。

## 验证

```sh
node --test tests/birthday-letters.test.mjs
npm run test:e2e -- tests/e2e/birthday-planet.spec.js
npm run build
```

E2E 在桌面与手机覆盖懒加载入口、返回后页面外壳恢复、存信和重新打开、上海生日解封、声音手势及离页释放、键盘操作、减少动态效果和本地保存失败。
