@ECHO off
CD %~dp0

SET LCNAME=tweenjs

ECHO --- %LCNAME% ---
SET /P VERSION=Please enter version number (x.x.x) defaults to 'NEXT' : 
IF "%VERSION%"=="" SET VERSION=NEXT
ECHO.
:While
SET /P COPY=Would you like to copy '%LCNAME%-%VERSION%.min.js' [y/n] defaults to 'y' : 
IF "%COPY%"=="" SET COPY=Y
IF "%COPY%"=="Y" GOTO :Build
IF "%COPY%"=="N" GOTO :Build
IF "%COPY%"=="y" GOTO :Build
IF "%COPY%"=="n" GOTO :Build
GOTO :While

:Build
ECHO.
ECHO Building %LCNAME% version: %VERSION%

node ./build.js --tasks=ALL --os=PC --version=%VERSION% -v

CD ./output_min
ECHO.
IF "%COPY%"=="N" GOTO :Default
IF "%COPY%"=="n" GOTO :Default

ECHO '%LCNAME%-%VERSION%.min.js' was copied to 'lib' folder
MOVE /Y "%LCNAME%-%VERSION%.min.js" "../../lib" > %temp%/deleteme.txt
GOTO :Wait
:Default
ECHO '%LCNAME%-%VERSION%.min.js' was copied to 'build/output' folder 
MOVE /Y "%LCNAME%-%VERSION%.min.js" "../output" > %temp%/deleteme.txt

:Wait
CD ../
RMDIR /S /Q "output_min"
ECHO.
ECHO --- Complete ---
PAUSE