$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $repoRoot 'output/testing'
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$reportPath = Join-Path $outputDir "smoke-suite-$timestamp.json"
$startedAt = (Get-Date).ToString('o')
$results = @()
$backendHealthUrl = 'http://localhost:3001/api/v1/health'
$frontendHealthUrl = 'http://localhost:3000?locale=en'

function Write-Report {
  param(
    [string]$OverallStatus
  )

  $report = [pscustomobject]@{
    startedAt = $startedAt
    finishedAt = (Get-Date).ToString('o')
    repoRoot = $repoRoot
    overallStatus = $OverallStatus
    steps = $results
  }

  $report | ConvertTo-Json -Depth 6 | Set-Content -Path $reportPath -Encoding UTF8
}

function Assert-Endpoint {
  param(
    [string]$Name,
    [string]$Url
  )

  $stepStarted = Get-Date
  Write-Host "==> $Name"

  try {
    $null = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 5
    $duration = [Math]::Round(((Get-Date) - $stepStarted).TotalSeconds, 2)
    $script:results += [pscustomobject]@{
      name = $Name
      status = 'passed'
      durationSeconds = $duration
      workingDirectory = $repoRoot
      command = $Url
    }
  }
  catch {
    $duration = [Math]::Round(((Get-Date) - $stepStarted).TotalSeconds, 2)
    $script:results += [pscustomobject]@{
      name = $Name
      status = 'failed'
      durationSeconds = $duration
      workingDirectory = $repoRoot
      command = $Url
      error = $_.Exception.Message
    }
    Write-Report -OverallStatus 'failed'
    Write-Host "Smoke suite failed. Report: $reportPath"
    throw
  }
}

function Invoke-Step {
  param(
    [string]$Name,
    [string]$WorkingDirectory,
    [string]$Command
  )

  $stepStarted = Get-Date
  Write-Host "==> $Name"

  try {
    Push-Location $WorkingDirectory
    cmd.exe /c $Command
    if ($LASTEXITCODE -ne 0) {
      throw "Command exited with code $LASTEXITCODE."
    }
    $duration = [Math]::Round(((Get-Date) - $stepStarted).TotalSeconds, 2)
    $script:results += [pscustomobject]@{
      name = $Name
      status = 'passed'
      durationSeconds = $duration
      workingDirectory = $WorkingDirectory
      command = $Command
    }
  }
  catch {
    $duration = [Math]::Round(((Get-Date) - $stepStarted).TotalSeconds, 2)
    $script:results += [pscustomobject]@{
      name = $Name
      status = 'failed'
      durationSeconds = $duration
      workingDirectory = $WorkingDirectory
      command = $Command
      error = $_.Exception.Message
    }

    Write-Report -OverallStatus 'failed'
    Write-Host "Smoke suite failed. Report: $reportPath"
    throw
  }
  finally {
    Pop-Location
  }
}

Assert-Endpoint -Name 'precheck backend health' -Url $backendHealthUrl
Assert-Endpoint -Name 'precheck frontend health' -Url $frontendHealthUrl

Invoke-Step -Name 'backend smoke auth local' -WorkingDirectory (Join-Path $repoRoot 'backend') -Command 'npm.cmd run smoke:auth:local'
Invoke-Step -Name 'backend smoke public catalog' -WorkingDirectory (Join-Path $repoRoot 'backend') -Command 'npm.cmd run smoke:public'
Invoke-Step -Name 'backend smoke admin seed' -WorkingDirectory (Join-Path $repoRoot 'backend') -Command 'npm.cmd run smoke:admin:seed'
Invoke-Step -Name 'backend smoke editorial' -WorkingDirectory (Join-Path $repoRoot 'backend') -Command 'npm.cmd run smoke:editorial'
Invoke-Step -Name 'backend smoke contributions' -WorkingDirectory (Join-Path $repoRoot 'backend') -Command 'npm.cmd run smoke:contributions'
Invoke-Step -Name 'backend smoke contributions negative' -WorkingDirectory (Join-Path $repoRoot 'backend') -Command 'npm.cmd run smoke:contributions:negative'
Invoke-Step -Name 'frontend lint' -WorkingDirectory (Join-Path $repoRoot 'frontend-web') -Command 'npm.cmd run lint'
Invoke-Step -Name 'frontend smoke ui' -WorkingDirectory (Join-Path $repoRoot 'frontend-web') -Command 'npm.cmd run smoke:ui'
Invoke-Step -Name 'frontend smoke backoffice' -WorkingDirectory (Join-Path $repoRoot 'frontend-web') -Command 'npm.cmd run smoke:backoffice'

Write-Report -OverallStatus 'passed'
Write-Host "Smoke suite passed. Report: $reportPath"
