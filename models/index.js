const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 1. Unganisha Database kwa kutumia DATABASE_URL kutoka .env
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL);
        console.log(`========================================`);
        console.log(`🔥 GEMS Database Connected: ${conn.connection.host}`);
        console.log(`========================================`);
    } catch (error) {
        console.error(`❌ Database Connection Error: ${error.message}`);
        process.exit(1);
    }
};

// Fungua connection moja kwa moja
connectDB();

// 2. Import Models (Sasa tunazichukua kama Mongoose Models)
const User = require('./User');
const FireReport = require('./FireReport');

// 3. Mahusiano (Relationship)
// Kwenye MongoDB (Mongoose), mahusiano hayaitwi .hasMany() bali tunayafafanua 
// ndani ya Schema yenyewe (kupitia ObjectId).
// Lakini kwa kuwa hutaki kuharibu flow, tunasafirisha Models hizi hapa.

module.exports = {
    mongoose,
    User,
    FireReport
};