[CmdletBinding()]
param(
    [ValidateSet('all', 'github', 'chrome', 'edge', 'firefox')]
    [string]$Store = 'all'
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$manifestPath = Join-Path $repoRoot 'manifest.json'
$baseManifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
$version = [string]$baseManifest.version
$distPath = Join-Path $repoRoot 'dist'
$targets = if ($Store -eq 'all') { @('github', 'chrome', 'edge', 'firefox') } else { @($Store) }

$files = @(
    'manifest.json',
    'popup.html',
    'popup.js',
    'core.js',
    'extension-channel.js',
    'icons\icon16.png',
    'icons\icon48.png',
    'icons\icon128.png'
)

New-Item -ItemType Directory -Force -Path $distPath | Out-Null

foreach ($targetStore in $targets) {
    $stagePath = Join-Path ([System.IO.Path]::GetTempPath()) ("facet-extension-{0}-{1}" -f $targetStore, [guid]::NewGuid().ToString('N'))
    $outputPath = Join-Path $distPath ("facet-browser-extension-{0}-v{1}.zip" -f $targetStore, $version)
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

        $channelScript = '(function(root){"use strict";const config=Object.freeze({channel:"' + $targetStore + '"});root.FacetExtensionConfig=config;if(typeof module!=="undefined"&&module.exports)module.exports=config;})(typeof globalThis!=="undefined"?globalThis:this);'
        [System.IO.File]::WriteAllText(
            (Join-Path $stagePath 'extension-channel.js'),
            $channelScript,
            [System.Text.UTF8Encoding]::new($false)
        )

        if ($targetStore -eq 'firefox') {
            $firefoxManifest = Get-Content -Raw -LiteralPath (Join-Path $stagePath 'manifest.json') | ConvertFrom-Json
            $firefoxSettings = [ordered]@{
                gecko = [ordered]@{
                    id = 'facet@stienhardt.com'
                    strict_min_version = '140.0'
                    data_collection_permissions = [ordered]@{
                        required = @('none')
                        optional = @()
                    }
                }
            }
            $firefoxManifest | Add-Member -NotePropertyName browser_specific_settings -NotePropertyValue $firefoxSettings
            $firefoxJson = $firefoxManifest | ConvertTo-Json -Depth 12
            [System.IO.File]::WriteAllText(
                (Join-Path $stagePath 'manifest.json'),
                $firefoxJson,
                [System.Text.UTF8Encoding]::new($false)
            )
        }

        if (Test-Path -LiteralPath $outputPath) {
            [System.IO.File]::Delete($outputPath)
        }
        Compress-Archive -Path (Join-Path $stagePath '*') -DestinationPath $outputPath -CompressionLevel Optimal
        $archive = Get-Item -LiteralPath $outputPath
        Write-Output ("Built {0} ({1} bytes)" -f $archive.FullName, $archive.Length)
    }
    finally {
        if (Test-Path -LiteralPath $stagePath) {
            [System.IO.Directory]::Delete($stagePath, $true)
        }
    }
}
