#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Script: setup-azure-oidc.sh
# Purpose: Configure Azure Workload Identity Federation (OIDC) for GitHub Actions
# ==============================================================================

REPO="bilal-gillani/luxestore-github-actions"
APP_NAME="sp-luxestore-github-actions"
RESOURCE_GROUP="rg-bilal-gillani-cicd"

echo "👉 Checking Azure CLI authentication..."
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
TENANT_ID=$(az account show --query tenantId -o tsv)

echo "Connected to Subscription: $SUBSCRIPTION_ID"
echo "Tenant ID: $TENANT_ID"

echo "👉 1. Creating Entra ID Application Registration ($APP_NAME)..."
APP_ID=$(az ad app list --display-name "$APP_NAME" --query "[0].appId" -o tsv)
if [ -z "$APP_ID" ]; then
  APP_ID=$(az ad app create --display-name "$APP_NAME" --query appId -o tsv)
  echo "✅ Created App: $APP_ID"
else
  echo "ℹ️ App already exists: $APP_ID"
fi

echo "👉 2. Ensuring Service Principal exists..."
SP_ID=$(az ad sp list --filter "appId eq '$APP_ID'" --query "[0].id" -o tsv)
if [ -z "$SP_ID" ]; then
  SP_ID=$(az ad sp create --id "$APP_ID" --query id -o tsv)
  echo "✅ Created Service Principal: $SP_ID"
else
  echo "ℹ️ Service Principal already exists: $SP_ID"
fi

echo "👉 3. Creating Federated Identity Credential for GitHub Actions (main branch)..."
FED_NAME="github-actions-main"
EXISTING_FED=$(az ad app federated-credential list --id "$APP_ID" --query "[?name=='$FED_NAME'].id" -o tsv)

if [ -z "$EXISTING_FED" ]; then
  az ad app federated-credential create --id "$APP_ID" --parameters "{
    \"name\": \"$FED_NAME\",
    \"issuer\": \"https://token.actions.githubusercontent.com\",
    \"subject\": \"repo:$REPO:ref:refs/heads/main\",
    \"description\": \"GitHub Actions OIDC for main branch\",
    \"audiences\": [\"api://AzureADTokenExchange\"]
  }"
  echo "✅ Federated Identity Credential created for main branch."
else
  echo "ℹ️ Federated Identity Credential already exists."
fi

# Also add PR federated credential if PR workflows will run against Azure
FED_PR_NAME="github-actions-pr"
EXISTING_PR_FED=$(az ad app federated-credential list --id "$APP_ID" --query "[?name=='$FED_PR_NAME'].id" -o tsv)
if [ -z "$EXISTING_PR_FED" ]; then
  az ad app federated-credential create --id "$APP_ID" --parameters "{
    \"name\": \"$FED_PR_NAME\",
    \"issuer\": \"https://token.actions.githubusercontent.com\",
    \"subject\": \"repo:$REPO:pull_request\",
    \"description\": \"GitHub Actions OIDC for pull requests\",
    \"audiences\": [\"api://AzureADTokenExchange\"]
  }"
  echo "✅ Federated Identity Credential created for pull requests."
fi

echo "👉 4. Assigning Roles on Resource Group ($RESOURCE_GROUP)..."
RG_ID=$(az group show --name "$RESOURCE_GROUP" --query id -o tsv)

echo "Assigning Contributor role..."
az role assignment create \
  --assignee-object-id "$SP_ID" \
  --assignee-principal-type "ServicePrincipal" \
  --role "Contributor" \
  --scope "$RG_ID" || true

echo "Assigning Role Based Access Control Administrator role (required to grant AcrPull)..."
az role assignment create \
  --assignee-object-id "$SP_ID" \
  --assignee-principal-type "ServicePrincipal" \
  --role "Role Based Access Control Administrator" \
  --scope "$RG_ID" || true

echo ""
echo "=============================================================================="
echo "🎉 Setup Complete! Configure the following in your GitHub Repository Settings:"
echo "=============================================================================="
echo "Settings -> Secrets and variables -> Actions"
echo ""
echo "[Repository Secrets]"
echo "AZURE_CLIENT_ID       : $APP_ID"
echo "AZURE_TENANT_ID       : $TENANT_ID"
echo "AZURE_SUBSCRIPTION_ID : $SUBSCRIPTION_ID"
echo "MYSQL_ADMIN_PASSWORD  : <Your secure MySQL admin password>"
echo "APP_DB_PASSWORD       : <Your secure application user password>"
echo "JWT_SECRET            : <Your random 32+ character JWT secret>"
echo ""
echo "[Repository Variables]"
echo "AZURE_RESOURCE_GROUP  : $RESOURCE_GROUP"
echo "ACR_NAME              : acrazdevops1029"
echo "=============================================================================="
