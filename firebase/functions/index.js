const functions = require("firebase-functions");
const {ethers} = require("ethers");
const cors = require("cors")({origin: true});
const AnotherWorldVaultABI = require("./abi/AnotherWorldVaultABI.json");
const INFURA_APIKEY = functions.config().infura.api_key;
const QUICKNODE_APIKEY = functions.config().quicknode.api_key;
const vaultContractGoerli = functions.config().vaultcontract.goerli;

const providerETHMainnet = new ethers.providers.JsonRpcProvider(
    `https://mainnet.infura.io/v3/${INFURA_APIKEY}`,
);

const providerGoerliTestnet = new ethers.providers.JsonRpcProvider(
    // `https://goerli.infura.io/v3/${INFURA_APIKEY}`
    `https://long-virulent-wish.ethereum-goerli.discover.quiknode.pro/${QUICKNODE_APIKEY}/`,
);

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
    switch (req.method) {
      case "GET": // handle GET request
        try {
          let ethAddress = null;
          if (ens.includes(".eth") ||
          ens.includes(".id") || ens.includes(".xyz")) {
            ethAddress = await providerETHMainnet.resolveName(ens);
          }
          if (ethAddress) {
            // get token balance on goerli
            const vaultContract = new ethers.Contract(
                vaultContractGoerli,
                AnotherWorldVaultABI,
                providerGoerliTestnet,
            );
            const tokenId = 0;
            const balance = await vaultContract.balanceOf(ethAddress, tokenId);

            res.status(200).send({
              network: "goerli",
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
    switch (req.method) {
      case "GET": // handle GET request
        try {
          let ethAddress = null;
          if (ens.includes(".eth") ||
          ens.includes(".id") || ens.includes(".xyz")) {
            ethAddress = await providerETHMainnet.resolveName(ens);
          }
          if (ethAddress) {
            const signer = new ethers.Wallet(
                functions.config().operator.pkey, providerGoerliTestnet);
            const vaultContract = new ethers.Contract(
                vaultContractGoerli,
                AnotherWorldVaultABI,
                signer,
            );
            const tokenId = 0; // TODO: expose to game
            const amount = 1; // TODO: expose to game
            const tx = await vaultContract.mint(ethAddress, tokenId, amount);

            res.status(200).send({
              network: "goerli",
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
