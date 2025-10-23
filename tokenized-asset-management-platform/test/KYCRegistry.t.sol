// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {KYCRegistry} from "../src/KYCRegistry.sol";

contract KYCRegistryTest is Test {
    KYCRegistry public kycRegistry;
    address public owner;
    address public user1;
    address public user2;
    address public user3;

    event KYCAdded(address indexed account);
    event KYCRevoked(address indexed account);
    event AuthorizedAddressAdded(address indexed account);
    event AuthorizedAddressRemoved(address indexed account);

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");

        kycRegistry = new KYCRegistry(owner);
    }

    // ============ Constructor Tests ============

    function test_Constructor() public view {
        assertEq(kycRegistry.owner(), owner);
    }

    // ============ addKYC Tests ============

    function test_AddKYC_Success() public {
        vm.expectEmit(true, false, false, false);
        emit KYCAdded(user1);

        kycRegistry.addKYC(user1);

        assertTrue(kycRegistry.isKYCVerified(user1));
    }

    function test_AddKYC_RevertWhen_ZeroAddress() public {
        vm.expectRevert("KYCRegistry: Cannot verify zero address");
        kycRegistry.addKYC(address(0));
    }

    function test_AddKYC_RevertWhen_NotOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        kycRegistry.addKYC(user2);
    }

    // ============ addKYCBatch Tests ============

    function test_AddKYCBatch_Success() public {
        address[] memory accounts = new address[](3);
        accounts[0] = user1;
        accounts[1] = user2;
        accounts[2] = user3;

        kycRegistry.addKYCBatch(accounts);

        assertTrue(kycRegistry.isKYCVerified(user1));
        assertTrue(kycRegistry.isKYCVerified(user2));
        assertTrue(kycRegistry.isKYCVerified(user3));
    }

    function test_AddKYCBatch_EmptyArray() public {
        address[] memory accounts = new address[](0);
        kycRegistry.addKYCBatch(accounts);
        // Should not revert
    }

    function test_AddKYCBatch_RevertWhen_ZeroAddressInArray() public {
        address[] memory accounts = new address[](2);
        accounts[0] = user1;
        accounts[1] = address(0);

        vm.expectRevert("KYCRegistry: Cannot verify zero address");
        kycRegistry.addKYCBatch(accounts);
    }

    function test_AddKYCBatch_RevertWhen_NotOwner() public {
        address[] memory accounts = new address[](1);
        accounts[0] = user1;

        vm.prank(user1);
        vm.expectRevert();
        kycRegistry.addKYCBatch(accounts);
    }

    // ============ revokeKYC Tests ============

    function test_RevokeKYC_Success() public {
        kycRegistry.addKYC(user1);
        assertTrue(kycRegistry.isKYCVerified(user1));

        vm.expectEmit(true, false, false, false);
        emit KYCRevoked(user1);

        kycRegistry.revokeKYC(user1);

        assertFalse(kycRegistry.isKYCVerified(user1));
    }

    function test_RevokeKYC_NonExistentAccount() public {
        kycRegistry.revokeKYC(user1);
        assertFalse(kycRegistry.isKYCVerified(user1));
        // Should not revert
    }

    function test_RevokeKYC_RevertWhen_NotOwner() public {
        kycRegistry.addKYC(user1);

        vm.prank(user2);
        vm.expectRevert();
        kycRegistry.revokeKYC(user1);
    }

    // ============ isKYCVerified Tests ============

    function test_IsKYCVerified_NotVerified() public view {
        assertFalse(kycRegistry.isKYCVerified(user1));
    }

    function test_IsKYCVerified_Verified() public {
        kycRegistry.addKYC(user1);
        assertTrue(kycRegistry.isKYCVerified(user1));
    }

    function test_IsKYCVerified_Revoked() public {
        kycRegistry.addKYC(user1);
        assertTrue(kycRegistry.isKYCVerified(user1));

        kycRegistry.revokeKYC(user1);
        assertFalse(kycRegistry.isKYCVerified(user1));
    }

    // ============ Integration Tests ============

    function test_Integration_MultipleUsersLifecycle() public {
        // Add user1 and user2
        kycRegistry.addKYC(user1);
        kycRegistry.addKYC(user2);

        // Both should be verified
        assertTrue(kycRegistry.isKYCVerified(user1));
        assertTrue(kycRegistry.isKYCVerified(user2));

        // Revoke user2
        kycRegistry.revokeKYC(user2);
        assertFalse(kycRegistry.isKYCVerified(user2));

        // user1 should still be verified
        assertTrue(kycRegistry.isKYCVerified(user1));
    }

    function test_Integration_BatchAddAndRevoke() public {
        address[] memory accounts = new address[](3);
        accounts[0] = user1;
        accounts[1] = user2;
        accounts[2] = user3;

        kycRegistry.addKYCBatch(accounts);

        // All should be verified
        assertTrue(kycRegistry.isKYCVerified(user1));
        assertTrue(kycRegistry.isKYCVerified(user2));
        assertTrue(kycRegistry.isKYCVerified(user3));

        // Revoke one
        kycRegistry.revokeKYC(user2);
        assertTrue(kycRegistry.isKYCVerified(user1));
        assertFalse(kycRegistry.isKYCVerified(user2));
        assertTrue(kycRegistry.isKYCVerified(user3));
    }

    // ============ Authorized Address Tests ============

    function test_AddAuthorizedAddress_Success() public {
        vm.expectEmit(true, false, false, false);
        emit AuthorizedAddressAdded(user1);

        kycRegistry.addAuthorizedAddress(user1);

        assertTrue(kycRegistry.isAuthorized(user1));
    }

    function test_AddAuthorizedAddress_RevertWhen_ZeroAddress() public {
        vm.expectRevert("KYCRegistry: Cannot authorize zero address");
        kycRegistry.addAuthorizedAddress(address(0));
    }

    function test_AddAuthorizedAddress_RevertWhen_AlreadyAuthorized() public {
        kycRegistry.addAuthorizedAddress(user1);

        vm.expectRevert("KYCRegistry: Address already authorized");
        kycRegistry.addAuthorizedAddress(user1);
    }

    function test_AddAuthorizedAddress_RevertWhen_NotOwner() public {
        vm.prank(user1);
        vm.expectRevert();
        kycRegistry.addAuthorizedAddress(user2);
    }

    function test_RemoveAuthorizedAddress_Success() public {
        kycRegistry.addAuthorizedAddress(user1);
        assertTrue(kycRegistry.isAuthorized(user1));

        vm.expectEmit(true, false, false, false);
        emit AuthorizedAddressRemoved(user1);

        kycRegistry.removeAuthorizedAddress(user1);

        assertFalse(kycRegistry.isAuthorized(user1));
    }

    function test_RemoveAuthorizedAddress_RevertWhen_NotAuthorized() public {
        vm.expectRevert("KYCRegistry: Address not authorized");
        kycRegistry.removeAuthorizedAddress(user1);
    }

    function test_RemoveAuthorizedAddress_RevertWhen_NotOwner() public {
        kycRegistry.addAuthorizedAddress(user1);

        vm.prank(user2);
        vm.expectRevert();
        kycRegistry.removeAuthorizedAddress(user1);
    }

    function test_IsAuthorized_NotAuthorized() public view {
        assertFalse(kycRegistry.isAuthorized(user1));
    }

    function test_IsAuthorized_Authorized() public {
        kycRegistry.addAuthorizedAddress(user1);
        assertTrue(kycRegistry.isAuthorized(user1));
    }

    function test_AuthorizedAddress_CanAddKYC() public {
        kycRegistry.addAuthorizedAddress(user1);

        vm.prank(user1);
        kycRegistry.addKYC(user2);

        assertTrue(kycRegistry.isKYCVerified(user2));
    }

    function test_AuthorizedAddress_CanRevokeKYC() public {
        kycRegistry.addAuthorizedAddress(user1);
        kycRegistry.addKYC(user2);

        vm.prank(user1);
        kycRegistry.revokeKYC(user2);

        assertFalse(kycRegistry.isKYCVerified(user2));
    }

    function test_AuthorizedAddress_CanAddKYCBatch() public {
        kycRegistry.addAuthorizedAddress(user1);

        address[] memory accounts = new address[](2);
        accounts[0] = user2;
        accounts[1] = user3;

        vm.prank(user1);
        kycRegistry.addKYCBatch(accounts);

        assertTrue(kycRegistry.isKYCVerified(user2));
        assertTrue(kycRegistry.isKYCVerified(user3));
    }

    function test_RemovedAuthorizedAddress_CannotAddKYC() public {
        kycRegistry.addAuthorizedAddress(user1);
        kycRegistry.removeAuthorizedAddress(user1);

        vm.prank(user1);
        vm.expectRevert("KYCRegistry: Caller is not owner or authorized");
        kycRegistry.addKYC(user2);
    }

    // ============ Fuzz Tests ============

    function testFuzz_AddKYC_AnyAddress(address account) public {
        vm.assume(account != address(0));

        kycRegistry.addKYC(account);
        assertTrue(kycRegistry.isKYCVerified(account));
    }
}
