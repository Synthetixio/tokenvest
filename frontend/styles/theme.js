import { extendTheme } from '@chakra-ui/react'

const config = {
    initialColorMode: 'dark',
    useSystemColorMode: false,
}

let theme = extendTheme({ config })
theme.components.Table.sizes.sm.th.px = 2
theme.components.Table.sizes.sm.td.px = 2

export default theme