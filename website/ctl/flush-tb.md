# uc_ctl_flush_tb

**丢弃全部翻译块（TB）缓存**，强制后续执行重新翻译。读完你会知道在自修改代码（SMC）场景下为何以及如何刷新 TB。

## 🧩 便捷宏定义与展开

来自 `include/unicorn/unicorn.h`：

```c
#define uc_ctl_flush_tb(uc) uc_ctl(uc, UC_CTL_WRITE(UC_CTL_TB_FLUSH, 0))
```

> 📄 声明：[`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L681)（便捷宏）· [`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L592)（`UC_CTL_TB_FLUSH` 控制码）· 实现：[`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L2908)（`case UC_CTL_TB_FLUSH`）

注意参数个数为 **0**：这是一个纯动作，方向记为写、无变参。

## 🔧 参数与方向

| 项目 | 值 |
| --- | --- |
| 控制类型 | `UC_CTL_TB_FLUSH` |
| 方向 | `UC_CTL_IO_WRITE`（写，作触发用） |
| 参数个数 | 0 |
| 返回 | `uc_err`，成功为 `UC_ERR_OK` |

`uc.c` 中的实现：`UC_INIT` 后直接调用 `uc->tb_flush(uc)`，作废所有翻译块。

```mermaid
flowchart LR
    A["自修改代码写入内存"] --> B["旧 TB 已缓存旧指令"]
    B --> C["uc_ctl_flush_tb(uc)"]
    C --> D["作废全部 TB"]
    D --> E["下次执行重新翻译新指令"]
    style C fill:#3c8cff,color:#fff,stroke:none
```

## 🔧 何时用 / 示例

Unicorn 会缓存翻译后的基本块以加速。当被模拟程序**改写了自己的代码**（或你用 `uc_mem_write` 覆盖了已执行过的区域），旧的 TB 仍是旧指令，必须手动刷新：

```c
// 覆写一段先前执行过的代码
uc_mem_write(uc, 0x1000, new_code, sizeof(new_code));

// 作废所有翻译块，确保新代码生效
uc_err err = uc_ctl_flush_tb(uc);
if (err) {
    printf("flush_tb 失败: %u\n", err);
    return;
}

uc_emu_start(uc, 0x1000, 0, 0, 0);
```

::: tip 📌 更细粒度
若只想作废某一段地址，用 [uc_ctl_remove_cache](/ctl/remove-cache) 指定区间，避免整体刷新的开销。
:::

::: warning ⚠️ 时机限制
无参数、方向必须为写。刷新是全局操作，会丢弃**所有**已缓存 TB，下一次运行的首个块需重新翻译，存在一次性性能开销。
:::

## 📂 相关源码

| 文件 | 角色 |
|------|------|
| [`include/unicorn/unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L681) | `uc_ctl_flush_tb` 便捷宏定义 |
| [`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L2908) | `case UC_CTL_TB_FLUSH` 实现，调用 `uc->tb_flush(uc)` |

## 相关页面

- [uc_ctl 总览](/ctl/)
- [uc_ctl_remove_cache](/ctl/remove-cache)
- [uc_ctl_flush_tlb](/ctl/flush-tlb)
- [翻译与代码生成](/internals/translate-all)
