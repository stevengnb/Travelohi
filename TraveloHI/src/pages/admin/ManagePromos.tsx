import { useEffect, useRef, useState } from "react";
import styles from "../../css/sendnewsletter.module.css";
import styles2 from "../../css/manageuser.module.css";
import styles3 from "../../css/managepromo.module.css";
import { IPromo } from "../../interface/promo";
import Loading from "../../components/Loading";
import PromoCard from "./PromoCard";

function ManagePromos() {
  const [allPromos, setAllPromos] = useState<IPromo[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [newPromo, setNewPromo] = useState({
    title: "",
    description: "",
    percentage: "",
    start: "",
    expired: "",
    promoCode: "",
  });
  const [promoImage, setPromoImage] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const changeValue = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setNewPromo({ ...newPromo, [e.target.name]: e.target.value });
  };

  const setLoadingg = (load: boolean) => {
    setLoading(load);
  };

  useEffect(() => {
    fetchAllPromos();
  }, []);

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];
    if (
      file &&
      (file.type === "image/png" ||
        file.type === "image/jpg" ||
        file.type === "image/jpeg")
    ) {
      setPromoImage(file);
    } else {
      setPromoImage("");
    }
  };

  async function fetchAllPromos() {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/getPromos", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const result = await response.json();
      if (response.ok) {
        setAllPromos(result.promos);
      } else {
        console.log("unauthorized");
      }
    } catch (error) {
      console.log("unauthorized");
    } finally {
      setLoading(false);
    }
  }

  const add = async () => {
    if (
      !newPromo.title ||
      !newPromo.description ||
      !newPromo.promoCode ||
      !newPromo.percentage ||
      !newPromo.expired ||
      !newPromo.start
    ) {
      setErrorMessage("All field must be filled!");
      return;
    }

    if (newPromo.promoCode.length != 6) {
      setErrorMessage("Promo code must be 6 characters!");
      return;
    }

    if (promoImage === "") {
      setErrorMessage("Promo image must be filled!");
      return;
    }

    if (
      parseFloat(newPromo.percentage) > 100 ||
      parseFloat(newPromo.percentage) < 0
    ) {
      setErrorMessage("Invalid percentage!");
      return;
    }

    const today = new Date();
    today.setHours(0, 1, 0, 0);
    const startDate = new Date(newPromo.start);
    const expiryDate = new Date(newPromo.expired);

    if (startDate < today || expiryDate < today) {
      setErrorMessage(
        "Start and expiry dates must be greater than or equal to today"
      );
      return;
    }

    if (startDate >= expiryDate) {
      setErrorMessage("Start date must be less than expiry date");
      return;
    }

    setErrorMessage("");
    setLoading(true);
    let imageUrl = "";
    try {
      if (promoImage) {
        const image = new FormData();
        image.append("file", promoImage);
        image.append("cloud_name", "ds6lmapkj");
        image.append("upload_preset", "iuds9rnc");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/ds6lmapkj/image/upload",
          {
            method: "post",
            body: image,
          }
        );

        const imageData = await response.json();
        imageUrl = imageData.url.toString();
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setPromoImage("");
    } catch (error) {
      setErrorMessage("Server problem");
    } finally {
      setLoading(false);
    }

    if (imageUrl !== "") submitToBackend(imageUrl);
  };

  const submitToBackend = async (image: string) => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/admin/addPromo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ ...newPromo, image }),
      });

      if (response.ok) {
        setNewPromo({
          title: "",
          description: "",
          percentage: "",
          start: "",
          expired: "",
          promoCode: "",
        });
        setPromoImage("");
      } else {
        setErrorMessage("Invalid code!");
      }
    } catch (error) {
      setErrorMessage("Server problem");
    } finally {
      window.location.reload();
      setLoading(false);
    }
  };

  return (
    <div className={styles.sn}>
      <div className={styles.title}>
        <p>MANAGE PROMOS</p>
      </div>
      <div className={styles2.users}>
        {loading ? (
          <Loading />
        ) : (
          <div className={styles3.cardAdd}>
            <div className={styles3.promoTitle}>Add New Promo</div>
            <div className={styles3.allFields}>
              <div className={styles3.inField}>
                <p className={styles3.fieldT}>Title</p>
                <input
                  type="text"
                  name="title"
                  className={styles3.fields}
                  placeholder="Title"
                  value={newPromo.title}
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
                  value={newPromo.description}
                  onChange={changeValue}
                />
              </div>
              <div className={styles3.inField}>
                <p className={styles3.fieldT}>Start Date</p>
                <input
                  type="date"
                  name="start"
                  className={styles3.fields}
                  placeholder="Start Date"
                  value={
                    newPromo.start
                      ? new Date(newPromo.start).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={changeValue}
                />
              </div>
              <div className={styles3.inField}>
                <p className={styles3.fieldT}>Expiry Date</p>
                <input
                  type="date"
                  name="expired"
                  className={styles3.fields}
                  placeholder="Expiry Date"
                  value={
                    newPromo.expired
                      ? new Date(newPromo.expired).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={changeValue}
                />
              </div>
              <div className={styles3.inField}>
                <p className={styles3.fieldT}>Promo Code</p>
                <input
                  type="text"
                  name="promoCode"
                  className={styles3.fields}
                  placeholder="Promo Code"
                  value={newPromo.promoCode}
                  onChange={changeValue}
                />
              </div>
              <div className={styles3.inField}>
                <p className={styles3.fieldT}>Percentage</p>
                <input
                  type="number"
                  name="percentage"
                  className={styles3.fields}
                  placeholder="Percentage"
                  value={newPromo.percentage}
                  onChange={changeValue}
                />
              </div>
              <div className={styles3.inField}>
                <p className={styles3.fieldT}>Promo Image</p>
              </div>
              <div className={styles3.inField}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg"
                  name="image"
                  onChange={handleImageChange}
                ></input>
              </div>
              <button className={styles.sendBtn} onClick={add}>
                Add
              </button>
              <p className={styles.errorMsg}>{errorMessage}</p>
            </div>
          </div>
        )}
        {!loading &&
          allPromos
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((promo, idx) => (
              <PromoCard key={idx} promo={promo} setLoading={setLoadingg} />
            ))}
      </div>
    </div>
  );
}
export default ManagePromos;
