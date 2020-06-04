const knex = require('../database/db')

module.exports = {
    findAuthedSymbolsOnly,
    findAuthedSymbolsByStartDate,
    findAuthedSymbolsByEndDate,
    findAuthedSymbolBetweenDates
}

//used by the /stocks/authed/:symbol endpoint if there is no from or to query in the url
//will find the first value that matches the query
//expect to return an array of objects
async function findAuthedSymbolsOnly(symbol) {
    let stocks;
    stocks = await knex.from("stocks").select("timestamp", "symbol", "name", "industry", "open", "high", "low", "close", "volumes").where('symbol', '=', symbol).distinct().limit(1)
    if (stocks.length === 0) {
        throw {
            error: true,
            status: 404,
            message: "No entry for symbol in stocks database"
        }
    }
    return stocks
}

//used by the /stocks/authed/:symbol endpoint if there is only a from query in the url
//will find all objects after the provided date
//expect to return an array of objects
async function findAuthedSymbolsByStartDate(symbol, fromDate) {
    let stocks;
    stocks = await knex.from("stocks").select("timestamp", "symbol", "name", "industry", "open", "high", "low", "close", "volumes").where('symbol', '=', symbol).andWhere('timestamp', '>=', "%" + fromDate.substring(0, 10) + "%").distinct().orderBy('timestamp')
    if (stocks.length === 0) {
        throw {
            error: true,
            status: 404,
            message: "No entries available for query symbol for supplied date range"
        }
    }
    return stocks
}

//used by the /stocks/authed/:symbol endpoint if there is only a to query in the url
//will find all objects up until the provided date
//expect to return an array of objects
async function findAuthedSymbolsByEndDate(symbol, toDate) {
    let stocks;
    if (toDate.length <= 30) {
        throw {
            error: true,
            status: 400,
            message: "From date cannot be parsed by Date.parse()"
        }
    } else if (toDate[8] > 3) {
        throw {
            error: true,
            status: 400,
            message: "To date cannot be parsed by Date.parse()"
        }
    } else {
        stocks = await knex.from("stocks").select("timestamp", "symbol", "name", "industry", "open", "high", "low", "close", "volumes").where('symbol', '=', symbol).andWhere('timestamp', '<=', "%" + toDate.substring(0, 10) + "%").distinct().orderBy('timestamp')
        if (stocks.length === 0) {
            throw {
                error: true,
                status: 404,
                message: "No entries available for query symbol for supplied date range"
            }
        }
    }
    return stocks
}

//used by the /stocks/authed/:symbol endpoint if there is a from and to query in the url parameters
//will find all objects between the two provided dates
//expect to return an  array of objects
async function findAuthedSymbolBetweenDates(symbol, fromDate, toDate) {
    let stocks;
    stocks = await knex.from("stocks").select("timestamp", "symbol", "name", "industry", "open", "high", "low", "close", "volumes").andWhere('timestamp', '>=', fromDate.substring(0, 10)).andWhere('timestamp', '<=', toDate.substring(0, 10)).andWhere('symbol', '=', symbol).distinct()
    if (stocks.length === 0) {
        throw {
            error: true,
            status: 404,
            message: "Not found"
        }
    }
    //returns a single object not an array if the query only returns a single result from the database
    //otherwise returns an array of objects
    if (stocks.length === 1) {
        return stocks[0]
    } else {
        return stocks
    }
}