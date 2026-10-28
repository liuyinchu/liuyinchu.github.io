# 生日星球

- 隐藏路由：`/birthday-planet`，入口仍是首页第一屏右下角的小星星；不进入主导航、页脚或 sitemap。
- 生日为 **10 月 28 日**，按 **Asia/Shanghai** 日期计算；第一圈从 **2026 年**开始，不表示年龄。
- 横向拖动可调整星球角度（±35°）；键盘左右键同样可用，Home 键或「复位」恢复原角度。拖动不启动声音，手机纵向滑动仍能滚动页面。
- 轻触或按回车播放 **16.8 秒**原创旋律，再点一次停止。两段柔和铃音带低音和短回声；轨道进度与光晕分别由实际音频时钟和输出 RMS 包络驱动。未播放不创建音频资源，后台或离页时停止并释放。
- 减少动态效果偏好下禁用漂浮、轨道游光和音量脉动；仍可手动调整角度并查看播放进度。
- 生日信已按用户要求改为 **Codex 写给用户的固定信件**，直接打开阅读，没有写信、编辑、封存、倒计时或下载流程。落款为 **2026 年 10 月 29 日**。
- 信件依据站内自述与既有生日对话撰写，核心依据为 AboutMe 中的名字偏航、内容介绍自己、“不必完美，才开始”，以及《我们的时代中》对当下与回望的表达；不推断真实年龄或职业经历。
- 旧版 `birthday-planet-letters-v1` 数据原样保留；当前生日页面不读取、覆盖或删除任何本地信件。旧日期/信件工具保留，当前页只调用其中的 `birthdayState`。
- 路由懒加载，样式局限于此页面。静态深链带 noindex，离开时恢复标题和索引标签；隐藏入口不是访问控制。

## 修改位置

- `src/pages/BirthdayPlanet.vue`：星球拖动、实际音频反馈、固定信件展示及生命周期。
- `src/birthday/giftLetter.js`：固定生日信正文和落款。
- `src/birthday/melody.js`：原创乐句、音频图、可取消播放与 `readFrame()`。
- `src/birthday/letters.mjs`：现有上海日期与年轮计算。
- `src/pages/Home.vue`、`src/router/index.js`、`src/App.vue`、`scripts/generate-seo.mjs`：既有入口和接入约定。

## 验证

```sh
node --test tests/birthday-melody.test.mjs tests/birthday-letters.test.mjs
npm run test:e2e -- tests/e2e/birthday-planet.spec.js
npm run build
```

浏览器验证涵盖懒加载与返回、固定信件跨日期一致性、旧信件保留、鼠标/触摸拖动与手机滚动、键盘复位、真实音频反馈、自然结束、后台及离页释放、减少动态效果和桌面/手机截图。
