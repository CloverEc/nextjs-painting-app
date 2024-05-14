import Link from 'next/link';
import styles from '../styles/Home.module.css';

const Home = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Welcome to the Painting App</h1>
      </header>
      <div className={styles.content}>
      <main className={styles.main}>
      <h1 className={styles.h1}>This is the home page of the Painting App.</h1>
      <Link href="/app" className={styles.link}>
      Go to the Painting App
      </Link>
      </main>
      </div>
      <footer className={styles.footer}>
        <p>&copy; 2024 Painting App</p>
      </footer>
    </div>
  );
};

export default Home;
