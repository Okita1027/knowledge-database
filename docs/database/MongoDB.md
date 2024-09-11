---
title: MongoDB
order: 6
---

## MongoDB

[MongoDB 中文手册 v7.0](https://www.mongodb.com/zh-cn/docs/manual/)

## SpringDataMongoDB

[Spring Data MongoDB 中文 ](https://docs.springframework.org.cn/spring-data/mongodb/reference/mongodb/template-config.html)

### 快速上手

1. 引入依赖

   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-data-mongodb</artifactId>
   </dependency>
   ```

2. 配置MongoDB连接参数

   - 方式1——YAML

     ```yaml
     spring:
       data:
         mongodb:
           host: localhost
           port: 27017
           database: learn
           
           # 等同于上面三句
     	  # uri: mongodb://localhost:27017/learn
     ```

   - 方式2——配置类

     ```java
     @Configuration
     public class MongoConfig {
         
         @Bean
         public MongoClient mongoClient() {
             // 创建一个MongoClient实例
             return MongoClients.create("mongodb://localhost:27017");
         }
         
         @Bean
         MongoTemplate mongoTemplate(MongoClient mongoClient) {
             MongoTemplate mongoTemplate = new MongoTemplate(mongoClient, "learn");
             return mongoTemplate;
         }
     }
     ```

3. 实体类

   ```java
   @NoArgsConstructor
   @AllArgsConstructor
   @ToString
   @Getter
   @Setter
   @Document("users")  // 在实体类中添加 @Document 注解，指定集合名称，在UserService中就不用再次指定操作的集合了
   public class User {
       private String id;
       private String name;
       private int age;
   
       public User(String name, int age) {
           this.name = name;
           this.age = age;
       }
       
   }
   ```

4. 业务类

   ```java
   @Service
   public class UserService {
       
   //    private final String collName = "users";
       
       @Autowired
       private MongoTemplate mongoTemplate;
   
       public User getUserByName(String name) {
           Query query = new Query();
           query.addCriteria(Criteria.where("name").is(name));
   //        return mongoTemplate.findOne(query, User.class, collName);
           return mongoTemplate.findOne(query, User.class);
       }
   }
   ```

5. 测试类

   ```java
   @SpringBootTest
   class TemplateApiApplicationTests {
       @Test
       void queryTest() {
           User queen = userService.getUserByName("Queen");
           System.out.print(queen);
       }
   }
   ```

### 配置

### 读偏好

`mongoTemplate.setReadPreference(ReadPreference.primary());`

### 写关注

`mongoTemplate.setWriteConcern(WriteConcern.MAJORITY);`

### WriteConcernResolver

如果您希望在每个操作的基础上设置不同的 `WriteConcern` 值（对于删除、更新、插入和保存操作），可以在 `MongoTemplate` 上配置一个名为 `WriteConcernResolver` 的策略接口。由于 `MongoTemplate` 用于持久化 POJO，因此 `WriteConcernResolver` 允许您创建一个策略，该策略可以将特定 POJO 类映射到 `WriteConcern` 值。

可以使用 `MongoAction` 参数来确定 `WriteConcern` 值，或者使用模板本身的值作为默认值。`MongoAction` 包含要写入的集合名称、POJO 的 `java.lang.Class`、转换后的 `Document`、操作（`REMOVE`、`UPDATE`、`INSERT`、`INSERT_LIST` 或 `SAVE`）以及其他一些上下文信息。以下示例显示了两组类获得不同的 `WriteConcern` 设置

```java
@Component
public class CustomWriteConcernResolver implements WriteConcernResolver {

    @Override
    public WriteConcern resolve(MongoAction action) {
        String collectionName = action.getCollectionName();

        // 为特定集合应用不同的 WriteConcern
        if ("importantCollection".equals(collectionName)) {
            return WriteConcern.MAJORITY;
        } else if ("loggingCollection".equals(collectionName)) {
            return WriteConcern.UNACKNOWLEDGED;
        } else {
            return WriteConcern.W1;  // 默认使用 W1 级别
        }
    }
}
```

```java
@Configuration
public class MongoConfig {

    @Bean
    public MongoTemplate mongoTemplate(MongoClient mongoClient, WriteConcernResolver writeConcernResolver) {
        MongoTemplate mongoTemplate = new MongoTemplate(mongoClient, "yourDatabaseName");
        mongoTemplate.setWriteConcernResolver(writeConcernResolver);  // 注入自定义的 WriteConcernResolver
        return mongoTemplate;
    }
}
```

### WriteResultChecking策略

`WriteResultChecking` 是一个用于控制写操作结果检查策略的枚举。它决定了在执行写操作（如 `insert`、`update`、`delete`）时，Spring Data MongoDB 是否以及如何检查操作的结果。

**策略类型：**

1. **`EXCEPTION`**:
   - 如果写操作未成功（例如，未修改任何文档，或者操作失败），Spring Data MongoDB 将抛出异常。
   - 这是最严格的策略，适合需要对每个写操作进行严格验证的场景。
2. **`LOG`**:
   - 如果写操作未成功，Spring Data MongoDB 会记录一个警告日志，但不会抛出异常。
   - 这种策略适合希望记录可能的问题，但不希望写操作失败时中断程序执行的场景。
3. **`NONE`**:
   - 不进行任何检查。无论写操作的结果如何，Spring Data MongoDB 都不会采取任何行动。
   - 这种策略适合对写操作结果不关心的场景，或者希望自行处理写操作结果的情况。

**使用场景：**

- **`EXCEPTION`**：适用于需要对数据写入严格把关的系统，确保每次写入都成功。
- **`LOG`**：适用于需要记录写操作异常但不希望中断程序的场景，如监控系统。
- **`NONE`**：适用于对写操作结果不敏感的场景，或者需要自行管理写操作结果检查的情况。

**配置方式：**

` mongoTemplate.setWriteResultChecking(WriteResultChecking.EXCEPTION);`

### 实体生命周期事件

启用生命周期回调函数：`mongoTemplate.setEntityLifecycleEventsEnabled(true);`

生命周期4阶段：

- `BeforeConvertCallback`——Java对象转换为Document文档之前，用于调整或修饰实体中的某些字段，例如确保某个字段始终为小写形式
- `BeforeSaveCallback`——Document保存到MongoDB之前，用于在保存到数据库前对文档进行更高层次的修改，例如向文档中添加时间戳或其他元数据
- `AfterSaveCallback`——Document保存到MongoDB之后
- `AfterConvertCallback`——Document文档转换为Java对象之后

```java
@Configuration
public class MongoConfig {

    /**
     * 定义Java对象转换为Document文档之前的回调逻辑
     */
    @Bean
    public BeforeConvertCallback<User> beforeConvertCallback() {
        return (entity, collection) -> {
            if (entity.getAge() == 14) {
                entity.setAge(15);
            }
            System.out.println("Entity " + entity + " will be converted to document!!!");
            return entity;
        };
    }

    /**
     * 定义Document保存到MongoDB之前的回调逻辑
     */
    @Bean
    public BeforeSaveCallback<User> beforeSaveCallback() {
        return (entity, document, collection) -> {
            if (entity.getAge() == 15) {
                entity.setAge(16);
            }
            System.out.println("Entity " + entity + " will be saved!!!");
            return entity;
        };
    }

    /**
     * 定义Document保存到MongoDB之后的回调逻辑
     */
    @Bean
    public AfterSaveCallback<User> afterSaveCallback() {
        return (entity, document, collection) -> {
            System.out.println("Entity " + entity + " has been saved!!!");
            return entity;
        };
    }

    /**
     * 定义Document文档转换为Java对象之后的回调逻辑
     */
    @Bean
    public AfterConvertCallback<User> afterConvertCallback() {
        return (entity, document, collection) -> {
            // 定义在转换之后的回调逻辑
            System.out.println("Document " + document + " has been converted to entity " + entity);
            return entity;
        };
    }
}
```

### 索引和集合管理



### 保存、更新、删除



### 查询



### 统计



### 聚合

