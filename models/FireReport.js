const mongoose = require('mongoose');

const FireReportSchema = new mongoose.Schema({
    latitude: { 
        type: Number, 
        required: true 
    },
    longitude: { 
        type: Number, 
        required: true 
    },
    description: { 
        type: String, 
        default: 'Emergency Fire Report' 
    },
    is_resolved: { 
        type: Boolean, 
        default: false 
    }
}, { 
    timestamps: true // Hii inatengeneza 'createdAt' na 'updatedAt' otomatiki kama Sequelize
});

module.exports = mongoose.model('FireReport', FireReportSchema);