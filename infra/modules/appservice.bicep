@description('Location for the App Service resources')
param location string = resourceGroup().location

@description('Name of the Backend App Service Plan')
param backendAppServicePlanName string

@description('SKU name for the Backend App Service Plan')
param backendAppServicePlanSku string = 'S1'

@description('Name of the Frontend App Service Plan')
param frontendAppServicePlanName string

@description('SKU name for the Frontend App Service Plan')
param frontendAppServicePlanSku string = 'S1'

@description('Backend Web App Name')
param backendAppName string

@description('Frontend Web App Name')
param frontendAppName string

@description('ACR Login Server (e.g., acrazdevops1029.azurecr.io)')
param acrLoginServer string

@description('Backend Docker image and tag')
param backendImage string

@description('Frontend Docker image and tag')
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

var backendPlanTier = (startsWith(backendAppServicePlanSku, 'S')
  ? 'Standard'
  : (startsWith(backendAppServicePlanSku, 'P') ? 'PremiumV3' : 'Basic'))
var frontendPlanTier = (startsWith(frontendAppServicePlanSku, 'S')
  ? 'Standard'
  : (startsWith(frontendAppServicePlanSku, 'P') ? 'PremiumV3' : 'Basic'))

// 1. Linux App Service Plan for Backend
resource backendAppServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: backendAppServicePlanName
  location: location
  kind: 'linux'
  properties: {
    reserved: true
  }
  sku: {
    name: backendAppServicePlanSku
    tier: backendPlanTier
  }
}

// 2. Linux App Service Plan for Frontend
resource frontendAppServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: frontendAppServicePlanName
  location: location
  kind: 'linux'
  properties: {
    reserved: true
  }
  sku: {
    name: frontendAppServicePlanSku
    tier: frontendPlanTier
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
    serverFarmId: backendAppServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOCKER|${acrLoginServer}/${backendImage}'
      acrUseManagedIdentityCreds: true
      acrUserManagedIdentityID: managedIdentityClientId
      alwaysOn: true
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

// Sticky settings for Backend App Service (CORS_ORIGIN stays bound to the slot)
resource backendSlotConfig 'Microsoft.Web/sites/config@2023-12-01' = {
  parent: backendApp
  name: 'slotConfigNames'
  properties: {
    appSettingNames: [
      'CORS_ORIGIN'
    ]
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
    serverFarmId: frontendAppServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOCKER|${acrLoginServer}/${frontendImage}'
      acrUseManagedIdentityCreds: true
      acrUserManagedIdentityID: managedIdentityClientId
      alwaysOn: true
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

// Sticky settings for Frontend App Service (BACKEND_URL stays bound to the slot)
resource frontendSlotConfig 'Microsoft.Web/sites/config@2023-12-01' = {
  parent: frontendApp
  name: 'slotConfigNames'
  properties: {
    appSettingNames: [
      'BACKEND_URL'
    ]
  }
}

// 4. Backend Staging Deployment Slot
resource backendStagingSlot 'Microsoft.Web/sites/slots@2023-12-01' = {
  parent: backendApp
  name: 'staging'
  location: location
  kind: 'app,linux,container'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentityId}': {}
    }
  }
  properties: {
    serverFarmId: backendAppServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOCKER|${acrLoginServer}/${backendImage}'
      acrUseManagedIdentityCreds: true
      acrUserManagedIdentityID: managedIdentityClientId
      alwaysOn: true
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
          value: 'https://${frontendAppName}-staging.azurewebsites.net'
        }
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'false'
        }
      ]
    }
  }
}

// 5. Frontend Staging Deployment Slot
resource frontendStagingSlot 'Microsoft.Web/sites/slots@2023-12-01' = {
  parent: frontendApp
  name: 'staging'
  location: location
  kind: 'app,linux,container'
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentityId}': {}
    }
  }
  properties: {
    serverFarmId: frontendAppServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOCKER|${acrLoginServer}/${frontendImage}'
      acrUseManagedIdentityCreds: true
      acrUserManagedIdentityID: managedIdentityClientId
      alwaysOn: true
      appSettings: [
        {
          name: 'WEBSITES_PORT'
          value: '8080'
        }
        {
          name: 'BACKEND_URL'
          value: 'https://${backendAppName}-staging.azurewebsites.net'
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
output backendAppServicePlanName string = backendAppServicePlan.name
output frontendAppServicePlanName string = frontendAppServicePlan.name
output backendStagingFqdn string = backendStagingSlot.properties.defaultHostName
output frontendStagingFqdn string = frontendStagingSlot.properties.defaultHostName
