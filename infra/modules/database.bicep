@description('Location for the database')
param location string = resourceGroup().location

@description('MySQL Flexible Server name')
param serverName string

@description('Administrator login name')
param adminUsername string = 'sqladmin'

@description('Administrator login password')
@secure()
param adminPassword string

@description('MySQL server version')
param mysqlVersion string = '8.0.21'

@description('SKU name for Flexible Server (Burstable B1ms for Dev/Test)')
param skuName string = 'Standard_B1ms'

@description('SKU tier')
param skuTier string = 'Burstable'

@description('Database name')
param databaseName string = 'ecommerce_store'

resource mysqlServer 'Microsoft.DBforMySQL/flexibleServers@2023-12-30' = {
  name: serverName
  location: location
  sku: {
    name: skuName
    tier: skuTier
  }
  properties: {
    administratorLogin: adminUsername
    administratorLoginPassword: adminPassword
    version: mysqlVersion
    storage: {
      storageSizeGB: 20
      iops: 360
      autoGrow: 'Enabled'
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

// Allow all Azure internal services to access the server (0.0.0.0 - 0.0.0.0)
resource allowAzureIps 'Microsoft.DBforMySQL/flexibleServers/firewallRules@2023-12-30' = {
  parent: mysqlServer
  name: 'AllowAllWindowsAzureIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Database creation
resource database 'Microsoft.DBforMySQL/flexibleServers/databases@2023-12-30' = {
  parent: mysqlServer
  name: databaseName
  properties: {
    charset: 'utf8mb4'
    collation: 'utf8mb4_unicode_ci'
  }
}

// Enforce SSL / TLS (require_secure_transport = ON)
resource secureTransportConfig 'Microsoft.DBforMySQL/flexibleServers/configurations@2023-12-30' = {
  parent: mysqlServer
  name: 'require_secure_transport'
  properties: {
    value: 'ON'
    source: 'user-override'
  }
}

output serverId string = mysqlServer.id
output serverName string = mysqlServer.name
output serverFqdn string = mysqlServer.properties.fullyQualifiedDomainName
output databaseName string = database.name
