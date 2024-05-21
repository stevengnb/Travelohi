import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import SecuredRoute from "../../settings/SecuredRoutes";
import { FaBed } from "react-icons/fa";
import { IoMdPeople } from "react-icons/io";
import Navbar from "../../components/Navbar";
import styles from "../../css/cart.module.css";
import styles1 from "../../css/register.module.css";
import styles2 from "../../css/profile.module.css";
import styles3 from "../../css/hotelroomcard.module.css";
import Footer from "../../components/Footer";
import UserContext from "../../context/UserContext";
import FlightDetailCartCard from "./FlightDetailCartCard";
import { IoMdTrash } from "react-icons/io";
import debounce from "lodash.debounce";
import ModalBookNow from "./ModalBookNow";

function Cart() {
  const [errorMessages, setErrorMessages] = useState([] as string[]);
  const [promoMessage, setPromoMessage] = useState("");
  const [percentage, setPercentage] = useState(0);
  const [isError, setError] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isExist, setIsExist] = useState(false);
  const [isExistHotel, setIsExistHotel] = useState(false);
const { user, formatCurrency } = UserContext();
  const [flight, setFlight] = useState([] as any[]);
  const [hotel, setHotel] = useState([] as any[]);
  const [formData, setFormData] = useState([] as any[]);
  const appFee = 109750;
  const [showPopup, setShowPopup] = useState(false);

  const openPopup = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setPromoCode("");
    setPercentage(0);
    fetchAllCart();
  };

  const changeValue = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number
  ) => {
    const { name, value } = e.target;

    setFormData((prevState) => {
      const updatedFormData = [...prevState];
      updatedFormData[index] = {
        ...updatedFormData[index],
        [name]: value,
      };
      return updatedFormData;
    });
  };

  const calculatePricePerCart = (flightt: any) => {
    let totalPrice = 0;
    let luggagePrice = 0;
    flightt.flights.forEach((flighttt: any) => {
      totalPrice += flighttt.price;
    });

    if (flightt.flights[0].ticket.luggage == 10) {
      luggagePrice += 150000;
    } else if (flightt.flights[0].ticket.luggage == 20) {
      luggagePrice += 415000;
    } else if (flightt.flights[0].ticket.luggage == 30) {
      luggagePrice += 820000;
    }

    totalPrice += luggagePrice;
    totalPrice += appFee;
    totalPrice += totalPrice * 0.1;
    return totalPrice;
  };

  const calculatePricePerCartHotel = (hotell: any) => {
    let totalPrice = 0;
    const pernights = hotell.pernights;
    const hotelCheckin = new Date(hotell.checkin);
    const hotelCheckout = new Date(hotell.checkout);
    const quantity = hotell.quantity;

    const millisecondsInDay = 1000 * 60 * 60 * 24;
    const differenceInMilliseconds =
      hotelCheckout.getTime() - hotelCheckin.getTime();
    const differenceDays = Math.ceil(
      differenceInMilliseconds / millisecondsInDay
    );

    totalPrice += pernights * differenceDays * quantity;
    totalPrice += totalPrice * 0.1;

    return totalPrice;
  };

  const calculateAllPrice = () => {
    let totalPrice = 0;
    flight.forEach((flightt: any) => {
      totalPrice += calculatePricePerCart(flightt);
    });
    hotel.forEach((hotell: any) => {
      totalPrice += calculatePricePerCartHotel(hotell);
    });

    return totalPrice;
  };

  const fetchAllCart = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8000/getCart?term=${user?.id}`,
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
        if (result.flight === null) {
          setFlight([]);
          setIsExist(false);
        } else {
          setFlight(result.flight);
          setIsExist(true);
        }

        if (result.hotel === null) {
          setHotel([]);
          setIsExistHotel(false);
        } else {
          setHotel(result.hotel);
          setFormData(result.hotel);
          setIsExistHotel(true);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const updateHotel = async (hotell: any, index: number) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/updateCartHotel", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          cartHotelId: String(hotell.cartId),
          checkIn: String(hotell.checkin.split("T")[0]),
          checkOut: String(hotell.checkout.split("T")[0]),
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setErrorMessages([]);
        fetchAllCart();
      } else {
        setErrorMessages((prevErrors) => {
          const updatedErrors = [...prevErrors];
          updatedErrors[index] = result.error;
          return updatedErrors;
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (flightId: any) => {
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8000/removeTicketCart?term=${user?.id}&flight=${flightId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        fetchAllCart();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const removeHotel = async (cartId: any) => {
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8000/removeHotelCart?term=${cartId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      if (response.ok) {
        fetchAllCart();
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPromo = debounce(async () => {
    setPercentage(0);
    setLoading(true);

    if (promoCode.trim() === "" || !user) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/getPromoCode?term=${promoCode}&user=${user.id}`,
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
        setPromoMessage("Promo Applied!");
        setError(false);
        setPercentage(result.message);
      } else {
        setPromoMessage(result.error);
        setPercentage(0);
        setError(true);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, 500);

  const calculatePromoPrice = (totalPrice: number, percentagePromo: number) => {
    console.log(percentagePromo);
    console.log(totalPrice);

    let price = totalPrice;
    price -= price * percentagePromo;

    return price;
  };

  useEffect(() => {
    setError(false);
    setPromoMessage("");
    fetchPromo();

    return () => {
      fetchPromo.cancel();
    };
  }, [promoCode]);

  useEffect(() => {
    fetchAllCart();
  }, [user]);

  return (
    <SecuredRoute>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Navbar />
          <div className={styles.crBody}>
            <div className={styles.inBody}>
              <div className={styles.title}>My Cart</div>
              <div className={styles.cartFlex}>
                <div className={styles.carts}>
                  <div className={styles.titleCart}>
                    Flight Destination ({isExist ? flight.length : 0})
                  </div>
                  {!isExist ? (
                    <div className={styles.noCart}>No flight in cart</div>
                  ) : (
                    <div className={styles.allFlightContainer}>
                      {flight?.map((f: any, index: number) => (
                        <div className={styles.allFlight} key={index}>
                          <FlightDetailCartCard flightt={f} />
                          <div className={styles.priceAndRemove}>
                            <div className={styles.prices}>
                              Total Price:{" "}
                              <span>
                                {formatCurrency(
                                  calculatePricePerCart(f).toString()
                                )}
                              </span>
                            </div>
                            <div className={styles.remove}>
                              {new Date() >
                              new Date(f.flights[0].departureDate) ? (
                                <p className={styles.expiredd}>*Expired*</p>
                              ) : (
                                <p className={styles.notexpiredd}>
                                  *On-going ticket*
                                </p>
                              )}
                              <IoMdTrash
                                className={styles.iconRemove}
                                onClick={() => remove(f.flightId)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={styles.titleCart}>
                    Hotel Books ({isExistHotel ? hotel.length : 0})
                  </div>
                  {!isExistHotel ? (
                    <div className={styles.noCart}>No hotel in cart</div>
                  ) : (
                    <div className={styles.allHotelContainer}>
                      {hotel?.map((h: any, index: number) => (
                        <div className={styles.allHotel} key={index}>
                          <div className={styles.hotelInfo}>
                            <div className={styles.image}>
                              <img src={h.image} />
                            </div>
                            <div className={styles.checkinout}>
                              <div className={styles.name}>{h.hotelName}</div>
                              <div className={styles.address}>
                                {h.hotelAddress}
                              </div>
                              <div className={styles.updateCico}>
                                <div className={styles.allInputs}>
                                  <input
                                    type="date"
                                    name="checkin"
                                    className={styles2.fields}
                                    placeholder="Date of Birth"
                                    value={
                                      new Date(formData[index].checkin)
                                        .toISOString()
                                        .split("T")[0]
                                    }
                                    onChange={(e: any) => changeValue(e, index)}
                                    disabled={false}
                                  />
                                  <input
                                    type="date"
                                    name="checkout"
                                    className={styles2.fields}
                                    placeholder="Date of Birth"
                                    value={
                                      new Date(formData[index].checkout)
                                        .toISOString()
                                        .split("T")[0]
                                    }
                                    onChange={(e: any) => changeValue(e, index)}
                                    disabled={false}
                                  />
                                </div>
                                <button
                                  onClick={() =>
                                    updateHotel(formData[index], index)
                                  }
                                >
                                  Save
                                </button>
                                <p className={styles1.errorMsgRegist}>
                                  {errorMessages[index]}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className={styles.roomInfo}>
                            <div className={styles.roomCont}>
                              <div className={styles3.dTitle}>{h.roomName}</div>
                              <div className={styles3.dBg}>
                                <div className={styles3.dBed}>
                                  <FaBed /> <p>{h.roomBed} Bed</p>
                                </div>
                                <div className={styles3.dGuests}>
                                  <IoMdPeople /> <p>{h.roomGuest} Guests</p>
                                </div>
                              </div>
                            </div>
                            <div className={styles.roomCont}>
                              <div>Quantity: {h.quantity}</div>
                              <div>
                                {formatCurrency(h.pernights)} / room / night(s)
                              </div>
                            </div>
                          </div>
                          <div className={styles.pricee}>
                            <div className={styles.priceInfo}>
                              <div className={styles.prices}>Total Price </div>
                              <div className={styles.pricesAndRemove}>
                                <span>
                                  {formatCurrency(
                                    calculatePricePerCartHotel(h).toString()
                                  )}
                                </span>
                                <span>
                                  <IoMdTrash
                                    className={styles.iconRemove}
                                    onClick={() => removeHotel(h.cartId)}
                                  />
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {(isExist || isExistHotel) && (
                  <div className={styles.cartFlex2}>
                    <div className={styles.totalCarts}>
                      <div className={styles.titleTotal}>
                        Total{" "}
                        {percentage === 0 ? (
                          <div className={styles.prices}>
                            <span>
                              {formatCurrency(calculateAllPrice().toString())}
                            </span>
                          </div>
                        ) : (
                          <div className={styles.prices}>
                            <p
                              style={{ textDecoration: "line-through" }}
                              className={styles.cartLinePrice}
                            >
                              {formatCurrency(calculateAllPrice().toString())}
                            </p>
                            <span>
                              {formatCurrency(
                                calculatePromoPrice(
                                  calculateAllPrice(),
                                  percentage
                                ).toString()
                              )}
                            </span>
                            <span> (-{percentage * 100}%)</span>
                          </div>
                        )}
                      </div>
                      <div className={styles.titleTotal}>Promo Code</div>
                      <div className={styles.promos}>
                        <input
                          type="text"
                          name="promoCode"
                          className={styles2.fields}
                          placeholder="Promo Code"
                          value={promoCode}
                          onChange={(e: any) => setPromoCode(e.target.value)}
                        />
                        {promoCode && (
                          <p
                            className={
                              isError
                                ? styles1.errorMsgRegist
                                : styles.successMsg
                            }
                          >
                            {promoMessage}
                          </p>
                        )}
                      </div>
                    </div>
                    <button className={styles.bookingBtn} onClick={openPopup}>
                      Book Now
                    </button>
                  </div>
                )}
              </div>
            </div>
            <Footer />
          </div>
        </>
      )}
      <ModalBookNow
        isOpen={showPopup}
        onClose={closePopup}
        flight={flight}
        hotel={hotel}
        user={user}
        promoCode={promoCode}
        percentage={percentage}
        totalPrice={calculateAllPrice()}
      />
    </SecuredRoute>
  );
}

export default Cart;
