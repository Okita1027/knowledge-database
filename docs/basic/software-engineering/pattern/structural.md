---
title: 结构型模式
shortTitle: 结构型模式
description: 结构型模式
date: 2024-05-28 20:28:07
categories: [软件工程]
tags: [设计模式]
order: 3
---
## 结构型模式

结构型模式描述如何将类或对象按某种布局组成更大的结构。它分为类结构型模式和对象结构型模式，前者采用继承机制来组织接口和类，后者采用组合或聚合来组合对象。由于组合关系或聚合关系比继承关系耦合度低，满足“合成复用原则”，所以对象结构型模式比类结构型模式具有更大的灵活性。

结构型模式分为以下 7 种：

1. **适配器模式（类/对象）**(Adapter Pattern):将一个类的接口转换成客户希望的另一个接口，使得原本不兼容的类可以合作无间。
2. 桥接模式(Bridge Pattern):将抽象部分与实现部分分离，使它们都可以独立地变化。
3. 组合模式(Composite Pattern):将对象组合成树形结构来表示“部分-整体”的层次结构，使得客户端对单个对象和组合对象的使用具有一致性。
4. **装饰器模式**(Decorator Pattern):动态地给一个对象添加一些额外的职责，就增加功能来说，装饰器模式比生成子类更为灵活。
5. 外观模式(Facade Pattern):为子系统中的一组接口提供一个一致的界面，此模式定义了一个高层接口，这个接口使得这一子系统更加容易使用。
6. 享元模式(Flyweight Pattern) :运用共享技术有效地支持大量细粒度的对象。
7. **代理模式**(Proxy Pattern):由于某些原因需要给某对象提供一个代理以控制对该对象的访问。这时，访问对象不适合或者不能直接引用目标对象，代理对象作为访问对象和目标对象之间的中介。

## 代理模式

### 概述

由于某些原因需要给某对象提供一个代理以控制对该对象的访问。这时，访问对象不适合或者不能直接引用目标对象，代理对象作为访问对象和目标对象之间的中介。 
Java中的代理按照代理类生成时机不同又分为**静态代理**和**动态代理**。静态代理代理类在编译期就生成，而动态代理代理类则是在Java运行时动态生成。动态代理又有**JDK代理**和**CGLib代理**两种。

### 结构

代理（Proxy）模式分为三种角色： 

- 抽象主题（Subject）类： 通过接口或抽象类声明真实主题和代理对象实现的业务方法。 
- 真实主题（Real Subject）类： 实现了抽象主题中的具体业务，是代理对象所代表的真实对象，是最终要引用的对象。 
- 代理（Proxy）类 ： 提供了与真实主题相同的接口，其内部含有对真实主题的引用，它可以访问、控制或扩展真实主题的功能。

### 静态代理

通过案例来感受一下静态代理。 
【例】火车站卖票 
如果要买火车票的话，需要去火车站买票，坐车到火车站，排队等一系列的操作，显然比较麻烦。而火车站在多个地方都有代售点，我们去代售点买票就方便很多了。这个例子其实就是典型的代理模式，火车站是目标对象，代售点是代理对象。类图如下：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/structural1.png)

```java
public interface Sell {
    void sellTicket();
}
```

```java
public class TrainStation implements Sell {
    @Override
    public void sellTicket() {
        System.out.println("售卖火车票……");
    }
}
```

```java
public class ProxyPoint implements Sell{

    TrainStation trainStation = new TrainStation();

    @Override
    public void sellTicket() {
        System.out.println("代理点收取服务费……");
        trainStation.sellTicket();
    }
}
```

```java
public class Client {
    public static void main(String[] args) {
        ProxyPoint proxyPoint = new ProxyPoint();
        proxyPoint.sellTicket();
    }
}
```

从上面代码中可以看出测试类直接访问的是ProxyPoint类对象，也就是说ProxyPoint作为访问对象和目标对象的中介。同时也对sell方法进行了增强（代理点收取一些服务费用）。

### JDK动态代理

接下来我们使用动态代理实现上面案例，先说说JDK提供的动态代理。Java中提供了一个动态代理类Proxy，Proxy并不是我们上述所说的代理对象的类，而是提供了一个创建代理对象的静态方法 （newProxyInstance方法）来获取代理对象。

```java
public interface Sell {
    void sell();
}
```

```java
public class TrainStation implements Sell {
    @Override
    public void sell() {
        System.out.println("售卖火车票……");
    }
}
```

```java
public class ProxyFactory {
    public static Object getProxy(Object target) {
        //使用Proxy获取代理对象
        /*
            newProxyInstance()方法参数说明：
            ClassLoader loader ： 类加载器，用于加载代理类，使用真实对象的类加载器即可
            Class<?>[] interfaces ： 真实对象所实现的接口，代理模式真实对象和代理对象实现相同的接口
            InvocationHandler h ： 代理对象的调用处理程序
            	InvocationHandler中invoke方法参数说明：
                    proxy ： 代理对象
                    method ： 对应于在代理对象上调用的接口方法的 Method 实例
                    args ： 代理对象调用接口方法时传递的实际参数
        */
        return Proxy.newProxyInstance(target.getClass().getClassLoader(), target.getClass().getInterfaces(), new InvocationHandler() {
            @Override
            public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
                System.out.println("代理站点收取代理服务费");
                Object invoke = method.invoke(target, args);
                return invoke;
            }
        });
    }
}
```

```java
public class Test {
    public static void main(String[] args) {
        Sell proxy = (Sell) JdkProxy.getProxy(new TrainStation());
        proxy.sell();
    }
}
```

ProxyFactory是代理类吗？
ProxyFactory不是代理模式中所说的代理类，而代理类是程序在运行过程中动态的在内存中生成的类。
通过阿里巴巴开源的 Java 诊断工具（Arthas【阿尔萨斯】）查看代理类的结构：

> Arthas使用说明：
> 使用该诊断工具需要让程序一直运行，System.out.print(proxy.getClass())；while(true){}

```java
package com.sun.proxy;
import com.itheima.proxy.dynamic.jdk.SellTickets;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.lang.reflect.UndeclaredThrowableException;
public final class $Proxy0 extends Proxy implements SellTickets {	//实现了SellTickets
    private static Method m1;
    private static Method m2;
    private static Method m3;
    private static Method m0;
    public $Proxy0(InvocationHandler invocationHandler) {	//有参构造
        super(invocationHandler);	//传递给父类，父类Proxy中有protected InvocationHandler h;
    }
    static {
        try {
            m1 = Class.forName("java.lang.Object").getMethod("equals",
                                                             Class.forName("java.lang.Object"));
            m2 =
                Class.forName("java.lang.Object").getMethod("toString", new Class[0]);
            m3 =
                Class.forName("com.itheima.proxy.dynamic.jdk.SellTickets").getMethod("sell", new Class[0]);	//将目标方法变成对象
            m0 =
                Class.forName("java.lang.Object").getMethod("hashCode", new Class[0]);
            return;
        }
        catch (NoSuchMethodException noSuchMethodException) {
            throw new
                NoSuchMethodError(noSuchMethodException.getMessage());
        }
        catch (ClassNotFoundException classNotFoundException) {
            throw new
                NoClassDefFoundError(classNotFoundException.getMessage());
        }
    }
    public final boolean equals(Object object) {
        try {
            return (Boolean)this.h.invoke(this, m1, new Object[]
                                          {object});
        }
        catch (Error | RuntimeException throwable) {
            throw throwable;
        }
        catch (Throwable throwable) {
            throw new UndeclaredThrowableException(throwable);
        }
    }
    public final String toString() {
        try {
            return (String)this.h.invoke(this, m2, null);
        }
        catch (Error | RuntimeException throwable) {
            throw throwable;
        }
        catch (Throwable throwable) {
            throw new UndeclaredThrowableException(throwable);
        }
    }
    public final int hashCode() {
        try {
            return (Integer)this.h.invoke(this, m0, null);
        }
        catch (Error | RuntimeException throwable) {
            throw throwable;
        }
        catch (Throwable throwable) {
            throw new UndeclaredThrowableException(throwable);
        }
    }
    public final void sell() {	//执行目标方法
        try {
            this.h.invoke(this, m3, null);	//通过InvocationHandler接口的子实现类再去执行目标方法
            return;
        }
        catch (Error | RuntimeException throwable) {
            throw throwable;
        }
        catch (Throwable throwable) {
            throw new UndeclaredThrowableException(throwable);
        }
    }
}
```

```java
//程序运行过程中动态生成的代理类
public final class $Proxy0 extends Proxy implements SellTickets {
    private static Method m3;
    public $Proxy0(InvocationHandler invocationHandler) {
        super(invocationHandler);
    }
    static {
        m3 =
            Class.forName("com.itheima.proxy.dynamic.jdk.SellTickets").getMethod("sell", new Class[0]);
    }
    public final void sell() {
        this.h.invoke(this, m3, null);
    }
}
//Java提供的动态代理相关类
public class Proxy implements java.io.Serializable {
    protected InvocationHandler h;
    protected Proxy(InvocationHandler h) {
        this.h = h;
    }
}
```

从上面的类中，我们可以看到以下几个信息： 

- 代理类（$Proxy0）实现了SellTickets。这也就印证了我们之前说的真实类和代理类实现同样的接口。 
- 代理类（$Proxy0）将我们提供了的匿名内部类对象传递给了父类。

执行流程如下：

1. 在测试类中通过代理对象调用sell()方法
2. 根据多态的特性，执行的是代理类（$Proxy0）中的sell()方法
3. 代理类（$Proxy0）中的sell()方法中又调用了InvocationHandler接口的子实现类对象的invoke方法
4. invoke方法通过反射执行了真实对象所属类(TrainStation)中的sell()方法

### CGlib动态代理

如果没有定义SellTickets接口，只定义了TrainStation(火车站类)。很显然JDK代理是无法使用 了，因为JDK动态代理要求必须定义接口，对接口进行代理。 
CGLIB是一个功能强大，高性能的代码生成包。它为没有实现接口的类提供代理，为JDK的动态代理提 供了很好的补充。 
CGLIB是第三方提供的包，所以需要引入jar包的坐标：

```xml
<dependency>
  <groupId>cglib</groupId>
  <artifactId>cglib</artifactId>
  <version>2.2.2</version>
</dependency>
```

```java
//火车站
public class TrainStation {
    public void sell() {
        System.out.println("火车站卖票");
    }
}
//代理工厂
public class ProxyFactory implements MethodInterceptor {
    private TrainStation target = new TrainStation();
    public TrainStation getProxyObject() {
        //创建Enhancer对象，类似于JDK动态代理的Proxy类，下一步就是设置几个参数
        Enhancer enhancer =new Enhancer();
        //设置父类的字节码对象
        enhancer.setSuperclass(target.getClass());
        //设置回调函数
        enhancer.setCallback(this);
        //创建代理对象
        TrainStation obj = (TrainStation) enhancer.create();
        return obj;
    }
    /*
        intercept方法参数说明：
            o ： 代理对象
            method ： 真实对象中的方法的Method实例
            args ： 实际参数
            methodProxy ：代理对象中的方法的method实例
    */
    public TrainStation intercept(Object o, Method method, Object[] args,
                                  MethodProxy methodProxy) throws Throwable {
        System.out.println("代理点收取一些服务费用(CGLIB动态代理方式)");
        TrainStation result = (TrainStation) methodProxy.invokeSuper(o, args);
        return result;
    }
}
//测试类
public class Client {
    public static void main(String[] args) {
        //创建代理工厂对象
        ProxyFactory factory = new ProxyFactory();
        //获取代理对象
        TrainStation proxyObject = factory.getProxyObject();
        proxyObject.sell();
    }
}
```

### 代理模式的对比

- jdk代理和CGLIB代理 

使用CGLib实现动态代理，CGLib底层采用ASM字节码生成框架，使用字节码技术生成代理类，在JDK1.6之前比使用Java反射效率要高。唯一需要注意的是，**CGLib不能对声明为final的类或者方法进行代理**，因为**CGLib原理是动态生成被代理类的子类**。 
在JDK1.6、JDK1.7、JDK1.8逐步对JDK动态代理优化之后，在调用次数较少的情况下，JDK代理效率高于CGLib代理效率，只有当进行大量调用的时候，JDK1.6和JDK1.7比CGLib代理效率低一点，但是到JDK1.8的时候，JDK代理效率高于CGLib代理。所以如果有接口使用JDK动态代理，如果没有接口使用CGLIB代理。 

- 动态代理和静态代理 

动态代理与静态代理相比较，最大的好处是接口中声明的所有方法都被转移到调用处理器一个集中的方法中处理（InvocationHandler.invoke）。这样，在接口方法数量比较多的时候，我们可以进行灵活处理，而不需要像静态代理那样每一个方法进行中转。如果接口增加一个方法，静态代理模式除了所有实现类需要实现这个方法外，所有代理类也需要实现此方法。增加了代码维护的复杂度。而动态代理不会出现该问题。

### 优缺点

- 优点
  - 代理模式在客户端与目标对象之间起到一个中介作用和保护目标对象的作用；
  - 代理对象可以扩展目标对象的功能；
  - 代理模式能将客户端与目标对象分离，在一定程度上降低了系统的耦合度；
- 缺点
  - 增加了系统的复杂度；

### 使用场景

- 远程（Remote）代理

本地服务通过网络请求远程服务。为了实现本地到远程的通信，我们需要实现网络通信，处理其中可能的异常。为良好的代码设计和可维护性，我们将网络通信部分隐藏起来，只暴露给本地服务一个接口，通过该接口即可访问远程服务提供的功能，而不必过多关心通信部分的细节。 

- 防火墙（Firewall）代理

当你将浏览器配置成使用代理功能时，防火墙就将你的浏览器的请求转给互联网；当互联网返回响应时，代理服务器再把它转给你的浏览器。 

- 保护（Protect or Access）代理

控制对一个对象的访问，如果需要，可以给不同的用户提供不同级别的使用权限。

## 适配器模式

### 概述

如果去欧洲国家去旅游的话，他们的插座如下图最左边，是欧洲标准。而我们使用的插头如下图最右边的。因此我们的笔记本电脑，手机在当地不能直接充电。所以就需要一个插座转换器，转换器第1面插入当地的插座，第2面供我们充电，这样使得我们的插头在当地能使用。生活中这样的例子很多，手机充电器（将220v转换为5v的电压），读卡器等，其实就是使用到了适配器模式。
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/structural2.png)

### 结构

适配器模式（Adapter）包含以下主要角色：

- 目标（Target）接口：当前系统业务所期待的接口，它可以是抽象类或接口。
- 适配者（Adaptee）类：它是被访问和适配的现存组件库中的组件接口。
- 适配器（Adapter）类：它是一个转换器，通过继承或引用适配者的对象，把适配者接口转换成目标接口，让客户按目标接口的格式访问适配者。

### 类适配器

实现方式：定义一个适配器类来实现当前系统的业务接口，同时又继承现有组件库中已经存在的组件。 
【例】读卡器 
现有一台电脑只能读取SD卡，而要读取TF卡中的内容的话就需要使用到适配器模式。创建一个读卡器，将TF卡中的内容读取出来。 
类图如下：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/structural3.png)

```java
public interface TypeC {
    String readTypeC();
    void writeTypeC(String message);
}
```

```java
public interface USB {
    String readUSB();
    void writeUSB(String message);
}
```

```java
public class TypeCImpl implements TypeC{
    private String message;
    @Override
    public String readTypeC() {
        System.out.println("TypeCImpl -> read()");
        return "从手机的TypeC接口读取了信息：HelloWorld!" + message;
    }

    @Override
    public void writeTypeC(String message) {
        this.message = message;
        System.out.println("TypeCImpl -> write()");
    }
}
```

```java
public class USBImpl implements USB {
    private String message;
    @Override
    public String readUSB() {
        System.out.println("USBImpl -> read()");
        return "从U盘中读取了信息：" + message + "!";
    }

    @Override
    public void writeUSB(String message) {
        this.message = message;
        System.out.println("USBImpl -> write()");
    }
}
```

```java
public class TypeCAdapterUSB extends USBImpl implements TypeC {
    @Override
    public String readTypeC() {
        System.out.println("执行适配器……");
        return super.readUSB();
    }

    @Override
    public void writeTypeC(String message) {
        System.out.println("执行适配器……");
        super.writeUSB(message);
    }

}
```

```java
public class MobilePhone extends TypeCImpl {
    public String readTypeC(TypeC typeC) {
        if (typeC == null) {
            throw new NullPointerException("typeC can't be null!");
        }
        return typeC.readTypeC();
    }

    public void writeTypeC(TypeC typeC, String message) {
        if (typeC == null) {
            throw new NullPointerException("typeC can't be null!");
        }
        typeC.writeTypeC(message);
    }
}
```

```java
public class Client {
    public static void main(String[] args) {
        //根据TypeC接口读取手机内的信息
        MobilePhone mobilePhone = new MobilePhone();

        //根据TypeC接口写入、读取手机内的信息
        mobilePhone.writeTypeC("这是写入到手机的信息！");
        System.out.println("mobilePhone.readTypeC() = " + mobilePhone.readTypeC() + "\n");

        //使用适配器让手机能通过自身的（TypeC接口）写入、读取U盘的（USB接口）的信息
        TypeCAdapterUSB adapter = new TypeCAdapterUSB();
        mobilePhone.writeTypeC(adapter, "你好");
        String data = mobilePhone.readTypeC(adapter);
        System.out.println("data = " + data);
    }
}
```

类适配器模式违背了合成复用原则。类适配器是客户类有一个接口规范的情况下可用，反之不可用。

### 对象适配器

实现方式：对象适配器模式可釆用将现有组件库中已经实现的组件引入适配器类中，该类同时实现当前系统的业务接口。
【例】读卡器
我们使用对象适配器模式将读卡器的案例进行改写。类图如下：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/structural4.png)

```java
public interface TypeC {
    String readTypeC();
    void writeTypeC(String message);
}
```

```java
public interface USB {
    String readUSB();
    void writeUSB(String message);
}
```

```java
public class TypeCImpl implements TypeC{
    private String message;
    @Override
    public String readTypeC() {
        System.out.println("TypeCImpl -> read()");
        return "从手机的TypeC接口读取了信息：HelloWorld!" + message;
    }

    @Override
    public void writeTypeC(String message) {
        this.message = message;
        System.out.println("TypeCImpl -> write()");
    }
}
```

```java
public class USBImpl implements USB {
    private String message;
    @Override
    public String readUSB() {
        System.out.println("USBImpl -> read()");
        return "从U盘中读取了信息：" + message + "!";
    }

    @Override
    public void writeUSB(String message) {
        this.message = message;
        System.out.println("USBImpl -> write()");
    }
}
```

```java
public class TypeCAdapterUSB implements TypeC {	//取消实现，改为聚合
    private final USB usb;

    public TypeCAdapterUSB(USB usb) {
        this.usb = usb;
    }

    @Override
    public String readTypeC() {
        System.out.println("执行适配器……");
        return usb.readUSB();
    }

    @Override
    public void writeTypeC(String message) {
        System.out.println("执行适配器……");
        usb.writeUSB(message);
    }

}
```

```java
public class MobilePhone extends TypeCImpl {
    public String readTypeC(TypeC typeC) {
        if (typeC == null) {
            throw new NullPointerException("typeC can't be null!");
        }
        return typeC.readTypeC();
    }

    public void writeTypeC(TypeC typeC, String message) {
        if (typeC == null) {
            throw new NullPointerException("typeC can't be null!");
        }
        typeC.writeTypeC(message);
    }
}
```

```java
public class Client {
    public static void main(String[] args) {
        //根据TypeC接口读取手机内的信息
        MobilePhone mobilePhone = new MobilePhone();

        //根据TypeC接口写入、读取手机内的信息
        mobilePhone.writeTypeC("这是写入到手机的信息！");
        System.out.println("mobilePhone.readTypeC() = " + mobilePhone.readTypeC() + "\n");

        //使用适配器让手机能通过自身的（TypeC接口）写入、读取U盘的（USB接口）的信息
        TypeCAdapterUSB adapter = new TypeCAdapterUSB();
        mobilePhone.writeTypeC(adapter, "对象适配器");
        String data = mobilePhone.readTypeC(adapter);
        System.out.println("data = " + data);
    }
}
```

### 使用场景

- 以前开发的系统存在满足新系统功能需求的类，但其接口同新系统的接口不一致。
- 使用第三方提供的组件，但组件接口定义和自己要求的接口定义不同。

### JDK源码剖析

Reader（字符流）、InputStream（字节流）的适配使用的是InputStreamReader。 
InputStreamReader继承自java.io包中的Reader，对他中的抽象的未实现的方法给出实现。如：

```java
public int read() throws IOException {
    return sd.read();
}
public int read(char cbuf[], int offset, int length) throws IOException {
    return sd.read(cbuf, offset, length);
}
```

如上代码中的sd（StreamDecoder类对象），在Sun的JDK实现中，实际的方法实现是对sun.nio.cs.StreamDecoder类的同名方法的调用封装。类结构图如下：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/structural5.png)
从上图可以看出：

- InputStreamReader是对同样实现了Reader的StreamDecoder的封装。
- StreamDecoder不是Java SE API中的内容，是Sun JDK给出的自身实现。但我们知道他们对构造方法中的字节流类（InputStream）进行封装，并通过该类进行了字节流和字符流之间的解码转换。

结论：
从表层来看，InputStreamReader做了InputStream字节流类到Reader字符流之间的转换。而从如上Sun JDK中的实现类关系结构中可以看出，是StreamDecoder的设计实现在实际上采用了适配模式。

## 装饰者模式

### 概述

先来看一个快餐店的例子：
快餐店有炒面、炒饭这些快餐，可以额外附加鸡蛋、火腿、培根这些配菜，当然加配菜需要额外加钱，每个配菜的价钱通常不太一样，那么计算总价就会显得比较麻烦。

使用继承的方式存在的问题：

- 扩展性不好
  - 如果要再加一种配料（火腿肠），我们就会发现需要给FriedRice和FriedNoodles分别定义一个子类。如果要新增一个快餐品类（炒河粉）的话，就需要定义更多的子类。
- 产生过多的子类

定义：

指在不改变现有对象结构的情况下，动态地给该对象增加一些职责（即增加其额外功能）的模式。

### 结构

装饰（Decorator）模式中的角色：

- 抽象构件（Component）角色：定义一个抽象接口以规范准备接收附加责任的对象。
- 具体构件（Concrete Component）角色：实现抽象构件，通过装饰角色为其添加一些职责。
- 抽象装饰（Decorator）角色：继承或实现抽象构件，并包含具体构件的实例，可以通过其子类扩展具体构件的功能。
- 具体装饰（ConcreteDecorator）角色：实现抽象装饰的相关方法，并给具体构件对象添加附加的责任。

### 案例实现

我们使用装饰者模式对快餐店案例进行改进，体会装饰者模式的精髓。
类图如下：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/structural6.png)

```java
public abstract class FastFood {
    private double price;
    private String description;
    
    public FastFood() {
        
    }
    
    public FastFood(double price, String description) {
        this.price = price;
        this.description = description;
    }
    
    //计算价格
    public abstract double cost();

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
    
}
```

```java
public class FriedNoodles extends FastFood{
    public FriedNoodles() {
        super(12, "（黄铜）炒面");
    }

    @Override
    public double cost() {
        return getPrice();
    }
}
```

```java
public class FriedRice extends FastFood{
    public FriedRice() {
        super(10, "（黄金）炒饭");
    }

    @Override
    public double cost() {
        return getPrice();
    }
}
```

```java
public abstract class Garish extends FastFood {

    private FastFood fastFood;

    public Garish(FastFood fastFood, double price, String description) {
        super(price, description);
        this.fastFood = fastFood;
    }

    public FastFood getFastFood() {
        return fastFood;
    }

    public void setFastFood(FastFood fastFood) {
        this.fastFood = fastFood;
    }
}
```

```java
public class Egg extends Garish{

    public Egg(FastFood fastFood) {
        super(fastFood, 1, "（煎）鸡蛋");
    }

    @Override
    public double cost() {
        return getPrice() + getFastFood().cost();
    }

    @Override
    public String getDescription() {
        return getFastFood().getDescription() + "+" + super.getDescription();
    }
}
```

```java
public class HotDog extends Garish{

    public HotDog(FastFood fastFood) {
        super(fastFood, 2, "（烤）热狗");
    }

    @Override
    public double cost() {
        return getPrice() + getFastFood().cost();
    }

    @Override
    public String getDescription() {
        return getFastFood().getDescription() + "+" + super.getDescription();
    }
}
```

```java
public class Client {
    public static void main(String[] args) {
        //单点一份炒饭
        FriedRice friedRice = new FriedRice();
        System.out.println(friedRice.getDescription() + " = " + friedRice.cost() + "元\n");

        //单点一份炒面
        FastFood friedNoodles = new FriedNoodles();
        System.out.println(friedNoodles.getDescription() + " = " + friedNoodles.cost() + "元\n");
        //给炒面加一个热狗
        friedNoodles = new HotDog(friedNoodles);
        System.out.println(friedNoodles.getDescription() + " = " +friedNoodles.cost() + "元\n");
        //给炒面加一个鸡蛋
        friedNoodles = new Egg(friedNoodles);
        System.out.println(friedNoodles.getDescription() + " = " +friedNoodles.cost() + "元\n");
        //给炒面加再一个鸡蛋
        friedNoodles = new Egg(friedNoodles);
        System.out.println(friedNoodles.getDescription() + " = " +friedNoodles.cost() + "元\n");

    }
}
```

### 使用场景

当不能采用继承的方式对系统进行扩充或者采用继承不利于系统扩展和维护时。 

不能采用继承的情况主要有两类： 

- 第一类是系统中存在大量独立的扩展，为支持每一种组合将产生大量的子类，使得子类数目呈爆炸性增长。
- 第二类是因为类定义不能继承（如final类）在不影响其他对象的情况下，以动态、透明的方式给单个对象添加职责。
- 当对象的功能要求可以动态地添加，也可以再动态地撤销时。

### JDK源码解析

IO流中的包装类使用到了装饰者模式。BufferedInputStream，BufferedOutputStream，BufferedReader，BufferedWriter。 
我们以BufferedWriter举例来说明，先看看如何使用BufferedWriter。

```java
public class Demo {
    public static void main(String[] args) throws Exception{
        //创建BufferedWriter对象
        //创建FileWriter对象
        FileWriter fw = new FileWriter("C:\\Users\\Think\\Desktop\\a.txt");
        BufferedWriter bw = new BufferedWriter(fw);
        //写数据
        bw.write("hello Buffered");
        bw.close();
    }
}
```

使用起来感觉确实像是装饰者模式，接下来看它们的结构：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/structural7.png)
BufferedWriter使用装饰者模式对Writer子实现类进行了增强，添加了缓冲区，提高了写数据的效率。

### 代理和装饰者的区别

静态代理和装饰者模式的区别： 

- 相同点： 
  - 都要实现与目标类相同的业务接口 
  - 在两个类中都要声明目标对象 
  - 都可以在不修改目标类的前提下增强目标方法 
- 不同点： 
  - 目的不同 装饰者是为了增强目标对象 静态代理是为了保护和隐藏目标对象 
  - 获取目标对象构建的地方不同 装饰者是由外界传递进来，可以通过构造方法传递 静态代理 
  - 是在代理类内部创建，以此来隐藏目标对象

## 桥接模式

### 概述

现在有一个需求，需要创建不同的图形，并且每个图形都有可能会有不同的颜色。我们可以利用继承的方式来设计类的关系：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/structural8.png)
我们可以发现有很多的类，假如我们再增加一个形状或再增加一种颜色，就需要创建更多的类。 
试想，在一个有多种可能会变化的维度的系统中，用继承方式会造成类爆炸，扩展起来不灵活。每次在一个维度上新增一个具体实现都要增加多个子类。为了更加灵活地设计系统，我们此时可以考虑使用桥接模式。 

定义：将抽象与实现分离，使它们可以独立变化。它是用组合关系代替继承关系来实现，从而降低了抽象和实现这两个可变维度的耦合度。

### 结构

桥接（Bridge）模式包含以下主要角色：

- 抽象化（Abstraction）角色：定义抽象类，并包含一个对实现化对象的引用。
- 扩展抽象化（Refined Abstraction）角色：是抽象化角色的子类，实现父类中的业务方法，并通过组合关系调用实现化角色中的业务方法。 
- 实现化（Implementor）角色：定义实现化角色的接口，供扩展抽象化角色调用。 
- 具体实现化（Concrete Implementor）角色：给出实现化角色接口的具体实现。

### 案例实现

【例】视频播放器
需要开发一个跨平台视频播放器，可以在不同操作系统平台（如Windows、Mac、Linux等）上播放多种格式的视频文件，常见的视频格式包括RMVB、AVI、WMV等。该播放器包含了两个维度，适合使用桥接模式。 
类图如下：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/structural9.png)

```java
public abstract class OperatingSystem {
    protected Video video;

    public OperatingSystem(Video video) {
        this.video = video;
    }

    public abstract void play(String fileName);
}
```

```java
public class Linux extends OperatingSystem{
    public Linux(Video video) {
        super(video);
    }

    @Override
    public void play(String fileName) {
        System.out.print("Linux系统正在播放:");
        video.decode(fileName);
    }
}
```

```java
public class Windows extends OperatingSystem{
    public Windows(Video video) {
        super(video);
    }
    
    @Override
    public void play(String fileName) {
        System.out.print("Windows系统正在播放:");
        video.decode(fileName);
    }
}
```

```java
public interface Video {
    void decode(String fileName);
}
```

```java
public class AviVideo implements Video{
    @Override
    public void decode(String fileName) {
        System.out.println(fileName + ".avi");
    }
}
```

```java
public class Mp4Video implements Video{
    @Override
    public void decode(String fileName) {
        System.out.println(fileName + ".mp4");
    }
}
```

```java
public class Client {
    public static void main(String[] args) {
        Mp4Video video = new Mp4Video();
        OperatingSystem system = new Windows(video);
        system.play("《Violet Ever Garden》");
    }
}
```

### 优缺点

**优点：**

1. 实现了抽象和实现部分的分离

桥接模式分离了抽象部分和实现部分，从而极大的提供了系统的灵活性，让抽象部分和实现部分独立开来，分别定义接口，这有助于系统进行分层设计，从而产生更好的结构化系统。对于系统的高层部分，只需要知道抽象部分和实现部分的接口就可以了。

2. 更好的可扩展性

由于桥接模式把抽象部分和实现部分分离了，从而分别定义接口，这就使得抽象部分和实现部分可以分别独立扩展，而不会相互影响，大大的提供了系统的可扩展性。

3. 可动态的切换实现

由于桥接模式实现了抽象和实现的分离，所以在实现桥接模式时，就可以实现动态的选择和使用具体的实现。

4. 实现细节对客户端透明，可以对用户隐藏实现细节。

**缺点：**

1. 桥接模式的引入增加了系统的理解和设计难度，由于聚合关联关系建立在抽象层，要求开发者针对抽象进行设计和编程。

2. 桥接模式要求正确识别出系统中两个独立变化的维度，因此其使用范围有一定的局限性。

### 使用场景

- 当一个类存在两个独立变化的维度，且这两个维度都需要进行扩展时。 
- 当一个系统不希望使用继承或因为多层次继承导致系统类的个数急剧增加时。 
- 当一个系统需要在构件的抽象化角色和具体化角色之间增加更多的灵活性时。避免在两个层次之间建立静态的继承联系，通过桥接模式可以使它们在抽象层建立一个关联关系。

## 外观模式

### 概述

**案例：**
有些人可能炒过股票，但其实大部分人都不太懂，这种没有足够了解证券知识的情况下做股票是很容易亏钱的，刚开始炒股肯定都会想，如果有个懂行的帮帮手就好，其实基金就是个好帮手，支付宝里就有许多的基金，它将投资者分散的资金集中起来，交由专业的经理人进行管理，投资于股票、债券、外汇等领域，而基金投资的收益归持有者所有，管理机构收取一定比例的托管管理费用。
**定义： **
又名**门面模式**，是一种通过为多个复杂的子系统提供一个一致的接口，而使这些子系统更加容易被访问的模式。该模式对外有一个统一接口，外部应用程序不用关心内部子系统的具体的细节，这样会大大降低应用程序的复杂度，提高了程序的可维护性。 
外观（Facade）模式是“迪米特法则”的典型应用
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/structural10.png)

### 结构

外观（Facade）模式包含以下主要角色： 

- 外观（Facade）角色：为多个子系统对外提供一个共同的接口。 
- 子系统（Sub System）角色：实现系统的部分功能，客户可以通过外观角色访问它。

### 案例实现

【例】智能家电控制 
小明的爷爷已经70岁了，一个人在家生活：每次都需要打开灯、打开电视、打开空调；睡觉时关闭灯、关闭电视、关闭空调；操作起来都比较麻烦。所以小明给爷爷买了智能音箱，可以通过语音直接控制这些智能家电的开启和关闭。类图如下：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/structural11.png)

```java
public class XiaoAiClassmate {
    private Light light;
    private TV tv;

    public XiaoAiClassmate() {
        light = new Light();
        tv = new TV();
    }

    public void voiceControl(String message) {
        if (message.contains("开")) {
            on();
        } else if (message.contains("关")) {
            off();
        } else {
            System.out.println("听不懂！");
        }
    }

    private void on() {
        light.on();
        tv.on();
    }

    private void off() {
        light.off();
        tv.off();
    }
}

```

```java
public class TV {
    public void on() {
        System.out.println("开电视");
    }
    public void off() {
        System.out.println("关电视");
    }
}
```

```java
public class Light {
    public void on() {
        System.out.println("开灯");
    }
    public void off() {
        System.out.println("关灯");
    }
}
```

```java
public class Client {
    public static void main(String[] args) {
        XiaoAiClassmate AI = new XiaoAiClassmate();
        AI.voiceControl("！开！");
    }
}
```

外观模式是符合“迪米特法则”的经典案例。Client不能直接访问Light/TV，却能通过AI间接使用它们。

### 优缺点

优点

- 减少了系统的相互依赖
- 提高了灵活性，不管系统内部如何变化，只要不影响到外观对象，任你自由活动
- 提高了安全性，想让你访问什么你就只能访问什么

缺点

- 修改麻烦

### 使用场景

- 对分层结构系统构建时，使用外观模式定义子系统中每层的入口点可以简化子系统之间的依赖关系，子系统相对独立。 
- 当一个复杂系统的子系统很多时，外观模式可以为系统设计一个简单的接口供外界访问，外界对子系统的访问只要黑箱操作即可。 
- 当客户端与多个子系统之间存在很大的联系时，引入外观模式可将它们分离，从而提高子系统的独立性和可移植性。
- 预防低水平人员带来的风险扩散

### 源码分析

使用tomcat作为web容器时，接收浏览器发送过来的请求，tomcat会将请求信息封装成ServletRequest对象，如下图①处对象。但是大家想想ServletRequest是一个接口，它还有一个子接口HttpServletRequest，而我们知道该request对象肯定是一个HttpServletRequest对象的子实现类对象，到底是哪个类的对象呢？可以通过输出request对象，我们就会发现是一个名为RequestFacade的类的对象。
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/structural12.png)
RequestFacade类就使用了外观模式。先看结构图：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/structural13.png)
为什么在此处使用外观模式呢？
定义 RequestFacade 类，分别实现 ServletRequest ，同时定义私有成员变量 Request ，并且方法的实现调用 Request 的实现。然后，将 RequestFacade上转为 ServletRequest 传给servlet 的 service 方法，这样即使在 servlet 中被下转为 RequestFacade ，也不能访问私有成员变量对象中的方法。既用了 Request ，又能防止其中方法被不合理的访问。

## 组合模式

### 概述

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/structural14.png)
对于这个图片肯定会非常熟悉，上图我们可以看做是一个文件系统，对于这样的结构我们称之为树形结构。在树形结构中可以通过调用某个方法来遍历整个树，当我们找到某个叶子节点后，就可以对叶子节点进行相关的操作。可以将这颗树理解成一个大的容器，容器里面包含很多的成员对象，这些成员对象 
即可以是容器对象也可以是叶子对象。但是由于容器对象和叶子对象在功能上面的区别，使得我们在使用的过程中必须要区分容器对象和叶子对象，但是这样就会给客户带来不必要的麻烦，作为客户而已，它始终希望能够一致的对待容器对象和叶子对象。 
**定义： **
又名**部分整体模式**，是用于把一组相似的对象当作一个单一的对象。组合模式依据树形结构来组合对象，用来表示部分以及整体层次。这种类型的设计模式属于结构型模式，它创建了对象组的树形结构。

### 结构

组合模式主要包含三种角色： 

- 抽象根节点（Component）：定义系统各层次对象的共有方法和属性，可以预先定义一些默认行为和属性。 
- 树枝节点（Composite）：定义树枝节点的行为，存储子节点，组合树枝节点和叶子节点形成一个树形结构。 
- 叶子节点（Leaf）：叶子节点对象，其下再无分支，是系统层次遍历的最小单位。

### 案例实现

【例】软件菜单
如下图，我们在访问别的一些管理系统时，经常可以看到类似的菜单。一个菜单可以包含菜单项（菜单项是指不再包含其他内容的菜单条目），也可以包含带有其他菜单项的菜单，因此使用组合模式描述菜单就很恰当，我们的需求是针对一个菜单，打印出其包含的所有菜单以及菜单项的名称。
![软件菜单](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/structural15.png "软件菜单")
![类图](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/structural16.png "类图")

```java
//菜单组件 不管是菜单还是菜单项，都应该继承该类
public abstract class MenuComponent {
    protected String name;
    protected int level;
    //添加菜单
    public void add(MenuComponent menuComponent){
        throw new UnsupportedOperationException();
    }
    //移除菜单
    public void remove(MenuComponent menuComponent){
        throw new UnsupportedOperationException();
    }
    //获取指定的子菜单
    public MenuComponent getChild(int index){
        throw new UnsupportedOperationException();
    }
    //获取菜单名称
    public String getName() {
        return name;
    }
    //打印菜单
    public void print(){
        throw new UnsupportedOperationException();
    }
}
```

这里的MenuComponent定义为抽象类，因为有一些共有的属性和行为要在该类中实现，Menu和MenuItem类就可以只覆盖自己感兴趣的方法，而不用搭理不需要或者不感兴趣的方法，举例来说，Menu类可以包含子菜单，因此需要覆盖`add()`、`remove()`、`getChild()`方法，但是MenuItem就不应该有这些方法。这里给出的默认实现是抛出异常，你也可以根据自己的需要改写默认实现。

```java
public class Menu extends MenuComponent{

    private List<MenuComponent> menuComponentList;

    public Menu(String name, int level) {
        this.name = name;
        this.level = level;
        menuComponentList = new ArrayList<>();
    }

    @Override
    public void add(MenuComponent menuComponent) {
        menuComponentList.add(menuComponent);
    }

    @Override
    public void remove(MenuComponent menuComponent) {
        menuComponentList.remove(menuComponent);
    }

    @Override
    public MenuComponent getChild(int index) {
        return menuComponentList.get(index);
    }

    @Override
    public void print() {
        for (int i = 0; i < level; i++) {
            System.out.print("---");
        }
        System.out.println(name);
        for (MenuComponent menuComponent : menuComponentList) {
            menuComponent.print();
        }
    }
}
```

Menu类已经实现了除了getName方法的其他所有方法，因为Menu类具有添加菜单，移除菜单和获取子菜单的功能。

```java
public class Item extends MenuComponent{
    public Item(String name, int level) {
        this.name = name;
        this.level = level;
    }

    @Override
    public void print() {
        for (int i = 0; i < level; i++) {
            System.out.print("---");
        }
        System.out.println(name);
    }
}
```

MenuItem是菜单项，不能再有子菜单，所以添加菜单，移除菜单和获取子菜单的功能并不能实现。

```java
public class Client {
    public static void main(String[] args) {
        Menu tree = new Menu("一级目录-总目录", 1);

        Menu node1 = new Menu("二级目录-管理员", 2);
        Menu node2 = new Menu("二级目录-消费者", 2);
        Menu node3 = new Menu("二级目录-游客", 2);

        Item leaf1 = new Item("三级标签-系统管理", 3);
        Item leaf2 = new Item("三级标签-账号管理", 3);

        Item leaf3 = new Item("三级标签-贫穷消费者", 3);
        Item leaf4 = new Item("三级标签-富有消费者", 3);

        Item leaf5 = new Item("三级标签-过路游客", 3);

        node1.add(leaf1);
        node1.add(leaf2);

        node2.add(leaf3);
        node2.add(leaf4);

        node3.add(leaf5);

        tree.add(node1);
        tree.add(node2);
        tree.add(node3);

        tree.print();

    }
}
--------------------------
运行结果：
---一级目录-总目录
------二级目录-管理员
---------三级标签-系统管理
---------三级标签-账号管理
------二级目录-消费者
---------三级标签-贫穷消费者
---------三级标签-富有消费者
------二级目录-游客
---------三级标签-过路游客
```

### 组合模式的分类

在使用组合模式时，根据抽象构件类的定义形式，我们可将组合模式分为透明组合模式和安全组合模式两种形式。

#### 透明组合模式

透明组合模式**是组合模式的标准形式**。
透明组合模式中，抽象根节点角色中声明了所有用于管理成员对象的方法，比如在示例中`MenuComponent` 声明了 `add` 、 `remove` 、 `getChild` 方法，这样做的**好处是确保所有的构件类都有相同的接口**。
透明组合模式的**缺点是不够安全**，因为叶子对象和容器对象在本质上是有区别的，叶子对象不可能有下一个层次的对象，即不可能包含成员对象，因此为其提供 add()、remove() 等方法是没有意义的，这在编译阶段不会出错，但在运行阶段如果调用这些方法可能会出错（如果没有提供相应的错误处理代码）

#### 安全组合模式

在安全组合模式中，在抽象构件角色中没有声明任何用于管理成员对象的方法，而是在树枝节点 Menu 类中声明并实现这些方法。
安全组合模式的**缺点是不够透明**，因为叶子构件和容器构件具有不同的方法，且容器构件中那些用于管理成员对象的方法没有在抽象构件类中定义，因此客户端不能完全针对抽象编程，必须有区别地对待叶子构件和容器构件。
![安全组合模式类图](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/structural17.png "安全组合模式类图")

### 优缺点

- 优点

  - 组合模式可以清晰的定义分层次的复杂对象，表示对象的全部或部分层次，它让客户端忽略了层次的差异，方便对整个层次结构进行控制。
  - 客户端可以一致地使用一个组合结构或其中单个对象，不必关心处理的是单个对象还是整个组合结构，简化了客户端代码。
  - 在组合模式中增加新的容器构件和叶子构件都很方便，无须对现有类库进行任何修改，符合“开闭原则”。
  - 组合模式为树形结构的面向对象实现提供了一种灵活的解决方案，通过叶子对象和容器对象的递归组合，可以形成复杂的树形结构，但对树形结构的控制却非常简单。
- 缺点
  - 使得设计更加复杂，客户端需要花更多时间理清类之间的层次关系。
  - 在增加新构件时很难对容器中的构件类型进行限制。

### 使用场景

组合模式正是应树形结构而生，所以组合模式的使用场景就是出现树形结构的地方。比如：文件目录显示，多级目录呈现等树形结构数据的操作。

## 享元模式

### 概述

**定义： **
运用共享技术来有效地支持大量细粒度对象的复用。它通过共享已经存在的对象来大幅度减少需要创建的对象数量、避免大量相似对象的开销，从而提高系统资源的利用率。

### 结构

享元（Flyweight）模式中存在以下两种状态：

1. 内部状态，即不会随着环境的改变而改变的可共享部分。
   1. 各个俄罗斯方块的形状是不会变化的。
2. 外部状态，指随环境改变而改变的不可以共享的部分。享元模式的实现要领就是区分应用中的这两种状态，并将外部状态外部化。
   1. 各个俄罗斯方块在游戏中出现的位置是不同的。

享元模式的主要有以下角色：

- 抽象享元角色（Flyweight）：通常是一个接口或抽象类，在抽象享元类中声明了具体享元类公共的方法，这些方法可以向外界提供享元对象的内部数据（内部状态），同时也可以通过这些方法来设置外部数据（外部状态）。
- 具体享元（Concrete Flyweight）角色 ：它实现了抽象享元类，称为享元对象；在具体享元类中为内部状态提供了存储空间。通常我们可以**结合单例模式来设计具体享元类**，为每一个具体享元类提供唯一的享元对象。
- 非享元（Unsharable Flyweight)角色 ：并不是所有的抽象享元类的子类都需要被共享，不能被共享的子类可设计为非共享具体享元类；当需要一个非共享具体享元类的对象时可以直接通过实例化创建。
- 享元工厂（Flyweight Factory）角色 ：负责创建和管理享元角色。当客户对象请求一个享元对象时，享元工厂检査系统中是否存在符合要求的享元对象，如果存在则提供给客户；如果不存在的话，则创建一个新的享元对象。

### 案例实现

【例】俄罗斯方块 
下面的图片是众所周知的俄罗斯方块中的一个个方块，如果在俄罗斯方块这个游戏中，每个不同的方块都是一个实例对象，这些对象就要占用很多的内存空间，下面利用享元模式进行实现。
![俄罗斯方块案例图](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/structural18.png "俄罗斯方块案例图")
![类图](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/structural19.png "类图")

```java
public abstract class Box {
    public abstract String getShape();

    public void display(String color) {
        System.out.println("图形：" + getShape() + ";颜色：" + color);
    }
}
```

```java
public class JBox extends Box{
    @Override
    public String getShape() {
        return "J";
    }
}
```

```java
public class LBox extends Box{
    @Override
    public String getShape() {
        return "L";
    }
}
```

```java
public class BoxFactory {

    private static HashMap<String, Box> map;

    /*
        静态内部类实现单例
     */
    private BoxFactory() {
        map = new HashMap<>();
        map.put("L", new LBox());
        map.put("J", new JBox());
    }
    private static class SingletonHolder {
        private static final BoxFactory INSTANCE = new BoxFactory();
    }
    public static BoxFactory getInstance() {
        return SingletonHolder.INSTANCE;
    }

    //获取共享的对象
    public Box getBox(String key) {
        return map.get(key);
    }
}
```

```java
public class Client {
    public static void main(String[] args) {
        BoxFactory instance = BoxFactory.getInstance();
        Box boxJ = instance.getBox("J");
        boxJ.display("Blue");

        Box boxL = instance.getBox("L");
        boxL.display("Red");

        Box boxL2 = instance.getBox("L");
        boxL2.display("Green");

        System.out.println(boxL == boxL2);//true
    }
}
```

### 优缺点

**优点 **

- 极大减少内存中相似或相同对象数量，节约系统资源，提供系统性能 
- 享元模式中的外部状态相对独立，且不影响内部状态 

**缺点**

- 为了使对象可以共享，需要将享元对象的部分状态外部化，分离内部状态和外部状态，使程序逻辑复杂

### 使用场景

- 一个系统有大量相同或者相似的对象，造成内存的大量耗费。
- 对象的大部分状态都可以外部化，可以将这些外部状态传入对象中。
- 在使用享元模式时需要维护一个存储享元对象的享元池，这需要耗费一定的系统资源，因此应当在需要多次重复使用享元对象时才值得使用享元模式。

### JDK源码解析

1. String常量池
2. 数据库连接池
3. Integer常量池

```java
public class Demo {
    public static void main(String[] args) {
        Integer i1 = 127;
        Integer i2 = 127;
        System.out.println("i1和i2对象是否是同一个对象？" + (i1 == i2));
        Integer i3 = 128;
        Integer i4 = 128;
        System.out.println("i3和i4对象是否是同一个对象？" + (i3 == i4));
    }
}
```

```text
i1和i2对象是否是同一个对象？true
i3和i4对象是否是同一个对象？false
```

直接给Integer类型的变量赋值基本数据类型数据的操作底层使用的是valueOf()

```java
public final class Integer extends Number implements Comparable<Integer> {
    public static Integer valueOf(int i) {
        if (i >= IntegerCache.low && i <= IntegerCache.high)
            return IntegerCache.cache[i + (-IntegerCache.low)];
        return new Integer(i);
    }
    private static class IntegerCache {
        static final int low = -128;
        static final int high;
        static final Integer cache[];
        static {
            int h = 127;
            String integerCacheHighPropValue =
                sun.misc.VM.getSavedProperty("java.lang.Integer.IntegerCache.high");
            if (integerCacheHighPropValue != null) {
                try {
                    int i = parseInt(integerCacheHighPropValue);
                    i = Math.max(i, 127);
                    // Maximum array size is Integer.MAX_VALUE
                    h = Math.min(i, Integer.MAX_VALUE - (-low) -1);
                } catch( NumberFormatException nfe) {
                }
            }
            high = h;
            cache = new Integer[(high - low) + 1];
            int j = low;
            for(int k = 0; k < cache.length; k++)
                cache[k] = new Integer(j++);
            // range [-128, 127] must be interned (JLS7 5.1.7)
            assert IntegerCache.high >= 127;
        }
        private IntegerCache() {}
    }
}
```

可以看到 Integer 默认先创建并缓存 -128 ~ 127 之间数的 Integer 对象，当调用 valueOf 时如果参数在 -128 ~ 127 之间则计算下标并从缓存中返回，否则创建一个新的 Integer 对象。