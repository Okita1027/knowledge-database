---
title: Vue
shortTitle: Vue
description: 
date: 2024-06-16 22:30:39
categories: [Vue]
tags: []
---
## 准备知识
### 文件结构
#### Vue 组件
Vue 的组件文件以 .vue 结尾，每个组件由三部分组成
```vue
<script setup lang="ts"></script>

<template></template>

<style scoped></style>
```

- script 代码部分，控制模板的数据来源和行为
- template 模板部分，由它生成 html 代码
- style 样式部分，一般不咋关心
#### 初始3文件
`index.html` 作为应用程序的入口文件，引入了 `main.ts`，而 `main.ts` 创建了一个 Vue 实例，并将 `App.vue` 作为根组件传递给这个实例。最终，`App.vue` 包含了应用程序的整体结构和逻辑。
##### App.vue
```vue
<template>
  <div class="app">
    <!-- 应用程序的结构和逻辑 -->
  </div>
</template>

<script>
export default {	// ES6新增的导出语法
  // 组件的选项和逻辑
}
</script>

<style>
/* 组件的样式 */
</style>
```
##### index.html
```typescript
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Vue App</title>
</head>
<body>
  <div id="app"></div> <!-- 根容器元素 -->
  <script src="main.js"></script> <!-- 主要脚本文件 -->
</body>
</html>
```
##### main.ts
```typescript
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app'); // 创建 Vue 实例并挂载到根容器元素
```

- createApp 是创建一个 Vue 应用程序，它接收的参数 App 即之前我们看到的根组件
- mount 就是把根组件生成的 html 代码片段【挂载】到 index.html 中 id 为 app 的 html 元素上
#### 自定义组件
components文件夹用于创建自定义组件，而后引入App.vue中使用。
```vue
<script setup lang="ts">

import {ref} from "vue";

let username = ref('root');
let password = '123456';
console.log('username.vue')
</script>

<template>
  <div class="user">
    <p>===================== User.vue ===========================</p>
    账户：{{ username }} 密码：{{ password }}
  </div>
</template>
```
```vue
<template>
  <div class="app">
    <Person/>
    <Person/>	<!-- 可以重复写多个组件 -->
    <User></User>	<!-- 单标签、双标签都可以 -->
  </div>
</template>

<script lang="ts">
// 引入自定义的组件
import Person from './components/Person.vue';
import User from "./components/User.vue";

export default {
  name: 'App',	// 定义了当前组件的名称为 "App"。这个名称可以在开发者工具中用于调试和识别组件。
  components: {	// 注册和导入其他组件，以便在当前组件中使用。
    // 使用Person、User组件
    Person,
    User
  }
}
</script>

<style>
* {
  font-family: 微软雅黑,serif;
  font-size: 20px;
}
</style>
```
#### 组件名格式
使用 PascalCase 作为组件名的注册格式，这是因为：

1. `PascalCase` 是合法的 JavaScript 标识符。这使得在 JavaScript 中导入和注册组件都很容易，同时 IDE 也能提供较好的自动补全。
2. `<PascalCase />` 在模板中更明显地表明了这是一个 Vue 组件，而不是原生 HTML 元素。同时也能将 Vue 组件和自定义元素 (web components) 区分开来。

在单文件组件和内联字符串模板中，我们都推荐这样做。但是，PascalCase 的标签名在 DOM 内模板中是不可用的，详情参见 [DOM 内模板解析注意事项](https://cn.vuejs.org/guide/essentials/component-basics.html#in-dom-template-parsing-caveats)。
为了方便，Vue 支持将模板中使用 kebab-case 的标签解析为使用 PascalCase 注册的组件。这意味着一个以 `MyComponent` 为名注册的组件，在模板中可以通过 `<MyComponent>` 或 `<my-component>` 引用。这让我们能够使用同样的 JavaScript 组件注册代码来配合不同来源的模板。
### vite.config.ts
文档地址：[配置 Vite {#configuring-vite} | Vite中文网 (vitejs.cn)](https://vitejs.cn/config/#server-proxy)
`vite.config.ts` 中的路径别名配置是针对 Vite 构建工具的，主要用于在构建阶段解析模块导入路径。
#### 修改端口
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 7070,  //设置监听端口味7070
    host: "0.0.0.0" //网络中的其它主机也可访问该端口
  }
})
```
#### 文件夹别名
##### 配置
```typescript
import { defineConfig } from 'vite'
import { resolve } from 'path'

/* 路径配置
  const pathResolve = (dir: string): any => {
      return resolve(__dirname, ".", dir)
  }
  const alias: Record<string, string> = {
      '@': pathResolve('src')
  这样子下面的alias就不用写 ：{...} 了
}*/

export default defineConfig({
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
            "@c": resolve(__dirname, "src/components")
        }
    }
})
```

- resolve: 这是Node.js的 path 模块提供的一个方法，用于将路径片段解析为绝对路径。
- alias: 在Vite配置中的 resolve.alias 是一个对象，它定义了如何将导入的别名解析为对应的路径。
   - '@': resolve(__dirname, './src'): 这里定义了路径别名 @，它被解析为项目根目录下的 src 文件夹的绝对路径。__dirname 是Node.js中的一个全局变量，它返回当前执行文件所在的目录。Vite在构建时会使用这个别名，这意味着你可以在项目中的任何文件里使用 import 或 require 语法时使用 @ 来引用 src 目录。
##### 可能出现的问题
`import { resolve } from 'path'` 这一行可能会爆红（但不影响执行）

- 原因1：path模块是node.js内置的功能，但是node.js本身并不支持ts
解决方案：安装@types/node 

`npm install @types/node -D`
> 在运行 `npm install @types/node -D` 命令时，`-D` 是 npm install 命令中的一个选项，表示将包安装为开发依赖（devDependencies）。
> 具体来说：
> - `-D` 或 `--save-dev` 选项会将包安装到 `package.json` 文件中的 `devDependencies` 字段下。
> - 开发依赖通常是指在开发阶段需要用到的包，比如 TypeScript 的类型声明文件、代码检查工具、构建工具等。这些依赖在项目部署到生产环境时通常是不需要的，只在开发和构建过程中使用。
> 
因此，通过在 `npm install` 命令中使用 `-D` 选项，安装的包将被添加到 `devDependencies` 中，而不是 `dependencies` 中，从而更清晰地区分出开发依赖和生产依赖。

- 原因2：本地node_modules已经存在@types/node包，还是找不到对应的fs模块

解决方案：检查typescript对应的编译配置文件tsconfig.json中是否配置了对应的声明包文件（@types/node）
```json
  "types": [
      "webpack-env",
      "mocha",
      "chai",
      "node"	// ☆
    ]
```
#### 配置代理
为了避免前后端服务器联调时， fetch、xhr 请求产生跨域问题，需要配置代理。
```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 7070,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```
### tsconfig.json
#### 配置详解
```json
"compilerOptions": {
  "incremental": true, // TS编译器在第一次编译之后会生成一个存储编译信息的文件，第二次编译会在第一次的基础上进行增量编译，可以提高编译的速度
  "tsBuildInfoFile": "./buildFile", // 增量编译文件的存储位置
  "diagnostics": true, // 打印诊断信息 
  "target": "ES5", // 目标语言的版本
  "module": "CommonJS", // 生成代码的模板标准
  "outFile": "./app.js", // 将多个相互依赖的文件生成一个文件，可以用在AMD模块中，即开启时应设置"module": "AMD",
  "lib": ["DOM", "ES2015", "ScriptHost", "ES2019.Array"], // TS需要引用的库，即声明文件，es5 默认引用dom、es5、scripthost,如需要使用es的高级版本特性，通常都需要配置，如es8的数组新特性需要引入"ES2019.Array",
  "allowJS": true, // 允许编译器编译JS，JSX文件
  "checkJs": true, // 允许在JS文件中报错，通常与allowJS一起使用
  "outDir": "./dist", // 指定输出目录
  "rootDir": "./", // 指定输出文件目录(用于输出)，用于控制输出目录结构
  "declaration": true, // 生成声明文件，开启后会自动生成声明文件
  "declarationDir": "./file", // 指定生成声明文件存放目录
  "emitDeclarationOnly": true, // 只生成声明文件，而不会生成js文件
  "sourceMap": true, // 生成目标文件的sourceMap文件
  "inlineSourceMap": true, // 生成目标文件的inline SourceMap，inline SourceMap会包含在生成的js文件中
  "declarationMap": true, // 为声明文件生成sourceMap
  "typeRoots": [], // 声明文件目录，默认时node_modules/@types
  "types": [], // 加载的声明文件包
  "removeComments":true, // 删除注释 
  "noEmit": true, // 不输出文件,即编译后不会生成任何js文件
  "noEmitOnError": true, // 发送错误时不输出任何文件
  "noEmitHelpers": true, // 不生成helper函数，减小体积，需要额外安装，常配合importHelpers一起使用
  "importHelpers": true, // 通过tslib引入helper函数，文件必须是模块
  "downlevelIteration": true, // 降级遍历器实现，如果目标源是es3/5，那么遍历器会有降级的实现
  "strict": true, // 开启所有严格的类型检查
  "jsx": "preserve", // 指定 jsx 格式
  "resolveJsonModule": true, //设置true则可以直接import导入本地的json文件,例如import pathOptions from './table.json'
  "alwaysStrict": true, // 在代码中注入'use strict'
  "noImplicitAny": true, // 不允许隐式的any类型
  "strictNullChecks": true, // 不允许把null、undefined赋值给其他类型的变量
  "strictFunctionTypes": true, // 不允许函数参数双向协变
  "strictPropertyInitialization": true, // 类的实例属性必须初始化
  "strictBindCallApply": true, // 严格的bind/call/apply检查
  "noImplicitThis": true, // 不允许this有隐式的any类型
  "noUnusedLocals": true, // 检查只声明、未使用的局部变量(只提示不报错)
  "noUnusedParameters": true, // 检查未使用的函数参数(只提示不报错)
  "noFallthroughCasesInSwitch": true, // 防止switch语句贯穿(即如果没有break语句后面不会执行)
  "noImplicitReturns": true, //每个分支都会有返回值
  "esModuleInterop": true, // 允许export=导出，由import from 导入
  "allowUmdGlobalAccess": true, // 允许在模块中全局变量的方式访问umd模块
  "moduleResolution": "node", // 模块解析策略，ts默认用node的解析策略，即相对的方式导入
  "baseUrl": "./", // 解析非相对模块的基地址，默认是当前目录
  "paths": { // 路径映射，相对于baseUrl
    // 如使用jq时不想使用默认版本，而需要手动指定版本，可进行如下配置
    "jquery": ["node_modules/jquery/dist/jquery.min.js"]
  },
  "rootDirs": ["src","out"], // 将多个目录放在一个虚拟目录下，用于运行时，即编译后引入文件的位置可能发生变化，这也设置可以虚拟src和out在同一个目录下，不用再去改变路径也不会报错
  "listEmittedFiles": true, // 打印输出文件
  "listFiles": true// 打印编译的文件(包括引用的声明文件)
}
```
#### 文件夹别名
`tsconfig.json` 中的路径别名配置是针对 TypeScript 编译器的，主要用于在编译阶段解析模块导入路径。
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- "baseUrl": "./": 这一行设置了模块解析的基本目录为当前目录（这通常是项目根目录）。这意味着相对路径的导入将相对于这个目录进行解析。
- "paths": 这个对象提供了一个映射，用于将模块名（例如 @/...）转换为对应的路径（相对于 baseUrl）。
   - "@/*": ["./src/*"]: 这里定义了一个路径别名 @，它映射到 src 目录。这样，你可以在项目中的任何TypeScript文件里使用像 import something from '@/utils/my-module' 这样的语法，来代替相对路径的导入，TypeScript编译器会将 @ 解析为 src 目录。在路径映射中，星号（*）是一个通配符，它代表了别名后面的所有路径部分。

 如果baseUrl设置为'src',那paths就应该配置为{"@/*": "./*"},如下：
```json
"baseUrl": "src",
"paths": {
  "@/*": ["./*"]
}
```
配置完成后，引入时就可以简写了。例如要引入`src/types/index.ts`中的自定义类型，就可以在vue组件中`import {type Children} from "@/types"`
## 基础内容
### 指令 Directives
指令是带有 v- 前缀的特殊 attribute。Vue 提供了许多[内置指令](https://cn.vuejs.org/api/built-in-directives.html)，包括上面我们所介绍的 v-bind 和 v-html。
指令 attribute 的期望值为一个 JavaScript 表达式 (除了少数几个例外，即之后要讨论到的 v-for、v-on 和 v-slot)。一个指令的任务是在其表达式的值变化时响应式地更新 DOM。以 [v-if](https://cn.vuejs.org/api/built-in-directives.html#v-if) 为例：
```html
<p v-if="seen">Now you see me</p>
```
这里，v-if 指令会基于表达式 seen 的值的真假来移除/插入该 `<p>` 元素。
#### 参数 Arguments
某些指令会需要一个“参数”，在指令名后通过一个冒号隔开做标识。例如用 v-bind 指令来响应式地更新一个 HTML attribute：
```html
<a v-bind:href="url"> ... </a>

<!-- 简写 -->
<a :href="url"> ... </a>
```
这里 href 就是一个参数，它告诉 v-bind 指令将表达式 url 的值绑定到元素的 `href`attribute 上。在简写中，参数前的一切 (例如 v-bind:) 都会被缩略为一个 `:` 字符。
另一个例子是 v-on 指令，它将监听 DOM 事件：
```html
<a v-on:click="doSomething"> ... </a>

<!-- 简写 -->
<a @click="doSomething"> ... </a>
```
这里的参数是要监听的事件名称：click。v-on 有一个相应的缩写，即 `@` 字符。我们之后也会讨论关于事件处理的更多细节。
#### 动态参数
同样在指令参数上也可以使用一个 JavaScript 表达式，需要包含在一对方括号内：
```html
<!--
  注意，参数表达式有一些约束，
  参见下面“动态参数值的限制”与“动态参数语法的限制”章节的解释
-->
<a v-bind:[attributeName]="url"> ... </a>

<!-- 简写 -->
<a :[attributeName]="url"> ... </a>
```
这里的 attributeName 会作为一个 JavaScript 表达式被动态执行，计算得到的值会被用作最终的参数。举例来说，如果你的组件实例有一个数据属性 attributeName，其值为 "href"，那么这个绑定就等价于 v-bind:href。
相似地，你还可以将一个函数绑定到动态的事件名称上：
```html
<a v-on:[eventName]="doSomething"> ... </a>

<!-- 简写 -->
<a @[eventName]="doSomething"> ... </a>
```
在此示例中，当 eventName 的值是 "focus" 时，v-on:[eventName] 就等价于 v-on:focus。
```vue
<script setup lang="ts">
function alertMsg() {
  alert('hello world')
}
const asg = 'click'
</script>

<template>
  <!-- 以下四行全部相等 -->
  <button v-on:[asg]="alertMsg">qqqqq</button>
  <button v-on:click="alertMsg">wwwww</button>
  <!-- 简写形式 -->
  <button @click="alertMsg">eeeee</button>
  <button @[asg]="alertMsg">yyyyy</button>
</template>
```
##### 动态参数值的限制
动态参数中表达式的值应当是一个字符串，或者是 null。特殊值 null 意为显式移除该绑定。其他非字符串的值会触发警告。
```vue
<button @[null]="alertMsg">yyyyy</button>
```
##### 动态参数语法的限制
动态参数表达式因为某些字符的缘故有一些语法限制，比如空格和引号，在 HTML attribute 名称中都是不合法的。例如下面的示例：
```vue
<!-- 这会触发一个编译器警告 -->
<a :['foo' + bar]="value"> ... </a>
```
如果你需要传入一个复杂的动态参数，我们推荐使用[计算属性](https://cn.vuejs.org/guide/essentials/computed.html)替换复杂的表达式，也是 Vue 最基础的概念之一，我们很快就会讲到。
当使用 DOM 内嵌模板 (直接写在 HTML 文件里的模板) 时，我们需要避免在名称中使用大写字母，因为浏览器会强制将其转换为小写：
```html
<a :[someAttr]="value"> ... </a>
```
上面的例子将会在 DOM 内嵌模板中被转换为 :[someattr]。如果你的组件拥有 “someAttr” 属性而非 “someattr”，这段代码将不会工作。单文件组件内的模板**不**受此限制。
#### 修饰符 Modifiers
修饰符是以点开头的特殊后缀，表明指令需要以一些特殊的方式被绑定。例如 .prevent 修饰符会告知 v-on 指令对触发的事件调用 event.preventDefault()：
```html
<form @submit.prevent="onSubmit">...</form>
```
之后在讲到 [v-on](https://cn.vuejs.org/guide/essentials/event-handling.html#event-modifiers) 和 [v-model](https://cn.vuejs.org/guide/essentials/forms.html#modifiers) 的功能时，你将会看到其他修饰符的例子。
最后，在这里你可以直观地看到完整的指令语法：
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/vue/202406171459599.png)

### 绑定class
数据绑定的一个常见需求场景是操纵元素的 CSS class 列表和内联样式。因为 `class`和 `style`都是 attribute，我们可以和其他 attribute 一样使用 `v-bind` 将它们和动态的字符串绑定。但是，在处理比较复杂的绑定时，通过拼接生成字符串是麻烦且易出错的。因此，Vue 专门为 `class`和 `style` 的 `v-bind` 用法提供了特殊的功能增强。除了字符串外，表达式的值也可以是对象或数组。
#### 绑定对象
我们可以给 `:class` (`v-bind:class` 的缩写) 传递一个对象来动态切换 class：
```vue
<div :class="{ active: isActive }"></div>
```
上面的语法表示 `active`是否存在取决于数据属性 `isActive`的真假值。
你可以在对象中写多个字段来操作多个 class。此外，:class 指令也可以和一般的 class attribute 共存。举例来说，下面这样的状态：
```vue
const isActive = ref(true)
const hasError = ref(false)
```
配合以下模板：
```vue
<div
  class="static"
  :class="{ active: isActive, 'text-danger': hasError }"
  ></div>
```
渲染的结果会是：
```html
<div class="static active"></div>
```
当 isActive 或者 hasError 改变时，class 列表会随之更新。举例来说，如果 hasError 变为 true，class 列表也会变成 "static active text-danger"。
绑定的对象并不一定需要写成内联字面量的形式，也可以直接绑定一个对象：
```javascript
const classObject = reactive({
  active: true,
  'text-danger': false
})
```
```html
<div :class="classObject"></div>
```
这将渲染为：
```html
<div class="active"></div>
```
我们也可以绑定一个返回对象的[计算属性](https://cn.vuejs.org/guide/essentials/computed.html)。这是一个常见且很有用的技巧：
```vue
const isActive = ref(true)
const error = ref(null)

const classObject = computed(() => ({
  active: isActive.value && !error.value,
  'text-danger': error.value && error.value.type === 'fatal'
}))
```
```vue
<div :class="classObject"></div>
```
#### 绑定数组
我们可以给 `:class` 绑定一个数组来渲染多个 CSS class：
```vue
const activeClass = ref('active')
const errorClass = ref('text-danger')
```
```html
<div :class="[activeClass, errorClass]"></div>
```
渲染的结果是：
```html
<div class="active text-danger"></div>
```
如果你也想在数组中有条件地渲染某个 class，你可以使用三元表达式：
```html
<div :class="[isActive ? activeClass : '', errorClass]"></div>
```
`errorClass`会一直存在，但 `activeClass` 只会在 `isActive`为真时才存在。
然而，这可能在有多个依赖条件的 class 时会有些冗长。因此也可以在数组中嵌套对象：
```html
<div :class="[{ active: isActive }, errorClass]"></div>
```
#### 在组件上使用
对于只有一个根元素的组件，当你使用了 `class`attribute 时，这些 class 会被添加到根元素上并与该元素上已有的 class 合并。
举例来说，如果你声明了一个组件名叫 MyComponent，模板如下：
```html
<!-- 子组件模板 -->
<p class="foo bar">Hi!</p>
```
在使用时添加一些 class：
```html
<!-- 在使用组件时 -->
<MyComponent class="baz boo" />
```
渲染出的 HTML 为：
```html
<p class="foo bar baz boo">Hi!</p>
```
Class 的绑定也是同样的：
```vue
<MyComponent :class="{ active: isActive }" />
```
当 isActive 为真时，被渲染的 HTML 会是：
```html
<p class="foo bar active">Hi!</p>
```
如果你的组件有多个根元素，你将需要指定哪个根元素来接收这个 class。你可以通过组件的 `$attrs` 属性来实现指定：
```html
<!-- MyComponent 模板使用 $attrs 时 -->
<p :class="$attrs.class">Hi!</p>
<span>This is a child component</span>
```
```html
<MyComponent class="baz" />
```
这将被渲染为：
```html
<p class="baz">Hi!</p>
<span>This is a child component</span>
```
你可以在[透传 Attribute](https://cn.vuejs.org/guide/components/attrs.html) 一章中了解更多组件的 attribute 继承的细节。
### 绑定style
#### 绑定对象
`:style` 支持绑定 JavaScript 对象值，对应的是 [HTML 元素的style属性](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style)：
```javascript
const activeColor = ref('red')
const fontSize = ref(30)
```
```html
<div :style="{ color: activeColor, fontSize: fontSize + 'px' }"></div>
```
尽管推荐使用 camelCase（驼峰），但 `:style` 也支持 kebab-cased（烤肉串） 形式的 CSS 属性 key (对应其 CSS 中的实际名称)，例如：
```html
<div :style="{ 'font-size': fontSize + 'px' }"></div>
```
直接绑定一个样式对象通常是一个好主意，这样可以使模板更加简洁：
```javascript
const styleObject = reactive({
  color: 'red',
  fontSize: '13px'
})
```
```html
<div :style="styleObject"></div>
```
同样的，如果样式对象需要更复杂的逻辑，也可以使用返回样式对象的**计算属性**。
#### 绑定数组
我们还可以给 `:style` 绑定一个包含多个样式对象的数组。这些对象会被合并后渲染到同一元素上：
```html
<div :style="[baseStyles, overridingStyles]"></div>
```
#### 自动前缀
当你在 `:style` 中使用了需要[浏览器特殊前缀](https://developer.mozilla.org/en-US/docs/Glossary/Vendor_Prefix)的 CSS 属性时，Vue 会自动为他们加上相应的前缀。Vue 是在运行时检查该属性是否支持在当前浏览器中使用。如果浏览器不支持某个属性，那么将尝试加上各个浏览器特殊前缀，以找到哪一个是被支持的。
#### 样式多值
你可以对一个样式属性提供多个 (不同前缀的) 值，举例来说：
```html
<div :style="{ display: ['-webkit-box', '-ms-flexbox', 'flex'] }"></div>
```
数组仅会渲染浏览器支持的最后一个值。在这个示例中，在支持不需要特别前缀的浏览器中都会渲染为 `display: flex`。
### 条件渲染
[条件渲染](https://cn.vuejs.org/guide/essentials/conditional.html)
### 列表渲染
[标题渲染](https://cn.vuejs.org/guide/essentials/list.html)
### 事件处理
[事件处理](https://cn.vuejs.org/guide/essentials/event-handling.html)
### 表单输入绑定
[表单输入绑定](https://cn.vuejs.org/guide/essentials/forms.html)
### 侦听器
[侦听器](https://cn.vuejs.org/guide/essentials/watchers.html)
### 内置指令
[Vue.js官方文档](https://cn.vuejs.org/api/built-in-directives.html)
#### v-text
更新元素的文本内容。

- **期望的绑定值类型：**`string`
- **详细信息**v-text 通过设置元素的 [textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent) 属性来工作，因此它将覆盖元素中所有现有的内容。如果你需要更新 textContent 的部分，应该使用 [mustache interpolations](https://cn.vuejs.org/guide/essentials/template-syntax.html#text-interpolation) 代替。
- **
```html
<span v-text="msg"></span>
<!-- 等同于 -->
<span>{{msg}}</span>
```
#### v-html
更新元素的 [innerHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML)。

- **期望的绑定值类型：**string
- **详细信息**

v-html 的内容直接作为普通 HTML 插入—— Vue 模板语法是不会被解析的。如果你发现自己正打算用 v-html 来编写模板，不如重新想想怎么使用组件来代替。
**安全说明**
在你的站点上动态渲染任意的 HTML 是非常危险的，因为它很容易导致 [XSS 攻击](https://en.wikipedia.org/wiki/Cross-site_scripting)。请只对可信内容使用 HTML 插值，绝不要将用户提供的内容作为插值
在[单文件组件](https://cn.vuejs.org/guide/scaling-up/sfc.html)，scoped 样式将不会作用于 v-html 里的内容，因为 HTML 内容不会被 Vue 的模板编译器解析。如果你想让 v-html 的内容也支持 scoped CSS，你可以使用 [CSS modules](https://cn.vuejs.org/api/sfc-css-features.html#css-modules) 或使用一个额外的全局 `<style>` 元素，手动设置类似 BEM 的作用域策略。

```
<div v-html="html"></div>
```
参考[模板语法 - 原始 HTML](https://cn.vuejs.org/guide/essentials/template-syntax.html#raw-html)
#### v-bind（属性绑定）
[Attribute绑定](https://cn.vuejs.org/guide/essentials/template-syntax.html#attribute-bindings)
双大括号不能在 HTML attributes 中使用。想要响应式地绑定一个 attribute，应该使用 [v-bind指令](https://cn.vuejs.org/api/built-in-directives.html#v-bind)：
```vue
<div v-bind:id="dynamicId"></div>
```
v-bind 指令指示 Vue 将元素的 id attribute 与组件的 dynamicId 属性保持一致。如果绑定的值是 null 或者 undefined，那么该 attribute 将会从渲染的元素上移除。
##### 简写
因为 v-bind 非常常用，我们提供了特定的简写语法：
```vue
<div :id="dynamicId"></div>
```
开头为 : 的 attribute 可能和一般的 HTML attribute 看起来不太一样，但它的确是合法的 attribute 名称字符，并且所有支持 Vue 的浏览器都能正确解析它。此外，他们不会出现在最终渲染的 DOM 中。简写语法是可选的，但相信在你了解了它更多的用处后，你应该会更喜欢它。
接下来的指引中，我们都将在示例中使用简写语法，因为这是在实际开发中更常见的用法。
##### 同名简写 
如果 attribute 的名称与绑定的 JavaScript 值的名称相同，那么可以进一步简化语法，省略 attribute 值：
```vue
<!-- 与 :id="id" 相同 -->
<div :id></div>

<!-- 这也同样有效 -->
<div v-bind:id></div>
```
这与在 JavaScript 中声明对象时使用的属性简写语法类似。请注意，这是一个只在 Vue 3.4 及以上版本中可用的特性。
##### 布尔型 Attribute
[布尔型 attribute](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Attributes#%E5%B8%83%E5%B0%94%E5%80%BC%E5%B1%9E%E6%80%A7) 依据 true / false 值来决定 attribute 是否应该存在于该元素上。[disabled](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled) 就是最常见的例子之一。
v-bind 在这种场景下的行为略有不同：
```vue
<button :disabled="isButtonDisabled">Button</button>
```
当 isButtonDisabled 为[真值](https://developer.mozilla.org/en-US/docs/Glossary/Truthy)或一个空字符串 (即 `<button disabled="">`) 时，元素会包含这个 disabled attribute。而当其为其他[假值](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)时 attribute 将被忽略。
##### 动态绑定多个值
如果你有像这样的一个包含多个 attribute 的 JavaScript 对象：
```vue
const objectOfAttrs = {
  id: 'container',
  class: 'wrapper'
}
```
通过不带参数的 v-bind，你可以将它们绑定到单个元素上：
```vue
<div v-bind="objectOfAttrs"></div>
```
##### 使用 JavaScript 表达式
至此，我们仅在模板中绑定了一些简单的属性名。但是 Vue 实际上在所有的数据绑定中都支持完整的 JavaScript 表达式：
```typescript
{{ number + 1 }}

{{ ok ? 'YES' : 'NO' }}

{{ message.split('').reverse().join('') }}

<div :id="`list-${id}`"></div>
```
这些表达式都会被作为 JavaScript ，以当前组件实例为作用域解析执行。
在 Vue 模板内，JavaScript 表达式可以被使用在如下场景上：

- 在文本插值中 (双大括号)
- 在任何 Vue 指令 (以 v- 开头的特殊 attribute) attribute 的值中
##### 仅支持表达式
每个绑定仅支持**单一表达式**，也就是一段能够被求值的 JavaScript 代码。一个简单的判断方法是是否可以合法地写在 return 后面。
因此，下面的例子都是**无效**的：
```vue
<!-- 这是一个语句，而非表达式 -->
{{ var a = 1 }}

<!-- 条件控制也不支持，请使用三元表达式 -->
{{ if (ok) { return message } }}
```
##### 调用函数
可以在绑定的表达式中使用一个组件暴露的方法：
```html
<time :title="toTitleDate(date)" :datetime="date">
  {{ formatDate(date) }}
</time>
```
**TIP**
> **绑定在表达式中的方法在组件每次更新时都会被重新调用，因此不应该产生任何副作用，比如改变数据或触发异步操作。**

##### 受限的全局访问
模板中的表达式将被沙盒化，仅能够访问到[有限的全局对象列表](https://github.com/vuejs/core/blob/main/packages/shared/src/globalsAllowList.ts#L3)。该列表中会暴露常用的内置全局对象，比如 Math 和 Date。
没有显式包含在列表中的全局对象将不能在模板内表达式中访问，例如用户附加在 window 上的属性。然而，你也可以自行在 [app.config.globalProperties](https://cn.vuejs.org/api/application.html#app-config-globalproperties) 上显式地添加它们，供所有的 Vue 表达式使用。
#### v-model（双向绑定）
## 深入组件
### 注册

### Props
[Props](https://cn.vuejs.org/guide/components/props.html#props)
#### Prop校验
[https://cn.vuejs.org/guide/components/props.html#prop-validation](https://cn.vuejs.org/guide/components/props.html#prop-validation)
#### Boolean类型转换
[https://cn.vuejs.org/guide/components/props.html#boolean-casting](https://cn.vuejs.org/guide/components/props.html#boolean-casting)
### 事件
#### 触发与监听事件
#### 事件参数
#### 声明触发的事件
#### 事件校验
和对 `props` 添加类型校验的方式类似，所有触发的事件也可以使用对象形式来描述。
要为事件添加校验，那么事件可以被赋值为一个函数，接受的参数就是抛出事件时传入 `emit` 的内容，返回一个布尔值来表明事件是否合法。
```vue
<script setup>
  const emit = defineEmits({
    // 没有校验
    click: null,

    // 校验 submit 事件
    submit: ({ email, password }) => {
      if (email && password) {
        return true
      } else {
        console.warn('Invalid submit event payload!')
        return false
      }
    }
  })

  function submitForm(email, password) {
    emit('submit', { email, password })
  }
</script>
```
### v-model
[组件v-model](https://cn.vuejs.org/guide/components/v-model.html#component-v-model)
#### 基本用法
#### v-model的参数
#### 多个v-model绑定
#### 处理v-model修饰符
##### 带参数的v-model修饰符
### 透传Attributes
#### Attributes继承

## 内置组件
### Teleport
在Vue.js中，`Teleport` 是一个内置的组件，它提供了一种将组件的子节点传送到Vue应用外部的DOM节点的能力。这在当你需要将模态框、通知或其他浮动元素移到DOM树中更合适的位置时非常有用，比如直接挂载到 `body` 标签下，以避免样式冲突或z-index问题。
#### 基本用法
下面是一个 `Teleport` 组件的基本例子：
```vue
<template>
  <div>
    <!-- 使用Teleport将模态框移到body下 -->
    <teleport to="body">
      <div class="modal">
        <!-- 模态框内容 -->
        <p>This is a modal!</p>
      </div>
    </teleport>
  </div>
</template>

<style>
.modal {
  /* 模态框样式 */
}
</style>
```
在这个例子中，模态框 `<div class="modal">...</div>` 会被传送到页面的 `<body>` 标签下，而不是留在当前组件的DOM结构中。这样，模态框就能够在页面上占据全局层级，避免了可能出现的样式继承和布局问题。
#### 动态目标
`Teleport` 的 `to` 属性还可以是一个动态属性，这意味着你可以根据条件动态地改变目标元素：
```vue
<teleport :to="teleportTarget">
  <!-- Content to teleport -->
</teleport>
```
```vue
export default {
  data() {
    return {
      teleportTarget: '#some-element-id'
    };
  }
}
```
在这个示例中，`teleportTarget` 数据属性决定了目标元素的位置，可以根据需要进行更改。
#### 注意事项
使用 `Teleport` 时要注意几个关键点：

- `Teleport` 的内容可以在任何时候动态地被传送到不同的位置。
- 传送的内容依然是Vue组件树的一部分，这意味着它们依然可以访问到相同的上下文，例如父组件提供的数据和事件。
- 传送内容的事件和数据绑定不会受到影响。
- `Teleport` 在SSR（服务器端渲染）中有所限制，因为在服务器上没有全局的 `document` 或 `body`。

`Teleport` 是Vue 3中一个非常实用的功能，它解决了一些常见的Web开发难题，尤其是在处理模态框和弹出层时。
### Suspense
Vue 3引入了一个名为 `Suspense` 的新内置组件，它提供了一种等待异步组件加载的机制，并在加载过程中显示一个后备（fallback）内容。这对于改善用户体验非常有用，因为它允许开发者为组件的加载状态提供一个明确的指示，而不是让用户面对一个空白的屏幕或不断变化的UI。
#### 基本用法
使用 `Suspense` 包裹异步组件，配置好`default`，并提供一个 `fallback` 插槽来显示加载状态：
```html
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>

<script>
import { defineAsyncComponent } from 'vue';

const AsyncComponent = defineAsyncComponent(() =>
  import('./components/AsyncComponent.vue')
);

export default {
  components: {
    AsyncComponent
  }
};
</script>
```
在这个例子中，`AsyncComponent` 是通过 `defineAsyncComponent` 方法定义的异步组件。在 `AsyncComponent` 加载并准备好渲染之前，用户将看到 "Loading..." 的文本。
#### 使用场景
`Suspense` 特别适用于以下场景：

- 加载异步组件时，需要向用户显示一个加载指示器。
- 在等待数据请求完成之前，需要显示一个占位符或加载状态。
#### 结合异步组件
异步组件可以通过 `defineAsyncComponent` 方法创建，并可以与 `Suspense` 结合使用，以便在组件加载时提供一个后备内容。以下是如何定义一个异步组件：
```javascript
import { defineAsyncComponent } from 'vue';

const AsyncComponent = defineAsyncComponent(() =>
  import('./components/AsyncComponent.vue')
);
```
#### 注意事项

- `Suspense` 组件目前仅在Vue 3中可用。
- `Suspense` 还可以和Vue Router一起使用，以便在路由级别懒加载组件时提供加载指示。
- `Suspense` 支持嵌套使用，这意味着你可以在一个 `Suspense` 组件内部包含另一个 `Suspense` 组件，每个都有自己的后备内容。
- 在服务端渲染（SSR）中，`Suspense` 也有所支持，但是实现方式可能有所不同，因为服务端渲染需要同步解析所有的异步依赖。

## 组合式API
### ref、reactive
#### ref

- 作用: 定义一个响应式的数据
- 语法: `let xxx = ref(initValue)` 
   - 创建一个包含响应式数据的**引用对象（reference对象，简称ref对象）**。
   - JS中操作数据： `xxx.value`
   - 模板中读取数据: 不需要.value，直接：`<div>{{xxx}}</div>`
- 备注： 
   - 接收的数据可以是：基本类型、也可以是对象类型。
   - 基本类型的数据：响应式依然是靠`Object.defineProperty()`的`get`与`set`完成的。
   - 对象类型的数据：内部 “ 求助 ” 了Vue3.0中的一个新函数—— `reactive`函数。
```vue
<script setup lang="ts">

import {ref} from "vue";
let message = ref('Message')
const changeMessage = () => {
  message.value = 'Message changed!'
}
</script>

<template>
  <div class="user">
    {{message}}
    <button @click="changeMessage">Change Message</button>
  </div>
</template>

<style scoped>

</style>
```
```vue
<script setup lang="ts">

import { ref } from "vue";

let info = ref({
  name: 'QZY',
  age: 21,
  job: ['IT', '艺术家', '医生']
})

const change = () => {
  // 能访问属性，但修改时必须先通过 .value 来拿到对象
  info.value.job[0] = '前端工程师'
  info.value.job[1] = '设计师'
  info.value.job[2] = '大夫'
}
</script>

<template>
  <div class="user">
    <!--  能够查看属性  -->
    {{info.job[0]}}
    {{info.job[1]}}
    {{info.job[2]}}
    <button @click="change">修改</button>
  </div>
</template>
```
#### reactive

- 作用: 定义一个**对象类型**的响应式数据（基本类型不要用它，要用`ref`函数）
- 语法：`const 代理对象= reactive(源对象)`接收一个对象（或数组），返回一个**代理对象（Proxy的实例对象，简称proxy对象）**
- reactive定义的响应式数据是“深层次的”。
- 内部基于 ES6 的 Proxy 实现，通过代理对象操作源对象内部数据进行操作。
- 不能直接修改整体，如`info = {...}`
```vue
<script setup lang="ts">

import { reactive} from "vue";

let info = reactive({
  name: 'John Doe',
  age: 25,
  job: ['工程师', '清洁工', '医生']
})

</script>

<template>
  <div class="user">
    {{info.name}} {{info.age}}
    <!-- 遍历job数组 -->
    <li v-for="item in info.job" :key="item">{{item}}</li>
  </div>
</template>
```
#### ref解包细节
##### 作为 reactive 对象的属性
一个 ref 会在作为响应式对象的属性被访问或修改时自动解包。换句话说，它的行为就像一个普通的属性：
```javascript
const count = ref(0)
const state = reactive({
  count
})

console.log(state.count) // 0

state.count = 1
console.log(count.value) // 1
```
如果将一个新的 ref 赋值给一个关联了已有 ref 的属性，那么它会替换掉旧的 ref：
```javascript
const otherCount = ref(2)

state.count = otherCount
console.log(state.count) // 2
// 原始 ref 现在已经和 state.count 失去联系
console.log(count.value) // 1
```
只有当嵌套在一个深层响应式对象内时，才会发生 ref 解包。当其作为[浅层响应式对象](https://cn.vuejs.org/api/reactivity-advanced.html#shallowreactive)的属性被访问时不会解包。
##### 数组和集合的注意事项
与 `reactive` 对象不同的是，当 `ref` 作为响应式数组或原生集合类型 (如 Map) 中的元素被访问时，它**不会**被解包：
```javascript
const books = reactive([ref('Vue 3 Guide')])
// 这里需要 .value
console.log(books[0].value)

const map = reactive(new Map([['count', ref(0)]]))
// 这里需要 .value
console.log(map.get('count').value)
```
#### 在模板中解包的注意事项
在模板渲染上下文中，只有顶级的 `ref` 属性才会被解包。
在下面的例子中，count 和 object 是顶级属性，但 object.id 不是：
```javascript
const count = ref(0)
const object = { id: ref(1) }
```
因此，这个表达式按预期工作：
```vue
{{ count + 1 }}
```
但这个**不会**：
```vue
{{ object.id + 1 }}
```
渲染的结果将是 [object Object]1，因为在计算表达式时 object.id 没有被解包，仍然是一个 ref 对象。为解决这个问题，可以将 id 解构为一个顶级属性
```vue
const { id } = object
```
```vue
{{ id + 1 }}
```
现在渲染的结果将是 2。
另一个需要注意的点是，如果 ref 是文本插值的最终计算值 (即 {{ }} 标签)，那么它将被解包，因此以下内容将渲染为 1：
```vue
{{ object.id }}
```
该特性仅仅是文本插值的一个便利特性，等价于 `{{ object.id.value }}`。
#### 总结

- 从定义数据角度对比： 
   - ref用来定义：**基本类型数据**。
   - reactive用来定义：**对象（或数组）类型数据**。
   - 备注：ref也可以用来定义**对象（或数组）类型数据**, 它内部会自动通过`reactive`转为**代理对象**。
- 从原理角度对比： 
   - ref通过`Object.defineProperty()`的`get`与`set`来实现响应式（数据劫持）。
   - reactive通过使用**Proxy**来实现响应式（数据劫持）, 并通过**Reflect**操作**源对象**内部的数据。
- 从使用角度对比： 
   - ref定义的数据：操作数据**需要**`.value`，读取数据时模板中直接读取**不需要**`.value`。
   - reactive定义的数据：操作数据与读取数据：**均不需要**`.value`（**自动拆包**）。
```typescript
let data1 = ref(0)
console.log(data1.value)

let data2 = reactive({
  a: 1,
  b: 2,
  c: ref(3)
})
console.log(data2.a)
console.log(data2.b)
console.log(data2.c)  // 自动拆包
```

- **对象类型**的整体修改：
   - ref引用的**对象类型**能够通过字面类的形式修改原来的地址
```vue
let user = ref({
  username: 'admin',
  password: '123456'
})
user = {username: 'root', password: 'root'}
```

   - reactive引用的**对象类型**只能修改其值，不能修改地址
```vue
let user = reactive({
  username: 'admin',
  password: '123456'
})
Object.assign(user, {name: 'root', password: 'root'})
```
### toRef、toRefs
在 Vue 3 中，`toRef` 和 `toRefs` 是用于创建响应式引用的函数。
通过使用 `toRef` 和 `toRefs`，可以更方便地处理响应式数据对象中的属性，并确保在更新属性时能够正确地触发响应式更新。

1. `toRef`： 
   - `toRef` 函数接收一个响应式对象和一个属性名，并返回一个指向该属性的 ref 对象。
   - 当源对象的属性发生变化时，通过 `toRef` 创建的 ref 对象也会相应地更新。
```javascript
import { reactive, toRef } from 'vue';

const state = reactive({
  count: 0,
});

const countRef = toRef(state, 'count');

console.log(countRef.value); // 输出当前 count 的值

state.count++; // 修改 count 的值
console.log(countRef.value); // 输出修改后的 count 的值
```

2. `toRefs`： 
   - `toRefs` 函数接收一个响应式对象，并以包含每个属性的 ref 对象的形式返回一个普通对象。
   - 这样做是为了能够在 setup 函数中将响应式对象的属性解构为单独的 ref 对象，使得模板中能直接访问和更新这些属性，而无需使用 `.value`。
```javascript
import { reactive, toRefs } from 'vue';

const state = reactive({
  count: 0,
  message: 'Hello',
});

const { count, message } = toRefs(state);

console.log(count.value); // 输出当前 count 的值
console.log(message.value); // 输出当前 message 的值

state.count++; // 修改 count 的值
state.message = 'Bonjour'; // 修改 message 的值

console.log(count.value); // 输出修改后的 count 的值
console.log(message.value); // 输出修改后的 message 的值
```

---

```vue
<script setup lang="ts">

import { reactive, toRef, toRefs } from "vue";

const cmd = reactive({
  name: 'queryIP',
  code: 'ipconfig'
})
let nameRef = toRef(cmd, 'name'); // 创建单个引用
let {name, code} = toRefs(cmd); // 直接创建多个引用

/**
 * 修改引用将同步影响到原来的值
 */
function change1() {
  nameRef.value = 'IPQuery';
  code.value = 'ifconfig';
}

/**
 * 修改原始的值将同步影响到引用
 */
function change2() {
  cmd.name = '查看网络端口'
  cmd.code = 'net stat -ano'
}

</script>

<template>
  <div class="user">
    reactive:{{cmd.name}}{{cmd.code}} <br>
    toRef:{{nameRef}} <br>
    toRes:{{name}}{{code}}
    <button @click="change1">修改属性1</button>
    <button @click="change2">修改属性2</button>
  </div>
</template>
```
### computed
计算函数要点：

- **有缓存**：只要用于计算的源属性不发生变化，无论使用多少次，`computed`函数只执行1次
- **只读**：不能直接更改其计算的值，必须通过内部的`set`方法改变**计算源属性**来间接更改其值
```vue
<script setup lang="ts">
import {computed, ref} from "vue";

let firstName = ref('ada');
let lastName = ref('wang');
// 计算属性（简写）
let fullName = computed(() => {
  return firstName.value + '+' + lastName.value;
});
// 计算属性（完整写法）
let fullNameUpper = computed({
  get() {
    return firstName.value.slice(0, 1).toUpperCase() +
        firstName.value.slice(1) +
        lastName.value.slice(0, 1).toUpperCase() +
        lastName.value.slice(1);
  },
  set(val) {  // 此处接收的val就是下方的'Qin-Zhiyun'
    const [fName, lName] = val.split('-');
    // 用于计算的源属性改变了，computed的值也发生改变
    firstName.value = fName;
    lastName.value = lName;
  }
})
/**
 * 通知上方的fullNameUpper的计算值进行更改
 */
function changeName() {
  fullNameUpper.value = 'Qin-Zhiyun';
}
</script>

<template>
  <div>
    firstName: <input type="text" v-model="firstName"> <br>
    lastName: <input type="text" v-model="lastName"> <br>
    fullName: <input type="text" v-bind:value="fullName"> <br>
    <button @click="changeName()">ChangeName</button> <br>
    fullNameUpper: <input type="text" v-bind:value="fullNameUpper">
  </div>
</template>

<style scoped>

</style>
```
#### 最佳实践

1. Getter 不应有副作用

计算属性的 getter 应只做计算而没有任何其他的副作用，这一点非常重要，请务必牢记。举例来说，**不要改变其他状态、在 getter 中做异步请求或者更改 DOM**！一个计算属性的声明中描述的是如何根据其他值派生一个值。因此 getter 的职责应该仅为计算和返回该值。在之后的指引中我们会讨论如何使用[侦听器](https://cn.vuejs.org/guide/essentials/watchers.html)根据其他响应式状态的变更来创建副作用。

2. 避免直接修改计算属性值

从计算属性返回的值是派生状态。可以把它看作是一个“临时快照”，每当源状态发生变化时，就会创建一个新的快照。更改快照是没有意义的，因此计算属性的返回值应该被视为只读的，并且永远不应该被更改——应该更新它所依赖的源状态以触发新的计算。
### watch

1. **作用**

侦听一个或多个响应式数据源，并在数据源变化时调用所给的回调函数。

2. **详细信息**
- `watch()` 默认是懒侦听的，即仅在侦听源发生变化时才执行回调函数。
- 第一个参数是侦听器的**源**。这个来源可以是以下几种：
   - 一个函数，返回一个值
   - 一个 `ref`
   - 一个响应式对象，即 `reactive`
   - 由以上类型的值组成的数组
- 第二个参数是在发生变化时要调用的回调函数。这个回调函数接受三个参数：新值、旧值，以及一个用于注册副作用清理的回调函数。该回调函数会在副作用下一次重新执行前调用，可以用来清除无效的副作用，例如：等待中的异步请求。当侦听多个来源时，回调函数接受两个数组，分别对应来源数组中的新值和旧值。
- 第三个可选的参数是一个对象，支持以下这些选项：
   - **immediate**：在侦听器创建时立即触发回调。第一次调用时旧值是 `undefined`。
   - **deep**：如果源是对象，强制深度遍历，以便在深层级变更时触发回调。参考[深层侦听器](https://cn.vuejs.org/guide/essentials/watchers.html#deep-watchers)。
   - **flush**：调整回调函数的刷新时机。参考[回调的刷新时机](https://cn.vuejs.org/guide/essentials/watchers.html#callback-flush-timing)及 [watchEffect()](https://cn.vuejs.org/api/reactivity-core.html#watcheffect)。
   - **onTrack / onTrigger**：调试侦听器的依赖。参考[调试侦听器](https://cn.vuejs.org/guide/extras/reactivity-in-depth.html#watcher-debugging)。
   - **once**: 回调函数只会运行一次。侦听器将在回调函数首次运行后自动停止。 
- 与 [watchEffect()](https://cn.vuejs.org/api/reactivity-core.html#watcheffect) 相比，watch() 使我们可以：
   - 懒执行副作用；
   - 更加明确是应该由哪个状态触发侦听器重新执行；
   - 可以访问所侦听状态的前一个值和当前值。
#### ref定义的基本类型
```vue
<script setup lang="ts">
import {ref, watch} from 'vue'
const sum = ref(0);
const increment = () => {
  sum.value++
}
// 监视sum变化
const stopWatch = watch(sum, (newVal, oldVal) => {
  console.log(`sum changed from ${oldVal} to ${newVal}`)
  // 若newValue大于10则停止监视
  if (newVal >= 10) {
    stopWatch()
  }
})
</script>

<template>
  <div>
    <h1>watch情况一：监视【Ref】引用的【基本类型】</h1>
    <h2>Sum:{{sum}}</h2>
    <button @click="increment">sum++</button>
  </div>
</template>
```
#### ref定义的对象类型

- 大多数时候不关心oldValue,只关心newValue，故第二个参数可以只写一个value代表新的值
```vue
<script setup lang="ts">
import {ref, watch} from 'vue'

const person = ref({name: '张三', age: 18})
const changeName = () => {
  person.value.name = '李四'
}
const changeAge = () => {
  person.value.age = 20
}
const changePerson = () => {
  person.value = {name: '王五', age: 22}
}
// 实际上大多数时候不关心oldValue,只关心newValue，故此处可以只写一个参数value
watch(person, (newValue, oldValue) => {
  console.log('watchPerson=>', newValue, oldValue)
}, {deep: true, immediate: true}) // deep:监视对象的表层属性(.xxx)；immediate:页面启动后立即监视
</script>

<template>
  <div>
    <h1>watch情况二:监视【Ref】引用的【对象类型】</h1>
    <h2>姓名：{{ person.name }} | 年龄：{{ person.age }}</h2>
    <button @click="changeName">修改姓名</button>
    <button @click="changeAge">修改年龄</button>
    <button @click="changePerson">修改整个人</button>
  </div>
</template>
```
#### reactive定义的对象类型

- reactive默认开启深度监视，即使设置了deep为false，也会进行深度监视
```vue
<script setup lang="ts">
import {reactive, watch} from 'vue'

const person = reactive({name: '张三', age: 18})
const changeName = () => {
  person.name = '李四'
}
const changeAge = () => {
  person.age = 20
}
const changePerson = () => {
  Object.assign(person,{name: '王五', age: 22})
}
// 因为Object.assign没有改变地址值，所以此处打印出来的 newValue 等于 oldValue
watch(person, (newValue, oldValue) => {
  console.log('watchPerson=>', newValue, oldValue)
})  // reactive默认开启深度监视，即使设置了deep为false，也会进行深度监视
</script>

<template>
  <div>
    <h1>watch情况三:监视【reactive】定义的【对象类型】数据</h1>
    <h2>姓名：{{ person.name }} | 年龄：{{ person.age }}</h2>
    <button @click="changeName">修改姓名</button>
    <button @click="changeAge">修改年龄</button>
    <button @click="changePerson">修改整个人</button>
  </div>
</template>
```
#### ref/reactive定义的对象类型中的某个属性

- 对于对象中的基本数据类型，必须用函数形式
- 对于对象中的对象类型，可以不使用函数形式，但这样无法监视整个对象的变化
- 最佳实践：对于对象类型，使用函数形式 + deep（深度监视）属性
```vue
<script setup lang="ts">
import {reactive, watch} from 'vue'

const person = reactive({name: '张三', age: 18, hobby: ['篮球', '足球', '排球']})
const changeName = () => {
  person.name = '李四'
}
const changeAge = () => {
  person.age = 20
}
const changeHobby = () => {
  person.hobby[0] = '篮篮球球'
  person.hobby.push('乒乓球')
}
const changePerson = () => {
  Object.assign(person,{name: '王五', age: 22, hobby: ['排球', '乒乓球']})
}
/*// 对于对象中的基本数据类型，必须用函数形式
watch(() => person.name, (newValue, oldValue) => {
  console.log('监视Person的name属性=>', newValue, oldValue)
})
watch(() => person.age, (newValue, oldValue) => {
  console.log('监视Person的age属性=>', newValue, oldValue)
})
// 对于对象中的对象类型，可以不使用函数式，但这样无法监视整个对象的变化
watch(person.hobby, (newValue, oldValue) => {
  console.log('监视Person的hobby属性=>', newValue, oldValue)
})*/
// 最佳实践：对于对象类型，使用函数式 + deep（深度监视）属性
watch(() => person.hobby, (newValue, oldValue) => {
  console.log('监视Person对象的hobby属性=>', newValue, oldValue)
}, {deep: true})
</script>

<template>
  <div>
    <h1>watch情况四:监视【ref】或【reactive】定义的【对象类型】数据中的【某个属性】</h1>
    <h2>姓名：{{ person.name }} | 年龄：{{ person.age }}</h2>
    <button @click="changeName">修改姓名</button>
    <button @click="changeAge">修改年龄</button>
    <button @click="changeHobby">修改爱好</button>
    <button @click="changePerson">修改整个人</button>
  </div>
</template>
```
#### 上述情况中的多个属性
```vue
<script setup lang="ts">
import {reactive, watch} from 'vue'

const person = reactive({name: '张三', age: 18, hobby: ['篮球', '足球', '排球']})
const changeName = () => {
  person.name = '李四'
}
const changeAge = () => {
  person.age = 20
}
const changeHobby = () => {
  person.hobby[0] = '篮篮球球'
  person.hobby.push('乒乓球')
}
const changePerson = () => {
  Object.assign(person,{name: '王五', age: 22, hobby: ['排球', '乒乓球']})
}
// 监视Person对象的name和hobby属性                               newValue          oldValue
watch([() => person.name, () => person.hobby], ([name, hobby], [preName, preHobby]) => {
  console.log('监视Person对象的name、hobby属性=> 新值：', name, hobby + ' 旧值：' , preName, preHobby)
}, {deep: true})
</script>

<template>
  <div>
    <h1>watch情况五:监视以上的情况中的多个数据，即数组[]</h1>
    <h2>姓名：{{ person.name }} | 年龄：{{ person.age }}</h2>
    <button @click="changeName">修改姓名</button>
    <button @click="changeAge">修改年龄</button>
    <button @click="changeHobby">修改爱好</button>
    <button @click="changePerson">修改整个人</button>
  </div>
</template>
```
### watchEffect
立即运行一个函数，同时响应式地追踪其依赖，并在依赖更改时重新执行该函数。
`watch`VS`watchEffect`

1. 都能监听响应式数据的变化，不同的是监听数据变化的方式不同
2. `watch`要明确指出监视的数据
3. `watchEffect`不同明确指出监视的数据（函数中用到哪些属性，就监视哪些属性）
```vue
<script setup lang="ts">
import {ref, watchEffect} from "vue";

let X = ref(1), Y = ref(2), Z = ref(3);
const Xincrement = () => {
  X.value += 11;
}
const Yincrement = () => {
  Y.value += 22;
}
const Zincrement = () => {
  Z.value += 33;
}
watchEffect(() => {
  if (X.value > 12 || Y.value > 24 || Z.value > 36) {
    console.log('X > 12 || Y > 24 || Z > 36')
  }
})
</script>

<template>
  <div>
    <h1>WatchEffect</h1>
    <h2>{{ X }}-{{ Y }}-{{ Z }}</h2>
    <button @click="Xincrement">X+=11</button>
    <button @click="Yincrement">Y+=22</button>
    <button @click="Zincrement">Z+=33</button>
  </div>
</template>
```
### 父子通信
#### 父传子props
基本思想

- 父组件中给子组件绑定属性
- 子组件内部通过props选项接收数据

![](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/vue/202406171500316.png)

- 父组件声明的数据数量必须**_>=_**子组件获取的数据数量
- `defineProps`是宏，不需要引入也能直接使用

![接收方（子组件）的限制](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/vue/202406171459831.png "接收方（子组件）的限制")
案例

```typescript
export interface Child {
    name: string;
    age: number;
    sex: string;
}

// export type Children = Child[];
export type Children = Array<Child>;
```
```vue
<template>
  <div class="app">
        <!--  声明num和children数据准备传给子组件  -->
<!--    <PropsChildren num="123456" :children="children" />-->
    <PropsChildren />
  </div>
</template>

<script lang="ts" setup name="App">
import {type Children} from "@types"; // 引入Children类型
import PropsChildren from "./components/PropsChildren.vue";	// 引入子组件

let children: Children[] = reactive([
    {
      name: '小明',
      age: 18,
      sex: '男'
    },
    {
      name: '小红',
      age: 17,
      sex: '女'
    }
  ]
)

</script>
```
```vue
<script setup lang="ts">
// 接受父组件传来的数据并赋值给data
/*let data = defineProps(['num', 'children'])
let children = data.children;*/

import {type Children} from "@types"; // 引入Children类型

// WithDefaults:设置默认值；<>{}泛型限制传过来的类型；?:可选参数
withDefaults(defineProps<{ num?: number, children: Children }>(), {
  num: 0,
  children: () => [{
    name: 'qin', age: 8, sex: '男'
  }, {name: 'Z', age: 9, sex: '女'}]
})
</script>

<template>
  <div>
    <!--    <h2>{{ data.num }}</h2>
        <h2 v-for="child in children" :key="child.name">{{child}}</h2>-->
    <h2>{{ num }}</h2>
    <h2 v-for="child in children" :key="child.name">姓名：{{ child.name }} 年龄：{{ child.age }} 性别：{{ child.sex }}</h2>
  </div>
</template>
```
#### 子传父ref、emit
##### (define)emit、@
基本思想

- 父组件中给子组件标签通过`@`绑定事件
- 子组件内部通过 `emit` 方法触发事件

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/vue/202406171500548.png)
##### ref、defineExpose
```vue
<script setup lang="ts">
import {ref, defineExpose} from "vue";

let spring = ref()
let summer = ref()
let autumn = ref()
let winter = ref()

// 暴露给父组件App.vue
defineExpose({
  // 父组件可以使用spring、summer，但不能使用autumn、winter
  spring,
  summer
})
</script>

<template>
  <div>
    <!--  给h1元素设置ref属性，这样就可以通过ref获取到h1元素  -->
    <!--  ref属性标识的元素相当于局部变量，不会与其它组件中相同的ref冲突  -->
    <h1 ref="spring">春天</h1>
    <h1 ref="summer">夏天</h1>
    <h1 ref="autumn">秋天</h1>
    <h1 ref="winter">冬天</h1>
  </div>
</template>
```
```vue
<template>
  <div class="app">
    <RefOnTag ref="refOnTag"/>
    <h1>parent: {{ refOnTag }} </h1>
  </div>
</template>

<script lang="ts" setup name="App">
import {ref} from "vue";
import RefOnTag from "./components/RefOnTag.vue";

const refOnTag = ref();
console.log(refOnTag);
</script>
```
### 导出属性
#### 统一暴露
统一暴露（Named Exports）是指在模块中通过命名导出多个变量、函数或类。可以使用花括号 {} 来导入特定的导出项
```typescript
export const name = 'John';
export function sayHello() {
  console.log('Hello!');
}
export class Person {
  constructor(name) {
    this.name = name;
  }
}
```
```typescript
import { name, sayHello, Person } from './module.js';

console.log(name); // 'John'
sayHello(); // 'Hello!'
const person = new Person('Alice');
console.log(person.name); // 'Alice'
```
#### 分别暴露
分别暴露（Named Exports）是指在模块中通过多次使用 export 关键字来分别导出不同的变量、函数或类。每个导出项都需要单独导入
```typescript
const name = 'John';
function sayHello() {
  console.log('Hello!');
}
class Person {
  constructor(name) {
    this.name = name;
  }
}

export { name, sayHello, Person };
```
```typescript
import { name, sayHello, Person } from './module.js';

console.log(name); // 'John'
sayHello(); // 'Hello!'
const person = new Person('Alice');
console.log(person.name); // 'Alice'
```
#### 默认暴露
默认暴露（Default Export）是指在模块中使用 export default 语法导出一个默认的值或对象。导入时可以自定义导入名称，并且不需要使用花括号。
需要注意的是，默认暴露在**一个模块中只能使用一次**。
```typescript
const name = 'John';
export default name;
```
```typescript
import myName from './module.js';

console.log(myName); // 'John'
```
## 其它API
### shallowRef、shallowReactive
#### `shallowRef`

1.  作用：创建一个响应式数据，但只对顶层属性进行响应式处理。 
2.  用法： `let myVar = shallowRef(initialValue);`
3.  特点：只跟踪引用值的变化，不关心值内部的属性变化。 
#### `shallowReactive`

1.  作用：创建一个浅层响应式对象，只会使对象的最顶层属性变成响应式的，对象内部的嵌套属性则不会变成响应式的 
2.  用法： `const myObj = shallowReactive({ ... });`
3.  特点：对象的顶层属性是响应式的，但嵌套对象的属性不是。 
#### 总结
> 通过使用 `[shallowRef()](https://cn.vuejs.org/api/reactivity-advanced.html#shallowref)` 和 `[shallowReactive()](https://cn.vuejs.org/api/reactivity-advanced.html#shallowreactive)` 来绕开深度响应。浅层式 `API` 创建的状态只在其顶层是响应式的，对所有深层的对象不会做任何处理，避免了对每一个内部属性做响应式所带来的性能成本，这使得属性的访问变得更快，可提升性能。

### readonly、shallowReadonly
#### `**readonly**`

1.  作用：用于创建一个对象的深只读副本。 
2.  用法： 
```javascript
const original = reactive({ ... });
const readOnlyCopy = readonly(original);
```

3.  特点： 
   - 对象的所有嵌套属性都将变为只读。
   - 任何尝试修改这个对象的操作都会被阻止（在开发模式下，还会在控制台中发出警告）。
4.  应用场景： 
   - 创建不可变的状态快照。
   - 保护全局状态或配置不被修改。
#### `**shallowReadonly**`

1.  作用：与 `readonly` 类似，但只作用于对象的顶层属性。 
2.  用法： 
```javascript
const original = reactive({ ... });
const shallowReadOnlyCopy = shallowReadonly(original);
```

3.  特点： 
   -  只将对象的顶层属性设置为只读，对象内部的嵌套属性仍然是可变的。 
   -  适用于只需保护对象顶层属性的场景。 
### toRaw、markRaw
#### `toRaw`

1.  作用：用于获取一个响应式对象的原始对象， `toRaw` 返回的对象不再是响应式的，不会触发视图更新。 
> 官网描述：这是一个可以用于临时读取而不引起代理访问/跟踪开销，或是写入而不触发更改的特殊方法。不建议保存对原始对象的持久引用，请谨慎使用。

> 何时使用？ —— 在需要将响应式对象传递给非 `Vue` 的库或外部系统时，使用 `toRaw` 可以确保它们收到的是普通对象

2.  具体编码： 
```javascript
import { reactive,toRaw,markRaw,isReactive } from "vue";

/* toRaw */
// 响应式对象
let person = reactive({name:'tony',age:18})
// 原始对象
let rawPerson = toRaw(person)
```
#### `markRaw`

1.  作用：标记一个对象，使其**永远不会**变成响应式的。 
> 例如使用`mockjs`时，为了防止误把`mockjs`变为响应式对象，可以使用 `markRaw` 去标记`mockjs`

2.  编码： 
```javascript
/* markRaw */
let citys = markRaw([
  {id:'asdda01',name:'北京'},
  {id:'asdda02',name:'上海'},
  {id:'asdda03',name:'天津'},
  {id:'asdda04',name:'重庆'}
])
// 根据原始对象citys去创建响应式对象citys2 —— 创建失败，因为citys被markRaw标记了
let citys2 = reactive(citys)
```
### customRef
在Vue 3中，`customRef` 是一个用于创建自定义的响应式引用（`ref`）的函数。它允许你完全控制依赖追踪和响应性触发，这使得你可以定义自己的响应式行为。
我们使用 `ref` 来创建一个响应式的引用，但是如果你需要更精细的控制响应式系统的行为，比如控制何时收集依赖和触发更新，这时 `customRef` 就非常有用。
`customRef`接收一个工厂函数，该函数返回两个函数：

- `track`：当响应式系统需要将当前正在执行的副作用（例如渲染函数）与响应式状态关联时，会调用这个函数。这通常在getter中发生。
- `trigger`：当更新响应式状态时，需要通知响应式系统重新运行副作用时，会调用这个函数。这通常在setter中发生。
```typescript
import {customRef } from "vue";
// 导出钩子函数
export default function(initValue:string,delay:number){
  let msg = customRef((track,trigger)=>{
    let timer:number
    return {
      get(){
        track() // 告诉Vue数据msg很重要，要对msg持续关注，一旦变化就更新-告诉Vue追踪这个属性
        return initValue
      },
      set(value){
        clearTimeout(timer)
        timer = setTimeout(() => {
          initValue = value
          trigger() //通知Vue数据msg变化了-触发响应
        }, delay);
      }
    }
  }) 
  return {msg}
}
```
## 全局API
### app.component
`app.component` 用于在应用实例上全局注册一个组件。这意味着一旦注册，这个组件可以在任何新创建的Vue根实例下的模板中被使用，而**不需要再次导入或注册**。全局注册通常在应用启动时进行，例如在你的入口文件（如 `main.js` 或 `main.ts`）中。
#### 示例代码
以下是如何使用 `app.component` 来全局注册一个组件的例子：
```javascript
// main.js 或 main.ts
import { createApp } from 'vue';
import App from './App.vue';

// 引入你的组件
import MyComponent from './components/MyComponent.vue';

// 创建Vue应用实例
const app = createApp(App);

// 全局注册MyComponent，所有模板都可以使用<MyComponent>了
app.component('MyComponent', MyComponent);

// 挂载应用实例到DOM
app.mount('#app');
```
在这个例子中，`MyComponent` 是全局注册的组件名，而 `MyComponent.vue` 是组件的文件。注册之后，你可以在任何Vue组件的模板中使用 `<MyComponent></MyComponent>` 标签来使用这个组件，而不需要在每个使用它的组件内部再次导入。
#### 局部注册 vs 全局注册
尽管全局注册的组件可以在任何其他组件中使用，但在大型应用中，推荐使用局部注册，以便更好地控制组件的封装性和重用性。局部注册是在组件内部使用 `components` 选项来实现的，如下所示：
```vue
// MyParentComponent.vue
<template>
  <div>
    <my-component></my-component>
  </div>
</template>

<script>
import MyComponent from './components/MyComponent.vue';

export default {
  components: {
    MyComponent
  }
}
</script>
```
在这个例子中，`MyComponent` 只在 `MyParentComponent` 的模板中可用。
#### 注意事项

- 全局注册应谨慎使用，因为这会影响整个应用的大小，所有全局注册的组件都会被包含在最终的构建结果中，即使有些页面没有使用它们。
- 局部注册的组件在其所在的组件内部更加明确，更容易管理依赖，通常也更有利于代码拆分和懒加载。
- 在Vue 3中，全局注册的语法稍有不同于Vue 2，如上面的示例所示。确保按照你使用的Vue版本来正确注册组件。
### app.directive
#### 自定义指令
除了 Vue 内置的一系列指令 (比如 v-model 或 v-show) 之外，Vue 还允许你注册自定义的指令 (Custom Directives)。
一个自定义指令由一个包含类似组件生命周期钩子的对象来定义。钩子函数会接收到指令所绑定元素作为其参数。
下面是一个自定义指令的例子，当一个 input 元素被 Vue 插入到 DOM 中后，它会被自动聚焦：
```vue
<script setup>
// 在模板中启用 v-focus
const vFocus = {
  mounted: (el) => el.focus()
}
</script>

<template>
  <input v-focus />
</template>
```
假设你还未点击页面中的其他地方，那么上面这个 `input` 元素应该会被自动聚焦。该指令比 `autofocus` 属性更有用，因为它不仅仅可以在页面加载完成后生效，还可以在 Vue 动态插入元素后生效。
在 `<script setup>` 中，任何以 `v` 开头的驼峰式命名的变量都可以被用作一个自定义指令。在上面的例子中，`vFocus` 可以在模板中以 `v-focus` 的形式使用
在没有使用 `<script setup>` 的情况下，自定义指令需要通过 `directives` 选项注册：
```vue
export default {
  setup() {
    /*...*/
  },
  directives: {
    // 在模板中启用 v-focus
    focus: {
      /* ... */
    }
  }
}
```
#### 全局注册
将一个自定义指令全局注册到应用层级也是一种常见的做法：
```vue
import { createApp } from 'vue';

const app = createApp({ /* 根组件选项对象 */ });

// 使 v-focus 在所有组件中都可用
app.directive('focus', {
  // 当被绑定的元素挂载到DOM上时...
  mounted(el) {
    // 聚焦到元素上
    el.focus();
  }
})
app.mount('#app');
```
> 只有当所需功能只能通过直接的 DOM 操作来实现时，才应该使用自定义指令。
> 其他情况下应该尽可能地使用 `v-bind` 这样的内置指令来声明式地使用模板，这样更高效，也对服务端渲染更友好。

#### 自定义指令的钩子函数
自定义指令提供了几个钩子函数，你可以在其中写入自己的逻辑：

- created: 在绑定元素的父组件被创建之后调用。
- beforeMount: 在绑定元素被挂载之前调用。
- mounted: 在绑定元素被挂载到DOM上之后调用。
- beforeUpdate: 在包含组件的VNode更新之前调用。
- updated: 在包含组件的VNode及其子VNode全部更新后调用。
- beforeUnmount: 在绑定元素被卸载之前调用。
- unmounted: 在绑定元素被卸载之后调用。

每个钩子函数都可以接受特定的参数，比如绑定的元素、绑定值等。
```typescript
const myDirective = {
  // 在绑定元素的 attribute 前
  // 或事件监听器应用前调用
  created(el, binding, vnode, prevVnode) {
    // 下面会介绍各个参数的细节
  },
  // 在元素被插入到 DOM 前调用
  beforeMount(el, binding, vnode, prevVnode) {},
  // 在绑定元素的父组件
  // 及他自己的所有子节点都挂载完成后调用
  mounted(el, binding, vnode, prevVnode) {},
  // 绑定元素的父组件更新前调用
  beforeUpdate(el, binding, vnode, prevVnode) {},
  // 在绑定元素的父组件
  // 及他自己的所有子节点都更新后调用
  updated(el, binding, vnode, prevVnode) {},
  // 绑定元素的父组件卸载前调用
  beforeUnmount(el, binding, vnode, prevVnode) {},
  // 绑定元素的父组件卸载后调用
  unmounted(el, binding, vnode, prevVnode) {}
}
```
指令的钩子会传递以下几种参数：

- `el`：指令绑定到的元素。这可以用于直接操作 DOM。
- `binding`：一个对象，包含以下属性。
   - `value`：传递给指令的值。例如在 v-my-directive="1 + 1" 中，值是 2。
   - `oldValue`：之前的值，仅在 `beforeUpdate` 和 `updated` 中可用。无论值是否更改，它都可用。
   - `arg`：传递给指令的参数 (如果有的话)。例如在 v-my-directive:foo 中，参数是 "foo"。
   - `modifiers`：一个包含修饰符的对象 (如果有的话)。例如在 v-my-directive.foo.bar 中，修饰符对象是 { foo: true, bar: true }。
   - `instance`：使用该指令的组件实例。
   - `dir`：指令的定义对象。
- `vnode`：代表绑定元素的底层 VNode。
- `prevNode`：代表之前的渲染中指令所绑定元素的 VNode。仅在 beforeUpdate 和 updated 钩子中。

---

```vue
<div v-example:foo.bar="baz">
```
```vue
{
  arg: 'foo',
  modifiers: { bar: true },
  value: /* `baz` 的值 */,
  oldValue: /* 上一次更新时 `baz` 的值 */
}
```
```vue
<div v-example:[arg]="value"></div>
```
这里指令的参数会基于组件的 arg 数据属性响应式地更新。
> 除了 `el` 外，其他参数都是只读的，不要更改它们。若你需要在不同的钩子间共享信息，推荐通过元素的 `dataset` attribute 实现。

#### 简化形式
对于自定义指令来说，一个很常见的情况是仅仅需要在 `mounted` 和 `updated` 上实现相同的行为，除此之外并不需要其他钩子。
这种情况下我们可以直接用一个函数来定义指令，如下所示：
```vue
<h2 v-beautify:green="'123123'"></h2>
```
```typescript
app.directive('beautify', (el, binding) => {
    // 这会在mounted 和 updated时都调用
    el.innerText = binding.value || '666666';
    el.style.color = binding.arg || 'yellow';
})
```
#### 对象字面量
如果你的指令需要多个值，你可以向它传递一个 JavaScript 对象字面量。别忘了，指令也可以接收任何合法的 JavaScript 表达式。
```vue
<div v-demo="{ color: 'white', text: 'hello!' }"></div>
```
```typescript
app.directive('demo', (el, binding) => {
  console.log(binding.value.color) // => "white"
  console.log(binding.value.text) // => "hello!"
})
```
### app.use
在 Vue.js 中，`app.use()` 方法是用于安装 Vue 插件的。如果你开发或使用 Vue 插件，这是将插件功能添加到 Vue 应用程序的标准方式。插件可以是一个带有 `install` 方法的对象，或者直接是一个函数。如果是一个对象，`install` 方法将被 Vue 调用；如果插件本身是一个函数，它将直接被调用。在任何情况下，该方法/函数都将接收 Vue 应用程序实例作为第一个参数，以及可选的选项对象作为第二个参数。

以下是使用 `app.use()` 方法安装插件的基本语法：

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import SomePlugin from 'some-vue-plugin';

const app = createApp(App);

// 安装插件，不带选项
app.use(SomePlugin);

// 安装插件，带选项
app.use(SomePlugin, { someOption: true });

// 挂载根组件实例到 DOM
app.mount('#app');
```

这里有几点需要注意：

1. 插件通常需要在调用 `app.mount()` 之前安装，以确保在根 Vue 实例创建之前插件已经正确配置。
2. 一些插件可能提供全局方法或属性，注册全局组件，或者提供其他跨组件的功能。
3. 一个插件只能被安装一次，Vue 会保证 `install` 方法不会被多次调用。

下面是一个如何创建一个基本 Vue 插件的示例，以及如何使用 `app.use()` 来安装它：

```javascript
// 创建一个插件对象
const MyPlugin = {
  install(app, options) {
    // 添加一个全局方法或属性，例如：app.config.globalProperties.$myMethod
    app.config.globalProperties.$myMethod = function (methodOptions) {
      // 一些逻辑...
    };

    // 注入组件
    app.provide('myPlugin', options);

    // 添加一个全局自定义指令
    app.directive('my-directive', {
      // 指令的钩子函数...
    });

    // 注册一个全局组件
    app.component('my-component', {
      // 组件选项...
    });

    // 添加实例方法，通过 app.config.globalProperties
    // app.config.globalProperties.$myMethod2 = () => { /*...*/ };
  },
};

// 创建 Vue 应用
const app = createApp(App);

// 使用插件
app.use(MyPlugin, { someOption: true });

// 挂载应用
app.mount('#app');
```

在上面的例子中，`MyPlugin` 包含了一个 `install` 方法，该方法中定义了插件如何扩展 Vue 的功能。然后，通过 `app.use(MyPlugin, options)` 安装插件，你可以传递任何需要的选项给插件。这些选项随后在插件的 `install` 方法中作为第二个参数提供。
### app.runWithContext
`app.runWithContext` 是 Vue 3 提供的一个实用功能，可以让您在非 `setup` 函数的场景下使用依赖注入（provide/inject）。
**功能详解:**

- 在当前 Vue 应用的上下文中执行回调函数。
- 允许在回调函数内通过 `inject` 获取注入的值。

**使用场景:**

- 在 Vue 3 中，通常在组件的 `setup` 函数内进行依赖注入（提供和注入依赖项）。
- `app.runWithContext` 可以帮助您绕过此限制。
- 它适用于您需要在 `setup` 函数之外注入依赖项的情况，例如生命周期钩子或自定义逻辑。

**使用方法:**
```javascript
const app = createApp(我的组件);

// 提供一个值
app.provide('someData', '这是注入的数据');

// 在生命周期钩子中使用 runWithContext 访问注入的数据
app.mount('#app')
  .on('mounted', () => {
    const 注入的值 = app.runWithContext(() => {
      return inject('someData');
    });
    console.log(注入的值); // 输出: "这是注入的数据"
  });
```
```typescript
import { inject } from 'vue'

app.provide('id', 1)

const injected = app.runWithContext(() => {
  return inject('id')
})

console.log(injected) // 1
```
**注意事项:**

- `app.runWithContext` 是同步的，意味着回调函数会立即执行。
- 通常建议在 `setup` 函数内使用注入，以提高代码组织和可维护性。
- `app.runWithContext` 应在需要在 `setup` 函数之外注入依赖项的特定场景中使用。
### app.config
#### errorHandler
在Vue.js中，`errorHandler` 是 `app.config` 对象的一个属性，用于定义一个全局的错误处理函数。这个函数会在Vue捕获到组件渲染或者观察者(watcher)执行期间的错误时被调用。它允许开发者对这些错误进行统一的处理，例如记录错误日志、显示错误信息，或者上报给错误监控服务。
下面是如何在Vue 3中设置 `errorHandler` 的例子：
```javascript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error(`Captured in errorHandler: ${err.message}`)
  // `instance` 是出错组件的实例
  // `info` 是一个包含了Vue特定错误信息的字符串
  // 这些信息可能会非常有用，例如，你可以用它来确定错误是在组件的哪个生命周期钩子中发生的

  // 你可以在这里进行错误上报，例如发送到日志服务器
  // logService.log({ err, instance, info })
}

app.mount('#app')
```

在上面的代码中，`errorHandler` 被设置为一个函数，它接受三个参数：

- `err`：捕获到的错误对象。
- `instance`：出错的组件实例，这可以帮助你确定哪个组件出了问题。
- `info`：一个字符串，包含了Vue特定的错误信息，例如错误发生在哪个生命周期钩子或者计算属性中。

在实际应用中，你可能会想要做的不只是在控制台打印错误。你可以使用 `errorHandler` 来进行一些更复杂的操作，比如：

- 显示用户友好的错误信息。
- 将错误详细信息发送到后端服务器进行记录。
- 集成第三方错误监控服务，如Sentry、Rollbar或Bugsnag。

请注意，`errorHandler` 不会捕获由事件处理器引起的错误，因为这些错误不是在组件渲染或者响应式系统中产生的。你需要在事件处理器中手动捕获并处理这些错误。

此外，如果`errorHandler`自身抛出错误，这可能会导致无限递归，所以你应该确保`errorHandler`函数内部不会抛出错误。
#### warnHandler
在Vue.js中，`warnHandler` 是 `app.config` 对象的一个属性，用于定义一个全局的警告处理函数。当Vue在运行时遇到非致命错误，通常是开发相关的警告时，会调用这个函数。你可以利用这个处理函数来控制如何处理这些警告，例如，你可能想要记录这些警告到日志中，或者在开发环境中显示一个通知。

这个功能在追踪和调试Vue应用中的潜在问题时非常有用，尤其是在开发过程中。

以下是如何设置Vue 3中的 `warnHandler` 的例子：

```javascript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App);

// 全局警告处理
app.config.warnHandler = function (msg, instance, trace) {
  console.warn(`Warn: ${msg}\nTrace: ${trace}`);
  // `msg` 是警告信息
  // `instance` 是导致警告的组件实例
  // `trace` 是组件堆栈跟踪

  // 你可以在这里向开发团队的日志服务器发送警告信息
  // logService.warn({ msg, instance, trace })
};

app.mount('#app');
```

在上面的代码中，`warnHandler` 被设置为一个函数，它接收三个参数：

- `msg`：警告信息的字符串。
- `instance`：生成警告的组件实例。
- `trace`：组件的堆栈跟踪信息，有助于定位问题所在。

在实际应用中，你可能不希望在生产环境中启用警告处理，因为这可能会暴露应用内部的信息，并且影响性能。所以，最好将警告处理逻辑包裹在一个条件检查中，以确保它只在开发环境中激活。

请注意，`warnHandler` 只在开发版本的Vue中可用，它不会在生产版本中包含。这是为了确保生产版本的性能和安全性。
#### performance
在Vue.js中，`performance` 属性是 `app.config` 对象的一个布尔型选项，可以用来启用或禁用Vue应用的性能追踪功能。当你设置它为 `true` 时，Vue会追踪和记录组件的初始化、编译、渲染和更新等性能数据。这个功能主要用于开发环境，以帮助开发者诊断和优化应用性能。

请注意，通常建议只在开发模式下启用性能追踪，因为它可能会对性能产生一定影响，并且在生产环境中收集这些数据是不必要的。

下面是如何在Vue 3中启用性能追踪的例子：

```javascript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 启用性能追踪
if (process.env.NODE_ENV === 'development') {
  app.config.performance = true
}

app.mount('#app')
```

在这个例子中，我们检查了环境变量 `NODE_ENV` 是否为 `'development'` 来决定是否启用性能追踪。这是避免在生产环境中启用性能追踪的一种常见做法。

当性能追踪被启用时，你可以打开浏览器的开发者工具，然后查看 Performance（或类似）标签页来观察Vue组件的性能指标。例如，在Chrome浏览器中，你可以使用 Chrome DevTools 的 Performance 面板来记录和查看时间线上的性能数据。

这些数据可以帮助你分析：

- 组件渲染时机和所需时间
- 组件的更新效率
- 哪些组件或操作可能导致性能瓶颈

使用这些信息，你可以对Vue应用进行性能优化，比如重构代码、延迟加载某些资源、避免不必要的重渲染等。
#### compilerOptions
在Vue.js 3中，`compilerOptions` 是一个对象，它可以传递给 `createApp` 函数，用来自定义Vue的模板编译器行为。这些选项对于调整模板编译过程可能非常有用，尤其是当你需要自定义如何处理模板中的特定内容时。
以下是一些 `compilerOptions` 的常见属性：

-  `isCustomElement`: 一个函数，用来指定哪些标签应该被视为自定义元素。这对于使用Web Components时非常有用，因为你可以告诉Vue编译器哪些元素不应该作为Vue组件进行处理。 
-  `delimiters`: 一个字符串数组，用来改变文本插值中使用的分隔符。默认情况下，Vue使用双大括号 `{{` 和 `}}` 作为分隔符。 
-  `whitespace`: 指定是否以及如何处理模板中的空白。选项包括 `'preserve'` (保留所有空白)，`'condense'` (压缩空白，但保留必要的空白以避免元素之间的空白)。 
-  `comments`: 一个布尔值，指示编译器是否应该保留模板中的HTML注释。 

这里是如何在Vue 3中使用 `compilerOptions` 的示例：
```javascript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App, {
  compilerOptions: {
    // 识别自定义元素
    isCustomElement: tag => tag.startsWith('app-'),
    
    // 改变文本插值的分隔符
    delimiters: ['[[', ']]'],
    
    // 压缩空白字符
    whitespace: 'condense',
    
    // 保留模板中的HTML注释
    comments: true
  }
})

app.mount('#app')
```
在上面的代码示例中，我们为模板编译器设置了自定义选项，其中包括识别以 `app-` 开头的标签作为自定义元素，改变插值分隔符，压缩模板中的空白，并且保留HTML注释。
请注意，这些编译器选项通常只在使用运行时加编译器版本的Vue时适用，即使用全版本的 `vue.js`而不是仅运行时版本的 `vue.runtime.js`。如果在构建过程中使用了Vue的单文件组件（`.vue` 文件），大部分模板编译都会在构建时进行，而不是在客户端进行，那么这些选项应该在构建配置中设置，例如在 `vue-loader` 或 `vite` 的相应配置中。
#### globalProperties
`globalProperties` 是一个对象，属于应用实例的 `app.config` 对象。通过这个对象，你可以向所有的Vue组件实例添加全局属性。这些属性可以在任何组件的模板、计算属性或方法中被访问，就像它们是该组件实例的一部分一样。
`globalProperties` 的一个常见用途是添加全局插件，如一个事件总线、全局状态管理或者是全局服务等。例如，你可能希望在所有组件中都能够方便地访问到一个全局API客户端实例或是一些工具函数。
以下是如何在Vue 3中使用 `globalProperties` 的示例：
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'

const app = createApp(App)

// 添加全局属性
app.config.globalProperties.$http = axios
app.config.globalProperties.$appName = 'My App'

app.mount('#app')
```
在上面的代码中，我们向所有组件实例添加了两个全局属性：

- `$http`：它是 `axios` 的一个实例，现在可以在任何组件内通过 `this.$http` 访问到。
- `$appName`：它是一个字符串值 'My App'，同样可以在任何组件内通过 `this.$appName` 访问到。

使用全局属性时，需要注意的是，由于它们是全局的，所以可能会与某些组件内部的属性或方法发生命名冲突。如果全局属性与组件自己的属性冲突，组件自己的属性将具有更高的优先级 。此外，过度依赖全局属性可能会使得组件间的耦合度增加，从而降低代码的模块化和可测试性。因此，应当谨慎使用这个特性，确保全局属性的使用是合理和必要的。
请记住，为了避免命名冲突并且表示这是一个全局属性，通常会给全局属性添加一个特定的前缀（如上例中的 `$`）。这是Vue社区中的一个约定，以区分全局属性和组件内部的属性。
####  optionMergeStrategies
在Vue.js中，`optionMergeStrategies` 是 `app.config` 对象的一个属性，它允许你自定义组件选项合并策略。每个Vue组件都可以包含多种选项，如 `data`, `methods`, `computed`, 等等。当你使用 `extends` 或者混入 (mixins) 功能时，你会将多个组件的选项合并成一个新组件。Vue默认提供了各种选项的合并策略，但有时你可能需要自定义这些策略以适应特定的情况。

例如，Vue默认的合并策略是：

- 对于大多数选项（如 `methods`, `computed`, `components` 等），来自混入对象或子组件的选项将被合并到父组件的选项中。如果有冲突，子组件/混入的选项将优先。
- 对于 `data` 和 `provide` 选项，Vue使用一个特殊的策略，合并时会调用它们作为函数，并合并返回的对象。

你可以通过设置 `optionMergeStrategies` 来自定义这些合并策略。下面是一个例子，展示了如何自定义 `myOption` 的合并策略：

```javascript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.config.optionMergeStrategies.myOption = function (toVal, fromVal) {
  // 自定义合并策略
  // `toVal` 是父组件或混入对象中的值
  // `fromVal` 是子组件中的值
  return fromVal || toVal
}

app.mount('#app')
```
在这个例子中，我们定义了一个新的选项 `myOption`，并为它提供了一个自定义的合并策略。这个策略简单地检查子组件的值 (`fromVal`)，如果子组件提供了这个值，就使用它，否则使用父组件的值 (`toVal`)。一旦定义了自定义的选项合并策略，你就可以在Vue组件中使用这个策略了。
下面是如何在组件中使用自定义合并策略的例子：
首先，假设你已经按照前面的例子创建了一个自定义的合并策略 `myOption`。
```javascript
// 在应用配置中定义了自定义合并策略
app.config.optionMergeStrategies.myOption = function (toVal, fromVal) {
  // 自定义合并逻辑...
  return fromVal || toVal;
};
```

现在，你可以在创建组件时使用这个新的 `myOption` 选项。这个选项会按照你定义的策略合并。

下面是如何在父组件和混入中使用 `myOption` 的例子：

```javascript
// 定义一个混入对象，它使用了 myOption
const myMixin = {
  myOption: 'value from mixin'
};

// 创建一个组件，它也使用了 myOption，并且使用了混入
const MyComponent = {
  mixins: [myMixin],
  myOption: 'value from component'
};

// 创建Vue应用实例
const app = createApp({});

// 注册组件
app.component('my-component', MyComponent);

// 挂载应用
app.mount('#app');
```

在这个例子中，我们有一个混入对象 `myMixin` 和一个组件 `MyComponent`，它们都使用了 `myOption` 选项。根据我们自定义的合并策略，当组件和混入对象合并时，如果组件提供了 `myOption` 的值，这个值将被使用；如果组件没有提供，那么混入中的值将被使用。

在实际的Vue组件中，你可以像访问其他选项一样访问 `myOption`：

```javascript
export default {
  created() {
    console.log(this.$options.myOption); // 这将根据自定义合并策略输出 myOption 的值
  }
}
```

记住，自定义合并策略通常用于高级用例，如插件或框架开发，因为这涉及到Vue的内部工作机制。在普通的应用开发中，遵循Vue的默认选项合并策略通常就足够了。

请注意，`optionMergeStrategies` 通常是在全局范围内配置的，并且需要在应用的其他部分被加载之前设置好。这样，当组件实例被创建和合并选项时，自定义的合并策略就可以被正确地使用了。

在实际开发中，通常应该尽量避免需要自定义选项合并策略的复杂情况。这个功能更多用于插件和高级应用，因为不恰当的使用可能会导致难以追踪的错误。

### 通用

## 生命周期钩子
### 总览
每个 Vue 组件实例在创建时都需要经历一系列的初始化步骤，比如设置好数据侦听，编译模板，挂载实例到 DOM，以及在数据改变时更新 DOM。在此过程中，它也会运行被称为生命周期钩子的函数，让开发者有机会在特定阶段运行自己的代码。
生命周期整体分为四个阶段：**创建**、**挂载**、**更新**、**销毁**，每个阶段都有两个钩子，一前一后
![Vue2对比Vue3](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/vue/202406171500739.png "Vue2对比Vue3")
![官方图](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/vue/202406171500734.png "官方图")

### vue2

- 创建阶段：`beforeCreate`、`created`
- 挂载阶段：`beforeMount`、`mounted`
- 更新阶段：`beforeUpdate`、`updated`
- 销毁阶段：`beforeDestory`、`destoryed`
```vue
<template>
  <div>
    <h1>Hello, {{ message }}!</h1>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Vue 2'
    };
  },
  beforeCreate() {
    console.log('Vue 2 - Before Create');
  },
  created() {
    console.log('Vue 2 - Created');
  },
  beforeMount() {
    console.log('Vue 2 - Before Mount');
  },
  mounted() {
    console.log('Vue 2 - Mounted');
  },
  beforeUpdate() {
    console.log('Vue 2 - Before Update');
  },
  updated() {
    console.log('Vue 2 - Updated');
  },
  beforeDestroy() {
    console.log('Vue 2 - Before Destroy');
  },
  destroyed() {
    console.log('Vue 2 - Destroyed');
  }
};
</script>
```
### vue3

- 创建阶段：`setup`
- 挂载阶段：`beforeMount`、`mounted`
- 更新阶段：`beforeUpdate`、`updated`
- 卸载阶段：`onBeforeUnmount`、`onUnMounted`
```vue
<template>
  <div>
    <h1>Hello, Vue 3!</h1>
  </div>
</template>

<script>
  // vue3 的生命周期钩子函数需要手动引入
import { onBeforeMount, onMounted, onBeforeUpdate, onUpdated, onBeforeUnmount, onUnmounted } from 'vue';

export default {
  setup() {
    onBeforeMount(() => {
      console.log('Vue 3 - Before Mount');
    });

    onMounted(() => {
      console.log('Vue 3 - Mounted');
    });

    onBeforeUpdate(() => {
      console.log('Vue 3 - Before Update');
    });

    onUpdated(() => {
      console.log('Vue 3 - Updated');
    });

    onBeforeUnmount(() => {
      console.log('Vue 3 - Before Unmount');
    });

    onUnmounted(() => {
      console.log('Vue 3 - Unmounted');
    });

    return {
      message: 'Vue 3'
    };
  }
};
</script>
```
### 多次执行
生命周期函数执行多次的时候，会按照顺序依次执行
```vue
<scirpt setup>
import { onMounted } from 'vue'
onMounted(()=>{
  // 自定义逻辑
})

onMounted(()=>{
  // 自定义逻辑
})
</script>
```
### 自定义钩子函数
自定义钩子函数可以帮助你封装可复用的逻辑，并使组件更具可维护性和可读性。
```typescript
import { onUpdated, ref } from 'vue';
// 自定义钩子函数
export default function () {
    // 数据
    let sum = ref(0);

    function add() {
        sum.value++;
    }

    onUpdated(() => {
        console.log('sum.value' + '变化了' + sum.value);
    })

    // 返回需要在组件中使用的值和方法
    return {sum, add}
}
```
```vue
<script setup lang="ts" name="MySumHook">
  // 关于sum的所有操作全部定义useSum.ts中，这里只管使用
  import useSum from '@/components/hooks/useSum.ts'
  const { sum, add } = useSum()
</script>

<template>
  <div>
    <h2>Sum: {{ sum }}</h2>
    <button @click="add">Add</button>
  </div>
</template>
```
## 路由
### 基本切换效果
#### router-link
请注意，我们没有使用常规的 a 标签，而是使用一个自定义组件 `router-link` 来创建链接。这使得 Vue Router 可以在**不重新加载页面的情况下**更改 URL，处理 URL 的生成以及编码。我们将在后面看到如何从这些功能中获益。
#### router-view
`router-view` 将显示与 URL 对应的组件。你可以把它放在任何地方，以适应你的布局。
#### 案例代码

- 路由配置
```typescript
import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import News from '@/pages/News.vue'
import About from '@/pages/About.vue'

  // 也可以这样声明比较简单的组件
  // const Home = { template: '<div>Home</div>' }
  // const About = { template: '<div>About</div>' }

const router = createRouter({
  history: createWebHashHistory(),
  // 定义路由：每个路由都需要映射到一个组件
  routes: [
    {
      path: '/home',
      component: Home
    },
    {
      path: '/news',
      component: News
    },
    {
      path: '/about',
      component: About
    }
  ]
})

export default router
```

- 三个路由组件
```vue
<script setup lang="ts">

</script>

<template>
  <h1>Home</h1>
  <!-- <h1>About</h1> -->
  <!-- <h1>News</h1> -->
</template>

<style scoped>

</style>
```

- 主组件
```vue
<template>
  <div class="app">
    <!-- 导航区 -->
    <div class="navigate">
      <!-- 使用 router-link 组件进行导航 -->
      <!-- 通过传递 `to` 来指定链接 -->
      <!-- `<router-link>` 将呈现一个带有正确 `href` 属性的 `<a>` 标签 -->
      <RouterLink to="/home" active-class="active">首页</RouterLink>
      <RouterLink to="/news" active-class="active">新闻</RouterLink>
      <RouterLink to="/about" active-class="active">关于</RouterLink>
    </div>
    <!-- 展示区 -->
    <div class="main-content">
      <!-- 路由出口 -->
      <!-- 路由匹配到的组件将渲染在这里 -->
      <RouterView></RouterView>
    </div>
  </div>
</template>

<script lang="ts" setup name="App">
  import {RouterLink,RouterView} from 'vue-router'  
</script>
```

- 挂载页
```typescript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.ts'

const app = createApp(App);
app.use(router);    // 启用路由
app.mount('#app');
```
### 两个注意点

1.  路由组件通常存放在`pages`或`views`文件夹，一般组件通常存放在`components`文件夹。 
2.  通过点击导航，视觉效果上“消失” 了的路由组件，默认是被**卸载**掉的，需要的时候再去**挂载**。 
### 路由器工作模式

1.  `history`模式 

优点：`URL`更加美观，不带有`#`，更接近传统的网站`URL`。
缺点：后期项目上线，需要服务端配合处理路径问题，否则刷新会有`404`错误。
```javascript
import { createWebHistory } from 'vue-router'
const router = createRouter({
	history:createWebHistory(), //history模式
	/******/
})
```

2.  `hash`模式 

优点：兼容性更好，因为不需要服务器端处理路径。
缺点：`URL`带有`#`不太美观，且在`SEO`优化方面相对较差。
```javascript
import { createWebHashHistory } from 'vue-router'
const router = createRouter({
	history:createWebHashHistory(), //hash模式
	/******/
})
```
### to的其它写法
```vue
<!-- 第一种：to的字符串写法 -->
<router-link active-class="active" to="/home">主页</router-link>

<!-- 第二种：to的对象写法 -->
<router-link active-class="active" :to="{path:'/home'}">Home</router-link>

<!-- 对象写法的name属性 -->
<RouterLink :to="{name: 'detail2'}" active-class="active">{{news2}}</RouterLink>
```
path需要写全路径；name只需要写组件名（即使它是嵌套的）
### 路由命名与跳转
作用：可以简化路由跳转及传参
```typescript
routes:[
  {
    name:'zhuye',
    path:'/home',
    component:Home
  },
  {
    name:'xinwen',
    path:'/news',
    component:News,
  },
  {
    name:'guanyu',
    path:'/about',
    component:About
  }
]
```
```vue
<!-- 最基本写法 -->
<router-link to="/home">主页</router-link>

<!--简化前：需要写完整的路径（to的字符串写法） -->
<router-link to="/news/detail">跳转</router-link>

<!--简化后：直接通过名字跳转（to的对象写法配合name属性） -->
<router-link :to="{name:'guanyu'}">跳转</router-link>
```
### 嵌套路由
```typescript
import {createRouter, createWebHistory} from 'vue-router'
import News from '@/pages/News.vue'
import Details from '@/pages/Details.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            name: 'news',
            path: '/news',
            component: News,
            // 嵌套的路由信息
            children: [
                {
                    name: 'detail',
                    // 嵌套路由不需要写'/'
                    path: 'detail',
                    component: Details
                }
            ]
        }
    ]
})

export default router
```
### 路由传参
#### query

1. 传递参数
```vue
<script setup lang="ts">
  import {reactive} from "vue";

  const newsTitleList = reactive([
    {id: 1, title: '新闻1', content: '这是新闻1的内容'},
    {id: 2, title: '新闻2', content: '这是新闻2的内容'},
    {id: 3, title: '新闻3', content: '这是新闻3的内容'}
  ])
</script>

<template>
  <RouterLink v-for="item in newsTitleList" :key="item.id"
    :to="{
      path: `/news/detail`,
      name: 'detail',
      query: {
        id: item.id,
        title: item.title,
        content: item.content
      }
    }"
  >
    {{item.title}}
  </RouterLink>
  <RouterView></RouterView>
</template>
```

2. 接收参数
```vue
<script setup lang="ts">
  // 接收参数
  import {useRoute} from "vue-router";
  import {toRefs} from "vue";
  const route = useRoute();
  // const {query} = toRefs(route);	//若写了这句话，下面的route.可以不写
</script>

<template>
  <ul>
    <li>ID: {{route.query.id}}</li>
    <li>标题：{{route.query.title}} </li>
    <li>内容：{{route.query.content}}</li>
  </ul>
</template>
```
#### params

- 传递`params`参数时，若使用`to`的对象写法，必须使用`name`配置项，不能用`path`。
- 传递`params`参数时，需要提前在规则中占位。
- 不能传递数组类型，否则会警告；若强行接收数据会引起错误。
- 路径语法：`/:id?` 写了? 表示可选参数
1. 传递参数
```vue
<template>
  <h1>News</h1>
  <RouterLink v-for="item in newsTitleList" :key="item.id"
              :to="{
      path: `/news/detail`,
      name: 'detail',
      params: {
        id: item.id,
        title: item.title,
        content: item.content
      }
    }"
  >
    {{item.title}}
  </RouterLink>
  <RouterView></RouterView>
</template>
```

2. 接收参数
```vue
<script setup lang="ts">
  import {useRoute} from "vue-router";
  import {toRefs} from "vue";
  // 接收参数
  const route = useRoute();
  const {params} = toRefs(route);
</script>

<template>
  <h3>新闻内容</h3>
  <ul>
    <li>ID: {{params.id}}</li>
    <li>标题：{{params.title}} </li>
    <li>内容：{{params.content}}</li>
  </ul>
</template>
```

3. 路径匹配
```typescript
import {createRouter, createWebHistory} from 'vue-router'
import News from '@/pages/News.vue'
import Details from '@/pages/Details.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            name: 'news',
            path: '/news',
            component: News,
            children: [
                {
                    name: 'detail',
                    // params必须使用路径占位符; ? 表示可选参数
                    path: 'detail/:id/:title/:content?',
                    component: Details
                }
            ]
        }
    ]
})

export default router
```
### 路由的props配置
作用：让路由组件更方便的收到参数（可以将路由参数作为`props`传给组件）
```typescript
{
	name:'xiang',
	path:'detail/:id/:title/:content',
	component:Detail,

  // props的对象写法，作用：把对象中的每一组key-value作为props传给Detail组件
  // props:{a:1,b:2,c:3}, 

  // props的布尔值写法，作用：把收到了每一组params参数，作为props传给Detail组件
  // props:true
  
  // props的函数写法，作用：把返回的对象中每一组key-value作为props传给Detail组件
  props(route){
    return route.query
  }
}
```
#### 函数写法
作用：把返回的对象中每一组key-value作为props传给Detail组件
```typescript
{
    name: 'detail',
    // 嵌套路由不需要写'/'
    path: 'detail',
    component: Details,
    props(route) {
        return route.query;
    }
}
```
```vue
<RouterLink v-for="item in newsTitleList" :key="item.id"
  :to="{
    path: `/news/detail`,
    name: 'detail',
    query: {
      id: item.id,
      title: item.title,
      content: item.content
    }
  }"
>
```
```vue
<script setup lang="ts">
  defineProps(['id', 'title', 'content']);
</script>

<template>
  <h3>新闻内容</h3>
  <ul>
    <li>ID: {{id}}</li>
    <li>标题：{{title}} </li>
    <li>内容：{{content}}</li>
  </ul>
</template>
```
#### 布尔值写法
作用：把收到了每一组params参数，作为props传给Detail组件
```typescript
{
  name: 'detail',
  path: 'detail/:id/:title/:content',
  component: Details,
  props: true
}
```
```vue
<RouterLink v-for="item in newsTitleList" :key="item.id"
            :to="{
    path: `/news/detail`,
    name: 'detail',
    params: {
      id: item.id,
      title: item.title,
      content: item.content
    }
  }"
>
```
```vue
<script setup lang="ts">
defineProps(['id', 'title', 'content']);
</script>

<template>
  <h3>新闻内容</h3>
  <ul>
    <li>ID: {{id}}</li>
    <li>标题：{{title}} </li>
    <li>内容：{{content}}</li>
  </ul>
</template>
```
#### 对象写法
作用：把对象中的每一组key-value作为props传给Detail组件
一般组件能直接在标签上加属性(<component msg='hello'/>)，但路由组件没有直接这样写的机会，在这种情况下想直接传死的数据给路由组件可以用到。
### replace属性

1.  作用：控制路由跳转时操作浏览器历史记录的模式。 
2.  浏览器的历史记录有两种写入方式：分别为`push`和`replace`： 
   - `push`是追加历史记录（默认值）。
   - `replace`是替换当前记录。
3.  开启`replace`模式： 
   - `<RouterLink repalce .......>News</RouterLink>`
### 编程式路由导航
`<RouterLink>`是标签，只能在`<template>`中使用。现在要在`<script>`中实现路由跳转，就要用到编程式路由导航。
```vue
<script setup lang="ts">
  import {reactive} from "vue";
  // import router from "@/router"; // 在 Vue 组件中导入 Vue Router 实例，用于在组件中进行路由导航等操作。
  import {useRouter} from "vue-router"; // 在 Vue 3 的 Composition API 中使用，用于在 setup 函数中获取当前的路由实例。

  const newsTitleList = reactive([
    {id: 1, title: '新闻1', content: '这是新闻1的内容'},
    {id: 2, title: '新闻2', content: '这是新闻2的内容'},
    {id: 3, title: '新闻3', content: '这是新闻3的内容'}
  ])

  interface News {
    id: number;
    title: string;
    content: string;
  }

  function viewDetails(news: News) {
    // 编程式路由导航，拿到路由器对象操作路由
    const router = useRouter();
    router.push({				// push()中的内容与 :to 对象写法完全一致
      name: 'detail',
      query: {
        id: news.id,
        title: news.title,
        content: news.content
      }
    })
  }

</script>

<template>
  <RouterLink v-for="item in newsTitleList" :key="item.id"
    :to="{
      path: `/news/detail`,
      name: 'detail',
      query: {
        id: item.id,
        title: item.title,
        content: item.content
      }
    }"
  >
    <button @click="viewDetails(item)">查看新闻</button>
    {{item.title}}
  </RouterLink>
  <RouterView></RouterView>
</template>
```
### 重定向

1.  作用：将特定的路径，重新定向到已有路由。 
2.  具体编码： 
```typescript
{
  path:'/',
  redirect:'/about'
}
```
## 组件通信
![组件通信](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/vue/202406171501692.png)
### props
概述：`props`是使用频率最高的一种通信方式，常用于 ：**父 ↔ 子**。

- 若 **父传子**：属性值是**非函数**。
- 若 **子传父**：属性值是**函数**。
```vue
<template>
  <div class="father">
    <h3>父组件</h3>
		<h4>汽车：{{ car }}</h4>
		<h4 v-show="toy">子给的玩具：{{ toy }}</h4>
    <!-- 给子组件传递car数据、getToy方法；然后子组件通过defineProps接收car数据使用、sendToy方法传数据给父组件 -->
		<Child :car="car" :sendToy="getToy"/>
  </div>
</template>

<script setup lang="ts" name="Father">
	import Child from './Child.vue'
	import {ref} from 'vue'
	// 数据
	let car = ref('奔驰')
	let toy = ref('')
	// 方法
	function getToy(value:string){
		toy.value = value
	}
</script>
```
```vue
<template>
  <div class="child">
    <h3>子组件</h3>
		<h4>玩具：{{ toy }}</h4>
		<h4>父给的车：{{ car }}</h4>
		<button @click="sendToy(toy)">把玩具给父亲</button>
  </div>
</template>

<script setup lang="ts" name="Child">
	import {ref} from 'vue'
	// 数据
	let toy = ref('奥特曼')
	// 声明接收props
	defineProps(['car','sendToy'])
</script>
```
### 自定义事件emit

1. 概述：自定义事件常用于：**子 => 父。**
2. 注意区分好：原生事件、自定义事件。
- 原生事件： 
   - 事件名是特定的（`click`、`mosueenter`等等）
   - 事件对象`$event`: 是包含事件相关信息的对象（`pageX`、`pageY`、`target`、`keyCode`）
- 自定义事件： 
   - 事件名是任意名称
   - **事件对象**`**$event**`**: 是调用**`**emit**`**时所提供的数据，可以是任意类型！！！**
3.  语法： 
```html
<!--在父组件中，给子组件绑定自定义事件：-->
<Child @send-toy="toy = $event"/>

<!--注意区分原生事件与自定义事件中的$event-->
<button @click="toy = $event">测试</button>
```
```javascript
//子组件中，触发事件：
this.$emit('send-toy', 具体数据)
```

4. 案例
```vue
<template>
  <div class="father">
    <h3>父组件</h3>
		<h4 v-show="toy">子给的玩具：{{ toy }}</h4>
		<!-- 给子组件Child绑定事件 -->
    <Child @send-toy="saveToy"/>
  </div>
</template>

<script setup lang="ts" name="Father">
  import Child from './Child.vue'
	import { ref } from "vue";
	// 数据
	let toy = ref('')
	// 用于保存传递过来的玩具
	function saveToy(value:string){
		console.log('saveToy',value)
		toy.value = value
	}
</script>
```
```vue
<template>
  <div class="child">
    <h3>子组件</h3>
		<h4>玩具：{{ toy }}</h4>
		<button @click="emit('send-toy',toy)">测试</button>
  </div>
</template>

<script setup lang="ts" name="Child">
	import { ref } from "vue";
	// 数据
	let toy = ref('奥特曼')
	// 声明事件
	const emit =  defineEmits(['send-toy'])
</script>
```
### mitt
mitt 是一个小巧（200b）且灵活的 JavaScript 事件总线库，用于在应用程序中实现事件的发布和订阅。它可以用于跨组件进行事件通信。

1. 安装`mitt`
```shell
npm i mitt 		## npm i = npm install
```

2. 新建文件：`src\utils\emitter.ts`
```javascript
// 引入mitt 
import mitt from "mitt";

// 创建emitter
const emitter = mitt()

/*
  // 绑定事件
  emitter.on('abc',(value)=>{
    console.log('abc事件被触发',value)
  })
  emitter.on('xyz',(value)=>{
    console.log('xyz事件被触发',value)
  })

  setInterval(() => {
    // 触发事件
    emitter.emit('abc',666)
    emitter.emit('xyz',777)
  }, 1000);

  setTimeout(() => {
    // 清理全部事件
    emitter.all.clear()
  }, 3000); 
*/

// 创建并暴露mitt
export default emitter
```

3. 接收数据的组件中：绑定事件、同时在销毁前解绑事件
```typescript
import emitter from "@/utils/emitter";
import { onUnmounted } from "vue";

// 绑定事件
emitter.on('send-toy',(value)=>{
  console.log('send-toy事件被触发',value)
})

onUnmounted(()=>{
  // 组件销毁时解绑事件，防止内存泄露
  emitter.off('send-toy')
})
```

4. 提供数据的组件，在合适的时候触发事件
```javascript
import emitter from "@/utils/emitter";

function sendToy(){
  // 触发事件
  emitter.emit('send-toy',toy.value)
}
```
**注意这个重要的内置关系，总线依赖着这个内置关系。**
### v-model

1.  概述：实现 父↔子 之间相互通信。 
2.  前序知识 —— `v-model`的本质 
```vue
<!-- 使用v-model指令 -->
<input type="text" v-model="userName">

<!-- v-model的本质是下面这行代码 -->
<input 
  type="text" 
  :value="userName" 
  @input="userName =(<HTMLInputElement>$event.target).value"
>
```

3.  组件标签上的`v-model`的本质：`:moldeValue` ＋ `update:modelValue`事件。 
```vue
<!-- 组件标签上使用v-model指令 -->
<AtguiguInput v-model="userName"/>

<!-- 组件标签上v-model的本质 -->
<AtguiguInput :modelValue="userName" @update:model-value="userName = $event"/>
```
```vue
<template>
  <div class="box">
    <!--将接收的value值赋给input元素的value属性，目的是：为了呈现数据 -->
		<!--给input元素绑定原生input事件，触发input事件时，进而触发update:model-value事件-->
    <input 
       type="text" 
       :value="modelValue" 
       @input="emit('update:model-value',$event.target.value)"
    >
  </div>
</template>

<script setup lang="ts" name="AtguiguInput">
  // 接收props
  defineProps(['modelValue'])
  // 声明事件
  const emit = defineEmits(['update:model-value'])
</script>
```

4.  也可以更换`value`，例如改成`abc` 
```vue
<template>
  <div class="box">
    <input 
       type="text" 
       :value="abc" 
       @input="emit('update:abc',$event.target.value)"
    >
  </div>
</template>

<script setup lang="ts" name="AtguiguInput">
  // 接收props
  defineProps(['abc'])
  // 声明事件
  const emit = defineEmits(['update:abc'])
</script>
```

5.  如果`value`可以更换，那么也就可以在组件标签上多次使用`v-model` 
```vue
<AtguiguInput v-model:abc="userName" v-model:xyz="password"/>
```

---

```vue
<template>
    <Son v-model="inputValue" />
</template>

<script>
import { defineComponent, ref } from 'vue';
import Son from '@/components/Son.vue'; 

export default defineComponent({
    components: {
        Son
    },
    setup() {
        // 定义一个响应式引用，用于 v-model
        const inputValue = ref('7878');

        return {
            inputValue
        };
    }
});
</script>
```
```vue
<template>
    <input type="text" :value="modelValue" @input="updateValue" />
</template>

<script>
import { defineComponent, toRefs } from 'vue';

export default defineComponent({
    props: {
        // 接收外部 v-model 的值
        modelValue: String
    },
    setup(props, { emit }) {
        // 使用 toRefs 创建响应式引用
        const { modelValue } = toRefs(props);

        const updateValue = (event) => {
            // 当输入改变时，发射一个自定义事件来更新父组件的 v-model 绑定的值
            emit('update:modelValue', event.target.value);
        };

        return {
            modelValue,
            updateValue
        };
    }
});
</script>
```
### $attrs

1.  概述：`$attrs`用于实现**当前组件的父组件**，向**当前组件的子组件**通信（**祖→孙**）。 
2.  具体说明：`$attrs`是一个对象，包含所有父组件传入的标签属性。 

`$attrs` 用于在组件中访问父组件传递的非 `props` 属性。它是一个对象，包含了父组件传递给当前组件但没有被声明为 `props` 的所有属性。
当一个父组件向子组件传递属性时，只有在子组件中使用`defineProps()`声明为 `props`的属性才会被接收和使用。但有时，父组件可能会传递一些额外的属性，这些属性在子组件中并没有声明为 `props`，但你仍然希望能够访问它们。
这时就可以使用 `$attrs` 来获取这些额外的属性。`$attrs` 是一个包含了父组件传递的非 `props` 属性的对象。通过访问 `$attrs`可以获取到这些属性的值。
```vue
<template>
  <div class="father">
    <h3>父组件</h3>
		<Child :a="a" :b="b" :c="c" :d="d" v-bind="{x:100,y:200}" :updateA="updateA"/>
  </div>
</template>

<script setup lang="ts" name="Father">
	import Child from './Child.vue'
	import { ref } from "vue";
	let a = ref(1)
	let b = ref(2)
	let c = ref(3)
	let d = ref(4)

  // 实现孙传父：父传方法给子，子再给孙，孙通过该通过修改父属性的值
	function updateA(value){
		a.value = value
	}
</script>
```
```vue
<template>
	<div class="child">
		<h3>子组件</h3>
		<GrandChild v-bind="$attrs"/>
	</div>
</template>

<script setup lang="ts" name="Child">
	import GrandChild from './GrandChild.vue'
</script>
```
```vue
<template>
	<div class="grand-child">
		<h3>孙组件</h3>
		<h4>a：{{ a }}</h4>
		<h4>b：{{ b }}</h4>
		<h4>c：{{ c }}</h4>
		<h4>d：{{ d }}</h4>
		<h4>x：{{ x }}</h4>
		<h4>y：{{ y }}</h4>
		<button @click="updateA(666)">点我更新父的A</button>
	</div>
</template>

<script setup lang="ts" name="GrandChild">
	defineProps(['a','b','c','d','x','y','updateA'])
</script>
```
### \$refs$parent

1.  概述： 
   - `$refs`用于 ：**父→子。**
   - `$parent`用于：**子→父。**
2.  原理如下： 
| 属性 | 说明 |
| --- | --- |
| `$refs` | 值为对象，包含所有被`ref`
属性标识的`DOM`
元素或组件实例。 |
| `$parent` | 值为对象，当前组件的父组件实例对象。 |

3. 案例
```vue
<template>
	<div class="father">
		<h3>父组件</h3>
		<h4>房产：{{ house }}</h4>
		<button @click="changeToy">修改Child1的玩具</button>
		<button @click="changeComputer">修改Child2的电脑</button>
		<button @click="getAllChild($refs)">让所有孩子的书变多</button>
		<Child1 ref="c1"/>
		<Child2 ref="c2"/>
	</div>
</template>

<script setup lang="ts" name="Father">
	import Child1 from './Child1.vue'
	import Child2 from './Child2.vue'
	import { ref } from "vue";
	let c1 = ref()
	let c2 = ref()
	
	// 数据
	let house = ref(4)
	// 方法
	function changeToy(){
		c1.value.toy = '小猪佩奇'
	}
	function changeComputer(){
		c2.value.computer = '华为'
	}
	function getAllChild(refs:{[key:string]:any}){
    // 2个孩子的 书 属性同时+3
		for (let key in refs){
			refs[key].book += 3
		}
	}
	// 向外部提供数据
	defineExpose({house})
</script>
```
```vue
<template>
  <div class="child1">
    <h3>子组件1</h3>
		<h4>玩具：{{ toy }}</h4>
		<h4>书籍：{{ book }} 本</h4>
		<button @click="minusHouse($parent)">干掉父亲的一套房产</button>
  </div>
</template>

<script setup lang="ts" name="Child1">
	import { ref } from "vue";
	// 数据
	let toy = ref('奥特曼')
	let book = ref(3)

	// 方法
	function minusHouse(parent:any){
		parent.house -= 1
	}

	// 把数据交给外部
	defineExpose({toy,book})

</script>
```
```vue
<template>
  <div class="child2">
    <h3>子组件2</h3>
		<h4>电脑：{{ computer }}</h4>
		<h4>书籍：{{ book }} 本</h4>
  </div>
</template>

<script setup lang="ts" name="Child2">
		import { ref } from "vue";
		// 数据
		let computer = ref('联想')
		let book = ref(6)
		// 把数据交给外部
		defineExpose({computer,book})
</script>
```
### provide、inject
#### provide
提供一个值，可以被后代组件注入。

- **类型**

`function provide<T>(key: InjectionKey<T> | string, value: T): void`

- **详细信息**

`provide()` 接受两个参数：第一个参数是要注入的 key，可以是一个字符串或者一个 symbol，第二个参数是要注入的值。
当使用 TypeScript 时，key 可以是一个被类型断言为 `InjectionKey`的 symbol。`InjectionKey`是一个 Vue 提供的工具类型，继承自 `Symbol`，可以用来同步 `provide()`和 `inject()` 之间值的类型。与注册生命周期钩子的 API 类似，`provide()` 必须在组件的 `setup()` 阶段同步调用。

---

#### inject
注入一个由祖先组件或整个应用 (通过 `app.provide()`) 提供的值。

- 类型
```typescript
// 没有默认值
function inject<T>(key: InjectionKey<T> | string): T | undefined

// 带有默认值
function inject<T>(key: InjectionKey<T> | string, defaultValue: T): T

// 使用工厂函数
function inject<T>(
  key: InjectionKey<T> | string,
  defaultValue: () => T,
  treatDefaultAsFactory: true
): T
```

- 详情
1. 第一个参数是注入的 key。Vue 会遍历父组件链，通过匹配 key 来确定所提供的值。如果父组件链上多个组件对同一个 key 提供了值，那么离得更近的组件将会“覆盖”链上更远的组件所提供的值。如果没有能通过 key 匹配到值，`inject()` 将返回 `undefined`，除非提供了一个默认值。
2. 第二个参数是可选的，即在没有匹配到 key 时使用的默认值。
3. 第二个参数也可以是一个工厂函数，用来返回某些创建起来比较复杂的值。在这种情况下，你必须将 true 作为第三个参数传入，表明这个函数将作为工厂函数使用，而非值本身。

与注册生命周期钩子的 API 类似，`inject()`必须在组件的`setup()`阶段同步调用。
当使用 TypeScript 时，key 可以是一个类型为 `InjectionKey`的 symbol。`InjectionKey`是一个 Vue 提供的工具类型，继承自 `Symbol`，可以用来同步 `provide()` 和 `inject()` 之间值的类型。

#### 祖孙通信

1.  概述：实现**祖孙组件**直接通信 
2.  具体使用： 
   - 在祖先组件中通过`provide`配置向后代组件提供数据
   - 在后代组件中通过`inject`配置来声明接收数据
3.  具体编码：
【第一步】父组件中，使用`provide`提供数据 
```vue
<template>
  <div class="father">
    <h3>父组件</h3>
    <h4>资产：{{ money }}</h4>
    <h4>汽车：{{ car }}</h4>
    <button @click="money += 1">资产+1</button>
    <button @click="car.price += 1">汽车价格+1</button>
    <Child/>
  </div>
</template>

<script setup lang="ts" name="Father">
  import Child from './Child.vue'
  import { ref,reactive,provide } from "vue";
  // 数据
  let money = ref(100)
  let car = reactive({
    brand:'奔驰',
    price:100
  })
  // 用于更新money的方法
  function updateMoney(value:number){
    money.value += value
  }
  // 提供数据
  provide('moneyContext',{money,updateMoney})
  provide('car',car)
</script>
```
> 注意：子组件中不用编写任何东西，是不受到任何打扰的

【第二步】孙组件中使用`inject`配置项接受数据。 
```vue
<template>
  <div class="grand-child">
    <h3>我是孙组件</h3>
    <h4>资产：{{ money }}</h4>
    <h4>汽车：{{ car }}</h4>
    <button @click="updateMoney(6)">点我</button>
  </div>
</template>

<script setup lang="ts" name="GrandChild">
  import { inject } from 'vue';
  // 注入数据
  let {money,updateMoney} = inject('moneyContext',{money:0,updateMoney:(x:number)=>{}})
  let car = inject('car')
</script>
```
### slot
#### 默认插槽
默认插槽没有名字。当一个组件没有指定插槽名称时，任何未被包裹在 `<template>` 标签中的内容都会被视为默认插槽的内容。
```vue
<script setup>
import SubmitButton from './SubmitButton.vue'
</script>

<template>
  <!-- use fallback text -->
  <SubmitButton />
  
  <!-- provide custom text -->
  <SubmitButton>Save</SubmitButton>
</template>
```
```vue
<template>
  <button type="submit">
	<slot>
    	Submit <!-- fallback content -->
  	</slot>
	</button>
</template>
```
![效果](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/vue/202406171501454.png "效果")
#### 具名插槽
具名插槽允许你创建多个插槽，每个都有不同的名称。父组件可以指定它插入的内容应该进入哪个插槽。其实默认插槽也有名字，即default.
```vue
<script setup>
  import ChildComponent from "./ChildComponent.vue"
</script>
<template>
  <div>
    <ChildComponent>
      <template v-slot:header>
        <h1>This is a header.</h1>
      </template>
    
      <p>This is some default slot content.</p>
    
      <template #footer>
        <p>This is a footer.</p>
      </template>
    </ChildComponent>
  </div>
</template>
```
```vue
<template>
  <div>
    <slot name="header"></slot> <!-- 具名插槽 "header" -->
    <slot></slot> <!-- 默认插槽 -->
    <slot name="footer"></slot> <!-- 具名插槽 "footer" -->
  </div>
</template>
```
##### 动态插槽名
[动态指令参数](https://cn.vuejs.org/guide/essentials/template-syntax.html#dynamic-arguments)在 v-slot 上也是有效的，即可以定义下面这样的动态插槽名：
```vue
<base-layout>
  <template v-slot:[dynamicSlotName]>
    ...
  </template>

  <!-- 缩写为 -->
  <template #[dynamicSlotName]>
    ...
  </template>
</base-layout>
```
#### 作用域插槽
概念：作用域插槽允许子组件将数据传递回父组件的插槽内容。这样，父组件可以根据从子组件接收的数据来定制它的插槽内容。
理解：数据在组件的自身，但根据数据生成的结构需要组件的使用者来决定。（新闻数据在News组件中，但使用数据所遍历出来的结构由App组件决定）
```vue
<template>
  <div class="father">
    <h3>父组件</h3>
    <div class="content">
      <Game>
        <template v-slot="params">
          <ul>
            <li v-for="msg in params.youxi" :key="msg.id">
              {{ msg.name }}
            </li>
          </ul>
        </template>
      </Game>

      <Game>
        <template v-slot="params">
          <ol>
            <li v-for="item in params.youxi" :key="item.id">
              {{ item.name }}
            </li>
          </ol>
        </template>
      </Game>

      <Game>
        <template #default="{youxi}">	// 解构
          <h3 v-for="g in youxi" :key="g.id">{{ g.name }}</h3>
        </template>
      </Game>

    </div>
  </div>
</template>

<script setup lang="ts" name="Father">
  import Game from './Game.vue'
</script>
```
```vue
<template>
  <div class="game">
    <h2>游戏列表</h2>
    <slot :youxi="games"></slot>
  </div>
</template>

<script setup lang="ts" name="Game">
  import {reactive} from 'vue'
  let games = reactive([
    {id:'1',name:'英雄联盟'},
    {id:'2',name:'王者农药'},
    {id:'3',name:'红色警戒'},
    {id:'4',name:'斗罗大陆'}
  ])
</script>
```
## pinia
### 搭建环境

1. 安装依赖`npm install pinia`
2. 操作`src/main.ts`
```typescript
import { createApp } from 'vue'
import App from './App.vue'

/* 引入createPinia，用于创建pinia */
import { createPinia } from 'pinia'

/* 创建pinia */
const pinia = createPinia()
const app = createApp(App)

/* 使用插件 */{}
app.use(pinia)
app.mount('#app')
```

3. 查看效果

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/vue/202406171501322.png)

### 存储、读取数据

1.  `Store`是一个保存 **状态**、**业务逻辑** 的实体，每个组件都可以**读取、写入**它。 
2.  它有三个概念：`state`、`getter`、`action`，相当于组件中的： `data`、 `computed` 和 `methods`。 
3.  具体编码
```typescript
// 引入defineStore用于创建store
import {defineStore} from 'pinia'

// 定义并暴露一个store，钩子式命名use???Store
export const useCountStore = defineStore('count',{
  // 动作
  actions:{},
  // 状态
  state(){
    return {
      sum:6
    }
  },
  // 计算
  getters:{}
})
```

4. 组件中使用`state`属性
```vue
<template>
  <h2>当前求和为：{{ sumStore.sum }}</h2>	// 写法1
  <h2>当前求和为：{{ sumStore.$state.sum }}</h2>	// 写法2 
</template>

<script setup lang="ts" name="Count">
  // 引入对应的useXxxxxStore	
  import {useSumStore} from '@/store/sum'

  // 调用useXxxxxStore得到对应的store
  const sumStore = useSumStore()
</script>
```
### 修改属性

1.  第一种修改方式，直接修改 
```typescript
countStore.sum = 666
countSotre.$state.sum = 667
```

2.  第二种修改方式：批量修改 
```typescript
countStore.$patch({
  sum: 999,
  school: 'atguigu'
})
```

3.  第三种修改方式：借助`action`修改（`action`中可以编写一些业务逻辑） 
```typescript
import { defineStore } from 'pinia'

export const useCountStore = defineStore('count', {
  actions:{
    increment(value: number) {
      if (this.sum < 24) {
        this.sum += value;
      }
    },
    decrement(value: number) {
      if (this.sum > -12) {
        this.sum -= value;
      }
    }
  }
})
```
组件中调用`action`即可 
```javascript
// 使用countStore
const countStore = useCountStore()

// 调用对应action
function minus() {
  count.decrement(num.value)
}
```
### storeToRefs

- 借助`storeToRefs`将`store`中的数据转为`ref`对象，方便在模板中使用。
```vue
<template>
	<div class="count">
		<h2>当前求和为：{{sum}}</h2>
	</div>
</template>

<script setup lang="ts" name="Count">
  import { useCountStore } from '@/store/count'
  /* 引入storeToRefs */
  import { storeToRefs } from 'pinia'

	/* 得到countStore */
  const countStore = useCountStore()
  /* 使用storeToRefs转换countStore，随后解构 */
  const {sum} = storeToRefs(countStore)
</script>
```
#### toRefs
`toRefs` 函数来自 Vue 的响应式系统，它用于将一个响应式对象转换为一个普通对象，其中每个属性都是一个响应式引用。这通常在你想要将响应式对象的属性传递给独立的响应式属性时使用，保证它们保持响应性。
当你解构响应式对象时会丢失它的响应性，`toRefs` 可以帮助保持属性的响应性。
```javascript
import { reactive, toRefs } from 'vue';

const state = reactive({
  count: 0,
  title: 'Hello'
});

// 解构会丢失响应性
const { count, title } = state;

// 使用toRefs保持响应性
const { count, title } = toRefs(state);
```
在这个例子中，`toRefs` 允许你将 `state` 对象的每个属性转换为可以直接在 `setup` 函数以外单独使用的响应式引用。
#### storeToRefs
`storeToRefs` 是 Pinia 提供的一个函数，用于在组件中使用 Pinia store 时保留响应性。它类似于 `toRefs`，但专门为 Pinia store 设计。当你在组件中使用解构来获取 Pinia store 中的状态时，`storeToRefs` 确保每个解构出的状态都是响应式的。
```javascript
import { useMyStore } from '@/stores/myStore';
import { storeToRefs } from 'pinia';

const myStore = useMyStore();
const { count, title } = storeToRefs(myStore);
```
在这个例子中，`storeToRefs` 用于从 Pinia store 中获取响应式的 `count` 和 `title`。这样，当 `count` 和 `title` 在 store 中更新时，它们在组件中的引用也会更新。
总的来说，`toRefs` 用于 Vue 的响应式对象，而 `storeToRefs` 专门用于 Pinia store。二者都用于创建响应式引用，但它们的应用场景和所处理的对象类型不同。使用时应根据你的具体场景和状态管理的选择来决定使用哪一个。
### getters

1.  概念：当`state`中的数据，需要经过处理后再使用时，可以使用`getters`配置。 
2. 追加`getters`配置。
```typescript
// 引入defineStore用于创建store
import {defineStore} from 'pinia'

// 定义并暴露一个store
export const useCountStore = defineStore('count',{
  // 动作
  actions:{
    /************/
  },
  // 状态
  state(){
    return {
      sum:1,
      school:'atguigu'
    }
  },
  // 计算
  getters:{
    bigSum:(state):number => state.sum * 10,
    upperSchool():string{
      return this. school.toUpperCase()
    }
  }
})
```

3. 组件中读取数据
```typescript
let {sum,school,bigSum,upperSchool} = storeToRefs(countStore)
```
### $subscribe
#### 基本语法
通过 store 的 `$subscribe()` 方法侦听 `state` 及其变化
```typescript
multiDataStore.$subscribe((mutation, state) => {
  console.log('mutation->', mutation) // 本次修改的信息
  console.log('state->', state) // 真正的数据
})
```
#### localstorage案例（组合式）
localstorage是存储在本地的数据，即使关闭浏览器，下次打开数据依然存在。
```vue
<script setup lang="ts">
import {useMultiDataStore} from "@/store/MultiData.ts"
import {storeToRefs} from "pinia";

const multiDataStore = useMultiDataStore()
const {multiData} = storeToRefs(multiDataStore)

multiDataStore.$subscribe((mutation, state) => {
  console.log('mutation=>', mutation) // 本次修改的信息
  console.log('state=>', state) // 真正的数据
  // localStorage.setItem('multiData', JSON.stringify(multiData.value))
})

function addData() {
  multiData.value.push(Math.floor(Math.random() * 10))
  localStorage.setItem('multiData', JSON.stringify(multiData.value));
}
</script>

<template>
  <h3>{{multiData}}</h3>
  <button @click="addData">addData</button>
</template>
```
```typescript
import {defineStore} from "pinia";

export const useMultiDataStore = defineStore('multiData', {
    state() {
        return {
            // multiData: [1,2,3]
            multiData: JSON.parse(localStorage.getItem('multiData') as string) || []
        }
    }
})
```
#### localstorage案例（选项式）
```typescript
import {defineStore} from "pinia";
import {ref} from "vue"

export const useMultiDataStore = defineStore('multiData', {
    state: () => {
        const multiData = ref(
            JSON.parse(localStorage.getItem('multiData') as string) || []);
        return {
            multiData
        };
    }
});
```
#### 对比watch/watchEffect
`$subscribe`是Pinia状态管理库提供的方法，用于订阅状态的变化。它允许你在状态发生变化时执行自定义的回调函数。$subscribe适用于在整个应用程序中监听状态的变化，并执行一些额外的逻辑，例如记录日志/触发副作用等。
watch和watchEffect是Vue的响应式系统提供的功能，用于监听特定的数据变化。

- watch用于监听指定的数据源，并在数据发生变化时执行回调函数。你可以指定要监听的数据、回调函数以及其他选项，例如deep选项来深度监听对象的变化、immediate选项来立即执行回调函数等。watch的使用场景包括监听单个数据的变化、跟踪特定数据的状态、执行异步操作等。
- watchEffect用于监听响应式数据的变化，并自动追踪其依赖关系。它会立即执行传入的回调函数，并在回调函数内部自动追踪依赖的数据。当依赖的数据发生变化时，回调函数会被重新执行。watchEffect的使用场景包括处理副作用、触发异步操作、自动追踪响应式数据的变化等。

总结

- $subscribe用于订阅状态的变化，适用于整个应用程序的状态管理，可以执行自定义的回调函数。
- watch用于监听指定的数据源，提供更细粒度的控制和选项，适用于监听单个数据的变化。
- watchEffect用于监听响应式数据的变化，并自动追踪其依赖关系，适用于处理副作用和自动追踪数据的变化。

在实际使用中，你可以根据具体的需求和场景选择适合的方法。如果你需要订阅整个状态的变化或执行一些全局的逻辑，可以使用$subscribe。如果你只关注某个特定数据的变化，并需要更多的选项和控制，可以使用watch。如果你需要处理副作用或自动追踪响应式数据的变化，可以使用watchEffect。
