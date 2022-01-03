// Review the default theme foudnation style files for what to override
// https://github.com/chakra-ui/chakra-ui/tree/main/packages/theme/src/foundations

import { extendTheme } from '@chakra-ui/react'

const config = {
    initialColorMode: 'dark',
    useSystemColorMode: false,
}

let theme = extendTheme({ config })
theme.components.Table.sizes.sm.th.px = 2
theme.components.Table.sizes.sm.td.px = 2

export default theme