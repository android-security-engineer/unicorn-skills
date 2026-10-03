# API 参考总览

本页是 Unicorn Engine C API 的**函数索引**。所有签名以 `include/unicorn/unicorn.h` 为准。读完你能建立起「引擎生命周期 → 内存/寄存器准备 → 挂 Hook → 启动仿真 → 收集结果」的完整心智模型，并能按分类快速跳到每个函数的详解页。

## 🎯 一分钟上手

Unicorn 的所有 API 都遵循同一套约定：

- 绝大多数函数返回 `uc_err`（错误码枚举），`UC_ERR_OK` 表示成功；
- 第一个参数几乎总是 `uc_engine *uc`（`uc_open` 返回的句柄）；
- 出参通过指针带出（如 `uc_open(..., &uc)`、`uc_reg_read(..., &value)`）。

```mermaid
graph LR
    O["uc_open()"] --> M["uc_mem_map()"]
    M --> W["uc_mem_write()"]
    W --> RW["uc_reg_write()"]
    RW --> H["uc_hook_add()"]
    H --> S["uc_emu_start()"]
    S --> R["uc_reg_read()"]
    R --> C["uc_close()"]
    style O fill:#3c8cff,color:#fff,stroke:none
    style S fill:#3c8cff,color:#fff,stroke:none
    style C fill:#ffb84d,color:#fff,stroke:none
```

## 🚀 生命周期

管理引擎实例、查询/控制引擎状态、错误处理与内存释放。

| 函数 | 一句话说明 |
|------|-----------|
| [uc_open](/api/open) | 按架构与模式创建引擎实例 |
| [uc_close](/api/close) | 关闭引擎、释放全部资源 |
| [uc_query](/api/query) | 查询页大小 / 架构 / 模式 / 超时状态 |
| [uc_ctl](/api/ctl) | 动态控制引擎的总入口（可变参数） |
| [uc_version](/api/version) | 返回库的版本号 |
| [uc_arch_supported](/api/arch-supported) | 判断编译时是否包含某架构 |
| [uc_errno](/api/errno) | 取最近一次错误码 |
| [uc_strerror](/api/strerror) | 把错误码翻译成可读字符串 |
| [uc_free](/api/free) | 释放 `uc_mem_regions` 等分配的缓冲 |

## ⚡ 执行控制

驱动仿真的启动与停止。

| 函数 | 一句话说明 |
|------|-----------|
| [uc_emu_start](/api/emu-start) | 从指定地址启动仿真，可设退出地址/超时/指令上限 |
| [uc_emu_stop](/api/emu-stop) | 通常在 Hook 回调内调用，主动停止仿真 |

## 🧩 寄存器读写

统一接口读写各架构寄存器，详见 [寄存器读写](/features/registers)。

| 函数 | 一句话说明 |
|------|-----------|
| [uc_reg_read](/api/reg-read) | 读取单个寄存器的值 |
| [uc_reg_write](/api/reg-write) | 写入单个寄存器的值 |
| [uc_reg_read_batch](/api/reg-read-batch) | 一次读取多个寄存器 |
| [uc_reg_write_batch](/api/reg-write-batch) | 一次写入多个寄存器 |

## 📥 内存操作

映射、读写、保护、枚举仿真内存，详见 [内存映射与管理](/features/memory)。

| 函数 | 一句话说明 |
|------|-----------|
| [uc_mem_read](/api/mem-read) | 从宿主侧读仿真内存 |
| [uc_mem_write](/api/mem-write) | 从宿主侧写仿真内存 |
| [uc_mem_map](/api/mem-map) | 映射一段可用于仿真的内存 |
| [uc_mem_map_ptr](/api/mem-map-ptr) | 用宿主内存作后备的零拷贝映射 |
| [uc_mem_unmap](/api/mem-unmap) | 解除一段内存映射 |
| [uc_mem_protect](/api/mem-protect) | 修改已映射区域的保护位 |
| [uc_mem_regions](/api/mem-regions) | 枚举全部已映射区域 |
| [uc_mmio_map](/api/mmio-map) | 映射 MMIO（内存映射 IO）区域 |

## 🧠 虚拟内存（MMU）

经 MMU 地址翻译后访问内存，详见 [MMU 与虚拟内存](/features/mmu)。

| 函数 | 一句话说明 |
|------|-----------|
| [uc_vmem_read](/api/vmem-read) | 按虚拟地址（经 TLB 翻译）读内存 |
| [uc_vmem_write](/api/vmem-write) | 按虚拟地址（经 TLB 翻译）写内存 |
| [uc_vmem_translate](/api/vmem-translate) | 把虚拟地址翻译成物理地址 |

## 🪝 Hook 管理

注册/注销插桩回调，详见 [Hook 插桩体系](/features/hooks)。

| 函数 | 一句话说明 |
|------|-----------|
| [uc_hook_add](/api/hook-add) | 注册一个 Hook 回调 |
| [uc_hook_del](/api/hook-del) | 移除一个已注册的 Hook |

## 🧠 上下文快照

保存/恢复完整 CPU 状态，详见 [上下文控制](/features/context)。

| 函数 | 一句话说明 |
|------|-----------|
| [uc_context_alloc](/api/context-alloc) | 分配一个上下文容器 |
| [uc_context_free](/api/context-free) | 释放上下文容器 |
| [uc_context_save](/api/context-save) | 把当前引擎状态存入上下文 |
| [uc_context_restore](/api/context-restore) | 从上下文恢复引擎状态 |
| [uc_context_size](/api/context-size) | 返回存储上下文所需的字节数 |
| [uc_context_reg_read](/api/context-reg-read) | 读上下文中的寄存器 |
| [uc_context_reg_write](/api/context-reg-write) | 写上下文中的寄存器 |
| [uc_context_reg_read_batch](/api/context-reg-read-batch) | 批量读上下文寄存器 |
| [uc_context_reg_write_batch](/api/context-reg-write-batch) | 批量写上下文寄存器 |

::: tip 阅读顺序建议
初次使用建议先读 [uc_open](/api/open) → [uc_mem_map](/api/mem-map) → [uc_emu_start](/api/emu-start) 三页，就能跑通第一个仿真。进阶再看 [Hook](/features/hooks) 与 [上下文](/features/context)。
:::

## 相关页面

- [快速开始](/guide/quickstart)
- [核心概念](/guide/concepts)
- [错误码参考](/errors/)
- [uc_ctl 控制接口](/ctl/)
