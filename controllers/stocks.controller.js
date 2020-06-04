require('dotenv').config();
const stockServices = require('../services/stocks.service');
const authedServices = require('../services/stocks.authed.service');
var express = require('express');
const jwt = require('jsonwebtoken');
var router = express.Router();

router.get('/symbols', async (req, res) => {
    let stocks;
    try {
        if (req.query) {
            if (req.query.industry) {
                stocks = await stockServices.findSymbolsByIndustry(req.query.industry)
                res.status(200)
                res.send(stocks)
            } else if (Object.keys(req.query).length === 0) {
                stocks = await stockServices.findAllSymbols()
                res.status(200)
                res.send(stocks)
            } else {
                res.status(400)
                res.send({ error: true, message: "Invalid query parameter: only 'industry' is permitted" })
            }
        }
    }
    catch (error) {
        res.status(error.status || 500)
        res.send({ error: true, message: error.message })
    }
})

router.get('/:symbol', async (req, res) => {
    let stocks;
    try {
        // Call service class
        if (Object.keys(req.params.symbol).length > 5 || req.params.symbol !== req.params.symbol.toUpperCase()) {
            res.status(400)
            res.send({ error: true, message: "Stock symbol incorrect format - must be 1-5 capital letters" })
        } else {
            if (Object.keys(req.query).length !== 0) {
                res.status(400)
                res.send({ message: "Bad request" })
            } else {
                stocks = await stockServices.findCompaniesBySymbol(req.params.symbol)
                res.status(200)
                res.send(stocks)
            }
        }

    }
    catch (error) {
        res.status(error.status || 500)
        res.send({ error: true, message: error.message })
    }
})

const authorize = (req, res, next) => {
    const authorization = req.headers.authorization
    console.log(authorization);
    let token = null;

    //retrieve token
    if (authorization && authorization.split(" ").length === 2) {
        token = authorization.split(" ")[1]
        console.log(token);
    } else {
        res.status(403)
        res.send({
            error: true,
            message: "Unauthorized user"
        })

        return
    }

    try {
        const secretKey = process.env.SECRET_KEY;
        const decoded = jwt.verify(token, secretKey)
        console.log(decoded);
        if (decoded.exp < Date.now()) {

            res.status(403)
            res.send({
                error: true,
                message: "Token is expired"
            })
            return
        }
        next()
    } catch (e) {
        console.log("Token is not valid ", e);
    }
}

router.get('/authed/:symbol', authorize, async (req, res) => {
    let stocks;
    try {
        // Call service class
        if (Object.keys(req.params.symbol).length > 5 || req.params.symbol !== req.params.symbol.toUpperCase()) {
            res.status(400)
            res.send({ error: true, message: "Stock symbol incorrect format - must be 1-5 capital letters" })
        } else {
            if (req.query) {
                if (req.query.from && req.query.to) {
                    stocks = await authedServices.findAuthedSymbolBetweenDates(req.params.symbol, req.query.from, req.query.to)
                    res.status(200)
                    res.send(stocks)
                } else if (req.query.from) {
                    stocks = await authedServices.findAuthedSymbolsByStartDate(req.params.symbol, req.query.from)
                    res.status(200)
                    res.send(stocks)
                } else if (req.query.to) {
                    stocks = await authedServices.findAuthedSymbolsByEndDate(req.params.symbol, req.query.to)
                    res.status(200)
                    res.send(stocks)
                } else if (Object.keys(req.query).length === 0) {
                    stocks = await authedServices.findAuthedSymbolsOnly(req.params.symbol)
                    res.status(200)
                    res.send(stocks)
                } else {
                    res.status(400)
                    res.send({ error: true, message: "Bad Request" })
                }
            }
        }
    }
    catch (error) {
        res.status(error.status || 500)
        res.send({ error: true, message: error.message })
    }
})

module.exports = router