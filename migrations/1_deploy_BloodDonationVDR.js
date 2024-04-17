import vdr from 'BloodDonationVDR';

const deployContract = async (deployer) => {
    await deployer.deploy(vdr);
};

export default deployContract;
