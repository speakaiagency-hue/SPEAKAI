import type { Express, Request, Response } from "express";
import { createKiwifyService } from "../services/kiwifyService";
import { generateToken } from "../middleware/authMiddleware";

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

      // Generate JWT token
      const token = generateToken(user.id, user.email, user.name);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
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
        const token = generateToken("dev-user-001", email, name || "Speak AI Admin");
        return res.json({
          token,
          user: {
            id: "dev-user-001",
            email,
            name: name || "Speak AI Admin",
            status: "active",
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
