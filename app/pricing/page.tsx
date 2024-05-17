"use client";

import Link from 'next/link';
import styles from '../../styles/Home.module.css';
import React, { useEffect, useState } from 'react';
import Header from '../app/components/Header';
const Home: React.FC = () => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    setShowAnimation(true);
  }, []);



  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
      </div>
  </div>
</section>
      </div>
      <footer className={styles.footer}>
        <p>&copy; 2024 Painting App</p>
      </footer>
    </div>
  );
};

export default Home;

