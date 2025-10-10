// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {AssetToken} from "../src/AssetToken.sol";
import {KYCRegistry} from "../src/KYCRegistry.sol";

contract AssetTokenTest is Test {
    AssetToken public assetToken;
    KYCRegistry public kycRegistry;

    address public owner;
    address public user1;
    address public user2;
    address public user3;

    uint8 constant DECIMALS = 18;
    uint256 constant INITIAL_SUPPLY = 1000000;

    event KYCRegistryUpdated(address indexed newKYCRegistry);
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");

        // Deploy KYC Registry
        kycRegistry = new KYCRegistry(owner);

        // Deploy AssetToken
        assetToken = new AssetToken(
            "Asset Token",
            "ATK",
            DECIMALS,
            INITIAL_SUPPLY,
            owner,
            address(kycRegistry)
        );

        // KYC verify users
        kycRegistry.addKYC(user1);
        kycRegistry.addKYC(user2);
    }

    // ============ Constructor Tests ============

    function test_Constructor() public view {
        assertEq(assetToken.owner(), owner);
        assertEq(address(assetToken.kycRegistry()), address(kycRegistry));
        assertEq(assetToken.name(), "Asset Token");
        assertEq(assetToken.symbol(), "ATK");
        assertEq(assetToken.decimals(), DECIMALS);
        assertEq(assetToken.totalSupply(), INITIAL_SUPPLY * 10 ** DECIMALS);
        assertEq(assetToken.balanceOf(owner), INITIAL_SUPPLY * 10 ** DECIMALS);
    }

    function test_Constructor_RevertWhen_InvalidKYCRegistry() public {
        vm.expectRevert("AssetToken: Invalid KYC registry address");
        new AssetToken(
            "Asset Token",
            "ATK",
            DECIMALS,
            INITIAL_SUPPLY,
            owner,
            address(0)
        );
    }

    // ============ mint Tests ============

    function test_Mint_Success() public {
        kycRegistry.addKYC(owner);
        uint256 mintAmount = 1000 * 10 ** DECIMALS;
        uint256 initialSupply = assetToken.totalSupply();

        assetToken.mint(user1, mintAmount);

        assertEq(assetToken.balanceOf(user1), mintAmount);
        assertEq(assetToken.totalSupply(), initialSupply + mintAmount);
    }

    function test_Mint_RevertWhen_CallerNotKYCVerified() public {
        // owner is not KYC verified
        uint256 mintAmount = 1000 * 10 ** DECIMALS;

        vm.expectRevert("AssetToken: Caller is not KYC verified");
        assetToken.mint(user1, mintAmount);
    }

    function test_Mint_RevertWhen_RecipientNotKYCVerified() public {
        kycRegistry.addKYC(owner);
        uint256 mintAmount = 1000 * 10 ** DECIMALS;

        vm.expectRevert("AssetToken: Recipient is not KYC verified");
        assetToken.mint(user3, mintAmount); // user3 not KYC verified
    }

    function test_Mint_RevertWhen_NotOwner() public {
        kycRegistry.addKYC(user1);
        uint256 mintAmount = 1000 * 10 ** DECIMALS;

        vm.prank(user1);
        vm.expectRevert();
        assetToken.mint(user2, mintAmount);
    }

    // ============ transfer Tests ============

    function test_Transfer_Success() public {
        kycRegistry.addKYC(owner);
        uint256 transferAmount = 100 * 10 ** DECIMALS;

        // First transfer some tokens to user1
        assetToken.transfer(user1, transferAmount);

        // user1 transfers to user2
        vm.prank(user1);
        assetToken.transfer(user2, transferAmount);

        assertEq(assetToken.balanceOf(user1), 0);
        assertEq(assetToken.balanceOf(user2), transferAmount);
    }

    function test_Transfer_RevertWhen_SenderNotKYCVerified() public {
        kycRegistry.addKYC(owner);
        uint256 transferAmount = 100 * 10 ** DECIMALS;

        // Transfer to user1
        assetToken.transfer(user1, transferAmount);

        // Revoke user1's KYC
        kycRegistry.revokeKYC(user1);

        vm.prank(user1);
        vm.expectRevert("AssetToken: Caller is not KYC verified");
        assetToken.transfer(user2, transferAmount);
    }

    function test_Transfer_RevertWhen_RecipientNotKYCVerified() public {
        kycRegistry.addKYC(owner);
        uint256 transferAmount = 100 * 10 ** DECIMALS;

        assetToken.transfer(user1, transferAmount);

        vm.prank(user1);
        vm.expectRevert("AssetToken: Recipient is not KYC verified");
        assetToken.transfer(user3, transferAmount); // user3 not KYC verified
    }

    // ============ transferFrom Tests ============

    function test_TransferFrom_Success() public {
        kycRegistry.addKYC(owner);
        uint256 transferAmount = 100 * 10 ** DECIMALS;

        // Transfer to user1
        assetToken.transfer(user1, transferAmount);

        // user1 approves user2
        vm.prank(user1);
        assetToken.approve(user2, transferAmount);

        // user2 transfers from user1 to user2
        vm.prank(user2);
        assetToken.transferFrom(user1, user2, transferAmount);

        assertEq(assetToken.balanceOf(user1), 0);
        assertEq(assetToken.balanceOf(user2), transferAmount);
    }

    function test_TransferFrom_RevertWhen_SenderNotKYCVerified() public {
        kycRegistry.addKYC(owner);
        uint256 transferAmount = 100 * 10 ** DECIMALS;

        // Transfer to user1
        assetToken.transfer(user1, transferAmount);

        // user1 approves user2
        vm.prank(user1);
        assetToken.approve(user2, transferAmount);

        // Revoke user1's KYC
        kycRegistry.revokeKYC(user1);

        vm.prank(user2);
        vm.expectRevert("AssetToken: Sender is not KYC verified");
        assetToken.transferFrom(user1, user2, transferAmount);
    }

    function test_TransferFrom_RevertWhen_RecipientNotKYCVerified() public {
        kycRegistry.addKYC(owner);
        uint256 transferAmount = 100 * 10 ** DECIMALS;

        // Transfer to user1
        assetToken.transfer(user1, transferAmount);

        // user1 approves user2
        vm.prank(user1);
        assetToken.approve(user2, transferAmount);

        vm.prank(user2);
        vm.expectRevert("AssetToken: Recipient is not KYC verified");
        assetToken.transferFrom(user1, user3, transferAmount); // user3 not KYC verified
    }

    // ============ approve Tests ============

    function test_Approve_Success() public {
        kycRegistry.addKYC(owner);
        uint256 transferAmount = 100 * 10 ** DECIMALS;

        assetToken.transfer(user1, transferAmount);

        vm.prank(user1);
        assetToken.approve(user2, transferAmount);

        assertEq(assetToken.allowance(user1, user2), transferAmount);
    }

    function test_Approve_RevertWhen_OwnerNotKYCVerified() public {
        vm.expectRevert("AssetToken: Caller is not KYC verified");
        assetToken.approve(user1, 100 * 10 ** DECIMALS);
    }

    // ============ burn Tests ============

    function test_Burn_Success() public {
        kycRegistry.addKYC(owner);
        uint256 burnAmount = 100 * 10 ** DECIMALS;
        uint256 transferAmount = 200 * 10 ** DECIMALS;
        uint256 initialSupply = assetToken.totalSupply();

        // Transfer to user1
        assetToken.transfer(user1, transferAmount);

        vm.prank(user1);
        assetToken.burn(burnAmount);

        assertEq(assetToken.balanceOf(user1), transferAmount - burnAmount);
        assertEq(assetToken.totalSupply(), initialSupply - burnAmount);
    }

    function test_BurnFrom_Success() public {
        kycRegistry.addKYC(owner);
        uint256 burnAmount = 100 * 10 ** DECIMALS;
        uint256 transferAmount = 200 * 10 ** DECIMALS;
        uint256 initialSupply = assetToken.totalSupply();

        // Transfer to user1
        assetToken.transfer(user1, transferAmount);

        // user1 approves user2
        vm.prank(user1);
        assetToken.approve(user2, burnAmount);

        // user2 burns from user1's balance
        vm.prank(user2);
        assetToken.burnFrom(user1, burnAmount);

        assertEq(assetToken.balanceOf(user1), transferAmount - burnAmount);
        assertEq(assetToken.totalSupply(), initialSupply - burnAmount);
    }

    // ============ updateKYCRegistry Tests ============

    function test_UpdateKYCRegistry_Success() public {
        KYCRegistry newKYCRegistry = new KYCRegistry(owner);

        vm.expectEmit(true, false, false, false);
        emit KYCRegistryUpdated(address(newKYCRegistry));

        assetToken.updateKYCRegistry(address(newKYCRegistry));

        assertEq(address(assetToken.kycRegistry()), address(newKYCRegistry));
    }

    function test_UpdateKYCRegistry_RevertWhen_InvalidAddress() public {
        vm.expectRevert("AssetToken: Invalid KYC registry address");
        assetToken.updateKYCRegistry(address(0));
    }

    function test_UpdateKYCRegistry_RevertWhen_NotOwner() public {
        KYCRegistry newKYCRegistry = new KYCRegistry(owner);

        vm.prank(user1);
        vm.expectRevert();
        assetToken.updateKYCRegistry(address(newKYCRegistry));
    }

    // ============ ERC20 Standard Tests ============

    function test_BalanceOf() public {
        kycRegistry.addKYC(owner);
        uint256 transferAmount = 100 * 10 ** DECIMALS;

        assetToken.transfer(user1, transferAmount);

        assertEq(assetToken.balanceOf(user1), transferAmount);
        assertEq(assetToken.balanceOf(owner), INITIAL_SUPPLY * 10 ** DECIMALS - transferAmount);
    }

    function test_TotalSupply() public view {
        assertEq(assetToken.totalSupply(), INITIAL_SUPPLY * 10 ** DECIMALS);
    }

    function test_Allowance() public {
        kycRegistry.addKYC(owner);
        uint256 approvalAmount = 100 * 10 ** DECIMALS;

        assetToken.approve(user1, approvalAmount);

        assertEq(assetToken.allowance(owner, user1), approvalAmount);
    }

    // ============ Integration Tests ============

    function test_Integration_FullLifecycle() public {
        kycRegistry.addKYC(owner);
        uint256 mintAmount = 1000 * 10 ** DECIMALS;
        uint256 transferAmount = 500 * 10 ** DECIMALS;
        uint256 burnAmount = 200 * 10 ** DECIMALS;

        // Mint to user1
        assetToken.mint(user1, mintAmount);
        assertEq(assetToken.balanceOf(user1), mintAmount);

        // user1 transfers to user2
        vm.prank(user1);
        assetToken.transfer(user2, transferAmount);
        assertEq(assetToken.balanceOf(user1), mintAmount - transferAmount);
        assertEq(assetToken.balanceOf(user2), transferAmount);

        // user2 burns some tokens
        vm.prank(user2);
        assetToken.burn(burnAmount);
        assertEq(assetToken.balanceOf(user2), transferAmount - burnAmount);
    }


    function test_Integration_KYCRegistryUpdate() public {
        kycRegistry.addKYC(owner);
        uint256 transferAmount = 100 * 10 ** DECIMALS;

        // Transfer with original KYC registry
        assetToken.transfer(user1, transferAmount);

        // Create new KYC registry and verify users
        KYCRegistry newKYCRegistry = new KYCRegistry(owner);
        newKYCRegistry.addKYC(user1);
        newKYCRegistry.addKYC(user2);

        // Update KYC registry
        assetToken.updateKYCRegistry(address(newKYCRegistry));

        // Transfer should work with new registry
        vm.prank(user1);
        assetToken.transfer(user2, transferAmount);
        assertEq(assetToken.balanceOf(user2), transferAmount);
    }

    function test_Integration_ApproveAndTransferFrom() public {
        kycRegistry.addKYC(owner);
        uint256 amount = 100 * 10 ** DECIMALS;

        // Transfer to user1
        assetToken.transfer(user1, amount);

        // user1 approves user2 to spend
        vm.prank(user1);
        assetToken.approve(user2, amount);

        // user2 transfers from user1 to themselves
        vm.prank(user2);
        assetToken.transferFrom(user1, user2, amount);

        assertEq(assetToken.balanceOf(user1), 0);
        assertEq(assetToken.balanceOf(user2), amount);
        assertEq(assetToken.allowance(user1, user2), 0);
    }

    // ============ Fuzz Tests ============

    function testFuzz_Mint_AnyAmount(uint256 amount) public {
        kycRegistry.addKYC(owner);
        amount = bound(amount, 0, type(uint256).max - assetToken.totalSupply());

        uint256 initialSupply = assetToken.totalSupply();
        assetToken.mint(user1, amount);

        assertEq(assetToken.balanceOf(user1), amount);
        assertEq(assetToken.totalSupply(), initialSupply + amount);
    }

    function testFuzz_Transfer_AnyAmount(uint256 amount) public {
        kycRegistry.addKYC(owner);
        amount = bound(amount, 0, assetToken.balanceOf(owner));

        uint256 ownerBalance = assetToken.balanceOf(owner);

        assetToken.transfer(user1, amount);

        assertEq(assetToken.balanceOf(user1), amount);
        assertEq(assetToken.balanceOf(owner), ownerBalance - amount);
    }

    function testFuzz_Approve_AnyAmount(uint256 amount) public {
        kycRegistry.addKYC(owner);

        assetToken.approve(user1, amount);

        assertEq(assetToken.allowance(owner, user1), amount);
    }

    function testFuzz_TransferToAnyKYCVerifiedAddress(address recipient) public {
        vm.assume(recipient != address(0));
        vm.assume(recipient != owner);

        kycRegistry.addKYC(owner);
        kycRegistry.addKYC(recipient);

        uint256 transferAmount = 100 * 10 ** DECIMALS;

        assetToken.transfer(recipient, transferAmount);

        assertEq(assetToken.balanceOf(recipient), transferAmount);
    }
}
