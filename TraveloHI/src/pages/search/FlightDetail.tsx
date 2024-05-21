import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import UserContext from "../../context/UserContext";
import styles from "../../css/flightdetail.module.css";
import styles1 from "../../css/searchflight.module.css";
import styles2 from "../../css/register.module.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import FlightDetailCard from "./FlightDetailCard";
import SecuredRoute from "../../settings/SecuredRoutes";

export default function FlightDetail() {
  const [loading, setLoading] = useState(false);
  const { user } = UserContext();
  const { flightId } = useParams<{ flightId: string }>();
  const { formatCurrency } = UserContext();
  const [flight, setFlight] = useState([] as any[]);
  const [allSS, setAllSS] = useState([] as any[]);
  const [isExist, setIsExist] = useState(false);
  const [luggageIdx, setLuggageIdx] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [luggageList, setLuggageList] = useState([
    {
      luggage: 0,
      price: 0,
    },
    {
      luggage: 10,
      price: 150000,
    },
    {
      luggage: 20,
      price: 415000,
    },
    {
      luggage: 30,
      price: 820000,
    },
  ]);
  const defaultLuggage = 20;
  const appFee = 109750;

  const calculateTotalPrice = (flights: any) => {
    let totalPrice = 0;
    flights.forEach((flightt: any) => {
      totalPrice += flightt.price;
    });
    return totalPrice;
  };

  const handleSeatSelect = (selected: any, idx: any) => {
    if (allSS[idx] === selected) {
      setAllSS((prevAllSS) => {
        const newAllSS = [...prevAllSS];
        newAllSS[idx] = null;
        return newAllSS;
      });
    } else {
      setAllSS((prevAllSS) => {
        const newAllSS = [...prevAllSS];
        newAllSS[idx] = selected;
        return newAllSS;
      });
    }
  };

  const fetchFlightData = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8000/getFlight?term=${flightId}`,
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
        if (result.flight == null) {
          setIsExist(false);
        } else {
          setIsExist(true);
          setFlight(result.flight);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    setLoading(true);
    const seatIds = allSS.map((seat) => String(seat?.ID)).filter(Boolean);
    const flightSegmentIds = flight
      .map((f) => String(f?.flightSegmentID))
      .filter(Boolean);

    if (!flightId || !user) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/addToCartFlight", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...seatIds,
          flightSegmentIds: flightSegmentIds.toString(),
          totalSegment: flight.length.toString(),
          flightId: flightId.toString(),
          luggage: luggageList[luggageIdx].luggage.toString(),
          userId: user.id?.toString(),
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setLuggageIdx(0);
        setErrorMessage("");
        setAllSS([]);
      } else {
        setErrorMessage(result.error);
      }
    } catch (error) {
      // console.log(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlightData();
  }, []);

  // useEffect(() => {
  //   console.log(allSS);
  // }, [allSS]);

  return (
    <SecuredRoute>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Navbar />
          <div className={styles.fdBody}>
            <div className={styles.inBody}>
              <div className={styles.flightDetailCards}>
                <p className={styles1.pAirline}>
                  Your Trip {flight[0]?.airportDepartureCode} -{" "}
                  {flight[flight.length - 1]?.airportArrivalCode}
                </p>
                {isExist &&
                  flight.map((f, index) => (
                    <FlightDetailCard
                      key={index}
                      flight={f}
                      handleSeatSelect={handleSeatSelect}
                      setAllSS={setAllSS}
                      allSS={allSS}
                      idx={index}
                    />
                  ))}
                <div className={styles.result}>
                  <div className={styles.leftSideResult}>
                    <div className={styles.card}>
                      <div className={styles.titleLuggage}>Add Luggage</div>
                      <div className={styles.luggageAdd}>
                        <div className={styles.defaultLuggage}>
                          Total Luggage:{" "}
                          {defaultLuggage + luggageList[luggageIdx].luggage} kg
                        </div>
                        <div className={styles.luggageGrid}>
                          {luggageList.map((item, index) => (
                            <div
                              key={index}
                              className={
                                item === luggageList[luggageIdx]
                                  ? styles.addedSelected
                                  : styles.added
                              }
                              onClick={() => {
                                setLuggageIdx(index);
                              }}
                            >
                              +{item.luggage} kg
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={styles.btns}>
                      <button className={styles.button} onClick={addToCart}>
                        Add To Cart
                      </button>
                      <button className={styles.button}>Buy Now</button>
                    </div>
                    <p className={styles2.errorMsgRegist}>{errorMessage}</p>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.titleLuggage}>Total Price</div>
                    <div className={styles.totalPrice}>
                      <div>Ticket(s)</div>
                      <div>
                        {formatCurrency(calculateTotalPrice(flight).toString())}
                      </div>
                    </div>
                    <div className={styles.totalPrice}>
                      <div>Luggage fee</div>
                      <div>
                        {formatCurrency(
                          luggageList[luggageIdx].price.toString()
                        )}
                      </div>
                    </div>
                    <div className={styles.totalPrice}>
                      <div>Application fee</div>
                      <div>{formatCurrency(appFee.toString())}</div>
                    </div>
                    <div className={styles.totalPrice}>
                      <div>Tax (10%)</div>
                      <div>
                        {formatCurrency(
                          (
                            (calculateTotalPrice(flight) +
                              luggageList[luggageIdx].price +
                              appFee) *
                            0.1
                          ).toString()
                        )}
                      </div>
                    </div>
                    <div className={styles.totalPrice}>
                      <div className={styles.finalPrice}>Total</div>
                      <div className={styles.finalPrice}>
                        {formatCurrency(
                          (
                            (calculateTotalPrice(flight) +
                              luggageList[luggageIdx].price +
                              appFee) *
                              0.1 +
                            (calculateTotalPrice(flight) +
                              appFee +
                              luggageList[luggageIdx].price)
                          ).toString()
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </>
      )}
    </SecuredRoute>
  );
}
