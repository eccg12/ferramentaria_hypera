/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Os canais separados são o que permite bg-sinal/70 e afins. Com
        // 'var(--sinal)' cru o Tailwind descarta a opacidade sem avisar.
        'aco-900': 'rgb(var(--aco-900-rgb) / <alpha-value>)',
        'aco-800': 'rgb(var(--aco-800-rgb) / <alpha-value>)',
        'aco-700': 'rgb(var(--aco-700-rgb) / <alpha-value>)',
        linha: 'rgb(var(--linha-rgb) / <alpha-value>)',
        texto: 'rgb(var(--texto-rgb) / <alpha-value>)',
        'texto-2': 'rgb(var(--texto-2-rgb) / <alpha-value>)',
        sinal: 'rgb(var(--sinal-rgb) / <alpha-value>)',
        // semântica — cor é dado, não decoração
        condenar: 'rgb(var(--condenar-rgb) / <alpha-value>)',
        atencao: 'rgb(var(--atencao-rgb) / <alpha-value>)',
        tolerancia: 'rgb(var(--tolerancia-rgb) / <alpha-value>)',
        dimensional: 'rgb(var(--dimensional-rgb) / <alpha-value>)',
        identidade: 'rgb(var(--identidade-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Montserrat', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['IBM Plex Mono', 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'monospace'],
      },
      borderRadius: {
        // 4px em controles, 0 em regiões de dado. Não uniformizar em 12px.
        controle: '4px',
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
      },
    },
  },
  plugins: [],
}
