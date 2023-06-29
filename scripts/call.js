const standalone = process.env['HARDHAT'] === undefined;
if (standalone) {
  console.log("Running in standalone mode");
}

const hre = require("hardhat");
const minimist = require("minimist");

const parsedArgs = minimist(process.argv.slice(2), {
  "--": true,
  alias: {
    "dryRun": "dry",
    "target": "t",
    "function": "f",
  },
  boolean: [
    "dryRun",
    "compile",
  ],
  negatable: [
    "compile"
  ],
  string: [
    "target",
    "function",
  ],
  default: {
    dryRun: false,
    compile: standalone,
  },
});

const contractAddress = parsedArgs.target;
if (!contractAddress || contractAddress.trim().length === 0) {
  console.error("`--target` must provide.");
  process.exit(1);
}
const contractFunction = parsedArgs.function;
if (!contractFunction || contractFunction.trim().length === 0) {
  console.error("`--function` must provide.");
  process.exit(1);
}

async function main() {
  if (parsedArgs.compile) {
    await hre.run("compile");
  }

  const contract = await hre.ethers.getContractAt("Lock", contractAddress);
  const callee = contract.getFunction(contractFunction);
  const callArgs = parsedArgs["--"]
  
  if (parsedArgs.dryRun) {
    const pendingTx = await (async () => {
      if (callArgs.length > 0) {
        return await callee.populateTransaction(callArgs)
      } else {
        return await callee.populateTransaction()
      }
    })();
    console.log(pendingTx);

    console.log("Dry run mode, the contract won't actual call.");
    process.exit(0);
  }

  const tx = await (async () => {
    if (callArgs.length > 0) {
      return await callee.send(callArgs)
    } else {
      return await callee.send()
    }
  })();

  console.log(
    `Tx hash ${tx.hash}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
