/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./index.html", "./src/js/*.js"], // Сканировать HTML и JS на наличие классов
    theme: {
        extend: {
            // Добавление пользовательского шрифта, если это необходимо для стиля
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                // mono: ['Courier New', 'monospace'], // Может быть использован для более "грубого" вида
            },
        },
    },
    plugins: [],
}