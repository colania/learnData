import { navbar } from "vuepress-theme-hope";

// 精选图标：https://theme-hope.vuejs.press/zh/guide/interface/icon.html#iconfont-%E7%B2%BE%E9%80%89%E5%9B%BE%E6%A0%87
export default navbar([
  { text: "博客", link: "/blog" },
  { text: "目录", link: "/" },
  { text: "随心记", link: "/daily/summary" },
  {
    text: "Contact",
    children: [
      {
        text: "微信",
        icon: "wechat",
        link: "/wechat.jpg",
      },
      { text: "Email", link: "mailto:wweiooogo@gmail.com" },
      { text: "Discord", link: "https://discord.gg/PZTQfJ4GjX" },
      // { text: "RSS",  link: "https://newzone.top/rss.xml" },
    ],
  },
]);
