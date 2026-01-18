---
description: Create a new branch, commit changes, push, create PR, and fix all failed checks
allowed-tools: Bash, Read, Glob, Grep, Edit, Write, Task, WebFetch
argument-hint: <branch-name> [commit message]
---

# PR Workflow Skill

Create a new branch from main, stage all changes, commit, push, create a PR, and iteratively fix all failing checks until they pass.

## Arguments

- `$ARGUMENTS` - Branch name (required) and optional commit message
  - Format: `<branch-name> [commit message in quotes]`
  - Example: `feat/add-dark-mode "Add dark mode toggle to header"`

## Workflow

### 1. Parse Arguments

Extract branch name and commit message from `$ARGUMENTS`:
- First word is the branch name
- Remaining text (if any) is the commit message
- If no commit message provided, generate one based on staged changes

### 2. Verify Clean State & Create Branch

```bash
# Fetch latest from origin
git fetch origin

# Create and checkout new branch from main
git checkout -b <branch-name> origin/main
```

### 3. Stage and Commit Changes

```bash
# Check what files have changes
git status

# Stage all changes
git add -A

# If no commit message provided, analyze changes for a message
git diff --cached --stat
```

Generate a commit message following conventional commits format if not provided:
- `feat:` for new features
- `fix:` for bug fixes
- `refactor:` for refactoring
- `docs:` for documentation
- `test:` for tests
- `chore:` for maintenance
- `ci:` for CI/CD changes

Commit with the message:
```bash
git commit -m "$(cat <<'EOF'
<commit message>

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### 4. Push to Remote

```bash
git push -u origin <branch-name>
```

### 5. Create Pull Request

```bash
# Get the diff summary for PR description
git log origin/main..HEAD --oneline

# Create PR using gh CLI
gh pr create --title "<PR title>" --body "$(cat <<'EOF'
## Summary
<bullet points summarizing changes>

## Test plan
- [ ] <testing steps>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### 6. Monitor and Fix Failed Checks

**CRITICAL**: This is an iterative loop that continues until all checks pass (except claude review).

```bash
# Get the PR number
PR_NUMBER=$(gh pr view --json number -q .number)

# Wait for checks to start
sleep 10
```

**Check Loop**:

1. **Get check status**:
   ```bash
   gh pr checks $PR_NUMBER --json name,state,conclusion
   ```

2. **Identify failed checks** (exclude "claude" from check names):
   - Filter out any check with "claude" in the name (case-insensitive)
   - Focus on checks with `conclusion: "failure"` or `state: "failure"`

3. **For each failed check**:
   - Get the check run details and logs
   - Analyze the failure reason
   - Fix the issue in the code
   - Commit the fix with message: `fix: address <check-name> failure`
   - Push the changes

4. **Wait and re-check**:
   ```bash
   # Wait for checks to re-run
   sleep 30

   # Check status again
   gh pr checks $PR_NUMBER
   ```

5. **Repeat until all non-claude checks pass**

### 7. Report Success

Once all checks pass (or only claude review remains):
- Display the PR URL
- List all commits made
- Summarize what was fixed

## Expected CI Checks

This project has the following CI workflows:

| Workflow | File | Purpose |
|----------|------|---------|
| Deploy Hugo site | `hugo.yml` | Build and deploy to GitHub Pages |
| Purge Cloudflare Cache | `cf_cache_purge.yml` | Purge CDN cache after deploy |

Common failures to watch for:
- Hugo build errors (template syntax, missing files)
- Link checker failures (broken links)
- JavaScript syntax errors

## Skipped Checks

The following checks are intentionally skipped and NOT addressed:
- Any check with "claude" in the name (claude review, claude-review, etc.)

## Example Usage

```
/pr feat/add-events-page "Add new events listing page"
/pr fix/broken-link
/pr refactor/cleanup-css "Refactor CSS for better organization"
/pr docs/update-readme "Update README with new build instructions"
/pr ci/add-linting "Add linting workflow"
```

## Notes

- Always creates branch from `origin/main`
- Uses conventional commit format
- Will make multiple commits if multiple check fixes are needed
- Times out after 10 failed check fix attempts (asks for user guidance)
- Never skips or bypasses checks - always fixes the underlying issue
- Hugo build must succeed for deployment
- Run `node scripts/generate-events-data.js` before build if events changed
