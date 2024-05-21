import { FaStar } from "react-icons/fa";
import { FaRegStarHalfStroke } from "react-icons/fa6";
import styles from "../../css/searchhotel.module.css";

function StarRating({
  name,
  checked,
  onChange,
  level,
  half,
}: {
  name: any;
  checked?: any;
  onChange?: any;
  level: any;
  half?: boolean;
}) {
  const renderStars = () => {
    let i = 0;
    const stars = [];
    for (i = 0; i < level; i++) {
      stars.push(<FaStar key={i} className={styles.starIcon} />);
    }
    if (half) {
      stars.push(
        <FaRegStarHalfStroke key={i} className={styles.starHalfIcon} />
      );
    }
    return stars;
  };

  return checked !== null && onChange !== null ? (
    <div className={styles.starCheck}>
      <input
        type="checkbox"
        name={name}
        className={styles.startCb}
        checked={checked}
        onChange={onChange}
      />
      <div className={styles.stars}>{renderStars()}</div>
    </div>
  ) : (
    <div className={styles.starCheck}>
      <div className={styles.stars2}>{renderStars()}</div>
    </div>
  );
}

export default StarRating;
