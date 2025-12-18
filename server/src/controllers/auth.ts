import fs from "fs";

import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const KEY = process.env.SECRET_KEY;

// Read keys
const privateKey = fs.readFileSync("./private.key", "utf8");


export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}