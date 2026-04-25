const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('FireReport', {
        latitude: { type: DataTypes.FLOAT, allowNull: false },
        longitude: { type: DataTypes.FLOAT, allowNull: false },
        description: { type: DataTypes.TEXT, defaultValue: 'Emergency Fire Report' },
        is_resolved: { type: DataTypes.BOOLEAN, defaultValue: false }
    });
};