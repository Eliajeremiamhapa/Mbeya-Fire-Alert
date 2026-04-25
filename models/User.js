const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('User', {
        username: { type: DataTypes.STRING, unique: true, allowNull: false },
        email: { type: DataTypes.STRING, unique: true, allowNull: false },
        password: { type: DataTypes.STRING, allowNull: false },
        full_name: { type: DataTypes.STRING },
        role: { type: DataTypes.ENUM('user', 'tfrf', 'admin'), defaultValue: 'user' },
        phone_number: { type: DataTypes.STRING }
    });
};