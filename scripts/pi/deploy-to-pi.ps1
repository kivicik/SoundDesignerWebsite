param(
    [Parameter(Mandatory = $true)]
    [string]$PiHost,
    [string]$PiUser = "pi",
    [string]$RemoteRoot = "/var/www/sounddesigner",
    [string]$LocalBuildPath = ""
)

$ErrorActionPreference = "Stop"

function Require-Command([string]$Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' was not found in PATH."
    }
}

Require-Command "ssh"
Require-Command "scp"
Require-Command "tar"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..\..")

if ([string]::IsNullOrWhiteSpace($LocalBuildPath)) {
    $trackedBuild = Join-Path $repoRoot "_site\agency-jekyll-theme-gh-pages"
    $legacyLocalBuild = Join-Path $repoRoot "agency-jekyll-theme-gh-pages\_site"

    if (Test-Path (Join-Path $trackedBuild "index.html")) {
        $LocalBuildPath = $trackedBuild
    } else {
        if (Test-Path (Join-Path $legacyLocalBuild "index.html")) {
            Write-Host "Using legacy local build path '$legacyLocalBuild' (this can be stale if not regenerated)."
            $LocalBuildPath = $legacyLocalBuild
        } else {
            $LocalBuildPath = $trackedBuild
        }
    }
}

$localResolved = (Resolve-Path $LocalBuildPath).Path
if (-not (Test-Path (Join-Path $localResolved "index.html"))) {
    throw "Local build path '$localResolved' does not look like a built website (missing index.html)."
}

$remote = "$PiUser@$PiHost"
$release = Get-Date -Format "yyyyMMddHHmmss"
$remoteRelease = "$RemoteRoot/releases/$release"
$remoteArchive = "/tmp/sounddesigner-$release.tar"
$localArchive = Join-Path $env:TEMP "sounddesigner-$release.tar"

Write-Host "Preparing remote release directory on $remote ..."
$prepareCmd = "set -euo pipefail; mkdir -p '$RemoteRoot/releases' '$RemoteRoot/data'; mkdir -p '$remoteRelease'"
ssh $remote $prepareCmd
if ($LASTEXITCODE -ne 0) {
    throw "Failed to prepare release folder on the Pi."
}

Write-Host "Uploading '$localResolved' ..."
tar -C $localResolved -cf $localArchive .
if ($LASTEXITCODE -ne 0) {
    throw "Failed to create local archive."
}

scp $localArchive "$remote`:$remoteArchive"
if ($LASTEXITCODE -ne 0) {
    Remove-Item -Force $localArchive -ErrorAction SilentlyContinue
    throw "Failed to upload archive to the Pi."
}

$deployCmd = @"
set -euo pipefail
tar -xf '$remoteArchive' -C '$remoteRelease'
rm -f '$remoteArchive'
# Ensure nginx can always read deployed files.
chmod -R u=rwX,go=rX '$remoteRelease'
# Keep compatibility with Jekyll baseurl '/agency-jekyll-theme-gh-pages'.
ln -sfn . '$remoteRelease/agency-jekyll-theme-gh-pages'
# If bootstrap created "current" as a real directory, replace it with a symlink.
if [ -d '$RemoteRoot/current' ] && [ ! -L '$RemoteRoot/current' ]; then
  rm -rf '$RemoteRoot/current'
fi
ln -sfn '$remoteRelease' '$RemoteRoot/current'
# Keep only the 5 most recent releases.
ls -1dt '$RemoteRoot'/releases/* 2>/dev/null | tail -n +6 | xargs -r rm -rf
"@

ssh $remote $deployCmd
Remove-Item -Force $localArchive -ErrorAction SilentlyContinue
if ($LASTEXITCODE -ne 0) {
    throw "Deploy failed while extracting archive on the Pi."
}

Write-Host ""
Write-Host "Deploy complete."
Write-Host "Active release: $remoteRelease"
Write-Host "Open: http://$PiHost/"
