
/**
 * VISUALITY AI - BACKEND
 * 
 * Simple Express Server. 
 * Can be extended for User Database, Auth, or Logging.
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// --- ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: "OK", version: "1.0.0" });
});

// Start Server conditionally (allows Vercel to import app without listening)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
