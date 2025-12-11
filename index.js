import fs from "fs";
import axios from "axios";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const FILE = "./hot.json";

async function sendAlert(msg) {
  await axios.get(
    `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
    { params: { chat_id: CHAT_ID, text: msg } }
  );
}

async function getHotCoins() {
  const url =
    "https://www.binance.com/bapi/asset/v2/public/asset-service/product/get-products";

  const res = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Content-Type": "application/json",
      "Client-Type": "web",
      "X-Requested-With": "XMLHttpRequest",
    }
  });

  const data = res.data.data;

  if (!data) {
    console.log("⚠ Binance returned no data");
    return [];
  }

  const hot = data.filter(item => item.hot === true).map(item => item.asset);
  return hot;
}

async function checkHotChanges() {
  const hot = await getHotCoins();

  let old = [];
  if (fs.existsSync(FILE)) {
    old = JSON.parse(fs.readFileSync(FILE));
  }

  const added = hot.filter(c => !old.includes(c));

  if (added.length > 0) {
    for (const coin of added) {
      await sendAlert(`🔥 NEW HOT COIN ADDED ON BINANCE (Convert → Hot)\nCoin: ${coin}`);
    }
  }

  fs.writeFileSync(FILE, JSON.stringify(hot));
}

checkHotChanges();
