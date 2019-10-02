import { company, quote, news, peers, history, keyStats } from 'iexcloud_api_wrapper';
const symbolsData = require('./symbols.json');

export const errorRequest = async (req, res, next) => {
    const { ticker } = req.params;
    if (ticker === 'test') {
        let err = new Error('Invalid ticker');
        err.statusCode = 400;
        next(err);
    }
}

export const topsRequest = async (req, res) => {
    try {
        const { ticker } = req.params;
        const result = await dividends(ticker, '1y');
        res.status(200).send(result);
    } catch (e) {
        res.status(400).send(e);
    }
}

export const searchRequest = async (req, res) => {
    try {
        const { query } = req.params;
        if (query === 'test') throw Error('testing errors');
        let result = symbolsData.filter(({ symbol }) => symbol.toLowerCase().includes(query));
        result = result.length > 10 ? result.slice(0, 10) : result;

        let resp = symbolsData.filter(({ name }) => name.toLowerCase().includes(query)).slice(0, Math.max(0, (10 - result.length)));

        const response = [...result].concat(resp)

        res.status(200).send(response);
    } catch (e) {
        console.log(e.message);
        res.status(400);
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
        const quoteResult = await quote(ticker);
        const keyStatsResult = await keyStats(ticker);
        const { ttmEPS, dividendYield } = keyStatsResult;
        const {
            marketCap,
            peRatio,
            week52High,
            week52Low,
            avgTotalVolume,
            previousClose,
            iexVolume,
            primaryExchange,
            isUSMarketOpen,
            latestTime,
            latestPrice,
            change,
            changePercent,
        } = quoteResult;


        res.status(200).send({
            marketCap,
            peRatio,
            week52High,
            week52Low,
            avgTotalVolume,
            previousClose,
            primaryExchange,
            actualEPS: ttmEPS,
            volume: iexVolume,
            isUSMarketOpen,
            latestTime,
            latestPrice,
            change,
            changePercent,
            dividendYield: (dividendYield * 100).toFixed(2) + '%'
        });
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
        console.log('here', ticker);
        const result = await history(ticker, { period: range, interval: range[1] === 'y' ? 10 : 1 });
        res.status(200).send(result);
    } catch (e) {
        res.status(500).send(e);
    }
}

