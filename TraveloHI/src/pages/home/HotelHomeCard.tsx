import { useEffect, useState } from "react";
import styles from "../../css/home.module.css";
import styles2 from "../../css/searchhotel.module.css";
import StarRating from "../search/StarRating";
import { IoLocationSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

function HotelHomeCard({ hotel }: { hotel: any }) {
  const navigate = useNavigate();
  const [ratingData, setRatingData] = useState({
    level: 0,
    half: false,
  });

  const countLevel = (rating: number) => {
    let track = rating;
    let level = 0;
    let half = false;

    if (rating < 1) {
      level = 0;
      half = true;
    } else {
      for (let i = 0; i < 5; i++) {
        let rate = (track -= 1);
        if (rate === 0) {
          level = i + 1;
          break;
        } else if (rate < 0) {
          level = i;
          half = true;
          break;
        }
      }
    }

    setRatingData({ level, half });
  };

  useEffect(() => {
    countLevel(hotel.rating);
  }, []);

  return (
    <div
      className={styles.hotelCard}
      onClick={() => navigate(`/hotels/${hotel.id}`)}
    >
      <div className={styles.imagesHc}>
        <img src={hotel.images[0]} />
      </div>
      <div className={styles.hcContent}>
        <div className={styles2.hc1}>
          <div className={styles2.hcTitle}>{hotel.name}</div>
          <div className={styles2.hcRating}>
            <div className={styles2.hcr1}>Hotels</div>
            <div className={styles2.hcr2}>{hotel.rating.toFixed(2)}</div>
            <div className={styles2.hcr3}>
              <StarRating
                name=""
                checked={null}
                onChange={null}
                level={ratingData.level}
                half={ratingData.half}
              />
            </div>
          </div>
          <div className={styles2.hcLocation}>
            <IoLocationSharp />
            <p>
              {hotel.city}, {hotel.country}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotelHomeCard;
