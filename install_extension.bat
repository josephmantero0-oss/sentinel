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
xcopy "%~dp0manifest.json"   "%TARGET_DIR%\"        /Y /Q >nul
xcopy "%~dp0background.js"   "%TARGET_DIR%\"        /Y /Q >nul

echo [3/4] Copying security modules, popup, and icons...
xcopy "%~dp0utils\*"         "%TARGET_DIR%\utils\"   /Y /Q >nul
xcopy "%~dp0content\*"       "%TARGET_DIR%\content\" /Y /Q >nul
xcopy "%~dp0blocked\*"       "%TARGET_DIR%\blocked\" /Y /Q >nul
xcopy "%~dp0popup\*"         "%TARGET_DIR%\popup\"   /Y /Q >nul
xcopy "%~dp0icons\*"         "%TARGET_DIR%\icons\"   /Y /Q >nul

echo [4/4] Launching browser with extension loaded...

set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
set CHROME_PATH_X86="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
set EDGE_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

set WEBSITE_PATH="d:\phishing web detector\website\index.html"

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

echo    No supported browser found. Opening extension folder...
explorer "%TARGET_DIR%"

:SUCCESS
echo.
echo ================================================================
echo   [SUCCESS] Joseph's Sentinel Installed and Active in your Browser!
echo ================================================================
echo.
pause
