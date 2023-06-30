const standalone = process.env['HARDHAT'] === undefined;
if (standalone) {
  console.log("Running in standalone mode");
}

const hre = require("hardhat");
const minimist = require("minimist");

const parsedArgs = minimist(process.argv.slice(2), {
  alias: {
    "dryRun": "dry",
  },
  boolean: [
    "dryRun",
    "compile",
  ],
  negatable: [
    "compile"
  ],
  default: {
    dryRun: false,
    compile: standalone,
  },
});

async function main() {
  if (parsedArgs.compile) {
    await hre.run("compile");
  }

  if (parsedArgs.dryRun) {
    console.log("Dry run mode, the contract won't actual deploy to the network");
    process.exit(0);
  }

  const contract = await hre.ethers.deployContract("CybrosImaginatorBridge");

  await contract.waitForDeployment();

  console.log(
    `Contract deployed to ${contract.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
