'use client';
import { useRef, useState, useEffect, MouseEvent as ReactMouseEvent, FC } from 'react';
import styles from '../../styles/Home.module.css';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';

interface PageProps {}

const Page: FC<PageProps> = ({}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const promptRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string>('/blank.png');
  const [lineWidth, setLineWidth] = useState<number>(5);
  const [strokeStyle, setStrokeStyle] = useState<string>('#000000');
  const [history, setHistory] = useState<ImageData[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // キャンバスのサイズを固定
    const canvasWidth = 512;
    const canvasHeight = 512;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    let painting = false;

    const startPainting = (e: MouseEvent) => {
      painting = true;
      draw(e);
    };

    const stopPainting = () => {
      if (painting) {
        saveHistory();
      }
      painting = false;
      context.beginPath();
      const currentPrompt = promptRef.current?.value || '';
      sendDataToServer(currentPrompt);
    };

    const draw = (e: MouseEvent) => {
      if (!painting) return;
      const rect = canvas.getBoundingClientRect();
      context.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      context.stroke();
      context.beginPath();
      context.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const saveHistory = () => {
      if (!context || !canvas) return;
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      setHistory((prevHistory) => [...prevHistory, imageData]);
    };

    canvas.addEventListener('mousedown', startPainting);
    canvas.addEventListener('mouseup', stopPainting);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseleave', stopPainting);

    return () => {
      canvas.removeEventListener('mousedown', startPainting);
      canvas.removeEventListener('mouseup', stopPainting);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseleave', stopPainting);
    };
  }, [sendDataToServer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.lineWidth = lineWidth;
  }, [lineWidth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.strokeStyle = strokeStyle;
  }, [strokeStyle]);

  const handleLineWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLineWidth(Number(e.target.value));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStrokeStyle(e.target.value);
  };

  const sendDataToServer = async (currentPrompt: string) => {
    if (!canvasRef.current || !apiUrl) return;

    const imageData = canvasRef.current.toDataURL('image/png');
    const canvas = canvasRef.current;
    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error('Failed to create Blob from canvas.');
        return;
      }

      const formData = new FormData();
      formData.append('file', blob, 'image.png');
      formData.append('prompt', currentPrompt);

      try {
        const response = await axios.post(apiUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(response.data.image);
        setImageSrc(`data:image/png;base64,${response.data.image}`);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    });
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    newHistory.pop();
    setHistory(newHistory);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (newHistory.length > 0) {
      context.putImageData(newHistory[newHistory.length - 1], 0, 0);
    } else {
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          <svg width="40" height="40" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
            <rect x="5" y="5" width="40" height="40" rx="5" ry="5" fill="#333" />
            <text x="10" y="38" font-family="Roboto" font-size="32" fill="#FFF">AI</text>
          </svg>
          <h1>Painting App</h1>
        </Link>
      </header>
      <div className={styles.content}>
        <div className={styles.promptContainer}>
          <input
            ref={promptRef}
            type="text"
            className={styles.promptInput}
            placeholder="Enter your prompt"
          />
        </div>
        <div className={styles.canvasImageContainer}>
          <div className={styles.canvasContainer}>
            <div className={styles.controls}>
              <label>
                Line Width:
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={lineWidth}
                  onChange={handleLineWidthChange}
                  className={styles.rangeInput}
                />
              </label>
              <label>
                Color:
                <input
                  type="color"
                  value={strokeStyle}
                  onChange={handleColorChange}
                  className={styles.colorInput}
                />
              </label>
              <button onClick={clearCanvas} className={styles.button}>Clear</button>
              <button onClick={handleUndo} className={styles.button}>Redo</button>
            </div>
            <canvas ref={canvasRef} className={styles.canvas}></canvas>
          </div>
          <Image src={imageSrc} className={styles.image} alt="Loaded" width={512} height={512} />
        </div>
      </div>
      <footer className={styles.footer}>
        <p>&copy; 2024 Painting App</p>
      </footer>
    </div>
  );
};

export default Page;

