# sample_m68k.c 走读 · Motorola 68000

[`sample_m68k.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/samples/sample_m68k.c) 演示如何在 Unicorn 上仿真经典的 Motorola 68000（m68k）架构。它执行一条 `movq #-19, %d3`，把一个带符号立即数搬进数据寄存器 `%d3`，并完整 dump 出 8 个数据寄存器 + 8 个地址寄存器 + PC/SR。

## 🎯 演示要点

- `UC_ARCH_M68K` + `UC_MODE_BIG_ENDIAN`（m68k 是大端架构）
- 数据寄存器 `D0~D7` 与地址寄存器 `A0~A7` 的批量初始化
- `movq` 的符号扩展：`#-19` → `0xffffffed`
- 一次性读回全部寄存器与状态寄存器 `SR`

## 🧩 关键代码走读

代码只有两字节，是一条 `movq`（move quick）：

```c
#define M68K_CODE "\x76\xed" // movq #-19, %d3
#define ADDRESS 0x10000

uc_open(UC_ARCH_M68K, UC_MODE_BIG_ENDIAN, &uc);
uc_mem_map(uc, ADDRESS, 2 * 1024 * 1024, UC_PROT_ALL);
uc_mem_write(uc, ADDRESS, M68K_CODE, sizeof(M68K_CODE) - 1);
```

示例把 D0~D7、A0~A7、PC、SR 全部初始化为 0，再逐一读回：

```c
int d3 = 0x0000;
uc_reg_write(uc, UC_M68K_REG_D3, &d3);   // 初值 0，将被 movq 覆盖
// ... D0~D7 / A0~A7 / PC / SR 同样置 0 ...

uc_hook_add(uc, &trace1, UC_HOOK_BLOCK, hook_block, NULL, 1, 0);
uc_hook_add(uc, &trace2, UC_HOOK_CODE,  hook_code,  NULL, 1, 0);

uc_emu_start(uc, ADDRESS, ADDRESS + sizeof(M68K_CODE) - 1, 0, 0);
uc_reg_read(uc, UC_M68K_REG_D3, &d3);    // 0xffffffed（-19 符号扩展）
```

::: tip movq 是带符号的
`movq` 把一个 8 位立即数**符号扩展**到 32 位再写入。`#-19` 的字节是 `0xed`，扩展成 32 位就是 `0xffffffed`。这正是本示例最值得留意的一处细节。
:::

```mermaid
graph LR
    A["movq #-19, %d3"] --> B["立即数字节 0xed"]
    B --> C["符号扩展到 32 位"]
    C --> D["D3 = 0xffffffed"]
    style D fill:#3c8cff,color:#fff,stroke:none
```

## 📤 预期输出（节选）

```text
Emulate M68K code
>>> Tracing basic block at 0x10000, block size = 0x2
>>> Tracing instruction at 0x10000, instruction size = 0x2
>>> Emulation done. Below is the CPU context
>>> A0 = 0x0		>>> D0 = 0x0
...
>>> A3 = 0x0		>>> D3 = 0xffffffed
...
>>> PC = 0x10002
>>> SR = 0x2700
```

`D3` 得到符号扩展后的 `0xffffffed`，PC 前进到指令末尾 `0x10002`。

::: tip 延伸练习
1. 把立即数换成正数（如 `movq #19` = `\x76\x13`），验证不再符号扩展。
2. 观察执行后 `SR`（状态寄存器）里 N（负）标志位是否被置起。
3. 追加一条 `add.l %d3, %d4`，验证 m68k 的两操作数加法。
:::

## 📂 相关源码

| 文件 | 角色 |
|------|------|
| [`samples/sample_m68k.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/samples/sample_m68k.c) | 本页走读的 m68k 示例 |
| [`include/unicorn/m68k.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/m68k.h) | `UC_M68K_REG_*` 寄存器枚举 |
| [`include/unicorn/unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L735) | `uc_open` / `uc_emu_start` / `uc_reg_read` API 声明 |

## 相关页面

- [m68k 架构专题](/arch/m68k/)
- [UC_HOOK_CODE — 每条指令](/hooks/code)
- [寄存器读写](/features/registers)
- [示例总览](/samples/overview)
