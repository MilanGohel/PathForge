import { createGateway } from "ai";
import { env } from "@/lib/env";

export function getGateway() {
  return createGateway({
    apiKey: env.aiGatewayApiKey(),
  });
}

export function fastModel() {
  return env.modelFast();
}

export function strongModel() {
  return env.modelStrong();
}
