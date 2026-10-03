# Rust 快速上手

本页带你用 Unicorn 的 Rust 绑定 `unicorn-engine` crate 跑起第一段仿真:添加依赖、`Unicorn::new`、映射内存、读写寄存器、启动仿真。读完你能仿真一段 ARM 机器码并断言结果。更细的 API 与所有权注意点见 [Rust API 详解](/bindings/rust-api)。

## 📥 添加依赖

在 `Cargo.toml` 中加入:

```toml
[dependencies]
unicorn-engine = "2.1.1"
```

该 crate 通过 `build.rs`(用 `cmake` + `bindgen`)自动构建并绑定底层 C 库,默认启用 `arch_all` feature 编译全部架构。

::: tip 只编译需要的架构
默认 feature 是 `default = ["arch_all"]`。若只用某一架构,可关闭默认 feature 再单独启用,缩短构建时间。具体 feature 名见 [`bindings/rust/unicorn-engine/Cargo.toml`](https://github.com/android-security-engineer/unicorn-skills/blob/master/bindings/rust/unicorn-engine/Cargo.toml)。
:::

## 🧩 仿真流程

```mermaid
graph LR
    A["Unicorn::new(Arch, Mode)"] --> B["mem_map(addr, size, Prot)"]
    B --> C["mem_write(addr, &code)"]
    C --> D["reg_write(RegisterARM::R0, ...)"]
    D --> E["emu_start(begin, until, timeout, count)"]
    E --> F["reg_read(RegisterARM::R0)"]
    style A fill:#3c8cff,color:#fff,stroke:none
    style E fill:#3c8cff,color:#fff,stroke:none
```

## 🚀 最小 ARM 仿真

以下代码取自 crate 官方 README,仿真一条 `sub r0, #23`:

```rust
use unicorn_engine::{Arch, Mode, Prot, SECOND_SCALE, Unicorn, RegisterARM};

fn main() {
    let arm_code32: Vec<u8> = vec![0x17, 0x00, 0x40, 0xe2]; // sub r0, #23

    let mut emu = Unicorn::new(Arch::ARM, Mode::LITTLE_ENDIAN)
        .expect("failed to initialize Unicorn instance");
    emu.mem_map(0x1000, 0x4000, Prot::ALL)
        .expect("failed to map code page");
    emu.mem_write(0x1000, &arm_code32)
        .expect("failed to write instructions");

    emu.reg_write(RegisterARM::R0, 123).expect("failed write R0");
    emu.reg_write(RegisterARM::R5, 1337).expect("failed write R5");

    emu.emu_start(
        0x1000,
        (0x1000 + arm_code32.len()) as u64,
        10 * SECOND_SCALE,
        1000,
    ).expect("failed to start emulation");

    assert_eq!(emu.reg_read(RegisterARM::R0).unwrap(), 100);
    assert_eq!(emu.reg_read(RegisterARM::R5).unwrap(), 1337);
}
```

`R0` 从 123 减 23 得 100,`R5` 未被指令触及仍为 1337。

## 🧠 API 风格要点

- 引擎类型是 `Unicorn<'a, D>`,构造用 `Unicorn::new(arch, mode)`,返回 `Result<_, uc_error>`。
- 会修改状态的方法(`mem_map`、`mem_write`、`reg_write`、`emu_start`)需要 `&mut self`;只读方法(`reg_read`、`mem_read`)只需 `&self`。
- 寄存器 ID 是分架构的枚举:`RegisterARM`、`RegisterX86`、`RegisterARM64` 等,通过 `Into<i32>` 传入。
- 时间常量 `SECOND_SCALE` 用于把秒换算成 `emu_start` 的微秒超时参数。

::: warning 错误处理
几乎所有方法返回 `Result<_, uc_error>`。示例用 `.expect(...)` 是为简洁;生产代码应显式处理 `uc_error`。错误码含义见 [错误码总览](/errors/)。
:::

## 🪝 加一个代码 Hook

```rust
emu.add_code_hook(0x1000, 0x2000, |_uc, address, size| {
    println!(">>> 执行指令 @{:#x}, 大小={}", address, size);
}).expect("failed to add code hook");
```

更多 Hook(块、内存、中断)与生命周期约束见 [Rust API 详解](/bindings/rust-api)。

## 📂 相关源码

| 文件/目录 | 角色 |
|------|------|
| [`bindings/rust/`](https://github.com/android-security-engineer/unicorn-skills/blob/master/bindings/rust/) | Rust 绑定 workspace（`unicorn-engine` crate） |
| [`bindings/const_generator.py`](https://github.com/android-security-engineer/unicorn-skills/blob/master/bindings/const_generator.py) | 生成常量 |
| [`bindings/rust/unicorn-engine/Cargo.toml`](https://github.com/android-security-engineer/unicorn-skills/blob/master/bindings/rust/unicorn-engine/Cargo.toml) | feature 与依赖配置 |

## 相关页面

- [Rust API 详解](/bindings/rust-api)
- [语言绑定总览](/bindings/overview)
- [uc_emu_start](/api/emu-start)
