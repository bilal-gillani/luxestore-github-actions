# ==============================================================================
# Script: setup-azure-oidc.ps1
# Purpose: Configure Azure Workload Identity Federation (OIDC) for GitHub Actions
# ==============================================================================

$Repo = "bilal-gillani/luxestore-github-actions"
$AppName = "sp-luxestore-github-actions"
$ResourceGroup = "rg-bilal-gillani-cicd"

Write-Host "👉 Checking Azure CLI authentication..." -ForegroundColor Cyan
$SubscriptionId = az account show --query id -o tsv
$TenantId = az account show --query tenantId -o tsv

Write-Host "Connected to Subscription: $SubscriptionId"
Write-Host "Tenant ID: $TenantId"

Write-Host "👉 1. Creating Entra ID Application Registration ($AppName)..." -ForegroundColor Cyan
$AppId = az ad app list --display-name $AppName --query "[0].appId" -o tsv
if (-not $AppId) {
    $AppId = az ad app create --display-name $AppName --query appId -o tsv
    Write-Host "✅ Created App: $AppId" -ForegroundColor Green
} else {
    Write-Host "ℹ️ App already exists: $AppId" -ForegroundColor Yellow
}

Write-Host "👉 2. Ensuring Service Principal exists..." -ForegroundColor Cyan
$SpId = az ad sp list --filter "appId eq '$AppId'" --query "[0].id" -o tsv
if (-not $SpId) {
    $SpId = az ad sp create --id $AppId --query id -o tsv
    Write-Host "✅ Created Service Principal: $SpId" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Service Principal already exists: $SpId" -ForegroundColor Yellow
}

Write-Host "👉 3. Creating Federated Identity Credential for GitHub Actions (main branch)..." -ForegroundColor Cyan
$FedName = "github-actions-main"
$ExistingFed = az ad app federated-credential list --id $AppId --query "[?name=='$FedName'].id" -o tsv

if (-not $ExistingFed) {
    $FedParams = @{
        name = $FedName
        issuer = "https://token.actions.githubusercontent.com"
        subject = "repo:$($Repo):ref:refs/heads/main"
        description = "GitHub Actions OIDC for main branch"
        audiences = @("api://AzureADTokenExchange")
    } | ConvertTo-Json -Compress

    az ad app federated-credential create --id $AppId --parameters $FedParams
    Write-Host "✅ Federated Identity Credential created for main branch." -ForegroundColor Green
} else {
    Write-Host "ℹ️ Federated Identity Credential already exists." -ForegroundColor Yellow
}

$FedPrName = "github-actions-pr"
$ExistingPrFed = az ad app federated-credential list --id $AppId --query "[?name=='$FedPrName'].id" -o tsv
if (-not $ExistingPrFed) {
    $PrFedParams = @{
        name = $FedPrName
        issuer = "https://token.actions.githubusercontent.com"
        subject = "repo:$($Repo):pull_request"
        description = "GitHub Actions OIDC for pull requests"
        audiences = @("api://AzureADTokenExchange")
    } | ConvertTo-Json -Compress

    az ad app federated-credential create --id $AppId --parameters $PrFedParams
    Write-Host "✅ Federated Identity Credential created for pull requests." -ForegroundColor Green
}

Write-Host "👉 4. Assigning Roles on Resource Group ($ResourceGroup)..." -ForegroundColor Cyan
$RgId = az group show --name $ResourceGroup --query id -o tsv

Write-Host "Assigning Contributor role..."
az role assignment create `
    --assignee-object-id $SpId `
    --assignee-principal-type "ServicePrincipal" `
    --role "Contributor" `
    --scope $RgId

Write-Host "Assigning Role Based Access Control Administrator role..."
az role assignment create `
    --assignee-object-id $SpId `
    --assignee-principal-type "ServicePrincipal" `
    --role "Role Based Access Control Administrator" `
    --scope $RgId

Write-Host ""
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "🎉 Setup Complete! Configure the following in your GitHub Repository Settings:" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "Settings -> Secrets and variables -> Actions"
Write-Host ""
Write-Host "[Repository Secrets]" -ForegroundColor Cyan
Write-Host "AZURE_CLIENT_ID       : $AppId"
Write-Host "AZURE_TENANT_ID       : $TenantId"
Write-Host "AZURE_SUBSCRIPTION_ID : $SubscriptionId"
Write-Host "MYSQL_ADMIN_PASSWORD  : <Your secure MySQL admin password>"
Write-Host "APP_DB_PASSWORD       : <Your secure application user password>"
Write-Host "JWT_SECRET            : <Your random 32+ character JWT secret>"
Write-Host ""
Write-Host "[Repository Variables]" -ForegroundColor Cyan
Write-Host "AZURE_RESOURCE_GROUP  : $ResourceGroup"
Write-Host "ACR_NAME              : acrazdevops1029"
Write-Host "==============================================================================" -ForegroundColor Green
