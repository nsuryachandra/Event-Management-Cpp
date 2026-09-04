@echo off
setlocal
cd /d "%~dp0"
echo ========================================================
echo Building Smart Event Crowd and Resource Backend
echo ========================================================

echo [1/2] Compiling SQLite amalgamation with GCC...
gcc -O2 -c third_party/sqlite/sqlite3.c -o sqlite3.o
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] SQLite compilation failed!
    exit /b 1
)

echo [2/2] Compiling and linking C++ Backend Server with G++...
g++ -std=c++17 -Wall -O2 main.cpp database.cpp sqlite3.o -Ithird_party -lws2_32 -o server.exe
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Backend compiled successfully: server.exe
) else (
    echo [ERROR] C++ Server compilation failed!
    exit /b 1
)
endlocal
