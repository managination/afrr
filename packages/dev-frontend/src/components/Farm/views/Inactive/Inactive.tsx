import React, { useCallback } from "react";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Card, Heading, Box, Flex, Button, Link, Paragraph } from "theme-ui";
/* eslint-enable @typescript-eslint/no-unused-vars */
import { useLiquity } from "../../../../hooks/LiquityContext";
import { Icon } from "../../../Icon";
import { InfoMessage } from "../../../InfoMessage";
import { useFarmView } from "../../context/FarmViewContext";
import { RemainingLQTY } from "../RemainingLQTY";
import { Yield } from "../Yield";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";

// const uniLink = (lusdAddress: string) => `https://app.uniswap.org/#/add/ETH/${lusdAddress}`;
const csLink = (lusdAddress: string, isVolta = true) => {
  return `https://${
    isVolta ? "999test." : ""
  }carbonswap.exchange/#/swap?inputCurrency=${lusdAddress}&outputCurrency=EWT`;
};

export const Inactive: React.FC = () => {
  const { dispatchEvent } = useFarmView();
  const { chainId } = useWeb3React<Web3Provider>();
  const {
    liquity: {
      connection: { addresses }
    }
  } = useLiquity();

  const handleStakePressed = useCallback(() => {
    dispatchEvent("STAKE_PRESSED");
  }, [dispatchEvent]);

  return (
    <Card>
      <Heading>
        Carbonswap Liquidity Farm
        <Flex sx={{ justifyContent: "flex-end" }}>
          <RemainingLQTY />
        </Flex>
      </Heading>
      <Box sx={{ p: [2, 3] }}>
        <InfoMessage title="You aren't farming AFRR.">
          <Paragraph>You can farm AFRR by staking your Carbonswap EWT/EEUR LP tokens.</Paragraph>

          <Paragraph sx={{ mt: 2 }}>
            You can obtain LP tokens by adding liquidity to the{" "}
            <a
              target="_blank"
              href={csLink(addresses["lusdToken"], chainId === 73799)}
              rel="noreferrer"
            >
              EWT/EEUR pool on Carbonswap. <Icon name="external-link-alt" size="xs" />
            </a>
          </Paragraph>
        </InfoMessage>

        <Flex variant="layout.actions">
          <Flex sx={{ justifyContent: "flex-start", alignItems: "center", flex: 1 }}>
            <Yield />
          </Flex>
          <Button onClick={handleStakePressed}>Stake</Button>
        </Flex>
      </Box>
    </Card>
  );
};
