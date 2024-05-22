import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import LoadingSpinner from './LoadingSpinner';
import styles from '../../../styles/Home.module.css';
const FileUpload = () => {
  const [files, setFiles] = useState<(File | null)[]>(Array(4).fill(null));
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [selectedCanvasIndex, setSelectedCanvasIndex] = useState<number | null>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const MAX_IMAGES = 4;
  const MAX_WIDTH = 300; // Desired width for each image
  const apiUrl = process.env.NEXT_PUBLIC_API_URL  as string;

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
            const canvas = canvasRefs.current[selectedCanvasIndex];
            if (canvas) {
              const ctx = canvas.getContext('2d');
              if (ctx) {
                const scaleSize = MAX_WIDTH / img.width;
                const imgHeight = img.height * scaleSize;
                canvas.width = MAX_WIDTH;
                canvas.height = imgHeight;
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(); 
     setLoading(true);

    await Promise.all(
      canvasRefs.current.map((canvas, index) => {
        return new Promise<void>((resolve) => {
          if (canvas && files[index]) {
            canvas.toBlob((blob) => {
              if (blob) {
                formData.append('files', new File([blob], `image${index + 1}.jpeg`, { type: 'image/jpeg' }));
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
	    const response = await fetch(apiUrl + '/api/movie', {
		    method: 'POST',
		    body: formData,
	    });

	    if (response.ok) {
		    const result = await response.json();
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

  const handleClearCanvas = () => {
    setFiles(Array(4).fill(null));
    canvasRefs.current.forEach((canvas) => {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    });
  };

  return (
     <div>
	  {loading && <LoadingSpinner />} 
	  {uploadedUrl && (
		  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
		  <video
		  style={{ width: '320px', height: '568px' }}
		  autoPlay
		  muted
		  loop
		  preload="auto"
		  >
		  <source src={uploadedUrl} type="video/mp4" />
		  Your browser does not support the video tag.
			  </video>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div>
          {Array.from({ length: MAX_IMAGES }).map((_, index) => (
            <canvas
              key={index}
	      ref={(el) => {
		      canvasRefs.current[index] = el;
	      }}
              style={{ display: 'inline-block', margin: '20px', border: '1px solid #ccc', cursor: 'pointer' }}
              width={MAX_WIDTH}
              height={200}
              onClick={() => handleCanvasClick(index)}
            ></canvas>
          ))}
        </div>
        <button className={styles.button} type="submit"> {loading ? 'Uploading...' : 'Upload'}</button>
        <button className={styles.button} type="button" onClick={handleClearCanvas}>Clear Canvases</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default FileUpload;

