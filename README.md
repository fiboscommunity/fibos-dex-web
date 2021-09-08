English | [简体中文](./README.zh-CN.md)

Dex

## Configuration

`src/config/index.js`

| Param          | Effect                                                         |
| --------------- | ------------------------------------------------------------ |
| host  | Service host                                                     |
| pollInterval | Auto refresh interval                                     |

`src/config/chain-config.js`

| Param          | Effect                                                         |
| --------------- | ------------------------------------------------------------ |
| chainIdMap.production  |  Production Environment ChainId                                                        |
| chainIdMap.testnet | Test Environment ChainId                                             |
| chainIdMap.development | Development Environment ChainId                                             |
| chainIdMap.default | Default Environment ChainId                                             |
| foNetworkMap.ENV.blockchain | Environment blockchain name                                             |
| foNetworkMap.ENV.protocol | Blockchain protocol
| foNetworkMap.ENV.host | Blockchain host                   |
| foNetworkMap.ENV.port     | Blockchain port   |

`src/config/page-config.js`

| Param          | Effect                                                         |
| --------------- | ------------------------------------------------------------ |
| tradeTypeMap.uniswap.fee  |  Dex transaction fee parameters                                                    |
| repoToolPageHref | Abs repurchase address                                      |

## Install & Usage

> 1. `yarn install`

> 2. `yarn start`

### Build

> 1. Run the command **`yarn build:testnet`** To build the installation package for the test environment
> 2. Run the command **`yarn build:mainnet`** To build the installation package for the mainnet environment

### patch_api

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
