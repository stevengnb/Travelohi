import styles from "../../css/hotelroomcard.module.css";
import { FaBed } from "react-icons/fa";
import { IoMdPeople } from "react-icons/io";
import { GrFormSchedule } from "react-icons/gr";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import { CiDiscount1 } from "react-icons/ci";
import { IoIosInformationCircle } from "react-icons/io";
import ModalBookRoom from "./ModalBookRoom";
import { useState } from "react";

function HotelRoomCard({ hotelId, room, formatToIDR }: { hotelId: any, room: any; formatToIDR: any }) {
  const [showPopup, setShowPopup] = useState(false);
  const openPopup = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.title}>{room.name}</div>
      <div className={styles.content}>
        <div className={styles.images}>
          <img src={room.images[0]} />
          <div className={styles.roomm}>
            <div className={styles.seeAll}>See All Images</div>
          </div>
        </div>
        <div className={styles.details}>
          <div className={styles.dTitle}>{room.name}</div>
          <div className={styles.dBg}>
            <div className={styles.dBed}>
              <FaBed /> <p>{room.bed} Bed</p>
            </div>
            <div className={styles.dGuests}>
              <IoMdPeople /> <p>{room.guest} Guests</p>
            </div>
          </div>
          <div className={styles.dRr}>
            <div className={styles.dBed}>
              <GrFormSchedule /> <p>Non-refundable</p>
            </div>
            <div className={styles.dGuests}>
              <GrFormSchedule /> <p>Non-rescheduleable</p>
            </div>
          </div>
          <div className={styles.dPolicy}>
            <BsFillQuestionCircleFill className={styles.icon} />
            <p>Read Cancellation Policy</p>
          </div>
          <div className={styles.dInstallment}>
            <CiDiscount1 className={styles.icon} />
            <p>Installment is available for credit cardholders</p>
            <IoIosInformationCircle className={styles.icon} />
          </div>
          <div className={styles.buttons}>
            <div className={styles.inButtons}>
              <span style={{ textDecoration: "line-through" }}>
                {formatToIDR(room.price + (room.price * 25) / 100)}
              </span>
              <div className={styles.nominal}>{formatToIDR(room.price)}</div>
              <div className={styles.nominalDisc}>/ room / night(s)</div>
              <div className={styles.nominalDisc2}>Lower price than usual!</div>
              <div className={styles.cartOrBuy}>
                <div className={styles.selectBtn} onClick={openPopup}>
                  Add To Cart
                </div>
                <div className={styles.selectBtn} onClick={openPopup}>
                  Book Now
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalBookRoom hotelId={hotelId} isOpen={showPopup} onClose={closePopup} roomId={room.id} />
    </div>
  );
}

export default HotelRoomCard;
