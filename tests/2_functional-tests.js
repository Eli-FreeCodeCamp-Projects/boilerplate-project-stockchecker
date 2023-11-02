'use strict';
const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const Ut = require('../utils/utils');
chai.use(chaiHttp);

let globalLikes
suite('Functional Tests', function() {
    suite('GET request to /api/stock-prices, test with valid fields', ()=>{
        test('Viewing one stock: GET request to /api/stock-prices/', function (done) {
            chai.request(server)
                .get('/api/stock-prices?stock=GOog')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body, 'response should be an object');
                    assert.isObject(res.body.stockData, 'response should return a stockData object');
                    assert.property(res.body.stockData, 'stock', 'response should return a original stock symbol');
                    assert.property(res.body.stockData, 'price', 'response should return a stock price');
                    assert.property(res.body.stockData, 'likes', 'response should return the number total of likes for the stock symbol');
                    assert.strictEqual(res.body.stockData.stock, 'goog', "Stock symbol must be lower case")
                    assert.isTrue(Ut.isPositiveNumber(res.body.stockData.price), "Stock price must be a positive number")
                    globalLikes = res.body.stockData.likes
                    assert.isTrue(Ut.isNumber(res.body.stockData.likes), "Stock likes must be a number")
                    done();
                });
        });

        test('Viewing one stock and liking it: GET request to /api/stock-prices/', function (done) {
            chai.request(server)
                .get('/api/stock-prices?stock=GOog&like=true')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body, 'response should be an object');
                    assert.isObject(res.body.stockData, 'response should return a stockData object');
                    assert.property(res.body.stockData, 'stock', 'response should return a original stock symbol');
                    assert.property(res.body.stockData, 'price', 'response should return a stock price');
                    assert.property(res.body.stockData, 'likes', 'response should return the number total of likes for the stock symbol');
                    assert.strictEqual(res.body.stockData.stock, 'goog', "Stock symbol must be lower case")
                    assert.isTrue(Ut.isPositiveNumber(res.body.stockData.price), "Stock price must be a positive number")
                    assert.isTrue(Ut.isPositiveNumber(res.body.stockData.likes))
                    assert.isTrue(globalLikes + 1 === res.body.stockData.likes)
                    globalLikes = res.body.stockData.likes
                    done();
                });
        });

        test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function (done) {
            chai.request(server)
                .get('/api/stock-prices?stock=GOog&like=true')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body, 'response should be an object');
                    assert.isObject(res.body.stockData, 'response should return a stockData object');
                    assert.property(res.body.stockData, 'stock', 'response should return a original stock symbol');
                    assert.property(res.body.stockData, 'price', 'response should return a stock price');
                    assert.property(res.body.stockData, 'likes', 'response should return the number total of likes for the stock symbol');
                    assert.property(res.body.stockData, 'error', 'response should return an error for liking twice');
                    assert.strictEqual(res.body.stockData.stock, 'goog', "Stock symbol must be lower case")
                    assert.strictEqual(res.body.stockData.error, "You can't like a stock more than one time")
                    assert.isTrue(Ut.isPositiveNumber(res.body.stockData.price), "Stock price must be a positive number")
                    assert.isTrue(Ut.isPositiveNumber(res.body.stockData.likes))
                    assert.isTrue(globalLikes === res.body.stockData.likes)
                    globalLikes = res.body.stockData.likes
                    done();
                });
        });

        test('Viewing one stock and unliking it: GET request to /api/stock-prices/', function (done) {
            chai.request(server)
                .get('/api/stock-prices?stock=GOog&like=false')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body, 'response should be an object');
                    assert.isObject(res.body.stockData, 'response should return a stockData object');
                    assert.property(res.body.stockData, 'stock', 'response should return a original stock symbol');
                    assert.property(res.body.stockData, 'price', 'response should return a stock price');
                    assert.property(res.body.stockData, 'likes', 'response should return the number total of likes for the stock symbol');
                    assert.strictEqual(res.body.stockData.stock, 'goog', "Stock symbol must be lower case")
                    assert.isTrue(Ut.isPositiveNumber(res.body.stockData.price), "Stock price must be a positive number")
                    assert.isTrue(Ut.isNumber(res.body.stockData.likes))
                    assert.isTrue(globalLikes - 1 === res.body.stockData.likes)
                    globalLikes = res.body.stockData.likes
                    done();
                });
        });

        test('Viewing two stocks: GET request to /api/stock-prices/', function (done) {
            chai.request(server)
                .get('/api/stock-prices?stock=GOog&&stock=AaPl')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body, 'response should be an object');
                    assert.isArray(res.body.stockData, 'response should return a stockData array');
                    
                    const stock1 = res.body.stockData[0]
                    assert.isObject(stock1, 'stockData[0] should be an object');
                    assert.property(stock1, 'stock', 'stockData[0] should return a original stock symbol');
                    assert.property(stock1, 'price', 'stockData[0] should return a stock price');
                    assert.property(stock1, 'rel_likes', 'stockData[0] should return the difference of likes for the stocks symbols');
                    assert.strictEqual(stock1.stock, 'goog', "Stock symbol must be lower case")
                    assert.isTrue(Ut.isPositiveNumber(stock1.price), "Stock price must be a positive number")
                    assert.isTrue(Ut.isNumber(stock1.rel_likes))

                    const stock2 = res.body.stockData[1]
                    assert.isObject(stock2, 'stock2 should be an object');
                    assert.property(stock2, 'stock', 'stock2 should return a original stock symbol');
                    assert.property(stock2, 'price', 'stock2 should return a stock price');
                    assert.property(stock2, 'rel_likes', 'stock2 should return the number total of likes for the stock symbol');
                    assert.strictEqual(stock2.stock, 'aapl', "stock2 symbol must be lower case")
                    assert.isTrue(Ut.isPositiveNumber(stock2.price), "stock2 price must be a positive number")
                    assert.isTrue(Ut.isNumber(stock2.rel_likes))
                    
                    done();
                });
        });

        test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function (done) {
            chai.request(server)
                .get('/api/stock-prices?stock=GOog&&stock=AaPl&like=true')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body, 'response should be an object');
                    assert.isArray(res.body.stockData, 'response should return a stockData array');
                    
                    const stock1 = res.body.stockData[0]
                    assert.isObject(stock1, 'stockData[0] should be an object');
                    assert.property(stock1, 'stock', 'stockData[0] should return a original stock symbol');
                    assert.property(stock1, 'price', 'stockData[0] should return a stock price');
                    assert.property(stock1, 'rel_likes', 'stockData[0] should return the difference of likes for the stocks symbols');
                    assert.strictEqual(stock1.stock, 'goog', "Stock symbol must be lower case")
                    assert.isTrue(Ut.isPositiveNumber(stock1.price), "Stock price must be a positive number")
                    assert.isTrue(Ut.isNumber(stock1.rel_likes))

                    const stock2 = res.body.stockData[1]
                    assert.isObject(stock2, 'stock2 should be an object');
                    assert.property(stock2, 'stock', 'stock2 should return a original stock symbol');
                    assert.property(stock2, 'price', 'stock2 should return a stock price');
                    assert.property(stock2, 'rel_likes', 'stock2 should return the number total of likes for the stock symbol');
                    assert.strictEqual(stock2.stock, 'aapl', "stock2 symbol must be lower case")
                    assert.isTrue(Ut.isPositiveNumber(stock2.price), "stock2 price must be a positive number")
                    assert.isTrue(Ut.isNumber(stock2.rel_likes))
                    
                    done();
                });
        });

        test('Viewing two stocks and unliking them: GET request to /api/stock-prices/', function (done) {
            chai.request(server)
                .get('/api/stock-prices?stock=GOog&&stock=AaPl&like=false')
                .end(function (err, res) {
                    assert.equal(res.status, 200);
                    assert.isObject(res.body, 'response should be an object');
                    assert.isArray(res.body.stockData, 'response should return a stockData array');
                    
                    const stock1 = res.body.stockData[0]
                    assert.isObject(stock1, 'stockData[0] should be an object');
                    assert.property(stock1, 'stock', 'stockData[0] should return a original stock symbol');
                    assert.property(stock1, 'price', 'stockData[0] should return a stock price');
                    assert.property(stock1, 'rel_likes', 'stockData[0] should return the difference of likes for the stocks symbols');
                    assert.strictEqual(stock1.stock, 'goog', "Stock symbol must be lower case")
                    assert.isTrue(Ut.isPositiveNumber(stock1.price), "Stock price must be a positive number")
                    assert.isTrue(Ut.isNumber(stock1.rel_likes))

                    const stock2 = res.body.stockData[1]
                    assert.isObject(stock2, 'stock2 should be an object');
                    assert.property(stock2, 'stock', 'stock2 should return a original stock symbol');
                    assert.property(stock2, 'price', 'stock2 should return a stock price');
                    assert.property(stock2, 'rel_likes', 'stock2 should return the number total of likes for the stock symbol');
                    assert.strictEqual(stock2.stock, 'aapl', "stock2 symbol must be lower case")
                    assert.isTrue(Ut.isPositiveNumber(stock2.price), "stock2 price must be a positive number")
                    assert.isTrue(Ut.isNumber(stock2.rel_likes))
                    
                    done();
                });
        });
    })
});

teardown(function() {
    chai.request(server)
      .get('/')
  });
