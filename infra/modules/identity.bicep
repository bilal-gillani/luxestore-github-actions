@description('Location for the managed identity')
param location string = resourceGroup().location

@description('Name of the User-Assigned Managed Identity')
param identityName string

@description('Name of the existing Azure Container Registry')
param acrName string

// 1. Create User Assigned Managed Identity
resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: identityName
  location: location
}

// 2. Assign AcrPull role to the Managed Identity on the ACR
// Delegated to child module so principalId can be used in the deterministic GUID name,
// preventing RoleAssignmentUpdateNotPermitted errors if the identity is recreated.
module acrRoleAssignment 'acrRoleAssignment.bicep' = {
  name: 'acrRoleAssignmentDeployment'
  params: {
    acrName: acrName
    principalId: managedIdentity.properties.principalId
  }
}

output identityId string = managedIdentity.id
output identityClientId string = managedIdentity.properties.clientId
output identityPrincipalId string = managedIdentity.properties.principalId
