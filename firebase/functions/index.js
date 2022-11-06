const functions = require("firebase-functions");
const {ethers} = require("ethers");
const cors = require("cors")({origin: true});
const AnotherWorldVaultABI = require("./abi/AnotherWorldVaultABI.json");
const INFURA_APIKEY = functions.config().infura.api_key;
const QUICKNODE_APIKEY = functions.config().quicknode.api_key;
const vaultContractGoerli = functions.config().vaultcontract.goerli;
const vaultContractPolygon = functions.config().vaultcontract.polygon;
const vaultContractPolygonMumbai = functions.config().vaultcontract.mumbai;
const vaultContractOptimism = functions.config().vaultcontract.op;
const providerETHMainnet = new ethers.providers.JsonRpcProvider(
    `https://mainnet.infura.io/v3/${INFURA_APIKEY}`,
);

const providerOptimismMainnet = new ethers.providers.JsonRpcProvider(
    `https://optimism-mainnet.infura.io/v3/${INFURA_APIKEY}`,
);

const providerPolygonMainnet = new ethers.providers.JsonRpcProvider(
    `https://polygon-mainnet.infura.io/v3/${INFURA_APIKEY}`,
);

const providerPolygonMumbai = new ethers.providers.JsonRpcProvider(
    `https://polygon-mumbai.infura.io/v3/${INFURA_APIKEY}`,
);


const providerGoerliTestnet = new ethers.providers.JsonRpcProvider(
    // `https://goerli.infura.io/v3/${INFURA_APIKEY}`
    `https://long-virulent-wish.ethereum-goerli.discover.quiknode.pro/${QUICKNODE_APIKEY}/`,
);

const vaultContractAddress = {
  "eth": "0x00",
  "goerli": vaultContractGoerli,
  "op": vaultContractOptimism,
  "polygon": vaultContractPolygon,
  "mumbai": vaultContractPolygonMumbai,
};

const providerChain = {
  "eth": providerETHMainnet,
  "goerli": providerGoerliTestnet,
  "op": providerOptimismMainnet,
  "polygon": providerPolygonMainnet,
  "mumbai": providerPolygonMumbai,
};

// resolve ENS to address
exports.resolveens = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const ens = req.query.ens;
    switch (req.method) {
      case "GET": // handle GET request
        try {
          let ethAddress = null;
          if (ens.includes(".eth") ||
            ens.includes(".id") || ens.includes(".xyz")) {
            ethAddress = await providerETHMainnet.resolveName(ens);
          }
          if (ethAddress) {
            res.status(200).send({
              success: true,
              ethAddress: ethAddress,
              ens: ens,
            });
          } else {
            res.status(200).send({success: false, msg: "invalid ENS"});
          }
        } catch (error) {
          res.status(200).send({success: false, msg: "oops"});
        }
        break;
      default:
        res.status(405).json({
          success: false, reason: "Unsupported request method"});
    }
  });
});

// get token balance based on ETH mainnet ENS
exports.gettokenbalance = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const ens = req.query.ens;
    let network = req.query.network;
    if (!network) {
      network = "goerli";
    }
    switch (req.method) {
      case "GET": // handle GET request
        try {
          let ethAddress = null;
          if (ens.includes(".eth") ||
          ens.includes(".id") || ens.includes(".xyz")) {
            ethAddress = await providerETHMainnet.resolveName(ens);
          }
          if (ethAddress) {
            if (network !== "op" && network !== "mumbai" &&
              network !== "polygon" && network !== "goerli") {
              res.status(200).send({success: false, msg: "invalid chain"});
            }
            const vaultContract = new ethers.Contract(
                vaultContractAddress[network],
                AnotherWorldVaultABI,
                providerChain[network],
            );
            const tokenId = 0;
            const balance = await vaultContract.balanceOf(
                ethAddress, tokenId);
            res.status(200).send({
              network: network,
              tokenId: tokenId,
              balance: Number(balance.toString()),
              success: true,
              ethAddress: ethAddress,
              ens: ens,
            });
          } else {
            res.status(200).send({success: false, msg: "invalid ENS"});
          }
        } catch (error) {
          res.status(200).send({success: false, msg: "oops"});
        }
        break;
      default:
        res.status(405).json({
          success: false, reason: "Unsupported request method"});
    }
  });
});

// based on a ETH mainnet ENS, airdrop erc1155 tokens on goerli
exports.airdrop = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const ens = req.query.ens;
    let network = req.query.network;
    if (!network) {
      network = "goerli";
    }
    switch (req.method) {
      case "GET": // handle GET request
        try {
          let ethAddress = null;
          if (ens.includes(".eth") ||
          ens.includes(".id") || ens.includes(".xyz")) {
            ethAddress = await providerETHMainnet.resolveName(ens);
          }
          if (ethAddress) {
            if (network !== "op" && network !== "mumbai" &&
              network !== "polygon" && network !== "goerli") {
              res.status(200).send({success: false, msg: "invalid chain"});
            }
            const signer = new ethers.Wallet(
                functions.config().operator.pkey, providerChain[network]);
            const nouce = await signer.getTransactionCount();
            console.log("nouce", nouce, network);
            const vaultContract = new ethers.Contract(
                vaultContractAddress[network],
                AnotherWorldVaultABI,
                signer,
            );
            const tokenId = 0; // TODO: expose to game
            const amount = 1; // TODO: expose to game

            const tx = await vaultContract.mint(ethAddress, tokenId, amount);

            /*
            // TODO: gas estimation for specific chains
            const tx = await vaultContract.mint(ethAddress, tokenId, amount, {
              gasLimit: 200000,
              nouce: nouce,
            });*/

            res.status(200).send({
              network: network,
              tx: tx,
              tokenId: tokenId,
              amount: amount,
              success: true,
              ethAddress: ethAddress,
              ens: ens,
            });
          } else {
            res.status(200).send({success: false, msg: "invalid ENS"});
          }
        } catch (error) {
          res.status(200).send({success: false, msg: "oops"});
        }
        break;
      default:
        res.status(405).json({
          success: false, reason: "Unsupported request method"});
    }
  });
});

// get token balance based on ETH mainnet ENS
exports.getapebalance = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const ens = req.query.ens;
    switch (req.method) {
      case "GET": // handle GET request
        try {
          let ethAddress = null;
          if (ens.includes(".eth") ||
          ens.includes(".id") || ens.includes(".xyz")) {
            ethAddress = await providerETHMainnet.resolveName(ens);
          }

          const erc20BalanceOfABI = [
            {
              "inputs": [{
                "internalType": "address",
                "name": "account",
                "type": "address",
              }],
              "name": "balanceOf",
              "outputs":
                [{"internalType": "uint256", "name": "", "type": "uint256"}],
              "stateMutability": "view",
              "type": "function",
            }];
          if (ethAddress) {
            // get $APE balance on ETH mainnet
            const ContractAPEAddress =
              "0x4d224452801ACEd8B2F0aebE155379bb5D594381";
            const ContractAPE = new ethers.Contract(
                ContractAPEAddress,
                erc20BalanceOfABI,
                providerETHMainnet,
            );
            const balance = await ContractAPE.balanceOf(ethAddress);
            res.status(200).send({
              network: "eth",
              token: "APE",
              balance: Number(ethers.utils.formatEther(balance)),
              success: true,
              hasAPE: Number(ethers.utils.formatEther(balance)) > 0,
              ethAddress: ethAddress,
              ens: ens,
            });
          } else {
            res.status(200).send({success: false, msg: "invalid ENS"});
          }
        } catch (error) {
          res.status(200).send({success: false, msg: "oops"});
        }
        break;
      default:
        res.status(405).json({
          success: false, reason: "Unsupported request method"});
    }
  });
});
