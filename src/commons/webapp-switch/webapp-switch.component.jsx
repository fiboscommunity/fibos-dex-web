/* eslint-disable no-console */
import { useMediaQuery } from 'react-responsive'
import { minDeviceWidth } from 'Config'

function webappSwitch() {
  const isDesktopOrLaptopSize = useMediaQuery({
    query: `(min-device-width: ${minDeviceWidth}px)`,
  })
  const isTabletOrMobileSize = useMediaQuery({ query: '(max-width: 1224px)' })
  const isTabletOrMobileDevice = useMediaQuery({
    query: '(max-device-width: 1224px)',
  })

  console.log('isDesktopOrLaptopSize:', isDesktopOrLaptopSize)
  console.log('isTabletOrMobileSize:', isTabletOrMobileSize)
  console.log('isTabletOrMobileDevice:', isTabletOrMobileDevice)

  if ((isDesktopOrLaptopSize && isTabletOrMobileSize) || isTabletOrMobileDevice) {
    return 'mobile'
  }

  return 'webapp'
}

export default webappSwitch
