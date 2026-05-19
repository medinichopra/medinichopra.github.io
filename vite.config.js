// vite.config.js
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        work: resolve(__dirname, "work.html"),
        // writing pages — add a new entry here for each post
        writingResonance: resolve(__dirname, "writing/resonance.html"),
        writingSuccessfulFailure: resolve(__dirname, "writing/successful-failure.html"),
        writingContentModeration: resolve(__dirname, "writing/content-moderation.html"),
        writingKathakaAsALanguage: resolve(__dirname, "writing/kathak-as-a-language.html"),
        writingSpotifyRecommendationControls: resolve(__dirname, "writing/spotify-recommendation-controls.html"),
        writingDigitalExclusion: resolve(__dirname, "writing/digital-exclusion.html"),
        writingGpay: resolve(__dirname, "writing/gpay.html"),
        writingZomatoSocials: resolve(__dirname, "writing/zomato-socials.html"),
        writingLiveleaf: resolve(__dirname, "writing/liveleaf.html"),
        writingTopshelf: resolve(__dirname, "writing/topshelf.html"),
      },
    },
  },
});
