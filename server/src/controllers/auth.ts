import fs from "fs";
import { NextFunction, Request, Response } from "express";
import { getSheets } from "../lib/store/globals";
import { convertToJSON } from "../utils";
import { Users } from "../types/users";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const KEY = process.env.SECRET_KEY;

// Read keys
const privateKey = fs.readFileSync("./private.key", "utf8");


export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { teamName, password } = req.body;
  const response = await getSheets()?.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Users!A:E", // Adjust range as needed
  });

  const rows = response?.data?.values || [];
  const users: Users[] = convertToJSON(rows, 'users');
  const user = users.find(u => u.username === teamName);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.username, info: user.info, isTempPassword: user.isTempPassword }, privateKey, {
    algorithm: "RS256",
  });
  res.json({
    data: {
      token,
      user: { username: user.username }
    }
  });
}