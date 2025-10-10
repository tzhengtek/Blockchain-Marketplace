// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./KYCRegistry.sol";

contract AssetNFT is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    uint256 private _tokenIdCounter;
    KYCRegistry public kycRegistry;

    struct AssetMetadata {
        string name;
        string description;
        uint256 value;
        string assetType;
        uint256 createdAt;
    }

    mapping(uint256 => AssetMetadata) public assetMetadata;

    event AssetMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string name,
        uint256 value,
        string assetType
    );

    event KYCRegistryUpdated(address indexed newKYCRegistry);

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner,
        address kycRegistryAddress
    ) ERC721(name, symbol) Ownable(initialOwner) {
        require(kycRegistryAddress != address(0), "AssetNFT: Invalid KYC registry address");
        kycRegistry = KYCRegistry(kycRegistryAddress);
    }


    function mintAsset(
        address to,
        string memory uri,
        string memory assetName,
        string memory description,
        uint256 value,
        string memory assetType
    ) public onlyOwner returns (uint256) {
        require(kycRegistry.isKYCVerified(to), "AssetNFT: Recipient is not KYC verified");
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        assetMetadata[tokenId] = AssetMetadata({
            name: assetName,
            description: description,
            value: value,
            assetType: assetType,
            createdAt: block.timestamp
        });

        emit AssetMinted(tokenId, to, assetName, value, assetType);

        return tokenId;
    }

    function updateAssetValue(
        uint256 tokenId,
        uint256 newValue
    ) public onlyOwner {
        require(
            _ownerOf(tokenId) != address(0),
            "AssetNFT: Asset does not exist"
        );
        assetMetadata[tokenId].value = newValue;
    }

    function getAssetMetadata(
        uint256 tokenId
    ) public view returns (AssetMetadata memory) {
        require(
            _ownerOf(tokenId) != address(0),
            "AssetNFT: Asset does not exist"
        );
        return assetMetadata[tokenId];
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }


    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function updateKYCRegistry(address newKYCRegistry) public onlyOwner {
        require(newKYCRegistry != address(0), "AssetNFT: Invalid KYC registry address");
        kycRegistry = KYCRegistry(newKYCRegistry);
        emit KYCRegistryUpdated(newKYCRegistry);
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);

        // Allow burning (to == address(0)) without KYC check
        // Allow minting from address(0) as it's handled in mintAsset
        // For transfers between addresses, check both sender and recipient KYC
        if (from != address(0) && to != address(0)) {
            require(kycRegistry.isKYCVerified(from), "AssetNFT: Sender is not KYC verified");
            require(kycRegistry.isKYCVerified(to), "AssetNFT: Recipient is not KYC verified");
        }

        if (to == address(0)) {
            delete assetMetadata[tokenId];
        }

        return super._update(to, tokenId, auth);
    }
}
