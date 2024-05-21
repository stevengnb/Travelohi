import styles from "../../css/admin.module.css";

export default function Sidebar({ setIdx }: { setIdx: any }) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.menu} onClick={() => setIdx(0)}>
        <p>Manage Promos</p>
      </div>
      <div className={styles.menu} onClick={() => setIdx(1)}>
        <p>Manage Hotel</p>
      </div>
      <div className={styles.menu} onClick={() => setIdx(2)}>
        <p>Manage Airline</p>
      </div>
      <div className={styles.menu} onClick={() => setIdx(3)}>
        <p>Manage User</p>
      </div>
      <div className={styles.menu} onClick={() => setIdx(4)}>
        <p>Send Newsletter</p>
      </div>
    </div>
  );
}
