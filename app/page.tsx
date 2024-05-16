import Link from 'next/link';
import styles from '../styles/Home.module.css';
import 'tailwindcss/tailwind.css';
const items = [
  { id: 1, title: 'Item 1', content: 'Content 1' },
  { id: 2, title: 'Item 2', content: 'Content 2' },
  { id: 3, title: 'Item 3', content: 'Content 3' },
  { id: 3, title: 'Item 3', content: 'Content 3' },
  { id: 3, title: 'Item 3', content: 'Content 3' },
  { id: 3, title: 'Item 3', content: 'Content 3' },
  { id: 3, title: 'Item 3', content: 'Content 3' },
  { id: 3, title: 'Item 3', content: 'Content 3' },
  // Add more items as needed
];
const Home = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Welcome to the Painting App</h1>
      </header>
      <div className={styles.content}>
             <h1 className={styles.h1}>This is the home page of the Painting App.</h1>
	      <Link href="/app" className={styles.link}>
	      Go to the Painting App
	      </Link>
      <main className={styles.main}>
	    <div className="container mx-auto p-4">
	      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
		{items.map((item) => (
		  <div
		    key={item.id}
className="w-[320px] h-[320px] mb-4 p-4 bg-white rounded shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
		  >
		    <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
		    <p>{item.content}</p>
		  </div>
		))}
	      </div>
	    </div>
      </main>
      </div>
      <footer className={styles.footer}>
        <p>&copy; 2024 Painting App</p>
      </footer>
    </div>
  );
};

export default Home;
