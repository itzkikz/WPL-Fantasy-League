import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import standingsRouter from './routes/standings';
import playersRouter from './routes/players';
import authRouter from './routes/auth';
import notificationRouter from './routes/notification';
import managerRouter from './routes/manager'
import sheetRouter from './routes/sheetRoutes';
import { setSheets } from './lib/store/globals';
import { authenticateToken } from './middlewares/authMiddleware';
import { logMiddleware } from './middlewares/logMiddleware';
import connectDB from './config/db';
import syncRouter from './routes/syncRoutes';
import footballApiRouter from './routes/footballApi';
import adminRouter from './routes/admin';

connectDB();

const cors = require("cors");
const { google } = require("googleapis");
const fs = require("fs");

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

const sheets = google.sheets({ version: "v4", auth });

setSheets(sheets)



// Log all incoming requests
app.use(logMiddleware);


app.use("/api", standingsRouter);
app.use("/api", playersRouter);
app.use("/api", authRouter);
app.use("/api/sync", syncRouter);
app.use("/api", sheetRouter);
app.use("/api", footballApiRouter);

app.get('/api/validate-token', authenticateToken, (req: any, res) => {
  res.json({ data: { valid: true, user: req.user } });
});

app.use('/api', authenticateToken, managerRouter);

app.use("/api", authenticateToken, notificationRouter);
app.use("/api/admin", authenticateToken, adminRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

