---
title: 语法（正式版）
shortTitle: 语法（正式版）
description: JDK新版本语法（正式版）
date: 2024-5-27 13:09:16
categories: [Java, basic]
tags: [Java, JDK]
headerDepth: 5
index: true
order: 9
---

## Interface

现在接口中的方法可以用`private`修饰

```java
public interface MyInterface {
    private void methodPrivate() {
    }
}
```

## try-with-resources

`try-with-resources` 语句中可以使用 effectively-final 变量。

被包裹的变量不需要在`finally`块中手动释放了。

```java
Scanner scanner = new Scanner(new File("testRead.txt"));
PrintWriter writer = new PrintWriter(new File("testWrite.txt"))
try (scanner;writer) {
    // ...
}
```

## 进程API

位于 `java.lang.process` 包中，提供了更加灵活和强大的方式来启动、管理和监控本地进程。

- **ProcessHandle：** `ProcessHandle` 接口代表了正在运行的本地进程，可以用于获取进程的PID、父进程、子进程等信息，并提供了一系列方法来操作进程，如终止进程、检查进程是否存活等。

- **ProcessHandle.Info：** `ProcessHandle.Info` 接口提供了关于进程的详细信息，如命令行参数、启动时间、CPU 使用情况等。

- **ProcessHandle.onExit()：** 通过 `onExit()` 方法可以注册一个回调函数，在进程退出时触发执行，从而实现对进程的异步监控和处理。

```java
import java.lang.ProcessHandle;
import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        // 启动一个新的本地进程
        ProcessBuilder builder = new ProcessBuilder("notepad.exe");
        try {
            Process process = builder.start();
            // 获取进程的PID
            ProcessHandle processHandle = process.toHandle();
            long pid = processHandle.pid();
            System.out.println("PID: " + pid);
            
            // 检查进程是否存活
            boolean isAlive = processHandle.isAlive();
            System.out.println("Is alive: " + isAlive);
            
            // 注册进程退出时的回调函数
            processHandle.onExit().thenRun(() -> System.out.println("Process exited"));
            
            // 获取进程的详细信息
            Optional<ProcessHandle.Info> infoOptional = processHandle.info();
            infoOptional.ifPresent(info -> {
                System.out.println("Command line: " + info.command().orElse("N/A"));
                System.out.println("Start time: " + info.startInstant().orElse(null));
                System.out.println("Total CPU time: " + info.totalCpuDuration().orElse(null));
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

这个示例使用 `ProcessBuilder` 启动了一个新的 Notepad 进程，并使用 `ProcessHandle` 获取了进程的PID、命令行参数等信息，同时注册了一个回调函数来监控进程的退出。这样就实现了对本地进程的启动、管理和监控。

## 局部变量类型推断

允许在声明局部变量时使用 var 关键字来推断变量的类型。这种方式可以使代码更加简洁、易读，并且不会损失类型安全性。

- **类型名`var`：** 可以在声明局部变量时使用 var 关键字，编译器会根据初始化表达式推断变量的类型。
- **适用范围：**局部变量类型推断适用于声明局部变量，包括方法内的局部变量、for 循环中的计数器、foreach 循环中的迭代变量、Lambda 表达式。
- **推断规则：**编译器会根据初始化表达式推断变量的类型，推断的类型会根据初始化表达式的类型来确定。
- **不影响代码的类型安全性：**局部变量类型推断不会影响代码的类型安全性，因为变量的类型是由编译器在编译时确定的。

```java
var list = new ArrayList<String>(); // 推断出 ArrayList<String> 类型
var map = new HashMap<Integer, String>(); // 推断出 HashMap<Integer, String> 类型

// 在 for 循环中使用 var
for (var entry : map.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}

// 在 foreach 循环中使用 var
for (var num : new int[]{1, 2, 3, 4, 5}) {
    System.out.println(num);
}

// 方法内的局部变量类型推断
var str = "Hello, world!";
var length = str.length();

// 允许在 Lambda 表达式中使用 var 进行参数声明
Consumer<String> consumer = (var i) -> System.out.println(i);
Consumer<String> consumer = (String i) -> System.out.println(i);
```

> 仅限于局部变量，不适用于方法的参数、方法返回类型、字段、静态变量等其他地方的类型声明。

## instanceof 的模式匹配

instanceof 的模式匹配功能，是对 instanceof 操作符的增强。模式匹配允许在执行 instanceof 操作的同时，将对象转换为指定类型的变量。

```java
// 普通的 instanceof 操作符
if (obj instanceof String) {
    String str = (String) obj;
    System.out.println("String length: " + str.length());
}

// 使用模式匹配的 instanceof 操作符
if (obj instanceof String str) {
    System.out.println("String length: " + str.length());
}
```

## switch表达式

传统 switch 声明语句的弊端：

- 匹配是自上而下的，如果忘记写 break，后面的 case 语句不论匹配与否都会执行；即case 穿透
- 所有的 case 语句共用一个块范围，在不同的 case 语句定义的变量名不能重复；
- 不能在一个 case 里写多个执行结果一致的条件；
- 整个 switch 不能作为表达式返回值；

新版特性：

1. 用箭头(->) 连接条件和表达式，不需要手动用`break`退出，支持多标签，整体可作为表达式返回值

```java
类型 变量名 = switch(变量名) {
    case 条件 -> 表达式;
    case 条件1, 条件2 -> 表达式;	// 多重标签
    default -> 表达式;
}
```

2. 可用`yield`跳出`switch`块返回结果，不返回值则用`break`，若要跳出循环或方法用`return`

```java
int x = 5;
int result = switch (x) {
    case 1, 3, 5 -> {
        System.out.println("Odd number");
        yield x * 2;
    }
    case 2, 4, 6 -> {
        System.out.println("Even number");
        yield x / 2;
    }
    default -> 0;
};
```

3. 模式匹配：直接在 switch 上支持 Object 类型，这就等于同时支持多种类型，使用模式匹配得到具体类型

```java
// 老写法
static String formatter(Object o) {
    String formatted = "unknown";
    if (o instanceof Integer i) {
        formatted = String.format("int %d", i);
    } else if (o instanceof Long l) {
        formatted = String.format("long %d", l);
    } else if (o instanceof Double d) {
        formatted = String.format("double %f", d);
    } else if (o instanceof String s) {
        formatted = String.format("String %s", s);
    }
    return formatted;
}
```

```java
// 新写法
static String formatterPatternSwitch(Object o) {
    return switch (o) {
        case Integer i -> String.format("int %d", i);
        case Long l -> String.format("long %d", l);
        case Double d -> String.format("double %f", d);
        case String s -> String.format("String %s", s);
        default -> o.toString();
    };
}
```

## 文本块

使用`"""`作为文本块的`开始符`和`结束符`，在其中就可以放置多行的字符串，不需要进行任何转义

- 基本使用

```java
"""
line1
line2
line3
"""
// 等同于
"line1\nline2\nline3\n"
// 等同于
"line1\n" +
"line2\n" +
"line3\n"
```

- 转义序列支持

`\b`(退格)、`\f`(换页)和`\n\r`(回车换行)……【可以直接依赖文本块的自动换行】。

```java
String html = """
              <html>
                  <body>
                      <p>Hello, world!\n
                      This is a new line.\b
                      </p>
                  </body>
              </html>
              """;
```

- 内嵌表达式

支持在文本中嵌入表达式,使用`$`符号进行引用

```java
String name = "Alice";
int age = 25;
String info = """
              Name: $name
              Age: $age
              """;
```

- 支持Unicode字符

文本块可以直接包含Unicode字符,无需使用转义序列。这对于支持国际化和多语言的应用程序非常有帮助。

```java
String greeting = """
                  Hola, 你好, नमस्ते!
                  """;
```

## record

Record用于声明不可变的数据承载体。它自动生成构造函数、getter、equals、hashCode和toString方法,使得数据建模和封装变得更加简单和高效。

本质是`final`类，不能够覆盖它自动生成的方法，可以实现接口，但不能被继承。如果需要添加额外的行为,可以在Record中添加方法。

```java
record Circle(double radius) implements Shape {
    public double area() {
        return Math.PI * radius * radius;
    }
}
```

## 密封类

密封类（sealed）限制了可以继承或实现它的子类。这有助于维护类的层次结构和约束类的可扩展性。

语法：

- 定义：`sealed`定义密封类。然后使用`permits`关键字来列出允许继承或实现该密封类的具体子类。

```java
public sealed class Shape permits Circle, Rectangle, Triangle {
    // 密封类的实现
}
```

- 继承：只有在`permits`子句中明确列出的子类才能继承或实现密封类。其他类无法继承或实现该密封类。

```java
public final class Circle extends Shape {
    // Circle类的实现
}
```

- 非密封子类：密封类的子类可以使用`non-sealed`关键字来声明为非密封子类,允许其他类进一步继承。

```java
public non-sealed class Rectangle extends Shape {
    // Rectangle类的实现
}
public class Square extends Rectangle {
    // Square类的实现
}
```

## 虚拟线程

**轻量级：**

- **资源消耗极低**：虚拟线程的栈内存按需分配，且线程创建和切换成本极低（无需操作系统调度）。
- **支持海量并发**：理论上可创建数百万个虚拟线程（传统线程通常受限于操作系统，最多数千个）。

**与平台线程（Platform Threads）的关系：**

- **绑定到平台线程执行**：虚拟线程由 JVM 调度到少量平台线程（即操作系统线程）上运行。
- **非 1:1 映射**：多个虚拟线程可复用一个平台线程（类似协程的“多对多”模型）。

**阻塞无代价：**

- 虚拟线程在 I/O 或锁等待时会被自动挂起（`yield`），释放底层平台线程去执行其他虚拟线程，**避免线程阻塞导致的资源浪费**。

---


|   **特性**   |        **虚拟线程**        |       **平台线程**       |
| :----------: | :------------------------: | :----------------------: |
| **资源占用** |     轻量（KB 级内存）      |    重量（MB 级内存）     |
| **创建数量** |          数百万级          | 数千级（受操作系统限制） |
| **调度管理** |          JVM 管理          |     操作系统内核调度     |
| **阻塞成本** |    无（自动挂起并切换）    |  高（上下文切换开销大）  |
| **适用场景** | I/O 密集型、高并发阻塞任务 |  CPU 密集型、低并发任务  |

---

**使用方法：**

1. 通过 `Thread.startVirtualThread()`

```java
Thread thread = Thread.startVirtualThread(() -> {
    System.out.println("Running in virtual thread");
});
```

2. 使用 `Thread.Builder`

```java
Thread.Builder builder = Thread.ofVirtual().name("virtual-thread-", 1);
Thread vt = builder.start(() -> { /* Task */ });
```

3. 使用虚拟线程池（推荐）

```java
ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
executor.submit(() -> { /* Task */ });
```

---

**注意事项：**

1. **避免在虚拟线程中执行 CPU 密集型任务**
   虚拟线程的目标是优化阻塞操作，CPU 密集型任务仍应使用平台线程池（如 `Executors.newFixedThreadPool()`）。
2. **谨慎使用 `ThreadLocal`**
   虚拟线程的轻量级特性可能导致 `ThreadLocal` 内存泄漏（需确保及时清理）。
3. **与 `synchronized` 的兼容性**
   虚拟线程在 `synchronized` 块内阻塞时，会同时阻塞底层平台线程。建议改用 `ReentrantLock` 以支持更灵活的挂起机制。
4. **Native 方法与 JNI 调用**
   虚拟线程在执行本地方法（Native Method）时无法挂起，可能导致平台线程被占用。
