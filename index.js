const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files for frontend if needed
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the Checklist System!');
  });

// Define the route to fetch and process the checklist
app.get('/checklist', async (req, res) => {
    try {
        const data = await fetchData();
        const results = evaluateChecklist(data);
        res.render('dashboard', { results });  // Render the EJS template with the results
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ message: 'Error fetching data' });
    }
});

// Fetch data from the API
async function fetchData() {
    const apiUrl = 'http://qa-gb.api.dynamatix.com:3100/api/applications/getApplicationById/67339ae56d5231c1a2c63639';
    try {
        const response = await axios.get(apiUrl);
        console.log('API Response:', response.data);  // Log the API response
        return response.data;
    } catch (error) {
        console.error('Error fetching data:', error.message);  // Log any errors
        throw new Error('Error fetching data');
    }
}

// Evaluate the checklist based on the rules
function evaluateChecklist(data) {
    const rules = [
        {
            rule: 'Valuation Fee Paid',
            condition: data.isValuationFeePaid === true
        },
        {
            rule: 'UK Resident',
            condition: data.isUkResident === true
        },
        {
            rule: 'Risk Rating Medium',
            condition: data.riskRating === 'Medium'
        },
        {
            rule: 'LTV Below 60%',
            condition: calculateLTV(data.loanRequired, data.purchasePrice) < 60
        }
    ];

    // Map rules to pass/fail status
    return rules.map(rule => ({
        rule: rule.rule,
        status: rule.condition ? 'Passed' : 'Failed'
    }));
}

// Calculate Loan-to-Value (LTV)
function calculateLTV(loanRequired, purchasePrice) {
    return (loanRequired / purchasePrice) * 100;
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}); 

