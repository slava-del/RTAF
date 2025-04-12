import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString('hex');
  
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Create welcoming notification for the new user
      await storage.createNotification({
        userId: user.id,
        title: "Welcome to RTA",
        message: "Welcome to the Report Transfer Application. Start by exploring your dashboard or uploading your first document.",
        type: "info",
      });

      // Record user registration activity
      await storage.createActivity({
        userId: user.id,
        action: "User Registration",
        details: "New user account created"
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Don't send password back to client
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", async (err: Error, user: SelectUser) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      req.login(user, async (err) => {
        if (err) return next(err);
        
        // Record login activity
        await storage.createActivity({
          userId: user.id,
          action: "User Login",
          details: "User logged in successfully"
        });
        
        // Don't send password back to client
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    if (req.user) {
      const userId = req.user.id;
      req.logout((err) => {
        if (err) return next(err);
        
        // We try to record the activity, but we might not be able to since the user is logged out
        try {
          storage.createActivity({
            userId: userId,
            action: "User Logout",
            details: "User logged out successfully"
          });
        } catch (e) {
          // Ignore errors during logout activity recording
        }
        
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(200);
    }
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as SelectUser;
    
    // Don't send password back to client
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
}
