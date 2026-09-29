# TZBox

**macOS 应用级时区代理。** 为应用选择启动时区，在不同地区的时间语境下使用同一台电脑，系统时区保持原样。

::: button-row
[GitHub 源码与使用说明](https://github.com/pifuyuini/tzbox){.md-button}
:::

## 能做什么

- 搜索 IANA 时区，对照目标时间与系统时间，按当地规则处理夏令时。
- 为 Chrome、Cherry Studio 等 macOS 应用设置启动时区，查看运行状态和待重新应用提示。
- 正常重启应用以切换时区，或恢复系统时区；保留应用自己的资料、账号和设置。
- 关闭窗口后可从菜单栏继续管理应用。

## 开始使用

源码构建需要 **macOS 14 或以上、Apple Silicon、Swift 5.9 或以上**，以及已安装的 macOS SDK / Command Line Tools：

```bash
git clone https://github.com/pifuyuini/tzbox.git
cd tzbox
./scripts/build.sh release
open build/TZBox.app
```

打开后选择目标时区，添加应用，再应用并启动。应用已经运行时，先保存内容并正常重启；更改目标时区后，也需要重新应用才会生效。

## 使用边界

TZBox 为本次应用启动传入目标时区，不改变真实时刻。应用内的网页、扩展，以及服务器或远程环境，仍可能使用各自的时间来源，需要按实际用途确认效果。

当前构建采用本地 ad-hoc 签名，尚未提供 Developer ID 签名、公证或自动更新。构建与验证细节见项目 README。

---

[返回代码与项目](/code)
