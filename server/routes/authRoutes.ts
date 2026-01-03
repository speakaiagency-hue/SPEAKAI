import type { Express, Request, Response } from "express";
import bcrypt from "bcrypt";
import { generateToken, authMiddleware } from "../middleware/authMiddleware";
import { storage } from "../storage";
import { createKiwifyService } from "../services/kiwifyService";

export async function registerAuthRoutes(app: Express) {
  const kiwifyService = await createKiwifyService();

  // Register endpoint - create new user with hashed password
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      // Validate required fields
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, senha e nome são obrigatórios" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Email inválido" });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(email);
      if (existingUser) {
        return res.status(409).json({ error: "Email já cadastrado" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user with hashed password
      const newUser = await storage.createUser({ 
        username: email, 
        password: hashedPassword
      });

      // Update user profile with email and name
      if (newUser) {
        await storage.updateUserProfile(newUser.id, { email, name });
      }

      // Generate JWT token
      const token = generateToken(newUser.id, email, name);

      res.status(201).json({
        message: "Conta criada com sucesso",
        token,
        user: {
          id: newUser.id,
          email,
          name,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Erro ao criar conta" });
    }
  });

  // Login endpoint - authenticate with email and compare hashed password
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }

      // Find user by email
      const user = await storage.getUserByUsername(email);

      if (!user || !user.password) {
        console.log("❌ Login failed - user or password missing:", { 
          userExists: !!user, 
          hasPassword: !!user?.password,
          userPassword: user?.password ? "EXISTS" : "MISSING"
        });
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }

      // Compare passwords
      let passwordMatch = false;
      try {
        passwordMatch = await bcrypt.compare(password, user.password);
      } catch (error) {
        console.error("❌ bcrypt.compare error:", error);
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }

      if (!passwordMatch) {
        console.log("❌ Password mismatch for user:", email);
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }
      
      console.log("✅ Login successful for user:", email);

      // Generate JWT token
      const token = generateToken(user.id, user.email || email, user.name || undefined);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email || email,
          name: user.name,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  // Check membership (Protected)
  app.get("/api/auth/check-membership", authMiddleware, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.email) {
        return res.json({ hasMembership: false });
      }

      // Check if user has any plan purchases in Kiwify or has credits
      const credits = await storage.getUserCredits(user.id);
      if (credits && credits.credits > 0) {
        console.log(`✅ User has credits: ${user.email}`);
        return res.json({ hasMembership: true });
      }

      const hasMembership = await (kiwifyService as any).hasAnyPurchase(user.email);

      res.json({ hasMembership });
    } catch (error) {
      console.error("Check membership error:", error);
      res.status(500).json({ error: "Erro ao verificar acesso" });
    }
  });

  // Update User Avatar (Protected)
  app.post("/api/auth/update-avatar", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { avatar } = req.body;

      if (!avatar) {
        return res.status(400).json({ error: "Avatar é obrigatório" });
      }

      const updatedUser = await storage.updateUserAvatar(req.user!.id, avatar);
      if (!updatedUser) {
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
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Senha atual e nova senha são obrigatórias" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Nova senha deve ter no mínimo 6 caracteres" });
      }

      // Get user and verify current password
      const user = await storage.getUser(req.user!.id);
      if (!user || !user.password) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Senha atual incorreta" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const updated = await storage.updateUserPassword(req.user!.id, hashedPassword);

      if (!updated) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      res.json({ success: true, message: "Senha alterada com sucesso" });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({ error: "Erro ao alterar senha" });
    }
  });
}
