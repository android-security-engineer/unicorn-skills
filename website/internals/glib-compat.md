# glib_compat 兼容层

> 🧩 [`glib_compat/`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/glib_compat.h) 是 Unicorn 内置的一份最小 glib 实现，让整个内置 QEMU Fork 无需依赖系统安装的 glib。本页讲它替换了哪些 glib 类型、为什么需要它。基于 glib 2.64.4 裁剪而来（见 [`glib_compat/README`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/README)）。

## 🎯 为什么要自带 glib

上游 QEMU 大量使用 glib 的数据结构（`GHashTable`、`GArray`、`GTree`、`GList` 等）。如果 Unicorn 直接依赖系统 glib，会带来跨平台/跨编译器的部署负担（Windows、Android NDK、静态链接等场景尤其麻烦）。于是 Unicorn 把用到的那部分 glib API **重新实现一份**放进 [`glib_compat/`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/glib_compat.h)，与引擎一起编译，做到零外部 glib 依赖。

> [`README`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/README) 原文：*This is a compatible glib library, customized for Unicorn. Based on glib 2.64.4.*

```mermaid
graph LR
    Q["QEMU 代码 / uc.c"] --> API["glib API 调用<br/>g_hash_table_* / g_tree_* ..."]
    API --> C["glib_compat/<br/>内置最小实现"]
    C -.替代.-> SYS["系统 glib (不使用)"]
    style C fill:#3c8cff,color:#fff,stroke:none
```

## 🗂️ 提供了哪些类型

| glib 类型 | 头文件 | 引擎里的典型用途 |
| --- | --- | --- |
| `GHashTable` | [`ghash.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/ghash.h) | `uc->flat_views`、Hook 的 `hooked_regions` |
| `GTree` | [`gtree.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/gtree.h) / [`gtree.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/gtree.c) | `uc->ctl_exits`（`until` 停止地址集合） |
| `GArray` | [`garray.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/garray.h) / [`garray.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/garray.c) | `uc->unmapped_regions` 等动态数组 |
| `GList` | [`glist.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/glist.h) / [`glist.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/glist.c) | 通用双向链表 |
| `GNode` | [`gnode.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/gnode.h) | 树形节点 |
| 内存分配 | [`gmem.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/gmem.c) / [`gslice.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/gslice.c) | `g_malloc` / `g_new` / slice 分配器 |
| 随机数 | [`grand.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/grand.c) | `g_rand_*` |
| 模式匹配 | [`gpattern.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/gpattern.c) | glob 风格匹配 |
| 测试/消息 | [`gtestutils.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/gtestutils.c) / [`gmessages.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/gmessages.h) | 断言与日志桩 |

## 🔬 真实用例

`uc_struct` 内部就直接用了这些兼容实现。例如停止地址集合是一棵 `GTree`：

```c
// include/uc_priv.h
static inline void uc_add_exit(uc_engine *uc, uint64_t addr) {
    uint64_t *new_exit = g_malloc(sizeof(uint64_t));
    *new_exit = addr;
    g_tree_insert(uc->ctl_exits, (gpointer)new_exit, (gpointer)1);
}
```

[`uc_add_exit`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/uc_priv.h#L450) 在 [uc_priv.h:450](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/uc_priv.h#L450)。而 Hook 的「已插桩区域」用 `GHashTable` 去重：

```c
// include/uc_priv.h: hooked_regions_add()
if (!g_hash_table_lookup(h->hooked_regions, (void *)&tmp)) {
    HookedRegion *r = malloc(sizeof(HookedRegion));
    r->start = start; r->length = length;
    g_hash_table_insert(h->hooked_regions, (void *)r, (void *)1);
}
```

[`hooked_regions_add`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/uc_priv.h#L489) 在 [uc_priv.h:489](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/uc_priv.h#L489)。这些 `g_tree_*` / `g_hash_table_*` 符号全部来自 [`glib_compat/`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/glib_compat.h)，而非系统库。

::: tip 与 list.c 的区别
[`glib_compat/`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/glib_compat.h) 是通用 glib 替代；而 Unicorn 另有一份**极简自研链表** [`list.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/list.c)，专用于 Hook 链表等场景，不走 glib。见 [list.c 链表工具](/internals/list)。
:::

## 📂 相关源码

| 文件 | 角色 |
|------|------|
| [`glib_compat/glib_compat.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/glib_compat.h) | 兼容层总头文件，聚合各子模块 |
| [`glib_compat/ghash.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/ghash.h) | `GHashTable` 实现（`flat_views` / `hooked_regions` 用） |
| [`glib_compat/gtree.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/gtree.c) | `GTree` 实现（`ctl_exits` 用） |
| [`glib_compat/gmem.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/glib_compat/gmem.c) | `g_malloc` / `g_new` 等内存分配包装 |
| [`include/uc_priv.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/uc_priv.h) | `uc_add_exit` / `hooked_regions_add` 等内联函数消费这些 glib API |

## 相关页面

**子模块详解**（每个 `glib_compat/*.c` 各一页）：

- [glist.c — GList 双向链表](/internals/glib-compat-glist)
- [garray.c — GArray 动态数组](/internals/glib-compat-garray)
- [ghash.h — GHashTable 哈希表](/internals/glib-compat-ghash)
- [gtree.c — GTree 平衡树](/internals/glib-compat-gtree)
- [gmem.c — 内存分配包装](/internals/glib-compat-gmem)
- [grand.c — 伪随机数](/internals/glib-compat-grand)
- [gpattern.c — 通配符匹配](/internals/glib-compat-gpattern)
- [gslice.c — 切片分配器](/internals/glib-compat-gslice)

**关联主题**：

- [内置 QEMU Fork](/internals/qemu-fork)
- [list.c 链表工具](/internals/list)
- [CMake 构建系统](/internals/build-system)
- [uc_struct 结构](/internals/uc-struct)
