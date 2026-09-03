[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$manifestPath = Join-Path $repoRoot 'manifest.json'
$manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
$version = [string]$manifest.version
$distPath = Join-Path $repoRoot 'dist'
$outputPath = Join-Path $distPath ("facet-browser-extension-v{0}.zip" -f $version)
$stagePath = Join-Path ([System.IO.Path]::GetTempPath()) ("facet-extension-{0}" -f [guid]::NewGuid().ToString('N'))

$files = @(
    'manifest.json',
    'popup.html',
    'popup.js',
    'core.js',
    'icons\icon16.png',
    'icons\icon48.png',
    'icons\icon128.png'
)

New-Item -ItemType Directory -Force -Path $distPath | Out-Null
New-Item -ItemType Directory -Path $stagePath | Out-Null

try {
    foreach ($relativePath in $files) {
        $sourcePath = Join-Path $repoRoot $relativePath
        if (-not (Test-Path -LiteralPath $sourcePath)) {
            throw "Missing extension file: $relativePath"
        }
        $targetPath = Join-Path $stagePath $relativePath
        New-Item -ItemType Directory -Force -Path (Split-Path $targetPath -Parent) | Out-Null
        Copy-Item -LiteralPath $sourcePath -Destination $targetPath -Force
    }

    if (Test-Path -LiteralPath $outputPath) {
        [System.IO.File]::Delete($outputPath)
    }
    Compress-Archive -Path (Join-Path $stagePath '*') -DestinationPath $outputPath -CompressionLevel Optimal
}
finally {
    if (Test-Path -LiteralPath $stagePath) {
        [System.IO.Directory]::Delete($stagePath, $true)
    }
}

$archive = Get-Item -LiteralPath $outputPath
Write-Output ("Built {0} ({1} bytes)" -f $archive.FullName, $archive.Length)
