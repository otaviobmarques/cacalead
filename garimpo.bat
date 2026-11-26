@echo off
rem Garimpo no Windows:  garimpo.bat [start ^| stop ^| status ^| install]
rem Clique duas vezes para instalar (na primeira vez) e abrir.
setlocal
cd /d "%~dp0"

set "PY="
py -3 -c "import sys; sys.exit(sys.version_info < (3, 9))" >nul 2>&1 && set "PY=py -3"
if defined PY goto :python_ok
python -c "import sys; sys.exit(sys.version_info < (3, 9))" >nul 2>&1 && set "PY=python"
if defined PY goto :python_ok
for /d %%D in ("%LocalAppData%\Programs\Python\Python3*") do if exist "%%D\python.exe" set "PY="%%D\python.exe""
if defined PY goto :python_ok
echo Preciso do Python 3.9 ou mais novo. Baixe em https://www.python.org/downloads/windows/
echo Na instalacao, marque "Add python.exe to PATH" e depois abra este arquivo de novo.
goto :fail

:python_ok
set "CMD=%~1"
if "%CMD%"=="" set "CMD=start"
if /i "%CMD%"=="start" goto :start
if /i "%CMD%"=="stop" goto :stop
if /i "%CMD%"=="status" goto :status
if /i "%CMD%"=="install" goto :install
echo uso: garimpo.bat start ^| stop ^| status ^| install
exit /b 2

:install
%PY% install.py || goto :fail
exit /b 0

:start
if not exist "gateway\bin\gowa.exe" goto :setup
if not exist "vendor\kit\scripts\engine.py" goto :setup
goto :run

:setup
%PY% install.py || goto :fail

:run
title Garimpo
echo Deixe esta janela aberta enquanto usa o Garimpo. Para fechar tudo: parar-garimpo.bat
echo.
set "GARIMPO_OPEN=1"
%PY% garimpo.py || goto :fail
exit /b 0

:stop
%PY% ctl.py stop || goto :fail
exit /b 0

:status
%PY% ctl.py status || goto :fail
exit /b 0

:fail
echo.
pause
exit /b 1
