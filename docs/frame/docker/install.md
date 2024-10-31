---
title: 环境安装
shortTitle: 环境安装
description: 
date: 2024-06-16 22:11:18
categories: [Docker]
tags: []
---
## Ubuntu安装Docker

### 卸载旧版本：

```shell
$ for pkg in docker \
           docker-engine \
           docker.io \
           docker-doc \
           docker-compose \
           podman-docker \
           containerd \
           runc;
do
    sudo apt remove $pkg;
done
```

### APT安装

由于 `apt` 源使用 HTTPS 以确保软件下载过程中不被篡改。因此，我们首先需要添加使用 HTTPS 传输的软件包以及 CA 证书。

```shell
sudo apt update
sudo apt upgrade

sudo apt install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

为了确认所下载软件包的合法性，需要添加软件源的 `GPG` 密钥。

```shell
curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

```shell
# 官方源较慢，推荐使用上面的国内镜像源
# curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

更新APT软件包缓存，并安装docker-ce

```shell
sudo apt update

sudo apt install docker-ce docker-ce-cli containerd.io
```

## 脚本安装

在测试或开发环境中 Docker 官方为了简化安装流程，提供了一套便捷的安装脚本，Ubuntu 系统上可以使用这套脚本安装，另外可以通过 `--mirror` 选项使用国内源进行安装：

```shell
# curl -fsSL test.docker.com -o get-docker.sh
curl -fsSL get.docker.com -o get-docker.sh
sudo sh get-docker.sh --mirror Aliyun
# sudo sh get-docker.sh --mirror AzureChinaCloud
```

执行这个命令后，脚本就会自动的将一切准备工作做好，并且把 Docker 的稳定(stable)版本安装在系统中。



# CentOS安装Docker
Docker CE 支持 64 位版本 CentOS 7，并且要求内核版本不低于 3.10， CentOS 7 满足最低内核的要求，所以我们在CentOS 7安装Docker。
## 卸载（可选）
如果之前安装过旧版本的Docker，可以使用下面命令卸载：
```shell
yum remove docker \
                  docker-client \
                  docker-client-latest \
                  docker-common \
                  docker-latest \
                  docker-latest-logrotate \
                  docker-logrotate \
                  docker-selinux \
                  docker-engine-selinux \
                  docker-engine \
                  docker-ce
```
## 安装docker
首先虚拟机联网，安装yum工具
```shell
yum install -y yum-utils \
           device-mapper-persistent-data \
           lvm2 --skip-broken
```
然后更新本地镜像源：
```shell
# 设置docker镜像源
yum-config-manager \
    --add-repo \
    https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
    
sed -i 's/download.docker.com/mirrors.aliyun.com\/docker-ce/g' /etc/yum.repos.d/docker-ce.repo

yum makecache fast
```
然后输入命令：
```shell
yum install -y docker-ce
```
docker-ce为社区免费版本。稍等片刻，docker即可安装成功。
## 启动docker
Docker应用需要用到各种端口，逐一去修改防火墙设置。非常麻烦，因此建议大家直接关闭防火墙！
启动docker前，一定要关闭防火墙!
```shell
# 关闭
systemctl stop firewalld
# 禁止开机启动防火墙
systemctl disable firewalld
```
通过命令启动docker：
```shell
systemctl start docker  # 启动docker服务

systemctl stop docker  # 停止docker服务

systemctl restart docker  # 重启docker服务
```
然后输入命令，可以查看docker版本：
```
docker -v
```
## 配置镜像加速
docker官方镜像仓库网速较差，我们需要设置国内镜像服务：
参考阿里云的镜像加速文档：[https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors](https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors)

# CentOS7安装DockerCompose
## 下载
Linux下需要通过命令下载：
```shell
# 安装
curl -L https://github.com/docker/compose/releases/download/1.23.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose
```
## 修改文件权限
修改文件权限：
```shell
# 修改权限
chmod +x /usr/local/bin/docker-compose
```
## Base自动补全命令：
```shell
# 补全命令
curl -L https://raw.githubusercontent.com/docker/compose/1.29.1/contrib/completion/bash/docker-compose > /etc/bash_completion.d/docker-compose
```
如果这里出现错误，需要修改自己的hosts文件：
```shell
echo "199.232.68.133 raw.githubusercontent.com" >> /etc/hosts
```
# Docker镜像仓库
搭建镜像仓库可以基于Docker官方提供的DockerRegistry来实现。
官网地址：[https://hub.docker.com/_/registry](https://hub.docker.com/_/registry)
## 简化版镜像仓库
Docker官方的Docker Registry是一个基础版本的Docker镜像仓库，具备仓库管理的完整功能，但是没有图形化界面。
搭建方式比较简单，命令如下：
```shell
docker run -d \
    --restart=always \
    --name registry	\
    -p 5000:5000 \
    -v registry-data:/var/lib/registry \
    registry
```
命令中挂载了一个数据卷registry-data到容器内的/var/lib/registry 目录，这是私有镜像库存放数据的目录。
访问http://YourIp:5000/v2/_catalog 可以查看当前私有镜像服务中包含的镜像
## 带有图形化界面版本
使用DockerCompose部署带有图象界面的DockerRegistry，命令如下：
```yaml
version: '3.0'
services:
  registry:
    image: registry
    volumes:
      - ./registry-data:/var/lib/registry
  ui:
    image: joxit/docker-registry-ui:static
    ports:
      - 8080:80
    environment:
      - REGISTRY_TITLE=传智教育私有仓库
      - REGISTRY_URL=http://registry:5000
    depends_on:
      - registry
```
## 配置Docker信任地址
我们的私服采用的是http协议，默认不被Docker信任，所以需要做一个配置：
```shell
# 打开要修改的文件
vi /etc/docker/daemon.json
# 添加内容：
"insecure-registries":["http://192.168.150.101:8080"]
# 重加载
systemctl daemon-reload
# 重启docker
systemctl restart docker
```
