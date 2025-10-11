# 配置云服务器的个人日志式笔记

## 重要提醒

**目前服务器的配置已经有点复杂了，释放这个服务器之前，务必把以下文件下载到本地：**
- `.zshrc`

## 0 云服务器基本信息

以下是我选用的，仅供参考：
- 厂商：**腾讯云**学生优惠 -- 轻量应用服务器 -- 3个月50元；
- 操作系统：Linux-Ubuntu-22.04 TLS；
- 配置：2vCPU4Gibs + 5M + 60G；

上述服务器在 2025 年 8 月过期，续费一个月要花 70 元；所以，我新换了某 G 云的，配置基本与上相同，目前是 3 个月 + 300 美元试用阶段，待后续更新。

注意接下来是我自己推荐的配置步骤（特别提醒：**Windows系统我没试过，我用的本地操作系统是macOS**）。

## 1 连接与登陆

### `.ssh` 文件夹

`.ssh` 是用户主目录下用于存放 SSH 相关配置和密钥的文件夹。常见的文件包括：
1. `id_rsa`（私钥）
   - 这是用户生成的一对 SSH 密钥中的**私钥**部分。
   - 它用于认证客户端身份，与服务器上的公钥匹配以建立安全连接。
   - **此文件必须严格保密**，一旦泄露，他人可能无需密码即可登录服务器。
2. `id_rsa.pub`（公钥）
   - 是与 `id_rsa` 配对的**公钥**。
   - 此文件可以安全地分发和上传到服务器，通常被加入到服务器端的 `~/.ssh/authorized_keys` 文件中，用于实现基于密钥的免密码登录。
3. `known_hosts`
   - 用于记录客户端曾经连接过的服务器的主机公钥指纹。
   - 当用户首次连接某个服务器时，SSH 会提示是否信任该主机，接受后该主机的信息将被记录在此文件中。
   - SSH 在后续连接时会比对该主机指纹是否一致，以防止中间人攻击。
4. `known_hosts.old`
   - 是 `known_hosts` 文件的备份版本。
   - 当 `known_hosts` 文件发生更改时，系统会自动保留旧版本以便回滚。

>如需配置免密登录，需要将本机的公钥 `id_rsa.pub` 内容追加到远程服务器用户的 `~/.ssh/authorized_keys` 文件中，并保证权限设置正确。

### ssh配置：

1. 云主机端登陆root权限创建用户 `sudo adduser [username]`；
2. 假设你已经在本地生成了 `~/.ssh/id_rsa.pub`，并把它内容复制了出来，现在登录服务器，运行：
	```bash
	sudo mkdir -p /home/[username]/.ssh
	sudo nano /home/[username]/.ssh/authorized_keys
	```
	将你本地 `id_rsa.pub` 的内容粘贴进去（单行，不要断行），然后保存退出。
3. 设置权限：
	```bash
	sudo chown -R [username]:[username] /home/[username]/.ssh
	sudo chmod 700 /home/[username]/.ssh
	sudo chmod 600 /home/[username]/.ssh/authorized_keys
	```
4. 赋予 sudo 权限（允许该用户使用 sudo）
	```bash
	sudo usermod -aG sudo [username]
	```
5. 现在你可以从本地使用 SSH 登录新用户。

2025年8月26日：上述步骤对腾讯云是必要的，对某 G 云则可直接在控制台去设置，也许方便一些？

> 关于其它登录方式：利用 VSCode 直接 Remote SSH 远程连接是一个很便捷的方案，很简单，此处就不赘述了。

## 2 （对于国内服务器）配置代理

> 为什么？-- 我们做一个情景猜想，你也不想你的国内云主机访问GitHub10次失败了9次吧？？

**免责声明：以下是存粹的技术性交流，探讨技术上的可行性，不提供任何实践指导，本指南不为此承担任何法律责任，一切后果自负。**

**相关法规：** 请参考[这个](https://zhuanlan.zhihu.com/p/676451643)和[这个](https://zhuanlan.zhihu.com/p/495877133)以及提到的相关法律官方文件。

**再次强调，使用VPN在国际互联网制作、复制、查阅和传播下列信息的，属于是违法行为：**
1. 煽动抗拒、破坏宪法和法律、行政法规实施，或者其他违反宪法和法律、行政法规的；
2. 煽动颠覆国家政权、分裂国家、破坏祖国统一和损害国家机关信誉的；
3. 煽动民族仇恨、民族歧视、破坏民族团结，或者捏造、歪曲事实，散布谣言，扰乱社会秩序的；
4. 宣扬封建迷信、淫秽、色情、赌博、暴力、凶杀、恐怖，教唆犯罪的；
5. 公然侮辱他人或者捏造事实诽谤他人的。

具体方法可以参考[这一份文档](https://ry.huaji.store/2020/08/Linux-magic-network/)其中的**V2RayA**方案，具体流程可以参考[官方文档](https://v2raya.org/docs/prologue/installation/debian/)。

注意，这份文档在**2025年7月14日**在技术上是具有可行性的。

分享一些技术细节上的猜想：
- 安装：方案一（会有一点慢，耐心）。
- 启动：打开**快速上手**，注意要先让本地接上服务器的2017端口，参考代码是 `ssh -L 2017:localhost:2017 [username]@[Public IP]` 。
- 导入代理的配置：略（再次强调这段文字只是技术上的探讨，一切行动请注意**合法合规**）。
- 选择节点：可用http测速，多选择几个延迟低的节点。
- 启用代理：具体参考文档，透明模式的分支模式一在技术上具备可行性。
- 运行。

祝你一切顺利，有问题多看参考文档。

*2025年8月26日：如果你使用的也是某 G 云这样的海外服务器，可完全忽略这一步骤。*

## 3 zsh + oh-my-zsh

> 为什么？-- 其实是这样的，根据我的经验，我这样的萌新+外行，是需要**代码补全+高亮+清晰的报错**的；除此以外，你想要更帅的装逼也可以用这套。

安利：[Oh My Zsh!](https://ohmyz.sh/) 和 [Powerlevel10k](https://github.com/romkatv/powerlevel10k?tab=readme-ov-file#oh-my-zsh)。当然，你也可以在B站上搜索看看。

- 安装zsh： `sudo apt install -y zsh` ；
- 检查： `zsh --version` ；
- 安装omz： `sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"` ；
- 安装过程中它会询问你是否将 zsh 设为默认 shell：选 Yes（y）即可。如果你不小心跳过了，下面可以手动设置；
- 若需手动设置： `chsh -s $(which zsh)` ；
- 下载插件：
	```bash
	# 安装 zsh-autosuggestions
	git clone https://github.com/zsh-users/zsh-autosuggestions ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions
	# 安装 zsh-syntax-highlighting
	git clone https://github.com/zsh-users/zsh-syntax-highlighting ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting
	```
- 下载主题：  `git clone --depth=1 https://github.com/romkatv/powerlevel10k.git "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k"` ；
- 配置： `vim ~/.zshrc` （有一定语法门槛，这没办法，我默认你知道最基本的vim操作，不会的问AI学一学，十分钟就能搞定），然后把`plugins=(git)`改为`plugins=(git zsh-autosuggestions zsh-syntax-highlighting)`，把`ZSH_THEME="robbyrussell"`改为`ZSH_THEME="powerlevel10k/powerlevel10k"` ；
- 重新加载配置： `source ~/.zshrc` （很重要别忘了）；
- 然后你可以按喜好一步步根据引导配置powerlevel10k主题了。
- 题外话：你的本地终端有配色方案和字体，我参考的是[这一份教程](https://www.bilibili.com/video/BV1WJ4m1w7ms)。然后你需要调一下补全的颜色，我采用的是流萤的火焰的颜色 `ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=#4df8e8'` ，直接在 `~/.zshrc` 中多加这一行就可以了；当然你可以自己选择你的偏好。
- 到这里zsh + oh-my-zsh就配置好了。

到2025年8月26日，上述步骤是完全可用且高效的。不过，要是第一步有一些问题，先执行`sudo apt-get update`就行。

## 4 更现代的 Python 包管理？（20251008 更新）

> 为什么？ -- 呃，对我来说因为我写这篇文章时我的主编程语言时Python，其次我当时还是学物理的，所以用conda很合理对吧？？

> 并非合理，得益于 AI 的火热，Python 生态（尤其是科学计算方面）得到了蓬勃发展，一大批更现代的工具诞生，这些都导致 conda 不再是一个好选择（即使对于新手来说）。

总之，我们应当考虑放弃 conda ，尝试以下新工具：
- uv （已尝试，见下，此处略）：纯 Python 项目；
- conda 系：旧 conda 新用 miniforge + mamba ，混合包管理；
- pixi （尝试中）：新 conda，混合包管理。

更详细的笔记我会放在 Python 笔记中，以下只会列出我的 conda 系安装记录。

以下是我在2025年10月8日给我的macOS安装 miniforge的记录，供 Unix 类系统参考：
1. 首先前往[官方仓库](https://github.com/conda-forge/miniforge)或[官网](https://conda-forge.org/download/)按指引下载。
2. 下载完成后进入安装脚本（是个 `.sh` 文件），第一个要注意的是安装路径，如果不想要默认路径，直接输入新路径再 `ENTER` 就好。
3. 然后要注意的是初始化和激活，先输入 `yes` ，然后 `conda config --set auto_activate_base false` 就行（官方仓库有写）。

总之，先看仓库的指引，不懂的就问 AI ，懂之前慎重别操作就行（虽然操作了也不会出什么大问题）。

以下是我在2025年8月26日给我的新服务的配置流程（仅作记录，不再推荐和参考）：
1. 先确保系统是最新的：`sudo apt update && sudo apt upgrade -y`；
2. 对于**Linux x86_64**：`wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh`；
3. 安装运行脚本：`bash Miniconda3-latest-Linux-x86_64.sh`，接下来需要按 `Enter` 查看许可协议，然后输入 `yes` 接受，然后输入安装路径（推荐默认 `~/miniconda3`），最后要注意选择是否在 `.bashrc` 或 `.zshrc` 中自动初始化，推荐选 `yes`，具体是这样的：
	```bash
	Do you wish to update your shell profile to automatically initialize conda?
	This will activate conda on startup and change the command prompt when activated.
	If you'd prefer that conda's base environment not be activated on startup,
	run the following command when conda is activated:

	conda config --set auto_activate_base false

	You can undo this by running conda init --reverse $SHELL? [yes|no]
	```
	这是 Miniconda 安装脚本在问你要不要修改你的 shell 配置文件（`.zshrc`），让 conda 自动初始化。具体意思： `yes` 安装程序会往 `~/.zshrc` 里加几行初始化代码，这样你一登录 zsh，conda 就能用（并且默认进入 base 环境，除非你关掉）。这是大多数人选的。 `no` 不修改配置文件。你之后用 conda 就得手动运行一次初始化，比如`~/miniconda3/bin/conda init zsh`和
	`source ~/.zshrc`。**如果你不想每次登录都自动进入 base 环境，可以先选 `yes` ，然后再执行 `conda config --set auto_activate_base false` 。**
4. `conda --version` ：能看到版本号说明成功。

## 5 neovim + lazyvim （选）

为什么？ -- 一方面，虽然后续我个人更推荐用vscode来写代码和管理文件，但是你总免不了需要用终端做这方面的一些工作（尤其是与AI配合时），这时候neovim还是比vim好用一些的；另一方面，这玩意实在是帅。

这里就不安利了，B站上搜一下吧，喜欢就搞。

- 首先下载Homebrew： `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` ；
- 然后安装和配置路径：
	```bash
	echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> ~/.zshrc
	eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
	```
- 确认： `brew --version` ；
- 下载neovim： `brew install neovim` ；
- 确认： `nvim --version` ；
- 清空默认配置（报错就表明无默认配置，继续就好）：
	```bash
	mv ~/.config/nvim ~/.config/nvim.backup
	mv ~/.local/share/nvim ~/.local/share/nvim.backup
	mv ~/.cache/nvim ~/.cache/nvim.backup
	```
- 下载lazyvim： `git clone https://github.com/LazyVim/starter ~/.config/nvim` ；
- 进入目录： `cd ~/.config/nvim` ；
- 初始化： `nvim` ，耐心等它搞完后再退出；
- 最后：网上找一些教程来爽用一波。

## 6 uv （推荐）

*2025 年 7 月新增*

它是一个现代的 Python 包管理，详见[官方文档](https://docs.astral.sh/uv/)。

关于为什么要用 **uv** ，我觉得[这个视频](https://b23.tv/D0gze5b)讲得很好。而这个 UP 主也有关于 uv 的[详细教程](https://b23.tv/ee9Tpbc)，比下面这个我的写得好多了。

以下简要记录我的使用笔记：

### 安装

科学下载：`curl -LsSf https://astral.sh/uv/install.sh | sh` ；

自动补全：`echo 'eval "$(uv generate-shell-completion zsh)"' >> ~/.zshrc` ；

重载：`source ~/.zshrc` ；

卸载：  
```bash
uv cache clean
rm -r "$(uv python dir)"
rm -r "$(uv tool dir)"
```

```bash
rm ~/.local/bin/uv ~/.local/bin/uvx
```

### 确认

输入`uv`，成功会出现帮助菜单。

### 快速开始

1. 安装Python：
   - 如果你系统中已经安装了 Python（比如通过系统自带、pyenv、Homebrew 等安装的），那么 uv 自动发现并使用它。你不需要配置路径或环境变量。uv 内置了 Python 版本管理功能，而且是“即需即装”（on-demand install），你甚至可以在没有任何 Python 的系统上使用 uv 安装 Python！
   - 先查看目前已经有的：`uv python list` ；
   - `uv python install` ，这条命令会：安装最新版本的 Python，使用 Astral 提供的独立构建的 Python 发行版（python-build-standalone 项目），安装结果是只对 uv 可见的（不会覆盖或污染你系统自带的 Python）。uv 并不会把它安装的 Python 注册为全局 python 命令。
   - 2025年 7 月，推荐下载：`uv python install 3.12 3.11 3.10` 。

2. 跑一个脚本
	- `uv run script.py` ，自动管理依赖环境，无需手动创建 venv。若在项目中，默认使用项目环境（可加 --no-project 跳过）。
	- `uv run --with rich script.py` ，运行依赖脚本。

3. 搞个项目
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

4. 在进行项目的开发时，我又学到了一些新东西，记录如下（2025 年 9 月 14 日）：
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
更多详细的内容我会整理在我的 Python 笔记中，下略。

## 7 Web 相关（也许）

由于新的某 G 云的服务上没有 `Node.js` 之类的，所以我进行了相关的安装，记录如下：
1. 安装 nvm： `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash` ；
2. `source ~/.zshrc` ；
3. 使用 nvm 来安装最新版的 LTS (长期支持版) Node.js。这是最稳定和推荐的版本： `nvm install --lts` ；
4. 验证安装是否成功： `node -v` 和 `npm -v`。
5. （额外）调试模式：（1）`npm install`；（2）`npm run dev`，会给到 `http://localhost:5173/`；（3）转发到本地 `ssh -L 5173:localhost:5173 [username]@[ip address]`。

## 8 `eza` 综合使用指南（试用）

`eza` 是一个用 Rust 编写的现代化 `ls` 命令替代品。它的核心设计哲学是：提供比 ls 更多的功能和更友好的用户体验，并且默认配置就足够出色。

- 多彩高亮：根据文件类型和权限用不同颜色展示，一目了然。
- Git 感知：直接在文件列表中显示文件的 Git 状态。
- 图标支持：如果使用 Nerd Font，能为文件和目录显示精美图标。
- 树状视图：内置了比 `tree` 更强大的 `tree` 功能。

以下记录我的使用指南：

`eza` 的大部分基础参数都与 `ls` 兼容，你可以无缝切换。

  * **基本列表**

    ```bash
    # ls -> eza
    eza 
    ```

    你会发现 `eza` 默认采用紧凑的网格（Grid）布局。

  * **长列表 (Long View)**

    ```bash
    # ls -l -> eza -l
    eza -l 
    ```

    这是最常用的命令之一。它会列出权限、所有者、大小、修改日期和文件名。

  * **显示隐藏文件 (All)**

    ```bash
    # ls -a -> eza -a
    eza -a

    # ls -la -> eza -la (最常用的组合之一)
    eza -la 
    ```

  * **递归列出 (Recursive)**

    ```bash
    # ls -R -> eza -R
    eza -R 
    ```

    这会递归地列出所有子目录的内容，但通常我们会用 `--tree` 来获得更好的效果。

  * **基本树状图**

    ```bash
    eza --tree
    ```

  * **控制深度 (`-L` 或 `--level`)**

    ```bash
    # 只展示 2 层目录结构
    eza --tree -L 2
    ```

  * **树状图 + 详细信息**
    `--tree` 可以和 `-l` 等参数完美结合，这是 `tree` 命令本身不容易做到的。

    ```bash
    # 以树状结构展示所有文件（包括隐藏）的详细信息和 Git 状态
    eza --tree -al --git --icons
    ```

在任何 Git 仓库中，`--git` 参数都会在文件状态列（第一列）显示两位指示符：

  * **第一位代表索引（Staged）状态**:
      * `N`: new (新文件)
      * `M`: modified (已修改)
      * `D`: deleted (已删除)
      * `R`: renamed (已重命名)
      * `T`: type-change (类型改变)
  * **第二位代表工作区（Unstaged）状态**:
      * `M`: modified
      * `D`: deleted
      * `I`: ignored (被忽略)
      * `?`: untracked (未跟踪)

<!-- end list -->

```bash
# 在项目根目录下执行，效果拔群
eza -l --git
```

`eza` 提供了非常强大的排序功能。

  * **按文件大小排序** (大文件在前)

    ```bash
    # -s 是 --sort 的缩写
    eza -l -s size
    ```

  * **按修改时间排序** (最新的在前)

    ```bash
    # 这是排查问题、看日志时非常有用的命令
    eza -l -s modified
    ```

  * **其他常用排序字段**:

      * `name`: 文件名 (默认)
      * `extension`: 文件扩展名
      * `created`: 创建时间
      * `inode`: Inode 号
      * 使用 `--reverse` (或 `-r`) 来反转排序。例如，按文件大小从小到大排：`eza -l -s size -r`

  * **使用 `.gitignore` 文件进行过滤**
    默认情况下，`eza` **不会** 自动使用 `.gitignore` 的规则。但你可以开启这个功能：

    ```bash
    # 自动忽略 .gitignore 中定义的文件
    eza --git-ignore
    ```

  * **临时忽略某些文件 (Glob Patterns)**

    ```bash
    # 忽略所有的 .log 文件
    eza --ignore-glob="*.log"

    # 忽略多种模式，用 | 分隔
    eza -l --ignore-glob="*.log|*.tmp|node_modules"
    ```

  * **显示列标题 (`-h` 或 `--header`)**

    ```bash
    eza -lh
    ```

    这会在长列表的每一列上方显示标题（Permissions, Size, User, Date Modified 等），可读性更高。

  * **目录优先 (`--group-directories-first`)**
    让所有目录都显示在文件前面。

    ```bash
    eza -l --group-directories-first
    ```

  * **时间格式 (`--time-style`)**
    可以改变时间的显示格式。

      * `default`: 默认风格
      * `iso`: `YYYY-MM-DD HH:MM:SS`
      * `long-iso`: 带时区
      * `full-iso`: 带毫秒和时区

    <!-- end list -->

    ```bash
    eza -l --time-style=iso
    ```

为了把 `eza` 融入日常工作流，最好的方式就是设置一套强大的别名。 以下可以直接复制到 `~/.bashrc` 或 `~/.zshrc` 文件中。

```bash
#-------------------------------------------------
# Eza Aliases - The Modern 'ls'
#-------------------------------------------------

# 默认用 eza 替代 ls，开启图标和 git 集成
alias ls='eza --icons --git'

# 长列表，带头部信息，目录优先
alias ll='eza -l -h --icons --git --group-directories-first'

# 长列表，显示所有文件
alias la='eza -la -h --icons --git --group-directories-first'

# 仅列出目录
alias lsd='eza -lD'

# 排序别名
alias lss='eza -l -h --icons --git --group-directories-first --sort size'      # 按大小排序 (Sort by Size)
alias lsm='eza -l -h --icons --git --group-directories-first --sort modified'  # 按修改时间排序 (Sort by Modified)

# Tree 别名
alias tree='eza --tree -L 2 --icons'        # 默认看 2 层
alias treea='eza --tree -a -L 2 --icons'    # 看 2 层，包含隐藏文件
alias tree3='eza --tree -L 3 --icons'       # 看 3 层
alias tree4='eza --tree -L 4 --icons'       # 看 4 层
```

记得修改后执行 `source ~/.bashrc` 或重启终端。

## 9 运维入门

> 前情提要：25 年 9 月，我野心膨胀，妄图拿我的某 G 云服务器跑微分方程的时间前向仿真，遂安装 Julia ；成功在其编译包的时候把 CPU 搞到了 200% ，卡死两次，崩溃数次；痛定思痛，花了一上午学了一点服务器的运行维护和安全使用，记录于此：

核心思想：由于只有我一个人用，也不对外开放，所以我更关注资源监控CPU、内存、磁盘 I/O、网络带宽是否存在异常峰值、长期瓶颈；服务/进程监控关键服务是否存活（如 Nginx、MySQL、Docker 等），进程资源消耗是否正常；异常触发条件：CPU > 90% 持续 5 分钟，磁盘使用率 > 80%。

- `safe_clean.sh` ：用于快速清理 Disk
  ```bash
  #!/bin/bash
  set -e

  echo ">>> 清理 apt 缓存"
  sudo apt clean
  sudo apt autoremove --purge -y

  echo ">>> 清理 systemd 日志"
  sudo journalctl --vacuum-time=7d

  echo ">>> 清理临时文件"
  sudo rm -rf /tmp/* /var/tmp/*

  echo ">>> 清理旧日志文件"
  sudo rm -f /var/log/*.gz /var/log/*.[0-9]

  if command -v docker &>/dev/null; then
    echo ">>> 清理 Docker 垃圾"
    docker system prune -af --volumes
  fi

  echo ">>> 清理旧内核"
  sudo apt autoremove --purge -y

  echo ">>> 完成！"
  df -h
  ```

- `I_am_watching_you.sh` ：关键指标的瞬时查看
  ```bash
  #!/usr/bin/env bash
  # I_am_watching_you.sh
  # Lightweight one-shot health snapshot for a Linux server.
  # - No hard deps (best-effort). Uses /proc for CPU/MEM/NET; falls back gracefully.
  # - Measures deltas over ~1s for CPU% and NET throughput.
  # - Works without root. Add sudo for more detail where noted.

  set -u
  LANG=C

  hr() { printf '%*s\n' "${COLUMNS:-80}" '' | tr ' ' '-'; }
  sec() { echo; hr; echo ">>> $1"; hr; }

  has() { command -v "$1" >/dev/null 2>&1; }

  # ---------- CPU % (1s delta using /proc/stat) ----------
  cpu_read() {
    # echo: user nice system idle iowait irq softirq steal guest guest_nice
    awk '/^cpu /{print $2,$3,$4,$5,$6,$7,$8,$9,$10,$11}' /proc/stat
  }
  cpu_calc() {
    # args: pre_line post_line
    read -r u1 n1 s1 i1 w1 iqr1 sir1 st1 g1 gn1 <<<"$1"
    read -r u2 n2 s2 i2 w2 iqr2 sir2 st2 g2 gn2 <<<"$2"
    local pre=$((u1+n1+s1+i1+w1+iqr1+sir1+st1+g1+gn1))
    local post=$((u2+n2+s2+i2+w2+iqr2+sir2+st2+g2+gn2))
    local diff=$((post-pre))
    local idle=$((i2-i1))
    local iow=$((w2-w1))
    local usr=$((u2-u1))
    local sys=$((s2-s1))
    local nic=$((n2-n1))
    local irq=$((iqr2-iqr1+sir2-sir1))
    local stl=$((st2-st1))
    # percentages
    pct() { awk -v a="$1" -v b="$2" 'BEGIN{ if (b<=0) {print 0} else {printf "%.1f", (a*100.0)/b} }'; }
    CPU_TOTAL=$(pct "$((diff-idle))" "$diff")
    CPU_USER=$(pct "$usr" "$diff")
    CPU_NICE=$(pct "$nic" "$diff")
    CPU_SYS=$(pct "$sys" "$diff")
    CPU_IOWAIT=$(pct "$iow" "$diff")
    CPU_IRQ=$(pct "$irq" "$diff")
    CPU_STEAL=$(pct "$stl" "$diff")
  }

  PRE=$(cpu_read); sleep 1; POST=$(cpu_read); cpu_calc "$PRE" "$POST"

  # ---------- MEM ----------
  mem_val() { awk -v k="$1" '$1==k {print $2}' /proc/meminfo; } # in kB
  MEM_TOTAL_KB=$(mem_val MemTotal:)
  MEM_AVAIL_KB=$(mem_val MemAvailable:)
  MEM_FREE_KB=$(mem_val MemFree:)
  SWAP_TOTAL_KB=$(mem_val SwapTotal:)
  SWAP_FREE_KB=$(mem_val SwapFree:)
  kb_to_gib() { awk -v k="$1" 'BEGIN{printf "%.2f", k/1024/1024}'; }
  pct() { awk -v used="$1" -v total="$2" 'BEGIN{ if (total<=0) print "0.0"; else printf "%.1f", (used*100.0)/total }'; }

  MEM_USED_KB=$((MEM_TOTAL_KB-MEM_AVAIL_KB))
  MEM_USED_PCT=$(pct "$MEM_USED_KB" "$MEM_TOTAL_KB")
  SWAP_USED_KB=$((SWAP_TOTAL_KB-SWAP_FREE_KB))
  SWAP_USED_PCT=$(pct "$SWAP_USED_KB" "$SWAP_TOTAL_KB")

  # ---------- LOAD & UPTIME ----------
  LOAD=$(awk '{printf "1m=%.2f 5m=%.2f 15m=%.2f", $1,$2,$3}' /proc/loadavg)
  UPTIME_HUMAN=$(uptime -p 2>/dev/null || true)
  LAST_REBOOT=$(last reboot -n 1 2>/dev/null | head -n1 || true)

  # ---------- NET (1s delta on /proc/net/dev) ----------
  read_net() {
    # output: if rx_bytes tx_bytes
    awk -F'[: ]+' '/:/{iface=$2;rx=$3;tx=$(NF-1); if (iface!="lo") print iface,rx,tx}' /proc/net/dev
  }
  declare -A RX1 TX1 RX2 TX2
  while read -r ifc rx tx; do RX1["$ifc"]="$rx"; TX1["$ifc"]="$tx"; done < <(read_net)
  sleep 1
  while read -r ifc rx tx; do RX2["$ifc"]="$rx"; TX2["$ifc"]="$tx"; done < <(read_net)

  net_table() {
    printf "%-12s %12s %12s\n" "IFACE" "RX(Mbps)" "TX(Mbps)"
    for i in "${!RX2[@]}"; do
      r1=${RX1["$i"]:-0}; r2=${RX2["$i"]:-0}
      t1=${TX1["$i"]:-0}; t2=${TX2["$i"]:-0}
      dr=$((r2-r1)); dt=$((t2-t1))
      # bytes/s -> Mbit/s
      awk -v ifc="$i" -v dr="$dr" -v dt="$dt" 'BEGIN{
        rx=dr*8/1e6; tx=dt*8/1e6;
        printf "%-12s %12.2f %12.2f\n", ifc, rx, tx
      }'
    done | sort
  }

  # ---------- FS usage ----------
  DF_TABLE=$(df -h --output=source,size,used,avail,pcent,target 2>/dev/null | grep -vE 'tmpfs|overlay|udev|shm' || true)
  INODE_TABLE=$(df -i --output=source,itotal,iused,iavail,ipcent,target 2>/dev/null | grep -vE 'tmpfs|overlay|udev|shm' || true)

  # ---------- TOP processes ----------
  TOP_CPU=$(ps -eo pid,ppid,comm,%cpu,%mem --sort=-%cpu | head -n 11)
  TOP_MEM=$(ps -eo pid,ppid,comm,%mem,%cpu --sort=-%mem | head -n 11)

  # ---------- LISTENING PORTS ----------
  if has ss; then
    PORTS=$(ss -tulnp 2>/dev/null | head -n 40 || true)
  else
    PORTS=$(netstat -tulnp 2>/dev/null | head -n 40 || true)
  fi

  # ---------- Systemd failed ----------
  FAILED=$(systemctl --failed --no-legend --no-pager 2>/dev/null || true)

  # ---------- Docker (optional) ----------
  if has docker; then
    DOCKER_SUMMARY=$(docker system df 2>/dev/null || true)
    DOCKER_TOP=$(docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Image}}\t{{.Ports}}' 2>/dev/null | head -n 15 || true)
  else
    DOCKER_SUMMARY="(docker not found)"
    DOCKER_TOP="(docker not found)"
  fi

  # ---------- NVIDIA GPU (optional) ----------
  if has nvidia-smi; then
    GPU=$(
      nvidia-smi --query-gpu=name,driver_version,temperature.gpu,utilization.gpu,memory.used,memory.total --format=csv,noheader 2>/dev/null \
      | awk -F, 'BEGIN{printf "%-25s %-8s %6s %8s %14s\n","GPU","Driver","Temp","Util","Mem(used/total)"}
                {gsub(/^ +| +$/,""); printf "%-25s %-8s %5sC %7s%% %6sMiB/%-6sMiB\n",$1,$2,$3,$4,$5,$6}'
    )
  else
    GPU="(nvidia-smi not found)"
  fi

  # ---------- Sensors (optional) ----------
  if has sensors; then
    SENS=$(sensors 2>/dev/null | head -n 20 || true)
  else
    SENS="(lm-sensors not found)"
  fi

  # ---------- Users & dmesg errors ----------
  USERS=$(who 2>/dev/null || true)
  DMESG_ERR=$(dmesg --ctime --level=err 2>/dev/null | tail -n 5 || true)

  # ===================== OUTPUT =====================
  sec "Host"
  echo "Hostname : $(hostname)"
  echo "Kernel   : $(uname -srmo)"
  echo "Uptime   : ${UPTIME_HUMAN:-N/A}"
  echo "Last boot: ${LAST_REBOOT:-N/A}"
  echo "Load     : ${LOAD}"

  sec "CPU (Δ1s)"
  printf "Total=%.1f%%  user=%.1f%%  nice=%.1f%%  sys=%.1f%%  iowait=%.1f%%  irq=%.1f%%  steal=%.1f%%\n" \
    "$CPU_TOTAL" "$CPU_USER" "$CPU_NICE" "$CPU_SYS" "$CPU_IOWAIT" "$CPU_IRQ" "$CPU_STEAL"

  sec "Memory"
  printf "RAM  : used %sGiB / total %sGiB  (%.1f%%)\n" \
    "$(kb_to_gib "$MEM_USED_KB")" "$(kb_to_gib "$MEM_TOTAL_KB")" "$MEM_USED_PCT"
  printf "SWAP : used %sGiB / total %sGiB  (%.1f%%)\n" \
    "$(kb_to_gib "$SWAP_USED_KB")" "$(kb_to_gib "$SWAP_TOTAL_KB")" "$SWAP_USED_PCT"

  sec "Network (Δ1s)"
  net_table

  sec "Filesystem usage"
  echo "$DF_TABLE"

  sec "Inodes usage"
  echo "$INODE_TABLE"

  sec "Top by CPU"
  echo "$TOP_CPU"

  sec "Top by MEM"
  echo "$TOP_MEM"

  sec "Listening ports (first 40)"
  echo "$PORTS"

  sec "Systemd failed units"
  echo "${FAILED:-None}"

  sec "Docker summary"
  echo "$DOCKER_SUMMARY"
  echo
  echo "Docker top (first 15):"
  echo "$DOCKER_TOP"

  sec "GPU"
  echo "$GPU"

  sec "Sensors (first 20 lines)"
  echo "$SENS"

  sec "Logged-in users"
  echo "${USERS:-None}"

  sec "Latest kernel errors (dmesg)"
  echo "${DMESG_ERR:-None}"

  echo
  hr
  echo "Snapshot complete @ $(date)"
  hr
  ```

- `where_and_clean.sh` ：更细致的清理
  ```bash
  #!/usr/bin/env bash
  set -euo pipefail
  echo "==== SIZE by top-level ===="
  sudo du -xh --max-depth=1 / | sort -h | tail -n 20
  echo
  echo "==== TOP 30 FILES >100MB ===="
  sudo find / -xdev -type f -size +100M -printf '%s %p\n' 2>/dev/null \
  | sort -nr | head -n 30 | awk '{ printf "%.2f GB  %s\n", $1/1024/1024/1024, $2 }'
  echo
  echo "==== OPEN BUT DELETED (free after service restart) ===="
  sudo lsof +L1 2>/dev/null | awk '{print $7, $9, $1, $2, $NF}' \
  | sort -nr | head -n 20 | awk '{ printf "%.2f MB  %s  (proc=%s pid=%s)\n", $1/1024/1024, $2, $3, $4 }' || true
  echo
  read -rp "Proceed with SAFE CLEAN (pip/conda/npm cache, journal 7d, apt clean, docker prune)? [y/N] " ans
  [[ "${ans:-N}" =~ ^[Yy]$ ]] || exit 0

  echo ">>> pip/conda/npm cache"
  pip cache purge 2>/dev/null || true
  conda clean -a -y 2>/dev/null || true
  npm cache clean --force 2>/dev/null || true
  yarn cache clean 2>/dev/null || true

  echo ">>> journal 7d + apt clean"
  sudo journalctl --vacuum-time=7d || true
  sudo apt clean || true
  sudo apt autoremove --purge -y || true

  if command -v docker &>/dev/null; then
    echo ">>> docker prune"
    docker system prune -af --volumes || true
    docker builder prune -af || true
  fi

  echo ">>> DONE. Current usage:"
  df -h
  ```

以下是上面三个脚本的使用方法：
```bash
chmod +x safe-clean.sh
./safe-clean.sh
```
```bash
chmod +x I_am_watching_you.sh
./I_am_watching_you.sh
```
```bash
chmod +x where_and_clean.sh
./where_and_clean.sh
```

另外，我发现接着 VSCode ，就会占用 20% 的 CPU ，所以说 neovim 还是有用的。

还有就是进程管理，这个只要你觉得不对劲，你就问 AI ，让它指导你清理掉不对的进程就行。

没有 swap 的小机型非常容易因为预编译或峰值内存被 OOM 直接拍死。
```bash
# 建 2G swap；想更稳用 4G：把 2G 改成 4G
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
sudo swapon -a
# 验证
free -h
```
可选把 swap 稍微积极点使用，给峰值更多缓冲（不会明显变慢）：
```bash
echo 'vm.swappiness=40' | sudo tee /etc/sysctl.d/99-swap.conf
sudo sysctl --system
```
给 user.slice 上“安全阀门”；CPUQuota=85%：用户进程合计最多 85% CPU；系统始终留有余量；MemoryHigh：超过软上限会被内核/oomd“施压”，尽量回收；MemoryMax：硬上限，触碰就只杀“闯祸进程”，不会把整机干没。
```bash
# CPU：最多 85%（更保守，留 15% 给系统和 SSH）
sudo systemctl set-property user.slice CPUAccounting=yes CPUQuota=85%

# 内存：软上限 3.2G（超过会被压制），硬上限 3.6G（到达就被杀）
# 按你机器实际 RAM 调整：总内存≈3.8G时，这个组合比较稳
sudo systemctl set-property user.slice MemoryAccounting=yes MemoryHigh=3.2G MemoryMax=3.6G

# 生效 & 查看
sudo systemctl daemon-reexec
systemctl show user.slice -p CPUQuota -p MemoryHigh -p MemoryMax
cat /sys/fs/cgroup/user.slice/cpu.max
cat /sys/fs/cgroup/user.slice/memory.high
cat /sys/fs/cgroup/user.slice/memory.max
```

---

# 附录：快捷命令

### Conda

**这是旧的（20251008 以前）**：

```bash
# 新环境
conda create -n universal python=3.11
conda activate universal
conda install numpy scipy pandas openpyxl matplotlib seaborn scikit-learn jupyterlab ipython pip
conda update --all

# 克隆与其它常用命令
conda env list
conda create --name 新环境名称 --clone 旧环境名称
conda remove --name 旧环境名称 --all
conda list # 列出所有包
```

**我推荐新的：**
（20251008 更新）
```bash
# 对于一个新的 miniforge
# 先创建通用环境
# 考虑现代包管理，我不推荐使用 pip
mamba create -n general python=3.11 \
  numpy scipy pandas matplotlib scikit-learn ipykernel -y

# 然后是我常用的科学计算+数据处理通用环境
mamba create -n lab11 python=3.11 \
  numpy scipy pandas matplotlib seaborn scikit-learn ipykernel -y

# 考虑到 2025 年的生态，我引入了很多新包和库
mamba activate lab11
mamba install -n lab11 -c conda-forge xgboost plotly polars optuna -y
```

### 其它

`genact`，启动！

如果你确定远程上的修改不重要，可以直接强制覆盖远程： `git push origin main --force` 。


