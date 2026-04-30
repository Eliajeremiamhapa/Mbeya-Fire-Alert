require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors'); // Nimeongeza hii kwa ajili ya Mobile App
const { mongoose, FireReport } = require('./models'); 
const routes = require('./routes');

const app = express();
const server = http.createServer(app);

// 1. Ruhusu CORS (Muhimu sana kwa Mobile Apps na Web ili kuzuia Blockage)
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

// 2. Unganisha Socket.io kwa usahihi
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Real-time connection logic
io.on('connection', (socket) => {
    console.log('Kifaa kipya kimeunganishwa (ID: ' + socket.id + ')');
    
    socket.on('disconnect', () => {
        console.log('Kifaa kimejiondoa');
    });
});

/**
 * API ya kuripoti moto
 */
app.post('/api/report-fire', async (req, res) => {
    try {
        const { latitude, longitude, description } = req.body;
        
        const report = await FireReport.create({ 
            latitude, 
            longitude, 
            description: description || "Dharura ya Moto: Mbeya Region" 
        });
        
        // Tuma alert ya Live
        io.emit('newFireReport', { 
            id: report._id,
            latitude, 
            longitude, 
            description: report.description, 
            timestamp: new Date().toLocaleTimeString('sw-TZ') 
        });
        
        res.json({ 
            success: true, // Nimebadilisha status kuwa success flag kwa urahisi wa Frontend
            message: 'Taarifa imepokelewa GEMS na TFRF wamearifiwa!',
            data: report 
        });
    } catch (err) {
        console.error('Kosa la kuripoti:', err.message);
        res.status(500).json({ success: false, error: 'Imeshindwa kutuma ripoti kwenye mfumo' });
    }
});

app.use('/', routes);

/**
 * KUANZISHA DATABASE NA SERVER
 * Nimeongeza Logic ya "Once" ili kuzuia server kuanza mara mbili
 */
mongoose.connection.once('open', () => {
    server.listen(PORT, () => {
        console.log(`========================================`);
        console.log(`🔥 GEMS SERVER (MONGODB) IPO TAYARI!`);
        console.log(`📍 Port: ${PORT}`);
        console.log(`🌐 Mbeya Emergency System is Live.`);
        console.log(`📡 Socket.io is monitoring fire alerts...`);
        console.log(`========================================`);
    });
});

mongoose.connection.on('error', (err) => {
    console.error('Hitilafu ya kuunganisha MongoDB:', err.message);
});

// Hii inasaidia Render isizime server kama connection ya DB ikichelewa kidogo
if (mongoose.connection.readyState === 1) {
    console.log("Database tayari imeshaunganishwa.");
}