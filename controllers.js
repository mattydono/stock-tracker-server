import { company, quote, news, peers } from 'iexcloud_api_wrapper';

export const companyRequest = async (req, res) => {
    try {
        const { ticker } = req.params;
        const result = await company(ticker);
        res.status(200).send(result)
    } catch (e) {
        res.status(500).send(e);
    }
}

export const quoteRequest = async (req, res) => {
    try {
        const { ticker } = req.params;
        const result = await quote(ticker);
        res.status(200).send(result);
    } catch (e) {
        res.status(500).send(e);
    }
}

export const peersRequest = async (req, res) => {
    try {
        const { ticker } = req.params;
        const result = await peers(ticker);
        res.status(200).send(result);
    } catch (e) {
        res.status(500).send(e);
    }
}

export const newsRequest = async (req, res) => {
    try {
        const { ticker } = req.params;
        const result = await news(ticker);
        res.status(200).send(result);
    } catch (e) {
        res.status(500).send(e);
    }
}
