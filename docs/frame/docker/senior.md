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

![bridge模式原理](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202410310848019.png)

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



## Portainter



