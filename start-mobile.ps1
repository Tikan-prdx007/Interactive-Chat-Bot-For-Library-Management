# ============================================
# SHELFBOT Mobile Access Launcher
# Run this script to get a mobile-accessible URL
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   SHELFBOT Mobile Launcher" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start the dev server in a new window
Write-Host "Starting SHELFBOT server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev" -WindowStyle Normal

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep 3

# Start cloudflare tunnel and capture output to file
$tunnelFile = "$PSScriptRoot\tunnel_url.txt"
if (Test-Path $tunnelFile) { Remove-Item $tunnelFile }

Write-Host "Starting Cloudflare tunnel..." -ForegroundColor Yellow
$tunnelJob = Start-Job -ScriptBlock {
    param($dir, $file)
    Set-Location $dir
    npx -y cloudflared tunnel --url http://localhost:5050 2>&1 | Tee-Object -FilePath $file
} -ArgumentList $PSScriptRoot, $tunnelFile

# Wait and poll for the URL
Write-Host "Getting your mobile URL (please wait ~15 seconds)..." -ForegroundColor Yellow
$url = $null
$attempts = 0
while (-not $url -and $attempts -lt 20) {
    Start-Sleep 2
    $attempts++
    if (Test-Path $tunnelFile) {
        $url = Get-Content $tunnelFile | Select-String "https://.*trycloudflare\.com" | ForEach-Object { $_.Matches[0].Value } | Select-Object -First 1
    }
}

Write-Host ""
if ($url) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   YOUR MOBILE URL IS READY!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "   $url" -ForegroundColor White -BackgroundColor DarkGreen
    Write-Host ""
    Write-Host "  Open this URL on your phone's browser" -ForegroundColor Green
    Write-Host "  to use the barcode scanner!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Keep this window open to stay active" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host "Could not get URL automatically." -ForegroundColor Red
    Write-Host "Check tunnel_url.txt in your project folder." -ForegroundColor Red
}

# Keep the tunnel job alive
Wait-Job $tunnelJob
