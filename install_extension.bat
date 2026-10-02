@echo off
title Installing Joseph's Sentinel...
color 0A
cls

echo ================================================================
echo   Joseph's Sentinel - 1-Click Installer
echo ================================================================
echo.

set TARGET_DIR=%LOCALAPPDATA%\JoysPhishingShield
echo [1/4] Setting up extension directory...
if not exist "%TARGET_DIR%"          mkdir "%TARGET_DIR%"
if not exist "%TARGET_DIR%\utils"    mkdir "%TARGET_DIR%\utils"
if not exist "%TARGET_DIR%\content"  mkdir "%TARGET_DIR%\content"
if not exist "%TARGET_DIR%\blocked"  mkdir "%TARGET_DIR%\blocked"
if not exist "%TARGET_DIR%\popup"    mkdir "%TARGET_DIR%\popup"
if not exist "%TARGET_DIR%\icons"    mkdir "%TARGET_DIR%\icons"

echo [2/4] Copying core extension files...
xcopy "%~dp0..\manifest.json"    "%TARGET_DIR%\"        /Y /Q >nul 2>&1
xcopy "%~dp0..\background.js"   "%TARGET_DIR%\"        /Y /Q >nul 2>&1

echo [3/4] Copying security modules, popup, and icons...
xcopy "%~dp0..\utils\*"         "%TARGET_DIR%\utils\"   /Y /Q >nul 2>&1
xcopy "%~dp0..\content\*"       "%TARGET_DIR%\content\" /Y /Q >nul 2>&1
xcopy "%~dp0..\blocked\*"       "%TARGET_DIR%\blocked\" /Y /Q >nul 2>&1
xcopy "%~dp0..\popup\*"         "%TARGET_DIR%\popup\"   /Y /Q >nul 2>&1
xcopy "%~dp0..\icons\*"         "%TARGET_DIR%\icons\"   /Y /Q >nul 2>&1

if not exist "%TARGET_DIR%\manifest.json" (
    echo [WARNING] Could not find extension files relative to this script.
    echo Please make sure this .bat file is inside the website folder
    echo and the extension files are in the parent directory.
    pause
    exit /b 1
)

echo [4/4] Launching browser with extension loaded...

set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
set CHROME_PATH_X86="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
set EDGE_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

set WEBSITE_PATH="%~dp0index.html"

if exist %CHROME_PATH% (
    echo    Launching Google Chrome with Extension Loaded...
    start "" %CHROME_PATH% --load-extension="%TARGET_DIR%" %WEBSITE_PATH%
    goto SUCCESS
)

if exist %CHROME_PATH_X86% (
    echo    Launching Google Chrome (x86) with Extension Loaded...
    start "" %CHROME_PATH_X86% --load-extension="%TARGET_DIR%" %WEBSITE_PATH%
    goto SUCCESS
)

if exist %EDGE_PATH% (
    echo    Launching Microsoft Edge with Extension Loaded...
    start "" %EDGE_PATH% --load-extension="%TARGET_DIR%" %WEBSITE_PATH%
    goto SUCCESS
)

echo    No supported browser found. Opening extension folder manually...
explorer "%TARGET_DIR%"

:SUCCESS
echo.
echo ================================================================
echo   [SUCCESS] Joseph's Sentinel Installed and Active in your Browser!
echo ================================================================
echo.
pause
