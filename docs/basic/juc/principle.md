---
title: 原理篇
shortTitle: 原理篇
description: JUC原理篇
date: 2023-12-19 11:05:01
categories: [Java]
tags: [JUC]
headerDepth: 4
order: 3
---
## 线程运行
### 栈与栈帧 
Java Virtual Machine Stacks （Java 虚拟机栈） 
我们都知道 JVM 中由堆、栈、方法区所组成，其中栈内存是给谁用的呢？其实就是线程，每个线程启动后，虚拟机就会为其分配一块栈内存。

- 每个栈由多个栈帧（Frame）组成，对应着每次方法调用时所占用的内存 
- 每个线程只能有一个活动栈帧，对应着当前正在执行的那个方法 
### 线程上下文切换
因为以下一些原因导致 cpu 不再执行当前的线程，转而执行另一个线程的代码 

- 线程的 cpu 时间片用完 
- 垃圾回收 
- 有更高优先级的线程需要运行 
- 线程自己调用了 sleep、yield、wait、join、park、synchronized、lock 等方法 

当 Context Switch 发生时，需要由操作系统保存当前线程的状态，并恢复另一个线程的状态，Java 中对应的概念 就是程序计数器（Program Counter Register），它的作用是记住下一条 jvm 指令的执行地址，是线程私有的

- 状态包括程序计数器、虚拟机栈中每个栈帧的信息，如局部变量、操作数栈、返回地址等 
- Context Switch 频繁发生会影响性能  
## Monitor
Monitor 被翻译为**监视器**或**管程**
每个 Java 对象都可以关联一个 Monitor 对象，如果使用 synchronized 给对象上锁（重量级）之后，该对象头的 Mark Word 中就被设置指向 Monitor 对象的指针
Monitor 结构如下：
![Monitor结构](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/200.png)

- 刚开始 Monitor 中 Owner 为 null 
- 当 Thread-2 执行 synchronized(obj) 就会将 Monitor 的所有者 Owner 置为 Thread-2，Monitor中只能有一个 Owner 
- 在 Thread-2 上锁的过程中，如果 Thread-3，Thread-4，Thread-5 也来执行synchronized(obj)，就会进入 EntryList - BLOCKED 
- Thread-2 执行完同步代码块的内容，然后唤醒 EntryList 中等待的线程来竞争锁，竞争的时是非公平的 
- 图中 WaitSet 中的 Thread-0，Thread-1 是之前获得过锁，但条件不满足进入 WAITING 状态的线程
> **注意:**
> synchronized 必须是进入同一个对象的 monitor 才有上述的效果 
> 不加 synchronized 的对象不会关联监视器，不遵从以上规则

## AQS
AQS (AbstractQueuedSynchronizer) 是 Java 并发包中的一个基础框架，是阻塞式锁和相关的同步器工具的框架，用于实现同步器和锁的底层机制。它提供了一种灵活的方式来实现不同类型的同步器，如独占锁、共享锁、倒计时门栓等。
AQS 的核心思想是使用一个 FIFO（先进先出）的双向队列来管理线程的排队和唤醒。它通过内部的状态变量和线程节点来保存和控制线程的状态和执行顺序。

特点： 

- 用 state 属性来表示资源的状态（分独占模式和共享模式），子类需要定义如何维护这个状态，控制如何获取锁和释放锁 
   - getState - 获取 state 状态 
   - setState - 设置 state 状态 
   - compareAndSetState - cas 机制设置 state 状态 
   - 独占模式是只有一个线程能够访问资源，而共享模式可以允许多个线程访问资源 
- 提供了基于 FIFO 的等待队列，类似于 Monitor 的 EntryList 
- 条件变量来实现等待、唤醒机制，支持多个条件变量，类似于 Monitor 的 WaitSet

AQS 的主要方法有以下几个：

1. `acquire(int arg)`：尝试获取资源，如果获取成功则继续执行，否则将当前线程加入到队列中并进行等待。
2. `release(int arg)`：释放资源，并唤醒等待队列中的线程。
3. `tryAcquire(int arg)`：尝试获取资源，如果获取成功返回 true，否则返回 false。
4. `tryRelease(int arg)`：尝试释放资源，如果释放成功返回 true，否则返回 false。
5. `isHeldExclusively()`：判断当前线程是否独占持有资源。
6. `getState()`：获取当前资源的状态值。
7. `setState(int newState)`：设置资源的状态值。

子类主要实现这样一些方法（默认抛出 `UnsupportedOperationException`） 

1. `tryAcquire` 
2. `tryRelease` 
3. `tryAcquireShared` 
4. `tryReleaseShared `
5. `isHeldExclusively`

AQS 的具体实现是通过内部的同步状态 state 和一个等待队列来实现的。线程在获取资源时，会先判断当前状态是否允许获取，如果不允许则进入等待队列，并通过自旋等待或阻塞等待的方式来获取资源。当释放资源时，会唤醒等待队列中的线程继续尝试获取资源。
AQS 为实现各种类型的同步器提供了基础设施，如 ReentrantLock、CountDownLatch、Semaphore 等都是基于 AQS 实现的。通过继承 AQS 并重写其中的方法，可以自定义实现特定的同步器。
需要注意的是，AQS 是一个底层的框架，直接使用时较为复杂，一般建议使用已经封装好的同步类和锁，如 ReentrantLock 和 CountDownLatch，它们已经在 AQS 的基础上进行了高层次的封装。

### 目标
AQS 要实现的功能目标

- 阻塞版本获取锁 acquire 和非阻塞的版本尝试获取锁 tryAcquire
- 获取锁超时机制
- 通过打断取消机制
- 独占机制及共享机制
- 条件不满足时的等待机制
### 设计
AQS 的基本思想其实很简单 
获取锁的逻辑
```java
while(state 状态不允许获取) {
    if(队列中还没有此线程) {
        入队并阻塞
    }
}
当前线程出队
```
释放锁的逻辑
```java
if(state 状态允许了) {
 恢复阻塞的线程(s)
}
```
要点 

- 原子维护 state 状态 
- 阻塞及恢复线程 
- 维护队列 

**1) state 设计**

- state 使用 volatile 配合 cas 保证其修改时的原子性 
- state 使用了 32bit int 来维护同步状态，因为当时使用 long 在很多平台下测试的结果并不理想 

**2) 阻塞恢复设计**

- 早期的控制线程暂停和恢复的 api 有 suspend 和 resume，但它们是不可用的，因为如果先调用的 resume 那么 suspend 将感知不到
- 解决方法是使用 park & unpark 来实现线程的暂停和恢复，具体原理在之前讲过了，先 unpark 再 park 也没问题 
- park & unpark 是针对线程的，而不是针对同步器的，因此控制粒度更为精细 
- park 线程还可以通过 interrupt 打断 

**3) 队列设计**

- 使用了 FIFO 先入先出队列，并不支持优先级队列 
- 设计时借鉴了 CLH 队列，它是一种单向无锁队列

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/201.png)
队列中有 head 和 tail 两个指针节点，都用 volatile 修饰配合 cas 使用，每个节点有 state 维护节点状态 
入队伪代码，只需要考虑 tail 赋值的原子性

```java
do {
    // 原来的 tail
    Node prev = tail;
    // 用 cas 在原来 tail 的基础上改为 node
} while(tail.compareAndSet(prev, node))
```
出队伪代码
```java
// prev 是上一个节点
while((Node prev=node.prev).state != 唤醒状态) {

}
// 设置头节点
head = node;
```
CLH 好处： 

- 无锁，使用自旋
- 快速，无阻塞

AQS 在一些方面改进了 CLH
```java
private Node enq(final Node node) {
    for (;;) {
        Node t = tail;
        // 队列中还没有元素 tail 为 null
        if (t == null) {
            // 将 head 从 null -> dummy
            if (compareAndSetHead(new Node()))
                tail = head;
        } else {
            // 将 node 的 prev 设置为原来的 tail
            node.prev = t;
            // 将 tail 从原来的 tail 设置为 node
            if (compareAndSetTail(t, node)) {
                // 原来 tail 的 next 设置为 node
                t.next = node;
                return t;
            }
        }
    }
}
```
![主要用到的AQS并发工具类](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/202.png)
## Synchronized
### 原理
```java
static final Object lock = new Object();
static int counter = 0;
public static void main(String[] args) {
    synchronized (lock) {
        counter++;
    }
}
```
```java
public static void main(java.lang.String[]);
 descriptor: ([Ljava/lang/String;)V
 flags: ACC_PUBLIC, ACC_STATIC
Code:
 stack=2, locals=3, args_size=1
 0: getstatic #2 // <- lock引用 （synchronized开始）
 3: dup
 4: astore_1 // lock引用 -> slot 1
 5: monitorenter // 将 lock对象 MarkWord 置为 Monitor 指针
 6: getstatic #3 // <- i
 9: iconst_1 // 准备常数 1
 10: iadd // +1
 11: putstatic #3 // -> i
 14: aload_1 // <- lock引用
 15: monitorexit // 将 lock对象 MarkWord 重置, 唤醒 EntryList
 16: goto 24
 19: astore_2 // e -> slot 2 
 20: aload_1 // <- lock引用
 21: monitorexit // 将 lock对象 MarkWord 重置, 唤醒 EntryList
 22: aload_2 // <- slot 2 (e)
 23: athrow // throw e
 24: return
 Exception table:
 from to target type
 6 16 19 any
 19 22 19 any
 LineNumberTable:
 line 8: 0
 line 9: 6
 line 10: 14
 line 11: 24
 LocalVariableTable:
 Start Length Slot Name Signature
 0 25 0 args [Ljava/lang/String;
 StackMapTable: number_of_entries = 2
 frame_type = 255 /* full_frame */
 offset_delta = 19
 locals = [ class "[Ljava/lang/String;", class java/lang/Object ]
 stack = [ class java/lang/Throwable ]
 frame_type = 250 /* chop */
 offset_delta = 4
```
> 方法级别的 synchronized 不会在字节码指令中有所体现

### 轻量级锁
轻量级锁（Lightweight Locking）是 Java 中用于提高多线程同步性能的一种锁优化手段。它是在 synchronized 关键字的基础上引入的一种锁实现方式。
在使用 synchronized 关键字进行同步时，会涉及到线程间的互斥和内存可见性等问题，这可能会导致性能损失。为了解决这个问题，虚拟机使用轻量级锁来尝试避免真正地使用互斥操作。
轻量级锁的基本思想是，当一个线程获得锁时，虚拟机会将对象头中的一部分信息（Mark Word）复制到线程的栈帧中的锁记录（Lock Record）中。这时，对象头被修改为指向锁记录的指针。当另一个线程也尝试获取这个锁时，发现对象头已经指向了其他线程的锁记录，那么该线程就会进入自旋状态，自旋等待锁的释放。自旋是指在不释放处理器的情况下，反复检查锁是否被释放，以避免线程切换的开销。
如果自旋等待的时间过长或者自旋的次数达到一定阈值，那么轻量级锁就会升级为重量级锁，即使用传统的互斥操作（如操作系统提供的互斥量）来保证线程之间的互斥和内存可见性。
轻量级锁的优点是在无竞争的情况下，减少了互斥操作的开销，提高了程序的执行效率。但在有竞争的情况下，仍然需要使用重量级锁来保证线程安全，所以轻量级锁适用于多线程环境中存在大量读操作、较少写操作的场景。
需要注意的是，轻量级锁是一种锁优化手段，并不是所有的 synchronized 块都会使用轻量级锁，具体是否使用轻量级锁还需要根据锁竞争的情况来动态调整。

### 锁膨胀
锁膨胀（Lock Coarsening）是一种锁优化技术，用于减少在循环内部频繁地加锁和解锁操作的开销。当循环内部存在多个连续的加锁和解锁操作时，虚拟机可以将这些操作合并成一个更大的临界区，从而减少锁操作的次数。
锁膨胀的基本思想是通过扩展原本的锁范围，将多个连续的加锁和解锁操作合并为一个更大的锁范围。这样可以减少线程频繁竞争锁的次数，减少锁操作的开销。
例如，考虑以下代码片段：
```java
synchronized (obj) {
    // 操作1
}

synchronized (obj) {
    // 操作2
}

synchronized (obj) {
    // 操作3
}
```
在没有进行锁膨胀的情况下，每个 synchronized 块都会进行一次加锁和解锁操作。但是，如果虚拟机检测到这三个 synchronized 块是连续的，并且没有其他线程访问 obj 对象，那么它可以将这三个 synchronized 块合并为一个更大的锁范围：
```java
synchronized (obj) {
    // 操作1
    // 操作2
    // 操作3
}
```
通过锁膨胀，虚拟机可以减少加锁和解锁操作的次数，从而提高程序的性能。
需要注意的是，锁膨胀只在连续的 synchronized 块之间没有其他线程访问共享对象的情况下才会进行。如果存在并发访问，锁膨胀就不能进行，以确保线程安全。
锁膨胀是虚拟机自动进行的优化，开发者无需显式地指定锁膨胀。虚拟机会根据具体的场景和情况来判断是否进行锁膨胀，以达到性能上的优化。

### 自旋优化
自旋优化（Spin Optimization）是一种针对多线程同步的优化技术，它通过在等待锁释放时使用自旋操作来减少线程切换的开销。

当一个线程在获取锁时，如果发现锁已经被其他线程占用，通常线程会进入阻塞状态，将 CPU 时间片让给其他线程。但是，线程的上下文切换需要耗费较高的开销，尤其在多核处理器上，导致线程频繁地切换会影响程序的性能。

自旋优化的思想是，当一个线程发现锁被其他线程占用时，它并不立即进入阻塞状态，而是在循环中反复检查锁是否被释放。这种循环检查的过程称为自旋。通过自旋等待锁的释放，线程可以在短时间内获取到锁，避免了线程切换的开销。

自旋优化适用于下面两种情况：

1.  锁占用时间短：如果持有锁的线程很快就会释放锁，那么等待线程进行自旋等待可能更加高效，因为线程切换的开销相对较大。 
2.  线程竞争不激烈：如果锁的竞争比较激烈，那么自旋等待的线程可能会一直在循环中浪费 CPU 时间，而没有机会获取到锁。在这种情况下，自旋等待可能会降低程序的性能。 

需要注意的是，自旋优化并非适用于所有场景。如果锁的占用时间长、线程竞争激烈或者系统负载较高，自旋等待可能会浪费大量的 CPU 时间。因此，在实际使用中，需要根据具体情况进行权衡和调整，合理选择是否使用自旋优化，并设置合适的自旋等待次数和策略。

在 Java 中，可以通过使用 `java.util.concurrent.atomic` 包中的原子类、使用 `java.util.concurrent.locks` 包中的显式锁（如 ReentrantLock）等方式来实现自旋优化。

> 自旋会占用 CPU 时间，单核 CPU 自旋就是浪费，多核 CPU 自旋才能发挥优势。 
> 在 Java 6 之后自旋锁是自适应的，比如对象刚刚的一次自旋操作成功过，那么认为这次自旋成功的可能性会高，就多自旋几次；反之，就少自旋甚至不自旋，总之，比较智能。 
> Java 7 之后不能控制是否开启自旋功能

### 偏向锁
#### 概念
偏向锁（Biased Locking）是Java虚拟机针对多线程竞争情况下的锁优化技术之一，旨在降低无竞争情况下的锁操作开销。

在无竞争情况下，即只有一个线程访问锁的情况下，偏向锁可以消除大部分同步原语的开销。它的核心思想是，当一个线程访问一个锁对象并成功获取锁时，虚拟机会将锁对象标记为偏向锁，并将线程 ID 记录在锁对象的头部。这样，在后续该线程再次请求获取这个锁对象时，虚拟机会直接将锁对象的状态设置为已获取，无需再进行额外的加锁操作。

通过偏向锁，无竞争情况下的锁操作主要包括线程的标识和判断、对象头的修改等，而不需要像传统锁一样进行CAS（Compare and Swap）操作或者互斥量的加锁和解锁，从而减少了锁操作的开销。

需要注意的是，当其他线程尝试获取偏向锁对象时，偏向锁会自动撤销，并升级为轻量级锁或重量级锁，具体取决于竞争情况。偏向锁的撤销过程需要暂停拥有偏向锁的线程，并进行锁状态的转换，这可能会引入一定的性能开销。

在JDK 6及以后的版本中，默认启用了偏向锁优化。可以通过JVM参数 `-XX:+UseBiasedLocking` 来启用或禁用偏向锁优化。偏向锁是默认是延迟的，不会在程序启动时立即生效，如果想避免延迟，可以加 VM 参数`-XX:BiasedLockingStartupDelay=0` 来禁用延迟

总之，偏向锁是针对无竞争情况下的锁操作进行的优化技术，通过减少同步原语的开销，提高程序的性能。然而，在存在竞争的情况下，偏向锁会自动撤销，转而使用其他更适合的锁机制。

#### 偏向锁被撤销

1. **调用对象的hashCode()**

调用了对象的 hashCode，但偏向锁的对象 MarkWord 中存储的是线程 id，如果调用 hashCode 会导致偏向锁被撤销

- 轻量级锁会在锁记录中记录 hashCode
- 重量级锁会在 Monitor 中记录 hashCode

在调用 hashCode 后使用偏向锁，记得去掉 `-XX:-UseBiasedLocking`

---

在Java中，对象的hashCode()方法返回的哈希码是根据对象的属性计算出来的，并且在对象的生命周期中保持不变。如果一个对象被用作锁对象，并且激活了偏向锁优化，那么对该对象调用hashCode()方法会使偏向锁失效，因为偏向锁需要在对象头中记录线程ID信息，而调用hashCode()方法会修改对象头中的哈希码信息，这将导致偏向锁标记无效。

当有其他线程尝试获取该锁对象时，偏向锁会自动失效并升级为轻量级锁或重量级锁，这意味着它会降低程序的性能。因此，在设计多线程程序时，应该避免在锁对象上调用hashCode()方法，以最大程度地利用偏向锁优化。

需要注意的是，JDK 6及以后版本中，默认启用偏向锁优化，但是如果JVM参数 `-XX:-UseBiasedLocking` 被设置为禁用偏向锁优化，那么在调用hashCode()方法时不会影响偏向锁的状态，因为偏向锁本身就不存在。在某些情况下，禁用偏向锁可能会提高程序性能，但它也可能会增加锁竞争的开销，具体取决于程序的特点和负载情况。

总之，调用对象的hashCode()方法会使偏向锁失效，因为它会修改对象头中的哈希码信息。在设计多线程程序时，应该避免在锁对象上调用hashCode()方法，以充分利用偏向锁优化。

2. **其它线程使用该锁对象**

当有其它线程使用偏向锁对象时，会将偏向锁升级为轻量级锁。

3. **调用wait()/notify()**

---

偏向锁在以下情况下会被撤销：

1.  竞争：当有其他线程试图获取同一个锁对象时，偏向锁会自动升级为轻量级锁或重量级锁，从而撤销偏向锁。这是因为偏向锁适用于无竞争的情况，一旦出现竞争，偏向锁就失去了优势。 
2.  锁消除：如果JVM经过逃逸分析发现该对象不会被多线程访问，就会将锁消除掉，包括偏向锁。因为在不存在竞争的情况下，锁是没有必要的，消除锁可以提高程序的执行效率。 
3.  偏向锁延迟撤销：当其他线程尝试获取同一个锁对象时，偏向锁不会立即被撤销，而是延迟一段时间。这是为了避免在短时间内频繁地切换锁状态，提高程序的性能。 

需要注意的是，偏向锁的撤销并不是立即发生的，而是在一定条件下触发。具体的策略和行为可能会因JVM的实现而略有不同。另外，在某些情况下，禁用偏向锁优化（通过JVM参数 `-XX:-UseBiasedLocking`）也会导致偏向锁被撤销，因为它本身就不存在偏向锁。

总结：偏向锁在发生竞争、锁消除或延迟撤销的情况下会被撤销。撤销后，锁将升级为轻量级锁或重量级锁，以保证多线程的正确性和安全性。

---

在JVM中，撤销偏向锁的阈值是通过 `-XX:BiasedLockingStartupDelay` JVM参数控制的。这个参数指定了JVM启动后，偏向锁延迟启用的时间，单位是毫秒。默认值是4秒。

在这个时间内，JVM会统计对象头中记录的偏向锁信息，确定是否需要启用偏向锁。如果在这段时间内，没有线程访问过该对象，JVM会认为该对象不适合使用偏向锁，并将其标记为无锁状态。如果在这段时间内，有线程访问过该对象，则JVM会继续检查该对象是否适合使用偏向锁。
当一个偏向锁对象被多个线程竞争访问时，JVM会自动撤销偏向锁并将其升级为轻量级锁或重量级锁。JVM会根据一些内部策略来判断何时需要撤销偏向锁，这些策略可能会因JVM版本和实现而有所不同。

需要注意的是，撤销偏向锁的阈值是一个全局参数，会影响所有对象的偏向锁使用情况。如果应用程序中有一些对象只会被短时间访问，那么将这个值设置得较小可以提高程序的性能。反之，如果应用程序中有一些对象会被长时间访问，那么将这个值设置得较大可以减少偏向锁的撤销，提高程序的性能。

#### 批量重偏向
在JDK 6及以后的版本中，引入了批量重偏向（Biased Locking Revocation）的机制，用于解决一些特定情况下偏向锁的性能问题。

如果对象虽然被多个线程访问，但没有竞争，这时偏向了线程 T1 的对象仍有机会重新偏向 T2，重偏向会重置对象 的 Thread ID ，当撤销偏向锁阈值超过 20 次后，JVM 会这样觉得，我是不是偏向错了呢，于是会在给这些对象加锁时重新偏向至加锁线程。

批量重偏向指当一个偏向锁所保护的对象（类的实例数量到达20[默认]）被多个线程竞争访问时，JVM会撤销偏向锁并将对象标记为无锁状态，而不是立即升级为轻量级锁或重量级锁。这样可以避免频繁地切换锁状态，提高程序的性能。

具体来说，当一个线程尝试获取一个已经偏向过的对象锁时，JVM会检查当前偏向锁的持有者是否是该线程自己。如果是，则直接获取锁，不需要撤销偏向锁。但是，如果偏向锁的持有者不是该线程，JVM会检查偏向锁的持有者是否处于活动状态（是否存活）。如果偏向锁的持有者已经死亡，JVM会立即撤销偏向锁，并将对象标记为无锁状态。如果偏向锁的持有者还活着，JVM会进行批量重偏向的操作，将对象锁状态由偏向锁撤销为无锁状态。

通过批量重偏向，JVM能够更好地处理多个线程对同一个偏向锁对象的竞争情况，减少了不必要的锁升级操作，提高了程序的性能。

> 注意：批量重偏向是JVM自动进行的优化策略，开发者无法显式地控制或调整。此外，不同的JVM实现可能会有不同的策略和行为。

##### 批量撤销
批量撤销（Bulk Revocation）是指当一个类的对象被撤销的次数超过一定的阈值（默认为 40 次）时，Java 虚拟机会认为这个类的对象不适合使用偏向锁，JVM会自动将该对象的偏向锁状态全部撤销，从而避免频繁的偏向锁撤销操作和锁升级操作。

在批量撤销的情况下，JVM会检查偏向锁对象的偏向线程是否仍然存活。如果偏向线程已经死亡，JVM会立即撤销该对象的偏向锁，将其标记为无锁状态。如果偏向线程仍然存活，JVM会将对象的偏向锁状态进行批量撤销，将对象的偏向锁状态全部撤销，将其标记为无锁状态。

批量撤销的机制可以有效避免因多个线程竞争同一个偏向锁对象而导致频繁的偏向锁撤销操作，提高程序的性能和并发效率。

> 注意：批量撤销是JVM内部自动进行的优化策略，开发者无法显式地控制或调整。不同的JVM实现可能会有不同的策略和行为。

### 锁消除
锁消除（Lock Elimination）是指在编译器优化阶段，通过静态分析和代码检测等技术，判断某些锁对象在特定的路径上不会被竞争访问，从而将其消除掉，减少不必要的锁开销，提高程序的性能。

锁消除通常发生在以下情况：

1.  对象只被一个线程访问：如果在程序的某个路径上，某个对象只被一个线程访问，并且不会被其他线程访问，那么这个对象所对应的锁可以被消除掉。 
2.  同步块内部没有共享变量：如果在同步块中，没有访问任何共享变量，那么这个同步块所对应的锁可以被消除掉。 
3.  锁对象不逃逸：如果在程序的某个路径上，某个锁对象没有逃逸到其他线程或方法中，那么这个锁对象所对应的锁可以被消除掉。 

锁消除可以减少锁竞争，提高程序的性能。但需要注意的是，锁消除也可能会带来一些副作用，比如可能会导致线程安全问题或代码逻辑错误等。因此，编译器的锁消除策略需要谨慎考虑，需要兼顾性能和正确性。

在JVM中，可以通过 `-XX:+EliminateLocks` JVM参数来启用锁消除优化。默认情况下，JVM会根据具体情况自动启用锁消除优化。

### 锁粗化
锁粗化（Lock Coarsening）是一种编译器优化技术，它主要通过将多个连续的细粒度锁操作合并成一个粗粒度的锁操作，减少锁的粒度，从而减少锁开销，提高程序的性能。

在某些情况下，代码中可能存在多个连续的细粒度锁操作，例如循环内部的加锁和解锁操作。由于频繁地进行细粒度锁操作会导致不必要的开销，因此编译器可以将这些细粒度的锁操作进行合并，形成一个更大范围的锁操作，即锁粗化。

锁粗化的目标是减少锁操作的次数和开销。通过将多个细粒度锁操作合并成一个粗粒度的锁操作，可以减少线程间的竞争和同步开销。这样一来，在多线程环境下，减少了加锁和解锁的次数，提高了程序的执行效率。

需要注意的是，锁粗化的效果并不是一定能够带来性能的提升，它需要根据具体的代码逻辑和运行环境来决定是否适合进行锁粗化优化。在某些情况下，锁粗化可能会导致锁的粒度过大，进而增加了锁竞争的可能性，反而降低了程序的性能。

在JVM中，可以通过 `-XX:+DoEscapeAnalysis` 和 `-XX:+EliminateLocks` JVM参数启用逃逸分析和锁消除优化，从而有助于锁粗化的实现。默认情况下，JVM会根据具体情况自动进行锁粗化优化。

## ReentrantLock
ReentrantLock 是 Java 并发包中的一种独占锁，它提供了更加灵活和可定制化的锁实现。相对于 synchronized 关键字，ReentrantLock 可以实现更多高级特性，如可中断锁、公平锁、可限时锁等。

ReentrantLock 的原理是基于 AQS (AbstractQueuedSynchronizer) 实现的。在 ReentrantLock 中，每个锁对象都有一个与之关联的同步器 Sync，Sync 中维护了一个状态 state 和等待队列，用于实现线程的排队、阻塞和唤醒。

在使用 ReentrantLock 时，通过调用 lock() 方法获取锁。如果当前锁没有被其他线程占用，则当前线程获取到锁并继续执行。如果当前锁已经被其他线程占用，则当前线程会被加入到 Sync 的等待队列中进行等待，并且释放 CPU 资源，直到获取到锁后被唤醒。

在 ReentrantLock 中，可以通过调用 unlock() 方法释放锁。如果当前线程是锁的持有者，则释放锁并将状态 state 减 1。如果当前线程不是锁的持有者，则抛出 IllegalMonitorStateException 异常。

需要注意的是，ReentrantLock 是可重入锁，即同一个线程可以多次获取同一个锁而不会产生死锁。这是因为 ReentrantLock 中维护了一个 owner 变量，用于记录当前持有锁的线程。当一个线程多次调用 lock() 方法时，只需要将 state 加 1，并将 owner 设置为当前线程即可。

另外，ReentrantLock 的实现还包括了公平锁和非公平锁两种模式。在公平锁模式下，等待时间最长的线程将获得锁，而在非公平锁模式下，线程可以通过“插队”的方式获取锁，这样可以减少线程的切换开销，但可能会导致某些线程一直无法获取锁。

总之，ReentrantLock 的原理是基于 AQS 实现的，它提供了更加灵活和可定制化的锁机制，适用于各种复杂的并发场景。但使用时需要注意避免死锁和竞态条件等问题。
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/203.png)

### 加锁解锁流程
```java
public ReentrantLock() {
    sync = new NonfairSync();
}
```
NonfairSync 继承自 AQS

没有竞争时：
![没有竞争](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/204.png "没有竞争")
第一个竞争出现时：
![第一个竞争出现时](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/205.png "第一个竞争出现时")
Thread-1 执行了:

1. CAS 尝试将 state 由 0 改为 1，结果失败
2. 进入 tryAcquire 逻辑，这时 state 已经是1，结果仍然失败
3. 接下来进入 addWaiter 逻辑，构造 Node 队列
   1. 图中黄色三角表示该 Node 的 waitStatus 状态，其中 0 为默认正常状态
   2. Node 的创建是懒惰的
   3. 其中第一个 Node 称为 Dummy（哑元）或哨兵，用来占位，并不关联线程![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/206.png)

当前线程进入 acquireQueued 逻辑

1. acquireQueued 会在一个死循环中不断尝试获得锁，失败后进入 park 阻塞
2. 如果自己是紧邻着 head（排第二位），那么再次 tryAcquire 尝试获取锁，当然这时 state 仍为 1，失败
3. 进入 shouldParkAfterFailedAcquire 逻辑，将前驱 node，即 head 的 waitStatus 改为 -1，这次返回 false

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/207.png)

4. shouldParkAfterFailedAcquire 执行完毕回到 acquireQueued ，再次 tryAcquire 尝试获取锁，当然这时
state 仍为 1，失败
5. 当再次进入 shouldParkAfterFailedAcquire 时，这时因为其前驱 node 的 waitStatus 已经是 -1，这次返回
true
6. 进入 parkAndCheckInterrupt， Thread-1 park（灰色表示）

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/208.png)
再次有多个线程经历上述过程竞争失败，变成这个样子

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/209.png)

Thread-0 释放锁，进入 tryRelease 流程，如果成功

- 设置 exclusiveOwnerThread 为 null 
- state = 0

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/210.png)
当前队列不为 null，并且 head 的 waitStatus = -1，进入 unparkSuccessor 流程 
找到队列中离 head 最近的一个 Node（没取消的），unpark 恢复其运行，本例中即为 Thread-1 
回到 Thread-1 的 acquireQueued 流程
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/211.png)
如果加锁成功（没有竞争)，会设置 

- exclusiveOwnerThread 为 Thread-1，state = 1 
- head 指向刚刚 Thread-1 所在的 Node，该 Node 清空 Thread 
- 原本的 head 因为从链表断开，而可被垃圾回收 

如果这时候有其它线程来竞争（非公平的体现），例如这时有 Thread-4 来了
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/212.png)
如果不巧又被 Thread-4 占了先 

- Thread-4 被设置为 exclusiveOwnerThread，state = 1 
- Thread-1 再次进入 acquireQueued 流程，获取锁失败，重新进入 park 阻塞
### 可重入原理

### 可打断原理
### 公平锁实现原理
### 条件变量实现原理
## ReentrantReadWriteLock
ReentrantReadWriteLock（可重入读写锁）是Java提供的一种并发控制机制，用于解决多线程对共享资源进行读写操作的问题。它内部维护了两个锁，一个是读锁（Read Lock），一个是写锁（Write Lock），并且支持锁的重入。

下面是ReentrantReadWriteLock的一些关键原理：

1. 读锁和写锁的互斥性：当一个线程获取写锁时，其他线程无法获取读锁或写锁。这样可以确保在有线程进行写操作时，不会有其他线程同时进行读操作，保证数据的一致性。
2. 读锁的共享性：当没有线程持有写锁时，多个线程可以同时获取读锁。这样可以实现多个线程并发地进行读取操作，提高并发性能。
3. 写锁的独占性：当一个线程获取写锁时，其他线程无法获取读锁或写锁。这样可以确保在有线程进行写操作时，不会有其他线程同时进行读或写操作，保证数据的一致性。
4. 可重入特性：同一个线程可以多次获取读锁或写锁而不会造成死锁。即使线程已经获取了写锁，也可以再次获取写锁，而不会被阻塞，这就是锁的重入特性。
5. 公平性：ReentrantReadWriteLock提供了公平和非公平两种模式。在公平模式下，锁将按照线程请求的顺序进行获取。在非公平模式下，锁的获取是无序的。

通过合理地使用读锁和写锁，ReentrantReadWriteLock可以在读多写少的场景中提供更好的并发性能。它适用于对共享资源进行频繁读操作、较少写操作的情况，可以减少线程竞争，提高系统的吞吐量。

> 注意:使用ReentrantReadWriteLock要避免死锁情况的发生，即在同一个线程中获取写锁后又尝试获取读锁，或者反过来。如果不小心造成了这种情况，可能会导致线程永久阻塞。

## volatile

`volatile` 是一个关键字，用于声明变量，确保该变量在多线程环境下的可见性和有序性。

作用：

- 可见性：当一个线程修改了`volatile`变量的值，其他线程能够立即看到这个修改，避免了数据不一致的问题。 

- 禁止指令重排序：`volatile`关键字可以防止对其修饰的变量相关的操作被重排列，从而保证程序的正确性。

局限性：

- 不保证原子性：`volatile`只能保证变量的可见性和禁止指令重排序，但不能保证原子性。
- 不适用于复合操作：对于复合操作（如`i++`），`volatile` 无法保证线程安全。

> - 写屏障仅仅是保证之后的读能够读到最新的结果，但不能保证读跑到它前面去。
> - 而有序性的保证也只是保证了本线程内相关代码不被重排序。

## final
当一个变量被声明为 final 时，对这个变量的写操作会引入写屏障。这意味着当一个线程对 final 变量进行写操作时，会触发写屏障，确保该变量的写操作对其他线程是可见的。

写屏障的作用包括但不限于以下几点：

1. 写屏障可以防止编译器和处理器对指令进行重排序优化，从而保证 final 变量的赋值操作不会早于其它变量的赋值操作，保证了程序执行的顺序。
2. 写屏障可以将变量的修改立刻刷入主存，而不是暂存在线程的本地缓存中，以确保其他线程能够及时看到这个变量的最新值。
3. 写屏障可以触发内存屏障，从而保证了对共享变量的并发访问是线程安全的。
```java
public class TestFinal {
	final int a = 20;
}
```
```java
0: aload_0
1: invokespecial #1 // Method java/lang/Object."<init>":()V
4: aload_0
5: bipush 20
7: putfield #2 // Field a:I
 <-- 写屏障
10: return
```
发现 final 变量的赋值也会通过 putfield 指令来完成，同样在这条指令之后也会加入写屏障，保证在其它线程读到它的值时不会出现为 0 的情况。
## wait、notify
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/213.png)

- Owner 线程发现条件不满足，调用 wait 方法，即可进入 WaitSet 变为 WAITING 状态 
- BLOCKED 和 WAITING 的线程都处于阻塞状态，不占用 CPU 时间片 
- BLOCKED 线程会在 Owner 线程释放锁时唤醒 
- WAITING 线程会在 Owner 线程调用 notify 或 notifyAll 时唤醒，但唤醒后并不意味者立刻获得锁，仍需进入EntryList 重新竞争
## park、unpark
每个线程都有自己的一个 Parker 对象，由三部分组成 _counter ， _cond 和 _mutex，打个比喻：

- 线程就像一个旅人，Parker 就像他随身携带的背包，条件变量就好比背包中的帐篷。_counter 就好比背包中 的备用干粮（0 为耗尽，1 为充足） 
- 调用 park 就是要看需不需要停下来歇息 
   - 如果备用干粮耗尽，那么钻进帐篷歇息 
   - 如果备用干粮充足，那么不需停留，继续前进 
- 调用 unpark，就好比令干粮充足 
   - 如果这时线程还在帐篷，就唤醒让他继续前进 
   - 如果这时线程还在运行，那么下次他调用 park 时，仅是消耗掉备用干粮，不需停留继续前进 
      - 因为背包空间有限，多次调用 unpark 仅会补充一份备用干粮 

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/214.png)

1. 当前线程调用 Unsafe.park() 方法
2. 检查 _counter ，本情况为 0，这时，获得 _mutex 互斥锁
3. 线程进入 _cond 条件变量阻塞
4. 设置 _counter = 0

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/215.png)

1. 调用 Unsafe.unpark(Thread_0) 方法，设置 _counter 为 1
2. 唤醒 _cond 条件变量中的 Thread_0
3. Thread_0 恢复运行
4. 设置 _counter 为 0

![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/JUC/216.png)

1. 调用 Unsafe.unpark(Thread_0) 方法，设置 _counter 为 1
2. 当前线程调用 Unsafe.park() 方法
3. 检查 _counter ，本情况为 1，这时线程无需阻塞，继续运行
4. 设置 _counter 为 0
## join
`join()`方法的原理是通过调用线程对象的`wait()`方法来实现线程的等待。当一个线程调用另一个线程的`join()`方法时，当前线程会进入等待状态，并释放持有的对象锁。在被等待线程执行完毕后，被等待线程会调用`notifyAll()`方法来唤醒所有等待该线程的线程，使得调用`join()`方法的线程可以继续执行。
```java
t1.join();
```
```java
synchronized (t1) {
    // 调用者线程进入 t1 的 waitSet 等待, 直到 t1 运行结束
    while (t1.isAlive()) {
        t1.wait(0);
    }
}
```
