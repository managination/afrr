import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Provider } from "@ethersproject/abstract-provider";
import { getNetwork } from "@ethersproject/networks";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

import { isBatchedProvider, isWebSocketAugmentedProvider } from "@liquity/providers";
import {
  BlockPolledLiquityStore,
  EthersLiquity,
  EthersLiquityWithStore,
  _connectByChainId
} from "@liquity/lib-ethers";

import { LiquityFrontendConfig, getConfig } from "../config";

type LiquityContextValue = {
  config: LiquityFrontendConfig;
  account: string;
  provider: Provider;
  liquity: EthersLiquityWithStore<BlockPolledLiquityStore>;
};

const LiquityContext = createContext<LiquityContextValue | undefined>(undefined);

type LiquityProviderProps = {
  loader?: React.ReactNode;
  unsupportedNetworkFallback?: (chainId: number) => React.ReactNode;
  unsupportedMainnetFallback?: React.ReactNode;
};

const wsParams = (network: string, infuraApiKey: string): [string, string] => [
  `wss://${network === "ewVolta" ? "volta-" : ""}rpc.energyweb.org`, //`wss://${network === "homestead" ? "mainnet" : network}.infura.io/ws/v3/${infuraApiKey}`, // TODO: RJA ??, no infura on ewc
  network
];

/* const wsParams2 = (chainId: number): [string, string] => [
  `wss://${chainId === 73799 ? "volta-" : ""}rpc.energyweb.org`, //`wss://${network === "homestead" ? "mainnet" : network}.infura.io/ws/v3/${infuraApiKey}`, // TODO: RJA ??, no infura on ewc
  "unknown" // TODO chainId === 73799 ? "ewVolta" : "ewMainnet"
]; */

// Removed unsupported eth networks
const supportedNetworks = [
  //"homestead",
  //"kovan",
  //"rinkeby",
  //"ropsten",
  //"goerli",
  "ewMainnet", // TODO
  "ewVolta"
];

export const LiquityProvider: React.FC<LiquityProviderProps> = ({
  children,
  loader,
  unsupportedNetworkFallback,
  unsupportedMainnetFallback
}) => {
  const { library: provider, account, chainId } = useWeb3React<Web3Provider>();
  const [config, setConfig] = useState<LiquityFrontendConfig>();

  const connection = useMemo(() => {
    if (config && provider && account && chainId) {
      try {
        const x = _connectByChainId(provider, provider.getSigner(account), chainId, {
          userAddress: account,
          frontendTag: config.frontendTag,
          useStore: "blockPolled"
        });
        return x;
      } catch (error) {
        console.log(error);
      }
    }
  }, [config, provider, account, chainId]);

  useEffect(() => {
    getConfig().then(setConfig);
  }, []);

  useEffect(() => {
    if (config && connection) {
      const { provider, chainId } = connection;

      if (isBatchedProvider(provider) && provider.chainId !== chainId) {
        provider.chainId = chainId;
      }

      if (isWebSocketAugmentedProvider(provider)) {
        let network = getNetwork(chainId);
        /*if (network.chainId === 73799) {
          network.ensAddress = "0xd7CeF70Ba7efc2035256d828d5287e2D285CD1ac";
          network.name = "ewVolta";
          network._defaultProvider = ethDefaultProvider("ewVolta",{ ur});
        }
        if (network.chainId === 246) {
          network.ensAddress = "0x0A6d64413c07E10E890220BBE1c49170080C6Ca0";
          network.name = "ewMainnet";
          network._defaultProvider = new JsonRpcProvider("https://rpc.energyweb.org/"); // ethDefaultProvider("rinkeby");
        } */
        if (network.name && supportedNetworks.includes(network.name) && config.infuraApiKey) {
          provider.openWebSocket(...wsParams(network.name, config.infuraApiKey || ""));
          //provider.openWebSocket(...wsParams2(chainId));
        } else if (connection._isDev) {
          provider.openWebSocket(`ws://${window.location.hostname}:8546`, chainId);
        }

        return () => {
          provider.closeWebSocket();
        };
      }
    }
  }, [config, connection]);

  if (!config || !provider || !account || !chainId) {
    return <>{loader}</>;
  }

  if (config.testnetOnly && chainId === 1) {
    return <>{unsupportedMainnetFallback}</>;
  }

  if (!connection) {
    return unsupportedNetworkFallback ? <>{unsupportedNetworkFallback(chainId)}</> : null;
  }

  const liquity = EthersLiquity._from(connection);
  liquity.store.logging = true;

  return (
    <LiquityContext.Provider value={{ config, account, provider, liquity }}>
      {children}
    </LiquityContext.Provider>
  );
};

export const useLiquity = () => {
  const liquityContext = useContext(LiquityContext);

  if (!liquityContext) {
    throw new Error("You must provide a LiquityContext via LiquityProvider");
  }

  return liquityContext;
};
