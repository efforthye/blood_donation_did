// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BloodDonationRegistry {
    struct BloodDonation {
        string donorDID;
        string donationDate;
        string bloodType;
    }

    mapping(string => BloodDonation) private donations;
    mapping(string => bool) private verifiedDonors;

    event DonationRecorded(string donorDID, string donationDate, string bloodType);
    event DonorVerified(string donorDID);

    function recordDonation(string memory donorDID, string memory donationDate, string memory bloodType) public {
        donations[donorDID] = BloodDonation(donorDID, donationDate, bloodType);
        emit DonationRecorded(donorDID, donationDate, bloodType);
    }

    function verifyDonor(string memory donorDID) public {
        verifiedDonors[donorDID] = true;
        emit DonorVerified(donorDID);
    }

    function isDonorVerified(string memory donorDID) public view returns (bool) {
        return verifiedDonors[donorDID];
    }

    function getDonation(string memory donorDID) public view returns (BloodDonation memory) {
        require(isDonorVerified(donorDID), "Donor is not verified");
        return donations[donorDID];
    }
}
