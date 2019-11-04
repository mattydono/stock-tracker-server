import { company, quote, news, peers, history, keyStats } from 'iexcloud_api_wrapper';
// import { price, company, news, quote, keyStats } from './testcontrollers';
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

export const hasNotExpired = (map, ticker, minutes) => {
    const ms = minutes * 60 * 1000;
    return (Date.now() - map.get(ticker).timestamp) < ms
}

export const companyRequest = socketMap => companyMap => async (ticker, socketId) => {
    const socket = socketMap.get(socketId);
    try {
        const isCached = (companyMap.has(ticker) || (companyMap.set(ticker, { timestamp: null, data: null }) && false)) && hasNotExpired(companyMap, ticker, (24 * 60));
        const companyData = isCached ? companyMap.get(ticker).data : await company(ticker);
        const timestamp = companyMap.get(ticker).timestamp || Date.now();
        companyMap.set(ticker, { timestamp, data: companyData})
        socket.emit('company', companyData)
    } catch (e) {
        socket.emit('error', 'company');
    }
}

export const getPrice = async (ticker, pricesMap) => {
    try {
        const { latestPrice, change, changePercent } = await quote(ticker);
        pricesMap.set(ticker, ({ ticker, latestPrice, change, changePercent, error: false }));
    } catch {
        pricesMap.set(ticker, ({ ticker, latestPrice: 0, change: 0, changePercent: 0, error: true }))
    }
}

export const emitPrices = socketMap => pricesMap => async (tickers, socketId) => {
    try {
        for (const ticker of tickers) {
            if (!pricesMap.has(ticker)) {
                await getPrice(ticker, pricesMap)
            }
        }
        const prices = Array.from(tickers).map(ticker => pricesMap.get(ticker));
        socketMap.get(socketId).emit('prices', prices);
    } catch {
        const socket = socketMap.get(socketId);
        socket.emit('error', 'error emitting prices');
    }
}

export const priceRequest = async (tickers, socketMap, pricesMap, socketTickerMap) => {
    try {

        for (const ticker of tickers) await getPrice(ticker, pricesMap)

        const emit = emitPrices(socketMap)(pricesMap);

        for (const [socketId, tickers] of socketTickerMap) await emit(tickers, socketId)

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

