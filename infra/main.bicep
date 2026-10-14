@description('Prefix for resources')
param prefix string = 'luxestore'

@description('Deployment location')
param location string = resourceGroup().location

@description('Name of the existing Azure Container Registry')
param acrName string = 'acrazdevops1029'

@description('MySQL Flexible Server name')
param mysqlServerName string = 'mysql-devtest1029'

@description('MySQL Administrator username')
param mysqlAdminUsername string = 'sqladmin'

@secure()
@description('MySQL Administrator password')
param mysqlAdminPassword string = ''

@description('Application Database username')
param appDbUsername string = 'ecommerce_user'

@secure()
@description('Application Database password')
param appDbPassword string = ''

@secure()
@description('JWT Secret Key for Backend API')
param jwtSecret string = ''

@description('Backend Docker image name and tag (e.g. luxestore-backend:latest)')
param backendImage string = 'luxestore-backend:latest'

@description('Frontend Docker image name and tag (e.g. luxestore-frontend:latest)')
param frontendImage string = 'luxestore-frontend:latest'

@description('App Service Plan SKU (Default S1 Standard)')
param appServicePlanSku string = 'S1'

@description('Backend App Service Plan SKU')
param backendAppServicePlanSku string = appServicePlanSku

@description('Frontend App Service Plan SKU')
param frontendAppServicePlanSku string = appServicePlanSku

var uniqueSuffix = uniqueString(resourceGroup().id)
var identityName = '${prefix}-uami'
var backendAppServicePlanName = '${prefix}-backend-asp'
var frontendAppServicePlanName = '${prefix}-frontend-asp'
var backendAppName = '${prefix}-backend-${uniqueSuffix}'
var frontendAppName = '${prefix}-frontend-${uniqueSuffix}'
var acrLoginServer = '${acrName}.azurecr.io'

// 1. User-Assigned Managed Identity & AcrPull Role
module identity 'modules/identity.bicep' = {
  name: 'identityDeployment'
  params: {
    location: location
    identityName: identityName
    acrName: acrName
  }
}

// 2. Azure Database for MySQL Flexible Server (Dev/Test Burstable SKU)
module database 'modules/database.bicep' = {
  name: 'databaseDeployment'
  params: {
    location: location
    serverName: mysqlServerName
    adminUsername: mysqlAdminUsername
    adminPassword: mysqlAdminPassword
    skuName: 'Standard_B1ms'
    skuTier: 'Burstable'
  }
}

// 3. App Service Plans & Container Web Apps
module appservice 'modules/appservice.bicep' = {
  name: 'appserviceDeployment'
  params: {
    location: location
    backendAppServicePlanName: backendAppServicePlanName
    backendAppServicePlanSku: backendAppServicePlanSku
    frontendAppServicePlanName: frontendAppServicePlanName
    frontendAppServicePlanSku: frontendAppServicePlanSku
    backendAppName: backendAppName
    frontendAppName: frontendAppName
    acrLoginServer: acrLoginServer
    backendImage: backendImage
    frontendImage: frontendImage
    managedIdentityId: identity.outputs.identityId
    managedIdentityClientId: identity.outputs.identityClientId
    mysqlServerFqdn: database.outputs.serverFqdn
    appDbUser: appDbUsername
    appDbPassword: appDbPassword
    jwtSecret: jwtSecret
  }
}

output mysqlServerName string = database.outputs.serverName
output mysqlServerFqdn string = database.outputs.serverFqdn
output backendAppUrl string = 'https://${appservice.outputs.backendAppFqdn}'
output frontendAppUrl string = 'https://${appservice.outputs.frontendAppFqdn}'
output backendAppName string = appservice.outputs.backendAppName
output frontendAppName string = appservice.outputs.frontendAppName
output backendAppServicePlanName string = appservice.outputs.backendAppServicePlanName
output frontendAppServicePlanName string = appservice.outputs.frontendAppServicePlanName
output managedIdentityClientId string = identity.outputs.identityClientId
output acrLoginServer string = acrLoginServer
