const nodeEnv = process.env.NODE_ENV || ''
// const nodeEnv = 'production'

const chainIdMap = {
  production: 'CHAIN_ID',
  testnet: 'CHAIN_ID',
  development: 'CHAIN_ID',
  default: 'CHAIN_ID',
}
export const chainId = chainIdMap[nodeEnv] || chainIdMap.default

const { protocol } = window.location
export const foNetworkMap = {
  testnet: {
    blockchain: 'fibos',
    protocol: protocol === 'https:' ? 'https' : 'http',
    chainId,
    /* Test Net */
    // host: 'api.testnet.fo',
    // port: 80,
    host: '210.74.14.247',
    port: 9090,
  },
  production: {
    blockchain: 'fibos',
    protocol: protocol === 'https:' ? 'https' : 'http',
    chainId,
    /* Main Net */
    host: 'to-rpc.fibos.io',
    port: protocol === 'https:' ? 443 : 8870,
  },
  local: {
    blockchain: 'fibos',
    protocol: protocol === 'https:' ? 'https' : 'http',
    chainId,
    /* Test Net Local */
    host: 'local.testnet.fo',
    port: 80,
  },
  development: {
    blockchain: 'fibos',
    protocol: protocol === 'https:' ? 'https' : 'http',
    chainId,
    host: '210.74.14.247',
    port: 9090,
  },
  default: {
    blockchain: 'fibos',
    protocol: protocol === 'https:' ? 'https' : 'http',
    chainId,
    /* Main Net */
    host: 'to-rpc.fibos.io',
    port: protocol === 'https:' ? 443 : 8870,
  },
}

export const foNetwork = foNetworkMap[nodeEnv] || foNetworkMap.default

export const repoAccount = 'buyoutworker'
