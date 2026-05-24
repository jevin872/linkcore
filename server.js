const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup directories
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// Database initial template
const DEFAULT_DB = {
    contacts: [],
    serviceRequests: [],
    amcProposals: [],
    applications: [],
    newsletter: [],
    tickets: [
        {
            id: 1,
            title: "Switch Port Loop Diagnostics",
            description: "Nexus Logistics Hub reports VLAN loop bottlenecking on Switch SW02.",
            priority: "High",
            status: "Open",
            timestamp: new Date().toISOString()
        },
        {
            id: 2,
            title: "CCTV Angle Readjustment",
            description: "Apex Warehousing requests angle readjustment for Camera 04 in Aisle B.",
            priority: "Low",
            status: "Open",
            timestamp: new Date().toISOString()
        }
    ]
};

// Database helper functions (Synchronous file reads to keep local setup robust)
function readDatabase() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2));
            return DEFAULT_DB;
        }
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(data || JSON.stringify(DEFAULT_DB));
    } catch (err) {
        console.error("Database reading error, resetting database file:", err);
        return DEFAULT_DB;
    }
}

function writeDatabase(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (err) {
        console.error("Database writing error:", err);
        return false;
    }
}

// Configure Multer storage for Careers application uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Max file size 5MB
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, Word, and TXT files are allowed.'));
        }
    }
});

// Middleware configurations
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Files from Linkcore folder
app.use(express.static(__dirname));

// Route mapping for /admin shortcut
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

/* ========================================================
   API ROUTES FOR FORMS SUBMISSIONS
   ======================================================== */

// 1. Contact Form Endpoint
app.post('/api/contact', (req, res) => {
    const { name, email, phone, interest, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: "Missing required fields (name, email, message)." });
    }

    const db = readDatabase();
    const newContact = {
        id: db.contacts.length + 1,
        name,
        email,
        phone: phone || "N/A",
        interest: interest || "General Inquiry",
        message,
        status: "Pending",
        timestamp: new Date().toISOString()
    };

    db.contacts.push(newContact);
    writeDatabase(db);

    res.status(201).json({ success: true, message: "Inquiry successfully recorded." });
});

// 2. Service Request Booking Endpoint
app.post('/api/service-request', (req, res) => {
    const { name, email, phone, service, details } = req.body;
    if (!name || !email || !phone || !service || !details) {
        return res.status(400).json({ success: false, error: "Missing required fields." });
    }

    const db = readDatabase();
    const newRequest = {
        id: db.serviceRequests.length + 1,
        name,
        email,
        phone,
        service,
        details,
        status: "Pending",
        timestamp: new Date().toISOString()
    };

    db.serviceRequests.push(newRequest);
    writeDatabase(db);

    res.status(201).json({ success: true, message: "Service booking recorded successfully." });
});

// 3. AMC Proposal Request Endpoint
app.post('/api/amc-proposal', (req, res) => {
    const { name, email, phone, plan, pcs, servers, cctvs, details } = req.body;
    if (!name || !email || !phone || !plan) {
        return res.status(400).json({ success: false, error: "Missing required fields." });
    }

    // Server-side calculation verification
    const PC_PRICE = 15;
    const SERVER_PRICE = 75;
    const CCTV_PRICE = 10;
    const pcCount = parseInt(pcs) || 0;
    const serverCount = parseInt(servers) || 0;
    const cctvCount = parseInt(cctvs) || 0;
    
    let subtotal = (pcCount * PC_PRICE) + (serverCount * SERVER_PRICE) + (cctvCount * CCTV_PRICE);
    let discount = 0;
    const totalNodes = pcCount + serverCount + cctvCount;
    if (totalNodes > 50) discount = 0.20;
    else if (totalNodes > 20) discount = 0.10;
    const estimatedCost = Math.round(subtotal * (1 - discount));

    const db = readDatabase();
    const newProposal = {
        id: db.amcProposals.length + 1,
        name,
        email,
        phone,
        plan,
        assets: { pcs: pcCount, servers: serverCount, cctvs: cctvCount },
        estimatedCost: estimatedCost || "Custom",
        details: details || "N/A",
        status: "Pending",
        timestamp: new Date().toISOString()
    };

    db.amcProposals.push(newProposal);
    writeDatabase(db);

    res.status(201).json({ success: true, message: "AMC Proposal request saved.", estimatedCost });
});

// 4. Careers Job Application Endpoint (Multer File Attachment Handler)
app.post('/api/careers/apply', (req, res) => {
    upload.single('resume')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }

        const { jobTitle, name, email, phone, certifications, summary } = req.body;
        if (!jobTitle || !name || !email || !phone || !summary) {
            return res.status(400).json({ success: false, error: "Missing required profile fields." });
        }

        const db = readDatabase();
        const newApplication = {
            id: db.applications.length + 1,
            jobTitle,
            name,
            email,
            phone,
            certifications: certifications || "None",
            summary,
            resumePath: req.file ? `/uploads/${req.file.filename}` : null,
            resumeOriginalName: req.file ? req.file.originalname : null,
            status: "Pending Review",
            timestamp: new Date().toISOString()
        };

        db.applications.push(newApplication);
        writeDatabase(db);

        res.status(201).json({ success: true, message: "Application submitted successfully." });
    });
});

// 5. Newsletter Subscription Endpoint
app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, error: "Email is required." });
    }

    const db = readDatabase();
    if (db.newsletter.includes(email)) {
        return res.status(200).json({ success: true, message: "Already subscribed." });
    }

    db.newsletter.push(email);
    writeDatabase(db);

    res.status(201).json({ success: true, message: "Subscribed successfully." });
});

/* ========================================================
   ADMIN & CLIENT DASHBOARD INTERFACES
   ======================================================== */

// Get Dashboard metrics and records data
app.get('/api/admin/data', (req, res) => {
    const db = readDatabase();
    res.status(200).json(db);
});

// Update lead status status tags
app.post('/api/admin/status', (req, res) => {
    const { category, id, status } = req.body;
    if (!category || !id || !status) {
        return res.status(400).json({ success: false, error: "Missing category, id, or status parameters." });
    }

    const db = readDatabase();
    const records = db[category];
    if (!records) {
        return res.status(400).json({ success: false, error: "Invalid data category." });
    }

    const entry = records.find(item => item.id === parseInt(id));
    if (!entry) {
        return res.status(404).json({ success: false, error: "Record item not found." });
    }

    entry.status = status;
    writeDatabase(db);

    res.status(200).json({ success: true, message: "Record status updated successfully." });
});

// Create new Support Tickets
app.post('/api/admin/tickets', (req, res) => {
    const { title, description, priority } = req.body;
    if (!title || !description || !priority) {
        return res.status(400).json({ success: false, error: "Missing ticket title, details, or priority." });
    }

    const db = readDatabase();
    const newTicket = {
        id: db.tickets.length + 1,
        title,
        description,
        priority,
        status: "Open",
        timestamp: new Date().toISOString()
    };

    db.tickets.push(newTicket);
    writeDatabase(db);

    res.status(201).json({ success: true, ticket: newTicket });
});

// Update support ticket status tags
app.post('/api/admin/tickets/status', (req, res) => {
    const { id, status, priority } = req.body;
    if (!id) {
        return res.status(400).json({ success: false, error: "Ticket ID parameter is required." });
    }

    const db = readDatabase();
    const ticket = db.tickets.find(t => t.id === parseInt(id));
    if (!ticket) {
        return res.status(404).json({ success: false, error: "Ticket not found." });
    }

    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;

    writeDatabase(db);
    res.status(200).json({ success: true, message: "Ticket details updated successfully." });
});

// Global Server Initializer Listener
app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`Linkcore Server running in Full-Stack Mode!`);
    console.log(`Web App Address: http://localhost:${PORT}/`);
    console.log(`Admin Panel URL: http://localhost:${PORT}/admin`);
    console.log(`==================================================\n`);
});
