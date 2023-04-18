// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "./libraries/ExceptionsLibrary.sol";

contract ClearDeposit is Initializable, OwnableUpgradeable, PausableUpgradeable {
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    IERC20Upgradeable public token;
    mapping(address => uint256) public depositOf;
    EnumerableSetUpgradeable.AddressSet private _managerWhitelist;

    // MODIFIERS

    modifier onlyManager() {
        require(isManagerWhitelisted(msg.sender), ExceptionsLibrary.NOT_WHITELISTED);
        _;
    }

    function initialize(address _token) external initializer {
        token = IERC20Upgradeable(_token);
        _managerWhitelist.add(msg.sender);
    }

    function deposit(uint256 amount) external whenNotPaused {
        token.transferFrom(msg.sender, address(this), amount);
        depositOf[msg.sender] += amount;
    }

    function withdrawToAccount(address depositor, uint256 amount) external onlyManager whenNotPaused {
        require(amount <= depositOf[depositor], ExceptionsLibrary.INVALID_AMOUNT);

        depositOf[depositor] -= amount;
        token.transfer(depositor, amount);
    }

    function appealTransfer(address from, address to, uint256 amount) external onlyManager whenNotPaused {
        require(amount <= depositOf[from], ExceptionsLibrary.INVALID_AMOUNT);

        depositOf[from] -= amount;
        token.transfer(to, amount);
    }

    function addManagerToWhitelist(address account) external onlyOwner {
        require(_managerWhitelist.add(account), ExceptionsLibrary.ALREADY_WHITELISTED);
    }

    function removeManagerFromWhitelist(address account) external onlyOwner {
        require(_managerWhitelist.remove(account), ExceptionsLibrary.ALREADY_NOT_WHITELISTED);
    }

    // VIEW FUNCTIONS

    function isManagerWhitelisted(address account) public view returns (bool) {
        return _managerWhitelist.contains(account);
    }

    function whitelistedManagers() external view returns (address[] memory) {
        return _managerWhitelist.values();
    }
}
