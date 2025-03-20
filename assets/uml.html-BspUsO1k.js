import{_ as d}from"./plugin-vue_export-helper-DlAUqK2U.js";import{r as i,c as t,d as l,b as n,a as e,e as a,o}from"./app-CJZ--YWM.js";const c={},r=n('<h2 id="uml图" tabindex="-1"><a class="header-anchor" href="#uml图"><span>UML图</span></a></h2><p>统一建模语言（Unified Modeling Language，UML）是用来设计软件的可视化建模语言。它的特 点是简单、统一、图形化、能表达软件设计中的动态与静态信息。<br> UML 从目标系统的不同角度出发，定义了用例图、类图、对象图、状态图、活动图、时序图、协作图、构件图、部署图等 9 种图。</p><h2 id="类图" tabindex="-1"><a class="header-anchor" href="#类图"><span>类图</span></a></h2><h3 id="概述" tabindex="-1"><a class="header-anchor" href="#概述"><span>概述</span></a></h3><p>类图(Class diagram)是显示了模型的静态结构，特别是模型中存在的类、类的内部结构以及它们与其他类的关系等。类图不显示暂时性的信息。类图是面向对象建模的主要组成部分。</p><h3 id="作用" tabindex="-1"><a class="header-anchor" href="#作用"><span>作用</span></a></h3><ul><li>在软件工程中，类图是一种静态的结构图，描述了系统的类的集合，类的属性和类之间的关系，可以简化人们对系统的理解；</li><li>类图是系统分析和设计阶段的重要产物，是系统编码和测试的重要模型。</li></ul><h3 id="类的表示方式" tabindex="-1"><a class="header-anchor" href="#类的表示方式"><span>类的表示方式</span></a></h3><p>在UML类图中，类使用包含类名、属性(field) 和方法(method) 且带有分割线的矩形来表示，比如 下图表示一个Employee类，它包含name,age和address这3个属性，以及work()方法。</p>',9),h=n('<p>属性/方法名称前加的加号和减号表示了这个属性/方法的可见性，UML类图中表示可见性的符号有四种：</p><ul><li>+：<code>public</code></li><li>-：<code>private</code></li><li>#：<code>protected</code></li><li>~：<code>default</code></li></ul><p>属性的完整表示方式是： **可见性 名称 ：类型 [ = 缺省值] **<br> 方法的完整表示方式是： **可见性 名称(参数列表) [ ： 返回类型] **<br> 其它修饰符：</p><ul><li>_斜体：_表示 抽象类/方法</li><li>下换线：表示 静态类/方法</li></ul><p>注意：</p><ol><li>中括号中的内容表示是可选的</li><li>也有将类型放在变量名前面，返回值类型放在方法名前面</li></ol><h3 id="类与类之间关系的表示方式" tabindex="-1"><a class="header-anchor" href="#类与类之间关系的表示方式"><span>类与类之间关系的表示方式</span></a></h3><p>关联关系是对象之间的一种引用关系，用于表示一类对象与另一类对象之间的联系，如老师和学生、师傅和徒弟、丈夫和妻子等。关联关系是类与类之间最常用的一种关系，分为一般关联关系、聚合关系和组合关系。<br> 关联又可以分为单向关联，双向关联，自关联。</p><h4 id="关联关系" tabindex="-1"><a class="header-anchor" href="#关联关系"><span>关联关系</span></a></h4><h5 id="单向关联" tabindex="-1"><a class="header-anchor" href="#单向关联"><span>单向关联</span></a></h5>',10),p=e("p",null,"在UML类图中单向关联用一个带箭头的实线表示。上图表示每个顾客都有一个地址，这通过让Customer类持有一个类型为Address的成员变量类实现。",-1),m=e("h5",{id:"双向关联",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#双向关联"},[e("span",null,"双向关联")])],-1),u=n('<p>双向关联就是双方各自持有对方类型的成员变量。<br> 在UML类图中，双向关联用一个不带箭头的直线表示。</p><p>上图中在<code>Customer</code>类中维护一个 <code>List&lt;Product&gt;</code> ，表示一个顾客可以购买多个商品；<br> 在<code>Product</code>类中维护一个<code>Customer</code>类型的成员变量表示这个产品被哪个顾客所购买。</p><h5 id="自关联" tabindex="-1"><a class="header-anchor" href="#自关联"><span>自关联</span></a></h5>',3),U=e("p",null,"自关联在UML类图中用一个带有箭头且指向自身的线表示。上图的意思就是Node类包含类型为Node的成员变量，也就是“自己包含自己”。",-1),L=e("h4",{id:"聚合关系",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#聚合关系"},[e("span",null,"聚合关系")])],-1),k=e("p",null,[a("聚合关系是关联关系的一种，是强关联关系，是整体和部分之间的关系。"),e("br"),a(" 聚合关系也是通过成员对象来实现的，其中成员对象是整体对象的一部分，但是成员对象可以脱离整体 对象而独立存在。例如，学校与老师的关系，学校包含老师，但如果学校停办了，老师依然存在。 在 UML 类图中，聚合关系可以用带空心菱形的实线来表示，菱形指向整体。"),e("br"),a(" 下图所示是大学和教师的关系图：")],-1),M=e("h4",{id:"组合关系",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#组合关系"},[e("span",null,"组合关系")])],-1),_=e("p",null,[a("组合表示类之间的整体与部分的关系，但它是一种更强烈的聚合关系。"),e("br"),a(" 在组合关系中，整体对象可以控制部分对象的生命周期，一旦整体对象不存在，部分对象也将不存在，部分对象不能脱离整体对象而存在。例如，头和嘴的关系，没有了头，嘴也就不存在了。"),e("br"),a(" 在 UML 类图中，组合关系用带实心菱形的实线来表示，菱形指向整体。")],-1),b=e("h4",{id:"依赖关系",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#依赖关系"},[e("span",null,"依赖关系")])],-1),z=e("p",null,[a("依赖关系是一种使用关系，它是对象之间"),e("strong",null,"耦合度最弱"),a("的一种关联方式，是临时性的关联。在代码中，某个类的方法通过局部变量、方法的参数或者对静态方法的调用来访问另一个类（被依赖类）中的某些方法来完成一些职责。"),e("br"),a(" 在 UML 类图中，依赖关系使用带箭头的虚线来表示，箭头从使用类指向被依赖的类。")],-1),x=e("h4",{id:"继承关系",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#继承关系"},[e("span",null,"继承关系")])],-1),J=e("p",null,[a("继承关系是对象之间"),e("strong",null,"耦合度最大"),a("的一种关系，表示一般与特殊的关系，是父类与子类之间的关系，是一 种继承关系。"),e("br"),a(" 在 UML 类图中，泛化关系用带空心三角箭头的实线来表示，箭头从子类指向父类。在代码实现时，使"),e("br"),a(" 用面向对象的继承机制来实现泛化关系。")],-1),f=e("h4",{id:"实现关系",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#实现关系"},[e("span",null,"实现关系")])],-1),T=e("p",null,[a("实现关系是接口与实现类之间的关系。在这种关系中，类实现了接口，类中的操作实现了接口中所声明的所有的抽象操作。"),e("br"),a(" 在 UML 类图中，实现关系使用带空心三角箭头的虚线来表示，箭头从实现类指向接口。")],-1);function X(g,V){const s=i("Mermaid");return o(),t("div",null,[r,l(s,{id:"mermaid-36",code:"eJxLzkksLnbJTEwvSszlAnMUXHMLcvIrU1MVqrk4dYNLijLz0q0U8hJzU4HczLwSK4XEdBATJpOYklKUWlzMxaldnl+UraGpUJafmcJVywUAcOkdVw=="}),h,l(s,{id:"mermaid-104",code:"eJxLzkksLnbJTEwvSszlSsksSk0uyczPUwjy4QLLKDiXFpfk56YWVXNx6iokpqQUpRYXWyk4QhhctVBVMD6UVrCp0dWFa+UCAAJuItM="}),p,m,l(s,{id:"mermaid-111",code:"eJxLzkksLnbJTEwvSszlSsksSk0uyczPUwjy4QLLKDiXFpfk56YWVXNx6ioUFOWnlCaXFFsp+GQWl9QFQLh1XLVQxVABsNpkqEYruBFAZTCmgq4uTDEXAP1rLhI="}),u,l(s,{id:"mermaid-121",code:"eJxLzkksLnbJTEwvSszlSsksSk0uyczPU3AK4QLLKPjlp6RWc3HqKhSXJoHYVmARrlouEKWgq1tjBxEAAJHnF5k="}),U,L,k,l(s,{id:"mermaid-131",code:"eJzT1dXlKsksyUm1Uni6ZPnTtcueTup5NnXm0x0dXCCp5JzE4mKXzMT0osRcrpTMotTkksz8PAWfIIiMQmheZllqUXFmSaVCNRenrkJJamKxlYJPZnFJXUhqYnJGalEdVy1ULVQAojAvMRdoZXBJUWZeOhenNkhjcoaGpkJZfmYKUAeSufm6ujCtXADTHj6R"}),M,_,l(s,{id:"mermaid-138",code:"eJzT1dXlKsksyUm1Uni6ZMvTST1PZ2x5Pqvlaevm55t3c4Fkk3MSi4tdMhPTixJzIRwFj9TEFIVqLk7d3PzSkgwrBV8QxVULlQXzQNLaqYklGpoKZfmZKUBJsCYtXV2oagC+aCxl"}),b,z,l(s,{id:"mermaid-145",code:"eJzT1dXlKsksyUm1Unjav+PZnF1PJ/U827j3xd5lXCCp5JzE4mKXzMT0osRcCEfBpSizLLVIoZqLUzcvMReoL7ikKDMvnYtTOwUko+GcWKSQnFikqVCWn5nCVQvVBRIFatHOzQcqgctBzdLTswMp4AIALH8x5Q=="}),x,J,l(s,{id:"mermaid-152",code:"eJzT1dXlKsksyUm1UgguKU1JzStReL5x99NJPQohqYnJGalFIO7L5r3PZqxXCEgtKs7PAwk8n9XydO0EIIMLpD85J7G42CUzMb0oMZcrJbMoNbkkE6jOKQQiA9VXzcWpm5eYC7aoKDMvHchNTAfyMvNKuDi1iwtSE7M1NBXK8jNTuGqhGqEuAukshjD98hHatUFileh6oM4G6SmBMFH0gMUQemB+1tWtsYO6kwvmcWQxAIMta2o="}),f,T,l(s,{id:"mermaid-159",code:"eJzT1dXlKsksyUm1Uni2ce+LvcueTup50bHz6bp5z/s2PNnV9mTXkpcNs55uX/q0dTsXSHFyTmJxsUtmYnpRYi5XSmZRanJJZn6eglMIREYhLDUjMzkntZqL08bGM68ktSgtMTnVzo6LUzs3vyxVQ1OhLD8zhasWqto5sQioEqtUcEZmAaYcUIOCnl6NHcweLpAyVBEAORVP5Q=="})])}const K=d(c,[["render",X],["__file","uml.html.vue"]]),Q=JSON.parse('{"path":"/basic/software-engineering/uml.html","title":"UML","lang":"zh-CN","frontmatter":{"title":"UML","shortTitle":"UML","description":"UML","date":"2024-05-28T20:16:13.000Z","categories":["软件工程"],"tags":["UML"],"index":true,"order":1},"headers":[{"level":2,"title":"UML图","slug":"uml图","link":"#uml图","children":[]},{"level":2,"title":"类图","slug":"类图","link":"#类图","children":[{"level":3,"title":"概述","slug":"概述","link":"#概述","children":[]},{"level":3,"title":"作用","slug":"作用","link":"#作用","children":[]},{"level":3,"title":"类的表示方式","slug":"类的表示方式","link":"#类的表示方式","children":[]},{"level":3,"title":"类与类之间关系的表示方式","slug":"类与类之间关系的表示方式","link":"#类与类之间关系的表示方式","children":[]}]}],"git":{"createdTime":1716973610000,"updatedTime":1739108242000,"contributors":[{"name":"Zhiyun Qin","email":"2368932388@qq.com","commits":2}]},"readingTime":{"minutes":5.5,"words":1650},"filePathRelative":"basic/software-engineering/uml.md","localizedDate":"2024年5月29日"}');export{K as comp,Q as data};
