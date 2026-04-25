const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Tumia vigezo badala ya DATABASE_URL string
const sequelize = new Sequelize('gems_db', 'root', '', {
    host: '127.0.0.1', // au 'localhost'
    dialect: 'mysql',
    logging: false,
    port: 3306
});

const User = require('./User')(sequelize);
const FireReport = require('./FireReport')(sequelize);

// Mahusiano
User.hasMany(FireReport, { foreignKey: 'reporterId' });
FireReport.belongsTo(User, { foreignKey: 'reporterId' });

module.exports = {
    sequelize,
    User,
    FireReport
};