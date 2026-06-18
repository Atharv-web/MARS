import OpenAI from "openai";
import { config } from "../config.js";

export const openai = new OpenAI({
  apiKey: config.openAiApiKey,
  timeout: config.openAiTimeoutMs,
  maxRetries: 2,
});
