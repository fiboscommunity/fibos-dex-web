import React from 'react'
import Responsive from 'react-responsive'

export const Desktop = props => <Responsive {...props} minWidth={992} />
export const Tablet = props => <Responsive {...props} minWidth={769} maxWidth={991} />
export const Default = props => <Responsive {...props} minWidth={768} />
export const Mobile = props => <Responsive {...props} maxWidth={767} />

export const ScreenLarge = props => <Responsive {...props} minWidth={1880} />
export const ScreenMiddle = props => <Responsive {...props} minWidth={1101} maxWidth={1879} />
export const ScreenSmall = props => <Responsive {...props} maxWidth={1100} />
