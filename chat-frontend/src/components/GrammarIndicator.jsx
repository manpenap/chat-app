import React, { useState, useEffect } from "react";
import axios from "axios";

// Componente modal para mostrar el detalle de la evaluación
const EvaluationModal = ({ evaluation, onClose }) => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    }}
  >
    <div
      
      style={{
        backgroundColor: "gray",
        padding: "20px",
        borderRadius: "8px",
        maxWidth: "400px",
        width: "90%",
        textAlign: "center",
      }}
    >
      <h3>Detalle de la Evaluación</h3>
      <p>{evaluation.explanation}</p>
      <button
        style={{
          marginTop: "15px",
          padding: "8px 16px",
          border: "none",
          borderRadius: "4px",
          backgroundColor: "#007bff",
          color: "#fff",
          cursor: "pointer",
        }}
        onClick={onClose}
      >
        Cerrar
      </button>
    </div>
  </div>
);

const GrammarIndicator = ({ message }) => {
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Función que se llama automáticamente cuando cambia el mensaje del usuario
    const fetchEvaluation = async () => {
      setLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:5000/api/chat/evaluate-grammar",
          { message }
        );
        setEvaluation(response.data);
      } catch (error) {
        console.error("Error evaluando la gramática:", error);
        setEvaluation({
          color: "yellow",
          label: "Good Work",
          explanation:
            "No se pudo obtener la evaluación detallada. Revisa la estructura de la oración.",
        });
      }
      setLoading(false);
    };

    if (message && message.trim() !== "") {
      fetchEvaluation();
    }
  }, [message]);

  // Definimos el indicador a mostrar: si está cargando, mostramos "Evaluating..."
  const indicator = {
    color: loading ? "gray" : evaluation ? evaluation.color : "blue",
    label: loading ? "Evaluating..." : evaluation ? evaluation.label : "Evaluate",
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          bottom: "5px",
          left: "5px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
        }}
        onClick={() => setModalVisible(true)}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: indicator.color,
            marginRight: "5px",
          }}
        ></div>
        <span style={{ fontSize: "0.75rem", color: indicator.color }}>
          {indicator.label}
        </span>
      </div>
      {modalVisible && evaluation && (
        <EvaluationModal
          evaluation={evaluation}
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
};

export default GrammarIndicator;
