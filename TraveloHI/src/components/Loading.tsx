import { FaSpinner } from 'react-icons/fa';
import styles from '../css/loading.module.css';

const Loading = () => {
  return (
    <div className={styles.loadingContainer}>
      <FaSpinner className={styles.spinnerIcon} />
    </div>
  );
};

export default Loading;
