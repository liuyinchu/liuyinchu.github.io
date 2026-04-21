# Codex 使用心得

## 一个重要的思维转变：从 ChatBox 到 Agent

**1. 少教它“用什么工具”，多告诉它“要交什么结果”**
像 `apply_patch`、`shell_command`、`phase`、截断规则这类内容，主要是给平台集成方看的；在官方 App 里，这些底层机制已经由 OpenAI 处理好了。对你更有效的写法是：直接说目标、约束、验收标准，比如“修这个 bug，不改 API 形状，补测试，最后给我 diff 重点和验证步骤”。这是因为 Codex 本来就被设计成可主动执行的编码代理，而不是只回答问题。([OpenAI 开发者][1])

**2. 默认把它当“会自己推进的工程师”，但要把边界说清楚**
GPT-5.3-Codex 的定位就是更快、更强、可主动推进，同时“你可以在它工作时继续 steer 它”。所以你最好在开头就把边界一次说清：
“直接实现，不要先写方案。”
“先 review 再动代码。”
“遇到数据库迁移/删文件/改 CI 先停下来问我。”
这种边界说明，比教它底层命令更影响结果。([OpenAI Help Center][2])

**3. 选对线程模式，比写复杂提示词更重要**
Codex App 的线程有 `Local`、`Worktree`、`Cloud` 三种模式；其中 `Local` 直接在当前目录工作，`Worktree` 会把改动隔离到 Git worktree，`Cloud` 在配置好的远程环境运行。对直接用户来说，一个很好用的经验是：
小修小补用 `Local`；
风险稍高、要并行试两个方案、或你不想弄脏当前分支时用 `Worktree`；
需要远程环境时再用 `Cloud`。([OpenAI 开发者][3])

**4. 把“项目”切小，别让它一上来吞整个大仓库**
官方文档明确建议：如果你在一个 monorepo 里同时有多个 app 或 package，把它们拆成不同 project，这样 sandbox 只包含那个项目的文件。对你来说，这意味着：别一开始就把整个巨仓库都交给它；先选当前要改的那一块，定位会更准，误改也更少。([OpenAI 开发者][3])

**5. 养成“看 diff、下 inline 评论、分块回退”的习惯**
Codex App 内建 Git 功能和 diff pane。你可以直接检查改动、给某段 diff 加评论让它修、按 chunk 或整文件 stage / revert，还能继续 commit、push、开 PR。对直接用户来说，这比要求它“把完整文件贴给我看”有效得多：把它当成一个会提交补丁的搭档，而不是吐全文的机器人。([OpenAI 开发者][3])

**6. 学会用“批准”和 sandbox 保护自己**
官方文档写得很直白：approvals 决定它什么时候要先征求你的许可，sandbox 决定它能访问哪些目录和网络；如果你不确定，先批最小权限。这个对实际使用特别重要——你不需要每次都很紧张，但对安装依赖、跑危险脚本、动 Git 历史、访问外网这些动作，优先让它先停一下给你确认。([OpenAI 开发者][3])

**7. 把重复工作沉淀成 Skills，把周期性工作交给 Automations**
Codex App 支持 Skills，也支持把 Skills 和 Automations 结合起来。官方给的例子就是：定期评估 telemetry 里的错误、提交修复、生成最近代码库变更报告；如果想让同一个线程定期“醒来”继续跟进，就用 thread automation。对你来说，这意味着：
常见工作流不要每次重新 prompt；
把“review checklist”“前端回归检查”“日志巡检”这类任务沉淀成可复用流程。([OpenAI 开发者][3])

**8. UI/前端问题尽量给图，涉及真实界面时用浏览器/电脑能力**
Codex App 不是只会改文本代码。它支持本地图像上下文相关能力，也内建 in-app browser、computer use、图片生成/编辑等功能，适合做 GUI 流程、浏览器流程和本地应用测试。对你来说，前端 bug、样式偏差、视觉回归，直接丢截图或让它看渲染结果，通常比纯文字描述更高效。([OpenAI 开发者][1])

再压缩一下，真正落地成你的使用习惯，可以记成这 6 句：

* **说目标**：修什么、别动什么、怎么算完成。
* **选模式**：小改 `Local`，风险改动/并行方案用 `Worktree`。
* **切范围**：项目别开太大，monorepo 分 project。
* **看 diff**：在 review pane 里指哪改哪。
* **控权限**：危险操作先让它停下来问。
* **做复用**：反复做的事变成 skills / automations。 ([OpenAI 开发者][3])

还有两点你值得顺手知道：

第一，官方 App 确实支持多线程并行、内建工作树、Git、自动化、IDE 同步，所以你完全可以把“一个大任务”拆成多个线程并行做，而不是逼一个线程同时做所有事。([OpenAI 开发者][1])

第二，数据使用上，Business / Enterprise / Edu 默认不拿你的产品输入输出训练模型；Plus / Pro 则可能会用于模型改进，除非你在数据控制里关掉。这个和你是否愿意把私有代码、日志、截图放进去直接相关。([OpenAI Help Center][4])

---

## 技能与插件



[1]: https://developers.openai.com/codex/app "App – Codex | OpenAI Developers"
[2]: https://help.openai.com/en/articles/9624314-model-release-notes "Model Release Notes | OpenAI Help Center"
[3]: https://developers.openai.com/codex/app/features "Features – Codex app | OpenAI Developers"
[4]: https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan "Using Codex with your ChatGPT plan | OpenAI Help Center"
