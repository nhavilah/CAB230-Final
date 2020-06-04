const knex = require('../database/db')

module.exports = {
    findAuthedSymbolsOnly,
    findAuthedSymbolsByStartDate,
    findAuthedSymbolsByEndDate,
    findAuthedSymbolBetweenDates
}

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
    if (stocks.length === 1) {
        return stocks[0]
    } else {
        return stocks
    }
}