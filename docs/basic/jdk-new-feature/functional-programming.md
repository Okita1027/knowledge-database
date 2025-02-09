---
title: 函数式编程
shortTitle: 函数式编程
description: Java函数式编程（Lambda、Stream）
date: 2024-05-06 09:06:01
categories: [Java, basic]
tags: [Java]
headerDepth: 4
order: 1
---
## 概念

### 函数化对象

函数本无形，也就是它代表的规则：位置固定、不能传播。

若要有形，让函数的规则能够传播，需要将函数化为对象。

```java
class MyClass {
    static int add(int a, int b) {
        return a + b;
    }
} 
```

```java
public interface Lambda {
    int calculate(int a, int b);
}

Lambda add = (a, b) -> a + b; // 它已经变成了一个 lambda 对象
```

区别

* 前者是纯粹的一条两数加法规则，它的位置是固定的，要使用它，需要通过 `MyClass.add` 找到它，然后执行
* 而后者（add 对象）的位置是可以变化的，想去哪里就去哪里，哪里要用到这条加法规则，把它传递过去
* 接口的目的是为了将来用它来执行函数对象，此接口中**只能有一个方法定义**

函数化为对象的比喻

- 之前是大家要统一去西天取经
- 现在是每个菩萨、罗汉拿着经书，入世传经

> ***P.S.***
>
> * 大部分文献都说 lambda 是匿名函数，但这个说法需要进行补充
> * 至少在 java 里，虽然 lambda 表达式本身不需要起名字，但必须提供一个对应的接口

### 行为参数化
需求：针对一组学生集合，进行筛选
```java title="学生类"
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    private String name;
    private int age;
    private String sex;
}
```
原本的写法
```java
public static void main(String[] args) {
    List<Student> students = List.of(
        new Student("张无忌", 18, "男"),
        new Student("杨不悔", 16, "女"),
        new Student("周芷若", 19, "女"),
        new Student("宋青书", 20, "男")
    );

    System.out.println(filter(students)); // 能得到 张无忌，宋青书
}

static List<Student> filter(List<Student> students) {
    List<Student> result = new ArrayList<>();
    for (Student student : students) {
        if (student.sex.equals("男")) {
            result.add(student);
        }
    }
    return result;
}
```

如果需求再变动一下，要求找到 18 岁以下的学生，则需要修改`filter`方法中的判断条件

| `student.sex.equals("男")` | `student.age <= 18` |
| -------------------------- | ------------------- |

既然只有判断逻辑不同，能否把它作为参数传递进来，这样处理起来不就一致了吗？

```java
static List<Student> filter(List<Student> students, ???) {
    List<Student> result = new ArrayList<>();
    for (Student student : students) {
        if (???) {
            result.add(student);
        }
    }
    return result;
}
```

它俩要判断的逻辑不同，那这两处不同的逻辑必然要用函数来表示，将来这两个函数都需要用到 `student` 对象来判断，都应该返回一个 `boolean` 结果，怎么描述函数的长相呢？

```java
interface StudentFilterLambda {
    boolean filterStudent(Student student);
}
```

`filter`方法可以统一成下述代码

```java
static List<Student> filter(List<Student> students, StudentFilterLambda lambda) {
    List<Student> result = new ArrayList<>();
    for (Student student : students) {
        if (lambda.filterStudent(student)) {
            result.add(student);
        }
    }
    return result;
}
```

这样就无需修改原本的判断方法，也能传递不同的实现了

```java
filter(students, student -> student.sex.equals("男"));
filter(students, student -> student.age <= 18);
filter(students, student -> student.sex.equals("男") && student.age <= 18);
```

### 延迟执行

延迟执行（Lazy Evaluation）指的是推迟表达式的求值，直到需要求值的时候才执行。在延迟执行的情况下，表达式的计算会被推迟到需要结果的时候，这样可以提高程序的性能和效率，避免不必要的计算。

- 特点
  - **推迟计算：**在延迟执行的情况下，表达式的计算不会立即执行，而是在需要结果的时候才进行计算。
  - **惰性计算：** 延迟执行可以看作是一种惰性计算（Lazy Evaluation），即在需要的时候才执行计算，而不是立即计算。
  - **节省资源：** 延迟执行可以节省系统资源，避免不必要的计算，提高程序的性能和效率。

- 应用
  - **Stream API：** Java 8 引入的 Stream API 中的操作都是延迟执行的，只有在终端操作（如 forEach、collect 等）被调用时，中间操作才会执行。
  - **Supplier 接口：** Supplier 接口代表一个延迟执行的计算，只有在调用 get 方法时才会执行计算。
  - **Optional 类：** Optional 类中的方法都是延迟执行的，例如 map、flatMap 等方法。
  - **CompletableFuture 类：** CompletableFuture 类中的异步操作也是延迟执行的，只有在调用 get 方法或者其他终端方法时才会执行异步计算。

- 案例

```java
// 使用 Supplier 接口实现延迟执行
Supplier<Integer> supplier = () -> {
    System.out.println("Calculating...");
    return 10;
};

// 调用 get 方法时才执行计算
int result = supplier.get(); // 输出：Calculating...
System.out.println(result); // 输出：10

// 使用 Stream API 实现延迟执行
List<String> list = Arrays.asList("apple", "banana", "orange");
Stream<String> stream = list.stream().map(s -> {
    System.out.println("Mapping: " + s);
    return s.toUpperCase();
});

// 调用 forEach 方法时才执行中间操作
stream.forEach(System.out::println); // 输出：Mapping: apple，Mapping: banana，Mapping: orange，APPLE，BANANA，ORANGE
```

在上面的示例中，使用 Supplier 接口和 Stream API 实现了延迟执行。在调用 get 方法或 forEach 方法时，才执行实际的计算操作，这样可以实现惰性计算的效果。

## 语法

### 命名规律

* 带有 Unary 是一元的意思，表示一个参数
* 带有 Bi 或 Binary 是二元的意思，表示两个参数
* Ternary 三元
* Quatenary 四元

### 方法引用

用于简化Lambda表达式，能够直接引用已经存在的方法或构造函数作为函数对象。

#### 类名::静态方法

| 作用         | 语法                          |
| ------------ | ----------------------------- |
| 引用静态方法 | `ClassName::staticMethodName` |

```java
// Lambda表达式
Function<Integer, String> converter = x -> Integer.toString(x);
// 静态方法引用
Function<Integer, String> converter = Integer::toString;
```

如何理解：

* 函数对象的逻辑部分是：调用此静态方法
* 因此这个静态方法需要什么参数，函数对象也提供相应的参数即可

```java
public class Type2Test {
    public static void main(String[] args) {
        /*
            需求：挑选出所有男性学生
         */
        Stream.of(
                        new Student("张无忌", "男"),
                        new Student("周芷若", "女"),
                        new Student("宋青书", "男")
                )
                .filter(Type2Test::isMale)
                .forEach(student -> System.out.println(student));
    }

    static boolean isMale(Student student) {
        return student.sex.equals("男");
    }

    record Student(String name, String sex) {
    }
}
```

* filter 这个高阶函数接收的函数类型（Predicate）是：一个 T 类型的入参，一个 boolean 的返回值
  * 因此我们只需要给它提供一个相符合的 lambda 对象即可
* isMale 这个静态方法有入参 Student 对应 T，有返回值 boolean 也能对应上，所以可以直接使用

```
Student[name=张无忌, sex=男]
Student[name=宋青书, sex=男]
```

#### 类名::非静态方法

| 作用                   | 语法                         |
| ---------------------- | ---------------------------- |
| 引用特定对象的实例方法 | `object::instanceMethodName` |

```java
// Lambda表达式
BiPredicate<String, String> equalsIgnoreCase = (str1, str2) -> str1.equalsIgnoreCase(str2);
// 实例方法引用
BiPredicate<String, String> equalsIgnoreCase = String::equalsIgnoreCase;
```

如何理解：

* 函数对象的逻辑部分是：调用此非静态方法
* 因此这个函数对象需要提供一个额外的对象参数，以便能够调用此非静态方法
* 非静态方法的剩余参数，与函数对象的剩余参数一一对应

```java
public class Type3Test {
    public static void main(String[] args) {
        highOrder(Student::hello);
    }

    static void highOrder(Type3 lambda) {
        System.out.println(lambda.transfer(new Student("张三"), "你好"));
    }

    interface Type3 {
        String transfer(Student stu, String message);
    }

    static class Student {
        String name;

        public Student(String name) {
            this.name = name;
        }

        public String hello(String message) {
            return this.name + " say: " + message;
        }
    }
}
```

上例中函数类型的

* 参数1 对应着 hello 方法所属类型 Student
* 参数2 对应着 hello 方法自己的参数 String
* 返回值对应着 hello 方法自己的返回值 String

```
张三 say: 你好
```

#### 对象::非静态方法

| 作用                   | 语法                            |
| ---------------------- | ------------------------------- |
| 引用任意对象的实例方法 | `ClassName::instanceMethodName` |

```java
// Lambda表达式
Function<String, Integer> length = str -> str.length();
// 对象方法引用
Function<String, Integer> length = String::length;
```

如何理解：

* 函数对象的逻辑部分是：调用此非静态方法
* 因为对象已提供，所以不必作为函数对象参数的一部分
* 非静态方法的剩余参数，与函数对象的剩余参数一一对应

```java
public class Type4Test {
    public static void main(String[] args) {
        Util util = new Util(); // 对象
        Stream.of(
            new Student("张无忌", "男"),
            new Student("周芷若", "女"),
            new Student("宋青书", "男")
        )
            .filter(util::isMale)
            .map(util::getName)
            .forEach(student -> System.out.println(student));
    }

    record Student(String name, String sex) {
        boolean isMale() {
            return this.sex.equals("男");
        }
    }

    static class Util {
        boolean isMale(Student student) {
            return student.sex.equals("男");
        }
        String getName(Student student) {
            return student.name();
        }
    }
}
```

较为典型的一个应用就是 `System.out` 对象中的非静态方法，最后的输出可以修改为

```java
.forEach(System.out::println);
```

原因：

* `forEach`  这个高阶函数接收的函数类型（`Consumer`）是一个 `T` 类型参数，`void` 无返回值
* 而 `System.out` 对象中有非静态方法 `void println(Object x)` 与之一致，因此可以将此方法化为 `lambda` 对象给 `forEach` 使用

#### 类名::new

| 作用               | 语法                  |
| ------------------ | --------------------- |
| 引用构造函数       | `ClassName::new`      |
| 引用数组构造函数   | `TypeName[]::new`     |
| 引用超类的构造函数 | `SuperClassName::new` |

1. 构造方法引用

```java
// Lambda表达式
Supplier<StringBuilder> stringBuilderSupplier = () -> new StringBuilder();
// 构造方法引用
Supplier<StringBuilder> stringBuilderSupplier = StringBuilder::new;
```

2. 数组构造方法引用

```java
// Lambda表达式
Function<Integer, int[]> arrayCreator = size -> new int[size];
// 数组构造方法引用
Function<Integer, int[]> arrayCreator = int[]::new;
```

3. 超类构造方法引用

```java
// Lambda表达式
Function<String, Object> objectCreator = str -> new Object(str);
// 超类构造方法引用
Function<String, Object> objectCreator = Object::new;
```

函数类型应满足

* 参数部分与构造方法参数一致
* 返回值类型与构造方法所在类一致

```java
public class Type5Test {
    static class Student {
        private final String name;
        private final int age;

        public Student() {
            this.name = "某人";
            this.age = 18;
        }

        public Student(String name) {
            this.name = name;
            this.age = 18;
        }

        public Student(String name, int age) {
            this.name = name;
            this.age = age;
        }

        @Override
        public String toString() {
            return "Student{" +
                "name='" + name + '\'' +
                ", age=" + age +
                '}';
        }
    }

    interface Type51 {
        Student create();
    }

    interface Type52 {
        Student create(String name);
    }

    interface Type53 {
        Student create(String name, int age);
    }

    public static void main(String[] args) {
        hiOrder((Type51) Student::new);
        hiOrder((Type52) Student::new);
        hiOrder((Type53) Student::new);
    }

    static void hiOrder(Type51 creator) {
        System.out.println(creator.create());
    }

    static void hiOrder(Type52 creator) {
        System.out.println(creator.create("张三"));
    }

    static void hiOrder(Type53 creator) {
        System.out.println(creator.create("李四", 20));
    }
}
```

#### this::非静态方法

形式2的特例，只能在类内部使用

```java
public class Type6Test {
    public static void main(String[] args) {
        Util util = new UtilExt();
        util.hiOrder(Stream.of(
            new Student("张无忌", "男"),
            new Student("周芷若", "女"),
            new Student("宋青书", "男")
        ));
    }

    record Student(String name, String sex) {

    }

    static class Util {
        boolean isMale(Student student) {
            return student.sex.equals("男");
        }

        boolean isFemale(Student student) {
            return student.sex.equals("女");
        }

        void hiOrder(Stream<Student> stream) {
            stream
                .filter(this::isMale)
                .forEach(System.out::println);
        }
    }
}
```

#### super::非静态方法

形式2的特例，只能在类内部使用（用在要用 `super` 区分重载方法时）

```java
public class Type6Test {

    //...

    static class UtilExt extends Util {
        void hiOrder(Stream<Student> stream) {
            stream
                .filter(super::isFemale)
                .forEach(System.out::println);
        }
    }
}
```

#### 特例

函数接口和方法引用之间，可以差一个返回值

```java
public class ExceptionTest {
    public static void main(String[] args) {
        Runnable task1 = ExceptionTest::print1;
        Runnable task2 = ExceptionTest::print2;
    }
    
    static void print1() {
        System.out.println("task1 running...");
    }

    static int print2() {
        System.out.println("task2 running...");
        return 1;
    }
}
```

`Runnable` 接口不需要返回值，而实际的函数对象多出了返回值，不影响使用

### 闭包

闭包函数是指在一个函数内部定义的函数，并且该内部函数可以访问到外部函数的变量。这意味着，闭包函数可以“记住”并访问其创建时所在环境的状态。即**函数对象**与**外界变量**绑定在一起，形成的整体。

```java title="案例1"
public class ClosureExample {

    public static void main(String[] args) {
        int x = 10;
        // Lambda表达式和匿名内部类可以捕获外部作用域的变量，因此它们可以看作是闭包函数的实现
        // 定义一个Lambda表达式作为闭包函数
        Runnable runnable = () -> System.out.println("x = " + x);
        // 在定义外部调用闭包函数
        runnable.run(); // 输出：x = 10
    }
}
```

```java title="案例2"
public class ClosureTest1 {
    interface Lambda {
        int add(int y);
    }
    
    public static void main(String[] args) {
        int x = 10;

        highOrder(y -> x + y);
    }

    static void highOrder(Lambda lambda) {
        System.out.println(lambda.add(20));
    }
}
```

注意点

- 局部变量 x 必须是 final 或 effective final 的，effective final 意思就是，虽然没有用 final 修饰，但就像是用 final 修饰了一样，不能重新赋值，否则就语法错误。
- 闭包是一种给函数执行提供数据的手段，函数执行既可以使用函数入参，还可以使用闭包变量。

### 柯里化

柯里化（Currying）是一种将多参数函数转换为一系列单参数函数的技术。

如果一个函数有多个参数，可以将这个函数转换为一个接受单个参数并返回另一个函数的序列。每个返回的函数都接受下一个参数，并返回另一个函数，直到接收到所有参数为止，最后返回最终结果。

好处：

- **增加函数的灵活性：** 柯里化可以将多参数函数转换为接受单个参数的函数序列，这样可以更灵活地调用函数。例如，可以先传递一部分参数，然后稍后再传递其余参数，这使得函数的使用更加灵活。
- **提高代码的可读性和模块化：** 使用柯里化可以将函数的逻辑分解为一系列单一功能的函数，这样使得代码更易于理解和维护。每个函数只负责处理一个参数，降低了函数的复杂性。
- **实现部分应用：** 柯里化使得部分应用变得更加容易。部分应用是指固定函数的一部分参数，并返回一个接受剩余参数的新函数。这在需要多次调用带有相同参数的函数时非常有用。
- **函数组合：** 柯里化与函数组合结合使用时可以实现强大的功能。函数组合是指将一个函数的输出作为另一个函数的输入，柯里化可以使得这种组合更加简洁和灵活。

---

前后对比:

```java title="函数定义"
// 不使用柯里化
public int add(int x, int y) {
    return x + y;
}
// 使用柯里化模拟
public IntFunction<Integer> curriedAdd(int x) {
    return y -> x + y;
}
```

这个例子中创建了一个 `IntFunction<Integer>` 类型的方法 `curriedAdd`，它接受一个整数作为参数，并返回一个接受另一个整数并返回整数的函数。

```java title="函数使用"
// 不使用柯里化
int result = add(3, 5); // 直接传递所有参数
System.out.println(result); // 输出: 8

// 使用柯里化模拟
IntFunction<Integer> addThree = curriedAdd(3); // 先传递部分参数
int result = addThree.apply(5); // 然后传递剩余参数
System.out.println(result); // 输出: 8
```

> 在Java中柯里化不如在函数式编程语言中那么直接，但通过使用 lambda 表达式和函数接口，我们可以实现类似柯里化的效果，使得函数的使用更加灵活和方便。

---

一些示例:

```java
public class CurryingTest1 {
    public static void main(String[] args) {
        highOrder(a -> b -> a + b);

        // 完全展开
        Step1 step1 = new Step1() {
            @Override
            public Step2 exec(int a) {
                return new Step2() {
                    @Override
                    public int exec(int b) {
                        return b + a;
                    }
                };
            }
        };
        // 简写
        step1 = a -> b -> a + b;
    }

    static void highOrder(Step1 step1) {
        Step2 step2 = step1.exec(10);
        System.out.println(step2.exec(20));
        System.out.println(step2.exec(50));
    }

    @FunctionalInterface
    interface Step1 {
        Step2 exec(int a);
    }

    @FunctionalInterface
    interface Step2 {
        int exec(int b);
    }
}
```

```java
public class CurryingTest2 {

    // 柯里化函数，接受两个参数并返回它们的和
    static Function<Integer, Function<Integer, Integer>> add =
            x -> y -> x + y;

    public static void main(String[] args) {
        // 第一次调用返回一个函数
        Function<Integer, Integer> add2 = add.apply(2);
        // 第二次调用返回最终结果
        int result = add2.apply(3);
        System.out.println("Result: " + result); // 输出: Result: 5
    }

}
```

```java
public class CurryingTest3 {
    // 柯里化函数，接受商品价格并返回一个函数
    static DoubleFunction<Function<Integer, DoubleFunction<Double>>> calculateTotalPrice =
            price -> quantity -> discountRate -> price * quantity * (1 - discountRate);

    public static void main(String[] args) {
        // 计算价格的柯里化函数
        Function<Integer, DoubleFunction<Double>> calculatePrice = calculateTotalPrice.apply(10.0); // 商品价格为10元

        // 第一次调用，传递商品数量
        DoubleFunction<Double> calculateWithQuantity = calculatePrice.apply(5); // 购买5件商品

        // 第二次调用，传递折扣率
        double totalPrice = calculateWithQuantity.apply(0.1); // 10% 折扣率
        System.out.println("Total Price: " + totalPrice); // 输出: Total Price: 45.0
    }
}
```

### 高阶函数

定义：该函数是其它函数对象的使用者

作用：

- 将**通用、复杂**的逻辑隐含在**高阶函数**内
- 将**易变、未定**的逻辑放在外部的**函数对象**中

案例：

```java
public class Main {
    public static int operateOnNumbers(int a, int b, IntBinaryOperator operator) {
        return operator.applyAsInt(a, b);
    }

    public static void main(String[] args) {
        // 定义一个加法函数
        IntBinaryOperator addition = (x, y) -> x + y;
        
        // 使用 operateOnNumbers 函数调用加法函数
        int result = operateOnNumbers(5, 3, addition);
        System.out.println("Result of addition: " + result); // 输出: Result of addition: 8
        
        // 定义一个乘法函数
        IntBinaryOperator multiplication = (x, y) -> x * y;
        
        // 使用 operateOnNumbers 函数调用乘法函数
        result = operateOnNumbers(5, 3, multiplication);
        System.out.println("Result of multiplication: " + result); // 输出: Result of multiplication: 15
    }
}
```

`operateOnNumbers` 函数就是一个高阶函数，它接受两个整数和一个 `IntBinaryOperator` 类型的操作函数作为参数。然后，根据传入的操作函数，将两个整数应用到这个操作函数上，并返回结果。

其中定义了两个操作函数，一个用于加法，另一个用于乘法，并通过 `operateOnNumbers` 函数分别调用它们。这样就实现了在不同的情况下，使用同一个高阶函数来执行不同的操作。

## Stream
<a href="https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/functional-programming/StreamAPI.html"  download="StreamAPI.html">下载StreamAPI速查表</a>


### 特性

1. 一次使用：流只能使用一次（终结方法只能调用一次）

2. 两类操作：
   1. 中间操作，lazy 懒惰的
   2. 终结操作，eager 迫切的

3. 方法参数都是函数式接口类型

4. Stream 不保存数据，不改变数据源

   ![Stream操作流程](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/functional-programming/stream.png)

### 基本流

基本类型流指 IntStream、LongStream 和 DoubleStream，它们在做数值计算时有更好的性能。

转换成基本流

* mapToInt
* mapToLong
* mapToDouble
* flatMapToInt
* flatMapToLong
* flatMapToDouble
* mapMultiToInt
* mapMultiToLong
* mapMultiToDouble

基本流转对象流

* mapToObj
* boxed

### 效率

#### 数组求和

* primitive 用 loop 循环对 int 求和
* intStream 用 IntStream 对 int 求和
* boxed 用 loop 循环对 Integer 求和
* stream 用 Stream 对 Integer 求和

<center>元素个数 100</center>

| Benchmark        | Mode | Cnt  | Score (ns/op) | Error (ns/op) | Units |
| ---------------- | ---- | ---- | ------------- | ------------- | ----- |
| T01Sum.primitive | avgt | 5    | 25.424        | ± 0.782       | ns/op |
| T01Sum.intStream | avgt | 5    | 47.482        | ± 1.145       | ns/op |
| T01Sum.boxed     | avgt | 5    | 72.457        | ± 4.136       | ns/op |
| T01Sum.stream    | avgt | 5    | 465.141       | ± 4.891       | ns/op |

<center>元素个数 1000</center>

| Benchmark        | Mode | Cnt  | Score (ns/op) | Error (ns/op) | Units |
| ---------------- | ---- | ---- | ------------- | ------------- | ----- |
| T01Sum.primitive | avgt | 5    | 270.556       | ± 1.277       | ns/op |
| T01Sum.intStream | avgt | 5    | 292.467       | ± 10.987      | ns/op |
| T01Sum.boxed     | avgt | 5    | 583.929       | ± 57.338      | ns/op |
| T01Sum.stream    | avgt | 5    | 5948.294      | ± 2209.211    | ns/op |

<center>元素个数 10000</center>

| Benchmark        | Mode | Cnt  | Score (ns/op) | Error (ns/op) | Units |
| ---------------- | ---- | ---- | ------------- | ------------- | ----- |
| T01Sum.primitive | avgt | 5    | 2681.651      | ± 12.614      | ns/op |
| T01Sum.intStream | avgt | 5    | 2718.408      | ± 52.418      | ns/op |
| T01Sum.boxed     | avgt | 5    | 6391.285      | ± 358.154     | ns/op |
| T01Sum.stream    | avgt | 5    | 44414.884     | ± 3213.055    | ns/op |

结论：

* 优先挑选基本流（IntStream 等）
* 应当避免普通流（Stream）性能与其它几种相比，慢一个数量级

#### 求最大值

* custom 自定义多线程并行求最大值
* parallel 并行流求最大值
* sequence 串行流求最大值
* primitive loop 循环求最大值

<center>元素个数 100</center>

| Benchmark             | Mode | Cnt  | Score (ns/op) | Error (ns/op) | Units |
| --------------------- | ---- | ---- | ------------- | ------------- | ----- |
| T02Parallel.custom    | avgt | 5    | 39619.796     | ± 1263.036    | ns/op |
| T02Parallel.parallel  | avgt | 5    | 6754.239      | ± 79.894      | ns/op |
| T02Parallel.primitive | avgt | 5    | 29.538        | ± 3.056       | ns/op |
| T02Parallel.sequence  | avgt | 5    | 80.170        | ± 1.940       | ns/op |

<center>元素个数 10000</center>

| Benchmark             | Mode | Cnt  | Score (ns/op) | Error (ns/op) | Units |
| --------------------- | ---- | ---- | ------------- | ------------- | ----- |
| T02Parallel.custom    | avgt | 5    | 41656.093     | ± 1537.237    | ns/op |
| T02Parallel.parallel  | avgt | 5    | 11218.573     | ± 1994.863    | ns/op |
| T02Parallel.primitive | avgt | 5    | 2217.562      | ± 80.981      | ns/op |
| T02Parallel.sequence  | avgt | 5    | 5682.482      | ± 264.645     | ns/op |

<center>元素个数 1000000</center>

| Benchmark             | Mode | Cnt  | Score (ns/op) | Error (ns/op) | Units |
| --------------------- | ---- | ---- | ------------- | ------------- | ----- |
| T02Parallel.custom    | avgt | 5    | 194984.564    | ± 25794.484   | ns/op |
| T02Parallel.parallel  | avgt | 5    | 298940.794    | ± 31944.959   | ns/op |
| T02Parallel.primitive | avgt | 5    | 325178.873    | ± 81314.981   | ns/op |
| T02Parallel.sequence  | avgt | 5    | 618274.062    | ± 5867.812    | ns/op |

并行流

- 相对自己用多线程实现分而治之更简洁
- 只有在数据量非常大时，才能充分发力，数据量少，还不如用串行流

#### 并行（发）收集

<center>元素个数 100</center>

| Benchmark            | Mode | Cnt  | Score (ns/op) | Error (ns/op) | Units |
| -------------------- | ---- | ---- | ------------- | ------------- | ----- |
| loop1                | avgt | 5    | 1312.389      | ±  90.683     | ns/op |
| loop2                | avgt | 5    | 1776.391      | ± 255.271     | ns/op |
| sequence             | avgt | 5    | 1727.739      | ±  28.821     | ns/op |
| parallelNoConcurrent | avgt | 5    | 27654.004     | ± 496.970     | ns/op |
| parallelConcurrent   | avgt | 5    | 16320.113     | ± 344.766     | ns/op |

<center>元素个数 10000</center>

| Benchmark            | Mode | Cnt  | Score (ns/op) | Error (ns/op) | Units |
| -------------------- | ---- | ---- | ------------- | ------------- | ----- |
| loop1                | avgt | 5    | 211526.546    | ± 13549.703   | ns/op |
| loop2                | avgt | 5    | 203794.146    | ± 3525.972    | ns/op |
| sequence             | avgt | 5    | 237688.651    | ±  7593.483   | ns/op |
| parallelNoConcurrent | avgt | 5    | 527203.976    | ±  3496.107   | ns/op |
| parallelConcurrent   | avgt | 5    | 369630.728    | ± 20549.731   | ns/op |

<center>元素个数 1000000</center>

| Benchmark            | Mode | Cnt  | Score (ms/op) | Error (ms/op) | Units |
| -------------------- | ---- | ---- | ------------- | ------------- | ----- |
| loop1                | avgt | 5    | 69.154        | ± 3.456       | ms/op |
| loop2                | avgt | 5    | 83.815        | ± 2.307       | ms/op |
| sequence             | avgt | 5    | 103.585       | ± 0.834       | ns/op |
| parallelNoConcurrent | avgt | 5    | 167.032       | ± 15.406      | ms/op |
| parallelConcurrent   | avgt | 5    | 52.326        | ± 1.501       | ms/op |

并行（发）收集

* sequence 是一个容器单线程收集，数据量少时性能占优
* parallelNoConcurrent 是多个容器多线程并行收集，时间应该花费在合并容器上，性能最差
* parallelConcurrent 是一个容器多线程并发收集，在数据量大时性能较优

### 常见操作

#### 构建

根据已有的数组构建流

```java
Arrays.stream(array)
```

根据已有的 Collection 构建流（包括 List，Set 等）

```java
List.of("a","b","c").stream()
```

把一个对象变成流

```java
Stream.of("d")
```

把多个对象变成流

```java
Stream.of("x", "y")
```

合并2个流

```java
Stream.concat(流1, 流2)
Stream.concat(Stream.of("a","b","c"), Stream.of("d"))
```

#### 生成

生成从 0 ~ 9 的数字

```java
IntStream.range(0, 10)
IntStream.rangeClosed(0, 9)
```

`iterate`定制化：

```java
// 生成奇数序列
IntStream.iterate(1, x -> x + 2)
IntStream.iterate(1, x -> x < 10, x -> x + 2)
```

* 参数1 是初始值
* 参数2 是一个特殊 Function，即参数类型与返回值相同，它会根据上一个元素 x 的值计算出当前元素
* 第一种需要用 `limit` 限制元素个数

> iterate 的特点是根据上一个元素计算当前元素，如果不需要依赖上一个元素，可以改用 generate 方法

```java
// 生成5个随机整数
Stream.generate(()-> ThreadLocalRandom.current().nextInt()).limit(5)
// 更简单的方法
ThreadLocalRandom.current().ints(5)
// 指定上下限：生成从 0~9 的100个随机数
ThreadLocalRandom.current().ints(100, 0, 10)
```

#### 截取

```java
Stream.concat(Stream.of("a", "b", "c"), Stream.of("d"))
    .skip(1)	// 跳过1个元素
    .limit(2)	// 限制处理的元素个数
```

- `.dropWhile()` 是 drop 流中元素，直到条件不成立，留下剩余元素
- `.takeWhile()` 是 take 流中元素，直到条件不成立，舍弃剩余元素

#### 过滤

```java
record Fruit(String cname, String name, String category, String color) { }

Stream.of(
    new Fruit("草莓", "Strawberry", "浆果", "红色"),
    new Fruit("桑葚", "Mulberry", "浆果", "紫色"),
    new Fruit("杨梅", "Waxberry", "浆果", "红色"),
    new Fruit("核桃", "Walnut", "坚果", "棕色"),
    new Fruit("草莓", "Peanut", "坚果", "棕色"),
    new Fruit("蓝莓", "Blueberry", "浆果", "蓝色")
)
```

![莓果](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/functional-programming/filter.png)
- 找到所有浆果

```java
.filter(f -> f.category.equals("浆果"))
```
- 找到蓝色浆果
```java
// 方法1
.filter(f -> f.category().equals("浆果") && f.color().equals("蓝色"))
// 方法2：让每个 lambda 只做一件事，两次 filter 相对于并且关系
.filter(f -> f.category.equals("浆果"))
.filter(f -> f.color().equals("蓝色"))
// 方法3：让每个 lambda 只做一件事，不过比方法2强的地方可以 or，and，nagate 运算
.filter(((Predicate<Fruit>) f -> f.category.equals("浆果")).and(f -> f.color().equals("蓝色")))
```

#### 映射

![image-20240526173943535](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/functional-programming/map.png)

```java
.map(f -> f.cname() + "酱")
```

#### 降维

![image-20240526180747155](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/functional-programming/flatmap.png)

案例1：把坚果和浆果两个集合变成了含六个元素的水果流

```java
Stream.of(
        List.of(
                new Fruit("草莓", "Strawberry", "浆果", "红色"),
                new Fruit("桑葚", "Mulberry", "浆果", "紫色"),
                new Fruit("杨梅", "Waxberry", "浆果", "红色"),
                new Fruit("蓝莓", "Blueberry", "浆果", "蓝色")
        ),
        List.of(
                new Fruit("核桃", "Walnut", "坚果", "棕色"),
                new Fruit("草莓", "Peanut", "坚果", "棕色")
        )
)
.flatMap(Collection::stream)
```

案例2：把两个有三个元素的订单流，变成了一个有六个元素的商品流

```java
Stream.of(
        new Order(1, List.of(
                new Item(6499, 1, "HUAWEI MateBook 14s"),
                new Item(6999, 1, "HUAWEI Mate 60 Pro"),
                new Item(1488, 1, "HUAWEI WATCH GT 4")
        )),
        new Order(1, List.of(
                new Item(8999, 1, "Apple MacBook Air 13"),
                new Item(7999, 1, "Apple iPhone 15 Pro"),
                new Item(2999, 1, "Apple Watch Series 9")
        ))
)
.flatMap(order -> order.items().stream())
```

#### 排序、去重

```java title="当前数据"
record Hero(String name, int strength) { }

Stream.of(
    new Hero("独孤求败", 100),
    new Hero("令狐冲", 90),
    new Hero("风清扬", 98),
    new Hero("东方不败", 98),
    new Hero("方证", 92),
    new Hero("任我行", 92),
    new Hero("冲虚", 90),
    new Hero("向问天", 88),
    new Hero("不戒", 88)
)
```

首先按 strength 武力排序（逆序），武力相同的，按姓名长度排序（正序）

```java
// 仅使用 lambda 
.sorted((a,b)-> {
    int res = Integer.compare(b.strength(), a.strength());
    return (res == 0) ? Integer.compare(a.nameLength(), b.nameLength()) : res; 
})
```

```java
// 方法引用
.sorted(
    Comparator.comparingInt(Hero::strength)
      .reversed()
      .thenComparingInt(Hero::nameLength)
)
```

* `comparingInt` 接收一个 key 提取器（说明按对象中哪部分来比较），返回一个比较器
* `reversed` 返回一个顺序相反的比较器
* `thenComparingInt` 接收一个 key 提取器，返回一个新比较器，新比较器在原有比较器结果相等时执行新的比较逻辑

#### 查找、判断

```java 
int[] array = {1, 3, 5, 4, 7, 6, 9};
// 找到流中任意一个 偶数
Arrays.stream(array)
    .filter(x -> (x & 1) == 0)
    .findAny()
    .ifPresent(System.out::println);
```

* 注意 `findAny` 返回的是 `OptionalInt` 对象，因为可能流中不存在偶数
* 对于 `OptionalInt` 对象，一般需要用 `ifPresent` 或 `orElse`（提供默认值）来处理

与 `findAny` 比较类似的是 `firstFirst`，它俩的区别

* `findAny` 是找在流中任意位置的元素，不需要考虑顺序，对于上例返回 6 也是可以的
* `findFirst` 是找第一个出现在元素，需要考虑顺序，对于上例只能返回 4
* `findAny` 在顺序流中与 `findFirst` 表现相同，区别在于并行流下会更快



判断流中是否存在任意一个偶数

```java
Arrays.stream(array).anyMatch(x -> (x & 1) == 0)
```

- 它返回的是 boolean 值，可以直接用来判断



判断流是否全部是偶数

```java
Arrays.stream(array).allMatch(x -> (x & 1) == 0)
```

- 它返回的是 boolean 值，可以直接用来判断



判断流是否全部不是偶数

```java
Arrays.stream(array).noneMatch(x -> (x & 1) == 0)
```

* `noneMatch` 与 `allMatch` 含义恰好相反

#### 化简

`reduce(init, (p,x) -> r)`

* init 代表初始值
* `(p,x) -> r` 是一个 BinaryOperator，作用是根据上次化简结果 p 和当前元素 x，得到本次化简结果 r

这样两两化简，可以将流中的所有元素合并成一个结果

```java
Stream<Integer> numbers = Stream.of(1, 2, 3, 4, 5);
// 使用累加器函数计算总和
int sum = numbers.reduce(0, (acc, curr) -> acc + curr);
System.out.println("Sum: " + sum); // 输出: Sum: 15

Stream<String> words = Stream.of("Hello", "world", "from", "reduce");
// 使用初始值和累加器函数将字符串连接成一个单一的字符串
String concatenatedString = words.reduce("", (acc, curr) -> acc + " " + curr);
System.out.println("Concatenated String: " + concatenatedString); // 输出: Concatenated String:  Hello world from reduce
```

#### 收集

##### collect

`collect(supplier, accumulator, combiner)`

* `supplier` 是描述如何创建收集容器 c ：`()-> c`
* `accumulator` 是描述如何向容器 c 添加元素 x：`(c, x) -> void`
* `combiner` 是描述如何合并两个容器：`(c1, c2) -> void`
  * 串行流下不需要合并容器
  * 并行流如果用的是并发容器，也不需要合并

```java
List<String> names = Arrays.asList("Alice", "Bob", "Charlie");
List<String> collectedList = names.stream()
        .filter(name -> name.length() > 4)
        .collect(Collectors.toList());	// 可以直接.toList()
System.out.println("collectedList = " + collectedList);	// collectedList = [Alice, Charlie]
```

##### 收集器

Collectors提供了很多收集器，<a href="https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/functional-programming/StreamAPI.html"  download="StreamAPI.html">下载StreamAPI速查表</a>

##### 下游收集器

做 groupingBy 分组收集时，组内可能需要进一步的数据收集，称为下游收集器，<a href="https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/functional-programming/StreamAPI.html"  download="StreamAPI.html">下载StreamAPI速查表</a>

## 原理

### Lambda

Lambda表达式底层是通过**invokedynamic指令**和**动态创建的私有方法**来实现的。invokedynamic指令允许在运行时动态解析方法调用。而Lambda表达式则是通过javac编译器在编译时生成一个私有静态方法,并将这个方法作为目标方法传递给invokedynamic指令。

当一个Lambda表达式被创建时,javac编译器会做以下几件事:

1. 生成私有静态方法
   - 编译器会为每个Lambda表达式生成一个私有静态方法,并将Lambda的实现代码放入该方法中。

2. 生成Lambda$xxxxx类 
   - 编译器会创建一个私有静态内部类，继承自`java.lang.Object`，并且实现相应的函数式接口，这个内部类称为`Lambda$xxxxx`类（xxxxx是编号）。

3. 实现函数式接口方法
   - 在Lambda$xxxxx中实现函数式接口的方法,并在其中调用第1步生成的私有静态方法。

4. 创建Lambda$xxxxx实例
   - 在程序使用Lambda表达式的地方,实际上是创建了Lambda$xxxxx类的实例。

5. 调用invokedynamic指令
   - 通过invokedynamic指令动态链接第3步实现的函数式接口方法。

下面是一个简化的Lambda表达式示例,可以更直观地看到其实现过程:

```java
interface Runnable {
    void run();
}

public class LambdaExample {
    public static void main(String[] args) {
        Runnable r = () -> System.out.println("Hello Lambda");
        r.run(); // 输出 "Hello Lambda"
    }
}
```

对于上面的代码,javac编译器会完成以下步骤:

1. 生成一个私有静态方法: `private static void lambda$main$0()`
2. 生成一个`Lambda$1`类,实现`Runnable`接口
3. 在`Lambda$1`中实现`run()`方法,其中调用`lambda$main$0()`
4. 在`main`方法中,创建`Lambda$1`实例,赋值给 `r`
5. 调用`r.run()`时,通过`invokedynamic`指令动态链接到`Lambda$1.run()`方法

### 方法引用

和Lambda表达式类似,都是基于invokedynamic指令。但与Lambda不同的是,方法引用更进一步地优化和简化了Lambda表达式的实现。

当使用方法引用时,javac编译器会执行以下步骤:

1. **生成Lambda$xxxxx类**
   - 与Lambda表达式一样,编译器会为每个方法引用生成一个私有静态内部类`Lambda$xxxxx`,继承自`java.lang.Object`。

2. **生成静态帮助方法**
   - 编译器会生成一个私有静态帮助方法(private static helper method)作为方法引用的入口点。这个帮助方法会根据不同的方法引用类型(静态方法、实例方法、构造方法、数组构造方法)调用对应的目标方法。

3. **在Lambda$xxxxx中实现函数式接口方法**
   - 与Lambda表达式类似,在Lambda$xxxxx类中实现函数式接口的方法,但这次它直接调用第2步生成的帮助方法。

4. **创建Lambda$xxxxx实例**
   - 在程序使用方法引用的地方,实际上是创建了Lambda$xxxxx类的实例。

5. **调用invokedynamic指令**
   - 通过invokedynamic指令动态链接第3步实现的函数式接口方法。

一个简单的示例:

```java
interface Function<T, R> {
    R apply(T t);
}

public class MethodReferenceExample {
    public static void main(String[] args) {
        Function<String, Integer> f = Integer::parseInt;
        int result = f.apply("123");
        System.out.println(result); // 输出 123
    }
}
```

对于上面的代码,javac编译器会执行以下步骤:

1. 生成一个`Lambda$1`类
2. 生成一个私有静态帮助方法`lambda$main$0`,它会调用`Integer.parseInt(String)`方法
3. 在`Lambda$1`类中实现`apply`方法,调用`lambda$main$0`帮助方法
4. 在`main`方法中,创建`Lambda$1`实例,赋值给`f`
5. 调用`f.apply("123")`时,通过`invokedynamic`指令动态链接到`Lambda$1.apply()`方法

### 闭包

闭包的实现主要依赖于以下两个机制:

1. **成员内部类**
2. **常量池**

当一个内部类被实例化时,无论是匿名类还是命名内部类,它都会捕获所在外部类实例的引用,这使得内部类可以访问外部类的成员变量和方法。而常量池则用于存储外部变量的值。

当编译器遇到一个内部类(包括匿名类)时,它会执行以下步骤:

1. **生成一个独立的.class文件**
   为内部类生成一个独立的.class文件,文件名格式为"外部类名$内部类名.class"。
2. **捕获外部类实例引用**
   在内部类的构造方法中,会捕获并存储一份指向外部类实例的引用。
3. **捕获外部变量**
   如果内部类访问了外部类的成员变量,编译器会将这些变量复制到内部类中,并将其标记为final。如果外部变量是实例变量,则直接存储引用;如果是方法参数或局部变量,则将其值存储到内部类的常量池中。
4. **访问外部变量**
   当内部类访问外部变量时,实际上是访问存储在自身实例中或常量池中的值。

这三种情况下闭包(匿名内部类)的底层实现原理虽然都是通过匿名内部类和常量池来实现的,但是在具体的实现细节上还是有一些不同之处。

**情况一**:

```java
final int x = 10;
public Runnable createCounter(final int y) {
    return new Runnable() {
        @Override
        public void run() {
            int z = x + y; // 捕获 x 和 y
            System.out.println(z);
        }
    };
}
```

在这种情况下:

1. `x`是方法外部的局部变量,被声明为`final`。
2. 编译器会将`x`的值直接复制到匿名内部类的常量池中。
3. 方法参数`y`的值也会被复制到匿名内部类的常量池中。
4. 在运行时,匿名内部类可以直接从常量池中获取`x`和`y`的值。

**情况二**:

```java
public Runnable createCounter(final int y) {
    final int x = 20;
    return new Runnable() {
        @Override
        public void run() {
            int z = x + y; // 捕获 x 和 y
            System.out.println(z);
        }
    };
}
```

在这种情况下:

1. `x`是方法内部的局部变量,被声明为`final`。
2. 编译器会将`x`的值复制到匿名内部类的常量池中。
3. 方法参数`y`的值也会被复制到匿名内部类的常量池中。
4. 在运行时,匿名内部类可以直接从常量池中获取`x`和`y`的值。

**情况三**:

```java
static class Number {
    public final int x = 30;
}

public Runnable createCounter(final int y) {
    Number number = new Number();
    final int x = number.x;
    return new Runnable() {
        @Override
        public void run() {
            int z = x + y; // 捕获 x 和 y
            System.out.println(z);
        }
    };
}
```

在这种情况下:

1. `Number`类的`x`属性的值被赋给了局部变量`x`。
2. 编译器会将局部变量`x`的值复制到匿名内部类的常量池中。
3. 方法参数`y`的值也会被复制到匿名内部类的常量池中。
4. 在运行时,匿名内部类可以直接从常量池中获取局部变量`x`和方法参数`y`的值。

不同之处在于:

1. 对于方法外部的局部变量(情况一),编译器会直接将其值复制到常量池中。
2. 对于方法内部的局部变量(情况二和三),编译器会先将其值赋给一个临时的`final`变量,然后再将这个`final`变量的值复制到常量池中。

### Stream

**构建原理**

通常有以下几种方式可以构建Stream:

1. **集合(Collection)** 
可以通过集合的stream()或parallelStream()方法获取Stream。

2. **数组(Array)**
可以通过Arrays.stream(array)或Stream.of(array)方法获取Stream。

3. **文件(File)**
可以通过Files.lines()方法从文件中获取行Stream。

4. **生成器(Generator)**
可以通过Stream.generate()或Stream.iterate()方法创建无限Stream。

无论哪种构建方式,底层都是创建了一个Spliterator(分割迭代器)来支持Stream的运作。Spliterator负责对数据源进行切分和遍历,Stream只是对Spliterator进行了一层抽象。

**切分原理**

Stream的核心优势之一就是能够进行有效的并行处理,这依赖于数据源能够被合理切分。Stream通过Spliterator来切分数据源:

1. **创建头部节点(Head)**
构建Stream时会根据数据源创建一个голов�节点(Head)Spliterator。

2. **判断是否需要切分(trySplit)**
对当前Spliterator调用trySplit()方法,判断是否需要切分。如果数据源足够大,就可以进行切分,否则就不切分。

3. **切分数据源(trySplit)** 
如果需要切分,则通过trySplit()方法将数据源一分为二,生成一个新的Spliterator作为分支节点(Node)。

4. **构建树形结构(binarySplit)**
重复上述过程,构建树形结构,直到数据源足够小,即不可再切分。

5. **执行并行任务(forEach)** 
在每个叶节点上执行forEach遍历任务,完成Stream的并行处理。

这种通过平衡树来切分数据源的方式,可以充分利用CPU多核并行处理能力,大大提高了Stream的运行效率。

不同数据源的切分策略不同,ArrayList通过位移计算进行平均切分,LinkedList通过节点步进切分,IntStream则通过splitRange()切分计算区间。