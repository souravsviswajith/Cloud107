<#
.SYNOPSIS
Applies the hardware optimization layer for maximum performance and low latency.
#>

Write-Host "Setting High Performance Power Plan..."
powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c

Write-Host "Disabling Windows Search Indexer..."
Stop-Service -Name WSearch -Force
Set-Service -Name WSearch -StartupType Disabled

Write-Host "Disabling Telemetry & Data Collection..."
Set-Service -Name DiagTrack -StartupType Disabled
Set-Service -Name dmwappushservice -StartupType Disabled
reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows\DataCollection" /v AllowTelemetry /t REG_DWORD /d 0 /f

Write-Host "Disabling Background Defragmentation..."
Disable-ScheduledTask -TaskPath "\Microsoft\Windows\Defrag\" -TaskName "ScheduledDefrag"

Write-Host "Optimizing Network TCP/IP for Low Latency..."
Set-NetTCPSetting -SettingName InternetCustom -AutoTuningLevelLocal Disabled
Set-NetTCPSetting -SettingName InternetCustom -ScalingHeuristics Disabled
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces" /v TcpAckFrequency /t REG_DWORD /d 1 /f
reg add "HKLM\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\Interfaces" /v TCPNoDelay /t REG_DWORD /d 1 /f

Write-Host "Enabling Hardware Accelerated GPU Scheduling (HAGS)..."
reg add "HKLM\SYSTEM\CurrentControlSet\Control\GraphicsDrivers" /v HwSchMode /t REG_DWORD /d 2 /f

Write-Host "Phase 4 Complete."
