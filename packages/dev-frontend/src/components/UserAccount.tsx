import React from "react";
import { useState, useEffect } from "react";
import { Text, Flex, Box, Heading } from "theme-ui";
import { Decimal, LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";
import { Provider } from "@ethersproject/abstract-provider";
import { COIN, GT } from "../strings";
import { useLiquity } from "../hooks/LiquityContext";
import { shortenAddress } from "../utils/shortenAddress";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { Icon } from "./Icon";
import { ethers } from "ethers";

const select = ({ accountBalance, lusdBalance, lqtyBalance }: LiquityStoreState) => ({
  accountBalance,
  lusdBalance,
  lqtyBalance
});

const netName = (chainId: number): string => {
  const netNames: { [key: number]: string } = {
    1: "Eth Mainnet",
    73799: "Volta",
    246: "EWC Mainnet"
  };
  return netNames[chainId] ?? "unknown network";
};

const loadSusuBalance = async (
  account: string,
  chainId: number | undefined,
  provider: Provider
): Promise<Decimal> => {
  // A Human-Readable ABI; any supported ABI format could be used
  const abi = [
    // Read-Only Functions
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)",
    // Authenticated Functions
    "function transfer(address to, uint amount) returns (boolean)",
    // Events
    "event Transfer(address indexed from, address indexed to, uint amount)"
  ];

  // This can be an address or an ENS name
  const address =
    chainId === 73799
      ? "0xDC5b69374207a18e75F7cdCf5176CA63911e690d"
      : "0x9cd9caecdc816c3e7123a4f130a91a684d01f4dc";
  //const bal = await provider.getBalance(account); // can use this line to get ewt to test logic is working if no susu in wallet used for dev
  const erc20 = new ethers.Contract(address, abi, provider);
  const bal = await erc20.balanceOf(account);
  return Decimal.fromBigNumberString(bal.toString());
};

export const UserAccount: React.FC = () => {
  const { account, provider } = useLiquity();
  const { accountBalance, lusdBalance, lqtyBalance } = useLiquitySelector(select);
  const { chainId } = useWeb3React<Web3Provider>();

  const [susuBalance, setSusuBalance] = useState<Decimal>(Decimal.ZERO);
  useEffect(() => {
    async function getTheBalance() {
      const bal = await loadSusuBalance(account, chainId, provider);
      setSusuBalance(bal);
    }
    getTheBalance();
  }, [account, chainId, provider]);

  return (
    <Box sx={{ display: ["none", "flex"] }}>
      <Flex sx={{ alignItems: "center" }}>
        <Icon name="user-circle" size="lg" />
        <Flex sx={{ ml: 3, mr: 4, flexDirection: "column" }}>
          <Heading sx={{ fontSize: 1 }}>
            Connected ({chainId ? netName(chainId) : "Unknown"}) as
          </Heading>
          <Text as="span" sx={{ fontSize: 1 }}>
            {shortenAddress(account)}
          </Text>
        </Flex>
      </Flex>

      <Flex sx={{ alignItems: "center" }}>
        <Icon name="wallet" size="lg" />

        {(
          [
            ["EWT", accountBalance],
            [COIN, lusdBalance],
            [GT, lqtyBalance],
            ["SUSU", susuBalance]
          ] as const
        ).map(([currency, balance], i) => (
          <Flex key={i} sx={{ ml: 3, flexDirection: "column" }}>
            <Heading sx={{ fontSize: 1 }}>{currency}</Heading>
            <Text sx={{ fontSize: 1 }}>{balance.prettify()}</Text>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
};
