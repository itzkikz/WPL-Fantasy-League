const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');
const { convertToJSON } = require('./utils');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use(cors())

// Load service account credentials
const credentials = JSON.parse(
  fs.readFileSync('credentials.json', 'utf8')
);

// Configure Google Auth
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Create sheets client
const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// READ: Get all data from a sheet
app.get('/api/getData', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:Z', // Adjust range as needed
    });

    const rows = response.data.values;
    const jsonData = convertToJSON(rows);

    res.json({
      success: true,
      data: jsonData,
    });
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// READ: Get all data from a sheet
app.get('/api/getLineup', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Team1!A:K', // Adjust range as needed
    });

    const rows = response.data.values;
    const jsonData = convertToJSON(rows);

    res.json({
      success: true,
      data: jsonData,
    });
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// WRITE: Append new row to sheet
app.post('/api/data', async (req, res) => {
  try {
    const { values } = req.body; // Expecting array like ["John", "Doe", "john@email.com"]

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Sheet1!A:Z',
      valueInputOption: 'RAW',
      requestBody: {
        values: [values], // Wrap in array for single row
      },
    });

    res.json({
      success: true,
      message: 'Data added successfully',
      updatedCells: response.data.updates.updatedCells,
    });
  } catch (error) {
    console.error('Error writing data:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// UPDATE: Update specific row (by row number)
app.put('/api/data/:rowNumber', async (req, res) => {
  try {
    const { rowNumber } = req.params;
    const { values } = req.body;

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!A${rowNumber}:Z${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [values],
      },
    });

    res.json({
      success: true,
      message: 'Data updated successfully',
      updatedCells: response.data.updatedCells,
    });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// DELETE: Clear specific row
app.delete('/api/data/:rowNumber', async (req, res) => {
  try {
    const { rowNumber } = req.params;

    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!A${rowNumber}:Z${rowNumber}`,
    });

    res.json({
      success: true,
      message: 'Row cleared successfully',
    });
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Batch read multiple ranges
app.post('/api/batch-read', async (req, res) => {
  try {
    const { ranges } = req.body; // Array like ["Sheet1!A1:B10", "Sheet2!A1:C5"]

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges,
    });

    res.json({
      success: true,
      data: response.data.valueRanges,
    });
  } catch (error) {
    console.error('Error batch reading:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
