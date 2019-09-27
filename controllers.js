import { company, quote, news, peers, history } from 'iexcloud_api_wrapper';

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
        const result = await news(ticker, 5);
        res.status(200).send(result);
    } catch (e) {
        res.status(500).send(e);
    }
}

export const chartsRequest = async (req, res) => {
    try {
        const { ticker, range } = req.params;
        const result = await history(ticker, { period: range });
        res.status(200).send(result);
    } catch (e) {
        res.status(500).send(e);
    }
}