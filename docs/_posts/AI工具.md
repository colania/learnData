---
title: AI工具介绍
date: 2023-03-18 11:20:09
categories:
- 行业追踪
tags:
    - AI
---

# AI工具介绍

随着当前网络数据量的爆发，基于大数据的AI，现在越来越智能了。尤其是chatgpt的推出，AI使用越来越广泛。

本文主要介绍当前广泛使用的AI工具。

## chatGPT

ChatGPT是一种基于Transformer架构的深度学习模型，可以对语言进行建模和生成。它可以处理问答、对话生成、文本生成等多种任务，可以认为是当前最为智能的AI工具。甚至有人将其称为新时代的奠基者，我们将从互联网时代进入AI时代。

当前chatGPT有两种使用方法：

1. 通过[官网](https://chat.openai.com/ )使用。
2. 通过chatGPT - API 使用

每个账号注册好以后，都有18美元的免费体验机会，这个还是相当给力的。

这里就不讲他如何注册了，当前网络上也有很多的注册方法，例如：

[ChatGPT保姆级教程，一分钟学会使用ChatGPT](https://juejin.cn/post/7198097078005841980)

### 使用方法：

1. 如何更好的使用chatGPT呢，有些人在使用时，可能觉得这个ai好智障，怎么答非所问的。其实你需要给他一个“人设” 。 比如，你需要告诉chatGPT说假设你是一个精研开发多年的JAVA工程师，擅长微服务架构。后续再进行提问时，答案会更加精准。

   [已经整理好的chatGPT人设语句]([](https://github.com/colania/awesome-chatgpt-prompts))

   [中文调教指南](https://github.com/colania/awesome-chatgpt-prompts-zh)

2. 基于chatGPT的比较好用的二次开发工具。

   1. [tg机器人接入chatGPT-API，且不需要提供服务器](https://github.com/colania/ChatGPT-Telegram-Workers)

   2. [用 Express 和 Vue3 搭建的 ChatGPT 演示网页,需要服务器，需要翻墙](https://github.com/colania/chatgpt-web)

## 代码

自从ChatGPT发布以后，各种垂直领域的AI工具也被相继开发出来。作为软件开发，最先接触到的代码编写工具。

### [cursor.so](https://www.cursor.so/)

尝试以后还是挺好用的，可以很容易的做一些需求，比如说算法题，还可以指定他的创作语言，哈哈哈哈。（字节大危机）

![image-20230320215027345](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230320215027345.png)

### [Warp](https://www.warp.dev/)

warp其实是一个比较新的一个为开发人员打造的Terminal工具。

Warp解决的痛点，是通过减少配置、方便输入，优化输出，增加常用命令行自动提示(通过fig)，方便查看历史记录，可定义流程，等等实现的。（这些官方可以找到，还是挺好用的）

今天发现Warp也接入了chatGPT，每天有100次的体验机会。

![image-20230320215533735](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230320215533735.png)

## 文档

### [NotionAI](https://www.notion.so/product/ai)

Notion AI可以用来写文案、写策划、写表格、写视频脚本、帮忙读论文做总结等，只要涉及到文档相关的事情，他都会有很亮眼的发挥，可惜的是免费体验机会太少了，只有20次。（可以找某宝增加使用机会）

我在写一些文档的时候，很大一部分基础部分都会用他进行生成。

![image-20230320220639491](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230320220639491.png)

### office copilot

office copilot是我最为期待的一个工具。对外宣传可以**协助用户生成文档、电子邮件、演示文稿和更多内容**，而且演示效果也确实不错。但是现在还没有机会体验到。而且会接入到微软的所有office工具中，未来可期。

> With Copilot, you’re always in control. You decide what to keep, modify or discard. Now, you can be more creative in Word, more analytical in Excel, more expressive in PowerPoint, more productive in Outlook and more collaborative in Teams.

![2ndary-image-for-March-16_](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/2ndary-image-for-March-16_.webp)



## 绘画工具(只介绍通过网络提供服务的)

AI绘画在人工智能领域中大放异彩，现在只要你浏览互联网，基本上都能发现各种AI画画，而且质量越来越高，越来越逼真，有很多创作已经分不清是照片还是AI绘画。

### [DALL-E 2](https://openai.com/product/dall-e-2)

「DALL-E 2」，名称合成自超现实主义艺术家“萨尔瓦多·达利(Salvador Dalí)”和《机器人总动员》的英文名“WALL-E”。 也是OPEN-AI的作品之一。

![img](https://pic2.zhimg.com/v2-360acc4244e461369d92861fc23c60d9_b.jpg)

### [Midjourney](https://www.midjourney.com)

Midjourney AI是架设在discord上一个AI工具，使用起来也很方便，可以不断的进行优化。生成效果真的不错。

我在使用时会通过chatGPT将我想要绘画的内容以Midjourney 能够识别的词提取关键字，然后再将这些关键词传给Midjourney进行绘画，效果还是不错滴。而且在频道中有很多大佬分享他们的AI创作。

![image-20230320221218533](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230320221218533.png)

### [StableDiffusion](https://huggingface.co/spaces/stabilityai/stable-diffusion)

“Stable Diffusion”是开源图像合成模型，这个 AI 作画工具几乎可以模仿任何视觉风格，如果你输入一个描述性短语，图像就会像魔术一样出现在你的屏幕上。 使用这个工具时，最重要的是找到他能够识别的关键词。

![image-20230320221727648](https://bard-note.oss-cn-hangzhou.aliyuncs.com/img/image-20230320221727648.png)



## 国内的AI工具

### 文言一心

虽然百度文言一心的发布会直播让人尬的直抠脚。没有进行现场演示，只敢放录播不敢实际操作，说的难听一点，[贾跃亭](https://www.zhihu.com/search?q=贾跃亭&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A2939535808})如果是PPT造车的，那[李彦宏](https://www.zhihu.com/search?q=李彦宏&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra={"sourceType"%3A"answer"%2C"sourceId"%3A2939535808})就是PPT造了个AIGC的大模型。

在实际体验的时候，确实效果不尽如人意。但是很很明确的是，这个一定是百度自研的，而不是chatGPT套壳软件。在当前世界脱钩的情况下，在AI方面，拥有一款国产自主的工具也是会有很广泛的市场。目前来看，文言一心相比chatGPT来说也就落后一两年，希望能够不断进步，查缺补漏。

有人说发布会没开多久，股民直接就用脚投票了，但是后面几天的连续猛涨，还是能看出来市场很看好他的未来。
