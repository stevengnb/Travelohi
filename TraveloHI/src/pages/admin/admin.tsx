import { useState } from "react";
import styles from "../../css/admin.module.css";
import Sidebar from "./Sidebar";
import ManagePromos from "./ManagePromos";
import ManageHotel from "./ManageHotel";
import ManageAirline from "./ManageAirline";
import ManageUser from "./ManageUser";
import SendNewsletter from "./SendNewsletter";
import SecuredAdminRoute from "../../settings/SecuredAdminRoutes";

function Admin() {
  const [index, setIndex] = useState(0);

  const contents = [
    <ManagePromos />,
    <ManageHotel />,
    <ManageAirline />,
    <ManageUser />,
    <SendNewsletter />,
  ];

  const setIdx = (idx: number) => {
    setIndex(idx);
  };

  return (
    <SecuredAdminRoute>
      <div className={styles.adminBody}>
        <Sidebar setIdx={setIdx} />
        <div className={styles.content}>{contents[index]}</div>
      </div>
    </SecuredAdminRoute>
  );
}

export default Admin;
