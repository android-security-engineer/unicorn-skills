# uc_mem_regions — 枚举所有已映射区域

一次性取回引擎当前所有内存映射的列表。读完本页你能掌握它的输出结构、必须用 `uc_free` 释放返回数组的规则，以及遍历示例。

## 📋 原型

```c
uc_err uc_mem_regions(uc_engine *uc, uc_mem_region **regions, uint32_t *count);
```

> 📄 声明：[`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L1248) · 实现：[`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L2168)

Unicorn **分配**一个 `uc_mem_region` 数组写回 `*regions`，并把区域数量写回 `*count`。这块数组的所有权归你——用完**必须** [uc_free](/api/free) 释放，否则内存泄漏。

## 🧩 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `uc` | `uc_engine *` | 引擎句柄 |
| `regions` | `uc_mem_region **` | 出参：接收 Unicorn 分配的数组指针 |
| `count` | `uint32_t *` | 出参：接收区域数量 |

### uc_mem_region 结构

```c
typedef struct uc_mem_region {
    uint64_t begin; // 起始地址（含）
    uint64_t end;   // 结束地址（含，即最后一个有效字节）
    uint32_t perms; // 权限，UC_PROT_* 组合
} uc_mem_region;
```

::: tip end 是闭区间
`end` 是**最后一个有效字节**的地址，不是"末尾+1"。一页 `begin=0x1000` 的区域，`end` 为 `0x1FFF`，大小 = `end - begin + 1`。
:::

## 📤 返回值

| 返回值 | 含义 |
|--------|------|
| `UC_ERR_OK` | 成功，`*regions` 与 `*count` 已填好 |
| `UC_ERR_NOMEM` | 分配数组失败 |

## 🔧 所有权与释放

```mermaid
sequenceDiagram
    participant You as 你的代码
    participant UC as Unicorn
    You->>UC: uc_mem_regions(&regs, &cnt)
    UC->>UC: 分配 cnt 个 uc_mem_region
    UC-->>You: 返回数组指针 + 数量
    You->>You: 遍历 regs[0..cnt-1]
    You->>UC: uc_free(regs)  // 必须!
    style UC fill:#3c8cff,color:#fff,stroke:none
```

## 💻 完整遍历示例

```c
#include <unicorn/unicorn.h>
#include <stdio.h>

int main(void) {
    uc_engine *uc;
    uc_open(UC_ARCH_X86, UC_MODE_64, &uc);

    uc_mem_map(uc, 0x1000, 0x1000, UC_PROT_READ | UC_PROT_EXEC);
    uc_mem_map(uc, 0x10000, 0x2000, UC_PROT_READ | UC_PROT_WRITE);

    uc_mem_region *regions = NULL;
    uint32_t count = 0;
    uc_err err = uc_mem_regions(uc, &regions, &count);
    if (err != UC_ERR_OK) {
        printf("regions failed: %s\n", uc_strerror(err));
        return 1;
    }

    for (uint32_t i = 0; i < count; i++) {
        printf("region %u: 0x%" PRIx64 "-0x%" PRIx64 " size=0x%" PRIx64
               " perms=%u\n",
               i, regions[i].begin, regions[i].end,
               regions[i].end - regions[i].begin + 1, regions[i].perms);
    }

    uc_free(regions); // 关键：释放 Unicorn 分配的数组
    uc_close(uc);
    return 0;
}
```

::: warning 常见坑
- **必须 `uc_free(regions)`**，且用 [uc_free](/api/free) 而非 `free`——它是 Unicorn 内部分配的。
- `end` 是**闭区间**末字节，算大小要 `+1`，别直接 `end - begin`。
- [uc_mem_unmap](/api/mem-unmap) 会把一个区域切成多段，因此返回的区域数可能多于你调用 `uc_mem_map` 的次数。
- 空引擎（无任何映射）时 `count` 为 0，`*regions` 可能为 `NULL`，遍历前先判空。
:::

## 📂 相关源码

| 文件 | 角色 |
|------|------|
| [`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L1248) | `uc_mem_regions` 声明 |
| [`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L2168) | `uc_mem_regions` 实现 |

## 相关页面

- [uc_mem_map](/api/mem-map) — 建立映射
- [uc_free](/api/free) — 释放返回的数组
- [枚举映射区域](/memory/regions) — 概念详解
- [内存映射与管理](/features/memory) — 内存模型全貌
