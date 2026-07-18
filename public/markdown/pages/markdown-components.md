# Markdown 富组件使用手册

这是一间用于试验文字形态的组件实验室。下面每一节都同时展示**实际效果**与**可复制的 Markdown 语法**。组件沿用本站的 Catppuccin Mocha 色彩、圆角、字体与柔和阴影；在移动端会自动收拢为单列。

::alert{type="info" title="语法约定"}
行内组件使用 `:name[内容]{属性}`；块组件使用 `::name{属性}` 与同数量冒号结束。嵌套时给内层再增加一个冒号，代码围栏里的示例不会被解析。
::

## 任务清单

- [x] 支持已完成任务
- [ ] 支持尚未完成任务
- [ ] 保留普通的 **Markdown 格式**

```markdown
- [x] 支持已完成任务
- [ ] 支持尚未完成任务
```

## 脚注

脚注沿用熟悉的 Markdown 写法。正文可以引用同一个说明[^component]，也可以再次引用它[^component]。

```markdown
正文中的说明[^component]

[^component]: 脚注支持 **粗体**、链接和 `inline code`。
```

## Alert

:alert
这是默认的 Note Alert。
::

::alert{type="question" title="一个问题"}
默认插槽支持 [超链接](#alert)、**粗体**、`Inline code`，也支持多段 Markdown。

答案可以慢一点出现。
::

::alert{type="success" title="完成"}
同一套语法还支持 `note / info / tip / success / question / warning / danger`。
::

```markdown
:alert
这是默认提示。
::

::alert{type="question" title="一个问题"}
默认插槽的 [超链接](#alert) **粗体** `Inline code`
::
```

## Blur

行内剧透：:blur[你知道得太多了。]

::blur{label="剧透保护"}
:::quote
也未必。
:::

这里可以继续放置链接、列表或其它组件。
::

```markdown
:blur[你知道得太多了。]

::blur{label="剧透保护"}
:::quote
也未必。
:::
::
```

## Chat

::chat
{:2024-11-09 23:39:30}
{.}
也许
{.}
我们可以聊聊天
{.纸鹿}
我还可以有名字
{:纸鹿撤回了一条消息}
{用户1}
有趣\
我学到了。
::

```markdown
::chat
{:2024-11-09 23:39:30}
{.}
也许
{.纸鹿}
我还可以有名字
{:纸鹿撤回了一条消息}
{用户1}
有趣\
我学到了。
::
```

## Folding

::folding{title="第一层：展开看看"}
折叠组件使用原生 `details`，所以键盘与触屏都可以自然操作。

:::folding{title="第二层：还可以嵌套"}
嵌套时只需要给内层增加一个冒号。
:::
::

```markdown
::folding{title="第一层"}
内容
:::folding{title="第二层"}
嵌套内容
:::
::
```

## Quote

:quote[有时候，有些话，有点意思。]

::quote{icon="tabler:files"}
令图标有所指，引用亦有中心。
::

::quote
#icon
ヾ(•ω•`)o
#default
图标插槽也可以是 Emoji、颜文字或者英文装饰。
::

```markdown
:quote[有时候，有些话，有点意思。]

::quote{icon="tabler:files"}
令图标有所指，引用亦有中心。
::

::quote
#icon
ヾ(•ω•`)o
#default
自定义图标插槽。
::
```

## Timeline

::timeline
{前天}

看到了小兔。

{昨天}

是小鹿。

{今天}

是你。\
*再添一笔*。
::

```markdown
::timeline
{前天}
看到了小兔
{昨天}
是小鹿
{今天}
是你。
::
```

## Tip 与轻量行内组件

选择这句话时留意提示：:tip[我是一条小提示]{tip="选择、悬停或聚焦时出现的补充说明"}

状态可以写成 :badge[Stable]{tone="success"} 或 :badge[Draft]{tone="warning"}，快捷键可以写作 :kbd[⌘ K]，重点可以使用 :mark[柔和高亮]，进度也能直接表达为 :progress[72]{label="完成度"}。

```markdown
:tip[我是一条小提示]{tip="提示内容"}
:badge[Stable]{tone="success"}
:kbd[⌘ K]
:mark[柔和高亮]
:progress[72]{label="完成度"}
```

## Steps

::steps
{准备内容}

先写下最小但完整的 Markdown。

{选择形态}

用 Alert、Timeline 或 Folding 建立信息层级。

{检查体验}

同时用键盘、触屏与窄屏确认结果。
::

```markdown
::steps
{准备内容}
先写 Markdown
{选择形态}
加入富组件
{检查体验}
完成移动端与键盘检查
::
```

## Gallery 与 Columns

::gallery{columns="2"}
![海边的 Skadi](/bg/skadi.jpeg)

![开放的风景](/bg/open.jpeg)
::

::columns{columns="2"}
### 左侧

适合并列放置相关但独立的短内容。

### 右侧

窄屏下自动回到单列，不压缩正文可读性。
::

```markdown
::gallery{columns="2"}
![图片一](/path/one.jpg)
![图片二](/path/two.jpg)
::

::columns{columns="2"}
### 左侧
内容
### 右侧
内容
::
```

## Link Card

::link-card{title="继续探索随记" eyebrow="JOTTINGS" href="/space1"}
从文章索引进入完整的写作与记录空间。
::

```markdown
::link-card{title="继续探索随记" eyebrow="JOTTINGS" href="/space1"}
卡片说明，可以包含 **Markdown**。
::
```

[^component]: 脚注由通用 Markdown 组件生成，支持 **Markdown** 内容、多次引用和返回正文链接。
