'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from '../../../styles/Home.module.css';
import Header from '../../components/Header';
import ImageComparisonSlider from '../../components/ImageComparisonSlider';

export default function ItemPage() {
  const [images, setImages] = useState<[string, string]>(['', '']);
  const router = useRouter();
  const params = useParams();
  const [item, setItem] = useState(null);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [medias, setMedias] = useState(['']);
  const [type, setType] = useState(1);
  const [publish, setPublish] = useState(1);
  const [status, setStatus] = useState('');
    // Add type guard
  if (!params || typeof params.id !== 'string') {
    return <div>Error: Invalid item ID</div>;
  }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const { id } = params;

  useEffect(() => {
    if (id) {
      fetch(`/api/items/${id}`)
        .then((response) => response.json())
        .then((data) => {
          setItem(data);
          setTitle(data.title);
          setPrompt(data.prompt);
          setMedias(data.medias);
          setType(data.type);
          setPublish(data.publish);
          setStatus(data.status);
	  if (data.medias && data.medias.length >= 2) {
		  setImages([data.medias[0], data.medias[1]]);
	  }
        });
    }
  }, [id]);

  const handleUpdate = async (e:any) => {
    e.preventDefault();

    const res = await fetch(`/api/items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        prompt,
        medias,
        type,
        publish,
        status,
      }),
    });

    if (res.ok) {
      const updatedItem = await res.json();
      setItem(updatedItem);
    } else {
      console.error('Failed to update item');
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/items/${id}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      router.push('/');
    } else {
      console.error('Failed to delete item');
    }
  };

  if (!item) {
    return <p>Loading...</p>;
  }

  return (
    <div className={styles.container}>
      <Header  onOpenModal={openModal}/>
      <div className={styles.content}>
	      <h1>Edit Item</h1>
	       <ImageComparisonSlider images={images} />
	      <form onSubmit={handleUpdate}>
		<input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
		<input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Prompt" required />
		<input type="text" value={medias[0]} onChange={(e) => setMedias([e.target.value])} placeholder="Media" required />
		<input type="number" value={type} onChange={(e) => setType(parseInt(e.target.value))} placeholder="Type" required />
		<input type="number" value={publish} onChange={(e) => setPublish(parseInt(e.target.value))} placeholder="Publish" required />
		<input type="text" value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Status" required />
		<button type="submit">Update Item</button>
	      </form>
	      <button onClick={handleDelete}>Delete Item</button>
      </div>
      <footer className={styles.footer}>
        <p>&copy; 2024 Painting App</p>
      </footer>
    </div>
  );
}
