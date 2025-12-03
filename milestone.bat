@echo off
setlocal
set TARGET=file:///d:/denv/Milestone/index.html

set CHROME_EXE=
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set CHROME_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set CHROME_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe
if "%CHROME_EXE%"=="" (
  start chrome --new-window --start-fullscreen --app="%TARGET%"
) else (
  "%CHROME_EXE%" --new-window --start-fullscreen --app="%TARGET%"
)
endlocal
