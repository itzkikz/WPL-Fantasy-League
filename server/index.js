const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const fs = require("fs");
const { convertToJSON } = require("./utils");
require("dotenv").config();

const app = express();
app.use(express.json());

app.use(cors());

// Load service account credentials
const credentials = JSON.parse(fs.readFileSync("credentials.json", "utf8"));

// Configure Google Auth
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Create sheets client
const sheets = google.sheets({ version: "v4", auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

// READ: Get all data from a sheet
app.get("/api/standings", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Master Data!A:G", // Adjust range as needed
    });

    const rows = response.data.values;
    const jsonData = convertToJSON(rows);

    res.json({
      success: true,
      data: jsonData,
    });
  } catch (error) {
    console.error("Error reading data:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// READ: Get all data from a sheet
app.get("/api/standings/:teamName/:gameWeek", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Master Data!H:X", // Adjust range as needed
    });

    const rows = response.data.values;

    const jsonData = convertToJSON(rows);

    const { teamName, gameWeek } = req.params;

    const propertyName = "team_name";
    const searchValue = decodeURI(teamName);
    let gw = parseInt(gameWeek);
    const currentGw = jsonData[jsonData.length - 1].gw;
    if (gw === 0) {
      gw = parseInt(currentGw);
    }

    console.log(req.params);

    const filteredGWData = jsonData.filter((item) => {
      return item[propertyName] === searchValue && parseInt(item.gw) === gw;
    });

    const filteredData = jsonData.filter((item) => {
      return item[propertyName] === searchValue;
    });

    const totalGWScore = filteredGWData.reduce((acc, item) => {
      if (!item?.lineup?.toLowerCase().startsWith("sub ")) {
        return acc + parseInt(item.point);
      }
      return acc;
    }, 0);

    const avg = (
      filteredData.reduce(
        (acc, item) => {
          if (!item?.lineup?.toLowerCase().startsWith("sub ")) {
            return acc + parseInt(item.point);
          }
          return acc;
        },

        0
      ) / currentGw
    ).toFixed(2);

    const highest = Math.max(
      ...Object.values(
        filteredData.reduce((a, p) => {
          if (!p?.lineup?.toLowerCase().startsWith("sub ")) {
            const point = parseInt(p.point, 10) || 0;
            a[p.gw] = (a[p.gw] || 0) + point;
          }
          return a;
        }, {})
      )
    );

    res.json({
      success: true,
      data: {
        playerData: filteredGWData,
        totalGWScore,
        avg,
        highest,
        gw,
        currentGw,
      },
    });
  } catch (error) {
    console.error("Error reading data:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// READ: Get all data from a sheet
app.get("/api/getPlayer/:playerName", async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Master Data!Z:AM", // Adjust range as needed
    });

    const rows = response.data.values;

    const jsonData = convertToJSON(rows);

    const { playerName } = req.params;

    const propertyName = "player_name";
    const searchValue = decodeURI(playerName);
    // let gw = gameweek;
    // const currentGw = jsonData[jsonData.length - 1].gw;
    // if (gw === "0") {
    //   gw = currentGw;
    // }

    // console.log(req.params);

    // const filteredGWData = jsonData.filter((item) => {
    //   return item[propertyName] === searchValue && item.gw === gw;
    // });

    const filteredData = jsonData.filter((item) => {
      return item[propertyName] === searchValue;
    });

    console.log("Filtered Data:", filteredData);

    // const totalGWScore = filteredGWData.reduce((acc, item) => {
    //   if (item.lineup !== "Sub") {
    //     return acc + parseInt(item.point);
    //   }
    //   return acc;
    // }, 0);

    // const avg = (
    //   filteredData.reduce(
    //     (acc, item) => {
    //       if (item.lineup !== "Sub") {
    //         return acc + parseInt(item.point);
    //       }
    //       return acc;
    //     },

    //     0
    //   ) / currentGw
    // ).toFixed(2);

    //    const highest = Math.max(
    //   ...Object.values(
    //     filteredData.reduce((a, p) => {
    //       if (p.lineup !== 'Sub') {
    //         const point = parseInt(p.point, 10) || 0;
    //         a[p.gw] = (a[p.gw] || 0) + point;
    //       }
    //       return a;
    //     }, {})
    //   )
    // );

    res.json({
      success: true,
      data: filteredData[0],
    });
  } catch (error) {
    console.error("Error reading data:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// WRITE: Append new row to sheet
app.post("/api/data", async (req, res) => {
  try {
    const { values } = req.body; // Expecting array like ["John", "Doe", "john@email.com"]

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:Z",
      valueInputOption: "RAW",
      requestBody: {
        values: [values], // Wrap in array for single row
      },
    });

    res.json({
      success: true,
      message: "Data added successfully",
      updatedCells: response.data.updates.updatedCells,
    });
  } catch (error) {
    console.error("Error writing data:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// UPDATE: Update specific row (by row number)
app.put("/api/data/:rowNumber", async (req, res) => {
  try {
    const { rowNumber } = req.params;
    const { values } = req.body;

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!A${rowNumber}:Z${rowNumber}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [values],
      },
    });

    res.json({
      success: true,
      message: "Data updated successfully",
      updatedCells: response.data.updatedCells,
    });
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE: Clear specific row
app.delete("/api/data/:rowNumber", async (req, res) => {
  try {
    const { rowNumber } = req.params;

    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `Sheet1!A${rowNumber}:Z${rowNumber}`,
    });

    res.json({
      success: true,
      message: "Row cleared successfully",
    });
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Batch read multiple ranges
app.post("/api/batch-read", async (req, res) => {
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
    console.error("Error batch reading:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
