/** @format */

import { defineUserConfig } from "vuepress";
import viteBundler from "@vuepress/bundler-vite";
import theme from "./theme.js";

export default defineUserConfig({
	port: 4000,

	// 在开发服务器启动后打开浏览器
	open: false,

	base: "/kd/",

	lang: "zh-CN",
	title: "沖田さんの知識ベース",
	description: "基于VuePress的知识库,主题hope",

	bundler: viteBundler(),

	theme,
    
	// markdown: {
	// 	headers: {
	// 		// 根据需要显示2-6层级
	// 		level: [2, 3, 4, 5]
	// 	},
	// },

	// 和 PWA 一起启用
	// shouldPrefetch: false,
});
