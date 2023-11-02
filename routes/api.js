'use strict';
const Ut = require('../utils/utils');
const MongoHelper = require('../utils/mongoHelper');
const StockOptionController = require('../controllers/stockOptionController');
module.exports = function (app) {
  const stockOptionController = new StockOptionController();

  app.route('/api/stock-prices')
    .get(function (req, res){
      const stock = req.query.stock
      const like = req.query.like
      const ip = MongoHelper.hashIp(req.ip)
      if(Ut.isArray(stock)){
        if(stock.length !== 2){
          res.json({error: "You can compare only two stock prices"})
        }
        //-> compare stocks
        stockOptionController.compareStocks(stock[0], stock[1], ip, like)
          .then(stockPrice=>{
            res.json(stockPrice)
          })
          .catch(err=>{
            console.log(err)
            res.json({error: "Invald stock"})
          })
      }
      else if(Ut.isStr(stock)){
        stockOptionController.getPriceAndLikes(stock, ip, like)
          .then(stockPrice=>{
            res.json({stockData: stockPrice})
          })
          .catch(err=>{
            console.log(err)
            res.json({error: "Invald stock"})
          })
      }
      else{
        res.json({error: "Invald stock"})
      }
      
    });
    
};
