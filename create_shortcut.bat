@echo off
setlocal
set "ROOT=%~dp0"
set "TMPVBS=%TEMP%\\mklnk_%RANDOM%.vbs"
echo Set sh = CreateObject("WScript.Shell") > "%TMPVBS%"
echo Set fso = CreateObject("Scripting.FileSystemObject") >> "%TMPVBS%"
echo root = WScript.Arguments(0) >> "%TMPVBS%"
echo shortcutName = WScript.Arguments(1) >> "%TMPVBS%"
echo batPath = fso.BuildPath(root, "milestone.bat") >> "%TMPVBS%"
echo iconPath = fso.BuildPath(root, "milestone.ico") >> "%TMPVBS%"
echo desktop = sh.SpecialFolders("Desktop") >> "%TMPVBS%"
echo Set sc1 = sh.CreateShortcut(fso.BuildPath(desktop, shortcutName)) >> "%TMPVBS%"
echo sc1.TargetPath = batPath >> "%TMPVBS%"
echo sc1.WorkingDirectory = root >> "%TMPVBS%"
echo If fso.FileExists(iconPath) Then sc1.IconLocation = iconPath >> "%TMPVBS%"
echo sc1.Save >> "%TMPVBS%"
echo Set sc2 = sh.CreateShortcut(fso.BuildPath(root, shortcutName)) >> "%TMPVBS%"
echo sc2.TargetPath = batPath >> "%TMPVBS%"
echo sc2.WorkingDirectory = root >> "%TMPVBS%"
echo If fso.FileExists(iconPath) Then sc2.IconLocation = iconPath >> "%TMPVBS%"
echo sc2.Save >> "%TMPVBS%"
cscript //nologo "%TMPVBS%" "%ROOT%" "Milestone.lnk"
set "DESKTOP=%UserProfile%\Desktop"
if exist "%DESKTOP%\Milestone.lnk" (
  echo [OK] 桌面快捷方式已创建："%DESKTOP%\Milestone.lnk"
) else (
  echo [FAIL] 未在桌面创建快捷方式
)
if exist "%ROOT%Milestone.lnk" (
  echo [OK] 当前目录快捷方式已创建："%ROOT%Milestone.lnk"
) else (
  echo [FAIL] 未在当前目录创建快捷方式
)
del /q "%TMPVBS%" >nul 2>nul
endlocal

