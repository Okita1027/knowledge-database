---
title: MongoDB
order: 6
---

## MongoDB

[MongoDB 中文手册 v7.0](https://www.mongodb.com/zh-cn/docs/manual/)

## Spring整合

[Spring Data MongoDB 中文 ](https://docs.springframework.org.cn/spring-data/mongodb/reference/mongodb/template-config.html)

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

## 模板API

### 配置

#### 读偏好

`mongoTemplate.setReadPreference(ReadPreference.primary());`

#### 写关注

`mongoTemplate.setWriteConcern(WriteConcern.MAJORITY);`

#### WriteConcernResolver

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

#### WriteResultChecking策略

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

#### 实体生命周期事件

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

#### @Indexed

`@Indexed` 用于为文档中的单个字段创建普通索引。普通索引用于提高查询性能，尤其是针对单个字段的查询或排序。

```java
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
public class User {
    @Indexed
    private String username;

    private String email;
}
```

在上面的例子中，`username` 字段会被索引，MongoDB 在查询时会优先使用该索引，提升查询效率。

**可选参数**

- `unique`：是否是唯一索引，防止重复值。默认为 `false`。
- `direction`：指定排序方向，可以是 `IndexDirection.ASCENDING` 或 `IndexDirection.DESCENDING`。
- `sparse`：如果为 `true`，则只为非 `null` 的字段创建索引。
- `expireAfterSeconds`：设置索引过期时间，常用于 TTL（Time To Live）索引。

```java
@Indexed(unique = true, direction = IndexDirection.ASCENDING)
private String email;
```

#### @GeoSpatialIndexed

`@GeoSpatialIndexed` 用于在地理空间字段上创建地理空间索引，支持基于地理位置的查询。MongoDB 支持 `2d` 和 `2dsphere` 两种类型的地理空间索引。

```java
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;

@Document
public class Place {
    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location;
}
```

在该例中，`location` 字段会创建一个 `2dsphere` 索引，用于处理地球表面上的地理坐标。

**可选参数**

- `type`：指定索引类型，常见的值有 `GEO_2D` 和 `GEO_2DSPHERE`。
- `bits`：指定索引的精度，适用于 `GEO_2D` 类型索引。
- `min`、`max`：用于 `GEO_2D` 类型索引，指定坐标范围。

#### TextIndexed

`@TextIndexed` 用于在字符串字段上创建全文搜索索引。MongoDB 支持全文搜索功能，允许对文档中的文本字段进行复杂的全文检索。

```java
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
public class Article {
    @TextIndexed
    private String content;
    
    private String title;
}
```

`content` 字段将被索引，用于全文搜索。在查询时，可以使用 `$text` 运算符对文本字段进行全文搜索。

#### @CompoundIndex

`@CompoundIndex` 用于在多个字段上创建复合索引。复合索引允许在多个字段的组合上进行索引，通常用于优化多个字段的查询条件。

```java
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
@CompoundIndex(def = "{'firstName': 1, 'lastName': -1}", name = "name_index")
public class Person {
    private String firstName;
    private String lastName;
}
```

这个例子中，`firstName` 和 `lastName` 字段上创建了一个复合索引。`firstName` 以升序排序，`lastName` 以降序排序。

**可选参数**`def`：索引定义，使用 JSON 字符串来表示字段和排序方向。

- `name`：索引名称。
- `unique`：是否为唯一索引。
- `sparse`：是否为稀疏索引。

#### @WildcardIndexed

`@WildcardIndexed` 是 MongoDB 4.2 引入的功能，允许对文档中的任意字段或嵌套字段创建索引。`@WildcardIndexed` 用于创建通配符索引，适用于动态数据结构或包含未知字段的文档。

```java
import org.springframework.data.mongodb.core.index.WildcardIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
public class DynamicData {
    @WildcardIndexed
    private Map<String, Object> attributes;
}
```

在这个例子中，`attributes` 字段是一个动态字段集合，`@WildcardIndexed` 会为所有的子字段创建索引。

**可选参数**

- `name`：索引的名称。
- `wildcardProjection`：用于指定哪些字段应包含在索引中或排除。

### 保存、更新、删除



### 查询



### 统计



### 聚合



## GridFs



## 对象映射

**注解概述**

MappingMongoConverter 可以使用元数据来驱动对象到文档的映射。可以使用以下注释

- `@Id`：应用于字段级别，以标记用于身份目的的字段。
- `@MongoId`：应用于字段级别，以标记用于身份目的的字段。接受一个可选的 `FieldType` 来定制 id 转换。
- `@Document`：应用于类级别，以指示此类是映射到数据库的候选类。您可以指定将存储数据的集合的名称。
- `@DBRef`：应用于字段，以指示使用 com.mongodb.DBRef 存储该字段。
- `@DocumentReference`：应用于字段，以指示将该字段存储为指向另一个文档的指针。这可以是单个值（默认情况下为 *id*），或通过转换器提供的 `Document`。
- `@Indexed`：应用于字段级别，以描述如何对字段建立索引。
- `@CompoundIndex`（可重复）：应用于类型级别，以声明复合索引。
- `@GeoSpatialIndexed`：应用于字段级别，以描述如何对字段进行地理索引。
- `@TextIndexed`：应用于字段级别，以标记要包含在文本索引中的字段。
- `@HashIndexed`：应用于字段级别，以便在哈希索引中使用，以在分片集群中对数据进行分区。
- `@Language`：应用于字段级别，以设置文本索引的语言覆盖属性。
- `@Transient`：默认情况下，所有字段都映射到文档。此注释将应用它的字段排除在存储在数据库中。瞬态属性不能在持久性构造函数中使用，因为转换器无法为构造函数参数实现值。
- `@PersistenceConstructor`：标记给定的构造函数（甚至是包保护的构造函数），以便在从数据库实例化对象时使用。构造函数参数按名称映射到检索到的 Document 中的键值。
- `@Value`：此注释是 Spring Framework 的一部分。在映射框架中，它可以应用于构造函数参数。这使您可以使用 Spring 表达式语言语句来转换在数据库中检索到的键值，然后再将其用于构造域对象。为了引用给定文档的属性，必须使用诸如：`@Value("#root.myProperty")` 的表达式，其中 `root` 指示给定文档的根。
- `@Field`：应用于字段级别，它允许描述字段的名称和类型，因为该字段将表示在 MongoDB BSON 文档中，从而允许名称和类型不同于类的字段名以及属性类型。
- `@Version`：应用于字段级别，用于乐观锁定并在保存操作中检查修改。初始值为 `zero`（对于基本类型为 `one`），它将在每次更新时自动增加。

### 属性转换器

属性转换器允许在 Java 对象和 MongoDB 存储格式之间进行特定字段的转换。

**使用场景**

自定义类型转换：当 MongoDB 中存储的数据类型与 Java 对象属性的数据类型不匹配时，可以使用属性转换器进行转换。

特殊数据格式：当你需要将某种复杂的数据类型（如 `Enum`、`LocalDateTime`、嵌套对象等）转换为适合 MongoDB 存储的简单类型（如 `String`、`Number`）时。

数据加密和解密：可以通过转换器对敏感字段进行加密和解密操作。

**如何使用**

属性转换器通常通过实现 `org.springframework.core.convert.converter.Converter` 接口，并配合 `@ReadingConverter` 和 `@WritingConverter` 注解来定义。

示例：将枚举类型存储为字符串

1. 定义属性转换器

假设你有一个枚举类型 `Status`，而你希望在 MongoDB 中将其存储为字符串，而不是整数或默认的枚举序号。可以通过自定义转换器来实现：

```java
public enum Status {
    ACTIVE,
    INACTIVE,
    PENDING
}
```

**写入转换器**：用于将 `Status` 枚举转换为字符串。

```java
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.WritingConverter;

@WritingConverter
public class StatusToStringConverter implements Converter<Status, String> {
    @Override
    public String convert(Status status) {
        return status.name();  // 将枚举转换为其名称表示
    }
}
```

**读取转换器**：用于将存储在 MongoDB 中的字符串转换回 `Status` 枚举。

```java
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;

@ReadingConverter
public class StringToStatusConverter implements Converter<String, Status> {
    @Override
    public Status convert(String source) {
        return Status.valueOf(source);  // 将字符串转换为枚举
    }
}

```

2. 注册转换器

为了让 Spring Data MongoDB 能够在读写时应用这些转换器，需要将它们注册到 `MongoCustomConversions` 中：

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.util.Arrays;

@Configuration
public class MongoConfig {

    @Bean
    public MongoCustomConversions customConversions() {
        return new MongoCustomConversions(Arrays.asList(
                new StatusToStringConverter(),  // 写入转换器
                new StringToStatusConverter()   // 读取转换器
        ));
    }
}
```

3. 使用转换器

注册完成后，当你在 MongoDB 中存储 `Status` 枚举类型的字段时，Spring Data MongoDB 将自动应用这些转换器。对于读取和写入，MongoDB 将使用这些自定义逻辑进行转换：

- 写入时，`Status` 枚举会被转换为字符串并存储在 MongoDB 中。
- 读取时，存储的字符串将被转换回 `Status` 枚举。

### 解包类型

#### `@Unwrapped`

通常，当你在 MongoDB 中存储一个 Java 对象时，如果该对象包含另一个嵌套对象，Spring Data 会将这个嵌套对象作为一个独立的字段存储在父文档中。使用 `@Unwrapped` 注解后，嵌套对象的字段将直接“展开”到父文档中，而不是作为嵌套的结构。

默认行为

假设你有以下嵌套对象：

```java
public class Address {
    private String street;
    private String city;
    private String zipCode;

    // Constructors, getters, setters
}
```

和一个包含 `Address` 的 `User` 对象：

```java
import org.springframework.data.mongodb.core.mapping.Document;

@Document
public class User {
    private String name;
    private Address address;

    // Constructors, getters, setters
}
```

当你存储一个 `User` 对象到 MongoDB 时，默认情况下它会被存储为以下 JSON 结构：

```json
{
  "name": "John Doe",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  }
}
```

这里 `address` 是一个嵌套的对象。

现在，如果你希望 `Address` 对象中的属性直接存储在 `User` 文档的顶层，而不是嵌套为一个 `address` 对象，可以使用 `@Unwrapped` 注解。

```java
import org.springframework.data.mongodb.core.mapping.Unwrapped;

@Document
public class User {
    private String name;

    @Unwrapped.Nullable
    private Address address;

    // Constructors, getters, setters
}
```

在这个例子中，`@Unwrapped.Nullable` 表示 `address` 字段可以为空，并且其属性会直接展开到 `User` 文档的顶层。现在，当你存储一个 `User` 对象到 MongoDB 时，它会被存储为以下结构：

```json
{
  "name": "John Doe",
  "street": "123 Main St",
  "city": "New York",
  "zipCode": "10001"
}
```

如你所见，`Address` 对象的属性 `street`、`city` 和 `zipCode` 直接成为了 `User` 文档的顶层字段，而不再是嵌套对象

**`@Unwrapped` 属性**

- `@Unwrapped.Nullable`：当嵌套对象可能为 `null` 时，使用此注解。如果嵌套对象为空，它不会存储到数据库中。
- `@Unwrapped.OnEmpty`：定义如果嵌套对象为空时的处理方式。可以选择 `USE_NULL` 或 `SKIP`，即空值时要么存储 `null` 值，要么跳过不存储。

#### 解包类型的索引

可以将`@Indexed`注解附加到解包类型的属性，就像对普通对象一样。不能将`@Indexed`注解与拥有属性上的`@Unwrapped`注解一起使用

```java
public class User {

	@Id
    private String userId;

    @Unwrapped(onEmpty = USE_NULL)
    UserName name;                    

    // Invalid -> InvalidDataAccessApiUsageException
    @Indexed                          
    @Unwrapped(onEmpty = USE_Empty)
    Address address;
}

public class UserName {

    private String firstname;

    @Indexed
    private String lastname;           
}
```

为`users`集合中的`lastname`创建索引。`@Indexed`与`@Unwrapped`一起使用时的无效用法

### 对象引用

当A对象包含另外B对象时，可以在A对象中存储B对象的引用而不是它的所有数据。

> [!IMPORTANT]
>
> 映射框架不处理级联保存！当需要修改A对象包含的B对象时，必须同时手动修改B对象的值。

#### @DBRefs

假设你有两个类 `User` 和 `Address`，并且 `User` 中包含 `Address` 的引用：

```java
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
public class Address {
    @Id
    private String id;
    private String street;
    private String city;

    // Getters, Setters
}

@Document
public class User {
    @Id
    private String id;
    private String name;

    @DBRef
    private Address address;

    // Getters, Setters
}
```

当你存储 `User` 对象时，MongoDB 并不会将 `Address` 文档嵌入 `User` 文档中，而是存储如下结构：

```java
{
  "_id": "user123",
  "name": "John Doe",
  "address": { "$ref": "address", "$id": "address123" }
}
```

这种结构中的 `address` 字段是一个 **DBRef** 对象，指向 `address` 集合中的某个文档。读取 `User` 文档时，Spring Data MongoDB 会根据该引用去查询 `Address` 集合来获取完整的 `Address` 文档。

**注意事项**

**性能影响**：每次访问带有 `@DBRef` 的字段时，都会触发额外的查询操作，这可能影响性能，尤其是在处理大批量数据时。

**跨集合引用**：`@DBRef` 允许跨集合引用，但是 MongoDB 不支持跨数据库的引用。

**事务支持**：如果使用 MongoDB 事务，`@DBRef` 的引用操作可能导致复杂的事务管理。

#### @DocumentReference

`@DocumentReference` 是 Spring Data MongoDB 版本 3.4 中引入的一个新注解，用于替代 `@DBRef`，提供了更多的灵活性。`@DocumentReference` 允许开发者控制是否使用手动维护的引用（如直接存储 `_id`），或类似 `@DBRef` 的引用文档。

**工作原理**

与 `@DBRef` 不同，`@DocumentReference` 提供了两种不同的存储方式：

1. **引用存储**：与 `@DBRef` 类似，引用另一个文档的 `_id`，并通过额外查询来获取引用的文档。
2. **手动引用**：手动存储被引用文档的 `_id`，避免使用 `DBRef` 特有的格式，性能更加可控。

---

`lookup`属性

`@DocumentReference` 提供了 `lookup` 属性来控制如何查找引用的文档。以下是常见的用法：

- **手动引用**：存储的是被引用文档的 `_id`，你需要自己编写查询来获取被引用的文档。

```java
@DocumentReference(lookup = "{ '_id' : ?#{#target} }")
private Address address;
```

- **自动引用**: 类似于 `@DBRef`，Spring 会自动查询引用的文档。

```java
@DocumentReference(lookup = "{ 'addressId' : ?#{#target} }")
private Address address;
```

---

**优势**

- **更灵活**：`@DocumentReference` 提供了更多控制，可以根据需求选择存储方式（手动或自动）。
- **性能更好**：与 `@DBRef` 相比，手动管理引用 `_id` 可能避免额外的查询开销，提升性能。
- **事务友好**：由于手动管理引用是基于简单的 `_id` 字段，适合与 MongoDB 的事务机制搭配使用。

### 索引创建




## 审计

审计功能允许你自动记录实体的创建和修改信息，比如创建时间、最后修改时间、创建人、修改人等。通过使用 `@EnableMongoAuditing` 注解，Spring 会自动为 MongoDB 实体启用审计功能。

Spring 提供了几个常用的注解，用于标识实体中的审计字段：

- **`@CreatedDate`**：标记创建时间字段。
- **`@LastModifiedDate`**：标记最后修改时间字段。
- **`@CreatedBy`**：标记创建者字段。
- **`@LastModifiedBy`**：标记最后修改者字段。

**实现步骤**

1. 在配置类上添加 `@EnableMongoAuditing` 注解来启用审计功能

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@Configuration
@EnableMongoAuditing
public class MongoConfig {
}
```

2. 在你的实体类中，使用相关的审计注解来标记需要自动维护的字段

```java
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document
public class MyEntity {

    @CreatedDate
    private LocalDateTime createdDate;

    @LastModifiedDate
    private LocalDateTime lastModifiedDate;

    @CreatedBy
    private String createdBy;

    @LastModifiedBy
    private String lastModifiedBy;

    // Getters and setters
}
```

- `@CreatedDate`：当实体第一次持久化时，会自动设置 `createdDate` 字段。
- `@LastModifiedDate`：每次实体被更新时，会自动更新 `lastModifiedDate` 字段。
- `@CreatedBy`和`@LastModifiedBy`：分别记录创建者和最后修改者的信息。

3.  配置 `AuditorAware`（可选，针对`@CreatedBy`和`@LastModifiedBy`）

如果你希望在审计中记录创建者和修改者的信息，Spring 需要通过 `AuditorAware` 接口来提供当前用户或系统信息

```java
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class AuditorAwareImpl implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        // 这里可以返回当前的用户信息，例如从 Spring Security 中获取当前用户
        return Optional.of("admin"); // 这里用 "admin" 作为示例
    }
}
```

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;

@Configuration
public class MongoAuditingConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        return new AuditorAwareImpl();
    }
}
```

4. 数据库结果

当你向数据库中插入或更新实体时，Spring 会自动为你记录审计信息。例如，插入一条新记录后，MongoDB 文档可能如下所示：

```java
{
  "_id": "some-id",
  "createdDate": "2024-09-12T10:15:30",
  "lastModifiedDate": "2024-09-12T10:15:30",
  "createdBy": "admin",
  "lastModifiedBy": "admin",
  ...
}
```

## 会话和事务

### 会话

会话是一种用于跟踪一系列操作的上下文。会话提供了一致的读写操作的隔离性和事务处理能力。

**主要作用**

- 事务支持：在启用会话时，MongoDB 可以在多个操作之间保持事务的一致性。
- 持久连接：会话可以跟踪跨多个操作的上下文，支持多个命令共享同一个会话，从而实现跨多个集合和数据库的事务。
- 读偏好和一致性控制：会话可以指定特定的读偏好，从而确保不同节点之间的数据一致性和响应时间控制。

**使用示例**

```java
MongoClient mongoClient = MongoClients.create("mongodb://localhost:27017");
ClientSession session = mongoClient.startSession();

try {
    // 开启会话后进行某些操作
    MongoDatabase database = mongoClient.getDatabase("test");
    MongoCollection<Document> collection = database.getCollection("myCollection");

    session.startTransaction();
    
    collection.insertOne(session, new Document("name", "Alice"));
    collection.insertOne(session, new Document("name", "Bob"));

    session.commitTransaction();
} catch (Exception e) {
    session.abortTransaction();
} finally {
    session.close();
}
```

### 事务

在 Spring Data MongoDB 中，启用事务非常简单。你可以使用 `@Transactional` 注解来声明事务性操作：

```java
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.mongodb.core.MongoTemplate;

@Service
public class MyService {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Transactional
    public void doInTransaction() {
        mongoTemplate.insert(new MyEntity("Alice"));
        mongoTemplate.insert(new MyEntity("Bob"));
    }
}
```

> `@Transactional` 注解确保 `doInTransaction()` 方法中的所有操作作为一个事务执行。如果出现异常，事务会自动回滚。

**事务管理器**

为了在 Spring 中使用事务，你需要配置一个事务管理器：

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoTransactionManager;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
public class MongoConfig {

    @Bean
    public MongoTransactionManager transactionManager(MongoTemplate mongoTemplate) {
        return new MongoTransactionManager(mongoTemplate.getDatabaseFactory());
    }
}
```

**会话与事务的关系**

- **会话** 是事务的基础。在 MongoDB 中，事务必须运行在会话上下文中，因此每个事务都是会话的一部分。
- **事务** 提供了跨多个数据库操作的原子性和一致性，而会话则提供了事务操作的上下文管理。

**控制特定的事务选项**

在 Spring Data MongoDB 中，虽然 `@Transactional` 可以简化事务管理，但在需要更多自定义控制事务行为的场景中，可以使用 `TransactionOptions` 和 `MongoTemplate` 配合自定义事务逻辑。

```java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import com.mongodb.client.ClientSession;
import com.mongodb.client.MongoClient;
import com.mongodb.client.model.TransactionOptions;
import com.mongodb.client.model.ReadConcern;
import com.mongodb.client.model.WriteConcern;
import java.util.concurrent.TimeUnit;

@Service
public class MyService {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private MongoClient mongoClient;

    public void doInCustomTransaction() {
        TransactionOptions txnOptions = TransactionOptions.builder()
            .readConcern(ReadConcern.SNAPSHOT)      // 读取快照
            .writeConcern(WriteConcern.MAJORITY)    // 写入到大多数节点
            .maxCommitTime(30L, TimeUnit.SECONDS)   // 最大提交时间为30秒
            .build();

        ClientSession session = mongoClient.startSession();

        try {
            session.startTransaction(txnOptions);

            // 使用 MongoTemplate 在事务中进行操作
            mongoTemplate.insert(new MyEntity("Alice"));
            mongoTemplate.insert(new MyEntity("Bob"));

            session.commitTransaction();
        } catch (Exception e) {
            session.abortTransaction();
        } finally {
            session.close();
        }
    }
}
```

## 变更流

> [!note]
>
> 变更流支持仅适用于副本集或分片集群。



## 可追踪游标

默认情况下，当客户端用尽光标提供的所有结果时，MongoDB 会自动关闭光标。用尽时关闭光标会将流变成有限流。对于 [capped 集合](https://docs.mongodb.com/manual/core/capped-collections/)，你可以使用在客户端使用所有最初返回的数据后仍然保持打开状态的 [可跟踪光标](https://docs.mongodb.com/manual/core/tailable-cursors/)。

```java
@SpringBootTest
public class CursorTest {
    @Autowired
    private MongoClient mongoClient;
    @Test
    void test1() {
        MongoDatabase db = mongoClient.getDatabase("learn");
        MongoCursor<Document> cursor = db.getCollection("cappedColl")
                .find()
                .cursorType(CursorType.Tailable)
                .iterator();

        while (cursor.hasNext()) {
            Document doc = cursor.next();
            System.out.println(doc.toJson());
        }

    }
}
```

## 分片

`@Sharded` 注解来标识存储在分片集合中的实体

```java
@Document("users")
@Sharded(shardKey = { "country", "userId" })
public class User {

	@Id
	Long id;

	@Field("userid")
	String userId;

	String country;
}
```

- 分片键的属性映射到实际的字段名称。

----

**分片集合**

Spring Data MongoDB 不会自动为集合设置分片，也不会为其设置所需的索引。以下代码片段展示了如何使用 MongoDB 客户端 API 来实现这一点。

```java
MongoDatabase adminDB = template.getMongoDbFactory()
    .getMongoDatabase("admin");

adminDB.runCommand(new Document("enableSharding", "db"));

Document shardCmd = new Document("shardCollection", "db.users")
	.append("key", new Document("country", 1).append("userid", 1));

adminDB.runCommand(shardCmd);
```

- 分片命令需要针对 `admin` 数据库运行。
- 如果需要，请为特定数据库启用分片。
- 对已启用分片的数据库中的集合进行分片。
- 指定分片键。此示例使用基于范围的分片。

---

**分片键处理**

分片键由一个或多个属性组成，这些属性必须存在于目标集合中的每个文档中。它用于将文档分布到各个分片中。

在实体上添加 `@Sharded` 注解，使 Spring Data MongoDB 能够应用分片场景所需的最佳努力优化。这意味着在更新实体时，如果不存在，则会将所需的 shard 键信息添加到 `replaceOne` 过滤器查询中。这可能需要额外的服务器往返才能确定当前 shard 键的实际值。

> [!tip]
>
> 通过设置 `@Sharded(immutableKey = true)`，Spring Data 不会尝试检查实体 shard 键是否已更改。
