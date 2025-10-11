# Python 学习 & 使用心得

> 人生苦短，我学 Python ！
> 掌握 Python 语言，享受完美人生！

## Python 的现代项目管理

先看这些视频：
- [现代Python项目管理全流程梳理](https://b23.tv/D0gze5b)
- [uv](https://b23.tv/ee9Tpbc)
- [项目结构与打包](https://www.bilibili.com/video/BV12NgLzhEKx)

### Conda

待续……

### uv

待续……

### Pixi

待续……

## Debug

待续……

## 重要的高阶知识

待续……

## 零散知识点

### Python中类的专有方法

在 Python 中，类的专有方法（也称为“魔术方法”或“dunder methods”）是以双下划线开头和结尾的方法，它们使类可以与内置的 Python 操作进行交互。这些方法通常不需要直接调用，而是通过特定的语法或操作自动触发。以下是一些常见的专有方法及其详细讲解：

#### 1. `__init__(self, ...)` —— 初始化方法
这是类的构造函数，当你创建一个类的实例时会自动调用这个方法。它通常用于对实例属性进行初始化。

```python
class MyClass:
    def __init__(self, name):
        self.name = name

obj = MyClass("Alice")
print(obj.name)  # 输出: Alice
```

#### 2. `__str__(self)` 和 `__repr__(self)` —— 字符串表示方法
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
print(str(obj))  # 输出: MyClass(name=Alice)
print(repr(obj))  # 输出: MyClass('Alice')
```

#### 3. `__len__(self)` —— 对象长度
`__len__()` 定义了 `len()` 函数对实例的行为。通常在类表示某种集合或容器时使用。

```python
class MyClass:
    def __init__(self, data):
        self.data = data

    def __len__(self):
        return len(self.data)

obj = MyClass([1, 2, 3])
print(len(obj))  # 输出: 3
```

#### 4. `__getitem__(self, key)` —— 访问元素
`__getitem__()` 允许我们使用 `[]` 来获取类的实例中的元素，通常用于实现自定义容器。

```python
class MyClass:
    def __init__(self, data):
        self.data = data

    def __getitem__(self, index):
        return self.data[index]

obj = MyClass([1, 2, 3])
print(obj[1])  # 输出: 2
```

#### 5. `__setitem__(self, key, value)` 和 `__delitem__(self, key)` —— 设置和删除元素
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
print(obj.data)  # 输出: [1, 10, 3]

del obj[1]
print(obj.data)  # 输出: [1, 3]
```

#### 6. `__iter__(self)` 和 `__next__(self)` —— 迭代器协议
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
    print(item)  # 输出: 1 2 3
```

#### 7. `__call__(self, *args, **kwargs)` —— 使实例可调用
`__call__(self)` 使类的实例可以像函数一样被调用。

```python
class MyClass:
    def __call__(self, x):
        return x * 2

obj = MyClass()
print(obj(5))  # 输出: 10
```

#### 8. `__eq__(self, other)`、`__lt__(self, other)` 等比较运算符
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
print(obj1 == obj2)  # 输出: True
```

#### 9. `__enter__(self)` 和 `__exit__(self)` —— 上下文管理协议
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

#### 10. `__new__(cls, ...)` —— 创建实例
`__new__()` 是实例创建的方法，通常不直接使用，除非你想定制实例化的过程。它比 `__init__()` 先执行。

```python
class MyClass:
    def __new__(cls, *args, **kwargs):
        print("Creating instance")
        return super(MyClass, cls).__new__(cls)

    def __init__(self, name):
        self.name = name

obj = MyClass("Alice")
# 输出: Creating instance
```

### `__init__.py` 是什么？

`__init__.py` 是 Python 中一个非常特殊的文件。它的核心作用只有一个：**将一个普通的文件夹标记为一个 Python 包（Package）**。

当你创建一个包含 `__init__.py` 文件的文件夹时，Python 解释器就会把这个文件夹当作一个“包”来对待，从而允许你从这个文件夹（包）中导入模块（`.py` 文件）或者子包（包含 `__init__.py` 的子文件夹）。

如果一个文件夹中没有 `__init__.py` 文件，那么在 Python 3.3 之前的版本中，你完全无法将其作为包导入。虽然 Python 3.3+ 引入了“隐式命名空间包”的概念，允许没有 `__init__.py` 的文件夹也被当作包，但在绝大多数情况下，**为了代码的清晰、兼容和可控性，创建 `__init__.py` 仍然是最佳实践。**

一个 `__init__.py` 文件可以是空的，仅仅起到一个“标记”的作用。但它也可以包含 Python 代码，从而实现更强大的功能。

#### 声明一个目录为包（最基本的功能）

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
# main.py
from my_package import module1

module1.some_function()
```

如果 `my_package` 目录下没有 `__init__.py`，在旧版 Python 中这行代码会直接报错 `ModuleNotFoundError`。

#### 执行包的初始化代码

`__init__.py` 文件中的代码会在这个包**第一次被导入**时执行。这个特性非常有用，可以用来执行一些包级别的初始化操作。

例如：

  * **加载配置**：从配置文件中读取设置。
  * **建立数据库连接**：初始化数据库连接池。
  * **注册插件**：动态地发现和注册包内的插件。

**示例：**

```python
# my_package/__init__.py

print(f"Initializing package 'my_package'...")

# 假设我们有一个配置模块
from . import config

# 加载配置
APP_CONFIG = config.load_config()

print("Package 'my_package' initialized.")
```

当其他文件第一次执行 `import my_package` 时，控制台会打印出这些信息，并且 `APP_CONFIG` 会被加载。

#### 简化导入路径，构建包的公共 API

这是 `__init__.py` 最常用也最强大的功能之一。它可以将包内部深层模块的功能“提升”到包的顶层命名空间，为用户提供一个更简洁、更稳定的接口（API）。

**没有使用 `__init__.py` 简化的场景：**

目录结构：

```
my_app/
└── services/
    ├── __init__.py
    ├── user_service.py   # 里面有函数 get_user
    └── product_service.py # 里面有函数 get_product
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
# services/__init__.py

# 从当前包的 user_service 模块导入 get_user 函数
from .user_service import get_user

# 从当前包的 product_service 模块导入 get_product 函数
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

#### 使用 `__all__` 控制 `from package import *` 的行为

在 Python 中，`from package import *` 通常被认为是一种不好的实践，因为它会污染当前命名空间，且不清楚到底导入了哪些东西。

但是，如果你想明确地定义当用户使用 `import *` 时，哪些变量、函数或类应该被导出，你可以在 `__init__.py` 中使用 `__all__` 变量。

`__all__` 是一个字符串列表，定义了包的“公共 API”。

**示例：**

假设 `services/__init__.py` 如下：

```python
# services/__init__.py
from .user_service import get_user, _internal_helper
from .product_service import get_product

# 定义公共 API
__all__ = ['get_user', 'get_product']
```

现在，如果一个用户执行 `from my_app.services import *`：

  * `get_user` 和 `get_product` 会被成功导入。
  * `_internal_helper`（一个内部辅助函数）则不会被导入，因为它没有被包含在 `__all__` 列表中。

这是一种非常好的封装方式，可以清晰地向使用者展示哪些是你可以放心使用的公共接口，哪些是随时可能变化的内部实现。

#### 综合实例

让我们看一个更完整的项目结构：

```
ecommerce/
├── __init__.py         # 让 ecommerce 成为一个包
├── main.py
|
└── core/
|   ├── __init__.py     # 核心功能包
|   ├── models.py       # 包含 User, Product 类
|   └── utils.py        # 包含 format_price 函数
|
└── api/
    ├── __init__.py     # API 接口包
    └── routes.py       # 包含 get_user_route, get_product_route
```

**`core/__init__.py` 的内容 (简化 API):**

```python
# ecommerce/core/__init__.py

from .models import User, Product
from .utils import format_price

# 定义通过 from .core import * 能导入的内容
__all__ = ['User', 'Product', 'format_price']
```

**`main.py` 的使用方式:**

```python
# main.py

# 因为 core/__init__.py 已经将 User 和 format_price 提升了
# 我们可以直接从 core 导入，而不需要关心 models.py 或 utils.py
from ecommerce.core import User, format_price

# 如果没有在 __init__.py 中提升，就必须这样写：
# from ecommerce.core.models import User
# from ecommerce.core.utils import format_price

user = User(name="Alice")
price = format_price(99.9)

print(f"User: {user.name}, Price: {price}")
```

#### 总结与最佳实践

1.  **始终包含 `__init__.py`**：即使文件是空的，也请在你的包目录中包含它，以确保最好的兼容性和代码清晰度。
2.  **保持简洁**：`__init__.py` 应该保持简短和专注。复杂的逻辑应该放在其他模块中。
3.  **用于提供简洁的 API**：当你创建一个库或一个复杂的包时，使用 `__init__.py` 提升关键的类和函数，为用户提供一个干净的入口。
4.  **谨慎使用初始化代码**：在 `__init__.py` 中放置的代码不应该有太多的副作用（如长时间的 I/O 操作），因为它会在导入时执行，可能会拖慢程序启动速度。
5.  **明确定义 `__all__`**：如果你希望你的包支持 `from package import *`，请务必定义 `__all__`，以避免导出不必要的内部变量。