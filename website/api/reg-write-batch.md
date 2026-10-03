# uc_reg_write_batch — 批量写寄存器

本页讲 `uc_reg_write_batch`：一次调用写入多个寄存器，是批量恢复 CPU 状态的高效手段。读完你能配合 [uc_reg_read_batch](/api/reg-read-batch) 实现「快照—恢复」。

## 📌 概述

与 [uc_reg_read_batch](/api/reg-read-batch) 对称，本函数一趟写入多个寄存器。注意值指针数组的类型是 `void *const *`（指向一组 `const` 值指针）。

## 函数原型

```c
uc_err uc_reg_write_batch(uc_engine *uc, int const *regs, void *const *vals,
                          int count);
```

> 📄 声明：[`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L866) · 实现：[`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L602)

## 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `uc` | `uc_engine *` | 引擎句柄 |
| `regs` | `int const *` | 待写入的寄存器 ID 数组 |
| `vals` | `void *const *` | 指针数组：每个元素指向要写入该寄存器的值 |
| `count` | `int` | `regs` 与 `vals` 的长度 |

## 返回值

| 值 | 含义 |
|----|------|
| `UC_ERR_OK` | 成功 |
| `UC_ERR_ARG` | 某个寄存器号或值无效 |

## 快照—恢复配对

```mermaid
graph LR
    A[仿真到某点] -->|reg_read_batch| S[快照: 一组寄存器值]
    S -->|继续仿真, 状态改变| X[需要回退]
    X -->|reg_write_batch| R[恢复到快照点]
    style S fill:#3c8cff,color:#fff,stroke:none
    style R fill:#3c8cff,color:#fff,stroke:none
```

## 💻 用法示例

初始化多个寄存器：

```c
int regs[] = { UC_X86_REG_RAX, UC_X86_REG_RBX, UC_X86_REG_RSP };
uint64_t rax = 1, rbx = 2, rsp = 0x200000;
void *vals[] = { &rax, &rbx, &rsp };

uc_err err = uc_reg_write_batch(uc, regs, vals, 3);
if (err != UC_ERR_OK)
    printf("批量写失败: %s\n", uc_strerror(err));
```

快照后恢复：

```c
// 先用 read_batch 存快照, 稍后用同一组 regs 与保存的值恢复
uc_reg_write_batch(uc, regs, saved_vals, 3);
```

::: tip 更完整的快照
只保存寄存器用批量 API 足够轻量；若还需引擎内部状态（用于执行分叉），改用 [上下文](/features/context) 的 `uc_context_save/restore`。
:::

::: warning 常见错误
- ❌ **vals 指向的值宽度不符**：每个值缓冲宽度须匹配目标寄存器。混合宽度时考虑 `uc_reg_write_batch2` 传 `sizes`。
- ❌ **count 与数组不符**：越界。确保三者长度一致。
- ❌ **误以为原子**：批量写不保证事务性；若中途某寄存器无效返回 `UC_ERR_ARG`，前面的写入可能已生效。
:::

## 📂 相关源码

| 文件 | 角色 |
|------|------|
| [`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L866) | `uc_reg_write_batch` 声明 |
| [`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L602) | `uc_reg_write_batch` 实现 |

## 相关页面

- [uc_reg_read_batch — 批量读](/api/reg-read-batch)
- [uc_reg_write — 写寄存器](/api/reg-write)
- [批量 API](/features/batch-api)
- [上下文控制](/features/context)
