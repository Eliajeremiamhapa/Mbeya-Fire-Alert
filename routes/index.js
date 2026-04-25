const express = require('express');
const router = express.Router();
const { FireReport } = require('../models');

// 1. MWANANCHI: Landing Page (SOS Button)
router.get('/', (req, res) => {
    res.render('index');
});

// 2. OFFICER: TFRF Responder Dashboard (Tracking & Routing)
// Anaona dharura ambazo bado hazijatatuliwa tu (is_resolved: false)
router.get('/officer/dashboard', async (req, res) => {
    try {
        const reports = await FireReport.findAll({ 
            where: { is_resolved: false }, 
            order: [['createdAt', 'DESC']] 
        });
        res.render('officer_dashboard', { reports });
    } catch (err) {
        res.status(500).send("Hitilafu ya Server: " + err.message);
    }
});

// 3. ADMIN: System Management & Analytics
// Huyu anaona ripoti zote na takwimu kamili za mfumo
router.get('/admin/panel', async (req, res) => {
    try {
        const allReports = await FireReport.findAll({ 
            order: [['createdAt', 'DESC']] 
        });

        // TFRF Stats Logic: Kuhesabu data kwa ajili ya Dashboard ya Admin
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

// --- ADMIN ACTIONS (Hizi ni njia mpya za kumruhusu Admin ku-access mfumo mzima) ---

// A. API ya Kukamilisha Tukio (Mark as Resolved)
router.post('/admin/resolve/:id', async (req, res) => {
    try {
        const reportId = req.params.id;
        await FireReport.update(
            { is_resolved: true },
            { where: { id: reportId } }
        );
        res.json({ success: true, message: "Tukio limewekwa kama limekamilika (Resolved)" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// B. API ya Kufuta Ripoti (Delete Incident)
router.delete('/admin/delete/:id', async (req, res) => {
    try {
        const reportId = req.params.id;
        await FireReport.destroy({
            where: { id: reportId }
        });
        res.json({ success: true, message: "Ripoti imefutwa kwenye mfumo" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// C. API ya Kuripoti Moto (Inatumiwa na SOS Button ya Mwananchi)
router.post('/api/report-fire', async (req, res) => {
    try {
        const { latitude, longitude, description } = req.body;
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