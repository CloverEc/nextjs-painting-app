'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo, FC } from 'react';
import axios from 'axios';
import NextImage from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter, redirect } from 'next/navigation';
import styles from '../../../styles/Home.module.css';
import Controls from '../components/Controls';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { IItem } from '../../../models/Item';
import { base64ToBlob } from '../../../utils/base64ToBlob';

interface ItemListProps {
  item: IItem;
  images: [string, string];
  loading: boolean;
  setLoading: (isLoading: boolean) => void;
}

const Canvas: FC<ItemListProps> = ({ item, images, loading, setLoading }) => {
  const { data: session, status } = useSession();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasRunRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string>('/images/blank.png');
  const [lineWidth, setLineWidth] = useState<number>(5);
  const [strokeStyle, setStrokeStyle] = useState<string>('#000000');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [loading2, setLoading2] = useState<boolean>(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL + '/api/upload';
  const [uploadUrls, setUploadUrls] = useState<{ nextImageUrl?: string; canvasImageUrl?: string }>({});

  const imgService = useMemo(() => ({
    run: (src: string, prompt: string) => {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return;

        const canvasWidth = 512;
        const canvasHeight = 512;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.clearRect(0, 0, canvas.width, canvas.height);
        const img = new Image();
        img.onload = () => {
          context.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = src;
        hasRunRef.current = true;
      }, 0);
    },
  }), []);

  useEffect(() => {
    if (!session?.user) {
      redirect('/login');
    } else {
      const currentPrompt = item.prompt;
      const image2 = images ? images[1] : '/images/blank.png';
      setImageSrc(images[0]);
      imgService.run(image2, currentPrompt);
    }
  }, [images, item.prompt, session?.user, imgService]);

  const sendDataToServer = useCallback(async (currentPrompt: string) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL('image/png');
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
        setImageSrc(`data:image/png;base64,${response.data.image}`);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    });
  }, [apiUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);

        const currentPrompt = inputRef.current?.value || '';
        sendDataToServer(currentPrompt);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = 'downloaded-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (hasRunRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    if (!inputRef.current) return;
    if (!item) return;
    inputRef.current.value = item.prompt;

    const currentPrompt = inputRef.current.value;
    const image2 = images ? images[1] : '/images/blank.png';
  }, [item, images]);

  useEffect(() => {
    if (!inputRef.current) return;
    if (!item) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    let painting = false;

    const startPainting = (e: MouseEvent | TouchEvent) => {
      painting = true;
      context.beginPath();
      draw(e);
    };

    const stopPainting = () => {
      if (painting) {
        saveHistory();
      }
      painting = false;
      context.beginPath();
      const currentPrompt = inputRef.current?.value || '';
      sendDataToServer(currentPrompt);
    };

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!painting) return;
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if (e instanceof TouchEvent) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        e.preventDefault();
      } else {
        return;
      }
      context.lineTo(clientX - rect.left, clientY - rect.top);
      context.stroke();
      context.beginPath();
      context.moveTo(clientX - rect.left, clientY - rect.top);
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
    canvas.addEventListener('touchstart', startPainting, { passive: false });
    canvas.addEventListener('touchend', stopPainting);
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchcancel', stopPainting);

    return () => {
      canvas.removeEventListener('mousedown', startPainting);
      canvas.removeEventListener('mouseup', stopPainting);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseleave', stopPainting);
      canvas.removeEventListener('touchstart', startPainting);
      canvas.removeEventListener('touchend', stopPainting);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchcancel', stopPainting);
    };
  }, [item, sendDataToServer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    context.lineWidth = lineWidth;
  }, [lineWidth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    context.strokeStyle = strokeStyle;
  }, [strokeStyle]);

  const handleLineWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLineWidth(Number(e.target.value));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStrokeStyle(e.target.value);
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
    setLoading2(true);
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
  };

  const createNew = async () => {
    setLoading(true);
    if (!imageSrc || !canvasRef.current) return;

    const nextImageBlob = base64ToBlob(imageSrc, 'image/png');
    const nextImageFile = new File([nextImageBlob], 'nextImage.png', { type: 'image/png' });
    const currentPrompt = inputRef.current?.value || '';

    canvasRef.current.toBlob(async (canvasBlob) => {
      if (!canvasBlob) return;
      if (!session?.user) return;
      const formData = new FormData();
      formData.append('nextImage', nextImageFile);
      formData.append('canvasImage', canvasBlob, 'canvas-image.png');
      formData.append('title', item.title);
      formData.append('prompt', currentPrompt);
      formData.append('userId', session.user.id);
      formData.append('type', item.type.toString());
      formData.append('publish', '1');
      formData.append('status', 'active');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setUploadUrls(result);
      setLoading2(false);
    }, 'image/png');
  };

  return (
    <>
      {loading2 && <LoadingSpinner />}
      {uploadUrls && (
        <>
          <div className={styles.promptContainer}>
            <input
              ref={inputRef}
              type="text"
              className={styles.promptInput}
              placeholder="Enter your prompt"
            />
          </div>
          <div className={styles.canvasImageContainer}>
            <div className={styles.imageContainer}>
              <NextImage src={imageSrc} className={styles.image} alt="Loaded" width={512} height={512} />
              <button onClick={downloadImage} className={styles.button}>Download Image</button>
            </div>
            <div className={styles.canvasContainer}>
              <canvas ref={canvasRef} className={styles.canvas}></canvas>
              <Controls
                lineWidth={lineWidth}
                strokeStyle={strokeStyle}
                handleLineWidthChange={handleLineWidthChange}
                handleColorChange={handleColorChange}
                handleFileChange={handleFileChange}
                fileInputRef={fileInputRef}
                clearCanvas={clearCanvas}
                handleUndo={handleUndo}
              />
            </div>
          </div>
          <div className="grid grid-flow-col">
            <button onClick={createNew} className={styles.button}>Create New</button>
          </div>
        </>
      )}
    </>
  );
};

export default Canvas;

