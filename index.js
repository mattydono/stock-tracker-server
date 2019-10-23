import express from 'express';
import io from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';

import { 
    searchRequest, 
    companyRequest,
    priceRequest,
    quoteRequest, 
    peersRequest, 
    newsRequest, 
    chartsRequest
    } from './controllers';


const app = express();
const server = require('http').Server(app)
const ios = io(server);

app.set('socketio', ios);

app
    .use(cors())
    .use(express.json())
    .use('/stock', routes);

const PORT = process.env.SERVER_PORT || 3000;
const ENV = process.env.ENV || 'dev';

server.listen(PORT, error => {
    if (error) console.log('Unable to connect to the server', error);
    else console.log(`Server listening on ${PORT} - ${ENV} environment`);
})


ios.on('connection', function(socket) {
    const polling = { }
    socket.on('company', ticker => companyRequest(ticker, socket));
    socket.on('news', ticker => newsRequest(ticker, socket));
    socket.on('peers', ticker => peersRequest(ticker));
    socket.on('keystats', ticker => quoteRequest(ticker, socket));
    socket.on('prices', tickers => {
        const prices = () => priceRequest(tickers, socket)
        prices();
        polling.prices = setInterval(prices, 3000);
    });
    socket.on('unsubscribePrices', () => clearInterval(polling.prices));
})


export default app;






// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import routes from './routes';


// dotenv.config();

// const app = express();
// const http = require('http').Server(app)

// const PORT = process.env.SERVER_PORT || 3000;
// const ENV = process.env.ENV || 'dev';

// app
//     .use(cors())
//     .use(express.json())
//     .use('/stock', routes);

// http.listen(PORT, error => {
//     if (error) console.log('Unable to connect to the server', error);
//     else console.log(`Server listening on ${PORT} - ${ENV} environment`);
// })

// export default app;