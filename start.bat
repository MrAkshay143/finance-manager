@echo off
echo Starting Finance Manager Application...
echo.

REM Check if the user has PHP installed
where php >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: PHP is not installed or not in PATH.
    echo Please install PHP and make sure it's in your system PATH.
    goto :end
)

REM Check if the user has Node.js installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js and make sure it's in your system PATH.
    goto :end
)

echo Starting PHP Backend Server...
start cmd /k "title Finance Manager Backend & php -S localhost:8000 -t backend"

echo Waiting for backend to initialize...
timeout /t 3 /nobreak > nul

echo Starting Next.js Frontend...
start cmd /k "title Finance Manager Frontend & cd frontend && npm run dev"

echo.
echo Finance Manager is starting up!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window. The application will continue running.
echo To stop the application, close the backend and frontend terminal windows.

:end
pause > nul 