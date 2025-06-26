const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"], // Add all relevant file paths
  theme: {
    extend: {
      borderColor: {
        border: "#4A90E2", // A blue color value
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".border-border": {
          borderColor: "#4A90E2",
        },
      });
    }),
  ],
};
