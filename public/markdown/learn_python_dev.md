# Python 现代开发 · 学习 & 使用心得

> 人生苦短，我学 Python ！
> 掌握 Python 语言，享受完美人生！

---

## Python 的现代项目管理

> 得益于 AI 的火热，Python 生态（尤其是科学计算方面）得到了蓬勃发展，一大批更现代的工具诞生，这些都导致 conda 不再是一个好选择（即使对于新手来说）。

先看这些视频：
- [现代 Python 项目管理全流程梳理](https://b23.tv/D0gze5b)
- 项目化的包管理
    - [uv](https://b23.tv/ee9Tpbc)
    - [项目结构与打包](https://www.bilibili.com/video/BV12NgLzhEKx)
- 为科学计算服务，但是“现代 conda”：
    - [关于何为“现代 conda”的一个很好的介绍](https://www.bilibili.com/video/BV1Fm4ZzDEeY)

### uv

1. 安装 uv
    - 科学下载：`curl -LsSf https://astral.sh/uv/install.sh | sh` ；
    - 自动补全：`echo 'eval "$(uv generate-shell-completion zsh)"' >> ~/.zshrc` ；
    - 重载：`source ~/.zshrc` ；
    - 确认：输入`uv`，成功会出现帮助菜单。
2. 安装Python：
   - 如果你系统中已经安装了 Python（比如通过系统自带、pyenv、Homebrew 等安装的），那么 uv 自动发现并使用它。你不需要配置路径或环境变量。uv 内置了 Python 版本管理功能，而且是“即需即装”（on-demand install），你甚至可以在没有任何 Python 的系统上使用 uv 安装 Python！
   - 先查看目前已经有的：`uv python list` ；
   - `uv python install` ，这条命令会：安装最新版本的 Python，使用 Astral 提供的独立构建的 Python 发行版（python-build-standalone 项目），安装结果是只对 uv 可见的（不会覆盖或污染你系统自带的 Python）。uv 并不会把它安装的 Python 注册为全局 python 命令。
   - 2025年 7 月，推荐下载：`uv python install 3.12 3.11 3.10` 。
3. 跑一个脚本
	- `uv run script.py` ，自动管理依赖环境，无需手动创建 venv。若在项目中，默认使用项目环境（可加 --no-project 跳过）。
	- `uv run --with rich script.py` ，运行依赖脚本。
4. 搞个项目
	- 初始化：
		```bash
		# 快速创建
		uv init hello-world
		cd hello-world

		# 或者当前目录初始化
		mkdir hello-world && cd hello-world
		uv init
		```
	- 项目结构：
		```pgsql
		hello-world/
		├── .gitignore
		├── .python-version      ← 默认 Python 版本（可直接在这里修改）
		├── README.md            ← 项目简介
		├── main.py              ← 默认脚本
		├── pyproject.toml       ← 项目元数据 + 依赖声明（项目核心文件）
		└── （运行后自动生成）
			├── .venv/           ← 虚拟环境目录
			└── uv.lock          ← 精确依赖锁文件
		```
	- 即刻就可以运行：`uv run main.py` ；
	- 添加依赖：`uv add requests` ；
	- 移除依赖： `uv remove requests` ；
	- `pyproject.toml` ，依赖写在 `dependencies` 的列表里：
		```toml
		[project]
		name = "hello-world"
		version = "0.1.0"
		description = "Add your description here"
		readme = "README.md"
		dependencies = []
		```
	- 剩余内容参考前面**教程**就好。
5. 在进行项目的开发时，我又学到了一些新东西，记录如下（2025 年 9 月 14 日）：
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

如果需要卸载：  
```bash
uv cache clean
rm -r "$(uv python dir)"
rm -r "$(uv tool dir)"
```

```bash
rm ~/.local/bin/uv ~/.local/bin/uvx
```