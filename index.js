import express from 'express';
import io from 'socket.io';

import { 
    searchRequest, 
    companyRequest,
    priceRequest,
    quoteRequest, 
    peersRequest, 
    newsRequest, 
    chartsRequest,
    isValidTicker,
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

const socketMap = new Map(); // key: socketObject value: [tickers]

const pricesMap = new Map(); // ticker: price;

const socketTickerMap = new Map(); // key: socketId value: [tickers];

// normalized data: sockets have tickers and tickers have sockets and prices, prices have tickers.

const pollPrices = () => {
    const array = Array.from(socketTickerMap.values());
    const arr = Array.from(new Set(array.flatMap(item => Array.from(item))))
    priceRequest(arr, socketMap, pricesMap, socketTickerMap);
}


poll = setInterval(pollPrices, 3000);

ios.on('connection', socket => {
    const { id } = socket;
    socketMap.set(id, socket);
    socket.on('ticker', ticker => {
        companyRequest(ticker, socket);
        newsRequest(ticker, socket);
        quoteRequest(ticker, socket);
    })
    socket.on('prices', tickers => {
        socketTickerMap.set(id, new Set([...tickers]));
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