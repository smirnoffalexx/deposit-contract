import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployFunction: DeployFunction = async function ({
    run,
}: HardhatRuntimeEnvironment) {
    await run("deploy:clearDeposit", {});
};

export default deployFunction;

deployFunction.dependencies = ["ERC20Mock"];

deployFunction.tags = ["ClearDeposit"];
