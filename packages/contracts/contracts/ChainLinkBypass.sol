// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

import "./Interfaces/ITellorCaller.sol";
import "./Dependencies/AggregatorV3Interface.sol";
import "./Dependencies/ITellor.sol";
import "./Dependencies/SafeMath.sol";
import "./Dependencies/BaseMath.sol";
import "./Dependencies/Ownable.sol";
import "./Dependencies/CheckContract.sol";

/*
 * This contract is a way to spoof Liquity into thinking it's calling ChainLink but actually getting
 * the value from Tellor (which is the only oracle supported on EWC). Since we will set this contract
 * as the Liquity ChainLink contract address, Liquity contracts will still think they are calling both
 * ChainLink and Tellor, and all their Failover loic (which is horribly complicated) will work as is.
 * That's the reason for this contract, to avoid any code/logic mods to Liquity contracts. It should be
 * noted of course that since EWC only supports one oracle (Tellor), if that Oracle is down then
 * there will be no prices available. The Liquity contracts will still attempt to (and think they are)
 * calling the Tellor contract also, but it still won't have a price as the final result. i.e. there
 * is no oracle redundency on EWC, even though the Liquity code expects there to be.
 *
 */
contract ChainLinkBypass is
    Ownable,
    CheckContract,
    BaseMath,
    AggregatorV3Interface
{
    using SafeMath for uint256;

    ITellorCaller public tellorCaller; // Wrapper contract that calls the Tellor system

    struct TellorResponse {
        bool ifRetrieve;
        uint256 value;
        uint256 timestamp;
        bool success;
    }

    constructor
    (
        address _tellorCallerAddress
    ) 
        public 
    {
        checkContract(_tellorCallerAddress);
        tellorCaller = ITellorCaller(_tellorCallerAddress);
    }

    function decimals() external view override returns (uint8) {
        // TODO
    }

    function description() external view override returns (string memory) {
        // TODO
    }

    function version() external view override returns (uint256) {
        // TODO
    }

    // getRoundData and latestRoundData should both raise "No data present"
    // if they do not have data to report, instead of returning unset values
    // which could be misinterpreted as actual reported values.
    function getRoundData(uint80 _roundId)
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        // TODO
    }

    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        // TODO
    }
}
