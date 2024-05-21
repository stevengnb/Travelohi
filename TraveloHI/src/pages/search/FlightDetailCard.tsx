import UserContext from "../../context/UserContext";
import styles from "../../css/searchflight.module.css";
import styles1 from "../../css/flightdetail.module.css";
import { useState } from "react";
import ModalFlightSeat from "./ModalFlightSeat";

function FlightDetailCard({
  flight,
  handleSeatSelect,
  setAllSS,
  allSS,
  idx,
}: {
  flight: any;
  handleSeatSelect: any;
  allSS: any;
  setAllSS: any;
  idx: any;
}) {
  const { formatCurrency } = UserContext();
  // const [selectedSeat, setSelectedSeat] = useState(null);
  const [seatType, setSeatType] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const openPopup = () => {
    if (seatType === "") return;
    setShowPopup(true);
  };

  const handleSelectSeat = (selected: any, index: any) => {
    if (selected.typeName.toLowerCase() !== seatType.toLowerCase()) return;
    handleSeatSelect(selected, index);
  };

  const handleSeatType = (event: any) => {
    setAllSS((prevAllSS: any) => {
      const newAllSS = [...prevAllSS];
      newAllSS[idx] = null;
      return newAllSS;
    });
    setSeatType(event.target.value);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const formatDuration = (totalDuration: number): string => {
    const hours = Math.floor(totalDuration / 60);
    const minutes = totalDuration % 60;

    if (minutes == 0) return `${hours}h`;

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={`${styles.card} ${styles.cardDetail}`}>
      <div className={styles.flightContent}>
        <div className={styles.flightData}>
          <div className={styles.flightSegment}>
            <div className={styles.flightSegments}>
              <p className={styles.pAirline}>
                {flight.airlineName} -- {flight.airplaneType} (
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
                    {new Date(flight.arrivalDate).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
              Departure Date: {flight.departureDate.toString().split("T")[0]}
            </div>
            <div>
              Arrival Date: {flight.arrivalDate.toString().split("T")[0]}
            </div>
          </div>
          <div className={styles1.chooseSeat}>
            <select name="cityId" value={seatType} onChange={handleSeatType}>
              <option value="">Select a type</option>
              <option value="Economy Class">Economy Class</option>
              <option value="Business Class">Business Class</option>
              <option value="First Class">First Class</option>
            </select>
            <p className={styles1.openSeat} onClick={openPopup}>
              {allSS[idx] === null || allSS[idx] === undefined
                ? "Choose a seat"
                : (allSS[idx] as any)?.code}
            </p>
          </div>
        </div>
        <div className={styles.flightPrice}>
          <div className={styles.flightPrices}>
            <p></p>
            <p></p>
            <p></p>
            <p>{formatCurrency(flight.price.toString())}</p>
          </div>
        </div>
      </div>
      <ModalFlightSeat
        isOpen={showPopup}
        onClose={closePopup}
        seats={flight.seats}
        canChoose={seatType}
        selectedSeat={allSS}
        idx={idx}
        handleSelectSeat={handleSelectSeat}
      />
    </div>
  );
}

export default FlightDetailCard;
