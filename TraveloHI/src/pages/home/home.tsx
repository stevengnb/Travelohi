import styles from "../../css/home.module.css";
import Navbar from "../../components/Navbar";
import { FaHotel } from "react-icons/fa";
import { IoIosAirplane } from "react-icons/io";
import UserContext from "../../context/UserContext";
import bg from "/background-home2.jpg";
import { useEffect, useState } from "react";
import HotelSearch from "./HotelSearch";
import FlightSearch from "./FlightSearch";
import { IPromo } from "../../interface/promo";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import Footer from "../../components/Footer";
import HotelHomeCard from "./HotelHomeCard";

function Home() {
  const { user } = UserContext();
  const [allPromos, setAllPromos] = useState<IPromo[]>([]);
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState([] as any[]);
  const [index, setIndex] = useState(0);
  const contents = [<HotelSearch />, <FlightSearch />];
  const sidebarButtons = [
    {
      index: 0,
      icon: <FaHotel className={styles.icon} />,
      text: "Hotel",
    },
    {
      index: 1,
      icon: <IoIosAirplane className={styles.icon} />,
      text: "Flight",
    },
  ];

  const handleNextSlide = () => {
    const carousel = document.getElementById(
      "carouselId"
    ) as HTMLElement | null;
    const img = carousel?.querySelectorAll(".imageSlide");
    let totalWidth = 0;

    console.log(carousel);
    console.log(img);
    if (img) {
      img.forEach((image: any) => {
        totalWidth += image.clientWidth + 14;
      });
    }

    if (carousel) {
      console.log("mask ke next");
      carousel.scrollLeft += carousel.clientWidth;
    }
  };

  const handlePrevSlide = () => {
    const carousel = document.getElementById(
      "carouselId"
    ) as HTMLElement | null;
    const img = carousel?.querySelectorAll(".imageSlide");
    let totalWidth = 0;

    if (img) {
      img.forEach((image: any) => {
        totalWidth += image.clientWidth + 14;
      });
    }

    if (carousel) {
      carousel.scrollLeft -= carousel.clientWidth;
    }
  };

  useEffect(() => {
    fetchAllPromos();
    fetchHotelRecommendations();
  }, []);

  async function fetchHotelRecommendations() {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/hotelRecommendations",
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
        setHotels(result.hotels);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllPromos() {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/getPromos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const result = await response.json();
      if (response.ok) {
        setAllPromos(result.promos);
      } else {
        console.log("unauthorized");
      }
    } catch (error) {
      console.log("unauthorized");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className={styles.homeBody}>
        <div className={styles.imageHome}>
          <div className={styles.top}>
            <div className={styles.card}>
              <div className={styles.sidebar}>
                <div className={styles.btnDiv}>
                  {sidebarButtons.map((button) => (
                    <div
                      key={button.index}
                      className={`${styles.sidebarBtn} ${
                        index === button.index ? styles.selected : ""
                      }`}
                      onClick={() => setIndex(button.index)}
                    >
                      {button.icon}
                      <p className={styles.sidebarText}>{button.text}</p>
                    </div>
                  ))}
                </div>
              </div>
              {contents[index]}
            </div>
          </div>
          <img src={bg} className={styles.bg} alt="background" />
        </div>
        <div className={styles.backdrop}></div>
        <div className={styles.contentHome}>
          <div className={styles.sliderTitle}>
            <div className={styles.sliderImgC}>
              <img className={styles.sliderImg} src="./sliderlogo.png" />
            </div>
            <h2>Best deals for a price-less travel!</h2>
          </div>
          <div className={styles.slider}>
            <div className={styles.leftClick}>
              <FaAngleLeft
                className={styles.sliderIcon}
                onClick={handlePrevSlide}
              />
            </div>
            <div className={styles.wrapper} onClick={handlePrevSlide}>
              <div className={styles.carousel} id="carouselId">
                {allPromos.map((promo, index) => (
                  <img
                    key={index}
                    className={styles.imageSlide}
                    src={promo.image}
                    alt=""
                  />
                ))}
              </div>
            </div>
            <div className={styles.rightClick} onClick={handleNextSlide}>
              <FaAngleRight className={styles.sliderIcon} />
            </div>
          </div>
          <div className={styles.whyTitle}>
            <h2>Why book with TraveloHI?</h2>
          </div>
          <div>
            <div className={styles.whyContent}>
              <div className={styles.wc}>
                <div className={styles.wcImage}>
                  <img src="./wc1.png" />
                </div>
                <div className={styles.wcDesc}>
                  <p className={styles.wcP}>One place for all your needs</p>
                  <p className={styles.wcP}>
                    From flights, stays, to sights, just count on our complete
                    products and Travel Guides.
                  </p>
                </div>
              </div>
              <div className={styles.wc}>
                <div className={styles.wcImage}>
                  <img src="./wc2.png" />
                </div>
                <div className={styles.wcDesc}>
                  <p className={styles.wcP}>Flexible booking options</p>
                  <p className={styles.wcP}>
                    Sudden change of plan? No worries! Reschedule or Refund
                    without hassle.
                  </p>
                </div>
              </div>
              <div className={styles.wc}>
                <div className={styles.wcImage}>
                  <img src="./wc3.png" />
                </div>
                <div className={styles.wcDesc}>
                  <p className={styles.wcP}>Secure & convenient payment</p>
                  <p className={styles.wcP}>
                    Enjoy many secure ways to pay, in the currency that's most
                    convenient for you.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.recommendationsTitle}>
            <h2>Hotel Recommendations</h2>
          </div>
          <div className={styles.hrAll}>
            <div className={styles.hrAll2}>
              {hotels.map((hotel, index) => (
                <HotelHomeCard hotel={hotel} key={index} />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Home;
