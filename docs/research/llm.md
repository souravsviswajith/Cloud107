# LLM Project and API Documentation References

This document records open-source LLM projects and the current official documentation of the three major hosted model providers relevant to Cloud107 and LLM107.

## Open-source LLM and inference projects

### llama.cpp

llama.cpp provides LLM and VLM inference in C/C++ with a focus on local and cloud execution across diverse hardware. Its documentation covers the library API, CLI, server, model formats, quantization, build configuration, and hardware backends.

Repository: https://github.com/ggml-org/llama.cpp
Documentation/build guide: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md

Relevant Cloud107 capabilities:
- CPU inference
- GPU acceleration
- Apple Silicon
- x86 and ARM
- Vulkan/SYCL/CUDA/HIP backends
- CPU/GPU hybrid execution
- OpenAI-compatible server interface

### Hugging Face Transformers

Transformers provides model definitions and APIs for inference and training across text, vision, audio, video, and multimodal models. Its ecosystem connects model definitions with training frameworks and inference engines.

Documentation: https://huggingface.co/docs/transformers/

Relevant areas:
- model loading
- inference pipelines
- generation
- fine-tuning
- distributed training
- quantization
- hardware support
- serving integrations

### vLLM

vLLM is an open-source inference and serving engine designed for high-throughput LLM workloads. Its documentation covers model execution, serving, distributed inference, quantization, multimodal models, and an OpenAI-compatible API.

Documentation: https://docs.vllm.ai/

Relevant Cloud107 capabilities:
- high-throughput serving
- GPU-oriented inference
- distributed execution
- API serving
- model deployment

### Ollama

Ollama provides a local model runtime and API-oriented interface for running language models on user-controlled machines.

Documentation: https://docs.ollama.com/

Relevant Cloud107 capabilities:
- local model execution
- local API access
- model lifecycle
- embeddings
- tool-capable application integration

### SGLang

SGLang is an open-source framework for efficient LLM and multimodal model serving and programming. It is relevant to structured generation, serving, batching, and high-performance inference.

Documentation: https://docs.sglang.ai/

### NVIDIA TensorRT-LLM

TensorRT-LLM is an open-source library for optimizing and accelerating LLM inference on NVIDIA GPUs. It provides optimized kernels, quantization, batching, and multi-GPU/multi-node inference features.

Documentation: https://nvidia.github.io/TensorRT-LLM/

### MLX

MLX is an open-source machine-learning framework designed for Apple silicon and unified-memory architectures. It is relevant to local inference and training on Apple hardware.

Repository/documentation: https://github.com/ml-explore/mlx

## Hosted model provider documentation

The following three provider documentation sets are treated as provider adapters in LLM107 rather than as the LLM107 architecture itself.

### OpenAI

OpenAI's current API documentation centers on model access through the Responses API and related client SDKs. The current model documentation describes text and image input, text output, tool capabilities, and specialized model families.

Documentation:
- API: https://platform.openai.com/docs/
- Models: https://platform.openai.com/docs/models
- Responses API: https://platform.openai.com/docs/api-reference/responses

Relevant interfaces:
- text and multimodal input
- response generation
- function/tool calls
- web search
- file search
- computer use
- streaming
- specialized audio, image, and realtime models

### Anthropic Claude

Anthropic's Claude Platform documentation provides direct model access through the Messages API and documents tool use, vision, structured outputs, prompt caching, streaming, thinking, and agent-oriented capabilities.

Documentation:
- Platform: https://docs.anthropic.com/en/home
- API reference: https://docs.anthropic.com/en/api/
- Tool use: https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview
- Model lifecycle: https://docs.anthropic.com/en/docs/about-claude/model-deprecations

Relevant interfaces:
- Messages API
- multimodal input
- tool use
- structured output
- prompt caching
- streaming
- thinking
- model lifecycle/deprecation management

### Google Gemini

Google's Gemini API documentation provides REST, SDK, streaming, real-time, batch, embeddings, file, and tool interfaces. The current API reference documents Interactions, generateContent, streaming, Live API, batch generation, embeddings, and supporting platform APIs.

Documentation:
- Gemini API: https://ai.google.dev/gemini-api/docs
- API reference: https://ai.google.dev/api
- Generate content: https://ai.google.dev/api/generate-content
- Function calling: https://ai.google.dev/gemini-api/docs/function-calling
- Embeddings: https://ai.google.dev/gemini-api/docs/embeddings

Relevant interfaces:
- text and multimodal generation
- function calling
- structured output
- streaming
- real-time Live API
- batch processing
- embeddings
- file input and retrieval
- MCP connectivity

## LLM107 provider-neutral model

LLM107 should not make any one provider's API the internal architectural contract.

A provider adapter should translate between:

```
LLM107 capability request
        ↓
Provider adapter
   ├── OpenAI
   ├── Anthropic
   ├── Google Gemini
   ├── Ollama
   ├── llama.cpp
   ├── vLLM
   └── Other supported provider/runtime
        ↓
Model execution
        ↓
Normalized result
        ↓
Cloud107 capability / workload layer
```

The adapter boundary should account for differences in:
- model identifiers
- context limits
- modalities
- tool/function schemas
- structured-output support
- streaming
- state management
- embeddings
- file handling
- authentication
- rate limits
- model lifecycle and deprecation
- local versus remote execution
- hardware requirements

## Model lifecycle

Provider documentation changes independently of Cloud107 releases. LLM107 should therefore record provider/model metadata separately from the Cloud107 core version.

A provider adapter should be able to represent:
- available
- active
- deprecated
- retired
- unavailable
- locally installed
- remotely accessible

Provider-specific lifecycle dates and replacement recommendations must come from the provider's current documentation rather than being hard-coded as permanent Cloud107 assumptions.

## Open-source versus hosted providers

Open-source runtimes and hosted model APIs solve different problems.

Open-source projects provide control over execution, hardware placement, model files, serving, and local operation where the model license permits it.

Hosted providers provide managed model access and provider-specific capabilities through APIs.

LLM107 should support both categories through the same capability-oriented routing model without requiring every model to expose identical features.

## Scope boundary

This document records relevant open-source projects and official provider documentation. Inclusion does not mean that Cloud107 or LLM107 currently integrates every listed runtime or provider.
