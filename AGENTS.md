# Repository Guidance

This repository defines a reusable Codex multi-agent team for software delivery.

Rules:
- Treat `.codex/agents/*.toml` as the executable source of truth for custom agents.
- Keep roles narrow and opinionated. Avoid overlapping ownership between agents.
- Do not hardcode technologies unless the project context explicitly requires them.
- Prefer skills when a workflow is reusable or domain-specific.
- Prefer MCP only when the workflow needs external systems.
- Keep the orchestrator focused on routing and dependency management, not execution.

When editing this repo:
- If you change an agent role, update the TOML definition and any workflow/template documentation affected by the change.
- Preserve the distinction between analysis, architecture, design, implementation, and testing.
- Preserve the distinction between business discovery and functional analysis.
- Favor explicit handoffs and acceptance criteria over broad generic instructions.
