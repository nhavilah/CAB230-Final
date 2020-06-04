const knex = require('../database/db')

module.exports = {
    findAllSymbols,
    findSymbolsByIndustry,
    findCompaniesBySymbol
}

async function findAllSymbols() {
    let stocks;
    stocks = await knex.from("stocks").select("name", "symbol", "industry").distinct();
    return stocks
}
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