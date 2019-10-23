import { company, quote, news, peers, history, keyStats } from 'iexcloud_api_wrapper';
const symbolsData = require('./symbols.json');

export const isValidTicker = async (ticker, socket) => {
    const isValid = symbolsData.includes(({ symbol }) => symbol === ticker);
    socket.emit('isValid', isValid);
}

export const searchRequest = async (query, socket) => {
    try {
        let result = symbolsData.filter(({ symbol }) => symbol.toLowerCase().startsWith(query));
        result = result.length > 10 ? result.slice(0, 10) : result;

        let resp = symbolsData.filter(({ name }) => name.toLowerCase().includes(query)).slice(0, Math.max(0, (10 - result.length)));

        const response = [...result].concat(resp)

        socket.emit('search', response);
    } catch (e) {
        socket.emit('error', 'search request failed');
    }
}

export const companyRequest = async (ticker, socket) => {
    try {
        const result = await company(ticker);
        socket.emit('company', result)
    } catch (e) {
        socket.emit('error', 'company');
    }
}

export const priceRequest = async (ticker, socket) => {
    try {
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
        socket.emit('prices', priceResultArray)
    } catch (e) {
        socket.emit('error', 'prices');
    }
}

export const quoteRequest = async (ticker, socket) => {
    try {
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

        const result = {
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
        };

        socket.emit('keystats', result);
        
    } catch (e) {
        socket.emit('error', 'quote');
    }
}

export const peersRequest = async (ticker, socket) => {
    try {
        const result = await peers(ticker);
        socket.emit('peers', result);
    } catch (e) {
        socket.emit('error', 'peers');
    }
}

export const newsRequest = async (ticker, socket) => {
    try {
        const result = await news(ticker, 5);
        socket.emit('news', result);
    } catch (e) {
        socket.emit('error', 'news');
    }
}

export const chartsRequest = async (ticker, range, socket) => {
    try {
        console.log(ticker, range);
        const result = await history(ticker, { period: range === '5d' || range === '1m' ? range + 'm' : range, interval: 1 });
        console.log(range, result.length);
        socket.emit('chart', result);
    } catch (e) {
        socket.emit('error', 'chart fetch error');
    }
}

