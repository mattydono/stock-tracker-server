import express from 'express';
import io from 'socket.io';
import client from 'socket.io-client';

import { 
    searchRequest, 
    companyRequest,
    priceRequest,
    quoteRequest, 
    peersRequest, 
    newsRequest, 
    chartsRequest,
    isValidTicker,
    emitPrices
} from './controllers';


const app = express();
const server = require('http').Server(app)
const ios = io(server);
ios.set('origins', '*:*');
let poll


const PORT = process.env.SERVER_PORT || 4000;
const ENV = process.env.ENV || 'dev';

server.listen(PORT, error => {
    if (error) console.log('Unable to connect to the server', error);
    else console.log(`Server listening on ${PORT} - ${ENV} environment`);
})

const socketMap = new Map(); // key: socketId value: socketObject;

const tickerMap = new Map(); // key: ticker value: [socketId's];

const pricesMap = new Map(); // ticker: price;

const newsMap = new Map(); // ticker: news;

const keystatsMap = new Map() // ticker: keyStats;

const companyMap = new Map() // ticker: companyOverview;

const socketTickerMap = new Map(); // key: socketId value: [tickers];

const socketCurrentTickerMap = new Map(); // key: socketId value: currentTicker;

const isMarketOpen = () => {
    const date = new Date();
    const day = date.getUTCDay();
    const hour = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    return (
        day <= 5 &&
        hour >= 14 && 
        (minutes >= 30 || hour > 14) &&
        hour <= 21
    )
}


const updatePrices = tickers => () => {
    priceRequest(tickers, socketMap, pricesMap, socketTickerMap);
    tickers = new Set(Array.from(socketTickerMap.values()).flatMap(item => Array.from(item)));
}

const updateTickerBound = socketMap => newsMap => keystatsMap => companyMap => {
    const updateNews = newsRequest(socketMap)(newsMap);
    const updateKeystats = quoteRequest(socketMap)(keystatsMap);
    const updateCompany = companyRequest(socketMap)(companyMap);
    const fnArr = [updateNews, updateKeystats, updateCompany];

    return (ticker, socketId) => {
        const socket = socketMap.get(socketId)
        for (const fn of fnArr) {
            fn(ticker, socket)
        }
    }
}

const update = updatePrices(new Set())

poll = setInterval(update, 3000);

ios.on('connection', socket => {
    const { id } = socket;
    console.log(`A new client has connected. SocketId: ${id}`)
    let favorites = [];
    let currentTicker = [];
    const emit = () => emitPrices(socketMap)(pricesMap)(socketTickerMap.get(id), id)
    socketMap.set(id, socket);
    socket.on('ticker', ticker => {
        socketTickerMap.set(id, new Set([...favorites, ticker])) && emit()
        currentTicker = [ticker];
        companyRequest(socketMap)(companyMap)(ticker, id);
        newsRequest(ticker, socket);
        quoteRequest(ticker, socket);
    })
    socket.on('prices', tickers => {
        favorites = tickers
        socketTickerMap.set(id, new Set([...tickers, ...currentTicker])) && emit()
    });
    socket.on('search', query => searchRequest(query, socket));
    socket.on('isValid', ticker => isValidTicker(ticker, socket));
    socket.on('chart', args => {
        const [ticker, range] = args;
        const chart = () => chartsRequest(ticker, range, socket);
        chart();
        if(range === '1d') {
            polling.chart = setInterval(chart, 60000);
        }
    });
    socket.on('unsubscribeChart', () => { });
    socket.on('disconnect', () => {
        socketMap.has(id) && socketMap.delete(id);
        socketTickerMap.has(id) && socketTickerMap.delete(id);
    })
})

export default app;