---
title: AOP
shortTitle: AOP
description: 
date: 2024-06-16 21:25:02
categories: [Spring]
tags: []
---
## 动态代理
| 代理技术 | 使用条件 | 配置方式 |
| --- | --- | --- |
| JDK 动态代理技术 | 目标类有接口，是基于接口动态生成实现类的代理对象 | 目标类有接口的情况下，默认方式 |
| Cglib 动态代理技术 | 目标类无接口且不能使用final修饰，是基于被代理对象动态生成子对象为代理对象 | 目标类无接口时，默认使用该方式；目标类有接口时，手动配置<aop:config proxy-target-class=“true”>强制使用Cglib方式 |

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/spring/spring/202406171713524.png)
```java
Target target = new Target();//目标对象
Advices advices = new Advices();//通知对象
Enhancer enhancer = new Enhancer();//增强器对象
enhancer.setSuperclass(Target.class);//增强器设置父类
//增强器设置回调
enhancer.setCallback((MethodInterceptor) (o, method, objects, methodProxy) -> {
    advices.before();
    Object result = method.invoke(target, objects);
    advices.afterReturning();
    return result;
});
//创建代理对象
Target targetProxy = (Target) enhancer.create();
//测试
String result = targetProxy.show("haohao");
```
## AOP7大术语
| 概念  | 单词 | 解释 |
| --- | --- | --- |
| 目标对象 | Target | 被增强的方法所在的对象 |
| 代理对象 | Proxy | 对目标对象进行增强后的对象，客户端实际调用的对象 |
| 连接点 | Joinpoint | 目标对象中可以被增强的方法 |
| 切入点 | Pointcur | 目标对象中实际被增强的方法 |
| 通知/增强 | Advice | 增强部分的代码逻辑 |
| 切面 | Aspect | 增强和切入点的组合 |
| 织入 | Weaving | 将通知和切入点组合动态组合的过程 |

## 切点表达式
切点表达式是配置要对哪些连接点（哪些类的哪些方法）进行通知的增强，语法如下：
> execution([访问修饰符]返回值类型 包名.类名.方法名(参数))

其中：

- 访问修饰符可以省略不写；
- 返回值类型、某一级包名、类名、方法名 可以使用 * 表示任意；
- 包名与类名之间使用单点 . 表示该包下的类，使用双点 .. 表示该包及其子包下的类；
- 参数列表可以使用两个点 .. 表示任意参数。
> //表示访问修饰符为public、无返回值、在com.qzy.aop包下的TargetImpl类的无参方法show
> execution(public void com.qzy.aop.TargetImpl.show())
> //表述com.qzy.aop包下的TargetImpl类的任意方法
> execution(* com.qzy.aop.TargetImpl.*(..))
> //表示com.qzy.aop包下的任意类的任意方法
> execution(* com.qzy.aop.*.*(..))
> //表示com.qzy.aop包及其子包下的任意类的任意方法
> execution(* com.qzy.aop..*.*(..))
> //表示任意包中的任意类的任意方法
> execution(* *..*.*(..))

## 五种通知类型
|  通知名称 |  配置方式 |  执行时机 |
| --- | --- | --- |
| 前置通知 | < aop:before > | 目标方法执行之前执行 |
| 后置通知 | < aop:after-returning > | 目标方法执行之后执行，目标方法异常时，不在执行 |
| 环绕通知 | < aop:around > | 目标方法执行前后执行，目标方法异常时，环绕后方法不在执行 |
| 异常通知 | < aop:after-throwing > | 目标方法抛出异常时执行 |
| 最终通知 | < aop:after > | 不管目标方法是否有异常，最终都会执行 |

### 环绕通知
```java
public void around(ProceedingJoinPoint joinPoint) throws Throwable {
    //环绕前
    System.out.println("环绕前通知");
    //目标方法
    joinPoint.proceed();
    //环绕后
    System.out.println("环绕后通知");
}
```
```xml
<aop:around method="around" pointcut-ref="myPointcut"/>
```
### 异常通知
```java
public void afterThrowing(){
    System.out.println("目标方法抛出异常了，后置通知和环绕后通知不在执行");
}
```
```xml
<aop:after-throwing method="afterThrowing" pointcut-ref="myPointcut"/>
```
### 最终通知
最终通知，类似异常捕获中的finally，不管目标方法有没有异常，最终都会执行的通知
```java
public void after(){
	System.out.println("不管目标方法有无异常，我都会执行");
}
```
```xml
<aop:after method="after" pointcut-ref="myPointcut"/>
```
## 通知参数
| 参数类型 |  作用 |
| --- | --- |
| JoinPoint | 连接点对象，任何通知都可使用，可以获得当前目标对象、目标方法参数等信息 |
| ProceedingJoinPoint | JoinPoint子类对象，主要是在环绕通知中执行proceed()，进而执行目标方法 |
| Throwable | 异常对象，使用在异常通知中，需要在配置文件中指出异常对象名称 |

### JoinPoint
```java
public void 通知方法名称(JoinPoint joinPoint) {
    //获得目标方法的参数
    System.out.println(joinPoint.getArgs());
    //获得目标对象
    System.out.println(joinPoint.getTarget());
    //获得精确的切点表达式信息
    System.out.println(joinPoint.getStaticPart());
}
```
### ProceedingJoinPoint
```java
public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
    System.out.println(joinPoint.getArgs());//获得目标方法的参数
    System.out.println(joinPoint.getTarget());//获得目标对象
    System.out.println(joinPoint.getStaticPart());//获得精确的切点表达式信息
    Object result = joinPoint.proceed();//执行目标方法
    return result;//返回目标方法返回值
}
```
### Throwable
```java
public void afterThrowing(JoinPoint joinPoint,Throwable th){
    //获得异常信息
    System.out.println("异常对象是："+th+"异常信息是："+th.getMessage());
}
```
```xml
<aop:after-throwing method="afterThrowing" pointcut-ref="myPointcut" throwing="th"/>
```
## 配置AOP2种方式
### Aspect
```java
@Component
public class CalcImpl implements Calc {
    @Override
    public int add(int a, int b) {
        return a + b;
    }
}
```
```java
@Component
public class LoggerAspect {

    public void beforeMethod() {
        System.out.println("before...");
    }

    public void afterMethod() {
        System.out.println("after");
    }

    public void afterThrowing(Exception ex) {
        System.out.println("错误：" + ex);
    }

    public void afterReturning(JoinPoint joinPoint, Object result) {
        Signature signature = joinPoint.getSignature();
        Object[] args = joinPoint.getArgs();
        System.out.println(signature + "方法(参数为：" + Arrays.toString(args) + ")执行完毕!");
    }

    public Object aroundMethod(ProceedingJoinPoint joinPoint) {
        Object result = null;
        try {
            System.out.println("环绕通知：前置通知");
            result = joinPoint.proceed();
            System.out.println("环绕通知：返回通知");
        } catch (Throwable throwable) {
            System.out.println("环绕通知：异常通知");
        } finally {
            System.out.println("环绕通知：后置通知");
        }
        return result;
    }
}
```
```xml
<!-- 组件扫描 -->
<context:component-scan base-package="com.spring.aspect_xml"/>
<!-- 基于XML实现aspect的AOP通知 -->
<aop:config>
  <!--切面=切点+通知-->
  <aop:aspect ref="loggerAspect">
    <!--配置切点表达式,对哪些方法进行增强-->
    <aop:pointcut id="pointCut" expression="execution(* com.spring.aspect_xml.CalcImpl.*(..))"/>
    <!--指定前置通知方法是beforeAdvice-->
    <aop:before method="beforeMethod" pointcut-ref="pointCut"/>
    <!--指定后置通知方法是afterAdvice-->
    <aop:after method="afterMethod" pointcut-ref="pointCut"/>
    <aop:after-returning method="afterReturning" returning="result" pointcut-ref="pointCut"/>
    <aop:after-throwing method="afterThrowing" throwing="ex" pointcut-ref="pointCut"/>
    <aop:around method="aroundMethod" pointcut-ref="pointCut"/>
  </aop:aspect>
</aop:config>
```
### Advice
```java
@Component
public class Target {
    public void fun() {
        System.out.println("funny");
    }
}
```
```java
@Component
public class Advices implements MethodBeforeAdvice, AfterReturningAdvice {
    @Override
    public void before(Method method, Object[] objects, Object o) throws Throwable {
        System.out.println("before advice");
    }

    @Override
    public void afterReturning(Object o, Method method, Object[] objects, Object o1) throws Throwable {
        System.out.println("after advice");
    }
}
```
```xml
<context:component-scan base-package="com.spring.diy"/>
<aop:config>
  <!-- 将通知和切点进行结合 -->
  <aop:advisor advice-ref="advices" pointcut="execution(void com.spring.diy.Target.fun())"/>
</aop:config>
```
### 对比

- 配置语法
```xml
<!-- 使用advisor配置 -->
<aop:config>
  <!-- advice-ref:通知Bean的id -->
  <aop:advisor advice-ref="advices" pointcut="execution(void 
    com.qzy.aop.TargetImpl.show())"/>
</aop:config>

<!-- 使用aspect配置 -->
<aop:config>
  <!-- ref:通知Bean的id -->
  <aop:aspect ref="advices">
    <aop:before method="before" pointcut="execution(void 
      com.qzy.aop.TargetImpl.show())"/>
  </aop:aspect>
</aop:config>
```

- 通知类的定义要求
   - aspect 不需要通知类实现任何接口，在配置时指定哪些方法属于哪种通知类型即可，更加灵活方便
```java
public class Advices {
    public void before() {
        System.out.println("This is before Advice ...");
    }
    public void afterReturning() {
        System.out.println("This is afterReturn Advice ...");
    }
}
```

   - advisor 需要的通知类需要实现Advice的子功能接口
```java
public class Advices implements MethodBeforeAdvice {
    public void before(Method method, Object[] objects, Object o) throws Throwable {
        System.out.println("This is before Advice ...");
    }
    public void afterReturning(Object o, Method method, Object[] objects, Object o1) throws 
    Throwable {
        System.out.println("This is afterReturn Advice ...");
    }
}
```

- 可配置的切面数量
   - 一个advisor只能配置一个固定通知和一个切点表达式
   - 一个aspect可以配置多个通知和多个切点表达式任意组合，粒度更细
- 使用场景
   - 如果通知类型多、允许随意搭配情况下可以使用aspect进行配置；
   - 如果通知类型单一、且通知类中通知方法一次性都会使用到的情况下可以使用advisor进行配置；
   - 在通知类型已经固定，不用人为指定通知类型时，可以使用advisor进行配置，例如后面要学习的Spring事务控制的配置；
## 基于注解配置
```java
@Component
public class CalculatorImpl implements Calculator {

    @Override
    public int add(int a, int b) {
        return a + b;
    }

    @Override
    public int sub(int a, int b) {
        return a - b;
    }

    @Override
    public int div(int a, int b) {
        return a / b;
    }
}
```
```java
@Aspect
@Component
public class LoggerAspect {

    /**
     * 切入点表达式，方法体无意义
     */
    @Pointcut("execution(* com.spring.aspect_anno.CalculatorImpl.sub(..))")
    public void pointCut1(){}

    @Pointcut("execution(* com.spring.aspect_anno.CalculatorImpl.add(..))")
    public void pointCut2(){}

    /**
     * 具体的方法
     */
    @Before("execution(public int com.spring.aspect_anno.CalculatorImpl.add(int, int))")
    public void beforeMethod() {
        System.out.println("before...");
    }

    /**
     * 所有方法
     */
    @After("execution(* com.spring.aspect_anno.CalculatorImpl.*(..))")
    public void afterMethod() {
        System.out.println("after");
    }

    @AfterThrowing(value = "pointCut()", throwing = "ex")
    public void afterThrowing(Exception ex) {
        System.out.println("错误：" + ex);
    }

    @AfterReturning(value = "pointCut()", returning = "result")
    public void afterReturning(JoinPoint joinPoint, Object result) {
        Signature signature = joinPoint.getSignature();
        Object[] args = joinPoint.getArgs();
        System.out.println(signature + "方法(参数为：" + Arrays.toString(args) + ")执行完毕!");
        System.out.println("result = " + result);
    }

    /**
     * 环绕通知相当于前四个分散通知的总结
	 * 返回值类型必须与原本方法的返回值一致,注意此方法的返回值和参数
	 * 使用 || 间隔多个切点表达式
     */
    @Around("pointCut()1 || pointCut()2")
    public Object aroundMethod(ProceedingJoinPoint joinPoint) {
        Object result = null;
        try {
            System.out.println("环绕通知：前置通知");
            result = joinPoint.proceed();
            System.out.println("环绕通知：返回通知");
        } catch (Throwable throwable) {
            System.out.println("环绕通知：异常通知");
        } finally {
            System.out.println("环绕通知：后置通知");
        }
        return result;
    }
}
```
```xml
<context:component-scan base-package="com.spring.aspect_anno"/>
<aop:aspectj-autoproxy/>
```
```java
@Component
@Aspect
@Order(1)//值越小，切面优先级越高
public class ValidateAspect {
    /**
     * 可以使用其它类里的切入点表达式
     */
    @Before("com.spring.aspect_anno.LoggerAspect.pointCut1()")
    public void before() {
        System.out.println("123");
    }
}
```
