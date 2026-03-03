import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        buildana: {
          black: '#111111',
          yellow: '#facc15',
          white: '#ffffff'
        }
      }
    }
  },
  plugins: []
};

export default config;
