# uv CheatSheet

## 1) 安装 uv

**macOS / Linux**

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
# 或
wget -qO- https://astral.sh/uv/install.sh | sh
```

**Windows PowerShell**

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**包管理器**

```bash
brew install uv
winget install --id=astral-sh.uv -e
scoop install main/uv
```

官方同时提供独立安装脚本，以及 Homebrew、WinGet、Scoop 等安装方式。([Astral Docs][2])

---

## 2) 先记住这 4 种用法

### A. 做“项目”时

用 `uv init / add / run / sync / lock`。项目依赖写在 `pyproject.toml`，第一次运行项目命令时通常会生成 `.venv` 和 `uv.lock`。`uv run` 会在执行前自动检查 lockfile 和环境是否同步。([Astral Docs][3])

### B. 跑“一次性工具”时

用 `uvx ...`，它等价于 `uv tool run ...`，会在临时隔离环境里运行。([Astral Docs][4])

### C. 管 Python 版本时

用 `uv python ...`，可以安装、列出、升级、pin Python 版本；缺失 Python 时，uv 也能按需自动下载。([Astral Docs][5])

### D. 还在沿用 pip/requirements 工作流时

用 `uv pip ...`。这是 uv 的 pip 兼容接口，适合还没切到完整 uv project 工作流的项目。它直接操作虚拟环境，而不是让 uv 自动管理项目环境。([Astral Docs][6])

---

## 3) 新项目最常用的一套

### 创建项目

```bash
uv init hello-world
cd hello-world
uv run main.py
```

`uv init` 会创建基础项目文件；项目命令首次执行时会补齐环境和 lockfile。([Astral Docs][3])

### 加依赖

```bash
uv add requests
uv add "requests==2.31.0"
uv add git+https://github.com/psf/requests
uv add -r requirements.txt -c constraints.txt
```

`uv add` 会更新 `pyproject.toml`，并同步更新 lockfile 和项目环境。([Astral Docs][3])

### 删依赖

```bash
uv remove requests
```

删除项目依赖时用 `uv remove`。([Astral Docs][3])

### 运行项目内命令 / 脚本

```bash
uv run python app.py
uv run pytest
uv run -- flask run -p 3000
uv run example.py
```

`uv run` 会先保证 lockfile 和环境是最新，再执行命令。([Astral Docs][3])

### 手动同步环境

```bash
uv sync
source .venv/bin/activate   # Linux/macOS
# .venv\Scripts\activate    # Windows
```

`uv sync` 用来把环境同步到 lockfile；默认是精确同步，会移除不属于项目依赖的多余包。([Astral Docs][3])

### 升级某个包

```bash
uv lock --upgrade-package requests
```

升级指定依赖时，官方示例是对 lockfile 执行定向升级。([Astral Docs][3])

---

## 4) 开发依赖 / extras

### 开发依赖

```bash
uv add --dev pytest
uv add --dev ruff mypy
```

uv 现在把开发依赖放到 `[dependency-groups]`，`--dev` 会写入 `dev` 组。默认情况下，`dev` 组会被包含进环境。([Astral Docs][7])

### 可选依赖（extras）

```bash
uv add httpx --optional network
```

可选依赖写入 `[project.optional-dependencies]`。([Astral Docs][7])

### 同步时带上 extras / groups

```bash
uv sync --all-extras
uv sync --all-groups
# 也支持按 extra / group 选择
```

`uv sync` 支持安装所有 extras、所有 dependency groups，或按选项控制范围。([Astral Docs][1])

---

## 5) 查看 / 导出依赖

### 看依赖树

```bash
uv tree
```

`uv tree` 用于展示项目依赖树。([Astral Docs][1])

### 导出 requirements.txt / pylock / SBOM

```bash
uv export
# 常见用途：导出 requirements.txt
```

`uv export` 可以把项目 lockfile 导出为 `requirements.txt`、`pylock.toml`（PEP 751）或 CycloneDX v1.5 JSON。([Astral Docs][1])

---

## 6) 一次性运行工具：uvx / uv tool

### 临时跑一个工具

```bash
uvx ruff check
uvx pycowsay "hello"
uvx --from httpie http
uvx ruff@latest check
uvx --from "ruff==0.3.0" ruff check
```

`uvx` 是 `uv tool run` 的别名，默认在临时隔离环境里运行；若命令名和包名不同，或需要复杂版本约束，就用 `--from`。([Astral Docs][4])

### 安装成长期可用工具

```bash
uv tool install ruff
uv tool list
uv tool upgrade
uv tool uninstall ruff
uv tool update-shell
```

常驻工具用 `uv tool install`；工具管理子命令包括 `install / upgrade / list / uninstall / update-shell`。([Astral Docs][4])

### 什么时候用 `uvx`，什么时候用 `uv run`

* **独立工具**：`uvx ruff check`
* **依赖项目环境的工具**（比如 `pytest`、`mypy` 需要看到当前项目依赖/安装状态）：优先 `uv run pytest`

官方明确说明：若工具需要你的项目一起参与运行，通常应使用 `uv run`，而不是隔离环境里的 `uvx`。([Astral Docs][4])

---

## 7) 跑单文件脚本

### 直接跑脚本

```bash
uv run script.py
uv run --python 3.10 script.py
```

uv 支持直接运行脚本，并可为单次执行指定 Python 版本。([Astral Docs][8])

### 给脚本加 shebang

```python
#!/usr/bin/env -S uv run --script

print("Hello, world!")
```

然后：

```bash
chmod +x greet
./greet
```

这是官方推荐的可执行脚本方式。([Astral Docs][8])

### 锁定脚本依赖

```bash
uv lock --script example.py
```

PEP 723 脚本可以单独生成旁边的 `.lock` 文件。([Astral Docs][8])

---

## 8) 管 Python 版本

### 安装 / 列出 / 升级 Python

```bash
uv python install
uv python install 3.12
uv python install 3.11 3.12
uv python list
uv python upgrade 3.12
uv python upgrade
```

uv 可安装最新 Python、指定版本、多版本，也支持升级已安装的 uv-managed Python。([Astral Docs][5])

### pin 项目 Python 版本

```bash
uv python pin 3.12
uv python pin
```

`uv python pin` 会把版本写入 `.python-version`；不带参数时会显示当前 pin。([Astral Docs][1])

### 只用系统 Python

```bash
uv run --no-managed-python ...
```

官方说明支持 `--no-managed-python`，强制不用 uv 管理的 Python。([Astral Docs][5])

---

## 9) 还在用 pip / requirements 时

### 创建虚拟环境

```bash
uv venv
```

`uv venv` 用于创建虚拟环境；如果机器上没有合适 Python，uv 可以按需下载。([Astral Docs][1])

### pip 兼容工作流

```bash
uv pip install -r requirements.txt
uv pip compile requirements.in -o requirements.txt
uv pip sync requirements.txt
uv pip list
uv pip freeze
uv pip tree
uv pip check
```

`uv pip compile` 用来把输入依赖解析成锁定输出；`uv pip sync` 会把环境严格同步到文件内容，并移除文件中未列出的包；想保留额外包则用 `uv pip install`。([Astral Docs][1])

---

## 10) 打包与发布

### 构建分发文件

```bash
uv build
ls dist/
```

`uv build` 会构建源码包和 wheel，默认输出到 `dist/`。([Astral Docs][3])

### 发布

```bash
uv publish
```

`uv publish` 是官方 CLI 的一级命令之一，用于上传构建产物到包索引。([Astral Docs][1])

---

## 11) 很实用的几个选项

```bash
uv run --locked ...
uv run --frozen ...
uv run --no-sync ...
uv run --with rich script.py
```

* `--locked`：lockfile 过期就报错，不自动更新。
* `--frozen`：直接使用现有 lockfile，不检查是否最新。
* `--no-sync`：不检查环境是否与 lockfile 同步。
* `--with`：给本次运行临时附加依赖。
  这些都是官方命令参考里的常用控制项。([Astral Docs][9])

---

## 12) 最常见的“怎么选”

### 场景 1：我要新建项目

```bash
uv init myproj
cd myproj
uv add requests
uv add --dev pytest ruff
uv run pytest
```

这是 uv 最推荐、最顺手的主工作流。([Astral Docs][3])

### 场景 2：我只想临时跑个工具

```bash
uvx ruff check
uvx --from httpie http
```

用 `uvx`。([Astral Docs][4])

### 场景 3：我还在维护 requirements.txt 项目

```bash
uv venv
uv pip compile requirements.in -o requirements.txt
uv pip sync requirements.txt
```

用 `uv pip` 兼容接口。([Astral Docs][1])

### 场景 4：我只想跑一个脚本，不想手动建虚拟环境

```bash
uv run script.py
```

直接用 `uv run`。([Astral Docs][8])

---

## 13) 一句话避坑

* **项目依赖别手动 `uv pip install` 到项目 `.venv` 里**；官方更推荐项目里用 `uv add`，一次性需求用 `uv run --with` 或 `uvx`。([Astral Docs][10])
* **`uvx` 是隔离环境**，需要项目上下文时改用 `uv run`。([Astral Docs][4])
* **`uv sync` 默认是精确同步**，会清理多余包；而 `uv pip sync` 也会移除 requirements 文件之外的包。([Astral Docs][1])
* **`uv pip` 不是完整“项目模式”**，它更像 pip/pip-tools 的高速替代接口。([Astral Docs][6])

---

## 14) 极简版速记

```bash
# 安装
brew install uv

# 新项目
uv init demo
cd demo

# 依赖
uv add requests
uv add --dev pytest ruff
uv remove requests

# 运行
uv run python main.py
uv run pytest
uv sync

# 工具
uvx ruff check
uv tool install ruff
uv tool list

# Python
uv python install 3.12
uv python list
uv python pin 3.12

# pip 兼容
uv venv
uv pip compile requirements.in -o requirements.txt
uv pip sync requirements.txt

# 导出 / 查看
uv tree
uv export

# 构建 / 发布
uv build
uv publish
```