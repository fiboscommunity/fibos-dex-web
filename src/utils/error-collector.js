import intl from 'react-intl-universal'

import message from 'antd/lib/message'
import 'antd/lib/message/style/css'

const contractStringErrorHandler = errorString => {
  if (errorString.indexOf('dust attack detected in uniswap') >= 0) {
    return message.error(intl.get('DUST_ATTACK_DETECTED_IN_UNISWAP'))
  }

  if (errorString.indexOf('The remaining weight is too low') >= 0) {
    return message.error(intl.get('THE_REMAINING_WEIGHT_IS_TOO_LOW'))
  }

  if (errorString.indexOf('dust attack detected') >= 0) {
    return message.error(intl.get('ACTION_LIMITED'))
  }

  if (errorString.indexOf('Add reserves too lower') >= 0) {
    return message.error(intl.get('ADD_RESERVES_TOO_LOWER'))
  }

  if (errorString.indexOf('No such bid order') >= 0) {
    return message.error(intl.get('NO_SUCH_BID_ORDER'))
  }

  if (errorString.indexOf('Resource exhausted exception') >= 0) {
    if (errorString.indexOf('Account using more than allotted RAM usage') >= 0) {
      return message.error(intl.get('ACCOUNT_USING_MORE_THAN_ALLOTTED_RAM_USAGE'))
    }

    return message.error(intl.get('RESOURCE_EXHAUSTED_EXCEPTION'))
  }

  return message.error(intl.get('ACTION_FAIL'))
}

const contractErrorCollector = error => {
  switch (error.type) {
    case 'signature_rejected':
      message.warning(intl.get('SIGNATURE_REJECTED'))
      break

    default:
      if (error === 'user reject') {
        message.warning(intl.get('SIGNATURE_REJECTED'))
      } else if (Object.prototype.toString.call(error) === '[object String]') {
        contractStringErrorHandler(error)
      }

      break
  }
}

export default contractErrorCollector
