# uc_ctl_flush_tlb

**清空全部 TLB 缓存项与翻译块**，强制地址翻译与代码翻译全部重建。读完你会知道修改内存映射/权限后何时需要刷新 TLB。

## 🧩 便捷宏定义与展开

来自 `include/unicorn/unicorn.h`：

```c
#define uc_ctl_flush_tlb(uc) uc_ctl(uc, UC_CTL_WRITE(UC_CTL_TLB_FLUSH, 0))
```

> 📄 声明：[`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L682)（便捷宏）· [`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L595)（`UC_CTL_TLB_FLUSH` 控制码）· 实现：[`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L2921)（`case UC_CTL_TLB_FLUSH`）

参数个数为 **0**，是纯动作。

## 🔧 参数与方向

| 项目 | 值 |
| --- | --- |
| 控制类型 | `UC_CTL_TLB_FLUSH` |
| 方向 | `UC_CTL_IO_WRITE`（写，作触发用） |
| 参数个数 | 0 |
| 返回 | `uc_err`，成功为 `UC_ERR_OK` |

`uc.c` 实现：`UC_INIT` 后调用 `uc->tcg_flush_tlb(uc)`，清空 TLB 缓存条目。

```mermaid
flowchart LR
    A["修改页表 / TLB 钩子映射"] --> B["旧 TLB 项仍指向旧物理地址"]
    B --> C["uc_ctl_flush_tlb(uc)"]
    C --> D["清空 TLB 与 TB"]
    D --> E["下次访存重新翻译地址"]
    style C fill:#3c8cff,color:#fff,stroke:none
```

## 🔧 何时用 / 示例

使用 [UC_TLB_VIRTUAL 模式](/features/tlb-modes) 并通过 TLB 钩子改变了虚拟→物理映射后，需刷新缓存让新映射生效：

```c
// 在 TLB 钩子中更新了某虚拟地址的映射后
uc_err err = uc_ctl_flush_tlb(uc);
if (err) {
    printf("flush_tlb 失败: %u\n", err);
    return;
}
```

::: tip 📌 与 flush_tb 的区别
[uc_ctl_flush_tb](/ctl/flush-tb) 只作废翻译块（针对代码变化）；`flush_tlb` 同时清空地址翻译缓存（针对映射/权限变化）。
:::

::: warning ⚠️ 时机限制
无参数、方向必须为写。全局清空 TLB 会带来一次性重建开销。
:::

## 📂 相关源码

| 文件 | 角色 |
|------|------|
| [`include/unicorn/unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L682) | `uc_ctl_flush_tlb` 便捷宏定义 |
| [`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L2921) | `case UC_CTL_TLB_FLUSH` 实现，调用 `uc->tcg_flush_tlb(uc)` |

## 相关页面

- [uc_ctl 总览](/ctl/)
- [uc_ctl_flush_tb](/ctl/flush-tb)
- [uc_ctl_tlb_mode](/ctl/tlb-mode)
- [TLB 与地址翻译](/internals/tlb)
