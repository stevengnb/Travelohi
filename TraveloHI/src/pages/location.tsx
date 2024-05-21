import { useRef, useState } from "react";
import styles from "../css/location.module.css";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function Location() {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [prediction, setPrediction] = useState("");

  const types = [
    "Brazil",
    "Canada",
    "Finland",
    "Japan",
    "United Kingdom",
    "United States",
  ];

  const handleImageChange = async (e: any) => {
    const file = e.target.files?.[0];

    if (
      file &&
      (file.type === "image/png" ||
        file.type === "image/jpg" ||
        file.type === "image/jpeg")
    ) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setImagePreview(base64String);
      };

      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const predictSubmitted = async () => {
    if (!imagePreview) {
      setErrorMessage("No file to predict!");
      return;
    }
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/checkLocation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imagePreview }),
      });

      const result = await response.json();
      if (result.status === "success") {
        setPrediction(types[result.message]);
      } else {
        console.log(result);
        setErrorMessage("Server error");
      }
    } catch (error) {
      setErrorMessage("Server error");
    }
  };

  return (
    <>
      <Navbar />
      <div className={styles.locationBody}>
        <div className={styles.formBox}>
          <div className={styles.imageUpload}>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg"
                name="image"
                onChange={handleImageChange}
              ></input>
            </div>
            <div className={styles.profilePhoto}>
              <div>
                {imagePreview && (
                  <img src={imagePreview && imagePreview} alt="profileImg" />
                )}
              </div>
            </div>
          </div>
          <p className={styles.errorMsg}>{errorMessage}</p>
          <button className={styles.predictBtn} onClick={predictSubmitted}>
            Predict
          </button>
          {prediction !== "" && (
            <p className={styles.result}>Result: {prediction}</p>
          )}
        </div>
        {prediction !== "" && (
          <div className={styles.allBtn}>
            <button
              onClick={() =>
                navigate(
                  `/search-hotel?query=${encodeURIComponent(prediction)}`
                )
              }
            >
              Book hotel in {prediction}!
            </button>
            <button
              onClick={() =>
                navigate(
                  `/search-flight?query=${encodeURIComponent(prediction)}`
                )
              }
            >
              Search flight to {prediction}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
