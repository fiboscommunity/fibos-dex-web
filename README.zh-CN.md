[English](./README.md) | 简体中文

Dex 去中心化交易中心

## 配置

配置路径: `src/config/index.js`

| Param          | Effect                                                         |
| --------------- | ------------------------------------------------------------ |
| host  | 服务器 host 地址                                                     |
| pollInterval | 获取最新交易自动刷新间隔                                     |

配置路径: `src/config/chain-config.js`

| Param          | Effect                                                         |
| --------------- | ------------------------------------------------------------ |
| chainIdMap.production  |  生产环境 ChainId                                                        |
| chainIdMap.testnet | 测试环境 ChainId                                             |
| chainIdMap.development | 开发环境 ChainId                                             |
| chainIdMap.default | 默认环境 ChainId                                             |
| foNetworkMap.ENV.blockchain | 默认链名称                                             |
| foNetworkMap.ENV.protocol | 链协议
| foNetworkMap.ENV.host | 链 host 地址                   |
| foNetworkMap.ENV.port     | 链端口   |

配置路径: `src/config/page-config.js`

| Param          | Effect                                                         |
| --------------- | ------------------------------------------------------------ |
| tradeTypeMap.uniswap.fee  | 交易中心手续费相关配置                                                    |
| repoToolPageHref |  ABS 回购地址                                     |

## 安装 & 使用

> 1. `yarn install`

> 2. `yarn start`

### 打包

> 1. 运行命令 **`yarn build:testnet`** 来构建测试环境的安装包
> 2. 运行命令 **`yarn build:mainnet`** 来构建生产环境的安装包

### patch_api (合约 api 相关说明)

### exchange patch_api

```
exchange: {
    "base": "",
    "action": {
        "name": "exchange",
        "account": "eosio.token"
    },
    "fields": {
        "owner": "account_name",
        "quantity": "extended_asset",
        "to": "extended_asset",
        "price": "float64",
        "id": "account_name",
        "memo": "string"
    }
},
```

### addreserves patch_api

```
addreserves: {
    "base": "",
    "action": {
        "name": "addreserves",
        "account": "eosio.token"
    },
    "fields": {
        "owner": "account_name",
        "tokenx": "extended_asset",
        "tokeny": "extended_asset"
    }
},
```

### outreserves patch_api

```
outreserves: {
    base: '',
    action: {
        name: 'outreserves',
        account: 'eosio.token',
    },
    fields: {
        owner: 'account_name',
        x: 'extended_symbol',
        y: 'extended_symbol',
        rate: 'float64',
    },
},
```

### delegate table amount price totalPrice rules

```
a/b
dst = a
src = b
==========
intend to buy
b=>a

!!! current form sent, from * price = to
from(amount) x = 0 b
to(totalPrice) y = xxx a
contract price -- 1/p = b/a
inputed  price -- p = a/b
directtion "buy"

!!! not availble for now, from * price = to
from(amount) x = xxx b
to(totalPrice) y = 0 a
contract price -- 1/p = b/a
inputed  price -- p = a/b
directtion "buy"
==========


a/b
==========
intend to sell
a=>b

!!! not availble for now, from * price = to
from(amount) x = 0 a
to(totalPrice) y = xxx b
contract price -- 1/p = a/b
inputed  price -- p = b/a
directtion "sell"

!!! current form sent, from * price = to
from(amount) x = xxx a
to(totalPrice) y = 0 b
contract price -- 1/p = a/b
inputed  price -- p = b/a
directtion "sell"
==========


###########################################


b/a
dst = b
src = a
==========
intend to buy
a=>b

!!! current form sent, from * price = to
from(amount) x = 0 a
to(totalPrice) y = xxx b
contract price -- 1/p = a/b
inputed  price -- p = b/a
directtion "buy"

!!! not availble for now, from * price = to
from(amount) x = xxx a
to(totalPrice) y = 0 b
contract price -- 1/p = a/b
inputed  price -- p = b/a
directtion "buy"
==========


b/a
==========
intend to sell
b=>a

!!! not availble for now, from * price = to
from(amount) x = 0 b
to(totalPrice) y = xxx a
contract price -- 1/p = b/a
inputed  price -- p = a/b
directtion "sell"

!!! current form sent, from * price = to
from(amount) x = xxx b
to(totalPrice) y = 0 a
contract price -- 1/p = b/a
inputed  price -- p = a/b
directtion "sell"
==========

```
