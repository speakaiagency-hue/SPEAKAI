export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    console.warn("⚠️ AuthMiddleware - Nenhum token fornecido");
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.id || !decoded.email) {
    console.warn("⚠️ AuthMiddleware - Token inválido ou malformado:", token);
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }

  req.user = {
    id: decoded.id,
    email: decoded.email,
    name: decoded.name,
  };

  console.log(`✅ AuthMiddleware - Usuário autenticado: ${req.user.email} (ID: ${req.user.id})`);
  next();
}
