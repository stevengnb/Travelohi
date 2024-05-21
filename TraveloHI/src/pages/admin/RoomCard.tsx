import React, { useRef } from "react";
import styles from "../../css/room-card.module.css";
import styles1 from "../../css/managepromo.module.css";
import { IRoom } from "../../interface/room-detail";

function RoomCard({
  room,
  setRooms,
  idx,
}: {
  room: IRoom;
  setLoading: any;
  setRooms: (value: any) => void;
  idx: number;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // const [hotelImgFile, setHotelImgFile] = useState<(string | File)[]>([]);
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // const updatedRoom = { ...room, [name]: value };
      const updatedRoom = room.images
        ? { ...room, images: [...room.images, ...files] }
        : { ...room, images: [...files] };
      setRooms((prevRooms: any) => {
        const updatedRooms = [...prevRooms];
        updatedRooms[idx] = updatedRoom;
        return updatedRooms;
      });
    }
  };

  const removeAll = () => {
    const updatedRoom = { ...room, images: [] };
    setRooms((prevRooms: any) => {
      const updatedRooms = [...prevRooms];
      updatedRooms[idx] = updatedRoom;
      return updatedRooms;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedRoom = { ...room, [name]: value };
    setRooms((prevRooms: any) => {
      const updatedRooms = [...prevRooms];
      updatedRooms[idx] = updatedRoom;
      return updatedRooms;
    });
  };

  return (
    <div className={styles.card}>
      <div className={styles.rcTitle}>Room-{idx + 1}</div>
      <div className={styles.rcField}>
        <div className={styles.inField}>
          <p className={styles.fieldT}>Name</p>
          <input
            type="text"
            name="name"
            placeholder="Name"
            className={styles1.fields}
            value={room.name || ""}
            onChange={handleChange}
          />
        </div>
        <div className={styles.inField}>
          <p className={styles.fieldT}>Guest</p>
          <input
            type="number"
            name="guest"
            className={styles1.fields}
            value={room.guest || 0}
            onChange={handleChange}
          />
        </div>
        <div className={styles.inField}>
          <p className={styles.fieldT}>Availability</p>
          <input
            type="number"
            name="availability"
            className={styles1.fields}
            value={room.availability || 0}
            onChange={handleChange}
          />
        </div>
        <div className={styles.inField}>
          <p className={styles.fieldT}>Bed</p>
          <input
            type="number"
            name="bed"
            className={styles1.fields}
            value={room.bed || 0}
            onChange={handleChange}
          />
        </div>
        <div className={styles.inField}>
          <p className={styles.fieldT}>Price</p>
          <input
            type="number"
            name="price"
            className={styles1.fields}
            value={room.price || 0}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className={styles.inFieldImg}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg"
          name="image"
          onChange={handleImageChange}
          multiple
        ></input>
      </div>
      <button className={styles.removeBtn} onClick={removeAll}>
        Remove All
      </button>
    </div>
  );
}

export default RoomCard;
