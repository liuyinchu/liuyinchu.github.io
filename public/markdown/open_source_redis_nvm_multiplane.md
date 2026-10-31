# 三个值得安利的开源项目：redis-py、nvm 与 Multiplane

最近，我给 **redis-py**、**nvm** 和 **Multiplane** 提交了几项 PR：分别是 [redis-py #4527](https://github.com/redis/redis-py/pull/4527)、[nvm #3961](https://github.com/nvm-sh/nvm/pull/3961)，以及 Multiplane 的 [#6](https://github.com/LBEILC/Multiplane/pull/6)、[#7](https://github.com/LBEILC/Multiplane/pull/7) 和 [#8](https://github.com/LBEILC/Multiplane/pull/8)。借着这次参与的机会，想在这里介绍一下这三个项目，也给它们做一点推广。

它们解决的是很不一样的问题：一个让 Python 程序方便地使用 Redis，一个帮开发者管理 Node.js 版本，另一个则把网页画面逐帧渲染成视频。下面从各自的使用场景聊起，也留几个可以动手试试的入口。

## redis-py：让 Python 程序用上 Redis

[redis-py](https://github.com/redis/redis-py) 是 Redis 的 Python 客户端。项目的安装包叫 `redis`，可以让 Python 程序连接 Redis，并通过熟悉的 Python 接口读写数据、执行命令。

Redis 经常出现在缓存、计数器、消息传递等场景里。比如，一个页面需要反复读取一份更新不频繁的数据，可以考虑把结果放到缓存中，减少重复计算或查询。程序仍然需要安排好数据过期与重新获取的逻辑，而 redis-py 负责提供与 Redis 交互的入口。

### 先试一次写入和读取

假设本机已有一个运行在默认 `6379` 端口的 Redis 服务。先在自己的 Python 环境里安装客户端：

```bash
python -m pip install redis
```

然后运行：

```python
import redis

client = redis.Redis(
    host="localhost",
    port=6379,
    decode_responses=True,
)

client.set("hello:open-source", "你好，Redis", ex=60)
print(client.get("hello:open-source"))
```

这段代码写入一个 60 秒后过期的键，再把它读出来。`decode_responses=True` 让这里的文本响应直接作为字符串返回；默认情况下，响应通常是字节。例子可以对照 [Redis 官方的 redis-py 入门指南](https://redis.io/docs/latest/develop/clients/redis-py/)一起看。

从简单的键值读写开始很容易，而项目的能力并不止于此：它还支持连接池、Pipeline、发布与订阅，以及 [asyncio 异步接口](https://redis.io/docs/latest/develop/clients/redis-py/async/)。如果 Python 应用已经需要和 Redis 打交道，或者正在考虑给应用加一层缓存，redis-py 是很自然的起点。

::link-card{title="redis-py 项目仓库" eyebrow="Python · Redis 客户端" href="https://github.com/redis/redis-py"}
从 README 和官方示例开始，让 Python 程序与 Redis 通信。
::

## nvm：给不同项目切换合适的 Node.js

做前端或使用 Node.js 工具时，很容易遇到这样的情况：手头的几个项目需要不同版本的 Node.js。如果只有一个固定的全局版本，切换项目时就得反复处理环境要求。

[nvm（Node Version Manager）](https://github.com/nvm-sh/nvm) 用来安装和切换多个 Node.js 版本。它按用户安装，在当前 shell 中生效；同一台机器上可以保留多个版本，再根据正在处理的项目选择。

安装并在 shell 中加载 nvm 后，可以先试试这些命令：

```bash
# 安装一个 Node.js 主版本
nvm install 24

# 在当前 shell 中使用它
nvm use 24

# 查看当前版本和本机已有版本
node -v
nvm ls
```

如果另一个项目使用 Node.js 22，也可以安装并执行 `nvm use 22`。切换作用于当前 shell；其他已经打开的终端可以分别选择自己的版本。

### 把版本写进项目

nvm 还能读取项目目录里的 `.nvmrc`。例如，文件里只写一行：

```text
24
```

进入项目目录后，运行 `nvm install` 可以按这个文件安装对应版本，运行 `nvm use` 可以切换到它。这里写的是 24 这一主版本线；如果团队需要固定到具体版本，也可以在文件中写完整版本号。这样一来，项目需要什么版本就有了一个可以随代码一起查看的地方。

`.nvmrc` 本身不会保证进入目录后自动切换：可以手动执行 `nvm use`，也可以按需参考官方文档配置 shell 集成。安装方式和更多用法见 [nvm README](https://github.com/nvm-sh/nvm#installing-and-updating)；它支持 macOS、Linux 等环境，Windows 用户可以参考项目提供的 WSL 说明。

如果你经常在几个 Node.js 项目之间来回切换，nvm 值得装进工具箱。它把“这个项目该用哪个版本”变成了一个容易查看、也容易执行的约定。

::link-card{title="nvm 项目仓库" eyebrow="Node.js · 版本管理" href="https://github.com/nvm-sh/nvm"}
了解安装、版本切换和 .nvmrc，让不同项目各用各的 Node.js。
::

## Multiplane：把网页动画逐帧变成视频

[Multiplane](https://github.com/LBEILC/Multiplane) 是一个面向 AI Agent 的本地无头 HTML 视频渲染器。它的镜头可以用熟悉的 HTML、CSS 和 JavaScript 编写；人可以自己写页面，也可以让 Agent 帮忙生成和调整。

它的核心约定很直观：页面提供一个 `render(t)`，根据时间 `t` 画出对应时刻的画面。渲染时，Multiplane 让无头 Chromium 按时间逐帧生成画面，再交给 FFmpeg 合成为视频。

```text
HTML / CSS / JavaScript 镜头
          ↓
render(t) 更新指定时刻的画面
          ↓
Chromium 截取画面 → FFmpeg 合成视频
```

这种方式适合程序化动画、数据可视化片段、技术介绍短片等场景：如果画面本来就能用网页表达，就可以把网页开发中熟悉的布局、文字和样式带到视频制作里。Multiplane 负责渲染流程；镜头内容和素材仍由创作者准备。

### 为什么我觉得它有意思

写动画时，一个重要的问题是：同一个时刻能不能稳定得到同一张画面？如果画面依赖当前系统时间或未经控制的随机数，反复渲染和并行渲染就可能出现不一致。

Multiplane 为这个问题提供了几个工具。`lint` 可以在渲染前检查一些可能破坏确定性的写法；`verify` 会用不同顺序和渲染方式检查画面是否一致；`stills` 则可以输出指定时刻的静帧，方便先检查构图。项目还提供运动模糊、可选的三维图层和景深等能力。具体约定与效果可以在[项目 README](https://github.com/LBEILC/Multiplane#特点)中查看。

### 跑一遍项目自带的示例

按照项目当前的快速开始，需要 **Node.js 24 或更新版本**、支持 libx264 的 FFmpeg，以及 Playwright 使用的 Chromium。准备好 Node.js 和 FFmpeg 后，可以在一个用于试验的目录里执行：

```bash
npm install multiplane
npx playwright install chromium

# 检查本机渲染环境
npx multiplane doctor

# 渲染安装包里自带的示例镜头
npx multiplane render examples/animation.html --root node_modules/multiplane
```

这里的 `--root` 指向安装包目录，是为了找到包里自带的示例。命令完成后可以从输出中查看产物位置。依赖和参数可能随版本变化，第一次尝试时建议结合[官方快速开始](https://github.com/LBEILC/Multiplane#快速开始)核对。

如果你喜欢用网页技术做动态视觉，或者想让 AI Agent 帮忙制作可以反复修改、检查和渲染的动画，Multiplane 很值得看看。建议先跑通一个现成示例，再试着改动镜头里的颜色、文字或运动方式。

::link-card{title="Multiplane 项目仓库" eyebrow="HTML 视频 · 程序化动画" href="https://github.com/LBEILC/Multiplane"}
看看示例、渲染约定和项目文档，把网页画面变成视频。
::

## 各自解决一个具体问题

我喜欢这三个项目的一点，是都能从一个小场景开始理解：用 redis-py 读写一条数据，用 nvm 为项目选好 Node.js，或者用 Multiplane 渲染一个网页镜头。第一次动手之后，再决定要不要深入它们各自更丰富的功能。

最近参与贡献，让我有机会重新认识这些项目。也希望这篇介绍能让更多人发现它们：如果刚好碰到相应的需求，不妨打开仓库和文档，挑一个小例子试试。
