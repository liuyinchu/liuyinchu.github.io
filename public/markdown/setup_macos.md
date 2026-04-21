# Computer Settings Cheatsheet for **macOS**

## 1 第一步

手动对电脑进行一些个性化设置。

- 开启防火墙；
- 隐藏 “Dock” ；
- 开启台前调度；
- 控制中心设置；
- 设置 Finder （左上角选设置）；
- 安装 ClashX 并配置（可以在神秘网站中找）/ **现在更推荐 Clash Verge**；
- 安装 Chrome；
- 安装飞书；
- 安装 VSCode 并把它加入到路径中，最后配置插件：
  - 打开后按快捷键：`Cmd + Shift + P` ；
  - 输入并选择：`Shell Command: Install 'code' command in PATH` ；
  - 关闭并重新打开终端。
- 安装其它必要软件。

## 2 Homebrew

必不可少的软件下载安装与管理工具。

- 先安装命令行工具：
  ```bash
  xcode-select --install
  ```
- 下载与安装：
  ```bash
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  echo 'PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
  source ~/.zshrc
  brew --version
  ```
- 其它：
  ```bash
  # 升级更新
  brew update

  # 查看软件更新情况
  brew outdated
  ```

## 3 Shell

配置终端。

### 3.1 配置 Oh-My-Zsh

- 可以先配置 kitty ，详见另一篇随记；
- 下载：
  ```bash
  sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
  ```
- 下载插件（自动补全和高亮）：
	```bash
	# 安装 zsh-autosuggestions
	git clone https://github.com/zsh-users/zsh-autosuggestions ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions
	# 安装 zsh-syntax-highlighting
	git clone https://github.com/zsh-users/zsh-syntax-highlighting ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting
	```
- 下载主题：  
  ```bash
  git clone --depth=1 https://github.com/romkatv/powerlevel10k.git "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k"
  ``` 
- 配置： `code ~/.zshrc` ，然后把 `plugins=(git)` 改为 `plugins=(git zsh-autosuggestions zsh-syntax-highlighting z)` ，把 `ZSH_THEME="robbyrussell"` 改为 `ZSH_THEME="powerlevel10k/powerlevel10k"` ；
- 重新加载配置： `source ~/.zshrc` （**很重要别忘了**）；
- 然后可以按喜好一步步根据引导配置 powerlevel10k 主题了。
- 如果需要调一下补全的颜色，我采用的是流萤的火焰的颜色 `ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE='fg=#4df8e8'` ，直接在 `~/.zshrc` 中多加这一行就可以了。

### 3.2 终端的额外配置

#### 3.2.1 fzf

- 下载与安装：
    ```bash
    brew install fzf
    $(brew --prefix)/opt/fzf/install
    fzf --version
    ```
- `Do you want to enable fuzzy auto-completion? ([y]/n)`
  你想启用命令行模糊补全（tab 补全增强）吗？默认是 yes（回车）
  按回车，启用补全（推荐）
- `Do you want to enable key bindings? ([y]/n)`
  你要启用 fzf 的快捷键绑定吗？默认是 yes（回车）
  所谓 key bindings（快捷键绑定） 是指：
  - `Ctrl+T` → 文件和路径的 fuzzy finder
  - `Ctrl+R` → 历史命令的 fuzzy 查找
  - `Alt+C` → fuzzy 查找目录并 cd 进去
  这些都是 fzf 最好用的功能。

#### 3.2.2 eza
`eza` 是一个用 Rust 编写的现代化 `ls` 命令替代品。它的核心设计哲学是：提供比 ls 更多的功能和更友好的用户体验，并且默认配置就足够出色。

- 下载与安装：
    ```bash
    brew install eza
    ```
- config to `.zshrc`
    ```.zshrc
    # 默认用 eza 替代 ls，开启图标和 git 集成
    alias ls='eza --icons --git'
    # 长列表，带头部信息，目录优先
    alias ll='eza -l -h --icons --git --group-directories-first'
    # 长列表，显示所有文件
    alias la='eza -la -h --icons --git --group-directories-first'
    # Tree 别名
    alias tree='eza --tree -L 2 --icons'        # 默认看 2 层
    alias treea='eza --tree -a -L 2 --icons'    # 看 2 层，包含隐藏文件
    alias tree3='eza --tree -L 3 --icons'       # 看 3 层
    alias tree4='eza --tree -L 4 --icons'       # 看 4 层
    ```
- 记得修改后执行 `source ~/.bashrc` 或重启终端。

## 4 Python

Python 开发环境。

### 4.1 Conda

- 首先前往[官方仓库](https://github.com/conda-forge/miniforge)或[官网](https://conda-forge.org/download/)按指引下载。例如：
  ```bash
  curl -L -O "https://github.com/conda-forge/miniforge/releases/latest/download/Miniforge3-$(uname)-$(uname -m).sh"
  ```
- 下载完成后进入安装脚本（是个 `.sh` 文件），第一个要注意的是安装路径，如果不想要默认路径，直接输入新路径再 `ENTER` 就好。
  ```bash
  bash Miniforge3-$(uname)-$(uname -m).sh
  ```
- 然后要注意的是初始化和激活，先输入 `yes` ，然后 `conda config --set auto_activate_base false` 就行（官方仓库有写）。
- 注意重载配置文件：`source ~/.zshrc` 。

常用指令：
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

### 4.2 uv

- 科学下载：
  ```bash
  curl -LsSf https://astral.sh/uv/install.sh | sh

  # 也可以使用 Homebrew
  brew install uv
  ```
- 自动补全：
  ```bash
  echo 'eval "$(uv generate-shell-completion zsh)"' >> ~/.zshrc
  ```
- 重载：`source ~/.zshrc` ；
- 确认：输入`uv`，成功会出现帮助菜单。

如果需要卸载：  
```bash
uv cache clean
rm -r "$(uv python dir)"
rm -r "$(uv tool dir)"
```

```bash
rm ~/.local/bin/uv ~/.local/bin/uvx
```

## 5 Rust

Rust 开发环境。

- 确定准备好了：`xcode-select --install` ；
- 下载与安装：
  ```bash
  curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
  ```

通过 rustup 安装了 Rust 之后，更新到最新版本就很简单了。只需要在您对应的命令行中运行如下更新脚本：
```bash
rustup update
```
若要卸载 Rust 和 rustup，请在命令行中运行如下卸载脚本：
```bash
rustup self uninstall
```

## 6 Git

### 6.1 ssh

```bash
ssh-keygen -t rsa -C "[youremail]@[address].com"
```

## 7 加密磁盘

在 macOS 里，最稳妥的做法不是“直接给文件夹加密”，而是**用“磁盘映像”做一个带密码的加密容器**。Apple 在磁盘工具里提供了官方支持；如果是 macOS 10.13 及以上，Apple 建议这类加密映像使用 **APFS**。

1. 打开 **磁盘工具**。
2. 菜单栏选择 **文件 > 新建映像 > 空白映像**。
3. 设置这些项目：
   * **存储为**：映像文件保存的位置和文件名
   * **名称**：挂载后在 Finder 里看到的名字
   * **大小**：你要给这个“加密文件夹”预留多大空间
   * **格式**：如果你的 Mac 是 macOS 10.13 或更高，选 **APFS**
   * **加密**：选 **128 位 AES** 或 **256 位 AES**
   * **映像格式**：想日常反复存放文件，通常选 **读/写磁盘映像**
4. 输入并确认密码。
5. 保存后，会得到一个 `.dmg` 文件。双击它，输入密码，就会像打开一个磁盘一样挂载出来；把文件拖进去即可。用完后右键推出。以上流程是 Apple 官方给出的创建安全磁盘映像的方法。

如果已经有一个现成文件夹想加密，也可以在磁盘工具里选：**文件 > 新建映像 > 来自文件夹的映像**，把那个文件夹做成一个映像文件。这样会生成一个包含该文件夹内容的磁盘映像。一般日常使用选 **128 位** 已经够用，兼顾速度。更在意安全性可以选 **256 位**。Apple 的创建流程里提供这两种加密选项。
