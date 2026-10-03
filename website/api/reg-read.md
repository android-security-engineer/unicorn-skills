# uc_reg_read — 读寄存器

本页讲 `uc_reg_read`：读取单个寄存器的当前值。读完你能正确地按寄存器宽度准备缓冲、避免类型不匹配，并知道读 PC 时的注意点。

## 📌 概述

`uc_reg_read` 把 `regid` 指定的寄存器值拷贝到你提供的缓冲区。`regid` 的取值在各架构头文件中定义（如 `UC_X86_REG_RAX`、`UC_ARM_REG_R0`）。

## 函数原型

```c
uc_err uc_reg_read(uc_engine *uc, int regid, void *value);
```

> 📄 声明：[`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L824) · 实现：[`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L687)

## 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `uc` | `uc_engine *` | 引擎句柄 |
| `regid` | `int` | 寄存器 ID，取 `UC_<ARCH>_REG_*` |
| `value` | `void *` | 出参：指向存放结果的缓冲，宽度须匹配寄存器 |

## 返回值

| 值 | 含义 |
|----|------|
| `UC_ERR_OK` | 成功 |
| `UC_ERR_ARG` | 寄存器号或 value 指针无效 |

## 宽度匹配

`value` 缓冲的宽度必须与寄存器一致，否则会读到错误的字节或越界：

| 寄存器示例 | 宽度 | 建议类型 |
|-----------|------|---------|
| x86 `AL` | 8 位 | `uint8_t` |
| x86 `EAX` | 32 位 | `uint32_t` / `int` |
| x86 `RAX` | 64 位 | `uint64_t` |
| ARM `R0` | 32 位 | `uint32_t` |
| ARM64 `X0` | 64 位 | `uint64_t` |

需要显式指定宽度时用 `uc_reg_read2`（多一个 `size` 参数）。详见 [寄存器读写](/features/registers)。

```mermaid
graph LR
    R["uc_reg_read(uc, regid, &value)"] --> Reg[寄存器堆]
    Reg --> V[value 缓冲拿到结果]
    style R fill:#3c8cff,color:#fff,stroke:none
```

## 💻 用法示例

```c
uint64_t rax = 0;
uc_err err = uc_reg_read(uc, UC_X86_REG_RAX, &rax);
if (err == UC_ERR_OK)
    printf("RAX = 0x%" PRIx64 "\n", rax);

// 读程序计数器
uint64_t pc = 0;
uc_reg_read(uc, UC_X86_REG_RIP, &pc);
```

::: warning 常见错误
- ❌ **缓冲宽度不符**：给 64 位寄存器传 `int*`，高 32 位会被忽略或读到栈上垃圾。用与寄存器等宽的类型。
- ❌ **PC 可能"滞后"**：仿真异常停止且未装 CODE/MEM Hook 时，读到的 PC 可能停在基本块首而非真正出错指令。详见 [寄存器读写 · PC 特殊性](/features/registers)。
- ❌ **架构与 regid 不匹配**：对 ARM 引擎用 `UC_X86_REG_*` 会得到 `UC_ERR_ARG`。
:::

## 📂 相关源码

| 文件 | 角色 |
|------|------|
| [`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L824) | `uc_reg_read` 声明 |
| [`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L687) | `uc_reg_read` 实现 |

## 相关页面

- [uc_reg_read2 — 带宽度读寄存器](/api/reg-read2)
- [uc_reg_write — 写寄存器](/api/reg-write)
- [uc_reg_read_batch — 批量读](/api/reg-read-batch)
- [寄存器读写](/features/registers)
- [ARM64 寄存器参考](/arch/arm64/registers)
