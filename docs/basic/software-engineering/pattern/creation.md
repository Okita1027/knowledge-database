---
title: 创建型模式
shortTitle: 创建型模式
description: 创建型模式
date: 2024-05-28 20:25:53
categories: [软件工程]
tags: [设计模式]
order: 2
---
创建型模式的主要关注点是“怎样创建对象？”，它的主要特点是“将对象的创建与使用分离”。 

这样可以降低系统的耦合度，使用者不需要关注对象的创建细节。 

创建型模式分为： 
1. **单例模式**(Singleton Pattern) :确保一个类只有一个实例，并提供全局访问点。
2. **工厂方法模式**(Factory Method Pattern):定义一个用于创建对象的接口，让子类决定实例化哪个类。
3. 抽象工厂模式(Abstract Factory Pattern):定义一个用于创建对象的接口，让子类决定实例化哪一个类，常用于对象的创建和解耦。
4. **建造者模式**(Builder Pattern):提供一个创建一系列相关或相互依赖对象的接口，而无需指定它们的具体类，常用于系统的构建和产品族的创建。
5. 原型模式(Prototype Pattern):用原型实例指定创建对象的种类，并通过拷贝这些原型创建新的对象。

## 单例模式

单例模式（Singleton Pattern）是 Java 中最简单的设计模式之一。这种类型的设计模式属于创建型模式，它提供了一种创建对象的最佳方式。
这种模式涉及到一个单一的类，该类负责创建自己的对象，同时确保只有单个对象被创建。这个类提供了一种访问其唯一的对象的方式，可以直接访问，不需要实例化该类的对象。

### 结构

单例模式主要有以下角色： 

- 单例类：只能创建一个实例的类 
- 访问类：使用单例类

### 实现

单例设计模式分类两种：

- 饿汉式：类加载就会导致该单实例对象被创建
- 懒汉式：类加载不会导致该单实例对象被创建，而是首次使用该对象时才会创建

#### 饿汉式

##### 静态变量

```java
public class Singleton {
    //私有构造方法
    private Singleton() {}
    //在成员位置创建该类的对象
    private static Singleton instance = new Singleton();
    //对外提供静态方法获取该对象
    public static Singleton getInstance() {
        return instance;
    }
}
```

该方式在成员位置声明Singleton类型的静态变量，并创建Singleton类的对象instance。 instance对象是随着类的加载而创建的。如果该对象足够大的话，而一直没有使用就会造成内存的浪费。

##### 静态代码块

```java
public class Singleton {
    //私有构造方法
    private Singleton() {}
    //在成员位置创建该类的对象
    private static Singleton instance;
    static {
        instance = new Singleton();
    }
    //对外提供静态方法获取该对象
    public static Singleton getInstance() {
        return instance;
    }
}
```

该方式在成员位置声明Singleton类型的静态变量，而对象的创建是在静态代码块中，也是对着类的加载而创建。所以和饿汉式的方式1基本上一样，当然该方式也存在内存浪费问题。

##### 枚举

枚举类实现单例模式是极力推荐的单例实现模式，因为枚举类型是线程安全的，并且只会装载一次，设计者充分的利用了枚举的这个特性来实现单例模式，枚举的写法非常简单，而且枚举类型是所用单例实现中唯一的·一种不会被破坏的单例实现模式。

```java
public enum Singleton {
    INSTANCE;
}
```

枚举方式属于饿汉式方式。

#### 懒汉式

##### 方式1（线程不安全）

```java
public class Singleton {
    //私有构造方法
    private Singleton() {}
    //在成员位置创建该类的对象
    private static Singleton instance;
    //对外提供静态方法获取该对象
    public static Singleton getInstance() {
        if(instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}
```

##### 方式2（线程安全）

```java
public class Singleton {
    //私有构造方法
    private Singleton() {}
    //在成员位置创建该类的对象
    private static Singleton instance;	//可以加上volatile关键字以提升一点效率
    //对外提供静态方法获取该对象
    public static synchronized Singleton getInstance() {
        if(instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}
```

该方式也实现了懒加载效果，同时又解决了线程安全问题。但是在getInstance()方法上添加了synchronized关键字，导致该方法的执行效果特别低。从上面代码可以看出，其实就是在初始化instance的时候才会出现线程安全问题，一旦初始化完成就不存在了。

##### 方式3（双重检查锁）

再来讨论一下懒汉模式中加锁的问题，对于 getInstance() 方法来说，绝大部分的操作都是读操作，读操作是线程安全的，所以我们没必让每个线程必须持有锁才能调用该方法，我们需要调整加锁的时机。由此也产生了一种新的实现模式：双重检查锁模式

```java
class Wife
{
    private String name;
    //添加volatile关键字（涉及并发编程的知识），能进一步提高效率
    private static volatile Wife wife;
    private Wife(String name) {
        this.name = name;
    }

    public static Wife getWife(String name) {
        if (wife == null) {
            //只需要在写操作前实现线程同步，提高效率
            synchronized (Wife.class) {
                //抢到锁之后再次判断是否为空
                if (wife == null) {
                    //实例化称为写操作
                    wife = new Wife(name);
                }
            }
        }
        //取值称为读操作
        return wife;
    }
}
```

双重检查锁模式是一种非常好的单例实现模式，解决了单例、性能、线程安全问题，上面的双重检测锁模式看上去完美无缺，其实是存在问题，在多线程的情况下，可能会出现空指针问题，出现问题的原因是JVM在实例化对象的时候会进行优化和指令重排序操作。要解决双重检查锁模式带来空指针异常的问题，只需要使用 **volatile** 关键字, volatile 关键字可以保证可见性和有序性。这样就能够保证在多线程的情况下线程安全也不会有性能问题。

##### 方式4（静态内部类）

静态内部类单例模式中实例由内部类创建，由于 JVM 在加载外部类的过程中, 是不会加载静态 内部类的, 只有内部类的属性/方法被调用时才会被加载, 并初始化其静态属性。静态属性由于被 static 修饰，保证只被实例化一次，并且严格保证实例化顺序。

```java
public class Singleton {
    //私有构造方法
    private Singleton() {}
    //第一次加载Father类不会初始化INSTANCE
    private static class SingletonHolder {
        private static final Singleton INSTANCE = new Singleton();
    }
    //对外提供静态方法获取该对象，只有调用此方法时，才会加载INSTANCE
    public static Singleton getInstance() {
        return SingletonHolder.INSTANCE;
    }
}
```

静态内部类单例模式是一种优秀的单例模式，是开源项目中比较常用的一种单例模式。**在没有加任何锁的情况下，保证了多线程下的安全，并且没有任何性能影响和空间的浪费。**

### 存在问题-破坏单例模式

使上面定义的单例类（Singleton）可以创建多个对象，枚举方式除外。有两种方式，分别是**序列化**和**反射**。

#### 问题演示

##### 序列化、反序列化

```java
public class Singleton implements Serializable {
    //私有构造方法
    private Singleton() {}
    private static class SingletonHolder {
        private static final Singleton INSTANCE = new Singleton();
    }
    //对外提供静态方法获取该对象
    public static Singleton getInstance() {
        return SingletonHolder.INSTANCE;
    }
}
```

```java
public class Test {
    public static void main(String[] args) throws Exception {
        //往文件中写对象
        //writeObject2File();
        //从文件中读取对象
        Singleton s1 = readObjectFromFile();
        Singleton s2 = readObjectFromFile();
        //判断两个反序列化后的对象是否是同一个对象
        System.out.println(s1 == s2);
    }
    private static Singleton readObjectFromFile() throws Exception {
        //创建对象输入流对象
        ObjectInputStream ois = new ObjectInputStream(new
                                                      FileInputStream("C:\\Users\\Think\\Desktop\\a.txt"));
        //第一个读取Singleton对象
        Singleton instance = (Singleton) ois.readObject();
        return instance;
    }
    public static void writeObject2File() throws Exception {
        //获取Singleton类的对象
        Singleton instance = Singleton.getInstance();
        //创建对象输出流
        ObjectOutputStream oos = new ObjectOutputStream(new
                                                        FileOutputStream("C:\\Users\\Think\\Desktop\\a.txt"));
        //将instance对象写出到文件中
        oos.writeObject(instance);
    }
}
```

上面代码运行结果是 false ，表明序列化和反序列化已经破坏了单例设计模式!

##### 反射

```java
public class Singleton {
    //私有构造方法
    private Singleton() {}
    private static volatile Singleton instance;
    //对外提供静态方法获取该对象
    public static Singleton getInstance() {
        if(instance != null) {
            return instance;
        }
        synchronized (Singleton.class) {
            if(instance != null) {
                return instance;
            }
            instance = new Singleton();
            return instance;
        }
    }
}
```

```java
public class Test {
    public static void main(String[] args) throws Exception {
        //获取Singleton类的字节码对象
        Class clazz = Singleton.class;
        //获取Singleton类的私有无参构造方法对象
        Constructor constructor = clazz.getDeclaredConstructor();
        //取消访问检查
        constructor.setAccessible(true);
        //创建Singleton类的对象s1
        Singleton s1 = (Singleton) constructor.newInstance();
        //创建Singleton类的对象s2
        Singleton s2 = (Singleton) constructor.newInstance();
        //判断通过反射创建的两个Singleton对象是否是同一个对象
        System.out.println(s1 == s2);
    }
}
```

上面代码运行结果是 false ，表明序列化和反序列化已经破坏了单例设计模式！
**注意**：枚举方式不会出现这两个问题！

#### 解决方案

##### 序列化、反序列化

在Singleton类中添加 **readResolve()** 方法，在反序列化时被反射调用，如果定义了这个方法，就返回这个方法的值，如果没有定义，则返回新new出来的对象。

```java
public class Singleton implements Serializable {
    //私有构造方法
    private Singleton() {}
    private static class SingletonHolder {
        private static final Singleton INSTANCE = new Singleton();
    }
    //对外提供静态方法获取该对象
    public static Singleton getInstance() {
        return SingletonHolder.INSTANCE;
    }
    /**
     * 下面是为了解决序列化反序列化破解单例模式而定义的方法
     */
    private Object readResolve() {
        return SingletonHolder.INSTANCE;
    }
}
```

##### 反射

```java
public class Singleton {
    //私有构造方法
    private Singleton() {
        /**
         * 反射破解单例模式需要添加的代码
         */
        if(instance != null) {
            throw new RuntimeException();
        }
    }
    private static volatile Singleton instance;
    //对外提供静态方法获取该对象
    public static Singleton getInstance() {
        if(instance != null) {
            return instance;
        }
        synchronized (Singleton.class) {
            if(instance != null) {
                return instance;
            }
            instance = new Singleton();
            return instance;
        }
    }
}
```

这种方式比较好理解。当通过反射方式调用构造方法进行创建创建时，直接抛异常。不运行此中操作。

### JDK源码剖析-Runtime

```java
public class Runtime {
    private static Runtime currentRuntime = new Runtime();
    /**
* Returns the runtime object associated with the current Java
application.
* Most of the methods of class <code>Runtime</code> are instance
* methods and must be invoked with respect to the current runtime
object.
*
* @return the <code>Runtime</code> object associated with the
current
* Java application.
*/
    public static Runtime getRuntime() {
        return currentRuntime;
    }
    /** Don't let anyone else instantiate this class */
    private Runtime() {}
    ...
}
```

从上面源代码中可以看出Runtime类使用的是**饿汉式（静态属性）**方式来实现单例模式的。

```java
public class RunTimeDemo {
    public static void main(String[] args) throws IOException {
        Runtime runtime = Runtime.getRuntime();
        //返回 Java 虚拟机中的内存总量。
        System.out.println(runtime.totalMemory());
        //返回 Java 虚拟机试图使用的最大内存量。
        System.out.println(runtime.maxMemory());
        //创建一个新的进程执行指定的字符串命令，返回进程对象
        Process exec = runtime.exec("ipconfig");
        //获取命令执行后的结果，通过输入流获取
        InputStream inputStream = exec.getInputStream();
        byte[] bytes = new byte[1024 * 1024 * 100];
        int len = inputStream.read(bytes);
        //控制台默认使用GBK编码
        System.out.println(new String(bytes, 0, len, "GBK"));
        /*int len;
        byte[] bytes = new byte[1024];
        while ((len = inputStream.read(bytes)) != -1) {
            System.out.println(new String(bytes, 0, len, "GBK"));
        }*/
    }
}
```

## 工厂模式

需求：设计一个咖啡店点餐系统。 
设计一个咖啡类（Coffee），并定义其两个子类（美式咖啡【AmericanCoffee】和拿铁咖啡 
【LatteCoffee】）；再设计一个咖啡店类（CoffeeStore），咖啡店具有点咖啡的功能。 
具体类的设计如下：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/creation1.png)

```java
public abstract class Coffee {
    public abstract String getName();
    //加糖
    public void addsugar() {
        System.out.println("加糖");
    }
    //加奶
    public void addMilk() {
        System.out.println("加奶");
    }
}
```

```java
public class LatteCoffee extends Coffee {
    @Override
    public String getName() {
        return "拿铁咖啡";
    }
}
```

```java
public class AmericanCoffee extends Coffee {
    @Override
    public String getName() {
        return "美式咖啡";
    }
}
```

```java
public class CoffeeStore {
    public Coffee orderCoffee(String type) {
        //声明Coffee类型的变量，根据不同类型创建不同的coffee子类对象
        Coffee coffee = null;
        
        if("american".equals(type)) {
            coffee = new AmericanCoffee();
        } else if("latte".equals(type)) {
            coffee = new LatteCoffee();
        } else {
            throw new RuntimeException("对不起，您所点的咖啡没有");
        }
        
        //加配料
        coffee.addMilk();
        coffee.addsugar();

        return coffee;
    }
}
```

```java
public class Client {
    public static void main(String[] args) {
        //1,创建咖啡店类
        CoffeeStore store = new CoffeeStore();
        //2,点咖啡
        Coffee coffee = store.orderCoffee("american");

        System.out.println(coffee.getName());
    }
}
```

在java中，万物皆对象，这些对象都需要创建，如果创建的时候直接new该对象，就会对该对象耦合严重，假如要更换对象，所有new对象的地方都需要修改一遍，这显然违背了软件设计的开闭原则。如果使用工厂来生产对象，我们就只和工厂打交道就可以了，彻底和对象解耦，如果要更换对象，直接在工厂里更换该对象即可，达到了与对象解耦的目的；所以说，工厂模式最大的优点就是：**解耦**。 
在本教程中会介绍三种工厂的使用 

- 简单工厂模式（不属于GOF的23种经典设计模式） 
- 工厂方法模式 
- 抽象工厂模式

### 简单工厂模式

#### 概念

简单工厂不是一种设计模式，反而比较像是一种编程习惯。

简单工厂包含如下角色： 

- 抽象产品 ：定义了产品的规范，描述了产品的主要特性和功能。
- 具体产品 ：实现或者继承抽象产品的子类。
- 具体工厂 ：提供了创建产品的方法，调用者通过该方法来获取产品。

#### 实现

现在使用简单工厂对上面案例进行改进，类图如下：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/creation2.png)

```java
public abstract class Coffee {

    public abstract String getName();

    //加糖
    public void addsugar() {
        System.out.println("加糖");
    }

    //加奶
    public void addMilk() {
        System.out.println("加奶");
    }
}
```

```java
public class AmericanCoffee extends Coffee {

    @Override
    public String getName() {
        return "美式咖啡";
    }
}
```

```java
public class LatteCoffee extends Coffee {

    @Override
    public String getName() {
        return "拿铁咖啡";
    }
}
```

```java
public class SimpleCoffeeFactory {

    public Coffee createCoffee(String type) {
        //声明Coffee类型的变量，根据不同类型创建不同的coffee子类对象
        Coffee coffee = null;
        if("american".equals(type)) {
            coffee = new AmericanCoffee();
        } else if("latte".equals(type)) {
            coffee = new LatteCoffee();
        } else {
            throw new RuntimeException("对不起，您所点的咖啡没有");
        }

        return coffee;
    }
}
```

```java
public class CoffeeStore {

    public Coffee orderCoffee(String type) {

        SimpleCoffeeFactory factory = new SimpleCoffeeFactory();
        //调用生产咖啡的方法
        Coffee coffee = factory.createCoffee(type);

        //加配料
        coffee.addMilk();
        coffee.addsugar();

        return coffee;
    }
}
```

```java
public class Client {
    public static void main(String[] args) {
        //创建咖啡店类对象
        CoffeeStore store = new CoffeeStore();
        Coffee coffee = store.orderCoffee("latte");

        System.out.println(coffee.getName());
    }
}
```

#### 优缺点

- **优点：**
  
  封装了创建对象的过程，可以通过参数直接获取对象。把对象的创建和业务逻辑层分开，这样以后就避免了修改客户代码，如果要实现新产品直接修改工厂类，而不需要在原代码中修改，这样就降低了客户代码修改的可能性，更加容易扩展。 
- **缺点：**
  
  增加新产品时还是需要修改工厂类的代码，违背了“开闭原则”。

#### 扩展-静态工厂

在开发中也有一部分人将工厂类中的创建对象的功能定义为静态的，这个就是静态工厂模式，它也不是23种设计模式中的。代码如下：

```java
public class SimpleCoffeeFactory {
    public static Coffee createCoffee(String type) {
        Coffee coffee = null;
        if("americano".equals(type)) {
            coffee = new AmericanoCoffee();
        } else if("latte".equals(type)) {
            coffee = new LatteCoffee();
        }
        return coffe;
    }
}
```

### 工厂方法模式

针对上例中的缺点，使用工厂方法模式就可以完美的解决，完全遵循开闭原则。

#### 概念

定义一个用于创建对象的接口，让子类决定实例化哪个产品类对象。工厂方法使一个产品类的实例化延迟到其工厂的子类。

#### 结构

工厂方法模式的主要角色： 

- 抽象工厂（Abstract Factory）：提供了创建产品的接口，调用者通过它访问具体工厂的工厂方法来创建产品。 
- 具体工厂（ConcreteFactory）：主要是实现抽象工厂中的抽象方法，完成具体产品的创建。 
- 抽象产品（Product）：定义了产品的规范，描述了产品的主要特性和功能。 
- 具体产品（ConcreteProduct）：实现了抽象产品角色所定义的接口，由具体工厂来创建，它同具体工厂之间一一对应。

#### 实现

使用工厂方法模式对上例进行改进，类图如下：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/creation3.png)

```java
public abstract class Coffee {

    public abstract String getName();

    //加糖
    public void addSugar() {
        System.out.println("加糖");
    }

    //加奶
    public void addMilk() {
        System.out.println("加奶");
    }
}
```

```java
public class LatteCoffee extends Coffee {

    @Override
    public String getName() {
        return "拿铁咖啡";
    }
}
```

```java
public class AmericanCoffee extends Coffee {

    @Override
    public String getName() {
        return "美式咖啡";
    }
}
```

```java
public interface CoffeeFactory {
    Coffee createCoffee();
}
```

```java
public class AmericanCoffeeFactory implements CoffeeFactory{
    @Override
    public Coffee createCoffee() {
        return new AmericanCoffee();
    }
}
```

```java
public class LatteCoffeeFactory implements CoffeeFactory{
    @Override
    public Coffee createCoffee() {
        return new LatteCoffee();
    }
}
```

```java
public class CoffeeStore {
    private CoffeeFactory factory;

    public CoffeeStore(CoffeeFactory factory) {
        this.factory = factory;
    }

    public Coffee orderCoffee() {
        Coffee coffee = factory.createCoffee();
        coffee.addMilk();
        coffee.addSugar();
        return coffee;
    }

}
```

```java
public class Client {
    public static void main(String[] args) {
        CoffeeStore coffeeStore = new CoffeeStore(new AmericanCoffeeFactory());
        Coffee coffee = coffeeStore.orderCoffee();
        System.out.println(coffee.getName());
    }
}
```

#### 优缺点

- 优点
  - 用户只需要知道具体工厂的名称就可得到所要的产品，无须知道产品的具体创建过程。
  - 在系统增加新的产品时只需要添加具体产品类和对应的具体工厂类，无须对原工厂进行任何修改，满足开闭原则。
- 缺点
  - 每增加一个产品就要增加一个具体产品类和一个对应的具体工厂类，这增加了系统的复杂度。

### 抽象工厂模式

前面介绍的工厂方法模式中考虑的是一类产品的生产，如畜牧场只养动物、电视机厂只生产电视机、传智播客只培养计算机软件专业的学生等。

这些工厂只生产同种类产品，同种类产品称为同等级产品，也就是说：工厂方法模式只考虑生产同等级的产品，但是在现实生活中许多工厂是综合型的工厂，能生产多等级（种类） 的产品，如电器厂既生 

产电视机又生产洗衣机或空调，大学既有软件专业又有生物专业等。

本节要介绍的抽象工厂模式将考虑多等级产品的生产，将同一个具体工厂所生产的位于不同等级的一组产品称为一个产品族，下图所示横轴是产品等级，也就是同一类产品；纵轴是产品族，也就是同一品牌的产品，同一品牌的产品产自同一个工厂。
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/creation4.png)

#### 概念

是一种为访问类提供一个创建一组相关或相互依赖对象的接口，且访问类无须指定所要产品的具体类就能得到同族的不同等级的产品的模式结构。
抽象工厂模式是工厂方法模式的升级版本，工厂方法模式只生产一个等级的产品，而抽象工厂模式可生产多个等级的产品。

#### 结构

抽象工厂模式的主要角色如下： 

- 抽象工厂（Abstract Factory）：提供了创建产品的接口，它包含多个创建产品的方法，可以创建多个不同等级的产品。 
- 具体工厂（Concrete Factory）：主要是实现抽象工厂中的多个抽象方法，完成具体产品的创建。 
- 抽象产品（Product）：定义了产品的规范，描述了产品的主要特性和功能，抽象工厂模式有多个抽象产品。 
- 具体产品（ConcreteProduct）：实现了抽象产品角色所定义的接口，由具体工厂来创建，它同具体工厂之间是多对一的关系。

#### 实现

现咖啡店业务发生改变，不仅要生产咖啡还要生产甜点，如提拉米苏、抹茶慕斯等，要是按照工厂方法模式，需要定义提拉米苏类、抹茶慕斯类、提拉米苏工厂、抹茶慕斯工厂、甜点工厂类，很容易发生类爆炸情况。其中拿铁咖啡、美式咖啡是一个产品等级，都是咖啡；提拉米苏、抹茶慕斯也是一个产品等级；拿铁咖啡和提拉米苏是同一产品族（也就是都属于意大利风味），美式咖啡和抹茶慕斯是同一产品族（也就是都属于美式风味）。所以这个案例可以使用抽象工厂模式实现。类图如下：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/creation5.png)

```java
public abstract class Coffee {

    public abstract String getName();

    //加糖
    public void addSugar() {
        System.out.println("加糖");
    }

    //加奶
    public void addMilk() {
        System.out.println("加奶");
    }
}
```

```java
public class AmericanCoffee extends Coffee {

    @Override
    public String getName() {
        return "美式咖啡";
    }
}
```

```java
public class LatteCoffee extends Coffee {

    @Override
    public String getName() {
        return "拿铁咖啡";
    }
}
```

```java
public abstract class Dessert {
    public abstract String getName();
}
```

```java
public class MatchaMousse extends Dessert {
    @Override
    public String getName() {
        return  "抹茶慕斯";
    }
}
```

```java
public class Tiramisu extends Dessert {
    @Override
    public String getName() {
        return "提拉米苏";
    }
}
```

```java
public interface DessertFactory {
    Coffee createCoffee();
    Dessert createDessert();
}
```

```java
public class AmericanFactory implements DessertFactory {

    @Override
    public Coffee createCoffee() {
        return new AmericanCoffee();
    }

    @Override
    public Dessert createDessert() {
        //抹茶慕斯是美式风味的
        return new MatchaMousse();
    }
}
```

```java
public class ItalyFactory implements DessertFactory {

    @Override
    public Coffee createCoffee() {
        return new LatteCoffee();
    }

    @Override
    public Dessert createDessert() {
        //提拉米苏属于意大利风味
        return new Tiramisu();
    }
}
```

```java
public class CoffeeStore {
    private AmericanFactory americanDessertFactory;
    private ItalyFactory italyDessertFactory;

    public CoffeeStore(AmericanFactory americanDessertFactory) {
        this.americanDessertFactory = americanDessertFactory;
    }

    public CoffeeStore(ItalyFactory italyDessertFactory) {
        this.italyDessertFactory = italyDessertFactory;
    }

    public Coffee orderCoffee() {
        if (americanDessertFactory != null) {
            return americanDessertFactory.createCoffee();
        }
        return italyDessertFactory.createCoffee();
    }

    public Dessert orderDessert() {
        if (americanDessertFactory != null) {
            return americanDessertFactory.createDessert();
        }
        return italyDessertFactory.createDessert();
    }
}
```

```java
public class Client {
    public static void main(String[] args) {
        //咖啡店：美式咖啡、甜点
        CoffeeStore coffeeStore = new CoffeeStore(new AmericanFactory());
        Coffee coffee = coffeeStore.orderCoffee();
        System.out.println(coffee.getName());
        Dessert dessert = coffeeStore.orderDessert();
        System.out.println(dessert.getName());
        System.out.println("-------");
        //咖啡店：意式咖啡、甜点
        CoffeeStore italyStore = new CoffeeStore(new ItalyFactory());
        System.out.println(italyStore.orderCoffee().getName());
        System.out.println(italyStore.orderDessert().getName());
    }
}
```

如果要加同一个产品族的话，只需要再加一个对应的工厂类即可，不需要修改其他的类。

#### 优缺点

- **优点 **
  - 当一个产品族中的多个对象被设计成一起工作时，它能保证客户端始终只使用同一个产品族中的对象。 
- **缺点**
  - 当产品族中需要增加一个新的产品时，所有的工厂类都需要进行修改

#### 使用场景

当需要创建的对象是一系列相互关联或相互依赖的产品族时，如电器工厂中的电视机、洗衣机、空调等。

系统中有多个产品族，但每次只使用其中的某一族产品。如有人只喜欢穿某一个品牌的衣服和鞋。

系统中提供了产品的类库，且所有产品的接口相同，客户端不依赖产品实例的创建细节和内部结构。

如：输入法换皮肤，一整套一起换。生成不同操作系统的程序。

### 模式扩展

**简单工厂+配置文件解除耦合 **
可以通过工厂模式+配置文件的方式解除工厂对象和产品对象的耦合。在工厂类中加载配置文件中的全类名，并创建对象进行存储，客户端如果需要对象，直接进行获取即可。

```properties
american=pattern.constructor.factory.config_factory.AmericanCoffee
latte=pattern.constructor.factory.config_factory.LatteCoffee
```

```java
public class CoffeeFactory {
    private static final Map<String, Coffee> map = new HashMap<>();
    static {
        Properties properties = new Properties();
        InputStream is =
                CoffeeFactory.class.getClassLoader().getResourceAsStream("bean.properties");
        try {
            properties.load(is);
            //遍历Properties集合对象
            Set<Object> keys = properties.keySet();
            for (Object key : keys) {
                //根据键获取值（全类名）
                String className = properties.getProperty((String) key);
                //获取字节码对象
                Class clazz = Class.forName(className);
                Constructor constructor = clazz.getConstructor();
                Coffee coffee = (Coffee) constructor.newInstance();
                map.put((String) key, coffee);
            }
        } catch (IOException | ClassNotFoundException | NoSuchMethodException | InvocationTargetException | InstantiationException | IllegalAccessException e) {
            e.printStackTrace();
        }
    }

    public static Coffee createCoffee(String name) {
        return map.get(name);
    }
}
```

静态成员变量用来存储创建的对象（键存储的是名称，值存储的是对应的对象），而读取配置文件以及创建对象写在静态代码块中，目的就是只需要执行一次。

### **JDK源码解析-Collection.iterator方法**

```java
public class Demo {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>();
        list.add("令狐冲");
        list.add("风清扬");
        list.add("任我行");
        //获取迭代器对象
        Iterator<String> it = list.iterator();
        //使用迭代器遍历
        while(it.hasNext()) {
            String ele = it.next();
            System.out.println(ele);
        }
    }
}
```

对上面的代码大家应该很熟，使用迭代器遍历集合，获取集合中的元素。而单列集合获取迭代器的方法就使用到了**工厂方法**模式。我们看通过类图看看结构：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/creation6.png)
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/creation7.png)
Collection接口是抽象工厂类，ArrayList是具体的工厂类；Iterator接口是抽象商品类，ArrayList类中的Iter内部类是具体的商品类。在具体的工厂类中iterator()方法创建具体的商品类的对象。
另外：

1. DateForamt类中的getInstance()方法使用的是工厂模式；
2. Calendar类中的getInstance()方法使用的是工厂模式；

## 原型模式

### 概念

用一个已经创建的实例作为原型，通过复制该原型对象来创建一个和原型对象相同的新对象。

### 结构

原型模式包含如下角色： 

- 抽象原型类：规定了具体原型对象必须实现的的 clone() 方法。 
- 具体原型类：实现抽象原型类的 clone() 方法，它是可被复制的对象。 
- 访问类：使用具体原型类中的 clone() 方法来复制新的对象。

### 实现

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/creation8.png)
原型模式的克隆分为**浅克隆**和**深克隆**。

- 浅克隆：创建一个新对象，新对象的属性和原来对象完全相同，对于非基本类型属性，仍指向有属性所指向的对象的内存地址。
- 深克隆：创建一个新对象，属性中引用的其他对象也会被克隆，不再指向原有对象地址。

Java中的Object类中提供了 clone() 方法来实现浅克隆。 Cloneable 接口是上面的类图中的抽象原型类，而实现了Cloneable接口的子实现类就是具体的原型类。
代码如下：

```java
public class Realizetype implements Cloneable {
    public Realizetype() {
        System.out.println("具体的原型对象创建完成！");
    }
    @Override
    protected Realizetype clone() throws CloneNotSupportedException {
        System.out.println("具体原型复制成功！");
        return (Realizetype) super.clone();
    }
}
```

```java
public class PrototypeTest {
    public static void main(String[] args) throws CloneNotSupportedException
    {
        Realizetype r1 = new Realizetype();
        Realizetype r2 = r1.clone();
        System.out.println("对象r1和r2是同一个对象？" + (r1 == r2));	//false
    }
}
```

### 案例

**用原型模式生成“三好学生”奖状**
同一学校的“三好学生”奖状除了获奖人姓名不同，其他都相同，可以使用原型模式复制多个“三好学生”奖状出来，然后在修改奖状上的名字即可。
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/creation9.png)

```java
//奖状类
public class Citation implements Cloneable {
    private String name;
    public void setName(String name) {
        this.name = name;
    }
    public String getName() {
        return (this.name);
    }
    public void show() {
        System.out.println(name + "同学：在2020学年第一学期中表现优秀，被评为三好学生。特发此状！");
    }
    @Override
    public Citation clone() throws CloneNotSupportedException {
        return (Citation) super.clone();
    }
}
```

```java
//测试访问类
public class CitationTest {
    public static void main(String[] args) throws
    CloneNotSupportedException {
        Citation c1 = new Citation();
        c1.setName("张三");
        //复制奖状
        Citation c2 = c1.clone();
        //将奖状的名字修改李四
        c2.setName("李四");
        c1.show();
        c2.show();
    }
}
```

### 使用场景

对象的创建非常复杂，可以使用原型模式快捷的创建对象。性能和安全要求比较高。

### 深克隆

将上面的“三好学生”奖状的案例中Citation类的name属性修改为Student类型的属性。代码如下：

```java
public class Citation implements Cloneable {
    private Student student;

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public void show() {
        System.out.println(student.getName() + "表现良好，特发此证！");
    }

    @Override
    protected Citation clone() throws CloneNotSupportedException {
        return (Citation) super.clone();
    }
}

class Student {
    private String name;

    public Student(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

```java
public class CitationTest01 {
    public static void main(String[] args) throws CloneNotSupportedException {
        Citation c1 = new Citation();
        Student stu1 = new Student("张三");
        c1.setStudent(stu1);

        Citation c2 = c1.clone();
        Student stu2 = c2.getStudent();
        stu2.setName("李四");

        System.out.println("stu和stu1是同一个对象？" + (stu2 == stu1)); //true
        c1.show();
        c2.show();
    }
}
```

运行结果：

```text
stu和stu1是同一个对象？true
李四表现良好，特发此证！
李四表现良好，特发此证！
```

说明：
stu对象和stu1对象是同一个对象，就会产生将stu1对象中name属性值改为“李四”，两个Citation（奖状）对象中显示的都是李四。这就是浅克隆的效果，对具体原型类（Citation)中的引用类型的属性进行引用的复制。这种情况需要使用深克隆，而进行深克隆需要使用对象流。

代码如下：

```java
public class CitationTest02 {
    public static void main(String[] args) throws CloneNotSupportedException, IOException, ClassNotFoundException {
        Citation c1 = new Citation();
        Student stu1 = new Student("张三");
        c1.setStudent(stu1);

        //创建对象输出流对象
        ObjectOutputStream oos =
                new ObjectOutputStream(new FileOutputStream("F:/Java/b.txt"));
        //将c1对象写入到文件中
        oos.writeObject(c1);
        oos.close();

        //创建对象出入流对象
        ObjectInputStream ois =
                new ObjectInputStream(new FileInputStream("F:/Java/b.txt"));
        Citation c2 = (Citation) ois.readObject();
        Student stu2 = c2.getStudent();
        stu2.setName("李四");

        System.out.println("stu和stu1是同一个对象？" + (stu2 == stu1));
        c1.show();
        c2.show();
    }
}
```

结果：

```text
stu和stu1是同一个对象？false
张三表现良好，特发此证！
李四表现良好，特发此证！
```

由于使用了串行化，前面两个类也需要实现Serializable接口，否则会抛出NotSerializableException异常。

## 建造者模式

### 概念

将一个复杂对象的构建与表示分离，使得同样的构建过程可以创建不同的表示。
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/creation10.png)

- 分离了部件的构造(由Builder来负责)和装配(由Director负责)。 从而可以构造出复杂的对象。这个模式适用于：某个对象的构建过程复杂的情况。
- 由于实现了构建和装配的解耦。不同的构建器，相同的装配，也可以做出不同的对象；相同的构建器，不同的装配顺序也可以做出不同的对象。也就是实现了构建算法、装配算法的解耦，实现了更好的复用。
- 建造者模式可以将部件和其组装过程分开，一步一步创建一个复杂的对象。用户只需要指定复杂对象的类型就可以得到该对象，而无须知道其内部的具体构造细节。

### 结构

建造者（Builder）模式包含如下角色： 

- 抽象建造者类（Builder）：这个接口规定要实现复杂对象的那些部分的创建，并不涉及具体的部件对象的创建。 
- 具体建造者类（ConcreteBuilder）：实现 Builder 接口，完成复杂产品的各个部件的具体创建方法。在构造过程完成后，提供产品的实例。
- 产品类（Product）：要创建的复杂对象。
- 指挥者类（Director）：调用具体建造者来创建复杂对象的各个部分，在指导者中不涉及具体产品的信息，只负责保证对象各部分完整创建或按某种顺序创建。 

类图如下：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/creation11.png)

### 实例

**创建共享单车 **
生产自行车是一个复杂的过程，它包含了车架，车座等组件的生产。而车架又有碳纤维，铝合金等材质的，车座有橡胶，真皮等材质。对于自行车的生产就可以使用建造者模式。 
这里Bike是产品，包含车架，车座等组件；Builder是抽象建造者，MobikeBuilder和OfoBuilder是具体的建造者；Director是指挥者。
类图如下：
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/software-engineering/creation12.png)

```java
public class Bike {
    private String frame;
    private String seat;
    public String getFrame() {
        return frame;
    }
    public void setFrame(String frame) {
        this.frame = frame;
    }
    public String getSeat() {
        return seat;
    }
    public void setSeat(String seat) {
        this.seat = seat;
    }
}
```

```java
public abstract class Builder {
    protected Bike mBike = new Bike();
    public abstract void buildFrame();
    public abstract void buildSeat();
    public abstract Bike createBike();
}
```

```java
public class MobikeBuilder extends Builder {
    @Override
    public void buildFrame() {
        mBike.setFrame("铝合金车架");
    }
    @Override
    public void buildSeat() {
        mBike.setSeat("真皮车座");
    }
    @Override
    public Bike createBike() {
        return mBike;
    }
}
```

```java
public class OfoBuilder extends Builder {
    @Override
    public void buildFrame() {
        mBike.setFrame("碳纤维车架");
    }
    @Override
    public void buildSeat() {
        mBike.setSeat("橡胶车座");
    }
    @Override
    public Bike createBike() {
        return mBike;
    }
}
```

```java
public class Director {
    private Builder mBuilder;
    public Director(Builder builder) {
        mBuilder = builder;
    }
    public Bike construct() {
        mBuilder.buildFrame();
        mBuilder.buildSeat();
        return mBuilder.createBike();
    }
}
```

```java
public class Client {
    public static void main(String[] args) {
        showBike(new OfoBuilder());
        showBike(new MobikeBuilder());
    }
    private static void showBike(Builder builder) {
        Director director = new Director(builder);
        Bike bike = director.construct();
        System.out.println(bike.getFrame());
        System.out.println(bike.getSeat());
    }
}
```

注意：
上面示例是 Builder 模式的常规用法，指挥者类 Director 在建造者模式中具有很重要的作用，它用于指导具体构建者如何构建产品，控制调用先后次序，并向调用者返回完整的产品类，但是有些情况下需要简化系统结构，可以把指挥者类和抽象建造者进行结合。

```java
// 抽象 builder 类
public abstract class Builder {
    protected Bike mBike = new Bike();
    public abstract void buildFrame();
    public abstract void buildSeat();
    public abstract Bike createBike();
    public Bike construct() {
        this.buildFrame();
        this.BuildSeat();
        return this.createBike();
    }
}
```

这样做确实简化了系统结构，但同时也加重了抽象建造者类的职责，也不是太符合单一职责原则，如果construct() 过于复杂，建议还是封装到 Director 中。

### 优缺点

**优点： **

- 建造者模式的封装性很好。使用建造者模式可以有效的封装变化，在使用建造者模式的场景中，一 般产品类和建造者类是比较稳定的，因此，将主要的业务逻辑封装在指挥者类中对整体而言可以取得比较好的稳定性。
- 在建造者模式中，客户端不必知道产品内部组成的细节，将产品本身与产品的创建过程解耦，使得相同的创建过程可以创建不同的产品对象。
- 可以更加精细地控制产品的创建过程 。将复杂产品的创建步骤分解在不同的方法中，使得创建过程更加清晰，也更方便使用程序来控制创建过程。
- 建造者模式很容易进行扩展。如果有新的需求，通过实现一个新的建造者类就可以完成，基本上不用修改之前已经测试通过的代码，因此也就不会对原有功能引入风险。符合开闭原则。 

**缺点： **

- 建造者模式所创建的产品一般具有较多的共同点，其组成部分相似，如果产品之间的差异性很大，则不适合使用建造者模式，因此其使用范围受到一定的限制。

### 使用场景

建造者（Builder）模式创建的是复杂对象，其产品的各个部分经常面临着剧烈的变化，但将它们组合在一起的算法却相对稳定，所以它通常在以下场合使用。

- 创建的对象较复杂，由多个部件构成，各部件面临着复杂的变化，但构件间的建造顺序是稳定的。 
- 创建复杂对象的算法独立于该对象的组成部分以及它们的装配方式，即产品的构建过程和最终的表示是独立的。

### 模式扩展

建造者模式除了上面的用途外，在开发中还有一个常用的使用方式，就是当一个类构造器需要传入很多参数时，如果创建这个类的实例，代码可读性会非常差，而且很容易引入错误，此时就可以利用建造者模式进行重构。
重构前：

```java
public class Phone {
    private String cpu;
    private String screen;
    private String memory;
    private String mainboard;
    public Phone(String cpu, String screen, String memory, String
                 mainboard) {
        this.cpu = cpu;
        this.screen = screen;
        this.memory = memory;
        this.mainboard = mainboard;
    }
    public String getCpu() {
        return cpu;
    }
    public void setCpu(String cpu) {
        this.cpu = cpu;
    }
    public String getScreen() {
        return screen;
    }
    public void setScreen(String screen) {
        this.screen = screen;
    }
    public String getMemory() {
        return memory;
    }
    public void setMemory(String memory) {
        this.memory = memory;
    }
    public String getMainboard() {
        return mainboard;
    }
    public void setMainboard(String mainboard) {
        this.mainboard = mainboard;
    }
    @Override
    public String toString() {
        return "Phone{" +
            "cpu='" + cpu + '\'' +
            ", screen='" + screen + '\'' +
            ", memory='" + memory + '\'' +
            ", mainboard='" + mainboard + '\'' +
            '}';
    }
}
```

```java
public class Client {
    public static void main(String[] args) {
        //构建Phone对象
        Phone phone = new Phone("intel","三星屏幕","金士顿","华硕");
        System.out.println(phone);
    }
}
```

重构后：

```java
public class Phone {

    private String cpu;
    private String screen;
    private String memory;
    private String mainboard;

    //私有构造方法
    private Phone(Builder builder) {
        this.cpu = builder.cpu;
        this.screen = builder.screen;
        this.memory = builder.memory;
        this.mainboard = builder.mainboard;
    }

    @Override
    public String toString() {
        return "Phone{" +
                "cpu='" + cpu + '\'' +
                ", screen='" + screen + '\'' +
                ", memory='" + memory + '\'' +
                ", mainboard='" + mainboard + '\'' +
                '}';
    }

    public static final class Builder {
        private String cpu;
        private String screen;
        private String memory;
        private String mainboard;

        public Builder cpu(String cpu) {
            this.cpu = cpu;
            return this;
        }
        public Builder screen(String screen) {
            this.screen = screen;
            return this;
        }
        public Builder memory(String memory) {
            this.memory = memory;
            return this;
        }
        public Builder mainboard(String mainboard) {
            this.mainboard = mainboard;
            return this;
        }

        //使用构建者创建Phone对象
        public Phone build() {
            return new Phone(this);
        }
    }
}
```

```java
public class Client {
    public static void main(String[] args) {
        //创建手机对象   通过构建者对象获取手机对象
        Phone phone = new Phone.Builder()
                .cpu("intel")
                .screen("三星屏幕")
                .memory("金士顿内存条")
                .mainboard("华硕主板")
                .build();

        System.out.println("phone = " + phone);
    }
}
```

当构造方法需要传很多参数时，可以使用这种方式。

## 创建者模式对比

### 工厂方法模式VS建造者模式

工厂方法模式注重的是整体对象的创建方式；而建造者模式注重的是部件构建的过程，意在通过一步一步地精确构造创建出一个复杂的对象。
我们举个简单例子来说明两者的差异，如要制造一个超人，如果使用工厂方法模式，直接产生出来的就是一个力大无穷、能够飞翔、内裤外穿的超人；而如果使用建造者模式，则需要组装手、头、脚、躯干等部分，然后再把内裤外穿，于是一个超人就诞生了。

### 抽象工厂模式VS建造者模式

抽象工厂模式实现对产品家族的创建，一个产品家族是这样的一系列产品：具有不同分类维度的产品组合，采用抽象工厂模式则是不需要关心构建过程，只关心什么产品由什么工厂生产即可。 
建造者模式则是要求按照指定的蓝图建造产品，它的主要目的是通过组装零配件而产生一个新产品。
如果将抽象工厂模式看成汽车配件生产工厂，生产一个产品族的产品，那么建造者模式就是一个汽车组装工厂，通过对部件的组装可以返回一辆完整的汽车。