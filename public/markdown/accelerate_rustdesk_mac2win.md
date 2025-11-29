# macOS 远程连接 Windows 11 的 RustDesk + 自建服务器加速（Google Cloud 版）

## 一、什么是 RustDesk

**RustDesk** 是一款开源、跨平台的远程桌面软件，类似 TeamViewer / AnyDesk，但支持**完全自建服务器**。

| 对比       | RustDesk                                | TeamViewer / AnyDesk |
| -------- | --------------------------------------- | -------------------- |
| 是否开源     | 是                                     | 否                  |
| 是否可自建服务器 | 可完全自建                                 | 不可                 |
| 数据安全     | 端到端加密、自托管可控                           | 经第三方服务器            |
| 性能       | NVENC/QSV 硬编支持                       | 类似，但封闭            |
| 平台支持     | macOS / Windows / Linux / iOS / Android | 类似                   |

## 二、软件下载

### macOS 客户端（控制端）

进入首页（[下载地址](https://rustdesk.com)） → **Downloads** → 选择
**macOS (Apple Silicon)** 版本（支持 M1 / M2）。

下载后放入 `/Applications` 并授权屏幕录制和输入控制权限（系统会提示，不过作为控制端是不用的）。

### Windows 客户端（被控端）

同样在[官网](https://rustdesk.com) → 选择 **Windows (x64)**。

安装后运行一次，界面会显示：

```GUI
Your ID: xxxxxxxx
Password: ******
```

这就是该机器的远程登录入口。


## 三、为什么要自建服务器？

默认情况下，RustDesk 的通信通过公共中继服务器（官方）。
这在校园网等受限环境下**速度慢、延迟高、可能断连**。

自建服务器的好处：

1. **完全安全**：数据不经过外部服务器；
2. **低延迟**：所有流量经 Google Cloud（GCP）节点中继；
3. **可控**：自己管理防火墙、密钥；
4. **防校园网隔离**：绕过 NAT 限制；
5. **科学研究可扩展**：未来可集成身份认证、内网穿透等。

## 四、RustDesk 官方自建文档参考

官方文档：

* [自建服务器指南](https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/)
* [客户端配置指南](https://rustdesk.com/docs/en/self-host/client-configuration/)

## 五、在 Google Cloud 部署自建服务器（RustDesk Server）

假设你已在 GCP 创建了一个 Ubuntu 22.04 VM 实例（带公网 IP）。

### 1.安装 Docker（官方仓库法）

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
| sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
docker --version
docker compose version
```

验证：

```bash
sudo docker run --rm hello-world
```

看到 “Hello from Docker!” 即成功。

### 2.拉取 RustDesk Server 镜像

```bash
sudo docker image pull rustdesk/rustdesk-server
```

### 3.创建工作目录与 compose 文件

```bash
mkdir -p ~/rustdesk-server/data
cd ~/rustdesk-server
nano docker-compose.yml
```

写入以下内容：

```yaml
version: "3.9"

services:
  hbbs:
    container_name: hbbs
    image: rustdesk/rustdesk-server:latest
    command: hbbs
    volumes:
      - ./data:/root
    network_mode: "host"
    depends_on:
      - hbbr
    restart: unless-stopped

  hbbr:
    container_name: hbbr
    image: rustdesk/rustdesk-server:latest
    command: hbbr
    volumes:
      - ./data:/root
    network_mode: "host"
    restart: unless-stopped
```

保存并退出（Ctrl+O 回车 Ctrl+X）。

### 4.启动服务

```bash
sudo docker compose up -d
sudo docker ps
```

应看到两个容器：`hbbs`、`hbbr` 状态为 `Up`。

### 5.获取服务器公钥

```bash
sudo cat ./data/id_ed25519.pub
```

输出类似：

```
key: 1234567890abcdef1234567890abcdef1234567890abcdef=
```

复制整串（包括末尾 `=`），这是你客户端配置要用的 **Key**。

## 六、GCP 防火墙端口放行（必须做）

RustDesk 服务需要以下端口开放：

| 服务          | 协议      | 端口                    | 说明         |
| ----------- | ------- | --------------------- | ---------- |
| hbbs        | TCP     | 21115                 | NAT 测试     |
| hbbs        | TCP/UDP | 21116                 | ID 注册 / 心跳 |
| hbbr        | TCP     | 21117                 | 中继服务       |
| Web 客户端（可选） | TCP     | 21114 / 21118 / 21119 | 如不使用可跳过    |

### 通过控制台添加防火墙规则

1. 打开 [Google Cloud Console → VPC 网络 → 防火墙规则](https://console.cloud.google.com/networking/firewalls)
2. 点击“创建防火墙规则”
3. 参数：

   * 名称：`rustdesk-allow`
   * 网络：`default`
   * 方向：Ingress
   * 源 IP：`0.0.0.0/0`
   * 协议和端口：

     ```GUI
     tcp:21115,21116,21117,21114,21118,21119
     udp:21116
     ```
4. 保存。

或命令行方式：

```bash
gcloud compute firewall-rules create rustdesk-allow \
  --network default \
  --direction INGRESS \
  --priority 1000 \
  --action ALLOW \
  --rules tcp:21115,tcp:21116,tcp:21117,udp:21116 \
  --source-ranges 0.0.0.0/0
```

## 七、验证服务器是否正常

在 GCP SSH 终端中：

```bash
sudo docker logs hbbs --tail 10
sudo docker logs hbbr --tail 10
```

看到：

```bash
[INFO] Listening on 0.0.0.0:21115
[INFO] Listening on 0.0.0.0:21116
[INFO] Listening on 0.0.0.0:21117
```

即为正常。

## 八、客户端配置（Mac ↔ Win）

在 **两端 RustDesk 客户端 → Settings → Network**：

| 参数               | 填写内容              |
| ---------------- | ----------------- |
| **ID Server**    | `你的_GCP_IP:21116` |
| **Relay Server** | `你的_GCP_IP:21117` |
| **Key**          | 粘贴刚才的公钥（完整含 `=`）  |

保存后，主界面底部状态显示 `Ready` → 表示成功连接自建服务器。

## 九、连接测试与使用体验

1. Windows 端 RustDesk 启动 → 会显示自己的 ID；
2. 在 Mac 端输入该 ID → 连接；
3. 输入密码或确认请求；
4. 远程桌面成功显示。

**延迟体验**：

* 校园网中继经 GCP（东京/新加坡节点）延迟 ≈ 45–70 ms；
* RTX3060 使用 NVENC 硬件编码；
* M1 硬件解码，画质流畅、Simulink 拖拽不卡。

## 十、日常维护命令

| 操作     | 命令                                                                              |
| ------ | ------------------------------------------------------------------------------- |
| 查看运行容器 | `sudo docker ps`                                                                |
| 查看日志   | `sudo docker logs hbbs --tail 20`                                               |
| 停止服务器  | `sudo docker compose down`                                                      |
| 重启服务器  | `sudo docker compose restart`                                                   |
| 更新镜像   | `sudo docker pull rustdesk/rustdesk-server:latest && sudo docker compose up -d` |