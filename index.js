import express from 'express';
import io from 'socket.io';
import socketClient from 'socket.io-client';

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


// const url = 'https://ws-api.iextrading.com/1.0/deep';
// const socket = socketClient(url);

// socket.on('connect', () => {
//     socket.emit('subscribe', JSON.stringify({
//         channels: ['systemevent']
//     }))
// })

const app = express();
const server = require('http').Server(app)
const ios = io(server);
ios.set('origins', '*:*');
let poll

const pricesSocket = ios.of('/prices');


const PORT = process.env.SERVER_PORT || 3000;
const ENV = process.env.ENV || 'dev';

server.listen(PORT, error => {
    if (error) console.log('Unable to connect to the server', error);
    else console.log(`Server listening on ${PORT} - ${ENV} environment`);
})

const pollingMap = new Map();

const tickerMap = new Map(); // tickers are keys and value is a Set of socket objects;

const socketMap = new Map(); // key: socketObject value: [tickers]

let tickerSet = new Set(); // iterable of all tickers subscribed to;

const pricesMap = new Map(); // ticker: price;

// normalized data sockets have tickers and tickers have sockets;

const pollPrices = () => {
    const tickers = Array.from(tickerSet);
    if(tickers.length > 0) {
        priceRequest(Array.from(tickerSet), tickerMap)
    }
}

const reduceTickerSet = (tickers) => {
    tickerSet = new Set([...tickerSet, ...tickers])
}

const reduceTickerMap = (tickers, socket) => {
    tickers.forEach(ticker => {
        if(tickerMap.has(ticker)) {
            tickerMap.set(ticker, new Set([...tickerMap.get(ticker), socket]))
            tickerMap[ticker].add(socket);
        } else {
            tickerMap.set(ticker, new Set([socket]));
        }
    })
}

const reduceSocketMap = (socket)

poll = setInterval(pollPrices, 3000);

ios.on('connection', function(socket) {
    
    socket.on('company', ticker => companyRequest(ticker, socket));
    socket.on('news', ticker => newsRequest(ticker, socket));
    socket.on('peers', ticker => peersRequest(ticker));
    socket.on('keystats', ticker => quoteRequest(ticker, socket));
    socket.on('prices', tickers => {
        reduceTickerSet(tickers);
        reduceTickerMap(tickers, socket);
    });
    // socket.on('prices', tickers => {
    //     const prices = () => priceRequest(tickers, socket);
    //     prices();
    //     polling.prices = setInterval(prices, 3000);
    // });
    socket.on('unsubscribePrices', () => clearInterval(polling.prices));
    socket.on('chart', args => {
        const [ticker, range] = args;
        const chart = () => chartsRequest(ticker, range, socket);
        chart();
        if(range === '1d') {
            polling.chart = setInterval(chart, 60000);
        }
    });
    socket.on('unsubscribeChart', () => clearInterval(polling.chart));
    socket.on('search', query => searchRequest(query, socket));
    socket.on('isValid', ticker => isValidTicker(ticker, socket));
    socket.on('disconnect')
})


export default app;