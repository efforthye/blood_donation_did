// import bloodDonation from 'BloodDonation';

// const deployContract = async (deployer) => {
//     await deployer.deploy(bloodDonation);
// };

// export default deployContract;

const bloodDonationRegistry = artifacts.require('BloodDonationRegistry');

module.exports = (deployer) => {
    deployer.deploy(bloodDonationRegistry);
};