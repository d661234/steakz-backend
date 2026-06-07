# Custom Command: Add Endpoint

## Instruction
When this command is invoked, follow these steps:
1. Ask the user for the route path, HTTP method, controller name, and required roles.
2. Create the controller method in the appropriate file in `src/controllers/`.
3. Create the route definition in the appropriate file in `src/routes/` with RBAC middleware.
4. Create a new test file in `tests/` or add a test case to an existing one.
5. Run the tests to verify the new endpoint.
6. Update `API.md` and `PROGRESS.md`.
