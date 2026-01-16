// Backend Server - Supabase Test (Simple Version)
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Express app initialize
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ============================================
// YAHAN APNI SUPABASE CREDENTIALS DAAL DO
// ============================================
const SUPABASE_URL = 'https://flqjilnjzpdfpkpwwiqr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscWppbG5qenBkZnBrcHd3aXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyOTIyOTEsImV4cCI6MjA4Mzg2ODI5MX0.YQT__qYIWQ2SiFYh9_k1guCdvBp0vIxPgwbPM6qDsEc';

// Check credentials
if (SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE' || SUPABASE_KEY === 'YOUR_SUPABASE_KEY_HERE') {
    console.error('❌ ERROR: Please add your Supabase credentials in server.js!');
    console.error('Line 17-18 mein apni URL aur KEY daal do');
    process.exit(1);
}

// Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
console.log('✅ Supabase client initialized');

// API Routes

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Server is running!',
        timestamp: new Date().toISOString()
    });
});

// Health check
app.get('/api/health', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('submissions')
            .select('count', { count: 'exact', head: true });

        if (error) throw error;

        res.json({ 
            status: 'healthy',
            database: 'connected',
            message: 'Supabase connection successful'
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            database: 'disconnected',
            message: error.message 
        });
    }
});

// Submit form data
app.post('/api/submit', async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({ 
                success: false,
                error: 'Name and email are required' 
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                error: 'Invalid email format' 
            });
        }

        console.log('📝 Attempting to save:', { name, email });

        const { data, error } = await supabase
            .from('submissions')
            .insert([
                {
                    name: name.trim(),
                    email: email.trim().toLowerCase()
                }
            ])
            .select();

        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }

        console.log('✅ Data saved successfully:', data);

        res.status(201).json({
            success: true,
            message: 'Submission saved successfully!',
            data: data[0]
        });

    } catch (error) {
        console.error('❌ Error in /api/submit:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to save submission',
            details: error.message
        });
    }
});

// Get all submissions
app.get('/api/submissions', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        res.json({
            success: true,
            count: data.length,
            data: data
        });

    } catch (error) {
        console.error('❌ Error fetching submissions:', error);
        
        res.status(500).json({
            success: false,
            error: 'Failed to fetch submissions',
            details: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('==========================================');
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('==========================================');
    console.log('Available routes:');
    console.log(`  GET  http://localhost:${PORT}/api/test`);
    console.log(`  GET  http://localhost:${PORT}/api/health`);
    console.log(`  POST http://localhost:${PORT}/api/submit`);
    console.log(`  GET  http://localhost:${PORT}/api/submissions`);
    console.log('==========================================');
});