param (
    [string]$ResourceGroup = "habitflow-rg",
    [string]$Location = "eastus",
    [string]$EnvironmentName = "habitflow-env",
    [string]$AppName = "habitflow-pro"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 [Azure Deploy] Checking Resource Group '$ResourceGroup'..." -ForegroundColor Cyan
az group create --name $ResourceGroup --location $Location -o table

Write-Host "📦 Ensuring Container Apps Environment '$EnvironmentName'..." -ForegroundColor Yellow
az containerapp env create --name $EnvironmentName --resource-group $ResourceGroup --location $Location -o table

Write-Host "🔨 Deploying HabitFlow Pro via 'az containerapp up'..." -ForegroundColor Yellow
az containerapp up `
  --name $AppName `
  --resource-group $ResourceGroup `
  --environment $EnvironmentName `
  --source . `
  --target-port 3001 `
  --ingress external `
  --env-vars NODE_ENV=production PORT=3001

$Fqdn = (az containerapp show --name $AppName --resource-group $ResourceGroup --query "properties.configuration.ingress.fqdn" -o tsv).Trim()
Write-Host "✅ HabitFlow Pro is live on Microsoft Azure: https://$Fqdn" -ForegroundColor Green
