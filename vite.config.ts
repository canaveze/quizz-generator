import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // IMPORTANTE: Ajuste o base path com o nome do seu repositório GitHub
  // Se o repo for username/repo-name, use: base: '/repo-name/'
  // Se for username.github.io, use: base: '/'
  base: '/quizz-generator/', // Ajustado para o repositório quizz-generator
  build: {
    outDir: 'docs', // Build vai para pasta docs/ para GitHub Pages
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
