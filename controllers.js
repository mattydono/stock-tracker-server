import { company } from 'iexcloud_api_wrapper';

export const companyRequest = async (req, res) => {
    try {
        const { ticker } = req.params;
        const result = await company(ticker);
        res.status(200).send(result)
    } catch (e) {
        res.status(500).send(e);
    }
}