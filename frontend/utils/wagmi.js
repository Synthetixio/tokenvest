import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, optimism } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "RainbowKit demo",
  projectId: "e1ee7fb2294ba6988418183b643d62b8",
  chains: [mainnet, optimism],
  ssr: true,
});
