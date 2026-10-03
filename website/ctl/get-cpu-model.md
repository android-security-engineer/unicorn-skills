# uc_ctl_get_cpu_model

读取引擎**当前的 CPU 型号**（`UC_CPU_<ARCH>_*` 枚举值）。读完你会知道如何查询已选定的 CPU 微架构型号。

## 🧩 便捷宏定义与展开

来自 `include/unicorn/unicorn.h`：

```c
#define uc_ctl_get_cpu_model(uc, model) \
    uc_ctl(uc, UC_CTL_READ(UC_CTL_CPU_MODEL, 1), (model))
```

> 📄 声明：[`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L674)（便捷宏）· [`unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L583)（`UC_CTL_CPU_MODEL` 控制码）· 实现：[`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L2769)（`case UC_CTL_CPU_MODEL`）

展开为读方向、1 个参数、控制类型 `UC_CTL_CPU_MODEL`。

## 📥 参数与方向

| 项目 | 值 |
| --- | --- |
| 控制类型 | `UC_CTL_CPU_MODEL` |
| 方向 | `UC_CTL_IO_READ`（只读） |
| 参数个数 | 1 |
| `model` 类型 | `int *`（输出，写入 `UC_CPU_*` 值） |
| 返回 | `uc_err`，成功为 `UC_ERR_OK` |

`uc.c` 读分支返回 `uc->cpu_model`（先经 `UC_INIT`）。若未显式设置，则为该架构默认型号。

```mermaid
flowchart LR
    A["uc_ctl_get_cpu_model(uc, &m)"] --> B["UC_INIT"]
    B --> C["读取 uc->cpu_model"]
    C --> D["写入 *model"]
    style A fill:#3c8cff,color:#fff,stroke:none
```

## 🔧 何时用 / 示例

确认引擎实际选用了哪种 CPU 型号（影响可用指令扩展）：

```c
uc_engine *uc;
int model;

uc_open(UC_ARCH_ARM64, UC_MODE_ARM, &uc);

uc_err err = uc_ctl_get_cpu_model(uc, &model);
if (err) {
    printf("uc_ctl 失败: %u\n", err);
    return;
}
printf(">>> cpu_model = %d\n", model);
```

::: warning ⚠️ 时机限制
读取会触发 `UC_INIT`，之后再调用 [uc_ctl_set_cpu_model](/ctl/set-cpu-model) 会失败。若需自定义型号，务必**先设置、后读取**。
:::

## 📂 相关源码

| 文件 | 角色 |
|------|------|
| [`include/unicorn/unicorn.h`](https://github.com/android-security-engineer/unicorn-skills/blob/master/include/unicorn/unicorn.h#L674) | `uc_ctl_get_cpu_model` 便捷宏定义 |
| [`uc.c`](https://github.com/android-security-engineer/unicorn-skills/blob/master/uc.c#L2769) | `case UC_CTL_CPU_MODEL` 实现，读取 `uc->cpu_model` |

## 相关页面

- [uc_ctl 总览](/ctl/)
- [uc_ctl_set_cpu_model](/ctl/set-cpu-model)
- [CPU 型号](/features/cpu-models)
- [uc_open](/api/open)
