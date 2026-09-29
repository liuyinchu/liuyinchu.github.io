# 轻量命令行工具

两个项目，三个工具：处理数据、检查文档、核验 JSONL。把日常工作里需要反复做的小检查，留在终端里完成。

## SeriesKit

由 **Kimi 主导开发**的轻量数据处理工具。面向 CSV 与数值序列，提供统计、分析与绘图能力，可以从命令行使用，也可以作为 Python 库调用。

- 描述统计、分组汇总、滑动窗口和异常值检测。
- 相关性分析、直方图、序列图，以及图表报告。
- Python 库与 CLI 基于 NumPy、pandas、SciPy 和 Matplotlib；另有独立的 Rust 统计库与 CLI，Python 用户无需安装 Rust。

::: button-row
[GitHub 源码与使用说明](https://github.com/pifuyuini/serieskit){.md-button}
[版本下载](https://github.com/pifuyuini/serieskit/releases){.md-button}
:::

### 从一份 CSV 开始

安装方法见项目 README，Python 版本要求为 3.12 或以上。安装后，把示例路径替换为自己的 CSV：

```bash
serieskit summary data.csv
serieskit report data.csv --outdir report
```

前者查看统计摘要，后者生成统计表与图表。报告会写入指定目录，同名输出会被覆盖。

---

## DocCheck & JSONLCheck

由 **Codex 主导开发**的两款离线、只读检查工具，使用 Python 3.12 或以上的标准库运行。

- **DocCheck**：检查 Markdown 指向本地文件的链接及标题锚点，也可生成文档导航和反向链接。
- **JSONLCheck**：逐行校验 JSONL，检查必需字段和记录数量，并观察字段或类型的变化。

两者都支持文本、JSON 和 Markdown 报告；检查过程不修改输入，也不请求网络。

::: button-row
[GitHub 源码与使用说明](https://github.com/pifuyuini/doccheck-jsonlcheck){.md-button}
[示例与工作流](https://github.com/pifuyuini/doccheck-jsonlcheck/tree/main/examples){.md-button}
:::

### 检查文档与记录

克隆仓库后，在仓库目录运行以下命令；将文档目录、数据文件和字段名替换为自己的输入：

```bash
python3 -B -m doccheck docs --root docs
python3 -B -m jsonlcheck events.jsonl --require-field id --format json
```

也可以使用项目提供的便携 zipapp。配置项、支持的 Markdown 语法和完整用法以仓库说明为准。

---

[返回代码与项目](/code)
