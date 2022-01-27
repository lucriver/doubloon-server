const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");

const dotenv = require("dotenv");
import { Request, Response } from "express";

const app = express();
const port = process.env.PORT || 8080;

dotenv.config();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const date = new Date();
const day = date.getDate();
const month =
  date.getMonth() + 1 < 10
    ? "0" + (date.getMonth() + 1).toString()
    : (date.getMonth() + 1).toString();
const year = date.getFullYear();
const dateString: string = year + "-" + month + "-" + day;

// Get group of stock news from marketaux
app.get("/stocks/news", async (req: Request, res: Response) => {
  if (!isValidated(req.headers.authorization))
    return res.json({ error: "Unauthorized." });

  const resp = await getData(`
  https://api.marketaux.com/v1/news/all?exchanges=NYSE%2CNASDAQ&api_token=${process.env.markAPI_KEY}`);

  return res.json(resp.data);
});

// Get group of stock prices from polygon.io
app.get("/stocks/prices", async (req: Request, res: Response) => {
  if (!isValidated(req.headers.authorization))
    return res.json({ error: "Unauthorized." });

  const resp = await getData(
    `https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/${dateString}?adjusted=true&apiKey=${process.env.polyAPI_KEY}`
  );

  const topTickers: string[] = [
    "AAPL",
    "MSFT",
    "GOOG",
    "AMZN",
    "TSLA",
    "FB",
    "NVDA",
    "JPM",
    "WMT",
    "BAC",
    "XOM",
    "PFE",
    "KO",
    "DIS",
    "CSCO",
    "INTC",
    "MCD",
    "T",
    "NFLX",
    "AMD",
    "BA",
    "GE",
    "F",
  ];

  var topStocks: object[] = [];
  for (let i = 0; i < topTickers.length; i++) {
    let index = resp.data.results.findIndex(
      (obj: any) => obj.T == topTickers[i]
    );
    let stockObj: any = resp.data.results[index];
    delete stockObj.t;
    topStocks.push(stockObj);
  }

  return res.json({ values: topStocks });
});

app.get("/crypto/news", async (req: Request, res: Response) => {
  if (!isValidated(req.headers.authorization))
    return res.json({ error: "Unauthorized." });

  const resp = await getData(
    `https://www.reddit.com/r/cryptocurrency/top/.json?&sort=top&t=week.json&limit=15`
  );

  return res.json({ collection: resp.data.data.children });
});

// Get group of stock prices from polygon.io
app.get("/crypto/prices", async (req: Request, res: Response) => {
  if (!isValidated(req.headers.authorization))
    return res.json({ error: "Unauthorized." });

  const resp = await getData(
    `https://api.polygon.io/v2/aggs/grouped/locale/global/market/crypto/${dateString}?adjusted=true&apiKey=${process.env.polyAPI_KEY}`
  );

  const topTickers: string[] = [
    "X:BTCUSD",
    "X:XMRUSD",
    "X:ETHUSD",
    "X:USDTUSD",
    "X:BNTUSD",
    "X:USDCUSD",
    "X:ADAUSD",
    "X:XRPUSD",
    "X:DOGEUSD",
    "X:DOTUSD",
  ];

  var topCryptos: object[] = [];

  for (let i = 0; i < topTickers.length; i++) {
    let index = resp.data.results.findIndex(
      (obj: any) => obj.T == topTickers[i]
    );
    let cryptoObj: any = resp.data.results[index];
    delete cryptoObj.t;
    topCryptos.push(cryptoObj);
  }

  topCryptos.forEach((crypto: any) => {
    const name: string = crypto.T;
    const nameArray: string[] = name.split(":");
    const nameArray2: string[] = nameArray[1].split("USD");
    nameArray2[0] === ""
      ? (crypto.T = nameArray[1])
      : (crypto.T = nameArray2[0]);
  });

  return res.json({ values: topCryptos });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});

function isValidated(key: string): boolean {
  if (key == process.env.authAPI_KEY) return true;

  return false;
}

async function getData(url: string) {
  try {
    return await axios.get(url);
  } catch (err: any) {
    return {
      data: err.message,
    };
  }
}
