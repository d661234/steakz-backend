# Custom Command: Sync Schema

## Instruction
When this command is invoked, follow these steps:
1. Ask the user for the migration name.
2. Run `npx prisma migrate dev --name <migration_name>`.
3. Run `npx prisma generate`.
4. Update `SCHEMA.md` with the new changes.
5. Run tests to ensure no regressions.
