// import bloodDonation from 'BloodDonation';

// const deployContract = async (deployer) => {
//     await deployer.deploy(bloodDonation);
// };

// export default deployContract;



const bloodDonation = artifacts.require('BloodDonation');

module.exports = (deployer) => {
    deployer.deploy(bloodDonation);
};