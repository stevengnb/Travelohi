import React, { useEffect, useState } from "react";
import styles from "../../css/managepromo.module.css";
import { IPromo } from "../../interface/promo";

function PromoCard({ promo, setLoading }: { promo: IPromo; setLoading: any }) {
  const [expand, setExpand] = useState(false);
  const [formData, setFormData] = useState<IPromo | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const changeValue = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const newValue =
      e.target.name === "percentage"
        ? parseFloat(e.target.value) / 100
        : e.target.value;

    setFormData((prevData) => ({
      ...(prevData as IPromo),
      [e.target.name]: newValue,
    }));
  };

  useEffect(() => {
    setFormData(promo);
  }, [promo]);

  const cancel = () => {
    setExpand(!expand);
    setFormData(promo);
    setErrorMessage("");
  };

  const updateData = async () => {
    if (!formData) return;

    if (
      !formData.title ||
      !formData.description ||
      !formData.promoCode ||
      !formData.percentage ||
      !formData.expired ||
      !formData.start
    ) {
      setErrorMessage("All field must be filled!");
      return;
    }

    if (
      promo.title.toLowerCase() === formData.title.toLowerCase() &&
      promo.description.toLowerCase() === formData.description.toLowerCase() &&
      promo.promoCode.toLowerCase() === formData.promoCode.toLowerCase() &&
      promo.percentage === formData.percentage &&
      new Date(promo.expired).toISOString().split("T")[0] ===
        new Date(formData.expired).toISOString().split("T")[0] &&
      new Date(promo.start).toISOString().split("T")[0] ===
        new Date(formData.start).toISOString().split("T")[0]
    ) {
      setErrorMessage("");
      setExpand(false);
      return;
    }

    if (formData.promoCode.length != 6) {
      setErrorMessage("Promo code must be 6 characters!");
      return;
    }

    if (formData.percentage * 100 > 100 || formData.percentage * 100 < 0) {
      setErrorMessage("Invalid percentage!");
      return;
    }

    const today = new Date();
    today.setHours(0, 1, 0, 0);
    const startDate = new Date(formData.start);
    const expiryDate = new Date(formData.expired);

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
    try {
      const response = await fetch("http://localhost:8000/admin/updatePromo", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: promo.id.toString(),
          title: formData.title,
          percentage: formData.percentage.toString(),
          description: formData.description,
          promoCode: formData.promoCode,
          start: new Date(formData.start).toISOString().split("T")[0],
          expired: new Date(formData.expired).toISOString().split("T")[0],
        }),
      });

      if (response.ok) {
        setErrorMessage("");
        setExpand(false);
      } else {
        setErrorMessage("Invalid code!");
      }
    } catch (error) {
      setErrorMessage("Unauthorized");
    } finally {
      window.location.reload();
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.card} ${expand ? styles.cardExpand : ""}`}>
      {expand ? (
        <div className={`${styles.contentExpand} ${styles.transition}`}>
          <div className={styles.promoPic}>
            <img src={promo.image} />
          </div>
          <div className={styles.allFields}>
            <div className={styles.inField}>
              <p className={styles.fieldT}>Title</p>
              <input
                type="text"
                name="title"
                className={styles.fields}
                placeholder="Title"
                value={formData?.title}
                onChange={changeValue}
              />
            </div>
            <div className={styles.inField}>
              <p className={styles.fieldT}>Description</p>
              <input
                type="text"
                name="description"
                className={styles.fields}
                placeholder="Description"
                value={formData?.description}
                onChange={changeValue}
              />
            </div>
            <div className={styles.inField}>
              <p className={styles.fieldT}>Start Date</p>
              <input
                type="date"
                name="start"
                className={styles.fields}
                placeholder="Start Date"
                value={
                  formData?.start
                    ? new Date(formData.start).toISOString().split("T")[0]
                    : ""
                }
                onChange={changeValue}
              />
            </div>
            <div className={styles.inField}>
              <p className={styles.fieldT}>Expiry Date</p>
              <input
                type="date"
                name="expired"
                className={styles.fields}
                placeholder="Expiry Date"
                value={
                  formData?.expired
                    ? new Date(formData.expired).toISOString().split("T")[0]
                    : ""
                }
                onChange={changeValue}
              />
            </div>
            <div className={styles.inField}>
              <p className={styles.fieldT}>Promo Code</p>
              <input
                type="text"
                name="promoCode"
                className={styles.fields}
                placeholder="Promo Code"
                value={formData?.promoCode}
                onChange={changeValue}
              />
            </div>
            <div className={styles.inField}>
              <p className={styles.fieldT}>Percentage</p>
              <input
                type="number"
                name="percentage"
                className={styles.fields}
                placeholder="Percentage"
                value={formData?.percentage ? formData?.percentage * 100 : 0}
                onChange={changeValue}
              />
            </div>
          </div>
          <p className={styles.errorMsg}>{errorMessage}</p>
          <div className={styles.downBtn}>
            <button className={styles.btn} onClick={cancel}>
              Cancel
            </button>
            <button className={styles.btn} onClick={updateData}>
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.contentNotExpand}>
            <p>{promo.title}</p>
            <p>{promo.description}</p>
          </div>
          <div className={styles.editBtn} onClick={() => setExpand(!expand)}>
            Edit
          </div>
        </>
      )}
    </div>
  );
}

export default PromoCard;
