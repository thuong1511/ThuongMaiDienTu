@echo off
echo Starting EXED Backend Server...
echo.

cd BE

echo Checking if gradlew exists...
if not exist gradlew.bat (
    echo ERROR: gradlew.bat not found!
    echo Please make sure you are in the correct directory.
    pause
    exit /b 1
)

echo.
echo Starting Spring Boot application...
echo Backend will be available at: http://localhost:8080
echo.

call gradlew.bat bootRun

pause
