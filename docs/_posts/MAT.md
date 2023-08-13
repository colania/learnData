---
title: MAT(Java堆分析工具)使用方式
date: 2023-03-29 15:11:29
category:
  - coding
tag:
  - tools
---

# MAT(Java堆分析工具)使用方式

最近在整理笔记，发现之前在分析JAVA内存问题时写的Mat工具文档还是蛮清晰的，现重新整理一下，分享出来。

## MAT是个啥

MAT 全称 `Eclipse Memory Analysis Tools` 是一个分析 Java堆数据的专业工具，可以计算出内存中对象的实例数量、占用空间大小、引用关系等，看看是谁阻止了垃圾收集器的回收工作，从而定位内存泄漏的原因。

## 什么时候会用到

* OutOfMemoryError的时候，触发full gc，但空间却回收不了，引发内存泄露
* java服务器系统异常，比如load飙高，io异常，或者线程死锁等，都可能通过分析堆中的内存对象来定位原因

## 怎么安装

[MAT最新下载版本](https://www.eclipse.org/mat/downloads.php)

[MAT历史版本](https://www.eclipse.org/mat/previousReleases.php)

比较重要的是MAT的版本是和JAVA版本有关的，如果下载的话，需要考虑是否支持本地的 JAVA 版本 。

我用的是MAC  Intel 版本，所以下载的是 `MemoryAnalyzer-1.12.0.20210602-macosx.cocoa.x86_64` 。当前最新的 `Memory Analyzer 1.14.0 Release` 需要Java 17+。

![image-20230329152800939](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230329152800939.png)

## 如何使用 

首先，MAT是用来分析JAVA堆数据的专业工具，那如何才能获取到JAVA堆数据呢。

### 分析文件生成方式

1. 自动生成，jvm启动参数里添加下面配置，当发生OutOfMemoryError时，虚拟机会自动dump内存快照

```
-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=$LOG_DIR/java.hprof"
```

2. 手动生成，通过执行jdk自带命令

```
jmap -dump:format=b,file=heap.bin  <pid>
```

3. Arthas heapdump命令

```
heapdump xxxxxx.hprof
```

接下就可以用 MAT打开转换后的.hprof文件

**<span style='color:red'>（！我这里只是介绍使用方式，并不是arthas有问题，这个dump文件只是随手生成的一份）</span>**

### 使用MAT

打开后的首页，里面是一些堆的基本概要信息，比如空间大小、类的数量、对象实例数量、类加载器等等

![image-20230329153514976](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230329153514976.png)

## MAT功能

MAT的核心功能有三类：

- Actions：
  - **Histogram 列出每个类所对应的对象个数，以及所占用的内存大小；**
  - **Dominator Tree 以占用总内存的百分比的方式来列举出所有的实例对象，注意这个地方是直接列举出的对应的对象而不是类，这个视图是用来发现大内存对象的**
  - Top Consumers：按照类和包分组的方式展示出占用内存最大的一个对象
  - Duplicate Classes：检测由多个类加载器所加载的类信息（用来查找重复的类）
- Reports：
  - **Leak Suspects：通过MAT自动分析当前内存泄露的主要原因**
  - Top Components：Top组件，列出大于总堆1%的组件的报告
- Step By Step：
  - Component Report：组件报告,分析属于公共根包或类加载器的对象；

下面列举一些会用到的功能。

### Histogram

列出每个类所对应的对象个数，以及所占用的内存大小。

选中一个ClassName单击后，通过左上角Inspector可以看到当前类的回收情况，内存地址，等

![image-20230329154124926](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230329154124926.png)

### Dominator Tree

以占用总内存的百分比的方式来列举出所有的实例对象，注意这个地方是直接列举出的对应的对象而不是类，这个视图是用来发现大内存对象的

* 通过`Dominator Tree` 可以轻松看到那些对象占据了大量堆空间，也就可以断定，当前问题出自于哪个对象。

* 再根据该对象的生成方式，去判断出问题的代码在哪里。

![image-20230329154234980](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230329154234980.png)

由上图可看到`com.taobao.arthas.core.server.ArthasBootstrap @ 0x7ba601258`占用了32.97%的内存

**那么当我们需要查看，当前该ArthasBootstrap @ 0x7ba601258对象都引用了那些数据，以及当前该对象是被那几个对象所引用的，如何查看？**

在当前所要查看的对象右键，点击List Objects可以看到分别提供了：`with outgoing references（查看当前该对象的所有的引用信息）` 和 `with incoming references（查看当前该对象是被那几个对象所引用的）` ；

![image-20230329154846899](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230329154846899.png)

快速找出某个实例没被释放的原因，可以右健 Path to GC Roots–>exclude all phantom/weak/soft etc. references

![image-20230329155941552](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230329155941552.png)

### Leak Suspects

通过MAT自动分析当前内存问题的主要原因

![image-20230329154945313](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230329154945313.png)

可以看到，当前给出的主要原因是：` **com.taobao.arthas.core.server.ArthasBootstrap** ` 实例占据**8,392,160 (32.97%)** bytes ， 是由` **com.taobao.arthas.agent.ArthasClassloader @ 0x7ba556870**`加载的。

还给出了关键字：

**Keywords**

- com.taobao.arthas.core.server.ArthasBootstrap
- com.taobao.arthas.agent.ArthasClassloader @ 0x7ba556870
- com.taobao.arthas.core.shell.term.impl.http.api.HttpApiHandler

点击detail的话，会有更详细的内容

![image-20230329155356140](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230329155356140.png)

![image-20230329155424428](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230329155424428.png)

### Thread_Overview

用来查看当前进程dump时的所有线程的堆栈信息，通过分析下面所对应的堆栈信息，可以很快速的定位到对应的线程所执行的方法等层级关系，以此来定位对应的异常问题；

![image-20230329155550728](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230329155550728.png)

### Heap Dump Overview

查看全局的内存占用信息

![image-20230329155637605](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230329155637605.png)
