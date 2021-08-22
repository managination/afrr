// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

// This example code is designed to quickly deploy an example contract using Remix.
// example v3 ChainLink aggregator client for ETH / USD Rinkeby

import "./Dependencies/AggregatorV3Interface.sol";

contract PriceConsumerV3 {
    AggregatorV3Interface internal priceFeed;

    /**
     * Network: Rinkeby
     * Aggregator: ETH/USD
     * Address: 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
     */
    constructor() public {
        priceFeed = AggregatorV3Interface(
            0x8A753747A1Fa494EC906cE90E9f37563A8AF630e
        );
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice() public view returns (int256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price;
    }

    function decimals() external view returns (uint8) {
        uint8 _decimals = priceFeed.decimals();
        return _decimals;
    }

    function description() external view returns (string memory) {
        string memory _description = priceFeed.description();
        return _description;
    }

    function version() external view returns (uint256) {
        uint256 _version = priceFeed.version();
        return _version;
    }
}
