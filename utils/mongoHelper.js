const ObjectId = require('mongoose').Types.ObjectId;

module.exports = class MongoHelper{
    static isValidObjectId(id){
        try{
            if(ObjectId.isValid(id)){
                if((String)(new ObjectId(id)) === id){
                    return true;
                }
            }
            return false;
        }
        catch{
            return false;
        }
    }

    static getIsoDate(){
        const date = new Date()
         return date.toISOString()
    }
}