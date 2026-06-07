# Custom Command: Test and Commit

## Instruction
When this command is invoked, follow these steps:
1. Run `npm run test` and capture the output.
2. If tests fail, report the errors and stop.
3. If tests pass, run `git status` and `git diff`.
4. Propose a concise commit message based on the changes.
5. Ask the user for confirmation before committing.
