import ClientLogin from './ClientLogin';
import styles from '../../styles/Home.module.css';

export default function Login() {
  return(
	  <div className={styles.content}> 
	  <ClientLogin />
	  </div>
  )
}
