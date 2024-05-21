import styles from "../../css/sendnewsletter.module.css";
import styles2 from "../../css/manageuser.module.css";
import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import UserCard from "./UserCard";

function ManageUser() {
  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);

  const setLoadingg = (load: boolean) => {
    setLoading(load);
  };

  useEffect(() => {
    fetchAllUser();
  }, []);

  async function fetchAllUser() {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/admin/getUsers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const result = await response.json();
      if (response.ok) {
        setAllUsers(result.users);
      } else {
        console.log("unauthorized");
      }
    } catch (error) {
      console.log("unauthorized");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.sn}>
      <div className={styles.title}>
        <p>USER MANAGEMENT</p>
      </div>
      <div className={styles2.users}>
        {loading ? (
          <Loading />
        ) : (
          allUsers
            .filter((user) => user.email !== "operatortravelohi@gmail.com")
            .sort((a, b) => a.firstName.localeCompare(b.firstName))
            .map((user, idx) => (
              <UserCard key={idx} userr={user} setLoading={setLoadingg} />
            ))
        )}
      </div>
    </div>
  );
}

export default ManageUser;
