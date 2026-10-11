# 两个值得安利的开源工具：RQ 与 Worktrunk

最近，我给 **RQ** 和 **Worktrunk** 这两个开源项目都贡献了 PR。借着这件事，想在这里简单介绍一下它们，也给这两个项目做一点推广。

它们关注的是开发中的两类日常问题：RQ 帮助 Python 应用安排后台任务，Worktrunk 帮助开发者管理并行的代码修改。下面各从一个具体场景说起，再留一个可以上手的小例子。

## RQ：把耗时函数交给后台

[RQ（Redis Queue）](https://python-rq.org/) 是一个 Python 任务队列库，底层使用 Redis 或 Valkey，由独立的 worker 在后台执行任务。它的入口很直接：写一个普通 Python 函数，把函数和参数交给队列，再启动 worker。

比如，一个页面需要生成报表。如果一直等到报表完成才返回，用户就得停在原地等待。可以把生成报表的工作放进队列，先告诉用户任务已提交，再由后台完成处理。发送邮件、处理图片、批量整理数据，也都适合这种安排。

我想推荐 RQ，主要是因为这套接口很容易理解。调用者负责提交，队列保存待执行的工作，worker 负责执行。原来的函数仍然是普通函数；基础用法不需要先给它加一层任务装饰器。

::folding{title="一个最小的 RQ 例子"}
假设已经安装 RQ，并启动了本机默认端口上的 Redis。下面两个文件放在同一目录。

先写一个可以被导入的函数。这里用词数统计演示接口，实际使用时可以换成耗时的报表或数据处理任务：

```python
# tasks.py
def count_words(text):
    return len(text.split())
```

再把一次函数调用放进队列：

```python
# submit_job.py
from redis import Redis
from rq import Queue
from tasks import count_words

queue = Queue(connection=Redis())
job = queue.enqueue(count_words, "Hello from RQ")
print(job.id)
```

在这个目录打开一个终端，启动 worker：

```bash
rq worker
```

另开一个终端，从同一目录提交任务：

```bash
python submit_job.py
```

`enqueue()` 返回的是任务对象，函数的实际执行发生在 worker 中。这个例子根据[官方入队文档](https://python-rq.org/docs/#enqueueing-jobs)简化。
::

RQ 也提供[失败重试](https://python-rq.org/docs/exceptions/#retrying-failed-jobs)、[延迟执行](https://python-rq.org/docs/scheduling/)和[任务依赖](https://python-rq.org/docs/#job-dependencies)。可以先让最简单的任务跑起来，再按需要增加这些能力。

上手时有两件事值得记住：提交任务的程序与 worker 都要能导入对应的函数模块；[一个 worker 一次处理一个任务](https://python-rq.org/docs/workers/)，需要同时处理更多任务时，可以增加 worker。把工作移到后台之后，Redis 和 worker 的运行也就成为应用的一部分。

如果你已经在用 Python，正想给应用加上后台任务，RQ 很值得先试一试。尤其是需求已经明确、希望尽快把普通函数接入队列的时候，这种小而直接的接口很有吸引力。

::link-card{title="RQ 项目仓库" eyebrow="Python · 后台任务" href="https://github.com/rq/rq"}
从 README 和官方文档开始，把第一个函数放进队列。
::

## Worktrunk：给并行任务各留一个目录

[Worktrunk](https://worktrunk.dev/) 是一个管理 Git worktree 的命令行工具，尤其关注多个 AI 编程代理并行工作的场景。当然，一个人同时推进几项开发任务，也能用上它。

这样的情形很常见：一边做新功能，一边修另一个问题，还想顺手看看某个分支。如果每次都在同一个目录里切换，尚未提交的修改、打开的编辑器和正在跑的服务，就需要来回安排。任务多起来之后，切换本身也会打断思路。

[Git worktree](https://git-scm.com/docs/git-worktree) 允许一个仓库同时检出多个分支，每个工作树有自己的目录与检出状态，共享仓库的 Git 对象。于是，新功能和修复可以各占一个工作目录，也可以把不同目录分别交给不同的 AI 代理处理。

Worktrunk 把这些操作整理成更顺手的命令：用分支名创建和切换工作树，用 `wt list` 查看各项任务的状态。路径可以按模板生成，不必每次手动安排一套目录名。它让 Git 原有的能力更容易进入日常工作流。

::folding{title="先用创建、查看和切换这三个动作"}
下面以已经安装 Homebrew 的 macOS 为例。安装工具并配置 shell 集成：

```bash
brew install worktrunk
wt config shell install
```

[Shell 集成](https://worktrunk.dev/shell-integration/)让命令能够切换当前终端的目录。配置后重新打开终端，再进入已有的 Git 仓库：

```bash
# 创建新分支与工作树，并进入对应目录
wt switch --create feature-a

# 再为另一项任务创建工作树
wt switch --create feature-b

# 查看所有工作树及其状态
wt list

# 回到已有的工作树
wt switch feature-a
```

按照[创建命令的默认行为](https://worktrunk.dev/switch/)，新分支从仓库的默认分支创建；如果想从其他位置开始，可以再了解 `--base` 参数。
::

需要进一步减少重复操作时，还可以配置 [hooks](https://worktrunk.dev/extending/)，在创建工作树后执行安装依赖等准备工作。先掌握基本命令就够了，这些自动化可以随着自己的工作习惯慢慢补上。

这里的分开主要发生在代码目录：服务端口、数据库和其他运行资源仍需要按项目安排。官方也提供了[按工作树配置开发服务的例子](https://worktrunk.dev/tips-patterns/#per-worktree-services)。多个任务最终合到一起时，仍然需要正常的代码审查和验证。

如果你经常在几个分支之间来回切换，或者开始让多个 AI 同时处理不同任务，Worktrunk 值得放进工具箱。每项任务有一个可以随时回去的目录，查看进度和切换上下文都会更自然。

::link-card{title="Worktrunk 项目仓库" eyebrow="Git · 并行开发" href="https://github.com/max-sixty/worktrunk"}
从三个基本动作开始，让每项开发任务有自己的工作目录。
::

## 为什么想把它们推荐给你

我喜欢这两个项目的原因，都是它们能从一个具体问题开始用起来。给应用里的一个耗时函数加上后台执行，可以从 RQ 开始；让几项代码修改各有自己的工作目录，可以从 Worktrunk 开始。第一次尝试就能看见它们各自解决了什么。

最近参与贡献，也让我有了写下这篇随记的契机。希望这些介绍能让更多人认识它们；如果刚好碰到相应的需求，不妨打开项目文档，试试那个最小的例子。
