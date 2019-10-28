import symbols from './symbols.json';
import { randomTags } from './helpers';

export const price = async () => {
    const price = Math.random() * 10;
    return ({
        latestPrice: price * 10,
        change: price,
        changePercent: Math.sqrt(price),
    })
}

export const company = async ticker => {
    const tags = randomTags(4);
    const { symbol, name: companyName } = symbols.find(({ symbol }) => symbol === ticker)
    return ({
        symbol,
        companyName,
        website: `${companyName.split(' ')[0].toLowerCase()}.com`,
        description: `${symbol * 15}`,
        tags,
    })
    // return ({
    //     symbol: 'aapl',
    //     companyName: 'Apple Inc.',
    //     website: 'www.apple.com',
    //     description: 'Very cool company from California',
    //     tags: ['NASDAQ', 'TECHNOLOGY', 'USD']
    // })
}

export const news = async ticker => {
    const arr = ['one', 'two', 'three', 'four', 'five'];
    const newsArr = arr.map(item => {
        const datetime = Date.now() - Math.floor(Math.random() * Math.pow(10, 4));
        return ({
            url: `www.${tikcer}${item}.com`,
            headline: `Headline number ${item} for ${ticker}`,
            datetime,
            source: `Mock Data`
        })
    });
    return newsArr;
}


export const quote = async ticker => {
    const { exchange: primaryExchange} = symbols.find(({ symbol }) => symbol === ticker);
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



















