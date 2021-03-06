import React, { useState, useEffect } from "react";
import { Card, Box, Heading, Flex, Label } from "theme-ui";
import { LiquityStoreState } from "@liquity/lib-base";
import { useLiquitySelector } from "@liquity/lib-react";
// import { useLiquity } from "../hooks/LiquityContext";
// import { Icon } from "./Icon";
// import { Transaction } from "./Transaction";

const selectPrice = ({ price }: LiquityStoreState) => price;

export const PriceManager: React.FC = () => {
  /*   const {
    liquity: {
      send: liquity,
      connection: { _priceFeedIsTestnet: canSetPrice }
    }
  } = useLiquity(); */

  const price = useLiquitySelector(selectPrice);
  const [editedPrice, setEditedPrice] = useState(price.toString(2));

  useEffect(() => {
    setEditedPrice(price.toString(2));
  }, [price]);

  return (
    <Card>
      <Heading>Price Feed</Heading>

      <Box sx={{ p: [2, 3] }}>
        <Flex sx={{ alignItems: "stretch" }}>
          <Label>EWT:</Label>

          <Label>€{editedPrice}</Label>
        </Flex>
      </Box>
    </Card>
  );
};
