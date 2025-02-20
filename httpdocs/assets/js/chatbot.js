document.addEventListener('DOMContentLoaded', function () {
    const chatbotBubble = document.getElementById('chatbot-bubble');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotOverlay = document.getElementById('chatbot-overlay');
    const closeChatButton = document.getElementById('close-chat');
    const sendButton = document.getElementById('send-btn');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotContent = document.getElementById('chatbot-content');
    const storageToggle = document.getElementById('storage-toggle');

    // Cargar la configuración del checkbox al iniciar el Chatbot
    async function loadConfiguration() {
        try {
            const response = await fetch('chatbot_proxy.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'load_config' }) // Solicitar la configuración
            });

            const data = await response.json();
            storageToggle.checked = data.config.remember_conversation; // Establecer el estado del checkbox
        } catch (error) {
            console.error('Error al cargar la configuración:', error);
        }
    }

// Llamar a la función para cargar la configuración
loadConfiguration().then(() => {
    // Determinar el tipo de almacenamiento al cargar
    if (storageToggle.checked) {
        conversationId = localStorage.getItem('conversationId') || generateConversationId();
        localStorage.setItem('conversationId', conversationId);
    } else {
        conversationId = sessionStorage.getItem('conversationId') || generateConversationId();
        sessionStorage.setItem('conversationId', conversationId);
    }
});

    // Función para generar conversationId
    function generateConversationId() {
        return 'conv_' + Math.random().toString(36).substr(2, 9);
    }

    // Escuchar cambios en el checkbox para actualizar el almacenamiento y recordar la selección
    storageToggle.addEventListener('change', function () {
        localStorage.setItem('storagePreference', this.checked); // Guardar selección del usuario
        // Manejar el cambio de almacenamiento
        if (this.checked) {
            conversationId = localStorage.getItem('conversationId') || generateConversationId();
            localStorage.setItem('conversationId', conversationId);
            sessionStorage.removeItem('conversationId');
        } else {
            conversationId = sessionStorage.getItem('conversationId') || generateConversationId();
            sessionStorage.setItem('conversationId', conversationId);
            localStorage.removeItem('conversationId');
        }
    });

    // Mostrar el chatbot al hacer clic en la burbuja
    chatbotBubble.addEventListener('click', function () {
        chatbotContainer.style.display = 'flex';
        chatbotOverlay.style.display = 'block';
        chatbotBubble.style.display = 'none';
        
        // Deshabilitar el scroll de la página principal
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden'; // Asegurar que el scroll esté deshabilitado en todos los navegadores

        // *** Lógica para el cierre automático (solo al abrir con la burbuja) ***
        const opcionesHeader = document.querySelector('.opciones-chatbot-header');
        const contenidoOpcionesHeader = document.querySelector('.contenido-opciones-chatbot-header');
        const inferiorHeader = document.querySelector('.inferior-header');
        const contenidoInferiorHeader = document.querySelector('.contenido-inferior-header');
        const elementsToAutoHide = [opcionesHeader, contenidoOpcionesHeader, inferiorHeader, contenidoInferiorHeader];

        // Esperar 5 segundos para que se vea la animación de entrada, y luego cerrar
        setTimeout(() => {
            elementsToAutoHide.forEach(element => {
                element.classList.add('inactive');
            });
        }, 5000);
        // *** Fin de lógica para el cierre automático  ***
    });

    // Cerrar el chatbot
    closeChatButton.addEventListener('click', function () {
        chatbotContainer.style.display = 'none';
        chatbotOverlay.style.display = 'none';
        chatbotBubble.style.display = 'flex';
        
        // Habilitar el scroll de la página principal
        document.body.style.overflow = 'auto';
        document.documentElement.style.overflow = 'auto'; // Asegurar que el scroll esté habilitado en todos los navegadores
    });

    // Autoajustar la altura del textarea
    chatbotInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Enviar mensaje al chatbot
    sendButton.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            sendMessage();
            e.preventDefault(); // Prevenir salto de línea al enviar
        }
    });

function sendMessage() {
    const userMessage = chatbotInput.value.trim();
    if (userMessage === '') return; // No enviar mensaje vacío

    // Mostrar mensaje del usuario
    displayMessage('user', userMessage);
    chatbotInput.value = ''; // Limpiar input
    chatbotInput.style.height = 'auto'; // Reiniciar altura del textarea

    // Mostrar animación chatbot-pensando mientras se espera la respuesta
    const chatbotPensando = document.createElement('div');
    chatbotPensando.className = 'chatbot-pensando';

    // Crear las neuronas (barras animadas)
    for (let i = 1; i <= 10; i++) {
        const neurona = document.createElement('span');
        neurona.className = `neurona neurona-${i}`;
        chatbotPensando.appendChild(neurona);
    }

    // Añadir el texto "ChatBot Pensando"
    const textoPensando = document.createElement('div');
    textoPensando.textContent = 'ChatBot Pensando';
    chatbotPensando.appendChild(textoPensando);

    // Añadir el contenedor de la animación al contenido del chatbot
    chatbotContent.appendChild(chatbotPensando);
    chatbotContent.scrollTop = chatbotContent.scrollHeight; // Desplazarse al final

    // Enviar mensaje al servidor con conversationId
    fetch('../../chatbot_proxy.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: userMessage,
            conversationId: conversationId,
            remember_conversation: storageToggle.checked // Enviar estado del checkbox
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Remover animación chatbot-pensando
        chatbotPensando.remove();

        // Establecer el nuevo conversationId en caso de que sea diferente
        if (data.conversationId) {
            conversationId = data.conversationId; // Actualizar conversationId
            if (storageToggle.checked) {
                localStorage.setItem('conversationId', conversationId); // Almacenar en localStorage
            } else {
                sessionStorage.setItem('conversationId', conversationId); // Almacenar en sessionStorage
            }
        }

        // Mostrar respuesta del chatbot lentamente
        typeWriterEffect('bot', data.response);
    })
    .catch(error => {
        console.error('Error:', error);
        chatbotPensando.remove(); // Remover animación si hay error
        displayMessage('bot', 'Hubo un error, por favor intentalo de nuevo.'); // Mensaje de error
    });
}

    function displayMessage(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        messageElement.innerHTML = `<strong>${sender === 'user' ? 'Tú' : 'AkuBot'} 😎:</strong> ${message}`;
        chatbotContent.appendChild(messageElement);
        chatbotContent.scrollTop = chatbotContent.scrollHeight; // Desplazarse al final
    }

    function typeWriterEffect(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        chatbotContent.appendChild(messageElement);

        let index = 0;
        const interval = setInterval(() => {
            if (sender === 'bot') {
                messageElement.innerHTML = `<strong>AkuBot 🤖:</strong> ${DOMPurify.sanitize(marked.parse(message.substring(0, index)))}`;
            } else {
                messageElement.innerHTML = `<strong>Tú:</strong> ${message.substring(0, index)}`;
            }
            chatbotContent.scrollTop = chatbotContent.scrollHeight; // Desplazarse al final
            if (index++ === message.length) {
                clearInterval(interval);
            }
        }, 60); // Ajusta la velocidad del efecto de escritura aquí
    }
});

/**************************************************
 * Script para cambiar el tema de oscuro a claro  *
 **************************************************/
/**************************************************
 * Script para cambiar el tema del chatbot        *
 **************************************************/
function alternarTemaChatsBotsES() {
    const chatbot = document.querySelector('.chatbot-container'); // Asegúrate de usar la clase correcta del chatbot
    if (chatbot) {
        chatbot.classList.toggle('tema-claro-chatsbotses');
        const theme = chatbot.classList.contains('tema-claro-chatsbotses') ? 'light' : 'dark';
        localStorage.setItem('chatbot-theme', theme);
    }
}

/*************************************************
 * Script de las opciones del header del chatbot *
 *************************************************/
// cargar la configuración y mostrar/ocultar la casilla para que el chatbot recuerde la conversación
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('../../chatbot_proxy.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'load_config' })
        });
        const data = await response.json();
        document.getElementById('storage-toggle').checked = data.config.remember_conversation;
        const storageToggleLabel = document.getElementById('storage-toggle-label');
        if (data.config.show_storage_toggle) {
            storageToggleLabel.style.display = 'block';
        } else {
            storageToggleLabel.style.display = 'none';
        }
    } catch (error) {
        console.error('Error cargando la configuración:', error);
    }

    // mostrar y ocultar elementos al hacer clic en el icono de configuración
    const gearIcon = document.querySelector('.gear-icon');
    const elementsToToggle = [
        document.querySelector('.opciones-chatbot-header'),
        document.querySelector('.inferior-header'),
        document.querySelector('.contenido-opciones-chatbot-header'),
        document.querySelector('.contenido-inferior-header')
    ];

    gearIcon.addEventListener('click', () => {
        elementsToToggle.forEach(element => {
            element.classList.toggle('inactive');
        });
    });
});

/*********************************************************************
 * Funcion para mostrar el estado del servicio de la API de Open AI *
 *********************************************************************/
// Función IDÉNTICA a la del panel-de-control.js 
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

// Ejecutar en el DOM donde existe #circulo-info-estado-api
document.addEventListener('DOMContentLoaded', async () => {
    if (!document.getElementById('circulo-info-estado-api')) return; // Si no existe, salir

    const estado = await obtenerEstadoAPI();
    
    const clases = {
        operational: "verde",
        degraded_performance: "amarillo",
        partial_outage: "naranja",
        major_outage: "rojo",
        unknown: "",
        error: ""
    };

    const circulo = document.getElementById('circulo-info-estado-api');
    circulo.className = clases[estado];
});