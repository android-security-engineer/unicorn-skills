# 架构总览

本页讲 Unicorn **内部**是怎么搭起来的。理解了这张架构图，后面每个功能点的实现原理都会顺理成章。

## 分层架构

Unicorn 的代码在垂直方向上分为清晰的几层：

```mermaid
graph TB
    subgraph 用户层
      B[语言绑定<br/>Python/Rust/Go/Java/Zig...]
    end
    subgraph 公共API层
      A[uc.c<br/>uc_open/uc_emu_start/uc_hook_add...]
    end
    subgraph 架构前端层
      F1[x86] 
      F2[ARM/ARM64]
      F3[MIPS]
      F4[其它架构...]
    end
    subgraph TCG核心层
      T[TCG<br/>Tiny Code Generator<br/>指令翻译+JIT]
    end
    subgraph 宿主后端层
      H1[x86后端]
      H2[ARM64后端]
      H3[MIPS/PPC/RISCV后端]
    end
    B --> A
    A --> F1 & F2 & F3 & F4
    F1 & F2 & F3 & F4 --> T
    T --> H1 & H2 & H3
    style A fill:#3c8cff,color:#fff,stroke:none
    style T fill:#ffb84d,color:#fff,stroke:none
```

## 各层职责

### 1. 公共 API 层（[`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c)）

这是用户直接调用的入口，与架构无关。它负责：

- **引擎生命周期**：`uc_open` / `uc_close`
- **仿真控制**：`uc_emu_start` / `uc_emu_stop`
- **内存操作**：`uc_mem_map` / `uc_mem_read` / `uc_mem_write`
- **寄存器操作**：`uc_reg_read` / `uc_reg_write`
- **Hook 管理**：`uc_hook_add` / `uc_hook_del`

`uc_open` 内部会根据你传入的 `arch`，把 `uc->init_arch` 函数指针指向对应架构的初始化函数（如 `uc_init_x86_64`），后续所有架构相关操作都通过这个分发完成。

```mermaid
sequenceDiagram
    participant U as 用户
    participant API as uc.c
    participant ARCH as 架构前端
    participant TCG as TCG
    U->>API: uc_open(UC_ARCH_X86, UC_MODE_64)
    API->>ARCH: 设置 init_arch = uc_init_x86_64
    API-->>U: 返回 uc_engine*
    U->>API: uc_emu_start(...)
    API->>TCG: 触发翻译执行
    TCG->>ARCH: 取指/解码
    ARCH-->>TCG: TCG中间表示
    TCG-->>API: 执行宿主原生码
```

### 2. 架构前端层（`qemu/target/*`）

每种 CPU 架构有一个"前端"，负责把**目标架构的指令**翻译成 TCG 的中间表示（TCG ops）。这部分代码直接复用自 QEMU，Unicorn 几乎没改——这也是它能快速支持这么多架构的原因。

### 3. TCG 核心层

TCG（Tiny Code Generator）是 QEMU 的 JIT 引擎，也是 Unicorn 性能的来源。它做两件事：

1. **翻译**：目标指令 → TCG ops（架构无关的中间表示）
2. **生成**：TCG ops → 宿主机原生机器码

```mermaid
graph LR
    A["ARM指令<br/>ADD R0,R1,#1"] -->|前端翻译| B[TCG ops<br/>中间表示]
    B -->|后端生成| C["x86-64原生码<br/>mov/add/ret..."]
    C -->|直接执行| D[CPU 真跑]
    style B fill:#ffb84d,color:#fff,stroke:none
```

详见 [JIT 编译（TCG）](../features/jit.md)。

### 4. 宿主后端层（`qemu/tcg/<arch>`）

把 TCG ops 翻译成**你当前机器**能跑的机器码。Unicorn 编译时会根据宿主架构选择对应后端（x86 / ARM64 / MIPS / PPC / RISCV / s390x / LoongArch）。

::: tip 目标架构 vs 宿主架构
- **目标架构**（target）：你要仿真的 CPU，由 `uc_open` 的参数决定，运行时可切换。
- **宿主架构**（host）：你编译 Unicorn 时所在的机器，编译期固定。
两者可以不同——这正是"跨架构仿真"的本质。
:::

## Unicorn 相对 QEMU 的改造

Unicorn 不是 QEMU 的简单封装，而是做了实质性的裁剪与改造：

```mermaid
graph LR
    subgraph 保留
      K1[CPU 仿真内核]
      K2[TCG JIT]
      K3[多架构前端]
    end
    subgraph 裁剪
      C1[设备模型 hw/]
      C2[块翻译缓存持久化]
      C3[系统调用翻译 linux-user]
      C4[整机配置/BIOS]
    end
    subgraph 新增
      N1[细粒度 Hook API]
      N2[可链接为库]
      N3[uc_emu_start/stop 控制]
      N4[实例级隔离/线程安全]
    end
    style N2 fill:#3c8cff,color:#fff,stroke:none
```

## 数据流：一次仿真的完整旅程

把所有层串起来，看一条指令从"字节"到"执行"的全过程：

```mermaid
sequenceDiagram
    participant Mem as 模拟内存
    participant Front as 架构前端
    participant TCG as TCG
    participant Cache as 翻译缓存
    participant Host as 宿主CPU
    participant Hook as Hook回调
    Mem->>Front: 1. 从PC取指
    Front->>TCG: 2. 解码为TCG ops
    TCG->>Cache: 3. 已缓存?
    alt 未缓存
        TCG->>Host: 4a. 编译为宿主码
        Host->>Cache: 存入缓存
    else 已缓存
        Cache->>Host: 4b. 直接复用
    end
    Host->>Hook: 5. 执行前触发 UC_HOOK_CODE
    Host->>Mem: 6. 执行(可能访存)
    Mem->>Hook: 7. 触发 UC_HOOK_MEM_*
    Host->>Host: 8. PC前进，进入下一条
```

这张图是理解 Unicorn 性能特征的关键：**翻译只发生一次，后续执行命中缓存即直接跑原生码**，这就是 JIT 快的原因。

## 目录结构速查

```mermaid
graph LR
    Root[仓库根] --> UC[uc.c / include/unicorn/<br/>公共API与头文件]
    Root --> Q[qemu/<br/>QEMU内核与TCG]
    Q --> T1[target/<br/>各架构前端]
    Q --> T2[tcg/<br/>TCG核心与宿主后端]
    Root --> B[bindings/<br/>多语言绑定]
    Root --> S[samples/<br/>C示例]
    Root --> T3[tests/<br/>回归/单元/基准/模糊]
    Root --> W[website/<br/>本教学文档站]
    style W fill:#3c8cff,color:#fff,stroke:none
```
## 📂 相关源码

| 文件/目录 | 角色 |
|------|------|
| [`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c) | 公共 API 层：`uc_open`/`uc_emu_start`/`uc_hook_add` 实现 |
| [`include/unicorn/unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h) | 公共 API 与常量声明 |
| [`include/uc_priv.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/uc_priv.h) | `struct uc_struct` 与函数指针后端接口 |
| [`qemu/target/`](https://github.com/android-security-engineer/unicorn-skills/blob/master/qemu/target/) | 各架构前端（指令翻译为 TCG ops） |
| [`qemu/tcg/`](https://github.com/android-security-engineer/unicorn-skills/blob/master/qemu/tcg/) | TCG 核心与宿主后端（JIT） |
| [`bindings/`](https://github.com/android-security-engineer/unicorn-skills/blob/master/bindings/) | 多语言薄封装 |

---

理解了架构，接下来按 [功能详解](../features/architectures.md) 逐层深入每个能力点的实现原理。
