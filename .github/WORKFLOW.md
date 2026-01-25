# CI/CD Workflow Documentation

This document describes the branch-based CI/CD workflow for the haitchUI repository.

## Branch Strategy

### `dev` Branch (Primary Development)
- **Purpose**: Active development and integration branch
- **Protection**: Requires 1 approving review
- **CI Checks**: All PRs must pass lint, typecheck, build, test, and security audit
- **Commits**: Conventional commit format enforced
- **Workflow**: Developers create feature branches from `dev`, open PRs to `dev`, and merge after review

### `main` Branch (Release Only)
- **Purpose**: Reflects the latest stable release published to npm
- **Protection**: Requires 2 approving reviews
- **Commits**: Only accepts `chore(release):` commits from automated release PRs
- **Workflow**: Updated automatically via tagged releases from `dev`

## Workflows

### 1. **CI Workflow** (`.github/workflows/ci.yml`)
**Triggers**: Push or PR to `dev` branch

**Jobs**:
- **Lint**: Runs ESLint across all packages
- **Type Check**: Validates TypeScript compilation
- **Build**: Builds all packages via Turbo
- **Test**: Runs unit tests with coverage
- **Security Audit**: Checks for vulnerable dependencies

**Purpose**: Ensures code quality and prevents broken builds from being merged.

### 2. **Release PR Workflow** (`.github/workflows/release.yml`)
**Triggers**: Push to `dev` branch

**Steps**:
1. Detects pending changesets
2. Creates or updates a "Version Packages" PR
3. Bumps versions in `package.json` files
4. Updates `CHANGELOG.md` files

**Purpose**: Automates version management via Changesets. Does NOT publish to npm.

### 3. **Publish Workflow** (`.github/workflows/publish.yml`)
**Triggers**: Push of a tag matching `v*.*.*` (e.g., `v1.2.3`)

**Steps**:
1. Builds and tests all packages
2. Publishes to npm with provenance
3. Creates GitHub releases
4. Opens a PR to merge the release to `main`

**Purpose**: Publishes tagged releases to npm and propagates them to `main`.

### 4. **Security Scanning Workflow** (`.github/workflows/security.yml`)
**Triggers**:
- Weekly schedule (Mondays 9 AM UTC)
- Push to `dev` when `pnpm-lock.yaml` or `package.json` changes
- Manual dispatch

**Jobs**:
- **CodeQL Analysis**: Scans TypeScript/JavaScript code for vulnerabilities
- **Dependency Audit**: Checks for high/critical CVEs in dependencies
- **Dependency Review**: Reviews new dependencies in PRs (fails on high-severity issues or GPL licenses)

**Purpose**: Continuous security monitoring and vulnerability detection.

## Release Process

### Step-by-Step Guide

1. **Develop Features**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/my-feature
   # Make changes
   git commit -m "feat: add new component"
   git push origin feature/my-feature
   ```

2. **Create Pull Request to `dev`**
   - Open PR on GitHub
   - CI workflow runs automatically
   - Request 1 review
   - Merge after approval and passing checks

3. **Add Changesets**
   ```bash
   git checkout dev
   pnpm changeset
   # Follow prompts to describe changes
   git add .changeset/
   git commit -m "chore: add changeset"
   git push origin dev
   ```

4. **Release PR Created Automatically**
   - `release.yml` workflow detects changesets
   - Creates/updates "chore(release): version packages" PR
   - Review and merge when ready to release

5. **Tag the Release**
   ```bash
   git checkout dev
   git pull origin dev
   git tag v1.2.3
   git push origin v1.2.3
   ```

6. **Publish Workflow Executes**
   - `publish.yml` workflow triggers on tag push
   - Publishes packages to npm
   - Creates GitHub release
   - Opens PR to merge `dev` → `main`

7. **Merge to `main`**
   - Review the automated PR (requires 2 approvals)
   - Merge to update `main` with the latest release

## Configuration Files

### Changesets Configuration (`.changeset/config.json`)
```json
{
  "baseBranch": "dev",
  "access": "public",
  "updateInternalDependencies": "patch"
}
```

### Branch Protection Rulesets

#### Dev Branch (`.github/rulesets/dev-branch-protection.json`)
- 1 approving review required
- Last push approval required
- Stale reviews dismissed on push
- Required status checks: Lint, Type Check, Build, Test, Security Audit
- Conventional commit pattern enforced

#### Main Branch (`.github/rulesets/main-branch-protection.json`)
- 2 approving reviews required
- Last push approval required
- Review thread resolution required
- Only `chore(release):` commits allowed
- Intended for automated release PRs only

## Environment Variables & Secrets

The following secrets must be configured in GitHub repository settings:

- **`NPM_TOKEN`**: npm authentication token with publish access (required for publishing)
- **`GITHUB_TOKEN`**: Automatically provided by GitHub Actions (no configuration needed)

## Troubleshooting

### CI Fails on `dev`
- Check the workflow run logs in GitHub Actions
- Ensure all tests pass locally: `pnpm test`
- Verify linting: `pnpm lint`
- Confirm type checking: `pnpm check-types`

### Release PR Not Created
- Verify changesets exist: `ls .changeset/*.md`
- Check `release.yml` workflow logs
- Ensure `baseBranch` is set to `dev` in `.changeset/config.json`

### Publish Workflow Doesn't Trigger
- Verify tag format matches `v*.*.*` (e.g., `v1.0.0`)
- Check tag was pushed: `git push origin v1.0.0`
- Review `publish.yml` workflow logs

### Security Audit Failures
- Review `pnpm audit` output locally
- Update vulnerable dependencies: `pnpm update`
- For false positives, consider overrides in `package.json`

## Migration Notes

This workflow was implemented on **January 26, 2026** to address [Issue #24](https://github.com/haitchstubbs/haitchUI/issues/24).

### Changes from Previous Setup
- **New `dev` branch**: Primary development branch (previously only `main` existed)
- **New CI workflow**: Automated quality checks on every PR
- **Split release workflow**: Release PRs created on `dev`, publishing happens on tag push
- **New security workflow**: Weekly vulnerability scanning
- **Stricter `main` protection**: Now requires 2 reviews and only accepts release commits

### Next Steps After Implementation
1. Update default branch to `dev` in GitHub repository settings
2. Configure required status checks in branch protection (if not using rulesets)
3. Update team documentation and contributor guidelines
4. Train team members on new release process
