import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployFunction: DeployFunction = async function ({
    run,
}: HardhatRuntimeEnvironment) {
    await run("deploy:erc20Mock", {
        name: "Mock Token 1",
        symbol: "ERC20Mock",
    });
};

export default deployFunction;

deployFunction.tags = ["TokenMock"];
