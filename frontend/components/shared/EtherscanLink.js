import { ethers } from 'ethers'
import { clone } from 'lodash'
import { useState, useEffect } from 'react'
import { Link } from '@chakra-ui/react'

export default function EtherscanLink(props) {
    const [chainId, setChainId] = useState(null)

    useEffect(() => {
        (async function () {
            const provider = new ethers.getDefaultProvider({ infura: process.env.NEXT_PUBLIC_INFURA_PROJECT_ID })
            const resp = await provider.getNetwork()
            setChainId(resp.chainId)
        })();
    }, [])

    let newProps = clone(props)
    newProps.path = undefined;
    const href = `https://${chainId == 10 ? 'optimism' : ''}.etherscan.io${props.path}`;

    return <Link {...newProps} href={href} />
}