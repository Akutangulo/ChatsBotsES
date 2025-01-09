// chatbot.js
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
    loadConfiguration();

    // Determinar el tipo de almacenamiento al cargar
    let conversationId;
    if (storageToggle.checked) {
        conversationId = localStorage.getItem('conversationId') || generateConversationId();
        localStorage.setItem('conversationId', conversationId);
    } else {
        conversationId = sessionStorage.getItem('conversationId') || generateConversationId();
        sessionStorage.setItem('conversationId', conversationId);
    }

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
    });

    // Cerrar el chatbot
    closeChatButton.addEventListener('click', function () {
        chatbotContainer.style.display = 'none';
        chatbotOverlay.style.display = 'none';
        chatbotBubble.style.display = 'flex';
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
        if (userMessage === '') return;

        // Mostrar mensaje del usuario
        displayMessage('user', userMessage);
        chatbotInput.value = '';
        chatbotInput.style.height = 'auto';

        // Mostrar spinner chatbot-pensando mientras se espera la respuesta
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        chatbotContent.appendChild(spinner);
        chatbotContent.scrollTop = chatbotContent.scrollHeight;

        // Enviar mensaje al servidor con conversationId y remember_conversation
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
            // Remover spinner chatbot-pensando
            spinner.remove();
            // Mostrar respuesta del chatbot lentamente
            typeWriterEffect('bot', data.response);
        })
        .catch(error => {
            console.error('Error:', error);
            spinner.remove();
            displayMessage('bot', 'Hubo un error, por favor intentalo de nuevo.');
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