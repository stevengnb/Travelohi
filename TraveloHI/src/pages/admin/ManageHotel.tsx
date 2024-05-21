import React, { useEffect, useRef, useState } from "react";
import styles from "../../css/sendnewsletter.module.css";
import styles2 from "../../css/managehotel.module.css";
import styles3 from "../../css/managepromo.module.css";
import styles4 from "../../css/room-card.module.css";
import styles5 from "../../css/register.module.css";
import { IHotel } from "../../interface/hotel";
import Loading from "../../components/Loading";
import { IRoom } from "../../interface/room-detail";
import RoomCard from "./RoomCard";

function ManageHotel() {
  const [hotel, setHotel] = useState<IHotel>({
    name: "",
    description: "",
    rating: 0,
    address: "",
    cityId: 0,
  });
  // const [newFacilities, setNewFacilities] = useState([] as number[]);
  const [errorMessage, setErrorMessage] = useState("");
  const [cities, setCities] = useState([] as any[]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [facilities, setFacilities] = useState([] as any[]);
  const [hotelImg, setHotelImg] = useState([] as any[]);
  const [hotelImgFile, setHotelImgFile] = useState<(string | File)[]>([]);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<IRoom[]>([
    {
      hotelId: 0,
      guest: 0,
      name: "",
      availability: 0,
      bed: 0,
      price: 0,
      images: [],
      imagesString: [],
    },
  ]);
  const addRoom = () => {
    if (rooms.length > 4) return;

    const newRoom: IRoom = {
      hotelId: 0,
      guest: 0,
      name: "",
      availability: 0,
      bed: 0,
      price: 0,
      images: [],
      imagesString: [],
    };

    setRooms([...rooms, newRoom]);
  };

  const removeRoom = () => {
    if (rooms.length > 1) {
      const updatedRooms = [...rooms];
      updatedRooms.pop();
      setRooms(updatedRooms);
    }
  };

  const setLoad = (value: boolean) => {
    setLoading(value);
  };

  const settingRooms = (value: any) => {
    setRooms(value);
  };

  const changeValue = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setHotel({ ...hotel, [e.target.name]: e.target.value });
  };

  const toggleCheckbox = (id: number) => {
    setFacilities((prevFacilities) =>
      prevFacilities.map((facility) =>
        facility.id === id
          ? { ...facility, checked: !facility.checked }
          : facility
      )
    );
  };

  const resetHotel = () => {
    facilities.forEach(function (f) {
      f.checked = false;
    });

    setHotel({
      name: "",
      description: "",
      rating: 0,
      address: "",
      cityId: 0,
    });
  };

  const resetRoom = () => {
    setRooms([
      {
        hotelId: 0,
        guest: 0,
        name: "",
        availability: 0,
        bed: 0,
        price: 0,
        images: [],
        imagesString: [],
      },
    ]);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imagesArray = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setHotelImgFile((prevImages) => [...prevImages, ...files]);
      setHotelImg((prevImages) => [...prevImages, ...imagesArray]);
    }
  };

  const removeAll = () => {
    setHotelImg([]);
    setHotelImgFile([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addHotel = () => {
    saveHotelImage();
  };

  const saveHotelImage = async () => {
    setLoading(true);

    try {
      const uploaded: string[] = [];
      await Promise.all(
        hotelImgFile.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("cloud_name", "ds6lmapkj");
          formData.append("upload_preset", "iuds9rnc");
          const response = await fetch(
            "https://api.cloudinary.com/v1_1/ds6lmapkj/image/upload",
            {
              method: "POST",
              body: formData,
            }
          );

          const imageData = await response.json();
          const imageUrl = imageData.secure_url;
          uploaded.push(imageUrl);
        })
      );

      // console.log("Uploaded: " + uploaded);
      saveHotel(uploaded);
    } catch (error) {
      console.error("Error uploading images:", error);
      setLoading(false);
    }
  };

  const saveHotel = async (imageUrl: any) => {
    var newFacilities = facilities
      .filter((facility) => facility.checked === true)
      .map((facility) => facility.id);
    console.log(newFacilities);

    if (newFacilities === null) {
      newFacilities = [""];
    }

    try {
      const response = await fetch("http://localhost:8000/admin/addHotel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: hotel.name,
          description: hotel.description,
          rating: hotel.rating.toString(),
          address: hotel.address,
          cityId: hotel.cityId.toString(),
          facilities: newFacilities.toString(),
          images: imageUrl.toString(),
        }),
      });

      const result = await response.json();
      if (response.ok) {
        saveRoomImage(result.message);
        resetHotel();
        removeAll();
      } else {
        setErrorMessage(result.error);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      // setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const saveRoomImage = async (hotelID: any) => {
    try {
      // console.log("baru mulai upload room images");
      const updatedRooms = await Promise.all(
        rooms.map(async (room) => {
          const uploadedImages = await uploadRoomImages(room.images);
          room.imagesString = uploadedImages;
          return room;
        })
      );

      // console.log("upload ke backend");

      await Promise.all(
        updatedRooms.map(async (room) => {
          const response = await fetch("http://localhost:8000/admin/addRoom", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              hotelId: hotelID.toString(),
              name: room.name,
              guest: room.guest.toString(),
              availability: room.availability.toString(),
              bed: room.bed.toString(),
              price: room.price.toString(),
              images: room.imagesString.toString(),
            }),
          });

          const result = await response.json();
          if (response.ok) {
            console.log("success");
            resetRoom();
          } else {
            console.log(result.error);
          }
        })
      );
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadRoomImages = async (images: any) => {
    const uploaded: string[] = [];

    // console.log("sebelum loop upload room images");
    await Promise.all(
      images.map(async (file: any) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("cloud_name", "ds6lmapkj");
        formData.append("upload_preset", "iuds9rnc");
        const response = await fetch(
          "https://api.cloudinary.com/v1_1/ds6lmapkj/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        // console.log("uploadnya harusnya success");
        const imageData = await response.json();
        const imageUrl = imageData.secure_url;
        uploaded.push(imageUrl);
        // console.log("uploaded images room = " + uploaded);
      })
    );

    return uploaded;
  };

  async function fetchAllCities() {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/admin/getCities", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const result = await response.json();
      if (response.ok) {
        setCities(result.cities);
      } else {
        console.log("unauthorized");
      }
    } catch (error) {
      console.log("unauthorized");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllFacilities() {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/getFacilities", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const result = await response.json();
      if (response.ok) {
        setFacilities(
          result.facilities.map((f: any) => ({ ...f, checked: false }))
        );
      } else {
        console.log("unauthorized");
      }
    } catch (error) {
      console.log("unauthorized");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllCities();
    fetchAllFacilities();
  }, []);

  return (
    <div className={styles.sn}>
      <div className={styles.title}>
        <p>MANAGE HOTEL</p>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div className={styles2.create}>
          <div className={styles2.card}>
            <div className={styles2.titleDiv}>
              <p className={styles2.facilityTitle}>Hotel</p>
            </div>
            <div className={styles2.hotelField}>
              <div className={styles3.inField}>
                <p className={styles3.fieldT}>Name</p>
                <input
                  type="text"
                  name="name"
                  className={styles3.fields}
                  placeholder="Name"
                  value={hotel?.name}
                  onChange={changeValue}
                />
              </div>
              <div className={styles3.inField}>
                <p className={styles3.fieldT}>Description</p>
                <input
                  type="text"
                  name="description"
                  className={styles3.fields}
                  placeholder="Description"
                  value={hotel?.description}
                  onChange={changeValue}
                />
              </div>
              <div className={styles3.inField}>
                <p className={styles3.fieldT}>Address</p>
                <input
                  type="text"
                  name="address"
                  className={styles3.fields}
                  placeholder="Address"
                  value={hotel?.address}
                  onChange={changeValue}
                />
              </div>
              <div className={styles3.inField}>
                <p className={styles3.fieldT}>City</p>
                <select
                  name="cityId"
                  className={styles3.fields}
                  value={hotel?.cityId}
                  onChange={changeValue}
                >
                  <option value="">Select a city</option>
                  {cities.map((city: any) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles2.inField}>
                <button className={styles2.saveBtn} onClick={addHotel}>
                  Save
                </button>
              </div>
              <p className={styles5.errorMsgRegist}>{errorMessage}</p>
            </div>
            <div className={styles2.titleDiv}>
              <p className={styles2.facilityTitle}>Facility</p>
            </div>
            <div className={styles2.facilityField}>
              {facilities
                .sort((a, b) => a.name.length - b.name.length)
                .map((facility) => (
                  <div
                    key={facility.id}
                    onClick={() => toggleCheckbox(facility.id)}
                    className={styles2.facilityCB}
                  >
                    <input type="checkbox" />
                    {facility.name}
                  </div>
                ))}
            </div>
            <div className={styles2.titleDiv}>
              <p className={styles2.hotelImgTitle}>Hotel Images</p>
            </div>
            <div className={styles2.hotelImgField}>
              <div className={styles2.hotelImgInput}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg"
                  name="image"
                  onChange={handleImageChange}
                  multiple
                ></input>
                <button className={styles2.removeBtn} onClick={removeAll}>
                  Remove All
                </button>
              </div>
              {hotelImg.map((imgSrc, index) => (
                <img
                  key={index}
                  src={imgSrc}
                  className={styles2.hotelImg}
                  alt={`Hotel Image ${index}`}
                />
              ))}
            </div>
            <div className={styles2.titleDiv}>
              <p className={styles2.hotelRoomsTitle}>Hotel Rooms</p>
            </div>
            <div className={styles2.hotelRoomsField}>
              {rooms.map((r, index) => (
                <RoomCard
                  key={index}
                  room={r}
                  setLoading={setLoad}
                  idx={index}
                  setRooms={settingRooms}
                />
              ))}
            </div>
            <div className={styles2.arContainer}>
              <div className={styles2.arBtn}>
                <button className={styles4.saveBtn} onClick={addRoom}>
                  Add Room
                </button>
                <button className={styles4.saveBtn} onClick={removeRoom}>
                  Remove Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ManageHotel;
