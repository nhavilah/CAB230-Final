const knex = require('../database/db')

module.exports = {
    findAllSymbols,
    findSymbolsByIndustry,
    findCompaniesBySymbol
}

//used in the /stocks/symbols endpoint if there is no industry query
//will find every object in the database
//expect to return an array of objects
async function findAllSymbols() {
    let stocks;
    stocks = await knex.from("stocks").select("name", "symbol", "industry").distinct();
    return stocks
}

//used in the /stocks/symbols?industry= query
//will find every object in the database with a matching industry
//expect to return an array of objects
async function findSymbolsByIndustry(industry) {
    let stocks;
    console.log(industry);
    stocks = await knex.from("stocks").select("name", "symbol", "industry").where('industry', 'LIKE', "%" + industry + "%").distinct()
    if (stocks.length === 0) {
        throw {
            error: true,
            status: 404,
            message: "Not found"
        }
    }
    return stocks
}

//used in the /stocks/:symbol endpoint
//will return the first object with the matching symbol
//expect to return a single object
async function findCompaniesBySymbol(symbol) {
    let stocks;
    stocks = await knex.from("stocks").select("timestamp", "symbol", "name", "industry", "open", "high", "low", "close", "volumes").where('symbol', '=', symbol).distinct()
    if (stocks.length === 0) {
        throw {
            error: true,
            status: 404,
            message: "No entry for symbol in stocks database"
        }
    }
    return stocks[0]
}