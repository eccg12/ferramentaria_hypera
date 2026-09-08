/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // superfícies e texto — a bancada de metrologia
        'aco-900': 'var(--aco-900)',
        'aco-800': 'var(--aco-800)',
        'aco-700': 'var(--aco-700)',
        linha: 'var(--linha)',
        texto: 'var(--texto)',
        'texto-2': 'var(--texto-2)',
        sinal: 'var(--sinal)',
        // semântica — cor é dado, não decoração
        condenar: 'var(--condenar)',
        atencao: 'var(--atencao)',
        tolerancia: 'var(--tolerancia)',
        dimensional: 'var(--dimensional)',
        identidade: 'var(--identidade)',
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
