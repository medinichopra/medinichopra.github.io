/** @type {import('tailwindcss').Config} */
export default {
  content: ["*"],
  theme: {
    extend: {
      colors: {
        gray: {
          "100": "#fffefb",
          "300": "#fdfdfd",
          "400": "#041527",
          "500": "#0a0b1e",
        },
        "colors-black-100": "#000",
        mediumseagreen: {
          "100": "#01b15d",
          "200": "#0fa958",
        },
        whitesmoke: "#f4f4f4",
        lightgray: "#d3d5d8",
        cadetblue: "#5d8a8f",
        lightseagreen: "#57bba9",
        mediumaquamarine: "#62cbab",
        purple: "#4E2A84",
        lavender: "#7A5C91"
      },
      spacing: {},
      fontFamily: {
        inter: "Inter",
        "plus-jakarta-sans": "'Plus Jakarta Sans'",
        "dm-sans": "'DM Sans'",
        helvetica: "Helvetica",
        "inknut-antiqua": "'Inknut Antiqua'",
      },
      borderRadius: {
        "6xl": "25px",
        "31xl": "50px",
        xl: "20px",
        "3xs": "10px",
      },
    },
    fontSize: {
      "59xl": "78px",
      "61xl": "80px",
      "5xl": "24px",
      "12xl": "31px",
      base: "16px",
      mini: "15px",
      "15xl": "34px",
      "4xl": "23px",
      inherit: "inherit",
    },
  },
  corePlugins: {
    preflight: false,
  },
};
