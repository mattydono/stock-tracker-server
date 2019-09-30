import express from 'express';
import { companyRequest, quoteRequest, newsRequest, peersRequest, chartsRequest, searchRequest } from './controllers';

const router = express.Router();

router
    .get('/:ticker/company', companyRequest)
    .get('/:ticker/quote', quoteRequest)
    .get('/:ticker/news', newsRequest)
    .get('/:ticker/peers', peersRequest)
    .get('/:ticker/chart/:range', chartsRequest)
    .get('/search/:query', searchRequest);



export default router;