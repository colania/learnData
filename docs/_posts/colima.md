---
title: colima
date: 2023-03-29 16:51:47
categories:
	- coding
tags:
    - tools
---

# Docker Colima

 在mac 上，要运行docker ，需要通过docker desktop 创建docker运行的环境，但是这玩意太重了，风扇总是飞起。于是找到了一个代替docker desktop的轻量级工具，缺点是没有可视化界面。

## 介绍

[Colima](https://github.com/abiosoft/colima) 是一个以最小化设置来在MacOS上运行容器运行时和 Kubernetes 的工具。

Colima 的名字取自 Container on Lima。[Lima](https://github.com/lima-vm/lima) 是一个虚拟机工具，可以实现自动的文件共享、端口转发以及 containerd。

Colima 实际上是通过 Lima 启动了名为 colima 的虚拟机，使用虚拟机中的 containerd 作为容器运行时。

## 使用

Colima 的使用很简单，执行下面的命令就可以创建虚拟机，默认是 Docker 的运行时。

```java
colima start
INFO[0000] starting colima
INFO[0000] creating and starting ...                     context=vm
INFO[0119] provisioning ...                              context=docker
INFO[0119] provisioning in VM ...                        context=docker
INFO[0133] restarting VM to complete setup ...           context=docker
INFO[0133] stopping ...                                  context=vm
INFO[0136] starting ...                                  context=vm
INFO[0158] starting ...                                  context=docker
INFO[0159] done
```

此时，在宿主机上就可以使用 Docker 相关的命令了

```java
docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES

docker pull busybox

docker images
REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
busybox      latest    b34806a1af7a   2 weeks ago   1.41MB
```

也可以使用 Lima 的命令行 limact工具查看虚拟机的情况

```java
limactl list
NAME      STATUS     SSH                ARCH       CPUS    MEMORY    DISK     DIR
colima    Running    127.0.0.1:64505    aarch64    2       2GiB      60GiB    /Users/addo/.lima/colima
```

## 虚拟机配置

Colima 启动的虚拟机默认是 2CPU、2GiB 内存 和 60GiB 存储。可以在创建时通过 --cpu 、--memory 和 --disk 来分配更多资源。

```java
colima start --cpu 4 --memory 16
```

也可以修改当前虚拟机的配置：

```java
colima stop
colima start --cpu 4 --memory 16
```

当然colima除了docker也是支持containerd的

在此之前先删除原来生成的虚拟机

```java
colima stop
colima delete
```

之后创建新的虚拟机

```java
colima start --runtime containerd
```

创建完成之后查看容器

```java
colima nerdctl ps
```

或者运行一个容器

```java
colima nerdctl container run nginx
```

除了containerd colima还支持创建k8s

```java
colima start --with-kubernetes
```

支持自定义虚拟机大小

```java
colima start --cpu 4 --memory 16
```
