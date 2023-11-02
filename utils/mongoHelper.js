'use strict';
const crypto = require('crypto');

module.exports = class MongoHelper{
    
    static getIsoDate(){
        const date = new Date()
         return date.toISOString()
    }

    static hashIp(ipAddress){
        return crypto.createHash('sha256', ipAddress).digest('hex');
    }
}