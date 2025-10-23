// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./KYCRegistry.sol";

contract AssetToken is ERC20, ERC20Burnable, Ownable {
    uint8 private _decimals;
    KYCRegistry public kycRegistry;

    event KYCRegistryUpdated(address indexed newKYCRegistry);

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply,
        address initialOwner,
        address kycRegistryAddress
    ) ERC20(name, symbol) Ownable(initialOwner) {
        require(kycRegistryAddress != address(0), "AssetToken: Invalid KYC registry address");
        _decimals = decimals_;
        kycRegistry = KYCRegistry(kycRegistryAddress);
        _mint(initialOwner, initialSupply * 10 ** decimals_);
    }

    modifier onlyKYCVerified() {
        require(kycRegistry.isKYCVerified(msg.sender), "AssetToken: Caller is not KYC verified");
        _;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public onlyOwner onlyKYCVerified {
        require(kycRegistry.isKYCVerified(to), "AssetToken: Recipient is not KYC verified");
        _mint(to, amount);
    }

    function updateKYCRegistry(address newKYCRegistry) public onlyOwner {
        require(newKYCRegistry != address(0), "AssetToken: Invalid KYC registry address");
        kycRegistry = KYCRegistry(newKYCRegistry);
        emit KYCRegistryUpdated(newKYCRegistry);
    }

    function transfer(address to, uint256 value) public override onlyKYCVerified returns (bool) {
        return super.transfer(to, value);
    }

    function transferFrom(address from, address to, uint256 value) public override onlyKYCVerified returns (bool) {
        return super.transferFrom(from, to, value);
    }

    function approve(address spender, uint256 value) public override onlyKYCVerified returns (bool) {
        return super.approve(spender, value);
    }

    function pause() public onlyOwner {
        // Could implement pausable functionality if needed
    }

    function _update(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        // Allow minting (from == address(0)) and burning (to == address(0)) without KYC check on recipient
        // For transfers between addresses, check both sender and recipient
        if (from != address(0) && to != address(0)) {
            require(kycRegistry.isKYCVerified(from), "AssetToken: Sender is not KYC verified");
            require(kycRegistry.isKYCVerified(to), "AssetToken: Recipient is not KYC verified");
        }

        super._update(from, to, amount);
    }
}
