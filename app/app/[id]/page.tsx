'use client'
import { useRef, useState, useEffect, useCallback, FC } from 'react';
import styles from '../../../styles/Home.module.css';
import axios from 'axios';
import NextImage from 'next/image';
import Header from '../components/Header';
import Controls from '../components/Controls';

interface PageProps {
  params: {
    id: string;
  };
}

const Page: FC<PageProps> = ({ params }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string>('/images/blank.png');
  const [lineWidth, setLineWidth] = useState<number>(5);
  const [strokeStyle, setStrokeStyle] = useState<string>('#000000');
  const [history, setHistory] = useState<ImageData[]>([]);
  const items = [
    { id: 1, title: 'Item 1', content: 'a girl open mouth', image1: '/images/image1.png', image2: '/images/image2.png' },
    { id: 2, title: 'Item 2', content: 'robot', image1: '/images/image3.png', image2: '/images/image4.png' },
    { id: 3, title: 'Item 3', content: 'A man widh hat and blue skin , Style - Lieutenant Bluberry, standing on his beautiful horse, arizona landscape, Jean Giraud Moebius cartoonist style', image1: '/images/image5.png', image2: '/images/image6.png' },
    { id: 4, title: 'Item 4', content: 'Ink splash waterpaint', image1: '/images/image7.png', image2: '/images/image8.png' },
    { id: 5, title: 'Item 5', content: 'dragon', image1: '/images/blank.png', image2:  '/images/blank.png' },
    { id: 6, title: 'Item 6', content: 'dragon', image1: '/images/blank.png', image2:  '/images/blank.png' },
    { id: 7, title: 'Item 7', content: 'dragon', image1: '/images/blank.png', image2:  '/images/blank.png' },
    { id: 8, title: 'Item 8', content: 'dragon', image1: '/images/blank.png', image2:  '/images/blank.png' },
  ];

  const [loading, setLoading] = useState(true);
  const imgService = {
    run: (src: string,prompt: string) => {
            if (!prompt || prompt === 'dragon') return;
           
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
	   if ( src ) {
		 const img = new Image;
		  img.onload = () => {
		    context.drawImage(img, 0, 0, canvas.width, canvas.height);
		 }
		  img.src = src;
	     setTimeout(() => { 
                    console.log("one");
	            sendDataToServer(prompt)
		    setLoading(false);
	      }, 1);
	    } 
    },
  };


  const apiUrl = process.env.NEXT_PUBLIC_API_URL as string;
  const id = params.id
  const selectedItem = id ? items.find(item => item.id.toString() === id) : null;
  const sendDataToServer = useCallback(async (currentPrompt: string) => {
    if (!canvasRef.current || !apiUrl) return;

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
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    if (!loading) return;
    if (!inputRef.current) return
    if (!selectedItem) return
    const currentPrompt = inputRef.current.value;
    const image2 = selectedItem ? selectedItem.image2 : '/images/blank.png';
    imgService.run(image2,currentPrompt);
  }, [loading,imgService,selectedItem]);


  useEffect(() => {
    if (!loading) return;
    if (!inputRef.current) return;
    if (!selectedItem) return;
    inputRef.current.value = selectedItem.content;
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
      const currentPrompt = inputRef.current?.value || 'dragon';
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
        e.preventDefault(); // スクロールを防止
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
  }, [sendDataToServer,selectedItem]);

  useEffect(() => {
    if (!loading) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    context.lineWidth = lineWidth;
  }, [lineWidth]);

  useEffect(() => {
    if (!loading) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    context.strokeStyle = strokeStyle;
  }, [strokeStyle]);

  const handleLineWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!loading) return;
    setLineWidth(Number(e.target.value));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!loading) return;
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
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setHistory([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();  // ネイティブのImageオブジェクトを使用
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

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
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
      </div>
      <footer className={styles.footer}>
        <p>&copy; 2024 Painting App</p>
      </footer>
    </div>
  );
};

export default Page;
