# Script simple pour copier les images de mode
# Utilisation: Glissez-déposez vos images sur ce script, ou modifiez les chemins ci-dessous

Write-Host "=== Script de copie des images de mode ===" -ForegroundColor Cyan
Write-Host ""

$fashionDir = Join-Path $PSScriptRoot "..\public\fashion"

# Créer le dossier s'il n'existe pas
if (-not (Test-Path $fashionDir)) {
    New-Item -ItemType Directory -Path $fashionDir -Force | Out-Null
    Write-Host "✓ Dossier créé: $fashionDir" -ForegroundColor Green
} else {
    Write-Host "✓ Dossier existe déjà: $fashionDir" -ForegroundColor Green
}

Write-Host ""
Write-Host "Pour copier vos images:" -ForegroundColor Yellow
Write-Host "1. Trouvez vos 5 images de mode" -ForegroundColor White
Write-Host "2. Copiez-les manuellement dans:" -ForegroundColor White
Write-Host "   $fashionDir" -ForegroundColor Cyan
Write-Host "3. Renommez-les:" -ForegroundColor White
Write-Host "   - fashion-1.png" -ForegroundColor Gray
Write-Host "   - fashion-2.png" -ForegroundColor Gray
Write-Host "   - fashion-3.png" -ForegroundColor Gray
Write-Host "   - fashion-4.png" -ForegroundColor Gray
Write-Host "   - fashion-5.png" -ForegroundColor Gray
Write-Host ""
Write-Host "Ou utilisez cette commande PowerShell pour ouvrir le dossier:" -ForegroundColor Yellow
Write-Host "   explorer `"$fashionDir`"" -ForegroundColor Cyan
Write-Host ""

# Ouvrir le dossier dans l'explorateur
$response = Read-Host "Voulez-vous ouvrir le dossier maintenant? (O/N)"
if ($response -eq "O" -or $response -eq "o") {
    explorer $fashionDir
    Write-Host "✓ Dossier ouvert!" -ForegroundColor Green
}
