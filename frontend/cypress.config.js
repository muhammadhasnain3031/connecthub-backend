import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173", // Apne frontend port ke mutabiq check kar lein
    setupNodeEvents(on, config) {
      // Node events integration yahan hoti hai
    },
  },
});
