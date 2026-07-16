param location string = resourceGroup().location
param appName string = 'washnpress-platform-app'
param appServicePlanName string = 'washnpress-platform-plan'
param acrServer string
param acrImage string = 'washnpress-platform:latest'
param acrUsername string
@secure()
param acrPassword string

resource plan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
}

resource web 'Microsoft.Web/sites@2022-09-01' = {
  name: appName
  location: location
  kind: 'app,linux,container'
  properties: {
    serverFarmId: plan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|${acrServer}/${acrImage}'
      appSettings: [
        { name: 'WEBSITES_PORT', value: '3000' }
        { name: 'DOCKER_REGISTRY_SERVER_URL', value: 'https://${acrServer}' }
        { name: 'DOCKER_REGISTRY_SERVER_USERNAME', value: acrUsername }
        { name: 'DOCKER_REGISTRY_SERVER_PASSWORD', value: acrPassword }
        { name: 'NODE_ENV', value: 'production' }
      ]
    }
    httpsOnly: true
  }
}

output webAppUrl string = 'https://${web.properties.defaultHostName}'
