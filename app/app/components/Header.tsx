import Link from 'next/link';
import styles from '../../../styles/Home.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <svg width="40" height="40" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="40" height="40" rx="5" ry="5" fill="#333" />
          <text x="10" y="38" fontFamily="Roboto" fontSize="32" fill="#FFF">AI</text>
        </svg>
        <h1>Painting App</h1>
      </Link>
    </header>
  );
};

export default Header;

