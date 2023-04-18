// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

library ExceptionsLibrary {
    string public constant INVALID_AMOUNT = "INVALID_AMOUNT";
    string public constant ALREADY_WHITELISTED = "ALREADY_WHITELISTED";
    string public constant ALREADY_NOT_WHITELISTED = "ALREADY_NOT_WHITELISTED";
    string public constant NOT_WHITELISTED = "NOT_WHITELISTED";
    string public constant EXCEEDS_LOCKED_BALANCE = "EXCEEDS_LOCKED_BALANCE";
    string public constant EXCEEDS_UNLOCKED_BALANCE = "EXCEEDS_UNLOCKED_BALANCE";
}
