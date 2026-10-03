# uc_ctl_get_page_size

读取引擎**当前的目标页大小**（字节）。读完你会知道如何查询页大小，为内存映射对齐做准备。

## 🧩 便捷宏定义与展开

来自 `include/unicorn/unicorn.h`：

```c
#define uc_ctl_get_page_size(uc, ptr) \
    uc_ctl(uc, UC_CTL_READ(UC_CTL_UC_PAGE_SIZE, 1), (ptr))
```

> 📄 声明：[`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L656)（便捷宏）· [`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L566)（`UC_CTL_UC_PAGE_SIZE` 控制码）· 实现：[`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L2665)（`case UC_CTL_UC_PAGE_SIZE`）

展开为读方向、1 个参数、控制类型 `UC_CTL_UC_PAGE_SIZE`。

## 📥 参数与方向

| 项目 | 值 |
| --- | --- |
| 控制类型 | `UC_CTL_UC_PAGE_SIZE` |
| 方向 | `UC_CTL_IO_READ`（只读） |
| 参数个数 | 1 |
| `ptr` 类型 | `uint32_t *`（输出，写入页大小字节数） |
| 返回 | `uc_err`，成功为 `UC_ERR_OK` |

在 `uc.c` 中读分支直接返回 `uc->target_page_size`（先经 `UC_INIT` 确保引擎已初始化）。

```mermaid
flowchart LR
    A["uc_ctl_get_page_size(uc, &sz)"] --> B["UC_INIT 确保已初始化"]
    B --> C["读取 uc->target_page_size"]
    C --> D["写入 *ptr"]
    style A fill:#3c8cff,color:#fff,stroke:none
```

## 🔧 何时用 / 示例

在做内存映射前确认对齐单位。摘自 `samples/sample_ctl.c`：

```c
uc_engine *uc;
uint32_t pagesize;

uc_open(UC_ARCH_X86, UC_MODE_32, &uc);

uc_err err = uc_ctl_get_page_size(uc, &pagesize);
if (err) {
    printf("uc_ctl 失败: %u\n", err);
    return;
}
printf(">>> pagesize = %" PRIu32 "\n", pagesize); // 通常 4096
```

::: warning ⚠️ 时机限制
读取会触发 `UC_INIT`：调用后引擎即视为已初始化，此后再调用 [uc_ctl_set_page_size](/ctl/set-page-size) 会返回 `UC_ERR_ARG`。因此如需自定义页大小，务必**先设置、后读取**。
:::

## 📂 相关源码

| 文件 | 角色 |
|------|------|
| [`include/unicorn/unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L656) | `uc_ctl_get_page_size` 便捷宏定义 |
| [`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L2665) | `case UC_CTL_UC_PAGE_SIZE` 实现，读取 `uc->target_page_size` |

## 相关页面

- [uc_ctl 总览](/ctl/)
- [uc_ctl_set_page_size](/ctl/set-page-size)
- [uc_mem_map](/api/mem-map)
- [内存管理](/features/memory)
