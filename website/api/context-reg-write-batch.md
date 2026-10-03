# uc_context_reg_write_batch — 批量写上下文寄存器

本页讲 `uc_context_reg_write_batch`：一次向上下文快照写入多个寄存器。读完你能高效地在快照上布置整组寄存器，配合 restore 实现「改一批输入后重跑」。

## 📌 概述

它是 [uc_reg_write_batch](/api/reg-write-batch) 的「上下文版」：修改的是 [uc_context](/api/context-alloc) 快照而非引擎当前状态。之后 [uc_context_restore](/api/context-restore) 会把这组修改一并灌回引擎。

## 函数原型

```c
uc_err uc_context_reg_write_batch(uc_context *ctx, int const *regs,
                                  void *const *vals, int count);
```

> 📄 声明：[`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L1361) · 实现：[`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L2472)

## 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `ctx` | `uc_context *` | 已 save 的上下文 |
| `regs` | `int const *` | 待写入的寄存器 ID 数组 |
| `vals` | `void *const *` | 指针数组：每个元素指向要写入该寄存器的值 |
| `count` | `int` | `regs` 与 `vals` 的长度 |

## 返回值

返回 `uc_err`：`UC_ERR_OK` 成功；`UC_ERR_ARG` 表示某寄存器号或值无效。

## 工作流

```mermaid
graph LR
    S[基线快照] --> W["uc_context_reg_write_batch 改一组寄存器"]
    W --> R[uc_context_restore 灌回]
    R --> E[uc_emu_start 重跑]
    style W fill:#3c8cff,color:#fff,stroke:none
```

## 💻 用法示例

在快照上一次布置多个参数寄存器：

```c
int regs[] = { UC_X86_REG_RDI, UC_X86_REG_RSI, UC_X86_REG_RDX };
uint64_t a = 1, b = 2, c = 3;
void *vals[] = { &a, &b, &c };

uc_err err = uc_context_reg_write_batch(ctx, regs, vals, 3);
if (err != UC_ERR_OK)
    printf("批量写上下文失败: %s\n", uc_strerror(err));

uc_context_restore(uc, ctx);   // 三个寄存器一并生效
uc_emu_start(uc, START, END, 0, 0);
```

::: warning 常见错误
- ❌ **vals 指向的值宽度不符**：每个值缓冲宽度须匹配目标寄存器；混合宽度可考虑 `uc_context_reg_write_batch2` 传 `sizes`。
- ❌ **count 与数组不符**：越界。
- ❌ **上下文未 save**：其余未写的寄存器在 restore 后是未定义的。
:::

## 📂 相关源码

| 文件 | 角色 |
|------|------|
| [`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L1361) | `uc_context_reg_write_batch` 声明 |
| [`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L2472) | `uc_context_reg_write_batch` 实现 |

## 相关页面

- [uc_context_reg_read_batch — 批量读](/api/context-reg-read-batch)
- [uc_context_reg_write — 写上下文寄存器](/api/context-reg-write)
- [uc_reg_write_batch — 批量写](/api/reg-write-batch)
- [批量 API](/features/batch-api)
