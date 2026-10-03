# Haskell 绑定

本页讲清 Unicorn 的 Haskell 绑定:它通过 FFI 封装底层 C 库,并把所有引擎操作放进 `Emulator` monad(用 `runEmulator` 执行)。读完你能在 Haskell 里打开引擎、映射内存、注册 Hook 并跑一段 x86 代码。

## 🧩 机制:FFI + Emulator monad

Haskell 绑定位于 [`bindings/haskell/`](https://github.com/android-security-engineer/unicorn-skills/blob/master/bindings/haskell/),源码在 `src/Unicorn.hs` 与 `src/Unicorn/Hook.hs`,通过 **FFI** 调用 `libunicorn`。它把可能失败的引擎操作封装在 `Emulator` monad 里,用 `runEmulator` 运行并返回 `Either Error a`。

```mermaid
graph LR
    APP["你的 Haskell 代码"] --> EM["Emulator monad<br/>(open / memMap / start ...)"]
    EM -->|runEmulator| FFI["FFI 绑定"]
    FFI --> LIB["libunicorn (C)"]
    style EM fill:#3c8cff,color:#fff,stroke:none
```

## 📤 常用函数

引入方式:`import Unicorn`、`import Unicorn.Hook`、`import qualified Unicorn.CPU.X86 as X86`。

| 函数 | 说明 |
|------|------|
| `open arch [modes]` | 创建引擎,返回 Emulator Engine |
| `memMap uc addr size [prots]` | 映射内存 |
| `memWrite uc addr bytes` | 写内存 |
| `memRead uc addr size` | 读内存 |
| `regWrite uc reg value` | 写寄存器 |
| `regRead uc reg` | 读寄存器 |
| `start uc begin until timeout count` | 开始仿真 |
| `codeHookAdd uc cb ud begin end` | 指令级 Hook |
| `blockHookAdd uc cb ud begin end` | 块级 Hook |

## 🚀 基本用法

以下取自官方 `samples/SampleX86.hs`:

```haskell
import Unicorn
import Unicorn.Hook
import qualified Unicorn.CPU.X86 as X86
import qualified Data.ByteString as BS

-- inc ecx; dec edx
x86Code32 :: BS.ByteString
x86Code32 = BS.pack [0x41, 0x4a]

address :: Word64
address = 0x1000000

main :: IO ()
main = do
    result <- runEmulator $ do
        -- 以 x86-32 位模式初始化引擎
        uc <- open ArchX86 [Mode32]

        -- 映射 2MB 内存并写入机器码
        memMap uc address (2 * 1024 * 1024) [ProtAll]
        memWrite uc address x86Code32

        -- 初始化寄存器
        regWrite uc X86.Ecx 0x1234
        regWrite uc X86.Edx 0x7890

        -- 注册块级与指令级 Hook
        blockHookAdd uc hookBlock () 1 0
        codeHookAdd uc hookCode () 1 0

        -- 开始仿真(超时/指令数用 Nothing 表示不限)
        let codeLen = fromIntegral (BS.length x86Code32)
        start uc address (address + codeLen) Nothing Nothing

        -- 读回寄存器
        ecx <- regRead uc X86.Ecx
        edx <- regRead uc X86.Edx
        emuPutStrLn $ ">>> ECX = 0x" ++ showHex ecx
        emuPutStrLn $ ">>> EDX = 0x" ++ showHex edx
    case result of
        Right _  -> return ()
        Left err -> putStrLn $ "Failed: " ++ strerror err
```

::: tip Emulator monad 与错误处理
所有引擎操作都在 `runEmulator` 的 do 块内串联,任一步失败会短路为 `Left err`。`emuPutStrLn` 是在 monad 内打印的辅助函数。这种设计让错误处理集中在 `case result` 一处。
:::

## 🪝 Hook 回调与类型

回调按类型有专门的类型别名,如 `CodeHook`、`BlockHook`、`MemoryEventHook`。处理未映射内存的回调返回 `Bool`:

```haskell
hookMemInvalid :: MemoryEventHook ()
hookMemInvalid uc MemWriteUnmapped addr size (Just value) _ = do
    runEmulator $ memMap uc 0xaaaa0000 (2 * 1024 * 1024) [ProtAll]
    return True    -- 已补映射,继续仿真
hookMemInvalid _ _ _ _ _ _ =
    return False   -- 中止仿真
```

::: warning 模式与权限是列表
`open` 的模式(`[Mode32]`)与 `memMap` 的权限(`[ProtAll]`)都是列表,对应 C 侧的位或组合。构建需要 `libunicorn` 与 Cabal(见 `unicorn.cabal`)。
:::

## 📂 相关源码

| 文件/目录 | 角色 |
|------|------|
| [`bindings/haskell/`](https://github.com/android-security-engineer/unicorn-skills/blob/master/bindings/haskell/) | Haskell 绑定源码（`src/Unicorn.hs`） |
| [`bindings/const_generator.py`](https://github.com/android-security-engineer/unicorn-skills/blob/master/bindings/const_generator.py) | 生成常量 |

## 相关页面

- [语言绑定总览](/bindings/overview)
- [Hook 体系](/features/hooks)
- [uc_emu_start](/api/emu-start)
