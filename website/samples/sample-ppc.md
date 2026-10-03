# sample_ppc.c 走读 · PowerPC

[`sample_ppc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/samples/sample_ppc.c) 展示在 Unicorn 上仿真 PowerPC（PPC32）：执行一条 `add r26, r6, r3`，把 `r6 + r3` 写进 `r26`。结构与其他极简架构示例一致，重点在 PPC 的寄存器命名约定。

## 🎯 演示要点

- `UC_ARCH_PPC` + `UC_MODE_PPC32 | UC_MODE_BIG_ENDIAN`
- PPC 通用寄存器用 `UC_PPC_REG_3 / _6 / _26`（数字即编号）
- BLOCK 追踪覆盖全程，CODE 追踪只钉在入口一条

## 🧩 关键代码走读

一条大端编码的三寄存器加法：

```c
#define PPC_CODE "\x7F\x46\x1A\x14" // add r26, r6, r3
#define ADDRESS 0x10000

uc_open(UC_ARCH_PPC, UC_MODE_PPC32 | UC_MODE_BIG_ENDIAN, &uc);
uc_mem_map(uc, ADDRESS, 2 * 1024 * 1024, UC_PROT_ALL);
uc_mem_write(uc, ADDRESS, PPC_CODE, sizeof(PPC_CODE) - 1);

int r3 = 0x1234, r6 = 0x6789, r26 = 0x8877;
uc_reg_write(uc, UC_PPC_REG_3,  &r3);
uc_reg_write(uc, UC_PPC_REG_6,  &r6);
uc_reg_write(uc, UC_PPC_REG_26, &r26);   // 初值无关，会被结果覆盖

uc_hook_add(uc, &trace1, UC_HOOK_BLOCK, hook_block, NULL, 1, 0);
// CODE Hook 只钉在入口地址这一条指令
uc_hook_add(uc, &trace2, UC_HOOK_CODE,  hook_code,  NULL, ADDRESS, ADDRESS);

uc_emu_start(uc, ADDRESS, ADDRESS + sizeof(PPC_CODE) - 1, 0, 0);
uc_reg_read(uc, UC_PPC_REG_26, &r26);    // 0x6789 + 0x1234 = 0x79bd
```

注意 CODE Hook 用 `ADDRESS, ADDRESS`（begin==end）而不是 `1, 0`——只在入口那一条指令上触发。

```mermaid
graph LR
    A["add r26, r6, r3"] --> B["r6=0x6789, r3=0x1234"]
    B --> C["uc_emu_start"]
    C --> D["r26 = 0x79bd"]
    style D fill:#3c8cff,color:#fff,stroke:none
```

::: tip PPC 寄存器怎么命名
Unicorn 的 PPC 通用寄存器常量直接用编号：`UC_PPC_REG_3` 就是 `r3`，`UC_PPC_REG_26` 就是 `r26`。这与 ARM 的 `UC_ARM_REG_R3` 风格略有不同，别混淆。
:::

## 📤 预期输出

```text
Emulate PPC code
>>> Tracing basic block at 0x10000, block size = 0x4
>>> Tracing instruction at 0x10000, instruction size = 0x4
>>> Emulation done. Below is the CPU context
>>> r26 = 0x79bd
```

`0x6789 + 0x1234 = 0x79bd`，符合预期。

::: tip 延伸练习
1. 把 `add` 换成 `subf`（减法），手算并验证 `r26` 的结果。
2. 追加一条指令，观察 BLOCK Hook 的 `block size` 是否随之变成 0x8。
3. 尝试 `UC_MODE_PPC64`（若构建支持 64 位 PPC），比较寄存器宽度差异。
:::

## 📂 相关源码

| 文件 | 角色 |
|------|------|
| [`samples/sample_ppc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/samples/sample_ppc.c) | 本页走读的 PowerPC 示例 |
| [`include/unicorn/ppc.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/ppc.h) | `UC_PPC_REG_*` 寄存器枚举 |
| [`include/unicorn/unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L735) | `uc_open` / `uc_emu_start` / `uc_reg_read` API 声明 |

## 相关页面

- [PowerPC 架构专题](/arch/ppc/)
- [UC_HOOK_BLOCK — 基本块](/hooks/block)
- [uc_reg_write — 写寄存器](/api/reg-write)
- [示例总览](/samples/overview)
