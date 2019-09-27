import express from 'express';
import { companyRequest, quoteRequest, newsRequest, peersRequest, chartsRequest } from './controllers';

const router = express.Router();

router
    .get('/stock/:ticker/company', companyRequest)
    .get('/stock/:ticker/quote', quoteRequest)
    .get('/stock/:ticker/news', newsRequest)
    .get('/stock/:ticker/peers', peersRequest)
    .get('/stock/:ticker/chart/:range', chartsRequest);

export default router;