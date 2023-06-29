const standalone = process.env['HARDHAT'] === undefined;
if (standalone) {
  console.log("Running in standalone mode");
}

const hre = require("hardhat");
const minimist = require("minimist");

hre.network

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

  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const unlockTime = currentTimestampInSeconds + 60;

  const lockedAmount = hre.ethers.parseEther("0.001");

  if (parsedArgs.dryRun) {
    console.log("Dry run mode, the contract won't actual deploy to the network");
    process.exit(0);
  }

  const lock = await hre.ethers.deployContract("Lock", [unlockTime], {
    value: lockedAmount,
  });

  await lock.waitForDeployment();

  console.log(
    `Lock with ${hre.ethers.formatEther(
      lockedAmount
    )}ETH and unlock timestamp ${unlockTime} deployed to ${lock.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
