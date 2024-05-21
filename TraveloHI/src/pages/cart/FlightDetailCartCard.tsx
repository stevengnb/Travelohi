import UserContext from "../../context/UserContext";
import styles from "../../css/searchflight.module.css";
import styles1 from "../../css/flightdetail.module.css";
import styles2 from "../../css/cart.module.css";
import { useState } from "react";
import { BsFillLuggageFill } from "react-icons/bs";
import { MdEventSeat } from "react-icons/md";

function FlightDetailCartCard({ flightt }: { flightt: any }) {
  const { formatCurrency } = UserContext();
  const [seatType, setSeatType] = useState("");

  const formatDuration = (totalDuration: number): string => {
    const hours = Math.floor(totalDuration / 60);
    const minutes = totalDuration % 60;

    if (minutes == 0) return `${hours}h`;

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={styles2.allFlightContainer}>
      {flightt.flights.map((flight: any, index: any) => (
        <div key={index} className={`${styles2.card}`}>
          <div className={styles.flightContent}>
            <div className={styles.flightData}>
              <div className={styles.flightSegment}>
                <div className={styles.flightSegments}>
                  <p className={styles.pAirline}>
                    {flight.airline} -- {flight.airplaneType} (
                    {flight.airplaneCode})
                  </p>
                  <p className={styles.airplane}></p>
                  <div className={styles.time}>
                    <div className={styles.tTimePlace}>
                      <div className={styles.clock}>
                        {new Date(flight.departureDate).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                      <div>
                        <span className={styles.code}>
                          {flight.airportDepartureCode}
                        </span>
                        ,
                        <span className={styles.day}>
                          {" "}
                          {new Date(flight.departureDate).toLocaleDateString(
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
                        {new Date(flight.arrivalDate).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                      <div>
                        <span className={styles.code}>
                          {flight.airportArrivalCode}
                        </span>
                        ,
                        <span className={styles.day}>
                          {" "}
                          {new Date(flight.arrivalDate).toLocaleDateString(
                            "en-US",
                            { weekday: "short" }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles1.flightInfo}>
                <div className={styles.datas}>
                  {formatDuration(flight.duration)}
                </div>
                <div className={styles.datas}>
                  Departure Date:{" "}
                  {flight.departureDate.toString().split("T")[0]}
                </div>
                <div>
                  Arrival Date: {flight.arrivalDate.toString().split("T")[0]}
                </div>
              </div>
            </div>
            <div className={styles.flightPrice}>
              <div className={styles.flightPrices}>
                <p></p>
                <p></p>
                <p></p>
                <p>{formatCurrency(flight.price.toString())}</p>
              </div>
              <div className={styles2.ticketData}>
                <div className={styles2.info}>
                  <BsFillLuggageFill className={styles2.icons} />
                  <p>{flight.ticket.luggage + 20} kg</p>
                </div>
                <div className={styles2.info}>
                  <MdEventSeat className={styles2.icons} />
                  <p>{flight.seatCode}</p>
                </div>
                <div className={styles2.info}>
                  <p className={styles.types}> ({flight.seatType})</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FlightDetailCartCard;
