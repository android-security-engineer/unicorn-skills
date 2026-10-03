// 文档站点的「骨架数据」。所有分区的页面清单集中在此定义，
// config.mjs 据此自动生成侧边栏，内容文件与 slug 一一对应。
// 这样新增/调整页面时只改这一处，避免侧边栏与实际文件失配。

// —— API 参考：include/unicorn/unicorn.h 中每个可调用函数各一页 ——
export const apiGroups = [
  {
    text: '生命周期',
    items: [
      ['open', 'uc_open — 创建引擎'],
      ['close', 'uc_close — 释放引擎'],
      ['query', 'uc_query — 查询属性'],
      ['ctl', 'uc_ctl — 动态控制'],
      ['version', 'uc_version — 版本号'],
      ['arch-supported', 'uc_arch_supported — 架构可用性'],
      ['errno', 'uc_errno — 最近错误'],
      ['strerror', 'uc_strerror — 错误字符串'],
      ['free', 'uc_free — 释放缓冲'],
    ],
  },
  {
    text: '执行控制',
    items: [
      ['emu-start', 'uc_emu_start — 启动仿真'],
      ['emu-stop', 'uc_emu_stop — 停止仿真'],
    ],
  },
  {
    text: '寄存器读写',
    items: [
      ['reg-read', 'uc_reg_read — 读寄存器'],
      ['reg-read2', 'uc_reg_read2 — 带宽度读'],
      ['reg-write', 'uc_reg_write — 写寄存器'],
      ['reg-write2', 'uc_reg_write2 — 带宽度写'],
      ['reg-read-batch', 'uc_reg_read_batch — 批量读'],
      ['reg-read-batch2', 'uc_reg_read_batch2 — 批量带宽度读'],
      ['reg-write-batch', 'uc_reg_write_batch — 批量写'],
      ['reg-write-batch2', 'uc_reg_write_batch2 — 批量带宽度写'],
    ],
  },
  {
    text: '内存操作',
    items: [
      ['mem-read', 'uc_mem_read — 读内存'],
      ['mem-write', 'uc_mem_write — 写内存'],
      ['mem-map', 'uc_mem_map — 映射内存'],
      ['mem-map-ptr', 'uc_mem_map_ptr — 映射宿主指针'],
      ['mem-unmap', 'uc_mem_unmap — 解除映射'],
      ['mem-protect', 'uc_mem_protect — 修改保护位'],
      ['mem-regions', 'uc_mem_regions — 枚举映射'],
      ['mmio-map', 'uc_mmio_map — 映射 MMIO'],
    ],
  },
  {
    text: '虚拟内存（MMU）',
    items: [
      ['vmem-read', 'uc_vmem_read — 按虚拟地址读'],
      ['vmem-write', 'uc_vmem_write — 按虚拟地址写'],
      ['vmem-translate', 'uc_vmem_translate — 地址翻译'],
    ],
  },
  {
    text: 'Hook 管理',
    items: [
      ['hook-add', 'uc_hook_add — 注册 Hook'],
      ['hook-del', 'uc_hook_del — 移除 Hook'],
    ],
  },
  {
    text: '上下文快照',
    items: [
      ['context-alloc', 'uc_context_alloc — 分配上下文'],
      ['context-free', 'uc_context_free — 释放上下文'],
      ['context-save', 'uc_context_save — 保存状态'],
      ['context-restore', 'uc_context_restore — 恢复状态'],
      ['context-size', 'uc_context_size — 上下文大小'],
      ['context-reg-read', 'uc_context_reg_read — 读上下文寄存器'],
      ['context-reg-read2', 'uc_context_reg_read2 — 带宽度读'],
      ['context-reg-write', 'uc_context_reg_write — 写上下文寄存器'],
      ['context-reg-write2', 'uc_context_reg_write2 — 带宽度写'],
      ['context-reg-read-batch', 'uc_context_reg_read_batch — 批量读'],
      ['context-reg-read-batch2', 'uc_context_reg_read_batch2 — 批量带宽度读'],
      ['context-reg-write-batch', 'uc_context_reg_write_batch — 批量写'],
      ['context-reg-write-batch2', 'uc_context_reg_write_batch2 — 批量带宽度写'],
    ],
  },
]

// —— uc_ctl_* 便捷宏，每个控制点一页 ——
export const ctlItems = [
  ['get-mode', 'uc_ctl_get_mode — 获取模式'],
  ['get-arch', 'uc_ctl_get_arch — 获取架构'],
  ['get-page-size', 'uc_ctl_get_page_size — 获取页大小'],
  ['set-page-size', 'uc_ctl_set_page_size — 设置页大小'],
  ['get-timeout', 'uc_ctl_get_timeout — 获取超时'],
  ['get-cpu-model', 'uc_ctl_get_cpu_model — 获取 CPU 型号'],
  ['set-cpu-model', 'uc_ctl_set_cpu_model — 设置 CPU 型号'],
  ['flush-tb', 'uc_ctl_flush_tb — 刷新翻译块缓存'],
  ['flush-tlb', 'uc_ctl_flush_tlb — 刷新 TLB'],
  ['tlb-mode', 'uc_ctl_tlb_mode — 切换 TLB 模式'],
  ['request-cache', 'uc_ctl_request_cache — 请求 TB 缓存'],
  ['remove-cache', 'uc_ctl_remove_cache — 移除 TB 缓存'],
  ['exits-enable', 'uc_ctl_exits_enable — 启用多出口'],
  ['exits-disable', 'uc_ctl_exits_disable — 禁用多出口'],
  ['get-exits-cnt', 'uc_ctl_get_exits_cnt — 出口数量'],
  ['get-exits', 'uc_ctl_get_exits — 读取出口集合'],
  ['set-exits', 'uc_ctl_set_exits — 设置出口集合'],
  ['get-tcg-buffer-size', 'uc_ctl_get_tcg_buffer_size — 获取 TCG 缓冲'],
  ['set-tcg-buffer-size', 'uc_ctl_set_tcg_buffer_size — 设置 TCG 缓冲'],
  ['context-mode', 'uc_ctl_context_mode — 上下文范围'],
  ['set', 'uc_ctl_set / 原始用法 — 底层协议'],
]

// —— Hook 类型，每种触发点一页 ——
export const hookItems = [
  ['block', 'UC_HOOK_BLOCK — 基本块'],
  ['code', 'UC_HOOK_CODE — 每条指令'],
  ['insn', 'UC_HOOK_INSN — 特定指令'],
  ['insn-invalid', 'UC_HOOK_INSN_INVALID — 非法指令'],
  ['intr', 'UC_HOOK_INTR — 中断/异常'],
  ['edge-generated', 'UC_HOOK_EDGE_GENERATED — 新控制流边'],
  ['tcg-opcode', 'UC_HOOK_TCG_OPCODE — TCG 操作码'],
  ['tlb-fill', 'UC_HOOK_TLB_FILL — TLB 填充'],
  ['mem-read', 'UC_HOOK_MEM_READ — 内存读'],
  ['mem-write', 'UC_HOOK_MEM_WRITE — 内存写'],
  ['mem-fetch', 'UC_HOOK_MEM_FETCH — 取指'],
  ['mem-read-after', 'UC_HOOK_MEM_READ_AFTER — 读后'],
  ['mem-read-unmapped', 'UC_HOOK_MEM_READ_UNMAPPED — 读未映射'],
  ['mem-write-unmapped', 'UC_HOOK_MEM_WRITE_UNMAPPED — 写未映射'],
  ['mem-fetch-unmapped', 'UC_HOOK_MEM_FETCH_UNMAPPED — 取指未映射'],
  ['mem-read-prot', 'UC_HOOK_MEM_READ_PROT — 读保护违例'],
  ['mem-write-prot', 'UC_HOOK_MEM_WRITE_PROT — 写保护违例'],
  ['mem-fetch-prot', 'UC_HOOK_MEM_FETCH_PROT — 取指保护违例'],
  ['mem-unmapped', 'UC_HOOK_MEM_UNMAPPED — 未映射合集'],
  ['mem-prot', 'UC_HOOK_MEM_PROT — 保护违例合集'],
  ['mem-invalid', 'UC_HOOK_MEM_INVALID — 非法访问合集'],
  ['mem-valid', 'UC_HOOK_MEM_VALID — 合法访问合集'],
]

// —— 错误码，每个 UC_ERR_* 一页 ——
export const errorItems = [
  ['ok', 'UC_ERR_OK — 成功'],
  ['nomem', 'UC_ERR_NOMEM — 内存不足'],
  ['arch', 'UC_ERR_ARCH — 架构不支持'],
  ['handle', 'UC_ERR_HANDLE — 句柄无效'],
  ['mode', 'UC_ERR_MODE — 模式无效'],
  ['version', 'UC_ERR_VERSION — 版本不匹配'],
  ['read-unmapped', 'UC_ERR_READ_UNMAPPED — 读未映射'],
  ['write-unmapped', 'UC_ERR_WRITE_UNMAPPED — 写未映射'],
  ['fetch-unmapped', 'UC_ERR_FETCH_UNMAPPED — 取指未映射'],
  ['hook', 'UC_ERR_HOOK — Hook 无效'],
  ['insn-invalid', 'UC_ERR_INSN_INVALID — 非法指令'],
  ['map', 'UC_ERR_MAP — 映射无效'],
  ['write-prot', 'UC_ERR_WRITE_PROT — 写保护违例'],
  ['read-prot', 'UC_ERR_READ_PROT — 读保护违例'],
  ['fetch-prot', 'UC_ERR_FETCH_PROT — 取指保护违例'],
  ['arg', 'UC_ERR_ARG — 参数无效'],
  ['read-unaligned', 'UC_ERR_READ_UNALIGNED — 读未对齐'],
  ['write-unaligned', 'UC_ERR_WRITE_UNALIGNED — 写未对齐'],
  ['fetch-unaligned', 'UC_ERR_FETCH_UNALIGNED — 取指未对齐'],
  ['hook-exist', 'UC_ERR_HOOK_EXIST — Hook 已存在'],
  ['resource', 'UC_ERR_RESOURCE — 资源不足'],
  ['exception', 'UC_ERR_EXCEPTION — 未处理异常'],
  ['overflow', 'UC_ERR_OVERFLOW — 溢出'],
]

// —— 内存模型 ——
export const memoryItems = [
  ['overview', '内存模型总览'],
  ['permissions', '保护位 UC_PROT_*'],
  ['map', '映射内存 mem_map'],
  ['map-ptr', '零拷贝映射 mem_map_ptr'],
  ['unmap', '解除映射'],
  ['protect', '修改保护位'],
  ['regions', '枚举映射区域'],
  ['mmio', 'MMIO 内存映射 IO'],
  ['read-write', '主机侧读写内存'],
  ['mem-types', '访问类型 UC_MEM_*'],
  ['page-size', '页大小与对齐'],
  ['cow-snapshot', '写时复制与快照'],
  ['unaligned', '未对齐访问'],
]

// —— 语言绑定 ——
export const bindingItems = [
  ['overview', '绑定总览'],
  ['const-generator', '常量生成器'],
  ['python', 'Python'],
  ['python-api', 'Python · API 详解'],
  ['rust', 'Rust'],
  ['rust-api', 'Rust · API 详解'],
  ['go', 'Go'],
  ['java', 'Java'],
  ['dotnet', '.NET'],
  ['ruby', 'Ruby'],
  ['pascal', 'Pascal/Delphi'],
  ['haskell', 'Haskell'],
  ['zig', 'Zig'],
  ['vb6', 'Visual Basic 6'],
]

// —— 内部实现 ——
export const internalItems = [
  ['overview', '内部实现总览'],
  ['uc-dispatch', 'uc.c 分发层'],
  ['uc-struct', 'uc_struct 结构'],
  ['function-pointers', '函数指针后端'],
  ['qemu-fork', '内置 QEMU Fork'],
  ['unicorn-common', 'unicorn_common.h 胶水层'],
  ['tcg-pipeline', 'TCG 翻译流水线'],
  ['translate-all', 'translate-all 翻译块'],
  ['cpu-exec', 'cpu-exec 执行循环'],
  ['softmmu', 'softmmu 软件 MMU'],
  ['tlb', 'TLB 与地址翻译'],
  ['glib-compat', 'glib_compat 兼容层'],
  ['list', 'list.c 链表工具'],
  ['build-system', 'CMake 构建系统'],
  ['memory-api', 'MemoryRegion / FlatView'],
  ['snapshot-impl', '快照与 COW 实现'],
]

// —— 每个后端 target ——
export const targetItems = [
  ['x86', 'i386 / x86-64 后端'],
  ['arm', 'ARM 后端'],
  ['aarch64', 'AArch64 后端'],
  ['mips', 'MIPS 后端'],
  ['ppc', 'PowerPC 后端'],
  ['riscv', 'RISC-V 后端'],
  ['sparc', 'SPARC 后端'],
  ['m68k', 'M68K 后端'],
  ['s390x', 'S390X 后端'],
  ['tricore', 'TriCore 后端'],
]

// —— 架构专题：每个架构一组子页面 ——
export const archs = [
  ['x86', 'X86（16/32/64 位）', '🖥️'],
  ['arm', 'ARM', '📱'],
  ['arm64', 'ARM64 / AArch64', '💪'],
  ['mips', 'MIPS', '🔷'],
  ['ppc', 'PowerPC', '🍎'],
  ['riscv', 'RISC-V', '🧩'],
  ['sparc', 'SPARC', '☀️'],
  ['m68k', 'M68K', '🕹️'],
  ['s390x', 'S390X', '🏢'],
  ['tricore', 'TriCore', '🚗'],
]

// 每个架构的子页面（slug 相对 /arch/<arch>/）
export const archPages = [
  ['index', '概览'],
  ['registers', '寄存器参考'],
  ['modes', '模式与字节序'],
  ['instructions', '指令与特性'],
  ['cpu-models', 'CPU 型号'],
  ['header', '头文件常量'],
  ['example', '实战示例'],
]

// —— 示例源码走读：samples/*.c ——
export const sampleItems = [
  ['overview', '示例总览'],
  ['sample-x86', 'sample_x86.c — X86 全功能'],
  ['sample-x86-gdt', 'sample_x86_32_gdt_and_seg_regs.c — GDT 与段'],
  ['shellcode', 'shellcode.c — 自修改代码'],
  ['sample-arm', 'sample_arm.c — ARM'],
  ['sample-arm64', 'sample_arm64.c — ARM64'],
  ['sample-mips', 'sample_mips.c — MIPS'],
  ['sample-sparc', 'sample_sparc.c — SPARC'],
  ['sample-m68k', 'sample_m68k.c — M68K'],
  ['sample-ppc', 'sample_ppc.c — PowerPC'],
  ['sample-riscv', 'sample_riscv.c — RISC-V'],
  ['sample-s390x', 'sample_s390x.c — S390X'],
  ['sample-tricore', 'sample_tricore.c — TriCore'],
  ['sample-batch-reg', 'sample_batch_reg.c — 批量寄存器'],
  ['sample-ctl', 'sample_ctl.c — 动态控制'],
  ['sample-mmu', 'sample_mmu.c — MMU'],
  ['mem-apis', 'mem_apis.c — 内存 API'],
]

// —— 功能详解（在已有基础上扩充）——
export const featureItems = [
  ['architectures', '多架构支持'],
  ['jit', 'JIT 编译（TCG）'],
  ['hooks', 'Hook 插桩体系'],
  ['memory', '内存映射与管理'],
  ['registers', '寄存器读写'],
  ['mmu', 'MMU 与虚拟内存'],
  ['batch-api', '批量 API'],
  ['context', '上下文控制'],
  ['interrupts', '中断与异常'],
  ['exits', '多出口机制'],
  ['timeout', '超时与指令计数'],
  ['cpu-models', 'CPU 型号选择'],
  ['endianness', '字节序处理'],
  ['tlb-modes', 'TLB 模式'],
  ['snapshot', '快照与回滚'],
  ['thread-safety', '线程安全'],
]

// —— 测试套件：tests/unit/ 下每个套件一页 ——
export const testItems = [
  ['index', '测试总览'],
  ['test-x86', 'test_x86.c — X86'],
  ['test-arm', 'test_arm.c — ARM'],
  ['test-arm64', 'test_arm64.c — ARM64'],
  ['test-mips', 'test_mips.c — MIPS'],
  ['test-ppc', 'test_ppc.c — PowerPC'],
  ['test-riscv', 'test_riscv.c — RISC-V'],
  ['test-sparc', 'test_sparc.c — SPARC'],
  ['test-m68k', 'test_m68k.c — M68K'],
  ['test-s390x', 'test_s390x.c — S390X'],
  ['test-tricore', 'test_tricore.c — TriCore'],
  ['test-mem', 'test_mem.c — 内存'],
  ['test-ctl', 'test_ctl.c — 控制接口'],
]

// —— 头文件参考：核心 .h 一页 ——
export const headerItems = [
  ['unicorn-h', 'unicorn.h — 公共 API'],
  ['platform-h', 'platform.h — 平台抽象'],
  ['uc-priv-h', 'uc_priv.h — 内部私有'],
  ['qemu-h', 'qemu.h — QEMU 桥接'],
  ['list-h', 'list.h — 链表工具'],
]

// —— 开发与基础设施：测试周边、构建辅助 ——
export const devItems = [
  ['index', '开发基础设施总览'],
  ['regress', '回归测试 tests/regress'],
  ['fuzz', '模糊测试 tests/fuzz'],
  ['benchmarks', '性能基准 tests/benchmarks'],
  ['cmake-helpers', 'CMake 辅助 cmake/'],
  ['msvc', 'MSVC 工程目录 msvc/'],
  ['symbols', '符号导出 symbols.sh'],
]

// —— 入门指南 ——
export const guideItems = [
  ['intro', '项目介绍'],
  ['problems', '它能解决什么问题'],
  ['use-cases', '典型应用场景'],
  ['quickstart', '快速开始'],
  ['concepts', '核心概念'],
  ['learning-path', '学习路径与知识地图'],
  ['architecture', '架构总览'],
  ['glossary', '术语表'],
  ['comparison', '与 QEMU/其他工具对比'],
]

export const guidePractice = [
  ['first-program', '第一个模拟程序'],
  ['compile', '编译与安装'],
  ['testing', '测试与基准'],
  ['debugging', '调试仿真问题'],
  ['faq', '常见问题 FAQ'],
]

// 把 [slug, text] 数组转换为 VitePress sidebar item
export function toItems(prefix, arr) {
  return arr.map(([slug, text]) => ({
    text,
    link: slug === 'index' ? `${prefix}` : `${prefix}${slug}`,
  }))
}

export function toGroups(prefix, groups) {
  return groups.map((g) => ({
    text: g.text,
    collapsed: true,
    items: toItems(prefix, g.items),
  }))
}
