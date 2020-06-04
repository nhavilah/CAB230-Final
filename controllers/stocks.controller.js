require('dotenv').config();
const stockServices = require('../services/stocks.service');
const authedServices = require('../services/stocks.authed.service');
var express = require('express');
const jwt = require('jsonwebtoken');
var router = express.Router();

//NOTE: The main error handling for invalid queries, params, etc... is handled here in the controller

//handles the /stocks/symbols endpoint
//has an option to filter by industry as a query, and as such chooses a different service to retrieve the requested values with
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

//used to handle the /stocks/:symbol endpoint
//request must be capitalised and between 1 and 5 characters long
router.get('/:symbol', async (req, res) => {
    let stocks;
    try {
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

//handles the authorisation header for the authenticated route
//checks the validity of the token, which is taken from the header
const authorize = (req, res, next) => {
    const authorization = req.headers.authorization
    let token = null;

    //retrieve token
    if (authorization && authorization.split(" ").length === 2) {
        token = authorization.split(" ")[1]
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
        res.status(403)
        res.send({
            error: true,
            message: "Token is not valid"
        })
        return
    }
}

//used to handle the /stocks/authed/:symbol endpoint
//can take from and to as queries, and filters the response accordingly
//unlike the other endpoints, this uses a separate service to handle queries ../services/stocks.authed.service.js
//symbol must be capitalised and between 1 and 5 characters long
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