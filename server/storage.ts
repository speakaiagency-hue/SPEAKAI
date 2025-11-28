import { type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserAvatar(id: string, avatar: string): Promise<User | undefined>;
  updateUserProfile(id: string, data: { name: string; email: string }): Promise<User | undefined>;
  updateUserPassword(id: string, password: string): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private userCredits: Map<string, { credits: number; totalUsed: number; totalPurchased: number }>;

  constructor() {
    this.users = new Map();
    this.userCredits = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, name: null, email: null, avatar: null, status: "active" };
    this.users.set(id, user);
    this.userCredits.set(id, { credits: 0, totalUsed: 0, totalPurchased: 0 });
    return user;
  }

  async getUserCredits(userId: string) {
    return this.userCredits.get(userId) || { credits: 0, totalUsed: 0, totalPurchased: 0 };
  }

  async addCredits(userId: string, amount: number) {
    const c = this.userCredits.get(userId) || { credits: 0, totalUsed: 0, totalPurchased: 0 };
    c.credits += amount;
    c.totalPurchased += amount;
    this.userCredits.set(userId, c);
    return c;
  }

  async deductCredits(userId: string, amount: number) {
    const c = this.userCredits.get(userId) || { credits: 0, totalUsed: 0, totalPurchased: 0 };
    if (c.credits < amount) return null;
    c.credits -= amount;
    c.totalUsed += amount;
    this.userCredits.set(userId, c);
    return c;
  }

  async updateUserAvatar(id: string, avatar: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, avatar };
    this.users.set(id, updated);
    return updated;
  }

  async updateUserProfile(id: string, data: { name: string; email: string }): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  async updateUserPassword(id: string, password: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, password };
    this.users.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
