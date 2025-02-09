---
title: 基础篇
shortTitle: 基础篇
description: JUC基础篇
date: 2023-12-20 16:06:01
categories: [Java]
tags: [JUC]
headerDepth: 4
order: 1
---

## 线程状态

### 5种（OS层面）
![](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/0.png)

- 【初始状态】仅是在语言层面创建了线程对象，还未与操作系统线程关联 
- 【可运行状态】（就绪状态）指该线程已经被创建（与操作系统线程关联），可以由 CPU 调度执行 
- 【运行状态】指获取了 CPU 时间片运行中的状态 
   - 当 CPU 时间片用完，会从【运行状态】转换至【可运行状态】，会导致线程的上下文切换 
- 【阻塞状态】 
   - 如果调用了阻塞 API，如 BIO 读写文件，这时该线程实际不会用到 CPU，会导致线程上下文切换，进入 【阻塞状态】 
   - 等 BIO 操作完毕，会由操作系统唤醒阻塞的线程，转换至【可运行状态】 
   - 与【可运行状态】的区别是，对【阻塞状态】的线程来说只要它们一直不唤醒，调度器就一直不会考虑调度它们 
- 【终止状态】表示线程已经执行完毕，生命周期已经结束，不会再转换为其它状态
### 6种（Java层面）
根据 Thread.State 枚举，分为六种状态

![](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/1.png)

- NEW 线程刚被创建，但是还没有调用 start() 方法
- RUNNABLE 当调用了 start() 方法之后，注意，Java API 层面的 RUNNABLE 状态涵盖了 操作系统 层面的【可运行状态】、【运行状态】和【阻塞状态】（由于 BIO 导致的线程阻塞，在 Java 里无法区分，仍然认为是可运行）
- BLOCKED ， WAITING ， TIMED_WAITING 都是 Java API 层面对【阻塞状态】的细分
- TERMINATED 当线程代码运行结束

---

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/2.png)
### 线程状态转换
假设有线程 `Thread t`
情况 1 `NEW --> RUNNABLE`

- 当调用 `t.start()` 方法时，由 `NEW --> RUNNABLE`

情况 2 `RUNNABLE <--> WAITING`
t 线程用 `synchronized(obj)` 获取了对象锁后 

- 调用 `obj.wait()` 方法时，t 线程从 `RUNNABLE --> WAITING` 
- 调用 `obj.notify()` ， `obj.notifyAll()` ， `t.interrupt()` 时 
   - 竞争锁成功，t 线程从`WAITING --> RUNNABLE` 
   - 竞争锁失败，t 线程从`WAITING --> BLOCKED`

情况 3 `RUNNABLE <--> WAITING`

- 当前线程调用 `t.join()` 方法时，当前线程从 `RUNNABLE --> WAITING` 
   - 注意是当前线程在t 线程对象的监视器上等待 
- t 线程运行结束，或调用了当前线程的 `interrupt()` 时，当前线程从 `WAITING --> RUNNABLE` 

情况 4 `RUNNABLE <--> WAITING`
当前线程调用 `LockSupport.park()` 方法会让当前线程从 `RUNNABLE --> WAITING` 
调用 `LockSupport.unpark(目标线程)` 或调用了线程的 `interrupt()` ，会让目标线程从 `WAITING --> RUNNABLE` 
情况 5 `RUNNABLE <--> TIMED_WAITING`
t 线程用 `synchronized(obj)` 获取了对象锁后 

- 调用 `obj.wait(long n)` 方法时，t 线程从 `RUNNABLE --> TIMED_WAITING` 
- t 线程等待时间超过 n 毫秒，或调用`obj.notify()` ，`obj.notifyAll()` ，`t.interrupt()`时 
   - 竞争锁成功，t 线程从`TIMED_WAITING --> RUNNABLE` 
   - 竞争锁失败，t 线程从`TIMED_WAITING --> BLOCKED` 

情况 6 `RUNNABLE <--> TIMED_WAITING`

- 当前线程调用 `t.join(long n)` 方法时，当前线程从 `RUNNABLE --> TIMED_WAITING` 
   - 注意是当前线程在t 线程对象的监视器上等待 
- 当前线程等待时间超过了 n 毫秒，或t 线程运行结束，或调用了当前线程的 `interrupt()` 时，当前线程从 `TIMED_WAITING --> RUNNABLE` 

情况 7 `RUNNABLE <--> TIMED_WAITING`

- 当前线程调用 `Thread.sleep(long n)` ，当前线程从 `RUNNABLE --> TIMED_WAITING` 
- 当前线程等待时间超过了 n 毫秒，当前线程从`TIMED_WAITING --> RUNNABLE` 

情况 8 `RUNNABLE <--> TIMED_WAITING`

- 当前线程调用 `LockSupport.parkNanos(long nanos)` 或 `LockSupport.parkUntil(long millis)` 时，当前线程从 `RUNNABLE --> TIMED_WAITING` 
- 调用 `LockSupport.unpark(目标线程)` 或调用了线程 的 `interrupt()` ，或是等待超时，会让目标线程从 `TIMED_WAITING--> RUNNABLE` 

情况 9 `RUNNABLE <--> BLOCKED`

- t 线程用`synchronized(obj)` 获取了对象锁时如果竞争失败，从`RUNNABLE --> BLOCKED` 
- 持 obj 锁线程的同步代码块执行完毕，会唤醒该对象上所有 BLOCKED 的线程重新竞争，如果其中 t 线程竞争成功，从 `BLOCKED --> RUNNABLE` ，其它失败的线程仍然`BLOCKED` 

情况 10 `RUNNABLE <--> TERMINATED`

- 当前线程所有代码运行完毕，进入 `TERMINATED`
## API、概念
### 守护线程
```java
public class Deamon
{
    /*
    * 用户线程：也叫工作线程，当线程的任务执行完成或通知方式结束
    * 守护线程：一般是为工作线程服务的，当所有的用户线程结束，守护线程自动结束
    * 常见的守护线程：垃圾回收机制
    * */
    public static void main(String[] args) throws InterruptedException
    {
        Work work = new Work();
        //如果我们希望在main线程结束之后work线程也随之结束
        //就用这条setDaemon方法，注意这条语句需要写在start方法之前，否则会出现异常
        work.setDaemon(true);
        work.start();
        for (int i = 0; i < 5; i++)
        {
            System.out.println("main线程运行中---");
            Thread.sleep(1000);
        }
    }
    static class Work extends Thread
    {
        @Override
        public void run()
        {
            while (true)
            {
                try
                {
                    System.out.println("子线程运行中...");
                    Thread.sleep(1000);
                }
                catch (InterruptedException e)
                {
                    e.printStackTrace();
                }
            }
        }
    }
}
```
### 线程中断
```java
public class Interrupt_
{
    public static void main(String[] args) throws InterruptedException
    {
        /*
        * interrupt：用于中断线程的休眠，即停止休眠，继续执行线程内容
        * 这就是sleep要被捕获异常的原因
        * */
        wallpaper wallpaper = new wallpaper();
        //常用方法：
        wallpaper.setName("壁纸引擎");  //设置线程名称，默认为Thread-0 (0++)
        wallpaper.start();
        //wallpaper.setPriority(Thread.MIN_PRIORITY); //设置该线程的优先级为最低
        //wallpaper.getName();    //获取线程名
        //wallpaper.getState()    //获取线程当前的状态

        for (int i = 0; i < 25; i++)
        {
            System.out.println("Hello!");
            Thread.sleep(500);
        }
        //中断休眠,原本“壁纸引擎”线程在执行完20次循环后要再过10秒才会开始下一次循环
        //这条语句相当于取消了它的休眠状态，让他在主线程输出25次循环后，立即开始执行线程的内容
        wallpaper.interrupt();
    }

    static class wallpaper extends Thread
    {
        @Override
        public void run()
        {
            while (true)
            {
                for (int i = 0; i < 20; i++)
                {
                    System.out.print("切换壁纸" + i);
                    System.out.println(",线程名：" + Thread.currentThread().getName());
                    try
                    {
                        Thread.sleep(500);
                    }
                    catch (InterruptedException e)
                    {
                        System.out.println("线程中断！");
                        e.printStackTrace();
                    }
                }
                try
                {
                    //让这个线程过10秒再运行
                    System.out.println(Thread.currentThread().getName() + "正在休眠……");
                    Thread.sleep(10000);
                }
                catch (InterruptedException e)
                {
                    System.out.println(Thread.currentThread().getName() + "被interrupt（中断）了");
                }
            }
        }
    }
}
```
### 礼让与插队

- `join()`方法：

 join()方法是Thread类的一个方法，用于等待当前线程所加入的线程执行完毕(让别的线程先执行完)。调用join()方法的线程会被阻塞，直到被加入的线程执行完毕。例如，如果线程A调用了线程B的join()方法，那么线程A会等待线程B执行完毕后再继续执行。

- `yield()`方法：

 yield()方法是Thread类的一个静态方法，用于暂停当前正在执行的线程，并允许其他具有相同优先级的线程运行。调用yield()方法后，当前线程会让出CPU资源，但是不会释放锁资源。调用yield()方法后，当前线程会重新进入就绪状态，然后与其他线程竞争CPU资源。
```java
public class JoinYield
{
    public static void main(String[] args) throws InterruptedException
    {
        NetBar netbar = new NetBar();
        netbar.start();
        int k = 40;
        for (int i = 0; i < 20; i++)
        {
            Thread.sleep(1000);
            System.out.println("主线程（+++小弟+++）上" + (k--) + "号机子");
            if (i == 10) {
                netbar.join();  //子线程插队（大哥先上机，小弟等大哥都上机了再上机）
            }
        }
    }
    static class NetBar extends Thread
    {
        @Override
        public void run()
        {
            for (int i = 0; i < 20; i++)
            {
                try
                    {
                        Thread.sleep(1000);
                    }
                catch (InterruptedException e)
                    {
                        e.printStackTrace();
                    }
                System.out.println("子线程（===大哥===）上" + i + "号机子");
            }
        }
    }
}
```
### Callable
实现Callable接口是创建线程的第三种（继承Thread、实现Runnable、实现Callable、线程池）方式。
Callable和Runnable都是Java中用于多线程编程的接口，但它们有以下不同点：

1. 返回值：Runnable的run()方法没有返回值，而Callable的call()方法可以返回运算结果。
2. 抛出异常：Runnable的run()方法不能抛出受检查异常，而Callable的call()方法可以抛出受检查异常。
3. 使用方式：Runnable通常被用于执行一些没有返回值的异步操作，而Callable则常用于一些需要返回结果的任务。
4. 处理方式：对于Runnable提交给线程池执行后，无法获取其执行结果。对于Callable，可以通过`Future<T>`来获取其执行结果。
```java
// 创建新类 MyThread 实现 runnable 接口
class MyThread implements Runnable{
    @Override
    public void run() {
    }
}
// 新类 MyThread2 实现 callable 接口
class MyThread2 implements Callable<Integer>{
    @Override
    public Integer call() throws Exception {
        return 200;
    }
}
```
> 不能直接替换 runnable,因为 Thread 类的构造方法根本没有 Callable

用Callable创建线程：

1. Runnbale接口有实现类：FutureTask
2. FutureTask构造可以传递Callable，通过FutureTask创建线程对象
```java
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;

/
 * @author qzy
 * @time 2023/11/30 16:31 星期四
 * @title 创建线程方式3：Callable
 */
public class CallableThread {
    public static void main(String[] args) throws ExecutionException, InterruptedException {
        MyCallable mc = new MyCallable();
        FutureTask<Integer> taskCallAble = new FutureTask<>(mc);
        Thread thread = new Thread(taskCallAble);
        thread.start();
        System.out.println("第一次->mc->taskCallAble.get() =》 " + taskCallAble.get());
        System.out.println("第二次->mc->taskCallAble.get() =》 " + taskCallAble.get());

        // FutureTask<Integer> task = new FutureTask<>(() -> 123);
        // new Thread(task, "callable").start();
        // System.out.println("task.get() = " + task.get());
    }

    static class MyCallable implements Callable<Integer> {
        @Override
        public Integer call() throws Exception {
            int sum = 0;
            for (int i = 1; i <= 5; i++) {
                sum += i;
                System.out.println("i = " + i + ";sum = " + sum);
            }
            return sum;
        }
    }
}
```
```
i = 1;sum = 1
i = 2;sum = 3
i = 3;sum = 6
i = 4;sum = 10
i = 5;sum = 15
第一次->mc->taskCallAble.get() =》 15
第二次->mc->taskCallAble.get() =》 15
```
关于FutureTask未来任务的说明：

1. 未来任务只有第一次会执行任务过程，然后保存结果
2. 后续的get()获取结果是直接获得之前结果的，不会再执行call()方法体的内容
### 等待、唤醒
#### wait
wait() 方法是 Object 类中定义的一个方法，可以使当前线程进入等待状态，直到其他线程调用了该对象的 notify() 或 notifyAll() 方法来唤醒它。在调用 wait() 方法时，当前线程会释放持有的锁，以允许其他线程访问该对象。
wait() 方法有三个重载形式：

- wait()：使当前线程进入等待状态，直到其他线程调用了该对象的 notify() 或 notifyAll() 方法才会被唤醒。
- wait(long timeout)：使当前线程进入等待状态，在指定的时间内等待其他线程调用该对象的 notify() 或 notifyAll() 方法，如果超过指定时间仍未被唤醒，则自动唤醒。
- wait(long timeout, int nanos)：这个方法与前一个方法类似，但还允许指定纳秒级别的等待时间。

在调用 wait() 方法之前，必须先获取当前对象的锁，否则会抛出 IllegalMonitorStateException 异常。在调用 wait() 方法后，当前线程会释放持有的锁，并进入等待状态，直到其他线程调用了该对象的 notify() 或 notifyAll() 方法。一旦被唤醒，当前线程会重新尝试获取锁，并从 wait() 方法返回继续执行。
需要注意的是，在使用 wait() 方法时，应该使用 while 循环而不是 if 语句来检查等待条件。这是因为线程在等待期间可能会被虚假唤醒（spurious wakeup），即使没有其他线程调用 notify() 方法也会返回。使用 while 循环可以在检查等待条件时再次验证真实性，以防止出现问题。
#### notify
`notify()`方法用于唤醒一个在对象上等待的线程。然而，它并不提供直接的方式来确定唤醒了哪个具体的线程。当多个线程等待同一个对象上的通知时，哪个线程被唤醒是不确定的，这由 JVM 决定。
当调用 `notify()` 方法时，JVM 会从等待队列中选择一个线程进行唤醒，但无法确定具体是哪个线程。因此，在使用 `notify()` 方法时，应该注意以下几点：

1. 只有一个线程能够被唤醒：`notify()`方法只会唤醒一个等待中的线程，如果有多个线程在等待，只有其中一个会被唤醒。如果希望唤醒全部等待的线程，可以使用 `notifyAll()`方法。
2. 线程竞争：由于无法确定哪个线程会被唤醒，因此唤醒的线程可能不是你期望的那个线程。因此，在使用 `notify()`方法时，需要谨慎处理竞争条件，确保程序的正确性。
3. 锁机制：`notify()` 方法必须在持有对象的锁的情况下调用，否则会抛出 `IllegalMonitorStateException` 异常。通常情况下，我们使用 `synchronized` 关键字来获取对象的锁。

如果需要更精确地控制唤醒的线程，可以考虑使用 Lock 和 Condition 接口提供的条件变量机制。它们可以更细粒度地控制线程的等待和唤醒，并提供了更多灵活的方式来管理线程之间的通信。
#### sleep 与 wait

1. sleep 是 Thread 方法，而 wait 是 Object 的方法 
2. sleep 不需要强制和 synchronized 配合使用，但 wait 需要和 synchronized 一起用 
3. sleep 在睡眠的同时，不会释放对象锁的，但 wait 在等待的时候会释放对象锁 
4. 它们状态 TIMED_WAITING
#### 正确使用姿势
```java
synchronized(lock) {
    while(条件不成立) {
        lock.wait();
    }
    // 干活
}
//另一个线程
synchronized(lock) {
    lock.notifyAll();
}
```
#### park、unpark
`LockSupport.park()`和`LockSupport.unpark()`是Java并发编程中用于线程阻塞和唤醒的工具。
LockSupport.park()方法用于阻塞当前线程，使其进入休眠状态，直到调用LockSupport.unpark()方法或者被中断才会被唤醒。park()方法可以在任何地方使用，不需要先获取锁。
LockSupport.unpark()方法则用于唤醒一个被LockSupport.park()方法阻塞的线程。unpark()方法可以提前唤醒一个线程，即使该线程还没有被阻塞。
LockSupport类是基于线程的许可（permit）机制实现的，每个线程都有一个许可（permit），默认是未被占用的状态。park()方法会消耗掉许可，如果许可已经被消耗完了，再次调用park()方法将会导致线程阻塞。unpark()方法会增加许可，如果许可尚未被消耗，则增加许可并不会产生任何效果。
LockSupport工具类提供了更灵活的线程阻塞和唤醒机制，相比于使用Object的wait()和notify()方法，它不依赖于对象的锁定状态，并且可以在任意位置进行阻塞和唤醒操作。

---

与 Object 的 wait & notify 相比 

1. wait，notify 和 notifyAll 必须配合 Object Monitor 一起使用，而 park，unpark 不必
2. park & unpark 是以线程为单位来【阻塞】和【唤醒】线程，而 notify 只能随机唤醒一个等待线程，notifyAll 是唤醒所有等待线程，就不那么【精确】 
3. park & unpark 可以先 unpark，而 wait & notify 不能先 notify

---

使用`LockSupport`的`park()`方法打断线程执行
park过后，无法再次park，必须在二者之间使用Thread.interrupted()重置打断状态

```java
public class Park {
    private static Logger logger = Logger.getLogger("Park");
    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> {
            logger.info("park...");
            LockSupport.park();
            logger.info("unpark...");
            Thread.interrupted();
            logger.info("重置打断状态为false");
            LockSupport.park();
            logger.info("park");
        }, " t1");
        t1.start();

        Thread.sleep(1);
        t1.interrupt();

        Thread.sleep(1000);
        System.exit(1);
    }
}
```
## 锁
### 快速入门
#### Synchronized关键字

1. 加在成员方法上
```java
class Test{
    // 在方法上加锁的对象仍然是this对象，而不是方法
    public synchronized void test() {

    }
}
// 等价于
class Test{
    public void test() {
        synchronized(this) {

        }
    }
}
```

2. 加在静态方法上
```java
class Test{
    public synchronized static void test() {
    }
}
// 等价于
class Test{
    public static void test() {
        synchronized(Test.class) {

        }
    }
}
```

3. 同步代码块
```java
class Test{
    // private static Object obj = new Object();
    public void test() {
        synchronized(/*obj*/ this) {
        	
        }
    }
}
```
synchronized实现同步的基础:Java中的每一个对象都可以作为锁。具体表现为以下3种形式。

- 对于普通同步方法，锁是当前实例对象。
- 对于静态同步方法，锁是当前类的class对象。
- 对于同步代码块，锁是synchonized括号里配置的对象。
> 注意：线程同步会使程序效率变低，就算要实现同步，也应尽量使用 同步代码块 的方式而非 同步方法

#### Lock接口

- Lock和synchronized有以下几点不同∶
   - Lock是一个接口，而synchronized 是Java 中的关键字，synchronized是内置的语言实现;
   - synchronized在发生异常时，会自动释放线程占有的锁，因此不会导致死锁现象发生;而Lock在发生异常时，如果没有主动通过unLock()去释放锁,则很可能造成死锁现象，因此使用Lock 时需要在finally块中释放锁;
   - Lock 可以让等待锁的线程响应中断，而synchronized 却不行，使用synchronized 时，等待的线程会一直等待下去，不能够响应中断;
   - 通过Lock 可以知道有没有成功获取锁，而synchronized 却无法办到。
   - Lock 可以提高多个线程进行读操作的效率。
   在性能上来说，如果竞争资源不激烈，两者的性能是差不多的，而当竞争资源非常激烈时（即有大量线程同时竞争），此时Lock 的性能要远远优于synchronized
- 公平锁
   - 效率一般，不会出现饥饿线程
   - `ReentrantLock(true)`参数为true显示指定为公平锁
- 非公平锁
   - 效率高，可能出现饥饿线程
   - `ReentrantLock()`无参构造默认是非公平锁
#### 入门案例
##### 线程间通信+1-1案例
###### Synchronized关键字
```java
public class ThreadCommunicationSyn {
    public static void main(String[] args) throws InterruptedException {
        Count count = new Count();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    count.increment();
                } catch (Exception e) {
                    e.printStackTrace();
                }
//                System.out.println("INCREMENT-> count : " + count.count);
            }
        }, "AAA->INCREMENT").start();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    count.decrement();
                } catch (Exception e) {
                    e.printStackTrace();
                }
//                System.out.println("DECREMENT -> count : " + count.count);
            }
        }, "BBB->DECREMENT").start();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    count.increment();
                } catch (Exception e) {
                    e.printStackTrace();
                }
//                System.out.println("INCREMENT-> count : " + count.count);
            }
        }, "CCC->INCREMENT").start();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    count.decrement();
                } catch (Exception e) {
                    e.printStackTrace();
                }
//                System.out.println("DECREMENT -> count : " + count.count);
            }
        }, "DDD->DECREMENT").start();

    }

    static class Count {
        int count = 0;
        Lock lock;

        public Count() {
            lock = new ReentrantLock();
        }

        public synchronized void increment() throws InterruptedException {
            // 不能写if,否则>2个线程时可能会出现虚假唤醒的情况
            while (count != 0) {
                this.wait();
            }
            count++;
            System.out.println(Thread.currentThread().getName() + "::" + count);
            this.notifyAll();
        }

        public synchronized void decrement() throws InterruptedException {
            // 不能写if,否则>2个线程时可能会出现虚假唤醒的情况
            while (count != 1) {
                this.wait();
            }
            count--;
            System.out.println(Thread.currentThread().getName() + "--" + count);
            this.notifyAll();
        }

    }
}
```
###### Lock锁
```java
public class ThreadCommunicationLock {
    public static void main(String[] args) throws InterruptedException {
        Count count = new Count();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    count.increment();
                } catch (Exception e) {
                    e.printStackTrace();
                }
//                System.out.println("INCREMENT-> count : " + count.count);
            }
        }, "AAA->INCREMENT").start();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    count.decrement();
                } catch (Exception e) {
                    e.printStackTrace();
                }
//                System.out.println("DECREMENT -> count : " + count.count);
            }
        }, "BBB->DECREMENT").start();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    count.increment();
                } catch (Exception e) {
                    e.printStackTrace();
                }
//                System.out.println("INCREMENT-> count : " + count.count);
            }
        }, "CCC->INCREMENT").start();

        new Thread(() -> {
            for (int i = 0; i < 10; i++) {
                try {
                    count.decrement();
                } catch (Exception e) {
                    e.printStackTrace();
                }
//                System.out.println("DECREMENT -> count : " + count.count);
            }
        }, "DDD->DECREMENT").start();

    }

    static class Count {
        int count = 0;
        Lock lock;
        Condition condition;

        public Count() {
            lock = new ReentrantLock();
            condition = lock.newCondition();
        }

        public void increment() throws InterruptedException {
            lock.lock();
            try {
                // 不能写if,否则>2个线程时可能会出现虚假唤醒的情况
                while (count != 0) {
                    condition.await();  // 进入阻塞状态
                }
                count++;
                System.out.println(Thread.currentThread().getName() + "::" + count);
                condition.signalAll();  // 唤醒其它线程
            } finally {
                lock.unlock();
            }

        }

        public void decrement() throws InterruptedException {
            lock.lock();
            try {
                // 不能写if,否则>2个线程时可能会出现虚假唤醒的情况
                while (count != 1) {
                    condition.await();  // 进入阻塞状态
                }
                count--;
                System.out.println(Thread.currentThread().getName() + "--" + count);
                condition.signalAll();  // 唤醒其它线程
            } finally {
                lock.unlock();
            }

        }
    }
}

```
###### 总结

1. 创建资源类，在资源类创建属性和操作方法
2. 在资源类操作方法
- 判断
- 干活
- 通知
3. 创建多个线程，调用资源类的操作方法
4. 防止虚假唤醒问题
##### 线程A中停止线程B
```java
public class StopAnotherThread {
    static Logger logger = Logger.getLogger("TwoPhaseTermination");

    public static void main(String[] args) throws InterruptedException {
        logger.info("StopAnotherThread...");
        TwoPhaseTermination termination = new TwoPhaseTermination();
        termination.start();
        Thread.sleep(3500);
        termination.stop();
    }
    static class TwoPhaseTermination {
        private Thread monitor;
        //启动监控线程
        public void start() {
            monitor = new Thread(() -> {
                while (true) {
                    Thread currentThread = Thread.currentThread();
                    if (currentThread.isInterrupted()) {
                        logger.info("料理后事……");
                        break;
                    }
                    try {
                        Thread.sleep(1000);
                        logger.info("执行监控……");
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                        //设置打断标记
                        currentThread.interrupt();
                    }
                }
            }, "monitor");
            monitor.start();
        }

        //停止监控线程
        public void stop() {
            monitor.interrupt();
        }
    }
}

```
##### 线程间定制通信
```java
/
 * @author qzy
 * @time 2023/11/30 14:06 星期四
 * @title 线程间的定制化通信
 * 循环N次这个过程：
 *  	A打印1次->B打印2次->C打印3次
 */
public class CustThreadComm {
    public static void main(String[] args) {
        ShareResource source = new ShareResource();
        new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                try {
                    source.print1(i);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }, "A").start();
        new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                try {
                    source.print2(i);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }, "B").start();
        new Thread(() -> {
            for (int i = 0; i < 3; i++) {
                try {
                    source.print3(i);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
            }
        }, "C").start();
    }
    static class ShareResource {
        private int flag;
        private Lock lock;
        private Condition c1;
        private Condition c2;
        private Condition c3;

        public ShareResource() {
            flag = 1;
            lock = new ReentrantLock();
            c1 = lock.newCondition();
            c2 = lock.newCondition();
            c3 = lock.newCondition();
        }

        public void print1(int loop) throws InterruptedException {
            lock.lock();
            try {
                while (flag != 1) {
                    c1.await();
                }
                for (int i = 0; i < 1; i++) {
                    System.out.println("线程" + Thread.currentThread().getName() + " -> i = " + i + "-轮数loop:" + loop);
                }
                flag = 2;
                c2.signal();
            } finally {
                lock.unlock();
            }
        }

        public void print2(int loop) throws InterruptedException {
            lock.lock();
            try {
                while (flag != 2) {
                    c2.await();
                }
                for (int i = 0; i < 2; i++) {
                    System.out.println("线程" + Thread.currentThread().getName() + " -> i = " + i + "-轮数loop:" + loop);
                }
                flag = 3;
                c3.signal();
            } finally {
                lock.unlock();
            }
        }

        public void print3(int loop) throws InterruptedException {
            lock.lock();
            try {
                while (flag != 3) {
                    c3.await();
                }
                for (int i = 0; i < 3; i++) {
                    System.out.println("线程" + Thread.currentThread().getName() + " -> i = " + i + "-轮数loop:" + loop);
                }
                flag = 1;
                c1.signal();
            } finally {
                lock.unlock();
            }
        }
    }
}
```
#### 锁释放时机

- 当前线程的同步方法、同步代码块执行结束。
- 当前线程在同步代码块、同步方法中遇到了break、return。
- 当前线程在同步代码块，同步方法中出现了未处理的Error或Exception，导致异常结束。
- 当前线程在同步代码块，同步方法中执行了线程对象的wait()方法，当前线程暂停，将锁释放。

下面操作不会释放锁：

- 当程序执行同步代码块或同步方法时，程序调用Thread.sleep()、Thread.yield()方法暂停当前线程的执行，不会释放锁。
- 线程执行同步代码块时，其他线程调用了该线程的suspend()方法将该线程挂起，该线程不会释放锁。

注意：`suspend()`和`resume()`方法已过时，在编写多线程程序时应尽量避免使用。
### 活跃性
#### 死锁
死锁指的是两个或多个线程无限期地等待对方持有的资源，导致它们都无法继续执行。简单来说，就是每个线程都在等待另一个线程释放资源，而自己却不释放已经持有的资源，从而导致所有线程都无法继续执行下去。
```java
public class DeadLock
{
    /*
    * 死锁：第一个线程运行时需要拿到一把锁才能继续，但这把锁已经被第二个线程拿去用了；
    * 而第二个线程在运行时又遇到了需要拿到第一个线程使用的锁才能继续运行的情况
    * 线程1运行中->线程1拿到了锁A继续运行->线程1需要拿到锁B才能继续运行
    * 线程2运行中->线程2拿到了锁B继续运行->线程2需要拿到锁A才能继续运行
    * 双方都要拿到对方持有的锁，但自己的锁又不能解除，就会形成死锁
    * 出现死锁的后果很严重，会直接导致程序卡死，不能继续往下运行
    * */
    public static void main(String[] args)
    {
        //模拟死锁的情况
        Lock A = new Lock(true);
        Lock B = new Lock(false);
        A.start();
        B.start();
    }

    static class Lock extends Thread
    {
        //lock继承Thread，这里使用static是为了保证多线程使用的是同一个对象
        static Object A = new Object();
        static Object B = new Object();
        boolean flag;

        public Lock(boolean flag)
        {
            this.flag = flag;
        }

        @Override
        public void run()
        {
            if (flag)
            {
                synchronized (A)
                {
                    System.out.println("AAA，线程名：" + Thread.currentThread().getName());
                    synchronized (B)
                    {
                        System.out.println("BBB，线程名：" + Thread.currentThread().getName());
                    }
                }
            }
            else
                synchronized (B)
                {
                    System.out.println("BBB" + Thread.currentThread().getName());
                    synchronized (A)
                    {
                        System.out.println("AAA" + Thread.currentThread().getName());
                    }
                }
        }
    }
}
```
> 检测死锁可以使用 jconsole工具，或者使用 jps 定位进程 id，再用 jstack 定位死锁
> 避免死锁要注意加锁顺序 
> 另外如果由于某个线程进入了死循环，导致其它线程一直等待，对于这种情况 linux 下可以通过 top 先定位到 CPU 占用高的 Java 进程，再利用 top -Hp 进程id 来定位是哪个线程，最后再用 jstack 排查

#### 活锁
活锁指的是线程们在不断地改变自己的状态以避免被阻塞，结果却导致系统无法取得进展。在活锁的情况下，线程会一直重试某个操作，但始终无法取得所需的资源，因此无法继续向前推进。
```java
public class LiveLock {
    static Logger log = GlobalLogger.getLog("LiveLock");
    static volatile int count = 10;
    static final Object lock = new Object();

    public static void main(String[] args) {
        new Thread(() -> {
            // 期望减到 0 退出循环
            while (count > 0) {
                try {
                    Thread.sleep(2222);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
                count--;
                log.info("count: {" + count + "}");
            }
        }, "t1").start();
        new Thread(() -> {
            // 期望超过 20 退出循环
            while (count < 20) {
                try {
                    Thread.sleep(2222);
                } catch (InterruptedException e) {
                    throw new RuntimeException(e);
                }
                count++;
                log.info("count: {" + count + "}");
            }
        }, "t2").start();
    }
}
```
#### 饥饿
饥饿指的是某些线程由于种种原因无法获得所需的资源，一直无法执行或者执行速度非常缓慢。通常是由于资源分配不公平或者优先级设置不当导致的问题。
```java
public class StarvationExample {
    private static final Object lock = new Object();

    public static void main(String[] args) {
        Thread thread1 = new Thread(() -> {
            synchronized (lock) {
                System.out.println("Thread 1 acquired the lock.");
                try {
                    Thread.sleep(3000); // 模拟长时间占用资源
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });

        Thread thread2 = new Thread(() -> {
            synchronized (lock) {
                System.out.println("Thread 2 acquired the lock.");
            }
        });

        Thread thread3 = new Thread(() -> {
            synchronized (lock) {
                System.out.println("Thread 3 acquired the lock.");
            }
        });

        // 设置优先级，让thread1的优先级最高
        thread1.setPriority(Thread.MAX_PRIORITY);
        thread2.setPriority(Thread.MIN_PRIORITY);
        thread3.setPriority(Thread.MIN_PRIORITY);

        thread1.start();
        thread2.start();
        thread3.start();
    }
}
```
### ReentrantLock
相对于 synchronized 它具备如下特点

- 可中断
- 可以设置超时时间
- 可以设置为公平锁
- 支持多个条件变量

与 synchronized 一样，都支持可重入
```java
// 获取锁
reentrantLock.lock();
try {
    // 临界区
} finally {
    // 释放锁
    reentrantLock.unlock();
}
```
#### 可重入
同一个线程如果首次获得了这把锁，那么因为它是这把锁的拥有者，因此有权利再次获取这把锁 
如果是不可重入锁，那么第二次获得锁时，自己也会被锁挡住。
```java
public synchronized void funSyn() {
    System.out.println("外层");
    synchronized (this) {
        System.out.println("中层");
        synchronized (this) {
            System.out.println("内层");
        }
    }
}
```
```java
Lock lock = new ReentrantLock();
public void funLock() {
    lock.lock();
    try {
        System.out.println("1外层");
        lock.lock();
        try {
            System.out.println("2中层");
            lock.lock();
            try {
                System.out.println("3内层");
            } finally {
                lock.unlock();
            }
        } finally {
            lock.unlock();
        }
    } finally {
        lock.unlock();
    }
}
```
#### 锁超时
锁超时（Lock Timeout）是指在多线程环境下，某个线程请求获取某个锁资源时，如果该锁资源已被占用，则该线程会等待一段时间，如果在等待时间内无法获取到锁资源，则该线程会放弃获取锁资源的尝试，从而避免了死锁的问题。
在Java中，可以使用tryLock(long timeout, TimeUnit unit)方法来实现锁超时。该方法会在给定的时间内尝试获取锁资源，如果在等待时间内未能获取锁资源，则返回false。
例如，下面的代码演示了如何使用锁超时来解决竞争锁资源导致的死锁问题：
```java
public class LockTimeoutExample {
    private static final Lock lock = new ReentrantLock();

    public static void main(String[] args) {
        Thread thread1 = new Thread(() -> {
            if (lock.tryLock()) {
                try {
                    System.out.println("Thread 1 acquired the lock.");
                    Thread.sleep(3000); // 模拟长时间（3秒）占用资源
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    lock.unlock();
                }
            } else {
                System.out.println("Thread 1 failed to acquire the lock.");
            }
        });

        Thread thread2 = new Thread(() -> {
            // 如果等了5秒还拿不到锁就退出
            if (lock.tryLock(5, TimeUnit.SECONDS)) {
                try {
                    System.out.println("Thread 2 acquired the lock.");
                } finally {
                    lock.unlock();
                }
            } else {
                System.out.println("Thread 2 failed to acquire the lock.");
            }
        });

        thread1.start();
        thread2.start();
    }
}
```
#### 条件变量
ReentrantLock 的条件变量比 synchronized 强大之处在于，它是支持多个条件变量的，这就好比 
synchronized 是那些不满足条件的线程都在一间休息室等消息 ；而 ReentrantLock 支持多间休息室，有专门等烟的休息室、专门等早餐的休息室、唤醒时也是按休息室来唤醒

---

使用要点：

- await 前需要获得锁
- await 执行后，会释放锁，进入 conditionObject 等待
- await 的线程被唤醒（或打断、或超时）去重新竞争 lock 锁
- 竞争 lock 锁成功后，从 await 后继续执行
### 读写锁
读写锁（Read-Write Lock）是一种用于多线程环境下对共享数据进行读写操作的同步机制。与传统的排他锁（例如互斥锁）不同，读写锁允许多个线程同时读取共享数据，但只允许一个线程进行写操作。
读写锁的特点如下：

1. 共享读：多个线程可以同时获取读锁，读取共享数据，读操作之间不会相互干扰。这样可以提高并发性能，适用于读操作频繁、写操作较少的场景。
2. 独占写：只有一个线程可以获取写锁，进行写操作。写操作期间，其他线程无法获取读锁或写锁，保证数据的一致性和安全性。

---

1. 线程进入读锁的前提条件：
• 没有其他线程的写锁
• 没有写请求；或者有写请求，但调用线程和持有锁的线程是同一个(可重入锁)。
2. 线程进入写锁的前提条件：
• 没有其他线程的读锁
• 没有其他线程的写锁
3. 读写锁有以下三个重要的特性：
（1）公平选择性：支持非公平（默认）和公平的锁获取方式，吞吐量还是非公平优于公平。
（2）重进入：读锁和写锁都支持线程重进入。
（3）锁降级：遵循获取写锁、获取读锁再释放写锁的次序，写锁能够降级成为读锁。

---

```java
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class ReadWriteLockDemo {
    private static int count = 0;
    private static final ReadWriteLock lock = new ReentrantReadWriteLock();

    public static void main(String[] args) {
        new Thread(() -> readData(), "Read").start();
        new Thread(() -> readData(), "Read").start();
        new Thread(() -> writeData(), "Write").start();
    }

    public static void readData() {
        lock.readLock().lock();
        try {
            System.out.println("Read Data: " + count);
        } finally {
            lock.readLock().unlock();
        }
    }

    public static void writeData() {
        lock.writeLock().lock();
        try {
            count++;
            System.out.println("Write Data: " + count);
        } finally {
            lock.writeLock().unlock();
        }
    }
}
```
小结

- 在线程持有读锁的情况下，该线程不能取得写锁(因为获取写锁的时候，如果发现当前的读锁被占用，就马上获取失败，不管读锁是不是被当前线程持有)。 
- 在线程持有写锁的情况下，该线程可以继续获取读锁（获取读锁时如果发现写锁被占用，只有写锁没有被当前线程占用的情况才会获取失败）。 
- 原因: 当线程获取读锁的时候，可能有其他线程同时也在持有读锁，因此不能把获取读锁的线程“升级”为写锁；而对于获得写锁的线程，它一定独占了读写锁，因此可以继续让它获取读锁，当它同时获取了写锁和读锁后，还可以先释放写锁继续持有读锁，这样一个写锁就“降级”为了读锁。
- 锁降级的优点是允许多个线程并发地读取数据，提高了程序的性能。同时，由于降级操作是自上而下的，不会出现死锁情况。
   - 锁降级
```java
public class LockDownGrading {
    private static final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();
    private static String data;

    public static void main(String[] args) {
        writeData();
        readData();
    }

    public static void writeData() {
        // 获取写锁，执行写操作
        lock.writeLock().lock();
        try {
            data = "Some data";
            System.out.println("Write Data: " + data);

            // 获取读锁，实现锁降级
            lock.readLock().lock();
        } finally {
            // 释放写锁，实现锁降级
            lock.writeLock().unlock();
        }
    }

    public static void readData() {
        try {
            // 使用读锁读取数据
            lock.readLock().lock();
            System.out.println("Read Data: " + data);
        } finally {
            lock.readLock().unlock();
        }
    }
}
```
## 线程安全
### 集合

- ArrayList

解决方案：

   1. Vector<>()替代ArrayList<>()
   2. Collections.synchronizedList()
   3. CopyOnWriteArrayList<>()
   - 读时复制技术，在并发读时，访问原本的对象
   - 在并发写时，复制原本的对象，在这个基础上做修改，改完再覆盖回去
- Set

解决方案：

   1. CopyOnWriteSet<>()
- Map

解决方案：

   1. ConcurrentHashMap<>()
## 辅助类
JUC 中提供了三种常用的辅助类，通过这些辅助类可以很好的解决线程数量过多时 Lock 锁的频繁操作。
• CountDownLatch: 减少计数
• CyclicBarrier: 循环栅栏
• Semaphore: 信号灯

### 减少计数 CountDownLatch
CountDownLatch 是一种同步工具，允许一个或多个线程等待一组事件的发生。它可以用于线程之间的协调和通信，比如主线程等待所有子线程完成任务后再继续执行。

- CountDownLatch 主要有两个方法，当一个或多个线程调用 await 方法时，这些线程会阻塞。
- 其它线程调用 countDown 方法会将计数器减 1(调用 countDown 方法的线程不会阻塞)。
- 当计数器的值变为 0 时，因 await 方法阻塞的线程会被唤醒，继续执行。
```java
public class CountDownLatchDemo {
    public static void main(String[] args) throws InterruptedException {
        int threadCount = 3;
        CountDownLatch latch = new CountDownLatch(threadCount);

        // 创建并启动多个线程
        for (int i = 1; i <= threadCount; i++) {
            Thread thread = new Thread(() -> {
                System.out.println("Thread running:第" + Thread.currentThread().getName() + "个同学离开了");
                latch.countDown(); // 操作完成后减少计数器的值
            }, String.valueOf(i));
            thread.start();
        }

        latch.await(); // 等待计数器变为0

        System.out.println("All threads have completed:所有同学都已离开，房间上锁！");
    }
}
```
```
Thread running:第3个同学离开了
Thread running:第1个同学离开了
Thread running:第2个同学离开了
All threads have completed:所有同学都已离开，房间上锁！
```
### 循环屏障 CyclicBarrier
CyclicBarrier 是一种同步工具，允许一组线程互相等待，直到它们都到达某个公共屏障点。CyclicBarrier 可以用于多线程计算数据，最后合并计算结果的场景。
```java
public class CyclicBarrierDemo {
    public static void main(String[] args) {
        final int DragonBallNumber = 7;    // 收集7龙珠召唤神龙
        // 第一个参数是屏障数，每执行一次await会+1，直到7再执行下面的代码
        CyclicBarrier barrier = new CyclicBarrier(DragonBallNumber, () -> {
            System.out.println("Barrier action is triggered->7龙珠收集完毕，召唤神龙！");
        });

        // 创建并启动多个线程
        for (int i = 1; i <= DragonBallNumber; i++) {
            new Thread(() -> {
                System.out.println("Thread is waiting at the barrier -> 已收集" + Thread.currentThread().getName() + "星龙珠……");
                try {
                    barrier.await();
                } catch (InterruptedException | BrokenBarrierException e) {
                    e.printStackTrace();
                }
                // 屏障操作被触发后，才能执行下面这段（await()方法后的）代码
                System.out.println("Thread continues to run after the barrier - 这条语句在await后面 -> （线程仍在执行）");
            }, String.valueOf(i)).start();
        }
    }
```
```txt
Thread is waiting at the barrier -> 已收集7星龙珠……
Thread is waiting at the barrier -> 已收集1星龙珠……
Thread is waiting at the barrier -> 已收集6星龙珠……
Thread is waiting at the barrier -> 已收集4星龙珠……
Thread is waiting at the barrier -> 已收集2星龙珠……
Thread is waiting at the barrier -> 已收集5星龙珠……
Thread is waiting at the barrier -> 已收集3星龙珠……
Barrier action is triggered->7龙珠收集完毕，召唤神龙！
Thread continues to run after the barrier - （线程仍在执行）
Thread continues to run after the barrier - （线程仍在执行）
Thread continues to run after the barrier - （线程仍在执行）
Thread continues to run after the barrier - （线程仍在执行）
Thread continues to run after the barrier - （线程仍在执行）
Thread continues to run after the barrier - （线程仍在执行）
Thread continues to run after the barrier - （线程仍在执行）
```
### 信号灯 Semaphore
Semaphore 是一种同步工具，用于控制对某一共享资源的访问。它可以用于线程间同步，也可以用于进程间同步。
```java
public class SemaphoreDemo {
    // 6辆汽车要轮流停到3个停车位
    public static void main(String[] args) {
        int parking = 3;
        int car = 6;
        // 参数是最大信号量（可以看成最大线程池），每个信号量初始化为一个最多只能分发一个许可证。使用 acquire 方法获得许可证，release 方法释放许可
        Semaphore semaphore = new Semaphore(parking);
        for (int i = 1; i <= car; i++) {
            new Thread(() -> {
                try {
                    semaphore.acquire();
                    System.out.println(Thread.currentThread().getName() + "号车抢到了车位……");
                    int parkingTime = new Random().nextInt(3) + 1;
                    TimeUnit.SECONDS.sleep(parkingTime);    // i 号车停了 1 - 3秒后离开了
                    System.out.println(Thread.currentThread().getName() + "号车停了" + parkingTime + "秒后离开了停车场！");
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    semaphore.release();
                }
            }, String.valueOf(i)).start();
        }
    }
}
```
```
2号车抢到了车位……
3号车抢到了车位……
1号车抢到了车位……
2号车停了2秒后离开了停车场！
3号车停了2秒后离开了停车场！
4号车抢到了车位……
5号车抢到了车位……
1号车停了3秒后离开了停车场！
6号车抢到了车位……
4号车停了1秒后离开了停车场！
5号车停了2秒后离开了停车场！
6号车停了3秒后离开了停车场！
```
### 总结

1. CountDownLatch 数目明确，等量。
2. CyclicBarrier 定量有富余，等积累到才触发。
3. Semaphore 定量稀少，需要抢占。
4. 应用领域不同，JUC三大辅助类为了解决线程资源争夺，线程池是为了解决线程开销。

---

- 使用场景
   - CountDownLatch：适用于一组线程需要等待某个事件发生后才能继续执行的场景。例如，主线程等待所有子线程完成任务后再进行汇总操作。
   - CyclicBarrier：适用于多个线程分别执行任务，最后合并计算结果的场景。例如，将一个大任务拆分成多个子任务，多个线程并行执行子任务，最后在屏障点进行结果合并。
   - Semaphore：适用于控制对共享资源的访问。例如，限制同时访问某个资源的线程数量，或者限制某个资源的并发访问量。

---

- 具体的应用场景：
   - CountDownLatch：可以用于等待多个线程完成初始化操作，然后再开始执行某个任务，或者等待多个线程完成数据加载后再进行数据处理。
   - CyclicBarrier：可以用于将一个任务分解为多个子任务进行并行计算，然后在屏障点进行结果合并。例如，将一个大型文件分割为多个小文件进行并行处理，然后在屏障点将处理结果合并。
   - Semaphore：可以用于限制对某个资源的并发访问量，保证资源的安全性。例如，限制同时访问数据库连接池的线程数量，或者限制同时访问某个文件的线程数量。
## 阻塞队列
### 概览
阻塞队列（Blocking Queue）是一种线程安全的队列，支持在队列为空时阻塞获取元素，并在队列满时阻塞添加元素的操作。阻塞队列常用于生产者-消费者模型中，保证生产者和消费者之间的数据交换的安全、有序和高效。
常用的阻塞队列有以下几种：

1. ArrayBlockingQueue：固定长度的阻塞队列，底层使用数组实现。
2. LinkedBlockingQueue：无界阻塞队列，底层使用链表实现。
3. SynchronousQueue：一种特殊的阻塞队列，它不存储元素，只负责元素的传递。
4. PriorityBlockingQueue：基于优先级的阻塞队列。

阻塞队列提供了一些常用的方法，如下：

1. put(E e)：向队列尾部添加一个元素，如果队列已满，则阻塞等待。
2. take()：从队列头部取出一个元素，如果队列为空，则阻塞等待。
3. offer(E e, long timeout, TimeUnit unit)：向队列尾部添加一个元素，如果队列已满，则等待指定的时间。
4. poll(long timeout, TimeUnit unit)：从队列头部取出一个元素，如果队列为空，则等待指定的时间。
5. add(E e)：向队列尾部添加一个元素，如果队列已满，则抛出异常。
6. remove()：从队列头部取出一个元素，如果队列为空，则抛出异常。
### 常用阻塞队列
#### ArrayBlockingQueue
基于数组的阻塞队列实现，在 ArrayBlockingQueue 内部，维护了一个定长数组，以便缓存队列中的数据对象，这是一个常用的阻塞队列，除了一个定长数组外，ArrayBlockingQueue 内部还保存着两个整形变量，分别标识着队列的头部和尾部在数组中的位置。
ArrayBlockingQueue 在生产者放入数据和消费者获取数据，都是共用同一个锁对象，由此也意味着两者无法真正并行运行，这点尤其不同于 LinkedBlockingQueue；
按照实现原理来分析ArrayBlockingQueue 完全可 以采用分离锁，从而实现生产者和消费者操作的完全并行运行。Doug Lea 之 所以没这样去做，也许是因为 ArrayBlockingQueue 的数据写入和获取操作已经足够轻巧，以至于引入独立的锁机制，除了给代码带来额外的复杂性外，其在性能上完全占不到任何便宜。
 ArrayBlockingQueue 和 LinkedBlockingQueue 间还有一个明显的不同之处在于，前者在插入或删除元素时不会产生或销毁任何额外的对象实例，而后者则会生成一个额外的Node 对象。这在长时间内需要高效并发地处理大批量数据的系统中，其对于GC 的影响还是存在一定的区别。在创建ArrayBlockingQueue 时，我们还可以控制对象的内部锁是否采用公平锁，默认采用非公平锁。
> 需要注意的是，在使用阻塞队列时需要合理设置队列长度和阻塞等待时间，避免出现线程饥饿或死锁等问题。同时，由于阻塞队列提供了线程安全的数据交换机制，因此可以减少线程同步的开销，提高程序的并发性能。

#### LinkedBlockingQueue
基于链表的阻塞队列，同 ArrayListBlockingQueue 类似，其内部也维持着一个数据缓冲队列（该队列由一个链表构成），当生产者往队列中放入一个数据时，队列会从生产者手中获取数据，并缓存在队列内部，而生产者立即返回；只有当队列缓冲区达到最大值缓存容量时（LinkedBlockingQueue 可以通过构造函数指定该值,默认值为Integer.MAX_VALUE），才会阻塞生产者队列，直到消费者从队列中消费掉一份数据，生产者线程会被唤醒，反之对于消费者这端的处理也基于同样的原理。 
LinkedBlockingQueue 之所以能够高效的处理并发数据，还因为其对于生产者端和消费者端分别采用独立的锁来控制数据同步，这也意味着在高并发的情况下生产者和消费者可以并行地操作队列中的数据，以此来提高整个队列的并发性能。 
> ArrayBlockingQueue 和 LinkedBlockingQueue 是两个最普通也是最常用的阻塞队列，一般情况下，在处理多线程间的生产者消费者问题，使用这两个类足以。

### 其它阻塞队列
#### DelayQueue
DelayQueue 内部使用 PriorityQueue 来存储元素，并且要求元素必须实现 Delayed 接口。Delayed 接口中定义了两个方法：getDelay(TimeUnit unit) 和 compareTo(Delayed other)。getDelay() 方法返回剩余的延迟时间，而 compareTo() 方法用于元素之间的比较。
DelayQueue 中的元素只有当其指定的延迟时间到了，才能够从队列中获取到 该元素。DelayQueue 是一个没有大小限制的队列，因此往队列中插入数据的 操作（生产者）永远不会被阻塞，而只有获取数据的操作（消费者）才会被阻塞。

```java
public class DelayQueueDemo {
    public static void main(String[] args) throws InterruptedException {
        DelayQueue<DelayedElement> queue = new DelayQueue<>();

        // 生产者线程
        new Thread(() -> {
            try {
                queue.put(new DelayedElement("Element 1", 3000));
                queue.put(new DelayedElement("Element 2", 2000));
                queue.put(new DelayedElement("Element 3", 4000));
            } catch (Exception e) {
                e.printStackTrace();
            }
        }).start();

        // 消费者线程
        new Thread(() -> {
            try {
                while (true) {
                    DelayedElement element = queue.take();
                    System.out.println("Consuming element: " + element);
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }
    static class DelayedElement implements Delayed {
        private String name;
        private long delayTime;

        public DelayedElement(String name, long delayTime) {
            this.name = name;
            this.delayTime = System.currentTimeMillis() + delayTime;
        }

        @Override
        public long getDelay(TimeUnit unit) {
            long remainingTime = delayTime - System.currentTimeMillis();
            return unit.convert(remainingTime, TimeUnit.MILLISECONDS);
        }

        @Override
        public int compareTo(Delayed other) {
            long diff = this.delayTime - ((DelayedElement) other).delayTime;
            return Long.compare(diff, 0);
        }

        @Override
        public String toString() {
            return name;
        }
    }

}
```
#### PriorityBlockingQueue
基于优先级的阻塞队列（优先级的判断通过构造函数传入的 Compator 对象来决定），但需要注意的是 PriorityBlockingQueue 不会阻塞数据生产者，只会在没有可消费的数据时，阻塞数据的消费者。 因此使用的时候要特别注意，生产者生产数据的速度绝对不能快于消费者消费数据的速度，否则时间一长，会最终耗尽所有的可用堆内存空间。
在实现 PriorityBlockingQueue 时，内部控制线程同步的锁采用的是公平锁。

```java
public class PriorityBlockingQueueDemo {
    public static void main(String[] args) throws InterruptedException {
        PriorityBlockingQueue<Integer> queue = new PriorityBlockingQueue<>();

        // 生产者线程
        new Thread(() -> {
            for (int i = 5; i > 0; i--) {
                queue.put(i); // 将整数插入队列
            }
        }).start();

        // 消费者线程
        new Thread(() -> {
            try {
                while (true) {
                    Integer element = queue.take();
                    System.out.println("Consuming element: " + element);
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }
}
```
#### SynchronousQueue
SynchronousQueue 是 Java 并发包中的一个特殊类型的阻塞队列。与其他阻塞队列不同，SynchronousQueue 内部并不维护任何数据元素，它只负责在生产者线程和消费者线程之间传递元素。

---

具体来说，SynchronousQueue 提供了以下特性：

1. 容量为 0：SynchronousQueue 的容量为零，意味着它不缓存任何元素。生产者线程在插入元素时，需要等待消费者线程来获取这个元素。
2. 一对一交互：每个插入操作必须等待相应的移除操作，反之亦然。这使得 SynchronousQueue 可以用于确保生产者和消费者之间的严格同步。
3. 公平性：SynchronousQueue 可以选择是否按照公平原则处理等待的线程。默认情况下，它是非公平的，即不保证等待时间最长的线程先被处理，但可以在构造方法中指定为公平模式。

---

使用 SynchronousQueue 需要注意以下几点：

1. 插入和移除操作是成对出现的：当一个线程调用 put() 方法插入元素时，它将会等待另一个线程调用 take() 方法来移除这个元素。
2. 阻塞等待：当生产者线程调用 put() 方法时，如果没有消费者线程调用 take() 方法来获取元素，生产者线程将会一直阻塞等待；同样地，当消费者线程调用 take() 方法时，如果没有生产者线程调用 put() 方法来插入元素，消费者线程也会一直阻塞等待。

---

- 公平模式与非公平模式
   - 公平模式：SynchronousQueue 会采用公平锁，并配合一个 FIFO 队列来阻塞多余的生产者和消费者，从而体系整体的公平策略； 
   - 非公平模式（SynchronousQueue 默认）：SynchronousQueue 采用非公平锁，同时配合一个 LIFO 队列来管理多余的生产者和消费者，而后一种模式，如果生产者和消费者的处理速度有差距，则很容易出现饥渴的情况，即可能有某些生产者或者是消费者的数据永远都得不到处理。
> SynchronousQueue 适用于一对一的数据交换场景，不适合用作普通的队列使用。它在某些并发模式下可以提供更高的吞吐量和更好的性能，但要根据具体的需求来选择适当的并发集合。

```java
public class SynchronousQueueDemo {
    public static void main(String[] args) {
        SynchronousQueue<Integer> queue = new SynchronousQueue<>();

        // 生产者线程
        new Thread(() -> {
            try {
                System.out.println("Producing element: 1");
                queue.put(1);
                System.out.println("Producing element: 2");
                queue.put(2);
                System.out.println("Producing element: 3");
                queue.put(3);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();

        // 消费者线程
        new Thread(() -> {
            try {
                Thread.sleep(1000); // 稍微延迟一下，以确保生产者线程先执行
                System.out.println("Consuming element: " + queue.take());
                System.out.println("Consuming element: " + queue.take());
                System.out.println("Consuming element: " + queue.take());
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }
}
```
#### LinkedBlockingDeque
LinkedBlockingDeque 是 Java 并发包中的一个特殊类型的双向阻塞队列，同时具有队列和栈的功能。
LinkedBlockingDeque 内部使用链表来存储元素，可以在队列的两端进行插入和删除操作。它是线程安全的，支持多个线程同时对队列进行操作，并且提供了阻塞和非阻塞的插入和删除方法。

```java
import java.util.concurrent.LinkedBlockingDeque;

public class LinkedBlockingDequeDemo {
    public static void main(String[] args) throws InterruptedException {
        LinkedBlockingDeque<String> deque = new LinkedBlockingDeque<>();

        // 生产者线程
        new Thread(() -> {
            try {
                deque.putFirst("First");
                deque.putLast("Last");
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();

        // 消费者线程
        new Thread(() -> {
            try {
                String first = deque.takeFirst();
                String last = deque.takeLast();
                System.out.println("First element: " + first);
                System.out.println("Last element: " + last);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }
}
```
### 小结

1. 在多线程领域：所谓阻塞，在某些情况下会挂起线程，一旦条件满足，被挂起的线程又会自动被唤起
2. 为什么需要 BlockingQueue? 在 concurrent 包发布以前，在多线程环境下，每个程序员都必须自己控制这些细节，尤其还要兼顾效率和线程安全，而这会给我们的程序带来不小的复杂度。使用后我们不需要关心什么时候需要阻塞线程，什么时候需要唤醒线程，因为这一切 BlockingQueue 都给你一手包办了
## 线程池
### 概述

- 简介
   - 线程池是一种线程使用模式。线程过多会带来调度开销， 进而影响缓存局部性和整体性能。而线程池维护着多个线程，等待着监督管理者分配可并发执行的任务。这避免了在处理短时间任务时创建与销毁线程的代价。线程池不仅能够保证内核的充分利用，还能防止过分调度。 
   - 例子： 10 年前单核 CPU 电脑，假的多线程，像马戏团小丑玩多个球，CPU 需要来回切换。 现在是多核电脑，多个线程各自跑在独立的 CPU 上，不用切换效率高。 
- 线程池的优势
   - 线程池做的工作只是控制运行的线程数量，处理过程中将任务放入队列，然后在线程创建后启动这些任务，如果线程数量超过了最大数量，超出数量的线程排队等候，等其他线程执行完毕，再从队列中取出任务来执行。 
- 主要特点 
   - 降低资源消耗: 通过重复利用已创建的线程降低线程创建和销毁造成的销耗。 
   - 提高响应速度: 当任务到达时，任务可以不需要等待线程创建就能立即执行。 
   - 提高线程的可管理性: 线程是稀缺资源，如果无限制的创建，不仅会销耗系统资源，还会降低系统的稳定性，使用线程池可以进行统一的分配，调优和监控。 
- 实现
   - Java 中的线程池是通过 Executor 框架实现的，该框架中用到了 Executor，Executors，ExecutorService，ThreadPoolExecutor 这几个类
### 组成部分
一般来说实现一个线程池主要包括以下几个组成部分：

- 线程管理器 ：用于创建并管理线程池 。
- 工作线程 ：线程池中实际执行任务的线程。在初始化线程时会预先创建好固定数目的线程在池中，这些初始化的线程一般是处于空闲状态，不消耗CPU，占用较小的内存空间 。
- 任务接口 ：每个任务必须实现的接口，当线程池中有可执行的任务时，被工作线程调试执行。把任务抽象出来形成任务接口，可以做到线程池与具体的任务无关。
- 任务队列：用来存放没有处理的任务，提供一种缓冲机制。实现这种结构有好几种方法，常用的是队列，主要是利用它先进先出的工作原理；另外一种是链表之类的数据结构，可以动态为它分配内存空间，应用中比较灵活。
### 线程池种类与创建
#### newCachedThreadPool(常用)

- 作用

创建一个可缓存线程池，如果线程池长度超过处理需要，可灵活回收空闲线程，若无可回收，则新建线程 

- 特点 
   - 线程池中数量没有固定，可达到最大值（Interger. MAX_VALUE） 
   - 线程池中的线程可进行缓存重复利用和回收（回收默认时间为 1 分钟） 
   - 当线程池中，没有可用线程，会重新创建一个线程 
- 创建方式
```java
/*
* 可缓存线程池
*/
public static ExecutorService newCachedThreadPool(){
    /*
    * corePoolSize 线程池的核心线程数
    * maximumPoolSize 能容纳的最大线程数
    * keepAliveTime 空闲线程存活时间
    * unit 存活的时间单位
    * workQueue 存放提交但未执行任务的队列
    * threadFactory 创建线程的工厂类:可以省略
    * handler 等待队列满后的拒绝策略:可以省略
    */
    return new ThreadPoolExecutor(0,
                                  Integer.MAX_VALUE,
                                  60L,
                                  TimeUnit.SECONDS,
                                  new SynchronousQueue<>(),
                                  Executors.defaultThreadFactory(),
                                  new ThreadPoolExecutor.AbortPolicy());
}
```

- 使用场景

适用于创建一个可无限扩大的线程池，服务器负载压力较轻，执行时间较短，任务多的场景。
#### newFixedThreadPool(常用)

- 作用

创建一个可重用固定线程数的线程池，以共享的无界队列方式来运行这些线程。
在任意点，在大多数线程会处于处理任务的活动状态。如果在所有线程处于活动状态时提交附加任务，则在有可用线程之前，附加任务将在队列中等待。如果在关闭前的执行期间由于失败而导致任何线程终止，那么一个新线程将代替它执行后续的任务（如果需要）。
在某个线程被显式地关闭之前，池中的线程将一直存在。

- 特征 
   - 线程池中的线程处于一定的量，可以很好的控制线程的并发量 
   - 线程可以重复被使用，在显示关闭之前，都将一直存在 
   - 超出一定量的线程被提交时候需在队列中等待 
- 创建方式
```java
/*
* 固定长度线程池
*/
public static ExecutorService newFixedThreadPool(){
    /*
    * corePoolSize 线程池的核心线程数
    * maximumPoolSize 能容纳的最大线程数
    * keepAliveTime 空闲线程存活时间
    * unit 存活的时间单位
    * workQueue 存放提交但未执行任务的队列
    * threadFactory 创建线程的工厂类:可以省略
    * handler 等待队列满后的拒绝策略:可以省略
    */
    return new ThreadPoolExecutor(10,
                                  10,
                                  0L,
                                  TimeUnit.SECONDS,
                                  new LinkedBlockingQueue<>(),
                                  Executors.defaultThreadFactory(),
                                  new ThreadPoolExecutor.AbortPolicy());
}
```

- 使用场景

适用于可以预测线程数量的业务中，或者服务器负载较重，对线程数有严格限制的场景 
#### newSingleThreadExecutor(常用)

- 作用

创建一个使用单个 worker 线程的 Executor，以无界队列方式来运行该线程。（注意，如果因为在关闭前的执行期间出现失败而终止了此单个线程，那么如果需要，一个新线程将代替它执行后续的任务）。
可保证顺序地执行各个任务，并且在任意给定的时间不会有多个线程是活动的。
与其他等效的 newFixedThreadPool 不同，可保证无需重新配置此方法所返回的执行程序即可使用其他的线程。 

- 特征 

线程池中最多执行 1 个线程，之后提交的线程活动将会排在队列中以此执行 

- 创建方式
```java
/*
* 单一线程池
*/
public static ExecutorService newSingleThreadExecutor(){
    /*
    * corePoolSize 线程池的核心线程数
    * maximumPoolSize 能容纳的最大线程数
    * keepAliveTime 空闲线程存活时间
    * unit 存活的时间单位
    * workQueue 存放提交但未执行任务的队列
    * threadFactory 创建线程的工厂类:可以省略
    * handler 等待队列满后的拒绝策略:可以省略
    */
    return new ThreadPoolExecutor(1,
                                  1,
                                  0L,
                                  TimeUnit.SECONDS,
                                  new LinkedBlockingQueue<>(),
                                  Executors.defaultThreadFactory(),
                                  new ThreadPoolExecutor.AbortPolicy());
}
```

- 场景

适用于需要保证顺序执行各个任务，并且在任意时间点，不会同时有多个线程的场景。
#### newScheduleThreadPool

- 作用

线程池支持定时以及周期性执行任务，创建一个 corePoolSize 为传入参数，最大线程数为整形的最大数（Integer.MAX_VALUE）的线程池

- 特征

（1）线程池中具有指定数量的线程，即便是空线程也将保留 
（2）可定时或者延迟执行线程活动 

- 创建方式
```java
public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize, 
                                                              ThreadFactory threadFactory) { 
    return new ScheduledThreadPoolExecutor(corePoolSize, threadFactory); 
} 
```

- 场景

适用于需要多个后台线程执行周期任务的场景
#### newWorkStealingPool 

- 概述

JDK1.8 提供的线程池，底层使用的是 ForkJoinPool 实现，创建一个拥有多个任务队列的线程池，可以减少连接数，创建当前可用 cpu 核数的线程来并行执行任务
WorkStealingPool 是一种基于工作窃取算法（work-stealing algorithm）的线程池。在 WorkStealingPool 中，每个线程都有自己的任务队列，当一个线程完成了自己队列中的任务后，它可以去其他线程的队列中窃取任务来执行，从而实现了负载均衡和高效利用线程的特性。

- 创建方式
```java
public static ExecutorService newWorkStealingPool(int parallelism) { 
/ 
* parallelism：并行级别，通常默认为 JVM 可用的处理器个数 
* factory：用于创建 ForkJoinPool 中使用的线程。 
* handler：用于处理工作线程未处理的异常，默认为 null 
* asyncMode：用于控制 WorkQueue 的工作模式:队列---反队列
*/ 
return new ForkJoinPool(parallelism, 
                        ForkJoinPool.defaultForkJoinWorkerThreadFactory, 
                        null, 
                        true); 
} 
```

- 场景

WorkStealingPool 适用于处理大量相互独立、可并行执行的任务，能够充分利用多核处理器的优势，提高并发处理能力。同时，WorkStealingPool 也内置了一些优化策略，使得任务的调度更加高效和灵活。
#### 自定义线程池
通过 ThreadPoolExecutor 类自定义线程池，可以灵活地设置线程池的参数，如核心线程数、最大线程数、任务队列等。
```java
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    5, // 核心线程数
    10, // 最大线程数
    60, // 空闲线程存活时间
    TimeUnit.SECONDS, // 存活时间单位
    new LinkedBlockingQueue<>() // 任务队列
);
```
#### 注意事项

1. 项目中创建多线程时，使用常见的三种线程池创建方式，单一、可变、定长都有一定问题，原因是 FixedThreadPool 和 SingleThreadExecutor 底层都是用LinkedBlockingQueue 实现的，这个队列最大长度为 Integer.MAX_VALUE，容易导致OOM。所以实际生产一般自己通过 ThreadPoolExecutor 的 7 个参数，自定义线程池
2. 创建线程池推荐适用 ThreadPoolExecutor 及其 7 个参数手动创建
corePoolSize 线程池的核心线程数
maximumPoolSize 能容纳的最大线程数
keepAliveTime 空闲线程存活时间
unit 存活的时间单位
workQueue 存放提交但未执行任务的队列
threadFactory 创建线程的工厂类
handler 等待队列满后的拒绝策略
### 参数说明
#### 常用参数(重点)
• corePoolSize 线程池的核心线程数
• maximumPoolSize 能容纳的最大线程数
• keepAliveTime 空闲线程存活时间
• unit 存活的时间单位
• workQueue 存放提交但未执行任务的队列
• threadFactory 创建线程的工厂类
• handler 等待队列满后的拒绝策略
其中：corePoolSize——核心线程数，也即最小的线程数。workQueue——阻塞队列 。maximumPoolSize——最大线程数，这三个参数的决定会影响拒绝策略。
当提交任务数大于 corePoolSize 的时候，会优先将任务放到 workQueue 阻塞队列中。当阻塞队列饱和后，会扩充线程池中线程数，直到达到maximumPoolSize 最大线程数配置。此时，再多余的任务，则会触发线程池的拒绝策略了。 
总结：当提交的任务数大于（workQueue.size() + maximumPoolSize ），会触发线程池的拒绝策略。

#### 拒绝策略(重点)
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/3.png)

- CallerRunsPolicy: 当触发拒绝策略，只要线程池没有关闭的话，则使用调用线程直接运行任务。一般并发比较小，性能要求不高，不允许失败。但是，由于调用者自己运行任务，如果任务提交速度过快，可能导致程序阻塞，性能效率上必然的损失较大。
- AbortPolicy: 丢弃任务，并抛出拒绝执行 RejectedExecutionException 异常信息。线程池默认的拒绝策略。必须处理好抛出的异常，否则会打断当前的执行流程，影响后续的任务执行。
- DiscardPolicy: 直接丢弃，其他啥都没有。
- DiscardOldestPolicy: 当触发拒绝策略，只要线程池没有关闭的话，丢弃阻塞队列 workQueue 中最老的一个任务，并将新任务加入。
### 工作原理

1. 在创建了线程池后，线程池中的线程数为零
2. 当调用 execute()方法添加一个请求任务时，线程池会做出如下判断：
   1. 如果正在运行的线程数量小于 corePoolSize，那么马上创建线程运行这个任务；
   2. 如果正在运行的线程数量大于或等于 corePoolSize，那么将这个任务放入队列； 
   3. 如果这个时候队列满了且正在运行的线程数量还小于maximumPoolSize，那么还是要创建非核心线程立刻运行这个任务
   4. 如果队列满了且正在运行的线程数量大于或等于 maximumPoolSize，那么线程池会启动饱和拒绝策略来执行。
3. 当一个线程完成任务时，它会从队列中取下一个任务来执行
4. 当一个线程无事可做超过一定的时间（keepAliveTime）时，线程会判断：
   1. 如果当前运行的线程数大于 corePoolSize，那么这个线程就被停掉。 
   2. 线程池的所有任务完成后，它最终会收缩到 corePoolSize 的大小。
## Fork/Join框架
### 介绍
Fork/Join框架是Java多线程编程中的一个并行计算框架，用于解决分而治之（divide and conquer）的问题。它是基于工作窃取（work-stealing）算法的一种实现。
Fork/Join框架的核心思想是将一个大任务划分为多个小任务，并行地执行这些小任务，最后将结果合并得到最终的结果。该框架使用了递归算法，将任务不断地拆分成更小的子任务，直到达到某个可以被直接计算的最小任务粒度。

### 实现
#### 执行流程

- 任务分割：首先 Fork/Join 框架需要把大的任务分割成足够小的子任务，如果子任务比较大的话还要对子任务进行继续分割。
- 执行任务并合并结果：分割的子任务分别放到双端队列里，然后几个启动线程，分别从双端队列里获取任务执行。子任务执行完的结果都放在另外一个队列里，启动一个线程从队列里取数据，然后合并这些数据。

---

#### 核心类

- ForkJoinTask：要使用 Fork/Join 框架，首先需要创建一个 ForkJoin 任务。该类提供了在任务中执行 fork 和 join 的机制。通常情况下我们不需要直接集成 ForkJoinTask类，只需要继承它的子类，Fork/Join 框架提供了两个子类： 
   - RecursiveAction：用于没有返回结果的任务 
   - RecursiveTask：用于有返回结果的任务 
- ForkJoinPool：ForkJoinTask 需要通过 ForkJoinPool 来执行 
- RecursiveTask：继承后可以实现递归(自己调自己)调用的任务

---

#### 实现原理
ForkJoinPool 由 ForkJoinTask 数组和 ForkJoinWorkerThread 数组组成，ForkJoinTask 数组负责将存放以及将程序提交给 ForkJoinPool，而 ForkJoinWorkerThread 负责执行这些任务。

- fork方法

调用 ForkJoinTask 的 fork 方法时，程序会把任务放在 ForkJoinWorkerThread 的 pushTask 的 workQueue中，异步地执行这个任务，然后立即返回结果。

- join方法

Join 方法的主要作用是阻塞当前线程并等待获取结果。它首先调用 doJoin 方法，通过 doJoin()方法得到当前任务的状态来判断返回什么结果，任务状态有 4 种：已完成（NORMAL）、被取消（CANCELLED）、信号（SIGNAL）和出现异常（EXCEPTIONAL）

- 如果任务状态是已完成，则直接返回任务结果。 
- 如果任务状态是被取消，则直接抛出 CancellationException 。
- 如果任务状态是抛出异常，则直接抛出对应的异常。
#### 异常处理
ForkJoinTask 在执行的时候可能会抛出异常，但没办法在主线程里直接捕获异常，所以 ForkJoinTask 提供了 `isCompletedAbnormally()`方法来检查任务是否已经抛出异常或已经被取消了，并且可以通过 ForkJoinTask 的 `getException()` 方法获取异常。getException() 方法返回 Throwable 对象，如果任务被取消了则返回 CancellationException。如果任务没有完成或者没有抛出异常则返回 null。
## CompletableFuture
CompletableFuture 是 Java 8 引入的一个类，用于支持异步编程和构建基于回调的操作链。它提供了一种简洁而强大的方式来处理异步任务的结果，以及串行和并行执行异步操作。
CompletableFuture 实现了 Future, CompletionStage 接口，实现了 Future 接口就可以兼容现在有线程池框架，而 CompletionStage 接口才是异步编程的接口抽象，里面定义多种异步方法，通过这两者集合，从而打造出了强大的CompletableFuture 类。
通过 CompletableFuture，我们可以方便地进行以下操作：

1. 创建一个异步任务，并在任务完成时执行回调操作。
2. 组合多个异步任务的结果，并在所有任务完成后执行某个操作。
3. 对异步任务的结果进行转换、处理错误和异常情况。
4. 可以轻松地实现串行和并行执行异步任务。
### Future回顾
Futrue 在 Java 里面，通常用来表示一个异步任务的引用，比如我们将任务提交到线程池里面，然后我们会得到一个 Futrue，在 Future 里面有 isDone 方法来判断任务是否处理结束，还有 get 方法可以一直阻塞直到任务结束然后获取结果，但整体来说这种方式，还是同步的，因为需要客户端不断阻塞等待或者不断轮询才能知道任务是否完成。

Future 的主要缺点：

（1）不支持手动完成 

我提交了一个任务，但是执行太慢了，我通过其他路径已经获取到了任务结果，现在没法把这个任务结果通知到正在执行的线程，所以必须主动取消或者一直等待它执行完成 

（2）不支持进一步的非阻塞调用 

通过 Future 的 get 方法会一直阻塞到任务完成，但是想在获取任务之后执行额外的任务，因为 Future 不支持回调函数，所以无法实现这个功能 

（3）不支持链式调用

对于 Future 的执行结果，我们想继续传到下一个 Future 处理使用，从而形成 一个链式的 pipline 调用，这在 Future 中是没法实现的。

（4）不支持多个 Future 合并

比如有 10 个 Future 并行执行，我们想在所有的 Future 运行完毕后， 执行某些函数，是没法通过 Future 实现的。 

（5）不支持异常处理 

Future 的 API 没有任何的异常处理的 api，所以在异步运行时，如果出了问题是不好定位的。

### CompletableFuture使用
#### 基本使用
场景:主线程里面创建一个 CompletableFuture，然后主线程调用 get 方法会阻塞，最后我们在一个子线程中使其终止。
```java
/*
* 主线程里面创建一个 CompletableFuture，然后主线程调用 get 方法会阻塞，
* 最后我们在一个子线程中使其终止
*/
public static void main(String[] args) throws Exception{
    CompletableFuture<String> future = new CompletableFuture<>();
    new Thread(() -> {
        try{
            System.out.println(Thread.currentThread().getName() + "子线程开始干活");
            //子线程睡 5 秒
            Thread.sleep(5000);
            //在子线程中完成主线程
            future.complete("success");
        }catch (Exception e){
            e.printStackTrace();
        }
    }, "A").start();
    //主线程调用 get 方法阻塞
    System.out.println("主线程调用 get 方法获取结果为: " + future.get());
    System.out.println("主线程完成,阻塞结束!");
}
```
#### 没有返回值的异步任务
```java
@Test
void noReturnAsyTask() throws ExecutionException, InterruptedException {
    System.out.println("主线程开始");
    //运行一个没有返回值的异步任务
    CompletableFuture<Void> future = CompletableFuture.runAsync(() -> {
        try {
            System.out.println("子线程启动干活");
            Thread.sleep(5000);
            System.out.println("子线程完成");
        } catch (Exception e) {
            e.printStackTrace();
        }
    });
    //主线程阻塞
    future.get();
    System.out.println("主线程结束");
}
```
#### 有返回值的异步任务
```java
@Test
void returnAsyTask() throws ExecutionException, InterruptedException {
    System.out.println("主线程开始");
    //运行一个有返回值的异步任务
    CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
        try {
            System.out.println("子线程开始任务");
            Thread.sleep(5000);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "子线程完成了!";
    });
    //主线程阻塞
    String s = future.get();
    System.out.println("主线程结束, 子线程的结果为:" + s);
}
```
#### 线程依赖 thenApply
当一个线程依赖另一个线程时，可以使用 `thenApply()` 方法来把这两个线程串行化。
```java
public static Integer num = 10;

@Test
void threadDependEach() throws ExecutionException, InterruptedException {
    System.out.println("主线程开始");
    CompletableFuture<Integer> future = CompletableFuture.supplyAsync(() -> {
        try {
            System.out.println("加 10 任务开始");
            num += 10;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return num;
    }).thenApply(integer -> {
        return num * num;
    });
    Integer result = future.get();
    System.out.println("主线程结束, 子线程的结果为:" + result);
}
```
#### 消费处理结果 thenAccept
`thenAccept()` 消费处理结果, 接收任务的处理结果，并消费处理，无返回结果。
```java
@Test
void consumeResult() {
    System.out.println("主线程开始");
    CompletableFuture.supplyAsync(() -> {
        try {
            System.out.println("加 10 任务开始");
            num += 10;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return num;
    }).thenRun(() -> {
        System.out.println("Then Run num * num……");
    }).thenApply(integer -> {
        return num * num;
    }).thenAccept(new Consumer<Integer>() {
        @Override
        public void accept(Integer result) {
            System.out.println("子线程全部处理完成,最后调用了 accept,结果为:" + result);
        }
    });
}
```
#### 异常处理 exceptionally、handle
exceptionally 异常处理,出现异常时触发
```java
@Test
void dealWithException() throws ExecutionException, InterruptedException {
    System.out.println("主线程开始");
    CompletableFuture<Integer> future = CompletableFuture.supplyAsync(() -> {
        int i = 1 / 0;  // 触发异常
        System.out.println("加 10 任务开始");
        num += 10;
        return num;
    }).exceptionally(ex -> {
        System.out.println(ex.getMessage());
        return -1;
    });
    System.out.println(future.get());
}
```

---

handle 类似于 thenAccept/thenRun 方法,是最后一步的处理调用,但是同时可以处理异常
```java
@Test
void dealWithExceptionHandle() throws ExecutionException, InterruptedException {
    System.out.println("主线程开始");
    CompletableFuture<Integer> future = CompletableFuture.supplyAsync(() -> {
        System.out.println(1 / 0);  // 引发异常
        System.out.println("加 10 任务开始");
        num += 10;
        return num;
    }).handle((i, ex) -> {
        System.out.println("进入 handle 方法");
        if (ex != null) {
            System.out.println("发生了异常,内容为:" + ex.getMessage());
            return -1;
        } else {
            System.out.println("正常完成,内容为: " + i);
            return i;
        }
    });
    System.out.println(future.get());
}
```
#### 结果合并 thenCompose、thenCombine
`thenCompose()` 合并两个有依赖关系的 CompletableFutures 的执行结果

```java
@Test
void mergeResultThenCompose() throws ExecutionException, InterruptedException {
    System.out.println("主线程开始");
    //第一步加 10
    CompletableFuture<Integer> future = CompletableFuture.supplyAsync(() -> {
        System.out.println("加 10 任务开始");
        num += 10;
        return num;
    });
    //合并
    CompletableFuture<Integer> future1 = future.thenCompose(i ->
            //再来一个 CompletableFuture
            CompletableFuture.supplyAsync(() -> {
                return i + 1;
            }));
    System.out.println(future.get());
    System.out.println(future1.get());
}
```
`thenCombine()` 合并两个没有依赖关系的 CompletableFutures 任务
```java
@Test
void thenCombine() throws ExecutionException, InterruptedException {
    System.out.println("主线程开始");
    CompletableFuture<Integer> job1 = CompletableFuture.supplyAsync(() -> {
        System.out.println("加 10 任务开始");
        num += 10;
        return num;
    });
    CompletableFuture<Integer> job2 = CompletableFuture.supplyAsync(() -> {
        System.out.println("乘以 10 任务开始");
        num = num * 10;
        return num;
    });
    //合并两个不相关任务的结果
    CompletableFuture<Object> future = job1.thenCombine(job2, new BiFunction<Integer, Integer, List<Integer>>() {
        @Override
        public List<Integer> apply(Integer a, Integer b) {
            List<Integer> list = new ArrayList<>();
            list.add(a);
            list.add(b);
            return list;
        }
    });
    System.out.println("合并结果为:" + future.get());
}
```

---

多任务合并
allOf: 一系列独立的 future 任务，等其所有的任务执行完后做一些事情
```java
@Test
void mergeMultiTaskAll() {
    System.out.println("主线程开始");
    List<CompletableFuture> list = new ArrayList<>();
    CompletableFuture<Integer> job1 = CompletableFuture.supplyAsync(() -> {
        System.out.println("加 10 任务开始");
        num += 10;
        return num;
    });
    list.add(job1);
    CompletableFuture<Integer> job2 = CompletableFuture.supplyAsync(() -> {
        System.out.println("乘以 10 任务开始");
        num = num * 10;
        return num;
    });
    list.add(job2);
    CompletableFuture<Integer> job3 = CompletableFuture.supplyAsync(() -> {
        System.out.println("减以 10 任务开始");
        num = num * 10;
        return num;
    });
    list.add(job3);
    CompletableFuture<Integer> job4 = CompletableFuture.supplyAsync(() -> {
        System.out.println("除以 10 任务开始");
        num = num * 10;
        return num;
    });
    list.add(job4);
    //多任务合并
    List<Integer> collect =
            list.stream().map(CompletableFuture<Integer>::join).collect(Collectors.toList());
    System.out.println(collect);
    CompletableFuture<Void> allFuture = CompletableFuture.allOf(job1, job4, job3, job2);
    allFuture.get();
    System.out.println("所有任务都已完成，执行这段话！");
}
```
anyOf: 只要在多个 future 里面有一个返回，整个任务就可以结束，而不需要等到每一个 future 结束
```java
/
 * 测试方法：合并多个异步任务，返回任意完成的任务结果
 * @throws ExecutionException 当执行任务出错时抛出的异常
 * @throws InterruptedException 当线程中断时抛出的异常
 */
@Test
void mergeMultiTaskAny() throws ExecutionException, InterruptedException {
    System.out.println("主线程开始");

    // 创建一个CompletableFuture数组
    CompletableFuture<Integer>[] futures = new CompletableFuture[4];

    // 创建第一个异步任务
    CompletableFuture<Integer> job1 = CompletableFuture.supplyAsync(() -> {
        try {
            Thread.sleep(5000);
            System.out.println("加 10 任务开始");
            num += 10;
            return num;
        } catch (Exception e) {
            return 0;
        }
    });

    // 将第一个异步任务存储在数组中
    futures[0] = job1;

    // 创建第二个异步任务
    CompletableFuture<Integer> job2 = CompletableFuture.supplyAsync(() -> {
        try {
            Thread.sleep(2000);
            System.out.println("乘以 10 任务开始");
            num = num * 10;
            return num;
        } catch (Exception e) {
            return 1;
        }
    });

    // 将第二个异步任务存储在数组中
    futures[1] = job2;

    // 创建第三个异步任务
    CompletableFuture<Integer> job3 = CompletableFuture.supplyAsync(() -> {
        try {
            Thread.sleep(3000);
            System.out.println("减以 10 任务开始");
            num = num * 10;
            return num;
        } catch (Exception e) {
            return 2;
        }
    });

    // 将第三个异步任务存储在数组中
    futures[2] = job3;

    // 创建第四个异步任务
    CompletableFuture<Integer> job4 = CompletableFuture.supplyAsync(() -> {
        try {
            Thread.sleep(4000);
            System.out.println("除以 10 任务开始");
            num = num * 10;
            return num;
        } catch (Exception e) {
            return 3;
        }
    });

    // 将第四个异步任务存储在数组中
    futures[3] = job4;

    // 合并异步任务，返回任意完成的任务结果
    CompletableFuture<Object> future = CompletableFuture.anyOf(futures);

    // 获取任意完成的任务结果
    System.out.println(future.get());
}
```
