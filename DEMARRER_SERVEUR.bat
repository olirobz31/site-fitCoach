@echo off
echo Demarrage du serveur local...
echo.
echo Ouvrez votre navigateur et allez sur: http://localhost:8000
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.
python -m http.server 8000
pause
