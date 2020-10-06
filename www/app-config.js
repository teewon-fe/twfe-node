/*
 * 功能: 配置应用依赖的环境变量
 */
const gateway = 'http://dev.teewon.net:7000'
const ecoWebServer = 'https://dev.teewon.net:9443'

window.$app = {
  currentTenant: 'hz00001',
  appId: '6546d0ebf69d41f2b40397441aefc109',
  appSecret: '403d52b9931dd348',
  clientId: '100000000000',
  weixinAppId: 'wxdbfff9bf396fafdb',
  apiBaseUrl: 'http://192.168.102.204:9000/openapi-dev',
  fileBaseUrl: 'http://192.168.102.80:9000/fs/media',
  fileUploadUrl: 'http://192.168.102.80:9000/twasp/fs/fs/file/upload',
  loginPage: '/#/login',
  eco: {
    webSever: ecoWebServer,
    findPassword: ecoWebServer + '/static/home.html#/find-password',
    gateway: gateway,
    apiBaseUrl: gateway + '/openapi-base'
  }
}
