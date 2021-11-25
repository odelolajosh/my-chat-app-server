const mongoose = require("mongoose");

"use strict";

class Db {
    constructor() {
        this.mongoose = mongoose;
    }

    onConnect() {
        return new Promise((resolve, reject) => {
            this.mongoose.connect(process.env.MONGO_ATLAS_URL, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => {
                console.log('Successfully connected to MongoDB Atlas!');
                resolve();
            })
            .catch((err) => {
                console.log('Unable to connect to MongoDB Atlas!');
                reject(err)
            })
        })
    }
}

module.exports = new Db();
