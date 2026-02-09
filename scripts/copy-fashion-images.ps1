# Script pour copier les images de mode dans public/fashion/
# Utilisation: .\scripts\copy-fashion-images.ps1

$fashionDir = Join-Path $PSScriptRoot "..\public\fashion"
$assetsDir = "$env:USERPROFILE\.cursor\projects\c-Users-Admin-Desktop-MEDIA-BIANGORY-CURSOR-V1\assets"

# Créer le dossier fashion s'il n'existe pas
if (-not (Test-Path $fashionDir)) {
    New-Item -ItemType Directory -Path $fashionDir -Force | Out-Null
    Write-Host "✓ Dossier créé: $fashionDir" -ForegroundColor Green
}

Write-Host "Recherche des images dans: $assetsDir" -ForegroundColor Cyan

# Chercher les images par leurs IDs uniques
$imagePatterns = @(
    @{ id = "cb570831"; dest = "fashion-1.png" }
    @{ id = "069cdbaa"; dest = "fashion-2.png" }
    @{ id = "c7ee5196"; dest = "fashion-3.png" }
    @{ id = "4fe0953f"; dest = "fashion-4.png" }
    @{ id = "2c745b26"; dest = "fashion-5.png" }
)

$copied = 0
foreach ($pattern in $imagePatterns) {
    $found = Get-ChildItem -Path $assetsDir -Recurse -Filter "*.png" -ErrorAction SilentlyContinue | 
        Where-Object { $_.Name -like "*$($pattern.id)*" } | 
        Select-Object -First 1
    
    if ($found) {
        $destPath = Join-Path $fashionDir $pattern.dest
        Copy-Item $found.FullName $destPath -Force
        Write-Host "✓ Copié: $($pattern.dest)" -ForegroundColor Green
        $copied++
    } else {
        Write-Host "✗ Non trouvé: $($pattern.dest) (ID: $($pattern.id))" -ForegroundColor Yellow
    }
}

Write-Host "`n$copied / $($imagePatterns.Count) images copiées" -ForegroundColor $(if ($copied -eq $imagePatterns.Count) { "Green" } else { "Yellow" })

if ($copied -lt $imagePatterns.Count) {
    Write-Host "`nPour copier manuellement:" -ForegroundColor Cyan
    Write-Host "1. Trouvez vos 5 images de mode" -ForegroundColor White
    Write-Host "2. Copiez-les dans: $fashionDir" -ForegroundColor White
    Write-Host "3. Renommez-les: fashion-1.png, fashion-2.png, ..., fashion-5.png" -ForegroundColor White
}
