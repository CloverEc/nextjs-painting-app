'use client'
import dynamic from 'next/dynamic'
import { useRef, useState, useEffect, useCallback, FC } from 'react';
import styles from '../../../styles/Home.module.css';
import Header from '../../components/Header';
import FileUpload from '../components/FileUpload';
import FileUpload3 from '../components/FileUpload3';
import LoadingSpinner from '../components/LoadingSpinner';
import Canvas from '../components/Canvas';
import { fetchImageToBase64 } from '../../../utils/fetchImageToBase64';
import { IItem } from '../../../models/Item'
interface ItemListProps {
  items: IItem[];
}

interface PageProps {
  params: {
    id: string;
  };
}

const Page: FC<PageProps> = ({ params }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasRunRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string>('/images/blank.png');
  const [lineWidth, setLineWidth] = useState<number>(5);
  const [strokeStyle, setStrokeStyle] = useState<string>('#000000');
  const [history, setHistory] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<[string, string]>(['', '']);
  const [item, setItem] = useState<IItem | null >(null);
  const id = params.id
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleFetchItem = () => {
      setLoading(true)
      fetch(`/api/items/${id}`)
        .then((response) => response.json())
        .then( async (data) => {
          setItem(data);
	  if (data.medias && data.medias.length >= 2) {
		  const image1 = await fetchImageToBase64(data.medias[0]);
		  const image2 = await fetchImageToBase64(data.medias[1]);
		  setImages([image1,image2]);
                  setLoading(false);
	  }
	});
  }

  useEffect(() => {
    if (id) {
       handleFetchItem()
    }
  }, [id]);

  const renderContent = () => {
     switch (item?.type) {
       case 1:
         return (<>
	  {loading && <LoadingSpinner />} 
	  {!loading && <Canvas item={item} images={images} loading={loading} setLoading={setLoading} /> }
	  </>)
       case 2:
         return <FileUpload />;
       case 3:
         return <FileUpload3 />;
       default:
         return <></>;
	       
     }
  };
  return (
    <div className={styles.container}>
      <Header  onOpenModal={openModal}/>
      <div className={styles.content}>{renderContent()}</div>
      <footer className={styles.footer}>
        <p>&copy; 2024 Painting App</p>
      </footer>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Page), {
  ssr: false,
});
