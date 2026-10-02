# 轻量命令行工具

两个项目，三个工具。把数据分析、文档检查和 JSONL 校验，放进日常的终端工作流。

::columns{columns="2"}
### SeriesKit

:badge[Kimi 主导开发]{tone="info"}

面向 CSV 与数值序列的轻量工具，支持统计分析、数据处理和图表报告。

:::link-card{title="查看 SeriesKit" eyebrow="DATA & PLOTS" href="https://github.com/pifuyuini/serieskit"}
源码、安装说明与 Python / Rust 使用指南。
:::

### DocCheck & JSONLCheck

:badge[Codex 主导开发]{tone="success"}

检查 Markdown 本地链接与锚点，校验 JSONL 记录、必需字段和类型变化。

:::link-card{title="查看 DocCheck & JSONLCheck" eyebrow="DOCS & RECORDS" href="https://github.com/pifuyuini/doccheck-jsonlcheck"}
源码、可运行示例与完整检查规则。
:::
::

## SeriesKit · 从数据到报告

从统计摘要开始，再按需要加入分组、滑动窗口、异常值检测和绘图。

::steps
{准备环境}

使用 Python 3.12 或以上，按项目 README 安装。Python 用户无需安装 Rust。

{查看 CSV 统计}

先了解数值列的基本情况：

```bash
serieskit summary data.csv
```

{生成图表报告}

把统计表与图表输出到指定目录：

```bash
serieskit report data.csv --outdir report
```
::

::folding{title="更多分析能力与 Rust 实现"}
- 描述统计、分组汇总、滑动窗口和异常值检测。
- 相关性分析、直方图、序列图与图表报告。
- Python 库与 CLI 基于 NumPy、pandas、SciPy 和 Matplotlib；另有独立的 Rust 统计库与 CLI。

[查看版本下载](https://github.com/pifuyuini/serieskit/releases)。生成报告时，同名输出会被覆盖。
::

## DocCheck & JSONLCheck · 给文档与数据做检查

:badge[离线]{tone="info"} :badge[只读]{tone="muted"}

两款检查器只使用 Python 标准库，不修改输入，也不请求网络。

::steps
{准备环境}

克隆项目仓库，使用 Python 3.12 或以上，在仓库目录运行模块。

{检查 Markdown 文档}

核对本地文件链接与标题锚点：

```bash
python3 -B -m doccheck docs --root docs
```

{校验 JSONL 记录}

逐行检查数据，要求每条记录包含 `id`，并输出 JSON 报告：

```bash
python3 -B -m jsonlcheck events.jsonl --require-field id --format json
```
::

::folding{title="报告格式与便携使用"}
两者都支持文本、JSON 和 Markdown 报告，也可使用便携 zipapp。DocCheck 可生成文档导航与反向链接；JSONLCheck 可检查记录数量及观察字段、类型变化。

[查看示例与工作流](https://github.com/pifuyuini/doccheck-jsonlcheck/tree/main/examples)。配置项与支持的 Markdown 语法以仓库说明为准。
::

::alert{type="tip" title="换成自己的输入"}
示例中的 `data.csv`、`docs`、`events.jsonl` 和 `id` 都需要替换为实际文件、目录与字段。
::

::link-card{title="返回代码与项目" eyebrow="PROJECTS" href="/code"}
继续查看其他项目与应用。
::
