import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, optimism } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "RainbowKit demo",
  projectId: "5075a2da602e17eec34aa77b40b321be",
  chains: [mainnet, optimism],
  ssr: true,
});
