const express = require('express');
const router = express.Router();
// Hakikisha model yako ya Mongoose imetengenezwa vizuri
const { FireReport } = require('../models');

// 1. MWANANCHI: Landing Page (SOS Button)
router.get('/', (req, res) => {
    res.render('index');
});

// 2. OFFICER: TFRF Responder Dashboard
router.get('/officer/dashboard', async (req, res) => {
    try {
        // Mongoose: Badala ya .findAll({ where: ... }) tunatumia .find({ ... })
        const reports = await FireReport.find({ is_resolved: false })
                                        .sort({ createdAt: -1 }); 
        res.render('officer_dashboard', { reports });
    } catch (err) {
        res.status(500).send("Hitilafu ya Server: " + err.message);
    }
});

// 3. ADMIN: System Management & Analytics
router.get('/admin/panel', async (req, res) => {
    try {
        // Mongoose: .find() bila query inapata zote
        const allReports = await FireReport.find().sort({ createdAt: -1 });

        const stats = {
            total: allReports.length,
            resolved: allReports.filter(r => r.is_resolved).length,
            pending: allReports.filter(r => !r.is_resolved).length
        };

        res.render('admin_panel', { 
            reports: allReports, 
            stats: stats 
        });
    } catch (err) {
        res.status(500).send("Hitilafu ya Server: " + err.message);
    }
});

// --- ADMIN ACTIONS ---

// A. API ya Kukamilisha Tukio (Mark as Resolved)
router.post('/admin/resolve/:id', async (req, res) => {
    try {
        const reportId = req.params.id;
        // Mongoose: Badala ya .update() tunatumia .findByIdAndUpdate()
        await FireReport.findByIdAndUpdate(reportId, { is_resolved: true });
        
        res.json({ success: true, message: "Tukio limewekwa kama limekamilika (Resolved)" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// B. API ya Kufuta Ripoti (Delete Incident)
router.delete('/admin/delete/:id', async (req, res) => {
    try {
        const reportId = req.params.id;
        // Mongoose: Badala ya .destroy() tunatumia .findByIdAndDelete()
        await FireReport.findByIdAndDelete(reportId);
        
        res.json({ success: true, message: "Ripoti imefutwa kwenye mfumo" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// C. API ya Kuripoti Moto (SOS Button)
router.post('/api/report-fire', async (req, res) => {
    try {
        const { latitude, longitude, description } = req.body;
        // Mongoose: .create() inafanya kazi sawasawa kwenye zote mbili
        const newReport = await FireReport.create({
            latitude,
            longitude,
            description,
            is_resolved: false
        });
        
        res.status(201).json({ 
            success: true, 
            message: "Ripoti imepokelewa Kituo cha Zimamoto Mbeya", 
            data: newReport 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;