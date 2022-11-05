const functions = require("firebase-functions");
const { ethers } = require("ethers");
const cors = require('cors')({origin: true});

const INFURA_APIKEY = functions.config().infura.api_key;
const QUICKNODE_APIKEY = functions.config().quicknode.api_key;

const providerETHMainnet = new ethers.providers.JsonRpcProvider(
  `https://mainnet.infura.io/v3/${INFURA_APIKEY}`,
);

const providerGoerliTestnet = new ethers.providers.JsonRpcProvider(
  `https://goerli.infura.io/v3/${INFURA_APIKEY}`,
  //`https://long-virulent-wish.ethereum-goerli.discover.quiknode.pro/${QUICKNODE_APIKEY}/`
);

exports.resolveens = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const ens = req.query.ens;
    switch (req.method) {
      case 'GET': // handle GET request
        try {
          let ethAddress = null;
          if (ens.includes(".eth") || ens.includes(".id") || ens.includes(".xyz")) {
              ethAddress = await providerETHMainnet.resolveName(ens);
          }
          if (ethAddress) {
            res.status(200).send({
              success: true,
              ethAddress: ethAddress,
              ens: ens,
            });
          } else {
            res.status(200).send({ success: false, msg: 'invalid ENS' });
          }
        } catch (error) {
          res.status(200).send({ success: false, msg: 'oops' });
        }
        break;
      default:
        res.status(405).json({ success: false, reason: 'Unsupported request method' });
    }
  });
});
