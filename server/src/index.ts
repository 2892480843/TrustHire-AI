import { createApp } from "./app.js";
import { config } from "./config.js";

const app = createApp();
const server = app.listen(config.port, () => {
  console.info(`TrustHire AI server listening on http://localhost:${config.port}`);
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
