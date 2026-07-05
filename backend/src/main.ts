import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * Application entry point.
 *
 * Loads environment variables, builds the Nest application from the root
 * {@link AppModule}, enables CORS (the frontend runs on a different origin),
 * and starts the HTTP server.
 */
async function bootstrap() {
  // Load .env explicitly from the current working directory. Done here in
  // addition to ConfigModule so env vars are available even before Nest's DI
  // container is built (e.g. for values read at module construction time).
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  const app = await NestFactory.create(AppModule);
  // Allow browser requests from the separately-hosted frontend origin.
  app.enableCors();
  // Use the configured PORT, falling back to 3000 for local development.
  await app.listen(process.env.PORT ?? 3000);
}
// Surface any startup failure instead of exiting silently.
bootstrap().catch((err) => console.error(err));
