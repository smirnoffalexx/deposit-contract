import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployFunction: DeployFunction = async function ({
    run,
}: HardhatRuntimeEnvironment) {
    await run("deploy:clearDeposit", {});
};

export default deployFunction;

deployFunction.dependencies = ["TokenMock"];

deployFunction.tags = ["ClearDeposit"];
