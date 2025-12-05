@echo off
setlocal
set "ROOT=%~dp0"
set "ROOT=%ROOT:\=/%"
set "TARGET=file:///%ROOT%landing.html"

set "CHROME_EXE="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if "%CHROME_EXE%"=="" (
  start chrome --new-window --start-fullscreen --allow-file-access-from-files --app="%TARGET%"
) else (
  "%CHROME_EXE%" --new-window --start-fullscreen --allow-file-access-from-files --app="%TARGET%"
)
endlocal
