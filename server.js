require('dotenv').config();
const express = require('express');
const http = require('http');
const https = require('https'); // Imeongezwa kwa ajili ya Self-Ping
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors'); // Nimeongeza hii kwa ajili ya Mobile App
const { mongoose, FireReport } = require('./models'); 
const routes = require('./routes');

const app = express();
const server = http.createServer(app);

// ==========================================
// SELF-PING LOGIC (Kuzuia Render Isilale)
// ==========================================
setInterval(() => {
    https.get('https://mbeya-fire-alert.onrender.com/', (res) => {
        console.log(`📡 Self-Ping: Status Code ${res.statusCode} - Server is Awake.`);
    }).on('error', (e) => {
        console.error('❌ Self-Ping Error:', e.message);
    });
}, 600000); // Inajipiga kila baada ya dakika 10 (600,000ms)
// ==========================================

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
 * API YA USER (Mobile App & Web) - REKEREBISHO KWA AJILI YA MOBILE
 * Inapokea ripoti na kuituma LIVE kwa Admin/Officer kwa wakati mmoja!
 */
app.post('/api/report-fire', async (req, res) => {
    try {
        const { latitude, longitude, description } = req.body;
        
        // 1. Uhakiki muhimu kwa ajili ya Mobile App (Kama GPS imezimwa)
        if (!latitude || !longitude) {
            return res.status(400).json({ 
                success: false, 
                error: 'GPS Coordinates (latitude na longitude) zinahitajika.' 
            });
        }

        // 2. Hifadhi ripoti kwenye Database ya MongoDB
        const report = await FireReport.create({ 
            latitude: Number(latitude), 
            longitude: Number(longitude), 
            description: description || "Dharura ya Moto: Mbeya Region" 
        });
        
        // 3. Sukuma taarifa LIVE kwenye Web Dashboard ya Officer (Socket.io)
        io.emit('newFireReport', { 
            id: report._id,
            latitude: Number(latitude), 
            longitude: Number(longitude), 
            description: report.description, 
            timestamp: new Date().toLocaleTimeString('sw-TZ') 
        });
        
        // 4. Majibu ya kurudi kwenye Mobile App na Web ya User
        res.status(201).json({ 
            success: true, 
            message: 'Taarifa imepokelewa GEMS na TFRF wamearifiwa!',
            data: report 
        });

    } catch (err) {
        console.error('Kosa la kuripoti kutoka kwenye kifaa:', err.message);
        res.status(500).json({ 
            success: false, 
            error: 'Imeshindwa kutuma ripoti kwenye mfumo wa dharura' 
        });
    }
});

app.use('/', routes);

/**
 * KUANZISHA DATABASE NA SERVER
 */
mongoose.connection.once('open', () => {
    server.listen(PORT, () => {
        console.log(`========================================`);
        console.log(`🔥 GEMS SERVER (MONGODB) IPO TAYARI!`);
        console.log(`📍 Port: ${PORT}`);
        console.log(`🌐 Mbeya Emergency System is Live.`);
        console.log(`📡 Socket.io is monitoring fire alerts...`);
        console.log(`🚀 Keep-Alive System: Active (10min interval)`);
        console.log(`========================================`);
    });
});

mongoose.connection.on('error', (err) => {
    console.error('Hitilafu ya kuunganisha MongoDB:', err.message);
});

if (mongoose.connection.readyState === 1) {
    console.log("Database tayari imeshaunganishwa.");
}
