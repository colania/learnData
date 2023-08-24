import { navbar } from "vuepress-theme-hope";

// 精选图标：https://theme-hope.vuejs.press/zh/guide/interface/icon.html#iconfont-%E7%B2%BE%E9%80%89%E5%9B%BE%E6%A0%87
export default navbar([
  { text: "博客", icon: "blog", link: "/blog" },
  {
    text: "随心记",
    icon: "code",
    prefix: "/daily",
    children: [""],
  },
  // {
  //   text: "应用",
  //   icon: "app",
  //   prefix: "/",
  //   children: [
  //     // "apps/Applist",
  //     // {
  //     //   text: "直播手册",
  //     //   icon: "quote",
  //     //   link: "apps/livestreaming/1_obs_basic",
  //     // },
  //     {
  //       text: "服务/系统",
  //       icon: "any",
  //       prefix: "",
  //       children: [],
  //     },
  //   ],
  // },
  // {
  //   text: "生活",
  //   icon: "emmet",
  //   prefix: "/family/",
  //   children: [],
  // },
  // {
  //   text: "金融",
  //   icon: "sspai",
  //   // icon: "game",
  //   children: [],
  // },
  // {
  //   text: "英语",
  //   icon: "quote",
  //   // icon: "english",
  //   children: [],
  // },
  {
    text: "Contact",
    icon: "advance",
    children: [
      {
        text: "微信",
        icon: "wechat",
        link: "https://img.newzone.top/wechat.svg",
      },
      { text: "Email", icon: "alias", link: "mailto:wweiooogo@gmail.com" },
      { text: "Discord", icon: "group", link: "https://discord.gg/PZTQfJ4GjX" },
      { text: "RSS", icon: "rss", link: "https://newzone.top/rss.xml" },
    ],
  },
]);
