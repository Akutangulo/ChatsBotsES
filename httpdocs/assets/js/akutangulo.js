/**************************************************
 * Script para cambiar el tema de oscuro a claro  *
 **************************************************/

function toggleMenu() {
    const nav = document.getElementById('nav');
    nav.classList.toggle('active');
}

function toggleTheme() {
    document.body.classList.toggle('tema-claro');
    const theme = document.body.classList.contains('tema-claro') ? 'light' : 'dark';
    localStorage.setItem('theme', theme);
}

// Aplicar tema almacenado al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light') {
        document.body.classList.add('tema-claro');
    }
});