import { useState } from "react";
import Navbar from "../../components/Navbar";
import styles from "../../css/profile.module.css";
import SecuredRoute from "../../settings/SecuredRoutes";
import SidebarProfile from "./SidebarProfile";
import MyAccount from "./MyAccount";
import MyCart from "./MyCart";
import MyWallet from "./MyWallet";

function Profile() {
  const [index, setIndex] = useState(0);
  const contents = [<MyAccount />, <MyWallet />, <MyCart />];

  const setIdx = (idx: number) => {
    setIndex(idx);
  };

  return (
    <SecuredRoute>
      <>
        <Navbar />
        <div className={styles.profileBody}>
          <div className={styles.title}>Settings</div>
          <div className={styles.allContent}>
            <SidebarProfile setIdx={setIdx} selected={index} />
            <div className={styles.content}>{contents[index]}</div>
          </div>
        </div>
      </>
    </SecuredRoute>
  );
}

export default Profile;
