import { useState } from "react";
import styles from "../../css/sendnewsletter.module.css";
import Loading from "../../components/Loading";

function SendNewsletter() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState({
    subject: "",
    body: "",
  });

  const changeValue = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEmail({ ...email, [e.target.name]: e.target.value });
  };

  const send = async () => {
    if (!email.subject || !email.body) {
      setErrorMessage("All field must be filled!");
      return;
    }
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/admin/sendNewsletter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ ...email }),
        }
      );

      if (response.ok) {
        setEmail({ subject: "", body: "" });
        console.log("OKKKKK");
      } else {
        setErrorMessage("Server error");
      }
    } catch (error) {
      setErrorMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.sn}>
      <div className={styles.title}>
        <p>SEND NEWSLETTER</p>
      </div>
      <div className={styles.desc}>
        <p>
          As the administrator, you have the power to connect with our vibrant
          community through personalized newsletters. This feature allows you to
          craft compelling messages and broadcast them to our subscribers,
          keeping them informed and engaged.
        </p>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div className={styles.emailContent}>
          <div className={styles.titleContent}>
            <p>Subject</p>
            <input
              className={styles.fields}
              type="text"
              name="subject"
              value={email.subject}
              onChange={changeValue}
            />
            <button className={styles.sendBtn} onClick={send}>
              Save
            </button>
            <p className={styles.errorMsg}>{errorMessage}</p>
          </div>
          <div className={styles.bodyContent}>
            <p>Content</p>
            <textarea
              className={`${styles.fields} ${styles.bodyEm}`}
              name="body"
              value={email.body}
              onChange={changeValue}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SendNewsletter;
