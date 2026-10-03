---
layout: home

hero:
  name: Unicorn Engine
  text: 多架构 CPU 模拟器框架
  tagline: 基于 QEMU 的轻量级、高性能、可插桩的 CPU 仿真引擎。本站用一图一文，带你彻底搞懂它做了什么、怎么做到的。
  image:
    src: /logo.svg
    alt: Unicorn Engine
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quickstart
    - theme: alt
      text: 项目介绍
      link: /guide/intro

features:
  - icon: 🦄
    title: 多架构支持
    details: ARM、ARM64、M68K、MIPS、PowerPC、RISCV、SPARC、S390X、TriCore、X86（16/32/64 位），一套 API 通吃。
    link: /features/architectures
    linkText: 查看原理 →
  - icon: ⚡
    title: JIT 高性能
    details: 基于 QEMU 的 TCG（Tiny Code Generator），将目标指令即时编译为宿主机原生代码，性能远超解释执行。
    link: /features/jit
    linkText: 查看原理 →
  - icon: 🪝
    title: 细粒度插桩
    details: 支持在指令、基本块、内存访问、事件等多个层级挂载 Hook，可用于断点、追踪、内存映射 IO 等场景。
    link: /features/hooks
    linkText: 查看原理 →
  - icon: 🧠
    title: 内存与 MMU
    details: 灵活的内存映射、保护位控制，以及完整的 MMU 虚拟内存支持，可仿真复杂地址翻译。
    link: /features/memory
    linkText: 查看原理 →
  - icon: 🔧
    title: 架构无关 API
    details: 纯 C 实现，干净直观的统一接口；并提供 Python、Rust、Go、Java、Zig 等 16 种语言绑定。
    link: /features/registers
    linkText: 查看原理 →
  - icon: 🧵
    title: 线程安全设计
    details: 引擎实例相互独立，天然支持多线程并发仿真，适合大规模并行任务。
    link: /features/context
    linkText: 查看原理 →
  - icon: 🧪
    title: 完整测试矩阵
    details: 每个架构独立测试套件 + 跨切面内存/控制接口测试，配合 oss-fuzz 持续守护质量。
    link: /tests/
    linkText: 查看测试 →
  - icon: 🔬
    title: 内部实现剖析
    details: 从 uc.c 分发层到 TCG 翻译流水线、softmmu、TLB、glib_compat，逐层拆解实现原理。
    link: /internals/overview
    linkText: 查看原理 →
  - icon: 📚
    title: 全 API 参考
    details: 每个 API 函数、Hook 类型、错误码、头文件都单独成页，配示例与调用流程图。
    link: /api/
    linkText: 查看参考 →
---
