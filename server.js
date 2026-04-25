require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const path = require('path');
const { sequelize, FireReport } = require('./models');
const routes = require('./routes');

const app = express();
const server = http.createServer(app);

// Unganisha Socket.io na kuzuia makosa ya CORS
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Mpangilio wa Port (Inasoma kutoka .env au inatumia 3000 kama default)
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Real-time connection logic
io.on('connection', (socket) => {
    console.log('Kifaa kipya kimeunganishwa kwenye GEMS (ID: ' + socket.id + ')');
    
    socket.on('disconnect', () => {
        console.log('Kifaa kimejiondoa');
    });
});

// API ya kuripoti moto
app.post('/api/report-fire', async (req, res) => {
    try {
        const { latitude, longitude, description } = req.body;
        
        // Hifadhi kwenye MySQL
        const report = await FireReport.create({ 
            latitude, 
            longitude, 
            description: description || "Dharura ya Moto: Mbeya Region" 
        });
        
        // Tuma alert ya Live kwa dashboard zote za TFRF
        io.emit('newFireReport', { 
            id: report.id,
            latitude, 
            longitude, 
            description, 
            timestamp: new Date().toLocaleTimeString('sw-TZ') 
        });
        
        res.json({ status: 'success', message: 'Taarifa imepokelewa GEMS na TFRF wamearifiwa!' });
    } catch (err) {
        console.error('Kosa la kuripoti:', err.message);
        res.status(500).json({ error: 'Imeshindwa kutuma ripoti' });
    }
});

app.use('/', routes);

// Kuanzisha Database na Server
sequelize.authenticate()
    .then(() => {
        console.log('GEMS imefanikiwa kuunganisha MySQL Database.');
        return sequelize.sync({ alter: true }); // Huu mstari unaunda table kama hazipo
    })
    .then(() => {
        server.listen(PORT, () => {
            console.log(`========================================`);
            console.log(`🔥 GEMS SERVER IPO TAYARI!`);
            console.log(`📍 Port: ${PORT}`);
            console.log(`🌐 Mbeya Emergency System is Live.`);
            console.log(`========================================`);
        });
    })
    .catch(err => {
        console.error('Hitilafu ya kuwasha GEMS:', err.message);
    });