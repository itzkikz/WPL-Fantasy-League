import fs from "fs";
import { NextFunction, Request, Response } from "express";
import { User } from "../models/User";
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const privateKey = fs.readFileSync("./private.key", "utf8");

export const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Credential is required' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const { email, name } = payload;

    let user = await User.findOne({ email: email });

    if (!user) {
      // Create a new user with role 'user'
      user = new User({
        username: name || email.split('@')[0],
        email: email,
        role: 'user',
        info: ''
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user.username, info: user.info, role: user.role }, 
      privateKey, 
      { algorithm: "RS256" }
    );

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