@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
if errorlevel 1 (
    echo 无法进入项目文件夹，请检查文件是否完整。
    pause
    exit /b 1
)
node --version >nul 2>&1
if errorlevel 1 (
    echo 未找到 Node.js。请安装 Node.js 18 或更新版本，然后重新双击本文件。
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)
node "scripts\start-local.cjs"
if errorlevel 1 (
    echo.
    echo 启动失败，请查看上方提示。
    pause
    exit /b 1
)
