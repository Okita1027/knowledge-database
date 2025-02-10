---
title: IOC-注解
shortTitle: IOC-注解
description: 
date: 2024-06-16 21:23:27
categories: [Spring]
tags: []
---
## Bean基本配置
### @Component

- 被该注解标识的类，会在指定扫描范围内被Spring加载并实例化
- 可以通过@Component注解的value属性指定当前Bean实例的beanName，也可以省略不写，不写的情况下为当前类名首字母小写
```java
//获取方式：applicationContext.getBean("userDao");
@Component("userDao")
public class UserDaoImpl implements UserDao {
}
//获取方式：applicationContext.getBean("userDaoImpl");
@Component
public class UserDaoImpl implements UserDao {
}
```

- 使用注解对需要被Spring实例化的Bean进行标注，但是需要告诉Spring去哪找这些Bean，配置组件扫描路径
```xml
<!-- 告知Spring框架去某个包及其子包下去扫描使用注解的类 -->
<context:component-scan base-package="com.qzy.spring.pojo"/>
```

- 对应的其它标签
| xml配置 | 注解 |  描述 |
| --- | --- | --- |
| `<bean scope="">` | @Scope | 标注Bean的作用范围，取值为singleton或prototype |
| `<bean lazy-init="">` | @Lazy | 标注Bean是否延迟加载，取值为true和false |
| `<bean init-method="">` | @PostConstrct | 标注Bean的实例化后执行的方法 |
| `<bean destroy-method="">` | @PreDestroy | 标注Bean的销毁前执行方法 |

#### 衍生注解
| @Component衍生注解  |  描述 |
| --- | --- |
| @Repository | 在Dao层类上使用 |
| @Service | 在Service层类上使用 |
| @Controller  | 在Web层类上使用 |

## Bean依赖注入
| 注解名称   | 描述                                         |
| --- | --- |
| @Value  | 用于字段或方法，注入普通数据类型 |
| @Autowired | 用于字段或方法，根据类型注入引用数据 |
| @Qualifier | 用于字段或方法，结合@Autowired，根据名称注入 |
| @Resource | 用于字段或方法，根据类型或名称注入 |

### @Value
```java
@Value("qzy")
private String username;

@Value("yzq")
public void setUsername(String username){
	System.out.println(username);
}
```
```java
@Value("${jdbc.username}")
private String username;

@Value("${jdbc.username}")
public void setUsername(String username){
	System.out.println(username);
}
```
```xml
<context:property-placeholder location="classpath:jdbc.properties"/>
```
### @Autowired
```java
//使用在属性上直接注入
@Autowired
private UserDao userDao;

//使用在方法上直接注入
@Autowired
public void setUserDao(UserDao userDao){
	System.out.println(userDao);
}

@Autowired  //从容器中注入所有的userDao给List
public void yyy(List<UserDao> userDaoList) {
    System.out.println("YYY：userDaoList = " + userDaoList);
}
```
```java
//匹配当前Bean
@Repository("userDao")
public class UserDaoImpl implements UserDao{}

@Repository("userDao2")
public class UserDaoImpl2 implements UserDao{}
```
### @Qualifier
```java
//加在方法上可以替代Bean初始化时的set()方法，方法名可以不是setXXX();
@Autowired  //从容器中注入userDao
@Qualifier("userDaoImplCopy")	//根据名称注入
public void xxx(UserDao userDao) {
	System.out.println("XXX：userDao = " + userDao);
}
```
### @Resource
该注解不是Spring下的，@Resource注解存在与于javax.annotation 包中，Spring对其进行了解析
```java
//该注解默认按照名称自动装配，也可以手动指定名称
@Resource(name = "userDaoImpl1")
private UserDao userDao;
```
```java
//如果注解写在setter方法上默认取属性名进行装配。当找不到与名称匹配的bean时才按照类型进行装配。
@Resource
public void setFather(Father father) {
    
}
```
需要注意的是，如果name属性一旦指定，就只会按照名称进行装配。
## 非自定义Bean
非自定义Bean要通过工厂的方式进行实例化，使用@Bean标注方法即可，@Bean的属性为beanName，如不指定为当前工厂方法名称。注意：工厂方法所在类必须要被Spring管理。
```java
//将方法返回值Bean实例以@Bean注解指定的名称存储到Spring容器中
@Bean("dataSource")
public DataSource dataSource(){
    DruidDataSource dataSource = new DruidDataSource();
    dataSource.setDriverClassName("com.mysql.jdbc.Driver");
    dataSource.setUrl("jdbc:mysql://localhost:3306/mybatis");
    dataSource.setUsername("root");
    dataSource.setPassword("root");
    return dataSource;
}
```
如果@Bean工厂方法需要参数的话，则有如下几种注入方式：

- 使用@Autowired 根据类型自动进行Bean的匹配，@Autowired可以省略 ；
- 使用@Qualifier 根据名称进行Bean的匹配；
- 使用@Value 根据名称进行普通数据类型匹配。
```java
@Bean
@Autowired //根据类型匹配参数
public Object objectDemo01(UserDao userDao){
    System.out.println(userDao);
    return new Object();
}
@Bean
public Object objectDemo02(@Qualifier("userDao") UserDao userDao,
						   @Value("${jdbc.username}") String username) {
    System.out.println(userDao);
    System.out.println(username);
    return new Object();
}
```
## 完全注解开发
### @Configuration
用于标识该类为配置类，替代原有XML配置文件，该注解的作用：

- 标识该类是一个配置类
- 具备@Component的作用。
```java
//默认为true:保证单例,false:关闭单例检查,可以加快启动速度
//若一个组件依赖另一个组件则写true(比如User类依赖了Cat类),否则false
@Configuration(proxyBeanMethods = true)
public class ApplicationContextConfig {}
```
### @ComponentScan
用于组件扫描配置，替代原有xml文件中的<context:component-scan base-package=""/>

- base-package的配置方式：
   - 指定一个或多个包名：扫描指定包及其子包下使用注解的类。
   - 不配置包名：扫描当前@componentScan注解配置类所在包及其子包下的类。
```java
@Configuration
@ComponentScan({"com.qzy.spring.service","com.qzy.spring.dao"})
public class ApplicationContextConfig {}
```
### @PropertySource
用于加载外部properties资源配置，替代原有xml中的 <context:property-placeholder location=“”/> 配置
```java
@Configuration
@ComponentScan
@PropertySource({"classpath:jdbc.properties","classpath:xxx.properties"})
public class ApplicationContextConfig {}
```
### @Import
用于加载其他配置类，替代原有XML中的`<import resource="classpath:beans.xml"/>`配置
```java
@Configuration
@ComponentScan
@PropertySource("classpath:jdbc.properties")
@Import(OtherConfig.class)
public class ApplicationContextConfig {}
```
### @Primary
用于标注相同类型的Bean优先被使用权，@Primary 是Spring3.0引入的，与@Component或@Bean一起使用，标注该Bean优先级更高，则在通过类型获取Bean或通过@Autowired根据类型进行注入时会选优先级更高的
```java
@Repository("userDao")
public class UserDaoImpl implements UserDao{}
@Repository("userDao2")
@Primary
public class UserDaoImpl2 implements UserDao{}
```
```java
@Bean
public UserDao userDao01(){return new UserDaoImpl();}
@Bean
@Primary
public UserDao userDao02(){return new UserDaoImpl2();}
```
### @Profile
该注解的作用同于xml配置时学习profile属性`<beans profile="test">`，是进行环境切换使用的。

@Profile 标注在类或方法上，标注当前产生的Bean从属于哪个环境，只有激活了当前环境，被标注的Bean才能被注册到Spring容器里，不指定环境的Bean，任何环境下都能注册到Spring容器里。

```java
@Repository("userDao")
@Profile("test")
public class UserDaoImpl implements UserDao{}
@Repository("userDao2")
public class UserDaoImpl2 implements UserDao{}
```
可以使用以下两种方式指定被激活的环境：

- 使用命令行动态参数，虚拟机参数位置加载 -Dspring.profiles.active=test
- 使用代码的方式设置环境变量 System.setProperty("spring.profiles.active","test");
