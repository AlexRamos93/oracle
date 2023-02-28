import * as dotenv from "dotenv";
import { ethers } from "ethers";
import express from "express";
import {
  SubscribeFilters,
  getEthersProvider,
  getWalletAndConnect,
  getProviderToSubscribe,
  web3EventSubscribe,
} from "./utils";

const RNG_ADDRESS = process.env.RNG_ADDRESS || "";

dotenv.config();
const App = express();

let filters: SubscribeFilters = {
  fromBlack: 0,
  address: [RNG_ADDRESS],
  topics: [ethers.id("RequestRandomNumber(address,uint256)")],
};

App.listen(3000, async () => {
  console.log("Server running at port 3000");

  const provider = getProviderToSubscribe();
  const ethersProvider = getEthersProvider();
  const wallet = await getWalletAndConnect(ethersProvider);
  web3EventSubscribe(filters, provider, wallet);
});
