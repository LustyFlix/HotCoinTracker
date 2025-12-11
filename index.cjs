const axios = require("axios");
const fs = require("fs");

async function getHotCoins() {
  const url = "https://www.binance.com/bapi/asset/v2/public/asset-service/product/get-product-list";

  const res = await axios.post(
    url,
    { includeEtf: true }, // Body is required
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Content-Type": "application/json",
        "Client-Type": "web",
        "X-Requested-With": "XMLHttpRequest",
        "Origin": "https://www.binance.com",
        "Referer": "https://www.binance.com/",
      },
    }
  );

  const data = res.data.data || [];
  const hot = data.filter(item => item.hot).map(item => item.s);

  console.log("Hot coins:", hot);
  return hot;
}

async function sendTelegram(message) {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`;
  await axios.post(url, {
    chat_id: process.env.CHAT_ID,
    text: message,
  });
}

async function checkHotChanges() {
  const hot = await getHotCoins();

  const file = "hot.json";
  let old = [];

  if (fs.existsSync(file)) {
    old = JSON.parse(fs.readFileSync(file));
  }

  const added = hot.filter(x => !old.includes(x));
  const removed = old.filter(x => !hot.includes(x));

  if (added.length > 0) {
    await sendTelegram("🔥 New Hot Coins Added:\n" + added.join("\n"));
  }

  if (removed.length > 0) {
    await sendTelegram("❌ Removed From Hot List:\n" + removed.join("\n"));
  }

  fs.writeFileSync(file, JSON.stringify(hot, null, 2));
}

checkHotChanges();
