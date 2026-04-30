const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        unique: true, 
        required: true 
    },
    email: { 
        type: String, 
        unique: true, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    full_name: { 
        type: String 
    },
    role: { 
        type: String, 
        enum: ['user', 'tfrf', 'admin'], 
        default: 'user' 
    },
    phone_number: { 
        type: String 
    }
}, { 
    timestamps: true // Inatengeneza 'createdAt' na 'updatedAt' kama Sequelize
});

module.exports = mongoose.model('User', UserSchema);