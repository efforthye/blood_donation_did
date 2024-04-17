// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract BloodDonationVDR {
    struct Donor {
        uint256 id;
        string name;
        uint dateOfBirth;  // Unix timestamp for the donor's date of birth
        string bloodType;
        uint256[] donationDates;  // List of Unix timestamps of donations
    }

    mapping(uint256 => Donor) public donors;
    uint256 public nextDonorId;

    event DonorRegistered(uint256 indexed donorId, string name);
    event DonationRecorded(uint256 indexed donorId, uint256 donationDate);

    // Register a new donor with their basic information
    function registerDonor(string memory _name, uint _dateOfBirth, string memory _bloodType) public {
        uint256 donorId = nextDonorId++;
        donors[donorId] = Donor(donorId, _name, _dateOfBirth, _bloodType, new uint256[](0));
        emit DonorRegistered(donorId, _name);
    }

    // Record a new donation date for a registered donor
    function recordDonation(uint256 _donorId, uint256 _donationDate) public {
        require(bytes(donors[_donorId].name).length != 0, "Donor not registered");
        donors[_donorId].donationDates.push(_donationDate);
        emit DonationRecorded(_donorId, _donationDate);
    }

    // Retrieve a donor's information and donation history
    function getDonorInfo(uint256 _donorId) public view returns (Donor memory) {
        require(bytes(donors[_donorId].name).length != 0, "Donor not registered");
        return donors[_donorId];
    }
}
