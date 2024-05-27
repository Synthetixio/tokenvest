import { Icon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  LightMode,
  Text,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { useState } from "react";
import { BsCash } from "react-icons/bs";
import { useRecoilState } from "recoil";
import { getGrant, redeemGrant } from "../../../lib/store/grants";

export default function RedeemTokens({ tokenId }) {
  const [grant, setGrant] = useRecoilState(getGrant(tokenId));

  const [exchangeMode, setExchangeMode] = useState(false);
  const [exchangeTokenAmount, setExchangeTokenAmount] = useState(0);
  const [exchangeTokenAddress, setExchangeTokenAddress] = useState("");
  const [loadingRedemption, setLoadingRedemption] = useState(false);

  const vested = parseFloat(ethers.utils.formatUnits(grant.amountVested, 18));
  const redeemed = parseFloat(
    ethers.utils.formatUnits(grant.amountRedeemed, 18)
  );
  const available = parseFloat(
    ethers.utils.formatUnits(grant.amountAvailable, 18)
  );

  const redeem = () => {
    setLoadingRedemption(true);
    redeemGrant(
      grant.tokenId,
      exchangeMode && exchangeTokenAmount,
      exchangeMode && exchangeTokenAddress,
      setGrant
    ).finally(() => {
      setLoadingRedemption(false);
    });
  };

  return (
    <Box mb={5} borderRadius="md" background="gray.900" py={5} px={6}>
      <Heading size="lg" fontWeight="light">
        <Icon as={BsCash} boxSize={5} mr={2} />
        Redeem {grant.tokenSymbol}
      </Heading>

      <Flex align="center" mb={6}>
        <Box width="50%" pr={4} pt={2}>
          <Text>
            You can redeem available {grant.tokenSymbol}. Available tokens do
            not expire.
          </Text>
        </Box>
        <Box width="50%" pr={4}>
          <Flex>
            <Box>
              <Text fontSize="2xl" fontWeight="medium">
                {vested.toLocaleString()}
              </Text>
              <Text
                fontSize="sm"
                lineHeight={1}
                textTransform="uppercase"
                letterSpacing={1.5}
                opacity={0.8}
              >
                Vested
              </Text>
            </Box>
            <Box px={4}>
              <Text fontSize="2xl" fontWeight="medium">
                -
              </Text>
            </Box>
            <Box>
              <Text fontSize="2xl" fontWeight="medium">
                {redeemed.toLocaleString()}
              </Text>
              <Text
                fontSize="sm"
                lineHeight={1}
                textTransform="uppercase"
                letterSpacing={1.5}
                opacity={0.8}
              >
                Redeemed
              </Text>
            </Box>
            <Box px={4}>
              <Text fontSize="2xl" fontWeight="medium">
                =
              </Text>
            </Box>
            <Box>
              <Text fontSize="2xl" fontWeight="medium">
                {available.toLocaleString()}
              </Text>
              <Text
                fontSize="sm"
                lineHeight={1}
                textTransform="uppercase"
                letterSpacing={1.5}
                opacity={0.8}
              >
                Available
              </Text>
            </Box>
          </Flex>
        </Box>
      </Flex>

      <Checkbox
        mb={4}
        checked={exchangeMode}
        onChange={(e) => setExchangeMode(e.target.checked)}
      >
        I would like to purchase this {grant.tokenSymbol}.
      </Checkbox>

      <FormControl d={!exchangeMode && "none"} mb={6}>
        <FormLabel>Optional Purchase Price</FormLabel>

        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <Input
            type="number"
            value={exchangeTokenAmount}
            onChange={(e) => setExchangeTokenAmount(e.target.value)}
            placeholder="Enter Amount"
          />
          <Input
            value={exchangeTokenAddress}
            onChange={(e) => setExchangeTokenAddress(e.target.value)}
            placeholder="Enter Token Address"
          />
        </Grid>
      </FormControl>
      <LightMode>
        <Button
          onClick={redeem}
          isLoading={loadingRedemption}
          isFullWidth
          size="lg"
          isDisabled={available == 0}
          colorScheme="blue"
        >
          Redeem {available.toLocaleString()} {grant.tokenSymbol}
        </Button>
      </LightMode>
    </Box>
  );
}
