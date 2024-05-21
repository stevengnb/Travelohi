import React, { useState } from "react";
import styles from "../../css/loginwotp.module.css";
import Loading from "../../components/Loading";
import TextField from "../../components/TextField";

function ForgotPassword({
  setIsForgot,
}: {
  setIsForgot: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    answer: "",
  });
  const [userData, setUserData] = useState({
    email: "",
    answer: "",
    question: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isQuestion, setIsQuestion] = useState(false);
  const [isPassword, setIsPassword] = useState(false);

  const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitted3 = async (event: React.FormEvent) => {
    event?.preventDefault();

    const specialCharacters = "!@#$%^&*()_-+=<>?/{}[]|";

    if (!formData.password || !formData.confirmPassword) {
      setErrorMessage("All fields must be filled!");
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

    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/forgotPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData }),
      });

      const result = await response.json();
      if (response.ok) {
        setErrorMessage("");
        setIsLoading(false);
        alert("Change password success!");
        setIsForgot(false);
      } else {
        console.log(result.message);
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage("Invalid Password");
    } finally {
      setIsLoading(false);
    }
  };

  const submitted2 = async (event: React.FormEvent) => {
    event?.preventDefault();

    if (!formData.answer) {
      setErrorMessage("Answer is required");
      return;
    }

    if (formData.answer.toLowerCase() !== userData.answer.toLowerCase()) {
      setErrorMessage("Wrong answer!");
      return;
    }

    setErrorMessage("");
    setIsPassword(true);
  };

  const submitted = async (event: React.FormEvent) => {
    event?.preventDefault();

    if (!formData.email) {
      setErrorMessage("Email is required");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.ok) {
        const result = await response.json();
        setUserData({
          email: result.email,
          answer: result.answer,
          question: result.question,
        });
        setErrorMessage("");
        setIsQuestion(true);
      } else {
        setErrorMessage("Invalid Email or Account Banned");
      }
    } catch (error) {
      setErrorMessage("Invalid Email or Account Banned");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : isQuestion ? (
        isPassword ? (
          isLoading ? (
            <Loading />
          ) : (
            <div className={styles.outDiv}>
              <h4 className={styles.title}>Enter your new password!</h4>
              <TextField
                typee="password"
                name="password"
                changeValue={changeValue}
                formData={formData}
                placeHolder="Password"
                disable={false}
              />
              <TextField
                typee="password"
                name="confirmPassword"
                changeValue={changeValue}
                formData={formData}
                placeHolder="Confirm Password"
                disable={false}
              />
              {errorMessage && (
                <p className={styles.errorMsg}>{errorMessage}</p>
              )}
              <button className={styles.loginBtn} onClick={submitted3}>
                Finish
              </button>
            </div>
          )
        ) : (
          <div className={styles.outDiv}>
            <h4 className={styles.title}>Please answer this question!</h4>
            <p className={styles.desc}>{userData.question}</p>
            <TextField
              typee="text"
              name="answer"
              changeValue={changeValue}
              formData={formData}
              placeHolder="Answer"
              disable={false}
            />
            {errorMessage && <p className={styles.errorMsg}>{errorMessage}</p>}
            <button className={styles.loginBtn} onClick={submitted2}>
              Next
            </button>
          </div>
        )
      ) : (
        <div className={styles.outDiv}>
          <h3 className={styles.title}>Enter Your Email</h3>
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
            Next
          </button>
        </div>
      )}
    </>
  );
}

export default ForgotPassword;
