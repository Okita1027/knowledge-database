---
title: 基础篇
shortTitle: 基础篇
description: 
date: 2024-06-16 21:17:22
categories: [开发工具]
tags: [Maven]
---
## 安装配置
```xml
<localRepository>F:\maven-repository</localRepository>

<mirror>
  <id>aliyunmaven</id>
  <mirrorOf>*</mirrorOf>
  <name>阿里云公共仓库</name>
  <url>https://maven.aliyun.com/repository/public</url>
</mirror>

<profile>
  <id>jdk-17</id>
  <activation>
    <activeByDefault>true</activeByDefault>
    <jdk>17</jdk>
  </activation>
  <properties>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
    <maven.compiler.compilerVersion>17</maven.compiler.compilerVersion>
  </properties>
</profile>
```
## 依赖范围
标签的位置：dependencies/dependency/**scope**
标签的可选值：**compile**/**test**/**provided**/system/runtime/**import**
#### compile 和 test 对比
|  | **main目录（空间）** | **test目录（空间）** | **开发过程（时间）** | **部署到服务器（时间）** |
| --- | --- | --- | --- | --- |
| compile | 有效 | 有效 | 有效 | 有效 |
| test | 无效 | 有效 | 有效 | 无效 |

#### compile 和 provided 对比
|  | **main目录（空间）** | **test目录（空间）** | **开发过程（时间）** | **部署到服务器（时间）** |
| --- | --- | --- | --- | --- |
| compile | 有效 | 有效 | 有效 | 有效 |
| provided | 有效 | 有效 | 有效 | 无效 |

#### 结论
compile：通常使用的第三方框架的 jar 包这样在项目实际运行时真正要用到的 jar 包都是以 compile 范围进行依赖的。比如 SSM 框架所需jar包。
test：测试过程中使用的 jar 包，以 test 范围依赖进来。比如 junit。
provided：在开发过程中需要用到的“服务器上的 jar 包”通常以 provided 范围依赖进来。比如 servlet-api、jsp-api。而这个范围的 jar 包之所以不参与部署、不放进 war 包，就是避免和服务器上已有的同类 jar 包产生冲突，同时减轻服务器的负担。说白了就是：“**服务器上已经有了，你就别带啦！**”
### 依赖的传递性
#### 概念
A 依赖 B，B 依赖 C，那么在 A 没有配置对 C 的依赖的情况下，A 里面能不能直接使用 C？
#### 传递的原则
在 A 依赖 B，B 依赖 C 的前提下，C 是否能够传递到 A，取决于 B 依赖 C 时使用的依赖范围。

- B 依赖 C 时使用 compile 范围：可以传递
- B 依赖 C 时使用 test 或 provided 范围：不能传递，所以需要这样的 jar 包时，就必须在需要的地方明确配置依赖才可以。
### 依赖的排除
#### 1、概念
当 A 依赖 B，B 依赖 C 而且 C 可以传递到 A 的时候，A 不想要 C，需要在 A 里面把 C 排除掉。而往往这种情况都是为了避免 jar 包之间的冲突。
![](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/tool/maven/202406171441585.png)
所以配置依赖的排除其实就是阻止某些 jar 包的传递。因为这样的 jar 包传递过来会和其他 jar 包冲突。
当 A 依赖 B，B 依赖 C 而且 C 可以传递到 A 的时候，A 不想要 C，需要在 A 里面把 C 排除掉。而往往这种情况都是为了避免 jar 包之间的冲突。
![](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/tool/maven/202406171442484.png)
所以配置依赖的排除其实就是阻止某些 jar 包的传递。因为这样的 jar 包传递过来会和其他 jar 包冲突。

#### 2、配置方式
```xml
<dependency>
  <groupId>com.atguigu.maven</groupId>
  <artifactId>pro01-maven-java</artifactId>
  <version>1.0-SNAPSHOT</version>
  <scope>compile</scope>
  <!-- 使用excludes标签配置依赖的排除    -->
  <exclusions>
    <!-- 在exclude标签中配置一个具体的排除 -->
    <exclusion>
      <!-- 指定要排除的依赖的坐标（不需要写version） -->
      <groupId>commons-logging</groupId>
      <artifactId>commons-logging</artifactId>
    </exclusion>
  </exclusions>
</dependency>
```
#### 3、测试
测试的方式：在 pro02-maven-web 工程中配置对 commons-logging 的排除
```xml
<dependency>
  <groupId>com.atguigu.maven</groupId>
  <artifactId>pro01-maven-java</artifactId>
  <version>1.0-SNAPSHOT</version>
  <scope>compile</scope>
  <!-- 使用excludes标签配置依赖的排除    -->
  <exclusions>
    <!-- 在exclude标签中配置一个具体的排除 -->
    <exclusion>
      <!-- 指定要排除的依赖的坐标（不需要写version） -->
      <groupId>commons-logging</groupId>
      <artifactId>commons-logging</artifactId>
    </exclusion>
  </exclusions>
</dependency>
```
### 继承
#### 1、概念
Maven工程之间，A 工程继承 B 工程

- B 工程：父工程
- A 工程：子工程

本质上是 A 工程的 pom.xml 中的配置继承了 B 工程中 pom.xml 的配置。
#### 2、作用
在父工程中统一管理项目中的依赖信息，具体来说是管理依赖信息的版本。
它的背景是：

- 对一个比较大型的项目进行了模块拆分。
- 一个 project 下面，创建了很多个 module。
- 每一个 module 都需要配置自己的依赖信息。

它背后的需求是：

- 在每一个 module 中各自维护各自的依赖信息很容易发生出入，不易统一管理。
- 使用同一个框架内的不同 jar 包，它们应该是同一个版本，所以整个项目中使用的框架版本需要统一。
- 使用框架时所需要的 jar 包组合（或者说依赖信息组合）需要经过长期摸索和反复调试，最终确定一个可用组合。这个耗费很大精力总结出来的方案不应该在新的项目中重新摸索。

通过在父工程中为整个项目维护依赖信息的组合既**保证了整个项目使用规范、准确的 jar 包**；又能够将**以往的经验沉淀**下来，节约时间和精力。
#### 3、举例
在一个工程中依赖多个 Spring 的 jar 包
TIP
[INFO] +- org.springframework:**spring-core**:jar:**4.0.0**.RELEASE:compile [INFO] | - commons-logging:commons-logging:jar:1.1.1:compile [INFO] +- org.springframework:**spring-beans**:jar:**4.0.0**.RELEASE:compile [INFO] +- org.springframework:**spring-context**:jar:**4.0.0**.RELEASE:compile [INFO] +- org.springframework:**spring-expression**:jar:4.0.0.RELEASE:compile [INFO] +- org.springframework:**spring-aop**:jar:**4.0.0**.RELEASE:compile [INFO] | - aopalliance:aopalliance:jar:1.0:compile
使用 Spring 时要求所有 Spring 自己的 jar 包版本必须一致。为了能够对这些 jar 包的版本进行统一管理，我们使用继承这个机制，将所有版本信息统一在父工程中进行管理。
#### 4、操作
##### 创建父工程
创建的过程和前面创建 pro01-maven-java 一样。
工程名称：pro03-maven-parent
工程创建好之后，要修改它的打包方式：
```xml
<groupId>com.atguigu.maven</groupId>
<artifactId>pro03-maven-parent</artifactId>
<version>1.0-SNAPSHOT</version>

<!-- 当前工程作为父工程，它要去管理子工程，所以打包方式必须是 pom -->
<packaging>pom</packaging>
```
只有打包方式为 pom 的 Maven 工程能够管理其他 Maven 工程。打包方式为 pom 的 Maven 工程中不写业务代码，它是专门管理其他 Maven 工程的工程。
##### 创建模块工程
模块工程类似于 IDEA 中的 module，所以需要**进入 pro03-maven-parent 工程的根目录**，然后运行 mvn archetype:generate 命令来创建模块工程。
假设，我们创建三个模块工程：
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/tool/maven/202406171444860.png)

##### 查看被添加新内容的父工程 pom.xml
下面 modules 和 module 标签是聚合功能的配置
```xml
<modules>  
  <module>pro04-maven-module</module>
  <module>pro05-maven-module</module>
  <module>pro06-maven-module</module>
</modules>
```
##### 解读子工程的pom.xml
```xml
<!-- 使用parent标签指定当前工程的父工程 -->
<parent>
  <!-- 父工程的坐标 -->
  <groupId>com.atguigu.maven</groupId>
  <artifactId>pro03-maven-parent</artifactId>
  <version>1.0-SNAPSHOT</version>
</parent>

<!-- 子工程的坐标 -->
<!-- 如果子工程坐标中的groupId和version与父工程一致，那么可以省略 -->
<!-- <groupId>com.atguigu.maven</groupId> -->
<artifactId>pro04-maven-module</artifactId>
<!-- <version>1.0-SNAPSHOT</version> -->
```
##### 在父工程中配置依赖的统一管理
```xml
<!-- 使用dependencyManagement标签配置对依赖的管理 -->
<!-- 被管理的依赖并没有真正被引入到工程 -->
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-core</artifactId>
      <version>4.0.0.RELEASE</version>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-beans</artifactId>
      <version>4.0.0.RELEASE</version>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-context</artifactId>
      <version>4.0.0.RELEASE</version>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-expression</artifactId>
      <version>4.0.0.RELEASE</version>
    </dependency>
    <dependency>
      <groupId>org.springframework</groupId>
      <artifactId>spring-aop</artifactId>
      <version>4.0.0.RELEASE</version>
    </dependency>
  </dependencies>
</dependencyManagement>
```
##### 子工程中引用那些被父工程管理的依赖
关键点：省略版本号
```xml
<!-- 子工程引用父工程中的依赖信息时，可以把版本号去掉。  -->
<!-- 把版本号去掉就表示子工程中这个依赖的版本由父工程决定。 -->
<!-- 具体来说是由父工程的dependencyManagement来决定。 -->
<dependencies>
  <dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-beans</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-expression</artifactId>
  </dependency>
  <dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-aop</artifactId>
  </dependency>
</dependencies>
```
##### 在父工程中升级依赖信息的版本
```xml
<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-beans</artifactId>
  <version>4.1.4.RELEASE</version>
</dependency>
```
然后在子工程中运行mvn dependency:list，效果如下：
TIP
[INFO] org.springframework:spring-aop:jar:4.1.4.RELEASE:compile [INFO] org.springframework:spring-core:jar:4.1.4.RELEASE:compile [INFO] org.springframework:spring-context:jar:4.1.4.RELEASE:compile [INFO] org.springframework:spring-beans:jar:4.1.4.RELEASE:compile [INFO] org.springframework:spring-expression:jar:4.1.4.RELEASE:compile
##### 在父工程中声明自定义属性
```xml
<!-- 通过自定义属性，统一指定Spring的版本 -->
<properties>
  <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>

  <!-- 自定义标签，维护Spring版本数据 -->
  <atguigu.spring.version>4.3.6.RELEASE</atguigu.spring.version>
</properties>
```
在需要的地方使用${}的形式来引用自定义的属性名：
```xml
<dependency>
  <groupId>org.springframework</groupId>
  <artifactId>spring-core</artifactId>
  <version>${atguigu.spring.version}</version>
</dependency>
```
真正实现“一处修改，处处生效”。
#### 实际意义
![](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/tool/maven/202406171444872.jpeg)
编写一套符合要求、开发各种功能都能正常工作的依赖组合并不容易。如果公司里已经有人总结了成熟的组合方案，那么再开发新项目时，如果不使用原有的积累，而是重新摸索，会浪费大量的时间。为了提高效率，我们可以使用工程继承的机制，让成熟的依赖组合方案能够保留下来。
如上图所示，公司级的父工程中管理的就是成熟的依赖组合方案，各个新项目、子系统各取所需即可。

### 聚合
#### 聚合本身的含义
部分组成整体
![](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/tool/maven/202406171444265.jpeg)
动画片《神兽金刚》中的经典台词：“我来组成头部！我来组成手臂！”就是聚合关系最生动的体现。
#### Maven 中的聚合
使用一个“总工程”将各个“模块工程”汇集起来，作为一个整体对应完整的项目。

- 项目：整体
- 模块：部分

**TIP**
概念的对应关系：
从继承关系角度来看：

- 父工程
- 子工程

从聚合关系角度来看：

- 总工程
- 模块工程
#### 好处

- 一键执行 Maven 命令：很多构建命令都可以在“总工程”中一键执行。以 mvn install 命令为例：Maven 要求有父工程时先安装父工程；有依赖的工程时，先安装被依赖的工程。我们自己考虑这些规则会很麻烦。但是工程聚合之后，在总工程执行 mvn install 可以一键完成安装，而且会自动按照正确的顺序执行。
- 配置聚合之后，各个模块工程会在总工程中展示一个列表，让项目中的各个模块一目了然。
#### 聚合的配置
在总工程中配置 modules 即可：
```xml
<modules>  
  <module>pro04-maven-module</module>
  <module>pro05-maven-module</module>
  <module>pro06-maven-module</module>
</modules>
```
#### 依赖循环问题
如果 A 工程依赖 B 工程，B 工程依赖 C 工程，C 工程又反过来依赖 A 工程，那么在执行构建操作时会报下面的错误：
DANGER
[ERROR] [ERROR] The projects in the reactor contain a cyclic reference:
这个错误的含义是：循环引用。
