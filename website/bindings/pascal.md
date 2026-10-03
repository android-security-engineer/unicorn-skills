# Pascal / Delphi 绑定

本页讲清 Unicorn 的 Pascal/Delphi(FreePascal 亦可)绑定:它以**动态加载**方式绑定底层 C 库,函数签名与 C API 一一对应。读完你能在 Pascal 里加载引擎、映射内存、注册 Hook 并跑一段 x86 代码。

## 🧩 机制:动态加载单元

Pascal 绑定位于 [`bindings/pascal/`](https://github.com/android-security-engineer/unicorn-skills/blob/master/bindings/pascal/),核心单元是 `Unicorn_dyn`,它在运行时 `LoadLibrary` 加载 `libunicorn`,再用 `dyn_loadfunc` 把每个 C 导出函数(`uc_open`、`uc_mem_map`……)绑定到同名过程变量。常量单元(`UnicornConst.pas`、`X86Const.pas` 等)由 [常量生成器](/bindings/const-generator) 生成。

```mermaid
graph LR
    APP["你的 Pascal 代码"] --> DYN["Unicorn_dyn 单元<br/>过程变量 @uc_open ..."]
    DYN -->|dyn_loadfunc| LIB["libunicorn (动态库)"]
    style DYN fill:#3c8cff,color:#fff,stroke:none
```

## 📤 需要引入的单元

```pascal
uses
  Unicorn_dyn, UnicornConst, X86Const;
```

Pascal 绑定保持 **C 风格函数命名**:`uc_open`、`uc_mem_map`、`uc_reg_write`、`uc_emu_start`、`uc_hook_add` 等。寄存器读写通过指针参数传值(`@r_ecx`)。

::: warning 加载库
使用任何函数前,单元通过 `loadUC()` 加载动态库并绑定符号;任一符号缺失会返回失败。请确保 `libunicorn` 在库搜索路径中。
:::

## 🚀 基本用法

以下取自官方 `examples/x86.lpr`:

```pascal
const
  // INC ecx; DEC edx; PXOR xmm0, xmm1
  X86_CODE32: array[0..6] of Byte = ($41, $4a, $66, $0f, $ef, $c1, $00);
  ADDRESS = $1000000;
var
  uc: uc_engine;
  err: uc_err;
  trace1, trace2: uc_hook;
  r_ecx: UInt32 = $1234;
  r_edx: UInt32 = $7890;
begin
  // 以 x86-32 位模式初始化引擎
  err := uc_open(UC_ARCH_X86, UC_MODE_32, uc);
  if err <> UC_ERR_OK then Exit;

  // 映射 2MB 内存
  uc_mem_map(uc, ADDRESS, 2 * 1024 * 1024, UC_PROT_ALL);

  // 写入机器码(注意函数名为 uc_mem_write_)
  uc_mem_write_(uc, ADDRESS, @X86_CODE32, SizeOf(X86_CODE32) - 1);

  // 初始化寄存器(通过指针传值)
  uc_reg_write(uc, UC_X86_REG_ECX, @r_ecx);
  uc_reg_write(uc, UC_X86_REG_EDX, @r_edx);

  // 注册 Hook:块级 + 指令级
  uc_hook_add(uc, trace1, UC_HOOK_BLOCK, @HookBlock, nil, 1, 0, []);
  uc_hook_add(uc, trace2, UC_HOOK_CODE,  @HookCode,  nil, 1, 0, []);

  // 开始仿真
  err := uc_emu_start(uc, ADDRESS, ADDRESS + SizeOf(X86_CODE32) - 1, 0, 0);

  // 读回寄存器
  uc_reg_read(uc, UC_X86_REG_ECX, @r_ecx);
  uc_reg_read(uc, UC_X86_REG_EDX, @r_edx);
  WriteLn(Format('>>> ECX = 0x%x', [r_ecx]));
end.
```

::: tip 命名差异 uc_mem_write_
底层写内存函数在 Pascal 单元里叫 `uc_mem_write_`(带尾下划线),以避免与其它标识符冲突。其它函数保持原名。回调用 `@` 取过程地址传入。
:::

## 🪝 Hook 回调签名

回调是 `cdecl` 过程,签名对应 C:

```pascal
procedure HookCode(uc: uc_engine; address: UInt64; size: UInt32;
                   user_data: Pointer); cdecl;
begin
  WriteLn(Format('>>> 执行 @0x%x, 大小=%d', [address, size]));
end;
```

## 📂 相关源码

| 文件/目录 | 角色 |
|------|------|
| [`bindings/pascal/`](https://github.com/android-security-engineer/unicorn-skills/blob/master/bindings/pascal/) | Pascal 绑定源码（`Unicorn_dyn` 单元） |
| [`bindings/const_generator.py`](https://github.com/android-security-engineer/unicorn-skills/blob/master/bindings/const_generator.py) | 生成 `UnicornConst.pas`/`X86Const.pas` |

## 相关页面

- [语言绑定总览](/bindings/overview)
- [Hook 体系](/features/hooks)
- [uc_emu_start](/api/emu-start)
