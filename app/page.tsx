"use client";

import Link from 'next/link';
import styles from '../styles/Home.module.css';
import Header from './components/Header';
import Modal from './components/Modal';
import Login from './login/page'
import React, { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { IItem } from '../models/Item'

const Home: React.FC = () => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [publishedItems, setPublishedItems] = useState<IItem[]>([]);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);


  useEffect(() => {
    setShowAnimation(false);
  }, []);


  const getRandomDelay = () => `${Math.random() * 20}s`;

  useEffect(() => {
      fetch(`/api/items/`)
        .then((response) => response.json())
        .then((data) => {
	   setPublishedItems(data);
        });
  }, []);

  const breakpointColumnsObj = {
    default: 5,
    1800: 4,
    1100: 3,
    700: 1
  };

  return (
    <div className={styles.container}>
     <Header onOpenModal={openModal} />
      <div className={styles.content}>
        <main className={styles.main}>
          <div className="">
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="my-masonry-grid"
              columnClassName="my-masonry-grid_column"
            >
              {publishedItems.map((item ,index) => (
                <div key={index}  className={`relative mb-4 p-4 rounded shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden ${item.type === 3 ? 'w-[320px] h-[568px]' : 'w-[320px] h-[320px]'}`}>
                <Link href={`/app/${item._id}`} >
                  {item.type === 3 ? (
                    <video className="absolute inset-1 w-full h-full object-cover" autoPlay muted loop preload="auto" >
                      <source src={item.medias[0]} type="video/mp4" />
                      Your browser does not support the video tag.

                    </video>
                  ) : (
                    <div className="absolute inset-0 w-full h-full">
                      <div
                        className="absolute inset-0 w-full h-full bg-cover bg-center image1-fade"
                        style={{ backgroundImage: `url(${item.medias[0]})`, animationDelay: getRandomDelay() }}
                      ></div>
                      <div
                        className="absolute inset-0 w-full h-full bg-cover bg-center image2-fade"
                        style={{ backgroundImage: `url(${item.medias[1]})`, animationDelay: getRandomDelay() }}
                      ></div>
                    </div>
                  )}
                  <div className="relative z-10 text-white">
                    <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
                    <p>{item.prompt}</p>
                  </div>
                </Link>
		</div>
              ))}
            </Masonry>
          </div>
        </main>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} title="My Modal">
	      <Login />
      </Modal>
    </div>
  );
};

export default Home;

