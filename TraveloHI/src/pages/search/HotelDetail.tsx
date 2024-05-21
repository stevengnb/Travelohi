import { useEffect, useState } from "react";
import styles from "../../css/hoteldetail.module.css";
import { useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import Navbar from "../../components/Navbar";
import StarRating from "./StarRating";
import { IoLocationSharp } from "react-icons/io5";
import ReviewCard from "./ReviewCard";
import HotelRoomCard from "./HotelRoomCard";
import UserContext from "../../context/UserContext";
import SecuredRoute from "../../settings/SecuredRoutes";

function HotelDetail() {
  const { hotelId } = useParams<{ hotelId: string }>();
  const [loading, setLoading] = useState(false);
  const [isExist, setIsExist] = useState(false);
  const [hotel, setHotel] = useState<any | null>(null);
  const [rooms, setRooms] = useState([] as any[]);
  const [level, setLevel] = useState(0);
  const [half, setHalf] = useState(false);

  const { formatCurrency } = UserContext();

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

    setLevel(level);
    setHalf(half);
  };

  const fetchHotelData = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8000/getHotel?term=${hotelId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const result = await response.json();
      if (response.ok) {
        if (result.hotels == null) {
          setIsExist(false);
        } else {
          setIsExist(true);
          setHotel(result.hotels);
          setRooms(result.rooms);
          countLevel(result.hotels.rating);
        }
      } else {
        console.log("Error: ", result.error);
        setIsExist(false);
      }
    } catch (error) {
      console.log("error");
      setIsExist(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotelData();
  }, []);

  return (
    <SecuredRoute>
      {loading ? (
        <Loading />
      ) : (
        <>
          {isExist ? (
            <>
              <Navbar />
              <div className={styles.hdBody}>
                <div className={styles.inBody}>
                  <div className={styles.hotelInfo}>
                    <div className={styles.infos}>
                      <div className={styles.hiTitle}>{hotel.name}</div>
                      <div className={styles.hiRating}>
                        <div className={styles.hiHotels}>Hotels</div>
                        <StarRating
                          name=""
                          checked={null}
                          onChange={null}
                          level={level}
                          half={half}
                        />
                        <div>{hotel.rating.toFixed(2)}</div>
                      </div>
                      <div className={styles.hiAddress}>
                        <IoLocationSharp />
                        <p>
                          {hotel.address}, {hotel.city}, {hotel.country}
                        </p>
                      </div>
                    </div>
                    <div className={styles.prices}>
                      <div className={styles.price}>
                        <p>Price/room/night starts from</p>
                      </div>
                      <div className={styles.nominal}>
                        <p>{formatCurrency(hotel.price)}</p>
                      </div>
                      <div className={styles.hc2Button}>
                        <div className={styles.selectBtn}>Select Room</div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.hotelImages}>
                    <div className={styles.hiiMain}>
                      <img className={styles.firstImg} src={hotel.images[0]} />
                    </div>
                    <div className={styles.hiiSecond}>
                      {hotel.images
                        .slice(1, 6)
                        .map((img: any, index: number) => (
                          <img
                            key={index}
                            className={styles.secondImg}
                            src={img}
                          />
                        ))}
                      <div className={styles.overlay}>
                        <img
                          className={styles.secondImg}
                          src={hotel.images[hotel.images.length - 1]}
                        />
                        <p className={styles.secondImg}>See all photos</p>
                      </div>
                    </div>
                  </div>
                  <div className={styles.hotelDescription}>
                    <p>About Acommodation</p>
                    <p>{hotel.description}</p>
                  </div>
                  <div className={styles.hotelFacilityReview}>
                    <div className={styles.hotelFacilities}>
                      <p>Main Facilities</p>
                      <div>
                        <ul className={styles.hfAll}>
                          {hotel.facilities.map((f: any, index: any) => (
                            <li key={index} className={styles.hfDetail}>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className={styles.hotelReview}>
                      <p>Rating & Reviews</p>
                      <div className={styles.overallRating}>
                        <div className={styles.eachRating}>
                          Cleanliness (
                          {hotel.ratingDetail.rating_clean.toFixed(2)})
                        </div>
                        <div className={styles.eachRating}>
                          Comfort (
                          {hotel.ratingDetail.rating_comfort.toFixed(2)})
                        </div>
                        <div className={styles.eachRating}>
                          Location (
                          {hotel.ratingDetail.rating_location.toFixed(2)})
                        </div>
                        <div className={styles.eachRating}>
                          Service (
                          {hotel.ratingDetail.rating_service.toFixed(2)})
                        </div>
                      </div>
                      <ReviewCard review={hotel.reviews[0]} />
                    </div>
                  </div>
                  <div className={styles.hotelRooms}>
                    <p>Available Room Types in {hotel.name}</p>
                    <div className={styles.hrAll}>
                      {rooms.map((room: any) => (
                        <HotelRoomCard
                          hotelId={hotelId}
                          room={room}
                          formatToIDR={formatCurrency}
                          key={room.id}
                        />
                      ))}
                    </div>
                  </div>
                  <div className={styles.hotelAllReview}>
                    <p>All Reviews</p>
                    <div className={styles.harGrid}>
                      {hotel.reviews.map((r: any, index: any) => (
                        <ReviewCard review={r} key={index} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Navbar />
              <div className={styles.hdBody}>
                <div className={styles.inBody}>Not Found!</div>
              </div>
            </>
          )}
        </>
      )}
    </SecuredRoute>
  );
}

export default HotelDetail;
