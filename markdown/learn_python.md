# Python 学习 & 使用心得 

> 人生苦短，我学 Python ！
> 掌握 Python 语言，享受完美人生！

---

## Python中类的专有方法

在 Python 中，类的专有方法（也称为“魔术方法”或“dunder methods”）是以双下划线开头和结尾的方法，它们使类可以与内置的 Python 操作进行交互。这些方法通常不需要直接调用，而是通过特定的语法或操作自动触发。以下是一些常见的专有方法及其详细讲解：

### 1. `__init__(self, ...)` —— 初始化方法
这是类的构造函数，当你创建一个类的实例时会自动调用这个方法。它通常用于对实例属性进行初始化。

```python
class MyClass:
    def __init__(self, name):
        self.name = name

obj = MyClass("Alice")
print(obj.name)   输出: Alice
```

### 2. `__str__(self)` 和 `__repr__(self)` —— 字符串表示方法
- `__str__(self)`：定义类的实例通过 `str()` 或 `print()` 输出时的字符串表示，适合给用户看。
- `__repr__(self)`：定义类的实例通过 `repr()` 或直接在交互式解释器中输出时的字符串表示，适合开发人员调试。

```python
class MyClass:
    def __init__(self, name):
        self.name = name

    def __str__(self):
        return f"MyClass(name={self.name})"

    def __repr__(self):
        return f"MyClass('{self.name}')"

obj = MyClass("Alice")
print(str(obj))   输出: MyClass(name=Alice)
print(repr(obj))   输出: MyClass('Alice')
```

### 3. `__len__(self)` —— 对象长度
`__len__()` 定义了 `len()` 函数对实例的行为。通常在类表示某种集合或容器时使用。

```python
class MyClass:
    def __init__(self, data):
        self.data = data

    def __len__(self):
        return len(self.data)

obj = MyClass([1, 2, 3])
print(len(obj))   输出: 3
```

### 4. `__getitem__(self, key)` —— 访问元素
`__getitem__()` 允许我们使用 `[]` 来获取类的实例中的元素，通常用于实现自定义容器。

```python
class MyClass:
    def __init__(self, data):
        self.data = data

    def __getitem__(self, index):
        return self.data[index]

obj = MyClass([1, 2, 3])
print(obj[1])   输出: 2
```

### 5. `__setitem__(self, key, value)` 和 `__delitem__(self, key)` —— 设置和删除元素
- `__setitem__(self, key, value)`：定义如何通过 `[]` 语法设置实例中的元素。
- `__delitem__(self, key)`：定义如何通过 `del` 语法删除实例中的元素。

```python
class MyClass:
    def __init__(self, data):
        self.data = data

    def __setitem__(self, index, value):
        self.data[index] = value

    def __delitem__(self, index):
        del self.data[index]

obj = MyClass([1, 2, 3])
obj[1] = 10
print(obj.data)   输出: [1, 10, 3]

del obj[1]
print(obj.data)   输出: [1, 3]
```

### 6. `__iter__(self)` 和 `__next__(self)` —— 迭代器协议
- `__iter__(self)`：使类的实例成为一个可迭代对象，通常返回 `self` 或一个迭代器对象。
- `__next__(self)`：定义如何返回下一个元素，当没有更多元素时抛出 `StopIteration`。

```python
class MyClass:
    def __init__(self, data):
        self.data = data
        self.index = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.index < len(self.data):
            result = self.data[self.index]
            self.index += 1
            return result
        else:
            raise StopIteration

obj = MyClass([1, 2, 3])
for item in obj:
    print(item)   输出: 1 2 3
```

### 7. `__call__(self, *args, **kwargs)` —— 使实例可调用
`__call__(self)` 使类的实例可以像函数一样被调用。

```python
class MyClass:
    def __call__(self, x):
        return x * 2

obj = MyClass()
print(obj(5))   输出: 10
```

### 8. `__eq__(self, other)`、`__lt__(self, other)` 等比较运算符
这些方法定义了对象之间的比较行为，如 `==`、`<`、`>` 等。常用的方法有：
- `__eq__(self, other)`：相等 `==`
- `__lt__(self, other)`：小于 `<`
- `__le__(self, other)`：小于等于 `<=`
- `__gt__(self, other)`：大于 `>`
- `__ge__(self, other)`：大于等于 `>=`

```python
class MyClass:
    def __init__(self, value):
        self.value = value

    def __eq__(self, other):
        return self.value == other.value

obj1 = MyClass(10)
obj2 = MyClass(10)
print(obj1 == obj2)   输出: True
```

### 9. `__enter__(self)` 和 `__exit__(self)` —— 上下文管理协议
这些方法允许类实例用于 `with` 语句，通常用于资源管理，如文件打开和关闭。

```python
class MyClass:
    def __enter__(self):
        print("Entering context")
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        print("Exiting context")

with MyClass():
    print("Inside context")
```

输出：
```
Entering context
Inside context
Exiting context
```

### 10. `__new__(cls, ...)` —— 创建实例
`__new__()` 是实例创建的方法，通常不直接使用，除非你想定制实例化的过程。它比 `__init__()` 先执行。

```python
class MyClass:
    def __new__(cls, *args, **kwargs):
        print("Creating instance")
        return super(MyClass, cls).__new__(cls)

    def __init__(self, name):
        self.name = name

obj = MyClass("Alice")
 输出: Creating instance
```

## `__init__.py` 是什么？

`__init__.py` 是 Python 中一个非常特殊的文件。它的核心作用只有一个：**将一个普通的文件夹标记为一个 Python 包（Package）**。

当你创建一个包含 `__init__.py` 文件的文件夹时，Python 解释器就会把这个文件夹当作一个“包”来对待，从而允许你从这个文件夹（包）中导入模块（`.py` 文件）或者子包（包含 `__init__.py` 的子文件夹）。

如果一个文件夹中没有 `__init__.py` 文件，那么在 Python 3.3 之前的版本中，你完全无法将其作为包导入。虽然 Python 3.3+ 引入了“隐式命名空间包”的概念，允许没有 `__init__.py` 的文件夹也被当作包，但在绝大多数情况下，**为了代码的清晰、兼容和可控性，创建 `__init__.py` 仍然是最佳实践。**

一个 `__init__.py` 文件可以是空的，仅仅起到一个“标记”的作用。但它也可以包含 Python 代码，从而实现更强大的功能。

### 声明一个目录为包（最基本的功能）

这是它存在的最根本原因。

假设你有如下目录结构：

```
my_project/
├── main.py
└── my_package/
    ├── __init__.py
    └── module1.py
```

因为 `my_package` 目录下有 `__init__.py` 文件，Python 就知道 `my_package` 是一个包。因此，你可以在 `main.py` 中这样写：

```python
 main.py
from my_package import module1

module1.some_function()
```

如果 `my_package` 目录下没有 `__init__.py`，在旧版 Python 中这行代码会直接报错 `ModuleNotFoundError`。

### 执行包的初始化代码

`__init__.py` 文件中的代码会在这个包**第一次被导入**时执行。这个特性非常有用，可以用来执行一些包级别的初始化操作。

例如：

  * **加载配置**：从配置文件中读取设置。
  * **建立数据库连接**：初始化数据库连接池。
  * **注册插件**：动态地发现和注册包内的插件。

**示例：**

```python
 my_package/__init__.py

print(f"Initializing package 'my_package'...")

 假设我们有一个配置模块
from . import config

 加载配置
APP_CONFIG = config.load_config()

print("Package 'my_package' initialized.")
```

当其他文件第一次执行 `import my_package` 时，控制台会打印出这些信息，并且 `APP_CONFIG` 会被加载。

### 简化导入路径，构建包的公共 API

这是 `__init__.py` 最常用也最强大的功能之一。它可以将包内部深层模块的功能“提升”到包的顶层命名空间，为用户提供一个更简洁、更稳定的接口（API）。

**没有使用 `__init__.py` 简化的场景：**

目录结构：

```
my_app/
└── services/
    ├── __init__.py
    ├── user_service.py    里面有函数 get_user
    └── product_service.py  里面有函数 get_product
```

使用者必须知道内部的文件结构，导入方式很长：

```python
from my_app.services.user_service import get_user
from my_app.services.product_service import get_product

user = get_user(123)
product = get_product('abc')
```

**使用 `__init__.py` 简化后的场景：**

我们在 `services/__init__.py` 文件中写入以下代码：

```python
 services/__init__.py

 从当前包的 user_service 模块导入 get_user 函数
from .user_service import get_user

 从当前包的 product_service 模块导入 get_product 函数
from .product_service import get_product

print("Services API has been exposed.")
```

这里的 `.` 代表当前包目录。

现在，使用者的导入就变得非常简洁：

```python
from my_app import services

user = services.get_user(123)
product = services.get_product('abc')
```

使用者不再需要关心 `get_user` 函数具体是在哪个 `.py` 文件里定义的。`services` 包通过 `__init__.py` 提供了一个统一的、简洁的对外接口。如果未来你重构代码，把 `get_user` 移到了 `auth_service.py` 文件，你只需要修改 `services/__init__.py` 的导入语句，而使用者的代码完全不需要改动。

### 使用 `__all__` 控制 `from package import *` 的行为

在 Python 中，`from package import *` 通常被认为是一种不好的实践，因为它会污染当前命名空间，且不清楚到底导入了哪些东西。

但是，如果你想明确地定义当用户使用 `import *` 时，哪些变量、函数或类应该被导出，你可以在 `__init__.py` 中使用 `__all__` 变量。

`__all__` 是一个字符串列表，定义了包的“公共 API”。

**示例：**

假设 `services/__init__.py` 如下：

```python
 services/__init__.py
from .user_service import get_user, _internal_helper
from .product_service import get_product

 定义公共 API
__all__ = ['get_user', 'get_product']
```

现在，如果一个用户执行 `from my_app.services import *`：

  * `get_user` 和 `get_product` 会被成功导入。
  * `_internal_helper`（一个内部辅助函数）则不会被导入，因为它没有被包含在 `__all__` 列表中。

这是一种非常好的封装方式，可以清晰地向使用者展示哪些是你可以放心使用的公共接口，哪些是随时可能变化的内部实现。

### 综合实例

让我们看一个更完整的项目结构：

```
ecommerce/
├── __init__.py          让 ecommerce 成为一个包
├── main.py
|
└── core/
|   ├── __init__.py      核心功能包
|   ├── models.py        包含 User, Product 类
|   └── utils.py         包含 format_price 函数
|
└── api/
    ├── __init__.py      API 接口包
    └── routes.py        包含 get_user_route, get_product_route
```

**`core/__init__.py` 的内容 (简化 API):**

```python
 ecommerce/core/__init__.py

from .models import User, Product
from .utils import format_price

 定义通过 from .core import * 能导入的内容
__all__ = ['User', 'Product', 'format_price']
```

**`main.py` 的使用方式:**

```python
 main.py

 因为 core/__init__.py 已经将 User 和 format_price 提升了
 我们可以直接从 core 导入，而不需要关心 models.py 或 utils.py
from ecommerce.core import User, format_price

 如果没有在 __init__.py 中提升，就必须这样写：
 from ecommerce.core.models import User
 from ecommerce.core.utils import format_price

user = User(name="Alice")
price = format_price(99.9)

print(f"User: {user.name}, Price: {price}")
```

### 总结与最佳实践

1.  **始终包含 `__init__.py`**：即使文件是空的，也请在你的包目录中包含它，以确保最好的兼容性和代码清晰度。
2.  **保持简洁**：`__init__.py` 应该保持简短和专注。复杂的逻辑应该放在其他模块中。
3.  **用于提供简洁的 API**：当你创建一个库或一个复杂的包时，使用 `__init__.py` 提升关键的类和函数，为用户提供一个干净的入口。
4.  **谨慎使用初始化代码**：在 `__init__.py` 中放置的代码不应该有太多的副作用（如长时间的 I/O 操作），因为它会在导入时执行，可能会拖慢程序启动速度。
5.  **明确定义 `__all__`**：如果你希望你的包支持 `from package import *`，请务必定义 `__all__`，以避免导出不必要的内部变量。

## Python 里的迭代器及应用

**迭代器**是一种可以顺序访问容器元素的对象。通过迭代器，我们可以不需要关心容器的底层结构，逐个获取元素，直到访问完所有元素。常见的迭代器例子：列表、字典、字符串、文件等。在 Python 中，迭代器有两个关键概念：迭代，即按顺序访问容器中的元素。惰性计算，不需要一次性加载所有元素，可以按需获取。

在 Python 中，迭代器对象实现了两个方法：
- `__iter__()`：返回迭代器对象本身，允许对象被迭代。
- `__next__()`：返回容器中的下一个元素。如果没有元素了，它会抛出 `StopIteration` 异常，表示迭代完成。

`map()` 函数：
```python
numbers = [1, 2, 3, 4, 5]
squared = map(lambda x: x ** 2, numbers)

 map 返回的是一个迭代器，我们需要通过迭代访问它
print(next(squared))   输出 1
print(next(squared))   输出 4
print(next(squared))   输出 9
```

`zip()` 函数：
```python
names = ['Alice', 'Bob', 'Charlie']
scores = [90, 85, 88]

zipped = zip(names, scores)

 获取下一个元素
print(next(zipped))   输出 ('Alice', 90)
print(next(zipped))   输出 ('Bob', 85)
```

**来看一个很重要的例子：**

> 在强化学习中，每个 episode（回合）通常会包含多个时间步，每个时间步都有一个状态（state）。当智能体执行动作后，如果它达到了一个终止状态（比如 CartPole 摆倒了，或者游戏结束），下一个状态（`next_state`）就会是 `None`，表示 episode 已经结束。

```python
non_final_mask = torch.tensor(
    tuple(map(lambda s: s is not None, batch.next_state)),
    device=device,
    dtype=torch.bool
)
```
这行代码的目标是生成一个布尔掩码（mask），该掩码标记了哪些样本的下一状态不是 `None`。即，如果下一状态不是终止状态，掩码值为 `True`，否则为 `False`。
```python
 假设 `batch.next_state` 是一个状态列表：
batch.next_state = [s1, s2, None, s4, None]
 那么，我们想要的掩码 `non_final_mask` 就应该是：
non_final_mask = [True, True, False, True, False]
```

`map(lambda s: s is not None, batch.next_state)`
- `map()` 是 Python 中的内置函数，它将给定的函数应用到 可迭代对象（如列表、元组）中的每一个元素上。
- 这里，`lambda s: s is not None` 是一个匿名函数，检查每个状态是否不为 None。
- 输入：`batch.next_state = [s1, s2, None, s4, None]`
- 输出：`[True, True, False, True, False]

`map()` 会返回一个迭代器，所以要将其转换为 tuple 来获取最终结果。tuple(map(...)) 就是将迭代器转换成元组：
```python
tuple(map(lambda s: s is not None, batch.next_state))   输出：(True, True, False, True, False)
```

接下来就是把这个元组变为一个 PyTorch 张量，略。

## 如何理解 `batch = Transition(*zip(*transitions))` ？

`batch = Transition(*zip(*transitions))` 是强化学习代码中最典型的 Python“解包 + 转置”技巧之一。
我们来彻底拆开，从最底层的**数据结构变化**一步步看清楚它在干什么。

假设我们从 `ReplayMemory` 里采样了一个 batch：

```python
transitions = memory.sample(3)
```

此时 `transitions` 是一个长度为 3 的 **列表**，
每个元素都是一个 `Transition` 命名元组（包含 4 个字段）：

```python
Transition = namedtuple('Transition', ('state', 'action', 'next_state', 'reward'))

transitions =
[
  Transition(state=s1, action=a1, next_state=s1', reward=r1),
  Transition(state=s2, action=a2, next_state=s2', reward=r2),
  Transition(state=s3, action=a3, next_state=s3', reward=r3)
]
```

可以形象地画成一个二维表：

| 样本 | state | action | next_state | reward |
| -- | ----- | ------ | ---------- | ------ |
| 1  | s1    | a1     | s1'        | r1     |
| 2  | s2    | a2     | s2'        | r2     |
| 3  | s3    | a3     | s3'        | r3     |

我们要把它变成**每一列一个批量的张量**，即：

| 字段           | 批次内容            |
| ------------ | --------------- |
| `state`      | (s1, s2, s3)    |
| `action`     | (a1, a2, a3)    |
| `next_state` | (s1', s2', s3') |
| `reward`     | (r1, r2, r3)    |

那么 `zip(*transitions)` 在干嘛呢？

先看`zip` 的基本用法：

```python
a = [1, 2, 3]
b = ['A', 'B', 'C']
list(zip(a, b))
→ [(1, 'A'), (2, 'B'), (3, 'C')]
```

它会把“行”打包成“列”。

而在这里的 `*` 是“解包”，`*transitions` 会把列表解包成多个参数：

```python
zip(*transitions)
→ zip(t1, t2, t3)
```

（相当于调用 zip(t1, t2, t3)，每个 t_i 是一个 Transition）

由于每个 `Transition` 是一个包含 4 个元素的 tuple：

```python
t1 = (s1, a1, s1', r1)
t2 = (s2, a2, s2', r2)
t3 = (s3, a3, s3', r3)
```

那么 `zip(t1, t2, t3)` 就会**按位置配对**：

```python
list(zip(t1, t2, t3))
→ [
    (s1, s2, s3),
    (a1, a2, a3),
    (s1', s2', s3'),
    (r1, r2, r3)
  ]
```

也就是说，它把“行”转成了“列”：

* 第一个元组是一整批 state；
* 第二个元组是一整批 action；
* 第三个元组是一整批 next_state；
* 第四个元组是一整批 reward。

这就是为什么我们称它为“批的转置（batch transpose）”。

接下来，我们再用 `Transition(*...)` 封装回去。

现在我们有一个这样的 tuple 列表：

```python
zipped = zip(*transitions)
→ [(s1,s2,s3), (a1,a2,a3), (s1',s2',s3'), (r1,r2,r3)]
```

`*zipped` 会把它再解包成 4 个参数：

```python
Transition(*zipped)
→ Transition(
    state=(s1, s2, s3),
    action=(a1, a2, a3),
    next_state=(s1', s2', s3'),
    reward=(r1, r2, r3)
)
```

于是最终的 `batch` 是一个新的 `Transition` 命名元组，
但每个字段现在都包含了一个“批次”的所有样本。

示例效果：
```python
from collections import namedtuple

Transition = namedtuple('Transition', ('state', 'action', 'next_state', 'reward'))

t1 = Transition('s1', 'a1', "s1'", 'r1')
t2 = Transition('s2', 'a2', "s2'", 'r2')
t3 = Transition('s3', 'a3', "s3'", 'r3')

transitions = [t1, t2, t3]

batch = Transition(*zip(*transitions))
print(batch)
```

输出：
```txt
Transition(
  state=('s1', 's2', 's3'),
  action=('a1', 'a2', 'a3'),
  next_state=("s1'", "s2'", "s3'"),
  reward=('r1', 'r2', 'r3')
)
```

完美实现了“行列互换”！

## 原始字符串（Raw String，`r''` / `r""`）

在字符串前加 `r`，可以让字符串中的反斜杠 `\` **不再触发转义规则**，而是按字面量原样保留。

在普通字符串中，反斜杠 `\` 是**转义起始符**：

* `\n` → 换行
* `\t` → 制表符
* `\\` → 表示一个反斜杠本身

例如：
```python
print("a\nb")
# 输出：
# a
# b
```

如果你只是想表示路径、正则、或包含大量 `\` 的文本，就必须频繁写成 `\\`，非常不便。

在字符串前加 `r`（raw），Python 会**禁用转义处理**：

```python
print(r"a\nb")
# 输出：a\nb
```

此时：

* `\n` 不再表示换行
* `\t` 不再表示制表符
* `\` 就是一个普通字符

**本质规则：**

> `r` 字符串中，`\` 只表示它自己，不再“逃逸”。


## 一个广播小技巧

`SS` 是 二维数组 `(16777217, 5)`，而 `ff` 是 一维数组 `(16777217,)`。
表达式 `SS / ff` 无法广播，因此抛出该 `ValueError`。

NumPy 的广播规则是：从 **右往左** 对齐维度，维度必须 **相等** 或 **其中一个为 1**，这里对齐结果是：
```text
SS : (16777217, 5)
ff :              (16777217,)
                   ↑
               对齐到最后一维
```
正确做法：
```python
SS / ff[:, None]
```
得到：
```text
SS         : (N, 5)
ff[:,None] : (N, 1)
------------------
结果        : (N, 5)
```
或者避免除以零：
```python
SS / np.maximum(ff[:, None], np.finfo(float).eps)
```