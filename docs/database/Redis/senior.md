---
title: 高阶篇
shortTitle: 高阶篇
description: 尚硅谷2023高阶篇
date: 2024-09-19 17:26:07
categories: [数据库]
tags: [Redis]
order: 3
---

## 单线程VS多线程



## Big Key

### More Key

生产环境下，可能会有大量key，此时若想查找某个key，不能使用`keys *`，它的时间复杂度是O(n),会造成系统严重的卡顿。

诸如`keys`/`flushdb`/`flushall`等危险的命令应该在配置文件中禁用！

```conf
rename- command keys ""
rename- command flushdb ""
rename- command flushall ""
```

---

代替`keys`的查找命令为`scan`，其变体有`hscan`、`zscan`……

SCAN 命令是一个基于游标的迭代器，每次被调用之后， 都会向用户返回一个新的游标， 用户在下次迭代时需要使用这个新游标作为 SCAN 命令的游标参数， 以此来延续之前的迭代过程。

语法：

```shell
SCAN cursor [MATCH pattern] [COUNT count]
```

- cursor: 游标
- pattern: 匹配的模式
- count: 指定从数据集里返回多少元素，默认为 10 

SCAN 返回一个包含两个元素的数组

- 第一个元素是用于进行下一次迭代的新游标， 
- 第二个元素则是一个数组， 这个数组中包含了所有被迭代的元素。如果新游标返回零表示迭代已结束。 

SCAN的遍历顺序

非常特别，它不是从第一维数组的第零位一直遍历到末尾，而是采用了高位进位加法来遍历。之所以使用这样特殊的方式进行遍历，是考虑到字典的扩容和缩容时避免槽位的遍历重复和遗漏。

DEMO案例

```shell
127.0.0.1:6379> keys *
1) "k2"
2) "k1"
3) "k3"
127.0.0.1:6379> SCAN 0 MATCH * COUNT 1
1) "2"
2) 1) "k2"
   2) "k1"
127.0.0.1:6379> SCAN 2 MATCH * COUNT 1
1) "0"
2) 1) "k3"
```

### Big Key

**多大算Big Key**

> 阿里开发规范：
>
> - String控制在 10KB,hash、list、zest、set元素个数不超过5000；
> - 非字符串的bigkey,不能使用del删除，要用hscan、sscan、zscan方式渐进删除，同时防止bigkey过期时间自动删除的问题

**如何发现**

若key小于10KB，则使用–bigkeys

```shell
# 每隔 100 条 scan 指令就会休眠 0.1s，ops 就不会剧烈抬升，但是扫描的时间会变长
redis-cli -h 127.0.0.1 -p 7001 –-bigkeys -i 0.1
```

否则使用memory usage

```shell
MEMORY USAGE key [SAMPLES count]
```

**如何删除**

- String：一般使用`del`,若过大则使用`unlink`

- hash:使用`hscan`每次获取少量的field-value,再使用`hdel`删除每个field

  - HSCAN 命令基本语法:`HSCAN key cursor [MATCH pattern] [COUNT count]`

    - cursor-游标
    - pattern-匹配的模式
    - count-指定从数据集里返回多少元素，默认值为 10

  - ```java
    public void delBigList(String host, int port, String password, String biglistKey) {
        Jedis jedis = new Jedis(host, port);
        if(password != null && !"".equals(password)) {
        	jedis.auth(password);
        }
        long llen = jedis.llen(bigListkey);
        int counter = 0;
        int left = 100;
        while(counter<llen){
            //每次从左侧截每100个
            jedis.ltrim(bigListKey, left, llen);
            counter += left;
            //最终删除key
            jedis.del(bigListkey);
        }
    }
    ```

  - 

- list:使用`ltrim`渐进式逐步删除，知道全部删除完成

  - `LTRIM KEY_NAME START STOP`:删除START——STOP之外的元素

  - ```java
    public void delBiglist(String host, int port, String password, String biglistKey) {
        Jedis jedis = new Jedis(host, port);
        if(password != null && !"".equals(password)) {
            jedis.auth(password);
            long llen = jedis.llen(bigListKey);
        }
        int counter =0;
        int left = 100;
        while(counter<llen) {
            //每次从左侧截每100个
            jedis.ltrim(bigListKey, left, llen);
            counter += left;
        }
        //最终删除key
        jedis.del(bigListKey);
    }
    ```

- set:使用`sscan`每次获取部分元素，再使用`srem`删除每个元素

  - ```java
    public void delBigSet(String host, int port, String password, String bigsetkey){
        Jedis jedis = new Jedis(host, port);
        if(password != null &&!"".equals(password)) {
        	jedis.auth(password);
        }
        ScanParams scanParams =new ScanParams().count(100);
        String cursor = “0”;
        do {
            ScanResult<String>scanResult = jedis.sscan(bigSetKey,cursor, scanParams);
            List<String>memberList=scanResult.getResult();
            if(memberList != null && !memberList.isEmpty()){
            	for(String member :memberList) {
            		jedis.srem(bigSetKey,member);
                }
            }
            cursor =scanResult.getStringCursor();
        } while(!"0".equals(cursor));
            
        //删除bigkey
        jedis.del(bigSetKey);
    }
    ```

- zset:使用`zscan`每次获取部分元素，再使用`zremrangebyrank`删除每个元素

  - ```java
    public void delBigZset(String host, int port, String password, String bigZsetKey) {
        Jedis jedis = new Jedis(host, port);
        if(password != null &&!"".equals(password)){
        	jedis.auth(password);
        }
        ScanParams scanParams =new ScanParams().count(100);
        String cursor =“0”;
        do {
            ScanResult<Tuple>scanResult = jedis.zscan(bigZsetKey, cursor, scanParams);
            List<Tuple>tupleList=scanResult.getResult();
            if(tupleList != null && !tupleList.isEmpty()){
            	for (Tuple tuple :tupleList){
            		jedis.zrem(bigZsetKey,tuple.getElement());
                }
            }
            cursor =scanResult.getStringCursor();
        } while(!"0".equals(cursor));
        //删除bigkey
        jedis.del(bigZsetkey);
    }
    ```

**生产调优**

在Redis配置文件中配置LAZY FREEING

```conf
lazy-free-lazy-server-del yes
replica-lazy-flush yes
lazyfree-lazy-user-del yes
```



## 缓存双写一致性更新策略

详见实战篇

### 先更新数据库后删除缓存

- 尝试使用双检加锁机制lock住MySQL，只让一个请求线程回写Redis，完成数据一致性。
- 当MySQL有记录改动时，若想立刻同步反应到Redis，可以使用Canal 、 Flink CDC这样的框架。
- 可以把要删除的缓存值或是要更新的数据库值暂存到消息队列中，当程序没有成功地删除缓存或更新数据库时，可以从消息队列中重新读取这些值，然后再次进行删除或更新。
- 如果业务层要求必须读取一致性的数据，那就需要在更新数据库时，先在Redis缓存客户端暂停并发读请求，等数据库更新完、缓存值删除后，再读取数据，从而保证数据一致性，这是理论可以达到的效果，但实际不推荐，真实生产环境中，分布式下很难做到实时一致性，一般都是最终一致性。

### 延时双删

- 先删除缓存，预估其它业务的等待时间，休眠对应的时间后再次删除缓存。其它线程读取数据时发现缓存缺失，就会从数据库中读取最新的值了。
- 若想回避延时带来的吞吐量降低，可以将第二次删除改成异步操作。

## HyperLogLog

为什么只占用12KB？

每个 HyperLogLog 实例将输入的哈希值分布到 **16384 个寄存器**（也称为桶或槽）中，每个寄存器存储某个哈希值的 "前导零" 的最大长度。由于 Redis 采用 6 位来存储每个寄存器的最大前导零长度，因此 **16384 个寄存器** 需要：

```txt
16384 (寄存器数) × 6 (每个寄存器占用的位) / 8 (每字节位数) = 12288 字节 = 12 KB
```

---

案例：亿级UV的Redis统计方案

```java
@Service
@Slf4j
public class HyperLogLogService
{
    @Resource
    private RedisTemplate redisTemplate;

    /**
     * 模拟后台有用户点击首页，每个用户来自不同ip地址
     */
    @PostConstruct
    public void init()
    {
        log.info("------模拟后台有用户点击首页，每个用户来自不同ip地址");
        new Thread(() -> {
            String ip = null;
            for (int i = 1; i <=200; i++) {
                Random r = new Random();
                ip = r.nextInt(256) + "." + r.nextInt(256) + "." + r.nextInt(256) + "." + r.nextInt(256);

                Long hll = redisTemplate.opsForHyperLogLog().add("hll", ip);
                log.info("ip={},该ip地址访问首页的次数={}",ip,hll);
                //暂停几秒钟线程
                try { TimeUnit.SECONDS.sleep(3); } catch (InterruptedException e) { e.printStackTrace(); }
            }
        },"t1").start();
    }

}
```

```java
@RestController
@Slf4j
public class HyperLogLogController
{
    @Resource
    private RedisTemplate redisTemplate;

    @GetMapping(value = "/uv")
    public long uv()
    {
        //pfcount
        return redisTemplate.opsForHyperLogLog().size("hll");
    }

}
```

## GEO

案例代码

```java
@Service
@Slf4j
public class GeoService
{
    public static final String CITY ="city";

    @Autowired
    private RedisTemplate redisTemplate;

    public String geoAdd()
    {
        Map<String, Point> map= new HashMap<>();
        map.put("天安门",new Point(116.403963,39.915119));
        map.put("故宫",new Point(116.403414 ,39.924091));
        map.put("长城" ,new Point(116.024067,40.362639));

        redisTemplate.opsForGeo().add(CITY,map);

        return map.toString();
    }

    public Point position(String member) {
        //获取经纬度坐标
        List<Point> list= this.redisTemplate.opsForGeo().position(CITY,member);
        return list.get(0);
    }


    public String hash(String member) {
        //geohash算法生成的base32编码值
        List<String> list= this.redisTemplate.opsForGeo().hash(CITY,member);
        return list.get(0);
    }


    public Distance distance(String member1, String member2) {
        //获取两个给定位置之间的距离
        Distance distance= this.redisTemplate.opsForGeo().distance(CITY,member1,member2, RedisGeoCommands.DistanceUnit.KILOMETERS);
        return distance;
    }

    public GeoResults radiusByxy() {
        //通过经度，纬度查找附近的,北京王府井位置116.418017,39.914402
        Circle circle = new Circle(116.418017, 39.914402, Metrics.KILOMETERS.getMultiplier());
        //返回50条
        RedisGeoCommands.GeoRadiusCommandArgs args = RedisGeoCommands.GeoRadiusCommandArgs.newGeoRadiusArgs().includeDistance().includeCoordinates().sortAscending().limit(50);
        GeoResults<RedisGeoCommands.GeoLocation<String>> geoResults= this.redisTemplate.opsForGeo().radius(CITY,circle, args);
        return geoResults;
    }

    public GeoResults radiusByMember() {
        //通过地方查找附近
        String member="天安门";
        //返回50条
        RedisGeoCommands.GeoRadiusCommandArgs args = RedisGeoCommands.GeoRadiusCommandArgs.newGeoRadiusArgs().includeDistance().includeCoordinates().sortAscending().limit(50);
        //半径10公里内
        Distance distance=new Distance(10, Metrics.KILOMETERS);
        GeoResults<RedisGeoCommands.GeoLocation<String>> geoResults= this.redisTemplate.opsForGeo().radius(CITY,member, distance,args);
        return geoResults;
    }
}
```

```java
@Api(tags = "美团地图位置附近的酒店推送GEO")
@RestController
@Slf4j
public class GeoController
{
    @Resource
    private GeoService geoService;

    @ApiOperation("添加坐标geoadd")
    @RequestMapping(value = "/geoadd",method = RequestMethod.GET)
    public String geoAdd()
    {
        return geoService.geoAdd();
    }

    @ApiOperation("获取经纬度坐标geopos")
    @RequestMapping(value = "/geopos",method = RequestMethod.GET)
    public Point position(String member)
    {
        return geoService.position(member);
    }

    @ApiOperation("获取经纬度生成的base32编码值geohash")
    @RequestMapping(value = "/geohash",method = RequestMethod.GET)
    public String hash(String member)
    {
        return geoService.hash(member);
    }

    @ApiOperation("获取两个给定位置之间的距离")
    @RequestMapping(value = "/geodist",method = RequestMethod.GET)
    public Distance distance(String member1, String member2)
    {
        return geoService.distance(member1,member2);
    }

    @ApiOperation("通过经度纬度查找北京王府井附近的")
    @RequestMapping(value = "/georadius",method = RequestMethod.GET)
    public GeoResults radiusByxy()
    {
        return geoService.radiusByxy();
    }

    @ApiOperation("通过地方查找附近,本例写死天安门作为地址")
    @RequestMapping(value = "/georadiusByMember",method = RequestMethod.GET)
    public GeoResults radiusByMember()
    {
        return geoService.radiusByMember();
    }

}
```

## 布隆过滤器

布隆过滤器(Bloom Filter) 是一种专门用来解决去重问题的高级数据结构。

实质就是一个大型位数组和几个不同的无偏hash函数(无偏表示分布均匀)。由一个初值都为零的bit数组和多个哈希函数构成，用来快速判断某个数据是否存在。但是跟 HyperLogLog 一样，它也一样有那么一点点不精确，也存在一定的误判概率

**特点**

- 不能删除元素：标准布隆过滤器不支持删除操作，因为删除操作可能会影响其他元素的查询结果。
- 判定元素是否存在时：存在代表大概率存在；不存在代表一定不存在。

**原理**

- 添加key时：使用多个hash函数对key进行hash运算得到一个整数索引值，对位数组长度进行取模运算得到一个位置，每个hash函数都会得到一个不同的位置，将这几个位置都置1就完成了add操作。
- 查询key时：只要有其中一位是零就表示这个key不存在，但如果都是1，则不一定存在对应的key。

**案例**

```java
@Component
@Slf4j
public class BloomFilterInit
{
    @Resource
    private RedisTemplate redisTemplate;

    @PostConstruct//初始化白名单数据，故意差异化数据演示效果......
    public void init()
    {
        //白名单客户预加载到布隆过滤器
        String uid = "customer:12";
        //1 计算hashcode，由于可能有负数，直接取绝对值
        int hashValue = Math.abs(uid.hashCode());
        //2 通过hashValue和2的32次方取余后，获得对应的下标坑位
        long index = (long) (hashValue % Math.pow(2, 32));
        log.info(uid+" 对应------坑位index:{}",index);
        //3 设置redis里面bitmap对应坑位，该有值设置为1
        redisTemplate.opsForValue().setBit("whitelistCustomer",index,true);
    }
}
```

```java
@Component
@Slf4j
public class CheckUtils
{
    @Resource
    private RedisTemplate redisTemplate;

    public boolean checkWithBloomFilter(String checkItem,String key)
    {
        int hashValue = Math.abs(key.hashCode());
        long index = (long) (hashValue % Math.pow(2, 32));
        boolean existOK = redisTemplate.opsForValue().getBit(checkItem, index);
        log.info("----->key:"+key+"\t对应坑位index:"+index+"\t是否存在:"+existOK);
        return existOK;
    }
}
```

```java
@Service
@Slf4j
public class CustomerSerivce
{
    public static final String CACHE_KEY_CUSTOMER = "customer:";

    @Resource
    private CustomerMapper customerMapper;
    @Resource
    private RedisTemplate redisTemplate;

    @Resource
    private CheckUtils checkUtils;

    public void addCustomer(Customer customer){
        int i = customerMapper.insertSelective(customer);

        if(i > 0)
        {
            //到数据库里面，重新捞出新数据出来，做缓存
            customer=customerMapper.selectByPrimaryKey(customer.getId());
            //缓存key
            String key=CACHE_KEY_CUSTOMER+customer.getId();
            //往mysql里面插入成功随后再从mysql查询出来，再插入redis
            redisTemplate.opsForValue().set(key,customer);
        }
    }

    public Customer findCustomerById(Integer customerId){
        Customer customer = null;

        //缓存key的名称
        String key=CACHE_KEY_CUSTOMER+customerId;

        //1 查询redis
        customer = (Customer) redisTemplate.opsForValue().get(key);

        //redis无，进一步查询mysql
        if(customer==null)
        {
            //2 从mysql查出来customer
            customer=customerMapper.selectByPrimaryKey(customerId);
            // mysql有，redis无
            if (customer != null) {
                //3 把mysql捞到的数据写入redis，方便下次查询能redis命中。
                redisTemplate.opsForValue().set(key,customer);
            }
        }
        return customer;
    }

    /**
     * BloomFilter → redis → mysql
     * 白名单：whitelistCustomer
     * @param customerId
     * @return
     */

    @Resource
    private CheckUtils checkUtils;
    public Customer findCustomerByIdWithBloomFilter (Integer customerId)
    {
        Customer customer = null;

        //缓存key的名称
        String key = CACHE_KEY_CUSTOMER + customerId;

        //布隆过滤器check，无是绝对无，有是可能有
        //===============================================
        if(!checkUtils.checkWithBloomFilter("whitelistCustomer",key))
        {
            log.info("白名单无此顾客信息:{}",key);
            return null;
        }
        //===============================================

        //1 查询redis
        customer = (Customer) redisTemplate.opsForValue().get(key);
        //redis无，进一步查询mysql
        if (customer == null) {
            //2 从mysql查出来customer
            customer = customerMapper.selectByPrimaryKey(customerId);
            // mysql有，redis无
            if (customer != null) {
                //3 把mysql捞到的数据写入redis，方便下次查询能redis命中。
                redisTemplate.opsForValue().set(key, customer);
            }
        }
        return customer;
    }
}
```

```java
@Api(tags = "客户Customer接口+布隆过滤器讲解")
@RestController
@Slf4j
public class CustomerController
{
    @Resource private CustomerSerivce customerSerivce;

    @ApiOperation("数据库初始化2条Customer数据")
    @RequestMapping(value = "/customer/add", method = RequestMethod.POST)
    public void addCustomer() {
        for (int i = 0; i < 2; i++) {
            Customer customer = new Customer();

            customer.setCname("customer"+i);
            customer.setAge(new Random().nextInt(30)+1);
            customer.setPhone("1381111xxxx");
            customer.setSex((byte) new Random().nextInt(2));
            customer.setBirth(Date.from(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant()));

            customerSerivce.addCustomer(customer);
        }
    }

    @ApiOperation("单个用户查询，按customerid查用户信息")
    @RequestMapping(value = "/customer/{id}", method = RequestMethod.GET)
    public Customer findCustomerById(@PathVariable int id) {
        return customerSerivce.findCustomerById(id);
    }

    @ApiOperation("BloomFilter案例讲解")
    @RequestMapping(value = "/customerbloomfilter/{id}", method = RequestMethod.GET)
    public Customer findCustomerByIdWithBloomFilter(@PathVariable int id) throws ExecutionException, InterruptedException
    {
        return customerSerivce.findCustomerByIdWithBloomFilter(id);
    }
}
```

**布谷鸟过滤器**

能够解决布隆过滤器不能删除元素的问题，但成熟度和使用率不如布隆过滤器

## 缓存预热、穿透、击穿、雪崩

### 缓存预热

对于热点key，事先在`@postconstrct`中初始化白名单数据

### 缓存雪崩

缓存雪崩是指在分布式系统中，当大量缓存同时过期或失效，导致大量请求直接访问后端数据库，从而引发数据库负载骤增，可能造成系统崩溃的现象。

**预防/解决**

1. 将key设置为永不过期、随机的过期时间
2. 缓存集群实现高可用
   - 主从+哨兵
   - Redis Cluster
   - 开启AOF、RDB，尽快恢复缓存集群
3. 双重缓存
   - ehcache本地缓存
   - Redis缓存
4. 服务限流、降级
   - Hystrix
   - Sentinel
5. 购买Redis云数据库

### 缓存穿透

定义：查询的数据不存在于Redis，也不存在于MySQL，频繁的此类查询会导致数据库压力过大而宕机。

**解决方案**

1. 缓存空对象
2. Google的布隆过滤器Guava

```mermaid
flowchart LR
前台[前台]
布隆过滤器[布隆过滤器]
前台 -->|1-非法请求| 布隆过滤器
布隆过滤器 -->|2-过滤99%| 前台
布隆过滤器 -->|2-过滤器误判，漏掉1%非法请求| 缓存 -->|3-缓存查询失败，互斥查询DB| 数据库 -->|4-DB查询失败，返回NULL| 缓存 -->|5-返回查询失败，并向缓存中缓存一个过期时间短的NULL| 前台
```



### 缓存击穿

定义：大量的请求同时查询某个key，此时这个key突然失效，导致大量请求打到数据库上。

解决方案

1. 热点key不设置过期时间
2. 采用双检加锁互斥更新
3. 逻辑过期异步更新数据

## 分布式锁

**特性**

- 独占性：任何时刻只能有一个线程持有
- 高可用：集群环境下，不能因为某个节点宕机而出现获取锁/释放锁失败的情况
- 防死锁：有超时控制机制或撤销操作，有一个兜底的跳出方案
- 不乱抢：自己的锁只能自己释放，A线程不能 unlock B线程的锁
- 重入性：同一个节点的同一个线程获得锁之后，能够再次获取这个锁

**自定义实现**

```JAVA
@Component
public class DistributedLockFactory
{
    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    private String lockName;
    private String uuidValue;

    public DistributedLockFactory()
    {
        this.uuidValue = IdUtil.simpleUUID();//UUID
    }

    public Lock getDistributedLock(String lockType)
    {
        if(lockType == null) return null;

        if(lockType.equalsIgnoreCase("REDIS")){
            lockName = "zzyyRedisLock";
            return new RedisDistributedLock(stringRedisTemplate,lockName,uuidValue);
        } else if(lockType.equalsIgnoreCase("ZOOKEEPER")){
            //TODO zookeeper版本的分布式锁实现
            return new ZookeeperDistributedLock();
        } else if(lockType.equalsIgnoreCase("MYSQL")){
            //TODO mysql版本的分布式锁实现
            return null;
        }
        return null;
    }
}
```

```JAVA
public class RedisDistributedLock implements java.util.concurrent.locks.Lock {
    private final StringRedisTemplate stringRedisTemplate;
    private final String lockName; // KEYS[1]
    private final String uuidValue; // ARGV[1]
    private long expireTime; // ARGV[2] in seconds

    private ScheduledExecutorService scheduler;

    public RedisDistributedLock(StringRedisTemplate stringRedisTemplate, String lockName, String uuidValue) {
        this.stringRedisTemplate = stringRedisTemplate;
        this.lockName = lockName;
        this.uuidValue = uuidValue + ":" + Thread.currentThread().getId();
        this.expireTime = 30L;
        this.scheduler = new ScheduledThreadPoolExecutor(1);
    }

    @Override
    public void lock() {
        tryLock(-1L, TimeUnit.SECONDS);
    }

    @Override
    public boolean tryLock() {
        try {
            return tryLock(-1L, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    @Override
    public boolean tryLock(long time, TimeUnit unit) throws InterruptedException {
        if (time != -1L) {
            this.expireTime = unit.toSeconds(time);
        }

        String script =
                "if redis.call('exists', KEYS[1]) == 0 or redis.call('hexists', KEYS[1], ARGV[1]) == 1 then " +
                        "redis.call('hincrby', KEYS[1], ARGV[1], 1) " +
                        "redis.call('expire', KEYS[1], ARGV[2]) " +
                        "return 1 " +
                        "else " +
                        "return 0 " +
                        "end";

        while (!stringRedisTemplate.execute(new DefaultRedisScript<>(script, Boolean.class), Arrays.asList(lockName), uuidValue, String.valueOf(expireTime))) {
            TimeUnit.MILLISECONDS.sleep(50);
        }
        renewExpire();
        return true;
    }

    @Override
    public void unlock() {
        String script =
                "if redis.call('hexists', KEYS[1], ARGV[1]) == 0 then " +
                        "return nil " +
                        "elseif redis.call('hincrby', KEYS[1], ARGV[1], -1) == 0 then " +
                        "return redis.call('del', KEYS[1]) " +
                        "else " +
                        "return 0 " +
                        "end";

        Long flag = stringRedisTemplate.execute(new DefaultRedisScript<>(script, Long.class), Arrays.asList(lockName), uuidValue, String.valueOf(expireTime));
        if (flag == null) {
            throw new RuntimeException("This lock doesn't EXIST");
        }
        if (scheduler != null) {
            scheduler.shutdownNow();
        }
    }

    private void renewExpire() {
        String script =
                "if redis.call('hexists', KEYS[1], ARGV[1]) == 1 then " +
                        "return redis.call('expire', KEYS[1], ARGV[2]) " +
                        "else " +
                        "return 0 " +
                        "end";

        scheduler.scheduleAtFixedRate(() -> {
            if (stringRedisTemplate.execute(new DefaultRedisScript<>(script, Boolean.class), Arrays.asList(lockName), uuidValue, String.valueOf(expireTime))) {
                renewExpire();
            }
        }, (this.expireTime * 1000) / 3, (this.expireTime * 1000) / 3, TimeUnit.MILLISECONDS);
    }

    @Override
    public void lockInterruptibly() throws InterruptedException {
        try {
            if (!tryLock(-1L, TimeUnit.SECONDS)) {
                throw new InterruptedException();
            }
        } catch (InterruptedException e) {
            throw e;
        }
    }

    @Override
    public Condition newCondition() {
        throw new UnsupportedOperationException("Distributed locks do not support conditions");
    }
}
```

```JAVA
@Service
@Slf4j
public class InventoryService
{
    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    @Value("${server.port}")
    private String port;
    @Autowired
    private DistributedLockFactory distributedLockFactory;

    public String sale()
    {
        String retMessage = "";
        Lock redisLock = distributedLockFactory.getDistributedLock("redis");
        redisLock.lock();
        try
        {
            //1 查询库存信息
            String result = stringRedisTemplate.opsForValue().get("inventory001");
            //2 判断库存是否足够
            Integer inventoryNumber = result == null ? 0 : Integer.parseInt(result);
            //3 扣减库存
            if(inventoryNumber > 0) {
                stringRedisTemplate.opsForValue().set("inventory001",String.valueOf(--inventoryNumber));
                retMessage = "成功卖出一个商品，库存剩余: "+inventoryNumber;
                System.out.println(retMessage);
                //暂停几秒钟线程,为了测试自动续期
                try { TimeUnit.SECONDS.sleep(120); } catch (InterruptedException e) { e.printStackTrace(); }
            }else{
                retMessage = "商品卖完了，o(╥﹏╥)o";
            }
        }catch (Exception e){
            e.printStackTrace();
        }finally {
            redisLock.unlock();
        }
        return retMessage+"\t"+"服务端口号："+port;
    }


    private void testReEnter()
    {
        Lock redisLock = distributedLockFactory.getDistributedLock("redis");
        redisLock.lock();
        try
        {
            System.out.println("################测试可重入锁####################################");
        }finally {
            redisLock.unlock();
        }
    }
}
```

### 红锁

**产生背景**

```mermaid
flowchart LR
!ERROR! -->|3:突然master宕机| Master
客户端A -->|1:set分布式锁并成功获得锁| Master
Master -->|2:异步机制把锁同步| Slave
Slave -->|4:主从切换后从机升级为主机| Master
客户端B -->|5:客户获得锁成功| Slave
```

1. 客户A通过Redis的set命令成功建立分布式锁并持有锁
2. 正常情况下主从机都有分布式锁
3. 突然出现故障，但Master还没来得及同步数据给Slave，此时Slave机器上没有对应的锁信息
4. 从机Slave上位，变成新的Master主机
5. 客户B建锁成功，此时出现了：两个线程获取到了锁，可能会导致各种意外情况发生，例如脏读

> CAP定理的CP遭到了破坏，并且Redis无论单机、主从、哨兵均有此风险

Redlock算法，用来实现**基于多个实例的**分布式锁。

锁变量由多个实例维护，即使有实例发生了故障，锁变量仍然是存在的，客户端还是可以完成锁操作。

该方案基于（set 加锁、Lua 脚本解锁）进行改良，大致方案如下：

假设我们有N个Redis主节点，例如 N = 5，这些节点是完全独立的，不使用复制或任何其他隐式协调系统，为了取到锁，客户端执行以下操作：

1. 获取当前时间，以毫秒为单位
2. 依次尝试从5个实例，使用相同的 key 和随机值（例如 UUID）获取锁。当向Redis 请求获取锁时，客户端应该设置一个超时时间，这个超时时间应该小于锁的失效时间。例如你的锁自动失效时间为 10 秒，则超时时间应该在 5-50 毫秒之间。这样可以防止客户端在试图与一个宕机的 Redis 节点对话时长时间处于阻塞状态。如果一个实例不可用，客户端应该尽快尝试去另外一个 Redis 实例请求获取锁；
3. 客户端通过当前时间减去步骤 1 记录的时间来计算获取锁使用的时间。当且仅当从大多数（N/2+1，这里是 3 个节点）的 Redis 节点都取到锁，并且获取锁使用的时间小于锁失效时间时，锁才算获取成功；
4. 如果取到了锁，其真正有效时间等于初始有效时间减去获取锁所使用的时间（步骤 3 计算的结果）。
5. 如果由于某些原因未能获得锁（无法在至少 N/2 + 1 个 Redis 实例获取锁、或获取锁的时间超过了有效时间），客户端应该在所有的 Redis 实例上进行解锁（即便某些Redis实例根本就没有加锁成功，防止某些节点获取到锁但是客户端没有得到响应而导致接下来的一段时间不能被重新获取锁）。

> 该方案为了解决数据不一致的问题，直接舍弃了异步复制只使用 master 节点，同时由于舍弃了slave，为了保证可用性，引入了N个节点，官方建议是 5

**watch_dog自动延期机制**

客户端A加锁成功，就会启动一个watch dog看门狗，他是一个后台线程，会每隔10秒检查一下，如果客户端A还持有锁key，那么就会不断的延长锁key的生存时间，默认每次续命又从30秒新开始

### Redission

**快速上手**

```xml
<dependency>
    <groupId>org.redisson</groupId>
    <artifactId>redisson</artifactId>
    <version>3.13.4</version>
</dependency>
```

```java
@Configuration
public class RedisConfig
{
    @Bean
    public RedisTemplate<String, Object> redisTemplate(LettuceConnectionFactory lettuceConnectionFactory)
    {
        RedisTemplate<String,Object> redisTemplate = new RedisTemplate<>();
        redisTemplate.setConnectionFactory(lettuceConnectionFactory);
        //设置key序列化方式string
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        //设置value的序列化方式json
        redisTemplate.setValueSerializer(new GenericJackson2JsonRedisSerializer());

        redisTemplate.setHashKeySerializer(new StringRedisSerializer());
        redisTemplate.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());

        redisTemplate.afterPropertiesSet();

        return redisTemplate;
    }

    //单Redis节点模式
    @Bean
    public Redisson redisson()
    {
        Config config = new Config();
        config.useSingleServer().setAddress("redis://192.168.111.175:6379").setDatabase(0).setPassword("111111");
        return (Redisson) Redisson.create(config);
    }
}
```

```java
@RestController
@Api(tags = "redis分布式锁测试")
public class InventoryController
{
    @Autowired
    private InventoryService inventoryService;

    @ApiOperation("扣减库存，一次卖一个")
    @GetMapping(value = "/inventory/sale")
    public String sale()
    {
        return inventoryService.sale();
    }

    @ApiOperation("扣减库存saleByRedisson，一次卖一个")
    @GetMapping(value = "/inventory/saleByRedisson")
    public String saleByRedisson()
    {
        return inventoryService.saleByRedisson();
    }
}
```

```java
@Service
@Slf4j
public class InventoryService
{
    @Autowired
    private StringRedisTemplate stringRedisTemplate;
    @Value("${server.port}")
    private String port;
    @Autowired
    private DistributedLockFactory distributedLockFactory;

    @Autowired
    private Redisson redisson;
    public String saleByRedisson()
    {
        String retMessage = "";
        String key = "zzyyRedisLock";
        RLock redissonLock = redisson.getLock(key);
        redissonLock.lock();
        try
        {
            //1 查询库存信息
            String result = stringRedisTemplate.opsForValue().get("inventory001");
            //2 判断库存是否足够
            Integer inventoryNumber = result == null ? 0 : Integer.parseInt(result);
            //3 扣减库存
            if(inventoryNumber > 0) {
                stringRedisTemplate.opsForValue().set("inventory001",String.valueOf(--inventoryNumber));
                retMessage = "成功卖出一个商品，库存剩余: "+inventoryNumber;
                System.out.println(retMessage);
            }else{
                retMessage = "商品卖完了，o(╥﹏╥)o";
            }
        }finally {
            if(redissonLock.isLocked() && redissonLock.isHeldByCurrentThread())
            {
                redissonLock.unlock();
            }
        }
        return retMessage+"\t"+"服务端口号："+port;
    }
}
```

**多机案例**

```properties
spring.redis.database=0
spring.redis.password=
spring.redis.timeout=3000
spring.redis.mode=single

spring.redis.pool.conn-timeout=3000
spring.redis.pool.so-timeout=3000
spring.redis.pool.size=10

spring.redis.single.address1=192.168.111.185:6381
spring.redis.single.address2=192.168.111.185:6382
spring.redis.single.address3=192.168.111.185:6383
```

```java
@Configuration
@EnableConfigurationProperties(RedisProperties.class)
public class CacheConfiguration {

    @Autowired
    RedisProperties redisProperties;

    @Bean
    RedissonClient redissonClient1() {
        Config config = new Config();
        String node = redisProperties.getSingle().getAddress1();
        node = node.startsWith("redis://") ? node : "redis://" + node;
        SingleServerConfig serverConfig = config.useSingleServer()
                .setAddress(node)
                .setTimeout(redisProperties.getPool().getConnTimeout())
                .setConnectionPoolSize(redisProperties.getPool().getSize())
                .setConnectionMinimumIdleSize(redisProperties.getPool().getMinIdle());
        if (StringUtils.isNotBlank(redisProperties.getPassword())) {
            serverConfig.setPassword(redisProperties.getPassword());
        }
        return Redisson.create(config);
    }

    @Bean
    RedissonClient redissonClient2() {
        Config config = new Config();
        String node = redisProperties.getSingle().getAddress2();
        node = node.startsWith("redis://") ? node : "redis://" + node;
        SingleServerConfig serverConfig = config.useSingleServer()
                .setAddress(node)
                .setTimeout(redisProperties.getPool().getConnTimeout())
                .setConnectionPoolSize(redisProperties.getPool().getSize())
                .setConnectionMinimumIdleSize(redisProperties.getPool().getMinIdle());
        if (StringUtils.isNotBlank(redisProperties.getPassword())) {
            serverConfig.setPassword(redisProperties.getPassword());
        }
        return Redisson.create(config);
    }

    @Bean
    RedissonClient redissonClient3() {
        Config config = new Config();
        String node = redisProperties.getSingle().getAddress3();
        node = node.startsWith("redis://") ? node : "redis://" + node;
        SingleServerConfig serverConfig = config.useSingleServer()
                .setAddress(node)
                .setTimeout(redisProperties.getPool().getConnTimeout())
                .setConnectionPoolSize(redisProperties.getPool().getSize())
                .setConnectionMinimumIdleSize(redisProperties.getPool().getMinIdle());
        if (StringUtils.isNotBlank(redisProperties.getPassword())) {
            serverConfig.setPassword(redisProperties.getPassword());
        }
        return Redisson.create(config);
    }


    /**
     * 单机
     */
    /*@Bean
    public Redisson redisson()
    {
        Config config = new Config();

        config.useSingleServer().setAddress("redis://192.168.111.147:6379").setDatabase(0);

        return (Redisson) Redisson.create(config);
    }*/

}
```

```java
@Data
public class RedisPoolProperties {

    private int maxIdle;

    private int minIdle;

    private int maxActive;

    private int maxWait;

    private int connTimeout;

    private int soTimeout;

    /**
     * 池大小
     */
    private  int size;

}
```

```java
@ConfigurationProperties(prefix = "spring.redis", ignoreUnknownFields = false)
@Data
public class RedisProperties {

    private int database;

    /**
     * 等待节点回复命令的时间。该时间从命令发送成功时开始计时
     */
    private int timeout;

    private String password;

    private String mode;

    /**
     * 池配置
     */
    private RedisPoolProperties pool;

    /**
     * 单机信息配置
     */
    private RedisSingleProperties single;
}
```

```java
@Data
public class RedisSingleProperties {
    private  String address1;
    private  String address2;
    private  String address3;
}
```

```java
@RestController
@Slf4j
public class RedLockController {

    public static final String CACHE_KEY_REDLOCK = "ATGUIGU_REDLOCK";

    @Autowired
    RedissonClient redissonClient1;

    @Autowired
    RedissonClient redissonClient2;

    @Autowired
    RedissonClient redissonClient3;

    boolean isLockBoolean;

    @GetMapping(value = "/multiLock")
    public String getMultiLock() throws InterruptedException
    {
        String uuid =  IdUtil.simpleUUID();
        String uuidValue = uuid+":"+Thread.currentThread().getId();

        RLock lock1 = redissonClient1.getLock(CACHE_KEY_REDLOCK);
        RLock lock2 = redissonClient2.getLock(CACHE_KEY_REDLOCK);
        RLock lock3 = redissonClient3.getLock(CACHE_KEY_REDLOCK);

        RedissonMultiLock redLock = new RedissonMultiLock(lock1, lock2, lock3);
        redLock.lock();
        try
        {
            System.out.println(uuidValue+"\t"+"---come in biz multiLock");
            try { TimeUnit.SECONDS.sleep(30); } catch (InterruptedException e) { e.printStackTrace(); }
            System.out.println(uuidValue+"\t"+"---task is over multiLock");
        } catch (Exception e) {
            e.printStackTrace();
            log.error("multiLock exception ",e);
        } finally {
            redLock.unlock();
            log.info("释放分布式锁成功key:{}", CACHE_KEY_REDLOCK);
        }

        return "multiLock task is over  "+uuidValue;
    }

}
```

## 缓存过期淘汰策略

