@echo off
echo ========================================
echo   Installation Workflow n8n OUTFITY
echo ========================================
echo.

REM Vérifier si n8n est accessible
echo [1/3] Verification de n8n...
curl -s http://localhost:5678/healthz >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: n8n n'est pas accessible sur http://localhost:5678
    echo Veuillez demarrer n8n d'abord.
    pause
    exit /b 1
)
echo ✓ n8n est accessible

echo.
echo [2/3] Ouverture de n8n dans votre navigateur...
start http://localhost:5678/projects/xrnXWKIaxWRXPZpV/workflows

echo.
echo [3/3] Instructions:
echo.
echo Dans n8n qui vient de s'ouvrir:
echo   1. Cliquez sur le bouton "+" (Nouveau workflow)
echo   2. Cliquez sur les 3 points (...) en haut a droite
echo   3. Selectionnez "Import from File"
echo   4. Choisissez le fichier: n8n-workflow-outfity-scraper.json
echo   5. Le workflow complet apparaitra!
echo.
echo Ensuite:
echo   6. Double-cliquez sur le noeud "Envoyer vers OUTFITY"
echo   7. Changez l'URL vers: http://localhost:3000/api/webhooks/n8n-trend-save
echo   8. Cliquez sur "Save"
echo   9. Cliquez sur "Execute Workflow" pour tester
echo.
echo ========================================
echo   Configuration terminee!
echo ========================================
pause
