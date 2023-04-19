import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployFunction: DeployFunction = async function ({
    run,
}: HardhatRuntimeEnvironment) {
    await run("deploy:erc20Mock", {
        name: "USDT Mock token",
        symbol: "USDTMock",
    });
};

export default deployFunction;

deployFunction.tags = ["TokenMock"];
