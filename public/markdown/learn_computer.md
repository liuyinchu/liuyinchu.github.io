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


