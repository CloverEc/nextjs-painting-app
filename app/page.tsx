"use client";

import Link from 'next/link';
import styles from '../styles/Home.module.css';
import React, { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
const Home: React.FC = () => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(false);
  }, []);

  const items = [
    { id: 1, title: 'Item 1', content: 'a girl open mouth', image1: '/images/image1.png', image2: '/images/image2.png',tyle: 1 },
    { id: 2, title: 'Item 2', content: 'robot', image1: '/images/image3.png', image2: '/images/image4.png',type: 1 },
    { id: 6, title: 'Item 6', content: 'dragon', image1: '/images/AD_00003.mp4', image2:  '/images/blank.png',type: 2 },
    { id: 3, title: 'Item 3', content: 'A man widh hat and blue skin , Style - Lieutenant Bluberry, standing on his beautiful horse, arizona landscape, Jean Giraud Moebius cartoonist style', image1: '/images/image5.png', image2: '/images/image6.png',type: 1 },
    { id: 4, title: 'Item 4', content: 'Ink splash waterpaint', image1: '/images/image7.png', image2: '/images/image8.png',type: 1 },
    { id: 5, title: 'Item 5', content: 'analog film photo score_9, score_8_up, score_7_up, maximalist style, Realistic, cute, full body, multicolored iridescent dragon_pony_hybrid, unicorn horn, dragon wings, fluffy body, wearing obsidian armor, majestic, dreamy, cloudy, forest, standing of rocky cliff, light ray, vivid colors, vibrant, insane detailed, intricate, <lora:MJ52:0.5>, <lora:add-detail-xl:1>, <lora:xl_more_art-full_v1:0.5>, <lora:detailed_notrigger:0.5>, <lora:d3t41l3dXLP:0.6> . fade', image1: '/images/image9.png', image2:  '/images/image10.png',type: 1 },
    { id: 7, title: 'Item 7', content: 'dragon', image1: '/images/blank.png', image2:  '/images/blank.png',type: 1 },
    { id: 8, title: 'Item 8', content: 'dragon', image1: '/images/blank.png', image2:  '/images/blank.png',type: 1 },
  ];

  const getRandomDelay = () => `${Math.random() * 20}s`;

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Welcome to the Painting App</h1>
      </header>
      <div className={styles.content}>
        <h1 className={styles.h1}>This is the home page of the Painting App.</h1>
        <Link href="/app/new" className={styles.link}>
          Go to the Painting App
        </Link>
        <Link href="/pricing" className={styles.link}>
          Pricing
        </Link>
        <main className={styles.main}>
          <div className="container mx-auto p-4">
            <Masonry
              breakpointCols={breakpointColumnsObj}
              className="my-masonry-grid"
              columnClassName="my-masonry-grid_column"
            >
              {items.map((item) => (
                <div key={item.id} className={`relative mb-4 p-4 rounded shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg overflow-hidden ${item.id === 6 ? 'w-[320px] h-[568px]' : 'w-[320px] h-[320px]'}`}>
                <Link href={`/app/${item.id}`} >
                  {item.id === 6 ? (
                    <video className="absolute inset-1 w-full h-full object-cover" autoPlay muted loop preload="auto" >
                      <source src={item.image1} type="video/mp4" />
                      Your browser does not support the video tag.

                    </video>
                  ) : (
                    <div className="absolute inset-0 w-full h-full">
                      <div
                        className="absolute inset-0 w-full h-full bg-cover bg-center image1-fade"
                        style={{ backgroundImage: `url(${item.image2})`, animationDelay: getRandomDelay() }}
                      ></div>
                      <div
                        className="absolute inset-0 w-full h-full bg-cover bg-center image2-fade"
                        style={{ backgroundImage: `url(${item.image1})`, animationDelay: getRandomDelay() }}
                      ></div>
                    </div>
                  )}
                  <div className="relative z-10 text-white">
                    <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
                    <p>{item.content}</p>
                  </div>
                </Link>
		</div>
              ))}
            </Masonry>
          </div>
        </main>
      </div>
      <footer className={styles.footer}>
        <p>&amp;copy; 2024 Painting App</p>
      </footer>
    </div>
  );
};

export default Home;

