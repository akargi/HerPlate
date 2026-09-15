import "reflect-metadata";
import dotenv from "dotenv";
import { json, urlencoded } from "express";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

// Load env files before anything reads process.env. Closest file wins.
dotenv.config({ path: ".env.local" });
dotenv.config({ path: "../.env.local" });
dotenv.config();

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { rawBody: false });

  // Explicit body parsing — some Windows/shell environments don't pick up
  // defaults reliably when the process is spawned detached.
  app.use(json({ limit: "1mb" }));
  app.use(urlencoded({ extended: true }));

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(",").filter(Boolean) ?? true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  });

  // Controllers perform their own validation; the pipe just transforms payloads.
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const portEnv = Number(process.env.PORT);
  const port = Number.isFinite(portEnv) && portEnv > 0 ? portEnv : 4000;
  await app.listen(port, "0.0.0.0");
  // eslint-disable-next-line no-console
  console.log(`HPTF API listening on http://localhost:${port}`);
}

void bootstrap();
