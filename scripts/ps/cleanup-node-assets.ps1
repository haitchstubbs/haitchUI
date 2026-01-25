param (
    [Parameter(Mandatory = $true)]
    [string]$RootPath
)

if (-not (Test-Path $RootPath)) {
    Write-Error "Path does not exist: $RootPath"
    exit 1
}

Write-Host "Cleaning project artifacts under:" $RootPath
Write-Host "-------------------------------------------"

# Directories to remove
$dirsToRemove = @(
    "node_modules",
    "dist",
    ".turbo"
)

foreach ($dir in $dirsToRemove) {
    Get-ChildItem -Path $RootPath -Recurse -Directory -Filter $dir -ErrorAction SilentlyContinue |
        ForEach-Object {
            Write-Host "Removing directory:" $_.FullName
            Remove-Item -Recurse -Force -LiteralPath $_.FullName
        }
}

# Files to remove
$filesToRemove = @(
    "package.json",
    "tsconfig.json",
    "tsup.config.*",
    "LICENSE.md",
    "THIRD_PARTY_LICENSES.md"
)

Get-ChildItem -Path $RootPath -Recurse -File -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -in $filesToRemove -or $_.Name -like "tsup.config.*" } |
    ForEach-Object {
        Write-Host "Removing file:" $_.FullName
        Remove-Item -Force -LiteralPath $_.FullName
    }

Write-Host "Cleanup complete."
