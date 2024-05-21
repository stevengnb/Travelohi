import styles from "../../css/manageuser.module.css";
import pp from "../../../src/images/blankprofpic.png";

export default function UserCard({
  userr,
  setLoading,
}: {
  userr: IUser;
  setLoading: any;
}) {
  const ban = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/admin/banUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId: userr.id }),
      });

      if (response.ok) {
        console.log("ok");
      } else {
        const result = await response.json();
        console.log(result);
      }
    } catch (error) {
    } finally {
      window.location.reload();
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.pic}>
        {userr.profilePicture.startsWith("http") ? (
          <img className={styles.picc} src={userr.profilePicture} />
        ) : (
          <img className={styles.picc} src={pp} />
        )}
      </div>
      <div className={styles.info}>
        <p>
          {userr.firstName} {userr.lastName} - {userr.gender}
        </p>
        <p>{new Date(userr.dob).toISOString().split("T")[0]}</p>
      </div>
      <div className={styles.info}>
        <p>{userr.email}</p>
        <p>Status: {userr.banned ? "Suspended" : "Active"}</p>
      </div>
      <div className={styles.ban}>
        {!userr.banned && (
          <button className={styles.banBtn} onClick={ban}>
            Ban
          </button>
        )}
      </div>
    </div>
  );
}
