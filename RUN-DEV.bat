@echo off
cd /d "%~dp0"
echo Starting OmniMind (backend + frontend)...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0RUN-DEV.ps1"
echo.
pause
