'use strict';
const Ut = require('../utils/utils');
let StockLike = require('../models/StockLike.js');
class StockOptionController{
    getlastPrice(stockPrice){
        if(Ut.isObject(stockPrice) && Ut.isNumber(stockPrice.latestPrice)){
            return stockPrice.latestPrice;
        }
        return null;
    }

    isValidStockSymbol(stockName){
        return Ut.isStrNotEmpty(stockName) && /^([A-z]{4})$/.test(stockName)
    }

    likeStockOption(stockName){
        return new Promise((resolve, reject) => {
            
        });
    }

    checkPrice(stockName){
        return new Promise((resolve, reject)=>{
            if(!this.isValidStockSymbol(stockName)){
                reject({error: "invalid symbol"})
            }
            const symbol = stockName.toLowerCase()
            const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`
            fetch(url, {headers: {'Accept': 'application/json'}})
                .then(response=>{
                    return response.json()
                })
                .then(stockPrice=>{
                    const lastPrice = this.getlastPrice(stockPrice)
                    if(Ut.isNumber(lastPrice)){
                        resolve({price: lastPrice})
                    }
                    else{
                        reject({error: "invalid symbol"})
                    }
                })
                .catch(err=>{
                    reject({error: "Price api unavailable", info: err})
                })
        })   
    }
    getPriceAndSetLike(stockName, hashedIp, like){
        return new Promise((resolve, reject)=>{
            // const symbolLike = (like === true || like === 'true') ? true : false;
            this.checkPrice(stockName)
                .then(stockPrice=>{
                    if(Ut.isObject(stockPrice) && stockPrice.hasOwnProperty('error')){
                        resolve(stockPrice)
                    }
                    else{
                        
                        if(like === 'true'){
                            StockLike.addLike(stockName, hashedIp)
                                .then(updateRes=>{
                                    if(Ut.isObject(updateRes) && updateRes.hasOwnProperty('error')){
                                        let addResult = {...stockPrice}
                                        addResult.error = updateRes.error
                                        resolve(addResult)
                                    }else{
                                        resolve(stockPrice)
                                    }
                                    
                                })  
                                .catch(err=>{
                                    reject({error: "Unable to add like to stock.", info: err})
                                })
                        }
                        else if(like === 'false'){
                            StockLike.removeLike(stockName, hashedIp)
                                .then(updateRes=>{
                                    resolve(stockPrice)
                                })  
                                .catch(err=>{
                                    reject(err)
                                })
                        }
                        else{
                            resolve(stockPrice)
                        }
                    }
                })
                .catch(err=>{
                    reject(err)
                })
        })
        
    }
    getPriceAndLikes(stockName, hashedIp, like){
        return new Promise((resolve, reject)=>{
            const symbol = stockName.toLowerCase()
            this.getPriceAndSetLike(symbol, hashedIp, like)
                .then(res=>{
                    if(Ut.isObject(res)){
                        StockLike.countLikesByName(symbol)
                            .then(nbLikes=>{
                                let finalRes = {stock: symbol, price: res.price, likes: nbLikes}
                                finalRes.error = res.error
                                resolve(finalRes)
                            })
                            .catch((err)=>{
                                reject(err)
                            })
                    }
                    else{
                        
                    }
                })
                .catch(err=>{
                    reject(err)
                })
        })
        
    }
    compareStocks(stockName1, stockName2, hashedIp, like ){
        return new Promise((resolve, reject)=>{
            this.getPriceAndLikes(stockName1, hashedIp, like)
                .then(price1=>{
                    let result = {
                        stockData: []
                    }
                    this.getPriceAndLikes(stockName2, hashedIp, like)
                        .then(price2=>{
                            let result1 = {...price1}
                            result1.rel_likes = price1.likes - price2.likes
                            delete result1.likes
                            result.stockData.push(result1)
                            let result2 = {...price2}
                            result2.rel_likes = price2.likes - price1.likes
                            delete result2.likes
                            result.stockData.push(result2)
                            resolve(result)
                        })
                        .catch(err2=>{
                            reject(err2)
                        })
                })
                .catch(err1=>{
                    reject(err1)
                })
        });
    }
}

module.exports = StockOptionController;