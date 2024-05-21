import React, { useEffect, useRef, useState } from "react";
import Loading from "../../components/Loading";
import CreditCard from "./CreditCard";
import styles from "../../css/profile.module.css";
import UserContext from "../../context/UserContext";

function MyAccount() {
  const { user } = UserContext();
  const [change, setChange] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profileImage, setProfileImage] = useState("");
  const [errorMessage, setErrorMessage] = useState({
    ms1: "",
    ms2: "",
    ms3: "",
  });
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    question: "",
    answer: "",
    profilePicture: "",
    isEmail: false,
  });
  const [creditCard, setCreditCard] = useState({
    name: "",
    bankName: "",
    number: "",
    cvv: "",
  });

  const changeValue = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setChange(true);
  };

  const changeValueCc = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setCreditCard({ ...creditCard, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    resetFormData();
  }, [user]);

  const cancelBtn = () => {
    if (user) {
      resetFormData();
      setErrorMessage({
        ms1: "",
        ms2: errorMessage.ms2,
        ms3: errorMessage.ms3,
      });
      setChange(false);
    }
  };

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

  const isNum = (word: string) => {
    return /^[0-9]+$/.test(word);
  };

  const addCc = async () => {
    if (
      !creditCard.number ||
      !creditCard.bankName ||
      !creditCard.cvv ||
      !creditCard.name
    ) {
      setErrorMessage({
        ms1: errorMessage.ms1,
        ms2: errorMessage.ms2,
        ms3: "All field must be filled!",
      });
      return;
    }

    if (!isNum(creditCard.cvv)) {
      setErrorMessage({
        ms1: errorMessage.ms1,
        ms2: errorMessage.ms2,
        ms3: "CVV can only contains a number!",
      });
      return;
    }

    if (!isNum(creditCard.number)) {
      setErrorMessage({
        ms1: errorMessage.ms1,
        ms2: errorMessage.ms2,
        ms3: "Card number can only contains a number!",
      });
      return;
    }

    if (creditCard.cvv.length !== 3) {
      setErrorMessage({
        ms1: errorMessage.ms1,
        ms2: errorMessage.ms2,
        ms3: "CVV must have 3 digits!",
      });
      return;
    }

    setErrorMessage({
      ms1: errorMessage.ms1,
      ms2: errorMessage.ms2,
      ms3: "",
    });

    setUpdateLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8000/users/addCreditCard",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ ...creditCard, userId: user?.id }),
        }
      );

      if (response.ok) {
        setErrorMessage({
          ms1: errorMessage.ms1,
          ms2: errorMessage.ms2,
          ms3: "",
        });

        setCreditCard({
          name: "",
          bankName: "",
          number: "",
          cvv: "",
        });

        window.location.reload();
      } else {
        setErrorMessage({
          ms1: errorMessage.ms1,
          ms2: errorMessage.ms2,
          ms3: "Invalid Data",
        });
      }
    } catch (error) {
      setErrorMessage({
        ms1: errorMessage.ms1,
        ms2: errorMessage.ms2,
        ms3: "Invalid Data",
      });
    } finally {
      setUpdateLoading(false);
    }

    console.log("berhasil ccnya");
  };

  const save = async () => {
    if (!user) return;

    const noChange =
      formData.email === user.email &&
      formData.firstName === user.firstName &&
      formData.lastName === user.lastName &&
      formData.gender === user.gender &&
      formData.profilePicture === user.profilePicture &&
      formData.isEmail.toString() === user.isEmail.toString() &&
      formData.dob === new Date(user.dob).toISOString().split("T")[0];

    if (noChange) {
      setChange(false);
      setErrorMessage({
        ms1: "",
        ms2: errorMessage.ms2,
        ms3: errorMessage.ms3,
      });
      return;
    }

    if (
      formData.firstName.trim().length < 5 ||
      formData.lastName.trim().length < 5 ||
      !/^[a-zA-Z ]+$/.test(formData.firstName) ||
      !/^[a-zA-Z ]+$/.test(formData.lastName)
    ) {
      setErrorMessage({
        ms1: "First name and last name must be more than 5 characters and contain only alphabetical characters",
        ms2: errorMessage.ms2,
        ms3: errorMessage.ms3,
      });
      return;
    }

    if (formData.dob === "") {
      setErrorMessage({
        ms1: "Date must be filled!",
        ms2: errorMessage.ms2,
        ms3: errorMessage.ms3,
      });

      return;
    }

    const dobDate = new Date(formData.dob);
    const currentDate = new Date();
    let age = currentDate.getFullYear() - dobDate.getFullYear();
    if (
      currentDate.getMonth() < dobDate.getMonth() ||
      (currentDate.getMonth() === dobDate.getMonth() &&
        currentDate.getDate() < dobDate.getDate())
    ) {
      age--;
    }

    if (age < 13) {
      setErrorMessage({
        ms1: "User age must be more than or equal to 13 years!",
        ms2: errorMessage.ms2,
        ms3: errorMessage.ms3,
      });
      return;
    }

    if (formData.gender !== "male" && formData.gender !== "female") {
      setErrorMessage({
        ms1: "User gender must be male or female!",
        ms2: errorMessage.ms2,
        ms3: errorMessage.ms3,
      });
      return;
    }

    if (!formData.isEmail) {
      setErrorMessage({
        ms1: "Subscribe to newsletters must be true or false!",
        ms2: errorMessage.ms2,
        ms3: errorMessage.ms3,
      });
      return;
    }

    if (
      !(
        formData.email.includes("@") &&
        formData.email.endsWith(".com") &&
        formData.email.indexOf("@") > 0 &&
        formData.email.indexOf("@.com") === -1
      )
    ) {
      setErrorMessage({
        ms1: "Wrong email format!",
        ms2: errorMessage.ms2,
        ms3: errorMessage.ms3,
      });
      return;
    }

    updateProfileBackend();
  };

  const resetFormData = () => {
    if (user) {
      setFormData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        dob: new Date(user.dob).toISOString().split("T")[0],
        gender: user.gender,
        question: user.question,
        answer: user.answer,
        profilePicture: user.profilePicture,
        isEmail: user.isEmail,
      });
    }
  };

  const savePp = async () => {
    if (user) {
      if (!imagePreview) {
        setErrorMessage({
          ms1: errorMessage.ms1,
          ms2: "There's no image!",
          ms3: errorMessage.ms3,
        });
        return;
      }

      setUpdateLoading(true);
      let imageUrl;
      try {
        if (profileImage) {
          const image = new FormData();
          console.log(profileImage);
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

          updatePictureBackend(imageUrl);
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setProfileImage("");
      } catch (error) {
        console.log(error);
      } finally {
        setUpdateLoading(false);
      }
    }
  };

  const updateProfileBackend = async () => {
    if (!user) return;
    setUpdateLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/updateProfileDetail",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            id: user.id,
            firstName: formData.firstName,
            lastName: formData.lastName,
            gender: formData.gender,
            dob: formData.dob,
            isEmail: formData.isEmail.toString(),
            email: formData.email,
          }),
        }
      );

      const result = await response.json();
      if (response.ok) {
        setErrorMessage({
          ms1: "",
          ms2: errorMessage.ms2,
          ms3: errorMessage.ms3,
        });
        window.location.reload();
      } else {
        console.log(result);
        setErrorMessage({
          ms1: "Unauthorized",
          ms2: errorMessage.ms2,
          ms3: errorMessage.ms3,
        });
      }
    } catch (error) {
      setErrorMessage({
        ms1: "Unauthorized",
        ms2: errorMessage.ms2,
        ms3: errorMessage.ms3,
      });
    } finally {
      setUpdateLoading(false);
      setChange(false);
    }
  };

  const updatePictureBackend = async (imageUrl: string) => {
    if (!user) return;
    setUpdateLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/updateProfilePicture",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ imageUrl: imageUrl, id: user.id }),
        }
      );

      if (response.ok) {
        setErrorMessage({
          ms1: errorMessage.ms1,
          ms2: "",
          ms3: errorMessage.ms3,
        });
        window.location.reload();
      } else {
        setErrorMessage({
          ms1: errorMessage.ms1,
          ms2: "Unauthorized",
          ms3: errorMessage.ms3,
        });
      }
    } catch (error) {
      setErrorMessage({
        ms1: errorMessage.ms1,
        ms2: "Unauthorized",
        ms3: errorMessage.ms3,
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  return updateLoading ? (
    <div className={styles.userInfo}>
      <Loading />
    </div>
  ) : (
    <>
      <div className={styles.userInfo}>
        <div className={styles.component}>
          <p className={styles.name}>Personal Data</p>
          <div className={styles.field}>
            <div className={styles.inField}>
              <p className={styles.fieldT}>First Name</p>
              <input
                type="text"
                name="firstName"
                className={styles.fields}
                placeholder="First Name"
                value={formData.firstName}
                onChange={changeValue}
                disabled={false}
              />
            </div>
            <div className={styles.inField}>
              <p className={styles.fieldT}>Last Name</p>
              <input
                type="text"
                name="lastName"
                className={styles.fields}
                placeholder="Last Name"
                value={formData.lastName}
                onChange={changeValue}
                disabled={false}
              />
            </div>
          </div>
          <div className={styles.field}>
            <div className={styles.inField}>
              <p className={styles.fieldT}>Gender</p>
              <select
                name="gender"
                className={styles.fields}
                value={formData.gender}
                onChange={changeValue}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className={styles.inField}>
              <p className={styles.fieldT}>Birthdate</p>
              <input
                type="date"
                name="dob"
                className={styles.fields}
                placeholder="Date of Birth"
                value={formData.dob}
                onChange={changeValue}
                disabled={false}
              />
            </div>
          </div>
          <div className={styles.field}>
            <div className={styles.inField}>
              <p className={styles.fieldT}>Subscribe to newsletters</p>
              <select
                name="isEmail"
                className={styles.fields}
                value={formData.isEmail.toString()}
                onChange={changeValue}
              >
                <option value="">Select status</option>
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </div>
          </div>
          <div className={styles.field}>
            <div className={styles.inField}>
              <p className={styles.fieldT}>Email</p>
              <input
                type="email"
                name="email"
                className={styles.fields}
                placeholder="Email"
                value={formData.email}
                onChange={changeValue}
                disabled={user?.email === "operatortravelohi@gmail.com"}
              />
            </div>
          </div>
        </div>
        <p className={styles.errorMsg}>{errorMessage.ms1}</p>
        <div className={styles.field}>
          <div className={styles.inField}>
            <button
              className={!change ? styles.disalbedBtn : styles.cancelBtn}
              onClick={cancelBtn}
              disabled={!change}
            >
              Cancel
            </button>
            <button
              className={!change ? styles.disalbedBtn : styles.saveBtn}
              disabled={!change}
              onClick={save}
            >
              Save
            </button>
          </div>
        </div>
      </div>
      <div className={styles.userEmail}>
        <div className={styles.component2}>
          <p className={styles.name}>Profile Picture</p>
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
          <p className={styles.errorMsg}>{errorMessage.ms2}</p>
          <button className={styles.saveBtn} onClick={savePp}>
            Save
          </button>
        </div>
      </div>
      <div className={styles.addCredit}>
        <div className={styles.component2}>
          <p className={styles.name}>Credit Cards</p>
          {user?.creditCards &&
            user.creditCards.map((creditCard, index) => (
              <CreditCard key={index} {...creditCard} />
            ))}
          <button className={styles.saveBtn} onClick={addCc}>
            Add
          </button>
          <p className={styles.errorMsg}>{errorMessage.ms3}</p>
          <div className={styles.addCC}>
            <div className={styles.addCCName}>
              <div className={styles.ccField}>
                <p className={styles.fieldT}>Name</p>
                <input
                  type="text"
                  name="name"
                  className={`${styles.fields} ${styles.haha}`}
                  placeholder="Name"
                  value={creditCard.name}
                  onChange={changeValueCc}
                  disabled={false}
                />
              </div>
              <div className={styles.ccField}>
                <p className={styles.fieldT}>Bank Name</p>
                <input
                  type="text"
                  name="bankName"
                  className={`${styles.fields} ${styles.haha}`}
                  placeholder="Bank"
                  value={creditCard.bankName}
                  onChange={changeValueCc}
                  disabled={false}
                />
              </div>
            </div>
            <div className={styles.addCCName}>
              <div className={styles.ccField}>
                <p className={styles.fieldT}>Card Number</p>
                <input
                  type="text"
                  name="number"
                  className={`${styles.fields} ${styles.haha}`}
                  placeholder="Card Number"
                  value={creditCard.number}
                  onChange={changeValueCc}
                  disabled={false}
                />
              </div>
              <div className={styles.ccField}>
                <p className={styles.fieldT}>Card CVV</p>
                <input
                  type="text"
                  name="cvv"
                  className={`${styles.fields} ${styles.haha}`}
                  placeholder="CVV"
                  value={creditCard.cvv}
                  onChange={changeValueCc}
                  disabled={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default MyAccount;
