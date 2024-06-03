'use client'
import {  ChangeEvent, FormEvent } from 'react';
import LoadingSpinner from './LoadingSpinner';
import Canvas2 from './Canvas2';
import SelectBox from './SelectBox';
import styles from '../../../styles/Home.module.css';
import React, { useRef, useState, useEffect, FC } from 'react';
import Controls from '../components/Controls';
import axios from 'axios';
import ImageComparisonSlider from '../../components/ImageComparisonSlider';
import { canvasToBase64 } from '../../../utils/canvasToBase64';

const FileUpload3 = () => {
  const [files, setFiles] = useState<(File | null)[]>(Array(4).fill(null));
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const promptRef = useRef<HTMLInputElement>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState<string>('#000000');
  const [selectedCanvasIndex, setSelectedCanvasIndex] = useState<number | null>(null);
  const [canvasBase64, setCanvasBase64] = useState<string | null>(null);
  const [images, setImages] = useState<[string, string]>(['', '']);
  const canvasRefs1 =  useRef<HTMLCanvasElement>(null);
  const canvasRefs2 =  useRef<HTMLCanvasElement>(null); 
  const canvasRefs3 =  useRef<HTMLCanvasElement>(null); 
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvas2Ref = useRef<any>(null);

  const MAX_IMAGES = 2;
  const MAX_WIDTH = 512; // Desired width for each image
  const MAX_HEIGHT = 512; // Desired width for each image
  const apiUrl = process.env.NEXT_PUBLIC_API_URL  as string;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lineWidth, setLineWidth] = useState<number>(5);
  const [strokeStyle, setStrokeStyle] = useState<string>('#000000');
  const [history, setHistory] = useState<ImageData[]>([]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);

      return () => {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, []);

  const handleMouseDown = (e: MouseEvent) => {
    if (canvas2Ref.current) {
      canvas2Ref.current.handleMouseDown(e);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (canvas2Ref.current) {
      canvas2Ref.current.handleMouseMove(e);
    }
  };

  const handleMouseUp = () => {
    if (canvas2Ref.current) {
      canvas2Ref.current.handleMouseUp();
    }
  };

  const handleToolChange = (tool: 'select' | 'circle' | 'rectangle') => {
    if (canvas2Ref.current) {
      canvas2Ref.current.setCurrentTool(tool);
    }
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    if (canvas2Ref.current) {
      canvas2Ref.current.setCurrentColor(color);
    }
  };

  const handleDeleteShape = () => {
    if (canvas2Ref.current) {
      canvas2Ref.current.deleteShape();
    }
  };


  const applyBlur = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    // const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    // Save the current state to history
    // saveHistory();

    // Apply blur filter
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.putImageData(imageData, 0, 0);
    context.filter = 'none';
    const start = +new Date();
    const blur = 3;

    let sum = 0;
    const delta = 5;
    const alpha_left = 1 / (2 * Math.PI * delta * delta);
    const step = blur < 3 ? 1 : 2;

    for (let y = -blur; y <= blur; y += step) {
      for (let x = -blur; x <= blur; x += step) {
        const weight = alpha_left * Math.exp(-(x * x + y * y) / (2 * delta * delta));
        sum += weight;
      }
    }

    for (let y = -blur; y <= blur; y += step) {
      for (let x = -blur; x <= blur; x += step) {
        context.globalAlpha = (alpha_left * Math.exp(-(x * x + y * y) / (2 * delta * delta))) / sum * blur;
        context.drawImage(canvas, x, y);
      }
    }

    context.globalAlpha = 1;
  };

  
  const options = [
       "white strong lighting",
       "natural lighting",
       "sunshine from window",
       "neon light",
       "sunset over sea",
       "golden time",
       "sci-fi RGB glowing"," cyberpunk",
       "warm atmosphere, at home, bedroom",
       "code atmosphere, at home, bedroom",
       "soft studio lighting",
       "neon",
       " Wong Kar-wai"," warm",
       "home atmosphere","cozy bedroom illumination"

  ];
  const [selectedOption, setSelectedOption] = useState<string>(options[0]);
  
   const handleSelect = (option: string) => {
        setSelectedOption(option);
   };
   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
     if (selectedCanvasIndex !== null) {
       const file = e.target.files?.[0] || null;
       const updatedFiles = [...files];
       updatedFiles[selectedCanvasIndex] = file;
       setFiles(updatedFiles);
   
       if (file) {
         const reader = new FileReader();
         reader.onload = (event) => {
           const img = new Image();
           img.onload = () => {
           let canvas;
	   if (selectedCanvasIndex === 0 ){
              canvas = canvasRefs1.current;
	   }else{
              canvas = canvasRefs2.current;
	   }

             if (canvas) {
               const ctx = canvas.getContext('2d');
               if (ctx) {
                 const scaleSize = MAX_WIDTH / img.width;
                 const imgHeight = img.height * scaleSize;
                 canvas.width = MAX_WIDTH;
                 canvas.height = MAX_HEIGHT;
                 ctx.clearRect(0, 0, canvas.width, canvas.height);
                 ctx.drawImage(img, 0, 0, MAX_WIDTH, imgHeight);
               }
             }
           };
           img.src = event.target?.result as string;
         };
         reader.readAsDataURL(file);
       }
     }
   };
   
   const handleSubmit = async () => {
     setUploadedUrl(null)
     setImages(['',''])
     setCanvasBase64(null)
     const formData = new FormData(); 
     setLoading(true);
   
     await Promise.all(
       [canvasRefs1.current,canvasRefs2.current,canvasRef.current].map((canvas, index) => {
         return new Promise<void>((resolve) => {
           if (canvas) {
             canvas.toBlob((blob) => {
               if (blob) {
                 formData.append('files', new File([blob], `image${index + 1}.png`, { type: 'image/png' }));
                 resolve();
               }
             }, 'image/png');
           } else {
             resolve();
           }
         });
       })
     );
     try {
	formData.append('lighting',selectedOption);
	const currentPrompt = promptRef.current ? promptRef.current.value : "";
	formData.append('prompt',currentPrompt);
        const response = await fetch(apiUrl + '/api/product', {
    	    method: 'POST',
    	    body: formData,
        });
   
        if (response.ok) {
    	    const result = await response.json();
	    if (canvasRefs1.current){
		    canvasRefs1.current.toBlob(async (blob) => {
			    if (blob) {
				    const base64 = await canvasToBase64(blob);
				    setImages([result.url, base64]);
			    }
		    });
	    }

	    setUploadedUrl(result.url);
    	    setMessage(`Files uploaded successfully: ${result.url}`);
    	    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
        } else {
    	    setMessage('Failed to upload files');
        }
     } catch (error) {
        setMessage('An error occurred while uploading the file');
        console.error('Upload error:', error);
     }
      setLoading(false);
   }; 
   const handleCanvasClick = (index: number) => {
     setSelectedCanvasIndex(index);
     document.getElementById('fileInput')?.click();
   };

   const fillCanvas = () => {
	   if (canvas2Ref.current) {
		   canvas2Ref.current.fillCanvas();
	   }
   };

  return (
     <div>
	  {loading && <LoadingSpinner />} 
	  {uploadedUrl && (
		  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
		       <ImageComparisonSlider images={images} />
		  </div>
	  )}
       <div className={styles.promptContainer}>
	  <input
	    ref={promptRef}
	    type="text"
	    className={styles.promptInput}
	    placeholder="Enter your prompt"
	  />
	</div>
        <SelectBox options={options} onSelect={handleSelect} />
	<input id="fileInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
	<div style={{ margin: '100px' }}>
	<canvas key={0} ref={canvasRefs1} width={MAX_WIDTH} height={512} onClick={() => handleCanvasClick(0)} ></canvas>
	<canvas key={1} ref={canvasRefs2} width={MAX_WIDTH} height={512} onClick={() => handleCanvasClick(1)} ></canvas>
	<canvas ref={canvasRef} width={512} height={512} style={{ border: '1px solid black' }} />
	<Canvas2 ref={canvas2Ref} canvasRef={canvasRef} />
	<div style={{margin: '100px'}}>
	<button className={styles.button}  onClick={() => handleToolChange('select')}>Select</button>
	<button className={styles.button}  onClick={() => handleToolChange('circle')}>Circle</button>
	<button className={styles.button}  onClick={() => handleToolChange('rectangle')}>Rectangle</button>
	<button  className={styles.button}  onClick={handleDeleteShape}>Delete</button>
	<input className={styles.colorInput} type="color" onChange={(e) => handleColorChange(e.target.value)} />
	</div>
	<button className={styles.button} onClick={() => handleSubmit() }type="submit"> {loading ? 'Uploading...' : 'Upload'}</button>
	<button className={styles.button} onClick={fillCanvas}>Fill</button>
        <button className={styles.button} onClick={() => applyBlur() } type="submit">blur</button>
	</div>
    </div>
  );
};

export default FileUpload3;


