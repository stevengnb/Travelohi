import { useState } from "react";
import styles from "../css/register.module.css";
import styles2 from "../css/login.module.css";

function UploadFile() {
  const [profileImage, setProfileImage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];

    if (
      file &&
      (file.type === "image/png" ||
        file.type === "image/jpg" ||
        file.type === "image/jpeg")
    ) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setProfileImage("");
      setImagePreview(null);
    }
  };

  const uploadImage = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl;

      if (profileImage) {
        const image = new FormData();
        image.append("file", profileImage);
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
        setImagePreview(null);
      }
      alert(imageUrl);
      setProfileImage("");
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <div>
        <p>
          <label>Photo:</label>
          <input
            type="file"
            accept="image/png, image/jpeg"
            name="image"
            onChange={handleImageChange}
          ></input>
        </p>
        <p>
          {isLoading ? (
            "Uploading"
          ) : (
            <button onClick={uploadImage} className={styles2.loginOtpBtn}>
              Upload Image
            </button>
          )}
        </p>
      </div>
      <div className={styles.profilePhoto}>
        <div>
          {imagePreview && (
            <img src={imagePreview && imagePreview} alt="profileImg" />
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadFile;
