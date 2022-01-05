import { DeleteIcon } from '@chakra-ui/icons'

export default function BurnButton({ tokenId }) {
  const queueBurn = () => {
    alert("Burn " + tokenId)
  }
  return (<DeleteIcon onClick={queueBurn} boxSize={4} />)
}
