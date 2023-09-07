import { sidebar } from "vuepress-theme-hope";

// 精选图标：https://theme-hope.vuejs.press/zh/guide/interface/icon.html#iconfont-%E7%B2%BE%E9%80%89%E5%9B%BE%E6%A0%87
export default sidebar([
  "/DailyRoutine",
  // "/Fitness",
  // 读书笔记架构更换到 docsify，不能使用相对链接
  { text: "读书笔记", icon: "read", link: "https://colania.github.io/reading/" },
  // 指定显示页面
  {
    text: "程序人生",
    prefix: "/",
    link: "",
    collapsible: true,
    children: "structure",
    // children: [
    //   {
    //     text: "语言",
    //     prefix: "/code/",
    //     collapsible: true,
    //     children: ["Markdown.md", "Regex.md"],
    //   },
    //   {
    //     text: "运维部署",
    //     prefix: "/deploy/",
    //     collapsible: true,
    //     children: [
    //       "Static.md",
    //       "CloudServices.md",
    //       "VPS.md",
    //       {
    //         text: "部署工具",
    //         icon: "emmet",
    //         collapsible: true,
    //         children: ["GitHub.md", "Cloudflare.md", "MySQL.md", "DNS.md"],
    //       },
    //     ],
    //   }
    // ],
  },
  {
    text: "🧰 应用手册",
    icon: "",
    prefix: "/apps/",
    link: "",
    collapsible: true,
    children: [
      "ChatGPT.md",
      "AppNotes.md",
      "Chrome.md",
    ],
  },
  {
    text: "🪟 随心记",
    icon: "",
    prefix: "/daily/",
    link: "",
    collapsible: true,
    children: "structure",
  },
  {
    text: "🛖 生活记录",
    icon: "",
    prefix: "/life/",
    link: "",
    collapsible: true,
    children: "structure",
  },
  {
    text: "🙈 开口说英语",
    icon: "",
    link: "",
    collapsible: true,
    children: [
      {
        text: "工作英语",
        icon: "emmet",
        collapsible: true,
        children: ["posts/meetingEnglish.md"],
      },
    ],
  },
  {
    text: "🏝️ 金融小知识",
    icon: "",
    prefix: "/finance",
    link: "",
    collapsible: true,
    children: "structure",
  },
  // {
  //   text: "🥥 博客文章",
  //   icon: "blog",
  //   prefix: "/_posts/",
  //   link: "/blog",
  //   collapsible: true,
  //   children: "structure",
  // },
]);
