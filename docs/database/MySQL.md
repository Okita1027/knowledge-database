---
title: MySQL
order: 4
---
## 查询语句
### Union
**合并查询结果**利用UNION关键字，可以给出多条SELECT语句，并将它们的结果组合成单个结果集。合并 时，两个表对应的列数和数据类型必须相同，并且相互对应。各个SELECT语句之间使用UNION或UNION ALL关键字分隔。 
语法格式：
```sql
SELECT column,... FROM table1
UNION [ALL]
SELECT column,... FROM table2
```

- Union

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/select01.png)
UNION 操作符返回两个查询的结果集的并集，去除重复记录。

- Union All

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/select02.png)
UNION ALL操作符返回两个查询的结果集的并集。对于两个结果集的重复部分，不去重。

> 注意：执行UNION ALL语句时所需要的资源比UNION语句少。如果明确知道合并数据后的结果数据不存在重复数据，或者不需要去除重复的数据，则尽量使用UNION ALL语句，以提高数据查询的效率。

### 7种外连接
#### 概览
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/select03.png)
#### 实现
```sql
#中图：内连接 A∩B
SELECT employee_id,last_name,department_name
FROM employees e JOIN departments d
ON e.`department_id` = d.`department_id`;
#左上图：左外连接
SELECT employee_id,last_name,department_name
FROM employees e LEFT JOIN departments d
ON e.`department_id` = d.`department_id`;
#右上图：右外连接
SELECT employee_id,last_name,department_name
FROM employees e RIGHT JOIN departments d
ON e.`department_id` = d.`department_id`;
#左中图：A - A∩B
SELECT employee_id,last_name,department_name
FROM employees e LEFT JOIN departments d
ON e.`department_id` = d.`department_id`
WHERE d.`department_id` IS NULL
#右中图：B-A∩B
SELECT employee_id,last_name,department_name
FROM employees e RIGHT JOIN departments d
ON e.`department_id` = d.`department_id`
WHERE e.`department_id` IS NULL
#左下图：满外连接
#左中图 + 右上图 A∪B
SELECT employee_id,last_name,department_name
FROM employees e LEFT JOIN departments d
ON e.`department_id` = d.`department_id`
WHERE d.`department_id` IS NULL
UNION ALL #没有去重操作，效率高
SELECT employee_id,last_name,department_name
FROM employees e RIGHT JOIN departments d
ON e.`department_id` = d.`department_id`;
#右下图
#左中图 + 右中图 A ∪B- A∩B 或者 (A - A∩B) ∪ （B - A∩B）
SELECT employee_id,last_name,department_name
FROM employees e LEFT JOIN departments d
ON e.`department_id` = d.`department_id`
WHERE d.`department_id` IS NULL
UNION ALL
SELECT employee_id,last_name,department_name
FROM employees e RIGHT JOIN departments d
ON e.`department_id` = d.`department_id`
WHERE e.`department_id` IS NULL
```
#### 小结

- 左中图
```sql
#实现A - A∩B
select 字段列表
from A表 left join B表
on 关联条件
where 从表关联字段 is null and 等其他子句;
```

- 右中图
```sql
#实现B - A∩B
select 字段列表
from A表 right join B表
on 关联条件
where 从表关联字段 is null and 等其他子句;
```

- 左下图
```sql
#实现查询结果是A∪B
#用左外的A，union 右外的B
select 字段列表
from A表 left join B表
on 关联条件
where 等其他子句
union
select 字段列表
from A表 right join B表
on 关联条件
where 等其他子句;
```

- 右下图
```sql
#实现A∪B - A∩B 或 (A - A∩B) ∪ （B - A∩B）
#使用左外的 (A - A∩B) union 右外的（B - A∩B）
select 字段列表
from A表 left join B表
on 关联条件
where 从表关联字段 is null and 等其他子句
union
select 字段列表
from A表 right join B表
on 关联条件
where 从表关联字段 is null and 等其他子句
```
## SQL99新特性
### 自然连接
SQL99 在 SQL92 的基础上提供了一些特殊语法，比如 NATURAL JOIN 用来表示自然连接。我们可以把自然连接理解为 SQL92 中的等值连接。它会帮你自动查询两张连接表中 所有相同的字段 ，然后进行 等值连接 。 
在SQL92标准中：
```sql
SELECT employee_id,last_name,department_name
FROM employees e JOIN departments d
ON e.`department_id` = d.`department_id`
AND e.`manager_id` = d.`manager_id`;
```
在SQL99标准中：
```sql
SELECT employee_id,last_name,department_name
FROM employees e NATURAL JOIN departments d;
```
### USING连接
当我们进行连接的时候，SQL99还支持使用 USING 指定数据表里的 同名字段 进行等值连接。但是只能配 
合JOIN一起使用。比如： 
```sql
SELECT employee_id,last_name,department_name
FROM employees e JOIN departments d
USING (department_id);
```
你能看出与自然连接 NATURAL JOIN 不同的是，USING 指定了具体的相同的字段名称，你需要在 USING 的括号 () 中填入要指定的同名字段。同时使用 JOIN...USING 可以简化 JOIN ON 的等值连接。它与下面的 SQL 查询结果是相同的：
```sql
SELECT employee_id,last_name,department_name
FROM employees e ,departments d
WHERE e.department_id = d.department_id;
```
## 事务
### 事务四大特性

- 原子性（Atomicity）：事务是不可分割的最小操作单元，要么全部成功，要么全部失败。
- 一致性（Consistency）：事务完成时，必须使所有的数据都保持一致状态。
- 隔离性（Isolation）：数据库系统提供的隔离机制，保证事务在不受外部并发操作影响的独立环境下运行。
- 持久性（Durability）：事务一旦提交或回滚，它对数据库中的数据的改变就是永久的。

上述就是事务的四大特性，简称**ACID**。
### 并发事务问题

- **脏读**：一个事务读到另外一个事务还没有提交的数据。

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/transaction01.png)
例如：B读取到了A未提交的数据。

- **不可重复读**：一个事务先后读取同一条记录，但两次读取的数据不同，称之为不可重复读。

![img02.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/transaction02.png)
事务A两次读取同一条记录，但是读取到的数据却是不一样的。

- **幻读**：一个事务按照条件查询数据时，没有对应的数据行，但是在插入数据时，又发现这行数据已经存在，好像出现了 "幻影"。

![img03.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/transaction03.png)
事务A查询数据不存在，事务B插入数据并提交，事务A尝试插入数据缺无法插入，查询数据又查不到。

### 事务隔离级别
![img04.png](https://cdn.nlark.com/yuque/0/2023/png/32600948/1682235225953-570663f9-7250-42d3-933e-22c120b7d624.png#averageHue=%23fcfbfb&clientId=u7ed4b1c6-c50c-4&from=paste&height=310&id=ufbf0e72c&originHeight=310&originWidth=882&originalType=binary&ratio=1&rotation=0&showTitle=false&size=27678&status=done&style=none&taskId=u086fb9d7-9061-4ff4-8a25-792851eef65&title=&width=882)

- 查看事务隔离级别

`SELECT @@TRANSACTION_ISOLATION;`

- 设置事务隔离级别

`SET [ SESSION | GLOBAL ] TRANSACTION ISOLATION LEVEL { READ UNCOMMITTED | READ COMMITTED | REPEATABLE READ | SERIALIZABLE }`

- **注意**：事务隔离级别越高，数据越安全，但是性能越低
## 存储引擎
### 通用命令

- 获取创建表的信息

信息的最后会写出使用的是哪种存储引擎
`SHOW CREATE TABLE employees;`

- 查询当前数据库支持的存储引擎

`SHOW ENGINES;`

- 创建表时指定存储引擎

`CREATE TABLE 表名(...)ENGINE = xxx;`
### InnoDB

-  介绍 
   - InnoDB是一种兼顾高可靠性和高性能的通用存储引擎，在 MySQL 5.5 之后，InnoDB是默认的MySQL 存储引擎。
-  特点 
   - DML操作遵循ACID模型，支持事务；
   - 行级锁，提高并发访问性能；
   - 支持外键FOREIGN KEY约束，保证数据的完整性和正确性；
-  文件 
   -  xxx.ibd：xxx代表的是表名，innoDB引擎的每张表都会对应这样一个表空间文件，存储该表的表结构（frm-早期的 、sdi-新版的）、数据和索引。 
   - `show variables like 'innodb_file_per_table';`
   若Value为ON，则可在MySQL 的Data文件夹下找到 表名.idb的文件
      - `ibd2sdi xxx.idb`
   在CMD下运行该指令（由MySQL提供）可查询该表的信息 
-  逻辑存储结构 

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/engine01.png)

-  表空间 : InnoDB存储引擎逻辑结构的最高层，ibd文件其实就是表空间文件，在表空间中可以包含多个Segment段。 
-  段 : 表空间是由各个段组成的， 常见的段有数据段、索引段、回滚段等。InnoDB中对于段的管理，都是引擎自身完成，不需要人为对其控制，一个段中包含多个区。 
-  区 : 区是表空间的单元结构，每个区的大小为1M。 默认情况下， InnoDB存储引擎页大小为16K， 即一个区中一共有64个连续的页。 
-  页 : 页是组成区的最小单元，**页也是InnoDB 存储引擎磁盘管理的最小单元**，每个页的大小默认为 16KB。为了保证页的连续性，InnoDB 存储引擎每次从磁盘申请 4-5 个区。 
-  行 : InnoDB 存储引擎是面向行的，也就是说数据是按行进行存放的，在每一行中除了定义表时所指定的字段以外，还包含两个隐藏字段(后面会详细介绍)。 
   - Trx_id：每次对某条记录进行改动时，都会把对应的事务id赋值给trx_id隐藏列。 
   - Roll_pointer：每次对某条引记录进行改动时，都会把旧的版本写入到undo日志中，然后这个隐藏列就相当于一个指针，可以通过它来找到该记录修改前的信息。
### MyISAM

- 介绍 
   - MyISAM是MySQL早期的默认存储引擎。
- 特点 
   - 不支持事务，不支持外键
   - 支持表锁，不支持行锁
   - 访问速度快
- 文件 
   - xxx.sdi：存储表结构信息
   - xxx.MYD: 存储数据
   - xxx.MYI: 存储索引
### Memory

-  介绍 
   - Memory引擎的表数据时存储在内存中的，由于受到硬件问题、或断电问题的影响，只能将这些表作为临时表或缓存使用。
-  特点 
   - 内存存放，速度快
   - hash索引（默认）
-  文件 
   - xxx.sdi：存储表结构信息
#### 区别及特点
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/engine02.png)
**面试题:**
InnoDB引擎与MyISAM引擎的区别 ?
①. InnoDB引擎, 支持事务, 而MyISAM不支持。
②. InnoDB引擎, 支持行锁和表锁, 而MyISAM仅支持表锁, 不支持行锁。
③. InnoDB引擎, 支持外键, 而MyISAM是不支持的。
主要是上述三点区别，当然也可以从索引结构、存储限制等方面，更加深入的回答，具体参考如下官方文档：

> [https://dev.mysql.com/doc/refman/8.0/en/innodb-introduction.html](https://dev.mysql.com/doc/refman/8.0/en/innodb-introduction.html)
> [https://dev.mysql.com/doc/refman/8.0/en/myisam-storage-engine.html](https://dev.mysql.com/doc/refman/8.0/en/myisam-storage-engine.html)

#### 存储引擎选择

-  InnoDB: 是Mysql的默认存储引擎，支持事务、外键。如果应用对事务的完整性有比较高的要求，在并发条件下要求数据的一致性，数据操作除了插入和查询之外，还包含很多的更新、删除操作，那么InnoDB存储引擎是比较合适的选择。 
-  MyISAM ： 如果应用是以读操作和插入操作为主，只有很少的更新和删除操作，并且对事务的完整性、并发性要求不是很高，那么选择这个存储引擎是非常合适的。（不如直接用MongoDB） 
-  MEMORY：将所有数据保存在内存中，访问速度快，通常用于临时表及缓存。MEMORY的缺陷就是对表的大小有限制，太大的表无法缓存在内存中，而且无法保障数据的安全性。（不如直接用Redis） 
## 性能分析
### 查看执行频次
查看当前数据库的 INSERT, UPDATE, DELETE, SELECT 访问频次：
`SHOW GLOBAL STATUS LIKE 'Com_______';` 或者 `SHOW SESSION STATUS LIKE 'Com_______';`
例：`show global status like 'Com_______'`(7个下划线)
### 慢查询日志
慢查询日志记录了所有执行时间超过指定参数（long_query_time，单位：秒，默认10秒）的所有SQL语句的日志。
MySQL的慢查询日志默认没有开启，需要在MySQL的配置文件（/etc/my.cnf）中配置如下信息：
## 开启慢查询日志开关
slow_query_log=1
## 设置慢查询日志的时间为2秒，SQL语句执行时间超过2秒，就会视为慢查询，记录慢查询日志
long_query_time=2
更改后记得重启MySQL服务，日志文件位置：/var/lib/mysql/localhost-slow.log
查看慢查询日志开关状态：
`show variables like 'slow_query_log';`
### profile
show profile 能在做SQL优化时帮我们了解时间都耗费在哪里。通过 have_profiling 参数，能看到当前 MySQL 是否支持 profile 操作：
`SELECT @@have_profiling;`
profiling 默认关闭，可以通过set语句在session/global级别开启 profiling：
`SET profiling = 1;`
查看所有语句的耗时：
`show profiles;`
查看指定query_id的SQL语句各个阶段的耗时：
`show profile for query query_id;`
查看指定query_id的SQL语句CPU的使用情况
`show profile cpu for query query_id;`
### explain
EXPLAIN 或者 DESC 命令获取 MySQL 如何执行 SELECT 语句的信息，包括在 SELECT 语句执行过程中表如何连接和连接的顺序。
语法：
## 直接在select语句之前加上关键字 explain / desc
EXPLAIN SELECT 字段列表 FROM 表名 HWERE 条件;
EXPLAIN 各字段含义：

-  id：select 查询的序列号，表示查询中执行 select 子句或者操作表的顺序（id相同，执行顺序从上到下；id不同，值越大越先执行） 
-  select_type：表示 SELECT 的类型，常见取值有 SIMPLE（简单表，即不适用表连接或者子查询）、PRIMARY（主查询，即外层的查询）、UNION（UNION中的第二个或者后面的查询语句）、SUBQUERY（SELECT/WHERE之后包含了子查询）等 
-  type：表示连接类型，性能由好到差的连接类型为 NULL、system、const、eq_ref、ref、range、index、all 
   - 常见的扫描方式
   1、system：系统表，少量数据，往往不需要进行磁盘IO；
   2、const：常量连接；
   3、eq_ref：主键索引(primary key)或者非空唯一索引(unique not null)等值扫描；
   4、ref：非主键非唯一索引等值扫描；
   5、range：范围扫描；
   6、index：索引树扫描；
   7、ALL：全表扫描(full table scan)；
   - 各扫描类型的要点

1、system最快：不进行磁盘IO　　
　　2、const：PK或者unique上的等值查询
　　3、eq_ref：PK或者unique上的join查询，等值匹配，对于前表的每一行(row)，后表只有一行命中
　　4、ref：非唯一索引，等值匹配，可能有多行命中
　　5、range：索引上的范围扫描，例如：between/in/>
　　6、index：索引上的全集扫描，例如：InnoDB的count
　　7、ALL最慢：全表扫描(full table scan) 

-  possible_key：可能应用在这张表上的索引，一个或多个 
-  Key：实际使用的索引，如果为 NULL，则没有使用索引 
-  Key_len：表示索引中使用的字节数，该值为索引字段最大可能长度，并非实际使用长度，在不损失精确性的前提下，长度越短越好 
-  rows：MySQL认为必须要执行的行数，在InnoDB引擎的表中，是一个估计值，可能并不总是准确的 
-  filtered：表示返回结果的行数占需读取行数的百分比，filtered的值越大越好 
## 索引

索引是帮助 MySQL **高效获取数据**的**数据结构（有序）**。在数据之外，数据库系统还维护着满足特定查找算法的数据结构，这些数据结构以某种方式引用（指向）数据，这样就可以在这些数据结构上实现高级查询算法，这种数据结构就是索引。
优点：

- 提高数据检索效率，降低数据库的IO成本
- 通过索引列对数据进行排序，降低数据排序的成本，降低CPU的消耗

缺点：

- 索引列也是要占用空间的
- 索引大大提高了查询效率，但降低了更新的速度，比如 INSERT、UPDATE、DELETE
### 索引结构
| 索引结构 | 描述 |
| --- | --- |
| B+Tree | 最常见的索引类型，大部分引擎都支持B+树索引 |
| Hash | 底层数据结构是用哈希表实现，只有精确匹配索引列的查询才有效，不支持范围查询 |
| R-Tree(空间索引) | 空间索引是 MyISAM 引擎的一个特殊索引类型，主要用于地理空间数据类型，通常使用较少 |
| Full-Text(全文索引) | 是一种通过建立倒排索引，快速匹配文档的方式，类似于 Lucene, Solr, ES |

| 索引 | InnoDB | MyISAM | Memory |
| --- | --- | --- | --- |
| B+Tree索引 | 支持 | 支持 | 支持 |
| Hash索引 | 不支持 | 不支持 | 支持 |
| R-Tree索引 | 不支持 | 支持 | 不支持 |
| Full-text | 5.6版本后支持 | 支持 | 不支持 |

#### 二叉树
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/index01.png)
二叉树的缺点可以用红黑树来解决：
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/index02.png)
由于红黑树也是一颗二叉树，所以也会存在一个缺点：

- 大数据量情况下，层级较深，检索速度慢。
#### B-树
B-Tree，B树是一种多叉路衡查找树，相对于二叉树，B树每个节点可以有多个分支，即多叉。
以一颗最大度数（max-degree）为5(5阶)的b-tree为例，那这个B树每个节点最多存储4个key，5个指针：
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/index03.png)
树的度数指的是一个节点的子节点个数。
特点：

-  5阶的B树，每一个节点最多存储4个key，对应5个指针。 
-  一旦节点存储的key数量到达5，就会裂变，中间元素向上分裂。 
-  在B树中，非叶子节点和叶子节点都会存放数据。 

数据结构演示地址：
> [https://www.cs.usfca.edu/~galles/visualization/BTree.html](https://www.cs.usfca.edu/~galles/visualization/BTree.html)

#### B+树
B+树是B树的变种，结构图：

-  绿色框框起来的部分，是索引部分，仅仅起到索引数据的作用，不存储数据。 
-  红色框框起来的部分，是数据存储部分，在其叶子节点中要存储具体的数据 

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/index04.png)
特点：

- 所有的数据都会出现在叶子节点。
- 叶子节点形成一个单向链表。
- 非叶子节点仅仅起到索引数据作用，具体的数据都是在叶子节点存放的。
#### MySQL优化的B+树
MySQL 索引数据结构对经典的 B+Tree 进行了优化。在原 B+Tree 的基础上，增加一个指向相邻叶子节点的链表指针，就形成了带有顺序指针的 B+Tree，提高区间访问的性能。
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/index05.png)

#### Hash
哈希索引就是采用一定的hash算法，将键值换算成新的hash值，映射到对应的槽位上，然后存储在hash表中。
如果两个（或多个）键值，映射到一个相同的槽位上，他们就产生了hash冲突（也称为hash碰撞），可以通过链表来解决。
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/index06.png)
特点：

- Hash索引只能用于对等比较（=、in），不支持范围查询（betwwn、>、<、...）
- 无法利用索引完成排序操作
- 查询效率高，通常只需要一次检索就可以了，效率通常要高于 B+Tree 索引

存储引擎支持：

- Memory
- InnoDB: 具有自适应hash功能，hash索引是存储引擎根据 B+Tree 索引在指定条件下自动构建的
#### 面试题

1. 为什么 InnoDB 存储引擎选择使用 B+Tree 索引结构？
- 相对于二叉树，层级更少，搜索效率高
- 对于 B-Tree，无论是叶子节点还是非叶子节点，都会保存数据，这样导致一页中存储的键值减少，指针也跟着减少，要同样保存大量数据，只能增加树的高度，导致性能降低
- 相对于 Hash 索引，B+Tree 支持范围匹配及排序操作
### 索引分类
| 分类 | 含义 | 特点 | 关键字 |
| --- | --- | --- | --- |
| 主键索引 | 针对于表中主键创建的索引 | 默认自动创建，只能有一个 | PRIMARY |
| 唯一索引 | 避免同一个表中某数据列中的值重复 | 可以有多个 | UNIQUE |
| 常规索引 | 快速定位特定数据 | 可以有多个 |  |
| 全文索引 | 全文索引查找的是文本中的关键词，而不是比较索引中的值 | 可以有多个 | FULLTEXT |

#### 聚集索引&二级索引
在 InnoDB 存储引擎中，根据索引的存储形式，又可以分为以下两种：

| 分类 | 含义 | 特点 |
| --- | --- | --- |
| 聚集索引(Clustered Index) | 将数据存储与索引放一块，索引结构的叶子节点保存了行数据 | 必须有，而且只有一个 |
| 二级索引(Secondary Index) | 将数据与索引分开存储，索引结构的叶子节点关联的是对应的主键 | 可以存在多个 |

演示图：
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/index07.png)
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/index08.png)
语句执行具体过程如下:
①. 由于是根据name字段进行查询，所以先根据name='Arm'到name字段的二级索引中进行匹配查找。但是在二级索引中只能查找到 Arm 对应的主键值 10。
②. 由于查询返回的数据是*，所以此时，还需要根据主键值10，到聚集索引中查找10对应的记录，最终找到10对应的行row。
③. 最终拿到这一行的数据，直接返回即可。
聚集索引选取规则：

- 如果存在主键，主键索引就是聚集索引
- 如果不存在主键，将使用第一个唯一(UNIQUE)索引作为聚集索引
- 如果表没有主键或没有合适的唯一索引，则 InnoDB 会自动生成一个 rowid 作为隐藏的聚集索引
#### 思考题
1. 以下 SQL 语句，哪个执行效率高？为什么？
```sql
select * from user where id = 10;
select * from user where name = 'Arm';
-- 备注：id为主键，name字段创建的有索引
```
答：第一条语句，因为第二条需要回表查询，相当于两个步骤。
2. InnoDB 主键索引的 B+Tree 高度为多少？
答：假设一行数据大小为1k，一页中可以存储16行这样的数据。InnoDB 的指针占用6个字节的空间，主键假设为bigint，占用字节数为8.
可得公式：`n * 8 + (n + 1) * 6 = 16 * 1024`，其中 8 表示 bigint 占用的字节数，n 表示当前节点存储的key的数量，(n + 1) 表示指针数量（比key多一个）。算出n约为1170。
如果树的高度为2，那么他能存储的数据量大概为：`1171 * 16 = 18736`；
如果树的高度为3，那么他能存储的数据量大概为：`1171 * 1171 * 16 = 21939856`。
另外，如果有成千上万的数据，那么就要考虑分表，涉及运维篇知识。
### 索引语法

-  创建索引：
`CREATE [ UNIQUE | FULLTEXT ] INDEX index_name ON table_name (index_col_name, ...);`
如果不加 CREATE 后面不加索引类型参数，则创建的是常规索引 
-  查看索引：
`SHOW INDEX FROM table_name;` 
-  删除索引：
`DROP INDEX index_name ON table_name;` 
-  案例： 
```sql
-- name字段为姓名字段，该字段的值可能会重复，为该字段创建索引
create index idx_user_name on tb_user(name);
-- phone手机号字段的值非空，且唯一，为该字段创建唯一索引
create unique index idx_user_phone on tb_user (phone);
-- 为profession, age, status创建联合索引
create index idx_user_pro_age_stat on tb_user(profession, age, status);
-- 为email建立合适的索引来提升查询效率
create index idx_user_email on tb_user(email);
-- 删除索引
drop index idx_user_email on tb_user;
```
### 使用规则
#### 最左前缀法则
如果索引关联了多列（联合索引），要遵守最左前缀法则，最左前缀法则指的是查询从索引的最左列开始，并且不跳过索引中的列。
如果跳跃某一列，索引将部分失效（后面的字段索引失效）。
联合索引中，出现范围查询（<, >），范围查询右侧的列索引失效。可以用>=或者<=来规避索引失效问题。
#### 索引失效情况

1. 在索引列上进行运算操作，索引将失效。如：`explain select * from tb_user where substring(phone, 10, 2) = '15';`
2. 字符串类型字段使用时，不加引号，索引将失效。如：`explain select * from tb_user where phone = 17799990015;`，此处phone的值没有加引号
3. 模糊查询中，如果仅仅是尾部模糊匹配，索引不会是失效；如果是头部模糊匹配，索引失效。如：`explain select * from tb_user where profession like '%工程';`，前后都有 % 也会失效。
4. 用 or 分割开的条件，如果 or 其中一个条件的列没有索引，那么涉及的索引都不会被用到。
5. 如果 MySQL 评估使用索引比全表更慢，则不使用索引。
#### SQL 提示
是优化数据库的一个重要手段，简单来说，就是在SQL语句中加入一些人为的提示来达到优化操作的目的。
建议使用哪个索引：
`explain select * from tb_user use index(idx_user_pro) where profession="软件工程";`
不使用哪个索引：
`explain select * from tb_user ignore index(idx_user_pro) where profession="软件工程";`
必须使用哪个索引：
`explain select * from tb_user force index(idx_user_pro) where profession="软件工程";`
use 是建议，实际使用哪个索引 MySQL 还会自己权衡运行速度去更改，force就是无论如何都强制使用该索引。
#### 覆盖索引&回表查询
尽量使用覆盖索引（查询使用了索引，并且需要返回的列，在该索引中已经全部能找到），减少 select *。

-  explain 中 extra 字段含义：
`using index condition`：查找使用了索引，但是需要回表查询数据
`using where; using index;`：查找使用了索引，但是需要的数据都在索引列中能找到，所以不需要回表查询 
-  如果在聚集索引中直接能找到对应的行，则直接返回行数据，只需要一次查询，哪怕是select *；如果在辅助索引中找聚集索引，如`select id, name from xxx where name='xxx';`，也只需要通过辅助索引(name)查找到对应的id，返回name和name索引对应的id即可，只需要一次查询；如果是通过辅助索引查找其他字段，则需要回表查询，如`select id, name, gender from xxx where name='xxx';` 
-  尽量不要用`select *`，容易出现回表查询，降低效率，除非有联合索引包含了所有字段 
-  面试题：一张表，有四个字段（id, username, password, status），由于数据量大，需要对以下SQL语句进行优化，该如何进行才是最优方案：
   `select id, username, password from tb_user where username='itcast';` 
   - 解：给username和password字段建立联合索引，则不需要回表查询，直接覆盖索引
#### 前缀索引
当字段类型为字符串（varchar, text等）时，有时候需要索引很长的字符串，这会让索引变得很大，查询时，浪费大量的磁盘IO，影响查询效率，此时可以只降字符串的一部分前缀，建立索引，这样可以大大节约索引空间，从而提高索引效率。
语法：`create index idx_xxxx on table_name(columnn(n));`
前缀长度：可以根据索引的选择性来决定，而选择性是指不重复的索引值（基数）和数据表的记录总数的比值，索引选择性越高则查询效率越高，唯一索引的选择性是1，这是最好的索引选择性，性能也是最好的。
求选择性公式：
```sql
select count(distinct email) / count(*) from tb_user;
select count(distinct substring(email, 1, 5)) / count(*) from tb_user;
```
show index 里面的sub_part可以看到截取的长度
#### 单列索引&联合索引
单列索引：即一个索引只包含单个列
联合索引：即一个索引包含了多个列
在业务场景中，如果存在多个查询条件，考虑针对于查询字段建立索引时，建议建立联合索引，而非单列索引。
单列索引情况：
`explain select id, phone, name from tb_user where phone = '17799990010' and name = '韩信';`
这句只会用到phone索引字段
##### 注意事项

- 多条件联合查询时，MySQL优化器会评估哪个字段的索引效率更高，会选择该索引完成本次查询
### 设计原则

1. 针对于数据量较大，且查询比较频繁的表建立索引
2. 针对于常作为查询条件（where）、排序（order by）、分组（group by）操作的字段建立索引
3. 尽量选择区分度高的列作为索引，尽量建立唯一索引，区分度越高，使用索引的效率越高
4. 如果是字符串类型的字段，字段长度较长，可以针对于字段的特点，建立前缀索引
5. 尽量使用联合索引，减少单列索引，查询时，联合索引很多时候可以覆盖索引，节省存储空间，避免回表，提高查询效率
6. 要控制索引的数量，索引并不是多多益善，索引越多，维护索引结构的代价就越大，会影响增删改的效率
7. 如果索引列不能存储NULL值，请在创建表时使用NOT NULL约束它。当优化器知道每列是否包含NULL值时，它可以更好地确定哪个索引最有效地用于查询
## SQL优化
### 插入数据
#### 普通插入

1.  采用批量插入（一次插入的数据不建议超过1000条） 
```sql
INSERT INTO tb_test VALUES(1,'Tom'),(2,'Cat'),(3,'Jerry');
```

2.  手动提交事务 
```sql
start transaction;
insert into tb_test values(1,'Tom'),(2,'Cat'),(3,'Jerry');
insert into tb_test values(4,'Tom'),(5,'Cat'),(6,'Jerry');
insert into tb_test values(7,'Tom'),(8,'Cat'),(9,'Jerry');
commit;
```

3.  主键顺序插入
主键乱序插入 : 8 1 9 21 88 2 4 15 89 5 7 3 （性能低）
主键顺序插入 : 1 2 3 4 5 7 8 9 15 21 88 89 （性能高） 
#### 大批量插入
如果一次性需要插入大批量数据，使用insert语句插入性能较低，此时可以使用MySQL数据库提供的load指令插入。
```sql
## 客户端连接服务端时，加上参数 --local-infile（这一行在bash/cmd界面输入）
mysql --local-infile -u root -p
## 设置全局参数local_infile为1，开启从本地加载文件导入数据的开关
set global local_infile = 1;
select @@local_infile;
## 执行load指令将准备好的数据，加载到表结构中
## 同样：按照主键顺序插入的效率要更高
load data local infile '/root/sql1.log' into table 'tb_user' fields terminated by ',' lines terminated by '\n';
```
### 主键优化
#### 数据组织方式
在InnoDB存储引擎中，表数据都是根据主键顺序组织存放的，这种存储方式的表称为索引组织表(index organized table IOT)。
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/sql01.png)
行数据，都是存储在聚集索引的叶子节点上的。InnoDB的逻辑结构图：
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/sql02.png)
InnoDB引擎中，数据行是记录在逻辑结构 page 页中的，而每一个页的大小是固定的，默认16K。
那也就意味着， 一个页中所存储的行也是有限的，如果插入的数据行row在该页存储不小，将会存储到下一个页中，页与页之间会通过指针连接。

#### 页分裂
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/sql03.png)![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/sql04.png)
#### 页合并
当删除一行记录时，实际上记录并没有被物理删除，只是记录被标记（flaged）为删除并且它的空间变得允许被其他记录声明使用。
当页中删除的记录达到 MERGE_THRESHOLD（默认为页的50%），InnoDB会开始寻找最靠近的页（前或后）看看是否可以将两个页合并以优化空间使用。
MERGE_THRESHOLD：合并页的阈值，可以自己设置，在创建表或者创建索引时指定。
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/sql05.png)

#### 索引设计原则

-  满足业务需求的情况下，尽量降低主键的长度。 
-  插入数据时，尽量选择顺序插入，选择使用AUTO_INCREMENT自增主键。 
-  尽量不要使用UUID做主键或者是其他自然主键，如身份证号。 
-  业务操作时，避免对主键的修改。 
### ORDER BY优化

1. Using filesort：通过表的索引或全表扫描，读取满足条件的数据行，然后在排序缓冲区 sort buffer 中完成排序操作，所有不是通过索引直接返回排序结果的排序都叫 FileSort 排序
2. Using index：通过有序索引顺序扫描直接返回有序数据，这种情况即为 using index，不需要额外排序，操作效率高
3. backward index scan: 在MySQL中创建的索引，默认索引的叶子节点是从小到大排序的，而此时查询排序时，是从大到小，所以，在扫描时，就是反向扫描在MySQL8版本中，支持降序索引，可以创建降序索引。
-  如果order by字段全部使用升序排序或者降序排序，则都会走索引，但是如果一个字段升序排序，另一个字段降序排序，则不会走索引 
-  explain的extra信息显示的是`Using index, Using filesort`，如果要优化掉Using filesort，则需要另外再创建一个索引， 
   - 如：`create index idx_user_age_phone_ad on tb_user(age asc, phone desc);`
   - 此时使用`select id, age, phone from tb_user order by age asc, phone desc;`会全部走索引
-  排序时,也需要满足最左前缀法则,否则也会出现 filesort。因为在创建索引的时候， age是第一个字段，phone是第二个字段，所以排序时，也就该按照这个顺序来，否则就会出现 Using filesort。 
### limit优化
常见的问题如`limit 2000000, 10`，此时需要 MySQL 排序前2000000条记录，但仅仅返回2000000-2000010的记录，其他记录丢弃，查询排序的代价非常大。
优化方案：一般分页查询时，通过创建覆盖索引能够比较好地提高性能，可以通过覆盖索引加子查询形式进行优化。
例如：
```sql
-- 此语句耗时很长
select * from tb_sku limit 9000000, 10;
-- 通过覆盖索引加快速度，直接通过主键索引进行排序及查询
select id from tb_sku order by id limit 9000000, 10;
-- 下面的语句是错误的，因为 MySQL 不支持 in 里面使用 limit
-- select * from tb_sku where id in (select id from tb_sku order by id limit 9000000, 10);
-- 通过连表查询即可实现第一句的效果，并且能达到第二句的速度
select * from tb_sku as s, (select id from tb_sku order by id limit 9000000, 10) as a where s.id = a.id;
```
### count优化
MyISAM 引擎把一个表的总行数存在了磁盘上，因此执行 count(*) 的时候会直接返回这个数，效率很高（前提是不适用where）；
InnoDB 在执行 count(*) 时，需要把数据一行一行地从引擎里面读出来，然后累计计数。
优化方案：自己计数，如创建key-value表存储在内存或硬盘，或者是用redis
count的几种用法：

- 如果count函数的参数（count里面写的那个字段）不是NULL（字段值不为NULL），累计值就加一，最后返回累计值
- 用法：count(*)、count(主键)、count(字段)、count(1)
- count(主键)跟count(*)一样，因为主键不能为空；count(字段)只计算字段值不为NULL的行；count(1)引擎会为每行添加一个1，然后就count这个1，返回结果也跟count(*)一样；count(null)返回0

各种用法的性能：

- count(主键)：InnoDB引擎会遍历整张表，把每行的主键id值都取出来，返回给服务层，服务层拿到主键后，直接按行进行累加（主键不可能为空）
- count(字段)：没有not null约束的话，InnoDB引擎会遍历整张表把每一行的字段值都取出来，返回给服务层，服务层判断是否为null，不为null，计数累加；有not null约束的话，InnoDB引擎会遍历整张表把每一行的字段值都取出来，返回给服务层，直接按行进行累加
- count(1)：InnoDB 引擎遍历整张表，但不取值。服务层对于返回的每一层，放一个数字 1 进去，直接按行进行累加
- count(*)：InnoDB 引擎并不会把全部字段取出来，而是专门做了优化，不取值，服务层直接按行进行累加

按效率排序：count(字段) < count(主键) < count(1) ≈ count(*)，所以尽量使用 count(*)
### update优化（避免行锁升级为表锁）
InnoDB 的行锁是针对索引加的锁，不是针对记录加的锁，并且该索引不能失效，否则会从行锁升级为表锁。
如以下两条语句：
`update student set no = '123' where id = 1;`，这句由于id有主键索引，所以只会锁这一行；
`update student set no = '123' where name = 'test';`这句由于name没有索引，所以会把整张表都锁住进行数据更新，解决方法是给name字段添加索引
## 锁
### 概述
锁是计算机协调多个进程或线程并发访问某一资源的机制。在数据库中，除传统的计算资源（CPU、 RAM、I/O）的争用以外，数据也是一种供许多用户共享的资源。如何保证数据并发访问的一致性、有 效性是所有数据库必须解决的一个问题，锁冲突也是影响数据库并发访问性能的一个重要因素。从这个 角度来说，锁对数据库而言显得尤其重要，也更加复杂。 
MySQL中的锁，按照锁的粒度分，分为以下三类： 

- 全局锁：锁定数据库中的所有表。 
- 表级锁：每次操作锁住整张表。 
- 行级锁：每次操作锁住对应的行数据。
### 全局锁
#### 概述
全局锁就是对整个数据库实例加锁，加锁后整个实例就处于只读状态，后续的DML的写语句，DDL语 句，已经更新操作的事务提交语句都将被阻塞。 其典型的使用场景是做**全库的逻辑备份**，对所有的表进行锁定，从而获取一致性视图，保证数据的完整性。
#### 语法

1. 加全局锁
```sql
flush tables with read lock;
```

2. 数据备份
```sql
mysqldump -u账户名 -p密码 数据库名 > XXX.sql
```

3. 释放锁
```sql
unlock tables;
```
#### 特点
数据库中加全局锁，是一个比较重的操作，存在以下问题： 

- 如果在主库上备份，那么在备份期间都不能执行更新，业务基本上就得停摆。 
- 如果在从库上备份，那么在备份期间从库不能执行主库同步过来的二进制日志（binlog），会导 致主从延迟。

在InnoDB引擎中，我们可以在备份时加上参数 `--single-transaction` 参数来完成不加锁的一致 性数据备份。
```sql
mysqldump --single-transaction -uroot –p123456 itcast > itcast.sql
```
### 表级锁
表级锁，每次操作锁住整张表。锁定粒度大，发生锁冲突的概率最高，并发度最低。应用于MyISAM、 InnoDB、BDB等存储引擎中。 
对于表级锁，主要分为以下三类： 

- 表锁 
- 元数据锁（meta data lock，MDL） 
- 意向锁
#### 表锁
对于表锁，分为两类： 

- 表共享读锁（read lock） -> 其它客户端只能读，不能写
- 表独占写锁（write lock）-> 其它客户端不能读也不能写

语法： 

- 加锁：lock tables 表名 read/write； 
- 释放锁：unlock tables; 或者客户端断开连接
#### 元数据锁
meta data lock , 元数据锁，简写MDL。 
MDL加锁过程是系统自动控制，无需显式使用，在访问一张表的时候会自动加上。MDL锁主要作用是维护表元数据的数据一致性，在表上有活动事务的时候，不可以对元数据进行写入操作。**为了避免DML与DDL冲突，保证读写的正确性**
这里的元数据，可以简单理解为就是一张表的表结构。 也就是说，某一张表涉及到未提交的事务时，是不能够修改这张表的表结构的。 
在MySQL5.5中引入了MDL，当对一张表进行增删改查的时候，加MDL读锁(共享)；当对表结构进行变更操作的时候，加MDL写锁(排他)。 
常见的SQL操作时，所添加的元数据锁：
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/lock01.png)

```sql
select object_type,object_schema,object_name,lock_type,lock_duration from
performance_schema.metadata_locks ;
```
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/lock02.png)
> 总结：
> 多个客户端不能同时对同一张表进行CRUD、修改表结构的操作，这个过程由系统控制。

#### 意向锁
概述
为了避免DML在执行时，加的行锁与表锁的冲突，在InnoDB中引入了意向锁，使得表锁不用检查每行数据是否加锁，使用意向锁来减少表锁的检查。
分类

- 意向共享锁(IS): 由语句select ... lock in share mode添加 。 与 表锁共享锁(read)兼容，与表锁排他锁(write)互斥。 
- 意向排他锁(IX): 由insert、update、delete、select...for update添加 。与表锁共享锁(read)及排他锁(write)都互斥，意向锁之间不会互斥。 

一旦事务提交了，意向共享锁、意向排他锁，都会自动释放。
```sql
select object_schema,object_name,index_name,lock_type,lock_mode,lock_data from
performance_schema.data_locks;
```
### 行级锁
#### 概述
行级锁，每次操作锁住对应的行数据。锁定粒度最小，发生锁冲突的概率最低，并发度最高。应用在 InnoDB存储引擎中。 
InnoDB的数据是基于索引组织的，行锁是通过对索引上的索引项加锁来实现的，而不是对记录加的 锁。对于行级锁，主要分为以下三类：

- 行锁（Record Lock）：锁定单个行记录的锁，防止其他事务对此行进行update和delete。在 

RC、RR隔离级别下都支持。
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/lock03.png)

- 间隙锁（Gap Lock）：锁定索引记录间隙（不含该记录），确保索引记录间隙不变，防止其他事 

务在这个间隙进行insert，产生幻读。在RR隔离级别下都支持。
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/lock04.png)

- 临键锁（Next-Key Lock）：行锁和间隙锁组合，同时锁住数据，并锁住数据前面的间隙Gap。 

在RR隔离级别下支持。
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/lock05.png)

#### 行锁
InnoDB实现了以下两种类型的行锁： 

- 共享锁（S）：允许一个事务去读一行，阻止其他事务获得相同数据集的排它锁。 
- 排他锁（X）：允许获取排他锁的事务更新数据，阻止其他事务获得相同数据集的共享锁和排他锁。

两种行锁的兼容情况如下:
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/lock06.png)
常见的SQL语句在执行时所加的行锁如下：
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/lock07.png)

> 在MySQL8.0某个版本后，SELECT ... LOCK IN SHARE MODE 建议改为SELECT ... FOR SHARE
> SELECT 一定要在手动加锁的情况下才能防止幻读。
> 事务开启之后，读取数据的时候是使用的【临键锁】，根据索引而改变成不同的锁。 

默认情况下，InnoDB在 REPEATABLE READ事务隔离级别运行，InnoDB使用 next-key 锁（临键）进行搜索和索引扫描，以防止幻读。 
针对唯一索引进行检索时，对已存在的记录进行等值匹配时，将会自动优化为行锁。 
InnoDB的行锁是针对于索引加的锁，不通过索引条件检索数据，那么InnoDB将对表中的所有记录加锁，此时就会升级为表锁。
```sql
select object_schema,object_name,index_name,lock_type,lock_mode,lock_data from
performance_schema.data_locks;
```
#### 间隙锁、临键锁
默认情况下，InnoDB在 REPEATABLE READ事务隔离级别运行，InnoDB使用 next-key 锁进行搜索和索引扫描，以防止幻读。 

- 索引上的等值查询(唯一索引)，给不存在的记录加锁时, 优化为间隙锁 。 
   - 案例：此时有ID=1和ID=3的数据，客户端1开始事务，查询ID为2的数据，由于不存在ID=2的数据，此时1和3之间的空隙会有一把锁；客户端2插入ID=2的数据时会阻塞。
- 索引上的等值查询(非唯一普通索引)，向右遍历时最后一个值不满足查询需求时，next-key lock 退化为间隙锁。 
   - 举个例子来说明，假设我们有一个学生表（student），表中有学生的学号（id）、姓名（name）和年龄（age）三个字段，我们为学号字段创建了一个非唯一普通索引。现在我们想要查找年龄大于等于 18 岁的学生信息，可以使用以下 SQL 语句：
```sql
SELECT * FROM student WHERE id >= 100 AND age >= 18;
```
如果我们按照学号的顺序进行遍历查询，当遇到第一个不满足查询条件的学生时，MySQL 会停止遍历并返回结果。但是，如果我们使用 Next-Key Lock，即在查询条件中添加一个间隙锁定，例如：
```sql
SELECT * FROM student WHERE id >= 100 AND age >= 18 FOR UPDATE;
```
这样，MySQL 会在查询过程中对符合条件的记录加上 Next-Key Lock，确保它们不会被其他事务修改。但是，如果最后一个不满足查询条件的记录被锁定了，那么下一个满足条件的记录就无法被锁定，此时 MySQL 会将 Next-Key Lock 退化为 Gap Lock，即只锁定间隙而不是整个记录。

   - InnoDB的B+树索引，叶子节点是有序的双向链表。 假如，我们要根据这个二级索引查询值 

为18的数据，并加上共享锁，我们是只锁定18这一行就可以了吗？ 并不是，因为是非唯一索引，这个 
结构中可能有多个18的存在，所以，在加锁时会继续往后找，找到一个不满足条件的值（当前案例中也就是29）。此时会对18加临键锁，并对29之前的间隙加锁。
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/lock08.png)

- 索引上的范围查询(唯一索引)--会访问到不满足条件的第一个值为止。
   - 举个例子来说明，假设我们有一个学生表（student），表中有学生的学号（id）、姓名（name）和年龄（age）三个字段，我们为学号字段创建了一个唯一索引。现在我们想要查找年龄在 18 到 20 岁之间的学生信息，可以使用以下 SQL 语句：
```sql
SELECT * FROM student WHERE id >= 100 AND age <= 20;
```
在这个例子中，如果我们按照学号的顺序进行遍历查询，MySQL 会从学号为 100 的学生开始，一直遍历到最后一个学生，然后返回所有符合条件的记录。如果最后一个学生的年龄不满足查询条件，那么 MySQL 会停止遍历并返回结果。

   - 此时数据库中ID>=19的数据有19、25；查询的条件为id>=19，并添加共享锁。 此时我们可以根据数据库表中现有的数据，将数据分为三个部分： 

[19] 
(19,25] 
(25,+∞] 
所以数据库数据在加锁时，将19加了行锁，25的临键锁（包含25及25之前的间隙），正无穷的临 
键锁(正无穷及之前的间隙)。

> 注意：间隙锁唯一目的是防止其他事务插入间隙。间隙锁可以共存，一个事务采用的间隙锁不会 
> 阻止另一个事务在同一间隙上采用间隙锁。

## InnoDB引擎
### 逻辑存储结构
InnoDB的逻辑存储结构如下图所示: ![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/InnoDB01.png)
1). 表空间表空间是InnoDB存储引擎逻辑结构的最高层， 如果用户启用了参数 innodb_file_per_table(在 
8.0版本中默认开启) ，则每张表都会有一个表空间（xxx.ibd），一个mysql实例可以对应多个表空 
间，用于存储记录、索引等数据。 
2). 段 
段，分为数据段（Leaf node segment）、索引段（Non-leaf node segment）、回滚段 
（Rollback segment），InnoDB是索引组织表，数据段就是B+树的叶子节点， 索引段即为B+树的 
非叶子节点。段用来管理多个Extent（区）。 
3). 区 
区，表空间的单元结构，每个区的大小为1M。 默认情况下， InnoDB存储引擎页大小为16K， 即一 
个区中一共有64个连续的页。 
4). 页 
页，是InnoDB 存储引擎磁盘管理的最小单元，每个页的大小默认为 16KB。为了保证页的连续性， 
InnoDB 存储引擎每次从磁盘申请 4-5 个区。 
5). 行 
行，InnoDB 存储引擎数据是按行进行存放的。 
在行中，默认有两个隐藏字段： 
Trx_id：每次对某条记录进行改动时，都会把对应的事务id赋值给trx_id隐藏列。 
Roll_pointer：每次对某条引记录进行改动时，都会把旧的版本写入到undo日志中，然后这个 
隐藏列就相当于一个指针，可以通过它来找到该记录修改前的信息。

### 架构
#### 概述
MySQL5.5 版本开始，默认使用InnoDB存储引擎，它擅长事务处理，具有崩溃恢复特性，在日常开发 中使用非常广泛。下面是InnoDB架构图，左侧为内存结构，右侧为磁盘结构。![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/InnoDB02.png)
#### 内存结构	
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/InnoDB03.png)
在左侧的内存结构中，主要分为四大块儿： Buffer Pool、Change Buffer、Adaptive Hash Index、Log Buffer。

1. Buffer Pool 

InnoDB存储引擎基于磁盘文件存储，访问物理硬盘和在内存中进行访问，速度相差很大，为了尽可能 弥补这两者之间的I/O效率的差值，就需要把经常使用的数据加载到缓冲池中，避免每次访问都进行磁 盘I/O。 
在InnoDB的缓冲池中不仅缓存了索引页和数据页，还包含了undo页、插入缓存、自适应哈希索引以及InnoDB的锁信息等等。 
缓冲池 Buffer Pool，是主内存中的一个区域，里面可以缓存磁盘上经常操作的真实数据，在执行增删改查操作时，先操作缓冲池中的数据（若缓冲池没有数据，则从磁盘加载并缓存），然后再以一定频率刷新到磁盘，从而减少磁盘IO，加快处理速度。 
缓冲池以Page页为单位，底层采用链表数据结构管理Page。根据状态，将Page分为三种类型： 

- free page：空闲page，未被使用。 
- clean page：被使用page，数据没有被修改过。 
- dirty page：脏页，被使用page，数据被修改过，也中数据与磁盘的数据产生了不一致。 

在专用服务器上，通常将多达80％的物理内存分配给缓冲池 。参数设置： `show variables like 'innodb_buffer_pool_size';`

2. Change Buffer

Change Buffer，更改缓冲区（针对于非唯一二级索引页），在执行DML语句时，如果这些数据Page 没有在Buffer Pool中，不会直接操作磁盘，而会将数据变更存在更改缓冲区 Change Buffer中，在未来数据被读取时，再将数据合并恢复到Buffer Pool中，再将合并后的数据刷新到磁盘中。 
Change Buffer的意义是什么呢?
与聚集索引不同，二级索引通常是非唯一的，并且以相对随机的顺序插入二级索引。同样，删除和更新可能会影响索引树中不相邻的二级索引页，如果每一次都操作磁盘，会造成大量的磁盘IO。有了ChangeBuffer之后，我们可以在缓冲池中进行合并处理，减少磁盘IO。

3.  Adaptive Hash Index

自适应hash索引，用于优化对Buffer Pool数据的查询。MySQL的innoDB引擎中虽然没有直接支持hash索引，但是给我们提供了一个功能就是这个自适应hash索引。因为前面我们讲到过，hash索引在进行等值匹配时，一般性能是要高于B+树的，因为hash索引一般只需要一次IO即可，而B+树，可能需要几次匹配，所以hash索引的效率要高，但是hash索引又不适合做范围查询、模糊匹配等。 
InnoDB存储引擎会监控对表上各索引页的查询，如果观察到在特定的条件下hash索引可以提升速度，则建立hash索引，称之为自适应hash索引。 
**自适应哈希索引，无需人工干预，是系统根据情况自动完成**
参数： adaptive_hash_index

4. Log Buffer

Log Buffer：日志缓冲区，用来保存要写入到磁盘中的log日志数据（redo log 、undo log）， 
默认大小为 16MB，日志缓冲区的日志会定期刷新到磁盘中。如果需要更新、插入或删除许多行的事 
务，增加日志缓冲区的大小可以节省磁盘 I/O。 
参数: 
innodb_log_buffer_size：缓冲区大小 
innodb_flush_log_at_trx_commit：日志刷新到磁盘时机，取值主要包含以下三个： 
1: 日志在每次事务提交时写入并刷新到磁盘，默认值。 
0: 每秒将日志写入并刷新到磁盘一次。2: 日志在每次事务提交后写入，并每秒刷新到磁盘一次。
### 磁盘结构
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/InnoDB04.png)

1. System Tablespace 

系统表空间是更改缓冲区的存储区域。如果表是在系统表空间而不是每个表文件或通用表空间中创建 的，它也可能包含表和索引数据。(在MySQL5.x版本中还包含InnoDB数据字典、undolog等) 
参数：innodb_data_file_path
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/InnoDB05.png)
系统表空间，默认的文件名叫 ibdata1。

2. File-Per-Table Tablespaces

如果开启了innodb_file_per_table开关 ，则每个表的文件,表空间包含单个InnoDB表的数据和索引 ，并存储在文件系统上的单个数据文件中。 
开关参数：innodb_file_per_table ，该参数默认开启。
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/InnoDB06.png)
那也就是说，我们每创建一个表，都会产生一个表空间文件，如图：
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/InnoDB07.png)

3. General Tablespaces

通用表空间，需要通过 CREATE TABLESPACE 语法创建通用表空间，在创建表时可以指定该表空间。

- 创建表空间

`CREATE TABLESPACE ts_name ADD DATAFILE 'file_name' ENGINE = engine_name; `
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/InnoDB08.png)

- 创建表时指定表空间

`CREATE TABLE xxx ... TABLESPACE ts_name;`
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/InnoDB08.png)

4. Undo Tablespaces

撤销表空间，MySQL实例在初始化时会自动创建两个默认的undo表空间（初始大小16M），用于存储 undo log日志。

5. Temporary Tablespaces

InnoDB 使用会话临时表空间和全局临时表空间。存储用户创建的临时表等数据。

6. Doublewrite Buffer Files

双写缓冲区，innoDB引擎将数据页从Buffer Pool刷新到磁盘前，先将数据页写入双写缓冲区文件中，便于系统异常时恢复数据。
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/InnoDB09.png)

7. Redo Log

重做日志，是用来实现事务的持久性。该日志文件由两部分组成：重做日志缓冲（redo log 
buffer）以及重做日志文件（redo log）,前者是在内存中，后者在磁盘中。当事务提交之后会把所 
有修改信息都会存到该日志中, 用于在刷新脏页到磁盘时,发生错误时, 进行数据恢复使用。 
以循环方式写入重做日志文件，涉及两个文件：
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/InnoDB10.png)

---

前面我们介绍了InnoDB的内存结构，以及磁盘结构，那么内存中我们所更新的数据，又是如何到磁盘 
中的呢？ 此时，就涉及到一组后台线程，接下来，就来介绍一些InnoDB中涉及到的后台线程。
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/InnoDB11.png)

### 后台线程
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/InnoDB12.png)
在InnoDB的后台线程中，分为4类，分别是：Master Thread 、IO Thread、Purge Thread、 
Page Cleaner Thread。

1. Master Thread 

核心后台线程，负责调度其他线程，还负责将缓冲池中的数据异步刷新到磁盘中, 保持数据的一致性， 
还包括脏页的刷新、合并插入缓存、undo页的回收 。 

2. IO Thread 

在InnoDB存储引擎中大量使用了AIO来处理IO请求, 这样可以极大地提高数据库的性能，而IO 
Thread主要负责这些IO请求的回调。

|  线程类型 | 默认个数 | 职责 |
| --- | --- | --- |
| Read thread | 4 | 负责读操作 |
| Write thread | 4 | 负责写操作 |
| Log thread | 1 | 负责将日志缓冲区刷新到磁盘 |
| Insert buffer thread | 1 | 负责将写缓冲区内容刷新到磁盘 |

```sql
show engine innodb status \G;
```
![部分信息](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/InnoDB13.png "部分信息")

3. Purge Thread

主要用于回收事务已经提交了的undo log，在事务提交之后，undo log可能不用了，就用它来回收。

4. Page Cleaner Thread 

协助 Master Thread 刷新脏页到磁盘的线程，它可以减轻 Master Thread 的工作压力，减少阻塞。
### 事务原理
#### 基础

1. 事务

事务 是一组操作的集合，它是一个不可分割的工作单位，事务会把所有的操作作为一个整体一起向系 
统提交或撤销操作请求，即这些操作要么同时成功，要么同时失败。

2. 特性
- 原子性（Atomicity）：事务是不可分割的最小操作单元，要么全部成功，要么全部失败。 
- 一致性（Consistency）：事务完成时，必须使所有的数据都保持一致状态。 
- 隔离性（Isolation）：数据库系统提供的隔离机制，保证事务在不受外部并发操作影响的独立环境下运行。 
- 持久性（Durability）：事务一旦提交或回滚，它对数据库中的数据的改变就是永久的

研究事务的原理，就是研究MySQL的InnoDB引擎是如何保证事务的这四大特性。

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/InnoDB14.png)
对于这四大特性，实际上分为两个部分。 其中的原子性、一致性、持久化，实际上是由InnoDB中的 
两份日志来保证的，一份是redo log日志，一份是undo log日志。 而持久性是通过数据库的锁， 
加上MVCC来保证的。
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/InnoDB15.png)
事务原理，主要就是研究redolog，undolog以及MVCC。

#### redo log
重做日志，记录的是事务提交时数据页的物理修改，是用来实现事务的持久性。 
该日志文件由两部分组成：重做日志缓冲（redo log buffer）以及重做日志文件（redo log 
file）,前者是在内存中，后者在磁盘中。当事务提交之后会把所有修改信息都存到该日志文件中, 用 
于在刷新脏页到磁盘,发生错误时, 进行数据恢复使用。

---

如果没有redolog，可能会存在什么问题的？
在InnoDB引擎中的内存结构中，主要的内存区域就是缓冲池，在缓冲池中缓存了很多的数据页。 当我们在一个事务中，执行多个增删改的操作时，InnoDB引擎会先操作缓冲池中的数据，如果缓冲区没有对应的数据，会通过后台线程将磁盘中的数据加载出来，存放在缓冲区中，然后将缓冲池中的数据修改，修改后的数据页我们称为脏页。 而脏页则会在一定的时机，通过后台线程刷新到磁盘中，从而保证缓冲区与磁盘的数据一致。 而缓冲区的脏页数据并不是实时刷新的，而是一段时间之后将缓冲区的数据刷新到磁盘中，假如刷新到磁盘的过程出错了，而提示给用户事务提交成功，而数据却 没有持久化下来，这就出现问题了，没有保证事务的持久性。	![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/InnoDB16.png)
如何解决上述的问题呢？ 在InnoDB中提供了一份日志 redo log，通过redolog如何解决这个问题。![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/InnoDB17.png)
有了redolog之后，当对缓冲区的数据进行增删改之后，会首先将操作的数据页的变化，记录在redo 
log buffer中。在事务提交时，会将redo log buffer中的数据刷新到redo log磁盘文件中。 
过一段时间之后，如果刷新缓冲区的脏页到磁盘时，发生错误，此时就可以借助于redo log进行数据 
恢复，这样就保证了事务的持久性。 而如果脏页成功刷新到磁盘 或 或者涉及到的数据已经落盘，此 
时redolog就没有作用了，就可以删除了，所以存在的两个redolog文件是循环写的。

---

为什么每一次提交事务，要刷新redo log到磁盘，而不是直接将buffer pool中的脏页刷新到磁盘呢 ? 
因为在业务操作中，我们操作数据一般都是随机读写磁盘的，而不是顺序读写磁盘。 而redo log在 
往磁盘文件中写入数据，由于是**日志文件**，所以都是**顺序**写的。顺序写的效率要远大于随机写。 这 
种先写日志的方式，称之为 **WAL**（Write-Ahead Logging）。
#### undo log
回滚日志，用于记录数据被修改前的信息 , 作用包含两个 : 提供回滚(保证事务的原子性) 和 
MVCC(多版本并发控制) 。 
undo log和redo log记录物理日志不一样，它是**逻辑日志**。可以认为当delete一条记录时，undo 
log中会记录一条对应的insert记录，反之亦然，当update一条记录时，它记录一条对应相反的 
update记录。当执行rollback时，就可以从undo log中的逻辑记录读取到相应的内容并进行回滚。 
Undo log销毁：undo log在事务执行时产生，事务提交时，并不会立即删除undo log，因为这些 
日志可能还用于MVCC。 
Undo log存储：undo log采用段的方式进行管理和记录，存放在前面介绍的 rollback segment 
回滚段中，内部包含1024个undo log segment。
### MVCC
#### 基本概念

1. 当前读

读取的是记录的最新版本，读取时还要保证其他并发事务不能修改当前记录，会对读取的记录进行加 
锁。对于我们日常的操作，如：select ... lock in share mode(共享锁)，select ... for update、update、insert、delete(排他锁)都是一种当前读。
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/MVCC01.png)
在测试中我们可以看到，即使是在默认的RR隔离级别下，事务A中依然可以读取到事务B最新提交的内 容，因为在查询语句后面加上了 lock in share mode 共享锁，此时是当前读操作。当然，当我们加排他锁的时候，也是当前读操作。

2. 快照读

简单的select（不加锁）就是快照读，快照读，读取的是记录数据的可见版本，有可能是历史数据， 不加锁，是非阻塞读。
• Read Committed：每次select，都生成一个快照读。 
• Repeatable Read：开启事务后第一个select语句才是快照读的地方。 
• Serializable：快照读会退化为当前读。
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/MVCC02.png)
在测试中,我们看到即使事务B提交了数据,事务A中也查询不到。 原因就是因为普通的select是快照 
读，而在当前默认的RR隔离级别下，开启事务后第一个select语句才是快照读的地方，后面执行相同 
的select语句都是从快照中获取数据，可能不是当前的最新数据，这样也就保证了可重复读。

3. MVCC

全称 Multi-Version Concurrency Control，多版本并发控制。指维护一个数据的多个版本， 使得读写操作没有冲突，快照读为MySQL实现MVCC提供了一个非阻塞读功能。MVCC的具体实现，还需要依赖于数据库记录中的**三个隐式字段**、**undo log日志**、**readView**。
#### 隐藏字段

|  id  | age  | name |
| :--: | :--: | :--: |
|  1   |  1   | tom  |
|  3   |  3   | cat  |

当我们创建了上面的这张表，我们在查看表结构的时候，就可以显式的看到这三个字段。 实际上除了 
这三个字段以外，InnoDB还会自动的给我们添加三个隐藏字段及其含义分别是：

| 隐藏字段  | 含义 |
| :-: | :-: |
| DB_TRX_ID | 最近修改事务ID，记录插入这条记录或最后一次修改该记录的事务ID |
| DB_ROLL_PTR | 回滚指针，指向这条记录的上一个版本，用于配合undo log，指向上一个版本 |
| DB_ROW_ID | 隐藏主键，如果表结构没有指定主键，将会生成该隐藏字段 |


---

进入数据库对应的库的文件夹如：/var/lib/mysql/itcast/,查看stu的表结构信息, 通过如下指令
```sql
ibd2sdi stu.ibd
```
#### undo log
##### 介绍
回滚日志，在insert、update、delete的时候产生的便于数据回滚的日志。 
当insert的时候，产生的undo log日志只在回滚时需要，在事务提交后，可被立即删除。 
而update、delete的时候，产生的undo log日志不仅在回滚时需要，在快照读时也需要，不会立即 
被删除。
##### 版本链
有一张表原始数据为：

| id   | age  | name | DB_TRX_ID | DB_ROLL_PTR |
| ---- | ---- | ---- | --------- | ----------- |
| 30   | 30   | A30  | 1         | null        |

> DB_TRX_ID : 代表最近修改事务ID，记录插入这条记录或最后一次修改该记录的事务ID，是自增的。
> DB_ROLL_PTR ： 由于这条数据是才插入的，没有被更新过，所以该字段值为null。

然后，有四个并发事务同时在访问这张表。

1. 第一步

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/MVCC03.png)
当事务2执行第一条修改语句时，会记录undo log日志，记录数据变更之前的样子; 然后更新记录， 
并且记录本次操作的事务ID，回滚指针，回滚指针用来指定如果发生回滚，回滚到哪一个版本。
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/MVCC04.png)

2. 第二步

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/MVCC05.png)
当事务3执行第一条修改语句时，也会记录undo log日志，记录数据变更之前的样子; 然后更新记 
录，并且记录本次操作的事务ID，回滚指针，回滚指针用来指定如果发生回滚，回滚到哪一个版本。
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/MVCC06.png)

3. 第四步

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/MVCC07.png)
当事务4执行第一条修改语句时，也会记录undo log日志，记录数据变更之前的样子; 然后更新记 
录，并且记录本次操作的事务ID，回滚指针，回滚指针用来指定如果发生回滚，回滚到哪一个版本。
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/MVCC08.png)

> 最终我们发现，不同事务或相同事务对同一条记录进行修改，会导致该记录的undolog生成一条记录版本链表，链表的头部是最新的旧记录，链表尾部是最早的旧记录。

#### readview
ReadView（读视图）是 快照读 SQL执行时MVCC提取数据的依据，记录并维护系统当前活跃的事务 
（未提交的）id。 
ReadView中包含了四个核心字段：

| 字段  | 含义 |
| --- | --- |
| m_ids | 当前活跃的事务ID集合 |
| min_trx_id | 最小活跃事务ID |
| max_trx_id | 预分配事务ID，当前最大事务ID+1（因为事务ID是自增的） |
| creator_trx_id | ReadView创建者的事务ID |

在readview中规定了版本链数据的访问规则： 
> trx_id 代表当前undolog版本链对应事务ID。

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/MVCC09.png)
不同的隔离级别，生成ReadView的时机不同： 

- READ COMMITTED ：在事务中每一次执行快照读时生成ReadView。 
- REPEATABLE READ：仅在事务中第一次执行快照读时生成ReadView，后续复用该ReadView。
#### 原理分析
##### READ COMMITTED隔离级别
RC隔离级别下，在事务中每一次执行快照读时生成ReadView。

---

分析事务5中，两次快照读读取数据，是如何获取数据的? 
在事务5中，查询了两次id为30的记录，由于隔离级别为Read Committed，所以每一次进行快照读都会生成一个ReadView，那么两次生成的ReadView如下。 
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/MVCC10.png)
那么这两次快照读在获取数据时，就需要根据所生成的ReadView以及ReadView的版本链访问规则，到undolog版本链中匹配数据，最终决定此次快照读返回的数据。

---

- 第一次快照读具体的读取过程：

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/MVCC11.png)
在进行匹配时，会从undo log的版本链，从上到下进行挨个匹配：

1. 先匹配 

| id   | age  | name | DB_TRX_ID | DB_ROLL_PTR |
| ---- | ---- | ---- | --------- | ----------- |
| 30   | 10   | A3   | 4         | 0x00003     |

这条记录，这条记录对应的 trx_id为4，也就是将4带入右侧的匹配规则中。 ①不满足 ②不满足 ③不满足 ④也不满足 ，都不满足，则继续匹配undo log版本链的下一条。 

2. 再匹配第二条 

| 0x00003 | 30   | 3    | A3   | 3    | 0x00002 |
| ------- | ---- | ---- | ---- | ---- | ------- |

这条记录对应的trx_id为3，也就是将3带入右侧的匹配规则中。①不满足 ②不满足 ③不满足 ④也 
不满足 ，都不满足，则继续匹配undo log版本链的下一条。

3. 再匹配第三条

| 0x00002 | 30   | 3    | A30  | 2    | 0x00001 |
| ------- | ---- | ---- | ---- | ---- | ------- |

这条记录对应的trx_id为2，也就是将2带入右侧的匹配规则中。①不满足 ②满足 终止匹配，此次快照 
读，返回的数据就是版本链中记录的这条数据。

- 第二次快照读具体的读取过程:

![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/MVCC12.png)
在进行匹配时，会从undo log的版本链，从上到下进行挨个匹配：

- 先匹配1

| id   | age  | name | DB_TRX | DB_ROLL_PTR |
| ---- | ---- | ---- | ------ | ----------- |
| 30   | 10   | A3   | 4      | 0x00003     |

这条记录，这条记录对应的 trx_id为4，也就是将4带入右侧的匹配规则中。 ①不满足 ②不满足 ③不满足 ④也不满足 ， 都不满足，则继续匹配undo log版本链的下一条。 

- 匹配第2条

| 0x00003 | 30   | 3    | A3   | 3    | 0x00002 |
| ------- | ---- | ---- | ---- | ---- | ------- |

这条记录对应的trx_id为3，也就是将3带入右侧的匹配规则中。①不满足 ②满足 。终止匹配，此次 快照读，返回的数据就是版本链中记录的这条数据。 

##### Read Repeated 隔离级别
RR隔离级别下，仅在事务中第一次执行快照读时生成ReadView，后续复用该ReadView。 而RR 是可 
重复读，在一个事务中，执行两次相同的select语句，查询到的结果是一样的。
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/MVCC13.png)
在RR隔离级别下，只是在事务中第一次快照读时生成ReadView，后续都是复用该 ReadView，那么既然ReadView都一样， ReadView的版本链匹配规则也一样， 那么最终快照读返回的结果也是一样的

---

MVCC的实现原理就是通过 InnoDB表的隐藏字段、UndoLog 版本链、ReadView来实现的。 
而MVCC + 锁，则实现了事务的隔离性。 而一致性则是由redolog 与 undolog保证。
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/MVCC14.png)

## MySQL管理
### 系统数据库
Mysql数据库安装完成后，自带了一下四个数据库，具体作用如下：
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/manage01.png)

### 常用工具
#### mysql
该mysql不是指mysql服务，而是指mysql的客户端工具。
```shell
语法 ：
  mysql [options] [database]
选项 ：
  -u, --user=name #指定用户名
  -p, --password[=name] #指定密码
  -h, --host=name #指定服务器IP或域名
  -P, --port=port #指定连接端口
  -e, --execute=name #执行SQL语句并退出
```
-e选项可以在Mysql客户端执行SQL语句，而不用连接到MySQL数据库再执行，对于一些批处理脚本， 这种方式尤其方便。
```sql
mysql -uroot –p123456 db01 -e "select * from stu";
```
#### mysqladmin
mysqladmin 是一个执行管理操作的客户端程序。可以用它来检查服务器的配置和当前状态、创建并 
删除数据库等。
```shell
mysqladmin --help
```
```shell
语法:
  mysqladmin [options] command ...
选项:
  -u, --user=name #指定用户名
  -p, --password[=name] #指定密码
  -h, --host=name #指定服务器IP或域名
  -P, --port=port #指定连接端口
```
```shell
mysqladmin -uroot –p1234 drop 'test01';
mysqladmin -uroot –p1234 version;
```
#### mysqlbinlog
由于服务器生成的二进制日志文件以二进制格式保存，所以如果想要检查这些文本的文本格式，就会使用到mysqlbinlog 日志管理工具。
```shell
语法 ：
  mysqlbinlog [options] log-files1 log-files2 ...
选项 ：
  -d, --database=name 指定数据库名称，只列出指定的数据库相关操作。
  -o, --offset=## 忽略掉日志中的前n行命令。
  -r, --result-file=name 将输出的文本格式日志输出到指定文件。
  -s, --short-form 显示简单格式， 省略掉一些信息。
  --start-datatime=date1 --stop-datetime=date2 指定日期间隔内的所有日志。
  --start-position=pos1 --stop-position=pos2 指定位置间隔内的所有日志。
```
```shell
mysqlbinlog -s binlog.000008
```
#### mysqlshow
mysqlshow 客户端对象查找工具，用来很快地查找存在哪些数据库、数据库中的表、表中的列或者索 
引，帮助用户查看数据库的结构和元数据信息。
```shell
语法：
  mysqlshow [options] [db_name [table_name [col_name]]]
选项：
  --count 显示数据库及表的统计信息（数据库，表 均可以不指定）
  -i 显示指定数据库或者指定表的状态信息
示例：
  #查询test库中每个表中的字段数及行数
  mysqlshow -uroot -p2143 test --count
  #查询test库中book表的详细情况
  mysqlshow -uroot -p2143 test book --count
```
```shell
mysqlshow -uroot -p1234 --count
```
```shell
mysqlshow -uroot -p1234 db01 --count
```
```shell
mysqlshow -uroot -p1234 db01 course --count
```
```shell
mysqlshow -uroot -p1234 db01 course id --count
```
#### mysqldump
mysqldump 客户端工具用来备份数据库或在不同数据库之间进行数据迁移。备份内容包含创建表，及插入表的SQL语句。
```shell
语法 ：
  mysqldump [options] db_name [tables]
  mysqldump [options] --database/-B db1 [db2 db3...]
  mysqldump [options] --all-databases/-A
连接选项 ：
  -u, --user=name 指定用户名
  -p, --password[=name] 指定密码
  -h, --host=name 指定服务器ip或域名
  -P, --port=## 指定连接端口
输出选项：
  --add-drop-database 在每个数据库创建语句前加上 drop database 语句
  --add-drop-table 在每个表创建语句前加上 drop table 语句,默认开启;不开启(--skip-add-drop-table)
  -n, --no-create-db 不包含数据库的创建语句
  -t, --no-create-info 不包含数据表的创建语句
  -d --no-data 不包含数据
  -T, --tab=name 自动生成两个文件：一个.sql文件，创建表结构的语句；一个.txt文件，数据文件
```
```shell
mysqldump -uroot -p1234 db01 > db01.sql
```
备份出来的数据包含： 

- 删除表的语句 
- 创建表的语句 
- 数据插入语句

如果我们在数据备份时，不需要创建表，或者不需要备份数据，只需要备份表结构，都可以通过对应的参数来实现。
```shell
mysqldump -uroot -p1234 -t db01 > db01.sql
```

---

```shell
mysqldump -uroot -p1234 -T /root db01 score
```
执行上述指令，会出错，数据不能完成备份，原因是因为我们所指定的数据存放目录/root，MySQL认为是不安全的，需要存储在MySQL信任的目录下。那么，哪个目录才是MySQL信任的目录呢，可以查看 一下系统变量 `secure_file_priv` 。执行结果如下：
```sql
SHOW VARIABLES LIKE '%secure_file_priv%'
```
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/manage02.png)
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/manage02.png)
上述的两个文件 score.sql 中记录的就是表结构文件，而 score.txt 就是表数据文件，但是需要注意表数据文件，并不是记录一条条的insert语句，而是按照一定的格式记录表结构中的数据。如下：
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/manage03.png)

#### mysqlimport/source

1. mysqlimport

mysqlimport 是客户端数据导入工具，用来导入mysqldump 加 -T 参数后导出的文本文件。
```shell
语法 ：
  mysqlimport [options] db_name textfile1 [textfile2...]
示例 ：
  mysqlimport -uroot -p2143 test /tmp/city.txt
```
![image.png](https://cdn.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/database/mysql/manage04.png)

2. source

如果需要导入sql文件,可以使用mysql中的source 指令 :
```shell
source /root/xxxxx.sql
```
## 数据类型
### 整型
| 类型名称 | 取值范围 | 大小 |
| --- | --- | --- |
| TINYINT | -128〜127 | 1个字节 |
| SMALLINT | -32768〜32767 | 2个宇节 |
| MEDIUMINT | -8388608〜8388607 | 3个字节 |
| INT (INTEGHR) | -2147483648〜2147483647 | 4个字节 |
| BIGINT | -9223372036854775808〜9223372036854775807 | 8个字节 |

无符号在数据类型后加 unsigned 关键字。
### 浮点型
| 类型名称 | 说明 | 存储需求 |
| --- | --- | --- |
| FLOAT | 单精度浮点数 | 4 个字节 |
| DOUBLE | 双精度浮点数 | 8 个字节 |
| DECIMAL (M, D)，DEC | 压缩的“严格”定点数 | M+2 个字节 |

### 日期和时间
| 类型名称 | 日期格式 | 日期范围 | 存储需求 |
| --- | --- | --- | --- |
| YEAR | YYYY | 1901 ~ 2155 | 1 个字节 |
| TIME | HH:MM:SS | -838:59:59 ~ 838:59:59 | 3 个字节 |
| DATE | YYYY-MM-DD | 1000-01-01 ~ 9999-12-3 | 3 个字节 |
| DATETIME | YYYY-MM-DD HH:MM:SS | 1000-01-01 00:00:00 ~ 9999-12-31 23:59:59 | 8 个字节 |
| TIMESTAMP | YYYY-MM-DD HH:MM:SS | 1980-01-01 00:00:01 UTC ~ 2040-01-19 03:14:07 UTC | 4 个字节 |

### 字符串
| 类型名称 | 说明 | 存储需求 |
| --- | --- | --- |
| CHAR(M) | 固定长度非二进制字符串 | M 字节，1<=M<=255 |
| VARCHAR(M) | 变长非二进制字符串 | L+1字节，在此，L< = M和 1<=M<=255 |
| TINYTEXT | 非常小的非二进制字符串 | L+1字节，在此，L<2^8 |
| TEXT | 小的非二进制字符串 | L+2字节，在此，L<2^16 |
| MEDIUMTEXT | 中等大小的非二进制字符串 | L+3字节，在此，L<2^24 |
| LONGTEXT | 大的非二进制字符串 | L+4字节，在此，L<2^32 |
| ENUM | 枚举类型，只能有一个枚举字符串值 | 1或2个字节，取决于枚举值的数目 (最大值为65535) |
| SET | 一个设置，字符串对象可以有零个或 多个SET成员 | 1、2、3、4或8个字节，取决于集合 成员的数量（最多64个成员） |

### 二进制类型
| 类型名称 | 说明 | 存储需求 |
| --- | --- | --- |
| BIT(M) | 位字段类型 | 大约 (M+7)/8 字节 |
| BINARY(M) | 固定长度二进制字符串 | M 字节 |
| VARBINARY (M) | 可变长度二进制字符串 | M+1 字节 |
| TINYBLOB (M) | 非常小的BLOB | L+1 字节，在此，L<2^8 |
| BLOB (M) | 小 BLOB | L+2 字节，在此，L<2^16 |
| MEDIUMBLOB (M) | 中等大小的BLOB | L+3 字节，在此，L<2^24 |
| LONGBLOB (M) | 非常大的BLOB | L+4 字节，在此，L<2^32 |

## 权限一览表
> 具体权限的作用详见[官方文档](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html)

GRANT 和 REVOKE 允许的静态权限

| Privilege | Grant Table Column | Context |
| --- | --- | --- |
| `[ALL [PRIVILEGES]](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_all)` | Synonym for “all privileges” | Server administration |
| `[ALTER](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_alter)` | `Alter_priv` | Tables |
| `[ALTER ROUTINE](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_alter-routine)` | `Alter_routine_priv` | Stored routines |
| `[CREATE](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_create)` | `Create_priv` | Databases, tables, or indexes |
| `[CREATE ROLE](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_create-role)` | `Create_role_priv` | Server administration |
| `[CREATE ROUTINE](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_create-routine)` | `Create_routine_priv` | Stored routines |
| `[CREATE TABLESPACE](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_create-tablespace)` | `Create_tablespace_priv` | Server administration |
| `[CREATE TEMPORARY TABLES](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_create-temporary-tables)` | `Create_tmp_table_priv` | Tables |
| `[CREATE USER](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_create-user)` | `Create_user_priv` | Server administration |
| `[CREATE VIEW](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_create-view)` | `Create_view_priv` | Views |
| `[DELETE](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_delete)` | `Delete_priv` | Tables |
| `[DROP](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_drop)` | `Drop_priv` | Databases, tables, or views |
| `[DROP ROLE](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_drop-role)` | `Drop_role_priv` | Server administration |
| `[EVENT](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_event)` | `Event_priv` | Databases |
| `[EXECUTE](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_execute)` | `Execute_priv` | Stored routines |
| `[FILE](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_file)` | `File_priv` | File access on server host |
| `[GRANT OPTION](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_grant-option)` | `Grant_priv` | Databases, tables, or stored routines |
| `[INDEX](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_index)` | `Index_priv` | Tables |
| `[INSERT](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_insert)` | `Insert_priv` | Tables or columns |
| `[LOCK TABLES](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_lock-tables)` | `Lock_tables_priv` | Databases |
| `[PROCESS](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_process)` | `Process_priv` | Server administration |
| `[PROXY](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_proxy)` | See `proxies_priv`
 table | Server administration |
| `[REFERENCES](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_references)` | `References_priv` | Databases or tables |
| `[RELOAD](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_reload)` | `Reload_priv` | Server administration |
| `[REPLICATION CLIENT](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_replication-client)` | `Repl_client_priv` | Server administration |
| `[REPLICATION SLAVE](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_replication-slave)` | `Repl_slave_priv` | Server administration |
| `[SELECT](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_select)` | `Select_priv` | Tables or columns |
| `[SHOW DATABASES](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_show-databases)` | `Show_db_priv` | Server administration |
| `[SHOW VIEW](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_show-view)` | `Show_view_priv` | Views |
| `[SHUTDOWN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_shutdown)` | `Shutdown_priv` | Server administration |
| `[SUPER](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_super)` | `Super_priv` | Server administration |
| `[TRIGGER](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_trigger)` | `Trigger_priv` | Tables |
| `[UPDATE](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_update)` | `Update_priv` | Tables or columns |
| `[USAGE](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_usage)` | Synonym for “no privileges” | Server administration |

GRANT 和 REVOKE 允许的动态权限

| Privilege | Context |
| --- | --- |
| `[APPLICATION_PASSWORD_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_application-password-admin)` | Dual password administration |
| `[AUDIT_ABORT_EXEMPT](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_audit-abort-exempt)` | Allow queries blocked by audit log filter |
| `[AUDIT_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_audit-admin)` | Audit log administration |
| `[AUTHENTICATION_POLICY_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_authentication-policy-admin)` | Authentication administration |
| `[BACKUP_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_backup-admin)` | Backup administration |
| `[BINLOG_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_binlog-admin)` | Backup and Replication administration |
| `[BINLOG_ENCRYPTION_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_binlog-encryption-admin)` | Backup and Replication administration |
| `[CLONE_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_clone-admin)` | Clone administration |
| `[CONNECTION_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_connection-admin)` | Server administration |
| `[ENCRYPTION_KEY_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_encryption-key-admin)` | Server administration |
| `[FIREWALL_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_firewall-admin)` | Firewall administration |
| `[FIREWALL_EXEMPT](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_firewall-exempt)` | Firewall administration |
| `[FIREWALL_USER](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_firewall-user)` | Firewall administration |
| `[FLUSH_OPTIMIZER_COSTS](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_flush-optimizer-costs)` | Server administration |
| `[FLUSH_STATUS](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_flush-status)` | Server administration |
| `[FLUSH_TABLES](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_flush-tables)` | Server administration |
| `[FLUSH_USER_RESOURCES](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_flush-user-resources)` | Server administration |
| `[GROUP_REPLICATION_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_group-replication-admin)` | Replication administration |
| `[GROUP_REPLICATION_STREAM](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_group-replication-stream)` | Replication administration |
| `[INNODB_REDO_LOG_ARCHIVE](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_innodb-redo-log-archive)` | Redo log archiving administration |
| `[NDB_STORED_USER](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_ndb-stored-user)` | NDB Cluster |
| `[PASSWORDLESS_USER_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_passwordless-user-admin)` | Authentication administration |
| `[PERSIST_RO_VARIABLES_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_persist-ro-variables-admin)` | Server administration |
| `[REPLICATION_APPLIER](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_replication-applier)` | `PRIVILEGE_CHECKS_USER`
 for a replication channel |
| `[REPLICATION_SLAVE_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_replication-slave-admin)` | Replication administration |
| `[RESOURCE_GROUP_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_resource-group-admin)` | Resource group administration |
| `[RESOURCE_GROUP_USER](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_resource-group-user)` | Resource group administration |
| `[ROLE_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_role-admin)` | Server administration |
| `[SESSION_VARIABLES_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_session-variables-admin)` | Server administration |
| `[SET_USER_ID](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_set-user-id)` | Server administration |
| `[SHOW_ROUTINE](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_show-routine)` | Server administration |
| `[SYSTEM_USER](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_system-user)` | Server administration |
| `[SYSTEM_VARIABLES_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_system-variables-admin)` | Server administration |
| `[TABLE_ENCRYPTION_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_table-encryption-admin)` | Server administration |
| `[VERSION_TOKEN_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_version-token-admin)` | Server administration |
| `[XA_RECOVER_ADMIN](https://dev.mysql.com/doc/refman/8.0/en/privileges-provided.html#priv_xa-recover-admin)` | Server administration |

