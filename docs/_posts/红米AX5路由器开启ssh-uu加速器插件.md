---
title: 红米AX5路由器开启ssh+uu加速器插件
date: 2023-03-23 14:41:07
category:
    - 搞机
tag:
    - 科学上网 
---
# redmi AX5 ssh 开启 +uu加速器插件
这个教程将会指导你如何解锁红米 AX5、小米 AX1800 SSH，并安装 ShellClash 插件，用 Clash 实现科学上网。 

红米 AX5 和小米 AX1800 可以基本看成一个产品，配置基本相同，外观设计不同。CPU都是：高通 IPQ6000，高通四核1.2GHz。在性能上和小米 AX3600 或者说红米 AX6 差距很大，不是非常推荐购买 AX5 更不推荐购买 AX1800。 

## 1.降级路由器
![降级](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/202303231447059.png)  

> 使用这里提供的降级固件，在后台常用设置-系统状态里-手动选择下载好的固件，降级后再解锁 SSH。降级后第一次进入后台配置的时候请选择不自动更新，或者手机小米Wi-Fi App 里关闭系统更新。（目前的系统虽然不是最新的也能够 Mesh 不影响使用，等等吧第三方的 openwrt 已经在路上了） 

* [小米 AX1800 1.0.336 下载](https://cdn.cnbj1.fds.api.mi-img.com/xiaoqiang/rom/rm1800/miwifi_rm1800_firmware_fafda_1.0.336.bin)
* [红米 AX5 1.0.26 下载](https://cdn.cnbj1.fds.api.mi-img.com/xiaoqiang/rom/ra67/miwifi_ra67_all_f3fac_1.0.26.bin)

## 2. 获取 SSH 权限

### 2.1 获取后台 STOK

![image.png](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988410122-86297696-ed90-404d-8e51-bb29e7dc374a.png)

登陆小米路由器后台后，浏览器地址栏 stok= 后面的一段内容即是（选中部分），准备好备用。

### 2.2 获取 SSH

```
http://192.168.31.1/cgi-bin/luci/;stok=[stok]/api/misystem/set_config_iotdev?bssid=Xiaomi&user_id=longdike&ssid=-h%3B%20nvram%20set%20ssh_en%3D1%3B%20nvram%20commit%3B%20sed%20-i%20's%2Fchannel%3D.*%2Fchannel%3D%5C%22debug%5C%22%2Fg'%20%2Fetc%2Finit.d%2Fdropbear%3B%20%2Fetc%2Finit.d%2Fdropbear%20start%3B 
```

将 <STOK> 替换为上一步的值，替换完成后复制到浏览器打开。

### 2.3 修改默认 SSH 密码为 admin

```
http://192.168.31.1/cgi-bin/luci/;stok=[stok]/api/misystem/set_config_iotdev?bssid=Xiaomi&user_id=longdike&ssid=-h%3B%20echo%20-e%20'admin%5Cnadmin'%20%7C%20passwd%20root%3B 
```

将 <STOK> 替换为上上一步的值，替换完成后复制到浏览器打开。

### 2.4 连接 SSH

现在应该可以通过 ssh 连接到 小米 AX1800、红米 AX5 了，终端里执行（密码是 admin，输入不会显示，输入完回车就行）

```
ssh root@192.168.31.1 
```

如果提示这种错误 (没有就可以忽略，第一次让你按 yes 即可)

![image.png](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988418513-42b42fb5-e34e-4dd7-a5fe-5bdb906a1615.png)

你可以删除这个文件的指定行，我这里后面可以看到是 45，或者直接删除这个文件。

```
rm -rf ~/.ssh/known_hosts 
```

## 安装使用 ShellClash

SSH 连接上小米 AX1800、红米 AX5 执行安装

```
sh -c "$(curl -kfsSl https://cdn.jsdelivr.net/gh/juewuy/ShellClash@master/install.sh)" && source /etc/profile &> /dev/null 
```

![image.png](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988410725-f5251f65-8f47-446b-bcd6-277e2c278658.png)

选择 1 安装到 /etc，然后再选择 1 确认安装。

![img](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988412091-f566af57-2b60-4e6a-980a-28ac6ea5ab4b.png)

安装好就能使用 clash 命令了 ，输入 clash 就能进入配置。这里选择 4 让局域网设备都能走代理（如果你清楚别的可以自行选择）。

![img](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988417281-c79ec77f-cdb1-49ed-b6ad-512a38dd4ecb.png)

推荐选择不代理 UDP 也就是 1，然后安装 DashBoard 面板也就能网页直接控制了也就是 1 。

![img](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988430529-eaa96afe-98fa-4830-ac23-4864780c5850.png)

推荐选择 Yacd 面板，界面很好看 选择 2，然后安装目录选择 1 即可。

![img](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988433681-212a8a5d-46c2-4577-a4b5-9b44c556ee88.png)

1 选择导入配置文件。如果你没有 Clash 的配置文件而是 v2ray、ss、trojan 的订阅链接（你的机场会提供），你可以再选择 1 进行「在线生成 Clash 配置文件」；如果有的话可以选择 2 直接导入配置文件。

![img](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988435684-db6b45e7-eb1e-434a-9977-05df0766056e.png)

然后粘贴上你的订阅链接（url 链接），再选择 1 开始生成配置文件。生成配置文件后按 0 返回上层菜单即可。

![img](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988437454-8a61ef8b-3c01-4629-9c02-13eb08180991.png)

再按 1 选择立即开启 Clash 的服务即可。

![img](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988436375-fa1bfb6e-bc3b-423e-a4c9-1609ea01bb0b.png)

启动后你可以通过 http://192.168.31.1:9999/ui，进行节点的切换和规则的选择。当然你再按 4 选择开机启动也可以。

![img](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988437829-156951fe-438c-4920-9534-9f09225a1b17.png)

这个时候应该就能科学上网了速度也应该还可以。

```
后续进入以后如果clash 命令不能执行，需要先执行以下
source /etc/profile
```

## UU加速器插件

### 前置条件

1. 已经刷好开发版本路由器固件
2. 能启用ssh连接
3. 下载网易uu主机加速app

### 在app上点击安装路由器插件

这个时候会提示路由器设备不支持。不过没关系，因为我们已经支持ssh访问了，用ssh方式安装。

#### 1. 通过SSH进入路由器内部

```
sh root@192.168.31.1
```

![image.png](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988511569-ce00a7d3-b025-4a95-9ed2-322799537822.png)

#### 2. 运行UU路由器插件安装指令

这里直接详见[uu加速器中的**OpenWrt**安装方法](https://uu.163.com/router/direction.html)

其中 opkg update 步骤可能失败。不用关心，别的步骤能成功就行

#### 第三步：主机加速 App

打开App并登录后，手机会把我的AX5认为是OpenWrt路由器的网络，点击下一步操作即可