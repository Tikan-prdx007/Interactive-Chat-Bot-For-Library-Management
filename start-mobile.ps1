# ============================================
# BookFLow Mobile Access Launcher
# Starts the server + a fresh Cloudflare tunnel
# and prints the mobile URL reliably.
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BookFLow Mobile Launcher" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Kill any stale cloudflared processes ──────────────────────────────────
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep 1

# ── 2. Make sure the dev server is running ──────────────────────────────────
$serverRunning = Test-NetConnection -ComputerName 127.0.0.1 -Port 5050 -WarningAction SilentlyContinue -InformationLevel Quiet 2>$null
if (-not $serverRunning) {
    Write-Host "Dev server not detected on :5050 — starting it..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev" -WindowStyle Normal
    Write-Host "Waiting for server to start..." -ForegroundColor Yellow
    Start-Sleep 5
} else {
    Write-Host "Dev server already running on :5050 ✓" -ForegroundColor Green
}

# ── 3. Choose cloudflared binary ─────────────────────────────────────────────
$cf = $null
# Prefer local binary if present
if (Test-Path "$PSScriptRoot\cloudflared.exe") {
    $cf = "$PSScriptRoot\cloudflared.exe"
    Write-Host "Using local cloudflared.exe" -ForegroundColor DarkGray
} else {
    # Fall back to npx
    $cf = $null
    Write-Host "Local cloudflared.exe not found, will use npx" -ForegroundColor Yellow
}

# ── 4. Start tunnel and capture output to a UTF-8 log ──────────────────────
$logFile = "$PSScriptRoot\tunnel_live.log"
Remove-Item $logFile -Force -ErrorAction SilentlyContinue

Write-Host "Starting Cloudflare tunnel..." -ForegroundColor Yellow
Write-Host "(This takes ~10-20 seconds)" -ForegroundColor DarkGray
Write-Host ""

if ($cf) {
    $proc = Start-Process -FilePath $cf `
        -ArgumentList "tunnel", "--url", "http://localhost:5050" `
        -RedirectStandardError $logFile `
        -NoNewWindow -PassThru
} else {
    $proc = Start-Process -FilePath "npx" `
        -ArgumentList "-y", "cloudflared", "tunnel", "--url", "http://localhost:5050" `
        -RedirectStandardError $logFile `
        -NoNewWindow -PassThru
}

# ── 5. Poll the metrics API for the URL (most reliable method) ───────────────
$url = $null
$metricsPort = 20241
$attempts    = 0
$maxAttempts = 30   # 30 x 1s = 30s timeout

Write-Host "Waiting for tunnel URL..." -ForegroundColor Yellow

while (-not $url -and $attempts -lt $maxAttempts) {
    Start-Sleep 1
    $attempts++
    Write-Host "." -NoNewline -ForegroundColor DarkGray

    # ── Method A: metrics API (fastest when available) ───────────────────────
    try {
        $metrics = Invoke-WebRequest "http://127.0.0.1:$metricsPort/metrics" `
            -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        $match = [regex]::Match($metrics.Content, 'https://[a-z0-9\-]+\.trycloudflare\.com')
        if ($match.Success) { $url = $match.Value }
    } catch {}

    # ── Method B: scan log file, join wrapped lines, regex ───────────────────
    if (-not $url -and (Test-Path $logFile)) {
        $raw = Get-Content $logFile -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if ($raw) {
            # cloudflared wraps the URL across two lines inside a box — join them
            $joined = $raw -replace "`r`n|`r|`n", " "
            $match  = [regex]::Match($joined, 'https://[a-z0-9\-]+\.trycloudflare\.com')
            if ($match.Success) { $url = $match.Value }
        }
    }
}

Write-Host ""

# ── 6. Display result ─────────────────────────────────────────────────────────
if ($url) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   YOUR MOBILE URL IS READY!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  $url" -ForegroundColor White -BackgroundColor DarkGreen
    Write-Host ""
    Write-Host "  Scan or type this on your phone" -ForegroundColor Green
    Write-Host "  (Works on any device on any network)" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  Keep this window open!" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""

    # Save clean URL to file for easy copy-paste
    $url | Out-File "$PSScriptRoot\MOBILE_URL.txt" -Encoding UTF8 -Force
    Write-Host "  URL also saved to: MOBILE_URL.txt" -ForegroundColor DarkGray
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  Could not get tunnel URL automatically" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Check tunnel_live.log for errors." -ForegroundColor Yellow
    Write-Host "  Common causes:" -ForegroundColor Yellow
    Write-Host "   - No internet connection" -ForegroundColor Yellow
    Write-Host "   - Firewall blocking cloudflared" -ForegroundColor Yellow
    Write-Host "   - Try running as Administrator" -ForegroundColor Yellow
}

# Keep alive
if ($proc -and -not $proc.HasExited) {
    Write-Host ""
    Write-Host "Tunnel is running (PID: $($proc.Id)). Press Ctrl+C to stop." -ForegroundColor DarkGray
    Wait-Process -Id $proc.Id -ErrorAction SilentlyContinue
}
