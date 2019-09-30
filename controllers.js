import { company, quote, news, peers, history, marketSymbols } from 'iexcloud_api_wrapper';
const symbolsData = require('./symbols.json');

export const searchRequest = async (req, res) => {
    try {
        const { query } = req.params;
        let result = symbolsData.filter(({ symbol }) => symbol.toLowerCase().includes(query))
        let resp = symbolsData.filter(({ name }) => name.toLowerCase().includes(query)).slice(0, Math.max(0, (10 - result.length)));

        const response = [...result].concat(resp)

        res.status(200).send(response);
    } catch (e) {
        res.status(400).send(e);
    }
}

export const companyRequest = async (req, res) => {
    try {
        const { ticker } = req.params;
        const result = await company(ticker);
        res.status(200).send(result)
    } catch (e) {
        res.status(500).send(e);
    }
}

export const quoteRequest = async (req, res) => {
    try {
        const { ticker } = req.params;
        const result = await quote(ticker);
        res.status(200).send(result);
    } catch (e) {
        const { message } = e;
        res.status(500).send(message);
    }
}

export const peersRequest = async (req, res) => {
    try {
        const { ticker } = req.params;
        const result = await peers(ticker);
        res.status(200).send(result);
    } catch (e) {
        res.status(500).send(e);
    }
}

export const newsRequest = async (req, res) => {
    try {
        const { ticker } = req.params;
        const result = await news(ticker, 5);
        res.status(200).send(result);
    } catch (e) {
        res.status(500).send(e);
    }
}

export const chartsRequest = async (req, res) => {
    try {
        const { ticker, range } = req.params;
        const result = await history(ticker, { period: range, interval: range[1] === 'y' ? 10 : 1 });
        res.status(200).send(result);
    } catch (e) {
        res.status(500).send(e);
    }
}