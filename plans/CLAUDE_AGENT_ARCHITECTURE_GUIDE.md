# AI Backend Builder Platform

## Claude Agent Architecture Upgrade Guide

This document is a **complete instruction manual for the Claude agent** responsible for improving and refactoring the AI Backend Builder platform.

The goal is to transform the current codebase into a **scalable, production-grade architecture** while **preserving and improving existing implementations**.

The system already contains **partial implementations of some components**, therefore the agent must **prioritize refactoring and extending existing logic rather than rebuilding everything from scratch**.

---

# Critical Instructions for the Claude Agent

Before writing or modifying any code:

1. Perform a **full repository analysis**
2. Identify:
    - current architecture
    - partially implemented features
    - missing infrastructure
3. Map existing systems to the architecture described in this document
4. Produce a **detailed implementation plan**
5. Only after the plan is finalized begin implementing changes

The agent must follow **incremental safe refactoring**.

Do NOT:

- delete working systems unnecessarily
- introduce breaking architecture changes without migration
- rewrite working components without reason

Always prefer:

refactor > extend > rebuild

---

# Current Technology Stack

Backend

- FeathersJS v5

AI Models

- Qwen-Coder 2.5 7B
- Ollama (local inference)

Storage

- MongoDB (metadata)
- Cloudflare R2 (project files)

The system generates and improves backend projects using AI.

---

# Target System Architecture

The system should follow a **layered modular architecture**.

Frontend Platform
│
▼
API Layer (FeathersJS)
│
▼
AI Orchestration Layer
│
┌────┴───────────┐
▼ ▼
Local LLM Cloud LLM
(Ollama) (Optional)
│
▼
Project Storage
(MongoDB + R2)

Each layer must have a **strict responsibility boundary**.

---

# Layer 1 — Frontend Platform

Responsibilities

- prompt interface
- project file explorer
- AI assistant chat
- architecture visualization
- API testing interface
- version history viewer

Frontend must **never communicate directly with models**.

All communication goes through backend APIs.

---

# Layer 2 — API Layer (FeathersJS)

This layer acts as the **control center**.

Responsibilities

- authentication
- project lifecycle
- prompt submission
- AI job creation
- snapshot management
- model provider selection
- file management

Recommended service structure

services/

projects
files
snapshots
prompts
ai-jobs
models
architecture

Example request flow

User Prompt
↓
POST /ai-jobs
↓
AI orchestration pipeline

---

# Layer 3 — AI Orchestration Layer

This is the **core intelligence layer**.

User prompts must pass through a **multi-stage pipeline**.

Prompt
↓
Intent Analyzer
↓
Task Planner
↓
Context Retriever
↓
Code Generator
↓
Code Validator
↓
Snapshot Creator

Each stage should be **modular and independently testable**.

---

# Intent Analyzer

Convert user prompts into structured intent.

Example prompt

Add comments to tasks

Intent output

{
action: "add_feature",
target: "tasks",
feature: "comments"
}

This step dramatically improves reliability.

---

# Task Planner

Convert intent into **atomic tasks**.

Example

1 create comment schema
2 create comment service
3 connect comments to tasks
4 update routes
5 update validation

Atomic tasks allow **smaller local models to succeed**.

---

# Context Retrieval (RAG)

Never send the entire project to the model.

Instead retrieve **relevant files only**.

Architecture

Project Files
│
▼
Embedding Index
│
▼
Semantic Retrieval

Workflow

Task
↓
Retrieve relevant files
↓
Send to model

---

# Code Generation Engine

Responsible for executing tasks using selected models.

Supported providers

Local

Ollama

Optional cloud

vLLM
OpenAI

The system must remain **model-agnostic**.

Example request

{
task: "...",
files: [...],
architecture_context: {...}
}

Expected output

modified files
new files
patch diffs

---

# Code Validation Layer

Model output must be validated.

Validation steps

syntax validation
lint check
dependency validation
build verification

Example pipeline

generate code
↓
run eslint
↓
run build
↓
if failure → regenerate

---

# Snapshot Versioning System

The platform includes snapshot-based version control.

Required capabilities

version history
restore version
compare versions
branch snapshots

Storage structure

projects/
projectId/
snapshots/
v1
v2
v3

Optimization

Snapshots should store **file diffs**, not full copies.

Example

v1
full snapshot

v2
changed files only

---

# Project Storage Layer

Two storage systems must be used.

Metadata database

MongoDB stores

projects
snapshots
file metadata
architecture metadata
AI prompts

File storage

Cloudflare R2 stores

project files
snapshots
generated assets

---

# Architecture Metadata Graph

Maintain structured representation of backend architecture.

Example structure

services
models
relations
routes
middlewares
permissions

Example

{
services: ["users","tasks"],
relations: [
{from:"users",to:"tasks",type:"owner"}
]
}

This enables intelligent modifications.

---

# Local LLM Integration

Local models run via Ollama.

Example endpoint

POST /api/generate

Provider abstraction

if provider == local
call Ollama

if provider == cloud
call remote model

---

# Streaming System

Model responses should stream tokens.

Pipeline

LLM
↓
Orchestrator
↓
WebSocket
↓
Frontend

This improves user experience.

---

# AI Memory System

Each project maintains persistent AI memory.

Stored data

previous prompts
architecture decisions
dependencies
coding style

Example

Project stack:
FeathersJS
MongoDB
JWT authentication

---

# Job Queue System

AI operations must run asynchronously.

Recommended tools

Redis
BullMQ

Workflow

User prompt
↓
Create AI job
↓
Worker processes job
↓
Return results

---

# Worker System

Separate workers handle heavy workloads.

Workers

generation worker
validation worker
embedding worker
indexing worker

This enables horizontal scaling.

---

# Security Requirements

The platform must implement

rate limiting
token limits
project size limits
sandboxed execution

Never execute arbitrary user code on production servers.

---

# Observability

Track platform health.

Metrics

generation time
model latency
error rate
token usage

Recommended tools

Prometheus
Grafana
OpenTelemetry

---

# Implementation Strategy

The Claude agent must implement improvements in **phases**.

Phase 1

Repository analysis

Phase 2

Architecture mapping

Phase 3

Refactor AI orchestration

Phase 4

Improve snapshot system

Phase 5

Implement RAG context retrieval

Phase 6

Add validation layer

Phase 7

Add job queue and workers

Phase 8

Improve model abstraction

---

# Final Architectural Principle

The LLM must never be the primary system logic.

The platform should function as

Planner
Retriever
Generator
Validator
Versioner

This allows **smaller local models like Qwen-Coder 7B to perform reliably**.

---

# Final Task for Claude Agent

1. Analyze the full repository
2. Map the current architecture
3. Identify gaps vs this document
4. Produce an implementation roadmap
5. Refactor incrementally
6. Apply the architecture described here

The final system must be:

- modular
- scalable
- model-agnostic
- production ready
