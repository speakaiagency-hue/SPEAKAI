import type { Express, Request, Response } from "express";
import bcrypt from "bcrypt";
import { generateToken, authMiddleware } from "../middleware/authMiddleware";
import type { IStorage } from "../storage";
import { createKiwifyService } from "../services/kiwifyService";

export async function registerAuthRoutes(app: Express, storage: IStorage) {
  const kiwifyService = await createKiwifyService();

  // Register endpoint - create new user with hashed password
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, senha e nome são obrigatórios" });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Email inválido" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "Email já cadastrado" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await storage.createUser({
        username: email,
        password: hashedPassword,
      });

      if (newUser) {
        await storage.updateUserProfile(newUser.id, { email, name });
      }

      const token = generateToken(newUser.id, email, name);

      res.status(201).json({
        message: "Conta criada com sucesso",
        token,
        user: { id: newUser.id, email, name },
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Erro ao criar conta" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }

      const user = await storage.getUserByEmail(email);

      if (!user || !user.password) {
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Email ou senha inválidos" });
      }

      const token = generateToken(user.id, user.email || email, user.name || undefined);

      res.json({
        token,
        user: { id: user.id, email: user.email || email, name: user.name },
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

      const credits = await storage.getUserCredits(user.id);
      if (credits && credits.credits > 0) {
        return res.json({ hasMembership: true, credits: credits.credits });
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
      if (!avatar) return res.status(400).json({ error: "Avatar é obrigatório" });

      const updatedUser = await storage.updateUserAvatar(req.user!.id, avatar);
      if (!updatedUser) return res.status(404).json({ error: "Usuário não encontrado"
