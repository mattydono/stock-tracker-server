import express from 'express';
import { companyRequest } from './controllers';

const router = express.Router();

router
    .get('/stock/:ticker/company', companyRequest);

export default router;