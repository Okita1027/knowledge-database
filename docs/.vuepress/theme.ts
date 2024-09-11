import {hopeTheme} from "vuepress-theme-hope";

export default hopeTheme({
    // hostname: "https://vuepress-theme-hope-docs-demo.netlify.app",
    //
    author: {
        name: "Okita",
        url: "https://Okita1027.github.io",
        email: "2368932388@qq.com",
    },
    //
    // iconAssets: "fontawesome-with-brands",
    //
    logo: "/logo.png",
    logoDark: "/logo-dark.png",
    favicon: "/favicon.ico",
    navbarTitle: "沖田さんの知識ベース",

    // 默认为 GitHub. 同时也可以是一个完整的 URL
    repo: "https://github.com/Okita1027/knowledge-database",
    // 自定义仓库链接文字。默认从 `repo` 中自动推断为
    // "GitHub" / "GitLab" / "Gitee" / "Bitbucket" 其中之一，或是 "Source"。
    repoLabel: "GitHub",
    // 是否在导航栏内显示仓库链接，默认为 `true`
    repoDisplay: true,

    // docsDir: "src",

    pageInfo: ["Author", "Date", "Category", "Tag", "ReadingTime", "Word"],

    fullscreen: true,
    darkmode: "toggle",

    lastUpdated: true,

    editLink: true,
    contributors: true,
	
    // 默认显示4层级
	headerDepth: 4,

    // 导航布局
    navbarLayout: {
        start: ["Brand"],
        center: ["Links"],
        end: ["Outlook", "Repo", "Search"],
    },
    // 导航栏
    navbar: [
        {
            text: "主页",
            link: "/",
            icon: "/home.png"
        },
        {
            text: "基础",
            link: "/basic/",
            icon: "/icon/java.png",
        },
        {
            text: "数据库",
            link: "/database/",
            icon: "/icon/database.svg",
        },
        {
            text: "框架",
            link: "/frame/",
            icon: "/icon/frame.png",
        },
        {
            text: "前端",
            link: "/web/",
            icon: "/icon/web.png",
        },
        // {
            // text: "相关链接",
            // link: "#",
            // icon: "/icon/relevant/link.png",
            // children: ["https://Okita1027.github.io"]
/*             children: [
                {
                    text: "博客站点",
                    link: "https://Okita1027.github.io",
                    icon: "/favicon.ico"
                },
            ] */
/*             children: [
                {
                    text: "阿萨德",
                    children: ["https://www.baidu.com", "https://yiyan.baidu.com"]
                }
            ] */
        // }
    ],

    // 侧边栏
    sidebar: {
        // "/basic/": [
        //     {
        //         text: "基础",
        //         prefix: "/basic/",
        //         link: "/",
        //         children: [
        //             "JVM.md",
        //             "JUC.md",
        //             "FunctionalProgramming.md",
        //             "JDKNewFeature/"
        //         ]
        //     }
        // ],
        "/basic/": "structure",
        "/database/": "structure",
        "/frame/": "structure",
        "/web/": "structure",
    },

    // 页脚
    footer: "Vuepress & theme-hope",
    copyright: "MIT Licensed | Copyright © 2024-present Okita",
    displayFooter: false,

    // 如果想要实时查看任何改变，启用它。注: 这对更新性能有很大负面影响
    hotReload: true,

    // 在这里配置主题提供的插件
    plugins: {

        // docsearch: {
        //     appId: "AWSKYW5GBL",
        //     apiKey: "bde9b1a8aa183d5a239eb6c030c8c835",
        //     indexName: "okita1027io",
        // },

        copyCode: {
            // 在移动端显示复制按钮
            showInMobile: true,
        },
        
        // Markdown增强配置
        mdEnhance: {
            // 使用KaTex启用Tex支持
            katex: true,
            // 启用下角标功能
            sub: true,
            // 启用上角标
            sup: true,
            // 启用任务列表
            tasklist: true,
            // 启用图片 figure
            figure: true,
            // 启用图片懒加载
            imgLazyload: true,
            // 启用图片标记
            imgMark: true,
            // 启用图片大小
            imgSize: true,
            // 启用导入支持
            include: true,
            // 启用幻灯片
            // revealJs: true,
            // 开启组件支持
            component: true,
            // 启用脚注
            footnote: true,
            // 添加选项卡支持
            tabs: true,
            // 代码块分组
            codetabs: true,
            // 启用 GFM 警告
            alert: true,
            // 开启剧透
            spoiler: true,
            // 开启属性支持
            attrs: true,
            // 启用提示容器
            hint: true,
            // 开启标记
            mark: true,
            // 启用自定义对齐
            align: true,
            // 将段落中的 \n 转换为 <br>
            breaks: true,
            // 将文字中的链接格式文字转换为链接
            linkify: false,


            // 以下均为原本的内容
            // align: true,
            // attrs: true,
            // codetabs: true,
            // component: true,
            // demo: true,
            // figure: true,
            // imgLazyload: true,
            // imgSize: true,
            // include: true,
            // mark: true,
            // plantuml: true,
            // spoiler: true,
            // stylize: [
            //   {
            //     matcher: "Recommended",
            //     replacer: ({ tag }) => {
            //       if (tag === "em")
            //         return {
            //           tag: "Badge",
            //           attrs: { type: "tip" },
            //           content: "Recommended",
            //         };
            //     },
            //   },
            // ],
            // sub: true,
            // sup: true,
            // tabs: true,
            // tasklist: true,
            // vPre: true,

            // 在启用之前安装 chart.js
            // chart: true,

            // insert component easily

            // 在启用之前安装 echarts
            // echarts: true,

            // 在启用之前安装 flowchart.ts
            // flowchart: true,

            // gfm requires mathjax-full to provide tex support
            // gfm: true,

            // 在启用之前安装 katex
            // katex: true,

            // 在启用之前安装 mathjax-full
            // mathjax: true,

            // 在启用之前安装 mermaid
            mermaid: true,

            // playground: {
            //   presets: ["ts", "vue"],
            // },

            // 在启用之前安装 reveal.js
            // revealJs: {
            //   plugins: ["highlight", "math", "search", "notes", "zoom"],
            // },

            // 在启用之前安装 @vue/repl
            // vuePlayground: true,

            // install sandpack-vue3 before enabling it
            // sandpack: true,
        },

        // 如果你需要 PWA。安装 @vuepress/plugin-pwa 并取消下方注释
        // pwa: {
        //   favicon: "/favicon.ico",
        //   cacheHTML: true,
        //   cacheImage: true,
        //   appendBase: true,
        //   apple: {
        //     icon: "/assets/icon/apple-icon-152.png",
        //     statusBarColor: "black",
        //   },
        //   msTile: {
        //     image: "/assets/icon/ms-icon-144.png",
        //     color: "#ffffff",
        //   },
        //   manifest: {
        //     icons: [
        //       {
        //         src: "/assets/icon/chrome-mask-512.png",
        //         sizes: "512x512",
        //         purpose: "maskable",
        //         type: "image/png",
        //       },
        //       {
        //         src: "/assets/icon/chrome-mask-192.png",
        //         sizes: "192x192",
        //         purpose: "maskable",
        //         type: "image/png",
        //       },
        //       {
        //         src: "/assets/icon/chrome-512.png",
        //         sizes: "512x512",
        //         type: "image/png",
        //       },
        //       {
        //         src: "/assets/icon/chrome-192.png",
        //         sizes: "192x192",
        //         type: "image/png",
        //       },
        //     ],
        //     shortcuts: [
        //       {
        //         name: "Demo",
        //         short_name: "Demo",
        //         url: "/demo/",
        //         icons: [
        //           {
        //             src: "/assets/icon/guide-maskable.png",
        //             sizes: "192x192",
        //             purpose: "maskable",
        //             type: "image/png",
        //           },
        //         ],
        //       },
        //     ],
        //   },
        // },

    },
});
