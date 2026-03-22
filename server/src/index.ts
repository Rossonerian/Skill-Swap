import express, { Request, Response } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { supabase } from "./supabase.js";
import { authRequired } from "./middleware.js";
import dotenv from "dotenv";

dotenv.config({ path: "../.env.local" });

const app = express();
const port = Number(process.env.PORT || 8888);
const jwtSecret = process.env.JWT_SECRET || "secret";

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => res.json({ status: "ok" }));

app.post("/auth/register", async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: "Missing required fields" });

  const { data: existing } = await supabase.from("users").select("id").eq("email", email).single();
  if (existing) return res.status(409).json({ error: "Email already exists" });

  const { data, error } = await supabase.from("users").insert([{ email, name, password_hash: password }]).select("id,email,name").single();
  if (error || !data) return res.status(500).json({ error: error?.message || "Failed to create user" });

  const token = jwt.sign({ sub: data.id }, jwtSecret, { expiresIn: "7d" });
  res.json({ token, user: { id: data.id, email: data.email, name: data.name } });
});

app.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing required fields" });

  const { data, error } = await supabase.from("users").select("id,email,name,password_hash").eq("email", email).single();
  if (error || !data || data.password_hash !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ sub: data.id }, jwtSecret, { expiresIn: "7d" });
  res.json({ token, user: { id: data.id, email: data.email, name: data.name } });
});

app.get("/profile", authRequired, async (req: Request, res: Response) => {
  const userId = (req as any).userId!;
  const { data, error } = await supabase.from("profiles").select("*").eq("user_id", userId).single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ profile: data });
});

app.put("/profile", authRequired, async (req: Request, res: Response) => {
  const userId = (req as any).userId!;
  const body = req.body;
  const values = {
    user_id: userId,
    name: body.name ?? null,
    college: body.college ?? null,
    branch: body.branch ?? null,
    year: body.year ?? null,
    bio: body.bio ?? null,
    avatar_url: body.avatar_url ?? null,
    skills_teach: body.skills_teach || [],
    skills_learn: body.skills_learn || [],
    is_profile_complete: true,
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(values, { onConflict: "user_id" })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ profile: data });
});

app.get("/matches", authRequired, async (req: Request, res: Response) => {
  const userId = (req as any).userId!;
  const { data, error } = await supabase
    .rpc("get_matches_for_user", { p_user_id: userId })
    .limit(100);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ matches: data || [] });
});

app.post("/matches/generate", authRequired, async (req: Request, res: Response) => {
  const userId = (req as any).userId!;
  const { data, error } = await supabase.rpc("generate_matches_for_user", { p_user_id: userId });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ created: data });
});

app.get("/conversations", authRequired, async (req: Request, res: Response) => {
  const userId = (req as any).userId!;
  const { data, error } = await supabase.rpc("get_conversations_for_user", { p_user_id: userId });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ conversations: data || [] });
});

app.get("/conversations/:conversationId/messages", authRequired, async (req: Request, res: Response) => {
  const conversationId = req.params.conversationId;
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ messages: data || [] });
});

app.post("/conversations/:conversationId/messages", authRequired, async (req: Request, res: Response) => {
  const conversationId = req.params.conversationId;
  const userId = (req as any).userId!;
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: "Message is required" });

  const { data, error } = await supabase.from("messages").insert([
    {
      conversation_id: conversationId,
      sender_id: userId,
      content: content.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: data && data[0] });
});

app.listen(port, () => {
  console.log(`Skill Swap backend running on http://localhost:${port}`);
});
