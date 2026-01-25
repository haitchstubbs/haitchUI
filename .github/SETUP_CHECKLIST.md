# Post-Implementation Setup Checklist

This checklist outlines the manual steps required to complete the CI/CD workflow setup after pushing the code changes.

## ✅ Completed
- [x] Created `dev` branch
- [x] Added CI workflow (`.github/workflows/ci.yml`)
- [x] Updated release workflow (`.github/workflows/release.yml`)
- [x] Added publish workflow (`.github/workflows/publish.yml`)
- [x] Added security scanning workflow (`.github/workflows/security.yml`)
- [x] Created dev branch ruleset (`.github/rulesets/dev-branch-protection.json`)
- [x] Updated main branch ruleset (`.github/rulesets/main-branch-protection.json`)
- [x] Updated changesets configuration
- [x] Pushed changes to `dev` branch

## ⚠️ Required Manual Steps in GitHub UI

### 1. Change Default Branch to `dev`
**Location**: Repository Settings → General → Default branch

1. Go to `https://github.com/haitchstubbs/haitchUI/settings`
2. Under "Default branch", click the switch icon
3. Select `dev` from the dropdown
4. Click "Update" and confirm

**Why**: Sets `dev` as the primary branch for new PRs and clones.

---

### 2. Apply Branch Rulesets
**Location**: Repository Settings → Rules → Rulesets

The ruleset JSON files have been committed, but GitHub rulesets must be created through the UI:

#### Dev Branch Ruleset
1. Go to `https://github.com/haitchstubbs/haitchUI/settings/rules`
2. Click "New ruleset" → "New branch ruleset"
3. Name: `Dev Branch Protection`
4. Target branches: `dev`
5. Branch protections:
   - ✅ Require pull request before merging (1 approval)
   - ✅ Require status checks: `Lint`, `Type Check`, `Build`, `Test`, `Security Audit`
   - ✅ Require conversation resolution
   - ✅ Require linear history
   - ✅ Block force pushes
6. Save ruleset

#### Main Branch Ruleset (Update Existing)
1. Find the existing "PRs & conventional commits" ruleset
2. Edit it or create a new one:
   - Name: `Main Branch - Release Only`
   - Target: `main` (default branch)
   - Require pull request: 2 approvals
   - Require conversation resolution
   - Require status checks (if applicable)
   - Block force pushes
3. Save changes

**Why**: Rulesets JSON files are for version control only; GitHub requires UI/API configuration.

---

### 3. Enable GitHub Actions Permissions
**Location**: Repository Settings → Actions → General

1. Go to `https://github.com/haitchstubbs/haitchUI/settings/actions`
2. Under "Workflow permissions":
   - Select "Read and write permissions"
   - ✅ Enable "Allow GitHub Actions to create and approve pull requests"
3. Click "Save"

**Why**: The `publish.yml` workflow needs to create PRs to merge releases to `main`.

---

### 4. Configure npm Token Secret
**Location**: Repository Settings → Secrets and variables → Actions

1. Go to `https://github.com/haitchstubbs/haitchUI/settings/secrets/actions`
2. Click "New repository secret"
3. Name: `NPM_TOKEN`
4. Value: Your npm authentication token with publish access
5. Click "Add secret"

**To generate npm token**:
```bash
npm login
npm token create --type=automation
```

**Why**: Required for publishing packages to npm registry.

---

### 5. Enable CodeQL and Security Features
**Location**: Repository Settings → Security → Code security and analysis

1. Go to `https://github.com/haitchstubbs/haitchUI/settings/security_analysis`
2. Enable:
   - ✅ Dependency graph (should be enabled)
   - ✅ Dependabot alerts
   - ✅ Dependabot security updates
   - ✅ Secret scanning
   - ✅ Code scanning (CodeQL)
3. For CodeQL, select "Advanced" and use the workflow in `.github/workflows/security.yml`

**Why**: Provides automated vulnerability detection and security alerts.

---

### 6. Update Repository Description and Topics
**Location**: Repository main page → About section

1. Add description: "Modern, accessible React UI component library"
2. Add topics: `react`, `typescript`, `ui-components`, `accessibility`, `monorepo`
3. Add link to documentation site (if available)

**Why**: Improves repository discoverability.

---

### 7. Create Initial GitHub Projects (Optional)
**Location**: Repository → Projects tab

Create project boards for:
- **Roadmap**: High-level features and milestones
- **Bug Triage**: Track and prioritize issues
- **Release Planning**: Coordinate releases

**Why**: Improves project management and transparency.

---

## 🎯 Testing the Workflow

After completing the manual steps, test the workflow:

### Test 1: CI on PR to `dev`
```bash
git checkout dev
git pull origin dev
git checkout -b test/ci-workflow
echo "test" >> README.md
git add README.md
git commit -m "test: verify CI workflow"
git push origin test/ci-workflow
```
1. Open PR to `dev` on GitHub
2. Verify all CI checks run (Lint, Type Check, Build, Test, Security Audit)
3. Verify 1 review is required
4. Close PR without merging

### Test 2: Release PR Creation
```bash
git checkout dev
pnpm changeset
# Select a package, choose "patch", describe "test changeset"
git add .changeset/
git commit -m "chore: add test changeset"
git push origin dev
```
1. Wait for `release.yml` workflow to run
2. Verify "chore(release): version packages" PR is created
3. Review the PR (do not merge yet)

### Test 3: Manual Tag Push (Dry Run)
```bash
git checkout dev
git tag v0.0.1-test
git push origin v0.0.1-test
```
1. Verify `publish.yml` workflow triggers
2. Check that it attempts to publish (will fail without proper setup)
3. Delete test tag: `git push origin :refs/tags/v0.0.1-test`

---

## 📚 Documentation Updates

Update the following files with the new workflow:
- [ ] `CONTRIBUTING.md` - Add release process section
- [ ] `README.md` - Add badges for CI status
- [ ] Update team wiki/docs with new branching strategy

---

## 🔄 Migration Recommendations

### For Existing Contributors
1. Update local repository:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b dev origin/dev
   git branch --set-upstream-to=origin/dev dev
   ```
2. Read [.github/WORKFLOW.md](.github/WORKFLOW.md) for the new release process

### For Open Pull Requests
1. Update PR target from `main` to `dev`
2. Resolve conflicts with updated base branch
3. Request re-review

---

## 📞 Support

If you encounter issues during setup:
1. Review workflow logs: `https://github.com/haitchstubbs/haitchUI/actions`
2. Check [.github/WORKFLOW.md](.github/WORKFLOW.md) for troubleshooting
3. Open an issue with the `ci/cd` label

---

**Estimated Time**: 15-20 minutes
**Priority**: High - Required for automated releases and CI checks
