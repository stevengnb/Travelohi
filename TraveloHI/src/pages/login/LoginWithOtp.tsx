import { useState } from "react";
import styles from "../../css/loginwotp.module.css";
import TextField from "../../components/TextField";
import Loading from "../../components/Loading";
import FillOtp from "./FillOtp";

function LoginWithOtp() {
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnterOtp, setIsEnterOtp] = useState(false);

  const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitted = async (event: React.FormEvent) => {
    event?.preventDefault();
    var result;

    if (!formData.email) {
      setErrorMessage("Email is required");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/sendOtp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.ok) {
        setErrorMessage("");
      } else {
        setErrorMessage("Invalid Email or Account Banned");
      }

      result = await response.json();
    } catch (error) {
      setErrorMessage("Invalid Email or Account Banned");
      throw error;
    } finally {
      setIsLoading(false);
    }

    if (result.status === "success") {
      setIsEnterOtp(true);
    }
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : isEnterOtp ? (
        <FillOtp email={formData.email} />
      ) : (
        <div className={styles.outDiv}>
          <h3 className={styles.title}>Enter Your Email</h3>
          <p className={styles.desc}>We will send you a confirmation code!</p>
          <TextField
            typee="email"
            name="email"
            changeValue={changeValue}
            formData={formData}
            placeHolder="Email"
            disable={false}
          />
          {errorMessage && <p className={styles.errorMsg}>{errorMessage}</p>}
          <button className={styles.loginBtn} onClick={submitted}>
            Login with OTP
          </button>
        </div>
      )}
    </>
  );
}

export default LoginWithOtp;
