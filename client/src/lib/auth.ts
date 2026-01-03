export interface User {
  id: string;
  email: string;
  name: string;
  status: "active" | "inactive";
  avatar?: string; // opcional para suportar avatar
}

/**
 * Recupera o token de autenticação salvo no localStorage.
 * Retorna null se não existir ou se estiver inválido.
 */
export const getAuthToken = (): string | null => {
  try {
    const token = localStorage.getItem("authToken");
    if (!token || token === "undefined" || token === "null") return null;
    return token;
  } catch (error) {
    console.error("Erro ao recuperar token:", error);
    return null;
  }
};

/**
 * Recupera o usuário salvo no localStorage.
 * Retorna null se não existir ou se estiver inválido.
 */
export const getUser = (): User | null => {
  try {
    const user = localStorage.getItem("user");
    if (!user || user === "undefined" || user === "null") return null;

    const parsed = JSON.parse(user);
    if (parsed && typeof parsed === "object" && "id" in parsed) {
      return parsed as User;
    }
    return null;
  } catch (error) {
    console.error("Erro ao recuperar usuário:", error);
    return null;
  }
};

/**
 * Salva token e dados do usuário no localStorage.
 */
export const setAuthToken = (token: string, user: User) => {
  try {
    if (!token || token === "undefined" || token === "null") {
      throw new Error("Token inválido");
    }
    localStorage.setItem("authToken", token);
    localStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.error("Erro ao salvar token:", error);
  }
};

/**
 * Limpa token e dados do usuário do localStorage.
 */
export const clearAuth = () => {
  try {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  } catch (error) {
    console.error("Erro ao limpar auth:", error);
  }
};

/**
 * Verifica se o usuário está autenticado.
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken() && !!getUser();
};

/**
 * Retorna o header de autenticação para chamadas ao backend.
 * Exemplo: { Authorization: "Bearer <token>" }
 */
export const getAuthHeader = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
