@description('Location for the App Service resources')
param location string = resourceGroup().location

@description('Name of the App Service Plan')
param appServicePlanName string

@description('SKU name for the App Service Plan')
param appServicePlanSku string = 'B1'

@description('Backend Web App Name')
param backendAppName string

@description('Frontend Web App Name')
param frontendAppName string

@description('ACR Login Server (e.g., acrazdevops1029.azurecr.io)')
param acrLoginServer string

@description('Backend Docker image and tag (e.g. luxestore-backend:latest)')
param backendImage string

@description('Frontend Docker image and tag (e.g. luxestore-frontend:latest)')
param frontendImage string

@description('Resource ID of the User Assigned Managed Identity')
param managedIdentityId string

@description('Client ID of the User Assigned Managed Identity')
param managedIdentityClientId string

@description('MySQL Server FQDN')
param mysqlServerFqdn string

@description('Application Database Username')
param appDbUser string

@secure()
@description('Application Database Password')
param appDbPassword string

@description('Application Database Name')
param appDbName string = 'ecommerce_store'

@secure()
@description('JWT Secret Key')
param jwtSecret string

// 1. Linux App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  kind: 'linux'
  properties: {
    reserved: true
  }
  sku: {
    name: appServicePlanSku
    tier: 'Basic'
  }
}

// 2. Backend Web App (Node.js API container)
resource backendApp 'Microsoft.Web/sites@2023-12-01' = {
  name: backendAppName
  location: location
  kind: 'app,linux,container'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentityId}': {}
    }
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOCKER|${acrLoginServer}/${backendImage}'
      acrUseManagedIdentityCreds: true
      acrUserManagedIdentityID: managedIdentityClientId
      appSettings: [
        {
          name: 'WEBSITES_PORT'
          value: '3000'
        }
        {
          name: 'PORT'
          value: '3000'
        }
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'DB_HOST'
          value: mysqlServerFqdn
        }
        {
          name: 'DB_PORT'
          value: '3306'
        }
        {
          name: 'DB_USER'
          value: appDbUser
        }
        {
          name: 'DB_PASSWORD'
          value: appDbPassword
        }
        {
          name: 'DB_NAME'
          value: appDbName
        }
        {
          name: 'DB_SSL'
          value: 'true'
        }
        {
          name: 'JWT_SECRET'
          value: jwtSecret
        }
        {
          name: 'JWT_EXPIRES_IN'
          value: '7d'
        }
        {
          name: 'CORS_ORIGIN'
          value: 'https://${frontendAppName}.azurewebsites.net'
        }
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'false'
        }
      ]
    }
  }
}

// 3. Frontend Web App (Nginx container)
resource frontendApp 'Microsoft.Web/sites@2023-12-01' = {
  name: frontendAppName
  location: location
  kind: 'app,linux,container'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentityId}': {}
    }
  }
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOCKER|${acrLoginServer}/${frontendImage}'
      acrUseManagedIdentityCreds: true
      acrUserManagedIdentityID: managedIdentityClientId
      appSettings: [
        {
          name: 'WEBSITES_PORT'
          value: '8080'
        }
        {
          name: 'BACKEND_URL'
          value: 'https://${backendApp.properties.defaultHostName}'
        }
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'false'
        }
      ]
    }
  }
}

output backendAppFqdn string = backendApp.properties.defaultHostName
output frontendAppFqdn string = frontendApp.properties.defaultHostName
output backendAppName string = backendApp.name
output frontendAppName string = frontendApp.name
