import express from 'express';
import { 
    companyRequest, 
    quoteRequest, 
    newsRequest, 
    peersRequest, 
    chartsRequest, 
    searchRequest, 
    errorRequest, 
    topsRequest, 
    priceRequest } from './oldcontrollers';

const router = express.Router();

router
    .get('/:ticker/company', companyRequest)
    .get('/:ticker/quote', quoteRequest)
    .get('/:ticker/news', newsRequest)
    .get('/:ticker/peers', peersRequest)
    .get('/:ticker/chart/:range', chartsRequest)
    .get('/search/:query', searchRequest)
    .get('/:ticker/tops', topsRequest)
    .get('/:ticker/prices', priceRequest);



export default router;