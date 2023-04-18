export default class Exceptions {
    static readonly INVALID_AMOUNT: string = "INVALID_AMOUNT";
    static readonly ALREADY_WHITELISTED: string = "ALREADY_WHITELISTED";
    static readonly ALREADY_NOT_WHITELISTED: string = "ALREADY_NOT_WHITELISTED";
    static readonly NOT_WHITELISTED: string = "NOT_WHITELISTED";
    static readonly EXCEEDS_LOCKED_BALANCE: string = "EXCEEDS_LOCKED_BALANCE";
    static readonly EXCEEDS_UNLOCKED_BALANCE: string =
        "EXCEEDS_UNLOCKED_BALANCE";
}
