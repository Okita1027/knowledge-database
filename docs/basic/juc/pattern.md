---
title: 模式篇
shortTitle: 模式篇
description: 模式篇
date: 2023-12-19 13:35:01
categories: [Java]
tags: [JUC]
headerDepth: 4
order: 2
---

## 同步模式之保护性暂停

### 概念
保护性暂停（Guarded Suspension）是一种用于线程间通信的同步模式（因为要等待另一方的结果，因此归类到同步模式），它用于在一个线程等待另一个线程满足特定条件后再继续执行。JDK 中，join 的实现、Future 的实现，采用的就是此模式。 
保护性暂停的核心思想是，在条件未满足时，等待线程进入等待状态，直到条件满足后被唤醒。这种模式可以避免线程忙等待的情况，提高了系统的效率。
以下是保护性暂停的基本流程：

1.  等待方（Waiting Side）： 
   - 等待方线程通过获取共享对象的锁来确保同步。
   - 在一个循环中检查条件是否满足，如果条件不满足，则调用对象的等待方法（如wait()）进入等待状态，同时释放锁。
   - 等待方线程在被其他线程唤醒后，会再次检查条件是否满足。如果条件满足，它会执行相应的操作；如果条件不满足，它会继续等待。
2.  唤醒方（Waking Side）：
   - 唤醒方线程通过获取共享对象的锁来确保同步。
   - 根据条件的变化，执行相应操作后，调用对象的唤醒方法（如notify()或notifyAll()）唤醒等待方线程。
   - 唤醒方线程完成操作后，释放锁。

保护性暂停模式的典型应用场景是生产者-消费者模型，其中消费者线程等待生产者线程生产数据后再进行消费。在这种情况下，消费者线程作为等待方，生产者线程作为唤醒方。

![](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/100.png)

使用保护性暂停模式需要注意以下几点：

- 确保共享对象的状态在条件满足时能够被正确更新，以避免因为状态不一致而导致程序错误。
- 需要考虑并发情况下的线程安全性，使用合适的同步机制（如synchronized）来确保线程安全性。
- 要注意避免死锁和饥饿等问题，合理设计线程的执行顺序和调度策略。

保护性暂停是一种常见的线程间通信模式，能够有效地实现线程协作和同步，提高系统的效率和可靠性。
### 实现

1. 基础版
```java
class GuardedObject {
    private Object response;
    private final Object lock = new Object();
    public Object get() {
        synchronized (lock) {
            // 条件不满足则等待
            while (response == null) {
                try {
                    lock.wait();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            return response;
        }
    }
    public void complete(Object response) {
        synchronized (lock) {
            // 条件满足，通知等待线程
            this.response = response;
            lock.notifyAll();
        }
    }
}
```

2. 超时版
```java
class GuardedObjectV2 {
    private Object response;
    private final Object lock = new Object();
    public Object get(long millis) {
        synchronized (lock) {
            // 1) 记录最初时间
            long begin = System.currentTimeMillis();
            // 2) 已经经历的时间
            long timePassed = 0;
            while (response == null) {
                // 4) 假设 millis 是 1000，结果在 400 时唤醒了，那么还有 600 要等
                long waitTime = millis - timePassed;
                log.debug("waitTime: {}", waitTime);
                if (waitTime <= 0) {
                    log.debug("break...");
                    break;
                }
                try {
                    lock.wait(waitTime);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                // 3) 如果提前被唤醒，这时已经经历的时间假设为 400
                timePassed = System.currentTimeMillis() - begin;
                log.debug("timePassed: {}, object is null {}", 
                          timePassed, response == null);
            }
            return response;
        }
    }
    public void complete(Object response) {
        synchronized (lock) {
            // 条件满足，通知等待线程
            this.response = response;
            log.debug("notify...");
            lock.notifyAll();
        }
    }
}
```

3. 多任务版
```java
class GuardedObject {
    // 标识 Guarded Object
    private int id;
    public GuardedObject(int id) {
        this.id = id;
    }
    public int getId() {
        return id;
    }
    // 结果
    private Object response;
    // 获取结果
    // timeout 表示要等待多久 2000
    public Object get(long timeout) {
        synchronized (this) {
            // 开始时间 15:00:00
            long begin = System.currentTimeMillis();
            // 经历的时间
            long passedTime = 0;
            while (response == null) {
                // 这一轮循环应该等待的时间
                long waitTime = timeout - passedTime;
                // 经历的时间超过了最大等待时间时，退出循环
                if (timeout - passedTime <= 0) {
                    break;
                }
                try {
                    this.wait(waitTime); // 虚假唤醒 15:00:01
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                // 求得经历时间
                passedTime = System.currentTimeMillis() - begin; // 15:00:02 1s
            }
            return response;
        }
    }
    // 产生结果
    public void complete(Object response) {
        synchronized (this) {
            // 给结果成员变量赋值
            this.response = response;
            this.notifyAll();
        }
    }
}
```
```java
class Mailboxes {
    private static Map<Integer, GuardedObject> boxes = new Hashtable<>();
    private static int id = 1;
    // 产生唯一 id
    private static synchronized int generateId() {
        return id++;
    }
    public static GuardedObject getGuardedObject(int id) {
        return boxes.remove(id);
    }
    public static GuardedObject createGuardedObject() {
        GuardedObject go = new GuardedObject(generateId());
        boxes.put(go.getId(), go);
        return go;
    }
    public static Set<Integer> getIds() {
        return boxes.keySet();
    }
}
```
```java
class People extends Thread{
    @Override
    public void run() {
        // 收信
        GuardedObject guardedObject = Mailboxes.createGuardedObject();
        log.debug("开始收信 id:{}", guardedObject.getId());
        Object mail = guardedObject.get(5000);
        log.debug("收到信 id:{}, 内容:{}", guardedObject.getId(), mail);
    }
}
```
```java
class Postman extends Thread {
    private int id;
    private String mail;
    public Postman(int id, String mail) {
        this.id = id;
        this.mail = mail;
    }
    @Override
    public void run() {
        GuardedObject guardedObject = Mailboxes.getGuardedObject(id);
        log.debug("送信 id:{}, 内容:{}", id, mail);
        guardedObject.complete(mail);
    }
}
```
```java
public static void main(String[] args) throws InterruptedException {
    for (int i = 0; i < 3; i++) {
        new People().start();
    }
    Sleeper.sleep(1);
    for (Integer id : Mailboxes.getIds()) {
        new Postman(id, "内容" + id).start();
    }
}
```
## 异步模式之生产者/消费者
### 概念

- 与前面的保护性暂停中的 GuardObject 不同，不需要产生结果和消费结果的线程一一对应 
- 消费队列可以用来平衡生产和消费的线程资源 
- 生产者仅负责产生结果数据，不关心数据该如何处理，而消费者专心处理结果数据 
- 消息队列是有容量限制的，满时不会再加入数据，空时不会再消耗数据 
- JDK 中各种阻塞队列，采用的就是这种模式

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/101.png)
### 實現
```java
class Message {
    private int id;
    private Object message;
    public Message(int id, Object message) {
        this.id = id;
        this.message = message;
    }
    public int getId() {
        return id;
    }
    public Object getMessage() {
        return message;
    }
}

class MessageQueue {
    private LinkedList<Message> queue;
    private int capacity;
    public MessageQueue(int capacity) {
        this.capacity = capacity;
        queue = new LinkedList<>();
    }
    public Message take() {
        synchronized (queue) {
            while (queue.isEmpty()) {
                log.debug("没货了, wait");
                try {
                    queue.wait();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            Message message = queue.removeFirst();
            queue.notifyAll();
            return message;
        }
    }
    public void put(Message message) {
        synchronized (queue) {
            while (queue.size() == capacity) {
                log.debug("库存已达上限, wait");
                try {
                    queue.wait();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            queue.addLast(message);
            queue.notifyAll();
        }
    }
}
```
```java
public static void main(String[] args) {
    MessageQueue messageQueue = new MessageQueue(2);
    // 4 个生产者线程, 下载任务
    for (int i = 0; i < 4; i++) {
        int id = i;
        new Thread(() -> {
            try {
                log.debug("download...");
                List<String> response = Downloader.download();
                log.debug("try put message({})", id);
                messageQueue.put(new Message(id, response));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }, "生产者" + i).start();
    }
    // 1 个消费者线程, 处理结果
    new Thread(() -> {
        while (true) {
            Message message = messageQueue.take();
            List<String> response = (List<String>) message.getMessage();
            log.debug("take message({}): [{}] lines", message.getId(), response.size());
        }
    }, "消费者").start();
}
```
## 同步模式之顺序控制
### 固定運行順序
要求：先打印2，再打印1
#### wait()/notify()
```java
public class FixedRun1 {
    // 用来同步的对象
    static Object obj = new Object();
    // t2 运行标记， 代表 t2 是否执行过
    static boolean t2runed = false;
    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            synchronized (obj) {
                // 如果 t2 没有执行过
                while (!t2runed) { 
                    try {
                        // t1 先等一会
                        obj.wait(); 
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }
            System.out.println(1);
        });
        Thread t2 = new Thread(() -> {
            System.out.println(2);
            synchronized (obj) {
                // 修改运行标记
                t2runed = true;
                // 通知 obj 上等待的线程（可能有多个，因此需要用 notifyAll）
                obj.notifyAll();
            }
        });
        t1.start();
        t2.start();
    }
}
```
#### park()/unPark()
可以看到，实现上很麻烦： 

1. 首先，需要保证先 wait 再 notify，否则 wait 线程永远得不到唤醒。因此使用了『运行标记』来判断该不该 wait 
2. 第二，如果有些干扰线程错误地 notify 了 wait 线程，条件不满足时还要重新等待，使用了 while 循环来解决此问题 
3. 最后，唤醒对象上的 wait 线程需要使用 notifyAll，因为『同步对象』上的等待线程可能不止一个 

可以使用 LockSupport 类的 park 和 unpark 来简化：
```java
public class FixedRun2 {
    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            try { Thread.sleep(1000); } catch (InterruptedException e) { }
            // 当没有『许可』时，当前线程暂停运行；有『许可』时，用掉这个『许可』，当前线程恢复运行
            LockSupport.park();
            System.out.println("1");
        });
        Thread t2 = new Thread(() -> {
            System.out.println("2");
            // 给线程 t1 发放『许可』（多次连续调用 unpark 只会发放一个『许可』）
            LockSupport.unpark(t1);
        });
        t1.start();
        t2.start();
    }
}
```
```java
public class FixedParkUnpark {
    static Thread t1;
    static Thread t2;
    public static void main(String[] args) {

        t1 = new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                System.out.println("1");
                LockSupport.unpark(t2); // 唤醒t2线程
                LockSupport.park(); // 阻塞t1线程
            }
        }, "t1");
        t2 = new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                LockSupport.park(); // 阻塞t2线程
                System.out.println("2");
                LockSupport.unpark(t1); // 唤醒t1线程
            }
        }, "t2");

        t1.start();
        t2.start();
    }
}
```
park 和 unpark 方法比较灵活，他俩谁先调用，谁后调用无所谓。并且是以线程为单位进行『暂停』和『恢复』，不需要『同步对象』和『运行标记』
### 交替輸出
要求：线程 1 输出 a 5 次，线程 2 输出 b 5 次，线程 3 输出 c 5 次。输出 abcabcabcabcabc
#### wait()/notify()
```java
public class AlternateWaitNotify {
    private int flag;
    private int loopNumber;

    public AlternateWaitNotify(int flag, int loopNumber) {
        this.flag = flag;
        this.loopNumber = loopNumber;
    }

    public void print(int waitFlag, int nextFlag, String str) {
        for (int i = 0; i < loopNumber; i++) {
            synchronized (this) {
                while (this.flag != waitFlag) {
                    try {
                        this.wait();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
                System.out.print(str);
                flag = nextFlag;
                this.notifyAll();
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        AlternateWaitNotify syncWaitNotify = new AlternateWaitNotify(1, 5);
        new Thread(() -> {
            syncWaitNotify.print(1, 2, "a");
        }).start();
        new Thread(() -> {
            syncWaitNotify.print(2, 3, "b");
        }).start();
        new Thread(() -> {
            syncWaitNotify.print(3, 1, "c");
        }).start();


        Thread.sleep(1234);
        System.out.println("\n==============");

        Thread t1 = new Thread(() -> {
            // 当没有『许可』时，当前线程暂停运行；有『许可』时，用掉这个『许可』，当前线程恢复运行
            System.out.println("1");
            LockSupport.park();
        });
        Thread t2 = new Thread(() -> {
            System.out.println("2");
            // 给线程 t1 发放『许可』（多次连续调用 unpark 只会发放一个『许可』）
            LockSupport.unpark(t1);
        });
        t1.start();
        t2.start();
    }
}
```
#### Lock條件變量
```java
public class AlternateLock extends ReentrantLock {
    public void start(Condition first) {
        this.lock();
        try {
            System.out.println("start!");
            first.signal();
        } finally {
            this.unlock();
        }
    }
    public void print(String str, Condition current, Condition next) {
        for (int i = 0; i < loopNumber; i++) {
            this.lock();
            try {
                current.await();
                System.out.println(str);
                next.signal();
            } catch (InterruptedException e) {
                e.printStackTrace();
            } finally {
                this.unlock();
            }
        }
    }
    // 循环次数
    private int loopNumber;
    public AlternateLock(int loopNumber) {
        this.loopNumber = loopNumber;
    }

    public static void main(String[] args) {
        AlternateLock as = new AlternateLock(5);
        Condition aWaitSet = as.newCondition();
        Condition bWaitSet = as.newCondition();
        Condition cWaitSet = as.newCondition();
        new Thread(() -> {
            as.print("a", aWaitSet, bWaitSet);
        }).start();
        new Thread(() -> {
            as.print("b", bWaitSet, cWaitSet);
        }).start();
        new Thread(() -> {
            as.print("c", cWaitSet, aWaitSet);
        }).start();
        as.start(aWaitSet);
    }
}
```
> 该实现没有考虑 a，b，c 线程都就绪再开始

#### park()/unPark()
```java
public class AlternateParkUnpark {
    static Thread t1;
    static Thread t2;
    public static void main(String[] args) {

        t1 = new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                System.out.println("1");
                LockSupport.unpark(t2); // 唤醒t2线程
                LockSupport.park(); // 阻塞t1线程
            }
        }, "t1");
        t2 = new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                LockSupport.park(); // 阻塞t2线程
                System.out.println("2");
                LockSupport.unpark(t1); // 唤醒t1线程
            }
        }, "t2");

        t1.start();
        t2.start();
    }
}
```
## 终止模式之两阶段终止
在一个线程 T1 中如何“优雅”终止线程 T2？这里的【优雅】指的是给 T2 一个料理后事的机会。
### 错误思路

- 使用线程对象的 stop() 方法停止线程 
   - stop 方法会真正杀死线程，如果这时线程锁住了共享资源，那么当它被杀死后就再也没有机会释放锁， 其它线程将永远无法获取锁 
- 使用 System.exit(int) 方法停止线程 
   - 目的仅是停止一个线程，但这种做法会让整个程序都停止
### 两阶段终止模式
两阶段终止是一种用于线程或服务终止的模式，它包括两个阶段：首先发送终止请求，然后等待确认终止。这种模式可以保证在终止过程中资源得到正确释放，同时也可以避免在终止过程中产生意外的副作用。
两阶段终止模式的一般实现步骤：

1. 发送终止请求：当需要终止线程或服务时，首先发送一个终止请求，通知线程或服务需要进行终止操作。这个请求可以是一个标志位、消息、方法调用等形式。
2. 等待确认终止：一旦接收到终止请求，线程或服务会开始进行清理工作，并等待确认终止。在这个阶段，线程或服务会完成一些必要的清理工作，例如释放资源、关闭连接、保存状态等。同时，线程或服务还会等待一段时间，确保其他相关操作已经完成并确认终止。

两阶段终止模式的优点在于可以确保资源的正确释放，避免意外的副作用，同时也给予线程或服务一定的时间来完成清理工作。这对于需要进行资源释放或状态保存的情况非常有用，可以保证系统在终止时处于一个良好的状态。

需要注意的是，在实现两阶段终止模式时，需要考虑线程安全性和并发情况下可能出现的竞态条件。同时，对于长时间无法终止的情况，也需要考虑超时处理和异常情况的处理。因此，在使用两阶段终止模式时，需要仔细考虑各种可能出现的情况，并进行合理的处理。

#### isInterrupted

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/102.png)
```java
public class TPTInterrupt {
    private Thread thread;
    public void start(){
        thread = new Thread(() -> {
            while(true) {
                Thread current = Thread.currentThread();
                if(current.isInterrupted()) {
                    System.out.print("料理后事");
                    break;
                }
                try {
                    Thread.sleep(1000);
                    System.out.println("将结果保存");
                } catch (InterruptedException e) {
                    current.interrupt();
                }
                // 执行监控操作
                System.out.println("监视中……");
            }
        },"监控线程");
        thread.start();
    }
    public void stop() {
        thread.interrupt();
    }

    public static void main(String[] args) throws InterruptedException {
        TPTInterrupt t = new TPTInterrupt();
        t.start();
        Thread.sleep(3500);
        System.out.println("stop！");
        t.stop();
    }
}
```
#### volatile
```java
public class TwoPhaseTerminationDemo {
    // 保证该变量在多个线程之间的可见性
    private volatile boolean shutdownRequested = false;
    private final Thread workerThread;

    public TwoPhaseTerminationDemo() {
        this.workerThread = new Thread(() -> {
            while (!shutdownRequested) {
                // 线程执行的逻辑
                try {
                    Thread.sleep(1000);
                    System.out.println("Working...");
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
            // 第二阶段终止：清理工作
            System.out.println("Cleaning up...");
        });
        this.workerThread.start();
    }

    public void requestShutdown() {
        // 第一阶段终止：发送终止请求
        this.shutdownRequested = true;
        this.workerThread.interrupt();	// 此时可能在sleep中，故直接打断
    }

    public static void main(String[] args) throws InterruptedException {
        TwoPhaseTerminationDemo demo = new TwoPhaseTerminationDemo();

        // 模拟程序运行一段时间后需要终止
        Thread.sleep(3000);

        // 发送终止请求
        demo.requestShutdown();

        // 等待线程终止
        demo.workerThread.join();
        System.out.println("Terminated！");
    }
}
```
## 同步模式之 Balking（犹豫）
Balking（犹豫）是一种用于并发编程中的同步模式，它用于在某些条件不满足时，立即退出或放弃当前操作，避免执行无效或重复的操作。
Balking模式通常适用于以下情况：

1. 当前状态不满足执行操作的条件时，需要立即中止操作。
2. 操作只能在特定的状态下执行一次，如果已经执行过，则不再执行。
## 异步模式之工作线程
### 定义
让有限的工作线程（Worker Thread）来轮流异步处理无限多的任务。也可以将其归类为分工模式，它的典型实现就是线程池，也体现了经典设计模式中的享元模式。 

例如，海底捞的服务员（线程），轮流处理每位客人的点餐（任务），如果为每位客人都配一名专属的服务员，那 么成本就太高了（对比另一种多线程设计模式：Thread-Per-Message） 注意，不同任务类型应该使用不同的线程池，这样能够避免饥饿，并能提升效率。
例如，如果一个餐馆的工人既要招呼客人（任务类型A），又要到后厨做菜（任务类型B）显然效率不咋地，分成 服务员（线程池A）与厨师（线程池B）更为合理，当然你能想到更细致的分工。

### 饥饿
固定大小线程池会有饥饿现象 

- 两个工人是同一个线程池中的两个线程 
- 他们要做的事情是：为客人点餐和到后厨做菜，这是两个阶段的工作 
   - 客人点餐：必须先点完餐，等菜做好，上菜，在此期间处理点餐的工人必须等待 
   - 后厨做菜：没啥说的，做就是了 
- 比如工人 A 处理了点餐任务，接下来它要等着 工人 B 把菜做好，然后上菜，他俩也配合的蛮好 
- 但现在同时来了两个客人，这个时候工人 A 和工人B 都去处理点餐了，这时没人做饭了，饥饿
### 合适的线程池数量

- 过小会导致程序不能充分地利用系统资源、容易导致饥饿 
- 过大会导致更多的线程上下文切换，占用更多内存  
#### CPU 密集型运算 
通常采用 **cpu 核数 + 1** 能够实现最优的 CPU 利用率，+1 是保证当线程由于页缺失故障（操作系统）或其它原因 导致暂停时，额外的这个线程就能顶上去，保证 CPU 时钟周期不被浪费 
#### I/O 密集型运算
CPU 不总是处于繁忙状态，例如，当你执行业务计算时，这时候会使用 CPU 资源，但当你执行 I/O 操作时、远程 RPC 调用时，包括进行数据库操作时，这时候 CPU 就闲下来了，你可以利用多线程提高它的利用率。 
经验公式如下
`线程数 = 核数 * 期望 CPU 利用率 * 总时间(CPU计算时间+等待时间) / CPU 计算时间`
例如 4 核 CPU 计算时间是 50% ，其它等待时间是 50%，期望 cpu 被 100% 利用，套用公式 
`4 * 100% * 100% / 50% = 8`
例如 4 核 CPU 计算时间是 10% ，其它等待时间是 90%，期望 cpu 被 100% 利用，套用公式 
`4 * 100% * 100% / 10% = 40`
