import { useRef, useEffect, useState } from 'react';
import './StrokeInput.css';

const StrokeInput = ({ onStrokeComplete, expectedCharacter }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [strokes]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    strokes.forEach(stroke => {
      if (stroke.length < 2) return;
      
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      
      ctx.stroke();
    });

    if (currentStroke.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
      
      for (let i = 1; i < currentStroke.length; i++) {
        ctx.lineTo(currentStroke[i].x, currentStroke[i].y);
      }
      
      ctx.stroke();
    }
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCoordinates(e);
    setCurrentStroke([coords]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const coords = getCoordinates(e);
    setCurrentStroke(prev => [...prev, coords]);
    redrawCanvas();
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    setIsDrawing(false);
    
    if (currentStroke.length > 0) {
      setStrokes(prev => [...prev, currentStroke]);
    }
    
    setCurrentStroke([]);
  };

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke([]);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const undoStroke = () => {
    if (strokes.length > 0) {
      setStrokes(prev => prev.slice(0, -1));
    }
  };

  const submitDrawing = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    onStrokeComplete(imageData, strokes);
  };

  return (
    <div className="stroke-input-container">
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="stroke-canvas"
        />
        {expectedCharacter && (
          <div className="reference-character">{expectedCharacter}</div>
        )}
      </div>
      <div className="stroke-controls">
        <button onClick={undoStroke} disabled={strokes.length === 0}>
          Undo
        </button>
        <button onClick={clearCanvas}>Clear</button>
        <button onClick={submitDrawing} className="submit-btn" disabled={strokes.length === 0}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default StrokeInput;
