---
title: React
shortTitle: React
description: 
date: 2024-06-16 22:29:35
categories: [React]
tags: []
---
## 环境准备
### 创建工程
React浏览器开发插件：`React Developer Tools`
#### webpack
create-react-app是一个快速创建React开发环境的工具，底层由Webpack构件，封装了配置细节，开箱即用
CMD执行命令：`npx create-react-app 工程文件名`

#### Vite
CMD执行命令：`npm create vite@latest react-typescript -- --template react-ts`
### 路径解析配置
#### webpack-js
配置步骤：

1. 安装craco：`npm i -D @craco/craco`
2. 项目根目录下创建配置文件：craco.config.js
3. 配置文件中添加路径解析配置
```javascript
const path = require('path')

module.exports = {
  // webpack配置
  webpack: {
    // 配置别名
    alias: {
      // 约定：使用@表示src 文件所在路径
      '@': path.resolve(__dirname, 'src/'),
    },
  },
}
```

4. 包文件中配置启动和打包命令
```json
  "scripts": {
    "start": "craco start",
    "build": "craco build"
  }
```
#### Vite-ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

```
### 联想路径配置
#### webpack-js
配置步骤：

1. 根目录下新增配置文件 - jsconfig.json
2. 添加路径提示配置
```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```
#### Vite-ts
安装node类型包：`npm i @types/node -D`
```json
{
  "baseUrl": ".",
  "paths": {
    "@/*": [
      "src/*"
    ]
  },
}
```
## React基础
### JSX基础
#### 概念
JSX是JavaScript和XMl(HTML)的缩写，表示在JS代码中编写HTML模版结构，它是React中构建UI的方式。
```jsx
const message = 'this is message'

function App(){
  return (
    <div>
      <h1>this is title</h1>
      {message}
    </div>
  )
}
```
优势：

1. HTML的声明式模版写法
2. JavaScript的可编程能力
#### 本质
JSX不是标准的JS语法，它是 JS的语法扩展，浏览器本身不能识别，需要通过解析工具做解析之后才能在浏览器中使用

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171502660.png)

#### JS表达式
```jsx
const message = "this is message"
function App() {
	return (
		<div>
			{/* 使用引号传递字符串 */}
			{"This is a div!"}
			{/* 使用JS变量 */}
			{message}
			{/* 函数调用 */}
			{getMessage()}
			{/* 方法调用 */}
			{new Date().toString()}
			{/* 使用JS对象 */}
			<div style={{ color: "red" }}>This is a div!</div>
		</div>
	);
}

export default App;
```
#### 列表渲染

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171502643.png)

在JSX中可以使用原生js中的`map方法`实现列表渲染。

```jsx
const list = [
  {id:1001, name:'Vue'},
  {id:1002, name: 'React'},
  {id:1003, name: 'Angular'}
]

function App() {
  return (
			{/* 列表渲染 */}
			<ul>
				{list.map((item) => (
					<li key={item.id}>{item.name}</li>
				))}
			</ul>
  )
}
```
`key={item.id}`能夠優化渲染速度
#### 条件渲染
逻辑运算符与三目运算符

```mermaid
flowchart LR
isLogin --> true --> Jack
isLogin --> false --> 请登录
```

```jsx
const flag = true
const loading = false

function App(){
  return (
    <>
      {/* 逻辑 */}
      {flag && <span>this is span</span>}
      {/* 三目 */}
      {loading ? <span>loading...</span>:<span>this is span</span>}
      {isLogin ? <span>Jack</span>:<span>请登录</span>}
    </>
  )
}
```
#### 复杂条件渲染
`if……else` `if……else`
```jsx
const type = 1  // 0|1|3

function getArticleJSX(){
  if(type === 0){
    return <div>无图模式模版</div>
  }else if(type === 1){
    return <div>单图模式模版</div>
  }else{
    return <div>三图模式模版</div>
  }
}

function App(){
  return (
    <>
      { getArticleJSX() }
    </>
  )
}
```
### 事件绑定
#### 基础实现
React中的事件绑定，通过语法 `on + 事件名称 = { 事件处理程序 }`，整体上遵循驼峰命名法。
```jsx
function App(){
  // 这个方法写在App()的内外都可以
  const clickHandler = ()=>{
    console.log('button按钮点击了')
  }
  return (
    <button onClick={clickHandler}>click me</button>
  )
}
```
#### 事件参数
在事件回调函数中设置形参`e`即可
```jsx
function App(){
  const clickHandler = (e)=>{
    console.log('button按钮点击了', e)
  }
  return (
    <button onClick={clickHandler}>click me</button>
  )
}
```
#### 自定义参数
事件绑定的位置改造成箭头函数的写法，在执行`clickHandler`实际处理业务函数的时候传递实参。
```jsx
function App(){
  const clickHandler = (name)=>{
    console.log('button按钮点击了，姓名为', name)
  }
  return (
    <button onClick={()=>clickHandler('jack')}>click me</button>
  )
}
```
> 注意：不能直接写函数调用，这里事件绑定需要一个函数引用。

#### 同时传递事件对象和自定义参数
在事件绑定的位置传递事件实参`e`和自定义参数，`clickHandler`中声明形参，**注意顺序对应。**
```jsx
function App(){
  const clickHandler = (name,e)=>{
    console.log('button按钮点击了，姓名：', name,e)
  }
  return (
    <button onClick={(e)=>clickHandler('jack',e)}>click me</button>
  )
}
```
### 组件基础
一个组件就是一个用户界面的一部分，它可以有自己的逻辑和外观，组件之间可以互相嵌套，也可以复用多次

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171504045.png)

#### 基本使用
一个组件就是**首字母大写的函数**，内部存放了组件的逻辑和视图UI, 渲染组件只需要把组件当成标签书写即可
#### 状态管理
##### 基础使用
`useState` 是一个 React Hook（函数），它允许我们向组件添加一个`状态变量`, 从而控制影响组件的渲染结果

和普通JS变量不同的是，状态变量一旦发生变化组件的视图UI也会跟着变化（数据驱动视图）

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171504375.png)

```jsx
import React from "react";
function App(){
  const [ count, setCount ] = React.useState(0)
  return (
    <div>
			<button onClick={() => setCount(count + 1)}>{count}</button>
    </div>
  )
}
```
##### 状态修改规则
状态被认为是只读的，我们应该始终**替换它而不是修改它**, 直接修改状态不能引发视图更新

![左（×） 右（√）](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171504209.png "左（×） 右（√）")

```jsx
	const [count, setCount] = React.useState(0);
  const handlerClick = () => {
		setCount(count + 1);
	};
```
##### 修改对象状态
对于对象类型的状态变量，应该始终给set方法一个**全新的对象**来进行修改

![左（×） 右（√）](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171504913.png "左（×） 右（√）")

```jsx
	const [form, setForm] = useState({
		name: "Jack",
	});
	const handleChangeName = () => {
		setForm({
			...form,	// ...用于创建对象的浅拷贝，它可以复制对象中的所有可枚举属性到新对象中
			name: "John",
		});
	};
```
#### 基础样式处理
##### 行内样式
```jsx
const style = {
	color: "red",
  fontSize: "20px"	// 注意要写成 驼峰形式
};

function App() {
	return (
		<div>
      {/* 行内样式控制 */}
      <div style={{ fontSize: "25px", color: "green" }}>this is div tag</div>
      <span style={style}>This is span tag</span>
		</div>
	);
}
```
##### class类名控制
```css
.foo {
    color: blue;
    font-size: 22px;
}
```
```jsx
import "./index.css";

function App() {
	return (
		<div>
      {/* 通过class类名控制样式 */}
      <span className="foo">This is class foo</span>
		</div>
	);
}
```
### 工具库
#### lodush
[Lodash 简介 | Lodash中文文档 | Lodash中文网](https://www.lodashjs.com/)
Lodash 是一个 JavaScript 实用工具库，提供了许多实用的功能，帮助开发者在编写 JavaScript 代码时更高效、更方便。它提供了对数组、对象、函数、字符串等数据类型的处理方法，同时还提供了许多实用的工具函数，用于简化常见的编程任务。
```shell
npm install --save lodush
```
```jsx
import _ from 'lodash'
```
#### classnames
`classnames` 是一个 JavaScript 工具库，用于动态生成 HTML 元素的 class 字符串。它通常在 React 应用程序中用于简化条件性地应用 CSS 类名。
`classnames` 可以更方便地处理动态 class 名称的拼接，特别是在有多个条件需要考虑时，代码会更加清晰和简洁。

1.  **安装**`classnames`：
你可以使用 npm 或者 yarn 来安装 `classnames`： 
```bash
npm install classnames
```

2.  **基本用法**： 
```javascript
import classNames from 'classnames';

const buttonClass = classNames({
  'btn': true,
  'btn-primary': true,
  'btn-large': false
});

// buttonClass 的值为 'btn btn-primary'
```
在这个例子中，`classNames` 接受一个对象作为参数，对象的 key 是 class 名称，value 是一个布尔值，表示是否应该包含该 class。`classNames` 会将 value 为 true 的 class 名称添加到最终的 class 字符串中。 

3.  **条件性应用 class**： 
```javascript
import classNames from 'classnames';

const active = true;
const buttonClass = classNames('btn', {
  'btn-primary': active,
  'btn-large': !active
});

// buttonClass 的值为 'btn btn-primary'
```
本例中，`btn` class 总会被添加，而 `btn-primary` 或 `btn-large` 则根据 `active` 变量的值进行条件性添加。

4.  **数组作为参数**： 
```javascript
import classNames from 'classnames';

const size = 'small';
const buttonClass = classNames('btn', ['btn-primary', 'btn-large'], {
  'btn-small': size === 'small',
  'btn-medium': size === 'medium',
  'btn-large': size === 'large'
});

// 如果 size 为 'small'，则 buttonClass 的值为 'btn btn-primary btn-large btn-small'
```
本例展示了如何将数组作为参数传递给 `classnames`，数组中的每个元素都会被添加到最终的 class 字符串中。 
#### UUID
[GitHub - uuidjs/uuid: Generate RFC-compliant UUIDs in JavaScript](https://github.com/uuidjs/uuid)
```shell
npm install uuid
```
```javascript
import { v4 as uuidv4 } from 'uuid';
uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'
```
#### days
[Day.js中文网](https://dayjs.fenxianglu.cn/)
处理日期时间
### 表单控制
#### 受控绑定
在受控组件中，表单元素的值由 React 的 state 控制。当用户输入时，React 通过更新组件的 state 来反映输入的变化。受控组件中的值始终由 React 控制，并通过 props 将当前值传递给表单元素。

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171504475.png)

```jsx
import { useState } from "react";

function App() {
  // 声明一个React状态
	const [value, setValue] = useState("");
	return (
		<input
			type="text"
			value={value}   // 通过value属性绑定react状态
      // 绑定onChange事件 通过事件参数e拿到输入框最新的值
			onChange={(e) => setValue(e.target.value)}
		/>
	);
}
```
本例中，输入框的值受到 value 状态的控制，用户的输入会更新该状态，并且该状态的变化会被反映到输入框中。
#### 非受控绑定
在非受控组件中，表单元素的值不受 React state 的控制，而是由 DOM 元素自身来管理。React 组件只是在需要时获取 DOM 元素的值，而不直接控制其值的变化。
```jsx
import { useRef } from "react";

function App() {
	// 生成ref对象，绑定到DOM标签上
	const inputRef = useRef(null);
	const onChange = () => {
		// DOM可用时，ref.current获取dom
		// 渲染完毕之后DOM生成之后才可用
		console.log(inputRef.current.value);
	};
	const handlerClick = () => {
		console.log(`Input value:${inputRef.current.value}`);
	};
	return (
		<div>
			<input type="text" ref={inputRef} onChange={onChange} />
			<button onClick={handlerClick}>Get Value</button>
		</div>
	);
}
```
### 组件通信
组件通信就是组件之间的数据传递, 根据组件嵌套关系的不同，有不同的通信手段和方法

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171504351.png)

| A-B 父子通信 | B-C 兄弟通信 | A-E 跨层通信 |
| ------------ | ------------ | ------------ |

#### 父子通信——父传子
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171504255.png)
##### 基础实现

1. 父组件传递数据 - 在子组件标签上绑定属性
2. 子组件接收数据 - 子组件通过props参数接收数据
```jsx
function Son(props){
  return <div>从父组件接收到的：{ props.name }</div>
}

function App(){
  const name = 'this is app name'
  return (
    <div>
       <Son name={name}/>
    </div>
  )
}
```
##### props说明
**props可以传递任意的合法数据**，比如数字、字符串、布尔值、数组、对象、函数、JSX

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171504840.png)

**props是只读对象**子组件只能读取props中的数据，不能直接进行修改, 父组件的数据只能由父组件修改

##### 特殊的prop-children
当把内容嵌套在组件的标签内部时，组件会自动在名为children的prop属性中接收该内容

```jsx
function Son(props) {
  console.log(props);
  return (
    <div>
      {props.children[1]}		{/* <b>!1this is b tag from father1!</b> */}
    </div>
  );
}

function App() {
  const appName = "this is app name";
  return (
    <div>
      <Son>
        <sub>!0this is sub tag from father0!</sub>
        <b>!1this is b tag from father1!</b>
      </Son>
    </div>
  );
}
```
#### 父子通信——子传父

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171504191.png)

核心思路：在子组件中调用父组件中的函数并传递参数

```jsx
function Son({ onGetMsg }) {
	const sonMsg = "this is son msg";
	return (
		<div>
			{/* 在子组件中执行父组件传递过来的参数 */}
			<button onClick={() => onGetMsg(sonMsg)}>send msg to father</button>
		</div>
	);
}

function App() {
	const getMsg = (msg) => {
		console.log(msg);
	};
	return (
		<div>
			<Son onGetMsg={getMsg} />
		</div>
	);
}
```
#### 兄弟通信
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171504019.png)

实现思路: 借助 **状态提升** 机制，通过共同的父组件进行兄弟之间的数据传递

1. A组件先通过子传父的方式把数据传递给父组件App
2. App拿到数据之后通过父传子的方式再传递给B组件
```jsx
// 1. 通过子传父 A -> App
// 2. 通过父传子 App -> B

import { useState } from "react";

function A({ onGetAName }) {
	// Son组件中的数据
	const name = "this is A name";
	return (
		<div>
			this is A compnent,
			<button onClick={() => onGetAName(name)}>send</button>
		</div>
	);
}

function B({ name }) {
	return (
		<div>
			this is B compnent,
			{name}
		</div>
	);
}

function App() {
	const [name, setName] = useState("");
	const getAName = (name) => {
		setName(name);
	};
	return (
		<div>
			this is App
			<A onGetAName={getAName} />
			<B name={name} />
		</div>
	);
}

export default App;
```

---

```jsx
import React, { useState } from 'react';
import SiblingA from './SiblingA';
import SiblingB from './SiblingB';

function ParentComponent() {
  const [name, setName] = useState('');

  return (
    <div>
      <SiblingA setName={setName} />
      <SiblingB name={name} />
    </div>
  );
}

export default ParentComponent;
```
```jsx
function SiblingA({ setName }) {
	const handleInputChange = (event) => {
		setName(event.target.value);
	};

	return (
		<div>
			<input
				type="text"
				placeholder="Enter name please"
				onChange={handleInputChange}
			/>
		</div>
	);
}

export default SiblingA;
```
```jsx
function SiblingB({ name }) {
	const handleButtonClick = () => {
		alert(`Hello SiblingB ${name} !`);
	};

	return (
		<div>
			<button onClick={handleButtonClick}>SiblingB Say Hello</button>
		</div>
	);
}

export default SiblingB;
```
#### 跨组件通信
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171504342.png)
**实现步骤：**

1. 使用 `createContext`方法创建一个上下文对象Ctx
2. 在顶层组件（App）中通过 `Ctx.Provider` 组件提供数据
3. 在底层组件（B）中通过 `useContext` 钩子函数获取消费数据
```jsx
// 跨组件通信
// App -> A -> B

import { createContext, useContext } from "react";

// 1、createContext方法创建一个上下文对象
const MsgContext = createContext();

function A() {
    return (
        <div>
            this is A ParentComponent
            <B />
        </div>
    )
}

function B() {
    // 3、在底层组件通过useContext钩子函数使用数据
    const msg = useContext(MsgContext)
    return (
        <div>
            this is B component,{msg}
        </div>
    )
}

function App() {
    const msg = 'this is app msg'
    return (
        <div>
            {/* 2、在顶层组件 通过Provider组件提供数据 */}
            <MsgContext.Provider value={msg}>
                this is App
                <A />
            </MsgContext.Provider>
        </div>
    )
}

export default App
```
#### 总结
**组件间的关系**

- 父子组件
- 兄弟组件（非嵌套组件）
- 祖孙组件（跨级组件）

**通信方式**

- props
   - children props
   - render props
- 消息订阅-发布
   - pubs-sub、event……
- 集中式管理
   - redux、dva……
- conText
   - 生产者-消费者模式

**推荐的搭配方式**

- 父子组件：props
- 兄弟组件：消息订阅-发布、集中式管理
- 祖孙组件（跨级组件）：消息订阅-发布、集中式管理、conText(开发用得少，封装插件用得多)
### 副作用管理
#### 概念
`useEffect`是一个React Hook函数，用于在React组件中创建不是由事件引起而是由渲染本身引起的操作（副作用）, 比如发送AJAX请求、手动更改真实DOM、设置订阅/启动定时器
![上面的组件中没有发生任何的用户事件，组件渲染完毕之后就需要和服务器要数据，整个过程属于“只由渲染引起的操作”](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171505642.png "上面的组件中没有发生任何的用户事件，组件渲染完毕之后就需要和服务器要数据，整个过程属于“只由渲染引起的操作”")

#### 基本使用
语法：`useEffect(() => {}, [])`
说明：

1. 参数1是一个函数，可以把它叫做副作用函数，在函数内部可以放置要执行的操作
2. 参数2是一个数组（可选参），在数组里放置依赖项，不同依赖项会影响第一个参数函数的执行，当是一个空数组的时候，副作用函数只会在组件渲染完毕之后执行一次
```jsx
useEffect(() => { 
  // 在此可以执行任何带副作用操作
  return () => { // 在组件卸载前执行
    // 在此做一些收尾工作, 比如清除定时器/取消订阅等
  }
}, [stateValue]) // 如果指定的是[], 回调函数只会在第一次render()后执行
```
```jsx
import { useEffect, useState } from "react";

function App() {
	const [count, setCount] = useState(0);

	// 每次渲染后更新文档标题
	useEffect(() => {
		document.title = `You have clicked ${count} times`;
	}, [count]); // 仅在 count 发生变化时重新运行

	return (
		<div>
			<p>You have clicked {count} times</p>
			<button onClick={() => setCount(count + 1)}>Click me</button>
		</div>
	);
}

export default App;
```
#### 依赖说明
useEffect副作用函数的执行时机存在多种情况，根据传入依赖项的不同，会有不同的执行表现

| **依赖项** | **副作用功函数的执行时机** |
| --- | --- |
| 没有依赖项 | 组件初始渲染 + 组件更新时执行 |
| 空数组依赖 | 只在初始渲染时执行一次 |
| 添加特定依赖项 | 组件初始渲染 + 依赖项变化时执行 |

#### 清除副作用
在useEffect中编写的由渲染本身引起的对接组件外部的操作，社区也经常把它叫做副作用操作，比如在useEffect中开启了一个定时器，我们想在组件卸载时把这个定时器再清理掉，这个过程就是清理副作用
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171505060.png)

> 清除副作用的函数最常见的执行时机是在组件卸载时自动执行

```jsx
import { useEffect, useState } from "react";

function Son() {
	// 1. 渲染时开启一个定时器
	useEffect(() => {
		const timer = setInterval(() => {
			console.log("定时器执行中...");
		}, 1000);

		return () => {
			// 清除副作用(组件卸载时)
			clearInterval(timer);
		};
	}, []);
	return <div>this is son</div>;
}

function App() {
	// 通过条件渲染模拟组件卸载
	const [show, setShow] = useState(true);
	return (
		<div>
			{show && <Son />}
			<button onClick={() => setShow(false)}>卸载Son组件</button>
		</div>
	);
}

export default App;
```
### Hook函数
#### useReducer
`useReducer`用于管理组件的state。它类似于`redux`中的reducer概念,允许我们基于当前的state和指定操作(action),计算出新的state。`useReducer`提供了一种管理复杂state逻辑的优雅方式,特别是在需要共享状态逻辑或引用追踪的场景下非常有用。
**语法**
```jsx
const [state, dispatch] = useReducer(reducer, initialState, init);
```

- `reducer`: 一个函数,接受当前state和action,返回新的state。
- `initialState`: 初始state。
- `init`: 可选的函数,用于延迟初始化state。
- `state`: 当前state。
- `dispatch`: 一个函数,用于触发state更新。

![执行流程图](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171505023.png "执行流程图")
**为什么使用useReducer?**

1. **简化复杂state逻辑**：在组件中有多个state源,且需要复杂的逻辑来更新它们时,可以使用useReducer提供一个集中式的操作。
2. **重用逻辑**：reducer函数可在组件或hooks间共享。
3. **捕获引用值**：在某些场景下,reducer可以获取state前后变化的引用值,而通过`useState`则不能。
4. **更好的debug**：reducer总是返回全新的state,更容易观察state的变化。
```jsx
// 1. 定义reducer函数，根据不同的action状态返回不同的新状态
import {useReducer} from "react";

function reducer(state, action) {
    switch (action.type) {
        case 'INC':
            return {...state, count: state.count + 1};
        case 'DEC':
            return {...state, count: state.count - 1};
        case 'UPDATE':
            return {count: action.payload};
        default:
            return state.count;
    }
}

// 初始state
const initialState = {count: 0};

function App() {
    // 2. 使用useReducer分派action
    const [state, dispatch] = useReducer(reducer, initialState)
    return (
        <div>
            {/* 3. 调用dispatch函数传入action对象，触发reducer函数，分派action操作，使用新状态更新视图*/}
            <button onClick={() => dispatch({type: 'DEC'})}>-</button>
            {state.count}
            <button onClick={() => dispatch({type: 'INC'})}>+</button>
            <button onClick={() => dispatch({type: 'UPDATE', payload: 100})}>SET 100</button>
        </div>
    )
}

export default App
```
##### 对比useState
`useState`和`useReducer`都是React hooks中用于管理状态的钩子函数,但它们在使用场景和方式上存在一些差异:
**useState**:

- `useState`主要用于管理简单的状态,如字符串、数字、布尔值、对象或数组等。
- 每个状态只需要一个`setState`函数即可完成修改。
- 状态更新是直接覆盖原有状态。
- 状态逻辑相对简单直观。

**useReducer**:

- `useReducer`主要用于管理复杂的状态逻辑。
- 通过定义一个 reducer 函数集中处理多个状态的更新逻辑。
- 利用 action 对象描述不同的状态转换情况。
- 状态更新遵循纯函数式无副作用的模式,返回全新状态对象。
- 状态逻辑相对复杂,但更加结构化、可维护。
- 适合多个组件共享状态逻辑。

一般而言:

- 如果状态逻辑很简单,只有几个状态需要管理,使用`useState`即可。
- 如果有复杂的状态逻辑,多个子值需要共享逻辑、引用追踪等,使用`useReducer`会更加适合。
#### useMemo
作用：缓存计算结果
语法：`const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);`

- computeExpensiveValue(a, b): 你需要缓存的那个"昂贵"计算的函数,它应该是一个纯函数。
- [a, b]: 依赖数组,当a或b的值发生变化时,computeExpensiveValue(a, b)会重新执行。
```jsx
import React, {useMemo, useState} from 'react';

function fibonacci(n) {
    console.log('计算函数执行了！')
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

function App() {
    const [number, setNumber] = useState(10);

    // 通过useMemo缓存计算结果，只有number发生变化时才重新计算
    const sum = useMemo(() => {
        return fibonacci(number)
    }, [number])

    return (
        <div>
            <label>
                Fibonacci of
                <input
                    type="number"
                    value={number}
                    onChange={(e) => setNumber(Number(e.target.value))}
                />
            </label>
            <p>Fibonacci({number}) = {sum}</p>
        </div>
    );
}

export default App
```
#### useCallback
`useCallback` 是另一个优化性能的 Hook。它用于缓存函数实例,避免在每次渲染时重新创建相同的函数。
```jsx
const memoizedCallback = useCallback(
  () => {
    // 函数体
  },
  [dependencies]
);
```

- 第一个参数是需要被缓存的函数。
- 第二个参数是依赖数组,当依赖项发生变化时,函数实例会被重新创建。

使用场景

- 作为回调函数传递给子组件：如果一个回调函数作为 prop 传递给子组件,则应该使用 useCallback 对其进行缓存,以防止子组件不必要的重渲染。
- 在依赖项未发生变化时复用相同的函数实例：如果一个函数只依赖于某些状态或 props,那么只有在依赖项发生变化时才需要重新创建函数实例。

案例:
```jsx
import { memo, useCallback, useState } from 'react'

const MemoSon = memo(function Son() {
    console.log('Son组件渲染了')
    return <div>this is son</div>
})

function App() {
    const [, forceUpdate] = useState()
    console.log('父组件重新渲染了')
    const onGetSonMessage = useCallback((message) => {
        console.log(message)
    }, [])

    return (
        <div>
            <MemoSon onGetSonMessage={onGetSonMessage} />
            <button onClick={() => forceUpdate(Math.random())}>update</button>
        </div>
    )
}

export default App
```
#### useImperativeHandle
`useImperativeHandle` 是 React 提供的一个钩子,它可以与 `forwardRef` 一起使用,允许父组件获取子组件内部的一些命令或方法,从而控制子组件的行为。
**语法**
```jsx
useImperativeHandle(ref, createHandle, [deps])
```

- `ref` 是通过 `forwardRef` 传入的 ref 引用。
- `createHandle` 是一个函数,返回一个对象,该对象暴露给父组件访问和操作子组件的命令。
- `deps` 是一个可选的依赖数组,当依赖项变化时,`createHandle` 会重新执行。

**使用场景**
通常情况下,React 推荐使用自上而下的数据流,通过传递 props 控制子组件。但在某些情况下,父组件需要直接访问子组件的内部方法或状态,这时就可以使用 `useImperativeHandle`。
**示例**
```jsx
import React, { forwardRef, useImperativeHandle, useRef } from 'react';

const InputComponent = forwardRef((props, ref) => {
  // 实现内部的聚焦逻辑
  const inputRef = useRef(null);
  // 暴露子组件内部的聚焦方法 
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }), []);

  return <input type="text" ref={inputRef} />;
});

const App = () => {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current.focus();
  };

  return (
    <div>
      <InputComponent ref={inputRef} />
      <button onClick={focusInput}>Focus Input</button>
    </div>
  );
};
```
在这个例子中:

1. `InputComponent` 是一个子组件,通过 `forwardRef` 获取父组件传递的 ref 引用。
2. 在 `InputComponent` 内部,使用 `useImperativeHandle` 暴露了一个 `focus` 方法给父组件。
3. 父组件 `App` 通过 `inputRef.current` 可以访问到子组件暴露的 `focus` 方法。
4. 当点击按钮时,调用 `inputRef.current.focus()`  能够聚焦文本输入框。

#### 自定义Hook
自定义Hook必须是以 `**use**`**开头的函数**，通过自定义Hook函数可以用来**实现逻辑的封装和复用**
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171505964.png)

```jsx
// 问题: 布尔切换的逻辑 当前组件耦合在一起的 不方便复用
// 解决思路: 自定义hook

import { useState } from "react";

function useToggle() {
	// 可复用的逻辑代码
	const [value, setValue] = useState(true);

	const toggle = () => setValue(!value);

	// 哪些状态和回调函数需要在其他组件中使用，就return
	return {
		value,
		toggle,
	};
}

// 封装自定义hook通用思路
// 1、声明一个以use开头的函数
// 2、在函数体内封装可复用的逻辑（只要是可复用的逻辑）
// 3、把组件中用到的状态或者回调return出去
// 4、在哪个组件中要用到这个逻辑，就执行这个函数，解构出来状态和回调进行使用

function App() {
	const { value, toggle } = useToggle();
	return (
		<div>
			{value && <div>this is div</div>}
			<button onClick={toggle}>toggle</button>
		</div>
	);
}

export default App;
```
使用规则

1. 只能在组件中或者其他自定义Hook函数中调用
2. 只能在组件的顶层调用，不能嵌套在if、for、其它的函数中
### React API
#### memo
作用：允许组件在props没有改变的情况下跳过重新渲染
memo 是一个高阶组件(HOC),它用于包裹 React 组件,用于优化组件的渲染性能。memo 会缓存组件的渲染结果,当组件的 props 发生变化时,才会重新渲染组件,否则就直接复用上一次的渲染结果。
```jsx
import React, { memo } from 'react';

const MyComponent = memo(function MyComponent(props) {
  /* 使用 props 渲染组件 */
});
```
```jsx
const MyComponent = memo(
  React.memo(function MyComponent(props) {
    /* 使用 props 渲染组件 */
  }),
  (prevProps, nextProps) => {
    /* 自定义比较函数，比较新旧 props 是否相等 */
    /* 如果返回 true，则组件不会重新渲染 */
    /* 如果返回 false，则组件将重新渲染 */
  }
);
```
使用场景

- 当组件的渲染代价很高时，可以使用 `memo` 包裹组件，避免不必要的重渲染。
- 当组件是一个纯组件(Pure Component)时，即组件的输出只依赖于 `props` 的变化。
- 当组件被频繁重渲染时，使用 `memo` 可以减少不必要的重渲染。

注意事项

- memo 只会对组件的 props 进行浅层比较,如果 props 中包含了复杂对象或数组,只有引用发生变化时才会触发重渲染,对象或数组内部数据的变化不会触发重渲染。
- memo 不会比较组件的 state,因此如果组件的渲染依赖于 state,使用 memo 也不会阻止组件重渲染。
- memo 不应该用于函数组件中的每一个渲染,这可能会导致意外的重渲染。通常只需要为大型组件或高开销的子组件使用 memo。
- memo 只是一种性能优化的方式,并不是必需的,也不能滥用。
##### 组件默认的渲染机制
默认机制：顶层组件发生重新渲染，这个组件树的子级组件都会被重新渲染
```jsx
import { useState } from 'react'

function Son() {
  console.log('子组件被重新渲染了')
  return <div>this is son</div>
}

function App() {
  const [, forceUpdate] = useState()
  console.log('父组件重新渲染了')
  return (
    <>
      <Son />
      <button onClick={() => forceUpdate(Math.random())}>update</button>
    </>
  )
}

export default App
```
##### 使用React.memo优化
机制：只有props发生变化时才重新渲染
下面的子组件通过 memo 进行包裹之后，返回一个新的组件MemoSon, 只有传给MemoSon的props参数发生变化时才会重新渲染
```jsx
import { memo, useState } from 'react'

const MemoSon = memo(function Son() {
  console.log('子组件被重新渲染了')
  return <div>this is span</div>
})

function App() {
  const [, forceUpdate] = useState()
  console.log('父组件重新渲染了')
  return (
    <>
      <MemoSon />
      <button onClick={() => forceUpdate(Math.random())}>update</button>
    </>
  )
}

export default App
```
##### props的比较机制
| 基本类型 | 对象/复杂/引用类型 |
| --- | --- |
| 比较数值  | 比较引用 |

```jsx
import {memo, useState} from "react";

const MemoSon = memo(function Son({num, list}) {
    console.log('子组件被重新渲染了！')
    return (
        <div>
            this is Son!{num}.{list}
        </div>
    )
})

function App() {
    console.log('父组件重新渲染了!')
    const [, forceUpdate] = useState()
    const [num, setNum] = useState(100)
    const list = [1,3,5]
    return (
        <div>
            <MemoSon num={num} list={list}/>
            <button onClick={() => setNum(111)}>update</button>
            <button onClick={() => forceUpdate(Math.random())}>update</button>
        </div>
    )
}

export default App;
```
上面的例子中给子组件传入了基本类型`num`和引用类型`list`

- 第一个按钮修改了`num`的值，故子组件会重新渲染
- 第二个按钮没有修改`list`的值，但是因为组件App俩次渲染生成了不同的对象引用list，所以传给MemoSon组件的props视为不同，子组件也会发生重新渲染
##### 自定义比较函数
如果上一小节的例子，我们不想通过引用来比较，而是完全比较数组的成员是否完全一致，则可以通过自定义比较函数来实现
```jsx
import React, { useState } from 'react'

// 自定义比较函数
function arePropsEqual(oldProps, newProps) {
  console.log(oldProps, newProps)
  return (
    oldProps.list.length === newProps.list.length &&
    oldProps.list.every((oldItem, index) => {
      const newItem = newProps.list[index]
      console.log(newItem, oldItem)
      return oldItem === newItem
    })
  )
}

const MemoSon = React.memo(function Son() {
  console.log('子组件被重新渲染了')
  return <div>this is span</div>
}, arePropsEqual)

function App() {
  console.log('父组件重新渲染了')
  const [list, setList] = useState([1, 2, 3])
  return (
    <>
      <MemoSon list={list} />
      <button onClick={() => setList([1, 2, 3])}>
        内容一样{JSON.stringify(list)}
      </button>
      <button onClick={() => setList([4, 5, 6])}>
        内容不一样{JSON.stringify(list)}
      </button>
    </>
  )
}

export default App
```
#### forwardRef
`forwardRef` 是 React 提供的一种底层技术,用于在组件渲染时重新绑定 ref 引用,让父组件可以引用子组件的实例,或访问子组件内部的DOM节点。
**用法**
```jsx
const ChildComponent = React.forwardRef((props, ref) => {
  // 使用 ref 访问组件实例或 DOM 节点
  return <div ref={ref}>...</div>
});
```
```jsx
// 在父组件中引用子组件
const ParentComponent = () => {
  const childRef = useRef(null);

  useEffect(() => {
    // 访问子组件实例或 DOM 节点
    console.log(childRef.current);
  }, []);

  return <ChildComponent ref={childRef} />;
}
```
**使用场景**

1. **操作子组件的实例**:通过 ref 获取子组件的实例,调用其方法或访问其成员。
2. **访问子组件内部DOM节点**:获取子组件渲染的DOM元素的引用。
3. **集成第三方库**:一些第三方库需要直接访问组件实例或DOM节点。

**注意事项**

- 不要过度使用`forwardRef`,因为它会增加组件的复杂性,影响可维护性。
- `forwardRef`不能在函数式组件上使用,只能用于类组件或创建高阶组件。
- 如果只需要操作DOM,使用`useRef`钩子获取ref更加方便。

**示例**
```jsx
// 子组件使用 forwardRef
const InputComponent = React.forwardRef((props, ref) => {
  return <input type="text" ref={ref} />;
});

// 父组件获取子组件的 DOM 引用
const ParentComponent = () => {
  const inputRef = useRef(null);

  const focusInput = () => {
    // 访问子组件的实例、DOM节点
    inputRef.current.focus();
  };

  return (
    <div>
      <InputComponent ref={inputRef} />
      <button onClick={focusInput}>Focus Input</button>
    </div>
  );
};
```
在这个例子中,父组件通过`forwardRef`获取了子组件渲染的`input`元素的 DOM 引用。当点击按钮时,可以调用`inputRef.current.focus()`方法来聚焦文本输入框。
### Class API
> 类式组件已过时！！！[Component – React 中文文档](https://zh-hans.react.dev/reference/react/Component)

#### 基础体验
```jsx
// class API
import { Component } from 'react'

class Counter extends Component {
  // 状态变量
  state = {
    count: 0,
  }

  // 事件回调
  clickHandler = () => {
    // 修改状态变量 触发UI组件渲染
    this.setState({
      count: this.state.count + 1,
    })
  }

  // UI模版
  render() {
    return <button onClick={this.clickHandler}>+{this.state.count}</button>
  }
}

function App() {
  return (
    <div>
      <Counter />
    </div>
  )
}

export default App
```
#### 生命周期
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171505947.png)
#### 组件通信
##### 父传子
```jsx
// class API
import { Component } from 'react'

class Son extends Component {
  render() {
    const { count } = this.props
    return <div>this is Son, {count}</div>
  }
}

class App extends Component {
  // 状态变量
  state = {
    count: 0,
  }

  setCount = () => {
    this.setState({
      count: this.state.count + 1,
    })
  }

  // UI模版
  render() {
    return (
      <>
        <Son count={this.state.count} />
        <button onClick={this.setCount}>+</button>
      </>
    )
  }
}

export default App
```
##### 子传父
```jsx
// class API
import { Component } from 'react'

class Son extends Component {
  render() {
    const { msg, onGetSonMsg } = this.props
    return (
      <>
        <div>this is Son, {msg}</div>
        <button onClick={() => onGetSonMsg('this is son msg')}>
          changeMsg
        </button>
      </>
    )
  }
}

class App extends Component {
  // 状态变量
  state = {
    msg: 'this is initail app msg',
  }

  onGetSonMsg = (msg) => {
    this.setState({ msg })
  }

  // UI模版
  render() {
    return (
      <>
        <Son msg={this.state.msg} onGetSonMsg={this.onGetSonMsg} />
      </>
    )
  }
}

export default App
```


## Redux
### 介绍
Redux 是React最常用的集中状态管理工具，类似于Vue中的Pinia（Vuex），可以独立于框架运行
作用：通过集中管理的方式管理应用的状态
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171505216.png)
**为什么要使用Redux？**

1. 独立于组件，无视组件之间的层级关系，简化通信问题
2. 单项数据流清晰，易于定位bug
3. 调试工具配套良好，方便调试
### 快速体验
需求：不和任何框架绑定，不使用任何构建工具，使用纯Redux实现计数器
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171505561.png)
使用步骤：

1. 定义一个 reducer 函数 （根据当前想要做的修改返回一个新的状态）
2. 使用createStore方法传入 reducer函数 生成一个store实例对象
3. 使用store实例的 subscribe方法 订阅数据的变化（数据一旦变化，可以得到通知）
4. 使用store实例的 dispatch方法提交action对象 触发数据变化（告诉reducer你想怎么改数据）
5. 使用store实例的 getState方法 获取最新的状态数据更新到视图中
```html
<button id="decrement">-</button>
<span id="count">0</span>
<button id="increment">+</button>

<script src="https://unpkg.com/redux@latest/dist/redux.min.js"></script>

<script>
  // 定义reducer函数 
  // 内部主要的工作是根据不同的action 返回不同的state
  function counterReducer (state = { count: 0 }, action) {
    switch (action.type) {
      case 'INCREMENT':
        return { count: state.count + 1 }
      case 'DECREMENT':
        return { count: state.count - 1 }
      default:
        return state
    }
  }
  // 使用reducer函数生成store实例
  const store = Redux.createStore(counterReducer)

  // 增
  const inBtn = document.getElementById('increment')
  inBtn.addEventListener('click', () => {
    store.dispatch({
      type: 'INCREMENT'
    })
  })
  // 减
  const dBtn = document.getElementById('decrement')
  dBtn.addEventListener('click', () => {
    store.dispatch({
      type: 'DECREMENT'
    })
  })
</script>
```
### 数据流架构
Redux的难点是理解它对于数据修改的规则, 下图动态展示了在整个数据的修改中，数据的流向
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171505001.png)
为了职责清晰，Redux代码被分为三个核心的概念，学redux，其实就是学这三个核心概念之间的配合，三个概念分别是:

1. state:  一个对象 存放着我们管理的数据
2. action:  一个对象 用来描述你想怎么改数据
3. reducer:  一个函数 根据action的描述更新state
### 环境准备
Redux虽然是一个框架无关可以独立运行的插件，但是社区通常还是把它与React绑定在一起使用，以一个计数器案例体验一下Redux + React 的基础使用
#### 调试工具
Redux官方提供了针对于Redux的调试工具，支持实时state信息展示，action提交信息查看等
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171506556.png)

#### 配套工具
在React中使用redux，官方要求安装俩个其他插件：`Redux Toolkit` 和 `react-redux`

1.  Redux Toolkit（RTK）- 官方推荐编写Redux逻辑的方式，是一套工具的集合集，简化书写方式 
2.  react-redux - 用来 链接 Redux 和 React组件 的中间件 

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171506264.png)
#### 配置基础环境

1. 使用 CRA 快速创建 React 项目
```bash
npx create-react-app react-redux
```

2. 安装配套工具
```bash
npm i @reduxjs/toolkit  react-redux
```

3. 启动项目
```bash
npm run start
```
#### store目录结构设计
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171506517.png)

1.  通常集中状态管理的部分都会单独创建一个单独的 `store` 目录 
2.  应用通常会有很多个子store模块，所以创建一个 `modules` 目录，在内部编写业务分类的子store 
3.  store中的入口文件 `index.js` 的作用是组合modules中所有的子模块，并导出store 
### Redux与React案例
案例：实现计数器
#### 整体路径
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171506931.png)
#### 使用React Toolkit 创建 counterStore
```javascript
import { createSlice } from "@reduxjs/toolkit";

const counterStore = createSlice({
	// 模块名称独一无二
	name: "counter",
	// 初始数据
	initialState: {
		count: 1,
	},
	// 修改数据的同步方法
	reducers: {
		increment(state) {
			state.count++;
		},
		decrement(state) {
			state.count--;
		},
	},
});

// 解构出actionCreater
const { increment, decrement } = counterStore.actions;

// 获取reducer函数
const counterReducer = counterStore.reducer;

// 导出
export { increment, decrement };
export default counterReducer;
```
```javascript
import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./modules/counterStore";

// 创建根store组合子模块
const store = configureStore({
	reducer: {
		// 注册子模块
		counter: counterReducer,
	},
});

export default store;
```
#### 为React注入store
react-redux负责把Redux和React 链接 起来，内置 Provider组件 通过 store 参数把创建好的store实例注入到应用中，链接正式建立
```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// 导入store
import store from "./store";
// 导入store提供组件Provider
import { Provider } from "react-redux";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	// 提供store数据
	<Provider store={store}>
		<App />
	</Provider>
);
```
#### React组件使用store中的数据
在React组件中使用store中的数据，需要用到一个钩子函数`useSelector`，它的作用是把store中的数据映射到组件中，使用样例如下：
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171506407.png)

#### React组件修改store中的数据
React组件中修改store中的数据需要借助另外一个hook函数`useDispatch`，它的作用是生成提交action对象的dispatch函数，使用样例如下：
```jsx
import { useDispatch, useSelector } from "react-redux";
// 导入actionCreator
import { increment, decrement } from "./store/modules/counterStore";
function App() {
  // useSelector:把store中的数据映射到组件中
	const { count } = useSelector(state => state.counter);
  // 得到dispatch函数
	const dispatch = useDispatch();
	return (
		<div>
      {/* 调用dispatch提交action对象 */}
			<button onClick={() => dispatch(decrement())}>-</button>
			{count}
			<button onClick={() => dispatch(increment())}>+</button>
		</div>
	);
}

export default App;
```
### 提交action传参
需求：组件中有俩个按钮 `add to 10` 和 `add to 20` 可以直接把count值修改到对应的数字，目标count值是在组件中传递过去的，需要在提交action的时候传递参数
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171506487.png)
实现方式：在reducers的同步修改方法中添加action对象参数，在调用actionCreater的时候传递参数，参数会被传递到action对象payload属性上
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171506458.png)

### 异步action处理
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171506856.png)
实现步骤

1. 创建store的写法保持不变，配置好同步修改状态的方法
2. 单独封装一个函数，在函数内部return一个新函数，在新函数中
   1. 封装异步请求获取数据
   2. 调用同步actionCreater传入异步数据生成一个action对象，并使用dispatch提交
3. 组件中dispatch的写法保持不变
```javascript
import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const channelStore = createSlice({
	name: "channel",
	initialState: {
		channelList: [],
	},
	reducers: {
		setChannelList(state, action) {
			state.channelList = action.payload;
		},
	},
});

// 创建异步
const { setChannelList } = channelStore.actions;
const url = "http://geek.itheima.net/v1_0/channels";
// 封装一个函数，在函数中return一个新函数，在新函数中封装异步
// 得到数据之后通过dispatch函数 触发修改
const fetchChannelList = () => {
	return async (dispatch) => {
		const res = await axios.get(url);
		dispatch(setChannelList(res.data.data.channels));
	};
};

export { fetchChannelList };

const channelReducer = channelStore.reducer;
export default channelReducer;
```
```javascript
import { configureStore } from "@reduxjs/toolkit";
import channelReducer from "./modules/channelStore";

// 创建根store组合子模块
const store = configureStore({
	reducer: {
		// 注册子模块
		channel: channelReducer,
	},
});

export default store;
```
```jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// 导入actionCreator
import { fetchChannelList } from "./store/modules/channelStore";
function App() {
	// useSelector:把store中的数据映射到组件中
	const { channelList } = useSelector((state) => state.channel);

	// 得到dispatch函数
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(fetchChannelList());
	}, [dispatch]);
	
	return (
		<div>
			<ul>
				{channelList.map((task) => (
					<li key={task.id}>{task.name}</li>
				))}
			</ul>
		</div>
	);
}

export default App;
```
## Router
[React Router6 中文文档 | React Router6 中文文档](https://baimingxuan.github.io/react-router6-doc/)
[ReactRouter6快速上手.md](https://www.yuque.com/attachments/yuque/0/2024/md/32600948/1714046226329-0b3e1e2c-76da-49c4-bd1d-88fbcc1cf93e.md?_lake_card=%7B%22src%22%3A%22https%3A%2F%2Fwww.yuque.com%2Fattachments%2Fyuque%2F0%2F2024%2Fmd%2F32600948%2F1714046226329-0b3e1e2c-76da-49c4-bd1d-88fbcc1cf93e.md%22%2C%22name%22%3A%22ReactRouter6%E5%BF%AB%E9%80%9F%E4%B8%8A%E6%89%8B.md%22%2C%22size%22%3A11636%2C%22ext%22%3A%22md%22%2C%22source%22%3A%22%22%2C%22status%22%3A%22done%22%2C%22download%22%3Atrue%2C%22taskId%22%3A%22udb2f3c03-821e-4c7d-a6bb-81c99a082fd%22%2C%22taskType%22%3A%22upload%22%2C%22type%22%3A%22%22%2C%22__spacing%22%3A%22both%22%2C%22id%22%3A%22ue682333f%22%2C%22margin%22%3A%7B%22top%22%3Atrue%2C%22bottom%22%3Atrue%7D%2C%22card%22%3A%22file%22%7D)
### 环境准备
```shell
npm create vite@latest
【键入工程名】
【选择react项目】
【选择语言模板】
```
```powershell
npm i
npm i react-router-dom
```
```shell
npm run dev
```
### 快速上手
![需求说明](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171506418.png "需求说明")
![文件目录结构](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171506485.png "文件目录结构")

```jsx
const Article = () => {
	return <div>我是文章页</div>;
};

export default Article;
```
```jsx
const Login = () => {
	return <div>我是登录页</div>;
};

export default Login;
```
```jsx
import Login from "../page/Login";
import Article from "../page/Article";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
	{
		path: "/login",
		element: <Login />,
	},
	{
		path: "/article",
		element: <Article />,
	},
]);

export default router;
```
```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
// 1.创建router实例对象并配置路由对应关系
import router from "./router";
ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		{/* 2.路由绑定 */}
		<RouterProvider router={router}></RouterProvider>
	</React.StrictMode>
);
```
### 路由懒加载
#### router/index.jsx
```jsx
import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
```
```jsx
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
```
```jsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <About />
          </Suspense>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Dashboard />
          </Suspense>
        ),
      },
    ],
  },
]);
```
#### main.jsx
```jsx
import { Fragment } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
// 1.创建router实例对象并配置路由对应关系
import router from "./router";
ReactDOM.createRoot(document.getElementById("root")).render(
	// RouterProvider标签外面必须包一层东西
	// Fragment作用是替换空标签<></>
	<Fragment>
		{/* 2.路由绑定 */}
		<RouterProvider router={router}></RouterProvider>
	</Fragment>
);
```
### 路由导航
路由系统中的多个路由之间需要进行路由跳转，并且在跳转的同时有可能需要传递参数进行通信
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171506558.png)

#### 声明式导航
声明式导航是指通过在模版中通过 `<Link/>` 组件描述出要跳转到哪里去，比如后台管理系统的左侧菜单通常使用这种方式进行

`<Link to="/article">文章</Link>`
语法说明：通过给组件的to属性指定要跳转到路由path，组件会被渲染为浏览器支持的a链接，如果需要传参直接通过字符串拼接的方式拼接参数即可

#### 编程式导航
编程式导航是指通过 `useNavigate` 钩子得到导航方法，然后通过调用方法以命令式的形式进行路由跳转，比如想在登录请求完毕之后跳转就可以选择这种方式，更加灵活
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171507297.png)
语法说明：通过调用`navigate`方法传入地址path实现跳转

#### 导航传参

 ![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171507570.png)

##### searchParams传参
```jsx
import { useNavigate } from "react-router-dom";

const Login = () => {
	const navigate = useNavigate();
	return (
		<div>
			<button onClick={() => navigate('/article?id=1001&name=jack')}>跳转到“文章”页(searchParams传参)</button>
		</div>
	)
};

export default Login;
```
```jsx
import Login from "../page/Login";
import Article from "../page/Article";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
	{
		path: "/login",
		element: <Login />,
	},
	{
		path: "/article",
		element: <Article />,
	},
]);

export default router;
```
```jsx
import { useSearchParams } from "react-router-dom";

const Article = () => {
	const [params] = useSearchParams();
	let id = params.get('id')
	let name = params.get('name')
	return (
		<div>我是文章页{id}-{name}</div>
	)
};

export default Article;
```
##### params传参
```jsx
import { useNavigate } from "react-router-dom";

const Login = () => {
	const navigate = useNavigate();
	return (
		<div>
			<button onClick={() => navigate('/article/1002/Marry')}>跳转到“文章”页(params传参)</button>
		</div>
	)
};

export default Login;
```
```jsx
import Login from "../page/Login";
import Article from "../page/Article";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
	{
		path: "/login",
		element: <Login />,
	},
	{
		path: "/article/:id/:name",
		element: <Article />,
	},
]);

export default router;
```
```jsx
import { useParams } from "react-router-dom";

const Article = () => {
	const params = useParams();
	let id = params.id;
	let name = params.name;
	return (
		<div>我是文章页{id}-{name}</div>
	)
};

export default Article;
```
### 嵌套路由
#### 概念
在一级路由中又内嵌了其他路由，这种关系就叫做嵌套路由，嵌套至一级路由内的路由又称作二级路由
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171508067.png)

#### 嵌套路由配置
实现步骤

1. 使用`children`属性配置路由嵌套关系  
2. 使用`<Outlet/>`组件配置二级路由渲染位置

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171508913.png)
```jsx
import { Link, Outlet } from "react-router-dom";

const Layout = () => {
	return (
		<div>
			我是Layout页面(一级)
			<Link to="/board">面板(二级)</Link>
			<Link to="/about">关于(二级)</Link>
            
			{/* 二级路由出口 */}
			<Outlet />
		</div>
	);
};

export default Layout;
```
```jsx
import Layout from "../page/Layout";
import Board from "../page/Board";
import About from "../page/About";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
	{
		path: '/',
		element: <Layout />,
		children: [
			{
				path: 'board',
				element: <Board />
			},
			{
				path: 'about',
				element: <About />
			}
		]
	}
]);

export default router;
```
#### 默认二级路由
当访问的是一级路由时，默认的二级路由组件可以得到渲染，只需要在二级路由的位置去掉`path`，设置`index`属性为`true`
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171508338.png)

#### 404路由配置
场景：当浏览器输入url的路径在整个路由配置中都找不到对应的 `path`，为了用户体验，可以配置兜底组件渲染
实现步骤：

1. 准备一个NotFound组件
2. 在路由表数组的末尾，以`*`号作为路由`path`配置路由

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171508873.png)
#### 2种路由模式
各个主流框架的路由常用的路由模式有俩种，history模式和hash模式, ReactRouter分别由 `createBrowerRouter` 和 `createHashRouter` 函数负责创建

| 路由模式 | url表现 | 底层原理 | 是否需要后端支持 |
| --- | --- | --- | --- |
| history | url/login | history对象 + pushState事件 | 需要 |
| hash | url/#/login | 监听hashChange事件 | 不需要 |

## Zustand
[ZUSTAND 中文文档 | ZUSTAND](https://awesomedevin.github.io/zustand-vue/)
### 快速上手
安装依赖：`npm i zustand`
```jsx
import { create } from "zustand";

const useStore = create((set) => {
	return {
		count: 1,
		inc: () => {
			set((state) => ({ count: state.count + 1 }));
		},
		dec: () => {
			set((state) => ({ count: state.count - 1 }));
		},
	};
});

export default useStore;
```
```jsx
import useCounterStore from "./store/useCounterStore";

function App() {
	const { count, inc, dec } = useCounterStore();
	return (
		<div>
			<button onClick={dec}>-</button>
			{count}
			<button onClick={inc}>+</button>
		</div>
	);
}

export default App;
```
### 异步支持
对于异步操作的支持不需要特殊的操作，直接在函数中编写异步逻辑，最后把接口的数据放到set函数中返回即可
```jsx
import { create } from "zustand";

const URL = "http://geek.itheima.net/v1_0/channels";

const useChannelStore = create((set) => {
	return {
		channelList: [],
		fetchChannelList: async () => {
			const res = await fetch(URL);
			const jsonData = await res.json();
			set({ channelList: jsonData.data.channels });
		},
	};
});

export default useChannelStore;
```
```jsx
import { useEffect } from "react";
import useChannelStore from "./store/useChannelStore";

function App() {
	const { channelList, fetchChannelList } = useChannelStore();

	useEffect(() => {
		fetchChannelList();
	}, [fetchChannelList]);
	return (
		<div>
			<ul>
				{channelList.map((item) => (
					<li key={item.id}>{item.name}</li>
				))}
			</ul>
		</div>
	);
}

export default App;
```
### 切片模式
切片模式(Slice Pattern)是一种组织和模块化状态管理逻辑的方式,它可以更好地将复杂的状态划分为多个独立的"切片"。这种模式有助于提高代码的可维护性、可重用性和可测试性。
```jsx
const URL = "http://geek.itheima.net/v1_0/channels";

const useChannelStore = (set) => {
	return {
		channelList: [],
		fetchChannelList: async () => {
			const res = await fetch(URL);
			const jsonData = await res.json();
			set({ channelList: jsonData.data.channels });
		},
	};
};

export default useChannelStore;

```
```jsx
const useCounterStore = (set) => {
	return {
		count: 1,
		inc: () => {
			set((state) => ({ count: state.count + 1 }));
		},
		dec: () => {
			set((state) => ({ count: state.count - 1 }));
		},
	};
};

export default useCounterStore;
```
```jsx
import { create } from "zustand";

import useCounterStore from "./useCounterStore";
import useChannelStore from "./useChannelStore";

const useStore = create((set, get) => ({
	...useCounterStore(set, get),
	...useChannelStore(set, get),
}));

export default useStore;
```
### 对接DevTools
> 简单的调试我们可以安装一个 名称为 simple-zustand-devtools 的调试工具

1. 安装

`npm i simple-zustand-devtools -D`

2. 配置
```jsx
import create from 'zustand'

// 导入核心方法
import { mountStoreDevtool } from 'simple-zustand-devtools'

// 省略部分代码...


// 开发环境开启调试
if (process.env.NODE_ENV === 'development') {
  mountStoreDevtool('channelStore', useChannelStore)
}


export default useChannelStore
```

3. 使用

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171508204.png)
## React&TypeScript
### useState
#### 简单场景
> 简单场景下，可以使用TS的自动推断机制，不用特殊编写类型注解，运行良好

```typescript
const [val, toggle] = React.useState(false)

// `val` 会被自动推断为布尔类型
// `toggle` 方法调用时只能传入布尔类型
```
#### 复杂场景
> 复杂数据类型，useState支持通过`泛型参数`指定初始参数类型以及setter函数的入参类型

```typescript
type User = {
  name: string
  age: number
}
const [user, setUser] = React.useState<User>({
  name: 'jack',
  age: 18
})
// 执行setUser
setUser(newUser)
// 这里newUser对象只能是User类型
```
#### 没有具体默认值
> 实际开发时，有些时候useState的初始值可能为null或者undefined，按照泛型的写法是不能通过类型校验的，此时可以通过完整的类型联合null或者undefined类型即可

```typescript
type User = {
  name: string
  age: number
}
const [user, setUser] = React.useState<User>(null)
// 上面会类型错误，因为null并不能分配给User类型

const [user, setUser] = React.useState<User | null>(null)
// 上面既可以在初始值设置为null，同时满足setter函数setUser的参数可以是具体的User类型

return (
  <div>
  {user?.name} {user?.age}
  </div>
)
```
### useRef
> 在TypeScript的环境下，`useRef` 函数返回一个`只读` 或者 `可变` 的引用
> 只读的场景：常见于获取真实dom；
> 可变的场景：常见于缓存一些数据，不跟随组件渲染；

下面分俩种情况说明：
#### 获取DOM
> 获取DOM时，通过泛型参数指定具体的DOM元素类型即可

```tsx
function Foo() {
  // 尽可能提供一个具体的dom type, 可以帮助我们在用dom属性时有更明确的提示
  // divRef的类型为 RefObject<HTMLDivElement>
  const inputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current.focus()
  })

  return <div ref={inputRef}>etc</div>
}
```
如果你可以确保`divRef.current` 不是null，也可以在传入初始值的位置
```typescript
// 添加非null标记
const divRef = useRef<HTMLDivElement>(null!)
// 不再需要检查`divRef.current` 是否为null
doSomethingWith(divRef.current)
```
#### 稳定引用存储器
> 当做为可变存储容器使用的时候，可以通过`泛型参数`指定容器存入的数据类型, 在还未存入实际内容时通常把`null`作为初始值，所以依旧可以通过联合类型做指定

```tsx
interface User {
  age: number
}

function App(){
  const timerRef = useRef<number | undefined>(undefined)
  const userRes = useRef<User | null> (null)
  useEffect(()=>{
    timerRef.current = window.setInterval(()=>{
      console.log('测试')
    },1000)
    
    
    return ()=>clearInterval(timerRef.current)
  })
  return <div> this is app</div>
}
```
### Props
#### 为Props添加类型
> props作为React组件的参数入口，添加了类型之后可以限制参数输入以及在使用props有良好的类型提示

##### interface
```tsx
interface Props {
  className: string
}

export const Button = (props:Props)=>{
  const { className } = props
  return <button className={ className }>Test</button>
}
```
##### Type
```tsx
type Props =  {
  className: string
}

export const Button = (props:Props)=>{
  const { className } = props
  return <button className={ className }>Test</button>
}
```
#### 为Props的children属性添加类型
> children属性和props中其他的属性不同，它是React系统中内置的，其它属性我们可以自由控制其类型，children属性的类型最好由React内置的类型提供，兼容多种类型

```tsx
type Props = {
  children: React.ReactNode
}

export const Button = (props: Props)=>{
   const { children } = props
   return <button>{ children }</button>
}
```
**说明：**React.ReactNode是一个React内置的联合类型，包括 `React.ReactElement` 、`string`、`numberReact.ReactFragment` 、`React.ReactPortal` 、`boolean`、 `null` 、`undefined`
#### 为事件prop添加类型
```tsx
// 定义 Props 接口，用于描述 Son 组件的 props 结构
interface Props {
  // onGetMsg 是一个可选的回调函数，接收一个字符串参数，并没有返回值
  onGetMsg?: (msg: string) => void;
}

// 子组件 Son
function Son(props: Props) {
  // 从 props 中解构出 onGetMsg 方法
  const { onGetMsg } = props;

  // 点击事件处理函数
  const clickHandler = () => {
    // 调用父组件传递过来的 onGetMsg 方法，并传递字符串参数
    onGetMsg?.("this is message!");
  };

  // 返回一个按钮，点击按钮时触发 clickHandler 函数
  return <button onClick={clickHandler}>sendMsg</button>;
}

// 父组件 App
function App() {
  // 定义一个处理接收消息的函数，打印消息到控制台
  const getMsgHandler = (msg: string) => {
    console.log(msg);
  };

  // 返回两个 Son 组件，分别传递不同的 onGetMsg 回调函数
  return (
    <>
      {/* 传递一个内联函数作为 onGetMsg 回调 */}
      <Son onGetMsg={(msg) => console.log(msg)} />

      {/* 传递一个外部定义的函数作为 onGetMsg 回调 */}
      <Son onGetMsg={getMsgHandler} />
    </>
  );
}

export default App;
```
#### 为事件handle添加类型
> 为事件回调添加类型约束需要使用React内置的泛型函数来做，比如最常见的鼠标点击事件和表单输入事件

```tsx
function App(){
  const changeHandler: React.ChangeEventHandler<HTMLInputElement> = (e)=>{
    console.log(e.target.value)
  }
  
  const clickHandler: React.MouseEventHandler<HTMLButtonElement> = (e)=>{
    console.log(e.target)
  }

  return (
    <>
      <input type="text" onChange={ changeHandler }/>
      <button onClick={ clickHandler }> click me!</button>
    </>
  )
}
```

## Ant Design
[组件总览 - Ant Design](https://ant-design.antgroup.com/components/overview-cn)

## Ant Design Mobile
### 主题定制
[主题 - Ant Design Mobile](https://ant-design-mobile.antgroup.com/zh/guide/theming)
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/web/react/202406171508031.png)
```javascript
import {Button} from "antd-mobile";

const Layout = () => {
    return (
        <div>
            {/* 测试样式配置 */}
            <div className="purple-theme">
                // 紫色 
                <Button color={"primary"}>局部测试</Button>	
            </div>
            // 绿色
            <Button color={"primary"}>测试</Button>
        </div>
    )
}

export default Layout;
```
```css
/*全局定制*/
:root:root {
    --adm-color-primary: rgb(105, 174, 120);;
}
/*局部定制*/
.purple-theme {
    --adm-color-primary: purple;
}
```
```javascript
import './theme.css'
```

