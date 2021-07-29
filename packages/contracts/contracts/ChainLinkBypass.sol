// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

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
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * IMPORTANT NOTE: ON FIRST LIQUITY CONTRACT DEPLOYMENT THEY CALL PREV PRICE ROUNDID, SO THE TELLOR
 * ORACLE MUST HAVE ALREADY HAD AT LEAST 2 PRICE UPDATES SO TELLOR BLOCK INDEX HEIGHT FOR THE PAIR IS > 1
 * OR THE PRICEFEED.SOL SETADDRESS CALL WILL FAIL/REVERT. IT WAS ASSUMED THE ORACLES ON THE NETWORK HAVE
 * BEEN RUNNING A WHILE BEFORE LIQUITY CONTRACTS ARE DEPLOYED.
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 *
 */
contract ChainLinkBypass is
    Ownable,
    CheckContract,
    BaseMath,
    AggregatorV3Interface
{
    using SafeMath for uint256;

    // TODO: RJA WE WILL HAVE TO CHANGE THIS TO THE DEPLOYED EWTEUR PAIR ID (REQUEST ID) OF EWC TELLOR
    uint256 public constant ETHUSD_TELLOR_REQ_ID = 1;

    uint8 public constant TELLOR_DIGITS = 6; // per PriceFeed.sol and the Tellor team
    string private constant _description = "EWT / EEUR";
    uint8 private constant _version = 1;

    ITellor public tellor;

    struct TellorResponse {
        bool ifRetrieve;
        uint256 value;
        uint256 timestamp;
        bool success;
    }

    constructor(address _tellorMasterAddress) public {
        checkContract(_tellorMasterAddress);
        tellor = ITellor(_tellorMasterAddress);
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

    /*
     * getTellorCurrentValue(): identical to getCurrentValue() in UsingTellor.sol
     *
     * @dev Allows the user to get the latest value for the requestId specified
     * @param _requestId is the requestId to look up the value for
     * @return ifRetrieve bool true if it is able to retrieve a value, the value, and the value's timestamp
     * @return value the value retrieved
     * @return _timestampRetrieved the value's timestamp
     */
    function getTellorCurrentValue(uint256 _requestId)
        internal
        view
        returns (
            bool ifRetrieve,
            uint256 value,
            uint256 _timestampRetrieved
        )
    {
        uint256 _count = tellor.getNewValueCountbyRequestId(_requestId);
        uint256 _time = tellor.getTimestampbyRequestIDandIndex(
            _requestId,
            _count.sub(1)
        );
        uint256 _value = tellor.retrieveData(_requestId, _time);
        if (_value > 0) return (true, _value, _time);
        return (false, 0, _time);
    }

    /* function _getCurrentTellorResponse()
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
    } */

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
        uint256 _requestId = ETHUSD_TELLOR_REQ_ID;
        uint256 _tellorIndex = tellor.getNewValueCountbyRequestId(_requestId);
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
        uint256 _requestId = ETHUSD_TELLOR_REQ_ID;
        uint256 _time = tellor.getTimestampbyRequestIDandIndex(
            _requestId,
            uint256(_roundId).sub(1)
        );
        uint256 _value = tellor.retrieveData(_requestId, _time);
        if (_value > 0)
            return (_roundId, int256(_value), _time, _time, _roundId);
        return (0, 0, _time, _time, 0); // TODO: this is a very bad case, as we do not have a fallback oracle!!
    }
}
