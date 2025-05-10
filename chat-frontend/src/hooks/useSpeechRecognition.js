import { useState, useEffect, useRef } from "react";

const useSpeechRecognition = () => {
  const [listening, setListening] = useState(false);
  const [transcriptBuffer, setTranscriptBuffer] = useState("");
  const recognitionRef = useRef(null);

  // Configuración inicial de SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (const result of event.results) {
          if (result.isFinal) {
            finalTranscript += result[0].transcript.trim() + " ";
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscriptBuffer(finalTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.error("Error en SpeechRecognition:", event.error);
      };

      recognition.onend = () => {
        if (listening) {
          recognition.start();
        }
      };

      recognitionRef.current = recognition;
    } else {
      console.error("SpeechRecognition no está soportado en este navegador.");
    }
  }, [listening]);

  // Función para iniciar el reconocimiento de voz
  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setListening(true);
      setTranscriptBuffer("");
    }
  };

  // Función para detener el reconocimiento de voz
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  return {
    listening,
    transcriptBuffer,
    startListening,
    stopListening,
  };
};

export default useSpeechRecognition;