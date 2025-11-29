import type { Express, Request, Response } from "express";
import { createKiwifyService } from "../services/kiwifyService";
import { generateToken, authMiddleware } from "../middleware/authMiddleware";
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

  // Check membership (Protected) - verifies if user bought any plan
  app.get("/api/auth/check-membership", authMiddleware, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.email) {
        return res.json({ hasMembership: false });
      }

      // Check if user has any plan purchases in Kiwify
      const hasMembership = await (kiwifyService as any).hasAnyPurchase(user.email);
      
      res.json({ hasMembership });
    } catch (error) {
      console.error("Check membership error:", error);
      res.status(500).json({ error: "Erro ao verificar acesso" });
    }
  });

  // Register endpoint
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, senha e nome são obrigatórios" });
      }

      // Check if user already exists
      let existingUser = await storage.getUserByUsername(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email já cadastrado" });
      }

      // Create new user
      const newUser = await storage.createUser({ username: email, password });
      const updatedUser = await storage.updateUserProfile(newUser.id, { name, email }) || newUser;

      // Generate JWT token
      const token = generateToken(updatedUser.id, updatedUser.email || email, updatedUser.name || name);

      res.json({
        token,
        user: {
          id: updatedUser.id,
          email: updatedUser.email || email,
          name: updatedUser.name || name,
          status: updatedUser.status,
        },
      });
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

  // Update User Avatar (Protected)
  app.post("/api/auth/update-avatar", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { avatar } = req.body;
      
      if (!avatar) {
        return res.status(400).json({ error: "Avatar é obrigatório" });
      }
      
      console.log("🔍 Avatar update - User ID from token:", req.user?.id);
      const user = await storage.getUser(req.user!.id);
      console.log("🔍 User found in storage:", !!user);
      
      const updatedUser = await storage.updateUserAvatar(req.user!.id, avatar);
      if (!updatedUser) {
        console.error("❌ User not found for avatar update with ID:", req.user?.id);
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      res.json({ user: updatedUser });
    } catch (error) {
      console.error("Avatar update error:", error);
      res.status(500).json({ error: "Erro ao atualizar avatar" });
    }
  });

  // Update User Profile (Protected)
  app.post("/api/auth/update-profile", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { name, email } = req.body;
      
      if (!name || !email) {
        return res.status(400).json({ error: "Nome e email são obrigatórios" });
      }

      const updatedUser = await storage.updateUserProfile(req.user!.id, { name, email });
      if (!updatedUser) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      res.json({ user: updatedUser });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
  });

  // Change Password (Protected)
  app.post("/api/auth/change-password", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { newPassword } = req.body;
      
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres" });
      }

      const updated = await storage.updateUserPassword(req.user!.id, newPassword);
      if (!updated) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ error: "Erro ao alterar senha" });
    }
  });
}
