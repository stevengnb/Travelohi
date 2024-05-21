import styles from "../../css/searchhotel.module.css";
import { IoLocationSharp } from "react-icons/io5";
import StarRating from "./StarRating";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/UserContext";
function HotelCard({ hotel }: { hotel: any }) {
  const navigate = useNavigate();
  const { formatCurrency } = UserContext();

  const renderFacilities = () => {
    const max = 2;
    const facilities = hotel.facilities.slice(0, max);
    const remaining = hotel.facilities.length - max;

    return (
      <>
        {facilities.map((facility: string, index: number) => (
          <div className={styles.facilitiesData} key={index}>
            {facility}
          </div>
        ))}
        {remaining > 0 && (
          <div className={styles.facilitiesData}>+ {remaining}</div>
        )}
      </>
    );
  };

  return (
    <div
      className={styles.card}
      onClick={() => navigate(`/hotels/${hotel.id}`)}
    >
      <div className={styles.hotelPImg}>
        <img className={styles.pImg} src={hotel.images[0]} />
      </div>
      <div className={styles.hotelContent}>
        <div className={styles.hc1Container}>
          <div className={styles.hc1}>
            <div className={styles.hcTitle}>{hotel.name}</div>
            <div className={styles.hcRating}>
              <div className={styles.hcr1}>Hotels</div>
              <div className={styles.hcr2}>{hotel.rating.toFixed(2)}</div>
              <div className={styles.hcr3}>
                <StarRating
                  name=""
                  checked={null}
                  onChange={null}
                  level={hotel.level}
                  half={hotel.half}
                />
              </div>
            </div>
            <div className={styles.hcLocation}>
              <IoLocationSharp />
              <p>
                {hotel.city}, {hotel.country}
              </p>
            </div>
            <div className={styles.hcFacility}>{renderFacilities()}</div>
          </div>
        </div>
        <div className={styles.hc2}>
          <div className={styles.hc2Text}>
            <span style={{ textDecoration: "line-through" }}>
              {formatCurrency(
                hotel.startingPrice + (hotel.startingPrice * 25) / 100
              )}
            </span>
            <p>{formatCurrency(hotel.startingPrice)}</p>
          </div>
          <div className={styles.hc2Button}>
            <div className={styles.selectBtn}>Select Room</div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default HotelCard;
