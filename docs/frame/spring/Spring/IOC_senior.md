---
title: IOC-进阶
shortTitle: IOC-进阶
description: 
date: 2024-06-16 21:24:02
categories: [Spring]
tags: []
---
## BeanFactory与ApplicationContext
1. BeanFactory是Spring的早期接口，称为Spring的Bean工厂，ApplicationContext是后期更高级接口，称之为 Spring 容器； 
2. ApplicationContext在BeanFactory基础上对功能进行了扩展，例如：监听功能、国际化功能等。BeanFactory的API更偏向底层，ApplicationContext的API大多数是对这些底层API的封装；
3. Bean创建的主要逻辑和功能都被封装在BeanFactory中，ApplicationContext不仅继承了BeanFactory，而且 ApplicationContext内部还维护着BeanFactory的引用，所以，ApplicationContext与BeanFactory既有继承关系，又有融合关系。 
4. Bean的初始化时机不同，原始BeanFactory是在首次调用getBean时才进行Bean的创建，而ApplicationContext则是配置文件加载，容器一创建就将Bean都实例化并初始化好。 

ApplicationContext除了继承了BeanFactory外，还继承了ApplicationEventPublisher（事件发布器）、ResouresPatternResolver（资源解析器）、MessageSource（消息资源）等。但是ApplicationContext的核心功能还是BeanFactory。applicationContext内部还维护着beanFactory的引用。
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/spring/spring/202406171711714.png)
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/spring/spring/202406171711971.png)

## BeanFactory和FacotryBean

- BeanFactory：Spring IOC容器的顶级对象，翻译为“Bean工厂”，负责创建对象。
- FactoryBean：是一个Bean，用于辅助Spring实例化其它Bean对象的一个Bean。
   - Spring中，Bean可以分为普通Bean和工厂Bean，工厂Bean也是一种Bean，只不过较为特殊。
## Spring后处理器
### Bean工厂后处理器 – BeanFactoryPostProcessor
postProcessBeanFactory的参数本质就是 DefaultListableBeanFactory，拿到BeanFactory的引用，自然就可以对beanDefinitionMap中的BeanDefinition进行操作了 ，例如把配置文件中原本的Bean修改成其他Bean、注入原本不存在配置文件中的Bean……
BeanFactoryPostProcessor是在所有BeanDefinition加载完毕后执行的一次操作.
```java
public class MyBeanFactoryPostProcessor implements BeanFactoryPostProcessor {
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory configurableListableBeanFactory) throws BeansException {
        /* System.out.println("通过自定义BeanFactoryPostProcessor将FruitService注入成了Rubbish"); */
        BeanDefinition beanDefinition = configurableListableBeanFactory.getBeanDefinition("fruitService");
        beanDefinition.setBeanClassName("com.qzy.service.impl.Rubbish");

        /* System.out.println("没有在XML配置文件中配置Bean，在BeanFactory后处理器中自定义添加BeanDefinition实现DrinkDao的注入"); */
        DefaultListableBeanFactory listableBeanFactory = (DefaultListableBeanFactory) configurableListableBeanFactory;
        RootBeanDefinition rootBeanDefinition = new RootBeanDefinition();
        rootBeanDefinition.setBeanClassName("com.qzy.dao.impl.DrinkDaoImpl");
        listableBeanFactory.registerBeanDefinition("drinkDao", rootBeanDefinition);

        System.out.println("step-3 =》 调用了MyBeanFactoryPostProcessor的postProcessBeanFactory方法");
    }
}
```
```xml
<!-- 不需要id,只需要class,配置完毕后自动生效 -->
<bean class="com.qzy.processor.MyBeanFactoryPostProcessor"/>
```
将new出来的对象加入IOC容器
```java
Fruit fruit = new Fruit();
DefaultListableBeanFactory factory = new DefaultListableBeanFactory();
factory.registerSingleton("Fruit", fruit);
Fruit bean = factory.getBean("Fruit", Fruit.class);
System.out.println("fruit == bean ？ -> " + (fruit == bean));	//true
```
#### BeanDefinitionRegistryPostProcessor
BeanDefinitionRegistryPostProcessor是BeanFactoryPostProcessor的子接口，专用于注测BeanDefinition。
```java
public class MyBeanDefinitionRegistryPostProcessor implements BeanDefinitionRegistryPostProcessor {
    /**
     * 自己（BeanDefinitionRegistryPostProcessor）的方法
     */
    @Override
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry beanDefinitionRegistry) throws BeansException {
        System.out.println("step-1 =》 调用了MyBeanDefinitionRegistryPostProcessor的postProcessBeanDefinitionRegistry方法");
        RootBeanDefinition beanDefinition = new RootBeanDefinition();
        beanDefinition.setBeanClassName("com.qzy.dao.impl.EatDaoImpl");
        beanDefinitionRegistry.registerBeanDefinition("eatDao", beanDefinition);
    }
    /**
     * 父类（BeanFactoryPostProcessor）的方法
     */
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory configurableListableBeanFactory) throws BeansException {
        System.out.println("step-2 =》 调用了MyBeanDefinitionRegistryPostProcessor的postProcessBeanFactory方法");
    }
}
```
### Bean后处理器 – BeanPostProcessor
Bean被实例化后，到最终缓存到名为singletonObjects单例池之前，中间会经过Bean的初始化过程，例如：属性的填充、初始方法init的执行等，其中有一个对外进行扩展的点BeanPostProcessor，我们称为Bean后处理。跟上面的Bean工厂后处理器相似，它也是一个接口，实现了该接口并被容器管理的BeanPostProcessor，会在流程节点上被Spring自动调用。
```java
public class MyBeanPostProcessor implements BeanPostProcessor {
    /**
     * 可以对创建好的Bean在插入SingletonMap之前执行一些操作
     */
    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {

        //在配置文件中不初始化Bean的EatDao属性，此处获得Bean之后手动添加
        if (bean instanceof MyBeanPostServiceImpl) {
            MyBeanPostServiceImpl myBeanPostService = (MyBeanPostServiceImpl) bean;
            myBeanPostService.setEatDao(new EatDaoImpl());
        }
        System.out.println("postProcessBeforeInitialization……");
        return null;
    }

    /**
     * Bean后置处理器，可用于增强代码块
     * Spring中的许多增强实现如AOP、整合第三方Bean大多是通过生命周期中各个方法(init、initialingBean、前后处理器……)完成的
     */
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        System.out.println("postProcessAfterInitialization……");
        // MyBeanPostServiceImpl myBeanPostService = (MyBeanPostServiceImpl) bean;
        //  return Proxy.newProxyInstance(myBeanPostService.getClass().getClassLoader(), myBeanPostService.getClass().getInterfaces(), (proxy, method, args) -> {
        //      System.out.println("增强代码块：当前时间-Begin" + LocalDateTime.now());
        //      Object result = method.invoke(myBeanPostService, args);
        //      System.out.println("增强代码块：当前时间-End" + LocalDateTime.now());
        //      return result;
        //  });
        return null;
    }
}

```
```xml
<bean id="myBeanPostService" class="com.qzy.service.impl.MyBeanPostServiceImpl" init-method="init"/>
<bean class="com.qzy.processor.MyBeanPostProcessor"/>
```
## Bean实例化基本流程
详细流程往下看

1. 加载xml配置文件，解析获取配置中的每个`<bean>`的信息，封装成一个个的`BeanDefinition`对象;
2. 将`BeanDefinition`存储在一个名为`beanDefinitionMap`的`Map<String,BeanDefinition>`中;
3. `ApplicationContext`底层遍历`beanDefinitionMap`，利用反射创建Bean实例对象;
4. 创建好的Bean实例对象，被存储到一个名为`singletonObjects的Map<String,Object>`中;
5. 当执行`applicationContext.getBean(beanName)`时，从`singletonObjects`去匹配Bean实例返回。
## Bean的生命周期
Spring Bean的生命周期是从 Bean 实例化之后，即通过反射创建出对象之后，到Bean成为一个完整对象，最终存储到单例池中，这个过程被称为Spring Bean的生命周期。Spring Bean的生命周期大体上分为三个阶段：

1. Bean的实例化阶段：Spring框架会取出BeanDefinition的信息进行判断当前Bean的范围是否是singleton的，是否不是延迟加载的，是否不是FactoryBean等，最终将一个普通的singleton的Bean通过反射进行实例化。
2. Bean的初始化阶段：Bean创建之后还仅仅是个"半成品"，还需要对Bean实例的属性进行填充、执行一些Aware接口方法、执行BeanPostProcessor方法、执行InitializingBean接口的初始化方法、执行自定义初始化init方法等。该阶段是Spring最具技术含量和复杂度的阶段，Aop增强功能，后面要学习的Spring的注解功能等、spring高频面试题Bean的循环引用问题都是在这个阶段体现的；
3. Bean的完成阶段：经过初始化阶段，Bean就成为了一个完整的Spring Bean，被存储到单例池singletonObjects中去了，即完成了Spring Bean的整个生命周期。

**注意：**

- Spring容器只对singleton的Bean进行完整的生命周期管理。
- 如果是prototype作用域的Bean，Spring容器只负责将Bean初始化完毕。等客户端程序一旦获取到Bean之后，Spring容器就不再管理该对象的生命周期了。即不负责最后两步（检查是否实现了DisposableBean接口，并调用该方法、销毁Bean）
### 生命周期一览图
| **黑色字** | **五步法** |
| :-: | :-: |
| **蓝色字** | **七步法** |
| **红色字** | **十步法** |

![](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/spring/spring/202406171712366.jpeg)
### 初始化阶段

1. Bean实例进行set属性填充
- 注入普通属性，String、int或存储基本类型的集合时，直接通过set方法的反射设置进去；
- 注入单向对象引用属性时，从容器中getBean获取后通过set方法反射设置进去，如果容器中没有，则先创建被注入对象Bean实例（完成整个生命周期）后，在进行注入操作；
- 注入双向对象引用属性时，就比较复杂了，涉及了循环引用（循环依赖）问题。
2. Aware接口属性注入
3. BeanPostProcessor的before()方法回调
4. InitializingBean接口的初始化方法回调
5. 自定义初始化方法init回调
6. BeanPostProcessor的after()方法回调
#### 初始化阶段一览图
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/spring/spring/202406171712104.png)
##### Aware接口
Aware是一个具有标识作用的超级接口，具体实现是由子接口去决定的，但是子接口至少要有一个带一个参数的且返回是空的方法。
● 实现该接口的bean是具有被spring 容器通知的能力的，而被通知的方式就是通过回调。
● 也就是说：直接或间接实现了这个接口的类，都具有被spring容器通知的能力。
● 比如实现了ApplicationContextAware接口的类，能够获取到ApplicationContext，实现了BeanFactoryAware接口的类，能够获取到BeanFactory对象。
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/spring/spring/202406171712162.png)

```java
public class AwareImpl implements ApplicationContextAware, BeanFactoryAware, BeanNameAware, BeanClassLoaderAware {
    @Override
    public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
        System.out.println("beanFactory = " + beanFactory);
    }

    @Override
    public void setBeanName(String beanName) {
        System.out.println("beanName = " + beanName);
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        System.out.println("applicationContext = " + applicationContext);
    }

    @Override
    public void setBeanClassLoader(ClassLoader classLoader) {
        System.out.println("classLoader = " + classLoader);
    }
}
```
#### 循环依赖
##### singleton + setter模式
在这种模式下的循环依赖没有任何问题！
该模式下Spring对Bean的管理主要分为清晰的两个阶段:

- 第一个阶段:在Spring容器加载的时候，实例化Bean，只要其中任意一个Bean实例化之后，马上进行“曝光”【不等属性赋值就曝光】
- 第二个阶段:Bean”曝光"”之后，再进行属性的赋值(调用set方法。)。

核心解决方案是:实例化对象和对象的属性赋值分为两个阶段来完成的。
**注意:**只有在scope是singleton（二者任意一个）的情况下，Bean才会采取提前“曝光”的措施。
##### singleton + 构造方法
结论：有问题！
对象A在使用构造方法创建时必须将另外一个引用对象赋值完成后才能结束，不能像singleton + setter模式下进行“曝光”处理。
##### Spring的解决方案
Spring提供了三级缓存存储 完整Bean实例 和 半成品Bean实例 ，用于解决循环引用问题
```java
public class DefaultSingletonBeanRegistry ... {
    //1、最终存储单例Bean成品的容器，即实例化和初始化都完成的Bean，称之为"一级缓存"
    Map<String, Object> singletonObjects = new ConcurrentHashMap(256);
    //2、早期Bean单例池，缓存半成品对象，只实例化但未被初始化，且当前对象已经被其他对象引用了，称之为"二级缓存"
    Map<String, Object> earlySingletonObjects = new ConcurrentHashMap(16);
    //3、单例Bean的工厂池，缓存半成品对象，存储创建单例对象时所用的那个工厂对象，对象未被引用，使用时在通过工厂创建Bean，称之为"三级缓存"
    Map<String, ObjectFactory<?>> singletonFactories = new HashMap(16);
}
```
案例：UserService和UserDao的循环依赖
UserService 实例化对象，但尚未初始化，将UserService存储到三级缓存；
UserService 属性注入，需要UserDao，从缓存中获取，没有UserDao；
UserDao实例化对象，但尚未初始化，将UserDao存储到到三级缓存；
UserDao属性注入，需要UserService，从三级缓存获取UserService，UserService从三级缓存移入二级缓存；
UserDao执行其他生命周期过程，最终成为一个完成Bean，存储到一级缓存，删除二三级缓存；
UserService 注入UserDao；
UserService执行其他生命周期过程，最终成为一个完成Bean，存储到一级缓存，删除二三级缓存。
