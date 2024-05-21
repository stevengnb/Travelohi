import { useState } from "react";
import styles from "../../css/modal.module.css";
import styles1 from "../../css/modalbooknow.module.css";
import styles2 from "../../css/cart.module.css";
import Loading from "../../components/Loading";
import UserContext from "../../context/UserContext";

function ModalBookNow({
  isOpen,
  onClose,
  hotel,
  flight,
  user,
  promoCode,
  percentage,
  totalPrice,
}: {
  isOpen: any;
  onClose: any;
  hotel: any;
  flight: any;
  user: any;
  promoCode: any;
  percentage: any;
  totalPrice: any;
}) {
  if (!isOpen) return null;
  if (!user) return null;
  const { formatCurrency } = UserContext();
  const [loading, setLoading] = useState(false);
  const [isWallet, setIsWallet] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const buyWithWallet = async () => {
    let price = 0;
    const flightTicketIds = flight.flatMap((item: any) =>
      item.flights.map((flightt: any) => flightt.ticket.id)
    );

    const hotelCartIds = hotel.map((item: any) => item.cartId);

    console.log("flight ticket = " + flightTicketIds);
    console.log("hotel ticket = " + hotelCartIds);
    console.log("promocode : ", promoCode.trim() === "");

    if (percentage === 0) {
      price = totalPrice;
    } else {
      price = totalPrice - totalPrice * percentage;
    }

    console.log(price);

    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/bookWithWallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userId: user.id.toString(),
          price: price.toString(),
          promoCode:
            promoCode.trim() === "" ? "" : percentage === 0 ? "" : promoCode,
          flightTicketIds: flightTicketIds.toString(),
          hotelCartIds: hotelCartIds.toString(),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        setErrorMessage(result.error);
      } else {
        setErrorMessage("");
        alert("Payment success!");
        onClose();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

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
            <div className={styles1.outer}>
              <div className={styles1.methods}>
                <div
                  className={isWallet ? styles1.selected : styles1.normal}
                  onClick={() => setIsWallet(true)}
                >
                  HI Wallet
                </div>
                <div
                  className={!isWallet ? styles1.selected : styles1.normal}
                  onClick={() => setIsWallet(false)}
                >
                  Credit Card
                </div>
              </div>
              <div className={styles.contents}>
                {isWallet ? (
                  <div className={styles1.wallet}>
                    <p>Balance: {formatCurrency(user?.hiWallet).toString()}</p>
                    {errorMessage !== "" && (
                      <p className={styles1.errorMsgRegist}>{errorMessage}</p>
                    )}
                    <button
                      className={styles2.bookingBtn}
                      onClick={buyWithWallet}
                    >
                      Buy
                    </button>
                  </div>
                ) : (
                  <div>Credit cart</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default ModalBookNow;
