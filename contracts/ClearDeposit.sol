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
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public lockedBalanceOf;
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
        deposits[msg.sender] += amount;
        lockedBalanceOf[msg.sender] += amount;
    }

    function withdraw(uint256 amount) external whenNotPaused {
        require(amount <= unlockedBalanceOf(msg.sender), ExceptionsLibrary.EXCEEDS_UNLOCKED_BALANCE);

        deposits[msg.sender] -= amount;
        token.transfer(msg.sender, amount);
    }

    function unlock(address depositor, uint256 amount) external onlyManager whenNotPaused {
        require(amount <= lockedBalanceOf[depositor], ExceptionsLibrary.EXCEEDS_LOCKED_BALANCE);
        lockedBalanceOf[depositor] -= amount;
    }

    function lock(address depositor, uint256 amount) external whenNotPaused {
        require(amount <= unlockedBalanceOf(depositor), ExceptionsLibrary.EXCEEDS_UNLOCKED_BALANCE);
        lockedBalanceOf[depositor] += amount;
    }

    function appealTransfer(address from, address to, uint256 amount) external onlyManager whenNotPaused {
        require(amount <= deposits[msg.sender], ExceptionsLibrary.INVALID_AMOUNT);

        deposits[from] -= amount;
        lockedBalanceOf[msg.sender] -= amount;
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

    function unlockedBalanceOf(address account) public view returns (uint256) {
        return deposits[account] - lockedBalanceOf[account];
    }
}
