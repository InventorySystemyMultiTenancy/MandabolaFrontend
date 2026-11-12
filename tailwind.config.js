/** @type {import('tailwindcss').Config} */
// Paleta Manda Bola Premium Diversões (tirada da logo):
// azul royal do "Bola", marinho do fundo, dourado do "Manda"/coroa e vermelho da faixa.
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E5BD8", // Azul royal Manda Bola
          light: "#38BDF8", // Azul céu
          dark: "#0B1F5C", // Azul marinho
        },
        secondary: {
          DEFAULT: "#FFFFFF",
          light: "#F4F7FF",
        },
        background: {
          dark: "#0B1F5C",
          light: "#F4F7FF",
        },
        accent: {
          blue: "#38BDF8",
          red: "#D7191C", // Vermelho da faixa (alertas)
          yellow: "#F5B400", // Dourado da coroa
          green: "#16A34A",
          white: "#FFFFFF",
          cream: "#FFF6D6", // Dourado suave
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
