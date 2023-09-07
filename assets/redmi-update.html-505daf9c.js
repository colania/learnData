import{_ as t}from"./plugin-vue_export-helper-c27b6911.js";import{r as d,o as r,c as o,a as e,b as a,d as n,e as s}from"./app-af6e9092.js";const c={},l=s('<h1 id="redmi-ax5-ssh-开启-uu加速器插件" tabindex="-1"><a class="header-anchor" href="#redmi-ax5-ssh-开启-uu加速器插件" aria-hidden="true">#</a> redmi AX5 ssh 开启 +uu加速器插件</h1><p>这个教程将会指导你如何解锁红米 AX5、小米 AX1800 SSH，并安装 ShellClash 插件，用 Clash 实现科学上网。</p><p>红米 AX5 和小米 AX1800 可以基本看成一个产品，配置基本相同，外观设计不同。CPU都是：高通 IPQ6000，高通四核1.2GHz。在性能上和小米 AX3600 或者说红米 AX6 差距很大，不是非常推荐购买 AX5 更不推荐购买 AX1800。</p><h2 id="_1-降级路由器" tabindex="-1"><a class="header-anchor" href="#_1-降级路由器" aria-hidden="true">#</a> 1.降级路由器</h2><figure><img src="https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/202303231447059.png" alt="降级" tabindex="0" loading="lazy"><figcaption>降级</figcaption></figure><blockquote><p>使用这里提供的降级固件，在后台常用设置-系统状态里-手动选择下载好的固件，降级后再解锁 SSH。降级后第一次进入后台配置的时候请选择不自动更新，或者手机小米Wi-Fi App 里关闭系统更新。（目前的系统虽然不是最新的也能够 Mesh 不影响使用，等等吧第三方的 openwrt 已经在路上了）</p></blockquote>',6),h={href:"https://cdn.cnbj1.fds.api.mi-img.com/xiaoqiang/rom/rm1800/miwifi_rm1800_firmware_fafda_1.0.336.bin",target:"_blank",rel:"noopener noreferrer"},g={href:"https://cdn.cnbj1.fds.api.mi-img.com/xiaoqiang/rom/ra67/miwifi_ra67_all_f3fac_1.0.26.bin",target:"_blank",rel:"noopener noreferrer"},p=s(`<h2 id="_2-获取-ssh-权限" tabindex="-1"><a class="header-anchor" href="#_2-获取-ssh-权限" aria-hidden="true">#</a> 2. 获取 SSH 权限</h2><h3 id="_2-1-获取后台-stok" tabindex="-1"><a class="header-anchor" href="#_2-1-获取后台-stok" aria-hidden="true">#</a> 2.1 获取后台 STOK</h3><figure><img src="https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988410122-86297696-ed90-404d-8e51-bb29e7dc374a.png" alt="image.png" tabindex="0" loading="lazy"><figcaption>image.png</figcaption></figure><blockquote><p>登陆小米路由器后台后，浏览器地址栏 stok= 后面的一段内容即是（选中部分），准备好备用。</p></blockquote><h3 id="_2-2-获取-ssh" tabindex="-1"><a class="header-anchor" href="#_2-2-获取-ssh" aria-hidden="true">#</a> 2.2 获取 SSH</h3><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>http://192.168.31.1/cgi-bin/luci/;stok=[stok]/api/misystem/set_config_iotdev?bssid=Xiaomi&amp;user_id=longdike&amp;ssid=-h%3B%20nvram%20set%20ssh_en%3D1%3B%20nvram%20commit%3B%20sed%20-i%20&#39;s%2Fchannel%3D.*%2Fchannel%3D%5C%22debug%5C%22%2Fg&#39;%20%2Fetc%2Finit.d%2Fdropbear%3B%20%2Fetc%2Finit.d%2Fdropbear%20start%3B 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>将<code>stok</code> 替换为上一步的值，替换完成后复制到浏览器打开。</p><h3 id="_2-3-修改默认-ssh-密码为-admin" tabindex="-1"><a class="header-anchor" href="#_2-3-修改默认-ssh-密码为-admin" aria-hidden="true">#</a> 2.3 修改默认 SSH 密码为 admin</h3><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>http://192.168.31.1/cgi-bin/luci/;stok=[stok]/api/misystem/set_config_iotdev?bssid=Xiaomi&amp;user_id=longdike&amp;ssid=-h%3B%20echo%20-e%20&#39;admin%5Cnadmin&#39;%20%7C%20passwd%20root%3B 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>将 <code>STOK</code>替换为上上一步的值，替换完成后复制到浏览器打开。</p><h3 id="_2-4-连接-ssh" tabindex="-1"><a class="header-anchor" href="#_2-4-连接-ssh" aria-hidden="true">#</a> 2.4 连接 SSH</h3><p>现在应该可以通过 ssh 连接到 小米 AX1800、红米 AX5 了，终端里执行（密码是 admin，输入不会显示，输入完回车就行）</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>ssh root@192.168.31.1 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>如果提示这种错误 (没有就可以忽略，第一次让你按 yes 即可)</p><figure><img src="https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988418513-42b42fb5-e34e-4dd7-a5fe-5bdb906a1615.png" alt="image.png" tabindex="0" loading="lazy"><figcaption>image.png</figcaption></figure><p>你可以删除这个文件的指定行，我这里后面可以看到是 45，或者直接删除这个文件。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>rm -rf ~/.ssh/known_hosts 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h2 id="安装使用-shellclash" tabindex="-1"><a class="header-anchor" href="#安装使用-shellclash" aria-hidden="true">#</a> 安装使用 ShellClash</h2><p>SSH 连接上小米 AX1800、红米 AX5 执行安装</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>sh -c &quot;$(curl -kfsSl https://cdn.jsdelivr.net/gh/juewuy/ShellClash@master/install.sh)&quot; &amp;&amp; source /etc/profile &amp;&gt; /dev/null 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><figure><img src="https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988410725-f5251f65-8f47-446b-bcd6-277e2c278658.png" alt="image.png" tabindex="0" loading="lazy"><figcaption>image.png</figcaption></figure><p>选择 1 安装到 /etc，然后再选择 1 确认安装。</p><figure><img src="https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988412091-f566af57-2b60-4e6a-980a-28ac6ea5ab4b.png" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><p>安装好就能使用 clash 命令了 ，输入 clash 就能进入配置。这里选择 4 让局域网设备都能走代理（如果你清楚别的可以自行选择）。</p><figure><img src="https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988417281-c79ec77f-cdb1-49ed-b6ad-512a38dd4ecb.png" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><p>推荐选择不代理 UDP 也就是 1，然后安装 DashBoard 面板也就能网页直接控制了也就是 1 。</p><figure><img src="https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988430529-eaa96afe-98fa-4830-ac23-4864780c5850.png" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><p>推荐选择 Yacd 面板，界面很好看 选择 2，然后安装目录选择 1 即可。</p><figure><img src="https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988433681-212a8a5d-46c2-4577-a4b5-9b44c556ee88.png" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><p>1 选择导入配置文件。如果你没有 Clash 的配置文件而是 v2ray、ss、trojan 的订阅链接（你的机场会提供），你可以再选择 1 进行「在线生成 Clash 配置文件」；如果有的话可以选择 2 直接导入配置文件。</p><figure><img src="https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988435684-db6b45e7-eb1e-434a-9977-05df0766056e.png" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><p>然后粘贴上你的订阅链接（url 链接），再选择 1 开始生成配置文件。生成配置文件后按 0 返回上层菜单即可。</p><figure><img src="https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988437454-8a61ef8b-3c01-4629-9c02-13eb08180991.png" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><p>再按 1 选择立即开启 Clash 的服务即可。</p><figure><img src="https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988436375-fa1bfb6e-bc3b-423e-a4c9-1609ea01bb0b.png" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure>`,35),u={href:"http://192.168.31.1:9999/ui%EF%BC%8C%E8%BF%9B%E8%A1%8C%E8%8A%82%E7%82%B9%E7%9A%84%E5%88%87%E6%8D%A2%E5%92%8C%E8%A7%84%E5%88%99%E7%9A%84%E9%80%89%E6%8B%A9%E3%80%82%E5%BD%93%E7%84%B6%E4%BD%A0%E5%86%8D%E6%8C%89",target:"_blank",rel:"noopener noreferrer"},m=s(`<figure><img src="https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988437829-156951fe-438c-4920-9534-9f09225a1b17.png" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><p>这个时候应该就能科学上网了速度也应该还可以。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>后续进入以后如果clash 命令不能执行，需要先执行以下
source /etc/profile
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="uu加速器插件" tabindex="-1"><a class="header-anchor" href="#uu加速器插件" aria-hidden="true">#</a> UU加速器插件</h2><h3 id="前置条件" tabindex="-1"><a class="header-anchor" href="#前置条件" aria-hidden="true">#</a> 前置条件</h3><ol><li>已经刷好开发版本路由器固件</li><li>能启用ssh连接</li><li>下载网易uu主机加速app</li></ol><h3 id="在app上点击安装路由器插件" tabindex="-1"><a class="header-anchor" href="#在app上点击安装路由器插件" aria-hidden="true">#</a> 在app上点击安装路由器插件</h3><p>这个时候会提示路由器设备不支持。不过没关系，因为我们已经支持ssh访问了，用ssh方式安装。</p><h4 id="_1-通过ssh进入路由器内部" tabindex="-1"><a class="header-anchor" href="#_1-通过ssh进入路由器内部" aria-hidden="true">#</a> 1. 通过SSH进入路由器内部</h4><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>sh root@192.168.31.1
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><figure><img src="https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/1665988511569-ce00a7d3-b025-4a95-9ed2-322799537822.png" alt="image.png" tabindex="0" loading="lazy"><figcaption>image.png</figcaption></figure><h4 id="_2-运行uu路由器插件安装指令" tabindex="-1"><a class="header-anchor" href="#_2-运行uu路由器插件安装指令" aria-hidden="true">#</a> 2. 运行UU路由器插件安装指令</h4>`,12),b={href:"https://uu.163.com/router/direction.html",target:"_blank",rel:"noopener noreferrer"},f=e("strong",null,"OpenWrt",-1),_=e("p",null,"其中 opkg update 步骤可能失败。不用关心，别的步骤能成功就行",-1),x=e("h4",{id:"第三步-主机加速-app",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#第三步-主机加速-app","aria-hidden":"true"},"#"),a(" 第三步：主机加速 App")],-1),v=e("p",null,"打开App并登录后，手机会把我的AX5认为是OpenWrt路由器的网络，点击下一步操作即可",-1);function y(z,A){const i=d("ExternalLinkIcon");return r(),o("div",null,[l,e("blockquote",null,[e("ul",null,[e("li",null,[e("a",h,[a("小米 AX1800 1.0.336 下载"),n(i)])]),e("li",null,[e("a",g,[a("红米 AX5 1.0.26 下载"),n(i)])])])]),p,e("p",null,[a("启动后你可以通过 "),e("a",u,[a("http://192.168.31.1:9999/ui，进行节点的切换和规则的选择。当然你再按"),n(i)]),a(" 4 选择开机启动也可以。")]),m,e("p",null,[a("这里直接详见"),e("a",b,[a("uu加速器中的"),f,a("安装方法"),n(i)])]),_,x,v])}const S=t(c,[["render",y],["__file","redmi-update.html.vue"]]);export{S as default};