// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

import "./Dependencies/AggregatorV3Interface.sol";
import "./Dependencies/ITellor.sol";
import "./Dependencies/SafeMath.sol";
import "./Dependencies/BaseMath.sol";
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
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * IMPORTANT NOTE: ON FIRST LIQUITY CONTRACT DEPLOYMENT THEY CALL PREV PRICE ROUNDID, SO THE TELLOR
 * ORACLE MUST HAVE ALREADY HAD AT LEAST 2 PRICE UPDATES SO TELLOR BLOCK INDEX HEIGHT FOR THE PAIR IS > 1
 * OR THE PRICEFEED.SOL SETADDRESS CALL WILL FAIL/REVERT. IT WAS ASSUMED THE ORACLES ON THE NETWORK HAVE
 * BEEN RUNNING A WHILE BEFORE LIQUITY CONTRACTS ARE DEPLOYED.
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 *
 * NOTES:
 *
 * 1) TELLOR INDEX IS GREATER WIDTH (uint256) THAN CHAINLINK ROUND ID (uint80)...conversion warning!
 * 2) TELLOR ORACLE RETURNS UNSIGNED VALUES, CHAINLINK EXPECTS SIGNED VALUES...conversion warning!
 *
 */
contract ChainLinkBypass is CheckContract, BaseMath, AggregatorV3Interface {
    using SafeMath for uint256;

    ITellor public tellor;
    uint256 public tellorRequestId;

    uint8 public constant TELLOR_DIGITS = 6; // per PriceFeed.sol and the Tellor team
    string private constant _description = "EWT / EEUR";
    uint8 private constant _version = 1;

    constructor(address _tellorMasterAddress, uint256 _tellorRequestId) public {
        checkContract(_tellorMasterAddress);
        tellor = ITellor(_tellorMasterAddress);
        tellorRequestId = _tellorRequestId;
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

    // get latest Tellor index for the requestId and use that to get data:
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
        uint256 _tellorIndex = tellor.getNewValueCountbyRequestId(
            tellorRequestId
        );
        return this.getRoundData(uint80(_tellorIndex));
    }

    // Note: Link roundId => Tellor index
    // Note: setting answeredInRound to match roundid, as PriceFeed.sol doesn't even use it
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
        uint256 _time = tellor.getTimestampbyRequestIDandIndex(
            tellorRequestId,
            uint256(_roundId).sub(1)
        );
        uint256 _value = tellor.retrieveData(tellorRequestId, _time);
        return (_roundId, int256(_value), _time, _time, _roundId);
    }

    // This method has kind of a weird definition, as Link returns "answers" in int256 format, but that's what the interface spec calls for.
    // Warning Type Conversion
    // Also Liquity has TWO DIFFERENT interface specs for AggregatorV3Interface, one which has this method and one which doesn't!
    // the one we're including doesn't, hence this is not marked override.
    // Also: it's unclear what this really is: a) the "last" answer retrieved from the oracle regardless of round id, or b) the "latest"
    // (i.e. most recent answer) available overall (i.e. the latest round id).
    function latestAnswer() external view returns (uint256) {
        (, int256 answer, , , ) = this.latestRoundData();
        return uint256(answer);
    }
}
