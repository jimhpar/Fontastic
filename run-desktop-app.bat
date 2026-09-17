@echo off
title Fontastic Desktop App
echo Starting Fontastic Desktop Suite...

:: Ensure backend API is running
powershell -Command "if (-not (Get-Process -Name 'node' -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like '*Fontastic*' })) { Start-Process -NoNewWindow node -ArgumentList 'apps/api/dist/server.js' }"

:: Launch Electron Desktop Window
npx electron apps/desktop/electron/main.cjs
pause
