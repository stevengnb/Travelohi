import styles from "../../css/modalseat.module.css";
import { useState } from "react";
import Loading from "../../components/Loading";
import UserContext from "../../context/UserContext";

function ModalFlightSeat({
  isOpen,
  onClose,
  seats,
  canChoose,
  handleSelectSeat,
  selectedSeat,
  idx,
}: {
  isOpen: any;
  onClose: any;
  seats: any;
  canChoose: any;
  handleSelectSeat: any;
  selectedSeat: any;
  idx: any;
}) {
  if (!isOpen) return null;
  const { user } = UserContext();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function renderSeatType(seatType: string) {
    return (
      <div>
        {seatType}
        <div className={styles.gridSeat}>
          {seats.map((item: any, index: any) => {
            if (item.typeName === seatType) {
              const columnIndex = index % 7;
              let renderSeat = false;
              if (
                (seatType === "Economy Class" &&
                  (columnIndex < 3 || (columnIndex >= 4 && columnIndex < 7))) ||
                (seatType === "Business Class" &&
                  (columnIndex < 5 || (columnIndex >= 6 && columnIndex < 7))) ||
                (seatType === "First Class" && columnIndex < 6)
              ) {
                renderSeat = true;
              }
              return renderSeat ? (
                <div
                  className={
                    seatType === canChoose
                      ? item.available
                        ? styles.cant
                        : selectedSeat[idx] !== null &&
                          item.ID === selectedSeat[idx].ID
                        ? styles.seattSelected
                        : styles.seattt
                      : styles.cant
                  }
                  key={index}
                  onClick={() => handleSelectSeat(item, idx)}
                >
                  {item.code}
                </div>
              ) : (
                <div key={index}></div>
              );
            } else {
              return null;
            }
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={styles.overlayy}
        onClick={!loading ? onClose : undefined}
      ></div>
      <div className={styles.popup}>
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className={styles.closeButton} onClick={onClose}>
              Close
            </div>
            <div className={styles.title}>All Seats</div>
            <div className={styles.content}>
              {renderSeatType("Economy Class")}
              {renderSeatType("Business Class")}
              {renderSeatType("First Class")}
              <p className={styles.successMessage}>{successMessage}</p>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default ModalFlightSeat;
