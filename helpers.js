import symbols from './symbols.json';

export const randomTags = n => {
    const startIndex = Math.floor(Math.random() * 1000);
    return symbols.slice(startIndex, (startIndex + n));
}