import { company, quote, news, peers, history, keyStats } from 'iexcloud_api_wrapper';
const symbolsData = require('./symbols.json');


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
        let result = symbolsData.filter(({ symbol }) => symbol.toLowerCase().startsWith(query));
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
        console.log(ticker, Date.now());
        if (ticker === 'aobc' && Math.floor(Math.random() + 0.5)) res.status(400).send('error fetching company')
        else {
            const result = await company(ticker);
            res.status(200).send(result)
        }
    } catch (e) {
        res.status(500).send(e);
    }
}

export const priceRequest = async (req, res) => {
    try {
        const { ticker } = req.params;
        const tickerArray = ticker.split(',');
        const priceResultArray = await Promise.all(tickerArray.map(async ticker => {
            const { latestPrice, change, changePercent } = await quote(ticker);
            return ({
                ticker,
                latestPrice,
                change,
                changePercent,
            })
        }));
        res.status(200).send(priceResultArray);
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
            low,
            high,
        } = quoteResult;

        const open = Math.round(Math.random() * 0.75)

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
            low,
            high,
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
        const result = await history(ticker, { period: range === '5d' || range === '1m' ? range + 'm' : range, interval: 1 });
        res.status(200).send(result);
    } catch (e) {
        res.status(500).send(e);
    }
}