---
description: Run all PR checks locally (linting, validation, and Hugo build)
allowed-tools: Bash, Read, Glob, Grep
argument-hint: [--fix] [--lint-only] [--build-only]
---

# Local PR Checks

Run the same checks that run in CI locally to catch issues before pushing.

## Arguments

- `$ARGUMENTS` - Optional flags:
  - `--fix` - Attempt to auto-fix linting issues where possible
  - `--lint-only` - Run only linting checks (skip build)
  - `--build-only` - Run only build checks (skip linting)
  - No arguments - Run all checks

## Checks Performed

| Check | Tool | What it validates |
|-------|------|-------------------|
| Markdown | markdownlint-cli2 | Content files in `content/` |
| YAML | yamllint | Front matter and config files |
| Templates | djlint | Hugo templates in `layouts/` |
| Events Data | npm script | Generated events data validity |
| Front Matter | npm script | Required fields in blog posts |
| Hugo Build | hugo | Site builds without errors |
| Link Check | hugo | Internal links are valid |

## Workflow

### Step 1: Check Tool Availability

```bash
# Check if required tools are installed
echo "Checking tool availability..."
which markdownlint-cli2 || echo "⚠ markdownlint-cli2 not found (npm install -g markdownlint-cli2)"
which yamllint || echo "⚠ yamllint not found (pip install yamllint)"
which djlint || echo "⚠ djlint not found (pip install djlint)"
which hugo || echo "⚠ hugo not found"
```

If tools are missing, inform the user how to install them:
```bash
# Install all linting tools
npm install -g markdownlint-cli2
pip3 install yamllint djlint
```

### Step 2: Run Linting Checks

Skip this step if `--build-only` is passed.

#### 2a. Markdown Linting
```bash
echo "📝 Checking Markdown files..."
markdownlint-cli2
```

If `--fix` flag is passed:
```bash
markdownlint-cli2 --fix
```

#### 2b. YAML Linting
```bash
echo "📋 Checking YAML files..."
yamllint .
```

#### 2c. Template Linting
```bash
echo "🎨 Checking Hugo templates..."
djlint layouts/ --lint
```

If `--fix` flag is passed:
```bash
djlint layouts/ --reformat
```

### Step 3: Run Validation Scripts

Skip this step if `--lint-only` is passed.

```bash
echo "✅ Validating events data..."
npm run validate:events

echo "✅ Validating front matter..."
npm run validate:frontmatter
```

### Step 4: Hugo Build

Skip this step if `--lint-only` is passed.

```bash
echo "🔨 Generating events data..."
node scripts/generate-events-data.js

echo "🏗️ Building Hugo site..."
hugo --gc --minify --cleanDestinationDir
```

### Step 5: Report Results

Summarize all results in a clear format:

```
═══════════════════════════════════════
           PR CHECK RESULTS
═══════════════════════════════════════

Linting:
  ✓ Markdown    - X files checked, Y issues
  ✓ YAML        - X files checked, Y issues
  ✓ Templates   - X files checked, Y issues

Validation:
  ✓ Events data - Valid
  ✓ Front matter - X posts validated

Build:
  ✓ Hugo build  - Success (X pages generated)

═══════════════════════════════════════
```

Use ✓ for passing checks, ✗ for failing checks.

## Error Handling

- **Continue on non-critical failures**: Linting issues should be reported but not stop other checks
- **Stop on critical failures**: Build errors should stop execution
- **Provide actionable guidance**: For each failure, suggest how to fix it

## Exit Codes

Track which checks failed and report at the end:
- Exit 0: All checks passed
- Exit 1: One or more checks failed

## Example Output

```
$ /check

🔍 Running local PR checks...

📝 Checking Markdown files...
   content/blog/example-tech-tutorial/index.md:18 MD032 Lists should be surrounded by blank lines
   Found 3 issues in 2 files

📋 Checking YAML files...
   ✓ All YAML files valid

🎨 Checking Hugo templates...
   layouts/_default/list.html:39 H014 Found extra blank lines
   Found 1 issue in 1 file

✅ Validating events data...
   ✓ Events data valid

✅ Validating front matter...
   ✓ 5 posts validated

🏗️ Building Hugo site...
   ✓ Built 47 pages in 234ms

═══════════════════════════════════════
           PR CHECK RESULTS
═══════════════════════════════════════
  ⚠ Markdown   - 3 issues (non-blocking)
  ✓ YAML       - passed
  ⚠ Templates  - 1 issue (non-blocking)
  ✓ Events     - passed
  ✓ Front matter - passed
  ✓ Hugo build - passed

Ready to push! (lint issues are warnings)
═══════════════════════════════════════
```

## Quick Install Commands

If tools are missing, provide these install commands:

```bash
# Node.js tools
npm install -g markdownlint-cli2

# Python tools
pip3 install yamllint djlint

# Or install all at once
npm install -g markdownlint-cli2 && pip3 install yamllint djlint
```

## Notes

- Linting issues are reported but don't fail the overall check (they use `continue-on-error` in CI)
- Build failures are critical and should be fixed before pushing
- Run with `--fix` to auto-fix markdown and template issues where possible
- The Hugo build matches CI: `hugo --gc --minify --cleanDestinationDir`
