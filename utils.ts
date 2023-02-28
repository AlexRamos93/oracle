import { ethers } from "ethers";
import Web3 from "web3";
import * as dotenv from "dotenv";
import rngAbi from "./abis/rng.json";

type Provider = ethers.Provider;

export interface SubscribeFilters {
  address: string[];
  topics?: string[];
  fromBlack?: number;
}

dotenv.config();

const API_KEY = process.env.API_KEY || "";
const PROVIDER_URL = process.env.PROVIDER_URL || "";
const NETWORK = process.env.NETWORK || "";
const RNG_ADDRESS = process.env.RNG_ADDRESS || "";
const EVENT_ABI = [
  {
    indexed: true,
    internalType: "address",
    name: "requester",
    type: "address",
  },
  {
    indexed: true,
    internalType: "uint256",
    name: "id",
    type: "uint256",
  },
];

const getProviderToSubscribe = () => new Web3(PROVIDER_URL);

const getEthersProvider = () => new ethers.AlchemyProvider(NETWORK, API_KEY);

const getRNGContract = (address: string, abi: any, signer: ethers.Wallet) =>
  new ethers.Contract(address, abi, signer);

const getWalletAndConnect = async (provider: Provider) => {
  const privateKey = process.env.PRIVATE_KEY || "";
  const wallet = new ethers.Wallet(privateKey, provider);
  return wallet.connect(provider);
};

const web3EventSubscribe = (
  options: SubscribeFilters,
  provider: Web3,
  signer: ethers.Wallet
) => {
  const subscription = provider.eth.subscribe("logs", options, (err) => {
    if (err) console.log(err);
  });

  subscription.on("data", async (event) => {
    const decoded = provider.eth.abi.decodeLog(
      EVENT_ABI,
      event.data,
      event.topics.slice(1)
    );
    const randomNumber = Math.floor(Math.random() * 10) + 1;
    fullfillRequestTx(decoded["1"], randomNumber, signer);
    console.log("address: ", decoded["0"]);
    console.log("id: ", decoded["1"]);
  });
};

const fullfillRequestTx = async (
  id: string,
  randomNumber: any,
  signer: ethers.Wallet
) => {
  const contract = getRNGContract(RNG_ADDRESS, rngAbi.abi, signer);
  console.log("randomNumber: ", randomNumber);
  const tx = await contract.fullfillRequest(randomNumber, id, {
    gasLimit: 102052,
  });
  return tx.wait();
};

export {
  getProviderToSubscribe,
  getEthersProvider,
  getWalletAndConnect,
  web3EventSubscribe,
};
