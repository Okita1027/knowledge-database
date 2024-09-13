---
title: 基础
shortTitle: 基础
description: 
date: 2024-06-17 19:15:41
categories: [PHP]
tags: []
---
## 安装配置

[PHP安装配置(Windows和Linux)-一篇就够了-腾讯云开发者社区-腾讯云](https://cloud.tencent.com/developer/article/1705262)

### Windows

1. 下载、解压缩
2. 修改Apache服务器的httpd.conf文件，添加以下行
```nginx
#加载PHP
LoadModule php_module 'E:/PHP/php8apache2_4.dll'

#将PHP配置文件加载到Apache配置文件中，共同生效
PHPIniDir 'E:/PHP'

#配置Apache分配工作给PHP模块，把PHP代码交给PHP处理
#即.php后缀名的文件
AddType application/x-httpd-php .php
```
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/php/202406171907515.png)

3. 复制PHP目录下的`php.ini-development`改名为`php.ini`
4. 测试配置`httpd -M`

![有橙色代表成功](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/php/202406171907491.png "有橙色代表成功")

5. 使用PHP：在Apache的`htdocs`目录下新建php文件，启动Apache服务后使用`localhost/XXX.php`访问
### Linux

## 基础
### 变量
#### 标识符
在PHP中，变量以 $ 符号开始，后面跟着变量的名称
```php
<?php
  $txt = "Hello world!";
  $x = 5;
  $y = 10.5;
?>
```
> 与其他编程语言不同，PHP 没有用于声明变量的命令。它是在您第一次为其赋值时创建的`$num = 1;`。

#### 作用域
在 PHP 中，变量的作用域决定了在哪里可以访问这个变量。PHP 中的变量作用域可以分为以下几种：

1.  **局部作用域（Local Scope）**： 
   - 当一个变量在函数内部声明时，其作用域仅限于该函数内部。
   - 它仅在函数内部可用，函数外部无法访问。
```php
function testFunction() {
    $localVar = "I'm local!";
    echo $localVar; // 正确，变量在作用域内
}
echo $localVar; // 错误，变量在作用域外
```

2.  **全局作用域（Global Scope）**： 
   - 在函数之外声明的变量具有全局作用域。
   - 这些变量在整个脚本中任何地方都可访问，除了函数内部。
```php
$globalVar = "I'm global!";

function testFunction() {
    echo $globalVar; // 错误，函数内部不可直接访问全局变量
}

echo $globalVar; // 正确，变量在作用域内
```

   - 要在函数内部访问全局变量，需要使用 `global` 关键字或者使用 `$GLOBALS` 数组。
```php
$globalVar = "I'm global!";

function testFunction() {
    global $globalVar;
    echo $globalVar; // 正确，通过 global 关键字访问

    // 或者
    echo $GLOBALS['globalVar']; // 正确，通过 $GLOBALS 数组访问
}
testFunction();
```

3.  **静态作用域（Static Scope）**： 
   - 当一个变量在函数内部声明为 `static` 时，它在函数调用之间保持其值。
   - 静态变量**仅在局部函数作用域中存在**，但它们不会在函数调用完成后失去值。
```php
function testFunction() {
    static $staticVar = 0;
    echo $staticVar;
    $staticVar++;
}

testFunction(); // 输出 0
testFunction(); // 输出 1
testFunction(); // 输出 2
```

4.  **参数作用域（Function Parameter Scope）**： 
   - 函数参数在函数内部作为局部变量，其作用域限于函数体内。
```php
function testFunction($param) {
    echo $param; // 正确，$param 在函数作用域内
}
testFunction("I'm a parameter!");
echo $param; // 错误，$param 在作用域外
```
### 常量
在 PHP 中，常量是一个简单值的标识符。一旦常量被定义，它就不能被重新定义或取消定义。常量可以是任何的标量数据类型，即 integer、float、string 或 boolean。它们在脚本的执行期间不会改变。
#### 定义常量
常量通过使用 `define()` 函数来定义，或者使用 `const` 关键字在类定义之外的任何地方定义。常量的名称通常使用大写字母。
使用 `define()` 函数定义常量：
```php
define("SITE_URL", "https://www.example.com");
```
使用 `const` 关键字定义常量：
```php
const API_KEY = "123456";
```
#### 访问常量
访问常量不需要在其名称前加美元符号（`$`），这是因为常量与变量不同。可以直接使用常量名来访问它的值：
```php
echo SITE_URL; // 输出 https://www.example.com
echo API_KEY;  // 输出 123456
```
#### 魔术常量
[PHP Constants](https://www.w3schools.com/php/php_magic_constants.asp)
PHP 提供了一组预定义的常量，通常称为魔术常量。这些特殊的常量会根据它们在代码中的位置改变自己的值。例如：

- `__LINE__` - 文件中的当前行号。
- `__FILE__` - 完整的文件路径和文件名。
- `__DIR__` - 文件所在的目录。如果用在被包括文件中，则返回被包括的文件所在的目录。
- `__FUNCTION__` - 函数名称。
- `__CLASS__` - 类的名称。
- `__METHOD__` - 类的方法名。
- `__NAMESPACE__` - 当前命名空间的名称。

魔术常量的例子：
```php
echo __LINE__; // 输出当前的行号
echo __FILE__; // 输出该文件的完整路径
```
#### 常量的特点

- 常量默认为全局范围，可以在脚本的任何位置访问，包括函数和方法内部。
- 常量值只能是标量数据类型。
- 常量名不需要使用美元符号前缀（`$`）。
- 一旦定义，常量的值就不能改变或取消定义。
- 常量名区分大小写，尽管传统上常量名总是大写。
#### 类常量
类常量可以在类的定义中使用 `const` 关键字定义。类常量是属于类的，必须通过类名来访问它们，不能通过对象实例访问。
```php
class MyClass {
    const CONSTANT = 'constant value';
}

echo MyClass::CONSTANT; // 输出 'constant value'
```
常量提供了一个便捷的方式来组织和使用不变的值，使得代码更加模块化和易于维护。
### echo、print
在 PHP 中，`echo` 和 `print` 都是用来输出字符串到页面上的构造语言。尽管它们在功能上非常相似，但在使用方式和技术上有一些微小的差别：
#### **echo**

- `echo` 是一个语言结构，可以不用括号直接跟着要输出的字符串。
- 它可以接受一个或多个字符串作为参数（使用逗号 `,` 分隔）。
- `echo` 没有返回值，无法作为表达式的一部分使用。
- 性能上，`echo` 略快于 `print`，因为它不返回任何值。
```php
echo "Hello, World!";
echo "This ", "string ", "was ", "made ", "with multiple parameters.";
```
#### **print**

- `print` 同样是一个语言结构，但它只能接受一个参数，并且总是返回 1。
- `print` 可以使用括号，但这不是必需的。
- 由于 `print` 有返回值，它可以在表达式中使用。
```php
print "Hello, World!";
$result = print "This string was made with print."; // $result 会被赋值为 1
```
#### **print_r() **
`print_r()` 是 PHP 中一个内置函数，用于调试和检查变量的内容，使其以人类可读的格式呈现。
**目的:**

- 以便于人类理解的方式打印有关变量的信息。
- 适用于检查数组、对象、字符串和其他数据类型的结构和内容。

**语法:**
```php
print_r(mixed $value, bool $return = false): string|bool
```

- **$value:** 要检查的变量。
- **$return (可选):** 一个布尔值。默认为 `false`。 
   - 如果为 `true`，则函数返回格式化字符串，而不是直接打印。

**输出:**

- 输出格式取决于变量的数据类型: 
   - **字符串:** 直接显示字符串值。
   - **整数:** 显示整数的值。
   - **浮点数:** 显示浮点数的值。
   - **数组:** 显示数组结构，包括键和值。
   - **对象:** 显示对象的属性及其值。

**示例:**
```php
$fruits = array("苹果", "香蕉", "橘子");
print_r($fruits);
```
这将输出类似以下内容:
```
数组
(
    [0] => 苹果
    [1] => 香蕉
    [2] => 橘子
)
```
**要点:**

- `print_r()` 对于调试复杂数据结构（例如嵌套数组或对象）特别有用。
- 它还可以用于比较两个变量的内容，以查看它们是否相同。
- 虽然 `print_r()` 提供了良好的概述，但对于有关变量的更详细信息，请考虑使用 `var_dump()`。
### 数据类型
PHP 支持多种数据类型，它们可以大致分为三类：标量类型、复合类型和特殊类型。
#### 标量类型

1.  **Boolean（布尔型）**： 
   - 表示逻辑上的真或假。
   - 可以使用 `true` 或 `false` 两个关键字来赋值。
```php
$isTrue = true;
$isFalse = false;
```

2.  **Integer（整型）**： 
   - 表示没有小数的数字。
   - 可以是十进制、十六进制、八进制或二进制。
```php
$decimal = 1234;
$hexadecimal = 0x1A;
$octal = 01234;
$binary = 0b111111;
```

3.  **Float（浮点型）** 或 **double**： 
   - 表示有小数部分的数字或者是指数形式的数字。
```php
$float = 1.234;
$scientific = 0.1234E4;
```

4.  **String（字符串型）**： 
   - 表示一串字符序列。
   - 可以用单引号或双引号定义，双引号内部的变量和特殊字符（如换行 `\n`）会被解析。
```php
$singleQuoted = 'This is a string';
$doubleQuoted = "This is also a string";
```
#### 复合类型

1.  **Array（数组）**： 
   - 表示多个值的集合，可以通过键来访问这些值。
   - 键可以是整数（索引数组）或字符串（关联数组）。
```php
$array = array(1, 2, 3);
$assocArray = array("first" => 1, "second" => 2);
```

2.  **Object（对象）**： 
   - 表示一个类的实例。
   - 必须通过 `class` 定义类之后，才能创建该类的对象。
```php
class MyClass {
    public $prop1 = "I'm a class property!";
}

$obj = new MyClass;
```
#### 特殊类型

1.  **Resource（资源）**： 
   - 用来保存外部资源的引用，例如数据库连接、文件句柄等。
   - 资源由专门的函数来创建和使用，不能直接创建。
```php
$file = fopen("somefile.txt", "r");
```

2.  **NULL（空类型）**： 
   - 表示变量没有值。
   - 变量可以被显式地赋值为 `null`，或者未赋值前它们就是 `null`。
```php
$var = NULL;
```
#### var_dump
`var_dump()` 是 PHP 中用于输出变量的详细信息的函数，包括变量的数据类型和值。当你需要调试代码或者查看某个变量包含的数据时，它是非常有用的。
`var_dump()` 可以接受一个或多个参数，每个参数都会被独立地输出其信息。
以下是 `var_dump()` 函数的一些基本用法：
```php
$intVar = 123;
$floatVar = 123.456;
$stringVar = "Hello, World!";
$arrayVar = array(1, 2, 3);
$nullVar = NULL;

var_dump($intVar);      // 输出 int(123)
var_dump($floatVar);    // 输出 float(123.456)
var_dump($stringVar);   // 输出 string(13) "Hello, World!"
var_dump($arrayVar);    // 输出 array(3) { [0]=> int(1) [1]=> int(2) [2]=> int(3) }
var_dump($nullVar);     // 输出 NULL
```
如果你同时传递多个变量给 `var_dump()`，它会依次输出每个变量的信息：
```php
var_dump($intVar, $stringVar);
// 输出：
// int(123)
// string(13) "Hello, World!"
```
此外，`var_dump()` 对于输出对象的信息也非常有用，它会显示对象的属性及其值，还有对象的类名：
```php
class MyObject {
    public $property = 'value';
}

$myObject = new MyObject();
var_dump($myObject);
// 输出：
// object(MyObject)#1 (1) {
//   ["property"]=>
//   string(5) "value"
// }
```
`var_dump()` 是一个不返回值的函数，它直接输出到输出流（通常是浏览器或控制台）。如果你需要捕获 `var_dump()` 的输出，可以使用输出控制函数 `ob_start()`, `ob_get_clean()` 等来缓冲输出。
请注意，`var_dump()` 输出的信息是面向开发者的，因此在生产环境中，通常不应该使用它来输出任何信息。
### 字符串函数
#### 函数
> [W3School：PHP String Functions](https://www.w3schools.com/php/php_ref_string.asp)
> [W3School中文站：PHP String 字符串函数](https://www.w3ccoo.com/php/php_ref_string.html)

PHP 提供了一系列强大的字符串处理函数，可以执行各种操作，如字符串搜索、替换、比较、格式化和分割等。以下是一些常用的字符串函数：

1.  **strlen** - 获取字符串长度。 
```php
echo strlen("Hello World!"); // 输出 12
```

2.  **strpos** - 查找字符串首次出现的位置（区分大小写）。 
```php
echo strpos("Hello World!", "World"); // 输出 6
```

3.  **stripos** - 查找字符串首次出现的位置（不区分大小写）。 
```php
echo stripos("Hello World!", "world"); // 输出 6
```

4.  **strrpos** - 查找字符串最后出现的位置（区分大小写）。 
```php
echo strrpos("Hello World! World", "World"); // 输出 13
```

5.  **str_replace** - 替换字符串中的一些字符（区分大小写）。 
```php
echo str_replace("World", "PHP", "Hello World!"); // 输出 Hello PHP!
```

6.  **str_ireplace** - 替换字符串中的一些字符（不区分大小写）。 
```php
echo str_ireplace("world", "PHP", "Hello World!"); // 输出 Hello PHP!
```

7.  **substr** - 返回字符串的一部分。 
```php
echo substr("Hello World!", 6, 5); // 输出 World
```

8.  **strtolower** - 把字符串转换为小写。 
```php
echo strtolower("Hello WORLD!"); // 输出 hello world!
```

9.  **strtoupper** - 把字符串转换为大写。 
```php
echo strtoupper("Hello world!"); // 输出 HELLO WORLD!
```

10.  **ucfirst** - 把字符串的首个字符转换为大写。 
```php
echo ucfirst("hello world!"); // 输出 Hello world!
```

11.  **ucwords** - 把字符串中每个单词的首字符转换为大写。 
```php
echo ucwords("hello world!"); // 输出 Hello World!
```

12.  **trim** - 去除字符串首尾的空白字符。 
```php
echo trim("   Hello World!   "); // 输出 Hello World!
```

13.  **ltrim** - 去除字符串左侧的空白字符。 
```php
echo ltrim("   Hello World!"); // 输出 Hello World!
```

14.  **rtrim** - 去除字符串右侧的空白字符。 
```php
echo rtrim("Hello World!   "); // 输出 Hello World!
```

15.  **str_split** - 把字符串分割到数组中。 
```php
print_r(str_split("Hello", 2)); // 输出 Array ( [0] => He [1] => ll [2] => o )
```

16.  **explode** - 使用一个字符串分割另一个字符串。 
```php
print_r(explode(" ", "Hello World!")); // 输出 Array ( [0] => Hello [1] => World! )
```

17.  **implode** - 将一个一维数组的值转化为字符串。 
```php
echo implode(" ", array("Hello", "World!")); // 输出 Hello World!
```

18.  **strcmp** - 比较两个字符串（区分大小写）。 
```php
echo strcmp("Hello World!", "Hello World!"); // 输出 0
```

19.  **strcasecmp** - 比较两个字符串（不区分大小写）。 
```php
echo strcasecmp("Hello World!", "hello world!"); // 输出 0
```

20.  **number_format** - 以千位分隔符方式格式化数字。 
```php
echo number_format("1000000", 2); // 输出 1,000,000.00
```
#### 数字字符串
PHP `is_numeric()` 函数可用于查找变量是否为数字。 如果变量是数字或数字字符串，该函数返回 true，否则返回 false。
> 从 PHP 7.0 开始：`is_numeric()` 函数将对十六进制形式的数字字符串（例如 0xf4c3b00c）返回 FALSE，因为它们不再被视为数字字符串。

### 数值
在 PHP 中，处理数值主要涉及整数（integers）和浮点数（floats，也称为 doubles）。以下是一些与数值处理相关的基础知识和操作。
#### 整数 (Integer)
整数是没有小数的数字。PHP中的整数可以是十进制（基数 10）、十六进制（基数 16，以 `0x` 开头）、八进制（基数 8，以 `0` 开头）或二进制（基数 2，以 `0b` 开头）。
```php
$decimal = 1234; // 十进制数
$octal = 0123;   // 八进制数
$hex = 0x1AB;    // 十六进制数
$binary = 0b11111111; // 二进制数
```
#### 浮点数 (Float)
浮点数是带小数部分的数字。它们也可以用科学计数法表示，例如 `1.2e3` 相当于 `1.2 x 10^3` 或 `1200`。
```php
$float = 1.234;
$scientific = 1.2e3;
$scientific_negative = 7E-10;
```
float 数据类型通常可以存储高达 1.7976931348623E+308 的值（取决于平台），并且最大精度为 14 位。
PHP 有以下函数来检查变量的类型是否为浮点数：
`is_float()`
`is_double()` -`is_float()`的别名
##### 无限
大于 PHP_FLOAT_MAX 的数值被认为是无限的。
PHP 具有以下函数来检查数值是有限还是无限：

- [is_finite()](https://www.w3ccoo.com/php/func_math_is_finite.html)
- [is_infinite()](https://www.w3ccoo.com/php/func_math_is_infinite.html)
##### NAN
NaN 代表非数字。
NaN 用于不可能的数学运算。
PHP 有以下函数来检查一个值是否不是数字：

- [is_nan()](https://www.w3ccoo.com/php/func_math_is_nan.html)
#### 类型转换
在 PHP 中，数值类型之间的转换可以自动进行，也可以显式进行。
```php
$num = "12.34";
$int = (int)$num; // 强制转换为整数，$int 是 12
$float = (float)$num; // 强制转换为浮点数，$float 是 12.34
```
#### 数值函数
PHP 还提供了一些用于处理数值的函数

- `number_format()` 用于格式化数值，使其更易读。
```php
echo number_format("1000000"); // 输出 1,000,000
echo number_format("1000000", 2, ".", ","); // 输出 1,000,000.00
```

- `is_int()` 或 `is_integer()` 函数用于检查变量是否为整数。
- `is_float()` 或 `is_double()` 函数用于检查变量是否为浮点数。
```php
$int = 123;
$float = 1.234;

var_dump(is_int($int)); // 输出 bool(true)
var_dump(is_float($float)); // 输出 bool(true)
```
#### **数学函数**

- `pi()` - 返回PI的值
- `abs()` - 绝对值
- `ceil()` - 向上取整
- `floor()` - 向下取整
- `round()` - 四舍五入
- `min()` - 找出最小值
- `max()` - 找出最大值
- `rand()` - 生成随机整数
- `mt_rand()` - 生成更好的随机整数
```php
echo abs(-1.5); // 输出 1.5
echo ceil(2.4); // 输出 3
echo floor(2.9); // 输出 2
echo round(2.5); // 输出 3
echo min(2, 3, 1); // 输出 1
echo max(2, 3, 1); // 输出 3
echo rand(1, 10); // 输出 1 到 10 之间的一个随机整数
echo mt_rand(1, 10); // 输出 1 到 10 之间的一个更好的随机整数
```
`min()` 和 `max()` 函数可用于在 参数列表：
```php
<?php
echo(min(0, 150, 30, 20, -8, -200));  // returns -200
echo(max(0, 150, 30, 20, -8, -200));  // returns 150
?>
```
##### 随机数
在 PHP 中，`rand()` 和 `mt_rand()` 都是用来生成随机数的函数。它们的主要区别在于生成随机数所用的算法不同，这导致了它们在性能和随机性方面有所差异

1. `rand()`

`rand()` 函数是 PHP 中较早的随机数生成函数。它使用 libc 提供的随机数发生器。`rand()` 在不同的操作系统和不同版本的 PHP 中可能表现不一致，随机数生成的质量和性能也可能不同。基本用法如下：
```php
$randomNumber = rand(); // 生成一个随机整数
$randomNumberInRange = rand(0, 10); // 生成一个在[0, 10]范围内的随机整数
```

2. `mt_rand()`

`mt_rand()` 函数是基于 Mersenne Twister 算法实现的，提供更快且更好的随机数生成。它在 PHP 4.2.0 以后成为了默认的随机数发生器。由于 Mersenne Twister 算法的统计随机性质比 `rand()` 函数提供的 libc 随机数发生器要好，所以 `mt_rand()` 被认为是产生随机数的更好选择。它的基本用法与 `rand()` 类似：
```php
$randomNumber = mt_rand(); // 生成一个随机整数
$randomNumberInRange = mt_rand(0, 10); // 生成一个在[0, 10]范围内的随机整数
```

3. 总结和推荐
- `mt_rand()` 比 `rand()` 速度更快。
- `mt_rand()` 生成的随机数质量更高。
- 由于以上两点，通常建议使用 `mt_rand()` 而不是 `rand()`。

从 PHP 7.1.0 开始，PHP 引入了新的随机数发生器 API：`random_int()` 和 `random_bytes()`。这些新函数旨在提供**加密安全**的随机数生成，更加适合安全敏感的用途。如果你需要生成加密安全的随机数，应该使用这些新的函数：
```php
$secureRandomNumber = random_int(0, 10); // 生成一个在[0, 10]范围内的加密安全的随机整数
```
如果不是出于加密安全的目的，对于一般的随机数需求，`mt_rand()` 是一个比 `rand()` 更好的选项。
### 运算符
#### 基本运算
PHP 提供了一系列数学运算符和数学函数来处理数值运算。
**运算符**:

- 加法: `+`
- 减法: `-`
- 乘法: `*`
- 除法: `/`
- 取余: `%`
- 幂运算: `**`
```php
echo 1 + 2; // 输出 3
echo 2 * 3; // 输出 6
echo 10 % 3; // 输出 1
echo 2 ** 3; // 输出 8
```
#### 位运算符
用于对整数进行位级操作。

- 按位与 (&): `$a & $b`
- 按位或 (|): `$a | $b`
- 按位异或 (^): `$a ^ $b`
- 按位非 (~): `~$a`
- 左移 (<<): `$a << $b`
- 右移 (>>): `$a >> $b`
#### 逻辑运算
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/php/202406171909501.png)
#### 比较运算
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/php/202406171909464.png)
#### 字符串运算符
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/php/202406171909109.png)
#### 数组运算符
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/php/202406171909311.png)
#### 三元运算符
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/php/202406171909204.png)
#### 错误控制运算符
用于错误抑制。

- 抑制符 (@): @$a 会忽略错误消息。
#### 类型运算符
用于检查对象类型。

- instanceof: $a instanceof MyClass
### 流程控制
#### 条件语句

-  `if` 语句：根据条件的真假来执行不同的代码块。 
```php
if ($condition) {
    // 当 $condition 为 true 时执行
} elseif ($anotherCondition) {
    // 当 $anotherCondition 为 true 时执行
} else {
    // 当所有条件都不为 true 时执行
}
```

-  `switch` 语句：根据一个变量的值与一系列的值进行比较，执行相应的代码块。 
```php
switch ($variable) {
    case 'value1':
        // 当 $variable 等于 value1 时执行
        break;
    case 'value2':
        // 当 $variable 等于 value2 时执行
        break;
    default:
        // 当 $variable 不等于任何 case 中的值时执行
}
```
#### 循环语句

-  `while` 循环：只要指定的条件为真，就重复执行代码块。 
```php
while ($condition) {
    // 只要 $condition 为 true 就一直执行
}
```

-  `do-while` 循环：至少执行一次代码块，然后只要条件为真就重复执行。 
```php
do {
    // 先执行一次，然后检查 $condition
} while ($condition);
```

-  `for` 循环：指定初始化、条件和迭代参数，然后执行代码块。 
```php
for ($i = 0; $i < 10; $i++) {
    // 对 $i 进行初始化，检查条件，然后执行并迭代
}
```
  `foreach` 循环：遍历数组或对象中的每个元素。 
```php
foreach ($array as $value) {
    // 对 $array 中的每个元素执行
}

// 或者获取键值对
foreach ($array as $key => $value) {
    // 对 $array 中的每个元素执行，并获取键名
}
```
#### 跳转语句

-  `break` 语句：中断当前循环或 `switch` 语句的执行。 
```php
break;
```
  `continue` 语句：跳过当前循环的剩余代码，并根据条件测试继续下一次循环。 
```php
continue;
```
  `goto` 语句：直接跳转到程序中的另一个位置。 
```php
goto label;
// ...
label:
```
#### 异常处理

-  `try-catch` 语句：尝试执行代码块，并捕获可能发生的异常。 
```php
try {
    // 尝试执行代码
} catch (Exception $e) {
    // 捕获异常
}
```
#### 其他

-  `declare` 结构：用于设定一段代码的执行指令。例如，`ticks` 用于在每个 tick 中执行代码。 
```php
declare(ticks=1) {
    // 每个 tick 执行的代码
}
```

-  `return` 语句：从函数中返回一个值并结束函数的执行。 
```php
return $value;
```
### 函数
#### 创建函数
在 PHP 中，可以使用 `function` 关键字来定义一个函数。下面是一个简单的函数定义的示例：
```php
function sayHello() {
    echo "Hello, World!";
}
```
#### 带参数的函数
函数可以接受参数，这些参数用于在函数体内传递数据或值：
```php
function greet($name) {
    echo "Hello, " . $name . "!";
}
```
#### 返回值
函数可以通过 `return` 语句返回一个值。当 `return` 被执行时，函数的执行将结束，并返回指定的值：
```php
function add($a, $b) {
    return $a + $b;
}
```
#### 调用函数
定义函数后，可以通过函数名和括号来调用它。如果函数定义了参数，需要在调用时提供实际的参数值：
```php
sayHello(); // 输出：Hello, World!

greet("Alice"); // 输出：Hello, Alice!

$result = add(5, 10); // $result 现在是 15
```
#### 默认参数值
函数参数可以有默认值。如果在调用函数时没有提供参数，将使用默认值：
```php
function setTemperature($temperature = 20) {
    echo "The temperature is " . $temperature . "°C";
}

setTemperature(25); // 输出：The temperature is 25°C
setTemperature(); // 输出：The temperature is 20°C
```
#### 可变参数列表
如果你想让一个函数接受任意数量的参数，可以使用可变参数列表：
```php
function sum(...$numbers) {
    $total = 0;
    foreach ($numbers as $number) {
        $total += $number;
    }
    return $total;
}

echo sum(1, 2); // 输出 3
echo sum(1, 2, 3, 4, 5); // 输出 15
```
#### 通过引用传递参数
默认情况下，函数参数是通过值传递的，这意味着函数内对参数的修改不会影响到外部变量。如果想要函数能够修改外部变量的值，可以通过引用`&`传递参数：
```php
function addFive(&$number) {
    $number += 5;
}

$value = 10;
addFive($value);
echo $value; // 输出 15
```
#### 匿名函数（闭包）
匿名函数，也称为闭包，是没有指定名称的函数。它们通常用于回调函数参数和变量赋值：
```php
$greet = function($name) {
    return "Hello " . $name . "!";
};

echo $greet("John"); // 输出：Hello John!
```
### 数组
在 PHP 中，数组是一种复合数据类型，可以存储多个值。数组中的每个值称为元素，每个元素由一个键（key）和一个值（value）组成。数组可以有数字索引或字符串索引。
#### 创建数组
可以使用 `array()` 函数或 `[]` 短数组语法来创建数组：
```php
// 使用 array() 函数
$fruits = array('apple', 'banana', 'cherry');

// 使用 [] 短数组语法
$colors = ['red', 'green', 'blue'];
```
#### 索引数组
索引数组用连续的整数作为键（key）。在没有指定键的情况下，数组的键会自动分配，并从 0 开始：
```php
$numbers = [1, 2, 3, 4, 5];
echo $numbers[0]; // 输出 1
```
#### 关联数组
关联数组使用您指定的键（通常是字符串）：
```php
$age = [
    'Peter' => 20,
    'John' => 25,
    'Jane' => 22
];

echo $age['John']; // 输出 25
```
将多个项添加到关联数组：
```php
$cars = array("brand" => "Ford", "model" => "Mustang");
$cars += ["color" => "red", "year" => 1964];
```
#### 多维数组
数组的元素也可以是另一个数组，这样就形成了多维数组：
```php
$matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

echo $matrix[1][1]; // 输出 5
```
#### 遍历数组
可以使用循环来遍历数组：
```php
// 遍历索引数组
$colors = ['red', 'green', 'blue'];
foreach ($colors as $color) {
    echo $color . "\n";
}
// 释放$color
unset($color);

// 遍历关联数组
$age = [
    'Peter' => 20,
    'John' => 25,
    'Jane' => 22
];
foreach ($age as $name => $age) {
    echo $name . " is " . $age . " years old.\n";
}
```
> 遍历完成之后最好使用`unset($xxx)`释放清除变量。

```php
$cars = array("Volvo", "BMW", "Toyota");
unset($cars[1]);
echo $cars[0];
// echo $cars[1];
echo $cars[2];
```
> `unset`函数不会重新排列索引， 这意味着删除后，数组将不再包含缺少的索引。

#### 常用数组函数
PHP 提供了许多数组操作的内置函数：

- `count($array)` - 计算数组中的元素数量
- `array_push($array, $value)` - 向数组末尾添加一个或多个元素
- `array_pop($array)` - 弹出并返回数组的**最后一个**元素
- `array_shift($array)` - 弹出并返回数组的**第一个**元素
- `array_unshift($array, $value)` - 在数组开头插入一个或多个元素
- `array_merge($array1, $array2)` - 合并一个或多个数组
- `array_slice($array, $offset, $length)` - 从数组中取出一段
- `**array_splice**($input, $offset, $length, $replacement)` - 把数组中的一部分去掉并用其他值取代；`$replacement`可以为空以删除`$length`个元素。
- `sort($array)` - 对数组进行升序排序
- `rsort($array)` - 对数组进行降序排序
- `asort($array)` - 对关联数组按照值进行升序排序，并保持索引关系
- `ksort($array)` - 对关联数组按照键进行升序排序
- `array_map($callback, $array)` - 对数组中的每个元素应用回调函数
- `array_filter($array, $callback)` - 使用回调函数过滤数组中的元素
- `array_reduce($array, $callback, $initial)` - 用回调函数迭代地将数组简化为单一的值
- `array_key_exists($key, $array)` - 检查给定的键或索引是否存在于数组中
- `in_array($value, $array)` - 检查数组中是否存在某个值
- `array_keys($array)` - 返回数组中所有的键
- `array_values($array)` - 返回数组中所有的值
- `array_flip($array)` - 交换数组中的键和值
- `array_combine($keys, $values)` - 创建一个数组，用一个数组的值作为其键名，另一个数组的值作为其值
- `array_diff($array1, $array2)` - 计算数组的差集
- `array_intersect($array1, $array2)` - 计算数组的交集
- `array_unique($array)` - 移除数组中的重复的值
- `array_search($value, $array)` - 在数组中搜索给定的值，并返回首个相应的键名
- `array_multisort($array)` - 对多个数组或多维数组进行排序
- `array_rand($array, $num)` - 从数组中随机取出一个或多个单元
- `list($var1, $var2, ...) = $array` - 把数组中的值赋给一些变量
### 超级全局变量
#### `$GLOBALS`
`$GLOBALS` 这种全局变量用于在 PHP 脚本中的任意位置访问全局变量（从函数或方法中均可）。
PHP 在名为 `$GLOBALS[index]` 的数组中存储了所有全局变量。变量的名字就是数组的键。
下面的例子展示了如何使用超级全局变量 `$GLOBALS`
```php
<?php
$x = 75;
$y = 25;
 
function addition() {
  $GLOBALS['z'] = $GLOBALS['x'] + $GLOBALS['y'];
}
 
addition();
echo $z;
?>
```
#### `$_SERVER`
`$_SERVER` 是一个包含了 **报头、路径和脚本位置**等的数组。这个数组由 Web 服务器创建，并且它的内容可以根据服务器的不同而有所差异。
常见的 `$_SERVER` 数组的索引包括：

- `$_SERVER['HTTP_HOST']` - 当前请求的主机名。
- `$_SERVER['REQUEST_METHOD']` - 页面请求的方法，如 `GET` 或 `POST`。
- `$_SERVER['REQUEST_URI']` - URL 中的路径。
- `$_SERVER['SCRIPT_FILENAME']` - 执行脚本的绝对路径。
- `$_SERVER['SERVER_NAME']` - 服务器名。
- `$_SERVER['SERVER_PORT']` - 服务器端口号。
- `$_SERVER['REMOTE_ADDR']` - 用户的 IP 地址。

![image](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/php/202406171909025.png)
![image](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/php/202406171909655.png "$_SERVER中最重要的元素")
#### `$_REQUEST`
`$_REQUEST` 用于收集 HTML 表单提交的数据。
`$_REQUEST` 默认包含了 `$_GET`、`$_POST` 和 `$_COOKIE` 的内容。它用于收集提交到脚本的数据，无论是通过 GET 请求、POST 请求还是 cookies。
```php
<html>
<body>

<form method="post" action="<?php echo $_SERVER['PHP_SELF'];?>">
  Name: <input type="text" name="fname">
  <input type="submit">
</form>

<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  // collect value of input field
  $name = $_REQUEST['fname'];
  if (empty($name)) {
    echo "Name is empty";
  } else {
    echo $name;
  }
}
?>

</body>
</html>
```
什么是 `htmlspecialchars()`?
`htmlspecialchars()`把特殊字符转换为 HTML 实体。这意味着 < 和 > 之类的 HTML 字符会被替换为 `&lt;` 和` &gt;`。这样可防止攻击者通过在表单中注入 HTML 或 JavaScript 代码（跨站点脚本攻击）对代码进行利用。
#### `$_POST`
`$_POST` 用于收集表单提交的数据。当使用 HTTP **POST** 方法提交表单时，表单里的数据将作为 `$_POST` 数组的值。
```php
<html>
<body>

<form method="post" action="<?php echo $_SERVER['PHP_SELF'];?>">
  Name: <input type="text" name="fname">
  <input type="submit">
</form>

<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
  // collect value of input field
  $name = $_POST['fname'];
  if (empty($name)) {
    echo "Name is empty";
  } else {
    echo $name;
  }
}
?>

</body>
</html>
```
#### `$_GET`
`$_GET` 可以收集 **URL 参数**，也就是查询字符串（query string）。当使用 HTTP **GET **方法请求页面时，可以通过 `$_GET` 数组访问所有的查询参数。
```html
<html>
  <body>

    <a href="test_get.php?subject=PHP&web=W3schools.com">Test $GET</a>

  </body>
</html>
```
```php
<html>
  <body>

  <?php
    echo "Study " . $_GET['subject'] . " at " . $_GET['web'];
  ?>
  
  </body>
</html>
```
#### `$_FILES`
`$_FILES` 用于收集通过 HTTP POST 方法上传的文件的信息。它可以包含多个属性，如 name（原文件名）、type（文件类型）、tmp_name（文件在服务器上的临时副本的路径）、error（任何上传错误的代码）、size（文件大小，单位是字节）。  
#### `$_ENV`
`$_ENV` 包含了通过环境方式传递给当前脚本的变量。这些环境变量是由服务器提供的，通常在服务器的配置文件或操作系统级别设置。 但是，出于安全考虑，很多服务器配置或 PHP 配置文件中可能会禁用 $_ENV 或者清空其中的数据 。
#### `$_COOKIE`
`$_COOKIE` 用于收集客户端发送的所有 Cookies。这些 Cookies 是由 HTTP Cookies 头发送的，并且可以用来识别用户、存储用户偏好等。 例如，如果一个用户在登录表单中选择了“记住我”，登录信息可以被存储在 Cookies 中供后续访问时使用。  
#### `$_SESSION`
`$_SESSION` 用于存储关于用户会话的信息。会话可以跟踪用户的状态，并且这个数组在用户浏览应用的多个页面时持续存在。要使用会话变量，必须首先启动会话（ 调用 `session_start()` 函数  ）。
#### **注意事项**
处理 `$_GET` 和 `$_POST` 时，出于安全考虑，应始终验证和清理用户输入。不要直接使用来自用户的数据，例如在数据库查询中，这可能导致 SQL 注入攻击。推荐使用预处理语句或者适当的过滤函数来处理输入数据。
超级全局变量的使用不需要额外的声明，它们在 PHP 脚本中始终可用。不过，它们的内容依赖于请求的上下文和执行环境。
### 正则表达式
下面是一些正则表达式的基本组件和它们的含义：
#### 字符类

- `.`: 匹配除换行符以外的任意单个字符。
- `[abc]`: 匹配方括号内的任意一个字符（在这个例子中是 `a`、`b` 或 `c`）。
- `[^abc]`: 匹配不在方括号内的任意一个字符。
- `\d`: 匹配任意一个数字，相当于 `[0-9]`。
- `\D`: 匹配任意一个非数字字符，相当于 `[^0-9]`。
- `\w`: 匹配任意一个字母数字字符（包括下划线），相当于 `[a-zA-Z0-9_]`。
- `\W`: 匹配任意一个非字母数字字符，相当于 `[^a-zA-Z0-9_]`。
- `\s`: 匹配任意一个空白字符（包括空格、制表符、换行符等）。
- `\S`: 匹配任意一个非空白字符。=
#### 限定符

- `*`: 匹配前面的子表达式零次或多次。
- `+`: 匹配前面的子表达式一次或多次。
- `?`: 匹配前面的子表达式零次或一次。
- `{n}`: 匹配前面的子表达式恰好 `n` 次。
- `{n,}`: 匹配前面的子表达式至少 `n` 次。
- `{n,m}`: 匹配前面的子表达式至少 `n` 次，但不超过 `m` 次。
#### 位置和边界

- `^`: 匹配字符串的开头。
- `$`: 匹配字符串的结尾。
- `\b`: 匹配单词边界。
- `\B`: 匹配非单词边界。
#### 分组和引用

- `(...)`: 将括号内的表达式定义为一个组，并按照出现的顺序编号。
- `x|y`: 匹配 `x` 或 `y`。
- `\n`: 引用编号为 `n` 的分组匹配到的内容。
#### 转义字符

- `\\`: 匹配 `\` 字符本身。
- `\*`: 匹配 `*` 字符本身（适用于其他特殊字符）。
#### 使用示例
假设我们有一个正则表达式：`^\d{3}-\d{2}-\d{4}$`
这个表达式可以用来匹配美国的社会安全号码（SSN）格式，具体如下：

- `^`: 表示匹配的字符串必须从行首开始。
- `\d{3}`: 匹配三个数字。
- `-`: 匹配连字符。
- `\d{2}`: 匹配两个数字。
- `-`: 再次匹配连字符。
- `\d{4}`: 匹配四个数字。
- `$`: 表示匹配的字符串必须在行尾结束。

因此，这个正则表达式会匹配类似 `123-45-6789` 这样格式的字符串。
#### PHP的正则表达式函数
在 PHP 中，处理正则表达式主要通过 `preg_` 系列的函数，这是因为 PHP 使用的是 PCRE (Perl Compatible Regular Expressions) 库。以下是一些常用的 `preg_` 函数及其用法：

- `preg_match()`: 执行一个正则表达式匹配。
- `preg_match_all()`: 执行一个全局正则表达式匹配。
- `preg_replace()`: 执行一个正则表达式的搜索和替换。
- `preg_split()`: 通过一个正则表达式分隔字符串。
- `preg_grep()`: 返回一个包含所有匹配项的数组。
- `preg_quote()`: 转义正则表达式字符。
##### `preg_match()`
`preg_match()` 函数用于执行一个正则表达式匹配，检查正则表达式是否与指定的字符串匹配。
```php
<?php
$pattern = '/foo/';
$string = 'foobar';
if (preg_match($pattern, $string)) {
    echo '匹配成功';
} else {
    echo '匹配失败';
}
?>
```
##### `preg_match_all()`
`preg_match_all()` 函数用于执行全局正则表达式匹配，它会匹配所有符合模式的项，而不是像 `preg_match()` 那样只匹配一次。
```php
<?php
$pattern = '/\d+/'; // 匹配数字
$string = '有 1 点，2 分，和 3 秒';
preg_match_all($pattern, $string, $matches);
print_r($matches[0]);
?>
```
##### `preg_replace()`
`preg_replace()` 函数用于执行一个正则表达式的搜索和替换。
```php
<?php
$pattern = '/\d+/'; // 匹配数字
$replacement = '#';
$string = '有 1 点，2 分，和 3 秒';
echo preg_replace($pattern, $replacement, $string);
?>
```
##### `preg_split()`
`preg_split()` 函数用于通过一个正则表达式分割字符串。
```php
<?php
$pattern = '/[\s,]+/'; // 匹配空白字符或逗号
$string = 'one, two, three, four';
$parts = preg_split($pattern, $string);
print_r($parts);
?>
```
##### `preg_grep()`
`preg_grep()` 函数用于返回一个包含所有匹配项的数组。
```php
<?php
$pattern = '/^(\s*[a-zA-Z]+\s*)+$/'; // 匹配全字母的行
$input = array('Line 1', 'Line 2', '12345', 'Line 4');
$result = preg_grep($pattern, $input);
print_r($result);
?>
```
##### `preg_quote()`
`preg_quote()` 函数用于转义正则表达式字符，这在动态构建正则表达式时非常有用。
```php
<?php
$keyword = '40 (forty)';
$pattern = '/'.preg_quote($keyword, '/').'/';
$string = 'This is 40 (forty), that is 20 (twenty).';
if (preg_match($pattern, $string)) {
    echo '找到匹配项';
} else {
    echo '未找到匹配项';
}
?>
```
## 表单处理
### 数据格式
PHP 提供了一些内置函数和过滤器，可以用来验证和过滤常见的数据类型，如电子邮箱、URL 等。这些工具是 PHP 的过滤器扩展的一部分，这个扩展默认是开启的。对于电话号码，由于格式多样，PHP 没有内置的验证函数，通常需要使用正则表达式进行验证。
#### 电子邮箱
要验证电子邮箱，可以使用 `filter_var()` 函数搭配 `FILTER_VALIDATE_EMAIL` 过滤器：
```php
$email = "user@example.com";
if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    echo "无效的邮箱格式";
} else {
    echo "有效的邮箱格式";
}
```
#### URL
验证 URL，可以使用 `filter_var()` 函数搭配 `FILTER_VALIDATE_URL` 过滤器：
```php
$url = "http://www.example.com";
if (filter_var($url, FILTER_VALIDATE_URL) === false) {
    echo "无效的 URL";
} else {
    echo "有效的 URL";
}
```
#### IP 地址
验证 IP 地址，可以使用 `filter_var()` 函数搭配 `FILTER_VALIDATE_IP` 过滤器：
```php
$ip = "127.0.0.1";
if (filter_var($ip, FILTER_VALIDATE_IP) === false) {
    echo "无效的 IP 地址";
} else {
    echo "有效的 IP 地址";
}
```
#### 电话号码
对于电话号码，可以使用正则表达式来验证，因为电话号码的格式因国家和地区而异，没有通用的验证方式。下面是一个简单的例子，用正则表达式验证美国的电话号码格式：
```php
$phone = "(555) 555-5555";
if (preg_match("/^\(\d{3}\) \d{3}-\d{4}$/", $phone)) {
    echo "有效的电话号码";
} else {
    echo "无效的电话号码";
}
```
上面的正则表达式检查电话号码是否符合 `(xxx) xxx-xxxx` 的格式，其中 `x` 表示一个数字。
### 数据清洗
#### SQL注入

#### XSS攻击
防止跨站脚本攻击（XSS）是 Web 安全中的一个重要环节。XSS 攻击发生在攻击者将恶意脚本注入到其他用户会查看的页面中。当其他用户加载受攻击的页面时，恶意脚本会执行，可能会盗取 cookies、会话令牌或其他敏感信息，甚至可以篡改页面内容。
以下是一些预防 XSS 攻击的最佳实践：
##### 1. 对用户输入进行编码
在将用户输入呈现在页面上时，确保对 HTML 特殊字符（如 `<`, `>`, `&`, `"`, `'` 等）进行转义。这样可以避免这些字符被浏览器解释为代码的一部分。在 PHP 中，可以使用 `htmlspecialchars()` 或 `htmlentities()` 函数来实现：
```php
// 转义 HTML 特殊字符
echo htmlspecialchars($userInput, ENT_QUOTES, 'UTF-8');
```
##### 2. 使用内容安全策略（CSP）
内容安全策略是一个额外的安全层，可以帮助减轻 XSS 攻击的风险。CSP 通过指定哪些动态资源允许执行和加载，从而限制 XSS 攻击的影响。你可以通过设置 HTTP 头部 `Content-Security-Policy` 来实现：
```php
// 设置 CSP 头部
header("Content-Security-Policy: script-src 'self';");
```
##### 3. 使用安全的 API 和框架
使用支持自动编码的模板系统和框架，如 React、Vue.js 或 Angular。这些框架默认对输出进行编码，从而降低 XSS 的风险。
##### 4. 验证和过滤所有的输入
尽管编码输出是防止 XSS 的关键，但对所有输入进行验证和过滤也非常重要。确保对所有的输入数据进行严格的验证，对于不符合预期格式的输入应当拒绝或进行清理。
##### 5. 避免创建 DOM 节点与 HTML 字符串
避免使用 `innerHTML`、`document.write()` 或类似的方法，它们可以将字符串解析为 HTML，这可能导致 XSS 漏洞。相反，使用 `textContent` 属性或创建 DOM 节点的方法来安全地修改页面内容。
##### 6. 使用 HTTP Only 和 Secure 标志的 cookies
如果你的应用程序使用 cookies，设置 `HttpOnly` 和 `Secure` 标志可以增加安全性。`HttpOnly` 标志阻止 JavaScript 访问 cookie，`Secure` 标志确保 cookie 仅通过 HTTPS 传输。
```php
// 设置 cookies
setcookie("SecureCookie", "value", [
    'expires' => time() + 3600,
    'path' => '/',
    'domain' => 'example.com',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Lax'
]);
```
## 高级
### 日期时间
#### 字符格式
在PHP中，`date()` 函数和 `DateTime::format()` 方法使用特定的字符格式化日期和时间。以下是一些常用的格式化字符及其含义：

| 字符 | 含义 | 示例 |
| --- | --- | --- |
| `Y` | 四位数年份 | 2024 |
| `y` | 两位数年份 | 24 |
| `m` | 两位数月份（带前导零） | 01-12 |
| `n` | 月份，不带前导零 | 1-12 |
| `M` | 三个字母缩写表示的月份 | Jan-Dec |
| `F` | 完整月份名称 | January-December |
| `d` | 两位数天数（带前导零） | 01-31 |
| `j` | 天数，不带前导零 | 1-31 |
| `D` | 三个字母缩写表示的星期几 | Mon-Sun |
| `l` | 完整星期几名称 | Sunday-Saturday |
| `H` | 两位数24小时制小时（带前导零） | 00-23 |
| `h` | 两位数12小时制小时（带前导零） | 01-12 |
| `G` | 24小时制小时，不带前导零 | 0-23 |
| `g` | 12小时制小时，不带前导零 | 1-12 |
| `i` | 两位数分钟（带前导零） | 00-59 |
| `s` | 两位数秒数（带前导零） | 00-59 |
| `a` | 小写的上午和下午值 | am 或 pm |
| `A` | 大写的上午和下午值 | AM 或 PM |
| `T` | 本机所在的时区 | EST, MDT 等 |
| `O` | 与格林威治时间相差的小时和分钟数 | +0200 |
| `P` | 与格林威治时间相差的小时和分钟数，小时和分钟分开表示 | +02:00 |
| `c` | ISO 8601 日期 | 2024-03-22T17:45:12+02:00 |
| `r` | RFC 2822 格式化的日期 | Thu, 21 Dec 2024 16:01:07 +0200 |

使用这些字符，您可以创建各种日期和时间格式。例如：
```php
echo date('Y-m-d H:i:s'); // 输出类似 "2024-03-22 17:45:12"
echo date('l, F j, Y'); // 输出类似 "Friday, March 22, 2024"
```
#### 常见方法
设置时区`date_default_timezone_set("Asia/Shanghai");`

---

输出当前时间戳`time()`

---

把时间戳格式化为更易读的日期和时间`date(_format_,_timestamp_)`

- format：必需；规定时间戳的格式。
- timestamp：可选。规定时间戳。默认是当前时间和日期。

---

创建日期`mktime()` 
该函数是 PHP 中用于获取特定日期和时间的 Unix 时间戳的内置函数。这个函数最多可以接受六个参数，依次指定小时、分钟、秒、月、日和年。
以下是 `mktime()` 函数的语法：
```php
int mktime (int $hour = date("H") , 
            int $minute = date("i") , 
            int $second = date("s") , 
            int $month = date("n") , 
            int $day = date("j") , 
            int $year = date("Y") , 
            int $is_dst = -1 )
```

- `$hour` - 时间的小时部分。
- `$minute` - 时间的分钟部分。
- `$second` - 时间的秒部分。
- `$month` - 日期的月份部分。
- `$day` - 日期的日部分。
- `$year` - 日期的年份部分。
- `$is_dst` - 此参数可以在时间为夏令时时设置为 1，在非夏令时时设置为 0，或者在不确定时间是否为夏令时时设置为 -1（默认值）。

如果你没有提供某个参数，`mktime()` 会使用当前日期和时间为该参数的值。
```php
$timestamp = mktime(0, 0, 0, 1, 1, 2024);
echo $timestamp;
```
这段代码会输出 2024 年 1 月 1 日午夜时刻的 Unix 时间戳，基于服务器的本地时区。
从 PHP 5.1.0 开始，`mktime()` 的所有参数都是可选的，并且每个参数都有一个默认值。如果你调用 `mktime()` 时没有任何参数，它将返回当前的 Unix 时间戳。
此外，在 PHP 7.0.0 及更新版本中，`is_dst` 参数已被弃用。由于夏令时的应用规则有所变化，依赖此参数可能会导致意外的结果。因此，你应该始终为你的脚本或应用程序使用正确的时区设置。

---

`strtotime`
`strtotime()` 函数是 PHP 中用于将英文文本日期格式转换为 Unix 时间戳的函数。这个函数非常强大，因为它可以解析多种英语日期和时间格式，并将其转换为自 Unix 纪元（1970 年 1 月 1 日 00:00:00 UTC）以来经过的秒数。
以下是 `strtotime()` 函数的基本用法：
```php
int strtotime ( string $time [, int $now = time() ] )
```

- `$time` - 以英文格式表示的字符串日期时间。
- `$now` - 可选参数，用于指定计算所基于的时间戳，默认是当前时间。

这里有一些 `strtotime()` 函数的使用示例：
```php
echo strtotime("now"), "\n"; // 当前时间的 Unix 时间戳
echo strtotime("10 September 2000"), "\n"; // 指定日期的 Unix 时间戳
echo strtotime("+1 day"), "\n"; // 当前时间加一天的 Unix 时间戳
echo strtotime("+1 week"), "\n"; // 当前时间加一星期的 Unix 时间戳
echo strtotime("+1 week 2 days 4 hours 2 seconds"), "\n"; // 当前时间加上特定时间间隔的 Unix 时间戳
echo strtotime("next Thursday"), "\n"; // 下一个星期四的 Unix 时间戳
echo strtotime("last Monday"), "\n"; // 上一个星期一的 Unix 时间戳
```
`strtotime()` 函数非常灵活，适用于各种场合。例如，它可以用于计算在未来或过去的特定日期和时间，或者用于解析用户输入的自然语言日期。
需要注意的是，`strtotime()` 会根据服务器设置的时区来解析时间。如果需要处理不同的时区，应该使用 `DateTime` 类与 `DateTimeZone` 类一起，来指定正确的时区。

---

DateTimeZone类
```php
$timezone = new DateTimeZone('Europe/Paris');
```

---

检查日期有效性`checkdate()`
该函数检查日、月、年是否构成一个有效的格里高利日期。
```php
var_dump(checkdate(2, 29, 2023)); // bool(false) 因为2023年没有2月29日
var_dump(checkdate(2, 29, 2024)); // bool(true) 2024年是闰年，有2月29日
```

---

#### DateTime 类
`DateTime` 类用于表示日期和时间，可以表示任何日期和时间，包括过去的、现在的和未来的。并提供了一系列的方法来操作它们。这个类从 PHP 5.2.0 开始引入。
创建 `DateTime` 对象：
```php
$dateTime = new DateTime('now'); // 当前时间
$dateTime = new DateTime('2024-03-22 10:00:00'); // 指定日期和时间
```
格式化日期和时间：
```php
echo $dateTime->format('Y-m-d H:i:s'); // 输出日期和时间的字符串表示
```
修改日期和时间：
```php
$dateTime->modify('+1 day'); // 当前时间加一天
```
获取和设置时区：
```php
$timezone = new DateTimeZone('America/New_York');
$dateTime->setTimezone($timezone); // 设置 DateTime 对象的时区
```
#### DateInterval 类
`DateInterval` 类用于表示日期和时间之间的间隔。它可以用来计算两个日期或时间之间的差值。可以用于添加或减去一个时间段从 `DateTime` 对象。
创建 `DateInterval` 对象：
```php
$interval = new DateInterval('P1D'); // 表示一个周期为一天的时间间隔
```
使用 `DateInterval` 修改 `DateTime` 对象：
```php
$dateTime->add($interval); // 在 DateTime 对象上添加时间间隔
$dateTime->sub($interval); // 从 DateTime 对象上减去时间间隔
```
#### DateTimeImmutable 类
`DateTimeImmutable` 类是从 PHP 5.5.0 引入的，表示不可变的日期和时间，它与 `DateTime` 类似，但所有修改日期和时间的方法都会保持原对象不变，而返回一个修改后的新对象。
创建 `DateTimeImmutable` 对象：
```php
$dateTimeImmutable = new DateTimeImmutable('now'); // 当前时间
```
修改 `DateTimeImmutable` 对象（注意：每次修改都会返回一个新对象）：
```php
$newDateTimeImmutable = $dateTimeImmutable->modify('+1 day'); // 返回一个新的对象，代表加一天后的日期
```
因为 `DateTimeImmutable` 对象在修改后返回新的实例，它在某些场合下更为适用，特别是在不希望原始日期被修改的情况下。
所有这些类都支持更多复杂的日期和时间操作，比如计算日期差异（使用 `date_diff` 函数或 `DateTime::diff` 方法），检查日期的有效性等。使用这些类可以让日期和时间的处理变得更加简单和直观。
#### 日期周期的重复事件
`DatePeriod` 类可以用来处理重复发生的事件。例如，如果你想获取接下来的每个星期一的日期：
```php
$start = new DateTime('2024-03-22');
$interval = new DateInterval('P1W'); // 一周一次
$recurrences = 4; // 获取4次事件
$period = new DatePeriod($start, $interval, $recurrences);

foreach ($period as $date) {
    echo $date->format('Y-m-d') . ' is a Monday', PHP_EOL;
}
```
### 文件引入
在 PHP 中，`include` 和 `require` 语句用于在执行脚本的时候插入一个文件的内容到另一个文件中。这两个语句相似，但它们在处理文件无法找到或不可读的情况下的行为不同。
#### include
`include` 语句在 PHP 脚本中包含并运行指定文件。如果文件不存在或者由于某些原因无法包含，`include` 会发出一个警告（E_WARNING），但脚本会继续执行。
```php
include 'file.php';
```
#### require
与 `include` 类似，`require` 语句也是用来包含文件的，但如果指定的文件不存在或者无法包含，`require` 会发出一个致命错误（E_COMPILE_ERROR），并且脚本会停止执行。
```php
require 'file.php';
```
#### include_once 、 require_once
`include_once` 和 `require_once` 语句的功能类似于 `include` 和 `require`，但它们会首先检查指定的文件在当前脚本中是否已经被包含过，如果是，则不会再次包含。这可以防止函数定义、类定义或其他代码因多次包含同一个文件而发生冲突。
```php
include_once 'file.php';
require_once 'file.php';
```
#### include 、require 的使用场景
在 PHP 编程中，当你的项目变得庞大，需要组织和管理大量的代码时，将代码分散到不同的文件中就变得非常有用。`include` 和 `require` 语句让你能够将 PHP 文件分成可重用的模块，如函数库、配置文件和页面模板等。
##### 函数库
如果你有一组在多个脚本中都要使用的自定义函数，通常会将它们放在一个单独的文件中，然后在需要使用这些函数的文件中使用 `include` 或 `require` 来载入它们。
##### 配置文件
配置文件通常包含数据库连接信息和全局设置。这些文件应该使用 `require` 语句包含，因为如果配置文件缺失，应用程序通常无法正常运行。
##### 页面模板
在基于模板的网站设计中，页面顶部、底部和菜单等元素通常是重复的。你可以将它们各自放在不同的文件中，并在每个页面中使用 `include` 语句来载入它们。
#### 错误处理
`include` 和 `require` 的主要区别在于它们如何处理文件包含失败的情况：

- 使用 `include` 时，如果文件不存在，PHP 会发出一个警告，然后继续执行余下的脚本。这对于非关键性的文件包含是有用的。
- 使用 `require` 时，如果文件不存在，PHP 会发出一个错误，并停止执行脚本。这对于那些没有它们程序就无法运行的关键性文件来说非常重要。
#### 性能考虑
在性能方面，`include` 和 `require` 通常没有显著差异。但是，使用 `include_once` 和 `require_once` 可能会稍微慢一些，因为 PHP 必须检查要包含的文件是否已经包含过了。
然而，这种性能差异通常是微乎其微的，并且在实际应用中几乎可以忽略不计。代码的组织和可维护性远比微小的性能差异更加重要。
#### 最佳实践

- 为了应用程序的稳定性和可维护性，应该始终使用 `require_once` 来包含关键的依赖文件，例如配置文件和重要的函数库。
- 使用 `include` 或 `include_once` 来包含模板文件或者可能会根据不同情况而改变的文件。
- 避免在 `include` 或 `require` 语句中使用相对路径，因为这会使代码的移植性变差。建议使用绝对路径，你可以使用 PHP 的魔术常量 `__DIR__` 来获取当前文件所在的目录，以确保包含路径的准确性。
- 避免在条件语句中多次包含同一个文件，这样不仅会影响性能，还可能导致函数重定义或者类重复定义的错误。此时，使用 `include_once` 或 `require_once` 是一个明智的选择。
### 文件处理
#### 文件
##### 基本操作

1. 打开文件

使用 `fopen()` 函数可以打开文件。此函数需要两个参数：文件的路径和打开模式。
```php
$file = fopen("example.txt", "r"); // 打开文件用于读取
```
![文件打开方式](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/php/202406171910013.png "文件打开方式")

2. 读取文件
- `readfile()`读取文件全部内容
```php
echo readfile('./senior/example.txt');
```

- `fread()` 读取打开的文件：
```php
$content = fread($file, filesize("example.txt"));
```

- `fgets()` 读取单行：
```php
$line = fgets($file);
```

- `fgetc()` 读取单个字符：
```php
$char = fgetc($file);
```

- `file_get_contents`读取整个文件到一个字符串
```php
$content = file_get_contents("example.txt");
```

- `file()`读取文件并将内容按行分割到一个数组中。
```php
$lines = file("example.txt");	// 每个数组元素包含文件的一行
```

3. 写入文件
- `fwrite()` 或 `fputs()` 写入文件：
```php
fwrite($file, "Hello, World!");
```

- `file_put_contents`将一个字符串写入文件（会覆盖文件原来的内容）
```php
file_put_contents("example.txt", "New content for the file.");
```

4. 关闭文件

使用 `fclose()` 函数关闭打开的文件：
```php
fclose($file);
```

5. 删除文件

使用 `unlink()` 函数可以删除文件：
```php
unlink("example.txt");
```

6. 修改文件

`touch()`设置文件的访问和修改时间。如果文件不存在，PHP 将尝试创建它。
`copy()`将文件复制到新位置`copy("source.txt", "destination.txt");`
`rename()` 可以重命名或移动文件`rename("oldname.txt", "newname.txt");`
`move_uploaded_file()` 处理上传文件的安全方式，通常用于将上传的文件从临时目录移动到目标目录。
`move_uploaded_file($_FILES['file']['tmp_name'], "path/to/target");`
##### 常用方法

1. 文件信息
- `is_file()`仅用于检查文件是否存在
- `file_exists()` 检查文件、目录是否存在
- `filesize()` 获取文件大小
- `filemtime()` 获取文件最后修改时间
- `filetype()` 获取文件类型
- `fileperms()`获取文件的权限
- `fileinode()`获取文件的inode
- `filegroup()`获取文件组
- `fileowner()`获取文件所有者
- `pathinfo()`返回文件路径的信息，如目录名、基本名、扩展名和文件名。
```php
$info = pathinfo('/path/to/example.txt');
echo $info['dirname'], "\n";
echo $info['basename'], "\n";
echo $info['extension'], "\n";
echo $info['filename'], "\n"; // 自 PHP 5.2.0 起
```

2. 文件位置指针
- `rewind()` 将文件指针重置到开头
- `ftell()` 返回文件指针的当前位置
- `fseek()` 在文件中定位到指定的位置
3. 模式匹配
- `glob()`返回匹配指定模式的文件名或目录。
```php
$files = glob("*.txt");	// $files 是一个数组，包含当前目录下所有 txt 文件
```
##### 文件锁定
当你在多个脚本中同时写入文件时，使用文件锁定可以避免冲突。
```php
$fp = fopen("example.txt", "w");

if (flock($fp, LOCK_EX)) { // 获取独占锁定
    fwrite($fp, "Write something...");
    fflush($fp); // 刷新输出缓冲到文件
    flock($fp, LOCK_UN); // 释放锁定
}

fclose($fp);
```
#### 目录
##### 基本操作

1. 创建目录

使用 `mkdir()` 函数创建新目录：
```php
mkdir("new_directory");
```

2. 删除目录

使用 `rmdir()` 函数删除空目录：
```php
rmdir("new_directory");
```

3. 读取目录内容

使用 `opendir()`、`readdir()` 和 `closedir()` 读取目录内容：
```php
$dir = opendir("path/to/directory");
while (($file = readdir($dir)) !== false) {
    echo "filename: " . $file . "<br>";
}
closedir($dir);
```
##### 常用方法

- `is_dir()`检查指定路径是否为目录
##### 目录迭代器
PHP 的 DirectoryIterator 类提供了一个简单的接口来遍历文件系统。
```php
$iterator = new DirectoryIterator(dirname(__FILE__));
foreach ($iterator as $fileinfo) {
    if ($fileinfo->isFile()) {
        echo $fileinfo->getFilename() . "\n";
    }
}
```
#### 文件上传
PHP 中的文件上传是一个相对直接的过程，通常涉及一个 HTML 表单，用于选择文件，以及一个 PHP 脚本，用于处理上传的文件。上传的文件存储在全局数组 `$_FILES` 中。
##### HTML 表单
首先，你需要创建一个 HTML 表单，允许用户选择要上传的文件。表单的 `enctype` 必须设置为 `multipart/form-data`，这样才能正确传输文件。
```html
<form action="upload.php" method="post" enctype="multipart/form-data">
  选择文件：
  <input type="file" name="fileToUpload" id="fileToUpload">
  <input type="submit" value="上传文件" name="submit">
</form>
```
##### PHP 脚本（upload.php）
然后，需要一个 PHP 脚本来接收并处理上传的文件。
```php
<?php
$target_dir = "uploads/"; // 指定存储上传文件的目录
$target_file = $target_dir . basename($_FILES["fileToUpload"]["name"]);
$uploadOk = 1;
$imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

// 检查文件大小
if ($_FILES["fileToUpload"]["size"] > 500000) {
  echo "对不起，您的文件太大。";
  $uploadOk = 0;
}

// 允许特定格式的文件
if($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg"
&& $imageFileType != "gif" ) {
  echo "对不起，只允许 JPG, JPEG, PNG & GIF 文件格式。";
  $uploadOk = 0;
}

// 检查 $uploadOk 是否因为错误而设置为 0
if ($uploadOk == 0) {
  echo "对不起，您的文件未被上传。";
// 尝试上传文件
} else {
  if (move_uploaded_file($_FILES["fileToUpload"]["tmp_name"], $target_file)) {
    echo "文件 ". htmlspecialchars( basename( $_FILES["fileToUpload"]["name"])). " 已被上传。";
  } else {
    echo "对不起，在上传文件时遇到错误。";
  }
}
?>
```
这个 PHP 脚本执行以下操作：

1. 定义一个目录，用于存储上传的文件。
2. 获取上传文件的信息，并构造存储路径。
3. 对上传的文件进行一些检查，例如大小限制和文件类型限制。
4. 如果检查通过，使用 `move_uploaded_file()` 函数将文件从临时目录移动到目标目录。
##### 重要的安全措施

1. **验证文件类型**：确保上传的文件是允许的类型，以避免上传可执行脚本或其他潜在危险的文件。
2. **限制文件大小**：限制可以上传的文件大小，以防止服务拒绝攻击（DoS）。
3. **文件名随机化**：更改上传文件的名称，例如使用 `uniqid()` 函数生成唯一的文件名，以防止覆盖现有文件和其他潜在的安全风险。
4. **权限**：确保上传目录的权限设置正确，不允许执行上传的文件。
5. **用户认证**：仅允许经过认证的用户上传文件。
6. **错误处理**：将错误信息记录到日志文件中，而不是直接显示给用户，以避免信息泄露。
### Cookie
在 PHP 中，cookie 是一种在客户端存储数据的机制，通常用于识别用户会话、保存用户偏好设置或跟踪用户行为。以下是关于如何在 PHP 中设置、检索和删除 cookie 的信息。
#### 设置 Cookie
PHP 使用 `setcookie()` 函数来发送一个 cookie。这个函数必须在任何输出发送到浏览器之前被调用，因为它是通过 HTTP 头部来设置 cookie 的。
```php
<?php
$cookie_name = "user";
$cookie_value = "John Doe";
// 设置一个简单的 cookie，cookie 的名称是 "user"，值是 "John Doe"；cookie 会在一天后过期
setcookie($cookie_name, $cookie_value, time() + (86400 * 30), "/"); // 86400 = 1 day
?>
<html>
<body>

<?php
  // 判断有无该cookie
if(!isset($_COOKIE[$cookie_name])) {
  echo "Cookie named '" . $cookie_name . "' is not set!";
} else {
  echo "Cookie '" . $cookie_name . "' is set!<br>";
  echo "Value is: " . $_COOKIE[$cookie_name];
}
?>

</body>
</html>
```
`setcookie()` 函数的参数如下：

- `name`: Cookie 的名称。
- `value`: Cookie 的值。
- `expires`: （可选）Cookie 的过期时间，是 Unix 时间戳（即自 January 1 1970 00:00:00 GMT 以来经过的秒数）。如果未设置，cookie 会在浏览器关闭时自动过期。
- `path`: （可选）指定 cookie 可以在域中的哪些路径上被访问。如果设置为 '/'，cookie 对整个域名有效。
- `domain`: （可选）指定 cookie 有效的域名。子域必须明确设置 cookie 才能跨子域访问。
- `secure`: （可选）如果设置为 true，则只有在使用 SSL 连接时才会发送 cookie。
- `httponly`: （可选）如果设置为 true，则 cookie 仅可通过 HTTP 协议访问，无法通过 JavaScript 等方式访问。
#### 检索 Cookie
一旦设置了 cookie，它们将在随后的请求中被自动发送到服务器，并且可以通过 `$_COOKIE` 超全局数组来访问
```php
if(isset($_COOKIE['user'])) {
    echo "Welcome " . htmlspecialchars($_COOKIE['user']) . "!";
} else {
    echo "Welcome guest!";
}
```
#### 删除 Cookie
删除一个 cookie 实际上是通过设置它的过期时间为过去某一时间来实现的，从而使浏览器清除它。
```php
// 设置 user cookie 的过期时间为一个小时前，从而删除它
setcookie("user", "", time() - 3600);
```
#### 注意事项

- 由于 `setcookie()` 会发送 HTTP 头部，因此必须在任何 HTML 输出之前调用。
- 一旦设置了 cookie，它将在下一个 HTTP 请求中可用，不会立即在当前脚本中可用。
- 为了避免跨站点脚本（XSS）攻击，应当使用 `htmlspecialchars()` 或其他适当的函数对 cookie 的值进行编码，特别是在将它们输出到 HTML 中的时候。
- 使用 HTTPS 和 `secure` 标志可以提高 cookie 的安全性。
- 使用 `httponly` 标志可以增加保护，防止 JavaScript 等客户端脚本访问 cookie。
### Session
在 PHP 中，会话（session）是一种用来保存用户数据以便跨多个页面请求（或浏览器会话）使用的方式。会话通常用于保持用户状态和数据，比如登录信息、购物车内容等。不同于 cookie，会话数据存储在服务器端，用户无法直接访问，这提供了更好的安全性。
#### 开始会话
在 PHP 中，你可以使用 `session_start()` 函数来初始化会话系统和恢复会话变量。
```php
// 在脚本开始处调用 session_start() 来启动会话
session_start();
```
`session_start()` 必须在脚本输出任何内容到浏览器之前调用，因为它会发送 HTTP 头信息。
#### 存储会话变量
一旦会话开始，你可以通过 `$_SESSION` 超全局数组来存储和访问会话变量。
```php
// 存储会话数据
$_SESSION["username"] = "john_doe";
$_SESSION["email"] = "john@example.com";
$_SESSION["logged_in"] = true;
```
#### 检索会话变量
在一个会话已经开始后的任何页面上，你可以通过 `$_SESSION` 数组来检索之前存储的会话变量。
```php
// 开始会话
session_start();

// 检索会话数据
if(isset($_SESSION["username"])) {
    echo "Welcome, " . $_SESSION["username"] . "!";
} else {
    echo "Please log in.";
}
```
#### 销毁会话
要删除所有全局会话变量并销毁会话， `session_unset()` 和 `session_destroy()`
```php
// remove all session variables
session_unset();

// destroy the session
session_destroy();
```
#### 注意事项

- `session_start()` 会尝试从客户端 cookie 或请求中恢复一个会话标识符。如果没有找到，它会创建一个新的会话。
- 默认情况下，PHP 使用 cookie 来传递会话标识符。但是，如果客户端不接受 cookie，也可以通过 URL 传递会话标识符。
- 为了提高安全性，尤其是在处理敏感数据时，应该在使用 HTTPS 协议的网站上使用会话。
- 定期再生成会话 ID 可以提高安全性，可以使用 `session_regenerate_id()` 函数来实现。
- 会话数据是存储在服务器上的，这意味着如果不进行垃圾回收，随着时间的推移，它们可能会占用大量的磁盘空间。PHP 配置文件（php.ini）中的会话设置定义了会话数据清理的行为。
- 使用会话时需要考虑隐私和合规性问题，确保遵守适用的法律法规。
### Filter
在 PHP 中，`filter` 函数用于验证和清理来自用户的输入或任何不可信数据。这是一种安全措施，可帮助避免安全漏洞，例如 SQL 注入和跨站脚本 (XSS) 攻击。PHP 提供了一系列的过滤器，可以用于对不同类型的数据进行检验和处理。
[PHP 过滤函数](https://www.w3ccoo.com/php/php_ref_filter.html)
#### `filter_var` 函数
`filter_var` 函数是用来过滤单一变量的。你可以使用不同的过滤器和选项来验证或清理数据。
```php
$email = "someuser@example.com";

if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo "This email address is considered valid.";
} else {
    echo "This email address is considered invalid.";
}
```
在上面的例子中，`FILTER_VALIDATE_EMAIL` 过滤器被用来验证一个电子邮件地址。
#### `filter_input` 函数
`filter_input` 函数是用来获取并过滤外部数据的，例如来自 `GET`、`POST`、`COOKIE` 或 `SERVER` 超全局变量。
```php
$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);

if ($email) {
    echo "This email address is considered valid.";
} else {
    echo "This email address is considered invalid.";
}
```
在这个例子中，`filter_input` 从 `POST` 数据中获取 `'email'` 字段并验证它是不是一个有效的电子邮件地址。
#### 过滤器类型
PHP 提供了两种主要的过滤器类型：

1.  **验证过滤器** (`FILTER_VALIDATE_`): 这些过滤器用于验证数据。如果数据通过验证，则返回原始数据，否则返回 `false`。 
2.  **清理过滤器** (`FILTER_SANITIZE_`): 这些过滤器用于清洁数据。它们通常会返回一个清理过的版本的数据，或者在无法清理时返回空字符串。 
#### 常见的验证过滤器

- `FILTER_VALIDATE_EMAIL`: 验证电子邮件地址。
- `FILTER_VALIDATE_INT`: 验证是否为整数值。
- `FILTER_VALIDATE_IP`: 验证是否为 IP 地址。
- `FILTER_VALIDATE_URL`: 验证是否为 URL。
#### 常见的清理过滤器

- `FILTER_SANITIZE_EMAIL`: 清理电子邮件地址字符串。
- `FILTER_SANITIZE_STRING`: 清理字符串，移除标签和可选的去除或编码特殊字符。
- `FILTER_SANITIZE_URL`: 清理 URL 字符串。
#### 过滤器选项和标志
过滤器可以接受额外的选项和标志来精细控制数据的过滤方式。例如，`FILTER_VALIDATE_INT` 可以接受一个范围，以指定整数值应该在什么范围内：
```php
$options = array(
    "options" => array(
        "min_range" => 1,
        "max_range" => 100
    )
);

$var = 50;

if (filter_var($var, FILTER_VALIDATE_INT, $options) !== false) {
    echo "The value is within the legal range.";
} else {
    echo "The value is not within the legal range.";
}
```
#### 使用过滤器的好处

- **安全性**: 过滤器有助于减少注入攻击和其他安全漏洞的风险。
- **数据一致性**: 验证数据格式的一致性，例如确保用户输入的是有效的电子邮件地址。
- **便捷性**: `filter_var` 和 `filter_input` 函数提供了简单的 API 来处理日常的数据验证和清理任务。
### 生成器函数
#### 基本使用
`yield` 是一个关键字，用于创建生成器（Generator）。生成器是一种特殊的函数，可以逐个生成值，而不是一次性生成所有值。
在 PHP 中，使用 `yield` 关键字定义的函数被称为生成器函数。生成器函数与普通函数的区别在于，当生成器函数调用时，它并不立即执行函数体，而是返回一个生成器对象。每次迭代生成器对象时，函数会从上一次暂停的位置继续执行，直到遇到下一个 `yield` 关键字，将生成的值返回给调用方。
下面是一个简单的示例，展示了如何使用 `yield` 创建一个生成器函数：
```php
function myGenerator() {
    yield 'a';
    yield 'b';
    yield 'c';
}

$generator = myGenerator();

foreach ($generator as $value) {
    echo $value . "\n";
}
```
上面的示例中定义了一个名为 `myGenerator()` 的生成器函数。它使用 `yield` 关键字生成了三个值，分别是 `'a'`、`'b'` 和 `'c'`。然后，我们将生成器函数调用的结果赋值给变量 `$generator`，并使用 `foreach` 循环遍历生成器对象的值。在每次迭代时，生成器函数会从上一次暂停的位置继续执行，生成一个值并返回给 `foreach` 循环。
生成器函数的优点是它们可以节省内存，因为它们不会一次性生成所有值，而是按需生成。这对于处理大型数据集合或需要逐个处理结果的情况非常有用。
此外，生成器函数还可以接受参数，并根据参数的不同生成不同的值序列。你可以在生成器函数中使用循环、条件语句和其他控制结构来定义生成值的逻辑。
当涉及到生成器（Generator）和使用 `yield` 关键字时，还有一些其他方面和用法可以了解：
#### **生成器函数参数**
生成器函数可以接受参数，在每次迭代时根据参数的不同生成不同的值序列。这使得生成器函数更加灵活和可定制
```php
function countUpTo($max) {
    for ($i = 1; $i <= $max; $i++) {
        yield $i;
    }
}

$generator = countUpTo(5);

foreach ($generator as $value) {
    echo $value . "\n";
}
```
在上面的示例中，我们定义了一个名为 `countUpTo()` 的生成器函数，它接受一个参数 `$max`，表示要计数的最大值。在每次迭代时，生成器函数会生成从 1 到 `$max` 的整数。然后，我们调用 `countUpTo()` 函数并将结果赋值给变量 `$generator`，再使用 `foreach` 循环遍历生成器对象的值。
#### **生成器委托**
生成器委托是一种在生成器函数中调用其他生成器函数的技术。它允许你在一个生成器函数中重用另一个生成器函数的逻辑。
```php
function generator1() {
    yield 'a';
    yield 'b';
}

function generator2() {
    yield '1';
    yield '2';
}

function combinedGenerator() {
    yield from generator1();
    yield from generator2();
}

$generator = combinedGenerator();

foreach ($generator as $value) {
    echo $value . "\n";
}
```
在上面的示例中，我们定义了两个生成器函数 `generator1()` 和 `generator2()`，它们分别生成字母和数字序列。然后，我们定义了一个名为 `combinedGenerator()` 的生成器函数，使用 `yield from` 关键字将 `generator1()` 和 `generator2()` 的生成器委托给 `combinedGenerator()`。最后，我们通过调用 `combinedGenerator()` 创建生成器对象，并使用 `foreach` 循环遍历生成器的值。生成器委托使得在一个生成器函数中组合和重用其他生成器函数变得更加简单。
#### **生成器的键值对（Keys and Values）**
除了生成值，生成器还可以生成键值对。在每次迭代时，生成器可以使用 `yield` 关键字生成一个键值对，其中键和值可以是任意类型的数据。
```php
function keyValueGenerator() {
    yield 'name' => 'John';
    yield 'age' => 30;
    yield 'country' => 'USA';
}

$generator = keyValueGenerator();

foreach ($generator as $key => $value) {
    echo $key . ': ' . $value . "\n";
}
```
在上面的示例中，我们定义了一个名为 `keyValueGenerator()` 的生成器函数，它生成了一个包含姓名、年龄和国家的键值对。在每次迭代时，生成器函数使用 `yield` 关键字生成一个键值对。然后，我们使用 `foreach` 循环遍历生成器对象，并输出键值对的内容。
生成器的键值对可以用于在迭代过程中为生成的值提供标识或关联信息。
### 回调函数
回调函数（callback function）是一个作为参数传递给另一个函数的函数，这个另一个函数在适当的时候会回过头来执行这个回调函数。这是一种常见的技术，用于实现事件驱动编程或处理异步操作，比如在操作完成时通知调用者。
PHP 中的回调可以是一个普通函数、对象的方法、静态类的方法，甚至是一个匿名函数（也称为闭包）。
#### 普通函数作为回调
```php
function my_callback_function() {
    echo 'Hello, World!';
}

// 一个接受回调函数作为参数的函数
function execute_callback($callback) {
    if (is_callable($callback)) {
        call_user_func($callback);
    }
}

// 调用 execute_callback 并传入 my_callback_function
execute_callback('my_callback_function'); // 输出: Hello, World!
```
##### is_callable
检查变量是否可以作为函数调用的工具。
**作用:**

- 判断一个变量是否包含可调用的函数名、可调用方法的数组、或者实现了 `__invoke` 方法的对象。
- 在需要动态调用函数或方法时非常有用，可以事先判断合法性避免错误。

**语法:**
```php
bool is_callable(mixed $var [, bool $syntax_only = false [, string $callable_name = null]])
```

- **$var:** 要检查的变量。
- **$syntax_only (可选):** 布尔值，默认为 `false`。 
   - 为 `true` 时，只进行语法检查，不考虑函数或方法是否存在。
- **$callable_name (可选):** 字符串，仅用于类方法的检查。指定方法名后，判断类中是否存在该方法。

**返回值:**

- 如果变量是可以调用的，则返回 `true`；否则返回 `false`。

**示例:**
```php
function hello() {
  echo "Hello, world!";
}

$greet = 'hello';
$obj = new MyClass();  // 假设 MyClass 类实现了 __invoke 方法

var_dump(is_callable('hello'));        // true
var_dump(is_callable($greet));         // false (字符串不可调用)
var_dump(is_callable($obj));           // true (对象可能实现 __invoke)
var_dump(is_callable([$obj, 'doStuff'], true)); // true (语法上合法的方法调用)
```
**需要注意:**

- 从 PHP 5.3.0 版本开始，`is_callable()` 不再认为类构造函数 (constructor) 是可调用的。
- 使用 `is_callable()` 进行检查，可以提高代码的可读性和健壮性。
##### call_user_func
`call_user_func` 是 PHP 中用于 **动态调用函数** 的函数。有了它，你可以根据变量的值来决定要调用的函数。
**作用:**

- 在运行时根据提供的参数来调用函数。
- 适用于函数名保存在变量中、需要根据用户输入决定调用哪个函数等场景。

**语法:**
```php
mixed call_user_func(callable $callback, mixed $arg1 [, mixed $arg2 [, mixed $...]])
```

- `$callback`: 必需参数，要调用的函数名（字符串形式）、可调用对象的数组(形式为 array($object, 'methodName'))、或者实现了 `__invoke` 方法的对象。
- `$arg1, $arg2`, ...: 可选参数，将作为调用函数的参数传递。

**返回值:**

- 返回被调用函数的返回值。

**示例:**
```php
function greet($name) {
  echo "Hello, $name!";
}

$action = 'greet';
$person = 'Alice';

call_user_func($action, $person);  // 输出: Hello, Alice!

$obj = new MyClass();  // 假设 MyClass 类实现了 __invoke 方法
call_user_func($obj, 'argument');  // 具体输出取决于 MyClass 实现的 __invoke 方法
```
**需要注意:**

- `call_user_func` 函数的参数数量要和实际调用的函数的参数数量匹配，否则会产生错误。
- 它并不会检查函数是否存在，调用不存在的函数会引发错误。建议配合 `is_callable` 函数一起使用，确保调用的合法性。

**进阶用法:**

- **call_user_func_array:** 与 `call_user_func` 类似，但是可以将参数打包成数组传入。
##### call_user_func_array
**call_user_func_array 函数** 是 PHP 中用于 **使用参数数组动态调用函数** 的函数。它扩展了 `call_user_func` 的功能，提供了一种更灵活的参数传递方式。
**核心功能:**

- 使用包含要传递的参数的数组来调用函数。
- 适用于参数存储在数组中或参数数量可能动态变化的情况。

**语法:**
```php
mixed call_user_func_array(callable $callback, array $args)
```

- **$callback:** 必需参数，代表可调用的实体。它可以是： 
   - 作为字符串的函数名。
   - 包含对象和方法名的数组 (`array($object, 'methodName')`)。
   - 实现 `__invoke` 方法的对象。
- **$args:** 必需参数，一个包含要传递给被调用函数的参数的数组。

**返回值:**

- 返回被调用函数返回的结果。

**示例:**
```php
function sum(int $x, int $y) {
  return $x + $y;
}

$numbers = [5, 3];

$result = call_user_func_array('sum', $numbers); // $result 将为 8

$obj = new MyClass(); // 假设 MyClass 实现了 __invoke
$arguments = ['param1', 'param2'];

$output = call_user_func_array($obj, $arguments); // 输出取决于 MyClass 的 __invoke 实现
```
**要点:**

- `$args` 数组中的元素顺序与函数参数顺序直接对应。
- 类似于 `call_user_func`，确保数组中的参数数量与函数期望的参数数量匹配，以避免错误。
- 考虑在调用之前使用 `is_callable` 和 `call_user_func_array` 一起验证实体的可调用性。

**额外见解:**

- **相对于 **`**call_user_func**`** 的优势:** 
   - 提供参数传递的更多灵活性。
   - 简化了处理参数数量可变的情况。
- **语法糖:** 当 `$args` 数组仅包含数字键时，它们将被视为位置参数，模拟 `call_user_func` 行为。
#### 方法作为回调
```php
class MyClass {
    public function myCallbackMethod() {
        echo 'Hello, World!';
    }
}

$obj = new MyClass();

// 传递数组作为回调参数，包含对象和方法名
execute_callback([$obj, 'myCallbackMethod']); // 输出: Hello, World!
```
#### 匿名函数（闭包）作为回调
```php
$myClosure = function() {
    echo 'Hello, World!';
};

execute_callback($myClosure); // 输出: Hello, World!
```
#### PHP 中使用回调的内置函数
PHP 有很多内置函数支持回调，例如 `array_map()`, `array_filter()`, `usort()` 等。
```php
$numbers = [1, 2, 3, 4, 5];

// 使用 array_map 应用回调到数组中的每个元素
$squared_numbers = array_map(function($number) {
    return $number * $number;
}, $numbers);

print_r($squared_numbers); // 输出: Array ( [0] => 1 [1] => 4 [2] => 9 [3] => 16 [4] => 25 )
```
#### 回调的注意事项

- 回调函数在定义时并不立即执行；它们在被回调的时候才执行。
- 确保回调是可调用的，可以使用 `is_callable()` 函数检查。
- 如果回调是对象方法或类方法，需要提供正确的作用域或对象实例。
- 匿名函数（闭包）可以捕获其创建时所在作用域的变量。

回调函数在异步编程、事件监听、抽象和特定行为定制等场景中非常有用。它们是一种强大的编程技术，增加了代码的灵活性和动态性。
### JSON

1. `json_encode($data)`：将PHP数组或对象转换为JSON格式的字符串。
```php
$data = array('name' => 'John', 'age' => 30, 'city' => 'New York');
$jsonString = json_encode($data);
echo $jsonString;
```

2. `json_decode($jsonString, $assoc)`：将JSON字符串转换为PHP数组或对象。第二个参数 `$assoc` 是一个可选参数，当设置为 `true` 时，将返回关联数组；设置为 `false` 或不传递该参数时，将返回对象。
```php
$jsonString = '{"name":"John","age":30,"city":"New York"}';
$data = json_decode($jsonString);
echo $data->name; // 输出：John

// 或者使用关联数组
$data = json_decode($jsonString, true);
echo $data['name']; // 输出：John
```
```php
$data = array(
    'name' => 'John',
    'age' => 30,
    'addresses' => array(
        array('city' => 'New York', 'state' => 'NY'),
        array('city' => 'London', 'country' => 'UK')
    )
);
$jsonString = json_encode($data);
echo $jsonString;
// 对多维数组进行解码
$data = json_decode($jsonString);
echo $data->addresses[0]->city; // 输出：New York
$data = json_decode($jsonString, true);
echo $data['addresses'][1]['city'];
```
```php
// 从JSON文件中读取数据
$jsonString = file_get_contents('data.json');
$data = json_decode($jsonString);
echo $data->name;

// 将数据写入JSON文件
$data = array('name' => 'John', 'age' => 30, 'city' => 'New York');
$jsonString = json_encode($data);
file_put_contents('data.json', $jsonString);
```
处理复杂的JSON结构：有时候，JSON数据可能具有复杂的嵌套结构，包含数组、嵌套对象等。在这种情况下，可以使用递归的方式来遍历和处理JSON数据。
```php
function processJsonData($data) {
    if (is_object($data)) {
        // 处理对象
        foreach ($data as $key => $value) {
            // 处理键值对
            echo $key . ': ';
            processJsonData($value);
        }
    } elseif (is_array($data)) {
        // 处理数组
        foreach ($data as $item) {
            processJsonData($item);
        }
    } else {
        // 处理基本值
        echo $data . ' ';
    }
}

$jsonString = '{"name":"John","age":30,"addresses":[{"city":"New York"},{"city":"London"}]}';
$data = json_decode($jsonString);
processJsonData($data);
```
处理JSON中的日期和时间：有时候，JSON数据中可能包含日期和时间信息。你可以使用 `DateTime` 类来解析和格式化这些日期和时间。
```php
$jsonString = '{"date":"2024-03-24","time":"12:30:00"}';
$data = json_decode($jsonString);

$date = DateTime::createFromFormat('Y-m-d', $data->date);
echo $date->format('Y-m-d'); // 输出：2024-03-24

$time = DateTime::createFromFormat('H:i:s', $data->time);
echo $time->format('H:i:s'); // 输出：12:30:00
```

3. `json_last_error()`：返回最后一个JSON操作的错误码。
```php
$jsonString = '{"name":"John","age":30,"city":"New York"';
$data = json_decode($jsonString);
if (json_last_error() === JSON_ERROR_SYNTAX) {
    echo "JSON语法错误";
}
```

4. `json_last_error_msg()` 函数获取错误的详细描述。
```php
$jsonString = '{"name":"John","age":30,"city":"New York"';
$data = json_decode($jsonString);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo "JSON解码错误：" . json_last_error_msg();
}
```

5. 处理大型JSON文件：对于大型的JSON文件，一次性读取和解析整个文件可能会占用过多的内存。在这种情况下，可以考虑使用流式处理来逐行读取和处理JSON数据，以减少内存消耗。你可以结合使用 `fopen()`、`fgets()` 和 `json_decode()` 函数来实现这一点。
```php
$handle = fopen('large_data.json', 'r');
while (($line = fgets($handle)) !== false) {
    $data = json_decode($line);
    // 处理每一行的数据
}
fclose($handle);
```
### 异常处理
#### 基本处理
PHP中的异常处理使用了以下几个关键词和结构：

1.  `try`：`try` 块包含可能会引发异常的代码块。当某个异常被抛出时，程序的控制流将立即转到 `catch` 块。 
2.  `catch`：`catch` 块用于捕获和处理异常。它定义了处理特定类型异常的代码块。 
3.  `throw`：`throw` 语句用于手动抛出一个异常。可以使用内置的异常类，也可以自定义异常类。 
4. `finally`：不论出错与否，最终一定执行。

下面是一个基本的异常处理的示例：
```php
try {
    // 可能引发异常的代码
    $result = 10 / 0;
} catch (Exception $e) {
    // 处理异常
    echo "捕获到异常： " . $e->getMessage();
} finally {
  echo "This code will always run";
}
```
你还可以使用多个 `catch` 块来捕获和处理不同类型的异常，以便针对不同的异常类型执行不同的操作。例如：
```php
try {
    // 可能引发异常的代码
    if ($fileNotFound) {
        throw new FileNotFoundException("文件未找到");
    } elseif ($permissionDenied) {
        throw new PermissionException("权限被拒绝");
    }
} catch (FileNotFoundException $e) {
    // 处理文件未找到异常
    echo "捕获到文件未找到异常： " . $e->getMessage();
} catch (PermissionException $e) {
    // 处理权限被拒绝异常
    echo "捕获到权限被拒绝异常： " . $e->getMessage();
} catch (Exception $e) {
    // 处理其他异常
    echo "捕获到异常： " . $e->getMessage();
}
```
另外，你还可以定义自己的异常类，以便在特定情况下抛出和捕获自定义的异常。这样可以使你的代码更具可读性和可维护性。
```php
class CustomException extends Exception {
    // 自定义异常类
}

try {
    // 可能引发异常的代码
    if ($someCondition) {
        throw new CustomException("自定义异常");
    }
} catch (CustomException $e) {
    // 处理自定义异常
    echo "捕获到自定义异常： " . $e->getMessage();
} catch (Exception $e) {
    // 处理其他异常
    echo "捕获到异常： " . $e->getMessage();
}
```
#### Exception函数
![image.png](https://gcore.jsdelivr.net/gh/Okita1027/knowledge-database-images@main/basic/php/202406171910631.png)
#### 自定义异常处理

1. 使用断言（Assertions）进行调试：断言是一种用于验证代码假设的机制。在开发和调试阶段，可以使用断言来检查代码中的条件是否为真。如果断言失败，将抛出 AssertionError 异常。这
```php
function divide($numerator, $denominator) {
    assert($denominator !== 0, "除数不能为零");
    return $numerator / $denominator;
}

$result = divide(10, 0);
```

2. 自定义异常类：在处理异常时，可以自定义异常类来提供更具体的异常信息和行为。自定义异常类继承自内置的 Exception 类或其子类，并可以添加额外的属性和方法。
```php
class CustomException extends Exception {
    private $extraData;

    public function __construct($message, $code, $extraData) {
        parent::__construct($message, $code);
        $this->extraData = $extraData;
    }

    public function getExtraData() {
        return $this->extraData;
    }
}

try {
    if ($someCondition) {
        throw new CustomException("自定义异常", 500, ['key' => 'value']);
    }
} catch (CustomException $e) {
    echo "捕获到自定义异常： " . $e->getMessage();
    echo "附加数据：";
    print_r($e->getExtraData());
}
```

3. 错误处理器：除了异常处理外，PHP还提供了错误处理器（Error Handler）来处理非异常的运行时错误。错误处理器可以用于捕获和处理警告、通知、致命错误等。可以使用 set_error_handler() 函数来注册自定义的错误处理器。
```php
function customErrorHandler($errno, $errstr, $errfile, $errline) {
    echo "发生错误：$errstr";
    echo "错误文件：$errfile";
    echo "错误行号：$errline";
    
    // 可以选择记录错误日志、发送通知等其他操作
    
    // 返回 true 表示错误已经被处理，不会再由 PHP 默认的错误处理机制处理
    // 返回 false 或不返回任何值，错误会继续由 PHP 默认的错误处理机制处理
    return true;
}

// 注册自定义错误处理器
set_error_handler('customErrorHandler');
```
> 需要注意的是，自定义错误处理器只能处理非致命错误。对于致命错误（如内存耗尽错误、解析错误等），无法通过自定义错误处理器捕获和处理，因为它们无法被正常的 PHP 代码拦截

4. 异常处理器：除了在代码中使用 try/catch 块处理异常外，PHP还提供了全局的异常处理器。通过注册一个异常处理器，可以在全局范围内处理未被捕获的异常。
```php
function customExceptionHandler($exception) {
    // 处理异常逻辑
    echo "捕获到异常： " . $exception->getMessage();
}
set_exception_handler('customExceptionHandler');
```
全局异常处理器 set_exception_handler() 和自定义错误处理器 set_error_handler() 在处理错误和异常时有一些区别：

1. 错误和异常类型：set_error_handler() 注册的处理器只能处理 PHP 运行时错误（包括警告、致命错误和通知），而不能处理异常（Exception 类或其子类）。而 set_exception_handler() 注册的处理器专门用于处理异常，可以捕获和处理通过 throw 语句抛出的异常。
2. 错误级别：set_error_handler() 可以设置处理的错误级别，例如只处理警告级别的错误或只处理致命错误。而 set_exception_handler() 处理的是由 throw 语句抛出的任何异常，无论异常的类型或严重程度。
3. 使用方式：set_error_handler() 和 set_exception_handler() 的使用方式略有不同。set_error_handler() 接受一个回调函数作为参数，用于处理错误。而 set_exception_handler() 接受一个回调函数作为参数，用于处理异常。
4. 调用顺序：当同时使用 set_error_handler() 和 set_exception_handler() 注册处理器时，错误处理器会在异常处理器之前被调用。这意味着如果发生既有错误又有异常的情况，首先会触发错误处理器。

综上所述，自定义错误处理器适用于处理运行时错误，而全局异常处理器适用于捕获和处理显式抛出的异常。它们在处理不同类型的问题和错误时有不同的用途和功能。
PHP 运行时错误是在代码执行期间发生的问题，可能导致程序无法继续正常执行。PHP 将运行时错误分为不同的级别，包括警告、致命错误和通知。以下是对这些级别的详细解释：

1. 警告（Warning）：警告是一种较低级别的错误，表示在代码执行期间发生了一些潜在的问题，但不会导致程序完全中断。例如，使用未定义的变量、调用不存在的函数或方法、打开不存在的文件等情况都可能触发警告。警告不会导致脚本终止执行，而是在继续执行之前将警告消息发送到输出流（通常是浏览器或日志文件）。
2. 致命错误（Fatal Error）：致命错误是一种严重的错误，表示在代码执行期间发生了无法恢复的问题，导致程序无法继续执行。例如，调用一个不存在的类、使用无效的语法、内存耗尽等情况都可能触发致命错误。致命错误会导致脚本立即终止，并将错误消息发送到输出流。这意味着后续的代码将不会被执行。
3. 通知（Notice）：通知是一种较低级别的错误，类似于警告，表示在代码执行期间发生了一些不严重的问题。通常是一些建议性的消息，提醒开发者注意某些代码的改进或潜在的问题。例如，访问数组中不存在的键、使用未初始化的变量等情况都可能触发通知。通知不会导致脚本终止执行，而是将通知消息发送到输出流。

在默认情况下，PHP 将警告和通知显示在输出流中，以帮助开发者调试和修复代码。对于致命错误，PHP 会显示一个致命错误消息，并终止脚本的执行。
为了更好地处理这些运行时错误，可以使用 set_error_handler() 函数注册自定义错误处理器，该处理器将在发生错误时被调用，可以对错误进行捕获、记录、处理或显示自定义的错误消息。
### die
在许多编程语言中，`die` 是一个用于终止程序执行的函数或关键字。它通常用于在程序中遇到错误或不可恢复的情况下，立即停止程序的执行，并显示错误消息或进行其他处理。
在 PHP 中，`die` 是一个语言结构，用于输出一条消息并终止脚本的执行。它的作用与 `exit` 函数相似，可以用来退出程序并返回一个指定的退出状态码。
`die` 的基本语法如下：
```php
die(message);
```
或者
```php
die;
```
其中，`message` 是可选的错误消息或终止信息。
以下是一些示例，展示了 `die` 的用法：
**示例 1：**
```php
$file = fopen("data.txt", "r");

if (!$file) {
    die("无法打开文件。");
}

// 无法继续执行之后的操作
```
在上面的示例中，我们尝试打开一个名为 "data.txt" 的文件。如果文件打开失败，则执行 `die` 语句，并输出错误消息 "无法打开文件。"。这样可以避免继续执行后续的操作，因为文件无法打开。
**示例 2：**
```php
$age = 15;

if ($age < 18) {
    die("您必须年满18岁才能访问此内容。");
}

// 无法继续执行之后的操作
```
在这个示例中，我们检查年龄是否小于 18 岁。如果是，则执行 `die` 语句，并输出一条消息，阻止用户访问受限内容。
`die` 语句的执行将会立即终止程序的执行，并将消息输出给用户。你可以根据需要在 `die` 语句中提供自定义的错误消息。如果没有提供消息，则只会终止程序的执行。
需要注意的是，在实际的应用程序中，过度使用 `die` 可能会导致代码的可读性和可维护性降低。在许多情况下，使用异常处理机制可能更为合适，因为它提供了更好的错误处理和代码流程控制的灵活性。
## OOP
### 语言常规
#### 类常量
类常量在类中使用 `const` 关键字声明。
类常量区分大小写。 但是，建议以全部大写字母命名常量。
我们可以通过使用类名后跟范围解析运算符 (`::`) 后跟常量名来从类外部访问常量，如下所示：
```php
class Goodbye {
  const LEAVING_MESSAGE = "Thank you for visiting W3Schools.com!";
}

echo Goodbye::LEAVING_MESSAGE;
```
可以通过使用 self 关键字后跟范围解析运算符 ( ::) 后跟常量名，如下所示：
```php
class Goodbye {
  const LEAVING_MESSAGE = "Thank you for visiting W3Schools.com!";
  public function byebye() {
    echo self::LEAVING_MESSAGE;
  }
}

$goodbye = new Goodbye();
$goodbye->byebye();
```
#### 访问修饰符
三种访问修饰符：

- public - 可以从任何地方访问属性或方法。 这是默认设置
- protected - 属性或方法可以在类内以及从该类派生的类中访问
- private - 属性或方法只能在类中访问
```php
class Fruit {
  public $name;
  protected $color;
  private $weight;
}

$mango = new Fruit();
$mango->name = 'Mango'; // OK
$mango->color = 'Yellow'; // ERROR
$mango->weight = '300'; // ERROR
```
#### 构造、析构函数

- 构造函数：`__construct`
- 析构函数：`__destruct`
```php
class Fruit {
    public $name;
    protected $color;
    private $eat;
    // 构造函数
    public function __construct($name, $color, $eat) {
        $this->name = $name;
        $this->color = $color;
        $this->eat = $eat;
    }
    // 析构函数
    public function __destruct()
    {
        echo "The fruit is {$this->name} and the color is {$this->color} and the eat is {$this->eat}";
    }
}
```
#### 静态属性、方法
使用 `static` 关键字声明静态属性
```php
class ClassName {
  public static $staticProp = "W3Schools";
}
```
要访问静态属性，请使用类名、双冒号 (`::`) 和属性名
```php
ClassName::staticProp;
```
使用`self`也可访问静态属性
```php
class pi {
  public static $value=3.14159;
  public function staticValue() {
    return self::$value;
  }
}

$pi = new pi();
echo $pi->staticValue();
```
要从子类调用静态属性，请在子类中使用 `parent` 关键字
```php
class pi {
  public static $value=3.14159;
}

class x extends pi {
  public function xStatic() {
    return parent::$value;
  }
}

// Get value of static property directly via child class
echo x::$value;

// or get value of static property via xStatic() method
$x = new x();
echo $x->xStatic();
```
#### 抽象类
抽象类是包含**至少一个**抽象方法的类。 抽象方法是已声明但未在代码中实现的方法。
一个抽象类或方法是用 abstract 关键字定义的：
```php
abstract class ParentClass {
  abstract public function someMethod1();
  abstract public function someMethod2($name, $color);
  abstract public function someMethod3() : string;
}
```
当子类继承自抽象类时，我们有以下规则：

- 子类方法必须定义同名并重新声明父抽象方法
- 子类方法必须使用相同或更少限制的访问修饰符定义
- 所需参数的数量必须相同。 但是，子类可能还有可选参数
```php
abstract class Father {
    protected abstract function fun();
}
class Son extends Father {
    public function fun($parm = '可选参数') {
        echo 'this is a function!' . $parm;
    }
}
```
#### 接口

1. 定义接口
```php
interface InterfaceName {
  public function someMethod1();
  public function someMethod2($name, $color);
  public function someMethod3() : string;
}
```

2. 使用接口
```php
interface Animal {
  public function makeSound();
}

class Cat implements Animal {
  public function makeSound() {
    echo "Meow";
  }
}

$animal = new Cat();
$animal->makeSound();
```

3. 接口VS抽象类

接口类似于抽象类。 接口和抽象类的区别在于：

- 接口不能有属性，而抽象类可以
- 所有接口方法必须是公共的，而抽象类方法是公共的或受保护的
- 接口中的所有方法都是抽象的，因此不能在代码中实现，也不需要abstract关键字
- 类可以在实现一个接口的同时从另一个类继承
### PHP特有
#### 特征
PHP 仅支持单一继承：子类只能从一个单一父类继承。
那么，如果一个类需要继承多个行为呢? OOP 特征解决了这个问题。
特征用于声明可在多个类中使用的方法。 Traits 可以具有可在多个类中使用的方法和抽象方法，并且方法可以具有任何访问修饰符（`public`、`private` 或 `protected`）。
```php
trait TraitName {
  // some code...
}
```
```php
class MyClass {
  use TraitName;
}
```
```php
trait message1 {
public function msg1() {
    echo "OOP is fun! ";
  }
}

class Welcome {
  use message1;	// 多个特征用 , 间隔
}

$obj = new Welcome();
$obj->msg1();
```
#### 命名空间
在 PHP 中，命名空间（Namespace）是一种用于组织和管理代码的机制，它允许将相关的类、函数和常量放置在一个命名空间下，以避免命名冲突并提高代码的可维护性。PHP 中的命名空间使用关键字 `namespace` 来定义，并以分层次的方式进行组织。
**1. 定义命名空间：**
可以使用 `namespace` 关键字来定义一个命名空间，通常在文件的顶部进行定义。命名空间的命名可以使用反斜杠 `\` 来表示分层次关系。
```php
namespace MyProject;

// 类、函数和常量的定义...
```
在上面的示例中，我们定义了一个名为 `MyProject` 的命名空间。
**2. 命名空间下的元素：**
在命名空间中，可以定义类、函数和常量。它们可以通过完全限定名称（Fully Qualified Name）或使用 `use` 关键字来访问。

- 使用完全限定名称访问：
```php
$object = new \MyProject\SomeClass();
$result = \MyProject\someFunction();
$value = \MyProject\SOME_CONSTANT;
```
在上面的代码中，我们使用完全限定名称 `\MyProject\SomeClass` 来实例化一个 `SomeClass` 类，使用 `\MyProject\someFunction()` 来调用一个函数，以及使用 `\MyProject\SOME_CONSTANT` 来访问一个常量。

- 使用 `use` 关键字导入命名空间：
```php
use MyProject\SomeClass;
use function MyProject\someFunction;
use const MyProject\SOME_CONSTANT;

$object = new SomeClass();
$result = someFunction();
$value = SOME_CONSTANT;
```
在上面的代码中，我们使用 `use` 关键字导入了 `SomeClass` 类、`someFunction` 函数和 `SOME_CONSTANT` 常量，然后可以直接使用它们而无需使用完全限定名称。
**3. 命名空间的嵌套和子命名空间：**
命名空间可以进行嵌套和分层次组织，以创建更复杂的命名空间结构。
```php
namespace MyProject\SubNamespace;

// 类、函数和常量的定义...
```
在上面的示例中，我们定义了一个名为 `MyProject\SubNamespace` 的子命名空间。可以通过完全限定名称或使用 `use` 关键字来访问子命名空间中的元素。
当涉及到 PHP 中的命名空间时，还有一些其他方面和用法可以了解：

4. **别名（Alias）：**

在 PHP 中，可以使用 `use` 关键字为一个类或命名空间创建别名，以简化其使用。
```php
use MyProject\SomeClass as MyClass;

$object = new MyClass();
```
在上面的示例中，我们使用 `use` 关键字将 `MyProject\SomeClass` 类创建了一个别名 `MyClass`，然后可以使用 `MyClass` 来实例化 `SomeClass` 类。

5. **全局命名空间（Global Namespace）：**

PHP 中有一个全局命名空间，它是默认的命名空间，不需要显式指定。
```php
$object = new \SomeClass();
```
在上面的代码中，我们使用完全限定名称 `\SomeClass` 来实例化一个位于全局命名空间中的 `SomeClass` 类。

6. **多个命名空间的定义：**

一个 PHP 文件可以定义多个命名空间，但是建议每个文件只定义一个命名空间。
```php
namespace MyProject\Namespace1 {
    // 命名空间 1 的定义...
}

namespace MyProject\Namespace2 {
    // 命名空间 2 的定义...
}
```
在上面的示例中，我们在同一个文件中定义了两个命名空间 `MyProject\Namespace1` 和 `MyProject\Namespace2`，并在各自的命名空间中进行定义。

7. **动态命名空间：**

使用变量或表达式作为命名空间的一部分，从而实现动态命名空间。
```php
$namespace = 'MyProject\SubNamespace';
$className = $namespace . '\SomeClass';

$object = new $className();
```
在上面的代码中，我们使用变量 `$namespace` 和 `$className` 来构建动态命名空间，并实例化了 `$className` 变量所代表的类。

8. **命名空间的文件结构和自动加载：**

PHP 的命名空间通常与文件系统的目录结构相对应。例如，命名空间 `MyProject\SubNamespace` 可以对应于文件夹 `MyProject/SubNamespace`，并且在该文件夹下的 PHP 文件中定义相关的类、函数和常量。
为了方便自动加载命名空间下的类，可以使用 PSR-4（PHP Standards Recommendation）标准来定义命名空间和类文件的映射关系。通过遵循 PSR-4 标准，并使用自动加载机制，可以在使用类时自动加载对应的类文件，而无需手动包含（include）文件。
这些是关于 PHP 命名空间的更多信息和用法。命名空间是 PHP 中组织和管理代码的重要机制，它可以提高代码的可维护性、可读性和可重用性，并避免常见的命名冲突问题。

9. **自动加载命名空间下的类：**

当使用命名空间组织类时，可以使用自动加载机制来自动加载相应的类文件。通过注册自定义的自动加载函数，可以根据类的命名空间和类名来确定类文件的路径，并自动加载所需的类文件。
```php
spl_autoload_register(function ($className) {
    $fileName = str_replace('\\', DIRECTORY_SEPARATOR, $className) . '.php';
    require_once $fileName;
});

$object = new \MyProject\SomeClass();
```
在上面的代码中，我们使用 `spl_autoload_register` 函数注册了一个自动加载函数，它将根据类的命名空间和类名来确定类文件的路径，并使用 `require_once` 加载类文件。
#### 可迭代对象
可迭代对象（Iterable）是指可以被迭代（遍历）的对象。它是一种抽象概念，表示一组元素或数据集合，可以按照一定的顺序逐个访问这些元素。
在 PHP 中，可迭代对象是通过实现 `Iterator` 接口或 `IteratorAggregate` 接口来定义的。这些接口提供了遍历对象元素的方法和规范。
#### **1. **`**Iterator**`** 接口：**
任何实现 `Iterator` 接口的对象都可以用作需要可迭代对象的函数的参数。
迭代器包含一个项目列表并提供遍历它们的方法。它保留一个指向列表中元素之一的指针。列表中的每个项目都应该有一个可用于查找项目的键。
一个迭代器必须有这些方法：

- `current()` - 返回指针当前指向的元素。它可以是任何数据类型
- `key()` 返回与列表中当前元素关联的键。只能是整数、浮点数、布尔值或字符串
- `next()` 将指针移动到列表中的下一个元素
- `rewind()` 将指针移动到列表中的第一个元素
- `valid()` 如果内部指针没有指向任何元素（例如，如果 next() 在列表末尾被调用），这应该返回假。在任何其他情况下都返回 true
```php
class MyIterator implements Iterator {
    private $position = 0;
    private $array = ['a', 'b', 'c'];

    public function rewind() {
        $this->position = 0;
    }

    public function current() {
        return $this->array[$this->position];
    }

    public function key() {
        return $this->position;
    }

    public function next() {
        $this->position++;
    }

    public function valid() {
        return isset($this->array[$this->position]);
    }
}

$iterator = new MyIterator();

foreach ($iterator as $key => $value) {
    echo $key . ': ' . $value . "\n";
}
```
在上面的示例中，我们定义了一个实现了 `Iterator` 接口的 `MyIterator` 类。该类包含了实现 `Iterator` 接口所需的方法。然后，我们创建了一个 `MyIterator` 对象，并使用 `foreach` 循环遍历该对象的元素。
#### **2. **`**IteratorAggregate**`** 接口：**
`IteratorAggregate` 接口允许对象通过返回一个实现了 `Iterator` 接口的迭代器来进行遍历。
```php
class MyCollection implements IteratorAggregate {
    private $array = ['a', 'b', 'c'];

    public function getIterator() {
        return new ArrayIterator($this->array);
    }
}

$collection = new MyCollection();

foreach ($collection as $value) {
    echo $value . "\n";
}
```
在上面的示例中，我们定义了一个实现了 `IteratorAggregate` 接口的 `MyCollection` 类。该类实现了 `getIterator()` 方法，返回一个 `ArrayIterator` 对象作为迭代器。然后，我们创建了一个 `MyCollection` 对象，并使用 `foreach` 循环遍历该对象的元素。
#### **3. 可迭代对象和 **`**foreach**`** 循环：**
在 PHP 中，`foreach` 循环是用于遍历可迭代对象的常用语法。当在 `foreach` 循环中使用一个可迭代对象时，循环会自动调用迭代器的方法来遍历对象的元素。
```php
$items = ['a', 'b', 'c'];

foreach ($items as $value) {
    echo $value . "\n";
}
```
在上面的示例中，我们使用 `foreach` 循环遍历了一个数组 `$items` 的元素。
#### 使用Iterables
iterable 关键字可以用作函数参数的数据类型或函数的返回类型：
```php
function printIterable(iterable $myIterable) {
  foreach($myIterable as $item) {
    echo $item;
  }
}

$arr = ["a", "b", "c"];
printIterable($arr);
```
```php
function getIterable():iterable {
  return ["a", "b", "c"];
}

$myIterable = getIterable();
foreach($myIterable as $item) {
  echo $item;
}
```
## MySQL
### 连接MySQL
```php
$servername = "localhost";
$username = "username";
$password = "password";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully";
```
### CURD
#### 语法
##### 基本查询
`$conn->query($sql)`
##### 获取上次插入记录的ID
`$last_id = $conn->insert_id;`
##### 插入多条数据
```php
$sql = "INSERT INTO MyGuests (firstname, lastname, email)
VALUES ('John', 'Doe', 'john@example.com');";
$sql .= "INSERT INTO MyGuests (firstname, lastname, email)
VALUES ('Mary', 'Moe', 'mary@example.com');";
$sql .= "INSERT INTO MyGuests (firstname, lastname, email)
VALUES ('Julie', 'Dooley', 'julie@example.com')";
$conn->multi_query($sql);
```
##### 预处理
```php
// prepare and bind
$stmt = $conn->prepare("INSERT INTO MyGuests (firstname, lastname, email) VALUES (?, ?, ?)");
// i - integer（整型）
// d - double（双精度浮点型）
// s - string（字符串）
// b - BLOB（binary large object:二进制大对象）
$stmt->bind_param("sss", $firstname, $lastname, $email);

// set parameters and execute
$firstname = "John";
$lastname = "Doe";
$email = "john@example.com";
$stmt->execute();

$firstname = "Mary";
$lastname = "Moe";
$email = "mary@example.com";
$stmt->execute();

$firstname = "Julie";
$lastname = "Dooley";
$email = "julie@example.com";
$stmt->execute();

$stmt->close();
```
##### 获取查询结果
`$result = $conn->query($sql);`
```php
if ($result->num_rows > 0) {
  // output data of each row
  while($row = $result->fetch_assoc()) {
    echo "id: " . $row["id"]. " - Name: " . $row["firstname"]. " " . $row["lastname"]. "<br>";
  }
} else {
  echo "0 results";
}
```
`num_rows`判断返回的数据。
如果返回的是多条数据，`fetch_assoc()` 将结果集放入到关联数组并循环输出。

---

```php
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    echo $row['name'];
}
```
#### 案例
```php
$servername = "localhost";
$username = "username";
$password = "password";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully";
```
```php
<?php
$servername = "localhost";
$username = "root";
$password = "123456";

// Create connection
$conn = new mysqli($servername, $username, $password);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Create database
$sql = "CREATE DATABASE myDB";
if ($conn->query($sql) === TRUE) {
    echo "Database created successfully";
} else {
    echo "Error creating database: " . $conn->error;
}

$conn->close();

?>
```
```php
<?php
$servername = "localhost";
$username = "root";
$password = "123456";
$dbname = "myDB";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "数据库连接成功！";


$sql = "CREATE TABLE MyGuests (
id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
firstname VARCHAR(30) NOT NULL,
lastname VARCHAR(30) NOT NULL,
email VARCHAR(50),
reg_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

if ($conn->query($sql) === TRUE) {
    echo "Table MyGuests created successfully";
} else {
    echo "Error creating table: " . $conn->error;
}

$conn->close();

```
```php
<?php
$servername = "localhost";
$username = "root";
$password = "123456";
$dbname = "myDB";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "数据库连接成功！\n";

// 插入单条记录
$sql = "INSERT INTO MyGuests (firstname, lastname, email)
VALUES ('John', 'Doe', 'john@example.com')";

if ($conn->query($sql) === TRUE) {
    $last_id = $conn->insert_id;
    echo "New record created successfully" . $last_id;
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

// 插入多条记录
$sql = "INSERT INTO MyGuests (firstname, lastname, email)
VALUES ('John', 'Doe', 'john@example.com');";
$sql .= "INSERT INTO MyGuests (firstname, lastname, email)
VALUES ('Mary', 'Moe', 'mary@example.com');";
$sql .= "INSERT INTO MyGuests (firstname, lastname, email)
VALUES ('Julie', 'Dooley', 'julie@example.com');";
if ($conn->multi_query($sql) === TRUE) {
    echo "New records created successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();

```
```php
<?php
$servername = "localhost";
$username = "root";
$password = "123456";
$dbname = "myDB";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "数据库连接成功！\n";

// 插入单条记录
$sql = "INSERT INTO MyGuests (firstname, lastname, email)
VALUES ('John', 'Doe', 'john@example.com')";

if ($conn->query($sql) === TRUE) {
    $last_id = $conn->insert_id;
    echo "New record created successfully" . $last_id;
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

// 插入多条记录
$sql = "INSERT INTO MyGuests (firstname, lastname, email)
VALUES ('John', 'Doe', 'john@example.com');";
$sql .= "INSERT INTO MyGuests (firstname, lastname, email)
VALUES ('Mary', 'Moe', 'mary@example.com');";
$sql .= "INSERT INTO MyGuests (firstname, lastname, email)
VALUES ('Julie', 'Dooley', 'julie@example.com');";
if ($conn->multi_query($sql) === TRUE) {
    echo "New records created successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();

```
```php
<?php
$servername = "localhost";
$username = "root";
$password = "123456";
$dbname = "myDB";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// prepare and bind
$stmt = $conn->prepare("INSERT INTO MyGuests (firstname, lastname, email) VALUES (?, ?, ?)");
// i - integer（整型）
// d - double（双精度浮点型）
// s - string（字符串）
// b - BLOB（binary large object:二进制大对象）
$stmt->bind_param("sss", $firstname, $lastname, $email);

// set parameters and execute
$firstname = "John";
$lastname = "Doe";
$email = "john@example.com";
$stmt->execute();

$firstname = "Mary";
$lastname = "Moe";
$email = "mary@example.com";
$stmt->execute();

$firstname = "Julie";
$lastname = "Dooley";
$email = "julie@example.com";
$stmt->execute();

echo "New records created successfully";

$stmt->close();
$conn->close();

```
```php
<?php
$servername = "localhost";
$username = "root";
$password = "123456";
$dbname = "myDB";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$sql = "UPDATE MyGuests SET firstname='DIO', lastname='BRAND' WHERE id=2";

if ($conn->query($sql) === TRUE) {
  echo "Record updated successfully";
} else {
  echo "Error updating record: " . $conn->error;
}

$conn->close();
?>
```
```php
<?php
$servername = "localhost";
$username = "root";
$password = "123456";
$dbname = "myDB";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// sql to delete a record
$sql = "DELETE FROM MyGuests WHERE id=3";

if ($conn->query($sql) === TRUE) {
  echo "Record deleted successfully";
} else {
  echo "Error deleting record: " . $conn->error;
}

$conn->close();
?>
```
```php
<?php
$servername = "localhost";
$username = "root";
$password = "123456";
$dbname = "myDB";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$sql = "UPDATE MyGuests SET firstname='DIO', lastname='BRAND' WHERE id=2";

if ($conn->query($sql) === TRUE) {
  echo "Record updated successfully";
} else {
  echo "Error updating record: " . $conn->error;
}

$conn->close();
?>
```
```php
<?php
$servername = "localhost";
$username = "root";
$password = "123456";
$dbname = "myDB";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT id, firstname, lastname FROM MyGuests ORDER BY lastname desc";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  // output data of each row
  while($row = $result->fetch_assoc()) {
    echo "id: " . $row["id"]. " - Name: " . $row["firstname"]. " " . $row["lastname"]. "\n";
  }
} else {
  echo "0 results";
}
$conn->close();
?>
```
```php
<?php
$servername = "localhost";
$username = "root";
$password = "123456";
$dbname = "myDB";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// $sql = "SELECT id, firstname, lastname FROM MyGuests limit 3 offset 1";  // 偏移量1，限制三个，即从第二个开始的3个元素
$sql = "SELECT * FROM MyGuests LIMIT 3, 2"; // 使用逗号时，数字是颠倒的，即倒数第三个开始后的2个
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  // output data of each row
  while($row = $result->fetch_assoc()) {
    echo "id: " . $row["id"]. " - Name: " . $row["firstname"]. " " . $row["lastname"]. "\n";
  }
} else {
  echo "0 results";
}
$conn->close();
?>
```
## XML
### 解析器类型
在 XML 解析中，有两种主要的解析器类型：基于树的解析器（Tree-based Parser）和基于事件的解析器（Event-based Parser）。它们在处理 XML 数据时采用了不同的方法和策略。

1. 基于树的解析器（Tree-based Parser）：
基于树的解析器（例如 DOM 解析器）将整个 XML 文档加载到内存中，并构建一个树状结构（DOM 树）来表示整个文档。这样可以方便地遍历、查询和修改文档的任意部分，因为整个文档在内存中可用。

基于树的解析器的优点是：

- 允许随机访问和修改 XML 文档中的任何部分。
- 提供了丰富的方法和属性，用于操作和处理 XML 节点。
- 适用于处理较小的 XML 文档或需要对整个文档进行操作的场景。

然而，基于树的解析器也有一些缺点：

- 占用较多的内存，对于大型 XML 文档可能会导致性能问题。
- 在处理大型文档时，加载整个文档到内存中可能会导致延迟较高。
2. 基于事件的解析器（Event-based Parser）：
基于事件的解析器（例如 SAX 解析器）从头到尾逐行读取 XML 文档，并在解析过程中触发各种事件（例如开始元素、结束元素、文本节点等）。应用程序可以注册事件处理程序来响应这些事件，以实现对文档的处理和处理。

基于事件的解析器的优点是：

- 不需要将整个 XML 文档加载到内存中，因此适用于处理大型 XML 文档。
- 解析过程是逐行进行的，不会占用大量内存。
- 适用于一次性处理文档的场景，不需要随机访问和修改文档的任意部分。

然而，基于事件的解析器也有一些缺点：

- 编码复杂度较高，需要编写事件处理程序来处理不同的解析事件。
- 无法直接随机访问和修改文档中的任意部分，因为解析是顺序进行的。

选择使用基于树的解析器还是基于事件的解析器取决于具体的需求和场景。如果需要对整个文档进行操作或需要随机访问和修改文档的任意部分，则基于树的解析器更适合。如果处理大型 XML 文档或只需顺序处理文档的一部分，则基于事件的解析器更合适。
### SimpleXML
PHP 的 SimpleXML 扩展提供了一种简单而直观的方式来解析和处理 XML 数据。它将 XML 数据转换为一个对象，通过对象的属性和方法来访问和操作 XML 数据。

#### 解析 XML 字符串数据：
```php
$xmlString = '<?xml version="1.0" encoding="UTF-8"?>
<students>
  <student>
    <name>John Doe</name>
    <age>20</age>
    <gender>Male</gender>
    <grade>A</grade>
  </student>
  <student>
    <name>Jane Smith</name>
    <age>19</age>
    <gender>Female</gender>
    <grade>B+</grade>
  </student>
</students>';

$xml = simplexml_load_string($xmlString);
```
```php
// XML文档有错误时，libxml_use_internal_errors()函数
// 可以设置是否使用内置的错误处理函数。
libxml_use_internal_errors(true);
$myXMLData =
"<?xml version='1.0' encoding='UTF-8'?>
<document>
<user>John Doe</wronguser>
<email>john@example.com</wrongemail>
</document>";

$xml = simplexml_load_string($myXMLData);
if ($xml === false) {
  echo "Failed loading XML: ";
  foreach(libxml_get_errors() as $error) {
    echo "<br>", $error->message;
  }
} else {
  print_r($xml);
}
```
#### 访问 XML文件 数据：
```xml
<?xml version="1.0" encoding="UTF-8"?>
<students>
  <student code="001">
    <name smallName="John">John · Doe</name>
    <age>20</age>
    <gender>female</gender>
    <grade>B</grade>
  </student>
  <student>
    <name>Jane Smith</name>
    <age>19</age>
    <gender>Female</gender>
    <grade>B+</grade>
  </student>
  <student>
    <name>Bob Johnson</name>
    <age>21</age>
    <gender>Male</gender>
    <grade>A-</grade>
  </student>
</students>

```
```php
// 读取XML文件
$xml = simplexml_load_file("./XML/Data.xml") or die("Error: Cannot create object");
// 获取特定元素的值
echo $xml->student[0]->name;
echo $xml->student[1]->age;
echo $xml->student[2]->gender;
// 获取属性值
echo $xml->student[0]['code'] . "\n";
echo $xml->student[0]->attributes()->code . "\n;
echo $xml->student[0]->name['smallName'] . "\n";
// 循环遍历
for ($i = 0; $i < count($xml->student); $i++) {
    echo $xml->student[$i]->name;
    echo $xml->student[$i]->age;
    echo $xml->student[$i]->gender;
}
echo "\n";
foreach ($xml->student as $student) {
    echo $student->name;
    echo $student->age;
    echo $student->gender;
}
```
```php
// 转换为关联数组
$xml = simplexml_load_file("./XML/Data.xml");
$array = json_decode(json_encode($xml), true);
// print_r($array);
foreach ($array['student'] as $student) {
    echo $student['name'] . "\n";
}
for ($i = 0; $i < count($array['student']); $i++) {
  echo $array['student'][$i]['name'] . "\n";
  echo $array['student'][$i]['age'] . "\n";
  echo $array['student'][$i]['gender'] . "\n";
}
```
```php
// 使用 XPath 查询选择所有学生节点的名称
$xml = simplexml_load_file("./XML/Data.xml");
$names = $xml->xpath('//student/name');

foreach ($names as $name) {
    echo $name . "\n";
}
```
```php
// 处理命名空间
$xmlString = '<?xml version="1.0" encoding="UTF-8"?>
<ns:students xmlns:ns="http://example.com">
  <ns:student>
    <ns:name>John Doe</ns:name>
    <ns:age>20</ns:age>
  </ns:student>
</ns:students>';

$xml = simplexml_load_string($xmlString);
$namespaces = $xml->getNamespaces(true);

// 访问具有命名空间的节点
$student = $xml->children($namespaces['ns'])->student;
$name = $student->name;
$age = $student->age;

echo $name . $age;
```
#### 修改 XML 数据：
```php
$xml = simplexml_load_file("./XML/Data.xml");
// 修改第一个学生的成绩
$xml->student[0]->name = "John · Doe";
$xml->student[0]->age = 20;
$xml->student[0]->gender = "female";
$xml->student[0]->grade = "B";
$xml->student[0]['code'] = "01";
$xml->student[0]->name['smallName'] = "John";

// 添加新的学生节点
$newStudent = $xml->student->addChild('student');
$newStudent->addChild('name', 'Bob Johnson');
$newStudent->addChild('age', 21);
$newStudent->addChild('gender', 'Male');
$newStudent->addChild('grade', 'A-');

// 保存修改后的 XML 数据到文件
$xml->asXML('path/to/newfile.xml');
```
### XML Expat
XML Expat 扩展提供了一种事件驱动的解析方式，逐行读取 XML 数据并触发相应的事件，以便应用程序可以对这些事件进行处理。
```php
<?php

// 创建解析器对象
$parser = xml_parser_create();

// 定义事件处理函数
/**
 * @param [type] $parser 解析器对象
 * @param [type] $name 元素名称
 * @param [type] $attrs 元素属性
 * @return void
 */
function startElement($parser, $name, $attrs) {
    echo "开始元素：$name\n";
    echo "属性：";
    print_r($attrs);
}

/**
 * @param [type] $parser 解析器对象
 * @param [type] $name 元素名称
 * @return void
 */
function endElement($parser, $name) {
    echo "结束元素：$name\n";
}

/**
 * @param [type] $parser 解析器对象
 * @param [type] $data 字符数据
 * @return void
 */
function characterData($parser, $data) {
    echo "字符数据：$data\n";
}

// 注册事件处理函数
xml_set_element_handler($parser, "startElement", "endElement");
xml_set_character_data_handler($parser, "characterData");

// 解析XMl文件
/* $xmlString = '<?xml version="1.0" encoding="UTF-8"?>
<students>
  <student>
    <name>John Doe</name>
    <age>20</age>
  </student>
  <student>
    <name>Jane Smith</name>
    <age>19</age>
  </student>
</students>'; */
$xmlString = file_get_contents('./XML/Data.xml');

// 解析 XML 数据
xml_parse($parser, $xmlString);

// 释放解析器
xml_parser_free($parser);

?>
```
```php
<?php
// Initialize the XML parser
$parser=xml_parser_create();

// Function to use at the start of an element
function start($parser,$element_name,$element_attrs) {
  switch($element_name) {
    case "NOTE":
    echo "-- Note --<br>";
    break;
    case "TO":
    echo "To: ";
    break;
    case "FROM":
    echo "From: ";
    break;
    case "HEADING":
    echo "Heading: ";
    break;
    case "BODY":
    echo "Message: ";
  }
}

// Function to use at the end of an element
function stop($parser,$element_name) {
  echo "<br>";
}

// Function to use when finding character data
function char($parser,$data) {
  echo $data;
}

// Specify element handler
xml_set_element_handler($parser,"start","stop");

// Specify data handler
xml_set_character_data_handler($parser,"char");

// Open XML file
$fp=fopen("./XML/Note.xml","r");

// Read data
while ($data=fread($fp,4096)) {
  xml_parse($parser,$data,feof($fp)) or
  die (sprintf("XML Error: %s at line %d",
  xml_error_string(xml_get_error_code($parser)),
  xml_get_current_line_number($parser)));
}

// Free the XML parser
xml_parser_free($parser);
?>
```
### XML DOM
```php
<?php
$dom = new DOMDocument();
$xmlString =
  '<?xml version="1.0" encoding="UTF-8"?>
<students>
  <student>
    <name>John Doe</name>
    <age>20</age>
  </student>
  <student>
    <name>Jane Smith</name>
    <age>19</age>
  </student>
</students>';

// 解析 XML 数据
$dom->loadXML($xmlString);
// $dom->load("./XML/Note.xml");

print $dom->saveXML();


// 循环遍历XML
$students = $dom->getElementsByTagName('student');
foreach ($students as $student) {
  $name = $student->getElementsByTagName('name')->item(0)->nodeValue;
  $age = $student->getElementsByTagName('age')->item(0)->nodeValue;
  echo "Name: $name, Age: $age\n";
}


// 创建新的学生结点
$newStudent = $dom->createElement('student');
$nameElement = $dom->createElement('name', 'qzy');
$ageElement = $dom->createElement('age', '21');
// 将元素添加到文档中
$newStudent->appendChild($nameElement);
$newStudent->appendChild($ageElement);
$dom->documentElement->appendChild($newStudent);
// 将修改后的XML数据保存到文件
$dom->save('./XML/DomData.xml');
```
### XML Reader/Writer
#### XML Reader
```php
<?php
// 创建 XML Reader 对象
$reader = new XMLReader();

// 打开 XML 文件或数据
$reader->open('./XML/Note.xml');

// 解析 XML 数据
while ($reader->read()) {
    // 处理事件
    switch ($reader->nodeType) {
        case XMLReader::ELEMENT:
            // 处理开始元素事件
            // $reader->name: 元素名称
            echo $reader->name . "\n";
            break;
        case XMLReader::TEXT:
            // 处理文本数据事件
            // $reader->value: 文本内容
            echo $reader->value . "\n";
            break;
        case XMLReader::END_ELEMENT:
            // 处理结束元素事件
            // $reader->name: 元素名称
            echo $reader->name . "\n";
            break;
    }
}

// 关闭 XML Reader 对象
$reader->close();

?>
```
#### XML Writer
```php
<?php
// 创建 XML Writer 对象
$writer = new XMLWriter();

// 打开输出流或文件
$writer->openURI('./XML/XMLWriterData.xml');

// 设置 XML Writer 选项
$writer->setIndent(true);
$writer->setIndentString('  ');

// 开始文档
$writer->startDocument('1.0', 'UTF-8');

// 开始元素
$writer->startElement('students');

// 写入元素和文本内容
$writer->startElement('student');
$writer->writeElement('name', 'John Doe');
$writer->writeElement('age', '20');
$writer->endElement(); // 结束元素

$writer->startElement('student');
$writer->writeElement('name', 'Jane Smith');
$writer->writeElement('age', '19');
$writer->endElement(); // 结束元素

// 结束元素
$writer->endElement(); // 结束元素

// 结束文档
$writer->endDocument();

// 关闭 XML Writer 对象
$writer->flush();
```

