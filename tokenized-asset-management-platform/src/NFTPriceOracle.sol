// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTPriceOracle
 * @dev Oracle contract for NFT price feeds with multiple authorized oracle operators
 */
contract NFTPriceOracle is Ownable {
    struct PriceData {
        uint256 price;
        uint256 timestamp;
        address updatedBy;
    }

    // Mapping from NFT collection address and token ID to price data
    mapping(address => mapping(uint256 => PriceData)) public nftPrices;

    // Mapping from NFT collection address to floor price
    mapping(address => PriceData) public collectionFloorPrices;

    // Authorized oracle operators
    mapping(address => bool) public authorizedOracles;

    // Events
    event OracleAuthorized(address indexed oracle);
    event OracleRevoked(address indexed oracle);
    event NFTPriceUpdated(
        address indexed collection,
        uint256 indexed tokenId,
        uint256 price,
        uint256 timestamp,
        address indexed updatedBy
    );
    event FloorPriceUpdated(
        address indexed collection,
        uint256 price,
        uint256 timestamp,
        address indexed updatedBy
    );

    modifier onlyAuthorizedOracle() {
        require(
            authorizedOracles[msg.sender] || msg.sender == owner(),
            "NFTPriceOracle: Not authorized"
        );
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {
        // Owner is automatically authorized
        authorizedOracles[initialOwner] = true;
        emit OracleAuthorized(initialOwner);
    }

    /**
     * @dev Authorize a new oracle operator
     * @param oracle Address of the oracle to authorize
     */
    function authorizeOracle(address oracle) external onlyOwner {
        require(oracle != address(0), "NFTPriceOracle: Invalid oracle address");
        require(!authorizedOracles[oracle], "NFTPriceOracle: Already authorized");

        authorizedOracles[oracle] = true;
        emit OracleAuthorized(oracle);
    }

    /**
     * @dev Revoke oracle authorization
     * @param oracle Address of the oracle to revoke
     */
    function revokeOracle(address oracle) external onlyOwner {
        require(authorizedOracles[oracle], "NFTPriceOracle: Not authorized");
        require(oracle != owner(), "NFTPriceOracle: Cannot revoke owner");

        authorizedOracles[oracle] = false;
        emit OracleRevoked(oracle);
    }

    /**
     * @dev Update price for a specific NFT
     * @param collection Address of the NFT collection
     * @param tokenId Token ID of the NFT
     * @param price New price in wei
     */
    function updateNFTPrice(
        address collection,
        uint256 tokenId,
        uint256 price
    ) external onlyAuthorizedOracle {
        require(collection != address(0), "NFTPriceOracle: Invalid collection address");
        require(price > 0, "NFTPriceOracle: Price must be greater than 0");

        nftPrices[collection][tokenId] = PriceData({
            price: price,
            timestamp: block.timestamp,
            updatedBy: msg.sender
        });

        emit NFTPriceUpdated(collection, tokenId, price, block.timestamp, msg.sender);
    }

    /**
     * @dev Batch update prices for multiple NFTs in the same collection
     * @param collection Address of the NFT collection
     * @param tokenIds Array of token IDs
     * @param prices Array of prices corresponding to token IDs
     */
    function batchUpdateNFTPrices(
        address collection,
        uint256[] calldata tokenIds,
        uint256[] calldata prices
    ) external onlyAuthorizedOracle {
        require(collection != address(0), "NFTPriceOracle: Invalid collection address");
        require(tokenIds.length == prices.length, "NFTPriceOracle: Length mismatch");
        require(tokenIds.length > 0, "NFTPriceOracle: Empty arrays");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(prices[i] > 0, "NFTPriceOracle: Price must be greater than 0");

            nftPrices[collection][tokenIds[i]] = PriceData({
                price: prices[i],
                timestamp: block.timestamp,
                updatedBy: msg.sender
            });

            emit NFTPriceUpdated(collection, tokenIds[i], prices[i], block.timestamp, msg.sender);
        }
    }

    /**
     * @dev Update floor price for an entire NFT collection
     * @param collection Address of the NFT collection
     * @param price Floor price in wei
     */
    function updateFloorPrice(
        address collection,
        uint256 price
    ) external onlyAuthorizedOracle {
        require(collection != address(0), "NFTPriceOracle: Invalid collection address");
        require(price > 0, "NFTPriceOracle: Price must be greater than 0");

        collectionFloorPrices[collection] = PriceData({
            price: price,
            timestamp: block.timestamp,
            updatedBy: msg.sender
        });

        emit FloorPriceUpdated(collection, price, block.timestamp, msg.sender);
    }

    /**
     * @dev Get price data for a specific NFT
     * @param collection Address of the NFT collection
     * @param tokenId Token ID of the NFT
     * @return price Price of the NFT in wei
     * @return timestamp When the price was last updated
     * @return updatedBy Address that last updated the price
     */
    function getNFTPrice(
        address collection,
        uint256 tokenId
    ) external view returns (uint256 price, uint256 timestamp, address updatedBy) {
        PriceData memory data = nftPrices[collection][tokenId];
        return (data.price, data.timestamp, data.updatedBy);
    }

    /**
     * @dev Get floor price for a collection
     * @param collection Address of the NFT collection
     * @return price Floor price of the collection in wei
     * @return timestamp When the price was last updated
     * @return updatedBy Address that last updated the price
     */
    function getFloorPrice(
        address collection
    ) external view returns (uint256 price, uint256 timestamp, address updatedBy) {
        PriceData memory data = collectionFloorPrices[collection];
        return (data.price, data.timestamp, data.updatedBy);
    }

    /**
     * @dev Get the latest price for an NFT (returns individual price if available, otherwise floor price)
     * @param collection Address of the NFT collection
     * @param tokenId Token ID of the NFT
     * @return price Latest available price in wei
     * @return timestamp When the price was last updated
     * @return isIndividualPrice True if individual price is used, false if floor price
     */
    function getLatestPrice(
        address collection,
        uint256 tokenId
    ) external view returns (uint256 price, uint256 timestamp, bool isIndividualPrice) {
        PriceData memory individualPrice = nftPrices[collection][tokenId];

        if (individualPrice.timestamp > 0) {
            return (individualPrice.price, individualPrice.timestamp, true);
        }

        PriceData memory floorPrice = collectionFloorPrices[collection];
        return (floorPrice.price, floorPrice.timestamp, false);
    }

    /**
     * @dev Check if an oracle is authorized
     * @param oracle Address to check
     * @return bool True if authorized
     */
    function isAuthorized(address oracle) external view returns (bool) {
        return authorizedOracles[oracle];
    }
}
