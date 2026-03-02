# Run as Administrator to register the scheduled task

$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodePath = (Get-Command node).Source

$action = New-ScheduledTaskAction `
    -Execute $nodePath `
    -Argument "bug-notifier.js" `
    -WorkingDirectory $projectDir

$trigger = New-ScheduledTaskTrigger `
    -Once `
    -At (Get-Date) `
    -RepetitionInterval (New-TimeSpan -Minutes 30) `
    -RepetitionDuration (New-TimeSpan -Days 365)

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable

Register-ScheduledTask `
    -TaskName "BugMissYouNotifier" `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description "Checks if Bug misses Jesse and sends a push notification via ntfy.sh" `
    -Force

Write-Host "Scheduled task 'BugMissYouNotifier' registered! Runs every 30 minutes."
