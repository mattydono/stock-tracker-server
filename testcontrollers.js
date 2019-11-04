const symbols = require('./symbols.json');

const randomTags = n => {
    const startIndex = Math.floor(Math.random() * 1000);
    return symbols.slice(startIndex, (startIndex + n)).map(({ symbol }) => symbol);
}

export const price = async () => {
    const price = Math.random() * 10;
    return {
        latestPrice: price * 10,
        change: price,
        changePercent: Math.sqrt(price),
    };
}

export const company = async ticker => {
    try {
        const tags = await randomTags(4);
        const { symbol, name: companyName } = symbols.find(({ symbol }) => symbol === ticker.toUpperCase());
        return {
            symbol,
            companyName,
            website: `${companyName.split(' ')[0].toLowerCase()}.com`,
            description: `Very nice company ${companyName}`,
            tags,
        };
    } catch {
        throw Error('could not fetch company')
    }
}

export const news = async ticker => {
    const arr = ['one', 'two', 'three', 'four', 'five'];
    const newsArr = arr.map(item => {
        const datetime = Date.now() - Math.floor(Math.random() * Math.pow(10, 4));
        return ({
            url: `www.${ticker}${item}.com`,
            headline: `Headline number ${item} for ${ticker}`,
            datetime,
            source: `Mock Data`
        })
    });
    return newsArr;
}


export const quote = async ticker => {
    const { exchange: primaryExchange} = symbols.find(({ symbol }) => symbol === ticker.toUpperCase());
    return ({
        marketCap: Math.floor(Math.random() * Math.pow(10, 5)),
        peRatio: 22,
        week52High: 33,
        week52Low: 11,
        avgTotalVolume: 20000,
        previousClose: 20,
        low: Math.random() * 100,
        high: Math.random() * 1000,
        volume: 15000,
        open: 18,
        primaryExchange,
        latestTime: new Date(),
        isUSMarketOpen: true,
    })
}

export const keyStats = async () => {
    return ({
        ttmEPS: 0.8,
        dividendYield: Math.random()
    })
}









