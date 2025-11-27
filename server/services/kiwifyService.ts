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
  const apiKey = process.env.KIWIFY_API_KEY;

  if (!apiKey) {
    throw new Error("KIWIFY_API_KEY environment variable is not configured");
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

    async authenticateUser(email: string, password: string): Promise<KiwifyUser | null> {
      try {
        // This would typically call a custom authentication endpoint
        // For now, we'll use the Kiwify API to fetch customer data
        const response = await axios.get(`${KIWIFY_API_URL}/customers`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          params: {
            email: email,
          },
        });

        if (!response.data || !response.data.data || response.data.data.length === 0) {
          return null;
        }

        const customer = response.data.data[0];

        // In a real implementation, you'd verify the password here
        // For Kiwify, you might use OAuth or their authentication endpoints
        
        return {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          status: customer.status,
          products: customer.products || [],
        };
      } catch (error) {
        console.error("Error authenticating user:", error);
        return null;
      }
    },
  };
}
