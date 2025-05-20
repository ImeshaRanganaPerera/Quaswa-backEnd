import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as usercenterService from '../userCenter/userCenter.service'
export const currencyRouter = express.Router();

const axios = require('axios');
const app = express();
const port = 3000;

const EXCHANGE_API_KEY = '79902a905384bf1fe9a108be'; // get it from your API provider

currencyRouter.get('/', async (req, res) => {
  const { amount, from } = req.query; // e.g., amount=1000&from=LKR

  if (!amount || !from) {
    return res.status(400).json({ error: 'Missing amount or from currency' });
  }

  try {
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/${from}`
    );

    const rates = response.data.conversion_rates;
    const usdRate = rates['USD'];

    const lkrrate = usdRate; // 1 LKR = 0.0033 USD

    

    if (!usdRate) {
      return res.status(400).json({ error: 'USD rate not found' });
    }

    const numericAmount = Number(amount);

if (isNaN(numericAmount)) {
  return res.status(400).json({ error: 'Invalid amount provided' });
}

const convertedAmount = numericAmount * usdRate;
const lkr = numericAmount / lkrrate;
    res.json({ amountInUSD: convertedAmount.toFixed(2), amountLkr: lkr.toFixed(2)});
  } catch (error) {
    res.status(500).json({ error: 'Error fetching exchange rates' });
  }
});

