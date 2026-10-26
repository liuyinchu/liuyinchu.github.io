# 开发、验证、构建与部署

本文连接示例使用 `site-user@dev-host` 与 `/path/to/liuyinchu.github.io` 占位；执行前替换为任务指定的实际目标，避免将个人内网连接信息固化到仓库。

> 文档核对日期：2026-10-26；代码基线：main，提交 c1c3b96。
> 本文记录仓库现有流程，不是本轮测试或线上发布的通过报告。
> 下列命令是验证入口；实际安装、测试、构建或发布结果以对应任务记录为准。

返回 [文档索引](README.md)，先读 [项目背景](PROJECT_CONTEXT.md) 与 [架构说明](ARCHITECTURE.md)。
编辑内容看 [站点编辑指南](SITE_EDITING_GUIDE.md)；交互验收看 [交互功能](INTERACTIVE_FEATURES.md)。
AI Frontier 内容约定见 [维护说明](ai-frontier-content.md)；已知缺口见 [问题清单](KNOWN_ISSUES.md)。

## 1. 环境与命令基线

代码使用 ESM JavaScript、Vue 3、Vue Router 和 Vite。
命令均在远端仓库根目录执行，SSH 隧道命令除外。

| 项目 | 核对值 / 来源 |
| --- | --- |
| SSH 连接示例 | `site-user@dev-host` |
| 仓库路径示例 | `/path/to/liuyinchu.github.io` |
| 当前远端运行时 | Node.js `v24.17.0`、npm `11.13.0`，环境核对结果 |
| CI 运行时 | Node.js `24`，见 [部署工作流](../.github/workflows/deploy.yml) |
| Vue / Vue Router | 锁文件解析值 `3.5.17` / `4.5.1` |
| Vite / Playwright Test | 锁文件解析值 `6.3.5` / `1.62.1` |
| 依赖声明 | [package.json](../package.json)，版本范围不等于锁定版本 |
| 安装解析结果 | [package-lock.json](../package-lock.json)，lockfileVersion `3` |

上述版本是核对时的事实，不表示以后更新锁文件后仍然相同。
仓库未在 package.json 声明 `engines`；CI 选择 Node 24，不等于建立了完整兼容性矩阵。

### 现有 npm 脚本

| 命令 | 实际执行内容 | 作用与副作用 |
| --- | --- | --- |
| `npm run dev` | `vite` | 开发服务与热更新；默认请求端口 5173 |
| `npm run build` | `vite build && node scripts/generate-seo.mjs` | 写入 dist，随后生成基本 SEO 文件 |
| `npm run check:markdown` | `node scripts/check-rich-markdown.mjs` | 富 Markdown 解析断言 |
| `npm run preview` | `vite preview` | 预览已有构建结果；不会先执行 build |
| `npm run test:e2e` | `playwright test` | E2E；自启开发服务并写测试报告 |
| `npm run test:e2e:ui` | `playwright test --ui` | Playwright UI；需要可用浏览器界面 |
| `npm run test:e2e:report` | `playwright show-report` | 打开已有 HTML 报告；不会重跑测试 |

仓库没有 `npm test`、lint 或类型检查脚本；不要把这些当成已配置的检查。
Node 模型测试直接通过 `node --test` 运行，见第 3 节。

### PATH 与依赖边界

交互式 SSH 登录能找到 Node/npm，不代表非交互 SSH 命令也能找到。
先在实际使用的 shell 检查：

~~~sh
command -v node
command -v npm
node --version
npm --version
~~~

若非交互会话缺少 PATH，可显式使用远端已有的交互 shell 配置：

~~~sh
ssh site-user@dev-host 'zsh -ic "cd /path/to/liuyinchu.github.io && node --version && npm --version"'
~~~

不要猜测或硬编码 Node/npm 安装路径，也不要因此安装另一套运行时。
本轮环境的非交互 PATH 也没有 rg；需要源码搜索时可在授权范围内使用 grep/find。
依赖安装不是文档维护的前置动作；本轮未运行任何安装命令。
需要重建依赖时，先核对锁文件和现有环境，并取得相应任务授权。
CI 中的 `npm ci` 会按锁文件安装并重建 node_modules，不能直接照搬为现有远端环境的日常检查。
Playwright 浏览器二进制是否已安装也须单独确认；缺少浏览器时记录限制，不自动下载。

## 2. 远端开发与浏览器访问

### 启动开发服务

终端 A 登录远端，在仓库根目录启动：

~~~sh
ssh site-user@dev-host
cd /path/to/liuyinchu.github.io
npm run dev
~~~

保持此终端运行，读取 Vite 实际输出的地址和端口。
普通 dev 未启用 strictPort，5173 被占用时 Vite 可能选择下一个端口。
要明确固定端口，可在确认空闲后使用：

~~~sh
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
~~~

终端 B 在自己的电脑建立隧道：

~~~sh
ssh -N -L 5173:localhost:5173 site-user@dev-host
~~~

随后在本地浏览器打开 `http://localhost:5173`。
浏览器读取的仍是远端仓库提供的服务；本地无需复制源码或启动另一个站点。
若远端实际端口是 5175，可改为 `-L 5173:localhost:5175`，本地浏览器地址仍为 5173。
若本地 5173 已被占用，可换成 `-L 5175:localhost:5173`，浏览器也相应使用 5175。

### 端口已被占用时

先辨别占用发生在本地隧道还是远端 Vite，再检查监听进程、启动命令及工作目录。
在工具可用且已获相应进程查看授权时，可用下列命令缩小检查范围：

~~~sh
lsof -nP -iTCP:5173 -sTCP:LISTEN
ps -p <PID> -o pid=,command=
lsof -a -p <PID> -d cwd
~~~

只有确认既有服务来自这个仓库、版本与当前任务一致且允许共享，才复用它。
不要仅因出现 Vite 或相同端口就认定是本仓库；不要停止其他用户或其他任务的进程。
复用普通开发服务时记下实际端口，令隧道保持一致。
Playwright 的 4174 是例外：当前配置禁止复用既有服务，须为测试保留空闲端口。

## 3. 按改动选择验证

先确定改动范围和完成标准，再选择检查；没有必要为纯文档改动启动整套浏览器测试。
结果应记录实际命令、日期、基线、退出状态和未覆盖项，不能只写“全部通过”。

| 改动 | 自动检查入口 | 人工 / 额外检查 |
| --- | --- | --- |
| 仓库说明文档 | 相对链接、源码引用、脚本名称核对；`git diff --check` | 内容与实际配置一致，历史证据有时效说明 |
| Markdown / JSON 内容 | 对受影响文件做 JSON 解析或页面加载；富语法改动运行 `npm run check:markdown` | 文章索引、资源路径、锚点、公式、表格和加载失败状态 |
| 路由 / 页面入口 | `routes.spec.js`、`special-routes.spec.js` | 新路由同步 manifest；直达、刷新、返回、重定向 |
| 布局 / 视觉 / 动画 | 对应 E2E 与 overflow 断言 | 桌面、移动、键盘、正常动态和减少动态；对照截图 |
| Portal 窗口 | `portal-window-model.test.mjs`，特殊路由与 About E2E | 拖动、缩放、层级、最小化、平铺、持久化、移动布局 |
| 天气 | `weather-model.test.mjs` | 真实服务、城市时区、部分失败、保留旧数据、分区重试 |
| Music Box | 五个 music-box Node 文件、`music-box.spec.js` | 实际听感、触摸、浏览器音频解锁、离开后静音 |
| 说说 | `post-it.test.mjs`、`talk.spec.js` | public/post-it 自动收录/过滤、真实时间倒序、搜索与键盘、卡内横滚/锚点、复制回退、返回列表与 Space1 轮播 |
| AI Frontier | `frontier.spec.js`、路由与排版相关 E2E | 远端真实内容、数据字段、失败重试、谱图与窄屏 |
| 构建 / SEO / 部署 | `npm run build`，检查生成文件与 preview | 生产直达路径、HTTP 状态、资源地址、线上部署结果 |

### Node 内容与模型测试：8 个文件

可按改动单独运行：

~~~sh
node --test tests/post-it.test.mjs
node --test tests/portal-window-model.test.mjs
node --test tests/weather-model.test.mjs
node --test tests/music-box-engine.test.js
node --test tests/music-box-sequencer.test.js
node --test tests/music-box-string-audio.test.js
node --test tests/music-box-bowed-audio.test.js
node --test tests/music-box-composition.test.js
~~~

需要完整运行这 8 个文件时：

~~~sh
node --test tests/post-it.test.mjs tests/portal-window-model.test.mjs tests/weather-model.test.mjs tests/music-box-engine.test.js tests/music-box-sequencer.test.js tests/music-box-string-audio.test.js tests/music-box-bowed-audio.test.js tests/music-box-composition.test.js
~~~

说说 Node 测试验证简单 frontmatter、日期有效性、摘要、public/post-it 文件扫描/过滤、稳定 ID 与真实时间顺序；不验证浏览器布局。
Portal 测试验证窗口模型与序列化，不会操作真实 DOM。
天气测试验证数值缺失、时区 / 夏令时、日出日落、请求分区成功失败和重试；请求由测试替身控制。
音乐测试涵盖模拟、碰撞、编曲、节拍和合成模型；部分音频测试使用替身，不等于真实扬声器验收。
Node 测试通过也不能证明浏览器布局、真实网络或设备兼容性。

### Markdown 检查的范围

~~~sh
npm run check:markdown
~~~

[检查脚本](../scripts/check-rich-markdown.mjs) 验证普通 Markdown 保持原行为，以及富组件、脚注、围栏、未闭合块和链接处理。
它使用内置样例调用解析器，不会遍历所有 public Markdown 文件，也不是全站文档链接检查器。
文章排版、MathJax 基线、Mermaid、复制和目录跳转仍需对应页面检查。
正文图片预览另由 `tests/e2e/markdown-image-preview.spec.js` 验证，需覆盖原始 HTML 图、链接图片、文内图组、键盘、缩放和正文渲染器的接入边界。其受控图片样例不等于全部外部图片服务的可用性验证。

### Playwright：全量与定向命令

~~~sh
npm run test:e2e
npm run test:e2e -- --project=chromium-desktop
npm run test:e2e -- --project=chromium-mobile
npm run test:e2e -- tests/e2e/routes.spec.js tests/e2e/special-routes.spec.js
npm run test:e2e -- tests/e2e/frontier.spec.js
npm run test:e2e -- tests/e2e/talk.spec.js
npm run test:e2e -- tests/e2e/music-box.spec.js
npm run test:e2e -- tests/e2e/about-story.spec.js tests/e2e/article-typography.spec.js
npm run test:e2e -- tests/e2e/markdown-image-preview.spec.js
~~~

这些是可选运行方式，不要求每次逐条重复执行。
配置见 [playwright.config.js](../playwright.config.js)：

- 测试目录为 tests/e2e；普通用例 timeout 30 秒，expect timeout 10 秒，导航 timeout 20 秒；部分用例自行延长。
- 桌面项目 chromium-desktop：Desktop Chrome 配置，1280 × 800。
- 移动项目 chromium-mobile：Pixel 5 配置，390 × 844；属于 Chromium 设备模拟，不是实体手机。
- 两项目默认 `reducedMotion: 'reduce'`；部分 About / Music 用例主动切换到正常动态。
- `fullyParallel: false`；CI 禁止 test.only、失败重试一次、workers 为 2；本地无重试且使用默认 worker 策略。
- 固定 baseURL 为 `http://127.0.0.1:4174`；测试命令自行启动 Vite 开发服务。
- 服务命令为 `npm run dev -- --host 127.0.0.1 --port 4174 --strictPort`。
- `reuseExistingServer: false`，服务启动 timeout 120 秒；4174 已占用时应先确认占用任务，不能直接复用或杀进程。
- 该配置不读取 dist，也不使用 preview；即使测试通过，仍未验证生产构建的路由与部署。

测试会写入 test-results 和 playwright-report；失败截图、保留的失败 trace 与测试附件可能包含页面或观察数据。
视频关闭；HTML reporter 不自动打开。已有报告可通过：

~~~sh
npm run test:e2e:report
~~~

`.gitignore` 已忽略 node_modules、dist、test-results、playwright-report、blob-report。
忽略不等于可以清理其他任务的文件；测试运行前也要确认允许产生或覆盖这些报告。
UI 模式通常需要可用图形环境；远端终端不保证具备该条件。

### E2E 证据能够说明什么

[routes.spec.js](../tests/e2e/routes.spec.js) 逐项检查静态 manifest 中的路径、页面壳、页面错误和横向溢出。
manifest 是手工维护的清单，不是自动从 Router 提取；未列出的路由不会自动获得同等覆盖。
基线清单没有 /stellar-field，新增或变更页面时需复核此类缺口。
特殊路径测试涵盖旧链接重定向、已知 / 缺失文章、全局未找到页和 Portal 本地数据加载。
About 与文章测试另外覆盖故事导航、键盘、WebGL 不可用回退、排版偏好和公式布局。
Music E2E 包含真实 Web Audio PCM、静音和退出关闭观察，但不能保证跨设备音色一致。
Talk E2E 对照 public/post-it 扫描结果的数量、标题、日期和真实时间顺序，检查三/二/一列布局、搜索与键盘、标题/直达深链、剪贴板拒绝后的手动复制、返回列表顶部和轮播。无编号新 ID、长表格/代码及重复标题/脚注通过仅测试内替换 virtual:post-it 的样例验证，不更改生产内容；文件扫描与 metadata 过滤由 Node 测试覆盖。卡片位置检查验证无重叠和横向越界，不作像素截图比对。

Frontier 的远端 notes URL 由 [fixture](../tests/e2e/frontier-fixture.js) 替换成固定 Markdown。
谱图请求由 [谱图 fixture](../tests/e2e/avis3-spectra-fixture.js) 替换；失败 / 重试用例也会主动注入响应。
这些检查验证渲染与交互契约，不证明远端仓库此刻可访问、真实数据持续正确或生产 CORS 正常。
[test-helpers.js](../tests/e2e/test-helpers.js) 重点审计同源请求失败及 HTTP 错误；带外部来源的 console.error 会被过滤。
图片、字体等第三方资源的失败也不能由“本地请求已稳定”这一条件完整代表。
正常动态的完整视觉效果、真实天气 / 音乐外链和线上 SEO 状态应单独验收。
[历史 Design QA](../design-qa.md) 只能作过去任务的参考，不能替代当前基线重测。

## 4. 构建、SEO 与产物预览

~~~sh
npm run build
~~~

构建顺序有两个阶段：

1. Vite 读取入口和源码，输出静态站点到 dist；public 中的静态内容随构建复制。
2. 只有 Vite 成功，才执行 `node scripts/generate-seo.mjs` 生成额外入口、sitemap 和 robots。

[Vite 配置](../vite.config.js) 使用 `base: '/'`，适合当前域名根路径部署。
部署到带仓库前缀的子路径时，需要单独评估资源路径；当前文档不声明该场景可直接工作。
writeBundle 阶段把 dist/index.html 复制为 dist/404.html，提供 SPA 回退页面。

### SEO 生成器的输入与输出

[generate-seo.mjs](../scripts/generate-seo.mjs) 读取：

- dist/index.html：已构建的公共 HTML 壳。
- src/router/index.js：以正则提取单行、单引号、`{ path: '…', component:` 形式的条目。
- public/articles.json：为每个 article.id 生成 /space1/<id> 路径。
- 另显式加入 /ai-frontier/arena/avis3；站点域名固定为 https://liuyinchu.github.io。

输出包括：

- 每个非根路径对应的 dist/<route>.html；嵌套路径会创建父目录。
- dist/sitemap.xml，列出提取及补充后的去重 URL。
- dist/robots.txt，允许抓取并指向上述 sitemap。
- 原有 dist/index.html 与 Vite 生成的 dist/404.html 继续存在。

当前算法跳过含冒号的参数 / catch-all 路由，不收录重定向；动态文章依赖 articles.json 补齐。
换行格式、双引号、别名、动态拼接或其他 Router 写法可能被正则遗漏，且构建未必因此失败。
修改路由后要比对真实入口、manifest 和 sitemap，而不能仅依赖生成器打印的数量。
所有生成入口都复用同一 HTML 壳；这是基本入口与抓取文件生成，不是逐页预渲染或完整 SSR。
页面个性化正文与运行时元数据仍需 JavaScript；不能据此承诺搜索引擎已经收录。

### 预览已有 dist

~~~sh
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
~~~

另一个本地终端建立隧道后打开 `http://localhost:4173`：

~~~sh
ssh -N -L 4173:localhost:4173 site-user@dev-host
~~~

preview 预览现有 dist；没有先完成本次 build 时，可能看到旧产物。
检查首页、文章与嵌套路由直达 / 刷新、JS/CSS/Markdown/JSON 请求和移动布局。
同时检查生成的 .html、404.html、sitemap.xml、robots.txt 是否符合本次路由变化。
本地 preview 不是 GitHub Pages；服务器对扩展名、重定向和缺失路径的处理可能不同。

404.html 能让客户端恢复路由显示，不会自动把服务器的 HTTP 404 改为 200。
生成真实 .html 入口的目的，是减少已知页面依赖 404 回退；生产是否以期望状态提供入口仍需线上检查。
对真实页面、未知路径和重定向分别记录最终 URL、HTTP 状态与页面内容；只看界面正常不够。
构建体积警告应记录和评估，不能把 warning 当成 build 失败，也不能在未运行时引用历史通过结论。

## 5. GitHub Pages 发布

当前 [deploy.yml](../.github/workflows/deploy.yml) 的行为是：

1. 推送到 main 或手动 workflow_dispatch 触发。
2. ubuntu-latest 检出源码，设置 Node.js 24 并使用 npm 缓存。
3. 执行 `npm ci`，再执行 `npm run build`。
4. peaceiris/actions-gh-pages@v4 用 GITHUB_TOKEN 把 ./dist 发布到 gh-pages。
5. 工作流授予 contents: write；并发组 pages-deploy 会取消进行中的旧部署。

部署工作流没有执行 check:markdown、Node 测试或 Playwright；它们目前不是 CI 发布门槛。
成功构建与写入 gh-pages 也不等于外部访问、第三方服务或搜索收录已经通过验证。
仓库后台 Pages 发布源应与该分支发布方案匹配；当前后台设置、权限限制和最近一次部署状态均未核实。
手动触发的实际构建引用应以 Actions 运行详情为准。

提交只记录当前仓库的版本；push 才把提交送到远端仓库，main push 可能自动触发部署。
发布须遵循当次任务授权：本轮仅维护文档，不 push、不触发部署、不改 Pages 后台设置。
获准发布后，查看对应 Actions 运行与提交，确认产物和 gh-pages 更新，再检查线上页面及状态码。
不要仅用本地 HEAD、旧报告或历史 design-qa 的 passed 字样作为线上完成证据。

## 6. 保持任务边界的安全提交

一次自包含任务默认一个可审计提交；不要顺带提交其他任务、缓存、报告或构建产物。

1. 修改前记录既有 worktree 与 index 状态；授权文件中的原有改动也不能自动算作本任务。
2. 用路径限定的 diff 检查本任务；未跟踪文件必须检查完整内容。
3. 仅在该路径全部改动属于本任务时按路径暂存；混合改动须只暂存已确认的 hunks。
4. 暂存后检查整个 index 的路径清单，再检查本任务的 staged diff。
5. index 含他人或原有 staged 内容时停止提交；不替用户取消暂存，也不靠路径提交绕过共享 index。
6. 提交后核对提交包含的路径；边界错误须报告，不擅自 amend 或重写历史。

常用检查命令如下；`<任务路径>` 必须替换为本次明确授权的文件：

~~~sh
git status --short
git diff --cached --name-status
git diff -- <任务路径>
git diff --cached -- <任务路径>
git diff --check -- <任务路径>
git add -- <任务路径>
git diff --cached --name-status
git diff --cached -- <任务路径>
git commit
git show --format=fuller --name-status HEAD
~~~

禁止 `git add -A`、`git add .`、`git commit -a`；不要清理或纳入已有 tmp。
提交消息使用以下结构，Validation 只填写实际完成的检查：

~~~text
docs(workflow): describe verified development and deployment workflow

Background:
- task context and motivation

Changes:
- specific changes and affected components

Notes:
- implementation details, limitations, or trade-offs

Validation:
- checks and tests actually performed
- unverified items, if any
~~~

文档维护的完成依据应是源码 / 配置核对、链接与 diff 检查及准确的限制说明。
若本轮没有运行应用测试或构建，应明确写“未运行”，不能引用以前的成功记录补足。
