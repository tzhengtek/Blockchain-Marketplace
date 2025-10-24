// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./KYCRegistry.sol";
import "./NFTPriceOracle.sol";

contract AssetMarketplace is ReentrancyGuard, Ownable {
    KYCRegistry public kycRegistry;
    NFTPriceOracle public priceOracle;

    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    // NFT contract => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;

    // Marketplace fee (in basis points, e.g., 250 = 2.5%)
    uint256 public marketplaceFee = 250; // 2.5%
    uint256 public constant FEE_DENOMINATOR = 10000;

    // Total fees collected
    uint256 public collectedFees;

    event Listed(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );

    event Sold(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed buyer,
        address seller,
        uint256 price
    );

    event ListingCancelled(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller
    );

    event MarketplaceFeeUpdated(uint256 newFee);
    event FeesWithdrawn(address indexed to, uint256 amount);
    event PriceOracleUpdated(address indexed newOracle);

    constructor(
        address kycRegistryAddress,
        address priceOracleAddress,
        address initialOwner
    ) Ownable(initialOwner) {
        require(kycRegistryAddress != address(0), "AssetMarketplace: Invalid KYC registry");
        require(priceOracleAddress != address(0), "AssetMarketplace: Invalid price oracle");
        kycRegistry = KYCRegistry(kycRegistryAddress);
        priceOracle = NFTPriceOracle(priceOracleAddress);
    }

    modifier onlyKYCVerified() {
        require(kycRegistry.isKYCVerified(msg.sender), "AssetMarketplace: Caller not KYC verified");
        _;
    }

    /**
     * @notice List an NFT for sale
     * @param nftContract The NFT contract address
     * @param tokenId The token ID to list
     * @param price The listing price in BNB
     */
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external onlyKYCVerified nonReentrant {
        require(price > 0, "AssetMarketplace: Price must be greater than 0");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "AssetMarketplace: Not token owner");
        require(
            nft.getApproved(tokenId) == address(this) ||
            nft.isApprovedForAll(msg.sender, address(this)),
            "AssetMarketplace: Marketplace not approved"
        );

        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });

        emit Listed(nftContract, tokenId, msg.sender, price);
    }

    /**
     * @notice List an NFT for sale at the oracle price
     * @param nftContract The NFT contract address
     * @param tokenId The token ID to list
     */
    function listNFTAtOraclePrice(
        address nftContract,
        uint256 tokenId
    ) external onlyKYCVerified nonReentrant {
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "AssetMarketplace: Not token owner");
        require(
            nft.getApproved(tokenId) == address(this) ||
            nft.isApprovedForAll(msg.sender, address(this)),
            "AssetMarketplace: Marketplace not approved"
        );

        // Get oracle price
        (uint256 oraclePrice, uint256 timestamp, ) = priceOracle.getLatestPrice(nftContract, tokenId);
        require(oraclePrice > 0, "AssetMarketplace: No oracle price available");
        require(timestamp > 0, "AssetMarketplace: Oracle price not set");

        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            price: oraclePrice,
            active: true
        });

        emit Listed(nftContract, tokenId, msg.sender, oraclePrice);
    }

    /**
     * @notice Buy a listed NFT
     * @param nftContract The NFT contract address
     * @param tokenId The token ID to buy
     */
    function buyNFT(
        address nftContract,
        uint256 tokenId
    ) external payable onlyKYCVerified nonReentrant {
        Listing memory listing = listings[nftContract][tokenId];

        require(listing.active, "AssetMarketplace: Listing not active");
        require(msg.value == listing.price, "AssetMarketplace: Incorrect payment amount");
        require(msg.sender != listing.seller, "AssetMarketplace: Cannot buy own NFT");
        require(kycRegistry.isKYCVerified(listing.seller), "AssetMarketplace: Seller not KYC verified");

        // Calculate fees
        uint256 fee = (listing.price * marketplaceFee) / FEE_DENOMINATOR;
        uint256 sellerProceeds = listing.price - fee;

        // Mark listing as inactive
        listings[nftContract][tokenId].active = false;

        // Add fee to collected fees
        collectedFees += fee;

        // Transfer NFT to buyer
        IERC721(nftContract).safeTransferFrom(listing.seller, msg.sender, tokenId);

        // Transfer payment to seller
        (bool success, ) = listing.seller.call{value: sellerProceeds}("");
        require(success, "AssetMarketplace: Payment transfer failed");

        emit Sold(nftContract, tokenId, msg.sender, listing.seller, listing.price);
    }

    /**
     * @notice Cancel a listing
     * @param nftContract The NFT contract address
     * @param tokenId The token ID to cancel
     */
    function cancelListing(
        address nftContract,
        uint256 tokenId
    ) external nonReentrant {
        Listing memory listing = listings[nftContract][tokenId];

        require(listing.active, "AssetMarketplace: Listing not active");
        require(listing.seller == msg.sender, "AssetMarketplace: Not listing owner");

        listings[nftContract][tokenId].active = false;

        emit ListingCancelled(nftContract, tokenId, msg.sender);
    }

    /**
     * @notice Update the marketplace fee (owner only)
     * @param newFee New fee in basis points (e.g., 250 = 2.5%)
     */
    function updateMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "AssetMarketplace: Fee cannot exceed 10%");
        marketplaceFee = newFee;
        emit MarketplaceFeeUpdated(newFee);
    }

    /**
     * @notice Withdraw collected fees (owner only)
     */
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 amount = collectedFees;
        require(amount > 0, "AssetMarketplace: No fees to withdraw");

        collectedFees = 0;

        (bool success, ) = owner().call{value: amount}("");
        require(success, "AssetMarketplace: Withdrawal failed");

        emit FeesWithdrawn(owner(), amount);
    }

    /**
     * @notice Update KYC Registry address (owner only)
     * @param newKYCRegistry New KYC registry address
     */
    function updateKYCRegistry(address newKYCRegistry) external onlyOwner {
        require(newKYCRegistry != address(0), "AssetMarketplace: Invalid KYC registry");
        kycRegistry = KYCRegistry(newKYCRegistry);
    }

    /**
     * @notice Update Price Oracle address (owner only)
     * @param newPriceOracle New price oracle address
     */
    function updatePriceOracle(address newPriceOracle) external onlyOwner {
        require(newPriceOracle != address(0), "AssetMarketplace: Invalid price oracle");
        priceOracle = NFTPriceOracle(newPriceOracle);
        emit PriceOracleUpdated(newPriceOracle);
    }

    /**
     * @notice Get listing details
     * @param nftContract The NFT contract address
     * @param tokenId The token ID
     */
    function getListing(
        address nftContract,
        uint256 tokenId
    ) external view returns (address seller, uint256 price, bool active) {
        Listing memory listing = listings[nftContract][tokenId];
        return (listing.seller, listing.price, listing.active);
    }

    /**
     * @notice Check if an NFT is listed
     * @param nftContract The NFT contract address
     * @param tokenId The token ID
     */
    function isListed(
        address nftContract,
        uint256 tokenId
    ) external view returns (bool) {
        return listings[nftContract][tokenId].active;
    }

    /**
     * @notice Get oracle price for an NFT
     * @param nftContract The NFT contract address
     * @param tokenId The token ID
     * @return price Oracle price in wei
     * @return timestamp When the price was last updated
     * @return isIndividualPrice True if individual price, false if floor price
     */
    function getOraclePrice(
        address nftContract,
        uint256 tokenId
    ) external view returns (uint256 price, uint256 timestamp, bool isIndividualPrice) {
        return priceOracle.getLatestPrice(nftContract, tokenId);
    }
}
