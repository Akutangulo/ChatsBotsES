// Estado de la API
// Función reutilizada en ambos scripts
async function obtenerEstadoAPI() {
    try {
        const respuesta = await fetch('https://status.openai.com/api/v2/summary.json');
        const datos = await respuesta.json();
        return datos.components.find(c => c.name === 'API')?.status || "unknown";
    } catch (error) {
        console.error('Error:', error);
        return "error";
    }
}

// Ejecutar solo en el DOM donde existe #estado-api
document.addEventListener('DOMContentLoaded', async () => {
    if (!document.getElementById('estado-api')) return; // Si no existe, salir

    const estado = await obtenerEstadoAPI();
    
    const estados = {
        operational: { texto: "Operativo", clase: "verde" },
        degraded_performance: { texto: "Rendimiento degradado", clase: "amarillo" },
        partial_outage: { texto: "Interrupción parcial", clase: "naranja" },
        major_outage: { texto: "Interrupción mayor", clase: "rojo" },
        unknown: { texto: "Estado desconocido", clase: "" },
        error: { texto: "Error al consultar", clase: "" }
    };

    const elemento = document.getElementById('estado-api');
    elemento.innerHTML = `<h6>Estado de la API</h6><h4>${estados[estado].texto}</h4>`;
    elemento.className = estados[estado].clase;
});



// Modelos LLM disponibles
async function cargarModelos() {
    try {
        const response = await fetch('modelos-llm.json');
        const data = await response.json();
        
        const select = document.getElementById('modelSelect');
        const modelos = {};
        let defaultModel = "gpt-4o-mini";
        
        data.modelos.forEach(proveedor => {
            proveedor.modelos.forEach(modeloObj => {
                const modeloNombre = Object.keys(modeloObj)[0];
                modelos[modeloNombre] = modeloObj[modeloNombre];
                
                const option = document.createElement('option');
                option.value = modeloNombre;
                option.textContent = `${modeloNombre} (${proveedor.proveedor})`;
                if (modeloNombre === defaultModel) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
        });
        
        function actualizarInfo(modeloNombre) {
            const infoDiv = document.getElementById('info');
            if (modeloNombre && modelos[modeloNombre]) {
                const modelo = modelos[modeloNombre];
                infoDiv.innerHTML = `
                    <h3> ${select.options[select.selectedIndex].text.split(' (')[1].slice(0, -1)}</h3>
                    

                     <details>
<summary>${modeloNombre}</summary>
<p><strong>Costo de entrada:</strong> ${modelo.input_cost} USD / millón de tokens</p>
                    <p><strong>Costo de salida:</strong> ${modelo.output_cost} USD / millón de tokens</p>
                    ${modelo.context_tokens ? `<p><strong>Contexto máximo:</strong> ${modelo.context_tokens} tokens</p>` : ''}
                    <p><strong>Descripción:</strong> ${modelo.descripcion}</p>
</details>
                `;
            } else {
                infoDiv.innerHTML = '';
            }
        }
        
        select.addEventListener('change', () => {
            actualizarInfo(select.value);
        });
        
        actualizarInfo(defaultModel);
    } catch (error) {
        console.error('Error cargando el JSON:', error);
    }
}

cargarModelos();
