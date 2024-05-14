import Link from 'next/link';
import styles from '../styles/Home.module.css';

const Home = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Welcome to the Painting App</h1>
      </header>
      <main className={styles.main}>
        <p>This is the home page of the Painting App.</p>
        <Link href="/app" className={styles.link}>
          Go to the Painting App
        </Link>
      </main>
      <footer className={styles.footer}>
        <p>&copy; 2024 Painting App</p>
      </footer>
    </div>
  );
};

export default Home;

