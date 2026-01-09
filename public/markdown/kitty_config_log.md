# 个人 kitty 配置 & 使用笔记

一个**好看**且**好用**的 GPU 加速渲染的终端模拟器。

| 特性                 | 说明                                                               |
| ------------------ | ---------------------------------------------------------------- |
| **GPU 加速渲染**    | 使用 OpenGL 渲染文字和图像，速度极快、低 CPU 占用。                                 |
| **原生图片显示**     | 支持直接显示图片（通过 `kitty +kitten icat`），可预览图片、Markdown、代码截图等。          |
| **超强排版**        | 支持真正的连字（ligature）、emoji、组合字形（比如 FiraCode 字体的编程连字）。               |
| **高度可配置**       | 所有配置都在 `~/.config/kitty/kitty.conf`，语法简单、热加载（改完立即生效）。            |
| **分屏系统**        | 支持像 `tmux` 一样在一个窗口里分屏（左右/上下）。                                    |
| **kitten 插件系统** | 自带可扩展的「kitten」，可以写 Python 脚本扩展终端功能（如 icat、diff、SSH、Unicode 输入等）。 |
| **远程复制粘贴**      | kitty + its own `kitten ssh` 支持在 SSH 时仍使用本地剪贴板。                  |
| **漂亮的字体渲染**     | 对字体抗锯齿、字距、透明度都有高级支持。                                             |
| **启动超快**         | 几乎瞬间打开，性能优于 alacritty / wezterm / iTerm2。                        |

官方文档详见[这里](https://sw.kovidgoyal.net/kitty/)。

这篇随记涵盖了以下内容：
- 个人配置
- 一个好的教程推荐
- 关于光标的炫酷功能的配置
- 关于 `ssh` 的说明
- kitty 使用笔记

## 1 我的完整配置

```config
# BEGIN_KITTY_THEME
# Catppuccin-Mocha
include current-theme.conf
# END_KITTY_THEME

# font
# 原始参考：https://github.com/patricorgi/dotfiles_demo/blob/main/.config/kitty/kitty.conf
# 字体设置
font_size              18
font_family      family="Maple Mono NF CN"
bold_font        auto
italic_font      auto
bold_italic_font auto
font_features        MapleMono-NF-CN-Regular +cv01 +ss02 +ss04 +ss05 +zero
font_features        MapleMono-NF-CN-SemiBold +cv01 +ss02 +ss04 +ss05 +zero
font_features        MapleMono-NF-CN-Italic +cv01 +ss02 +ss04 +ss05 +zero
font_features        MapleMono-NF-CN-SemiBoldItalic +cv01 +ss02 +ss04 +ss05 +zero
# 光标下禁用连字渲染（防止定位错误）
disable_ligatures cursor

# ==============================================================

# window
hide_window_decorations        titlebar-only
window_padding_width           15
background_opacity             0.74
# 模糊强度（数值越大越模糊）——建议配合透明背景使用 32？64？
background_blur                32
remember_window_size           yes

# tab bar
tab_bar_edge                top
tab_bar_style               powerline
tab_powerline_style         slanted

# cursor
# 基本形状和颜色
cursor_shape beam
cursor_shape_unfocused hollow

# 光标闪烁设置
cursor_blink_interval 0.5 ease-in-out
cursor_stop_blinking_after 10.0

# 光标样式增强
cursor_beam_thickness 2.0

# 光标轨迹效果
cursor_trail 100
cursor_trail_decay 0.25 0.55
cursor_trail_start_threshold 2

# 禁用 shell 自动改变光标形状（可选）
shell_integration no-cursor
```

如果你喜欢这份配置，你可以将其直接复制到你的配置文件中。

此外，我还搭配了 `zsh + oh-my-zsh` 来使用。


## 2 快速开始

首先参考[这个教程](https://www.bilibili.com/video/BV1WJ4m1w7ms)完成最基本的配置（感谢这个很好的教程，我是跟着 TA 配的）。

- 下载与安装：
  ```bash
  brew install kitty
  ```
- 配置颜色主题：
  ```bash
  kitty +kitten themes
  ```
- 下载字体：
  ```bash
  brew install --cask font-maple-mono-nf-cn
  ```
- macOS 配置文件一般会在 `~/.config/kitty/kitty.conf`
- 配置字体：
  ```bash
  kitty list-fonts --psnames
  ```
- 其它：建议上述内容手动配置，剩下的直接复制配置文件就行。

## 3 光标动画

然后参考下面这个官方文档配置光标动画。

### 3.1 官方文档翻译

#### `cursor`

`cursor #cccccc`

默认文本光标的颜色。如果设置为特殊值 `none`，光标将以“反色视频”效果显示。它的颜色将是其所在单元格的文本颜色，而光标下的文本将以该单元格的背景色显示。请注意，如果在终端中运行的程序设置了光标颜色，则以程序的设置为准。此外，如果单元格的背景和前景颜色对比度非常低，光标颜色也会被调整。注意，某些主题会设置此值，因此如果您想覆盖它，请将您的设置写在包含了主题文件的代码行之后。

#### `cursor_text_color`

`cursor_text_color #111111`

光标下方文本的颜色。如果您希望它使用其下方单元格的背景色来渲染，请使用特殊关键字：`background`。请注意，如果 `cursor` 被设置为 `none`，则此选项将被忽略。同样，某些主题也会设置此值，若要覆盖，请将您的设置写在主题文件引用行之后。

#### `cursor_shape`

`cursor_shape block`

光标的形状。可以是 `block` (块状)、`beam` (I 型) 或 `underline` (下划线)。请注意，重新加载配置时，只有当光标形状未被终端中运行的程序设置时，此更改才会生效。这里设置的是默认光标形状，在终端中运行的应用程序可以覆盖它。特别地，Kitty 中的 Shell 集成会在 Shell 提示符处将光标形状设置为 `beam`。您可以通过将 `shell_integration` 设置为 `no-cursor` 来避免这种情况。

#### `cursor_shape_unfocused`

`cursor_shape_unfocused hollow`

定义当操作系统窗口未聚焦时文本光标的形状。未聚焦时的光标形状可以是 `block` (块状)、`beam` (I 型)、`underline` (下划线)、`hollow` (空心) 或 `unchanged` (保持不变)。

#### `cursor_beam_thickness`

`cursor_beam_thickness 1.5`

I 型光标 (`beam`) 的厚度（单位：pts）。

#### `cursor_underline_thickness`

`cursor_underline_thickness 2.0`

下划线光标 (`underline`) 的厚度（单位：pts）。

#### `cursor_blink_interval`

`cursor_blink_interval -1`

光标闪烁的间隔（单位：秒）。设置为 `0` 可禁用闪烁。负值表示使用系统默认值。请注意，最小间隔将受限于 `repaint_delay` 的值。您还可以通过指定一个缓动函数来为光标闪烁添加动画效果。例如，将此选项设置为 `0.5 ease-in-out` 将使光标在一秒钟内产生动画闪烁，前 0.5 秒从不透明变为透明，后 0.5 秒再变回来。您可以为这两个半段指定不同的缓动函数，例如：`-1 linear ease-out`。Kitty 支持所有 CSS 缓动函数。请注意，开启光标动画会消耗额外电量，因为它意味着屏幕在每个闪烁间隔内会重绘多次。另请参阅 `cursor_stop_blinking_after`。

#### `cursor_stop_blinking_after`

`cursor_stop_blinking_after 15.0`

在键盘无任何操作指定秒数后，停止光标闪烁。设置为 `0` 表示永不停止闪烁。

#### `cursor_trail`

`cursor_trail 0`

将此值设置为大于 0 的数以启用“光标拖尾”动画。这是一种显示“拖尾”跟随文本光标移动的动画。它可以让您轻松地跟踪大幅度的光标跳动，并产生光标在屏幕上飞速移动的酷炫视觉效果。此选项的实际值（一个毫秒数）控制动画何时被触发。拖尾动画仅跟那些在其位置上停留时间超过指定毫秒数的光标。这可以防止在复杂应用的 UI 更新期间，为位置快速变化的光标显示拖尾。请参阅 `cursor_trail_decay` 来控制动画速度，以及 `cursor_trail_start_threshold` 来控制何时启动光标拖尾。

#### `cursor_trail_decay`

`cursor_trail_decay 0.1 0.4`

当 `cursor_trail` 启用时，控制光标拖尾效果的衰减时间。此选项接受两个正浮点数，分别指定最快和最慢的衰减时间（单位：秒）。第一个值对应最快的衰减时间（最小值），第二个值对应最慢的衰减时间（最大值）。第二个值必须大于或等于第一个值。较小的值会导致光标拖尾衰减得更快。调整这些值以控制光标拖尾消失的速度。

#### `cursor_trail_start_threshold`

`cursor_trail_start_threshold 2`

设置启动光标拖尾的距离阈值。此选项接受一个正整数，代表光标在启动拖尾前必须移动的最小单元格数。当光标移动距离小于此阈值时，拖尾将被跳过，以减少不必要的动画。

### 3.2 我的光标配置文件

```config
# cursor
# 基本形状和颜色
cursor_shape beam
cursor_shape_unfocused hollow

# 光标闪烁设置
cursor_blink_interval 0.5 ease-in-out
cursor_stop_blinking_after 10.0

# 光标样式增强
cursor_beam_thickness 2.0

# 光标轨迹效果
cursor_trail 100
cursor_trail_decay 0.25 0.55
cursor_trail_start_threshold 2

# 禁用 shell 自动改变光标形状（可选）
shell_integration no-cursor
```

## 4 关于 `ssh`

核心就是：

**直接连接时请把 `ssh` 换为 `kitten ssh`。**

### 4.1 真正便捷的 SSH

  * 在远程主机上自动进行 **Shell 集成**。
  * 轻松将本地的 shell/编辑器配置**克隆**到远程主机。
  * 自动**重用现有连接**，以避免连接建立延迟。
  * 按需在远程主机上提供 **kitten 二进制文件**。
  * 连接到远程主机时轻松**更改终端颜色**。
  * 自动将 kitty **远程控制套接字**转发到已配置的主机。

*0.25.0 版本新增：自动 Shell 集成、文件传输和连接重用功能。*
*0.30.0 版本新增：自动转发远程控制套接字。*

`kitten ssh` 能让你轻松登录到远程主机，并自动在远端设置好环境，使其像你的本地 shell 一样舒适。你可以指定在远程主机上设置的环境变量以及要复制到那里的文件，让你的远程体验如同本地操作。此外，它还会自动在远程主机上设置 Shell 集成，并将 kitty 的 terminfo 数据库复制过去。

`kitten ssh` 是对传统 `ssh` 命令行程序的一个**轻量级封装**，支持所有相同的选项、参数和配置。在交互式使用场景中，它可以完全替代 `ssh`。要试用它，只需运行：

```sh
kitten ssh 要连接的主机名
```

执行后，你应该会看到远程主机上的 shell 提示符，并且 Shell 集成已经启用。如果你喜欢这个功能，可以在你 shell 的 rc 文件（如 `.bashrc` 或 `.zshrc`）中为它添加一个别名：

```sh
alias s="kitten ssh"
```

这样，你只需输入 `s 主机名` 就可以连接了。

如果你在 `kitty.conf` 中定义了如下映射：

```conf
map f1 new_window_with_cwd
```

那么，按下 **F1** 键将会使用 `kitten ssh` 自动打开一个新窗口，并登录到相同的主机和相同的目录下。

### 4.2 配置

`kitten ssh` 可以通过 `~/.config/kitty/ssh.conf` 文件进行配置。你可以在此文件中指定要在远程主机上设置的环境变量，以及要从本地复制到远程主机的文件。我们来看一个简单的例子：

```conf
# 复制设置一些常用工具所需的文件和目录
copy .zshrc .vimrc .vim

# 设置一些环境变量
env SOME_VAR=x

# COPIED_VAR 在远程主机上的值将与本地相同
env COPIED_VAR=_kitty_copy_env_var_

# 创建一些针对特定主机的设置
hostname someserver-*
copy env-files
env SOMETHING=else

hostname someuser@somehost
copy --dest=foo/bar some-file
copy --glob some/files.*
```

关于 `ssh.conf` 的完整语法和选项详情，请参阅下方。此外，你也可以通过命令行传递配置选项：

```sh
kitten ssh --kitten interpreter=python servername
```

`--kitten` 参数可以指定多次，其内容遵循 `ssh.conf` 的指令格式。这些命令行参数会覆盖为匹配主机所使用的最终选项，效果如同它们被附加到 `ssh.conf` 中该主机匹配区域的末尾一样。这些参数仅对本次调用所连接的主机生效，因此任何主机名指令都将被忽略。

### 4.3 警告

由于 SSH 设计上的限制，你在看到 shell 提示符出现**之前**输入的任何内容都可能会丢失。所以，最理想的做法是**等到看见 shell 提示符后再开始输入**。

## 5 学习如何使用 kitty

### 5.1 窗口与分屏
- 窗口
  - 全屏：`^+⌘+f`
  - 新标签：`⌘+t`
  - 关闭标签：`⌘+w`
- 分屏
  - 分割：`ctrl+shift+enter`
  - 切换：`ctrl+shift+]` & `ctrl+shift+[`
  - 关闭：`ctrl+shift+w`

### 5.2 kitten

事实上，前述 ssh 功能正是由 kitty 的强大插件 kitten 所实现的。这些 kittens 都是 Python 写的，也可以自定义。

下面列出一些内置插件和用法：
| kitten 命令                     | 功能                      |
| ----------------------------- | ----------------------- |
| `kitty +kitten icat`          | 显示图片（fzf 预览神器）          |
| `kitty +kitten diff`          | 颜色高亮的文件差异比较             |
| `kitty +kitten ssh user@host` | 远程登录（保持本地剪贴板）           |
| `kitty +kitten unicode_input` | 输入 Unicode 字符（比如 emoji） |
| `kitty +kitten clipboard`     | 操作系统剪贴板交互               |
| `kitty +kitten themes`        | 浏览并设置主题                 |
| `kitty +kitten hints`         | 让终端内容变为可点击链接 / 文件 / 命令  |

上述功能都十分好用啊！

注意在 kitty 终端内，只用输入 `kitten` 加上后面的命令就行了。

此外，`kitten ssh` 模式下，也可以使用 `kitten` 命令（如预览图片，这是非常强大的）。