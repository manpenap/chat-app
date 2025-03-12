/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Esto incluye todos los archivos dentro de la carpeta src
  ],
  theme: {
    extend: {
      colors: {
        background: "oklch(0.278 0.033 256.848)",
        backgroundLight:"oklch(0.551 0.027 264.364)",
        backgroundAlternative:"oklch(0.21 0.034 264.665)",
        textMainColor: "oklch(0.985 0.002 247.839)",
        textSecondColor: "oklch(0.785 0.115 274.713)",
        buttonColor:"oklch(0.623 0.214 259.815)",
        buttonColorHover:"oklch(0.488 0.243 264.376)",
        buttonCloseColor:"oklch(0.705 0.213 47.604)",

      },
    },
  },
  plugins: [],
}
