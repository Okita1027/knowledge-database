---
title: YAML
shortTitle: YAML
description: 
date: 2024-06-16 22:00:58
categories: []
tags: [YAML]
---
## YAML简介
YAML（YAML Ain't Markup Language），一种数据序列化格式。具有容易阅读、容易与脚本语言交互、以数据为核心，重数据轻格式的特点。
常见的文件扩展名有两种：

-  .yml格式（主流） 
-  .yaml格式
## 基本使用
常见的数据书写格式
```yaml
boolean: TRUE  						#TRUE,true,True,FALSE,false，False均可
float: 3.14    						#6.8523015e+5  #支持科学计数法
int: 123       						#0b1010_0111_0100_1010_1110    #支持二进制、八进制、十六进制
null: ~        						#使用~表示null
string: HelloWorld      			#字符串可以直接书写
string2: "Hello World"  			#可以使用双引号包裹特殊字符
date: 2018-02-17        			#日期必须使用yyyy-MM-dd格式
datetime: 2018-02-17T15:02:31+08:00  #时间和日期之间使用T连接，最后使用+代表时区
```
yaml格式中也可以表示数组，在属性名书写位置的下方使用减号作为数据开始符号，每行书写一个数据，减号与数据间空格分隔。
```yaml
subject:
	- Java
	- 前端
	- 大数据
enterprise:
	name: itcast
    age: 16
    subject:
    	- Java
        - 前端
        - 大数据
likes: [王者荣耀,刺激战场]			#数组书写缩略格式
users:							 #对象数组格式一
  - name: Tom
   	age: 4
  - name: Jerry
    age: 5
users:							 #对象数组格式二
  -  
    name: Tom
    age: 4
  -   
    name: Jerry
    age: 5			    
users2: [ { name:Tom , age:4 } , { name:Jerry , age:5 } ]	#对象数组缩略格式
```
```yaml
person:
  ## 单引号：输出 \n
  ## 双引号：输出 换行
  userName: '名字\n'
  boss: false
  birth: 2002/10/27
  age: 19
  pet:
    name: 喵喵
    weight: 10.50
  interests: [ 游戏,音乐 ]
  ##  animal: [猫,狗]
  animal:
    - 猫
    - 狗
  score:
    语文:
      first: 99
    数学:
      second: 88
    英语:
      third: 77
  salarys: [ 10000,20000,30000 ]
  allPets:
    dog:
      - { name: 二哈,weight: 12.3 }
      - { name: 旺财,weight: 32.1 }
    cat: [ { name: 小猫,weight: 5.5 },{ name: 大猫,weight: 10.5 } ]
```
**总结**

1. yaml语法规则 
   - 大小写敏感
   - 属性层级关系使用多行描述，每行结尾使用冒号结束
   - 使用缩进表示层级关系，同层级左侧对齐，只允许使用空格（不允许使用Tab键）
   - 属性值前面添加空格（属性名与属性值之间使用冒号+空格作为分隔）
   - #号表示注释
2. 注意属性名冒号后面与数据之间有一个**空格**
3. 字面值、对象数据格式、数组数据格式
## 数据引用
使用引用格式来定义数据
```yaml
baseDir: /usr/local/fire ## 相当于定义变量
center:
    dataDir: ${baseDir}/data
    tmpDir: ${baseDir}/tmp
    logDir: ${baseDir}/log
    msgDir: ${baseDir}/msgDir
```
注意：在书写字符串时，如果需要使用转义字符，需要将数据字符串使用双引号包裹起来
```yaml
lesson: "Spring\tboot\nlesson"
```
