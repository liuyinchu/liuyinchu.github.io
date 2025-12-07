# Rust 学习 & 使用笔记

> 这是一份个人笔记（速查）！

# Rust，启动！

## 啪嗒一下就安装好啦！

直接使用 `rustup` 进行安装。
```bash
curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh

. "$HOME/.cargo/env"

rustc --version
cargo --version
```

如果是 Ubuntu 系统，还需要安装（其它我不知道）：
```bash
sudo apt update
sudo apt install build-essential
```

更新：
```bash
rustup update
```

编辑器： vscode + rust-analyzer 。

## Hello, Cargo!

创建项目：
```bash
cargo new hello_cargo
cd hello_cargo

# 或者对当前文件夹
cargo init
```

构建与执行：
```bash
# 构建
cargo build

# 执行
./target/debug/hello_cargo

# 或者直接 run
cargo run
```

用于检查是否可通过编译（快）：
```bash
cargo check
```

**当我们要更快时就用：**

```bash
cargo build --release
```

```bash
cargo run --release
```

> 当项目最终准备好发布时，可以使用 `cargo build --release` 来优化编译项目。这会在 `target/release` 而不是 `target/debug` 下生成可执行文件。这些优化可以让 Rust 代码运行的更快，不过启用这些优化也需要消耗更长的编译时间。这也就是为什么会有两种不同的配置：一种是为了开发，你需要快速且频繁地重新构建；另一种是为用户构建最终程序，它们不会经常重新构建，并且希望程序运行得越快越好。如果你在基准测试代码的运行时间，请确保运行 `cargo build --release` 并使用 `target/release` 下的可执行文件进行测试。

# 记得常回来看看！

## 从零开始的入门！

知识总结：
- **`let`**: 声明一个**不可变**的变量。这是默认行为，鼓励编写更安全、更易于推理的代码。
- **`let mut`**: 声明一个**可变**的变量。只有用 `mut` 声明的变量才能重新赋值或被修改。
- **所有权 (Ownership)**: Rust 的核心特性。每个值都有一个被称为其“所有者”的变量。在任何时候，一个值只能有一个所有者。当所有者离开作用域，这个值将被丢弃（内存被释放）。
- **引用 (References)**: 通过 `&` 创建。它允许你引用（使用）一个值而**不取得其所有权**。这个过程称为**借用 (borrowing)**。
    - `&secret_number`: 创建一个不可变引用。你只能读取它，不能修改它。
    - `&mut guess`: 创建一个可变引用。你可以读取并**修改**它。
- **关键规则**: 在同一个作用域内，对于一个特定的数据，你**只能有以下两者之一**：
    - 一个或多个不可变引用 (`&T`)。
    - **唯一**一个可变引用 (`&mut T`)。
    - 这个规则在编译时就防止了数据竞争（data races）。
- `String`: 存储在堆上、可增长、UTF-8 编码的文本。
- `&str`: 字符串切片 (string slice)，通常是对 `String` 或字符串字面量 (`"hello"`) 的一个不可变引用/视图。
- **`loop`**: 创建一个无限循环，必须用 `break` 来退出。
- **`match`**: 极其强大的模式匹配工具。
    - **穷尽性**: 必须覆盖所有可能的情况，否则编译器会报错。
    - **作为表达式**: `match` 语句本身会返回一个值，可以用来给变量赋值，如 `let guess: u32 = match ... { ... };`。
- Rust 没有 `try-catch` 异常。对于可能失败的操作，函数会返回 `Result<T, E>` 枚举。
    - `Ok(T)`: 操作成功，`T` 是成功时返回的值的类型。
    - `Err(E)`: 操作失败，`E` 是失败时返回的错误的类型。
- 你可以使用 `let` 声明一个与外部作用域变量同名的新变量。这个新变量会“遮蔽”旧变量。这对于类型转换非常有用，避免了为转换后的值想一个新名字（如 `guess_str` 和 `guess_num`）。

示例代码：
```rust
// --- 1. 引入（Importing）与作用域 ---
// `use` 关键字用于将外部模块（库，也称为 crate）中的项（item）引入到当前作用域。
// 这类似于 Python 的 `import` 或 C++ 的 `using namespace`。

// `std::cmp::Ordering` 是一个枚举（enum），它有三个成员：Less, Greater, Equal。
// 我们在后面的比较中会用到它。
use std::cmp::Ordering;

// `std::io` 是标准库中处理输入/输出的模块。
use std::io;

// `rand` 是一个外部的 crate（第三方库），不是 Rust 标准库的一部分。
// 要使用它，必须先在项目的 `Cargo.toml` 文件中的 `[dependencies]` 部分添加 `rand = "x.y.z"`。
// `Rng` 是一个 trait（特征），它定义了随机数生成器应具备的功能（比如 `gen_range` 方法）。
// 必须引入这个 trait，我们才能使用它所提供的方法。
use rand::Rng;

// --- 2. 程序入口 ---
// `fn main()` 是每个 Rust 可执行程序的入口函数。程序从这里开始运行。
fn main() {
    // `println!` 是一个宏（macro），而不是一个普通的函数。
    // 在 Rust 中，以 `!` 结尾的调用通常都是宏。宏可以实现比函数更强大的元编程功能。
    println!("Guess the number!");

    // --- 3. 变量绑定、不可变性 与 类型推断 ---
    // `let` 关键字用于声明一个变量。在 Rust 中，变量默认是不可变的（immutable）。
    // 这意味着一旦 `secret_number` 被赋值，它的值就不能再被改变。这是 Rust 安全性的核心特性之一。
    // 这里我们没有显式指定 `secret_number` 的类型，Rust 编译器会根据上下文自动推断。
    let secret_number = rand::thread_rng().gen_range(1..=100);
    // `rand::thread_rng()`: 获取一个与当前线程关联的、操作系统已经播种的随机数生成器。
    // `.gen_range(1..=100)`: 调用 `Rng` trait 中的方法，生成一个范围在 [1, 100] 内的随机数。
    // `1..=100` 是一个范围表达式，`=` 表示包含结束值 100。如果是 `1..100` 则表示 [1, 100)。

    // --- 4. 循环 ---
    // `loop` 关键字会创建一个无限循环。我们需要在循环内部提供一个退出的条件（例如 `break`）。
    loop {
        println!("Please input your guess.");

        // --- 5. 可变性（Mutability）与 String 类型 ---
        // 我们需要一个地方来存储用户的输入。
        // `let mut guess`：`mut` 关键字使这个变量变为可变的（mutable）。
        // 只有可变变量的值才能被修改。
        // `String::new()`: 创建一个可增长的、UTF-8 编码的字符串。`String` 是存储在堆上的。
        // `::` 语法用于访问类型的关联函数（associated function），类似于其他语言的静态方法。
        let mut guess = String::new();

        // --- 6. I/O 操作、引用与错误处理 ---
        io::stdin()
            // `.read_line()` 方法从标准输入读取一行文本，并将其附加到传入的字符串中。
            // `&mut guess`: 这里是关键点！
            // `&` 表示我们传递的是一个引用（reference），而不是值的所有权（ownership）。
            // 这意味着 `read_line` 可以“借用”`guess` 来使用，而不会成为它的新主人。
            // `mut` 表示这个引用是可变的，即 `read_line` 函数可以修改 `guess` 的内容。
            // 这是 Rust 所有权和借用系统的核心。
            .read_line(&mut guess)
            // `read_line` 返回一个 `Result` 类型。`Result` 是一个枚举，有两个变体：`Ok` 和 `Err`。
            // `Ok` 表示操作成功，`Err` 表示操作失败。这是 Rust 处理可能失败操作的主要方式。
            // `.expect()` 是 `Result` 的一个方法。如果 `Result` 是 `Ok`，它会返回值；
            // 如果是 `Err`，程序会立即崩溃（panic!）并显示传入 `expect` 的消息。
            // 这在原型开发或确定不会失败的场景中很方便，但在生产代码中通常用 `match` 来做更优雅的错误处理。
            .expect("Failed to read line");

        // --- 7. 遮蔽（Shadowing）与类型转换 ---
        // Rust 允许我们用 `let` 声明一个与之前变量同名的新变量，这个过程称为“遮蔽”（shadowing）。
        // 这里，我们创建了一个新的 `guess` 变量，它将遮蔽之前的 `String` 类型的 `guess`。
        // 这是一种非常常见的模式，用于将值从一种类型转换为另一种类型。
        // `: u32` 是一个类型注解，我们明确告诉 Rust，新的 `guess` 变量应该是 32 位无符号整数。
        let guess: u32 = match guess.trim().parse() {
            // `match` 是 Rust 中一个极其强大的控制流结构，它允许你将一个值与一系列模式进行比较。
            // `guess.trim()`: `String` 类型的 `guess` 在用户输入时会包含换行符（例如 `5\n`）。
            // `.trim()` 会去除首尾的空白字符，返回一个字符串切片（`&str`）。
            // `.parse()`: 这是一个在字符串上很常用的方法，它会尝试将字符串解析成某种数字类型。
            // Rust 编译器根据 `: u32` 的类型注解，推断出我们想把它解析成 `u32`。
            // `.parse()` 同样返回一个 `Result` 类型，因为输入可能不是一个合法的数字（比如 "hello")。

            // `Ok(num)`: 这是 `match` 的第一个分支（arm）。如果 `parse()` 成功，返回 `Ok`，
            // 其中的值会被绑定到变量 `num` 上。然后 `=>` 右边的表达式 `num` 的值会成为整个 `match` 表达式的结果。
            Ok(num) => num,

            // `Err(_)`: 这是第二个分支。如果 `parse()` 失败，返回 `Err`。
            // `_` 是一个通配符，表示我们不关心 `Err` 里面具体是什么错误类型。
            // `=> continue`: `continue` 关键字会立即结束本次循环，并进入下一次循环，提示用户再次输入。
            Err(_) => continue,
        }; // `let` 语句以分号结尾

        println!("You guessed: {guess}"); // 新的 `{variable}` 格式化语法

        // --- 8. 比较与 Match 表达式 ---
        // `.cmp()` 方法会比较两个值，并返回我们之前引入的 `Ordering` 枚举的某个变体。
        // 同样，这里我们用了 `&secret_number`，传递了一个不可变引用，只是借用它来比较。
        match guess.cmp(&secret_number) {
            // `match` 表达式必须是穷尽的（exhaustive），即必须覆盖所有可能的情况。
            // `Ordering` 只有三个变体，所以我们提供了三个分支。
            Ordering::Less => println!("Too small!"),
            Ordering::Greater => println!("Too big!"),
            Ordering::Equal => {
                // 如果猜对了
                println!("You win!");
                // `break` 关键字用于跳出当前的 `loop` 循环。
                break;
            }
        }
    } // loop 结束
} // main 函数结束
```
## 明明只是常用却超好用！

知识总结：
- **Struct**: 将多个相关的值组合成一个有意义的类型。每个值称为一个字段（field）。适合用于描述“一个东西**拥有**某些属性”的场景（例如，一个 `User` **有** id、username 和 status）。
- **Enum**: 定义一个类型，这个类型的值可以是多个不同变体中的**一个**。适合用于描述“一个东西**是**某种状态”的场景（例如，一个 `UserStatus` **是** Active、Inactive **或** Banned）。Rust 的枚举变体可以携带关联数据，功能非常强大。
- 使用 `impl YourType { ... }` 来为你的 `struct` 或 `enum` 定义方法。**方法 (Method)**: 第一个参数通常是 `&self`, `&mut self` 或 `self`。通过实例调用，如 `my_instance.my_method()`。**关联函数 (Associated Function)**: 没有 `self` 参数。通过类型名调用，如 `UserDatabase::new()`。常用作构造函数。
- Trait (特征：定义共享行为) 类似于接口，它定义了一组方法签名，用于抽象和共享行为。通过 `impl YourTrait for YourType` 语法来为某个类型实现一个 Trait。这实现了多态性：你可以编写一个接受任何实现了特定 Trait 的类型的函数。
- `Option<T>` (处理“可能不存在”的值) 是 Rust 避免 `null` 引发错误的基石。它是一个枚举，有两个变体： `Some(T)` 表示存在一个 `T` 类型的值。 `None` 表示值不存在。编译器会强制你处理 `None` 的情况，从而让代码更健壮。**`if let Some(x) = my_option`** 是处理 `Option` 的惯用模式，比 `match` 更简洁。
- **Lifetimes (生命周期)** 是编译器用来确保所有**引用**都绝对有效的系统。它防止了“悬垂引用”（dangling references），即引用指向的内存已经被释放。 `fn my_func<'a>(x: &'a str) -> &'a str` 中的 `'a` 是一个生命周期参数。它是一种泛型，但作用于引用有效的时间范围，而非类型。它在函数签名中建立规则，比如“返回的引用的生命周期不能超过传入的引用的生命周期”。在很多简单场景下，编译器会自动推断生命周期，无需手动标注。
- **迭代器 (Iterators)**: Rust 的迭代器是“懒惰的”，意味着在被消耗（如调用 `.collect()`）之前它们不会做任何事。它们提供了一系列高效、链式调用的方法（如 `.map()`, `.filter()`, `.find()`）。
- **闭包 (Closures)**: `|arg1, arg2| { ... }` 形式的匿名函数。它们非常轻量，可以捕获（“闭包”）其所在环境中的变量。与迭代器组合使用时威力巨大。
- **`iter().filter(...).collect()`** 是 Rust 中非常常见且强大的数据处理模式。
- **移动 (Move)**: 当你将一个拥有堆上数据（如 `String`, `Vec`, `Box`）的变量传递给函数或赋值给另一个变量时，所有权会“移动”。原变量将失效，以防止“二次释放”内存。在 `db.add_user(user1)` 中，`user1` 的所有权就移动到了 `db.users` 内部。
- **借用 (Borrow)**: 通过引用 (`&` 或 `&mut`)，你可以临时“借用”一个值的使用权，而无需转移所有权。这是函数获取数据而不消耗它的主要方式。

示例代码：
```rust
// --- 1. 定义 Trait (特征) ---
// Trait 用于定义共享的行为，类似于其他语言中的接口（Interface）。
// 任何类型只要实现了这个 trait，就可以保证它具有 `summary` 这个方法。
// 这使得我们可以编写更通用的代码。
trait Summarizable {
    // 定义一个方法签名，它接受一个对自身的不可变引用 `&self`，
    // 并返回一个 `String`。
    fn summary(&self) -> String;
}

// --- 2. 定义 Enum (枚举) ---
// Enum 允许我们定义一个可以是多种变体之一的类型。
// Rust 的 Enum 非常强大，它的变体可以有关联数据。
#[derive(Debug, PartialEq)] // `derive` 是一个宏，可以为类型自动实现某些 trait。
                         // `Debug` 让我们能用 `{:?}` 格式打印这个枚举，便于调试。
                         // `PartialEq` 让我们能用 `==` 来比较两个枚举实例。
enum UserStatus {
    Active, // 简单变体
    Inactive, // 简单变体
    Banned(String), // `Banned` 变体有关联数据：一条 `String` 类型的封禁理由。
}

// --- 3. 定义 Struct (结构体) ---
// Struct 用于创建自定义的、有意义的数据类型。
#[derive(Debug)] // 同样派生 Debug trait，方便打印。
struct User {
    id: u32,
    username: String,
    status: UserStatus,
}

// --- 4. 实现 Trait (`impl Trait for Type`) ---
// 为我们自己定义的 `User` 类型实现 `Summarizable` trait。
impl Summarizable for User {
    // 现在我们必须提供 `summary` 方法的具体实现。
    fn summary(&self) -> String {
        // `format!` 宏类似于 `println!`，但它返回一个格式化好的 `String`，而不是打印到控制台。
        // `match` 表达式在这里用于根据不同的 `UserStatus` 生成不同的描述。
        let status_desc = match &self.status {
            UserStatus::Active => "Active",
            UserStatus::Inactive => "Inactive",
            // 这里我们从 `Banned` 变体中解构出关联数据 `reason`。
            UserStatus::Banned(reason) => reason,
        };
        format!("[{}] {}: {}", self.id, self.username, status_desc)
    }
}

// --- 5. 定义数据库结构体 ---
struct UserDatabase {
    // `users` 字段是一个 `Vec` (Vector)，它是 Rust 标准库提供的可增长数组（动态数组）。
    // `Vec<User>` 表示这个 Vec 中存储的元素类型是 `User`。
    users: Vec<User>,
}

// --- 6. 实现 Struct 的方法 (`impl Type`) ---
// 这个 `impl` 块是专门为 `UserDatabase` 类型定义方法的。
impl UserDatabase {
    // `new` 是一个关联函数（Associated Function），因为它没有 `&self` 参数。
    // 它通常用作构造函数。通过 `UserDatabase::new()` 来调用。
    fn new() -> Self {
        UserDatabase { users: Vec::new() } // 返回一个新的、空的 UserDatabase 实例
    }

    // `add_user` 方法接收 `&mut self` 和一个 `User`。
    // `&mut self` 表示这个方法需要可变地借用自身，因为它将要修改 `self.users`。
    // `user: User` 表示这个方法获取了 `user` 参数的所有权（Ownership）。
    // 当 `user` 被传入后，它在外部就不能再被使用了，它的所有权被“移动”到了 `users` 这个 Vec 中。
    fn add_user(&mut self, user: User) {
        self.users.push(user);
    }

    // --- 7. 生命周期 (Lifetimes) ---
    // 这个方法演示了生命周期和 `Option` 类型。
    // `&self` 表明我们只是不可变地借用数据库，因为我们只查找，不修改。
    // 返回类型 `Option<&User>` 表示：
    //  - `Option`: 我们可能找到用户，也可能找不到。`Some` 表示找到，`None` 表示没找到。
    //  - `&User`: 如果找到了，我们返回的是一个对数据库中 `User` 的**引用**，而不是 `User` 本身或其拷贝。
    //             这样可以避免不必要的数据复制，非常高效。
    //
    // `fn find_user_by_id<'a>(&'a self, id: u32) -> Option<&'a User>`
    // 上面是带有显式生命周期注解的函数签名。`'a` (读作 tick A) 是一个生命周期参数。
    // 它告诉 Rust 编译器：返回的 `&User` 引用的存活时间（生命周期）不能超过 `&self` 引用的存活时间。
    // 换句话说，只要 `UserDatabase` 实例还存在，返回的 `&User` 引用就是有效的。
    // 在这个简单的例子中，编译器可以自动推断（称为“生命周期省略规则”），所以我们不需要手动写 `'a`。
    // 但理解这个概念对于编写复杂的 Rust 程序至关重要。
    fn find_user_by_id(&self, id: u32) -> Option<&User> {
        // `.iter()` 方法返回一个集合的迭代器。
        // `.find()` 是迭代器的一个方法，它接收一个闭包（closure）。
        // 它会遍历每个元素，并返回第一个使闭包返回 `true` 的元素的引用。
        self.users.iter().find(|user| user.id == id)
    }

    // --- 8. 迭代器 (Iterators) 与 闭包 (Closures) ---
    // 这个方法展示了 Rust 强大的迭代器和闭包组合。
    // `-> Vec<&User>` 表示返回一个包含 `User` 引用的 Vec。
    fn list_active_users(&self) -> Vec<&User> {
        self.users
            .iter() // 1. 获取 `users` Vec 的一个不可变迭代器。
            // 2. `.filter()` 是一个迭代器适配器（adapter），它接收一个闭包。
            //    它会创建一个新的迭代器，只包含让闭包返回 `true` 的元素。
            //    `|u| ...` 就是一个闭包，一个可以捕获其环境的匿名函数。
            //    `u` 是迭代器中的每个元素的引用，这里是 `&&User`，通过 `*u` 解引用一次得到 `&User`。
            .filter(|u| u.status == UserStatus::Active)
            // 3. `.collect()` 是一个消费器（consumer），它会消耗迭代器，
            //    并将结果收集到一个新的集合中。Rust 会根据返回类型 `Vec<&User>` 推断出要收集成什么。
            .collect()
    }
}

// --- 程序主函数，演示用法 ---
fn main() {
    // 创建一个新的用户数据库
    let mut db = UserDatabase::new();

    // 创建几个用户。注意 `Banned` 状态的用法。
    let user1 = User { id: 1, username: "Alice".to_string(), status: UserStatus::Active };
    let user2 = User { id: 2, username: "Bob".to_string(), status: UserStatus::Inactive };
    let user3 = User { id: 3, username: "Charlie".to_string(), status: UserStatus::Banned("Spamming".to_string()) };
    let user4 = User { id: 4, username: "David".to_string(), status: UserStatus::Active };
    
    // 添加用户到数据库。注意 `user1` 等变量的所有权被移动了。
    // 在这之后，你就不能再直接使用 `user1` 这个变量了，因为它已经不“拥有”数据了。
    db.add_user(user1);
    db.add_user(user2);
    db.add_user(user3);
    db.add_user(user4);
    
    // 演示查找用户和 `Option` 的处理
    let search_id = 3;
    println!("Finding user with ID: {}", search_id);
    // `if let` 是处理 `Option` 或 `Result` 的一种非常优雅的方式。
    // 如果 `find_user_by_id` 返回 `Some(user)`，那么 `user` 变量就会被绑定到 `Some` 里的值，
    // 并且代码块会被执行。如果返回 `None`，则什么也不做。
    if let Some(found_user) = db.find_user_by_id(search_id) {
        // 调用 `Summarizable` trait 提供的方法
        println!("  Found: {}", found_user.summary());
    } else {
        println!("  User not found.");
    }

    // 演示查找不存在的用户
    println!("\nFinding user with ID: 99");
    if let Some(found_user) = db.find_user_by_id(99) {
        println!("  Found: {}", found_user.summary());
    } else {
        println!("  User not found.");
    }
    
    // 演示迭代器和闭包
    println!("\nListing active users:");
    let active_users = db.list_active_users();
    for user in active_users {
        println!("  - {}", user.summary());
    }
}
```

---

# 下面就真的是学习笔记了！

## 1. 常见编程概念

### 1.1 `mut` & 遮蔽（Shadowing）

首先，我们用一个表格来清晰地对比 `mut` 和遮蔽：

| 特性 | `mut` (可变性) | 遮蔽 (Shadowing) |
| :--- | :--- | :--- |
| **本质** | 修改**同一个**变量绑定的值 | 创建一个与旧变量**同名的新**变量，"遮蔽"旧的 |
| **内存** | 通常在同一块内存地址上修改数据 | 创建新的内存空间（或引用）来存放新值 |
| **类型** | 变量的类型**不能**改变 | 新变量的类型**可以**与旧变量不同 |
| **作用域** | 在整个作用域内都是可变的 | 新变量的作用域从声明处开始，旧变量被暂时隐藏 |
| **不可变性** | 破坏了变量的不可变性 | 重新绑定后，新变量本身仍然是**不可变**的（除非也声明为`mut`） |

#### 何时应该使用 `mut`？

**核心原则：当你需要改变一个变量的“状态”，而不是它的“本质”时，使用 `mut`。**

这通常发生在同一个逻辑实体需要在其生命周期内经历状态变化的情况下。

**A. 循环中的计数器或累加器**
这是 `mut` 最经典、最直观的用例。你正在对同一个“计数器”进行累加操作。

```rust
let mut count = 0;
while count < 5 {
    println!("Count is: {}", count);
    count += 1; // 这里在修改 count 的状态
}
```

**B. 逐步构建一个值（例如 `String` 或 `Vec`）**
当你在一个容器中添加元素时，你是在修改这个容器的状态，而不是创建一个全新的容器。

```rust
let mut names = Vec::new();
names.push("Alice");
names.push("Bob");
names.push("Charlie"); // 连续修改 names 的内部状态
```

**C. 修改结构体的字段**
当你需要更新一个实例的某个属性时，这个实例仍然是同一个实例，只是其内部状态发生了变化。

```rust
struct User {
    name: String,
    login_count: u32,
}

let mut user = User { name: "Alice".to_string(), login_count: 1 };
println!("{} has logged in {} time(s)", user.name, user.login_count);

user.login_count += 1; // 修改同一个 user 实例的状态
println!("After another login: {}", user.login_count);
```

**使用 `mut` 的优势：**

  * **性能：** 对于复杂的数据结构（如 `Vec`），原地修改通常比创建一个全新的副本更高效。
  * **直观：** 当逻辑上是“状态变更”时，使用 `mut` 更符合人的直觉。

#### 何时应该使用遮蔽（Shadowing）？

**核心原则：当你需要对一个值进行“转换”或“重新定义”，特别是涉及类型改变时，使用遮蔽。**

遮蔽的精髓在于，你不再关心那个旧的值了，新的同名变量才是你接下来要使用的。这保持了“默认不可变”的哲学。

**A. 类型转换**
这是遮蔽最强大、最常见的用途。你可以重用一个有意义的变量名，同时改变它的类型，使代码更简洁。

```rust
let input = "  42  "; // input 是 &str 类型

// 转换1：去除空白，仍然是 &str，但值变了
let input = input.trim(); 

// 转换2：解析为数字，类型变为 u32
let input: u32 = match input.parse() {
    Ok(num) => num,
    Err(_) => {
        println!("Please type a number!");
        return;
    }
};

println!("The number is: {}", input);
```

在这个例子中，如果不用遮蔽，你可能需要写成 `input_str`, `trimmed_input`, `input_num` 这样，既啰嗦又容易混淆。遮蔽让你始终使用 `input` 这个最贴切的名字。

**B. “解包”操作（Unwrapping）**
从 `Option` 或 `Result` 中取出内部值后，你通常只关心那个内部值。

```rust
let some_value: Option<i32> = Some(5);

// 旧的 some_value 是 Option<i32> 类型
// 新的 some_value 是 i32 类型
let some_value = some_value.expect("Value should exist"); 

// 此后的代码都直接使用 i32 类型的 some_value
println!("The value is {}", some_value);
```

**C. 保持不可变性**
当你进行一次性转换后，不希望这个新值再被意外修改时，遮蔽非常有用。

```rust
let message = "hello"; // 不可变

// 进行一次转换，转换后的 message 仍然是不可变的
let message = message.len(); // message 现在是 usize 类型

// message = 6; // 编译错误！因为新的 message 默认是不可变的
```

如果这里用 `mut`，你需要先声明 `let mut message = "hello";`，然后在中途改变它的值和类型（如果可能的话），这会使变量在不需要可变性的地方也变得可变，增加了出错的风险。

#### 这里有一个简单的决策流程可以遵循：

1.  **我需要改变值的类型吗？**

      * **是** -> **必须使用遮蔽**。这是 `mut` 无法做到的。
      * **否** -> 进入下一步。

2.  **我是在进行一次性的“转换”，之后就不再需要旧的值了吗？**

      * **是** -> **优先考虑遮蔽**。例如 `let x = x + 1;` 或 `let s = s.trim();`。这样做可以保持变量在转换后依然是不可变的，更安全。
      * **否** -> 进入下一步。

3.  **我是在一个循环中或一个算法里，需要反复修改同一个变量的“状态”吗？**

      * **是** -> **优先考虑 `mut`**。例如累加器、构建 `Vec` 等。这在性能和意图上都更清晰。
      * **否** -> 重新审视你的逻辑，通常 `mut` 和遮蔽的界限已经很清晰了。

**一个黄金法则：**

> **如果你能用遮蔽，并且它能让你的代码更清晰（尤其是涉及类型转换时），那就用遮蔽。否则，当你确实需要原地修改状态时，才使用 `mut`。**

Rust 的设计鼓励你尽可能地使用不可变性。遮蔽是实现这一目标同时又不失便利性的强大工具。它允许你对数据进行变换，并立即将结果重新绑定到不可变的变量上，从而将“可变”的窗口期缩到最小。而 `mut` 则是对“这里确实需要状态变化”这一事实的一个明确标记。

## 2. 认识所有权

### 2.1 栈（Stack）与堆（Heap）

在很多语言中，你并不需要经常考虑到栈与堆。不过在像 Rust 这样的系统编程语言中，值是位于栈上还是堆上在更大程度上影响了语言的行为以及为何必须做出这样的抉择。我们会在本章的稍后部分描述所有权与栈和堆相关的内容，所以这里只是一个用来预热的简要解释。

栈和堆都是代码在运行时可供使用的内存，但是它们的结构不同。栈以放入值的顺序存储值并以相反顺序取出值。这也被称作 后进先出（last in, first out）。想象一下一叠盘子：当增加更多盘子时，把它们放在盘子堆的顶部，当需要盘子时，也从顶部拿走。不能从中间也不能从底部增加或拿走盘子！增加数据叫做 入栈（pushing onto the stack），而移出数据叫做 出栈（popping off the stack）。栈中的所有数据都必须占用已知且固定的大小。在编译时大小未知或大小可能变化的数据，要改为存储在堆上。

堆是缺乏组织的：当向堆放入数据时，你要请求一定大小的空间。内存分配器（memory allocator）在堆的某处找到一块足够大的空位，把它标记为已使用，并返回一个表示该位置地址的 指针（pointer）。这个过程称作 在堆上分配内存（allocating on the heap），有时简称为 “分配”（allocating）。（将数据推入栈中并不被认为是分配）。因为指向放入堆中数据的指针是已知的并且大小是固定的，你可以将该指针存储在栈上，不过当需要实际数据时，必须访问指针。想象一下去餐馆就座吃饭。当进入时，你说明有几个人，餐馆员工会找到一个够大的空桌子并领你们过去。如果有人来迟了，他们也可以通过询问来找到你们坐在哪。

入栈比在堆上分配内存要快，因为（入栈时）分配器无需为存储新数据去搜索内存空间；其位置总是在栈顶。相比之下，在堆上分配内存则需要更多的工作，这是因为分配器必须首先找到一块足够存放数据的内存空间，并接着做一些记录为下一次分配做准备。

访问堆上的数据比访问栈上的数据慢，因为必须通过指针来访问。现代处理器在内存中跳转越少就越快。继续类比，假设有一个服务员在餐厅里处理多个桌子的点菜。在一个桌子报完所有菜后再移动到下一个桌子是最有效率的。从桌子 A 听一个菜，接着桌子 B 听一个菜，然后再桌子 A，然后再桌子 B 这样的流程会更加缓慢。出于同样原因，处理器在处理的数据彼此较近的时候（比如在栈上）比较远的时候（比如可能在堆上）更高效。

当你的代码调用一个函数时，传递给函数的值（包括可能指向堆上数据的指针）和函数的局部变量被压入栈中。当函数结束时，这些值被移出栈。

跟踪哪部分代码正在使用堆上的哪些数据，最大限度的减少堆上的重复数据的数量，以及清理堆上不再使用的数据确保不会耗尽空间，这些问题正是所有权系统要处理的。一旦理解了所有权，你就不需要经常考虑栈和堆了，不过明白了所有权的主要目的就是管理堆数据，能够帮助解释为什么所有权要以这种方式工作。

### 2.2 所有权规则

- Rust 中的每一个值都有一个 所有者（owner）。
- 值在任一时刻有且只有一个所有者。
- 当所有者离开作用域，这个值将被丢弃。

### 2.3 拷贝与移动

* 基本类型（如整数）具有固定大小，存储在栈上；赋值会复制其值，两个变量互不影响。
* 对于 `String` 等堆分配类型，赋值会 *移动*：拷贝指针、长度、容量，同时使原变量失效。
* Rust 从不自动执行深拷贝；只有显式调用 `.clone()` 才会复制堆上数据。
* 类型若实现 `Copy` trait，赋值后原变量仍然有效。
* 只有不需要自定义析构且完全栈分配的类型才可实现 `Copy`。
* 实现了 `Drop` 的类型不能实现 `Copy`。
* 常见 `Copy` 类型：所有整数、浮点、`bool`、`char`、以及仅包含 `Copy` 成员的元组。

### 2.4 引用与借用

* 将 `String` 传入函数会移动所有权；若需继续使用，必须返回之或改用引用。
* 编译器会在所有权无效处报错，确保内存安全。
* 引用 `&T` 允许访问而不取得所有权；结束时不会释放指向的数据。
* 创建引用称为借用。
* 可变引用 `&mut T` 允许修改借用的值，但受严格限制。

**引用规则**
1. 同一时刻，要么有一个可变引用，要么有任意多个不可变引用。
2. 所有引用必须有效。

### 2.5 字符串切片（slice）

* 字符串切片 `&s[a..b]` 是对 `String` 部分内容的引用，不拥有数据。
* 切片内部记录起始位置与长度，如 `&s[6..11]` 起始索引为 6，长度为 5。
* 切片适用于从字符串中借用一段数据而无需复制。