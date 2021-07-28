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
 * ChainLink and Tellor and all their failover logic (which is quite complicated) will work as is.
 * That's the reason for this contract, to avoid any code/logic mods to Liquity contracts.
 *
 * It should be noted of course that since EWC only supports one oracle (Tellor), if that Oracle is down then
 * there will be no prices available. The Liquity contracts will still attempt to (and think they are)
 * calling the Tellor backup oracle, but it still won't have a price as the final result. i.e. there
 * is no oracle redundency on EWC even though the Liquity code expects there to be.
 *
 */
contract ChainLinkBypass is
    Ownable,
    CheckContract,
    BaseMath,
    AggregatorV3Interface
{
    using SafeMath for uint256;

    // TODO: RJA WE WILL HAVE TO CHANGE THIS TO THE EWTEUR PAIR ID OF EWC TELLOR
    uint256 public constant ETHUSD_TELLOR_REQ_ID = 1;

    uint8 public constant TELLOR_DIGITS = 6; // per PriceFeed.sol and the Tellor team
    string private constant _description = "EWT / EEUR";
    uint8 private constant _version = 1;

    ITellorCaller public tellorCaller; // Wrapper contract that calls the Tellor system

    struct TellorResponse {
        bool ifRetrieve;
        uint256 value;
        uint256 timestamp;
        bool success;
    }

    constructor(address _tellorCallerAddress) public {
        checkContract(_tellorCallerAddress);
        tellorCaller = ITellorCaller(_tellorCallerAddress);
    }

    function decimals() external view override returns (uint8) {
        return TELLOR_DIGITS;
    }

    function description() external view override returns (string memory) {
        return _description;
    }

    function version() external view override returns (uint256) {
        return _version;
    }

    function _getCurrentTellorResponse()
        internal
        view
        returns (TellorResponse memory tellorResponse)
    {
        try tellorCaller.getTellorCurrentValue(ETHUSD_TELLOR_REQ_ID) returns (
            bool ifRetrieve,
            uint256 value,
            uint256 _timestampRetrieved
        ) {
            // If call to Tellor succeeds, return the response and success = true
            tellorResponse.ifRetrieve = ifRetrieve;
            tellorResponse.value = value;
            tellorResponse.timestamp = _timestampRetrieved;
            tellorResponse.success = true;

            return (tellorResponse);
        } catch {
            // If call to Tellor reverts, return a zero response with success = false
            return (tellorResponse);
        }
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
        TellorResponse memory tellorResponse = _getCurrentTellorResponse();
        if (tellorResponse.success) {
            // TODO: How to handle this? We only have 1 oracle, which cannot fail, or the whole thing (Liquity) may not work
        }

        // Convert Tellor Oracle response into something that matches ChainLink return format,
        // so Liquity contract can work on it as is, expecting AggregatorV3Interface formatted return data:
        uint80 _roundId = 1; // TODO: ??
        return (
            _roundId,
            int256(tellorResponse.value), // note the cast! small risk if tellor value is max positive unit value, not sure how to handle that
            tellorResponse.timestamp,
            tellorResponse.timestamp,
            _roundId
        );
    }

    // TODO: not sure how to handle roundId being passed in, i.e. how to convert it to a Tellor call for a "previous" price
    function getRoundData(
        uint80 /* _roundId */
    )
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
        return this.latestRoundData();
    }
}
