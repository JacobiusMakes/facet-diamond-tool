$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$pluginName = "facet-diamond-size"
$pluginVersion = "0.2.0"
$sourceDir = Join-Path $repoRoot "integrations\wordpress\$pluginName"
$distDir = Join-Path $repoRoot "dist"
$outputZip = Join-Path $distDir "$pluginName-wordpress-$pluginVersion.zip"
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("facet-wordpress-" + [guid]::NewGuid().ToString("N"))
$stageDir = Join-Path $tempRoot $pluginName

if (-not (Test-Path -LiteralPath (Join-Path $sourceDir "facet-diamond-size.php"))) {
    throw "Plugin PHP file is missing."
}
if (-not (Test-Path -LiteralPath (Join-Path $sourceDir "assets\facet-widget.js"))) {
    throw "Bundled component is missing."
}

$php = Get-Content -LiteralPath (Join-Path $sourceDir "facet-diamond-size.php") -Raw
$readme = Get-Content -LiteralPath (Join-Path $sourceDir "README.txt") -Raw
if ($php -notmatch "Version:\s*$([regex]::Escape($pluginVersion))") {
    throw "Plugin header version does not match $pluginVersion."
}
if ($readme -notmatch "Stable tag:\s*$([regex]::Escape($pluginVersion))") {
    throw "WordPress readme stable tag does not match $pluginVersion."
}
if ($php -match "cdn\.jsdelivr\.net|esm\.sh") {
    throw "Remote executable code is not allowed in the WordPress package."
}

New-Item -ItemType Directory -Path $stageDir -Force | Out-Null
New-Item -ItemType Directory -Path $distDir -Force | Out-Null

try {
    Copy-Item -LiteralPath (Join-Path $sourceDir "facet-diamond-size.php") -Destination $stageDir
    Copy-Item -LiteralPath (Join-Path $sourceDir "README.txt") -Destination $stageDir
    Copy-Item -LiteralPath (Join-Path $sourceDir "assets") -Destination $stageDir -Recurse
    Copy-Item -LiteralPath (Join-Path $repoRoot "LICENSE") -Destination (Join-Path $stageDir "LICENSE")

    if (Test-Path -LiteralPath $outputZip) {
        Remove-Item -LiteralPath $outputZip -Force
    }
    Compress-Archive -LiteralPath $stageDir -DestinationPath $outputZip -CompressionLevel Optimal
    Write-Output $outputZip
}
finally {
    if (Test-Path -LiteralPath $tempRoot) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force
    }
}
