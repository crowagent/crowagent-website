@echo off
REM ===========================================================================
REM  CrowAgent status tracker — http://localhost:8099/
REM
REM  WHY THIS FILE EXISTS. The tracker has been started by hand from an agent
REM  session every time, which means it DIES WITH THAT SESSION. It was killed
REM  during the 2026-08-05 cleanup and the owner lost the board. A tracker you
REM  have to remember to start is one that is down whenever you actually want
REM  it.
REM
REM  TO MAKE IT SURVIVE A REBOOT, register it once as a scheduled task:
REM
REM    schtasks /create /tn "CrowAgent tracker" /sc onlogon ^
REM      /tr "\"C:\Users\bhave\Crowagent Repo\crowagent-website\status\start-tracker.cmd\"" ^
REM      /rl highest /f
REM
REM  Remove it with:  schtasks /delete /tn "CrowAgent tracker" /f
REM
REM  It refreshes the DERIVED platform board first, then serves. The website
REM  board (issues.json) is authored and needs no build step.
REM ===========================================================================

cd /d "%~dp0\.."

echo [tracker] refreshing the derived platform board from the R2.6.2 documents...
node "status\build-platform-board.js"
if errorlevel 1 (
  echo [tracker] WARNING: the platform board could not be regenerated.
  echo [tracker] Serving anyway - the Platform ^& Portal page will show the LAST
  echo [tracker] generated data, or an error if it has never been generated.
)

echo [tracker] serving http://localhost:8099/  (Ctrl+C to stop)
npx --yes http-server status -p 8099 -c-1 --cors
