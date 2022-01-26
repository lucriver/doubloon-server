const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");

const stocknews = require("./stocksnews.json");

const dotenv = require("dotenv");
import { Request, Response } from "express";

const app = express();
const port = process.env.PORT || 8080;

dotenv.config();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.get("/stocks/news", (req: Request, res: Response) => {
  res.json(stocknews);
});

// Returns group of stock prices from polygon.io
app.get("/stocks/prices", async (req: Request, res: Response) => {
  const resp = await getData(
    "https://api.polygon.io/v2/aggs/grouped/locale/us/market/stocks/2020-10-14?adjusted=true&apiKey=" +
      process.env.polyAPI_KEY
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
    var index = resp.data.results.findIndex(
      (obj: any) => obj.T == topTickers[i]
    );
    topStocks.push(resp.data.results[index]);
  }
  res.json(topStocks);
});

app.get("/cyrpto/news", (req: Request, res: Response) => {
  res.json();
});

app.get("/cyrpto/prices", (req: Request, res: Response) => {
  res.json();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});

async function getData(url: string) {
  try {
    return await axios.get(url);
  } catch (err: any) {
    return {
      data: err.message,
    };
  }
}
