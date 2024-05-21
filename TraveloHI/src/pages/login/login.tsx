import React, { useState } from "react";
import logo from "../../../src/images/logo-travelohi.png";
import styles from "../../css/login.module.css";
import { useNavigate } from "react-router-dom";
import TextField from "../../components/TextField";
import ReCAPTCHA from "react-google-recaptcha";
import UserContext from "../../context/UserContext";
import LoginWithOtp from "./LoginWithOtp";
import { FaChevronLeft } from "react-icons/fa";
import ForgotPassword from "./ForgotPassword";
import Loading from "../../components/Loading";

function Login() {
  const { user } = UserContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [captcha, setCaptcha] = useState<string | null>(null);
  const { loginToHome } = UserContext();
  const [isWOtp, setIsWOtp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleIsForgot = (state: any) => {
    setIsForgot(state);
  };

  const submitted = async (event: React.FormEvent) => {
    event?.preventDefault();

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

    if (!formData.password) {
      setErrorMessage("Password is required");
      return;
    }

    if (captcha === null) {
      setErrorMessage("Please do the captcha!");
      return;
    }

    setIsLoading(true);
    login(formData.email, formData.password);
  };

  async function login(email: string, password: string) {
    try {
      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Login success");
        navigate("/");
        loginToHome();
      } else {
        setErrorMessage(result.error);
      }
    } catch (error) {
      setErrorMessage("Invalid Email or Password");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (user) {
    navigate("/");
  }

  return (
    <>
      <div className={styles.loginBody}>
        <div className={styles.formBox}>
          {(isWOtp || isForgot) && (
            <FaChevronLeft
              onClick={() => (isWOtp ? setIsWOtp(false) : setIsForgot(false))}
              className={styles.backButton}
            />
          )}
          <div className={styles.titleLogin}>
            <img className={styles.titleLogo} src={logo} />
            <p className={styles.login}>Login</p>
          </div>
          {isWOtp ? (
            <LoginWithOtp />
          ) : isForgot ? (
            <ForgotPassword setIsForgot={handleIsForgot} />
          ) : (
            <>
              <form className={styles.form} onSubmit={submitted}>
                <TextField
                  typee="email"
                  name="email"
                  changeValue={changeValue}
                  formData={formData}
                  disable={isLoading}
                  placeHolder="Email"
                />
                <TextField
                  typee="password"
                  name="password"
                  changeValue={changeValue}
                  formData={formData}
                  disable={isLoading}
                  placeHolder="Password"
                />
                <ReCAPTCHA
                  theme="light"
                  sitekey="6Lcp81kpAAAAAA5J7Ko8PULyfnSPe3KWa8-jPQoY"
                  onChange={(val) => setCaptcha(val)}
                />
                {isLoading ? (
                  <Loading />
                ) : (
                  <button className={styles.loginBtn} type="submit">
                    Log In
                  </button>
                )}
              </form>
              {errorMessage && (
                <p className={styles.errorMsg}>{errorMessage}</p>
              )}
              <p
                className={styles.textHref}
                onClick={() => !isLoading && setIsForgot(true)}
              >
                Forgot Password?
              </p>
              <div className={styles.divider}></div>
              <button
                className={styles.loginOtpBtn}
                onClick={() => !isLoading && setIsWOtp(true)}
              >
                Login with OTP
              </button>
            </>
          )}
          <p
            onClick={() => !isLoading && navigate("/register")}
            className={styles.textHref}
          >
            Don't have an account? Sign Up
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
