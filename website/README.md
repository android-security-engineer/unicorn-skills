# Unicorn Engine 文档站

基于 [VitePress](https://vitepress.dev/) 构建的中文教学文档站，部署于 GitHub Pages。

## 本地开发

```bash
cd website
pnpm install
pnpm dev          # 启动开发服务器 (默认 http://localhost:5173)
```

## 构建

```bash
pnpm build        # 产物输出到 .vitepress/dist/
pnpm preview      # 本地预览构建产物
```

## 目录结构

```
website/
├── .vitepress/
│   ├── config.mjs        # VitePress 配置 (导航/侧边栏/mermaid)
│   └── data.mjs          # 骨架数据 (所有页面清单集中于此)
├── public/
│   └── logo.svg          # 站点图标
├── guide/                # 入门指南 (intro/problems/quickstart/concepts...)
├── features/             # 功能详解 (architectures/jit/hooks/memory/mmu...)
├── api/                  # API 函数参考 (uc_open/uc_emu_start/uc_mem_map...)
├── ctl/                  # uc_ctl 控制接口 (每个控制点一页)
├── hooks/                # Hook 类型参考 (UC_HOOK_CODE/UC_HOOK_MEM_*)
├── errors/               # 错误码参考 (每个 UC_ERR_* 一页)
├── memory/               # 内存模型 (map/protect/mmio/regions...)
├── arch/                 # 架构专题 (x86/arm/arm64/mips/ppc/riscv/sparc/m68k/s390x/tricore)
├── internals/            # 内部实现原理 (uc.c/uc_struct/tcg/softmmu/tlb/glib_compat-*)
├── bindings/             # 语言绑定 (python/rust/go/java/zig...)
├── samples/              # 示例源码走读 (samples/*.c 逐个)
├── tests/                # 测试套件 (tests/unit/test_*.c 逐个)
├── headers/              # 头文件参考 (unicorn.h/uc_priv.h/qemu.h/list.h/platform.h)
├── index.md              # 首页
└── package.json
```

## 目录约定

- **一页一主题**：每个 API 函数、每个 Hook 类型、每个错误码、每个测试套件、每个头文件都单独成页。
- **集中骨架**：所有分区的页面清单写在 `.vitepress/data.mjs`，`config.mjs` 据此自动生成侧边栏，新增/调整页面只改这一处。
- **链接即路径**：文件 `api/open.md` 对应 URL `/api/open`，`tests/test-x86.md` 对应 `/tests/test-x86`。

## 部署

通过 GitHub Actions 自动部署（见 `.github/workflows/deploy-docs.yml`）：

- 推送到 `master` 分支且改动 `website/` 时自动触发
- 构建产物发布到 GitHub Pages
- 访问地址：`https://<owner>.github.io/unicorn-skills/`

### 首次部署须知

1. 仓库 **Settings → Pages → Build and deployment**，将 Source 设为 **GitHub Actions**。
2. `config.mjs` 中的 `base` 已设为 `/unicorn-skills/`，与仓库名对应。若启用 `<user>.github.io` 顶级域名，需将 `base` 改为 `/`。

## 文档规范

- 全站使用简体中文
- 遵循「一图抵前言」原则，概念尽量配 [Mermaid](https://mermaid.js.org/) 图表
- 代码示例与官方 `samples/` 及头文件保持一致
