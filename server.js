const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const DATA_PATH = path.join(__dirname, 'data');
const STORAGE_FILE = path.join(DATA_PATH, 'storage.json');

app.use(bodyParser.json());
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 }
}));

// ensure data directory exists
if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(DATA_PATH);
}

let users = [];
let files = [];
let bin = [];

function saveData() {
    try {
        fs.writeFileSync(STORAGE_FILE, JSON.stringify({ files, bin }, null, 2));
    } catch (e) {
        console.error('failed to save data', e);
    }
}

function loadData() {
    try {
        if (fs.existsSync(STORAGE_FILE)) {
            const d = fs.readFileSync(STORAGE_FILE);
            const o = JSON.parse(d);
            users = o.users || [];
            files = o.files || [];
            bin = o.bin || [];
        }
    } catch (e) {
        console.error('failed to load data', e);
    }
}

loadData();

// ensure at least one user exists
if (users.length === 0) {
    users.push({ name: 'admin', pass: 'password' });
    saveData();
}

function auth(req, res, next) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'unauthorized' });
    }
}

app.post('/login', (req, res) => {
    const { user, pass } = req.body;
    const found = users.find(u => u.name === user && u.pass === pass);
    if (found) {
        req.session.user = user;
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'invalid credentials' });
    }
});

app.post('/register', (req, res) => {
    const { user, pass } = req.body;
    if (!user || !pass) return res.status(400).json({ error: 'user and pass required' });
    if (users.find(u => u.name === user)) {
        return res.status(409).json({ error: 'username exists' });
    }
    users.push({ name: user, pass });
    saveData();
    res.json({ success: true });
});

app.post('/logout', auth, (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

app.get('/files', auth, (req, res) => {
    res.json(files);
});

app.post('/files', auth, (req, res) => {
    const { name, content } = req.body;
    const size = Buffer.byteLength(content);
    const id = Date.now().toString();
    files.push({ id, name, content, size });
    saveData();
    res.json({ success: true });
});

app.put('/files/:id', auth, (req, res) => {
    const f = files.find(f => f.id === req.params.id);
    if (!f) return res.status(404).json({ error: 'not found' });
    f.name = req.body.name;
    f.content = req.body.content;
    f.size = Buffer.byteLength(f.content);
    saveData();
    res.json({ success: true });
});

app.delete('/files/:id', auth, (req, res) => {
    const idx = files.findIndex(f => f.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    bin.push(files[idx]);
    files.splice(idx, 1);
    saveData();
    res.json({ success: true });
});

app.get('/bin', auth, (req, res) => {
    res.json(bin);
});

app.post('/bin/:id/restore', auth, (req, res) => {
    const idx = bin.findIndex(f => f.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'not found' });
    files.push(bin[idx]);
    bin.splice(idx, 1);
    saveData();
    res.json({ success: true });
});

app.delete('/bin', auth, (req, res) => {
    bin = [];
    saveData();
    res.json({ success: true });
});

// permanent delete individual file from bin
app.delete('/bin/:id', auth, (req, res) => {
    console.log('perm delete request for id', req.params.id);
    console.log('current bin ids', bin.map(f=>f.id));
    const idx = bin.findIndex(f => f.id === req.params.id);
    if (idx === -1) {
        console.log('perm delete failed: id not found in bin');
        return res.status(404).json({ error: 'not found in bin' });
    }
    bin.splice(idx,1);
    saveData();
    res.json({ success: true });
});

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});