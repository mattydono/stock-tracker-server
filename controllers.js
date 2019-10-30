import { company, quote, news, peers, history, keyStats, price } from 'iexcloud_api_wrapper';
const symbolsData = require('./symbols.json');

export const isValidTicker = (ticker, socket) => {
    try {
        console.log(ticker);
        const isValid = symbolsData.filter(({ symbol }) => symbol === ticker.toUpperCase()).length > 0;
        socket.emit('isValid', isValid);
    } catch (e) {
        console.error(e);
    }
}

export const searchRequest = async (query, socket) => {
    try {
        let result = symbolsData.filter(({ symbol }) => symbol.toLowerCase().startsWith(query));
        result = result.length > 10 ? result.slice(0, 10) : result;

        let resp = symbolsData.filter(({ name }) => name.toLowerCase().includes(query)).slice(0, Math.max(0, (10 - result.length)));

        const response = [...result].concat(resp)

        socket.emit('search', response);
    } catch (e) {
        socket.emit('error', 'search');
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

export const getPrice = async (ticker, pricesMap) => {
    try {
        if(ticker === 'snap' || ticker === 'SNAP') throw Error('error test');
        const { latestPrice, change, changePercent } = await quote(ticker);
        pricesMap.set(ticker, ({ ticker, latestPrice, change, changePercent, error: false }));
        return ({ ticker, latestPrice, change, changePercent });
    } catch {
        pricesMap.set(ticker, ({ ticker, latestPrice: 0, change: 0, changePercent: 0, error: true }))
    }
}

export const priceRequest = async (tickers, socketMap, pricesMap, socketTickerMap) => {
    try {

        const priceResultArray = await Promise.all(tickers.map(async ticker => await getPrice(ticker, pricesMap)));

        socketTickerMap.forEach((tickers, socketId) => {
            const socket = socketMap.get(socketId);
            const tickersArray = Array.from(tickers);
            const prices = tickersArray.map(ticker => pricesMap.get(ticker));
            socket.emit('prices', prices);
        })

    } catch (e) {
        console.error(e);
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
        const result = await history(ticker, { period: range === '5d' || range === '1m' ? range + 'm' : range, interval: 1 });
        socket.emit('chart', result);
    } catch (e) {
        socket.emit('error', 'chart fetch error');
    }
}

