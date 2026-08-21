@echo off
setlocal
cd /d "%~dp0"

if "%GEMINI_API_KEY%"=="" (
  echo GEMINI_API_KEY is not set.
  echo.
  echo Example:
  echo   set GEMINI_API_KEY=YOUR_KEY_HERE
  echo.
  pause
  exit /b 1
)

where python >nul 2>nul
if errorlevel 1 (
  echo Python was not found in PATH.
  pause
  exit /b 1
)

python -m pip install -r requirements.txt
if errorlevel 1 (
  echo Dependency installation failed.
  pause
  exit /b 1
)

python generate_dialogue_art.py --output generated_dialogue_art
if errorlevel 1 (
  echo Generation failed.
  pause
  exit /b 1
)

echo.
echo STARWARS_DELTA DIALOGUE ART GENERATION COMPLETE
echo Output folder:
echo   %CD%\generated_dialogue_art
echo.
pause
