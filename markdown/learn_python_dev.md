# Python 现代开发 · 学习 & 使用心得

> 人生苦短，我学 Python ！
> 掌握 Python 语言，享受完美人生！

---

## Python 的现代项目管理

> 得益于 AI 的火热，Python 生态（尤其是科学计算方面）得到了蓬勃发展，一大批更现代的工具诞生，这些都导致 conda 不再是一个好选择（即使对于新手来说）。

可以先看这些视频：
- [现代 Python 项目管理全流程梳理](https://b23.tv/D0gze5b)
- 项目化的包管理
    - [uv](https://b23.tv/ee9Tpbc)
    - [项目结构与打包](https://www.bilibili.com/video/BV12NgLzhEKx)
- 为科学计算服务，但是“现代 conda”：
    - [关于何为“现代 conda”的一个很好的介绍](https://www.bilibili.com/video/BV1Fm4ZzDEeY)

> 2026 年 3 月锐评：uv 才是对的！！！Conda 真不行……

### uv（[英文文档](https://docs.astral.sh/uv/) ｜ [中文文档](https://hellowac.github.io/uv-zh-cn/)）

1. 安装 uv
    - 科学下载：`curl -LsSf https://astral.sh/uv/install.sh | sh` ；
    - 自动补全：`echo 'eval "$(uv generate-shell-completion zsh)"' >> ~/.zshrc` ；
    - 重载：`source ~/.zshrc` ；
    - 确认：输入`uv`，成功会出现帮助菜单。
2. 安装Python：
   - 如果你系统中已经安装了 Python（比如通过系统自带、pyenv、Homebrew 等安装的），那么 uv 自动发现并使用它。你不需要配置路径或环境变量。uv 内置了 Python 版本管理功能，而且是“即需即装”（on-demand install），你甚至可以在没有任何 Python 的系统上使用 uv 安装 Python！
   - 查看目前已经有的：`uv python list` ；
   - `uv python install` ，这条命令会：安装最新版本的 Python，使用 Astral 提供的独立构建的 Python 发行版（python-build-standalone 项目），安装结果是只对 uv 可见的（不会覆盖或污染你系统自带的 Python）。uv 并不会把它安装的 Python 注册为全局 python 命令。
   - 推荐下载：`uv python install 3.12 3.11 3.10` 。
3. 运行脚本
	- 临时运行某份文件：
		```bash
		uv run -p [Python 版本] [脚本名称]

		# 示例
		uv run -p 3.12 ai.py

		# 打开交互界面
		uv run -p 3.12 python
		```
	- `uv run`：按需环境运行。在全局缓存中（如 `~/.cache/uv/environments`）创建环境，不污染项目目录。运行结束环境不销毁，下次运行相同依赖组合时秒开。支持 --with 参数或在脚本顶部使用 # /// script 元数据。
4. 项目管理
	- 初始化：
		```bash
		# 快速创建
		uv init [目录名]
		cd [目录名]

		# 或者当前目录初始化
		mkdir [目录名]
		cd [目录名]
		uv init -p [Python 版本] # 指定 Python 版本

		# 示例
		uv init -p 3.12
		```
	- 项目结构：
		```bash
		hello-world/
		├── .gitignore
		├── .python-version      ← Python 版本
		├── README.md            ← 项目简介
		├── main.py              ← 默认脚本
		├── pyproject.toml       ← 项目元数据 + 依赖声明（项目核心文件）
		└── （运行后自动生成）
			├── .venv/           ← 虚拟环境目录
			└── uv.lock          ← 精确依赖锁文件
		```
    - 添加依赖：
		```bash
		uv add [包名称]

		# 添加后可以直接运行脚本
		uv run [脚本名称]

		# 删除依赖
		uv remove [包名称]
		```
	- `pyproject.toml` ，依赖写在 `dependencies` 的列表里：
		```toml
		[project]
		name = "hello-world"
		version = "0.1.0"
		description = "Add your description here"
		readme = "README.md"
		dependencies = []
		```
	- 总结一下就是：
		```bash
		mkdir [dir_name] && cd [dir_name]
		uv init -p [py_ver]
		# 后续要修改 Python 版本，要先进 TOML 文件里去改 Python 版本
		uv python pin [py_ver]
		uv add [pkg_name]
		# 例子
		uv add ipykernel numpy pandas matplotlib scipy
		uv add 'stable-baseline3[extra]'
		# 同步环境
		uv sync
		```
5. 使用工具：
   - 基本用法：
		```bash
		# --dev 参数避免打包工具
		uv add [包名称] --dev

		# 删除上述形式添加的工具
		uv remove [包名称] --dev

		# 全局安装工具（给整个系统安装）
		uv tool install [包名称]

		# 查看工具列表
		uv tool list
		```
	- uvx (uv tool run)：工具即插即用。专门运行 CLI 工具（如 ruff, httpie），而非你的本地脚本。为每个工具创建专属的临时环境，运行完即走。无需手动 `pip install` 到系统，支持运行特定版本。
		```bash
		# 例子
		uvx ruff
		```
	- Ruff：全能代码检查与格式化器。基于 Rust 编写，比传统工具快 10-100 倍。一个工具替代 `Flake8`、`isort`、`Black` 等。`ruff check` 查错，`ruff format` 格式化。
6. 实用工具
   - `uv cache clean`：清理缓存条目。
   - `uv cache prune`：清理过期的缓存条目。
   - `uv cache dir`：显示 uv 缓存目录路径。
   - `uv tool dir`：显示 uv 工具目录路径。
   - `uv python dir`：显示 uv 安装的 Python 版本路径。
   - `uv self update`：将 uv 更新到最新版本。
7. 卸载  
	```bash
	uv cache clean
	rm -r "$(uv python dir)"
	rm -r "$(uv tool dir)"
	```

	```bash
	rm ~/.local/bin/uv ~/.local/bin/uvx
	```

#### 使用 uv 安装 PyTorch

如果要安装 PyTorch（以下以在我的 Windows 电脑上的一次 RL 环境配置实践为例子，参考了[官方文档](https://docs.astral.sh/uv/guides/integration/pytorch/#installing-pytorch)）：
- 完成初始化后，先改配置文件（这里我安装的是 CUDA11.8）：
	```toml
	[[tool.uv.index]]
	name = "pytorch-cu118"
	url = "https://download.pytorch.org/whl/cu118"
	explicit = true

	[tool.uv.sources]
	torch = [
	{ index = "pytorch-cu118", marker = "sys_platform == 'linux' or sys_platform == 'win32'" },
	]
	torchvision = [
	{ index = "pytorch-cu118", marker = "sys_platform == 'linux' or sys_platform == 'win32'" },
	]
	```
- 然后先 `uv sync` 同步；
- 接下来补上其它的就行了。
  ```bash
  	uv add ipykernel numpy pandas matplotlib scipy
	uv add 'stable-baseline3[extra]'

	uv sync
	```

#### 从 `requirements.txt` 安装依赖

在进行项目的开发时，我又学到了一些新东西，记录如下：
- 官方文档写到，如果您从 `requirements.txt` 文件迁移，则可以使用 `uv add -r` 从文件添加所有依赖项：
	```bash
	# Add all dependencies from requirements.txt.
	uv add -r requirements.txt 

	# 可选（如有）
	uv add -r requirements.txt -c constraints.txt
	```
- 然后用 `uv sync` 同步。
- 改变当前项目的 Python 版本：
	```bash
	# Use a specific Python version in the current directory:
	uv python pin 3.11
	# Pinned .python-version to 3.11
	```
