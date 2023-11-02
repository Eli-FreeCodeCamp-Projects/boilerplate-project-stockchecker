'use strict';
let mongoose = require('mongoose')
const MongoHelper = require('../utils/mongoHelper');
const Ut = require('../utils/utils');
const stockLikeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [
                true,
                "Stock option name is required."
            ],
            trim: true,
            minLength: [
                2, 
                'Stock option name must contain at least two characters!'
            ],
            maxLength: [
                10, 
                'Stock option name must contain 10 characters maxi!'
            ],
            match: [
                /^([A-z0-9]+)$/, 
                'Stock option name can contain only Alphanumerical characters.'
            ]
        },
        ip_address: {
            type: String,
            required: true,
            trim: true
        },
        liked_on: {
            type: String,
            default: MongoHelper.getIsoDate(),
        }
    },
    {
        statics: {
            findLikesByIp(ipAdress){
                return new Promise((resolve, reject) => {
                    
                });
            },
            countLikesByName(stockName){
                return new Promise((resolve, reject) => {
                    this.countDocuments({name: stockName})
                        .then(res=>{
                            resolve(res)
                        })
                        .catch(err=>{
                            reject({error: "Unable to count stock likes.", info: err})
                        })
                });
            },
            findLike(stockName, hashedIp){
                return new Promise((resolve, reject) => {
                    this.find({name: stockName, ip_address: hashedIp})
                        .then(res=>{
                            if(Ut.isArray(res) && res.length > 0){
                                resolve(res)
                            }
                            else{
                                resolve({error: "Unable to find liked stock"})
                            }
                        })
                        .catch(err=>{
                            reject({error: "Unable to find stock like data.", info: err})
                        })
                });
            },
            addLike(stockName, hashedIp){
                return new Promise((resolve, reject) => {
                    this.findLike(stockName, hashedIp)
                        .then(likedOption =>{
                            //-> if stock not liked by ip
                            if(Ut.isObject(likedOption) && likedOption.hasOwnProperty("error")){
                                this.create({
                                    name: stockName.toLowerCase(),
                                    ip_address: hashedIp
                                })
                                    .then(LikedStock=>{
                                        resolve(true)
                                    })
                                    .catch(err=>{
                                        reject({error: "Unable to add like to stock.", info: err})
                                    })
                            }
                            else{//-> if stock liked by user with this hashed ip
                                resolve({error: "You can't like a stock more than one time"})
                            }
                        })
                        .catch(err=>{
                            reject(err)
                        })
                });
            },
            removeLike(stockName, hashedIp){
                return new Promise((resolve, reject) => {
                    this.deleteOne({"name": stockName, "ip_address": hashedIp})
                        .then((data)=>{
                            if(Ut.isObject(data) && Ut.isPositiveNumber(data.deletedCount)){
                                resolve(true)
                            }else{
                                resolve({error: "Unable to remove like to stock.", info: err})
                            }
                        })
                        .catch((err)=>{
                            done({error: "Unable to remove like to stock.", info: err})
                        })
                });
            }
        }
    }
);

module.exports = mongoose.model('StockLike', stockLikeSchema);