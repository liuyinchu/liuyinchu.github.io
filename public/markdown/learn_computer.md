# Computer Cheatsheet for **macOS**

## Homebrew

```bash
# 升级更新
brew update

# 查看软件更新情况
brew outdated
```

## zsh

### oh-my-zsh

#### 高亮与补全

#### `z` & `extract`

#### `fzf`

- install
    ```bash
    brew install fzf
    $(brew --prefix)/opt/fzf/install
    fzf --version
    ```

### eza
`eza` 是一个用 Rust 编写的现代化 `ls` 命令替代品。它的核心设计哲学是：提供比 ls 更多的功能和更友好的用户体验，并且默认配置就足够出色。

- 多彩高亮：根据文件类型和权限用不同颜色展示，一目了然。
- Git 感知：直接在文件列表中显示文件的 Git 状态。
- 图标支持：如果使用 Nerd Font，能为文件和目录显示精美图标。
- 树状视图：内置了比 `tree` 更强大的 `tree` 功能。

以下记录我的使用指南：

- install
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

