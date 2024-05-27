import { atom, selectorFamily } from "recoil";
import { ethers } from "ethers";
import vesterAbi from "../../abis/Vester.json";
import erc20Abi from "../../abis/SampleToken.json";
import multicall3Abi from "../../abis/Multicall3.json";
import { parseErrorMessage } from "../../lib/utils/helpers";
import { createStandaloneToast } from "@chakra-ui/react";
import theme from "../../styles/theme";

const toast = createStandaloneToast({ theme });

/**** STATE ****/

export const grantsState = atom({
  key: "grantsState",
  default: {},
});

export const getGrants = selectorFamily({
  key: "getGrants",
  get:
    (address) =>
    ({ get }) => {
      return Object.values(get(grantsState));
    },
  set:
    () =>
    ({ get, set }, newValue) => {
      let wrappedNewValue = {};
      wrappedNewValue[newValue.tokenId] = newValue;
      set(grantsState, Object.assign({}, get(grantsState), wrappedNewValue));
    },
});

export const getGrant = selectorFamily({
  key: "getGrant",
  get:
    (tokenId) =>
    ({ get }) => {
      return get(grantsState)[tokenId];
    },
  set:
    (tokenId) =>
    ({ get, set }, newValue) => {
      let wrappedNewValue = {};
      wrappedNewValue[tokenId] = newValue;
      set(grantsState, Object.assign({}, get(grantsState), wrappedNewValue));
    },
});

export const getGrantsByUser = selectorFamily({
  key: "getGrantsByUser",
  get:
    (address) =>
    ({ get }) => {
      return Object.values(get(grantsState)).filter((g) => g.owner == address);
    },
  set:
    () =>
    ({ get, set }, newValue) => {
      let wrappedNewValue = {};
      wrappedNewValue[newValue.tokenId] = newValue;
      set(grantsState, Object.assign({}, get(grantsState), wrappedNewValue));
    },
});

const networkIdToName = {
  1: "mainnet",
  10: "optimism-mainnet",
};
/**** ACTIONS ****/

export const fetchGrant = async (setGrant, tokenId, networkId) => {
  const infuraName = networkIdToName[networkId];
  if (!infuraName) {
    console.error(`Invalid network id ${networkId}, check events.js`);
    throw Error("Invalid network id:" + networkId);
  }
  // Always use infura for fetching events, provider from wallet can be really slow
  const provider = new ethers.providers.JsonRpcProvider({
    url: `https://${infuraName}.infura.io/v3/8abb2592d8d344daafc5362ddd33efd1`,
    skipFetchSetup: true,
  });
  let vesterInterface = new ethers.utils.Interface(vesterAbi.abi);
  let multicallArgs = [
    {
      target: process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS,
      callData: vesterInterface.encodeFunctionData("grants", [tokenId]),
      allowFailure: true,
      value: 0,
    },
    {
      target: process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS,
      callData: vesterInterface.encodeFunctionData("amountVested", [tokenId]),
      allowFailure: true,
      value: 0,
    },
    {
      target: process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS,
      callData: vesterInterface.encodeFunctionData("availableForRedemption", [
        tokenId,
      ]),
      allowFailure: true,
      value: 0,
    },
    {
      target: process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS,
      callData: vesterInterface.encodeFunctionData("ownerOf", [tokenId]),
      allowFailure: true,
      value: 0,
    },
  ];
  const multicallContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_MULTICALL_ADDRESS,
    multicall3Abi.abi,
    provider
  );
  const resp = await multicallContract.callStatic.aggregate3Value(
    multicallArgs
  );
  const grantData = vesterInterface.decodeFunctionResult(
    "grants",
    resp[0].returnData
  );
  const erc20Contract = new ethers.Contract(
    grantData.tokenAddress,
    erc20Abi.abi,
    provider
  );
  const tokenSymbol = await erc20Contract.symbol();

  try {
    setGrant({
      tokenId,
      ...grantData,
      amountVested: vesterInterface.decodeFunctionResult(
        "amountVested",
        resp[1].returnData
      )[0],
      amountAvailable: vesterInterface.decodeFunctionResult(
        "availableForRedemption",
        resp[2].returnData
      )[0],
      owner: vesterInterface.decodeFunctionResult(
        "ownerOf",
        resp[3].returnData
      )[0],
      tokenSymbol: tokenSymbol,
    });
  } catch {
    console.log("set grant failed");
  }

  return resp;
};

export const fetchGrants = async (setGrant, networkId) => {
  const infuraName = networkIdToName[networkId];

  if (!infuraName) {
    console.error(`Invalid network id ${networkId}, check events.js`);
    throw Error("Invalid network id:" + networkId);
  }
  // Always use infura for fetching events, provider from wallet can be really slow
  const provider = new ethers.providers.JsonRpcProvider(
    `https://${infuraName}.infura.io/v3/8c6bfe963db94518b16b17114e29e628`
  );
  const vesterContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS,
    vesterAbi.abi,
    provider
  );
  console.log("fetching totalSupply");

  const totalSupply = await vesterContract.totalSupply();
  console.log("fetching grants, totalSuypply", totalSupply.toNumber());
  let promises = [];
  for (let i = 0; i < totalSupply.toNumber(); i++) {
    promises.push(await fetchGrant(setGrant, i, networkId));
  }

  return Promise.all(promises);
};

export const fetchGrantsByUser = async (setGrant, owner, networkId) => {
  const infuraName = networkIdToName[networkId];

  if (!infuraName) {
    console.error(`Invalid network id ${networkId}, check events.js`);
    throw Error("Invalid network id:" + networkId);
  }
  // Always use infura for fetching events, provider from wallet can be really slow
  const provider = new ethers.providers.JsonRpcProvider({
    url: `https://${infuraName}.infura.io/v3/8abb2592d8d344daafc5362ddd33efd1`,
    skipFetchSetup: true,
  });

  const vesterContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS,
    vesterAbi.abi,
    provider
  );
  let promises = [];

  const totalSupply = await vesterContract.balanceOf(owner);
  for (let i = 0; i < totalSupply.toNumber(); i++) {
    const grantId = await vesterContract.tokenOfOwnerByIndex(owner, i);
    promises.push(await fetchGrant(setGrant, grantId, networkId));
  }

  return Promise.all(promises);
};

export const redeemGrant = async (
  tokenId,
  exchangeTokenAmount,
  exchangeTokenAddress,
  setGrant
) => {
  const provider = new ethers.providers.Web3Provider(window?.ethereum);

  const vesterContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS,
    vesterAbi.abi,
    provider
  );

  const submitToastEvent = () => {
    toast({
      title: "Redemption Submitted",
      description:
        "A notice will appear here after the redemption has been successfully processed. Refer to your wallet for the latest status.",
      status: "info",
      position: "top",
      duration: 10000,
      isClosable: true,
    });
  };

  const errorToastEvent = (error) => {
    toast({
      title: "Error",
      description: parseErrorMessage(error),
      status: "error",
      position: "top",
      isClosable: true,
    });
  };

  provider.once("block", () => {
    // Unsure about this wrapping? Originally added to prevent redemptions from old blocks rendering.
    vesterContract.once(
      "Redemption",
      async (redeemedTokenId, address, amount) => {
        if (tokenId.toNumber() == redeemedTokenId.toNumber()) {
          toast({
            title: "Redemption Successful",
            description: `You have redeemed ${(
              amount /
              10 ** 18
            ).toLocaleString()} tokens.`,
            status: "success",
            position: "top",
            duration: 10000,
            isClosable: true,
          });
        }
        await fetchGrant(setGrant, tokenId, provider.network.chainId);
      }
    );
  });

  if (exchangeTokenAmount) {
    const exchangeTokenAmountParsed = ethers.utils.parseEther(
      exchangeTokenAmount.toString()
    );
    const exchangeTokenAddressParsed =
      ethers.utils.getAddress(exchangeTokenAddress);

    const erc20Contract = new ethers.Contract(
      exchangeTokenAddressParsed,
      erc20Abi.abi,
      provider
    );
    return await erc20Contract
      .connect(provider.getSigner())
      .approve(
        process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS,
        exchangeTokenAmountParsed
      )
      .then(async () => {
        return await vesterContract
          .connect(provider.getSigner())
          .redeemWithTransfer(
            tokenId,
            exchangeTokenAddressParsed,
            exchangeTokenAmountParsed
          )
          .then(submitToastEvent)
          .catch(errorToastEvent);
      });
  } else {
    return await vesterContract
      .connect(provider.getSigner())
      .redeem(tokenId)
      .then(submitToastEvent)
      .catch(errorToastEvent);
  }
};

export const redeemAll = async () => {
  const provider = new ethers.providers.Web3Provider(window?.ethereum); //or should this be passed in?
  const vesterContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_VESTER_CONTRACT_ADDRESS,
    vesterAbi.abi,
    provider
  );

  const submitToastEvent = () => {
    toast({
      title: "RedeemAll Submitted",
      description:
        "Refer to your wallet for the latest status, and refresh page for updated data.",
      status: "info",
      position: "top",
      duration: 10000,
      isClosable: true,
    });
  };

  const errorToastEvent = (error) => {
    toast({
      title: "Error",
      description: parseErrorMessage(error),
      status: "error",
      position: "top",
      isClosable: true,
    });
  };

  return await vesterContract
    .connect(provider.getSigner())
    .redeemAll()
    .then(submitToastEvent)
    .catch(errorToastEvent);
};
