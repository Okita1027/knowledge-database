---
title: 高级篇
shortTitle: 高级篇
description: 
date: 2024-06-16 22:11:18
categories: [容器]
tags: [Docker]
---

## Docker网络

Docker网络负责容器间的互联和端口映射，能够在容器IP变动时通过服务名直接进行网络通信而不受到影响

### 相关命令

- `docker network ls`:显示所有可用网络及其驱动类型。
- `docker network inspect <network_name_or_id>`:查看指定网络的详细信息，包括子网、网关、容器连接信息等。
- `docker network create <network_name>`:使用默认桥接网络驱动创建新网络。
- `docker network create --driver <driver_name> <network_name>`:指定网络驱动类型创建网络（例如 `bridge`、`overlay`、`macvlan` 等）。
  - `--subnet <subnet>`：指定子网范围，例如 `192.168.1.0/24`。
  - `--gateway <gateway>`：指定网关 IP。
  - `--ip-range <ip-range>`：定义容器 IP 分配范围。
  - `--opt <key>=<value>`：配置网络驱动的自定义选项。
  - `--aux-address`：为网络中的特定服务保留IP地址。
  
- `docker network rm <network_name_or_id>`:删除指定的 Docker 网络，删除前需确保没有容器连接到该网络。
- `docker network connect <network_name> <container_name_or_id>`:将已运行的容器连接到指定网络。
  - `--ip <ip_address>`：指定容器在该网络中的 IP 地址。
  - `--alias <alias_name>`：为容器指定网络别名。
- `docker network disconnect <network_name> <container_name_or_id>`:将容器从指定网络中断开。
- `docker run --network <network_name> <image_name>`:在容器启动时指定网络模式
  - `bridge`：桥接网络（默认网络）。
  - `host`：主机网络。
  - `none`：无网络。
  - 自定义网络名。

### 网络类型

#### bridge

Docker安装启动后会在宿主主机上创建一个名为 docker0 的虚拟网桥，处于七层网络模型的数据链路层，后续每当我们创建一个新的docker容器，在不指定容器网络模式的情况下，docker会通过 docker0 与主机的网络连接，docker0 相当于网桥。

- 每个连接到这个网桥的容器都会被分配一个私有IP地址。
- 桥接网络允许容器之间通过容器名称或容器IP进行相互通信。
- 容器可以通过端口映射的方式与宿主机外的网络通信。

**用途：**适合单机上运行的独立应用容器，可以通过 IP 或端口暴露给外部。

**用法：**

```shell
docker network create my_bridge_network
docker run -d --network=my_bridge_network --name container_name image_name
```

**原理：**

当 Docker 启动时，会自动在主机上创建一个 `docker0` 虚拟网桥，实际上是 Linux 的一个 bridge，可以理解为一个软件交换机。它会在挂载到它的网口之间进行转发。

同时，Docker 随机分配一个本地未占用的私有网段（在 [RFC1918](https://datatracker.ietf.org/doc/html/rfc1918) 中定义）中的一个地址给 `docker0` 接口。比如典型的 `172.17.42.1`，掩码为 `255.255.0.0`。此后启动的容器内的网口也会自动分配一个同一网段（`172.17.0.0/16`）的地址。

当创建一个 Docker 容器的时候，同时会创建了一对 `veth pair` 接口（当数据包发送到一个接口时，另外一个接口也可以收到相同的数据包）。这对接口一端在容器内，即 `eth0`；另一端在本地并被挂载到 `docker0` 网桥，名称以 `veth` 开头（例如 `vethAQI2QT`）。通过这种方式，主机可以跟容器通信，容器之间也可以相互通信。Docker 就创建了在主机和所有容器之间一个虚拟共享网络。

#### host

**特点**：

- 与主机共享网络栈，容器的端口直接暴露在主机的网络上，在容器中运行的服务看起来就像是直接在宿主机上运行的一样。
- 减少了网络栈的开销，适合需要直接与外部网络通信的应用。
- 容器与主机完全共享端口，端口冲突问题需要管理。
- 由于没有网络命名空间的隔离，网络性能通常更好，因为没有额外的网络地址转换（NAT）。

**用途**：

- 当需要容器中的应用程序直接绑定到宿主机的特定端口（尤其是特权端口，如80、443等）时，host模式非常方便。
- 当应用程序对网络性能有极高要求时，使用host模式可以减少网络层的抽象，提供更好的网络性能。
- 在进行网络调试时，使用host模式可以更容易地观察和分析网络流量，因为不需要考虑容器网络与宿主机网络之间的映射关系。

**用法**：

```shell
docker run --network host --name container_name image_name
```

#### none

**特点**：容器没有任何网络接口，只有回环接口。

**用途**：适用于不需要网络功能的安全容器，或对网络完全隔离的测试。

**用法**：

```shell
docker run --network none --name container_name image_name
```

#### container

**特点**：

- 网络命名空间共享：新创建的容器不会获得自己的网络命名空间，而是与指定的容器共享同一个网络命名空间。
- 网络配置共享：两个容器将共享网络接口、IP地址、MAC地址等网络配置。
- 端口和协议共享：由于网络命名空间共享，所以两个容器不能绑定相同的端口，因为它们实际上是在同一个网络命名空间内。
- 隔离性降低：使用容器模式会降低容器之间的隔离性，因为它们共享网络资源。

**用途：**

- 服务发现和通信：当你想要两个容器紧密协作，并且它们需要直接进行网络通信时，可以使用容器模式。
- 资源共享：例如，如果你有一个容器运行了数据库服务，另一个容器需要直接访问该数据库，而不想通过外部网络接口，可以使用容器模式。

**用法**：

```shell
# 启动第一个容器
docker run --name container1 -d your-image
#启动第二个容器并指定使用container1的网络命名空间
docker run --name container2 --network container:container1 -d your-image
```

**注意事项**：

- 端口冲突：由于两个容器共享相同的网络命名空间，它们不能绑定到相同的端口，否则会发生冲突。
- 安全性：容器模式降低了网络隔离性，因此如果两个容器中有一个受到攻击，另一个也可能受到影响。
- 网络配置：共享网络命名空间的容器将共享相同的网络配置，这意味着如果一个容器修改了网络配置，另一个也会受到影响。

#### 自定义网络

允许用户创建具有特定配置的网络，以满足容器化应用程序的特定需求。自定义网络提供了比默认桥接网络更多的控制，包括但不限于静态IP分配、容器间通信、网络隔离和自定义网络驱动。使用方法参照上面的 “相关命令”。

## 高级网络配置

### 容器访问控制

容器的访问控制，主要通过 Linux 上的 `iptables` 防火墙进行管理和实现。`iptables` 是 Linux 上默认的防火墙软件，在大部分发行版中都自带。

#### 容器访问外部网络

容器要想访问外部网络，需要本地系统的转发支持。在Linux 系统中，检查转发是否打开。

```shell
sysctl net.ipv4.ip_forward
```

如果为 0，说明没有开启转发，则需要手动打开。

```shell
sysctl -w net.ipv4.ip_forward=1
```

如果在启动 Docker 服务的时候设定 `--ip-forward=true`, Docker 就会自动设定系统的 `ip_forward` 参数为 1。

#### 容器之间访问

容器之间相互访问，需要两方面的支持。

- 容器的网络拓扑是否已经互联。默认情况下，所有容器都会被连接到 `docker0` 网桥上。
- 本地系统的防火墙软件 `--iptables` 是否允许通过。

#### 访问所有端口

当启动 Docker 服务（即 dockerd）的时候，默认会添加一条转发策略到本地主机 iptables 的 FORWARD 链上。策略为通过（`ACCEPT`）还是禁止（`DROP`）取决于配置`--icc=true`（缺省值）还是 `--icc=false`。当然，如果手动指定 `--iptables=false` 则不会添加 `iptables` 规则。

可见，默认情况下，不同容器之间是允许网络互通的。如果为了安全考虑，可以在 `/etc/docker/daemon.json` 文件中配置 `{"icc": false}` 来禁止它。

> `/etc/docker/daemon.json` 文件在安装 Docker 后并不是自动创建的，只有在你需要自定义 Docker 的配置时，才会手动创建这个文件。默认情况下，Docker 会使用内置的默认设置。

#### 访问指定端口

在通过 `-icc=false` 关闭网络访问后，还可以通过 `--link=CONTAINER_NAME:ALIAS` 选项来访问容器的开放端口。

例如，在启动 Docker 服务时，可以同时使用 `icc=false --iptables=true` 参数来关闭允许相互的网络访问，并让 Docker 可以修改系统中的 `iptables` 规则。

此时，系统中的 `iptables` 规则可能是类似

```shell
$ sudo iptables -nL
...
Chain FORWARD (policy ACCEPT)
target     prot opt source               destination
DROP       all  --  0.0.0.0/0            0.0.0.0/0
...
```

之后，启动容器（`docker run`）时使用 `--link=CONTAINER_NAME:ALIAS` 选项。Docker 会在 `iptable` 中为 两个容器分别添加一条 `ACCEPT` 规则，允许相互访问开放的端口（取决于 `Dockerfile` 中的 `EXPOSE` 指令）。

当添加了 `--link=CONTAINER_NAME:ALIAS` 选项后，添加了 `iptables` 规则。

```shell
$ sudo iptables -nL
...
Chain FORWARD (policy ACCEPT)
target     prot opt source               destination
ACCEPT     tcp  --  172.17.0.2           172.17.0.3           tcp spt:80
ACCEPT     tcp  --  172.17.0.3           172.17.0.2           tcp dpt:80
DROP       all  --  0.0.0.0/0            0.0.0.0/0
```

> 注意：`--link=CONTAINER_NAME:ALIAS` 中的 `CONTAINER_NAME` 目前必须是 Docker 分配的名字，或使用 `--name` 参数指定的名字。主机名则不会被识别。

### 端口映射实现

默认情况下，容器可以主动访问到外部网络的连接，但是外部网络无法访问到容器。

#### 容器访问外部实现

容器所有到外部网络的连接，源地址都会被 NAT 成本地系统的 IP 地址。这是使用 `iptables` 的源地址伪装操作实现的。

查看主机的 NAT 规则：

```shell
$ sudo iptables -t nat -nL
...
Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination
MASQUERADE  all  --  172.17.0.0/16       !172.17.0.0/16
...
```

上述规则将所有源地址在 `172.17.0.0/16` 网段，目标地址为其他网段（外部网络）的流量动态伪装为从系统网卡发出。MASQUERADE 跟传统 SNAT 的好处是它能动态从网卡获取地址。

#### 外部访问容器实现

容器允许外部访问，可以在 `docker run` 时候通过 `-p` 或 `-P` 参数来启用。

不管用那种办法，其实也是在本地的 `iptable` 的 nat 表中添加相应的规则。

使用 `-P` 时：

```shell
$ iptables -t nat -nL
...
Chain DOCKER (2 references)
target     prot opt source               destination
DNAT       tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:49153 to:172.17.0.2:80
```

使用 `-p 80:80` 时：

```shell
$ iptables -t nat -nL
Chain DOCKER (2 references)
target     prot opt source               destination
DNAT       tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:80 to:172.17.0.2:80
```

> 注意：
>
> - 这里的规则映射了 `0.0.0.0`，意味着将接受主机来自所有接口的流量。用户可以通过 `-p IP:host_port:container_port` 或 `-p IP:port` 来指定允许访问容器的主机上的 IP、接口等，以制定更严格的规则。
>
> - 如果希望永久绑定到某个固定的 IP 地址，可以在 Docker 配置文件 `/etc/docker/daemon.json` 中添加如下内容
>
>   ```json
>   {
>       "ip": "0.0.0.0"
>   }
>   ```

### 配置docker0网桥

Docker 服务默认会创建一个 `docker0` 网桥（其上有一个 `docker0` 内部接口），它在内核层连通了其他的物理或虚拟网卡，这就将所有容器和本地主机都放到同一个物理网络。

Docker 默认指定了 `docker0` 接口 的 IP 地址和子网掩码，让主机和容器之间可以通过网桥相互通信，它还给出了 MTU（接口允许接收的最大传输单元），通常是 1500 Bytes，或宿主主机网络路由上支持的默认值。这些值都可以在服务启动的时候进行配置。

- `--bip=CIDR` IP 地址加掩码格式，例如 192.168.1.5/24
- `--mtu=BYTES` 覆盖默认的 Docker mtu 配置

也可以在配置文件中配置 DOCKER_OPTS，然后重启服务。

由于目前 Docker 网桥是 Linux 网桥，用户可以使用 `brctl show` 来查看网桥和端口连接信息。

```shell
$ sudo brctl show
bridge name     bridge id               STP enabled     interfaces
docker0         8000.3a1d7362b4ee       no              veth65f9
                                             vethdda6
```

> `brctl` 命令在 Debian、Ubuntu 中可以使用 `sudo apt-get install bridge-utils` 来安装。

每次创建一个新容器的时候，Docker 从可用的地址段中选择一个空闲的 IP 地址分配给容器的 eth0 端口。使用本地主机上 `docker0` 接口的 IP 作为所有容器的默认网关。

```shell
$ sudo docker run -i -t --rm base /bin/bash
$ ip addr show eth0
24: eth0: <BROADCAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 32:6f:e0:35:57:91 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.3/16 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::306f:e0ff:fe35:5791/64 scope link
       valid_lft forever preferred_lft forever
$ ip route
default via 172.17.42.1 dev eth0
172.17.0.0/16 dev eth0  proto kernel  scope link  src 172.17.0.3
```

### 自定义网桥

除了默认的 `docker0` 网桥，用户也可以指定网桥来连接各个容器。

在启动 Docker 服务的时候，使用 `-b BRIDGE`或`--bridge=BRIDGE` 来指定使用的网桥。

如果服务已经运行，那需要先停止服务，并删除旧的网桥。

```shell
$ sudo systemctl stop docker
$ sudo ip link set dev docker0 down
$ sudo brctl delbr docker0
```

然后创建一个网桥 `bridge0`。

```sh
$ sudo brctl addbr bridge0
$ sudo ip addr add 192.168.5.1/24 dev bridge0
$ sudo ip link set dev bridge0 up
```

查看确认网桥创建并启动。

```sh
$ ip addr show bridge0
4: bridge0: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state UP group default
    link/ether 66:38:d0:0d:76:18 brd ff:ff:ff:ff:ff:ff
    inet 192.168.5.1/24 scope global bridge0
       valid_lft forever preferred_lft forever
```

在 Docker 配置文件 `/etc/docker/daemon.json` 中添加如下内容，即可将 Docker 默认桥接到创建的网桥上。

```json
{
  "bridge": "bridge0",
}
```

启动 Docker 服务,新建一个容器，可以看到它已经桥接到了 `bridge0` 上。

可以继续用 `brctl show` 命令查看桥接的信息。另外，在容器中可以使用 `ip addr` 和 `ip route` 命令来查看 IP 地址配置和路由信息。

### 编辑网络配置文件

Docker 1.2.0 开始支持在运行中的容器里编辑 `/etc/hosts`, `/etc/hostname` 和 `/etc/resolv.conf` 文件。

但是这些修改是临时的，只在运行的容器中保留，容器终止或重启后并不会被保存下来，也不会被 `docker commit` 提交。

### 配置 HTTP/HTTPS 网络代理

使用Docker的过程中，因为网络原因，通常需要使用 HTTP/HTTPS 代理来加速镜像拉取、构建和使用。下面是常见的三种场景。

#### 为 dockerd 设置网络代理

"docker pull" 命令是由 dockerd 守护进程执行。而 dockerd 守护进程是由 systemd 管理。因此，如果需要在执行 "docker pull" 命令时使用 HTTP/HTTPS 代理，需要通过 systemd 配置。

1. 为dockerd创建配置文件夹

```sh
sudo mkdir -p /etc/systemd/system/docker.service.d
```

2. 为 dockerd 创建 HTTP/HTTPS 网络代理的配置文件，文件路径是 `/etc/systemd/system/docker.service.d/http-proxy.conf` 。并在该文件中添加相关环境变量。

```conf
[Service]
Environment="HTTP_PROXY=http://proxy.example.com:8080/"
Environment="HTTPS_PROXY=http://proxy.example.com:8080/"
Environment="NO_PROXY=localhost,127.0.0.1,.example.com"
```

3. 刷新配置并重启docker服务

```sh
sudo systemctl daemon-reload
sudo systemctl restart docker
```

#### 为docker容器设置网络代理

在容器运行阶段，如果需要使用 HTTP/HTTPS 代理，可以通过更改 docker 客户端配置，或者指定环境变量的方式。

- 更改 docker 客户端配置：创建或更改 ~/.docker/config.json，并在该文件中添加相关配置

```json
{
 "proxies":
 {
   "default":
   {
     "httpProxy": "http://proxy.example.com:8080/",
     "httpsProxy": "http://proxy.example.com:8080/",
     "noProxy": "localhost,127.0.0.1,.example.com"
   }
 }
}
```

- 指定环境变量：运行 "docker run" 命令时，指定相关环境变量。

|  环境变量   |                  docker run 示例                   |
| :---------: | :------------------------------------------------: |
| HTTP_PROXY  | --env HTTP_PROXY="http://proxy.example.com:8080/"  |
| HTTPS_PROXY | --env HTTPS_PROXY="http://proxy.example.com:8080/" |
|  NO_PROXY   | --env NO_PROXY="localhost,127.0.0.1,.example.com"  |

#### 为docker build过程设置网络代理

在容器构建阶段，如果需要使用 HTTP/HTTPS 代理，可以通过指定 "docker build" 的环境变量，或者在 Dockerfile 中指定环境变量的方式。

- 使用 "--build-arg" 指定 "docker build" 的相关环境变量

```sh
docker build \
    --build-arg "HTTP_PROXY=http://proxy.example.com:8080/" \
    --build-arg "HTTPS_PROXY=http://proxy.example.com:8080/" \
    --build-arg "NO_PROXY=localhost,127.0.0.1,.example.com" .
```

- 在 Dockerfile 中指定相关环境变量

|  环境变量   |                 Dockerfile 示例                  |
| :---------: | :----------------------------------------------: |
| HTTP_PROXY  | ENV HTTP_PROXY="http://proxy.example.com:8080/"  |
| HTTPS_PROXY | ENV HTTPS_PROXY="http://proxy.example.com:8080/" |
|  NO_PROXY   | ENV NO_PROXY="localhost,127.0.0.1,.example.com"  |

## Docker Compose

### 指定项目名称

项目名称必须仅包含小写字母、十进制数字、短划线和 下划线，并且必须以小写字母或十进制数字开头。如果 项目目录或当前目录的 base name 违反此 constraint 的 Constraint 中，可以使用替代机制。

**命令行指定**

在运行 `docker-compose` 命令时，使用 `-p` 选项指定项目名称：

```bash
docker-compose -p myproject up
```

这样，所有的容器、网络和卷都将以 `myproject` 作为前缀。例如，`web` 服务的容器名称可能会变为 `myproject_web_1`。

**通过环境变量指定**

使用 `COMPOSE_PROJECT_NAME` 环境变量指定项目名称。这在需要频繁运行同一项目时尤其有用。

1. 将 `COMPOSE_PROJECT_NAME` 变量添加到 `.env` 文件中：

   ```env
   COMPOSE_PROJECT_NAME=myproject
   ```

2. 当 `docker-compose` 读取到 `.env` 文件中的 `COMPOSE_PROJECT_NAME` 变量时，会自动使用该名称作为项目名称。

**直接在命令行设置环境变量**

在运行命令的同时设置环境变量 `COMPOSE_PROJECT_NAME`，这样无需修改 `.env` 文件：

```bash
COMPOSE_PROJECT_NAME=myproject docker-compose up
```

假设有一个 `docker-compose.yml` 文件如下：

```yml
version: '3.8'
services:
  web:
    image: nginx
  db:
    image: postgres
```

通过以下命令启动服务并指定项目名称：

```bash
docker-compose -p customproject up
```

生成的容器名称将包含前缀 `customproject`，如 `customproject_web_1` 和 `customproject_db_1`。

---

每种方法的优先级（从最高到最低）如下：

1. 命令行标志。`-p`
2. [COMPOSE_PROJECT_NAME 环境变量](https://docs.docker.com/compose/how-tos/environment-variables/envvars/)。
3. Compose 文件中的[顶级属性`name:`](https://docs.docker.com/reference/compose-file/version-and-name/)。如果在命令行中使用`-f`标志[指定多个 Compose 文件](https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/)，则为最后一个`name:`
4. 包含 Compose 文件的项目目录的基本名称。或者，如果您在命令行中使用`-f`标志[指定多个 Compose 文件](https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/)，则为第一个 Compose 文件的基名称。
5. 如果未指定 Compose 文件，则为当前目录的基本名称。

### 生命周期钩子

当 Docker Compose 运行容器时，它使用两个元素：[ENTRYPOINT 和 COMMAND](https://github.com/manuals//engine/containers/run.md#default-command-and-options), 来管理容器启动和停止时发生的情况。

但是，有时使用生命周期钩子单独处理这些任务会更容易 - 在容器启动后或停止之前运行的命令。

生命周期钩子特别有用，因为它们可以具有特殊权限 （例如以 root 用户身份运行），即使容器本身以较低的权限运行 为了安全。这意味着某些需要更高权限的任务可以在没有 损害容器的整体安全性。

#### 后启动钩子

Post-start 钩子是在容器启动后运行的命令，但没有设置执行时间。

在提供的示例中：

- 该钩子用于将卷的所有权更改为非 root 用户（因为卷默认使用 root 所有权创建）。
- 容器启动后，该命令将目录的所有权更改为 user 。`chown` `/data` `1001`

```yml
services:
  app:
    image: backend
    user: 1001
    volumes:
      - data:/data    
    post_start:
      - command: chown -R /data 1001:1001
        user: root

volumes:
  data: {} # a Docker volume is created with root ownership
```

#### 预停止钩子

预停止钩子是在容器被特定命令（如`docker compose down`或使用`Ctrl+C`手动停止它）。 如果容器自行停止或突然被杀死，这些钩子将不会运行。

在以下示例中，在容器停止之前，脚本为 run 执行任何必要的清理。`./data_flush.sh`

```yml
services:
  app:
    image: backend
    pre_stop:
      - command: ./data_flush.sh
```

### profiles配置集

用于定义和选择不同的配置文件（或称“配置集”）。通过 `profiles` 可以控制哪些服务在特定环境中运行（例如开发、测试或生产环境），从而更加灵活地管理不同环境的需求。

#### 配置profiles

服务可以指定一个或多个 `profiles`。只有在运行时启用的配置文件中的服务才会启动。

```yml
version: '3.9'

services:
  web:
    image: nginx:latest
    profiles:
      - production
      - staging

  db:
    image: postgres:latest
    profiles:
      - production

  redis:
    image: redis:latest
    profiles:
      - development

  debug:
    image: busybox
    command: sleep infinity
    profiles:
      - development
```

在上面的配置中：

- **`web`** 和 **`db`** 服务在 `production` 配置下可用。
- **`redis`** 和 **`debug`** 服务仅在 `development` 配置下可用。

#### 启用/停止profiles

要运行指定 `profiles` 下的服务，可以使用 `COMPOSE_PROFILES` 环境变量或 `--profile` 选项。

**使用`COMPOSE_PROFILES`环境变量**

```bash
COMPOSE_PROFILES=production docker-compose up
COMPOSE_PROFILES=production docker-compose down
```

上述命令将启动/停止 `production` 配置文件中的服务，即 `web` 和 `db` 服务。

**使用`--profile`选项**

在`docker-compose`命名中直接指定`–profile`

```bash
docker-compose --profile development up
docker-compose --profile development down
```

这将只启动/停止 `development` 配置文件中的服务，即 `redis` 和 `debug` 服务。

**在配置文件中设置**

```env
COMPOSE_PROFILES=development
```

**启动多个配置文件**

可以同时启用多个配置文件：

方法1：

```bash
COMPOSE_PROFILES=production,development docker-compose up
```

方法2：

```bash
docker-compose --profile production --profile development up
```

这样将启动 `production` 和 `development` 配置文件中的所有服务，即 `web`、`db`、`redis` 和 `debug` 服务。

### 控制启动顺序

在 Docker Compose 中，有时需要控制服务的启动顺序，确保某些服务（如数据库）在依赖它们的服务（如应用程序）之前启动。虽然 Docker Compose 本身不支持严格的启动顺序控制，但可以通过以下方法来实现基本的启动顺序控制：

#### `depends_on`

`depends_on` 是 Docker Compose 提供的一个指令，用于指定一个服务的依赖关系，使 Docker Compose 按照指定的顺序启动服务。但注意，`depends_on` 仅在容器启动顺序上有效，并不保证依赖服务的完全就绪状态（如数据库服务实际可用）。因此，在有较严格启动顺序要求的场景下，通常需要搭配健康检查。

```yml
version: '3.8'

services:
  db:
    image: postgres:latest
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password

  web:
    image: my_web_app_image
    depends_on:
      - db
```

在这个例子中，`web` 服务会在 `db` 服务之后启动。但需要注意，`depends_on` 并不意味着 `db` 服务已经完全准备好，它只是确保容器的启动顺序。

#### 配合`healthcheck`确保服务就绪

为了确保依赖服务完全可用，可以使用 `healthcheck` 指令定义健康检查。健康检查会定期检查服务是否完全启动并准备就绪，这样可以避免应用在数据库等服务未就绪时启动。

```yml
version: '3.8'

services:
  db:
    image: postgres:latest
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5

  web:
    image: my_web_app_image
    depends_on:
      db:
        condition: service_healthy
```

在这个示例中，`db` 服务设置了健康检查，`web` 服务的 `depends_on` 条件设置为 `service_healthy`。这确保了 `db` 服务在健康检查通过（即数据库服务完全可用）后，`web` 服务才会启动。

> `healthcheck` 会根据容器的状态报告健康状况，`condition: service_healthy` 仅在 Docker Compose v3.4 及以上版本中支持。

#### 脚本/延迟启动

有些服务没有健康检查工具，或者需要更灵活的就绪条件。在这种情况下，可以通过启动延迟或脚本控制服务的启动顺序。例如，可以在 `command` 中设置延迟命令来确保依赖服务完全启动。

```yml
version: '3.8'

services:
  db:
    image: postgres:latest
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password

  web:
    image: my_web_app_image
    depends_on:
      - db
    entrypoint: ["sh", "-c", "sleep 10 && your_web_app_command"]
```

在这个例子中，`web` 服务的 `entrypoint` 使用了 `sleep 10` 命令，等待 `db` 服务有足够的时间来完全启动。在实际使用中，可以根据需求调整 `sleep` 的时间长度。

#### 配合`restart`策略自动重启

对于较长时间准备就绪的服务，还可以结合 `restart` 策略确保服务启动后可以重试连接依赖的服务。这样，即使在初始启动时依赖服务还没完全就绪，容器也会自动重启并尝试连接，直至成功。

```yml
version: '3.8'

services:
  db:
    image: postgres:latest
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password

  web:
    image: my_web_app_image
    depends_on:
      - db
    restart: on-failure
```

在这个配置中，`web` 服务会在初始启动失败时自动重启，确保数据库可用后能重新尝试启动。

### 环境变量

#### 设置环境变量

**使用`environment`关键字**

可以在 `docker-compose.yml` 文件中，直接通过 `environment` 关键字为服务设置环境变量。这种方法适合于写入明确的环境变量值，适用于少量变量的场景。

```yml
version: '3.8'

services:
  app:
    image: my_app_image
    environment:
      - APP_ENV=production
      - DEBUG=false
      - DATABASE_HOST=db
```

在此例中，`app` 服务会启动时会使用 `APP_ENV`、`DEBUG` 和 `DATABASE_HOST` 作为环境变量。

**使用`.env`文件**

Docker Compose 支持在项目根目录下的 `.env` 文件中定义环境变量。这些变量会**自动**被 `docker-compose.yml` 文件识别，并可以在 Compose 文件中以 `${VAR_NAME}` 方式引用，便于变量集中管理。

```env
# .env 文件
APP_ENV=production
DEBUG=false
DATABASE_HOST=db
```

```yaml
version: '3.8'

services:
  app:
    image: my_app_image
    environment:
      - APP_ENV=${APP_ENV}
      - DEBUG=${DEBUG}
      - DATABASE_HOST=${DATABASE_HOST}
```

在这种配置中，Docker Compose 会自动加载 `.env` 文件的内容，并在服务启动时将其注入到容器中。

**使用`env_file`指定环境文件**

除了 `.env` 文件，还可以使用 `env_file` 指定额外的环境文件，为每个服务单独加载特定环境文件。

1. 创建一个 `app.env` 文件：

```env
# app.env 文件
APP_ENV=production
DEBUG=false
DATABASE_HOST=db
```

2. 在 `docker-compose.yml` 文件中，通过 `env_file` 加载 `app.env` 文件：

```yaml
version: '3.8'

services:
  app:
    image: my_app_image
    env_file:
      - app.env
```

此方法允许对不同服务加载不同的环境文件，在复杂项目中可以使用分离的环境文件来管理各服务配置。

**使用Shell环境变量**

在运行 `docker-compose` 命令时，当前 Shell 的环境变量也会被传递到 Docker Compose 中。这适合于临时指定变量或为敏感数据（如密码）提供动态输入。

```bash
export APP_ENV=production
export DEBUG=false
docker-compose up
```

Docker Compose 将自动识别 `APP_ENV` 和 `DEBUG` 环境变量，并在启动时应用这些值。

**在Compose文件中设置默认值**

可以在 Compose 文件中为环境变量指定默认值，避免在变量未定义的情况下导致错误。使用 `${VAR_NAME:-default_value}` 的格式指定默认值：

```yaml
version: '3.8'

services:
  app:
    image: my_app_image
    environment:
      - APP_ENV=${APP_ENV:-production}
      - DEBUG=${DEBUG:-false}
      - DATABASE_HOST=${DATABASE_HOST:-localhost}
```

在上面的例子中，如果 `APP_ENV`、`DEBUG` 或 `DATABASE_HOST` 未在 `.env` 文件或 Shell 中定义，则会使用默认值 `production`、`false` 和 `localhost`。

#### 环境变量优先级

不同来源的环境变量有优先级顺序，影响最终容器接收到的变量值。以下是 Docker Compose 中环境变量的优先级（从高到低）：

1. Docker CLI 命令行中传递的变量

   - 在运行 `docker-compose` 命令时，可以直接在命令前传递环境变量。例如：

   - ```bash
     APP_ENV=production DEBUG=true docker-compose up
     ```

2. Shell 环境变量

   - 在运行 `docker-compose` 命令之前，也可以使用 `export` 命令来设置 Shell 环境变量：

   - ```bash
     export APP_ENV=production
     docker-compose up
     ```

3. Compose 文件中的 `environment` 指定的变量

   - 可以在 `docker-compose.yml` 文件中使用 `environment` 指定环境变量：

   - ```yaml
     version: '3.8'
     
     services:
       app:
         image: my_app_image
         environment:
           - APP_ENV=development
     ```

4. `.env` 文件中定义的变量

   - 在 Compose 文件所在的目录下定义的 `.env` 文件中的变量会自动被加载并可用于 Compose 文件中引用。例如：

   - ```env
     # .env 文件
     APP_ENV=staging
     DEBUG=false
     ```

5. `env_file` 中的变量

   - 可以在 Compose 文件中指定一个或多个 `env_file` 文件，为每个服务加载特定的环境文件：

   - ```yaml
     version: '3.8'
     
     services:
       app:
         image: my_app_image
         env_file:
           - app.env
     ```

6. 在 Compose 文件中指定的默认值

   - 在 Compose 文件中使用 `${VAR_NAME:-default_value}` 的格式，可以为未定义的变量提供默认值：

   - ```yaml
     version: '3.8'
     
     services:
       app:
         image: my_app_image
         environment:
           - APP_ENV=${APP_ENV:-production}
           - DEBUG=${DEBUG:-false}
     ```

#### 预定义的环境变量

官方文档：[Pre-defined environment variables | Docker Docs](https://docs.docker.com/compose/how-tos/environment-variables/envvars/)

##### `COMPOSE_PROJECT_NAME`

当使用 `COMPOSE_PROJECT_NAME` 设置项目名称后，Docker Compose 会将该名称作为前缀附加在所有相关资源（如容器、网络、卷）上。例如，服务 `web` 会被命名为 `<项目名称>_web`，网络 `default` 会被命名为 `<项目名称>_default`。

`COMPOSE_FILE`

指定 Compose 文件的路径。支持指定多个 Compose 文件。

- 默认行为：如果未提供，则 Compose 会查找当前目录中名为`compose.yaml`或`docker-compose.yaml`的文件，如果未找到，则 Compose 会递归搜索每个父目录，直到找到具有该名称的文件。
- 默认分隔符：指定多个 Compose 文件时，默认情况下，路径分隔符处于打开状态：
  - Mac 和 Linux：`:`（冒号）
  - Windows：`;`（分号）

路径分隔符也可以使用自定义的`COMPOSE_PATH_SEPARATOR`。

例：`COMPOSE_FILE=docker-compose.yml:docker-compose.prod.yml`。

##### `COMPOSE_PROFILES`

用于**选择要启用的配置文件中的特定服务配置集**（也称为“配置文件”或“profiles”）。它允许用户在一个 Compose 文件中定义多个环境或配置集，并在不同场景下有选择地启用或禁用某些服务。

##### `COMPOSE_CONVERT_WINDOWS_PATHS`

启用后，Compose 会在卷定义中执行从 Windows 样式到 Unix 样式的路径转换。

- 支持的值：
  - `true`或`1`， 以启用
  - `false`或`0`， 以禁用
- 默认为：`0`

##### `COMPOSE_PATH_SEPARATOR`

为 `COMPOSE_FILE` 中列出的项目指定不同的路径分隔符。

- 默认为：
  - 在 macOS 和 Linux 上 `:`
  - 在 Windows 上 `;`

##### `COMPOSE_IGNORE_ORPHANS`

启用后，Compose 不会尝试检测项目的孤立容器。

**孤立服务**指的是在 Docker 中运行的容器，但这些容器**不再定义**在当前的 `docker-compose.yml` 文件中。孤立服务通常出现在以下场景：

- 更新了 `docker-compose.yml` 文件，移除了某些服务，但这些服务的容器还在运行。
- 使用了多个 Compose 文件（比如 `docker-compose.override.yml`）定义不同环境下的服务，但在某一环境下不再需要其中的某些服务。

##### `COMPOSE_PARALLEL_LIMIT`

作用：限制并行操作的最大任务数

##### `COMPOSE_ANSI`

指定何时打印 ANSI 控制字符。

- 支持的值：
  - `auto`，Compose 会检测是否可以使用 TTY 模式。否则，请使用纯文本模式。
  - `never`，使用纯文本模式。
  - `always`或者`0`，使用 TTY 模式。
- 默认为： `auto`

`COMPOSE_STATUS_STDOUT`

默认情况下，Docker Compose 可能会将状态信息输出到终端（stderr），而 `COMPOSE_STATUS_STDOUT` 环境变量允许将状态信息转移到标准输出（stdout），方便脚本和工具处理这些输出。

- 支持的值：
  - `true`或 `1`， 以启用
  - `false`或 `0`， 以禁用
- 默认为：`0`

`COMPOSE_ENV_FILES`

允许您指定 Compose 在未使用`--env-file`时应使用哪些环境文件。

使用多个环境文件时，请使用逗号作为分隔符。例如：

```BASH
COMPOSE_ENV_FILES=.env.envfile1, .env.envfile2
```

如果未设置`COMPOSE_ENV_FILES`，并且未在 CLI 中提供`--env-file`，则 Docker Compose 将使用默认行为，即在项目目录中查找`.env`文件。

`COMPOSE_MENU`

启用后，Compose 会显示一个导航菜单，您可以在其中选择在 Docker Desktop 中打开 Compose 堆栈，然后打开[`watch`模式](https://docs.docker.com/compose/how-tos/file-watch/)或使用 [Docker Debug](https://docs.docker.com/reference/cli/docker/debug/)。

- 支持的值：
  - `true`或 `1`， 以启用
  - `false`或 `0`， 以禁用
- 默认为`1`（前提是通过 Docker Desktop 获取了 Docker Compose）；否则默认为`0`。

> 在 Docker Compose 版本 [2.26.0](https://docs.docker.com/compose/releases/release-notes/#2260) 及更高版本以及 Docker Desktop 版本 4.29 及更高版本中可用。

`COMPOSE_EXPERIMENTAL`

用于启用实验性功能。

- 支持的值：
  - `true`或 `1`， 以启用
  - `false`或 `0`， 以禁用
- 默认为`0`

> 在 Docker Compose 版本 [2.26.0](https://docs.docker.com/compose/releases/release-notes/#2260) 及更高版本以及 Docker Desktop 版本 4.29 及更高版本中可用。

##### 覆盖预定义的环境变量

1. 工作目录中的`.env`文件
2. Shell环境变量
3. 命令行

#### 插值

插值（Interpolation）指的是在 `docker-compose.yml` 文件中通过引用环境变量来动态填充配置值。这种方式可以让 Compose 文件更灵活，尤其是在不同环境中复用配置时。插值功能允许在 Compose 文件的各项配置（如镜像名、端口、卷路径等）中使用外部定义的环境变量，确保配置的简洁性和可维护性。

**插值语法**

- 直接替换
  - `${VAR}`：环境变量中的`VAR`值
- 默认值
  - `${VAR:-default}`：若`VAR`已设置且不为空，则为`VAR`，否则为`default`
  - `${VAR-default}`：若`VAR`已设置，则为`VAR`，否则为`default`
- 必须的值
  - `${VAR:?error}`：若`VAR`已设置且不为空，则为`VAR`，否则退出并报错
  - `${VAR?error}`：若`VAR`已设置，则为`VAR`，否则退出并报错
- 可代替的值
  - `${VAR:+replacement}`:若`VAR`已设置且不为空，则为`replacement`,否则为空
  - `${VAR+replacement}`:若`VAR`已设置，则为`replacement`,否则为空

**设置用于插值的变量**

1. SHELL环境变量
2. 若未指定`--env-file`，则为本地工作目录的`.env`文件中的变量

> 可以使用`docker compose config --environment`检查可用的变量/值

#### `.env`文件语法

以下语法规则适用于环境文件：

- 以`#`开头的行将作为注释处理并忽略。
- 空行将被忽略。
- 未加引号和双引号的 （`"`） 值应用了插值。
- 每行表示一个键值对。值可以选择引用。
  - `VAR=VAL` -> `VAL`
  - `VAR="VAL"` -> `VAL`
  - `VAR='VAL'` -> `VAL`
- 未加引号的值的内联注释前面必须有空格。
  - `VAR=VAL # comment` -> `VAL`
  - `VAR=VAL# not a comment` -> `VAL# not a comment`
- 带引号的值的内联注释必须跟在结束引号后面。
  - `VAR="VAL # not a comment"` -> `VAL # not a comment`
  - `VAR="VAL" # comment` -> `VAL`
- 单引号 （`'`） 值按字面意思使用。
  - `VAR='$OTHER'` -> `$OTHER`
  - `VAR='${OTHER}'` -> `${OTHER}`
- 引号可以用`\`
  - `VAR='Let\'s go!'` -> `Let's go!`
  - `VAR="{\"hello\": \"json\"}"` -> `{"hello": "json"}`
- 常见的 shell 转义序列包括`\n`、`\r`、`\t`、`\\` 和 在双引号值中受支持。
  - `VAR="some\tvalue"` -> `some value`
  - `VAR='some\tvalue'` -> `some\tvalue`
  - `VAR=some\tvalue` -> `some\tvalue`

### Compose Watch

`Compose Watch` 是 Docker Compose 的一个**实验性功能**，允许在服务的文件内容变化时自动触发重新构建和重启。这对于开发环境特别有用，因为它能在代码文件更新时自动反映在容器中，而无需手动重启服务，提升了开发效率。

启用实验性功能的方法有：

1. 在系统的环境变量中设置 `COMPOSE_EXPERIMENTAL`为`enabled`

   ```bash
   export COMPOSE_EXPERIMENTAL=enabled
   ```

2. 在`.env`文件中添加

   ```env
   COMPOSE_EXPERIMENTAL=enabled
   ```

`watch`遵循以下文件路径规则：

- 所有路径都相对于项目目录
- 以递归方式监视目录
- 不支持 **glob** 模式
- `.dockerignore`中定义的规则
  - 使用`ignore`选项定义额外的被忽略路径
  - 常见IDEs（Vim、Emacs、JetBrains等）的临时/备份文件会自动忽略
  - `.git`目录会自动被忽略

#### 使用方法

1. 将`watch`部分添加到一个或多个`compose.yaml`服务中
2. 运行`docker compose up --watch`以构建和启动Compose项目并启动文件观看模式。
3. 使用您首选的IDE或编辑器编辑服务源文件。

#### `action`

**Sync**

`action`如果设置为`sync`，则 Compose 可确保对主机上的文件所做的任何更改都自动与服务容器中的相应文件匹配

`sync`非常适合支持 “Hot Reload” 或等效功能的框架。

更一般地说，在许多开发用例中，`sync`可以代替bind mount。

**Rebuild**

`action`如果设置为`rebuild`，则 Compose 会自动使用 BuildKit 构建新映像，并替换正在运行的服务容器。

该行为与运行`docker compose up --build <svc>`是相同的。

Rebuild 非常适合编译语言，或者作为需要对镜像完整重建的后备方案（例如 `package.json` ）。

**Sync+Restart**

`action`如果设置为`sync+restart`，则 Compose 会将更改与服务容器同步并重新启动它。

当配置文件发生变化时，`sync+restart`是理想的选择，您不需要重建镜像，只需重新启动服务容器的主进程即可。例如，当您更新数据库配置或`nginx.conf`文件时，它会很好地工作

#### 示例

```目录结构
myproject/
├── web/
│   ├── App.jsx
│   └── index.js
├── Dockerfile
├── compose.yaml
└── package.json
```

```yaml
services:
  web:
    build: .
    command: npm start
    develop:
      watch:
        - action: sync
          path: ./web
          target: /src/web
          ignore:
            - node_modules/
        - action: rebuild
          path: package.json
```

在本例中，当运行`docker compose up --watch`时，使用从项目根目录中的Dockerfile构建的镜像启动Web服务的容器。Web服务为其命令运行`npm start`，然后启动应用程序的开发版本（Webpack、Vite、Turbopack等），该应用程序在Inbox中启用了Hot Mode Inbox。 

服务启动后，监视模式开始监视目标目录和文件。然后，每当`web/`目录中的源文件发生更改时，Compose就会将该文件同步到容器内`/src/web`下的相应位置。例如`./web/App.jsx`被复制到`/src/web/App.jsx`。 

复制后，分配器会更新正在运行的应用程序，而无需重新启动。 

与源代码文件不同，添加新的依赖项不能实时完成，因此每当`Package.json`更改时，Compose都会重新构建镜像并重新创建Web服务容器。

---

```yaml
services:
  web:
    build: .
    command: npm start
    develop:
      watch:
        - action: sync
          path: ./web
          target: /app/web
          ignore:
            - node_modules/
        - action: sync+restart
          path: ./proxy/nginx.conf
          target: /etc/nginx/conf.d/default.conf

  backend:
    build:
      context: backend
      target: builder
```

此设置演示了如何使用Docker Compose中的同步+重启操作来高效地开发和测试具有前端Web服务器和后台服务的Node.js应用程序。该配置确保对应用程序代码和配置文件的更改快速同步和应用，并根据需要重新启动Web服务以反映更改。

#### glob模式

**`\*`（星号）**
匹配任意数量的字符（包括零个字符）。它通常用来匹配文件名或目录中的任意部分。

示例：

- `*.txt`：匹配当前目录下所有扩展名为 `.txt` 的文件。
- `dir/*.js`：匹配 `dir` 目录下所有扩展名为 `.js` 的文件。

**`?`（问号）**
匹配一个字符（只能匹配一个字符）。通常用于匹配特定位置的单个字符。

示例：

- `file?.txt`：匹配 `file1.txt`、`fileA.txt` 等，但不匹配 `file10.txt`。

**`[...]`（方括号）**
匹配方括号内的任意单个字符。可以指定一个字符集，匹配其中任意一个字符。

示例：

- `file[123].txt`：匹配 `file1.txt`、`file2.txt`、`file3.txt`，但不匹配 `file4.txt`。
- `file[a-d].txt`：匹配 `filea.txt`、`fileb.txt`、`filec.txt`、`filed.txt`。

**`{}`（花括号）**
花括号用来指定多个选项的匹配，类似于正则表达式中的替代符号。

示例：

- `file.{txt,md}`：匹配 `file.txt` 或 `file.md`。

**`\**`（双星号）**
匹配零个或多个目录（递归匹配）。这是一个扩展特性，不是所有的 glob 实现都支持。在 Docker Compose 中使用时，可以用来匹配子目录。

示例：

- `dir/**/*.js`：匹配 `dir` 目录及其所有子目录下的 `.js` 文件。
- `**/*.txt`：匹配当前目录及其所有子目录下的 `.txt` 文件。

### Compose Secrets

**密钥**（Secrets）主要用于管理和保护敏感信息（如 API 密钥、数据库密码等），使其能够安全地传递到容器中。Docker Compose 提供了一种通过 `secrets` 配置来处理和使用这些敏感数据的机制，通常用于确保在容器之间安全地传递敏感信息，而不会将这些信息暴露在配置文件中。

**特点**

- **加密存储**：所有密钥都会加密存储，只有需要它们的服务才能访问。
- **仅对服务暴露**：Secrets 不会被暴露给 Docker 容器之外的进程，只有通过 Docker Compose 或 Docker Swarm 部署的服务能够访问。
- **有限的生命周期**：Secrets 会在需要时自动传递给容器，而不会保存在容器中，生命周期有限。

**使用案例**

```yaml
version: '3.9'

services:
  web:
    image: myapp
    secrets:
      - db_password
    environment:
      - DB_PASSWORD=/run/secrets/db_password

secrets:
  db_password:
    file: ./db_password.txt
```

- `db_password` 是我们定义的 secret。
- `file: ./db_password.txt` 指定了存储敏感数据的文件（可以是本地文件路径）。
- 在 `web` 服务中通过 `secrets` 字段将 `db_password` 添加到服务中，并在环境变量中使用 `/run/secrets/db_password` 来访问这个密钥。

### Compose network

在 Docker Compose 中，每个服务默认都会连接到一个自动创建的网络。这个网络的名称是由 Compose 项目名称和 `_default` 后缀组成的。例如，如果你的 Compose 项目名称是 `myapp`，默认的网络名称将是 `myapp_default`。

在默认的情况下，Docker Compose 会创建一个桥接网络（bridge network）。在同一个网络中的容器可以相互通信，而默认网络对于容器间的 DNS 解析和通信是透明的。

**默认网络的行为：**

- 每个服务可以通过服务名访问其他服务。
- 默认情况下，不同 Compose 项目中的容器之间是隔离的。

**更新网络上的容器：**

如果您对服务进行配置更改并运行`docker compose up`更新，旧容器将被删除，新容器将使用不同的 IP 地址（但名称相同）加入网络。正在运行的容器可以查找该名称并连接到新地址，但旧地址将停止工作。

如果任何容器与旧容器有连接，则这些连接将被关闭。容器负责检测此情况，再次查找名称并重新连接。

> 尽可能通过名称而不是 IP 引用容器。否则，您需要不断更新您使用的 IP 地址。

**配置默认网络**

```yaml
services:
  web:
    build: .
    ports:
      - "8000:8000"
  db:
    image: postgres

networks:
  default:
    # Use a custom driver
    driver: custom-driver-1
```

**配置自定义网络：**

可以在 Compose 文件的 `networks` 部分定义一个或多个自定义网络。然后，使用 `networks` 关键字将服务连接到这些网络。

```yaml
version: '3.9'

services:
  web:
    image: myapp
    networks:
      - front
  db:
    image: postgres
    networks:
      - back
  proxy:
  	image: nginx
  	networks:
  	  - front
  	  - back

networks:
  front:
    driver: bridge
  back:
    driver: bridge
```

在这个例子中，`front` 和 `back` 是两个自定义网络：

- `web` 服务连接到 `front` 网络。
- `db` 服务连接到 `back` 网络。
- `proxy`连接到 `front` 和 `back` 网络，`web `和 `db `不能直接通信。

> 其它知识点：
>
> - 可以通过为每个连接的网络设置[ipv4_address 和/或 ipv6_address](https://docs.docker.com/reference/compose-file/services/#ipv4_address-ipv6_address)来为网络配置静态 IP 地址 。
> - 网络也可以被赋予 [自定义名称](https://docs.docker.com/reference/compose-file/networks/#name)：

**使用现有网络**

如果你希望容器加入现有网络，请使用以下[`external`选项](https://docs.docker.com/reference/compose-file/networks/#external)

```yaml
services:
  # ...
networks:
  network1:
    name: my-pre-existing-network
    external: true
```

Compose不会尝试创建一个名为 `[projectname]_default的网络`，而是寻找一个名为 `my-pre-existing-network` 的网络并将您应用的容器连接到该网络。

### 使用多个Compose文件

使用多个 Compose 文件，您可以针对不同的环境或工作流自定义 Compose 应用程序。这对于可能使用数十个容器且所有权分布在多个团队的大型应用程序非常有用。

#### Merge

默认情况下，Compose 会读取两个文件，一个`compose.yaml`和可选`compose.override.yaml`文件。按照惯例，`compose.yaml` 包含您的基本配置。覆盖文件可以包含现有服务或全新服务的配置覆盖。

如果两个文件中都定义了一个服务，Compose 将使用下面描述的规则和 [Compose 规范](https://docs.docker.com/reference/compose-file/merge/)中描述的规则合并配置。

**使用方法**

要使用多个覆盖文件或具有不同名称的覆盖文件，您可以使用预定义的 [COMPOSE_FILE](https://docs.docker.com/compose/how-tos/environment-variables/envvars/#compose_file)环境变量，或使用`-f`选项指定文件列表。

Compose 按照命令行中指定的顺序合并文件。后续文件可能会合并、覆盖或添加到其前一个文件。

例如：`docker compose -f compose.yaml -f compose.admin.yaml run backup_db`

该`compose.yaml`文件可能指定一项`webapp`服务。

```yaml
webapp:
  image: examples/web
  ports:
    - "8000:8000"
  volumes:
    - "/data"
```

也可以`compose.admin.yaml`指定相同的服务：

```yaml
webapp:
  environment:
    - DEBUG=1
```

任何匹配的字段都会覆盖前一个文件。新值会添加到`webapp`服务配置中：

```yaml
webapp:
  image: examples/web
  ports:
    - "8000:8000"
  volumes:
    - "/data"
  environment:
    - DEBUG=1
```

**合并规则**

路径是相对于基础文件进行评估的。使用多个 Compose 文件时，必须确保文件中的所有路径都相对于基础 Compose 文件（使用`-f`指定的第一个 Compose 文件）。这是必需的，因为覆盖文件不必是有效的 Compose 文件。覆盖文件可以包含小段配置。跟踪服务的哪个片段与哪个路径相关既困难又令人困惑，因此为了让路径更容易理解，所有路径都必须相对于基础文件进行定义。

> [!tip]
>
> 可以使用`docker compose config`来检查合并的配置并避免与路径相关的问题。

Compose 将配置从原始服务复制到本地服务。如果原始服务和本地服务中都定义了配置选项，则本地值将替换或扩展原始值。

- 对于单值选项（如`image`、`command`或`mem_limit`），新值将替换旧值。

  原有服务：

  ```yaml
  services:
    myservice:
      # ...
      command: python app.py
  ```

  本地服务：

  ```yaml
  services:
    myservice:
      # ...
      command: python otherapp.py
  ```

  结果：

  ```yaml
  services:
    myservice:
      # ...
      command: python otherapp.py
  ```

- 对于多值选项`ports`、`expose`、`external_links`、`dns`、`dns_search`和`tmpfs`，Compose 将连接两组值：

  原有服务：

  ```yaml
  services:
    myservice:
      # ...
      expose:
        - "3000"
  ```

  本地服务：

  ```yaml
  services:
    myservice:
      # ...
      expose:
        - "4000"
        - "5000"
  ```

  结果：

  ```yaml
  services:
    myservice:
      # ...
      expose:
        - "3000"
        - "4000"
        - "5000"
  ```

- 对于`environment`、`labels`、`volumes`和`devices`，Compose 会将条目“合并”在一起，其中本地定义的值优先。对于`environment`和`labels`，环境变量或标签名称决定使用哪个值：

  原有服务：

  ```yaml
  services:
    myservice:
      # ...
      environment:
        - FOO=original
        - BAR=original
  ```

  本地服务：

  ```yaml
  services:
    myservice:
      # ...
      environment:
        - BAR=local
        - BAZ=local
  ```

  结果：

  ```yaml
  services:
    myservice:
      # ...
      environment:
        - FOO=original
        - BAR=local
        - BAZ=local
  ```

- `volumes`和 的条目`devices`使用容器中的挂载路径合并：

  原有服务：

  ```yaml
  services:
    myservice:
      # ...
      volumes:
        - ./original:/foo
        - ./original:/bar
  ```

  本地服务：

  ```yaml
  services:
    myservice:
      # ...
      volumes:
        - ./local:/bar
        - ./local:/baz
  ```

  结果：

  ```yaml
  services:
    myservice:
      # ...
      volumes:
        - ./original:/foo
        - ./local:/bar
        - ./local:/baz
  ```

> 有关更多合并规则，请参阅 Compose 规范中的[合并与覆盖。](https://docs.docker.com/reference/compose-file/merge/)

#### Extend

Docker Compose的[`extends`属性](https://docs.docker.com/reference/compose-file/services/#extends)可以在不同的文件之间，甚至完全不同的项目之间共享通用配置。

如果有多个服务重复使用一组通用的配置选项，那么扩展服务会很有用。`extends`您可以在一个地方定义一组通用的服务选项，并从任何地方引用它。您可以引用另一个 Compose 文件并选择您想在自己的应用程序中使用的服务，并能够根据自己的需要覆盖某些属性。

> [!important]
>
> 当您使用多个 Compose 文件时，必须确保文件中的所有路径都相对于基本 Compose 文件（即主项目文件夹中的 Compose 文件）。这是必需的，因为扩展文件不必是有效的 Compose 文件。

**从另一个文件扩展服务**

示例：

```yaml
services:
  web:
    extends:
      file: common-services.yml
      service: webapp
```

这指示 Compose 仅重复使用文件`webapp`中定义的服务的属性`common-services.yml`。`webapp`服务本身不是最终项目的一部分。

如果`common-services.yml` 看起来像这样：

```yaml
services:
  webapp:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - "/data"
```

您获得的结果与使用`docker-compose.yml`在`web`下直接定义的相同`build`、`ports`和`volumes`配置值所写的结果完全相同。



要在从另一个文件扩展服务时将该服务包含`webapp`在最终项目中，您需要在当前 Compose 文件中明确包含这两项服务。例如（注意，这是一个非规范示例）：

```yaml
services:
  web:
    build: alpine
    command: echo
    extends:
      file: common-services.yml
      service: webapp
  webapp:
    extends:
      file: common-services.yml
      service: webapp
```

或者使用 [include](https://docs.docker.com/compose/how-tos/multiple-compose-files/include/)。

**在同一个文件中扩展服务**

如果在同一个 Compose 文件中定义服务并从另一个服务扩展一个服务，则原始服务和扩展服务都将成为最终配置的一部分。例如：

```yaml
services:
  web:
    build: alpine
    extends: webapp
  webapp:
    environment:
      - DEBUG=1
```

**在同一个文件内以及从另一个文件扩展服务**

可以进一步在本地定义或重新定义配置 `compose.yaml`：

```yaml
services:
  web:
    extends:
      file: common-services.yml
      service: webapp
    environment:
      - DEBUG=1
    cpu_shares: 5

  important_web:
    extends: web
    cpu_shares: 10
```

#### Include

> [!caution]
>
> docker com­pose 中 in­clude 的原理类似于把被 in­clude 文件的内容复制粘贴进当前的文件，所以与 `Extend` 与 `Merge` 的行为不同，同名的资源将不会被合并，而是直接报错 `defines conflicting service/network`，所以仅建议将 in­clude 用于拆分文件

基础示例：

```yaml
services:
  A:
    image: A
  B:
    image: B
  C:
    image: C
```

以上文件使用 in­clude 选项可以拆分为以下文件：

```yaml
# a.yml
services:
  A:
    image: nginx
```

```yaml
# b.yml
services:
  B:
    image: nginx
```

```yaml
# compose.yml
include:
  - a.yml
  - b.yml

services:
  C:
    image: nginx
```

此时使用 `docker compose config` 命令解析配置文件，可以看到 com­pose 文件被解析为了:

```yaml
❯ docker compose config
name: compose
services:
  A:
    image: nginx
    networks:
      default: null
  B:
    image: nginx
    networks:
      default: null
  C:
    image: nginx
    networks:
      default: null
networks:
  default:
    name: compose_default
```

使用 `docker compose up -d` 即可启动全部服务

## Portainter

Docker可视化工具：[Portainer](https://docs.portainer.io/start/intro)

