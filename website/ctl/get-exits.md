# uc_ctl_get_exits

把**当前的退出点集合**读入用户缓冲区。读完你会知道如何配合 `get_exits_cnt` 取回全部退出点地址。

## 🧩 便捷宏定义与展开

来自 `include/unicorn/unicorn.h`：

```c
#define uc_ctl_get_exits(uc, buffer, len) \
    uc_ctl(uc, UC_CTL_READ(UC_CTL_UC_EXITS, 2), (buffer), (len))
```

> 📄 声明：[`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L670)（便捷宏）· [`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L576)（`UC_CTL_UC_EXITS` 控制码）· 实现：[`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L2734)（`case UC_CTL_UC_EXITS`）

展开为读方向、**2 个参数**、控制类型 `UC_CTL_UC_EXITS`。

## 📥 参数与方向

| 项目 | 值 |
| --- | --- |
| 控制类型 | `UC_CTL_UC_EXITS` |
| 方向 | `UC_CTL_IO_READ`（只读） |
| 参数个数 | 2 |
| `buffer` 类型 | `uint64_t *`（输出，写入退出点地址数组） |
| `len` 类型 | `size_t`（输入，缓冲区容量，应 = `get_exits_cnt`） |
| 返回 | `uc_err`，成功为 `UC_ERR_OK` |

`uc.c` 实现：`UC_INIT` 后若 `use_exits` 未启用返回 `UC_ERR_ARG`；读分支要求 `len >= g_tree_nnodes(ctl_exits)`，否则 `UC_ERR_ARG`；随后遍历红黑树把退出点写入 `buffer`。

```mermaid
flowchart LR
    A["get_exits_cnt -> cnt"] --> B["分配 uint64_t[cnt]"]
    B --> C["uc_ctl_get_exits(uc, buf, cnt)"]
    C --> D["遍历 ctl_exits 写入 buf"]
    style C fill:#3c8cff,color:#fff,stroke:none
```

## 🔧 何时用 / 示例

审计当前设置了哪些退出点：

```c
size_t cnt;
uc_ctl_get_exits_cnt(uc, &cnt);

uint64_t *buf = malloc(cnt * sizeof(uint64_t));
uc_err err = uc_ctl_get_exits(uc, buf, cnt);
if (err) {
    printf("读取退出点失败: %u\n", err);
    return;
}
for (size_t i = 0; i < cnt; i++)
    printf(">>> exit[%zu] = 0x%" PRIx64 "\n", i, buf[i]);
```

::: warning ⚠️ 时机限制
- 必须先 [uc_ctl_exits_enable](/ctl/exits-enable)，否则 `UC_ERR_ARG`。
- `len` 必须**不小于**实际退出点数量（用 [uc_ctl_get_exits_cnt](/ctl/get-exits-cnt) 获取），否则 `UC_ERR_ARG`。
:::

## 📂 相关源码

| 文件 | 角色 |
|------|------|
| [`include/unicorn/unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L670) | `uc_ctl_get_exits` 便捷宏定义 |
| [`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L2734) | `case UC_CTL_UC_EXITS` 实现，遍历 `ctl_exits` 写入缓冲区 |

## 相关页面

- [uc_ctl 总览](/ctl/)
- [uc_ctl_get_exits_cnt](/ctl/get-exits-cnt)
- [uc_ctl_set_exits](/ctl/set-exits)
- [多退出点机制](/features/exits)
