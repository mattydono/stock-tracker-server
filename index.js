import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandling } from './errorHandling';


dotenv.config();

const app = express();
const http = require('http').Server(app)

const PORT = process.env.SERVER_PORT || 3000;
const ENV = process.env.ENV || 'dev';

app
    .use(cors())
    .use(express.json())
    .use('/stock', routes)
    .use(errorHandling);

http.listen(PORT, error => {
    if (error) console.log('Unable to connect to the server', error);
    else console.log(`Server listening on ${PORT} - ${ENV} environment`);
})

export default app;