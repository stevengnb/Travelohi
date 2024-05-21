import React, { useRef, useState } from "react";
import logo from "../../src/images/logo-travelohi.png";
import styles from "../css/register.module.css";
import TextField from "../components/TextField";
import styles2 from "../css/textfield.module.css";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import Loading from "../components/Loading";
import UserContext from "../context/UserContext";

function Register() {
  // user
  const { user } = UserContext();

  // navigate
  const navigate = useNavigate();

  // user information
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    question: "",
    answer: "",
  });
  const [subscribe, setSubscribe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [captcha, setCaptcha] = useState<string | null>(null);

  // profile picture
  const [profileImage, setProfileImage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const questions = [
    "What is your favorite childhood pet's name?",
    "In which city were you born?",
    "What is the name of your favorite book or movie?",
    "What is the name of the elementary school you attended?",
    "What is the model of your first car?",
  ];
  const fieldNames = ["dob", "email", "password", "confirmPassword"];

  // change image
  const handleImageChange = (e: any) => {
    const file = e.target.files?.[0];

    // validate the image file type
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

  // submit data
  const submitted = async (e: any) => {
    e.preventDefault();

    const specialCharacters = "!@#$%^&*()_-+=<>?/{}[]|";
    if (
      formData.firstName.trim().length < 5 ||
      formData.lastName.trim().length < 5 ||
      !/^[a-zA-Z ]+$/.test(formData.firstName) ||
      !/^[a-zA-Z ]+$/.test(formData.lastName)
    ) {
      setErrorMessage(
        "First name and last name must be more than 5 characters and contain only alphabetical characters"
      );
      return;
    }

    if (formData.dob === "") {
      setErrorMessage("Date must be filled!");
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
      setErrorMessage("User age must be more than or equal to 13 years!");
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
      setErrorMessage("Wrong email format!");
      return;
    }

    if (
      !(
        /[a-z]/.test(formData.password) &&
        /[A-Z]/.test(formData.password) &&
        /\d/.test(formData.password) &&
        specialCharacters
          .split("")
          .some((char) => formData.password.includes(char)) &&
        formData.password.length >= 8 &&
        formData.password.length <= 30
      )
    ) {
      setErrorMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be 8-30 characters long."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Confirm password didn't match!");
      return;
    }

    if (formData.gender !== "male" && formData.gender !== "female") {
      setErrorMessage("User gender must be male or female!");
      return;
    }

    if (formData.question === "") {
      setErrorMessage("Question must be filled!");
      return;
    }

    if (formData.answer === "") {
      setErrorMessage("Answer must be filled!");
      return;
    }

    if (profileImage === "") {
      setErrorMessage("Profile picture must be filled!");
      return;
    }

    if (captcha === null) {
      setErrorMessage("Please do the captcha!");
      return;
    }

    setErrorMessage("");

    setIsLoading(true);
    // upload image to cloudinary
    let imageUrl;
    try {
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

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setProfileImage("");
    } catch (error) {
      console.log(error);
    }

    submitToBackend(imageUrl, subscribe.toString());
  };

  // submit data to backend
  const submitToBackend = async (imageUrl: any, isEmail: any) => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, imageUrl, isEmail }),
      });

      console.log(JSON.stringify({ ...formData, imageUrl, isEmail }));

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        console.log("Registration successful:", result);
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
          dob: "",
          gender: "",
          question: "",
          answer: "",
        });
        alert("Your account is sucessfully registered!");
        setSubscribe(false);
        +navigate("/login");
      } else if (result.error === "Email has been registered!") {
        setErrorMessage(result.error);
      }
    } catch (error) {
      console.log(error);
      alert("Error during registration!");
    }
    setIsLoading(false);
  };

  const changeValue = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (user) {
    navigate("/");
  }

  return (
    <>
      <div
        className={isLoading ? styles.registerLoadingBody : styles.registerBody}
      >
        <div className={styles.formBox}>
          <div className={styles.title}>
            <img className={styles.titleLogo} src={logo} alt="Logo" />
            <p className={styles.register}>Register</p>
          </div>
          {isLoading ? (
            <div className={styles.loadingDiv}>
              <Loading />
            </div>
          ) : (
            <form className={styles.form} onSubmit={submitted}>
              <div className={styles.names}>
                <TextField
                  typee="text"
                  name="firstName"
                  placeHolder="First Name"
                  formData={formData}
                  changeValue={changeValue}
                  disable={false}
                />
                <TextField
                  typee="text"
                  name="lastName"
                  placeHolder="Last Name"
                  formData={formData}
                  changeValue={changeValue}
                  disable={false}
                />
              </div>
              {fieldNames.map((fieldName) => (
                <TextField
                  key={fieldName}
                  typee={
                    fieldName === "dob"
                      ? "date"
                      : fieldName === "email"
                      ? "email"
                      : fieldName.toLowerCase().includes("password")
                      ? "password"
                      : "text"
                  }
                  name={fieldName}
                  placeHolder={
                    fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
                  }
                  formData={formData}
                  changeValue={changeValue}
                  disable={false}
                />
              ))}
              <select
                name="gender"
                className={styles2.fields}
                value={formData.gender}
                onChange={changeValue}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <select
                name="question"
                className={styles2.fields}
                value={formData.question}
                onChange={changeValue}
              >
                <option value="">Choose a Security Question</option>
                {questions.map((question, index) => (
                  <option key={index} value={question}>
                    {question}
                  </option>
                ))}
              </select>
              <TextField
                typee="text"
                name="answer"
                placeHolder="Answer"
                formData={formData}
                changeValue={changeValue}
                disable={false}
              />
              <label>
                <input
                  type="checkbox"
                  checked={subscribe}
                  onChange={() => setSubscribe(!subscribe)}
                />
                I agree to receive news and updates.
              </label>
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
                      <img
                        src={imagePreview && imagePreview}
                        alt="profileImg"
                      />
                    )}
                  </div>
                </div>
              </div>
              <ReCAPTCHA
                theme="light"
                sitekey="6Lcp81kpAAAAAA5J7Ko8PULyfnSPe3KWa8-jPQoY"
                onChange={(val) => setCaptcha(val)}
              />
              <button className={styles.registerBtn} type="submit">
                Register
              </button>
              <p className={styles.errorMsgRegist}>{errorMessage}</p>
            </form>
          )}
          {!isLoading && (
            <p
              className={styles.textHref}
              onClick={() => {
                navigate("/login");
              }}
            >
              Already have an account? Sign In
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default Register;
