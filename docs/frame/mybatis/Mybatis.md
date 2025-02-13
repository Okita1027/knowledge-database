---
title: MyBatis
shortTitle: MyBatis
description: 
date: 2024-06-16 22:13:14
categories: [MyBatis]
tags: []
---
## 简介
### 技术特点

- MyBatis 是支持定制化 SQL、存储过程以及高级映射的优秀的持久层框架
- MyBatis 避免了几乎所有的 JDBC 代码和手动设置参数以及获取结果集
- MyBatis可以使用简单的XML或注解用于配置和原始映射，将接口和Java的POJO（Plain Old JavaObjects，普通的Java对象）映射成数据库中的记录
- MyBatis 是一个 半自动的ORM（Object Relation Mapping）框架
### 技术对比

- JDBC
   - SQL 夹杂在Java代码中耦合度高，导致硬编码内伤
   - 维护不易且实际开发需求中 SQL 有变化，频繁修改的情况多见
   - 代码冗长，开发效率低
- Hibernate 和 JPA
   - 操作简便，开发效率高
   - 程序中的长难复杂 SQL 需要绕过框架
   - 内部自动生产的 SQL，不容易做特殊优化 
   - 基于全映射的全自动框架，大量字段的 POJO 进行部分映射时比较困难。 
   - 反射操作太多，导致数据库性能下降 
- MyBatis 
   - 轻量级，性能出色 
   - SQL 和 Java 编码分开，功能边界清晰。Java代码专注业务、SQL语句专注数据 
   - 开发效率稍逊于Hibernate，但是完全能够接受
## 搭建Mybatis
### 引入依赖
```xml
<!-- Mybatis核心 -->
<dependency>
  <groupId>org.mybatis</groupId>
  <artifactId>mybatis</artifactId>
  <version>3.5.7</version>
</dependency>
```
### MyBatis的核心配置文件

- 习惯上命名为mybatis-config.xml，这个文件名仅仅只是建议，并非强制要求。将来整合Spring之后，这个配置文件可以省略
- 核心配置文件主要用于配置连接数据库的环境以及MyBatis的全局配置信息
- 核心配置文件存放的位置是src/main/resources目录下
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>

  <!--
      MyBatis核心配置文件中，标签的顺序：
      properties?,settings?,typeAliases?,typeHandlers?,
      objectFactory?,objectWrapperFactory?,reflectorFactory?,
      plugins?,environments?,databaseIdProvider?,mappers?
  -->
  
    <!-- 配置资源文件 -->
    <!-- 后续value中可以写成 ${xxx} 的形式 -->
    <properties resource="jdbc.properties"/>

  	<settings>
        <!-- 将数据库中的下划线映射为驼峰,例如：user_name->userName -->
        <setting name="mapUnderscoreToCamelCase" value="true"/>
        <!-- 开启延迟加载 -->
        <setting name="lazyLoadingEnabled" value="true"/>
        <!-- 按需加载(此选项默认为false) -->
        <setting name="aggressiveLazyLoading" value="false"/>
    </settings>
  
    <!-- 起别名： -->
    <!-- 可以在mybatis中任意的地方使用 -->
    <typeAliases>
        <!-- type:原来的名字;alias:别名 -->
        <!-- 这里的alias属性可以省略，默认为末尾的类名即User(大小写不影响) -->
        <typeAlias type="com.mybatis.pojo.User" alias="User"/>
        <!-- 上述方式在遇到类名多的情况下会产生大量代码 -->
        <!-- 以下方式可以直接为包下所有类设置默认别名 -->
        <package name="com.mybatis.pojo"/>
    </typeAliases>

    <!--
        environments：配置多个连接数据库的环境
        属性：
        	default：设置默认使用的环境的id
    -->
    <environments default="development">
        <!--
            environment：配置某个具体的环境
            属性：
            	id：表示连接数据库的环境的唯一标识，不能重复
        -->
        <environment id="development">
            <!--
                transactionManager：设置事务管理方式
                属性：
                  type="JDBC|MANAGED"
                  JDBC：表示当前环境中，执行SQL时，使用的是JDBC中原生的事务管理方式，事务的提交或回滚需要手动处理
                  MANAGED：被管理，例如Spring
            -->
            <transactionManager type="JDBC"/>
            <!--
                dataSource：配置数据源
                属性：
                  type：设置数据源的类型
                  type="POOLED|UNPOOLED|JNDI"
                  POOLED：表示使用数据库连接池缓存数据库连接
                  UNPOOLED：表示不使用数据库连接池
                  JNDI：表示使用上下文中的数据源
            -->
            <dataSource type="POOLED">
								<!-- <property name="driver" value="com.mysql.cj.jdbc.Driver"/>-->
                <!-- 使用引入的properties配置文件例如: -->
                <property name="driver" value="${jdbc.driver}"/>
                <!-- 时区不可省略否则会报错 -->
                <property name="url" value="jdbc:mysql://localhost:3306/mybatis?serverTimezone=UTC"/>
                <property name="username" value="root"/>
                <property name="password" value="root"/>
            </dataSource>
        </environment>
    </environments>

    <!--引入mybatis的映射文件-->
    <mappers>
        <!--<mapper resource="mappers/UserMapper.xml"/>-->

				<!-- 以包为单位引入映射文件的条件： -->
        <!-- 1：mapper接口与映射文件所在的包路径名要相同 -->
        <!-- 2：mapper接口的名字与映射文件的名字要相同 -->
        <package name="com.mybatis.mapper"/>
    </mappers>
</configuration>
```
### mapper接口
MyBatis中的mapper接口相当于以前的dao。但是区别在于，mapper仅仅是接口，我们不需要提供实现类。
```java
public interface UserMapper {
    /**
    * 添加用户信息
    */
    int insertUser();
}
```
### MyBatis的映射文件
相关概念：ORM（Object Relationship Mapping）对象关系映射。

- 对象：Java的实体类对象
- 关系：关系型数据库
- 映射：二者之间的对应关系
| Java概念 | 数据库概念 |
| :-: | :-: |
| 类 | 表 |
| 属性 | 字段/列 |
| 对象 | 记录/行 |

- 映射文件的命名规则：
   - 表所对应的实体类的类名+Mapper.xml
      - 例如：表t_user，映射的实体类为User，所对应的映射文件为UserMapper.xml
   - 因此一个映射文件对应一个实体类，对应一张表的操作
   - MyBatis映射文件用于编写SQL，访问以及操作表中的数据
   - MyBatis映射文件存放的位置是src/main/resources/mappers目录下
- MyBatis中可以面向接口操作数据，要保证两个一致：
   - mapper接口的全类名和映射文件的命名空间（namespace）保持一致
   - mapper接口中方法的方法名和映射文件中编写SQL的标签的id属性保持一致
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
        PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.mybatis.mapper.UserMapper">
    <!-- 接口文件名要和映射文件名路径保持一致 -->
    <!-- 接口方法名要和映射文件中的sql的id保持一致 -->
    <insert id="insertUser">
        insert into t_user values(null, 'admin', '123456', 20, '男', '123456@qq.com')
    </insert>

    <!-- 此处使用了别名 User（详见mybatis-config.xml）-->
    <select id="selectAllUsers" resultType="User">
        select * from t_user;
    </select>
</mapper>
```
### log4j日志功能
log4j依赖
```xml
<!-- log4j日志 -->
<dependency>
  <groupId>log4j</groupId>
  <artifactId>log4j</artifactId>
  <version>1.2.17</version>
</dependency>
```
 log4j的配置文件名为log4j.xml，存放的位置是src/main/resources目录下
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE log4j:configuration SYSTEM "log4j.dtd">
<log4j:configuration>
    <appender name="STDOUT" class="org.apache.log4j.ConsoleAppender">
        <param name="Encoding" value="UTF-8"/>
        <layout class="org.apache.log4j.PatternLayout">
            <param name="ConversionPattern" value="%-5p %d{MM-dd HH:mm:ss,SSS} %m (%F:%L) \n"/>
        </layout>
    </appender>
    <logger name="java.sql">
        <level value="debug"/>
    </logger>
    <logger name="org.apache.ibatis">
        <level value="info"/>
    </logger>
    <root>
        <level value="debug"/>
        <appender-ref ref="STDOUT"/>
    </root>
</log4j:configuration>
```
日志的级别
FATAL(致命)>ERROR(错误)>WARN(警告)>INFO(信息)>DEBUG(调试)；从左到右打印的内容越来越详细
### 测试
```java
@Test
public void testInsert() throws IOException {
    //获取核心配置文件的输入流
    InputStream is = Resources.getResourceAsStream("mybatis-config.xml");
    //获取SQLSessionFactoryBuilder对象
    SqlSessionFactoryBuilder sqlSessionFactoryBuilder = new SqlSessionFactoryBuilder();
    //获取SQLSessionFactory对象
    SqlSessionFactory sqlSessionFactory = sqlSessionFactoryBuilder.build(is);

    //获取sql的绘画对象SQLSession，是MyBatis提供的操作数据库的对象（不自动提交事务）
    SqlSession sqlSession = sqlSessionFactory.openSession();
    //获取sql的绘画对象SQLSession，是MyBatis提供的操作数据库的对象（自动提交事务）
    //SqlSession sqlSession = sqlSessionFactory.openSession(true);

    //获取UserMapper的代理实现类对象;传入接口的.class，自动获得生成的实现类对象
    UserMapper mapper = sqlSession.getMapper(UserMapper.class);
    //调用UserMapper接口中的方法，实现insert功能
    int res = mapper.insertUser();
    System.out.println("res = " + res);
    //方法2(底层调用)：
    //int insert = sqlSession.insert("com.mybatis.mapper.UserMapper.insertUser");
    //System.out.println("insert = " + insert);

    //手动提交事务，否则数据不会插入表中，但表中的id会自增1
    sqlSession.commit();
    //关闭会话
    sqlSession.close();
}
```
封装SqlSession
```java
public class SqlSessionUtil {
    public static SqlSession getSqlSession() {
        SqlSession sqlSession = null;
        try {
            InputStream is = Resources.getResourceAsStream("mybatis-config.xml");
            SqlSessionFactoryBuilder sqlSessionFactoryBuilder = new SqlSessionFactoryBuilder();
            SqlSessionFactory sqlSessionFactory = sqlSessionFactoryBuilder.build(is);
            sqlSession = sqlSessionFactory.openSession(true);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return sqlSession;
    }
}
```
## Mybatis增删改查
### Mapper接口
```java
public interface UserMapper {
    int insertUser();
    int updateUser();
    int deleteUser();
    Map<String, Object> selectUserByNameToMap(@Param("username") String username);
    List<Map<String, Object>> selectAllUsersToMap();
    Map<String, Object> selectAllUsersToMap02();
}
```
### 新增
```xml
<!--int insertUser();-->
<insert id="insertUser">
  insert into t_user values(null,'admin','123456',23,'男')
</insert>
```
### 删除
```xml
<!--int deleteUser();-->
<delete id="deleteUser">
  delete from t_user where id = 7
</delete>
```
### 修改
```xml
<!--int updateUser();-->
<update id="updateUser">
  update t_user set username='ybc',password='123' where id = 6
</update>
```
### 查询
#### 实体类
```xml
<!--User getUserById();-->
<select id="getUserById" resultType="com.qzy.mybatis.bean.User"> <!--可使用别名User-->
	select * from t_user where id = 2
</select>
```
#### List集合
```xml
<!-- List<User> selectAllUsers(); -->
<select id="selectAllUsers" resultType="User">
  select * from t_user;
</select>
```
#### 单个数据
```xml
<!--Integer selectUserCount();-->
<!-- 
    在MyBatis中，对于Java中常用的类型都设置了类型别名
    * 例如： java.lang.Integer-->int|integer
    * 例如： int-->_int|_integer
    * 例如： Map-->map,List-->list 
-->
<!-- 也可以是mybatis中为Java常用数据类型起的别名 -->
<select id="selectUserCount" resultType="int">
    SELECT COUNT(*) FROM t_user;
</select>
```
#### Map集合
```xml
<!--Map<String, Object> selectUserByNameToMap(@Param("username") String username);-->
<select id="selectUserByNameToMap" resultType="map">
    SELECT * FROM t_user WHERE username = #{username};
</select>
```
#### 查询多条数据为map集合
##### List嵌套Map
将表中的数据以map集合的方式查询，一条数据对应一个map；若有多条数据，就会产生多个map集合，此时可以将这些map放在一个list集合中获取
```xml
<!--List<Map<String, Object>> selectAllUsersToMap();-->
<select id="selectAllUsersToMap" resultType="map">
    SELECT * FROM t_user;
</select>
```
##### @MapKey
将表中的数据以map集合的方式查询，一条数据对应一个map；若有多条数据，就会产生多个map集合，并且最终要以一个map的方式返回数据，此时需要通过@MapKey注解设置map集合的键，值是每条数据所对应的map集合
```xml
<!--@MapKey("id")-->
<!--Map<String, Object> selectAllUsersToMap02();-->
<select id="selectAllUsersToMap02" resultType="map">
    SELECT * FROM t_user;
</select>
```
### SQL语句注解
在接口中的方法上直接加上对应的注解和SQL语句，就不需要在XxxMapper.xml映射文件中写了。
#### @Select
```java
@Select("SELECT * FROM user WHERE username = #{username}")
User getUserByUsername(@Param("username") String username);
```
#### @Update
```java
@Update("UPDATE user SET username = #{username} WHERE id = #{id}")
int updateUser(@Param("id") Integer id, @Param("username") String username);
```
#### @Delete
```java
@Delete("DELETE FROM user WHERE id = #{id}")
int deleteUser(@Param("id") Integer id);
```
#### @Insert
```java
@Insert("INSERT INTO user VALUES(null, #{username}, #{password})")
@Options(useGeneratedKeys = true, keyProperty = "id")
//若加上@Param("user")注解，则#{}中要写成user.username
void insertUser(User user);
```
## Mybatis获取参数值
### 两种方式
#### `${}`
`${}`本质是**字符串拼接**,`${}`使用字符串拼接的方式拼接sql，若为字符串类型或日期类型的字段进行赋值时，需要**手动加单引号**
#### `#{}`
`#{}`本质是**占位符赋值**,`#{}`使用占位符赋值的方式拼接sql，此时为字符串类型或日期类型的字段进行赋值时，可以**自动添加单引号**
### 单个字面量类型的参数
若mapper接口中的方法参数为单个的字面量类型：
此时可以使用`${}`/`#{}`以任意的名称获取参数的值，注意`${}`需要手动加单引号
```xml
<!--User selectUserByUsername(String username);-->
<select id="selectUserByUsername" resultType="User">
  <!-- #{} 表示占位符; ${}表示字符串拼接; {}中的内容可以随便写,但不可以是数字,最好写参数名称以见名知意 -->
  <!-- 注意若使用${}则需要加单引号,且字符串不能防止SQL注入 -->
  select * from t_user where username = #{username};
</select>
```
### 多个字面量类型的参数
若mapper接口中的方法参数为多个时：
此时MyBatis会自动将这些参数放在一个map集合中，**以arg0,arg1...为键，以参数为值；以param1,param2...为键，以参数为值并且这两种方式可以混用**；因此只需要通过`${}` `#{}`访问map集合的键就可以获取相对应的值，注意`${}`需要手动加单引号

```xml
<!--boolean checkLogin(String username, String password);-->
<select id="checkLogin" resultType="boolean">
    <!-- 多个参数时:{}中可以写arg0 arg1 ...;也可以param1 param2 ... 也可以混着用 arg0 param2 ... -->
    SELECT * FROM t_user WHERE username = #{arg0} and password = #{param2};
</select>
```
### map集合类型的参数
若mapper接口中的方法需要的参数为多个时，此时可以手动创建map集合，将这些数据放在map中只需要通过`${}` `#{}`，**访问map集合的键就可以获取相对应的值**，注意`${}`需要手动加单引号
```xml
<!--boolean checkLoginByMap(HashMap<String, String> hashMap);-->
<select id="checkLoginByMap" resultType="boolean">
    SELECT * FROM t_user WHERE username = #{username} AND password = #{password};
</select>
```
### 实体类类型的参数
若mapper接口中的方法参数为实体类对象时此时可以使用`${}` `#{}`，**通过访问实体类对象中的属性名获取属性值**，注意${}需要手动加单引号
```xml
<!--void insertUser(User user);-->
<!-- 插入数据：{}中的内容为User类的属性即get/set方法去掉get/set后首字母小写 -->
<insert id="insertUser">
    INSERT INTO t_user VALUES(null, #{username}, #{password}, #{age}, #{gender}, #{email});
</insert>
```
### **@Param标识参数**
可以通过@Param注解标识mapper接口中的方法参数
此时，会将这些参数放在map集合中，以@Param注解的value属性值为键，以参数为值；以param1,param2...为键，以参数为值；只需要通过`${}`和`#{}`访问map集合的键就可以获取相对应的值，注意${}需要手动加单引号

```xml
<!--@Param：为参数添加键名,以便在UserMapper.xml中使用-->
<!--User checkLoginByParam(@Param("username") String username, @Param("password") String password);-->
<select id="checkLoginByParam" resultType="User">
    <!-- 此处{}中也可以使用param1 param2,但使用了@Param后肯定以注解中指定的为准 -->
    SELECT * FROM t_user WHERE username = #{username} AND password = #{password};
</select>
```
## 特殊SQL的执行
### 模糊查询
```xml
<!--List<User> selectUserByLike(@Param("like") String like);-->
<select id="selectUserByLike" resultType="User">
    <!--模糊查询的三种方案，推荐使用第一种-->
    SELECT * FROM t_user WHERE username like "%"#{like}"%"
    <!--SELECT * FROM t_user WHERE username like '%${like}%'-->
    <!--SELECT * FROM t_user WHERE username like concat('%',#{like},'%')-->
</select>
```
### 批量删除
```xml
<!--void deleteUserById(@Param("id") String id);-->
<delete id="deleteUserById">
    DELETE FROM t_user WHERE id IN (${id});
</delete>
```
### 动态设置表名
```xml
<!--List<User> selectAllUsersFromTable(@Param("tableName") String tableName);-->
<select id="selectAllUsersFromTable" resultType="User">
    SELECT * FROM ${tableName};
</select>
```
### 获取自增的主键
```xml
<!--void insertUser(User user);-->
<!-- useGeneratedKeys：设置使用自增的主键 -->
<!-- keyProperty：因为增删改有统一的返回值是受影响的行数，因此只能将获取的自增的主键放在传输的参数user对象的某个属性中 -->
<!-- 使用自增的主键,将主键的值赋值给User对象的id -->
<insert id="insertUser" useGeneratedKeys="true" keyProperty="id">
    INSERT INTO t_user VALUES(null, #{username}, #{password}, #{age}, #{gender}, #{email});
</insert>
```
## 自定义映射resultMap
在pojo类字段名与数据库中字段名不一致时解决方案：

1. 在SQL语句中给要查询的字段起别名使其对应pojo类中名字
2. 在mybatis核心配置文件中将数据库中的下划线映射为驼峰
3. 在映射文件(EmpMapper.xml)中自定义映射
### resultMap处理字段和属性的映射关系
若字段名和实体类中的属性名不一致，则可以通过resultMap设置自定义映射
```xml
<!--
    resultMap：设置自定义映射
    属性：
      id：表示自定义映射的唯一标识
      type：查询的数据要映射的实体类的类型
    子标签：
      id：设置主键的映射关系
      result：设置普通字段的映射关系
      association：设置多对一的映射关系
      collection：设置一对多的映射关系
    属性：
      property：设置映射关系中实体类中的属性名
      column：设置映射关系中表中的字段名
-->
<resultMap id="empResultMap" type="Emp">
  <id column="emp_id" property="empId"/>
  <result column="emp_name" property="empName"/>
  <result column="age" property="age"/>
  <result column="email" property="email"/>
</resultMap>

<!--Emp selectEmpByEmpId(@Param("empId") Integer empId);-->
<select id="selectEmpByEmpId" resultMap="empResultMap">
  SELECT *
  FROM t_emp
  WHERE emp_id = #{empId};
</select>
```
### **多对一映射处理**
场景模拟：查询员工信息以及员工所对应的部门信息
#### 级联
```xml
<resultMap id="empAndDeptResultMap01" type="Emp">
  <id column="emp_id" property="empId"/>
  <result column="emp_name" property="empName"/>
  <result column="age" property="age"/>
  <result column="email" property="email"/>
  <!-- 将数据库中查询到的字段名映射为Dept类属性 -->
  <result column="dept_id" property="dept.deptId"/>
  <result column="dept_name" property="dept.deptName"/>
</resultMap>
<!--Emp selectEmpAndDeptByEmpId(@Param("empId") Integer empId);-->
<select id="selectEmpAndDeptByEmpId" resultMap="empAndDeptResultMap01">
  SELECT *
  FROM t_emp
  LEFT JOIN t_dept
  ON t_emp.dept_id = t_dept.dept_id
  WHERE t_emp.emp_id = #{empId};
</select>
```
#### **association**
```xml
<resultMap id="empAndDeptResultMap02" type="Emp">
  <id column="emp_id" property="empId"/>
  <result column="emp_name" property="empName"/>
  <result column="age" property="age"/>
  <result column="email" property="email"/>
  <!--
  association:处理多对一的映射关系（处理实体类类型的属性）
  property:设置需要处理映射关系的属性的属性名
  javaType:设置要处理的属性的类型
  -->
  <association property="dept" javaType="Dept">
    <id column="dept_id" property="deptId"/>
    <result column="dept_name" property="deptName"/>
  </association>
</resultMap>
<!--Emp selectEmpAndDeptByEmpId(@Param("empId") Integer empId);-->
<select id="selectEmpAndDeptByEmpId" resultMap="empAndDeptResultMap02">
  SELECT *
  FROM t_emp
  LEFT JOIN t_dept
  ON t_emp.dept_id = t_dept.dept_id
  WHERE t_emp.emp_id = #{empId};
</select>
```
#### **分步查询**
```xml
<resultMap id="empAndDeptByStepResultMap" type="Emp">
  <id column="emp_id" property="empId"/>
  <result column="emp_name" property="empName"/>
  <result column="age" property="age"/>
  <result column="gender" property="gender"/>
  <!-- fetchType:在开启了延迟加载的环境中，通过该属性设置当前分步查询是否使用延迟加载 -->
  <!-- eager(立即加载)  lazy(延迟加载) -->
  <!-- select：执行第 二 步查询 -->
  <!-- column：将员工信息的 deptId 传给selectEmpAndDeptByStep2这个方法 -->
  <association property="dept" fetchType="lazy"
    select="com.mybatis.mapper.DeptMapper.selectEmpAndDeptByStep2"
    column="dept_id"/>
</resultMap>
<!-- Emp selectEmpAndDeptByStep1(@Param("empId") Integer empId); -->
<select id="selectEmpAndDeptByStep1" resultMap="empAndDeptByStepResultMap">
  <!-- 先查出empId对应的员工信息 -->
  SELECT *
  FROM t_emp_mybatis
  WHERE emp_id = #{empId};
</select>
```
```xml
<!-- 根据第一步查询得到的deptId来查询该部门信息 -->
<!-- Dept selectEmpAndDeptByStep2(@Param("deptId") Integer deptId); -->
<select id="selectEmpAndDeptByStep2" resultType="Dept">
  SELECT *
  FROM t_dept
  WHERE dept_id = #{deptId};
</select>
```
### **一对多映射处理**
#### collection
```xml
<resultMap id="deptAndEmpResultMap" type="Dept">
  <id column="dept_id" property="deptId"/>
  <result column="dept_name" property="deptName"/>
  <!-- ofType:设置collection标签所处理的集合属性中存储数据的类型 -->
  <collection property="emps" ofType="Emp">
    <id column="emp_id" property="empId"/>
    <result column="emp_name" property="empName"/>
    <result column="age" property="age"/>
    <result column="gender" property="gender"/>
  </collection>
</resultMap>
<!-- 查询指定部门的所有员工信息 -->
<!--Dept selectDeptAndEmpByDeptId(@Param("deptId") Integer deptId);-->
<select id="selectDeptAndEmpByDeptId" resultMap="deptAndEmpResultMap">
  SELECT *
  FROM t_dept
  LEFT JOIN t_emp
  ON t_dept.dept_id = t_emp.emp_id
  WHERE t_dept.dept_id = #{deptId};
</select>
```
#### 分步查询
```xml
<resultMap id="DeptAndEmpByStepResultMap" type="Dept">
  <id column="dept_id" property="deptId"/>
  <result column="dept_name" property="deptName"/>
  <collection property="emps"
    select="com.mybatis.mapper.EmpMapper.selectDeptAndEmpByStep2"
    column="dept_id"/>
</resultMap>
<!-- Dept selectDeptAndEmpByStep1(@Param("deptId") Integer deptId); -->
<select id="selectDeptAndEmpByStep1" resultMap="DeptAndEmpByStepResultMap">
  SELECT *
  FROM t_dept
  WHERE dept_id = #{deptId};
</select>
```
```xml
<!-- Emp selectDeptAndEmpByStep2(@Param("deptId") Integer deptId); -->
<select id="selectDeptAndEmpByStep2" resultType="Emp">
  SELECT *
  FROM t_emp_mybatis
  WHERE dept_id = #{deptId};
</select>
```
分步查询的优点：

可以实现延迟加载但是必须在核心配置文件中设置全局配置信息：

lazyLoadingEnabled：延迟加载的全局开关。当开启时，所有关联对象都会延迟加载。

aggressiveLazyLoading：当开启时，任何方法的调用都会加载该对象的所有属性。否则，每个属性会按需加载此时就可以实现按需加载，获取的数据是什么，就只会执行相应的sql。此时可通过association和collection中的fetchType属性设置当前的分步查询是否使用延迟加载， fetchType="lazy(延迟加载)|eager(立即加载)"。

## 动态SQL
Mybatis框架的动态SQL技术是一种根据特定条件动态拼装SQL语句的功能，它存在的意义是为了解决拼接SQL语句字符串时的痛点问题。
### SQL片段
```xml
<!-- 记录一段SQL代码 -->
<!-- 可以使用<include refid="id值">标签使用 -->
<sql id="allElements">
  emp_id, emp_name, age
</sql>
select <include refid="allElements"/> from t_emp
```
### if
if标签可通过test属性的表达式进行判断，若表达式的结果为true，则标签中的内容会执行；反之标签中的内容不会执行
```xml
<!-- Emp selectEmpByNameAgeGender(@Param("empName") String empName, @Param("empAge") String empAge, @Param("empGender") String empGender); -->
<select id="selectEmpByNameAgeGender" resultType="Emp">
  SELECT <include refid="allElements"/>
  FROM t_emp
  <!-- 若第一个条件不成立,则WHERE后会直接跟AND导致SQL语句出错 -->
  <!-- 方案1： WHERE后面加上 1 = 1 后面的条件再加上 AND -->
  WHERE <!-- 1 = 1 -->
  <if test="empName != null and empName != ''">
    <!-- AND -->emp_name = #{empName}
  </if>
  <if test="age != null and age != ''">
    AND age = #{age}
  </if>
  <if test="gender != null and gender != ''">
    AND gender = #{gender}
  </if>
</select>
```
### where
where和if一般结合使用：

- 若where标签中的if条件都不满足，则where标签没有任何功能，即不会添加where关键字
- 若where标签中的if条件满足，则where标签会自动添加where关键字，并将条件最前方多余的and去掉

**注意**：where标签不能去掉条件最后多余的and
```xml
<!-- 方案2：使用WHERE标签 -->
<!-- List<Emp> selectEmpByNameAgeGender(@Param("empName") String empName, @Param("age") Integer age, @Param("gender") Character gender); -->
<select id="selectEmpByNameAgeGender" resultType="Emp">
  SELECT *
  FROM t_emp
  <where>	<!-- WHERE 标签能自动生成WHERE关键字并根据查询条件自动添加/删除条件前面 的AND -->
    <if test="empName != null and empName != ''">
      emp_name = #{empName}
    </if>
    <if test="age != null and age != ''">
      AND age = #{age}
    </if>
    <if test="gender != null and gender != ''">
      AND gender = #{gender}
    </if>
  </where>
</select>
```
### trim
trim用于去掉或添加标签中的内容
常用属性：

- prefix：在trim标签中的内容的前面添加某些内容
- prefixOverrides：在trim标签中的内容的前面去掉某些内容
- suffix：在trim标签中的内容的后面添加某些内容
- suffixOverrides：在trim标签中的内容的后面去掉某些内容
```xml
<!-- 方案3：使用TRIM标签 -->
<!-- TRIM标签的4个属性： -->
<!-- prefix/suffix:在条件前面/后面 添加 指定内容 -->
<!-- prefixOverrides/suffixOverrides:在条件前面/后面 删除 指定内容 -->
<!-- List<Emp> selectEmpByNameAgeGender(@Param("empName") String empName, @Param("age") Integer age, @Param("gender") Character gender); -->
<select id="selectEmpByNameAgeGender" resultType="Emp">
  SELECT *
  FROM t_emp
  <trim prefix="WHERE">
    <if test="empName != null and empName != ''">
      emp_name = #{empName}
    </if>
    <if test="age != null and age != ''">
      AND age = #{age}
    </if>
    <if test="gender != null and gender != ''">
      AND gender = #{gender}
    </if>
  </trim>
</select>
```
### choose、when、otherwise
choose、when、 otherwise相当于if...else if..else
```xml
<select id="selectEmpChooseWhen" resultType="Emp">
  SELECT *
  FROM t_emp
  <where>
    <!-- 以下标签相当于if...else if...else -->
    <choose>
      <!-- if -->
      <when test="empName != null and empName != ''">
        emp_name = #{empName}
      </when>
      <!-- else if -->
      <when test="age != null and age != ''">
        age = #{age}
      </when>
      <!-- else if -->
      <when test="gender != null and gender != ''">
        gender = #{gender}
      </when>
      <!-- 相当于else -->
      <otherwise>
        <!--...-->
      </otherwise>
    </choose>
  </where>
</select>
```
### foreach
```xml
<!-- void insertMoreEmps(@Param("emps") List<Emp> emps); -->
<insert id="insertMoreEmps">
  INSERT INTO t_emp VALUES
  <!-- foreach:多用于批量操作，如批量添加数据 -->
  <!-- item:用一个字符串表示集合/数组中的每一条数据 -->
  <!-- separator:分隔符,分隔符的左右两边会自动添加一个空格 -->
  <foreach collection="emps" item="emp" separator=",">
    <!-- 传过来的是集合中的emp对象（不是实体类型）故不能直接使用empName -->
    (null, #{emp.empName}, #{emp.age}, #{emp.gender}, null)
  </foreach>
</insert>

<!-- void updateMoreEmpNames(@Param("empNames") String[] empNames); -->
<update id="updateMoreEmpNames">
  UPDATE t_emp SET emp_name = '大明'
  WHERE emp_name IN
  <!-- open/close:循环的前/后用什么开始/结束 -->
  <!-- separator:每次循环数据之间的分隔符 -->
  <foreach collection="empNames" item="empName" open="(" close=")" separator=",">
    #{empName}
  </foreach>
</update>

<!-- void deleteMoreEmpByEmpIds(@Param("empIds") Integer[] empIds); -->
<delete id="deleteMoreEmpByEmpIds">
  DELETE FROM t_emp WHERE
  <foreach collection="empIds" item="empId" separator="or">
    emp_id = #{empId}
  </foreach>
</delete>
```
## **MyBatis的缓存**
### 一级缓存
一级缓存是**SqlSession**级别的，通过同一个SqlSession查询的数据会被缓存，下次查询相同的数据，就会从缓存中直接获取，不会从数据库重新访问

使一级缓存失效的四种情况：

- 不同的SqlSession对应不同的一级缓存
- 同一个SqlSession但是查询条件不同
- 同一个SqlSession两次查询期间执行了任何一次增删改操作
- 同一个SqlSession两次查询期间手动清空了缓存
### 二级缓存
#### 功能介绍
二级缓存是**SqlSessionFactory**级别，通过同一个SqlSessionFactory创建的SqlSession查询的结果会被缓存；此后若再次执行相同的查询语句，结果就会从缓存中获取。

二级缓存开启的条件：

- 在核心配置文件中，设置全局配置属性`cacheEnabled="true"`，默认为true，不需要设置
- 在映射文件中设置标签`<cache/>`
- 二级缓存必须在SqlSession关闭或提交之后有效
- 查询的数据所转换的实体类类型必须实现序列化的接口

使二级缓存失效的情况：

- 两次查询之间执行了任意的增删改，会使一级和二级缓存同时失效
#### 相关配置
在mapper配置文件中添加的cache标签可以设置一些属性：

- eviction属性：缓存回收策略，默认的是 LRU。
   - LRU（Least Recently Used） – 最近最少使用的：移除最长时间不被使用的对象。
   - FIFO（First in First out） – 先进先出：按对象进入缓存的顺序来移除它们。
   - SOFT – 软引用：移除基于垃圾回收器状态和软引用规则的对象。
   - WEAK – 弱引用：更积极地移除基于垃圾收集器状态和弱引用规则的对象。
- flushInterval属性：刷新间隔，单位毫秒
   - 默认情况是不设置，也就是没有刷新间隔，缓存仅仅调用语句时刷新
- size属性：引用数目，正整数
   - 代表缓存最多可以存储多少个对象，太大容易导致内存溢出
- readOnly属性：只读，true/false
   - true：只读缓存；会给所有调用者返回缓存对象的相同实例。因此这些对象不能被修改。这提供了很重要的性能优势。
   - false：读写缓存；会返回缓存对象的拷贝（通过序列化）。这会慢一些，但是安全，因此默认是false。
### 缓存查询顺序
先查询二级缓存，因为二级缓存中可能会有其他程序已经查出来的数据，可以拿来直接使用；

如果二级缓存没有命中，再查询一级缓存；

如果一级缓存也没有命中，则查询数据库；

SqlSession关闭之后，一级缓存中的数据会写入二级缓存。

### 整合第三方缓存EHCache
#### **添加依赖**
```xml
<!-- Mybatis EHCache整合包 -->
<dependency>
  <groupId>org.mybatis.caches</groupId>
  <artifactId>mybatis-ehcache</artifactId>
  <version>1.2.1</version>
</dependency>
<!-- slf4j日志门面的一个具体实现 -->
<dependency>
  <groupId>ch.qos.logback</groupId>
  <artifactId>logback-classic</artifactId>
  <version>1.2.3</version>
</dependency>
```
#### **各jar包功能**
| jar包名称 | 作用 |
| --- | --- |
| mybatis-ehcache | Mybatis和EHCache的整合包 |
| ehcache | EHCache核心包 |
| slf4j-api | SLF4J日志门面包 |
| logback-classic | 支持SLF4J门面接口的一个具体实现 |

#### **创建EHCache的配置文件ehcache.xml**
```xml
<?xml version="1.0" encoding="utf-8" ?>
<ehcache xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:noNamespaceSchemaLocation="../config/ehcache.xsd">
  <!-- 磁盘保存路径 -->
  <diskStore path="D:\mybatis\ehcache"/>
  <defaultCache
    maxElementsInMemory="1000"
    maxElementsOnDisk="10000000"
    eternal="false"
    overflowToDisk="true"
    timeToIdleSeconds="120"
    timeToLiveSeconds="120"
    diskExpiryThreadIntervalSeconds="120"
    memoryStoreEvictionPolicy="LRU">
  </defaultCache>
</ehcache>
```
#### 设置二级缓存的类型
`<cache type="org.mybatis.caches.ehcache.EhcacheCache"/>`
#### **加入logback日志**
存在SLF4J时，作为简易日志的log4j将失效，此时我们需要借助SLF4J的具体实现logback来打印日志。 创建logback的配置文件logback.xml。
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration debug="true">
  <!-- 指定日志输出的位置 -->
  <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <!-- 日志输出的格式 -->
      <!-- 按照顺序分别是： 时间、日志级别、线程名称、打印日志的类、日志主体内容、换行
      -->
      <pattern>[%d{HH:mm:ss.SSS}] [%-5level] [%thread] [%logger]
        [%msg]%n</pattern>
    </encoder>
  </appender>
  <!-- 设置全局日志级别。日志级别按顺序分别是： DEBUG、INFO、WARN、ERROR -->
  <!-- 指定任何一个日志级别都只打印当前级别和后面级别的日志。 -->
  <root level="DEBUG">
    <!-- 指定打印日志的appender，这里通过“STDOUT”引用了前面配置的appender -->
    <appender-ref ref="STDOUT" />
  </root>
  <!-- 根据特殊需求指定局部日志级别 -->
  <logger name="com.atguigu.crowd.mapper" level="DEBUG"/>
</configuration>
```
#### **EHCache配置文件说明**
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/mybatis/202406171618193.png)
## Mybatis的逆向工程
### 使用步骤
#### 添加依赖和插件
```xml
<dependencies>
  <dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis</artifactId>
    <version>3.5.7</version>
  </dependency>
  <!-- junit测试 -->
  <dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.12</version>
    <scope>test</scope>
  </dependency>
  <!-- log4j日志 -->
  <dependency>
    <groupId>log4j</groupId>
    <artifactId>log4j</artifactId>
    <version>1.2.17</version>
  </dependency>
  <dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.16</version>
  </dependency>
</dependencies>
<!-- 控制Maven在构建过程中相关配置 -->
<build>
  <!-- 构建过程中用到的插件 -->
  <plugins>
    <!-- 具体插件，逆向工程的操作是以构建过程中插件形式出现的 -->
    <plugin>
      <groupId>org.mybatis.generator</groupId>
      <artifactId>mybatis-generator-maven-plugin</artifactId>
      <version>1.3.0</version>
      <!-- 插件的依赖 -->
      <dependencies>
        <!-- 逆向工程的核心依赖 -->
        <dependency>
          <groupId>org.mybatis.generator</groupId>
          <artifactId>mybatis-generator-core</artifactId>
          <version>1.3.2</version>
        </dependency>
        <!-- MySQL驱动 -->
        <dependency>
          <groupId>mysql</groupId>
          <artifactId>mysql-connector-java</artifactId>
          <version>8.0.16</version>
        </dependency>
      </dependencies>
    </plugin>
  </plugins>
</build>
```
#### 创建MyBatis的核心配置文件
```properties
jdbc.driver = com.mysql.cj.jdbc.Driver
jdbc.url = jdbc:mysql://localhost:3306/mybatis?serverTimezone=UTC
jdbc.username = root
jdbc.password = root
```
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<!--
    MyBatis核心配置文件中的标签必须要按照指定的顺序配置:
    properties? ,settings ? ,typeAliases ?,typeHandlers ?,
    objectFactory ? , objectWrapperFactory ? , reflectorFactory ?,
    plugins? , environments ? ,databaseIdProvider ? ,mappers ?
-->
<configuration>
    <!-- 引入配置文件 -->
    <properties resource="jdbc.properties"/>

    <settings>
        <!-- 将数据库中的下划线映射为驼峰-->
        <setting name="mapUnderscoreToCamelCase" value="true"/>
        <!-- 开启二级缓存，默认为true -->
        <setting name="cacheEnabled" value="true"/>
    </settings>

    <typeAliases>
        <!-- 给指定包下的类起别名 -->
        <package name="com.mybatis.pojo"/>
    </typeAliases>

    <plugins>
        <!-- 配置分页插件 -->
        <plugin interceptor="com.github.pagehelper.PageInterceptor"/>
    </plugins>

    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="${jdbc.driver}"/>
                <property name="url" value="${jdbc.url}"/>
                <property name="username" value="${jdbc.username}"/>
                <property name="password" value="${jdbc.password}"/>
            </dataSource>
        </environment>
    </environments>

    <mappers>
        <!-- 引入映射文件 -->
        <package name="com.mybatis.mapper"/>
    </mappers>

</configuration>
```
#### 创建逆向工程的配置文件
```xml
<?xml version="1.0" encoding="UTF-8"?> <!DOCTYPE generatorConfiguration PUBLIC
        "-//mybatis.org//DTD MyBatis Generator Configuration 1.0//EN"
        "http://mybatis.org/dtd/mybatis-generator-config_1_0.dtd">
<generatorConfiguration>
    <!-- targetRuntime: 执行生成的逆向工程的版本
    MyBatis3Simple: 生成基本的CRUD（清新简洁版）
    MyBatis3: 生成带条件的CRUD（奢华尊享版） -->
    <context id="DB2Tables" targetRuntime="MyBatis3">
        <!-- 数据库的连接信息 -->
        <jdbcConnection driverClass="com.mysql.cj.jdbc.Driver"
                        connectionURL="jdbc:mysql://localhost:3306/mybatis?serverTimezone=UTC"
                        userId="root"
                        password="root">
        </jdbcConnection>
        <!-- javaBean的生成策略 -->
        <javaModelGenerator targetPackage="com.mybatis.pojo" targetProject=".\src\main\java">
            <!-- 是否允许使用子目录 -->
            <property name="enableSubPackages" value="true"/>
            <!-- 去掉字段前后的空格生成实体类的属性 -->
            <property name="trimStrings" value="true"/>
        </javaModelGenerator>
        <!-- SQL映射文件的生成策略 -->
        <sqlMapGenerator targetPackage="com.mybatis.mapper" targetProject=".\src\main\resources">
            <property name="enableSubPackages" value="true"/>
        </sqlMapGenerator>
        <!-- Mapper接口的生成策略 -->
        <javaClientGenerator type="XMLMAPPER" targetPackage="com.mybatis.mapper"
                             targetProject=".\src\main\java">
            <property name="enableSubPackages" value="true"/>
        </javaClientGenerator>
        <!-- 逆向分析的表 -->
        <!-- tableName设置为*号，可以对应所有表，此时不写domainObjectName -->
        <!-- domainObjectName属性指定生成出来的实体类的类名 -->
        <table tableName="t_emp" domainObjectName="Emp"/>
        <table tableName="t_dept" domainObjectName="Dept"/>
    </context>
</generatorConfiguration>
```
#### **执行MBG插件的generate目标**
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/mybatis/202406171618924.png)
#### 最终效果
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/frame/mybatis/202406171619452.png)
### QBC查询
```java
public class MGBTest {
    @Test
    public void test1() {
        SqlSession sqlSession = SqlSessionUtil.getSqlSession();
        EmpMapper mapper = sqlSession.getMapper(EmpMapper.class);
        Emp emp = mapper.selectByPrimaryKey(1);
        System.out.println("==============================");
        System.out.println("emp = " + emp);
        List<Emp> list = mapper.selectByExample(null);
        list.forEach(System.out::println);
        System.out.println("==============================");
        EmpExample empExample = new EmpExample();
        //查询员工男,19-21的
        empExample.createCriteria().andAgeBetween(19, 21).andGenderEqualTo("男");
        List<Emp> emps = mapper.selectByExample(empExample);
        emps.forEach(System.out::println);
        System.out.println("===============================");
        //查询员工女或20岁的
        EmpExample empExample1 = new EmpExample();
        empExample1.createCriteria().andAgeEqualTo(20);
        empExample1.or().andGenderEqualTo("女");
        List<Emp> emps1 = mapper.selectByExample(empExample1);
        emps1.forEach(System.out::println);
        System.out.println("===============================");
        Emp emp1 = new Emp(1, null, 30, "男");
        //此方法会将empName更改为null
        mapper.updateByPrimaryKey(emp1);
        System.out.println("===============================");
        //此方法不会更改empName的值
        Emp emp2 = new Emp(2, null, 31, "女");
        mapper.updateByPrimaryKeySelective(emp2);
    }
```
## 分页查询
### 使用步骤
#### 添加依赖
```xml
<dependency>
  <groupId>com.github.pagehelper</groupId>
  <artifactId>pagehelper</artifactId>
  <version>5.2.0</version>
</dependency>
```
#### 配置分页插件
```xml
<plugins>
  <!-- 配置分页插件 -->
  <plugin interceptor="com.github.pagehelper.PageInterceptor"/>
</plugins>
```
#### 使用

- 在查询功能之前使用PageHelper.startPage(int pageNum, int pageSize)开启分页功能
   - pageNum：当前页的页码
   - pageSize：每页显示的条数
   
- 在查询获取list集合之后，使用`PageInfo<T> pageInfo = new PageInfo<>(List<T> list, int xxx`
   - navigatePages:获取分页相关数据
   - list：分页之后的数据
   - navigatePages：导航分页的页码数
   
- 分页相关数据

   ```txt
   PageInfo{
       pageNum=8, pageSize=4, size=2, startRow=29, endRow=30, total=30, pages=8,
       list=Page{count=true, pageNum=8, pageSize=4, startRow=28, endRow=32, total=30,
       pages=8, reasonable=false, pageSizeZero=false},
       prePage=7, nextPage=0, isFirstPage=false, isLastPage=true, hasPreviousPage=true,
       hasNextPage=false, navigatePages=5, navigateFirstPage4, navigateLastPage8,
       navigatepageNums=[4, 5, 6, 7, 8]
   }
   
   pageNum：当前页的页码
   pageSize：每页显示的条数
   size：当前页显示的真实条数
   total：总记录数
   pages：总页数
   prePage：上一页的页码
   nextPage：下一页的页码
   isFirstPage/isLastPage：是否为第一页/最后一页
   hasPreviousPage/hasNextPage：是否存在上一页/下一页
   navigatePages：导航分页的页码数
   navigatepageNums：导航分页的页码，[1,2,3,4,5]
   ```

   

