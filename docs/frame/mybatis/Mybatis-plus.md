---
title: MyBatis-Plus
shortTitle: MyBatis-Plus
description: 
date: 2024-06-16 22:14:13
categories: [MyBatis-Plus]
tags: []
---
## **MyBatis-Plus简介**
### **简介**
**MyBatis-Plus**（简称 MP）是一个 **MyBatis的增强工具**，在 MyBatis 的基础上**只做增强不做改变**，为 **简化开发、提高效率而生**。
> 愿景 
> 我们的愿景是成为 MyBatis 最好的搭档，就像魂斗罗中的 1P、2P，基友搭配，效率翻倍。

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/mybatis/202406171620638.png)
### 特性

- **无侵入**：只做增强不做改变，引入它不会对现有工程产生影响，如丝般顺滑 
- **损耗小**：启动即会自动注入基本 CURD，性能基本无损耗，直接面向对象操作 
- **强大的 CRUD 操作**：内置通用 Mapper、通用 Service，通过少量配置即可实现单表大部分CRUD 操作，更有强大的条件构造器，满足各类使用需求 
- **支持 Lambda 形式调用**：通过 Lambda 表达式，方便的编写各类查询条件，无需再担心字段写错 
- **支持主键自动生成**：支持多达 4 种主键策略（内含分布式唯一 ID 生成器 - Sequence），可自由配置，完美解决主键问题 
- **支持 ActiveRecord 模式**：支持 ActiveRecord 形式调用，实体类只需继承 Model 类即可进行强大的 CRUD 操作 
- **支持自定义全局通用操作**：支持全局通用方法注入（ Write once, use anywhere ） 
- **内置代码生成器**：采用代码或者 Maven 插件可快速生成 Mapper 、 Model 、 Service 、Controller 层代码，支持模板引擎，大量自定义配置等
- **内置分页插件**：基于 MyBatis 物理分页，开发者无需关心具体操作，配置好插件之后，写分页等同于普通 List 查询 
- **分页插件支持多种数据库**：支持 MySQL、MariaDB、Oracle、DB2、H2、HSQL、SQLite、 Postgre、SQLServer 等多种数据库 
- **内置性能分析插件**：可输出 SQL 语句以及其执行时间，建议开发测试时启用该功能，能快速揪出慢查询 
- **内置全局拦截插件**：提供全表 delete 、 update 操作智能分析阻断，也可自定义拦截规则，预防误操作
### **支持数据库**
> 任何能使用MyBatis进行 CRUD, 并且支持标准 SQL 的数据库，具体支持情况如下

- MySQL，Oracle，DB2，H2，HSQL，SQLite，PostgreSQL，SQLServer，Phoenix，Gauss ， ClickHouse，Sybase，OceanBase，Firebird，Cubrid，Goldilocks，csiidb 
- 达梦数据库，虚谷数据库，人大金仓数据库，南大通用(华库)数据库，南大通用数据库，神通数据 库，瀚高数据库
### 框架结构
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/mybatis/202406171620750.png)
### 代码及文档地址

- 官方地址: http://mp.baomidou.com 
- 代码发布地址: 
- Github: https://github.com/baomidou/mybatis-plus 
- Gitee: https://gitee.com/baomidou/mybatis-plus 
- 文档发布地址: https://baomidou.com/pages/24112f
## 基本使用
### Maven依赖
```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-test</artifactId>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>com.baomidou</groupId>
  <artifactId>mybatis-plus-boot-starter</artifactId>
  <version>3.5.1</version>
</dependency>
<dependency>
  <groupId>mysql</groupId>
  <artifactId>mysql-connector-java</artifactId>
  <version>8.0.28</version>
</dependency>
```
### YAML配置
```yaml
spring:
  datasource:
    ## springboot自带的连接池(不写默认为这个),目前速度最快
    type: com.zaxxer.hikari.HikariDataSource
    ## GMT:中国的时区
    url: jdbc:mysql://localhost:3306/mybatisplus?serverTimezone=GMT
    username: root
    password: root
    driver-class-name: com.mysql.cj.jdbc.Driver

mybatis-plus:
  configuration:
    ## 在控制台显示日志
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
  global-config:
    db-config:
      ## 设置实体类对应表的统一前缀，即User类对应t_user表
      table-prefix: t_
      ## 在进行数据库更新操作时，如果更新的字段值为空（null），则不会执行更新操作
      update-strategy: not_null
      ## 配置MyBatis-Plus的主键策略，auto：自增长
      id-type: auto
  ## 给包下的类起别名
  type-aliases-package: com.qzy.mybatisplus01.pojo
  ## 配置扫描通用枚举
  type-enums-package: com.qzy.mybatisplus01.enums
```
### `BaseMapper<T>`
BaseMapper是MyBatis-Plus提供的模板mapper，其中包含了基本的CRUD方法，泛型为操作的实体类型
```java
@Mapper
//继承BaseMapper，可以使用MyBatisPlus的功能，也可以在这里面写自定义功能满足各种业务需求
//<User>表示对应的数据库中表格的名称，名称不一致的情况下可以在pojo类上加@TableName注解
public interface UserMapper extends BaseMapper<User> {
    
}
```
```java
@SpringBootTest
public class MybatisPlusTest {

    @Autowired
    UserMapper userMapper;

    //查询所有用户信息
    @Test
    public void selectListTest() {
        //selectList()根据MP内置的条件构造器查询一个list集合，null表示没有条件，即查询所有
        //SELECT id,name,age,email FROM user
        List<User> users = userMapper.selectList(null);
    }
}
```
![方法一览](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/mybatis/202406171621541.png "方法一览")
### `IService<T>`
说明: 
通用 Service CRUD 封装IService接口，进一步封装 CRUD 采用 get 查询单行 remove 删除 list 查询集合 page 分页 前缀命名方式区分 Mapper 层避免混淆，泛型 T 为任意实体对象建议如果存在自定义通用 Service 方法的可能，请创建自己的 IBaseService 继承 Mybatis-Plus 提供的基类
```java
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    
}
```
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/mybatis/202406171621758.png)
#### IService方法一览
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/mybatis/202406171621444.png)![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/mybatis/202406171621453.png)
#### IServiceImpl方法一览
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/mybatis/202406171621931.png)
## 常用注解
### **@TableName**
Mybatis-Plus默认进行CRUD的表名为泛型类，如User，为了对应数据库的实际表名，可进行以下两种操作匹配。
#### **@TableName**
```java
@TableName("t_user")
public class User {
    private String username;
    private String password;
}
```
#### **全局配置**
```yaml
mybatis-plus:
  global-config:
    db-config:
      ## 设置实体类对应表的统一前缀，即User类对应t_user表
      table-prefix: t_
```
### **@TableId**
MyBatis-Plus在实现CRUD时，会默认将id作为主键列，并在插入数据时，默认基于**雪花算法**的策略生成id。
若类中没有id的属性，则无法进行插入，可通过@TableId指定某字段为id。
```java
public class User {
    @TableId
    private Long uid;
}
```
#### value属性
若实体类中主键对应的属性为id，而表中表示主键的字段为uid，此时若只在属性id上添加注解@TableId，则抛出异常Unknown column 'id' in 'field list'，即MyBatis-Plus仍然会将id作为表的主键操作，而表中表示主键的是字段uid,此时需要通过@TableId注解的value属性，指定表中的主键字段，@TableId("uid")或@TableId(value="uid")。
```java
public class User {
    @TableId("uid")
    private Long uid;
}
```
#### type属性
常用的主键策略：

| 值  |  描述 |
| --- | --- |
| IdType.ASSIGN_ID（默认） | 基于雪花算法的策略生成数据id，与数据库id是否设置自增无关 |
| IdType.AUTO | 使用数据库的自增策略，注意，该类型请确保数据库设置了id自增，否则无效 |

配置主键策略：
```yaml
mybatis-plus:
  global-config:
    db-config:
      ## 配置MyBatis-Plus的主键策略
      id-type: auto
```
### **@TableField**
MyBatis-Plus在执行SQL语句时，要保证实体类中的属性名和表中的字段名一致。
#### 驼峰对应下划线的情况
若实体类中的属性使用的是**驼峰**命名风格，而表中的字段使用的是**下划线**命名风格，例如实体类属性userName，表中字段user_name
此时MyBatis-Plus会**自动**将下划线命名风格转化为驼峰命名风格，相当于在MyBatis中配置
#### 其它情况
若实体类中的属性和表中的字段不满足情况1，例如实体类属性name，表中字段username
此时需要在实体类属性上使用@TableField("username")设置属性所对应的字段名
```java
public class User {
    @TableField("username")
    private String name;
}
```
### @TableLogic
#### 逻辑删除概念

- 物理删除：真实删除，将对应数据从数据库中删除，之后查询不到此条被删除的数据
- 逻辑删除：假删除，将对应数据中代表是否被删除字段的状态修改为“被删除状态”，之后在数据库中仍旧能看到此条数据记录
- 使用场景：可以进行数据恢复
#### 实现逻辑删除

1. 数据库中创建逻辑删除状态列(is_deleted)，设置默认值为0
2. 实体类中添加逻辑删除属性`private Integer isDeleted`并使用`@TableLogic`标注
3. 测试删除功能，真正执行的是修改
   1. `UPDATE t_user SET is_deleted=1 WHERE id=? AND is_deleted=0`
4. 测试查询功能，被逻辑删除的数据默认不会被查询
   1. `SELECT id,username AS name,age,email,is_deleted FROM t_user WHERE is_deleted=0`
## **条件构造器和常用接口**
### Wapper
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/mybatis/202406171621619.png)

- Wrapper ： 条件构造抽象类，最顶端父类
   - AbstractWrapper ： 用于查询条件封装，生成 sql 的 where 条件
      - QueryWrapper ： 查询条件封装
      - UpdateWrapper ： Update 条件封装
      - AbstractLambdaWrapper ： 使用Lambda 语法
         - LambdaQueryWrapper ：用于Lambda语法使用的查询Wrapper
         - LambdaUpdateWrapper ： Lambda 更新封装Wrapper
### QueryWrapper
#### SELECT
```java
@SpringBootTest
public class MyBatisPlusWrapperTest {
	@Test
    public void selectWrapperTest() {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.like("name", "admin")
                .between("age", 20, 25)
                .isNotNull("email");
        List<User> users = userMapper.selectList(queryWrapper);
        users.forEach(System.out::println);
    }

    @Test
    public void selectWrapperOrderTest() {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.orderByAsc("age").orderByDesc("id");
        //SELECT uid AS id,name,age,email FROM t_user ORDER BY age ASC,id DESC
        List<User> users = userMapper.selectList(queryWrapper);
        users.forEach(System.out::println);
    }

    @Test
    public void selectMapsTest() {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        //只查找name、age字段
        queryWrapper.select("name", "age");
        //SELECT name,age FROM t_user
        //使用Map而不用实体类避免实体类对象有空的字段
        List<Map<String, Object>> maps = userMapper.selectMaps(queryWrapper);
        maps.forEach(System.out::println);
    }

    //子查询
    @Test
    public void selectInSqlTest() {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.inSql("uid", "SELECT uid FROM t_user WHERE uid <= 5");
        //SELECT uid AS id,name,age,email FROM t_user WHERE (uid IN (SELECT uid FROM t_user WHERE uid <= 5))
        List<User> users = userMapper.selectList(queryWrapper);
        users.forEach(System.out::println);
    }

    //对来源于用户的信息进行条件组装
    @Test
    public void selectConditionTest() {
        String name = null;
        Integer ageBegin = 12;
        Integer ageEnd = 24;
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper
                //NotBlank VS NotEmpty ： Blank不允许空格这种字符串
                //若name不为空，则添加条件名字中要有字符A
                .like(StringUtils.isNotBlank(name), "name", "A")
                .ge(ageBegin != null, "age", ageBegin)
                .le(ageEnd != null, "age", ageEnd);
        //SELECT uid AS id,name,age,email FROM t_user WHERE (age >= ? AND age <= ?)
        List<User> users = userMapper.selectList(queryWrapper);
        users.forEach(System.out::println);
    }
}
```
#### UPDATE
```java
@SpringBootTest
public class MyBatisPlusWrapperTest {
	//将（年龄大于21并且用户名中包含有a）或邮箱为null的用户信息修改
    @Test
    public void updateWrapperTest() {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.gt("age", 21)
                .like("name", "a")
                .or()
                .isNull("email");
        User user = new User(4L, "Administrator", 21, "admin@163.com", null);
        //UPDATE t_user SET name=?, age=?, email=? WHERE (age > ? AND name LIKE ? OR email IS NULL)
        int result = userMapper.update(user, queryWrapper);
        System.out.println("result = " + result);
    }

    //户名中包含有a或（年龄大于21并且用或邮箱为null）的用户信息修改
    @Test
    public void updateWrapper2Test() {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.like("name", "A")
                //注意Lambda表示式
                .and(i -> i.gt("age", 20).or().isNull("email"));
        User user = new User(4L, "Admin", 22, "admin@189.cn", null);
        //UPDATE t_user SET name=?, age=?, email=? WHERE (name LIKE ? AND (age > ? OR email IS NULL))
        int result = userMapper.update(user, queryWrapper);
        System.out.println("result = " + result);
    }

    //修改姓名中有A（年龄小于23或邮箱不为空的）
    @Test
    public void updateWrapper3Test() {
        UpdateWrapper<User> updateWrapper = new UpdateWrapper<>();
        updateWrapper.set("age", 23)
                .set("email", "Admin@outlook.com")
                .like("name", "A")
                .and(i -> i.le("age", 23)
             	.or().isNotNull("email"));
        //注意此处没有new User对象，而是在updateWrapper中设置了要修改的内容
        int result = userMapper.update(null, updateWrapper);
        System.out.println("result = " + result);
    }
}
```
#### DELETE
```java
@SpringBootTest
public class MyBatisPlusWrapperTest {
    @Test
    public void deleteWrapperTest() {
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.isNull("email");
        //DELETE FROM t_user WHERE (email IS NULL)
        int result = userMapper.delete(queryWrapper);
        System.out.println("受影响的行数result = " + result);
    }
}
```
### LambdaQueryWrapper
```java
//Lambda表达式-查询
@Test
public void lambdaQueryWrapperTest() {
    String name = "A";
    Integer ageBegin = 12;
    Integer ageEnd = 24;
    LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
    queryWrapper
            //使用Lambda表达式避免使用字符串出现运行时名字错误问题
            .like(StringUtils.isNotBlank(name), User::getName, name)
            .ge(ageBegin != null, User::getAge, ageBegin)
            .le(ageEnd != null, User::getAge, ageEnd);
    List<User> users = userMapper.selectList(queryWrapper);
    users.forEach(System.out::println);
}
```
### LambdaUpdateWrapper
```java
//Lambda表达式-更新
@Test
public void lambdaUpdateWrapperTest() {
    LambdaUpdateWrapper<User> updateWrapper = new LambdaUpdateWrapper<>();
    updateWrapper.set(User::getAge, 20)
            .set(User::getEmail, "user@Email.com")
            .like(User::getName, "A")
            .and(i -> i.lt(User::getAge, 24)).or().isNotNull(User::getEmail);
    User user = new User();
    int result = userMapper.update(user, updateWrapper);
    System.out.println("受影响的行数result = " + result);
}
```
总结：Lambda~Wrapper的优点就是防止字段名写错。
## 分页插件
MyBatis Plus自带分页插件，只要简单的配置即可实现分页功能
```java
@Configuration
public class MyBatisPlusConfig {
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        //添加分页插件
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
```
```java
@Test
public void pageInterceptorTest() {
    //显示第一页，每页显示三个
    Page<User> page = new Page<>(1, 3);
    LambdaQueryWrapper<User> queryWrapper = new LambdaQueryWrapper<>();
    queryWrapper.select(User::getId, User::getName, User::getEmail)
            .le(User::getAge, 21)
            .likeRight(User::getName, "J");
    //SELECT COUNT(*) AS total FROM t_user WHERE (age <= ? AND name LIKE ?)
    userMapper.selectPage(page, queryWrapper);
    //SELECT uid AS id,name,email FROM t_user WHERE (age <= ? AND name LIKE ?) LIMIT ?
    page.getRecords().forEach(System.out::println);
    System.out.println("page.getCurrent() = " + page.getCurrent());
    System.out.println("page.getSize() = " + page.getSize());
    System.out.println("page.getPages() = " + page.getPages());
    System.out.println("page.getTotal() = " + page.getTotal());
    System.out.println("page.hasPrevious() = " + page.hasPrevious());
    System.out.println("page.hasNext() = " + page.hasNext());
}
```

---

```java
@Mapper
public interface UserMapper extends BaseMapper<User> {
    Page<User> selectPageVo(@Param("page") Page<User> page, @Param("age") Integer age);
}
```
```xml
<select id="selectPageVo" resultType="com.qzy.mybatisplus01.pojo.User">
    SELECT * FROM t_user WHERE age > #{age}
</select>
```
```java
@Test
public void selectPageVoTest() {
    //设置分页参数
    Page<User> page = new Page<>(1, 3);
    userMapper.selectPageVo(page, 20);
    //获取分页数据
    List<User> list = page.getRecords();
    list.forEach(System.out::println);
    System.out.println("当前页：" + page.getCurrent());
    System.out.println("每页显示的条数：" + page.getSize());
    System.out.println("总记录数：" + page.getTotal());
    System.out.println("总页数：" + page.getPages());
    System.out.println("是否有上一页：" + page.hasPrevious());
    System.out.println("是否有下一页：" + page.hasNext());
}
```
## 乐观锁

- 乐观锁：认为不会发生并发问题，在并发修改字段时(update)，检查字段version是否与之前select查询出来的一样，否则不修改。
- 悲观锁：认为并发问题一定会发生，并发情况下，同一时间只能有1个用户访问字段进行修改，其它人必须等待它完成操作才能继续。

配置乐观锁：
```java
@Configuration
public class MyBatisPlusConfig {
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        //添加乐观锁插件
        interceptor.addInnerInterceptor(new OptimisticLockerInnerInterceptor());
        return interceptor;
    }
}
```
产品类：
```java
@Data
public class Product {
    private Long id;
    private String name;
    private Integer price;
    @Version    //乐观锁注解
    private Integer version;
}
```
```java
@Test
public void ConcurrentVersionUpdateTest() {
    Product p1 = productMapper.selectById(1L);
    p1.setPrice(p1.getPrice() + 50);
    Product p2 = productMapper.selectById(1L);
    p2.setPrice(p2.getPrice() - 30);
    productMapper.updateById(p1);
    int result = productMapper.updateById(p2);
    if (result == 0) {
        p2 = productMapper.selectById(1L);
        p2.setPrice(p2.getPrice() - 30);
        result = productMapper.updateById(p2);
        System.out.println("小王修改重试的结果：" + result);
    }
    //老板看价格
    Product p3 = productMapper.selectById(1L);
    System.out.println("老板看价格：" + p3.getPrice());
}
```
## 通用枚举处理
表中的有些字段值是固定的，例如性别（男或女），此时可以使用MyBatis-Plus的通用枚举来实现。

1. 配置：
```java
@Getter
@AllArgsConstructor
public enum SexEnum {
    MALE(1, "男"),
    FEMALE(2, "女");
    @EnumValue  //将该注解标识的字段存储到数据库中
    private Integer sex;
    @JsonValue	//查询到信息时将返回给前端sexName而不是sex；
    private String sexName;
}
```
```java
public class User {
    private SexEnum sex;
}
```

2. 扫描：
```yaml
mybatis-plus:
  type-enums-package: com.qzy.mybatisplus01.enums
  configuration:
  ## 配置枚举处理器
    default-enum-type-handler: org.apache.ibatis.type.EnumTypeHandler
```

3. 测试
```java
    @Test
    public void enumTest() {
        //设置性别信息为枚举项，会将@EnumValue注解所标识的属性值存储到数据库
        User user = new User(null, "EnumUser", 20, null, SexEnum.MALE);
        //INSERT INTO t_user ( name, age, sex ) VALUES ( ?, ?, ? )
        int result = userMapper.insert(user);
        System.out.println("result = " + result);
    }
```
## JSON类型处理器
### 问题描述
数据库的user表中有一个info字段，是JSON类型：
![](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/mybatis/202406171621063.png)
 格式像这样：

```json
{"age": 20, "intro": "佛系青年", "gender": "male"}
```
而目前User实体类中却是String类型：
![](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/mybatis/202406171621248.png)
这样一来，我们要读取info中的属性时就非常不方便。如果要方便获取，info的类型最好是一个Map或者实体类。
 而一旦我们把info改为对象类型，就需要在写入数据库时手动转为String，再读取数据库时，手动转换为对象，这会非常麻烦。
因此MybatisPlus提供了很多特殊类型字段的类型处理器，解决特殊字段类型与数据库类型转换的问题。例如处理JSON就可以使用JacksonTypeHandler处理器。
### 解决步骤
```java
@Data
public class UserInfo {
    private Integer loveNumber;
    private String address;
    private Boolean smoke;
}
```
```java
public class User {
    @TableField(typeHandler = JacksonTypeHandler.class)
	private UserInfo info;
}
```

## 代码生成器
```xml
<dependency>
  <groupId>com.baomidou</groupId>
  <artifactId>mybatis-plus-generator</artifactId>
  <version>3.5.1</version>
</dependency>
<dependency>
  <groupId>org.freemarker</groupId>
  <artifactId>freemarker</artifactId>
  <version>2.3.31</version>
</dependency>
```
```java
@SpringBootTest
public class MyBatisPlusGenerator {
    @Test
    public void fastAutoGeneratorTest() {
        FastAutoGenerator.create("jdbc:mysql://localhost:3306/mybatisplus", "root", "root")
                .globalConfig(builder -> {
                    builder.author("qzy") // 设置作者
                            //.enableSwagger()// 开启 swagger 模式
                            .fileOverride()// 覆盖已生成文件
                            .outputDir("F://Java");// 指定输出目录
                })
                .packageConfig(builder -> {
                    builder.parent("com.qzy") // 设置父包名
                            .moduleName("mybatisplus") // 设置父包模块名
                            // 设置mapperXml生成路径
                            .pathInfo(Collections.singletonMap(OutputFile.mapperXml, "F://mybatisplus"));
                })
                .strategyConfig(builder -> {
                    builder.addInclude("t_user")// 设置需要生成的表名
                            .addTablePrefix("t_", "c_");// 设置过滤表前缀
                })
                // 使用Freemarker 引擎模板，默认的是Velocity引擎模板
                .templateEngine(new FreemarkerTemplateEngine())
                .execute();

    }
}
```
## 多数据源
适用于多种场景：纯粹多库、 读写分离、 一主多从、 混合模式等
```yaml
spring:
  datasource:
    dynamic:
      ## 设置默认的数据源或者数据源组,默认值即为master
      primary: master
      ## 严格匹配数据源,默认false；true未匹配到指定数据源时抛异常,false使用默认数据源
      strict: false
      datasource:
        ## 主数据库
        master:
          url: jdbc:mysql://localhost:3306/mybatis_plus?characterEncoding=utf-8&useSSL=false&serverTimezone=GMT
          driver-class-name: com.mysql.cj.jdbc.Driver
          username: root
          password: root
        ## 其它数据库
        slave_1:
          url: jdbc:mysql://localhost:3306/mybatis_plus1?characterEncoding=utf-8&useSSL=false&serverTimezone=GMT
          driver-class-name: com.mysql.cj.jdbc.Driver
          username: root
          password: root
```
```java
@Service
@DS("master")//指定数据源为master
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

}
```
```java
@Service
@DS("slave_1")//指定数据源为slave_1
public class ProductServiceImpl extends ServiceImpl<ProductMapper, Product> implements ProductService {

}
```
## MyBatisX插件
MyBatis-Plus为我们提供了强大的mapper和service模板，能够大大的提高开发效率。

但是在真正开发过程中，MyBatis-Plus并不能为我们解决所有问题，例如一些复杂的SQL，多表联查，我们就需要自己去编写代码和SQL语句，我们该如何快速的解决这个问题呢，这个时候可以使用MyBatisX插件。

MyBatisX一款基于 IDEA 的快速开发插件，为效率而生。用法: [https://baomidou.com/pages/ba5b24/](https://baomidou.com/pages/ba5b24/)
