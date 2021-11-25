module.exports = {
  // purge: [],
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    boxShadow: {
      button: '0 1px 1px 0 rgb(31 49 61 / 10%), 0 1px 4px 0 rgb(31 49 61 / 20%)'
    },
    extend: {},
  },
  variants: {
    extend: {
      backgroundColor: ['disabled'],
      cursor: ['disabled']
    },
  },
  plugins: [
    require('@tailwindcss/forms')
  ],
}
