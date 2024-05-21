import { useRef, useState } from "react";
import styles from "../../css/loginwotp.module.css";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/UserContext";
import Loading from "../../components/Loading";

function FillOtp({ email }: { email: any }) {
  const { loginToHome } = UserContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = Array.from({ length: 6 }, () =>
    useRef<HTMLInputElement>(null)
  );
  const [errorMessage, setErrorMessage] = useState("");

  const submitted = async () => {
    const otp = inputRefs.map((ref) => ref.current?.value).join("");
    setErrorMessage("");

    if (otp.length === inputRefs.length) {
      setIsLoading(true);
      verifyOtp(email, otp);
    } else {
      setErrorMessage("Please fill in all OTP fields.");
    }
  };

  const changeValue = (index: number, value: string) => {
    if (/^\d$/.test(value)) {
      if (index < inputRefs.length - 1) {
        inputRefs[index + 1].current?.focus();
      }
    } else if (value === "") {
      if (index > 0) {
        inputRefs[index - 1].current?.focus();
      }
    }
  };

  async function verifyOtp(email: string, otp: string) {
    var result;

    try {
      const response = await fetch("http://localhost:8000/api/verifyOtp", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          code: otp,
        }),
      });

      result = await response.json();
    } catch (error) {
      console.error("Login failed =", error);
      throw error;
    } finally {
      setIsLoading(false);
    }

    if (result.status !== "success") {
      setErrorMessage("Invalid OTP code!");
    } else {
      console.log("masuk ke buat jwt tokennya");
      login(email, otp);
    }
  }

  async function login(email: string, otp: string) {
    try {
      const response = await fetch("http://localhost:8000/api/loginOtp", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          code: otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Login success");
        navigate("/");
        loginToHome();
        console.log(email);
      } else {
        setErrorMessage(data.message);
      }

      return data;
    } catch (error) {
      console.error("Login failed =", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className={styles.allOtp}>
          <h3 className={styles.title}>OTP Verification</h3>
          <p className={styles.desc}>
            Please enter the OTP that has been sent!
          </p>
          <br></br>
          <div className={styles.allOtpInput}>
            {inputRefs.map((ref, index) => (
              <input
                key={index}
                type="text"
                className={styles.inputOtp}
                maxLength={1}
                autoFocus={index === 0}
                onChange={(e) => changeValue(index, e.target.value)}
                ref={ref}
              />
            ))}
          </div>

          {errorMessage && <p className={styles.errorMsg}>{errorMessage}</p>}
          <button className={styles.loginBtn} onClick={submitted}>
            Login
          </button>
        </div>
      )}
    </>
  );
}

export default FillOtp;
