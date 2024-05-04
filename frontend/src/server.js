const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const xss = require('xss');
const app = express();

const { MongoClient } = require('mongodb');
const client = new MongoClient("");

// Add JSON parsing middleware
app.use(express.json());

const buildPath = path.join(__dirname, '..', 'build');
app.use(express.static(buildPath));

app.use(
    session({
        secret: crypto.randomBytes(32).toString('hex'),
        resave: false,
        saveUninitialized: false,
    })
);

// Mocked user data for demonstration purposes
let users = [
    { username: 'iotlab' },
    { username: 'a' },
    { username: 'project' }
];

app.post('/login', async (req, res) => {
    const { username } = req.body;
    const sanitisedUsername = xss(username);

    const user = users.find(user => user.username === sanitisedUsername);

    if (user) {
        req.session.username = sanitisedUsername;
        res.status(200).send({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid username' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});

app.get('/rag', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const username = req.session.username;
    if (!username) {
        return res.redirect("/");
    }
    res.sendFile(path.join(buildPath, 'index.html'));
});

// Set up directories
const dataDir = path.join(__dirname, '..', '..', 'data');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

app.post('/moisture-level', async (req, res) => {
    const username = req.session.username; // Get the username from the session

    try {
        const response = await axios.post('http://127.0.0.1:5000/fetch-soil-moisture');

        // console.log('Response from Flask server:', response.data);

        await client.connect();
        const db = client.db("IOTProject");
        const collection = db.collection("moisture_levels");

        // Add username to the data
        const data = {
            ...response.data,
            username: username
        };

        await collection.insertOne(data);

        if (response.status === 200) {
            // console.log(response.data.moisture_value);
            res.status(200).json({ moisture_value: response.data.moisture_value }); // Send the data back as JSON
        }
    } catch (error) {
        console.error('Error fetching moisture level:', error.message);
        res.status(500).send('Error fetching moisture level.');
    }
});

app.post('/update-motor-status', async (req, res) => {
    try {
        const { motorStatus } = req.body;

        let temp = "";
        if (motorStatus == true) {
            temp = "True"
        } else {
            temp = "False"
        }

        // Send a request to fetch motor status from the hardware or API
        const response = await axios.post('http://127.0.0.1:5000/motor-control', { "action": temp });

        // console.log('Response from Flask server:', response.data);

        if (response.status === 200) {
            // console.log(response.data);
            // Parse the response and extract the motor status
            const newMotorStatus = response.data.motorStatus;

            // Send the motor status in the response
            res.status(200).json({ newMotorStatus });
        }
    } catch (error) {
        console.error('Error fetching motor status:', error.message);
        res.status(500).send('Error fetching motor status.');
    }
});

app.post('/update-continuous-monitoring', async (req, res) => {
    try {
        const { continuousMonitoring } = req.body;

        let temp = "";
        if (continuousMonitoring == true) {
            temp = "True"
        } else {
            temp = "False"
        }

        // Send a request to update continuous monitoring on the backend
        const response = await axios.post('http://127.0.0.1:5000/toggle-monitoring', { "action": temp });

        // console.log('Response from Flask server:', response.data);

        // Handle the response and send appropriate status
        if (response.status === 200) {
            // console.log(response.data);
            // Parse the response and extract the motor status
            const newMonitoringStatus = response.data.message;

            // Send the motor status in the response
            res.status(200).json({ newMonitoringStatus });
        }
    } catch (error) {
        console.error('Error updating continuous monitoring:', error.message);
        res.status(500).send('Error updating continuous monitoring.');
    }
});

app.post('/give-voice-command', async (req, res) => {
    const response = await axios.post('http://127.0.0.1:6000/start-recording', {
        "data_dir_path": dataDir
    });

    if (response.status === 200) {
        const cleanedText = response.data.text.trim(); // Remove leading and trailing spaces
        // console.log(cleanedText);

        if (cleanedText === "soil" || cleanedText === "moisture" || cleanedText === "soil moisture") {
            const response1 = await axios.post('http://127.0.0.1:5000/fetch-soil-moisture');

            res.status(200).json({ "mode": "1", moisture_value: response1.data.moisture_value }); // Send the data back as JSON
        } else if (cleanedText === "motor on" || cleanedText === "on motor") {
            // Send a request to fetch motor status from the hardware or API
            const response2 = await axios.post('http://127.0.0.1:5000/motor-control', { "action": "True" });

            const newMotorStatus = response2.data.motorStatus;

            // Send the motor status in the response
            res.status(200).json({ "mode": "2", "motorStatus": newMotorStatus });
        } else if (cleanedText === "motor off" || cleanedText === "off motor") {
            // Send a request to fetch motor status from the hardware or API
            const response3 = await axios.post('http://127.0.0.1:5000/motor-control', { "action": "False" });

            const newMotorStatus = response3.data.motorStatus;

            // Send the motor status in the response
            res.status(200).json({ "mode": "3", "motorStatus": newMotorStatus });
        }

    }
})

app.post('/get-past-moisture-details', async (req, res) => {
    const username = req.session.username; // Get the username from the session

    try {
        await client.connect();
        const db = client.db("IOTProject");
        const collection = db.collection("moisture_levels");

        const moistureDetailsCursor = await collection.find({ username: username }, { projection: { username: 0, _id: 0, latitude: 0, longitude: 0 } })
            .sort({ timestamp: 1 })
            .toArray();

        // console.log(moistureDetailsCursor);
        res.status(200).json({ moistureDetailsCursor }); // Send the data back as JSON

    } catch (error) {
        console.error('Error fetching moisture level:', error.message);
        res.status(500).send('Error fetching moisture level.');
    }
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
