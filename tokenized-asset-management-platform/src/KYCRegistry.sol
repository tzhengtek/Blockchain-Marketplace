// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KYCRegistry
 * @dev Acts as an oracle/registry for KYC verification
 * Other contracts can check if an address is KYC verified before allowing operations
 */
contract KYCRegistry is Ownable {
    // Mapping to track KYC verified addresses
    mapping(address => bool) private _kycVerified;

    // Mapping to track authorized addresses that can manage KYC
    mapping(address => bool) private _authorizedAddresses;

    // Events
    event KYCAdded(address indexed account);
    event KYCRevoked(address indexed account);
    event AuthorizedAddressAdded(address indexed account);
    event AuthorizedAddressRemoved(address indexed account);

    // Modifier to check if caller is owner or authorized
    modifier onlyOwnerOrAuthorized() {
        require(
            msg.sender == owner() || _authorizedAddresses[msg.sender],
            "KYCRegistry: Caller is not owner or authorized"
        );
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Add an address to the authorized list
     * @param account Address to authorize
     */
    function addAuthorizedAddress(address account) public onlyOwner {
        require(
            account != address(0),
            "KYCRegistry: Cannot authorize zero address"
        );
        require(
            !_authorizedAddresses[account],
            "KYCRegistry: Address already authorized"
        );
        _authorizedAddresses[account] = true;
        emit AuthorizedAddressAdded(account);
    }

    /**
     * @dev Remove an address from the authorized list
     * @param account Address to remove authorization
     */
    function removeAuthorizedAddress(address account) public onlyOwner {
        require(
            _authorizedAddresses[account],
            "KYCRegistry: Address not authorized"
        );
        _authorizedAddresses[account] = false;
        emit AuthorizedAddressRemoved(account);
    }

    /**
     * @dev Check if an address is authorized
     * @param account Address to check
     * @return bool True if authorized
     */
    function isAuthorized(address account) public view returns (bool) {
        return _authorizedAddresses[account];
    }

    /**
     * @dev Add an address to KYC registry
     * @param account Address to verify
     */
    function addKYC(address account) public onlyOwnerOrAuthorized {
        require(
            account != address(0),
            "KYCRegistry: Cannot verify zero address"
        );
        _kycVerified[account] = true;
        emit KYCAdded(account);
    }

    /**
     * @dev Add multiple addresses to KYC registry in batch
     * @param accounts Array of addresses to verify
     */
    function addKYCBatch(
        address[] calldata accounts
    ) public onlyOwnerOrAuthorized {
        for (uint256 i = 0; i < accounts.length; i++) {
            require(
                accounts[i] != address(0),
                "KYCRegistry: Cannot verify zero address"
            );
            _kycVerified[accounts[i]] = true;
            emit KYCAdded(accounts[i]);
        }
    }

    /**
     * @dev Revoke KYC verification for an address
     * @param account Address to revoke
     */
    function revokeKYC(address account) public onlyOwnerOrAuthorized {
        _kycVerified[account] = false;
        emit KYCRevoked(account);
    }

    /**
     * @dev Check if an address is KYC verified
     * @param account Address to check
     * @return bool True if verified
     */
    function isKYCVerified(address account) public view returns (bool) {
        return _kycVerified[account];
    }
}
