import observeAccountBalance from "./AccountBalanceMonitor";
import exposeMetrics from "./Server";
import dotenv from 'dotenv';

dotenv.config();

const port: number = parseInt(process.env.PORT) || 8080;
const kusamaQueryNode = process.env.KUSAMA_QUERY_NODE || 'wss://kusama-rpc.polkadot.io';

observeAccountBalance(kusamaQueryNode);
exposeMetrics(port);
