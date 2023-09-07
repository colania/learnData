import { sidebar } from "vuepress-theme-hope";

// 精选图标：https://theme-hope.vuejs.press/zh/guide/interface/icon.html#iconfont-%E7%B2%BE%E9%80%89%E5%9B%BE%E6%A0%87
export default sidebar([
  "/DailyRoutine",
  // "/Fitness",
  // 读书笔记架构更换到 docsify，不能使用相对链接
  { text: "读书笔记",  link: "https://colania.github.io/reading/" },
  {
    text: "随心记",
    prefix: "/post/daily",
    link: "",
    collapsible: true,
    children:"structure",
  },
  {
    text: "程序人生",
    prefix: "/",
    link: "",
    collapsible: true,
    children: [
      {
        text: "工作思考",
        link: "",
        collapsible: true,
        children:[],
      },{
        text: "编码",
        link: "",
        collapsible: true,
        children:[],
      }
    ],
  },
  {
    text: "应用手册",
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
    text: "生活记录",
    prefix: "/life/",
    link: "",
    collapsible: true,
    children: "structure",
  },
  {
    text: "开口说英语",
    link: "",
    collapsible: true,
    children: [
      {
        text: "工作英语",
        collapsible: true,
        children: ["posts/meetingEnglish.md"],
      },
    ],
  },
  {
    text: "金融小知识",
    prefix: "/finance",
    link: "",
    collapsible: true,
    children: "structure",
  },
]);
