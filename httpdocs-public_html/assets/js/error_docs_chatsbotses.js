document.addEventListener('DOMContentLoaded', function() {
    // Actualizar el año de copyright
    const copyrightYearElement = document.getElementById("copyright-year");
    if (copyrightYearElement) {
        copyrightYearElement.textContent = new Date().getFullYear();
    }

    // Funcionalidad del ojo que sigue al cursor
    const root = document.documentElement;
    const eyef = document.getElementById('eyef');

    if (eyef) {
        function updateEyePosition(x, y) {
            root.style.setProperty("--mouse-x", x);
            root.style.setProperty("--mouse-y", y);

            eyef.setAttribute("cx", 115 + 30 * x);
            eyef.setAttribute("cy", 50 + 30 * y);
        }

        function handleMove(clientX, clientY) {
            updateEyePosition(clientX / window.innerWidth, clientY / window.innerHeight);
        }

        document.addEventListener("mousemove", (evt) => {
            handleMove(evt.clientX, evt.clientY);
        });

        document.addEventListener("touchmove", (touchHandler) => {
            handleMove(touchHandler.touches[0].clientX, touchHandler.touches[0].clientY);
        });
    }
});
