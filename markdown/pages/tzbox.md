# TZBox

:badge[macOS 14+]{tone="info"} :badge[Apple Silicon]{tone="muted"}

应用级时区代理。让应用进入你选定的时区，系统时区与真实时刻保持原样。

::stream-button{title="获取 TZBox" eyebrow="MACOS TIMEZONE PROXY" href="https://github.com/pifuyuini/tzbox"}
查看 **源码、构建说明与使用指南**。
::

## 选择时区，管理应用

::columns{columns="2"}
### 时间视图

搜索 IANA 时区，对照目标时间与系统时间，按当地规则处理夏令时。

### 应用会话

为 Chrome、Cherry Studio 等应用设置启动时区，查看运行状态与待重新应用提示。保留应用自己的资料、账号和设置，关闭窗口后可从菜单栏继续管理。
::

## 开始使用

::steps
{选择目标时区}

例如 `Asia/Tokyo`，在时间对照中确认目标时间。

{添加应用}

选择需要管理的 macOS `.app`。

{应用并启动}

未运行的应用可以直接启动；已经运行的应用，先保存内容，再正常重启以应用新时区。
::

::alert{type="info" title="切换时区需要重新应用"}
修改目标时区后，已有进程仍使用原启动时区。重新应用才会生效；也可以在应用菜单中恢复系统时区。
::

::folding{title="从源码构建"}
需要 macOS 14 或以上、Apple Silicon、Swift 5.9 或以上，以及已安装的 macOS SDK / Command Line Tools：

```bash
git clone https://github.com/pifuyuini/tzbox.git
cd tzbox
./scripts/build.sh release
open build/TZBox.app
```

构建输出为 `build/TZBox.app`。详细步骤见项目 README。
::

::folding{title="时区作用范围与当前发布状态"}
TZBox 为本次应用启动传入目标时区。应用内的网页、扩展，以及服务器或远程环境，仍可能采用自己的时间来源，需要按实际用途确认效果。

当前构建采用本地 ad-hoc 签名，尚未提供 Developer ID 签名、公证或自动更新。
::

::link-card{title="返回代码与项目" eyebrow="PROJECTS" href="/code"}
继续查看其他项目与应用。
::
