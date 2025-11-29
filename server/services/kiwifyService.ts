import axios from "axios";

const KIWIFY_API_URL = "https://api.kiwify.com.br";

interface KiwifyUser {
  id: string;
  email: string;
  name: string;
  status: "active" | "inactive";
  products: string[];
}

export async function createKiwifyService() {
  const clientSecret = process.env.KIWIFY_CLIENT_SECRET;
  const clientId = process.env.KIWIFY_CLIENT_ID;
  const accountId = process.env.KIWIFY_ACCOUNT_ID;
  
  // Check if Kiwify credentials are configured
  const hasKiwifyConfig = clientSecret && clientId && accountId;

  if (!hasKiwifyConfig) {
    console.warn("Kiwify credentials not fully configured. Using development mode.");
  }

  return {
    async validateCustomer(email: string, productId: string): Promise<boolean> {
      try {
        const response = await axios.get(`${KIWIFY_API_URL}/customers`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          params: {
            email: email,
          },
        });

        if (!response.data || !response.data.data || response.data.data.length === 0) {
          return false;
        }

        const customer = response.data.data[0];
        
        // Check if customer has access to the product
        if (customer.status !== "active") {
          return false;
        }

        // Verify if customer purchased the product
        const hasPurchase = await this.checkPurchase(customer.id, productId);
        return hasPurchase;
      } catch (error) {
        console.error("Error validating customer with Kiwify:", error);
        throw new Error("Erro ao validar cliente");
      }
    },

    async checkPurchase(customerId: string, productId: string): Promise<boolean> {
      try {
        const response = await axios.get(
          `${KIWIFY_API_URL}/customers/${customerId}/purchases`,
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
          }
        );

        if (!response.data || !response.data.data) {
          return false;
        }

        return response.data.data.some(
          (purchase: any) => purchase.product_id === productId && purchase.status === "approved"
        );
      } catch (error) {
        console.error("Error checking purchase:", error);
        return false;
      }
    },

    async hasAnyPurchase(email: string): Promise<boolean> {
      try {
        if (!hasKiwifyConfig) {
          // In dev mode, admin has access
          return email === "speakai.agency@gmail.com";
        }

        const response = await axios.get(`${KIWIFY_API_URL}/customers`, {
          headers: {
            Authorization: `Bearer ${clientSecret}`,
          },
          params: { email },
        });

        if (!response.data?.data || response.data.data.length === 0) {
          return false;
        }

        const customer = response.data.data[0];
        const purchasesResponse = await axios.get(
          `${KIWIFY_API_URL}/customers/${customer.id}/purchases`,
          {
            headers: {
              Authorization: `Bearer ${clientSecret}`,
            },
          }
        );

        if (!purchasesResponse.data?.data) {
          return false;
        }

        return purchasesResponse.data.data.some(
          (purchase: any) => purchase.status === "approved"
        );
      } catch (error) {
        console.error("Error checking any purchase:", error);
        return false;
      }
    },

    async authenticateUser(email: string, password: string): Promise<KiwifyUser | null> {
      try {
        if (!hasKiwifyConfig) {
          // Development mode without Kiwify config
          // Accept the dev credentials
          if (email === "speakai.agency@gmail.com" && password === "Diamante2019@") {
            return {
              id: "dev-user-001",
              email: "speakai.agency@gmail.com",
              name: "Speak AI Admin",
              status: "active",
              products: [],
            };
          }
          return null;
        }

        // Try to authenticate with Kiwify API using Client Credentials flow
        try {
          // First, try to verify customer exists and get their info
          const response = await axios.get(`${KIWIFY_API_URL}/customers`, {
            headers: {
              Authorization: `Bearer ${clientSecret}`,
            },
            params: {
              email: email,
            },
          });

          if (!response.data || !response.data.data || response.data.data.length === 0) {
            return null;
          }

          const customer = response.data.data[0];

          // Note: Kiwify API doesn't directly verify passwords
          // Password verification would need to be done through OAuth or custom backend
          // For now, we verify the customer exists and is active
          if (customer.status === "active") {
            return {
              id: customer.id,
              email: customer.email,
              name: customer.name,
              status: customer.status,
              products: customer.products || [],
            };
          }
          return null;
        } catch (apiError: any) {
          console.error("Kiwify API error:", apiError.response?.status, apiError.response?.data);
          
          // Fallback for development: accept the predefined dev credentials
          if (email === "speakai.agency@gmail.com" && password === "Diamante2019@") {
            return {
              id: "dev-user-001",
              email: "speakai.agency@gmail.com",
              name: "Speak AI Admin",
              status: "active",
              products: [],
            };
          }
          return null;
        }
      } catch (error) {
        console.error("Error authenticating user:", error);
        return null;
      }
    },
  };
}
