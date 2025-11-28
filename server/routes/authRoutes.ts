import type { Express, Request, Response } from "express";
import { createKiwifyService } from "../services/kiwifyService";
import { generateToken } from "../middleware/authMiddleware";
import { storage } from "../storage";

export async function registerAuthRoutes(app: Express) {
  const kiwifyService = await createKiwifyService();

  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }

      // Authenticate with Kiwify
      const user = await kiwifyService.authenticateUser(email, password);

      if (!user) {
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }

      // Ensure user exists in storage
      let storedUser = await storage.getUserByUsername(user.email);
      if (!storedUser) {
        storedUser = await storage.createUser({ username: user.email, password });
        // Update with email and name
        storedUser = await storage.updateUserProfile(storedUser.id, { name: user.name, email: user.email }) || storedUser;
      }

      // Generate JWT token
      const token = generateToken(storedUser.id, storedUser.email || user.email, storedUser.name || user.name);

      res.json({
        token,
        user: {
          id: storedUser.id,
          email: storedUser.email || user.email,
          name: storedUser.name || user.name,
          status: storedUser.status,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  // Validate access endpoint
  app.post("/api/auth/validate-access", async (req: Request, res: Response) => {
    try {
      const { email, productId } = req.body;

      if (!email || !productId) {
        return res.status(400).json({ error: "Email e productId são obrigatórios" });
      }

      const hasAccess = await kiwifyService.validateCustomer(email, productId);

      res.json({ hasAccess });
    } catch (error) {
      console.error("Validate access error:", error);
      res.status(500).json({ error: "Erro ao validar acesso" });
    }
  });

  // Register endpoint
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, senha e nome são obrigatórios" });
      }

      // In development, accept the predefined credentials
      if (process.env.NODE_ENV === "development" && email === "speakai.agency@gmail.com" && password === "Diamante2019@") {
        // Ensure dev user exists in storage
        let storedUser = await storage.getUserByUsername(email);
        if (!storedUser) {
          storedUser = await storage.createUser({ username: email, password });
          storedUser = await storage.updateUserProfile(storedUser.id, { name: name || "Speak AI Admin", email }) || storedUser;
        }
        
        const token = generateToken(storedUser.id, storedUser.email || email, storedUser.name || name || "Speak AI Admin");
        return res.json({
          token,
          user: {
            id: storedUser.id,
            email: storedUser.email || email,
            name: storedUser.name || name || "Speak AI Admin",
            status: storedUser.status,
          },
        });
      }

      // For production, you would hash the password and save to database
      res.status(400).json({ error: "Registro apenas disponível em desenvolvimento" });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Erro ao criar conta" });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // In a real implementation, decode and return the user
      res.json({ message: "User data retrieved successfully" });
    } catch (error) {
      res.status(500).json({ error: "Erro ao buscar usuário" });
    }
  });
}
