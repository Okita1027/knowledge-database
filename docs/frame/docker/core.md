---
title: 基础篇
shortTitle: 基础篇
description: 
date: 2024-06-16 22:11:18
categories: [容器]
tags: [Docker]
---
# 初识Docker
## 什么是Docker
微服务虽然具备各种各样的优势，但服务的拆分通用给部署带来了很大的麻烦。

- 分布式系统中，依赖的组件非常多，不同组件之间部署时往往会产生一些冲突。
- 在数百上千台服务中重复部署，环境不一定一致，会遇到各种问题
### 应用部署的环境问题
大型项目组件较多，运行环境也较为复杂，部署时会碰到一些问题：

-  依赖关系复杂，容易出现兼容性问题 
-  开发、测试、生产环境有差异 

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171604593.png)
例如一个项目中，部署时需要依赖于node.js、Redis、RabbitMQ、MySQL等，这些服务部署时所需要的函数库、依赖项各不相同，甚至会有冲突。给部署带来了极大的困难。

### Docker解决依赖兼容问题
而Docker确巧妙的解决了这些问题，Docker是如何实现的呢？
Docker为了解决依赖的兼容问题的，采用了两个手段：

-  将应用的Libs（函数库）、Deps（依赖）、配置与应用一起打包 
-  将每个应用放到一个隔离**容器**去运行，避免互相干扰 

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171605369.png)
这样打包好的应用包中，既包含应用本身，也保护应用所需要的Libs、Deps，无需再操作系统上安装这些，自然就不存在不同应用之间的兼容问题了。
虽然解决了不同应用的兼容问题，但是开发、测试等环境会存在差异，操作系统版本也会有差异，怎么解决这些问题呢？

### Docker解决OS环境差异
要解决不同操作系统环境差异问题，必须先了解操作系统结构。以一个Ubuntu操作系统为例，结构如下：
![image](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171614469.png)
结构包括：

- 计算机硬件：例如CPU、内存、磁盘等
- 系统内核：所有Linux发行版的内核都是Linux，例如CentOS、Ubuntu、Fedora等。内核可以与计算机硬件交互，对外提供**内核指令**，用于操作计算机硬件。
- 系统应用：操作系统本身提供的应用、函数库。这些函数库是对内核指令的封装，使用更加方便。

应用于计算机交互的流程如下：

1. 应用调用操作系统应用（函数库），实现各种功能
2. 系统函数库是对内核指令集的封装，会调用内核指令
3. 内核指令操作计算机硬件

Ubuntu和CentOSpringBoot都是基于Linux内核，无非是系统应用不同，提供的函数库有差异：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171605116.png)
此时，如果将一个Ubuntu版本的MySQL应用安装到CentOS系统，MySQL在调用Ubuntu函数库时，会发现找不到或者不匹配，就会报错了：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171605721.png)
Docker如何解决不同系统环境的问题？

- Docker将用户程序与所需要调用的系统(比如Ubuntu)函数库一起打包
- Docker运行到不同操作系统时，直接基于打包的函数库，借助于操作系统的Linux内核来运行

如图：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171605153.png)

**总结**

Docker如何解决大型项目依赖关系复杂，不同组件依赖的兼容性问题

- Docker允许开发中将应用、依赖、函数库、配置一起**打包**，形成可移植镜像
- Docker应用运行在容器中，使用沙箱机制，相互**隔离**

Docker如何解决开发、测试、生产环境有差异的问题？

- Docker镜像中包含完整运行环境，包括系统函数库，仅依赖系统的Linux内核，因此可以在任意Linux操作系统上运行

Docker是一个快速交付应用、运行应用的技术，具备下列优势：

- 可以将程序及其依赖、运行环境一起打包为一个镜像，可以迁移到任意Linux操作系统
- 运行时利用沙箱机制形成隔离容器，各个应用互不干扰
- 启动、移除都可以通过一行命令完成，方便快捷
## Docker和虚拟机
Docker可以让一个应用在任何操作系统中非常方便的运行。而以前我们接触的虚拟机，也能在一个操作系统中，运行另外一个操作系统，保护系统中的任何应用。
两者有什么差异呢？
**虚拟机**是在操作系统中**模拟**硬件设备，然后运行另一个操作系统，比如在 Windows 系统里面运行 Ubuntu 系统，这样就可以运行任意的Ubuntu应用了。
**Docker**仅仅是封装函数库，并没有模拟完整的操作系统，如图：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171605885.png)

![Docker对比虚拟机](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171605181.png)



**Docker比虚拟机快的原因**

1. docker有着比虚拟机更少的抽象层

由于docker不需要Hypervisor(虚拟机)实现硬件资源虚拟化,运行在docker容器上的程序直接使用的都是实际物理机的硬件资源。因此在CPU、内存利用率上docker将会在效率上有明显优势。

2. docker利用的是宿主机的内核,而不需要加载操作系统OS内核

当新建一个容器时,docker不需要和虚拟机一样重新加载一个操作系统内核。进而避免引寻、加载操作系统内核返回等比较费时费资源的过程,当新建一个虚拟机时,虚拟机软件需要加载OS,返回新建过程是分钟级别的。而docker由于直接利用宿主机的操作系统,则省略了返回过程,因此新建一个docker容器只需要几秒钟。

**小结**
Docker和虚拟机的差异：

-  docker是一个系统进程；虚拟机是在操作系统中的操作系统 
-  docker体积小、启动速度快、性能好；虚拟机体积大、启动速度慢、性能一般 
## Docker架构
### 镜像与容器
**镜像（Image）**

Docker将应用程序及其所需的依赖、函数库、环境、配置等文件打包在一起，称为镜像。

**分层的镜像**

以`pull`为例，在下载的过程中可以看到docker的镜像好像是在一层一层的在下载

**UnionFS(联合文件系统)**

Union文件系统（UnionFS）是一种分层、轻量级并且高性能的文件系统，它支持对文件系统的修改作为一次提交来一层层的叠加，同时可以将不同目录挂载到同一个虚拟文件系统下。

Union 文件系统是 Docker 镜像的基础。镜像可以通过分层来进行继承，基于基础镜像（没有父镜像），可以制作各种具体的应用镜像。 

特性：一次同时加载多个文件系统，但从外面看起来，只能看到一个文件系统，联合加载会把各层文件系统叠加起来，这样最终的文件系统会包含所有底层的文件和目录

**容器（Container）**

镜像中的应用程序运行后形成的进程就是容器，只是Docker会给容器进程做隔离，对外不可见。

一切应用最终都是代码组成，都是硬盘中的一个个的字节形成的文件。只有运行时，才会加载到内存，形成进程。
镜像就是把一个应用在硬盘上的文件、及其运行环境、部分系统函数库文件一起打包形成的文件包。这个文件包是只读的。
容器就是将这些文件中编写的程序、函数加载到内存中运行，形成进程，只不过要隔离起来。因此一个镜像可以启动多次，形成多个容器进程。

Docker镜像层都是只读的，容器层是可写的，当容器启动时，一个新的可写层被加载到镜像的顶部。这一层通常被称作“容器层”，“容器层”之下的都叫“镜像层”。当容器启动时，一个新的可写层被加载到镜像的顶部。这一层通常被称作“容器层”，“容器层”之下的都叫“镜像层”。所有对容器的改动，无论添加、删除、还是修改文件都只会发生在容器层中。只有容器层是可写的，容器层下面的所有镜像层都是只读的。

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171605794.png)

#### 虚悬镜像

`REPOSITORY`和`TAG`均为`<none>`的镜像为*虚悬镜像*。

产生原因：新旧镜像同名，旧镜像名称被取消，从而出现仓库名、标签均为 `<none>`。

可以用该命令专门显示这种镜像`docker image ls -f dangling=true`

> 一般来说，虚悬镜像已经失去了存在的价值，是可以随意删除的，可以用`docker image prune`命令删除。

#### 中间层镜像

为了加速镜像构建、重复利用资源，Docker 会利用 **中间层镜像**。所以在使用一段时间后，可能会看到一些依赖的中间层镜像。默认的 `docker image ls` 列表中只会显示顶层镜像，如果希望显示包括中间层镜像在内的所有镜像的话，需要加 `-a` 参数，即`docker image ls -a`。

这样会看到很多无标签的镜像，与之前的虚悬镜像不同，这些无标签的镜像很多都是中间层镜像，是其它镜像所依赖的镜像。这些无标签镜像不应该删除，否则会导致上层镜像因为依赖丢失而出错。实际上，这些镜像也没必要删除，因为之前说过，相同的层只会存一遍，而这些镜像是别的镜像的依赖，因此并不会因为它们被列出来而多存了一份，无论如何你也会需要它们。只要删除那些依赖它们的镜像后，这些依赖的中间层镜像也会被连带删除。

### DockerHub

开源应用程序非常多，打包这些应用往往是重复的劳动。为了避免这些重复劳动，人们就会将自己打包的应用镜像，例如Redis、MySQL镜像放到网络上，共享使用，就像GitHub的代码共享一样。

-  DockerHub：DockerHub是一个官方的Docker镜像的托管平台。这样的平台称为Docker Registry。 
-  国内也有类似于DockerHub 的公开服务，比如 [网易云镜像服务](https://c.163yun.com/hub)、[阿里云镜像库](https://cr.console.aliyun.com/)等。 

我们一方面可以将自己的镜像共享到DockerHub，另一方面也可以从DockerHub拉取镜像：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171605503.png)

### Docker架构
我们要使用Docker来操作镜像、容器，就必须要安装Docker。
Docker是一个CS架构的程序，由两部分组成：

-  服务端(server)：Docker守护进程，负责处理Docker指令，管理镜像、容器等 
-  客户端(client)：通过命令或RestAPI向Docker服务端发送指令。可以在本地或远程向服务端发送指令。 

如图：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171605266.png)

**总结**

镜像：

- 将应用程序及其依赖、环境、配置打包在一起

容器：

- 镜像运行起来就是容器，一个镜像可以运行多个容器

Docker结构：

-  服务端：接收命令或远程请求，操作镜像或容器 
-  客户端：发送命令或者请求到Docker服务端 

DockerHub：

- 一个镜像托管的服务器，类似的还有阿里云镜像服务，统称为DockerRegistry
# Docker基本操作
## 常用命令
[官方文档命令传送门](https://docs.docker.com/engine/reference/commandline/cli/)

| **命令** | **说明** |
| :-: | :-: |
| docker pull | 拉取镜像 |
| docker push | 推送镜像到Docker Registry |
| docker images | 查看本地镜像 |
| docker rmi | 删除本地镜像 |
| docker run | 创建并运行容器（不能重复创建） |
| docker stop | 停止指定容器 |
| docker kill | 强制停止容器 |
| docker start | 启动指定容器 |
| docker restart | 重新启动容器 |
| docker top | 查看容器内运行的进程 |
| docker logs | 查看容器日志 |
| docker inspect | 查看容器内部细节 |
| docker cp | 从容器内拷贝文件到主机上 |

![docker命令的关系](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171606204.png)
默认情况下，每次重启虚拟机我们都需要手动启动Docker和Docker中的容器。通过命令可以实现开机自启：

```shell
# Docker开机自启
systemctl enable docker

# Docker容器开机自启
docker update --restart=always [容器名/容器id]
```
### 命令别名

给常用Docker命令起别名，方便我们访问：
```shell
# 修改/root/.bashrc文件
vi /root/.bashrc
```
内容如下：
```shell
# .bashrc

# User specific aliases and functions

alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'
alias dps='docker ps --format "table {{.ID}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}\t{{.Names}}"'
alias dis='docker images'

# Source global definitions
if [ -f /etc/bashrc ]; then
        . /etc/bashrc
fi
```
然后，执行命令使别名生效
```shell
source /root/.bashrc
```
## 镜像操作
### 镜像名称
首先来看下镜像的名称组成：

- 镜像名称一般分两部分组成：[repository]:[tag]。
- 在没有指定tag时，默认是latest，代表最新版本的镜像

如图：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171606203.png)
这里的mysql就是repository，5.7就是tag，合一起就是镜像名称，代表5.7版本的MySQL镜像。

### 镜像命令
![常见的镜像操作命令](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171606506.png)
#### 案例1-拉取、查看镜像
需求：从DockerHub中拉取一个nginx镜像并查看

1. 首先去镜像仓库搜索nginx镜像，比如[DockerHub](https://hub.docker.com/):

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171606065.png)

2. 根据查看到的镜像名称，拉取自己需要的镜像，通过命令：docker pull nginx

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171606036.png)

3. 通过命令：docker images 查看拉取到的镜像

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171606261.png)
#### 案例2-保存、导入镜像
需求：利用docker save将nginx镜像导出磁盘，然后再通过load加载回来

1. 利用docker xx --help命令查看docker save和docker load的语法

例如，查看save命令用法，可以输入命令：
```shell
docker save --help
```
结果：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171606258.png)
命令格式：

```shell
docker save -o [保存的目标文件名称] [镜像名称]
```

2. 使用docker save导出镜像到磁盘

运行命令：
```shell
docker save -o nginx.tar nginx:latest
```
结果如图：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171606751.png)

3. 使用docker load加载镜像

先删除本地的nginx镜像：
```shell
docker rmi nginx:latest
```
然后运行命令，加载本地文件：
```shell
docker load -i nginx.tar
```
结果：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171606696.png)

### 删除镜像

如果要删除本地的镜像，可以使用 `docker image rm` 命令，其格式为：

```shell
docker image rm [选项] <镜像1> [<镜像2> ...]
```

其中，`<镜像>` 可以是 `镜像短 ID`、`镜像长 ID`、`镜像名` 或者 `镜像摘要`。

比如我们有这么一些镜像：

```shell
REPOSITORY                  TAG                 IMAGE ID            CREATED             SIZE
centos                      latest              0584b3d2cf6d        3 weeks ago         196.5 MB
redis                       alpine              501ad78535f0        3 weeks ago         21.03 MB
docker                      latest              cf693ec9b5c7        3 weeks ago         105.1 MB
nginx                       latest              e43d811ce2f4        5 weeks ago         181.5 MB
```

可以用镜像的完整 ID，也称为 `长 ID`，来删除镜像。使用脚本的时候可能会用长 ID，但是人工输入就太累了，所以更多的时候是用 `短 ID` 来删除镜像。`docker image ls` 默认列出的就已经是短 ID 了，一般取前3个字符以上，只要足够区分于别的镜像就可以了。

比如这里，如果要删除 `redis:alpine` 镜像：可以执行：

```shell
$ docker image rm 501
Untagged: redis:alpine
Untagged: redis@sha256:f1ed3708f538b537eb9c2a7dd50dc90a706f7debd7e1196c9264edeea521a86d
Deleted: sha256:501ad78535f015d88872e13fa87a828425117e3d28075d0c117932b05bf189b7
Deleted: sha256:96167737e29ca8e9d74982ef2a0dda76ed7b430da55e321c071f0dbff8c2899b
Deleted: sha256:32770d1dcf835f192cafd6b9263b7b597a1778a403a109e2cc2ee866f74adf23
Deleted: sha256:127227698ad74a5846ff5153475e03439d96d4b1c7f2a449c7a826ef74a2d2fa
Deleted: sha256:1333ecc582459bac54e1437335c0816bc17634e131ea0cc48daa27d32c75eab3
Deleted: sha256:4fc455b921edf9c4aea207c51ab39b10b06540c8b4825ba57b3feed1668fa7c7
```

也可以用`镜像名`，也就是 `<仓库名>:<标签>`，来删除镜像，可以执行:

```shell
$ docker image rm centos
Untagged: centos:latest
Untagged: centos@sha256:b2f9d1c0ff5f87a4743104d099a3d561002ac500db1b9bfa02a783a46e0d366c
Deleted: sha256:0584b3d2cf6d235ee310cf14b54667d889887b838d3f3d3033acd70fc3c48b8a
Deleted: sha256:97ca462ad9eeae25941546209454496e1d66749d53dfa2ee32bf1faabd239d38
```

更精确的是使用`镜像摘要`删除镜像，如下：

```shell
$ docker image ls --digests
REPOSITORY                  TAG                 DIGEST                                                                    IMAGE ID            CREATED             SIZE
node                        slim                sha256:b4f0e0bdeb578043c1ea6862f0d40cc4afe32a4a582f3be235a3b164422be228   6e0c4c8e3913        3 weeks ago         214 MB

$ docker image rm node@sha256:b4f0e0bdeb578043c1ea6862f0d40cc4afe32a4a582f3be235a3b164422be228
Untagged: node@sha256:b4f0e0bdeb578043c1ea6862f0d40cc4afe32a4a582f3be235a3b164422be228
```

#### Untagged和Deleted

删除行为分为两类，一类是 `Untagged`，另一类是 `Deleted`。之前介绍过，镜像的唯一标识是其 ID 和摘要，而一个镜像可以有多个标签。

因此当使用上面命令删除镜像的时候，实际上是在要求删除某个标签的镜像。所以首先需要做的是将满足我们要求的所有镜像标签都取消，这就是我们看到的 `Untagged` 的信息。因为一个镜像可以对应多个标签，因此当我们删除了所指定的标签后，可能还有别的标签指向了这个镜像，如果是这种情况，那么 `Delete` 行为就不会发生。所以并非所有的 `docker image rm` 都会产生删除镜像的行为，有可能仅仅是取消了某个标签而已。

当该镜像所有的标签都被取消了，该镜像很可能会失去了存在的意义，因此会触发删除行为。镜像是多层存储结构，因此在删除的时候也是从上层向基础层方向依次进行判断删除。镜像的多层结构让镜像复用变得非常容易，因此很有可能某个其它镜像正依赖于当前镜像的某一层。这种情况，依旧不会触发删除该层的行为。直到没有任何层依赖当前层时，才会真实的删除当前层。这就是为什么，有时候会奇怪，为什么明明没有别的标签指向这个镜像，但是它还是存在的原因，也是为什么有时候会发现所删除的层数和自己 `docker pull` 看到的层数不一样的原因。

除了镜像依赖以外，还需要注意的是容器对镜像的依赖。如果有用这个镜像启动的容器存在（即使容器没有运行），那么同样不可以删除这个镜像。容器是以镜像为基础，再加一层容器存储层，组成这样的多层存储结构去运行的。因此该镜像如果被这个容器所依赖的，那么删除必然会导致故障。如果这些容器是不需要的，应该先将它们删除，然后再来删除镜像。

**总结：**

- **Untagged**：指镜像没有任何标签指向，但仍然存在于系统中。
- **Deleted**：指镜像已完全从系统中移除，不再占用任何存储空间。

#### 命令的结合使用

像其它可以承接多个实体的命令一样，可以使用 `docker image ls -q` 来配合使用 `docker image rm`，这样可以成批的删除希望删除的镜像。很多过滤镜像列表的方式都可以拿过来使用。

比如，我们需要删除所有仓库名为 `redis` 的镜像：

```
$ docker image rm $(docker image ls -q redis)
```

或者删除所有在 `mongo:3.2` 之前的镜像：

```
$ docker image rm $(docker image ls -q -f before=mongo:3.2)
```

## 容器操作

### 容器相关命令
容器操作的命令如图：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171606877.png)
容器保护三个状态：

- 运行：进程正常运行
- 暂停：进程暂停，CPU不再运行，并不释放内存
- 停止：进程终止，回收进程占用的内存、CPU等资源

其中：

-  docker run：创建并运行一个容器，处于运行状态 
-  docker pause：让一个运行的容器暂停 
-  docker unpause：让一个容器从暂停状态恢复运行 
-  docker stop：停止一个运行的容器 
-  docker start：让一个停止的容器再次运行 
-  docker rm：删除一个容器 
   -  如果要删除一个运行中的容器，可以添加 `-f` 参数。Docker 会发送 `SIGKILL` 信号给容器。
-  docker prune: 清理所有处于终止状态的容器

#### attach命令

```shell
$ docker run -dit ubuntu
243c32535da7d142fb0e6df616a3c3ada0b8ab417937c853a9e1c251f499f550

$ docker container ls
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
243c32535da7        ubuntu:latest       "/bin/bash"         18 seconds ago      Up 17 seconds                           nostalgic_hypatia

$ docker attach 243c
root@243c32535da7:/#
```

> 如果从这个 stdin 中 exit，会导致容器的停止。

#### exec命令

`docker exec` 后边可以跟多个参数，`-i`和`-t` 最常用。

只用 `-i` 参数时，由于没有分配伪终端，界面没有我们熟悉的 Linux 命令提示符，但命令执行结果仍然可以返回。

当 `-i` `-t` 参数一起使用时，则可以看到我们熟悉的 Linux 命令提示符。

```shell
$ docker run -dit ubuntu
69d137adef7a8a689cbcb059e94da5489d3cddd240ff675c640c8d96e84fe1f6

$ docker container ls
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
69d137adef7a        ubuntu:latest       "/bin/bash"         18 seconds ago      Up 17 seconds                           zealous_swirles

$ docker exec -i 69d1 bash
ls
bin
boot
dev
...

$ docker exec -it 69d1 bash
root@69d137adef7a:/#
```

> 如果从这个 stdin 中 exit，不会导致容器的停止。
>
> 所以更推荐使用 exec

### 导入和导出

**导出容器**

如果要导出本地某个容器，可以使用 `docker export` 命令。

```shell
$ docker container ls -a
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS                    PORTS               NAMES
7691a814370e        ubuntu:18.04        "/bin/bash"         36 hours ago        Exited (0) 21 hours ago                       test
$ docker export 7691a814370e > ubuntu.tar
```

这将导出容器快照到本地文件。

**导入容器快照**

可以使用 `docker import` 从容器快照文件中再导入为镜像，例如

```shell
$ cat ubuntu.tar | docker import - test/ubuntu:v1.0
$ docker image ls
REPOSITORY          TAG                 IMAGE ID            CREATED              VIRTUAL SIZE
test/ubuntu         v1.0                9d37a6082e97        About a minute ago   171.3 MB
```

此外，也可以通过指定 URL 或者某个目录来导入，例如

```shell
$ docker import http://example.com/exampleimage.tgz example/imagerepo
```

> [!note]
>
> 用户既可以使用 `docker load` 来导入镜像存储文件到本地镜像库，也可以使用 `docker import` 来导入一个容器快照到本地镜像库。这两者的区别在于容器快照文件将丢弃所有的历史记录和元数据信息（即仅保存容器当时的快照状态），而镜像存储文件将保存完整记录，体积也要大。此外，从容器快照文件导入时可以重新指定标签等元数据信息。



### 案例-创建并运行一个容器

创建并运行nginx容器的命令：
```shell
docker run --name containerName -p 80:80 -d nginx
```
命令解读：

- docker run ：创建并运行一个容器
- --name : 给容器起一个名字，比如叫做mn
- -p ：将宿主机端口与容器端口映射，冒号左侧是宿主机端口，右侧是容器端口
- -d：后台运行容器
- nginx：镜像名称，例如nginx

这里的`-p`参数，是将容器端口映射到宿主机端口。
默认情况下，容器是隔离环境，我们直接访问宿主机的80端口，肯定访问不到容器中的nginx。
现在，将容器的80与宿主机的80关联起来，当我们访问宿主机的80端口时，就会被映射到容器的80，这样就能访问到nginx了
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171607176.png)

### 案例-进入容器，修改文件
**需求**：进入Nginx容器，修改HTML文件内容，添加“传智教育欢迎您”
**提示**：进入容器要用到docker exec命令。
**步骤**：

1. 进入容器。进入我们刚刚创建的nginx容器的命令为：
```shell
docker exec -it mn bash
```
命令解读：

-  docker exec ：进入容器内部，执行一个命令 
-  -it : 给当前进入的容器创建一个标准输入、输出终端，允许我们与容器交互 
-  mn ：要进入的容器的名称 
-  bash：进入容器后执行的命令，bash是一个linux终端交互命令 
2. 进入nginx的HTML所在目录 /usr/share/nginx/html

容器内部会模拟一个独立的Linux文件系统，看起来如同一个linux服务器一样：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171607026.png)
nginx的环境、配置、运行文件全部都在这个文件系统中，包括我们要修改的html文件。
查看DockerHub网站中的nginx页面，可以知道nginx的html目录位置在`/usr/share/nginx/html`
我们执行命令，进入该目录：

```shell
cd /usr/share/nginx/html
```
查看目录下文件:
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171607803.png)

3. 修改index.html的内容

容器内没有vi命令，无法直接修改，我们用下面的命令来修改：
```shell
sed -i -e 's#Welcome to nginx#传智教育欢迎您#g' -e 's#<head>#<head><meta charset="utf-8">#g' index.html
```
在浏览器访问自己的虚拟机地址，例如我的是：http://192.168.150.101，即可看到结果：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171607966.png)

**总结**

docker run命令的常见参数有哪些？

- --name：指定容器名称
- -p：指定端口映射
- -d：让容器后台运行

查看容器日志的命令：

- docker logs
- 添加 -f 参数可以持续查看日志

查看容器状态：

- docker ps
- docker ps -a 查看所有容器，包括已经停止的
## 数据卷（容器数据管理）
在之前的nginx案例中，修改nginx的html页面时，需要进入nginx内部。并且因为没有编辑器，修改文件也很麻烦。
这就是因为容器与数据（容器内文件）耦合带来的后果。
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171607134.png)
要解决这个问题，必须将数据与容器解耦，这就要用到数据卷了。

### 什么是数据卷
**数据卷（volume）**是一个虚拟目录，指向宿主机文件系统中的某个目录，是**容器内目录**与**宿主机目录**之间映射的桥梁。
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171607014.png)
一旦完成数据卷挂载，对容器的一切操作都会作用在数据卷对应的宿主机目录了。
这样，我们操作宿主机的`/var/lib/docker/volumes/html`目录，就等于操作容器内的`/usr/share/nginx/html`目录了。

### 数据卷命令一览
数据卷的相关命令有：

| **命令** | **说明** | **文档地址** |
| --- | --- | --- |
| docker volume create | 创建数据卷 | [docker volume create](https://docs.docker.com/engine/reference/commandline/volume_create/) |
| docker volume ls | 查看所有数据卷 | [docker volume ls](https://docs.docker.com/engine/reference/commandline/volume_ls/) |
| docker volume rm | 删除指定数据卷 | [docker volume prune](https://docs.docker.com/engine/reference/commandline/volume_prune/) |
| docker volume inspect | 查看某个数据卷的详情 | [docker volume inspect](https://docs.docker.com/engine/reference/commandline/volume_inspect/) |
| docker volume prune | 清除数据卷 | [docker volume prune](https://docs.docker.com/engine/reference/commandline/volume_prune/) |

注意：容器与数据卷的挂载要在创建容器时配置，对于创建好的容器，是不能设置数据卷的。而且**创建容器的过程中，数据卷会自动创建**。
### 数据集操作命令
数据卷操作的基本语法如下：
```shell
docker volume [COMMAND]
```
docker volume命令是数据卷操作，根据命令后跟随的command来确定下一步的操作：

- create 创建一个volume
- inspect 显示一个或多个volume的信息
- ls 列出所有的volume
- prune 删除未使用的volume
- rm 删除一个或多个指定的volume
### 创建和查看数据卷
**需求**：创建一个数据卷，并查看数据卷在宿主机的目录位置
创建数据卷

```shell
docker volume create html
```
查看所有数据
```shell
docker volume ls
```
结果：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171607697.png)
查看数据卷详细信息卷

```shell
docker volume inspect html
```
结果：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171607561.png)
可以看到，我们创建的html这个数据卷关联的宿主机目录为`/var/lib/docker/volumes/html/_data`目录。
**小结**：
数据卷的作用：

- 将容器与数据分离，解耦合，方便操作容器内数据，保证数据安全

数据卷操作：

- docker volume create：创建数据卷
- docker volume ls：查看所有数据卷
- docker volume inspect：查看数据卷详细信息，包括关联的宿主机目录位置
- docker volume rm：删除指定数据卷
- docker volume prune：删除所有未使用的数据卷
### 挂载数据卷
可以发现数据卷的目录结构较深，如果去操作数据卷目录会不太方便。很多情况下，我们会直接将容器目录与宿主机指定目录挂载。挂载语法与数据卷类似：
```shell
# 挂载本地目录
-v 本地目录:容器内目录
# 挂载本地文件
-v 本地文件:容器内文件
```
> [!tip]
> **注意**：本地目录或文件必须以 `/` 或 `./`开头，如果直接以名字开头，会被识别为数据卷名而非本地目录名。

例如：

```shell
-v mysql:/var/lib/mysql # 会被识别为一个数据卷叫mysql，运行时会自动创建这个数据卷
-v ./mysql:/var/lib/mysql # 会被识别为当前目录下的mysql目录，运行时如果不存在会创建目录
```
我们在创建容器时，可以通过 -v 参数来挂载一个数据卷到某个容器内目录，命令格式如下：
```shell
docker run \
  --name mn \
  -v html:/root/html \
  -p 8080:80
  nginx \
```
这里的-v就是挂载数据卷的命令：

- `-v html:/root/htm` ：把html数据卷挂载到容器内的/root/html这个目录中
### 案例-给nginx挂载数据卷
**需求**：创建一个nginx容器，修改容器内的html目录内的index.html内容
**分析**：上个案例中，我们进入nginx容器内部，已经知道nginx的html目录所在位置/usr/share/nginx/html ，我们需要把这个目录挂载到html这个数据卷上，方便操作其中的内容。
**提示**：运行容器时使用 -v 参数挂载数据卷
步骤：
① 创建容器并挂载数据卷到容器内的HTML目录

```shell
docker run --name mn -v html:/usr/share/nginx/html -p 80:80 -d nginx
```
② 进入html数据卷所在位置，并修改HTML内容
```shell
# 查看html数据卷的位置
docker volume inspect html
# 进入该目录
cd /var/lib/docker/volumes/html/_data
# 修改文件
vi index.html
```
### 案例-给MySQL挂载本地目录
容器不仅仅可以挂载数据卷，也可以直接挂载到宿主机目录上。关联关系如下：

- 带数据卷模式：宿主机目录 --> 数据卷 ---> 容器内目录
- 直接挂载模式：宿主机目录 ---> 容器内目录

如图：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171607657.png)
**语法**：
目录挂载与数据卷挂载的语法是类似的：

- -v [宿主机目录]:[容器内目录]
- -v [宿主机文件]:[容器内文件]

**需求**：创建并运行一个MySQL容器，将宿主机目录直接挂载到容器
实现思路如下：

1. 将mysql.tar文件上传到虚拟机，通过load命令加载为镜像
2. 创建目录/tmp/mysql/data
3. 创建目录/tmp/mysql/conf，将hmy.cnf文件上传到/tmp/mysql/conf
4. 去DockerHub查阅资料，创建并运行MySQL容器，要求：
   1.  挂载/tmp/mysql/data到mysql容器内数据存储目录
   2.  挂载/tmp/mysql/conf/hmy.cnf到mysql容器的配置文件
   3. 设置MySQL密码

最终挂载命令：`docker run --name mysql -d -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 -v /tmp/mysql/conf/hmy.cnf:/etc/mysql/conf.d/hmy.cnf -v /tmp/mysql/data:/var/lib/mysql mysql:8.0.28`

**总结**

docker run的命令中通过 -v 参数挂载文件或目录到容器中：

- -v volume名称:容器内目录
- -v 宿主机文件:容器内文件
- -v 宿主机目录:容器内目录

数据卷挂载与目录直接挂载的区别：

- 数据卷挂载耦合度低，由docker来管理目录，但是目录较深，不好找
- 目录挂载耦合度高，需要我们自己管理目录，不过目录容易寻找查看
# Dockerfile自定义镜像
常见的镜像在DockerHub就能找到，但是自己写的项目就必须自己构建镜像了。而要自定义镜像，就必须先了解镜像的结构。
## 镜像结构
镜像是将应用程序及其需要的系统函数库、环境、配置、依赖打包而成。以MySQL为例，来看看镜像的组成结构：
![MySQL镜像组成结构](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171607611.png)
简单来说，镜像就是在系统函数库、运行环境基础上，添加应用程序文件、配置文件、依赖文件等组合，然后编写好启动脚本打包在一起形成的文件。
我们要构建镜像，其实就是实现上述打包的过程。

## Dockerfile语法
构建自定义镜像时，并不需要一个个文件去拷贝，打包。
只需要告诉Docker，镜像的组成，需要哪些BaseImage、需要拷贝什么文件、需要安装什么依赖、启动脚本是什么，将来Docker会帮助我们构建镜像。
而描述上述信息的文件就是Dockerfile文件。
**Dockerfile**是一个文本文件，其中包含一个个**指令(Instruction)**，用指令来说明要执行什么操作来构建镜像。每一个指令都会形成一层Layer。

详细语法说明，参考官网文档： [https://docs.docker.com/engine/reference/builder](https://docs.docker.com/engine/reference/builder)![指令概要](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/docker/202406171607486.png)

### COPY 复制文件

`COPY [--chown=<user>:<group>] <源路径>... <目标路径>`

`COPY [--chown=<user>:<group>] ["<源路径1>",... "<目标路径>"]`

和 `RUN` 指令一样，也有两种格式，一种类似于命令行，一种类似于函数调用。

`COPY` 指令将从构建上下文目录中 `<源路径>` 的文件/目录复制到新的一层的镜像内的 `<目标路径>` 位置。比如：

```dockerfile
COPY package.json /usr/src/app/
```

`<源路径>` 可以是多个，甚至可以是通配符，其通配符规则要满足 Go 的 [`filepath.Match`](https://golang.org/pkg/path/filepath/#Match) 规则，如：

```dockerfile
COPY hom* /mydir/
COPY hom?.txt /mydir/
```

`<目标路径>` 可以是容器内的绝对路径，也可以是相对于工作目录的相对路径（工作目录可以用 `WORKDIR` 指令来指定）。目标路径不需要事先创建，如果目录不存在会在复制文件前先行创建缺失目录。

> [!tip]
>
> 使用 `COPY` 指令，源文件的各种元数据都会保留。比如读、写、执行权限、文件变更时间等。这个特性对于镜像定制很有用。特别是构建相关文件都在使用 Git 进行管理的时候。

在使用该指令的时候还可以加上 `--chown=<user>:<group>` 选项来改变文件的所属用户及所属组。

```dockerfile
COPY --chown=55:mygroup files* /mydir/
COPY --chown=bin files* /mydir/
COPY --chown=1 files* /mydir/
COPY --chown=10:11 files* /mydir/
```

### ADD 增强的复制文件

`ADD` 指令和 `COPY` 的格式和性质基本一致。但是在 `COPY` 基础上增加了一些功能。

- `<源路径>` 为一个 `tar` 压缩文件，压缩格式为 `gzip`, `bzip2` 以及 `xz` 情况下，`ADD` 指令将自动解压缩这个文件到 `<目标路径>` 

- `<源路径>` 是一个 `URL` 的情况下，Docker 引擎会试图去下载这个链接的文件放到 `<目标路径>`

在使用该指令的时候还可以加上 `--chown=<user>:<group>` 选项来改变文件的所属用户及所属组。

```dockerfile
ADD --chown=55:mygroup files* /mydir/
ADD --chown=bin files* /mydir/
ADD --chown=1 files* /mydir/
ADD --chown=10:11 files* /mydir/
```

> [!tip]
>
> `ADD` 指令会令镜像构建缓存失效，从而可能会令镜像构建变得比较缓慢。
>
> 使用建议：所有的文件复制均使用 `COPY` 指令，仅在需要自动解压缩的场合使用 `ADD`

### CMD 容器启动命令

作用：指定容器启动时默认执行的命令。可以被 `docker run` 命令中的命令行参数覆盖。

- `shell` 格式：`CMD <命令>`
- `exec` 格式：`CMD ["可执行文件", "参数1", "参数2"...]`
- 参数列表格式：`CMD ["参数1", "参数2"...]`。在指定了 `ENTRYPOINT` 指令后，用 `CMD` 指定具体的参数

> 推荐使用 `exec` 格式，这类格式在解析时会被解析为 JSON 数组，因此一定要使用双引号`"`，而不要使用单引号。

如果使用 `shell` 格式的话，实际的命令会被包装为 `sh -c` 的参数的形式进行执行。比如：

```dockerfile
CMD echo $HOME
```

在实际执行中，会将其变更为：

```dockerfile
CMD [ "sh", "-c", "echo $HOME" ]
```

### ENTRYPOINT 入口点

`ENTRYPOINT` 的指令格式和 `RUN` 一样，即`exec` 格式和 `shell` 格式。

`ENTRYPOINT` 的作用和 `CMD` 一样，都是在指定容器启动程序及参数。`ENTRYPOINT` 在运行时也可以替代，不过比 `CMD` 要略显繁琐，需要通过 `docker run` 的参数 `--entrypoint` 来指定。

当指定了 `ENTRYPOINT` 后，`CMD` 的含义就发生了改变，不再是直接的运行其命令，而是将 `CMD` 的内容作为参数传给 `ENTRYPOINT` 指令，换句话说实际执行时，将变为：

```dockerfile
<ENTRYPOINT> "<CMD>"
```

有了 `CMD` 后，为什么还要有 `ENTRYPOINT` 呢？这种 `<ENTRYPOINT> "<CMD>"` 有什么好处？

**场景1：让镜像变成像命令一样使用**

假设我们需要一个得知自己当前公网 IP 的镜像，那么可以先用 `CMD` 来实现

```dockerfile
FROM ubuntu:18.04
RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
CMD [ "curl", "-s", "http://myip.ipip.net" ]
```

假如使用 `docker build -t myip .` 来构建镜像的话，如果需要查询当前公网 IP，只需要执行：

```shell
$ docker run myip
当前 IP：61.148.226.66 来自：北京市 联通
```

但命令总会有一些参数，从上面的 `CMD` 中可以看到实质的命令是 `curl`，现在如果希望显示 HTTP 头信息，就需要加上 `-i` 参数，此时若直接加上`-i`参数给`docker run myip`会报错：提示可执行文件找不到

```shell
$ docker run myip -i
docker: Error response from daemon: invalid header field value "oci runtime error: container_linux.go:247: starting container process caused \"exec: \\\"-i\\\": executable file not found in $PATH\"\n".
```

跟在镜像名后面的是 `command`，运行时会替换 `CMD` 的默认值。因此这里的 `-i` 替换了原来的 `CMD`，而不是添加在原来的 `curl -s http://myip.ipip.net` 后面。而 `-i` 根本不是命令，所以自然找不到。

如果希望加入 `-i` 这参数，我们就必须重新完整的输入这个命令：

```shell
$ docker run myip curl -s http://myip.ipip.net -i
```

这显然不是很好的解决方案，而使用 `ENTRYPOINT` 就可以解决这个问题。现在重新用 `ENTRYPOINT` 来实现这个镜像：

```dockerfile
FROM ubuntu:18.04
RUN apt-get update \
    && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
ENTRYPOINT [ "curl", "-s", "http://myip.ipip.net" ]
```

此时再次使用`docker run myip -i`就没有问题了，因为当存在 `ENTRYPOINT` 后，`CMD` 的内容将会作为参数传给 `ENTRYPOINT`，而这里 `-i` 就是新的 `CMD`，因此会作为参数传给 `curl`，从而达到了我们预期的效果

**场景2：应用运行前的准备工作**

启动容器就是启动主进程，但有些时候，启动主进程前，需要一些准备工作。

比如 `mysql` 类的数据库，可能需要一些数据库配置、初始化的工作，这些工作要在最终的 mysql 服务器运行之前解决。

此外，可能希望避免使用 `root` 用户去启动服务，从而提高安全性，而在启动服务前还需要以 `root` 身份执行一些必要的准备工作，最后切换到服务用户身份启动服务。或者除了服务外，其它命令依旧可以使用 `root` 身份执行，方便调试等。

这些准备工作是和容器 `CMD` 无关的，无论 `CMD` 为什么，都需要事先进行一个预处理的工作。这种情况下，可以写一个脚本，然后放入 `ENTRYPOINT` 中去执行，而这个脚本会将接到的参数（也就是 `<CMD>`）作为命令，在脚本最后执行。比如官方镜像 `redis` 中就是这么做的：

```dockerfile
FROM alpine:3.4
...
RUN addgroup -S redis && adduser -S -G redis redis
...
ENTRYPOINT ["docker-entrypoint.sh"]

EXPOSE 6379
CMD [ "redis-server" ]
```

可以看到其中为了 redis 服务创建了 redis 用户，并在最后指定了 `ENTRYPOINT` 为 `docker-entrypoint.sh` 脚本。

### ENV 环境变量

- `ENV <key> <value>`
- `ENV <key1>=<value1> <key2>=<value2>...`

作用：设置环境变量，无论是后面的其它指令，如 `RUN`，还是运行时的应用，都可以直接使用这里定义的环境变量。

```dockerfile
ENV VERSION=1.0 DEBUG=on \
    NAME="Happy Feet"
```

这个例子中演示了如何换行，以及对含有空格的值用双引号括起来的办法，这和 Shell 下的行为是一致的。

定义了环境变量，那么在后续的指令中，就可以使用这个环境变量。比如在官方 `node` 镜像 `Dockerfile` 中，就有类似这样的代码：

```dockerfile
ENV NODE_VERSION 7.2.0

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs
```

在这里先定义了环境变量 `NODE_VERSION`，其后的 `RUN` 这层里，多次使用 `$NODE_VERSION` 来进行操作定制。可以看到，将来升级镜像构建版本的时候，只需要更新 `7.2.0` 即可，`Dockerfile` 构建维护变得更轻松了。

下列指令可以支持环境变量展开： `ADD`、`COPY`、`ENV`、`EXPOSE`、`FROM`、`LABEL`、`USER`、`WORKDIR`、`VOLUME`、`STOPSIGNAL`、`ONBUILD`、`RUN`。

### ARG 构建参数

格式：`ARG <参数名>[=<默认值>]`

构建参数和 `ENV` 的效果一样，都是设置环境变量。所不同的是，`ARG` 所设置的构建环境的环境变量，在将来容器运行时是不会存在这些环境变量的。但是不要因此就使用 `ARG` 保存密码之类的信息，因为 `docker history` 还是可以看到所有值的。

`ARG` 指令是定义参数名称，以及定义其默认值。该默认值可以在构建命令 `docker build` 中用 `--build-arg <参数名>=<值>` 来覆盖。

`ARG` 指令有生效范围，如果在 `FROM` 指令之前指定，那么只能用于 `FROM` 指令中。

```dockerfile
ARG DOCKER_USERNAME=library

FROM ${DOCKER_USERNAME}/alpine

RUN set -x ; echo ${DOCKER_USERNAME}
```

使用上述 Dockerfile 会发现无法输出 `${DOCKER_USERNAME}` 变量的值，要想正常输出，必须在 `FROM` 之后再次指定 `ARG`

对于多阶段构建，尤其要注意这个问题

```dockerfile
# 这个变量在每个 FROM 中都生效
ARG DOCKER_USERNAME=library

FROM ${DOCKER_USERNAME}/alpine

RUN set -x ; echo 1

FROM ${DOCKER_USERNAME}/alpine

RUN set -x ; echo 2
```

对于上述 Dockerfile 两个 `FROM` 指令都可以使用 `${DOCKER_USERNAME}`

对于在各个阶段中使用的变量都必须在每个阶段分别指定：

```dockerfile
ARG DOCKER_USERNAME=library

FROM ${DOCKER_USERNAME}/alpine

# 在FROM 之后使用变量，必须在每个阶段分别指定
ARG DOCKER_USERNAME=library

RUN set -x ; echo ${DOCKER_USERNAME}

FROM ${DOCKER_USERNAME}/alpine

# 在FROM 之后使用变量，必须在每个阶段分别指定
ARG DOCKER_USERNAME=library

RUN set -x ; echo ${DOCKER_USERNAME}
```

### VOLUME 匿名卷

格式：

- `VOLUME ["<路径1>", "<路径2>"...]`
- `VOLUME <路径>`

作用：事先指定某些目录挂载为匿名卷，这样在运行时如果用户不指定挂载，其应用也可以正常运行，不会向容器存储层写入大量数据。

```dockerfile
VOLUME /data
```

这里的 `/data` 目录就会在容器运行时自动挂载为匿名卷，任何向 `/data` 中写入的信息都不会记录进容器存储层，从而保证了容器存储层的无状态化。当然，运行容器时可以覆盖这个挂载设置。比如：

```shell
$ docker run -d -v mydata:/data xxxx
```

这行命令中，使用了 `mydata` 这个命名卷挂载到了 `/data` 这个位置，替代了 `Dockerfile` 中定义的匿名卷的挂载配置。

### EXPOSE 暴露端口

格式：`EXPOSE <端口1> [<端口2>...]`

声明容器在运行时监听的端口。这只是文档说明，并不实际开放端口。

要将 `EXPOSE` 和在运行时使用 `-p <宿主端口>:<容器端口>` 区分开来。`-p`，是映射宿主端口和容器端口，换句话说，就是将容器的对应端口服务公开给外界访问，而 `EXPOSE` 仅仅是声明容器打算使用什么端口而已，并不会自动在宿主进行端口映射。

这样做的好处是：

1. 帮助镜像使用者理解这个镜像服务的守护端口，以方便配置映射
2. 在运行时使用随机端口映射时，也就是 `docker run -P` 时，会自动随机映射 `EXPOSE` 的端口

### WORKDIR 工作目录

格式：`WORKDIR <工作目录路径>`

作用：指定工作目录（或者称为当前目录），以后各层的当前目录就被改为指定的目录，如该目录不存在，`WORKDIR` 会帮你建立目录。声明之后，后续的 `RUN`, `CMD`, `ENTRYPOINT`, `COPY`, 和 `ADD` 指令都会在该目录下执行。

> 由于Dockerfile构建是分层存储的，如果需要改变以后各层的工作目录的位置，那么应该再次使用 `WORKDIR` 指令。

如果你的 `WORKDIR` 指令使用的相对路径，那么所切换的路径与之前的 `WORKDIR` 有关：

```dockerfile
WORKDIR /a
WORKDIR b
WORKDIR c

RUN pwd
```

### USER 当前用户

格式：`USER <用户名>[:<用户组>]`

`USER` 指令和 `WORKDIR` 相似，都是改变环境状态并影响以后的层。`WORKDIR` 是改变工作目录，`USER` 则是改变之后层的执行 `RUN`, `CMD` 以及 `ENTRYPOINT` 这类命令的身份。

> `USER` 只是帮助你切换到指定用户而已，这个用户必须是事先建立好的，否则无法切换。

```dockerfile
RUN groupadd -r redis && useradd -r -g redis redis
USER redis
RUN [ "redis-server" ]
```

如果以 `root` 执行的脚本，在执行期间希望改变身份，比如希望以某个已经建立好的用户来运行某个服务进程，不要使用 `su` 或者 `sudo`，这些都需要比较麻烦的配置，而且在 TTY 缺失的环境下经常出错。建议使用 [`gosu`](https://github.com/tianon/gosu)。

```dockerfile
# 建立 redis 用户，并使用 gosu 换另一个用户执行命令
RUN groupadd -r redis && useradd -r -g redis redis
# 下载 gosu
RUN wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/1.12/gosu-amd64" \
    && chmod +x /usr/local/bin/gosu \
    && gosu nobody true
# 设置 CMD，并以另外的用户执行
CMD [ "exec", "gosu", "redis", "redis-server" ]
```

### HEALTHCHECK 健康检查

格式：

- `HEALTHCHECK [选项] CMD <命令>`：设置检查容器健康状况的命令
- `HEALTHCHECK NONE`：如果基础镜像有健康检查指令，使用这行可以屏蔽掉其健康检查指令

作用：告诉 Docker 应该如何进行判断容器的状态是否正常。

当在一个镜像指定了 `HEALTHCHECK` 指令后，用其启动容器，初始状态为 `starting`，在 `HEALTHCHECK` 指令检查成功后变为 `healthy`，如果连续一定次数失败，则会变为 `unhealthy`。

`HEALTHCHECK` 支持下列选项：

- `--interval=<间隔>`：两次健康检查的间隔，默认为 30 秒；
- `--timeout=<时长>`：健康检查命令运行超时时间，如果超过这个时间，本次健康检查就被视为失败，默认 30 秒；
- `--retries=<次数>`：当连续失败指定次数后，则将容器状态视为 `unhealthy`，默认 3 次。

和 `CMD`, `ENTRYPOINT` 一样，`HEALTHCHECK` 只可以出现一次，如果写了多个，只有最后一个生效。

在 `HEALTHCHECK [选项] CMD` 后面的命令，格式和 `ENTRYPOINT` 一样，分为 `shell` 格式和 `exec` 格式。命令的返回值决定了该次健康检查的成功与否：`0`：成功；`1`：失败；`2`：保留，不要使用这个值。

假设我们有个镜像是个最简单的 Web 服务，我们希望增加健康检查来判断其 Web 服务是否在正常工作，我们可以用 `curl` 来帮助判断，其 `Dockerfile` 的 `HEALTHCHECK` 可以这么写：

```dockerfile
FROM nginx
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
HEALTHCHECK --interval=5s --timeout=3s \
  CMD curl -fs http://localhost/ || exit 1
```

这里设置了每 5 秒检查一次（这里为了试验所以间隔非常短，实际应该相对较长），如果健康检查命令超过 3 秒没响应就视为失败，并且使用 `curl -fs http://localhost/ || exit 1` 作为健康检查命令。

### ONBUILD 辅助构建其它镜像

`ONBUILD` 允许在基础镜像中设置触发器，以便其它镜像在使用该镜像构建新镜像时自动执行特定的命令。

使用场景：

- **基础镜像**：当你希望其他镜像基于你的镜像进行构建时，`ONBUILD` 可以帮助预先定义构建过程。
- **多阶段构建**：在某些情况下，可以通过使用 `ONBUILD` 指令简化构建过程，尤其是当多个镜像需要执行相似的步骤时。

格式：`ONBUILD <COMMAND>`

---

基础镜像：

```dockerfile
# 基础镜像 Dockerfile
FROM ubuntu:20.04

# 安装一些常用工具
RUN apt-get update && apt-get install -y python3 python3-pip

# 使用 ONBUILD 指令，任何使用此镜像的镜像都会执行此命令
ONBUILD RUN pip3 install -r /app/requirements.txt
ONBUILD COPY . /app
```

新镜像

```dockerfile
# 应用程序 Dockerfile
FROM your_base_image

# 其他自定义步骤可以在这里添加
CMD ["python3", "/app/main.py"]
```

构建过程：

- 当构建基础镜像时，`ONBUILD` 指令不会立即执行。
- 当基于这个基础镜像构建新的镜像时，`ONBUILD` 指令会被自动执行。这意味着在构建新镜像时，`pip3 install` 和 `COPY` 命令会被运行。

> 可以有多个 `ONBUILD` 指令，它们会按照出现的顺序依次执行。

### LABEL 元数据

作用：为镜像添加元数据。元数据以键值对的形式存储，可以包含有关镜像的各种信息，例如作者、版本、描述等。这些信息在镜像构建完成后可以用于识别和管理镜像。

语法：`LABEL <key>=<value> <key>=<value> ...`多个标签可以在同一行中定义，使用空格分隔。

案例：

```dockerfile
FROM ubuntu:20.04

# 使用 LABEL 添加元数据
LABEL \
    maintainer="yourname@example.com" \
    version="1.0" \
    description="This is a sample application image." \
    homepage="https://example.com"

# 安装应用
RUN apt-get update && apt-get install -y python3

# 其他 Dockerfile 指令...

```

镜像构建完成后，可以使用 `docker inspect` 命令查看镜像的元数据，包括 `LABEL` 信息：`docker inspect 镜像名称`

> - 标签的键值对可以使用 UTF-8 编码。
>
> - `LABEL` 指令只会在镜像构建时添加元数据，不会影响镜像的运行时行为。

### SHELL 指令

作用：指定在 Dockerfile 中`RUN` `ENTRYPOINT` `CMD`执行命令时使用的默认 shell。 默认情况下，Docker 使用 `/bin/sh -c` 来运行命令，但可以通过 `SHELL` 指令更改为其他 shell，例如 Bash。

格式：`SHELL ["executable", "parameters"]`

案例：

```dockerfile
SHELL ["/bin/sh", "-c"]

RUN lll ; ls

SHELL ["/bin/sh", "-cex"]

RUN lll ; ls
```

两个 `RUN` 运行同一命令，第二个 `RUN` 运行的命令会打印出每条命令并当遇到错误时退出。

> - 使用 `SHELL` 指令后，所有后续的 `RUN` 指令都会使用指定的 shell。
> - `SHELL`指令能够多次使用，后续的 `SHELL` 指令会覆盖之前的设置
> - `SHELL` 指令的影响仅限于构建阶段，不会影响容器运行时的 shell 环境

## 多阶段构建

多阶段构建允许在单个 Dockerfile 中定义多个阶段，以便更有效地构建轻量级的最终镜像。

优点：

- 减少镜像大小：只将需要的文件和依赖项复制到最终镜像，避免将构建工具和不必要的文件包含在内。
- 提高安全性：通过最小化最终镜像中的内容，减少潜在的攻击面。
- 优化构建过程：可以在不同的阶段中使用不同的基础镜像和工具，灵活性更高。

语法：

在 Dockerfile 中，使用 `FROM` 指令定义多个阶段。通过为每个 `FROM` 指令指定一个名称来引用不同的阶段。

案例：

```dockerfile
# 第一阶段：构建应用
FROM golang:1.19 AS builder
# 设置工作目录
WORKDIR /app
# 复制 go.mod 和 go.sum
COPY go.mod go.sum ./
# 下载依赖
RUN go mod download
# 复制源代码
COPY . .
# 编译应用
RUN CGO_ENABLED=0 GOOS=linux go build -o myapp .
# 第二阶段：创建最终镜像
FROM alpine:latest
# 复制构建阶段的可执行文件到最终镜像
COPY --from=builder /app/myapp /usr/local/bin/myapp
# 设置容器启动命令
CMD ["myapp"]
```

**`AS`和`--from`**

- 使用 `AS` 为构建阶段指定一个名称（如 `builder`），后续可以通过 `COPY --from=builder` 来引用该阶段的文件。
- 可以定义任意数量的构建阶段，每个阶段都可以使用不同的基础镜像和命令。

**只构建某个阶段的镜像**

当我们只想构建 `builder` 阶段的镜像时，增加 `--target=builder` 参数即可：

`$ docker build --target builder -t username/imagename:tag .`

## 构建Java项目示例

### 基于Ubuntu构建Java项目
需求：基于Ubuntu镜像构建一个新镜像，运行一个java项目

-  步骤1：新建一个空文件夹docker-demo
-  步骤2：拷贝docker-demo.jar文件到docker-demo这个目录
-  步骤3：拷贝jdk8.tar.gz文件到docker-demo这个目录
-  步骤4：拷贝Dockerfile到docker-demo这个目录
Dockerfile中的内容如下： 
```dockerfile
# 指定基础镜像
FROM ubuntu:16.04
# 配置环境变量，JDK的安装目录
ENV JAVA_DIR=/usr/local

# 拷贝jdk和java项目的包
COPY ./jdk8.tar.gz $JAVA_DIR/
COPY ./docker-demo.jar /tmp/app.jar

# 安装JDK
RUN cd $JAVA_DIR \
 && tar -xf ./jdk8.tar.gz \
 && mv ./jdk1.8.0_144 ./java8

# 配置环境变量
ENV JAVA_HOME=$JAVA_DIR/java8
ENV PATH=$PATH:$JAVA_HOME/bin

# 暴露端口
EXPOSE 8090
# 入口，java项目的启动命令
ENTRYPOINT java -jar /tmp/app.jar
```

-  步骤5：进入docker-demo
将准备好的docker-demo上传到虚拟机任意目录，然后进入docker-demo目录下 
-  步骤6：运行命令： 
```shell
docker build -t javaweb:1.0 .
```
最后访问 http://192.168.150.101:8090/hello/count，其中的ip改成你的虚拟机ip
### 基于java8构建Java项目
虽然我们可以基于Ubuntu基础镜像，添加任意自己需要的安装包，构建镜像，但是却比较麻烦。所以大多数情况下，都可以在一些安装了部分软件的基础镜像上做改造。
例如，构建java项目的镜像，可以在已经准备了JDK的基础镜像基础上构建。
需求：基于java:8-alpine镜像，将一个Java项目构建为镜像
实现思路如下：

1. 新建一个空的目录，然后在目录中新建一个文件，命名为Dockerfile 
2. 拷贝docker-demo.jar到这个目录中 
3. 编写Dockerfile文件： 
   - 基于java:8-alpine作为基础镜像 
   - 设定时区
   - 将app.jar拷贝到镜像中 
   - 暴露端口 
   - 编写入口ENTRYPOINT

内容如下： 

```dockerfile
FROM java:8-alpine
# 设定时区
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
COPY ./app.jar /tmp/app.jar
EXPOSE 8090
ENTRYPOINT java -jar /tmp/app.jar
```

4. 使用`docker build`命令构建镜像
5. 使用`docker run`创建容器并运行

**总结**

1.  Dockerfile的本质是一个文件，通过指令描述镜像的构建过程 
2.  Dockerfile的第一行必须是FROM，从一个基础镜像来构建 
3.  基础镜像可以是基本操作系统，如Ubuntu。也可以是其他人制作好的镜像，例如：java:8-alpine 
# Docker-Compose
Docker Compose可以基于Compose文件帮我们快速的部署分布式应用，而无需手动一个个创建和运行容器！
## 简介
Compose文件是一个文本文件，通过指令定义集群中的每个容器如何运行。格式如下：
```yaml
version: "3.8"
 services:
  mysql:
    image: mysql:5.7.25
    environment:
     MYSQL_ROOT_PASSWORD: 123 
    volumes:
     - "/tmp/mysql/data:/var/lib/mysql"
     - "/tmp/mysql/conf/hmy.cnf:/etc/mysql/conf.d/hmy.cnf"
  web:
    build: .
    ports:
     - "8090:8090"
```
上面的Compose文件就描述一个项目，其中包含两个容器：

- mysql：一个基于`mysql:5.7.25`镜像构建的容器，并且挂载了两个目录
- web：一个基于`docker build`临时构建的镜像容器，映射端口时8090

DockerCompose的详细语法参考官网：[https://docs.docker.com/compose/compose-file/](https://docs.docker.com/compose/compose-file/)
其实DockerCompose文件可以看做是将多个docker run命令写到一个文件，只是语法稍有差异。
**语法**
[Compose file version 3 reference](https://docs.docker.com/compose/compose-file/compose-file-v3/)
**命令**
[Overview of docker compose CLI](https://docs.docker.com/compose/reference/)
基本语法如下：
```
docker compose [OPTIONS] [COMMAND]
```
其中，OPTIONS和COMMAND都是可选参数，比较常见的有：

| **类型** | **参数或指令** | **说明** |
| --- | --- | --- |
| Options | -f | 指定compose文件的路径和名称 |
|  | -p | 指定project名称。project就是当前compose文件中设置的多个service的集合，是逻辑概念 |
| Commands | up | 创建并启动所有service容器 |
|  | down | 停止并移除所有容器、网络 |
|  | ps | 列出所有启动的容器 |
|  | logs | 查看指定容器的日志 |
|  | stop | 停止容器 |
|  | start | 启动容器 |
|  | restart | 重启容器 |
|  | top | 查看运行的进程 |
|  | exec | 在指定的运行中容器中执行命令 |

# Docker镜像仓库

## 搭建私有镜像仓库

参考课前资料《CentOS7安装Docker.md》

## 推送、拉取镜像

推送镜像到私有镜像服务必须先tag，步骤如下：

① 重新tag本地镜像，名称前缀为私有仓库的地址：192.168.150.101:8080/

```shell
docker tag nginx:latest 192.168.150.101:8080/nginx:1.0
```

② 推送镜像

```shell
docker push 192.168.150.101:8080/nginx:1.0
```

③ 拉取镜像

```shell
docker pull 192.168.150.101:8080/nginx:1.0
```
