import UserContext from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import styles from "../../css/searchflight.module.css";

function FlightCard({ flight }: { flight: any }) {
  const navigate = useNavigate();
  const { formatCurrency } = UserContext();

  const calculateTotalPrice = (flights: any) => {
    let totalPrice = 0;
    flights.forEach((flightt: any) => {
      totalPrice += flightt.price;
    });
    return totalPrice;
  };

  const formatDuration = (totalDuration: number): string => {
    const hours = Math.floor(totalDuration / 60);
    const minutes = totalDuration % 60;

    if (minutes == 0) return `${hours}h`;

    return `${hours}h ${minutes}m`;
  };

  const calculateTotalDuration = (flights: any) => {
    let totalDuration = 0;
    flights.forEach((flightt: any) => {
      totalDuration += flightt.duration;
    });
    return formatDuration(totalDuration);
  };

  const totalPrice = calculateTotalPrice(flight.flights);
  const discountedPrice = totalPrice - totalPrice * 0.25;

  return (
    <div
      className={styles.card}
      onClick={() => navigate(`/flights/${flight.id}`)}
    >
      <div className={styles.flightContent}>
        <div className={styles.flightData}>
          <div className={styles.flightSegment}>
            {flight.flights
              .sort((a: any, b: any) => a.departureDate - b.departureDate)
              .map((flightt: any, index: any) => (
                <div key={index}>
                  <p className={styles.pAirline}>{flightt.airline}</p>
                  <div className={styles.time}>
                    <div className={styles.tTimePlace}>
                      <div className={styles.clock}>
                        {flightt.departureDate.split("T")[0]}
                      </div>
                      <div className={styles.clock}>
                        {new Date(flightt.departureDate).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                      <div>
                        <span className={styles.code}>
                          {flightt.departureCode}
                        </span>
                        ,
                        <span className={styles.day}>
                          {" "}
                          {new Date(flightt.departureDate).toLocaleDateString(
                            "en-US",
                            { weekday: "short" }
                          )}
                        </span>
                      </div>
                    </div>
                    <div className={styles.dot}>.</div>
                    <div className={styles.dot}>.</div>
                    <div className={styles.dot}>.</div>
                    <div className={styles.tTimePlace}>
                      <div className={styles.clock}>
                        {flightt.arrivalDate.split("T")[0]}
                      </div>
                      <div className={styles.clock}>
                        {new Date(flightt.arrivalDate).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                      <div>
                        <span className={styles.code}>
                          {flightt.arrivalCode}
                        </span>
                        ,
                        <span className={styles.day}>
                          {" "}
                          {new Date(flightt.arrivalDate).toLocaleDateString(
                            "en-US",
                            { weekday: "short" }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className={styles.flightInfo}>
            <p>
              Duration: {calculateTotalDuration(flight.flights)},{" "}
              {flight.transit == 1
                ? "Non-stop"
                : flight.transit == 2
                ? "1 Transit"
                : "1+ Transits"}
            </p>
          </div>
        </div>
        <div className={styles.flightPrice}>
          <div className={styles.flightPrices}>
            <span style={{ textDecoration: "line-through" }}>
              {formatCurrency(discountedPrice.toString())}
            </span>
            <p>{formatCurrency(totalPrice.toString())}</p>
          </div>
          <div className={styles.selectDivBtn}>
            <div className={styles.selectBtn}>Select Room</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlightCard;
