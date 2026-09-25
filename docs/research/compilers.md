# Compiler and Toolchain References

This document records open-source compiler and toolchain projects relevant to Cloud107's hardware-to-workload model.

## GNU Compiler Collection (GCC)

GCC provides compilers for multiple languages and target architectures. Its documentation covers language support, standards, compiler options, target behavior, compiler internals, and information relevant to porting GCC to new targets.

Official documentation: https://gcc.gnu.org/onlinedocs/

## GNU Binutils

GNU Binutils provides foundational binary-toolchain components including the GNU assembler (as), linker (ld), and binary/object utilities.

The assembler documentation covers source syntax, directives, object formats, command-line use, and machine-dependent features. The linker documentation covers relocation, symbol resolution, object formats, linker scripts, and memory-layout control.

Official documentation: https://sourceware.org/binutils/docs/

## LLVM / Clang / MLIR

LLVM is compiler infrastructure with reusable intermediate representations, optimization infrastructure, target backends, and tooling. Clang provides a C-family compiler frontend and tooling built on LLVM. MLIR provides a multi-level intermediate-representation framework for representing and lowering programs across abstraction levels and domains.

Official LLVM documentation: https://llvm.org/docs/
Official Clang documentation: https://clang.llvm.org/docs/
Official MLIR documentation: https://mlir.llvm.org/docs/

## Rust compiler (rustc)

The Rust compiler provides a modern example of a production compiler with documented frontend, intermediate representations, code generation, target support, bootstrap, and compiler-development processes.

Official compiler development guide: https://rustc-dev-guide.rust-lang.org/

## Cranelift

Cranelift is a low-level, retargetable code generator. It translates target-independent intermediate representation into machine code and provides components for JIT and object-code generation. It is also used by Wasmtime for WebAssembly execution.

Official source and documentation: https://github.com/bytecodealliance/wasmtime/tree/main/cranelift
Official Wasmtime documentation: https://docs.wasmtime.dev/

## CIRCT

CIRCT (Circuit IR Compilers and Tools) applies MLIR and LLVM-style compiler infrastructure to hardware design. It is relevant to hardware-description compilation, IR-based transformation, and lowering toward hardware-oriented representations.

Official documentation: https://circt.llvm.org/docs/

## Quantum compilation

Quantum software introduces another compilation stack. OpenQASM provides a quantum assembly language for describing quantum programs and control operations. Quantum compiler toolchains such as Qiskit provide target-aware program transformation and transpilation for quantum backends.

OpenQASM documentation: https://openqasm.com/
Qiskit documentation: https://quantum.cloud.ibm.com/docs/

## Relevance to Cloud107

These projects provide reference points for different layers:

- Assembly and machine targets: GNU as, Binutils
- Native multi-language compilation: GCC, Clang
- Compiler infrastructure and multi-level lowering: LLVM, MLIR
- Modern systems-language compiler architecture: rustc
- Retargetable code generation and JIT: Cranelift
- Hardware-description compilation: CIRCT
- Quantum-program compilation: OpenQASM and quantum compiler toolchains

Cloud107 should select the smallest appropriate compiler/toolchain layer for a given hardware target, language, runtime, and workload. It does not need to replace these projects. They can be execution components or references where appropriate.

## Scope boundary

This document records relevant open-source projects and documentation. It does not claim that Cloud107 currently integrates all of them, nor that every hardware target requires every compiler layer.
