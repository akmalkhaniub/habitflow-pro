# ==============================================================================
# Cloudflare Tunnel 1-Click Zero-Cost Launcher (Windows PowerShell)
# Exposes HabitFlow Pro at localhost:3001 for live RevenueCat Webhook testing!
# ==============================================================================
param (
    [int]$Port = 3001
)

$ErrorActionPreference = "Stop"

Write-Host "🌐 [Cloudflare Tunnel] Preparing instant public URL for localhost:$Port..." -ForegroundColor Cyan

$cloudflaredCmd = Get-Command cloudflared -ErrorAction SilentlyContinue

if (-not $cloudflaredCmd) {
    $tempDir = Join-Path $env:TEMP "cloudflared"
    if (-not (Test-Path $tempDir)) { New-Item -ItemType Directory -Path $tempDir | Out-Null }
    $exePath = Join-Path $tempDir "cloudflared.exe"

    if (-not (Test-Path $exePath)) {
        Write-Host "⬇️ Downloading standalone cloudflared binary..." -ForegroundColor Yellow
        $url = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
        Invoke-WebRequest -Uri $url -OutFile $exePath
    }
    $cloudflaredCmd = $exePath
} else {
    $cloudflaredCmd = "cloudflared"
}

Write-Host "🚀 Starting Cloudflare Tunnel for http://localhost:$Port..." -ForegroundColor Green
Write-Host "👉 Copy the 'https://*.trycloudflare.com' URL into RevenueCat Dashboard > Project Settings > Webhooks!" -ForegroundColor Cyan

& $cloudflaredCmd tunnel --url "http://localhost:$Port"
