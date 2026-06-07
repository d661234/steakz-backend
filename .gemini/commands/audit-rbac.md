# Custom Command: Audit RBAC

## Instruction
When this command is invoked, follow these steps:
1. Scan all files in `src/routes/`.
2. For each route definition, verify that it uses the `rbac` middleware.
3. Cross-reference the assigned roles with the permissions defined in Section 3 of `gemini.md`.
4. Report any missing or inconsistent RBAC implementations.
