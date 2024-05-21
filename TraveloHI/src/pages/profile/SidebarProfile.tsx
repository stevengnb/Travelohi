import UserContext from "../../context/UserContext";
import styles from "../../css/profile.module.css";
import { IoStarSharp, IoTicket } from "react-icons/io5";
import {
  MdManageAccounts,
  MdLogout,
  MdAdminPanelSettings,
} from "react-icons/md";
import { FaCartShopping } from "react-icons/fa6";
import { FaHistory } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function SidebarProfile({
  setIdx,
  selected,
}: {
  setIdx: any;
  selected: number;
}) {
  const navigate = useNavigate();
  const { user, logout } = UserContext();
  const sidebarButtons = [
    {
      index: 0,
      icon: <MdManageAccounts className={styles.icon} />,
      text: "My Account",
    },
    {
      index: 1,
      icon: <IoStarSharp className={styles.icon} />,
      text: "My Wallet",
    },
    {
      index: 2,
      icon: <IoTicket className={styles.icon} />,
      text: "My Ticket",
    },
    {
      index: 3,
      icon: <FaHistory className={styles.icon} />,
      text: "History",
    },
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.info}>
        <img className={styles.profPic} src={user?.profilePicture} alt="" />
        <div className={styles.desc}>
          <p className={styles.name}>{user?.firstName}</p>
          <p className={styles.descName}>TraveloHI Account</p>
        </div>
      </div>
      <div className={styles.btnDiv}>
        {sidebarButtons.map((button) => (
          <div
            key={button.index}
            className={`${styles.sidebarBtn} ${
              selected === button.index ? styles.selected : ""
            }`}
            onClick={() => setIdx(button.index)}
          >
            {button.icon}
            <p className={styles.sidebarText}>{button.text}</p>
          </div>
        ))}
        <div className={styles.sidebarBtn} onClick={() => navigate("/cart")}>
          <FaCartShopping className={styles.icon} />
          <p className={styles.sidebarText}>My Cart</p>
        </div>
        {user?.email === "operatortravelohi@gmail.com" && (
          <div className={styles.sidebarBtn} onClick={() => navigate("/admin")}>
            <MdAdminPanelSettings className={styles.icon} />
            <p className={styles.sidebarText}>Admin Page</p>
          </div>
        )}
        <div className={styles.sidebarBtn} onClick={logout}>
          <MdLogout className={styles.icon} />
          <p className={styles.sidebarText}>Log Out</p>
        </div>
      </div>
    </div>
  );
}
