# uc_context_save — 保存 CPU 状态

本页讲 `uc_context_save`：把引擎当前的完整 CPU 状态快照进上下文容器。读完你能实现「设一个还原点」，为执行分叉、回滚、模糊测试打基础。

## 📌 概述

`uc_context_save` 把引擎此刻的 CPU 状态（寄存器与部分内部元数据）写入一个已由 [uc_context_alloc](/api/context-alloc) 分配的上下文。它比手动 `uc_reg_read_batch` 更完整。同一个上下文可被反复 save 以更新快照。

## 函数原型

```c
uc_err uc_context_save(uc_engine *uc, uc_context *context);
```

> 📄 声明：[`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L1293) · 实现：[`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L2277)

## 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `uc` | `uc_engine *` | 引擎句柄 |
| `context` | `uc_context *` | 由 [uc_context_alloc](/api/context-alloc) 返回的容器 |

## 返回值

返回 `uc_err`，`UC_ERR_OK` 表示成功。

## save / restore 循环

```mermaid
graph LR
    E[引擎当前状态] -->|uc_context_save| C[上下文快照]
    C -->|uc_context_restore| E2[引擎恢复到快照]
    E2 -->|再次 save 更新| C
    style C fill:#3c8cff,color:#fff,stroke:none
```

## 💻 用法示例：执行分叉

```c
uc_context *ctx;
uc_context_alloc(uc, &ctx);
uc_context_save(uc, ctx);           // 保存分叉点

// 路径 A: 输入 = a
uint64_t a = 0x10;
uc_reg_write(uc, UC_X86_REG_RDI, &a);
uc_emu_start(uc, START, END, 0, 0);

// 路径 B: 先恢复到分叉点, 再改输入
uc_context_restore(uc, ctx);
uint64_t b = 0x20;
uc_reg_write(uc, UC_X86_REG_RDI, &b);
uc_emu_start(uc, START, END, 0, 0);

uc_context_free(ctx);
```

这样避免了为每条路径重新 `uc_open` + 重新映射内存 + 重新写代码的高昂成本。

::: tip 保存内容范围
默认只保存 CPU 状态（`UC_CTL_CONTEXT_CPU`）。若还想让上下文包含内存内容，可用 [uc_ctl_context_mode](/ctl/context-mode) 打开 `UC_CTL_CONTEXT_MEMORY`——但这样上下文会绑定到该引擎，不能跨引擎使用。
:::

::: warning 常见错误
- ❌ **对未 alloc 的上下文 save**：必须先 [uc_context_alloc](/api/context-alloc)。
- ❌ **误以为保存了内存**：默认不含内存内容，仅寄存器与内部元数据。需要内存快照见 [快照与回滚](/features/snapshot)。
- ❌ **跨引擎恢复**：保存的上下文只能恢复到同架构/模式的引擎。
:::

## 📂 相关源码

| 文件 | 角色 |
|------|------|
| [`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L1293) | `uc_context_save` 声明 |
| [`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L2277) | `uc_context_save` 实现 |

## 相关页面

- [uc_context_restore — 恢复状态](/api/context-restore)
- [uc_context_alloc — 分配上下文](/api/context-alloc)
- [uc_context_size — 上下文大小](/api/context-size)
- [上下文控制](/features/context)
