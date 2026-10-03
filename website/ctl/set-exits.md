# uc_ctl_set_exits

**设置一组退出点地址**，`uc_emu_start` 到达其中任一地址即停机。读完你会知道如何用退出点集合替代单一 `until` 参数。

## 🧩 便捷宏定义与展开

来自 `include/unicorn/unicorn.h`：

```c
#define uc_ctl_set_exits(uc, buffer, len) \
    uc_ctl(uc, UC_CTL_WRITE(UC_CTL_UC_EXITS, 2), (buffer), (len))
```

> 📄 声明：[`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L672)（便捷宏）· [`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L576)（`UC_CTL_UC_EXITS` 控制码）· 实现：[`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L2734)（`case UC_CTL_UC_EXITS`）

展开为写方向、**2 个参数**、控制类型 `UC_CTL_UC_EXITS`。

## 📤 参数与方向

| 项目 | 值 |
| --- | --- |
| 控制类型 | `UC_CTL_UC_EXITS` |
| 方向 | `UC_CTL_IO_WRITE`（只写） |
| 参数个数 | 2 |
| `buffer` 类型 | `uint64_t *`（输入，退出点地址数组） |
| `len` 类型 | `size_t`（输入，数组长度） |
| 返回 | `uc_err`，成功为 `UC_ERR_OK` |

`uc.c` 写分支：`UC_INIT` 后若未启用 `use_exits` 报 `UC_ERR_ARG`；否则先 `g_tree_remove_all` 清空旧退出点，再逐个 `uc_add_exit` 加入新地址。**每次设置都是整体替换。**

```mermaid
flowchart LR
    A["uc_ctl_set_exits(uc, exits, len)"] --> B["清空旧退出点"]
    B --> C["逐个加入 exits[i]"]
    C --> D["emu_start 到达任一即停"]
    style A fill:#3c8cff,color:#fff,stroke:none
```

## 🔧 何时用 / 示例

需要在多个可能的地址停机（如函数多个返回点）。摘自 `samples/sample_ctl.c`：

```c
uint64_t exits[] = {ADDRESS + 6, ADDRESS + 8};

uc_ctl_exits_enable(uc);              // 必须先启用
uc_err err = uc_ctl_set_exits(uc, exits, 2);
if (err) {
    printf("设置退出点失败: %u\n", err);
    return;
}

// until 被忽略，实际停在 ADDRESS+6 或 ADDRESS+8
uc_emu_start(uc, ADDRESS, 0, 0, 0);
```

::: tip 📌 空集合的语义
传入长度为 0 的空数组表示"没有退出点"，此时 `uc_emu_start` 不会因地址停机，只能靠钩子请求停止。
:::

::: warning ⚠️ 时机限制
必须先 [uc_ctl_exits_enable](/ctl/exits-enable)，否则返回 `UC_ERR_ARG`。设置为整体替换，不是追加。
:::

## 📂 相关源码

| 文件 | 角色 |
|------|------|
| [`include/unicorn/unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L672) | `uc_ctl_set_exits` 便捷宏定义 |
| [`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L2734) | `case UC_CTL_UC_EXITS` 实现，整体替换 `ctl_exits` 红黑树 |

## 相关页面

- [uc_ctl 总览](/ctl/)
- [uc_ctl_get_exits](/ctl/get-exits)
- [uc_ctl_exits_enable](/ctl/exits-enable)
- [多退出点机制](/features/exits)
