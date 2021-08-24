// SPDX-License-Identifier: MIT

pragma solidity 0.6.11;

import "../Interfaces/ILQTYToken.sol";
import "../Interfaces/ICommunityIssuance.sol";
import "../Dependencies/BaseMath.sol";
import "../Dependencies/LiquityMath.sol";
import "../Dependencies/Ownable.sol";
import "../Dependencies/CheckContract.sol";
import "../Dependencies/SafeMath.sol";

contract CommunityIssuance is
    ICommunityIssuance,
    Ownable,
    CheckContract,
    BaseMath
{
    using SafeMath for uint256;

    // --- Data ---

    string public constant NAME = "CommunityIssuance";

    uint256 public constant SECONDS_IN_ONE_MINUTE = 60;

    /*
     * The community LQTY supply cap is the starting balance of the Community Issuance contract.
     * It should be minted to this contract by LQTYToken, when the token is deployed.
     *
     * Set to 32M (slightly less than 1/3) of total LQTY supply.
     */
    uint256 public constant LQTYSupplyCap = 100e24; // 100 million, changed from 32mil to match changes to LQTYToken.sol issuance mints

    ILQTYToken public lqtyToken;

    address public stabilityPoolAddress;

    uint256 public totalLQTYIssued;
    uint256 public immutable deploymentTime;

    // --- Events ---

    event LQTYTokenAddressSet(address _lqtyTokenAddress);
    event StabilityPoolAddressSet(address _stabilityPoolAddress);
    event TotalLQTYIssuedUpdated(uint256 _totalLQTYIssued);

    // --- Functions ---

    constructor() public {
        deploymentTime = block.timestamp;
    }

    function setAddresses(
        address _lqtyTokenAddress,
        address _stabilityPoolAddress
    ) external override onlyOwner {
        checkContract(_lqtyTokenAddress);
        checkContract(_stabilityPoolAddress);

        lqtyToken = ILQTYToken(_lqtyTokenAddress);
        stabilityPoolAddress = _stabilityPoolAddress;

        // When LQTYToken deployed, it should have transferred CommunityIssuance's LQTY entitlement
        uint256 LQTYBalance = lqtyToken.balanceOf(address(this));
        assert(LQTYBalance >= LQTYSupplyCap);

        emit LQTYTokenAddressSet(_lqtyTokenAddress);
        emit StabilityPoolAddressSet(_stabilityPoolAddress);

        _renounceOwnership();
    }

    function issueLQTY() external override returns (uint256) {
        _requireCallerIsStabilityPool();

        uint latestTotalLQTYIssued = block.timestamp.sub(deploymentTime).div(SECONDS_IN_ONE_MINUTE).mul(DECIMAL_PRECISION);
        uint issuance = latestTotalLQTYIssued.sub(totalLQTYIssued);

        totalLQTYIssued = latestTotalLQTYIssued;
        emit TotalLQTYIssuedUpdated(latestTotalLQTYIssued);

        return issuance;
    }

    function sendLQTY(address _account, uint256 _LQTYamount) external override {
        _requireCallerIsStabilityPool();

        lqtyToken.transfer(_account, _LQTYamount);
    }

    // --- 'require' functions ---

    function _requireCallerIsStabilityPool() internal view {
        require(
            msg.sender == stabilityPoolAddress,
            "CommunityIssuance: caller is not SP"
        );
    }
}
