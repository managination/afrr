import React from "react";
import { Web3ReactProvider } from "@web3-react/core";
import { Flex, Spinner, Heading, ThemeProvider, Paragraph, Link } from "theme-ui";

import { BatchedWebSocketAugmentedWeb3Provider } from "@liquity/providers";
import { LiquityProvider } from "./hooks/LiquityContext";
import { WalletConnector } from "./components/WalletConnector";
import { TransactionProvider } from "./components/Transaction";
import { Icon } from "./components/Icon";
import { getConfig } from "./config";
import theme from "./theme";

import { DisposableWalletProvider } from "./testUtils/DisposableWalletProvider";
import { LiquityFrontend } from "./LiquityFrontend";

if (window.ethereum) {
  // Silence MetaMask warning in console
  Object.assign(window.ethereum, { autoRefreshOnNetworkChange: false });
}

if (process.env.REACT_APP_DEMO_MODE === "true") {
  const ethereum = new DisposableWalletProvider(
    `http://${window.location.hostname}:8545`,
    "0x4d5db4107d237df6a3d58ee5f70ae63d73d7658d4026f2eefd2f204c81682cb7"
  );

  Object.assign(window, { ethereum });
}

// Start pre-fetching the config
getConfig().then(config => {
  // console.log("Frontend config:");
  // console.log(config);
  Object.assign(window, { config });
});

const EthersWeb3ReactProvider: React.FC = ({ children }) => {
  return (
    <Web3ReactProvider getLibrary={provider => new BatchedWebSocketAugmentedWeb3Provider(provider)}>
      {children}
    </Web3ReactProvider>
  );
};

// Removed unsupported eth networks
const UnsupportedMainnetFallback: React.FC = () => (
  <Flex
    sx={{
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      textAlign: "center"
    }}
  >
    <Heading sx={{ mb: 3 }}>
      <Icon name="exclamation-triangle" /> This app is for testing purposes only.
    </Heading>

    <Paragraph sx={{ mb: 3 }}>Please change your network to ewVolta or ewMainnet</Paragraph>

    <Paragraph>
      If you'd like to use the Liquity Protocol on mainnet, please pick a frontend{" "}
      <Link href="https://www.liquity.org/frontend">
        here <Icon name="external-link-alt" size="xs" />
      </Link>
      .
    </Paragraph>
  </Flex>
);

const netNames: { [key: number]: { name: string; supported: boolean } } = {
  42: { name: "kovan", supported: false },
  4: { name: "rinkeby", supported: false },
  3: { name: "ropsten", supported: false },
  5: { name: "goerli", supported: false },
  1: { name: "mainnet", supported: false },
  246: { name: "ewMainnet", supported: false }, // TODO not yet
  73799: { name: "ewVolta", supported: true }
};

const supportedNetNamesList = () =>
  Object.values(netNames)
    .filter(x => x.supported)
    .map(x => x.name)
    .join(", ");

const netName = (chainId: number): string => {
  return netNames[chainId].name ?? "unknown network";
};

const App = () => {
  const loader = (
    <Flex sx={{ alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <Spinner sx={{ m: 2, color: "text" }} size="32px" />
      <Heading>Loading...</Heading>
    </Flex>
  );

  // Removed unsupported eth networks
  const unsupportedNetworkFallback = (chainId: number) => (
    <Flex
      sx={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center"
      }}
    >
      <Heading sx={{ mb: 3 }}>
        <Icon name="exclamation-triangle" /> EWC Liquity is not deployed to {netName(chainId)}.
      </Heading>
      Please switch to one of: {supportedNetNamesList()}.
    </Flex>
  );

  return (
    <EthersWeb3ReactProvider>
      <ThemeProvider theme={theme}>
        <WalletConnector loader={loader}>
          <LiquityProvider
            loader={loader}
            unsupportedNetworkFallback={unsupportedNetworkFallback}
            unsupportedMainnetFallback={<UnsupportedMainnetFallback />}
          >
            <TransactionProvider>
              <LiquityFrontend loader={loader} />
            </TransactionProvider>
          </LiquityProvider>
        </WalletConnector>
      </ThemeProvider>
    </EthersWeb3ReactProvider>
  );
};

export default App;
