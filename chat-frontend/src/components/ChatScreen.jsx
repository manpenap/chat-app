import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ChatCloseButton from './ChatCloseButton';


const API_URL = 'http://localhost:5000/api';

// Configuración de Speech Recognition con idioma en inglés
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.lang = 'en-US';
  recognition.continuous = true;
  recognition.interimResults = true;
}

const ChatScreen = () => {
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [listening, setListening] = useState(false);
  const [chatLog, setChatLog] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [transcriptBuffer, setTranscriptBuffer] = useState('');
  const lastFinalTranscript = useRef('');

  const audioPlayedRef = useRef(false);
  const welcomeMessageAdded = useRef(false);

   // Cargar conversación previa al iniciar el componente
   useEffect(() => {
    const fetchPreviousConversation = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/chat/last-conversation');
        if (response.data && response.data.conversation) {
          setChatLog(response.data.conversation); // Cargar la conversación previa
        }
      } catch (error) {
        console.error('Error al cargar la conversación previa:', error);
      }
    };

    fetchPreviousConversation();
  }, []);
  
    // Función para agregar mensajes al historial
    const addMessageToChatLog = (message, sender = 'user') => {
      setChatLog((prevLog) => [...prevLog, { sender, message }]);
    };
  
      // Guardar conversación en la base de datos
  const handleSaveConversation = async () => {
    try {
      await axios.post('http://localhost:5000/api/chat/save-conversation', { conversation: chatLog });
      alert('Conversación guardada exitosamente.');
      window.location.href = '/home'; // Redirigir al Home
    } catch (error) {
      console.error('Error al guardar la conversación:', error);
      alert('No se pudo guardar la conversación.');
    }
  };

  // Función para reproducir el texto en audio
  const playText = async (text) => {
    try {
      const response = await axios.post(`${API_URL}/tts`, { text }, { responseType: 'arraybuffer' });
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(response.data);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
    } catch (error) {
      console.error('Error reproduciendo el texto:', error);
    }
  };

  // Función para obtener y reproducir el saludo inicial
  const fetchWelcomeMessage = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/welcome?level=A1`);
      const message = response.data.botMessage;
      setWelcomeMessage(message);

      if (!welcomeMessageAdded.current) {
        setChatLog((prevLog) => [...prevLog, { sender: 'bot', message }]);
        welcomeMessageAdded.current = true;
      }

      if (!audioPlayedRef.current) {
        playText(message);
        audioPlayedRef.current = true;
      }
    } catch (error) {
      console.error('Error obteniendo el saludo inicial:', error);
    }
  };

  useEffect(() => {
    fetchWelcomeMessage();
  }, []);

  // Configuración y manejo de reconocimiento de voz
  const toggleListening = () => {
    if (recognition) {
      if (!listening) {
        recognition.start();
        setListening(true);
        setTranscriptBuffer('');
      } else {
        recognition.stop();
        processTranscript(); // Procesar el buffer inmediatamente después de detener
        setListening(false);
      }
    } else {
      console.log("El reconocimiento de voz no es compatible con este navegador.");
    }
  };

  const processTranscript = () => {
    if (transcriptBuffer) {
      setChatLog((prevLog) => [...prevLog, { sender: 'user', message: transcriptBuffer.trim() }]);
      sendMessageToBot(transcriptBuffer.trim());
      setTranscriptBuffer('');
    }
  };

  useEffect(() => {
    if (recognition) {
      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
  
        for (const result of event.results) {
          if (result.isFinal) {
            finalTranscript = result[0].transcript.trim();
          } else {
            interimTranscript += result[0].transcript;
          }
        }
  
        // Si hay una transcripción intermedia, actualízala sin acumulación repetitiva
        if (interimTranscript) {
          setTranscriptBuffer(interimTranscript.trim());
        }
  
        // Actualizar el buffer con la transcripción final solo si es diferente del último texto procesado
        if (finalTranscript && finalTranscript !== lastFinalTranscript.current) {
          setTranscriptBuffer((prevBuffer) => `${prevBuffer} ${finalTranscript}`.trim());
          lastFinalTranscript.current = finalTranscript; // Almacena el último texto final para evitar repeticiones
        }
      };
  
      recognition.onend = () => {
        processTranscript(); // Procesar cualquier contenido restante en el buffer
        if (listening) {
          recognition.start(); // Reinicia el reconocimiento si el botón sigue activo
        }
      };
    }
  }, [listening]); // Mantener solo 'listening' en las dependencias
  
  

  const sendMessageToBot = async (message) => {
    try {
      const response = await axios.post(`${API_URL}/chat`, { message });
      const botReply = response.data.botMessage;
      setChatLog((prevLog) => [...prevLog, { sender: 'bot', message: botReply }]);
      playText(botReply);
    } catch (error) {
      console.error('Error enviando mensaje al bot:', error);
    }
  };

  return (
<div>
      <h1>Chat Screen</h1>
      <div className="chat-log">
        {chatLog.map((entry, index) => (
          <p key={index} className={entry.sender === 'user' ? 'user-message' : 'bot-message'}>
            <strong>{entry.sender === 'user' ? 'Alumno: ' : 'Bot: '}</strong>{entry.message}
          </p>
        ))}
      </div>

      <ChatCloseButton
        conversationData={chatLog} // Pasar el historial actual al botón de cierre
        onReturnHome={handleSaveConversation} // Guardar y redirigir al Home
      />

      <button onClick={toggleListening}>
        {listening ? 'Detener' : 'Hablar'}
      </button>
    </div>
  );
};

export default ChatScreen;
