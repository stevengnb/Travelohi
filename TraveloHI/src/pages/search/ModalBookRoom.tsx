import styles from "../../css/modal.module.css";
import styles1 from "../../css/hotelroomcard.module.css";
import { useState } from "react";
import styles2 from "../../css/register.module.css";
import Loading from "../../components/Loading";
import UserContext from "../../context/UserContext";

function ModalBookRoom({
  isOpen,
  onClose,
  roomId,
  hotelId,
}: {
  isOpen: any;
  onClose: any;
  roomId: any;
  hotelId: any;
}) {
  if (!isOpen) return null;
  const { user } = UserContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hotelId: "",
    checkIn: "",
    checkOut: "",
    quantity: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const changeValue = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addToCart = async () => {
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    console.log(formData.quantity + ", type = " + typeof formData.quantity);
    if (!user || !hotelId) return;
    try {
      const response = await fetch("http://localhost:8000/addToCart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          roomId: roomId.toString(),
          userId: user.id.toString(),
          hotelId: hotelId.toString(),
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setErrorMessage("");
        setFormData({ hotelId: "", checkIn: "", checkOut: "", quantity: "" });
        setSuccessMessage("Cart added successfully!");
      } else {
        setErrorMessage(result.error);
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
            <div className={styles.content}>
              <div className={styles.title}>Check-Out & Check-In</div>
              <div className={styles.contentField}>
                <div className={styles.inField}>
                  <span className={styles.fieldT}>Check-In</span>
                  <input
                    type="date"
                    name="checkIn"
                    placeholder="Check-in"
                    className={styles.fields}
                    value={formData.checkIn}
                    onChange={changeValue}
                  />
                </div>
                <div className={styles.inField}>
                  <span className={styles.fieldT}>Check-Out</span>
                  <input
                    type="date"
                    name="checkOut"
                    placeholder="Check-out"
                    className={styles.fields}
                    value={formData.checkOut}
                    onChange={changeValue}
                  />
                </div>
                <div className={styles.inField}>
                  <span className={styles.fieldT}>Quantity</span>
                  <input
                    type="number"
                    name="quantity"
                    placeholder="Quantity"
                    className={styles.fields}
                    value={formData.quantity}
                    onChange={changeValue}
                  />
                </div>
              </div>
              <p className={styles2.errorMsgRegist}>{errorMessage}</p>
              <p className={styles.successMessage}>{successMessage}</p>
              <div className={styles1.cartOrBuy}>
                <div className={styles1.selectBtn} onClick={addToCart}>
                  Add To Cart
                </div>
                <div className={styles1.selectBtn}>Book Now</div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default ModalBookRoom;
