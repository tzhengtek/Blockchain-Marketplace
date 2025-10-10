// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {AssetNFT} from "../src/AssetNFT.sol";
import {KYCRegistry} from "../src/KYCRegistry.sol";

contract AssetNFTTest is Test {
    AssetNFT public assetNFT;
    KYCRegistry public kycRegistry;

    address public owner;
    address public user1;
    address public user2;
    address public user3;

    event AssetMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string name,
        uint256 value,
        string assetType
    );
    event KYCRegistryUpdated(address indexed newKYCRegistry);
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");

        // Deploy KYC Registry
        kycRegistry = new KYCRegistry(owner);

        // Deploy AssetNFT
        assetNFT = new AssetNFT("Asset NFT", "ANFT", owner, address(kycRegistry));

        // KYC verify users
        kycRegistry.addKYC(user1);
        kycRegistry.addKYC(user2);
    }

    // ============ Constructor Tests ============

    function test_Constructor() public view {
        assertEq(assetNFT.owner(), owner);
        assertEq(address(assetNFT.kycRegistry()), address(kycRegistry));
        assertEq(assetNFT.name(), "Asset NFT");
        assertEq(assetNFT.symbol(), "ANFT");
    }

    function test_Constructor_RevertWhen_InvalidKYCRegistry() public {
        vm.expectRevert("AssetNFT: Invalid KYC registry address");
        new AssetNFT("Asset NFT", "ANFT", owner, address(0));
    }

    // ============ mintAsset Tests ============

    function test_MintAsset_Success() public {
        vm.expectEmit(true, true, false, true);
        emit AssetMinted(0, user1, "Gold Bar", 1000, "Precious Metal");

        uint256 tokenId = assetNFT.mintAsset(
            user1,
            "ipfs://metadata",
            "Gold Bar",
            "1kg Gold Bar",
            1000,
            "Precious Metal"
        );

        assertEq(tokenId, 0);
        assertEq(assetNFT.ownerOf(0), user1);
        assertEq(assetNFT.tokenURI(0), "ipfs://metadata");
        assertEq(assetNFT.balanceOf(user1), 1);

        AssetNFT.AssetMetadata memory metadata = assetNFT.getAssetMetadata(0);
        assertEq(metadata.name, "Gold Bar");
        assertEq(metadata.description, "1kg Gold Bar");
        assertEq(metadata.value, 1000);
        assertEq(metadata.assetType, "Precious Metal");
        assertEq(metadata.createdAt, block.timestamp);
    }

    function test_MintAsset_MultipleAssets() public {
        uint256 tokenId1 = assetNFT.mintAsset(
            user1,
            "ipfs://metadata1",
            "Asset 1",
            "First Asset",
            100,
            "Type A"
        );

        uint256 tokenId2 = assetNFT.mintAsset(
            user2,
            "ipfs://metadata2",
            "Asset 2",
            "Second Asset",
            200,
            "Type B"
        );

        assertEq(tokenId1, 0);
        assertEq(tokenId2, 1);
        assertEq(assetNFT.ownerOf(0), user1);
        assertEq(assetNFT.ownerOf(1), user2);
        assertEq(assetNFT.balanceOf(user1), 1);
        assertEq(assetNFT.balanceOf(user2), 1);
    }

    function test_MintAsset_RevertWhen_RecipientNotKYCVerified() public {
        vm.expectRevert("AssetNFT: Recipient is not KYC verified");
        assetNFT.mintAsset(
            user3, // user3 is not KYC verified
            "ipfs://metadata",
            "Asset",
            "Description",
            100,
            "Type"
        );
    }

    function test_MintAsset_RevertWhen_NotOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        assetNFT.mintAsset(
            user2,
            "ipfs://metadata",
            "Asset",
            "Description",
            100,
            "Type"
        );
    }

    // ============ updateAssetValue Tests ============

    function test_UpdateAssetValue_Success() public {
        uint256 tokenId = assetNFT.mintAsset(
            user1,
            "ipfs://metadata",
            "Gold Bar",
            "1kg Gold Bar",
            1000,
            "Precious Metal"
        );

        assetNFT.updateAssetValue(tokenId, 1500);

        AssetNFT.AssetMetadata memory metadata = assetNFT.getAssetMetadata(tokenId);
        assertEq(metadata.value, 1500);
    }

    function test_UpdateAssetValue_RevertWhen_AssetDoesNotExist() public {
        vm.expectRevert("AssetNFT: Asset does not exist");
        assetNFT.updateAssetValue(999, 1000);
    }

    function test_UpdateAssetValue_RevertWhen_NotOwner() public {
        uint256 tokenId = assetNFT.mintAsset(
            user1,
            "ipfs://metadata",
            "Asset",
            "Description",
            100,
            "Type"
        );

        vm.prank(user1);
        vm.expectRevert();
        assetNFT.updateAssetValue(tokenId, 200);
    }

    // ============ getAssetMetadata Tests ============

    function test_GetAssetMetadata_Success() public {
        uint256 tokenId = assetNFT.mintAsset(
            user1,
            "ipfs://metadata",
            "Gold Bar",
            "1kg Gold Bar",
            1000,
            "Precious Metal"
        );

        AssetNFT.AssetMetadata memory metadata = assetNFT.getAssetMetadata(tokenId);
        assertEq(metadata.name, "Gold Bar");
        assertEq(metadata.description, "1kg Gold Bar");
        assertEq(metadata.value, 1000);
        assertEq(metadata.assetType, "Precious Metal");
    }

    function test_GetAssetMetadata_RevertWhen_AssetDoesNotExist() public {
        vm.expectRevert("AssetNFT: Asset does not exist");
        assetNFT.getAssetMetadata(999);
    }

    // ============ Transfer Tests (KYC Verification) ============

    function test_Transfer_Success_BothKYCVerified() public {
        uint256 tokenId = assetNFT.mintAsset(
            user1,
            "ipfs://metadata",
            "Asset",
            "Description",
            100,
            "Type"
        );

        vm.prank(user1);
        assetNFT.transferFrom(user1, user2, tokenId);

        assertEq(assetNFT.ownerOf(tokenId), user2);
        assertEq(assetNFT.balanceOf(user1), 0);
        assertEq(assetNFT.balanceOf(user2), 1);
    }

    function test_Transfer_RevertWhen_SenderNotKYCVerified() public {
        uint256 tokenId = assetNFT.mintAsset(
            user1,
            "ipfs://metadata",
            "Asset",
            "Description",
            100,
            "Type"
        );

        // Revoke user1's KYC
        kycRegistry.revokeKYC(user1);

        vm.prank(user1);
        vm.expectRevert("AssetNFT: Sender is not KYC verified");
        assetNFT.transferFrom(user1, user2, tokenId);
    }

    function test_Transfer_RevertWhen_RecipientNotKYCVerified() public {
        uint256 tokenId = assetNFT.mintAsset(
            user1,
            "ipfs://metadata",
            "Asset",
            "Description",
            100,
            "Type"
        );

        vm.prank(user1);
        vm.expectRevert("AssetNFT: Recipient is not KYC verified");
        assetNFT.transferFrom(user1, user3, tokenId); // user3 not KYC verified
    }

    function test_SafeTransferFrom_Success() public {
        uint256 tokenId = assetNFT.mintAsset(
            user1,
            "ipfs://metadata",
            "Asset",
            "Description",
            100,
            "Type"
        );

        vm.prank(user1);
        assetNFT.safeTransferFrom(user1, user2, tokenId);

        assertEq(assetNFT.ownerOf(tokenId), user2);
    }

    function test_SafeTransferFrom_RevertWhen_RecipientNotKYCVerified() public {
        uint256 tokenId = assetNFT.mintAsset(
            user1,
            "ipfs://metadata",
            "Asset",
            "Description",
            100,
            "Type"
        );

        vm.prank(user1);
        vm.expectRevert("AssetNFT: Recipient is not KYC verified");
        assetNFT.safeTransferFrom(user1, user3, tokenId);
    }

    // ============ Burn Tests ============

    function test_Burn_Success() public {
        uint256 tokenId = assetNFT.mintAsset(
            user1,
            "ipfs://metadata",
            "Asset",
            "Description",
            100,
            "Type"
        );

        vm.prank(user1);
        assetNFT.burn(tokenId);

        assertEq(assetNFT.balanceOf(user1), 0);

        // Metadata should be deleted
        vm.expectRevert("AssetNFT: Asset does not exist");
        assetNFT.getAssetMetadata(tokenId);
    }

    function test_Burn_DeletesMetadata() public {
        uint256 tokenId = assetNFT.mintAsset(
            user1,
            "ipfs://metadata",
            "Gold Bar",
            "1kg Gold Bar",
            1000,
            "Precious Metal"
        );

        // Verify metadata exists
        AssetNFT.AssetMetadata memory metadata = assetNFT.getAssetMetadata(tokenId);
        assertEq(metadata.name, "Gold Bar");

        vm.prank(user1);
        assetNFT.burn(tokenId);

        // Verify metadata is deleted
        vm.expectRevert("AssetNFT: Asset does not exist");
        assetNFT.getAssetMetadata(tokenId);
    }

    // ============ updateKYCRegistry Tests ============

    function test_UpdateKYCRegistry_Success() public {
        KYCRegistry newKYCRegistry = new KYCRegistry(owner);

        vm.expectEmit(true, false, false, false);
        emit KYCRegistryUpdated(address(newKYCRegistry));

        assetNFT.updateKYCRegistry(address(newKYCRegistry));

        assertEq(address(assetNFT.kycRegistry()), address(newKYCRegistry));
    }

    function test_UpdateKYCRegistry_RevertWhen_InvalidAddress() public {
        vm.expectRevert("AssetNFT: Invalid KYC registry address");
        assetNFT.updateKYCRegistry(address(0));
    }

    function test_UpdateKYCRegistry_RevertWhen_NotOwner() public {
        KYCRegistry newKYCRegistry = new KYCRegistry(owner);

        vm.prank(user1);
        vm.expectRevert();
        assetNFT.updateKYCRegistry(address(newKYCRegistry));
    }

    // ============ ERC721 Standard Tests ============

    function test_SupportsInterface() public view {
        // ERC721
        assertTrue(assetNFT.supportsInterface(0x80ac58cd));
        // ERC721Metadata
        assertTrue(assetNFT.supportsInterface(0x5b5e139f));
    }

    function test_TokenURI() public {
        uint256 tokenId = assetNFT.mintAsset(
            user1,
            "ipfs://QmTest",
            "Asset",
            "Description",
            100,
            "Type"
        );

        assertEq(assetNFT.tokenURI(tokenId), "ipfs://QmTest");
    }

    function test_Approve_Success() public {
        uint256 tokenId = assetNFT.mintAsset(
            user1,
            "ipfs://metadata",
            "Asset",
            "Description",
            100,
            "Type"
        );

        vm.prank(user1);
        assetNFT.approve(user2, tokenId);

        assertEq(assetNFT.getApproved(tokenId), user2);
    }

    function test_SetApprovalForAll_Success() public {
        assetNFT.mintAsset(
            user1,
            "ipfs://metadata",
            "Asset",
            "Description",
            100,
            "Type"
        );

        vm.prank(user1);
        assetNFT.setApprovalForAll(user2, true);

        assertTrue(assetNFT.isApprovedForAll(user1, user2));
    }

    function test_TransferFrom_WithApproval() public {
        uint256 tokenId = assetNFT.mintAsset(
            user1,
            "ipfs://metadata",
            "Asset",
            "Description",
            100,
            "Type"
        );

        // user1 approves user2
        vm.prank(user1);
        assetNFT.approve(user2, tokenId);

        // user2 transfers on behalf of user1
        kycRegistry.addKYC(user2);
        vm.prank(user2);
        assetNFT.transferFrom(user1, user2, tokenId);

        assertEq(assetNFT.ownerOf(tokenId), user2);
    }

    // ============ Integration Tests ============

    function test_Integration_FullLifecycle() public {
        // Mint asset to user1
        uint256 tokenId = assetNFT.mintAsset(
            user1,
            "ipfs://metadata",
            "Gold Bar",
            "1kg Gold Bar",
            1000,
            "Precious Metal"
        );

        // Update asset value
        assetNFT.updateAssetValue(tokenId, 1500);

        // Transfer to user2
        vm.prank(user1);
        assetNFT.transferFrom(user1, user2, tokenId);
        assertEq(assetNFT.ownerOf(tokenId), user2);

        // user2 burns the asset
        vm.prank(user2);
        assetNFT.burn(tokenId);

        vm.expectRevert();
        assetNFT.ownerOf(tokenId);
    }


    function test_Integration_KYCRegistryUpdate() public {
        // Mint with original KYC registry
        uint256 tokenId = assetNFT.mintAsset(
            user1,
            "ipfs://metadata",
            "Asset",
            "Description",
            100,
            "Type"
        );

        // Create new KYC registry and verify user2
        KYCRegistry newKYCRegistry = new KYCRegistry(owner);
        newKYCRegistry.addKYC(user1);
        newKYCRegistry.addKYC(user2);

        // Update KYC registry
        assetNFT.updateKYCRegistry(address(newKYCRegistry));

        // Transfer should work with new registry
        vm.prank(user1);
        assetNFT.transferFrom(user1, user2, tokenId);
        assertEq(assetNFT.ownerOf(tokenId), user2);
    }

    // ============ Fuzz Tests ============

    function testFuzz_MintAsset_AnyValue(uint256 value) public {
        uint256 tokenId = assetNFT.mintAsset(
            user1,
            "ipfs://metadata",
            "Asset",
            "Description",
            value,
            "Type"
        );

        AssetNFT.AssetMetadata memory metadata = assetNFT.getAssetMetadata(tokenId);
        assertEq(metadata.value, value);
    }

    function testFuzz_UpdateAssetValue_AnyValue(uint256 initialValue, uint256 newValue) public {
        uint256 tokenId = assetNFT.mintAsset(
            user1,
            "ipfs://metadata",
            "Asset",
            "Description",
            initialValue,
            "Type"
        );

        assetNFT.updateAssetValue(tokenId, newValue);

        AssetNFT.AssetMetadata memory metadata = assetNFT.getAssetMetadata(tokenId);
        assertEq(metadata.value, newValue);
    }

    function testFuzz_MintAndTransfer(address recipient) public {
        vm.assume(recipient != address(0));
        vm.assume(recipient.code.length == 0); // Not a contract

        kycRegistry.addKYC(recipient);

        uint256 tokenId = assetNFT.mintAsset(
            recipient,
            "ipfs://metadata",
            "Asset",
            "Description",
            100,
            "Type"
        );

        assertEq(assetNFT.ownerOf(tokenId), recipient);
        assertEq(assetNFT.balanceOf(recipient), 1);
    }
}
