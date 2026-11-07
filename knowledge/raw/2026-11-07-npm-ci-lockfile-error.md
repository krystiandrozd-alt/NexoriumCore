# npm ci failure: lock file out of sync (2026-11-07)

Captured by Claude Code on 2026-11-07 while setting up the knowledge wiki. Public information: this repository and its GitHub Actions logs are public.

## Local reproduction

Command: `npm ci --ignore-scripts --no-audit --no-fund` in a fresh clone at commit `40ab8184250e65ee03367872bfeef65f6104cdf4` (main), Node v22.23.4, npm 10.9.9.

npm debug log, first lines of the error:

```
`npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.
Missing: workerize-loader@2.0.2 from lock file
Missing: webpack@5.112.2 from lock file
Missing: @webassemblyjs/ast@1.14.1 from lock file
Missing: @webassemblyjs/wasm-edit@1.14.1 from lock file
Missing: @webassemblyjs/wasm-parser@1.14.1 from lock file
Missing: chrome-trace-event@1.0.4 from lock file
Missing: enhanced-resolve@5.26.1 from lock file
```

98 lines of the debug log match "Missing:" or "Invalid:".

## GitHub Actions

Workflow "CI", run 42340845363 (pull request #9, 2026-11-07), job "Lint & Type Check": step "Install dependencies" failed with the same kind of list ("Missing: webpack-sources@3.7.0 from lock file", "Missing: terser@5.51.2 from lock file", ...). ESLint and the type check were skipped.

The five most recent CI runs listed on 2026-11-07 (run numbers 5 to 9) all concluded with failure.
