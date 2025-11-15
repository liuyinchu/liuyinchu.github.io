# 学习使用 PyTorch

## 1 核心数据结构 `torch.Tensor`

### 1.1 Tensor 的创建 (Creation)

最常用的方法是使用 `torch.tensor()`。
```python
import torch

# 从 Python 列表创建
data = [[1, 2], [3, 4]]
t1 = torch.tensor(data)
print(f"从列表创建:\n{t1}\n")

# 默认数据类型为 torch.int64，可以指定类型
t2 = torch.tensor(data, dtype=torch.float32)
print(f"指定 float32 类型:\n{t2}\n")
```

创建特定形状和数值的 Tensor 常用于初始化。
```python
# 创建 2x3 的全零 Tensor
zeros_t = torch.zeros(2, 3)
print(f"全零 Tensor:\n{zeros_t}\n")

# 创建 2x3 的全一 Tensor
ones_t = torch.ones(2, 3)
print(f"全一 Tensor:\n{ones_t}\n")

# 创建一个 3x3 的单位矩阵 (对角线为1，其余为0)
eye_t = torch.eye(3)
print(f"单位矩阵:\n{eye_t}\n")

# ---

# 仿照另一个 Tensor 的形状创建
# `_like` 系列函数非常方便
t_like = torch.zeros_like(t1) # t_like 的形状和数据类型都与 t1 相同
print(f"Zeros like t1:\n{t_like}\n")
```

创建序列和随机数.
```python
# 创建一个从 0 到 9 (不含10) 的序列
range_t = torch.arange(0, 10)
print(f"arange 序列:\n{range_t}\n")

# 创建一个在 [0, 1) 区间均匀分布的 2x2 随机 Tensor
rand_t = torch.rand(2, 2)
print(f"均匀分布 [0, 1):\n{rand_t}\n")

# 创建一个服从标准正态分布 (均值为0，方差为1) 的 2x2 随机 Tensor
randn_t = torch.randn(2, 2)
print(f"标准正态分布:\n{randn_t}\n")

# 创建在 [min, max) 范围内的随机整数
# 比如 2x3 的 Tensor，范围在 [0, 5)
randint_t = torch.randint(0, 5, (2, 3))
print(f"随机整数 [0, 5):\n{randint_t}\n")
```

### 1.2 索引、切片与筛选 (Indexing, Slicing & Selection)

基础索引和切片和 NumPy 非常相似，使用 `[]` 操作符。
```python
t = torch.arange(0, 12).reshape(3, 4)
# 原始 Tensor:
# [[ 0,  1,  2,  3],
#  [ 4,  5,  6,  7],
#  [ 8,  9, 10, 11]]
print(f"原始 Tensor (3x4):\n{t}\n")

# 获取第 1 行 (索引从0开始)
print(f"第 1 行:\n{t[1]}\n") # tensor([4, 5, 6, 7])

# 获取第 1 行、第 2 列的元素
print(f"t[1, 2]: {t[1, 2]}\n") # tensor(6)

# --- 切片 ---

# 获取所有行，但只取第 1 列
print(f"所有行的第 1 列:\n{t[:, 1]}\n") # tensor([1, 5, 9])

# 获取前 2 行和第 2, 3 列
# t[行, 列]
print(f"前 2 行, 2,3 列:\n{t[0:2, 2:4]}\n")
# [[ 2,  3],
#  [ 6,  7]]

# ... (省略号) 代表任意多维度
t_4d = torch.randn(2, 3, 4, 5)
# 取所有 batch 和 channel，但在 H, W 维度上取第一个元素
print(f"4D Tensor [:, :, 0, 0] 形状: {t_4d[:, :, 0, 0].shape}\n")
print(f"4D Tensor [..., 0, 0] 形状: {t_4d[..., 0, 0].shape}\n") # ... 等价于 :, :
```

使用一个布尔类型的 Tensor 来筛选元素。
```python
t = torch.tensor([[1, 2, 3], [4, 5, 6]])

# 创建一个 Mask
mask = t > 3
# mask:
# [[False, False, False],
#  [ True,  True,  True]]
print(f"Mask:\n{mask}\n")

# 应用 Mask，所有 True 对应的元素会被拉成一个 1D Tensor
print(f"Mask 筛选结果:\n{t[mask]}\n") # tensor([4, 5, 6])
```

`torch.where` 是强大的条件选择工具，`where(condition, x, y)`。
```python
x = torch.randn(2, 3)
y = torch.ones(2, 3)
print(f"x:\n{x}\n")

# 条件：x > 0
# 如果 x > 0，则取 x 的值；否则取 y 的值
result = torch.where(x > 0, x, y)
print(f"Where 结果:\n{result}\n")
```

`torch.gather` 是一个更复杂但很常用的索引操作，根据索引在指定维度上“抓取”数据。
```python
t = torch.tensor([[10, 20, 30],
                  [40, 50, 60]]) # (2, 3)

# 索引必须是 LongTensor
# 我们想在 dim=1 (列维度) 上抓取
# 第 0 行，抓取索引为 0 和 2 的元素 (10, 30)
# 第 1 行，抓取索引为 1 和 0 的元素 (50, 40)
indices = torch.tensor([[0, 2],
                        [1, 0]], dtype=torch.long) # (2, 2)

# dim=1 表示我们沿着列 (维度1) 进行索引
# gather 的输出形状与 indices 相同
result = torch.gather(t, dim=1, index=indices)
print(f"Gather 结果:\n{result}\n")
# [[10, 30],
#  [50, 40]]
```

### 1.3 形状变换 (Shape Manipulation)

`reshape` / `view` 改变 Tensor 的形状，而不改变其数据。
  * `view()`：返回一个**视图 (View)**，与原 Tensor 共享内存。性能好，但**不保证**能用于非连续 (non-contiguous) 的 Tensor。
  * `reshape()`：更灵活。如果可能，它会返回一个视图；如果不行（比如 Tensor 不连续），它会自动创建一份**拷贝 (Copy)**。**推荐优先使用 `reshape()`**。

<!-- end list -->

```python
t = torch.arange(1, 13) # tensor([ 1,  2, ..., 12])
print(f"原始 1D Tensor:\n{t}\n")

# 变换为 3x4
t_3x4 = t.reshape(3, 4)
print(f"reshape (3, 4):\n{t_3x4}\n")

# -1 是一个占位符，表示“自动计算该维度的大小”
# 12 个元素，指定 2 行，自动计算为 6 列
t_2x6 = t.reshape(2, -1)
print(f"reshape (2, -1):\n{t_2x6}\n")
```

增加/移除维度 (`unsqueeze` / `squeeze`)在深度学习中**极其常用**，用于处理 Batch 维度。
  * `unsqueeze(dim)`：在指定 `dim` 位置增加一个大小为 1 的维度。
  * `squeeze(dim)`：如果指定 `dim` 的大小为 1，则移除该维度；如果不指定 `dim`，则移除所有大小为 1 的维度。

<!-- end list -->

```python
t = torch.tensor([1, 2, 3]) # shape: (3,)
print(f"原始 shape: {t.shape}\n")

# 在 0 维 (最前面) 增加一个维度
# (3,) -> (1, 3)
# 常用于给单个样本增加 Batch 维度
t_batch = t.unsqueeze(0)
print(f"unsqueeze(0) shape: {t_batch.shape}")
print(f"unsqueeze(0) 结果:\n{t_batch}\n") # [[1, 2, 3]]

# 在 1 维 (最后面) 增加一个维度
# (3,) -> (3, 1)
t_col = t.unsqueeze(1)
print(f"unsqueeze(1) shape: {t_col.shape}")
print(f"unsqueeze(1) 结果:\n{t_col}\n") # [[1], [2], [3]]

# --- Squeeze ---
print(f"t_batch shape: {t_batch.shape}") # (1, 3)
# 移除 0 维
t_squeezed = t_batch.squeeze(0)
print(f"squeeze(0) shape: {t_squeezed.shape}\n") # (3,)

# 移除所有大小为 1 的维度
t_complex = torch.rand(1, 3, 1, 5, 1) # shape: (1, 3, 1, 5, 1)
t_squeezed_all = t_complex.squeeze()
print(f"squeeze() all shape: {t_squeezed_all.shape}\n") # (3, 5)
```

维度置换 (`permute` / `transpose`)
  * `transpose(dim0, dim1)`：只交换两个维度。
  * `permute(*dims)`：更强大，一次性重排所有维度。
这在处理图像数据时尤其重要（例如，从 `(N, H, W, C)` 切换到 `(N, C, H, W)`）。
```python
# 假设 N=1, C=3, H=28, W=28
t_img = torch.rand(1, 3, 28, 28)
print(f"原始图像 shape (N, C, H, W): {t_img.shape}\n")

# 交换 C 和 H 维度
t_transposed = t_img.transpose(1, 2) # 交换 dim 1 和 dim 2
print(f"transpose(1, 2) shape (N, H, C, W): {t_transposed.shape}\n")

# 使用 permute 切换到 (N, H, W, C)
# 原始维度: 0=N, 1=C, 2=H, 3=W
# 目标维度: 0=N, 2=H, 3=W, 1=C
t_permuted = t_img.permute(0, 2, 3, 1)
print(f"permute(0, 2, 3, 1) shape (N, H, W, C): {t_permuted.shape}\n")
```

展平 (`flatten`)常用于将特征图（CNN的输出）拉平后送入全连接层。
```python
t = torch.rand(4, 3, 28, 28) # 假设 4 个 batch, 3-channel, 28x28 图像

# 默认
f1 = t.flatten() # 展平为 1D Tensor，(4*3*28*28)
print(f"flatten() shape: {f1.shape}\n")

# 常用：保留 batch 维度 (dim 0)，展平所有后续维度
# start_dim=1 表示从 dim 1 (C) 开始展平
f2 = t.flatten(start_dim=1)
print(f"flatten(start_dim=1) shape: {f2.shape}\n") # (4, 2352) (其中 2352 = 3*28*28)
```

### 1.4 数学运算 (Mathematical Operations)

逐元素 (Element-wise) 运算 `+`, `-`, `*`, `/` 以及 `torch.add()`, `torch.exp()`, `torch.log()`, `torch.relu()` 等。
```python
a = torch.tensor([[1, 2], [3, 4]], dtype=torch.float32)
b = torch.tensor([[5, 6], [7, 8]], dtype=torch.float32)

print(f"a + b:\n{a + b}\n")
print(f"a * b (逐元素乘法):\n{a * b}\n") # 注意：这不是矩阵乘法!
print(f"torch.exp(a):\n{torch.exp(a)}\n")
```

PyTorch 具有广播机制。当两个 Tensor 形状不同时，PyTorch 会尝试“广播”它们，使形状匹配，然后再进行逐元素运算。
```python
a = torch.arange(3).reshape(3, 1) # shape (3, 1) -> [[0], [1], [2]]
b = torch.arange(2).reshape(1, 2) # shape (1, 2) -> [[0, 1]]

# a (3, 1) + b (1, 2)
# a 被广播为 (3, 2): [[0, 0], [1, 1], [2, 2]]
# b 被广播为 (3, 2): [[0, 1], [0, 1], [0, 1]]
# 结果为 (3, 2)
result = a + b
print(f"广播 (3, 1) + (1, 2) :\n{result}\n")
```

归约 (Reduction) 运算对 Tensor 的某个维度或所有元素进行聚合。
```python
t = torch.tensor([[1, 2, 3], [4, 5, 6]], dtype=torch.float32)

# 1. 对所有元素求和
print(f"全部求和: {t.sum()}\n") # tensor(21.)

# 2. 沿着维度求和 (指定 dim)
# dim=0: 沿着行操作 (对每一列求和)
# [1+4, 2+5, 3+6]
print(f"dim=0 (按列求和):\n{torch.sum(t, dim=0)}\n")

# dim=1: 沿着列操作 (对每一行求和)
# [1+2+3, 4+5+6]
print(f"dim=1 (按行求和):\n{torch.sum(t, dim=1)}\n")

# 同样适用于 .mean(), .max(), .min()
print(f"dim=1 (按行求均值):\n{torch.mean(t, dim=1)}\n")

# argmax / argmin: 返回最大/最小值的索引
# dim=0, [4, 5, 6] > [1, 2, 3]，所以索引都是 1
print(f"dim=0 (按列求 argmax):\n{torch.argmax(t, dim=0)}\n") # tensor([1, 1, 1])
```

线性代数 (Linear Algebra)
  * `torch.dot(a, b)`: 仅限 1D Tensor 的点积（内积）。
  * `torch.mv(M, v)`: 矩阵 M 乘以向量 v。
  * `torch.mm(M1, M2)`: 矩阵 M1 乘以 M2（仅限 2D Tensor）。
  * `torch.matmul(A, B)` 或 `A @ B`: **最常用**的矩阵乘法，它会自动处理 Batch 维度。

<!-- end list -->

```python
# 2D 矩阵乘法
m1 = torch.randn(2, 3)
m2 = torch.randn(3, 4)
result_mm = torch.mm(m1, m2)
print(f"mm (2, 3) x (3, 4) shape: {result_mm.shape}\n") # (2, 4)

# 推荐使用 matmul 或 @
result_matmul = m1 @ m2
print(f"matmul (2, 3) @ (3, 4) shape: {result_matmul.shape}\n") # (2, 4)

# --- 带 Batch 的矩阵乘法 ---
# 10 个 Batch, 2x3 矩阵
b1 = torch.randn(10, 2, 3)
# 10 个 Batch, 3x4 矩阵
b2 = torch.randn(10, 3, 4)

# mm 不支持 Batch
# result_bmm = torch.mm(b1, b2) # 报错!

# matmul 支持 Batch
# (10, 2, 3) @ (10, 3, 4) -> (10, 2, 4)
result_bmm = torch.matmul(b1, b2)
print(f"Batch matmul shape: {result_bmm.shape}\n")

# 转置
t = torch.randn(3, 5)
print(f"t.T shape: {t.T.shape}\n") # t.T 是 .transpose(0, 1) 的简写
```

### 1.5 拼接与拆分 (Joining & Splitting)

`torch.cat` (Concatenation)沿着**已有的**维度进行拼接，Tensor 的总维度数不变。
```python
a = torch.randn(2, 3)
b = torch.randn(2, 3)

# dim=0: 沿着第 0 维 (行) 拼接
# (2, 3) 和 (2, 3) -> (4, 3)
cat_0 = torch.cat([a, b], dim=0)
print(f"cat (dim=0) shape: {cat_0.shape}\n")

# dim=1: 沿着第 1 维 (列) 拼接
# (2, 3) 和 (2, 3) -> (2, 6)
cat_1 = torch.cat([a, b], dim=1)
print(f"cat (dim=1) shape: {cat_1.shape}\n")
```

`torch.stack` (Stacking)沿着**新的**维度进行堆叠，Tensor 的总维度数会 +1。
```python
a = torch.randn(2, 3)
b = torch.randn(2, 3)

# dim=0: 在第 0 维 (最前面) 增加一个新维度
# [a, b] (2 个 (2, 3) Tensor) -> (2, 2, 3)
stack_0 = torch.stack([a, b], dim=0)
print(f"stack (dim=0) shape: {stack_0.shape}\n")

# dim=1: 在第 1 维增加一个新维度
# -> (2, 2, 3)
stack_1 = torch.stack([a, b], dim=1)
print(f"stack (dim=1) shape: {stack_1.shape}\n")
```

`split` / `chunk` 是 `cat` 的逆操作。
  * `torch.split(tensor, split_size_or_sections, dim=0)`: 按**大小**拆分。
  * `torch.chunk(tensor, chunks, dim=0)`: 按**数量**拆分。

<!-- end list -->

```python
t = torch.arange(10).reshape(5, 2) # shape (5, 2)

# 1. split: 沿着 dim 0 (行) 拆分，每块大小为 2
# (5, 2) -> (2, 2), (2, 2), (1, 2)
split_t = torch.split(t, 2, dim=0)
print("Split 结果 (3 块):")
for s in split_t:
    print(s.shape)
print("")

# 2. chunk: 沿着 dim 0 (行) 拆分，总共拆成 3 块
# (5, 2) -> (2, 2), (2, 2), (1, 2) (自动均分)
chunk_t = torch.chunk(t, 3, dim=0)
print("Chunk 结果 (3 块):")
for c in chunk_t:
    print(c.shape)
print("")
```

### 1.6 其他常用工具 (Utilities)

`torch.Tensor` 可以在 CPU 和 GPU (CUDA) 之间无缝切换。
```python
# 检查 GPU 是否可用
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"当前设备: {device}\n")

t_cpu = torch.randn(2, 2)
print(f"t_cpu 所在设备: {t_cpu.device}\n")

# 1. 移动到 GPU
if device == "cuda":
    t_gpu = t_cpu.to(device) # .to() 是最推荐的方法
    # t_gpu = t_cpu.cuda() # 也可以
    print(f"t_gpu 所在设备: {t_gpu.device}\n")

    # 2. 从 GPU 移回 CPU
    # 注意：GPU 上的 Tensor 才能调用 .cpu()
    t_cpu_new = t_gpu.cpu()
    print(f"t_cpu_new 所在设备: {t_cpu_new.device}\n")

# 注意：不同设备上的 Tensor 不能直接运算
# t_cpu + t_gpu # 会报错
```

使用 `.to(dtype)` 或 `.float()`, `.long()` 等快捷方式进行数据类型转换。
```python
t_int = torch.tensor([1, 2])
print(f"原始类型: {t_int.dtype}")

# 转换为 float32
t_float = t_int.to(torch.float32)
# t_float = t_int.float() # 快捷方式
print(f"转换后类型: {t_float.dtype}\n")
```

PyTorch 和 NumPy 可以高效地共享数据（如果 Tensor 在 CPU 上）。
```python
import numpy as np

# 1. NumPy -> Tensor
a = np.array([1, 2, 3])
t = torch.from_numpy(a) # 共享内存
print(f"from_numpy:\n{t}\n")

# 修改 numpy 数组，tensor 也会变
a[0] = 99
print(f"修改 numpy 后 tensor:\n{t}\n") # tensor([99,  2,  3])

# 2. Tensor -> NumPy
t_cpu = torch.tensor([4, 5, 6])
# 必须在 CPU 上
b = t_cpu.numpy() # 共享内存
print(f"tensor.numpy():\n{b}\n")

# 如果 Tensor 在 GPU 上，必须先 .cpu()
if torch.cuda.is_available():
    t_gpu = t_cpu.to("cuda")
    # b_gpu = t_gpu.numpy() # 会报错
    b_gpu = t_gpu.cpu().numpy()
    print(f"GPU -> CPU -> NumPy:\n{b_gpu}\n")
```

Tensor 是 PyTorch 自动求导的核心。
```python
# requires_grad=True: 追踪在该 Tensor 上的所有操作
x = torch.tensor([1., 2., 3.], requires_grad=True)
y = torch.tensor([4., 5., 6.], requires_grad=True)

z = x * y + x
print(f"z:\n{z}\n")

# 计算 z 对 x 和 y 的梯度
s = z.sum() # 必须是一个标量
s.backward() # 反向传播

# 梯度存储在 .grad 属性中
print(f"x.grad (dz/dx):\n{x.grad}\n") # dz/dx = y + 1
print(f"y.grad (dz/dy):\n{y.grad}\n") # dz/dy = x

# --- 停止梯度追踪 ---

# 1. .detach(): 返回一个共享内存但“阻断”梯度流的新 Tensor
x_detached = x.detach()
print(f"x_detached.requires_grad: {x_detached.requires_grad}\n") # False

# 2. with torch.no_grad(): 在评估 (inference) 阶段使用，
#    该代码块内所有操作都不追踪梯度，节省内存和计算
print("--- no_grad block ---")
with torch.no_grad():
    k = x * 2
    print(f"k.requires_grad: {k.requires_grad}") # False
print("---------------------\n")
```

### 1.7 `torch.Tensor` 核心操作速查表 (Cheat Sheet)

#### 1.7.1 创建 (Creation)

| 操作 (Operation) | 示例 (Example) | 说明 (Description) |
| :--- | :--- | :--- |
| `torch.tensor(data, ...)` | `torch.tensor([[1, 2], [3, 4]])` | 从 Python 列表或 NumPy 数组创建 Tensor。 |
| `torch.zeros(shape)` | `torch.zeros(2, 3)` | 创建形状为 `(2, 3)` 的全零 Tensor。 |
| `torch.ones(shape)` | `torch.ones(2, 3)` | 创建形状为 `(2, 3)` 的全一 Tensor。 |
| `torch.rand(shape)` | `torch.rand(2, 3)` | 创建 [0, 1) 区间均匀分布的随机 Tensor。 |
| `torch.randn(shape)` | `torch.randn(2, 3)` | 创建标准正态分布 (均值0, 方差1) 的 Tensor。 |
| `torch.arange(start, end)` | `torch.arange(0, 10)` | 创建从 `start` 到 `end-1` 的 1D 序列。 |
| `torch.zeros_like(t)` | `torch.zeros_like(t1)` | 创建与 `t1` 形状和类型相同的全零 Tensor。 |
| `torch.eye(n)` | `torch.eye(3)` | 创建 `n x n` 的单位矩阵。 |

#### 1.7.2 索引与筛选 (Indexing & Selection)

| 操作 (Operation) | 示例 (Example) | 说明 (Description) |
| :--- | :--- | :--- |
| 基础索引 | `t[0, 1]` | 获取第 0 行、第 1 列的元素。 |
| 切片 (Slicing) | `t[:, 1]` | 获取所有行，但只取第 1 列。 |
| `...` (Ellipsis) | `t_4d[..., 0, 0]` | 省略号，代表任意多维度。 |
| 布尔索引 (Masking) | `t[t > 3]` | 选取 `t` 中所有大于 3 的元素 (返回 1D Tensor)。 |
| `torch.where(cond, x, y)`| `torch.where(t > 0, t, 0)` | 条件筛选：满足 `cond` (t>0) 的取 `t`，否则取 `0`。 |
| `torch.gather(t, dim, idx)` | `torch.gather(t, 1, idx)` | 沿 `dim` 维度，根据 `idx` 中的索引“抓取”元素。 |

#### 1.7.3 形状变换 (Shape Manipulation)

| 操作 (Operation) | 示例 (Example) | 说明 (Description) |
| :--- | :--- | :--- |
| `t.reshape(shape)` | `t.reshape(2, -1)` | 改变形状 (推荐)。`-1` 表示自动计算该维度。 |
| `t.view(shape)` | `t.view(2, 6)` | 改变形状 (共享内存，但对连续性有要求)。 |
| `t.unsqueeze(dim)` | `t.unsqueeze(0)` | 在 `dim` 位置增加一个大小为 1 的维度 (e.g., `(3,) -> (1, 3)`)。 |
| `t.squeeze(dim)` | `t.squeeze(0)` | 移除 `dim` 位置的大小为 1 的维度 (e.g., `(1, 3) -> (3,)`)。 |
| `t.permute(dims)` | `t.permute(0, 2, 3, 1)` | 重排所有维度 (e.g., `NCHW -> NHWC`)。 |
| `t.transpose(dim0, dim1)`| `t.transpose(1, 2)` | 仅交换 `dim0` 和 `dim1` 两个维度。 |
| `t.T` | `t.T` | 2D Tensor 的转置 (`.transpose(0, 1)`)。 |
| `t.flatten(start_dim)` | `t.flatten(start_dim=1)` | 从 `start_dim` 开始展平。常用于保留 Batch 维。 |

#### 1.7.4 数学与归约 (Math & Reduction)

| 操作 (Operation) | 示例 (Example) | 说明 (Description) |
| :--- | :--- | :--- |
| `+`, `-`, `*`, `/` | `a + b` 或 `torch.add(a, b)` | 逐元素 (Element-wise) 运算。 |
| `t.sum()` / `.mean()` | `t.sum()` | 对所有元素求和 / 均值 (返回标量)。 |
| `t.sum(dim)` | `t.sum(dim=0)` | 沿 `dim` 维度求和 (归约)。 |
| `t.max()` / `.min()` | `t.max()` | 对所有元素求最大值 / 最小值。 |
| `t.max(dim)` | `t.max(dim=1)` | 沿 `dim` 维度求最大值 (同时返回 `values` 和 `indices`)。 |
| `t.argmax(dim)` | `t.argmax(dim=1)` | 沿 `dim` 维度求最大值的索引 (Index)。 |
| `a @ b` (or `torch.matmul`) | `a @ b` | 矩阵乘法 (最常用，支持 Batch 和广播)。 |
| `torch.mm(a, b)` | `torch.mm(a, b)` | 矩阵乘法 (仅限 2D Tensor)。 |
| `torch.dot(a, b)` | `torch.dot(a, b)` | 1D Tensor 的点积 (内积)。 |

#### 1.7.5 拼接与拆分 (Joining & Splitting)

| 操作 (Operation) | 示例 (Example) | 说明 (Description) |
| :--- | :--- | :--- |
| `torch.cat(tensors, dim)` | `torch.cat([a, b], dim=0)` | 沿**已有** `dim` 拼接。`dim=0` (行), `(2,3), (2,3) -> (4,3)`。 |
| `torch.stack(tensors, dim)`| `torch.stack([a, b], dim=0)` | 沿**新的** `dim` 堆叠。`dim=0`, `(2,3), (2,3) -> (2, 2, 3)`。 |
| `torch.split(t, size, dim)` | `torch.split(t, 2, dim=0)` | 沿 `dim` 维度，按**大小** `size` 拆分。 |
| `torch.chunk(t, num, dim)` | `torch.chunk(t, 3, dim=0)` | 沿 `dim` 维度，按**数量** `num` 拆分 (自动均分)。 |

#### 1.7.6 转换与 Autograd (Conversion & Autograd)

| 操作 (Operation) | 示例 (Example) | 说明 (Description) |
| :--- | :--- | :--- |
| `t.to(device)` | `t.to("cuda")` / `t.to("cpu")` | 将 Tensor 移动到指定设备 (CPU / GPU)。 |
| `t.to(dtype)` | `t.to(torch.float32)` | 转换数据类型。 |
| `.float()` / `.long()` | `t.float()` | 快捷类型转换 (`float32` / `int64`)。 |
| `t.numpy()` | `t.cpu().numpy()` | Tensor -> NumPy 数组 (必须在 CPU 上，共享内存)。 |
| `torch.from_numpy(arr)` | `torch.from_numpy(np_arr)` | NumPy 数组 -> Tensor (共享内存)。 |
| `t.requires_grad_(True)` | `t.requires_grad_(True)` | **In-place** 地设置，使其可被 Autograd 追踪。 |
| `t.detach()` | `t_new = t.detach()` | 返回一个新 Tensor，与原 Tensor 共享数据，但阻断梯度流。 |
| `t.grad` | `print(t.grad)` | 访问 `t.backward()` 后计算出的梯度。 |
| `with torch.no_grad():` | `with torch.no_grad(): ...` | 代码块内所有操作不计算梯度，用于模型评估 (Inference)。 |

---

## 2 一个在 Cart-Pole DQN 中的具体应用案例讲解与分析

### 2.1 创建一个掩码（mask）用于标记哪些样本的“下一状态”不是终止状态

在强化学习中，每个 episode（回合）通常会包含多个时间步，每个时间步都有一个状态（state）。
当智能体执行动作后，如果它达到了一个终止状态（比如 CartPole 摆倒了，或者游戏结束），**下一个状态（`next_state`）就会是 `None`**，表示 episode 已经结束。

```python
non_final_mask = torch.tensor(
    tuple(map(lambda s: s is not None, batch.next_state)),
    device=device,
    dtype=torch.bool
)
```

这行代码的目标是**生成一个布尔掩码（mask）**，该掩码标记了哪些样本的下一状态不是 `None`。
即，如果下一状态不是终止状态，掩码值为 `True`，否则为 `False`。

假设 `batch.next_state` 是一个状态列表：
```python
batch.next_state = [s1, s2, None, s4, None]
```

那么，我们想要的掩码 `non_final_mask` 就应该是：
```python
non_final_mask = [True, True, False, True, False]
```
这意味着第 3 和第 5 个样本是终止状态，因此它们对应的位置是 `False`。

`map(lambda s: s is not None, batch.next_state)` ：**`map()`** 是 Python 中的内置函数，它将给定的函数应用到 **可迭代对象**（如列表、元组）中的每一个元素上。这里，`lambda s: s is not None` 是一个匿名函数，**检查每个状态是否不为 `None`**。
* 输入：`batch.next_state = [s1, s2, None, s4, None]`
* 输出：`[True, True, False, True, False]`

**`map()`** 会返回一个迭代器，所以要将其转换为 tuple 来获取最终结果，`tuple(map(...))` 就是将迭代器转换成元组：
```python
tuple(map(lambda s: s is not None, batch.next_state))  # 输出：(True, True, False, True, False)
```

`torch.tensor(..., device=device, dtype=torch.bool)` 最终生成的 `non_final_mask` 是一个布尔张量：
```python
non_final_mask = tensor([True, True, False, True, False], dtype=torch.bool, device=device)
```

### 2.2 利用 `torch.cat()` 进行拼接

```python
non_final_next_states = torch.cat([s for s in batch.next_state if s is not None])
state_batch = torch.cat(batch.state)
action_batch = torch.cat(batch.action)
reward_batch = torch.cat(batch.reward)
```

在 DQN 中，**经验回放**采样得到的每一条数据都是一个 `Transition` 命名元组，包含 4 个字段：
* `state`: 当前状态
* `action`: 当前采取的动作
* `next_state`: 执行动作后的下一个状态
* `reward`: 执行动作后的奖励

比如，`batch` 可能是这样：
```python
batch = Transition(
    state=[s1, s2, s3],       # 3 个状态
    action=[a1, a2, a3],      # 3 个动作
    next_state=[s1', s2', None],  # 第 3 个状态是 None，表示终止状态
    reward=[r1, r2, r3]       # 3 个奖励
)
```

这一行的目标是：**筛选出所有非终止状态（即 `next_state` 不是 `None` 的状态）**，并把它们拼接成一个张量。
```python
non_final_next_states = torch.cat([s for s in batch.next_state if s is not None])
```

`batch.next_state` 是一个列表，里面包含了每个样本的下一个状态：
```python
batch.next_state = [s1', s2', None]
```

`[s for s in batch.next_state if s is not None]` 使用了列表推导式，**去除掉其中的 `None` 元素**（即终止状态）：
```python
[s1', s2']
```

```python
torch.cat([s1', s2'])
```
会将 `s1'` 和 `s2'` 按照维度 0（即垂直方向）拼接成一个新的张量。

这三行代码是对批次数据进行拼接，类似地将所有的状态、动作和奖励合并成张量。
```python
state_batch = torch.cat(batch.state)
action_batch = torch.cat(batch.action)
reward_batch = torch.cat(batch.reward)
```

**上述讲解还是会有些抽象，我们在 2.3 中再来一遍！**

### 2.3 回过头来思考 `torch.cat()` 到底把数据从什么样变成什么样了？

#### 2.3.1 先看看我们对 `state` 的操作（`.unsqueeze()` 操作）

```python
state = torch.tensor(state, dtype=torch.float32, device=device).unsqueeze(0)
```
这是 DQN 训练循环里把 **环境返回的原始 state（通常是 numpy 数组）转换成 PyTorch 能吃的张量**，并 **加一维 batch 维度** 的步骤。

**环境给的 `state` 是什么格式？**

大多数 Gym 环境返回的 state 是一个 **numpy array**：
```python
state = np.array([position, velocity, angle, angular_velocity])
# shape = (4,)
```

PyTorch 网络要求输入必须是 **torch.Tensor**，不是 numpy。所以第一步是转换格式：
```python
torch.tensor(state, dtype=torch.float32, device=device)
```

这个结果是：
```
tensor([x1, x2, x3, x4], dtype=torch.float32, device=device)
```
**这是一个 shape = `(4,)` 的 一维张量。**

`.unsqueeze(0)`是关键点了，这步是为了 **给 state 添加一个 batch 维度**。核心在于深度学习中（`torch.nn`）**神经网络的输入必须是二维：(batch_size, feature_dim)**。`.unsqueeze(0)` 的意思是在维度 0 的位置上插入一个新维度。所以：
```python
tensor([x1, x2, x3, x4])  # shape = (4,)
.unsqueeze(0)
→ tensor([[x1, x2, x3, x4]])  # shape = (1, 4)
```
这就是一个 batch size = 1 的输入形式。

假设 state 原始是：
```python
state = [0.1, 0.01, 0.05, -0.02]
shape = (4,)
```

转换：
```python
tensor([0.1, 0.01, 0.05, -0.02])
shape = (4,)
```

unsqueeze 增加 batch 维度：
```python
tensor([[0.1, 0.01, 0.05, -0.02]])
shape = (1, 4)
```

#### 2.3.2 现在我们知道数据形式为 (batch_size, feature_dim)  

**batch.state 里面是什么？**

先看前面那句：
```python
batch = Transition(*zip(*transitions))
```
这之后的 `batch.state` 是一个 **长度 = BATCH_SIZE 的 tuple**，里面每个元素是一个 **state 张量**。

例如，假设 BATCH_SIZE = 3，那么：
```python
batch.state = (s1, s2, s3)
```

而每个 s_i 本身就是一个 PyTorch 张量，形状一般是：
```python
s1 = tensor([[x11, x12, x13, x14]])   # shape: [1, 4]
s2 = tensor([[x21, x22, x23, x24]])   # shape: [1, 4]
s3 = tensor([[x31, x32, x33, x34]])   # shape: [1, 4]
```

现在我们可以理解为什么是 `[1, 4]`，因为 Cart-Pole 的 observation space 维度是 4，而每个 state 在环境里通常会被包装成 shape = `(1, n_features)` 的张量。

**torch.cat(batch.state) 实际拼成什么？**

`torch.cat()` 是把张量沿着指定维度拼接。默认是 `dim=0`，即把**第 0 维（行）拼上去**。也就是说：
```python
torch.cat([s1, s2, s3])
```

等价于：
```python
tensor([
    [x11, x12, x13, x14],
    [x21, x22, x23, x24],
    [x31, x32, x33, x34]
])
```

**形状从原来的每个 `(1,4)` 拼成一个大的 `(3, 4)` 张量：**
```python
state_batch.shape == (BATCH_SIZE, n_observations)
```

### 2.4 利用 `.gather` 进行索引

#### 2.4.1 TD Error 的后一半，Q(s,a)

```python
state_action_values = policy_net(state_batch).gather(1, action_batch)
```
它的任务是：**用策略网络（policy_net）计算 Q(s,a) 中的 Q(s,a)，并且只取出 batch 里“真正执行过的动作”的那一列。**

**policy_net(state_batch) 会输出什么？**

假设：
* batch_size = 3
* 动作数 n_actions = 2（CartPole 左、右）

那么：
```python
Q_all = policy_net(state_batch)
```

得到的是一个 **3 × 2** 的矩阵：
```python
Q_all =
[
  [Q(s1, left), Q(s1, right)],
  [Q(s2, left), Q(s2, right)],
  [Q(s3, left), Q(s3, right)]
]
```

形状：
```python
(BATCH_SIZE, N_ACTIONS) = (3, 2)
```
也就是：每一行表示对一个 state 的所有动作的 Q 值预测。

**action_batch 里面是什么？**

它是（BATCH_SIZE × 1）大小的动作索引：
```python
action_batch =
[
  [0],
  [1],
  [0]
]
```
表示：第一个样本选择了动作 0（左），第二个样本选择了动作 1（右），第三个样本选择了动作 0（左）。

**gather 的作用：按动作索引从 Q(s,·) 中选 Q(s,a)**

PyTorch 的 `gather(dim, index)` 含义：按照 index 指定的位置，从 dim 维度上取对应的元素。

对于我们的例子：
```python
Q_all =
[
  [q11, q12],
  [q21, q22],
  [q31, q32]
]

action_batch =
[
  [0],
  [1],
  [0]
]
```

执行：

```python
state_action_values = Q_all.gather(1, action_batch)
```

等同于：
* 从第 1 行取 index=0 → q11
* 从第 2 行取 index=1 → q22
* 从第 3 行取 index=0 → q31

最终得到：
```python
state_action_values =
[
  [q11],
  [q22],
  [q31]
]
```

形状：
```python
(BATCH_SIZE, 1)
```

#### 2.4.2 TD Error 的前一半，TD Target

**DQN 更新公式的另外一半**，涉及到“**Bootstrap 目标值**”的计算，即：
$$
r + \gamma \max_{a'} Q_{\text{target}}(s', a')
$$

创建一个存放“下一状态价值”的向量
```python
next_state_values = torch.zeros(BATCH_SIZE, device=device)
```
构造一个形状为 `(batch_size,)` 的向量，每个位置代表样本 i 的 $V(s'_i) = \max_{a'} Q_target(s'_i, a')$，先用 0 填充，因为某些样本是“终止状态（next_state = None）”，它们的 V 应该是 0，提前用 0 初始化能直接覆盖终止状态的未来价值。

计算非终止状态的 `max Q`
```python
with torch.no_grad():
    next_state_values[non_final_mask] = 
         target_net(non_final_next_states).max(1).values
```

`non_final_mask` 是之前算过的一个布尔掩码，例如：
```python
non_final_mask = [True, True, False, True, False]
```

`non_final_next_states` 同样也是之前算过的所有非终止状态拼成的大张量，比如：
```python
batch.next_state = [s1', s2', None, s4', None]
```

过滤掉 None 后：
```python
non_final_next_states = [s1', s2', s4']
```

并通过 `torch.cat()` 成为：
```python
shape = (num_non_final_states, n_features)
```

用 `target_net(non_final_next_states)` 得到未来 Q 值，如果动作数是 2（CartPole），输出可能是：
```python
[
  [Q(s1',left), Q(s1',right)],
  [Q(s2',left), Q(s2',right)],
  [Q(s4',left), Q(s4',right)]
]
```

`.max(1).values` 取每一行的最大动作价值，即未来状态的价值函数：
$$
V(s') = \max_{a'} Q_{\text{target}}(s',a')
$$

举例：
```python
[
 [1.2, 0.5],   → max=1.2
 [0.8, 2.1],   → max=2.1
 [1.0, 0.3]    → max=1.0
]

→ tensor([1.2, 2.1, 1.0]) # 结果张量
```

用掩码把它们填回原来的位置
```python
next_state_values[non_final_mask] = [1.2, 2.1, 1.0]
```

假设 mask = `[T, T, F, T, F]`，填回去变成：
```python
next_state_values =
[1.2, 2.1, 0.0, 1.0, 0.0]
```
终止状态自动就是 0。

计算 TD Target
```python
expected_state_action_values = (next_state_values * GAMMA) + reward_batch
```

举例：
```python
reward_batch        = [ +1.0, +1.0, -1.0, +1.0, +1.0 ]
next_state_values   = [1.2, 2.1, 0.0, 1.0, 0.0]
GAMMA = 0.99

expected_Q = reward + gamma * next_state_value
```

计算后：
```python
expected_state_action_values =
[
  1 + 0.99*1.2,
  1 + 0.99*2.1,
 -1 + 0.99*0,
  1 + 0.99*1.0,
  1 + 0.99*0
]
```
形状变成 `(batch_size,)`，**随后在 loss 时会 `.unsqueeze(1)` 成 `(batch_size,1)`。**

如：
```python
loss = criterion(state_action_values, expected_state_action_values.unsqueeze(1))
```

### 2.5 核心总结：注意 `torch.tensor` 的维度，特别是神经网络的输入必须是 (batch_size, feature_dim)