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

const pollingMap = new Map();

const tickerMap = new Map(); // tickers are keys and value is a Set of socket objects;

const socketMap = new Map(); // key: socketObject value: [tickers]

let tickerSet = new Set(); // iterable of all tickers subscribed to;

const pricesMap = new Map(); // ticker: price;

// normalized data: sockets have tickers and tickers have sockets and prices, prices have tickers.

const pollPrices = () => {
    priceRequest(tickerMap, socketMap, pricesMap);
}

const reduceTickerMap = (tickers, socket, action) => {
    tickers.forEach(ticker => {
        if(action === 'ADD') {
            if(tickerMap.has(ticker)) {
                tickerMap.set(ticker, new Set([...tickerMap.get(ticker), socket]))
            } else {
                tickerMap.set(ticker, new Set([socket]));
            }
        } else {
            tickerMap.get(ticker).delete(socket) && (tickerMap.get(ticker).size || tickerMap.delete(ticker))
        }
    })
}


poll = setInterval(pollPrices, 3000);

ios.on('connection', socket => {
    const { id } = socket;
    socketMap.set(id, socket);
    socket.on('company', ticker => companyRequest(ticker, socket));
    socket.on('news', ticker => newsRequest(ticker, socket));
    socket.on('peers', ticker => peersRequest(ticker));
    socket.on('keystats', ticker => quoteRequest(ticker, socket));
    socket.on('prices', tickers => reduceTickerMap(tickers, id, 'ADD'));
    socket.on('unsubscribePrices', ticker => reduceTickerMap(ticker, id));
    
    
    
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
    socket.on('disconnect', () => socketMap.delete(id))
})


export default app;