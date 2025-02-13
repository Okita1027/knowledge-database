---
title: 核心知识
shortTitle: 核心知识
description: 
date: 2024-06-16 21:59:17
categories: [SpringBoot]
tags: []
---
## 常用注解
### @Max、@Min
`@Min` 是 Spring Boot 中的一个注解，用于指定某个数值类型的属性的最小值。它通常与 `@Max` 配合使用，表示一个数值类型的属性的最小值和最大值。
例如：
```java
@RestController
public class MyController {
    @Min(value = 1, message = "ID must be greater than or equal to 1")
    @RequestMapping("/{id}")
    public String getUser(@PathVariable("id") int id) {
        // ...
    }
}
```
在上面的代码中，`@Min(value = 1, message = "ID must be greater than or equal to 1")` 表示 `getUser()` 方法的参数 `id` 必须大于或等于 1，否则会抛出异常并显示错误信息 "ID must be greater than or equal to 1"。
## 常见配置文件属性
### 静态资源
```yaml
spring:
 mvc:
   ## 指定资源路径为/res/**
   ## /res表示加一层目录，
   ## 方便以后拦截器设置拦截不到两层的资源路径
   static-path-pattern: /res/**
 web:
   resources:
     static-locations:
       ## 改完若访问不了:Maven->clean
       [
           ## 自定义一个类路径
           classpath:/myDefine/,
           ## 这三个目录在不更改资源的路径的情况下默认可以访问到资源
           ## 在上面资源路径加上了一层/res后需要手动标记之后才能够访问到
           ## 而META-INF下不需要标记也能够访问得到
           classpath:/public,
           classpath:/resources,
           classpath:/static	
					 ## 设置浏览器标签页左上角的小图标：将图标命名为favicon.ico放入该目录下即可
       ]
```
```yaml
spring: 
	## 自定义SpringBoot启动时的banner
  banner:
    location: classpath:banner.txt
  ## 将banner关闭
  main:
    banner-mode: off
```
```yaml
spring:
	web:
    resources:
##      add-mappings: false ## 禁用所有静态资源
      cache:
        cachecontrol:
          max-age: 60s  ## 设置静态资源在浏览器上的缓存时间（单位：s）
```
```yaml
## 给服务器资源加上前置路径 /world 例如：localhost:8080/world/xxx
server:
 servlet:
   context-path: /world
```
**注意：**请求与静态资源路径一致时，优先处理请求。
### 矩阵注解
请求的地址附带的参数以'分号'开始

例如：/matrixVariable;username=root;password=root

这里处理请求的路径只有/user

```java
@RestController
public class MatrixController {
    @GetMapping("/user/{path}")
    //矩阵变量注解:见WebConfig
    public Map<String, Object> matrixParam(@MatrixVariable("username") String username,
                                           @MatrixVariable("password") String password,
                                           @PathVariable("path") String path) {
        Map<String, Object> map = new HashMap<>();
        map.put("path", path);
        map.put("username", username);
        map.put("password", password);
        return map;
    }
}
```
SpringBoot默认不开启矩阵功能，需手动配置。
```java
@Bean
public WebMvcConfigurer webMvcConfigurer() {
    return new WebMvcConfigurer() {
        @Override
        public void configurePathMatch(PathMatchConfigurer configurer) {
            UrlPathHelper urlPathHelper = new UrlPathHelper();
            //SpringBoot默认不开启矩阵功能
            //设置不移除分号后面的内容
            urlPathHelper.setRemoveSemicolonContent(false);
        }
    };
}
```
## 获取配置文件中的值
### 直接使用yaml中的值
#### 读取单一数据
yaml中保存的单个数据，可以使用Spring中的注解@Value读取单个数据，属性名引用方式：**${一级属性名.二级属性名……}**
```yaml
data: java

user:
  username: root
  password: root
  
love: [{pcGame: SC}, {mbGame: FGO}]

baseDir: C:\windows

## 使用${}引用已定义的数据
tempDir: ${baseDir}\temp
```
```java
@Value("${data}")
private String data;

@Value("${user.username}")
private String username;

@Value("${love[0].pcGame}")
private String pcGame;

@Value("${tempDir}")
private String tempDir;
```
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/spring/springboot/202406171745578.png)
#### 读取全部数据
SpringBoot提供了一个对象，能够把所有的数据都封装到这一个对象中，这个对象叫做**Environment**，使用自动装配注解可以将所有的yaml数据封装到这个对象中
```java
//将整个YAML文件中的内容配置到这个变量中
//使用方法：environment.getProperty(string)
@Autowired
private Environment environment;
```
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/spring/springboot/202406171745875.png)
### 将数据配置到实体类中使用
#### 自定义的Bean
```yaml
info:
  name: qzy
  age: 19
```
```java
@Configuration
//yaml文件中的数据前缀为info
//之后定义对象Info后使用自动注入即可
@ConfigurationProperties(prefix = "info")
public class Info {
    private String name;
    private Integer age;
}
```
> 注意：
> Info是一个POJO类，本不应该使用`@Configuration`标记，正常情况下，需要在主程序/配置类使用`@EnableConfigurationProperties(XXX.class)`来开启@ConfigurationProperties的功能。

#### 第三方的Bean
**步骤1**：使用@Bean注解定义第三方bean

```java
@Bean
public DruidDataSource datasource(){
    DruidDataSource ds = new DruidDataSource();
    return ds;
}
```
**步骤2**：在yaml中定义要绑定的属性，注意datasource此时全小写

```yaml
datasource:
  driverClassName: com.mysql.cj.jdbc.Driver
```
**步骤3**：使用@ConfigurationProperties注解为第三方bean进行属性绑定，注意前缀是全小写的datasource

```java
@Bean
@ConfigurationProperties(prefix = "datasource")
public DruidDataSource datasource() {
    DruidDataSource ds = new DruidDataSource();
    return ds;
}
```
@ConfigurationProperties注解不仅能添加到类上，还可以添加到方法上，添加到类上是为spring容器管理的当前类的对象绑定属性，添加到方法上是为spring容器管理的当前方法的返回值对象绑定属性，本质上一样
**由于@ConfigurationProperties注解可以写在方法/类上，导致注解找起来比较麻烦，故提供了@EnableConfigurationProperties,使用方法如下：**
**步骤1**：在配置类上开启@EnableConfigurationProperties注解，并标注要使用@ConfigurationProperties注解绑定属性的类

```java
@SpringBootApplication
@EnableConfigurationProperties(ServerConfig.class)
public class SpringbootConfigurationApplication {
    
}
```
**步骤2**：在对应的类上直接使用@ConfigurationProperties进行属性绑定

```java
@Data
@ConfigurationProperties(prefix = "servers")
public class ServerConfig {
    private String ipAddress;
    private int port;
    private long timeout;
}
```
**当使用@EnableConfigurationProperties注解时，Spring会默认将其标注的类定义为bean，因此无需在ServerConfig中再次声明@Component注解了**
### 测试用例随机数据设定
对于测试用例的数据固定书写肯定是不合理的，springboot提供了在配置中使用随机值的机制，确保每次运行程序加载的数据都是随机的。具体如下：
```yaml
testcase:
  book:
    id: ${random.int}
    id2: ${random.int(10)}
    type: ${random.int(5,10)}	## ()没有强制规定，可以写其它字符例如：[]/{}/!!/@@
    name: ${random.value}		## 随机字符串,MD5字符串，32位
    uuid: ${random.uuid}
    publishTime: ${random.long} ## 随机整数（Long范围）
```
当前配置就可以在每次运行程序时创建一组随机数据，避免每次运行时数据都是固定值的尴尬现象发生，有助于测试功能的进行。数据的加载按照之前加载数据的形式，使用@ConfigurationProperties注解即可
```java
@Component
@Data
@ConfigurationProperties(prefix = "testcase.book")
public class BookCase {
    private int id;
    private int id2;
    private int type;
    private String name;
    private String uuid;
    private long publishTime;
}
```
**总结**
使用随机数据可以替换测试用例中书写的固定数据，提高测试用例中的测试数据有效性
## 属性配置
### 条件装配
```java
public class MyConfig {
    //组件名：TomCat
    @Bean("TomCat")
    public Cat getCat() {
        return new Cat("TomCat");
    }

    //条件装配,若有名为TomCat的组件，则装配getUser这个组件
    //注意TomCat要放在这个上面，否则会报错
    @ConditionalOnBean(name = "TomCat")
    //更多条件bean注解直接Conditional看补全,括号内的参数可查看注解源码
    @ConditionalOnClass(User.class)
    @Bean	//默认组件名：getUser
    public User getUser() {
        User user = new User("admin", "123");
        //得到的是容器中的对象
        user.setCat(getCat());
        return user;
    }
}
```
### 宽松绑定
宽松绑定实际上是springboot进行编程时人性化设计的一种体现，即配置文件中的命名格式与变量名的命名格式可以进行格式上的最大化兼容。
兼容到什么程度呢？几乎主流的命名格式都支持，例如：

- 在ServerConfig中的ipAddress属性名
```java
@Component
@Data
@ConfigurationProperties(prefix = "servers")
public class ServerConfig {
    private String ipAddress;
}
```

- 可以与下面的配置属性名规则全兼容
```yaml
servers:
  ipAddress: 192.168.0.2       ## 驼峰模式
  ip_address: 192.168.0.2      ## 下划线模式
  ip-address: 192.168.0.2      ## 烤肉串模式
  IP_ADDRESS: 192.168.0.2      ## 常量模式
```
以上4种模式最终都可以匹配到ipAddress这个属性名。
原因就是在进行匹配时，配置中的名称要去掉中划线和下划线后，忽略大小写的情况下去与java代码中的属性名进行忽略大小写的等值匹配
以上4种命名去掉下划线中划线忽略大小写后都是一个词ipaddress，java代码中的属性名忽略大小写后也是ipaddress，这样就可以进行等值匹配了，这就是为什么这4种格式都能匹配成功的原因。
不过springboot官方推荐使用**烤肉串模式**，也就是中划线模式。
**注意：**以上规则仅针对springboot中@ConfigurationProperties注解进行属性绑定时有效，对@Value注解进行属性映射无效。
### 计量单位
```yaml
servers:
  ip-address: 192.168.0.1 
  port: 2345
  serverTimeout: -1
```
SpringBoot充分利用了JDK8中提供的全新的用来表示计量单位的新数据类型，从根本上解决这个问题。
以下模型类中添加了两个JDK8中新增的类，分别是Duration和DataSize
```java
@Component
@Data
@ConfigurationProperties(prefix = "servers")
public class ServerConfig {
    @DurationUnit(ChronoUnit.HOURS)
    private Duration serverTimeOut;
    @DataSizeUnit(DataUnit.MEGABYTES)
    private DataSize dataSize;
}
```
**Duration**：表示时间间隔，可以通过@DurationUnit注解描述时间单位，例如上例中描述的单位为小时（ChronoUnit.HOURS）
**DataSize**：表示存储空间，可以通过@DataSizeUnit注解描述存储空间单位，例如上例中描述的单位为MB（DataUnit.MEGABYTES）
### 校验属性
**步骤1**：开启校验框架

```xml
<!--1.导入JSR303规范-->
<dependency>
    <groupId>javax.validation</groupId>
    <artifactId>validation-api</artifactId>
</dependency>
<!--使用hibernate框架提供的校验器做实现-->
<dependency>
    <groupId>org.hibernate.validator</groupId>
    <artifactId>hibernate-validator</artifactId>
</dependency>
```
**步骤2**：在需要开启校验功能的类上使用注解@Validated开启校验功能

```java
@Component
@Data
@ConfigurationProperties(prefix = "servers")
//开启对当前bean的属性注入校验
@Validated
public class ServerConfig {
    
}
```
**步骤3**：对具体的字段设置校验规则

```java
@Component
@Data
@ConfigurationProperties(prefix = "servers")
//开启对当前bean的属性注入校验
@Validated
public class ServerConfig {
    //设置具体的规则
    @Max(value = 8888, message = "最大值不能超过8888")
    @Min(value = 202, message = "最小值不能低于202")
    private int port;
}
```
### 属性转换
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/spring/springboot/202406171745288.png)
一个**错误**的案例：

```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/ssm?serverTimezone=UTC
    username: root
    password: 0127
```
password属性的值为0127 符合八进制的转换规则，故实际输出值为87，建议**都用双引号引起来**避免出现这种问题。
### 临时属性
#### 命令行方式：
1．使用jar命令启动SpringBoot工程时可以使用临时属性替换配置文件中的属性
2．临时属性添加方式:java -jar工程名.jar --属性名=值
3．多个临时属性之间使用空格分隔
4．临时属性必须是当前boot工程支持的属性，否则设置无效
#### IDEA中的方式：
![图片.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/spring/springboot/202406171745448.png)**注意：**

- 这里的参数对应的就是启动类中的**args** 
   - 修改配置文件名: **--spring.config.name=xxx**
   - 修改配置文件路径: **--spring.config.location=classpath:/xxx.properties**
   - 配置多个属性时**最后一个**生效
   - **在以后的微服务架构中（多环境开发）几乎不会出现这种形式！**
- 可以通过编程在启动方法中去掉args使得界面中的配置不生效
- 也可以手动定义一个String[]的args传到启动方法中
#### 测试类中的方式
##### **临时属性**
springboot已经为我们开发者早就想好了这种问题该如何解决，并且提供了对应的功能入口。在测试用例程序中，可以通过对注解@SpringBootTest添加属性来模拟临时属性，具体如下：
```java
//properties属性可以为当前测试用例添加临时的属性配置
@SpringBootTest(properties = {"test.prop=testValue1"})
public class PropertiesAndArgsTest {

    @Value("${test.prop}")
    private String msg;
    
    @Test
    void testProperties(){
        System.out.println(msg);
    }
}
```
使用注解@SpringBootTest的properties属性就可以为当前测试用例添加临时的属性，覆盖源码配置文件中对应的属性值进行测试。
优势：比多环境开发中的测试环境影响更小，仅对当前测试类有效。
##### **临时参数**
除了上述这种情况，在前面讲解使用命令行启动springboot程序时讲过，通过命令行参数也可以设置属性值。而且线上启动程序时，通常都会添加一些专用的配置信息。作为运维人员他们才不懂java，更不懂这些配置的信息具体格式该怎么写，那如果我们作为开发者提供了对应的书写内容后，能否提前测试一下这些配置信息是否有效呢？当时是可以的，还是通过注解@SpringBootTest的另一个属性来进行设定。
```java
//args属性可以为当前测试用例添加临时的命令行参数
@SpringBootTest(args={"--test.prop=testValue2"})
public class PropertiesAndArgsTest {
    
    @Value("${test.prop}")
    private String msg;
    
    @Test
    void testProperties(){
        System.out.println(msg);
    }
}
```
使用注解@SpringBootTest的args属性就可以为当前测试用例模拟命令行参数并进行测试。
**注意优先级：args(命令行) > properties(临时属性) > yaml文件中的属性(配置)**
### 加载测试专用配置
一个spring环境中可以设置若干个配置文件或配置类，若干个配置信息可以同时生效。现在我们的需求就是在测试环境中再添加一个配置类，然后启动测试环境时，生效此配置就行了。其实做法和spring环境中加载多个配置信息的方式完全一样。具体操作步骤如下：
**步骤1**：在测试包test中创建专用的测试环境配置类

```java
@Configuration
public class MsgConfig {
    @Bean
    public String msg() {
        return "bean msg";
    }
}
```
上述配置仅用于演示当前实验效果，实际开发可不能这么注入String类型的数据
**步骤2**：在启动测试环境时，导入测试环境专用的配置类，使用@Import注解即可实现

```java
@SpringBootTest
@Import({MsgConfig.class})	//MsgConfig是测试环境的专用类
public class ConfigurationTest {

    @Autowired
    private String msg;

    @Test
    void testConfiguration() {
        System.out.println(msg);
    }
}
```
到这里就通过@Import属性实现了基于开发环境的配置基础上，对配置进行测试环境的追加操作，实现了1+1的配置环境效果。这样我们就可以实现每一个不同的测试用例加载不同的bean的效果，丰富测试用例的编写，同时不影响开发环境的配置。
### 注解&XML混合配置
在使用了SpringBoot后，通常使用**注解**的方式进行配置，此时若想额外添加XML文件进行配置，可使用**@ImportResources("classpath:fileName.xml")**注解
```java
@ImportResource("classpath:applicationContext.xml")
public class MyConfig {
    
}
```
## 日志
日志的主要作用：

- 编程期调试代码
- 运营期记录信息
- 记录日常运营重要信息（峰值流量、平均响应时长……）
- 记录应用报错信息（错误堆栈）
- 记录运维过程数据（扩容、宕机、报警……）
### 代码中使用日志工具
**步骤1**：添加日志记录操作

```java
@RestController
@RequestMapping("/books")
public class BookController extends BaseClass{
    private static final Logger log = LoggerFactory.getLogger(BookController.class);
    @GetMapping
    public String getById(){
        log.debug("debug...");
        log.info("info...");
        log.warn("warn...");
        log.error("error...");
        return "springboot is running...2";
    }
}
```
上述代码中log对象就是用来记录日志的对象，下面的`log.debug`，`log.info`这些操作就是写日志的API了。

---

#### Lombok下的@Slf4j
```xml
<dependency>
  <groupId>org.projectlombok</groupId>
  <artifactId>lombok</artifactId>
  <optional>true</optional>
</dependency>
```
```java
@Slf4j	//日志对象名为log
public class Log {
    @Test
    public void test() {
        String message = "这是日志信息";
        log.info("信息：{}", message);
    }
}
```

---

**步骤2**：设置日志输出级别
日志设置好以后可以根据设置选择哪些参与记录。这里是根据日志的级别来设置的。日志的级别分为6种，分别是：

- TRACE：运行堆栈信息，使用率低
- DEBUG：程序员调试代码使用
- INFO：记录运维过程数据
- WARN：记录运维过程报警数据
- ERROR：记录错误堆栈信息
- FATAL：灾难信息，合并计入ERROR

一般情况下，开发时候使用DEBUG，上线后使用INFO，运维信息记录使用WARN即可。下面就设置一下日志级别：
```yaml
## 开启debug模式，输出调试信息，常用于检查系统运行状况
debug: true
```
这么设置太简单粗暴了，日志系统通常都提供了细粒度的控制。
```yaml
## 开启debug模式，输出调试信息，常用于检查系统运行状况
debug: true

## 设置日志级别，root表示根节点，即整体应用日志级别
logging:
	level:
    	root: debug
```
还可以再设置更细粒度的控制
**步骤3**：设置日志组，控制指定包对应的日志输出级别，也可以直接控制指定包对应的日志输出级别。

```yaml
logging:
	## 设置日志组
    group:
    	## 自定义组名，设置当前组中所包含的包
        ebank: com.springboot.controller
    level:
    	root: warn
        ## 为对应组设置日志级别
        ebank: debug
    	## 为对包设置日志级别
        com.springboot.controller: debug
```
说白了就是总体设置一下，每个包设置一下，如果感觉设置的麻烦，就先把包分个组，对组设置。
#### Lombok其它注解
##### @Accessors
@Accessors 是 Lombok 库中的一个注解，用于控制生成的 getter 和 setter 方法的访问级别。
默认情况下，Lombok 会为所有属性生成 public 的 getter 和 setter 方法，这样可以直接访问和修改这些属性。但是，有时候我们可能需要将这些属性设置为 private，以便更好地封装数据。这时就可以使用 @Accessors 注解来控制生成的 getter 和 setter 方法的访问级别。
@Accessors 注解有以下几个可选值：

- public：生成 public 的 getter 和 setter 方法。
- private：生成 private 的 getter 和 setter 方法。
- protected：生成 protected 的 getter 和 setter 方法。
- package-private：生成包私有的 getter 和 setter 方法。
- all：生成所有访问级别的 getter 和 setter 方法。
- chain: 允许链式调用

例如，下面的代码将生成所有访问级别的 getter 和 setter 方法：
```java
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@Accessors(all = true, chain = true)
public class User {
    private String name;
    private int age;
}
```
##### @RequiredArgsConstructor
使用 `@RequiredArgsConstructor` 注解的类将自动生成一个带有所有**非静态成员变量**的构造方法，使得在使用该类时无需手动编写这些构造方法。
例如，假设你有一个名为 `Person` 的类，其中包含 `name` 和 `age` 两个成员变量：
```java
@RequiredArgsConstructor 
public class Person {
    private String name;
    private int age;

    //以下内容可被上方的注解替代
    
    // // 默认构造方法
    // public Person() {
    //     // 默认构造方法的内容
    // }

    // // 带参数的构造方法
    // public Person(String name, int age) {
    //     this.name = name;
    //     this.age = age;
    // }
}
```
### 日志格式控制
#### 日志信息说明
默认输出格式：

- 时间和日期：毫秒级精度
- 日志级别：ERROR, WARN, INFO, DEBUG, or TRACE.
- 进程 ID
- ---： 消息分割符
- 线程名： 使用[]包含
- Logger 名： 通常是产生日志的**类名**
- 消息： 日志记录的内容

注意： logback 没有FATAL级别，对应的是ERROR
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/spring/springboot/202406171745222.png)
对于单条日志信息来说，日期，触发位置，记录信息是最核心的信息。级别用于做筛选过滤，PID与线程名用于做精准分析。了解这些信息后就可以DIY日志格式了。
官方日志模板的书写格式：

```yaml
logging:
	pattern:
    	console: "%d %clr(%p) --- [%16t] %clr(%-40.40c){cyan} : %m %n"
```
#### 自定义日志格式
默认值：参照：`spring-boot`包`additional-spring-configuration-metadata.json`文件
默认输出格式值：`%clr(%d{${LOG_DATEFORMAT_PATTERN:-yyyy-MM-dd'T'HH:mm:ss.SSSXXX}}){faint} %clr(${LOG_LEVEL_PATTERN:-%5p}) %clr(${PID:- }){magenta} %clr(---){faint} %clr([%15.15t]){faint} %clr(%-40.40logger{39}){cyan} %clr(:){faint} %m%n${LOG_EXCEPTION_CONVERSION_WORD:-%wEx}`
可修改为：`'%d{yyyy-MM-dd HH:mm:ss.SSS} %-5level [%thread] %logger{15} ===> %msg%n'`
```properties
logging.pattern.console=%d{yyyy:MM:dd HH:mm:ss} %-5level [%thread] %logger{15} => %msg %n
```
### 日志级别

- 由低到高：`ALL,TRACE, DEBUG, INFO, WARN, ERROR,FATAL,OFF`；
   - **只会打印指定级别及以上级别的日志**
   - ALL：打印所有日志
   - TRACE：追踪框架详细流程日志，**一般不使用**
   - DEBUG：开发调试细节日志
   - INFO：关键、感兴趣信息日志
   - WARN：警告但不是错误的信息日志，比如：版本过时
   - ERROR：业务错误日志，比如出现各种异常
   - FATAL：致命错误日志，比如jvm系统崩溃
   - OFF：关闭所有日志记录
- 不指定级别的所有类，都使用root指定的级别作为默认级别
- SpringBoot日志**默认级别是 INFO**

---

1. 在application.properties/yaml中配置`logging.level.<logger-name>=<level>`指定日志级别
2. level可取值范围：`TRACE, DEBUG, INFO, WARN, ERROR, FATAL, or OFF`，定义在`LogLevel`类中
3. root 的logger-name叫root，可以配置logging.level.root=warn，代表所有未指定日志级别都使用 root 的 warn 级别
```properties
#默认所有日志若没有精确指定级别就使用root的默认级别
logging.level.root = warn
```
### 日志分组
将制定的包划分为一个组，实现组内日志的统一管理
```properties
logging.group.abc = com.qzy.functional_web.config, com.qzy.functional_web.pojo
logging.level.abc = info
```
比较有用的技巧是：
将相关的logger分组在一起，统一配置。SpringBoot 也支持。比如：Tomcat 相关的日志统一设置
```java
logging.group.tomcat=org.apache.catalina,org.apache.coyote,org.apache.tomcat
logging.level.tomcat=trace
```

SpringBoot 预定义两个组

| Name | Loggers |
| --- | --- |
| web | org.springframework.core.codec, org.springframework.http, org.springframework.web, org.springframework.boot.actuate.endpoint.web, org.springframework.boot.web.servlet.ServletContextInitializerBeans |
| sql | org.springframework.jdbc.core, org.hibernate.SQL, org.jooq.tools.LoggerListener |

### 配置日志文件到本地
SpringBoot 默认只把日志写在控制台，如果想额外记录到文件，可以在application.properties中添加logging.file.name or logging.file.path配置项。
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/spring/springboot/202406171746935.png)

| logging.file.name | logging.file.path  | 示例 | 效果 |
| --- | --- | --- | --- |
| 未指定 | 未指定 |  | 仅控制台输出 |
| **指定** | 未指定 | my.log | 写入指定文件。可以加路径 |
| 未指定 | **指定** | /var/log | 写入指定目录，文件名为spring.log |
| **指定** | **指定** |  | 以logging.file.name为准 |

记录日志到文件中格式非常简单，设置日志文件名即可。
```yaml
logging:
  file:
    name: server.log
```
虽然使用上述格式可以将日志记录下来了，但是面对线上的复杂情况，一个文件记录肯定是不能够满足运维要求的，通常会每天记录日志文件，同时为了便于维护，还要限制每个日志文件的大小。
```yaml
logging:
	logback:
    	rollingpolicy:
        	max-file-size: 3KB
            file-name-pattern: server.%d{yyyy-MM-dd}.%i.log
```
以上格式是基于logback日志技术设置每日日志文件的设置格式，要求容量到达3KB以后就转存信息到第二个文件中。文件命名规则中的%d标识日期，%i是一个递增变量，用于区分日志文件。
### 文件归档与滚动切割
> 归档：每天的日志单独存到一个文档中。
> 切割：每个文件10MB，超过大小切割成另外一个文件。

1. 每天的日志应该独立分割出来存档。如果使用logback（SpringBoot 默认整合），可以通过application.properties/yaml文件指定日志滚动规则。
2. 如果是其他日志系统，需要自行配置（添加log4j2.xml或log4j2-spring.xml）
3. 支持的滚动规则设置如下
| 配置项 | 描述 |
| --- | --- |
| logging.logback.rollingpolicy.file-name-pattern | 日志存档的文件名格式（默认值：${LOG_FILE}.%d{yyyy-MM-dd}.%i.gz） |
| logging.logback.rollingpolicy.clean-history-on-start | 应用启动时是否清除以前存档（默认值：false） |
| logging.logback.rollingpolicy.max-file-size | 存档前，每个日志文件的最大大小（默认值：10MB） |
| logging.logback.rollingpolicy.total-size-cap | 日志文件被删除之前，可以容纳的最大大小（默认值：0B）。设置1GB则磁盘存储超过 1GB 日志后就会删除旧日志文件 |
| logging.logback.rollingpolicy.max-history | 日志文件保存的最大天数(默认值：7). |

### 自定义配置
通常我们配置 application.properties 就够了。当然也可以自定义。比如：

| 日志系统 | 自定义 |
| --- | --- |
| Logback | logback-spring.xml, logback-spring.groovy, 
logback.xml, or logback.groovy |
| Log4j2 | log4j2-spring.xml or log4j2.xml |
| JDK (Java Util Logging) | logging.properties |

如果可能，我们建议您在日志配置中使用`-spring` 变量（例如，`logback-spring.xml` 而不是 `logback.xml`）。
如果您使用标准配置文件，spring 无法完全控制日志初始化。
最佳实战：自己要写配置，配置文件名加上 `xx-spring.xml`
### 切换日志组合
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
    <exclusions>
        <exclusion>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-log4j2</artifactId>
</dependency>
```
log4j2支持yaml和json格式的配置文件

| 格式 | 依赖 | 文件名 |
| --- | --- | --- |
| YAML | com.fasterxml.jackson.core:jackson-databind + com.fasterxml.jackson.dataformat:jackson-dataformat-yaml | log4j2.yaml + log4j2.yml |
| JSON | com.fasterxml.jackson.core:jackson-databind | log4j2.json + log4j2.jsn |

### 最佳实战

1. 导入任何第三方框架，先排除它的日志包，因为Boot底层控制好了日志
2. 修改 `application.properties` 配置文件，就可以调整日志的所有行为。如果不够，可以编写日志框架自己的配置文件放在类路径下就行，比如`logback-spring.xml`，`log4j2-spring.xml`
3. 如需对接**专业日志系统**，也只需要把 logback 记录的**日志**灌倒** kafka**之类的中间件，这和SpringBoot没关系，都是日志框架自己的配置，**修改配置文件即可**
4. **业务中使用slf4j-api记录日志。不要再 sout 了**
## 热部署
### 手工启动热部署
**步骤①**：导入开发者工具对应的坐标
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <optional>true</optional>
</dependency>
```
**步骤②**：构建项目，可以使用快捷键激活此功能，对应的快捷键一定要记得**CTRL + F9**
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/spring/springboot/202406171746714.png)
### 关闭热部署
线上环境运行时是不可能使用热部署功能的，所以需要强制关闭此功能，通过配置可以关闭此功能。
```yaml
spring:
  devtools:
    restart:
      enabled: false
```
如果当心配置文件层级过多导致相符覆盖最终引起配置失效，可以提高配置的层级，在更高层级中配置关闭热部署。例如在启动容器前通过系统属性设置关闭热部署功能。
```java
@SpringBootApplication
public class SSMPApplication {
    public static void main(String[] args) {
        System.setProperty("spring.devtools.restart.enabled","false");
        SpringApplication.run(SSMPApplication.class);
    }
}
```
其实上述担心略微有点多余，因为线上环境的维护是不可能出现修改代码的操作的，这么做唯一的作用是降低资源消耗，毕竟那双盯着你项目是不是产生变化的眼睛只要闭上了，就不具有热部署功能了，这个开关的作用就是禁用对应功能。
**总结**
通过配置可以关闭热部署功能，降低线上程序的资源消耗。
### 热部署监控的文件范围
配置中默认不参与热部署的目录信息如下

- /META-INF/maven
- /META-INF/resources
- /resources
- /static
- /public
- /templates

以上目录中的文件如果发生变化，是不参与热部署的。如果想修改配置，可以通过application.yml文件进行设定哪些文件不参与热部署操作
```yaml
spring:
  devtools:
    restart:
      ## 设置不参与热部署的文件或文件夹
      exclude: static/**,public/**,config/application.yml
```
## 环境隔离
### 类中的相关操作
指定组件在哪些环境下**可能**生效。
```java
//指定该类只在下面这三个环境才 可能 生效
@Profile({"dev", "test", "pro"})
@Component
public class Rubbish {
}
```
容器中的任何组价（Component、Bean、Configration……）都可以使用@Profile标记
激活环境的方案：

- 配置文件激活：`spring.profiles.active = dev`
- 命令行激活：`java -jar xxx.jar --spring.profiles.active = dev`
### 多环境开发(yaml-单文件)
```yaml
## 指定使用哪个生产环境
spring:
  profiles:
    active: pro
## 各个环境之间用 --- 隔开
---
spring:
  config:
    activate:
      on-profile: pro
server:
  port: 7777
---
spring:
  config:
    activate:
      on-profile: dev
server:
  port: 8888
---
spring:
  config:
    activate:
      on-profile: test
server:
  port: 9999
```
### 多环境开发(yaml-多文件)
#### Profile 配置文件

- `application-{profile}.properties`可以作为**指定环境的配置文件**。
- 激活这个环境，**配置**就会生效。最终生效的所有**配置**是
   - `application.properties`：主配置文件，任意时候都生效
   - `application-{profile}.properties`：指定环境配置文件，激活指定环境生效

profile优先级 > application 
#### Profile 环境分组
创建prod组，指定包含db和mq配置
```properties
spring.profiles.group.prod[0]=db
spring.profiles.group.prod[1]=mq
spring.profiles.group.abc=a,b,c
```
使用--spring.profiles.active=prod ，就会激活prod=>db，mq配置文件
#### 配置文件隔离-案例使用
```yaml
spring:
	profiles:
		active: dev
```
```yaml
server:
  port: 7777
```
```yaml
server:
  port: 8888
```
```yaml
server:
  port: 9999
```
### 多环境开发分组管理
#### 环境激活
若把多个数据库的连接信息配置在一起将会有安全隐患，故多使用**多文件**格式，维护起来也更加方便
多文件格式进阶：

-  可以根据功能对配置文件中的信息进行拆分，并制作成独立的配置文件 
-  命名规则：application-devDB.yaml、application-devRedis.yaml、application-devMVC.yaml 
   -  在主配置文件中: application.yaml
```yaml
spring:
  profiles:
    active: dev
    include: devDB,devRedis,devMVC
```

      -  若是更改了当前使用的dev,则下面的三个dev也要跟着改 
      -  在这种方式中，若这几个配置文件中有相同属性，则主配置dev的生效 
   -  在SpringBoot2.4之后发生了一点变化： 
```yaml
spring:
  profiles:
    active: dev
    group:
    	"dev": devDB,devRedis,devMVC
    	"pro": proDB,proRedis,proMVC
    	"test": testDB,testRedis,testMVC
```

      -  新版的group关键字在修改所使用的环境时，只需要更改active后的值即可 
      -  在这种方式中，若这几个配置文件中有相同属性，则主配置devMVC的生效 
#### 默认环境
```properties
## 修改默认的环境为test
spring.profiles.default=test
```
**不推荐这种方式！建议使用激活方式！**
### 环境包含
注意：

1. spring.profiles.active 和spring.profiles.default 只能用到** 无 profile 的文件**中，如果在application-dev.yaml中编写就是**无效的**
2. 也可以额外添加生效文件，而不是激活替换。比如：
```properties
spring.profiles.include[0]=common
spring.profiles.include[1]=local
```
#### 最佳实战

- **生效的环境 **= **激活的环境/默认环境**  + **包含的环境**
- 项目里面这么用
   - 基础的配置`mybatis`、`log`、`xxx`：写到**包含环境中**
   - 需要动态切换变化的 `db`、`redis`：写到**激活的环境中**
### 多环境开发控制
处理maven和SpringBoot同时设置多环境
maven是做项目构建管理、最终生成代码包的；SpringBoot是简化开发的。简化，不是起主导作用。最终还是要靠maven来管理整个工程，所以SpringBoot应该听maven的。整个确认后下面就好做了。大体思想如下：

- 先在maven环境中设置用什么具体的环境
- 在SpringBoot中读取maven设置的环境即可

**maven中设置多环境（使用属性方式区分环境）**
```xml
<profiles>
    <profile>
        <id>env_dev</id>
        <properties>
            <profile.active>dev</profile.active>
        </properties>
        <activation>
            <activeByDefault>true</activeByDefault>		<!--默认启动环境-->
        </activation>
    </profile>
    <profile>
        <id>env_pro</id>
        <properties>
            <profile.active>pro</profile.active>
        </properties>
    </profile>
</profiles>
```
**SpringBoot中读取maven设置值**
```yaml
spring:
	profiles:
    	active: @profile.active@
```
上面的@属性名@就是读取maven中配置的属性值的语法格式。
**总结**

1. 当Maven与SpringBoot同时对多环境进行控制时，以Mavn为主，SpringBoot使用@..@占位符读取Maven对应的配置属性值
2. 基于SpringBoot读取Maven配置属性的前提下，如果在Idea下测试工程时pom.xml每次更新需要手动compile方可生效
## 外部化配置
### 配置文件分类
#### 四级分类

1. 一级**[最高]**
- file : config/application.yaml
2. 二级
- application.yaml
3. 三级
- classpath : config/application.yaml
4. 四级**[最低]**
- application.yaml
#### **混合配置**

- **由于配置文件有多级，因此可分别在不同级别进行不同的配置**
- **当出现多个配置文件时，按照优先级对配置进行取舍**
   - 由于配置文件有yaml和properties两种格式
   - 已知：properties的优先级 > yml > yaml的优先级
   - 故：同一层级 properties生效，而不同层级，层级高的生效
- 举例： 
   - 程序员在4级
   - 项目经理使用3级
   - 运维人员在2级
   - 运维经理用1级

---

> **场景**：线上应用如何**快速修改配置**，并应**用最新配置**？
> - SpringBoot 使用  **配置优先级** + **外部配置**  简化配置更新、简化运维。
> - 只需要给`jar`应用所在的文件夹放一个`application.properties`最新配置文件，重启项目就能自动应用最新配置

### 配置优先级
Spring Boot 允许将**配置外部化**，以便可以在不同的环境中使用相同的应用程序代码。
我们可以使用各种**外部配置源**，包括Java Properties文件、YAML文件、环境变量和命令行参数。
@Value可以获取值，也可以用@ConfigurationProperties将所有属性绑定到java object中
**以下是 SpringBoot 属性源加载顺序。后面的会覆盖前面的值**。由低到高，高优先级配置覆盖低优先级

1. **默认属性**（通过`SpringApplication.setDefaultProperties`指定的）
2. @PropertySource指定加载的配置（需要写在@Configuration类上才可生效）
3. **配置文件（application.properties/yml等）**
4. RandomValuePropertySource支持的random.*配置（如：@Value("${random.int}")）
5. OS 环境变量
6. Java 系统属性（System.getProperties()）
7. JNDI 属性（来自java:comp/env）
8. ServletContext 初始化参数
9. ServletConfig 初始化参数
10. SPRING_APPLICATION_JSON属性（内置在环境变量或系统属性中的 JSON）
11. **命令行参数**
12. 测试属性。(@SpringBootTest进行测试时指定的属性)
13. 测试类@TestPropertySource注解
14. Devtools 设置的全局属性。($HOME/.config/spring-boot)
> 结论：配置可以写到很多位置，常见的优先级顺序：
> - `命令行`> `配置文件`> `springapplication配置`


**配置文件优先级**如下：(**后面覆盖前面**)

1. **jar 包内**的application.properties/yml
2. **jar 包内**的application-{profile}.properties/yml
3. **jar 包外**的application.properties/yml
4. **jar 包外**的application-{profile}.properties/yml

**建议**：**用一种格式的配置文件**。`**如果.properties和.yml同时存在,则.properties优先**`
> 结论：`包外 > 包内`； 同级情况：`profile配置 > application配置`

**所有参数均可由命令行传入，使用**`--参数项=参数值`**，将会被添加到环境变量中，并优先于**`配置文件`**。**

**比如**`java -jar app.jar --name="Spring"`**,可以使用**`@Value("${name}")`**获取**

演示场景：

- 包内： application.properties   `server.port=8000`
- 包内： application-dev.properties    `server.port=9000`
- 包外：  application.properties   `server.port=8001`
- 包外： application-dev.properties    `server.port=9001`

启动端口？：命令行 > `9001` > `8001` > `9000` > `8000`
### 外部配置
SpringBoot 应用启动时会自动寻找application.properties和application.yaml位置，进行加载。顺序如下：（**后面覆盖前面**）

1. 类路径: 内部
   1. 类根路径
   2. 类下/config包
2. 当前路径（项目所在的位置）
   1. 当前路径
   2. 当前下/config子目录
   3. /config目录的直接子目录

最终效果：优先级由高到低，前面覆盖后面

- 命令行 > 包外config直接子目录 > 包外config目录 > 包外根目录 > 包内目录
- 同级比较： 
   - profile配置 > 默认配置
   - properties配置 > yaml配置

![未命名绘图.svg](https://cdn.nlark.com/yuque/0/2023/svg/1613913/1682073869709-2cba18c8-55bd-4bf1-a9df-ac784e30d89a.svg#clientId=ua56aff10-fdb3-4&from=paste&height=535&id=u251139ab&originHeight=669&originWidth=694&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=91719&status=done&style=none&taskId=uc8d5b2d7-9e97-48ee-9d6e-18be7deac2e&title=&width=555.2)

规律：最外层的最优先。

- 命令行 > 所有
- 包外 > 包内
- config目录 > 根目录
- profile > application 

配置不同就都生效（互补），配置相同高优先级覆盖低优先级
## 模拟Web环境的测试
在后端代码写好之后，想要模拟网页发送请求（不使用PostMan）进行业务测试，可以进行如下步骤的操作。
### 配置虚拟环境
每一个springboot的测试类上方都会有@SpringBootTest注解，其中一个属性为webEnvironment。通过该属性设置测试用例启动web环境，具体如下：
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class WebTest {	
    
}
```
测试类中启动web环境时，可以指定启动的Web环境对应的端口，springboot提供了4种设置值，分别如下：

- MOCK：根据当前设置确认是否启动web环境，例如使用了Servlet的API就启动web环境，属于适配性的配置
- DEFINED_PORT：使用自定义的端口作为web服务器端口
- RANDOM_PORT：使用随机端口作为web服务器端口
- NONE：不启动web环境

通过上述配置，现在启动测试程序时就可以正常启用web环境了，建议大家测试时使用**RANDOM_PORT**，避免代码中因为写死设定引发线上功能打包测试时由于端口冲突导致意外现象的出现。
### 发送虚拟请求
**步骤1**：在测试类中开启web虚拟调用功能，通过注解@AutoConfigureMockMvc实现此功能的开启

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
//开启虚拟MVC调用
@AutoConfigureMockMvc
public class WebTest {
}
```
**步骤2**：定义发起虚拟调用的对象MockMVC，通过自动装配的形式初始化对象

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
//开启虚拟MVC调用
@AutoConfigureMockMvc
public class WebTest {
    @Test
    void testWeb(@Autowired MockMvc mvc) {
    }
}
```
**步骤3**：创建一个虚拟请求对象，封装请求的路径，并使用MockMVC对象发送对应请求
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
//开启虚拟MVC调用
@AutoConfigureMockMvc
public class WebTest {

    @Test
    void testWeb(@Autowired MockMvc mvc) throws Exception {
        //http://localhost:8080/books
        //创建虚拟请求，方式：get，路径：/books
        MockHttpServletRequestBuilder builder = MockMvcRequestBuilders.get("/books");
        //执行对应的请求
        mvc.perform(builder);
    }
}
```
执行测试程序，就可以正常的发送/books对应的请求了，注意访问路径不要写http://localhost:8080/books，因为前面的服务器IP地址和端口使用的是当前虚拟的web环境，无需指定，仅指定请求的具体路径即可。
### 请求结果比对
#### 响应状态匹配
```java
@Test
void testStatus(@Autowired MockMvc mvc) throws Exception {
    MockHttpServletRequestBuilder builder = MockMvcRequestBuilders.get("/books");
    ResultActions action = mvc.perform(builder);
    //设定预期值 与真实值进行比较，成功测试通过，失败测试失败
    //定义本次调用的预期值
    StatusResultMatchers status = MockMvcResultMatchers.status();
    //预计本次调用时成功的状态：200
    ResultMatcher ok = status.isOk();
    //添加预计值到本次调用过程中进行匹配
    action.andExpect(ok);
}
```
#### 响应体匹配（非json数据格式）
```java
@Test
void testBody(@Autowired MockMvc mvc) throws Exception {
    MockHttpServletRequestBuilder builder = MockMvcRequestBuilders.get("/books");
    ResultActions action = mvc.perform(builder);
    //设定预期值 与真实值进行比较，成功测试通过，失败测试失败
    //定义本次调用的预期值
    ContentResultMatchers content = MockMvcResultMatchers.content();
    ResultMatcher result = content.string("springboot");
    //添加预计值到本次调用过程中进行匹配
    action.andExpect(result);
}
```
#### 响应体匹配（json数据格式）
```java
@Test
void testJson(@Autowired MockMvc mvc) throws Exception {
    MockHttpServletRequestBuilder builder = MockMvcRequestBuilders.get("/books/1");
    ResultActions action = mvc.perform(builder);
    //设定预期值 与真实值进行比较，成功测试通过，失败测试失败
    //定义本次调用的预期值
    ContentResultMatchers content = MockMvcResultMatchers.content();
    ResultMatcher result = content.json("{\"id\":1,\"name\":\"springboot\"}");
    //添加预计值到本次调用过程中进行匹配
    action.andExpect(result);
}
```
**总结**

1. web虚拟调用可以对本地虚拟请求的返回响应信息进行比对，分为响应头信息比对、响应体信息比对、响应状态信息等进行比对。
## 函数式Web
`SpringMVC 5.2` 以后 允许我们使用**函数式**的方式，**定义Web的请求处理流程**。
函数式接口
Web请求处理的方式：

1. `@Controller + @RequestMapping`：**耦合式 **（**路由**、**业务**耦合）
2. **函数式Web**：分离式（路由、业务分离）
### 核心类

- **RouterFunction：定义路由信息。发什么请求，谁来处理**
- **RequestPredicate：请求谓语。请求方式（get、post）、请求参数**
- **ServerRequest：封装请求完整数据**
- **ServerResponse：封装响应完整数据**
### 入门用法
```java
@Service
public class UserBusinessHandler {
    public ServerResponse getUser(ServerRequest request) {
        Integer id = Integer.valueOf(request.pathVariable("id"));
        User user = new User(id, 1);
        return ServerResponse.ok().body(user);
    }

    public ServerResponse getUsers(ServerRequest request) {
        User user1 = new User(1, 1);
        User user2 = new User(2, 2);
        List<User> userList = Arrays.asList(user1, user2);
        return ServerResponse.ok().body(userList);
    }

    public ServerResponse saveUser(ServerRequest request) throws ServletException, IOException {
        User user = request.body(User.class);
        System.out.println("保存用户" + user + "成功！");
        return ServerResponse.ok().build();
    }

    public ServerResponse updateUser(ServerRequest request) throws ServletException, IOException {
        User user = request.body(User.class);
        System.out.println("更新用户 " + user + " 成功！");
        return ServerResponse.ok().build();
    }

    public ServerResponse deleteUser(ServerRequest request) {
        int id = Integer.parseInt(request.pathVariable("id"));
        System.out.println("删除用户" + id + "成功！");
        return ServerResponse.ok().build();
    }
}
```
```java
@Configuration
public class WebFunctionConfig {
    /**
     * 函数式web：
     * 1、给容器中放一个Bean：类型是 RouterFunction<ServerResponse>,集中所有路由信息
     * 2、每个业务对象准备一个自己的handler
     *
     * 核心四大对象：
     * ● RouterFunction：定义路由信息。发什么请求，谁来处理
     * ● RequestPredicate：请求谓语。请求方式（get、post）、请求参数
     * ● ServerRequest：封装请求完整数据
     * ● ServerResponse：封装响应完整数据
     */
    @Bean
    public RouterFunction<ServerResponse> userRoute(UserBusinessHandler userBusinessHandler) {
        // 开始定义路由信息
        return RouterFunctions.route()
                //三个参数的意义分别是：请求路径、接受请求中的参数、具体的业务处理
                .GET("/user/{id}", RequestPredicates.accept(MediaType.ALL), userBusinessHandler::getUser)
                //没有中间参数表示不需要接受参数
                .GET("/user", userBusinessHandler::getUsers)
                .POST("/user", RequestPredicates.accept(MediaType.APPLICATION_JSON), userBusinessHandler::saveUser)
                .PUT("/user/{id}", RequestPredicates.accept(MediaType.APPLICATION_JSON), userBusinessHandler::updateUser)
                .DELETE("/user/{id}", RequestPredicates.accept(MediaType.ALL), userBusinessHandler::deleteUser)
                .build();
    }

}
```
