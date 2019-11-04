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

const pricesMap = new Map(); // ticker: price;

const companyMap = new Map() // ticker: companyOverview;

const socketTickerMap = new Map(); // key: socketId value: [tickers];


const updatePrices = tickers => () => {
    priceRequest(tickers, socketMap, pricesMap, socketTickerMap);
    tickers = new Set(Array.from(socketTickerMap.values()).flatMap(item => Array.from(item)));
}

const update = updatePrices(new Set())

poll = setInterval(update, 5000);

ios.on('connection', socket => {
    const { id } = socket;
    const emit = () => emitPrices(socketMap)(pricesMap)(socketTickerMap.get(id), id)
    socketMap.set(id, socket);
    socket.on('ticker', ticker => {
        socketTickerMap.set(id, new Set([...favorites, ticker])) && emit()
        companyRequest(socketMap)(companyMap)(ticker, id);
        newsRequest(ticker, socket);
        quoteRequest(ticker, socket);
    })
    socket.on('prices', tickers => {
        socketTickerMap.set(id, new Set([...tickers, ...currentTicker])) && emit()
    });
    socket.on('search', query => searchRequest(query, socket));
    socket.on('isValid', ticker => isValidTicker(ticker, socket));
    socket.on('chart', args => {
        const [ticker, range] = args;
        chartsRequest(ticker, range, socket);
    });
    socket.on('disconnect', () => {
        socketMap.has(id) && socketMap.delete(id);
        socketTickerMap.has(id) && socketTickerMap.delete(id);
    })
})

export default app;