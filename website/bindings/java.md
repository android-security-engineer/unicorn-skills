# Java 绑定

本页讲清 Unicorn 的 Java 绑定:它通过 JNI 调用底层 C 库,核心是 `unicorn.Unicorn` 类。读完你能用 Maven 引入、创建引擎、映射内存、注册 Hook 并跑一段 x86 代码。

## 🧩 机制:JNI 封装

Java 绑定位于 [`bindings/java/`](https://github.com/android-security-engineer/unicorn-skills/blob/master/bindings/java/),由两部分组成:原生 JNI 库 `libunicorn_java`(`unicorn_Unicorn.c`)与 Java 层 JAR(`unicorn.Unicorn` 等类)。常量以接口形式生成,如 `X86Const`、`ArmConst`,由 [常量生成器](/bindings/const-generator) 产出。

```mermaid
graph LR
    APP["你的 Java 代码"] --> U["unicorn.Unicorn"]
    U --> JNI["libunicorn_java (JNI)"]
    JNI --> LIB["libunicorn (C)"]
    style U fill:#3c8cff,color:#fff,stroke:none
```

## 📥 引入与构建

进入 `bindings/java` 用 Maven 构建:

```bash
mvn package
```

产物是原生库 `libunicorn_java.{so,dylib,dll}` 与 `target/unicorn-2.xx.jar`。运行时需把原生库放到 `java.library.path`、JAR 放到 classpath。详见 [`bindings/java/README.md`](https://github.com/android-security-engineer/unicorn-skills/blob/master/bindings/java/README.md)。

## 📤 常用方法

常量通过实现接口引入,例如 `class MyClass implements UnicornConst, X86Const`:

| 方法 | 说明 |
|------|------|
| `new Unicorn(int arch, int mode)` | 创建引擎 |
| `mem_map(long addr, long size, int perms)` | 映射内存 |
| `mem_write(long addr, byte[] bytes)` | 写内存 |
| `mem_read(long addr, long size)` | 读内存,返回 `byte[]` |
| `reg_write(int regid, long value)` | 写寄存器 |
| `reg_read(int regid)` | 读寄存器 |
| `emu_start(long begin, long until, long timeout, long count)` | 开始仿真 |
| `emu_stop()` | 停止仿真 |
| `hook_add(...)` | 注册 Hook(重载区分类型) |
| `close()` | 释放引擎 |

## 🚀 基本用法

以下取自官方 `Sample_x86.java` 的风格:

```java
import unicorn.*;

public class Demo implements UnicornConst, X86Const {
    // INC ecx; DEC edx
    static final byte[] X86_CODE32 = { 0x41, 0x4a };
    static final long ADDRESS = 0x1000000;

    static void hookCode(Unicorn u, long address, long size, Object user) {
        System.out.format(">>> 执行 @0x%x, 大小=%d\n", address, size);
    }

    public static void main(String[] args) {
        Unicorn uc = new Unicorn(UC_ARCH_X86, UC_MODE_32);

        uc.mem_map(ADDRESS, 2 * 1024 * 1024, UC_PROT_ALL);
        uc.mem_write(ADDRESS, X86_CODE32);

        uc.reg_write(UC_X86_REG_ECX, 0x1234L);
        uc.reg_write(UC_X86_REG_EDX, 0x7890L);

        // 注册指令级 Hook
        uc.hook_add((CodeHook) Demo::hookCode, 1, 0, null);

        uc.emu_start(ADDRESS, ADDRESS + X86_CODE32.length, 0, 0);

        System.out.format(">>> ECX = 0x%x\n", uc.reg_read(UC_X86_REG_ECX));
        System.out.format(">>> EDX = 0x%x\n", uc.reg_read(UC_X86_REG_EDX));
    }
}
```

::: tip Hook 类型即接口
Java 绑定为每种 Hook 定义了函数式接口:`CodeHook`、`BlockHook`、`MemHook`、`EventMemHook`、`InterruptHook`、`InstructionHook`、`TlbFillHook` 等。`hook_add` 通过重载参数类型选择对应回调,所以要显式转型(如 `(CodeHook)`)。
:::

## 🪝 内存事件 Hook

```java
// 处理未映射访问:补映射后继续
EventMemHook memAlloc = (u, type, address, size, value, user) -> {
    long aligned = address & ~0xFFFL;
    u.mem_map(aligned, 0x1000, UC_PROT_ALL);
    return true;   // 已处理,继续仿真
};
uc.hook_add(memAlloc, UC_HOOK_MEM_UNMAPPED, 1, 0, null);
```

::: warning 数值类型
Java 无无符号类型,地址与寄存器值用 `long` 表示 64 位量。传字面量时注意加 `L` 后缀避免整型溢出(如 `0xaaaa0000L`)。
:::

## 📂 相关源码

| 文件/目录 | 角色 |
|------|------|
| [`bindings/java/`](https://github.com/android-security-engineer/unicorn-skills/blob/master/bindings/java/) | Java 绑定源码（JNI 层与 JAR） |
| [`bindings/const_generator.py`](https://github.com/android-security-engineer/unicorn-skills/blob/master/bindings/const_generator.py) | 生成 `X86Const`/`ArmConst` 等接口 |
| [`bindings/java/README.md`](https://github.com/android-security-engineer/unicorn-skills/blob/master/bindings/java/README.md) | 构建与运行说明 |

## 相关页面

- [语言绑定总览](/bindings/overview)
- [Hook 体系](/features/hooks)
- [uc_emu_start](/api/emu-start)
