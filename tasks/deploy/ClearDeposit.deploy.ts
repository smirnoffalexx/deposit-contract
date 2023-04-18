import { task } from "hardhat/config";

task("deploy:clearDeposit", "Deploy ClearDeposit").setAction(async function (
    { _ },
    { getNamedAccounts, deployments: { deploy }, ethers: { getContract } }
) {
    // Create deploy function
    const { deployer } = await getNamedAccounts();
    const deployProxy = async (name: string, args: any[]) => {
        return await deploy(name, {
            from: deployer,
            args: [],
            log: true,
            proxy: {
                proxyContract: "OpenZeppelinTransparentProxy",
                execute: {
                    init: {
                        methodName: "initialize",
                        args: args,
                    },
                },
            },
        });
    };

    // Get ERC20Mock
    const erc20Mock = await getContract("ERC20Mock");

    // Deploy ClearDeposit
    const clearDeposit = await deployProxy("ClearDeposit", [erc20Mock.address]);

    return clearDeposit;
});
