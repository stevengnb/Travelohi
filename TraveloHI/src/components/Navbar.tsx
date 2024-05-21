import logo from "../../src/images/logo-travelohi.png";
import pp from "../../src/images/blankprofpic.png";
import styles from "../css/navbar.module.css";
import { useNavigate } from "react-router-dom";
import { RiArrowDropDownLine } from "react-icons/ri";
import UserContext from "../context/UserContext";
import { FaWallet } from "react-icons/fa";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = UserContext();
  const { currency, setCurrency } = UserContext();
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className={styles.navbar} id="idNav">
      <div className={styles.logo}>
        <div className={styles.logo2} onClick={() => navigate("/")}>
          <a href="">
            <img src={logo} alt="" />
          </a>
          <p>TraveloHI</p>
        </div>
        <input
          className={styles.searchBar}
          type="text"
          placeholder="Search..."
        />
      </div>
      {user ? (
        <div className={styles.rightNav} id="idRightNav">
          <div className={styles.payContainer}>
            <div
              className={styles.loginNav1}
              onClick={() => setShowPayment(!showPayment)}
            >
              <p>Pay</p>
              <RiArrowDropDownLine className={styles.dropdownPay} />
            </div>
            {showPayment && (
              <>
                <div className={styles.payResult}>
                  <div className={styles.payment}>Payment</div>
                  <div className={styles.payChapter}>From Travelohi</div>
                  <div className={styles.fromTravelohi}>
                    <div>
                      <FaWallet />
                      {"  "}
                      HI Wallet
                    </div>
                    <div>
                      <FaWallet />
                      {"  "}
                      Credit Card
                    </div>
                  </div>
                  <div className={styles.payChapter}>Another</div>
                  <div className={styles.fromTravelohi}>
                    <div>
                      <FaWallet /> {"  "} HI Debt
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className={styles.loginNav}>
            <select
              className={styles.selects}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">$ USD</option>
              <option value="IDR">Rp IDR</option>
            </select>
          </div>
          <div onClick={() => navigate("/profile")} className={styles.loginNav}>
            <img className={styles.loginPic} src={user.profilePicture} alt="" />
            <p>Welcome, {user.firstName}</p>
          </div>
          <button onClick={logout} className={styles.registerBtn}>
            Log Out
          </button>
        </div>
      ) : (
        <div className={styles.rightNav} id="idRightNav">
          <div className={styles.payContainer}>
            <div
              className={styles.loginNav1}
              onClick={() => setShowPayment(!showPayment)}
            >
              <p>Pay</p>
              <RiArrowDropDownLine className={styles.dropdownPay} />
            </div>
            {showPayment && (
              <>
                <div className={styles.payResult}>
                  <div className={styles.payment}>Payment</div>
                  <div className={styles.payChapter}>From Travelohi</div>
                  <div className={styles.fromTravelohi}>
                    <div>
                      <FaWallet />
                      {"  "}
                      HI Wallet
                    </div>
                    <div>
                      <FaWallet />
                      {"  "}
                      Credit Card
                    </div>
                  </div>
                  <div className={styles.payChapter}>Another</div>
                  <div className={styles.fromTravelohi}>
                    <div>
                      <FaWallet /> {"  "} HI Debt
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className={styles.loginNav}>
            <select
              className={styles.selects}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">$ USD</option>
              <option value="IDR">Rp IDR</option>
            </select>
          </div>
          <div onClick={() => navigate("/login")} className={styles.loginNav}>
            <img className={styles.loginPic} src={pp} alt="" />
            <p>Log In</p>
          </div>
          <button
            onClick={() => navigate("/register")}
            className={styles.registerBtn}
          >
            Register
          </button>
        </div>
      )}
      <div className={styles.smallNav}>
        <input type="checkbox" />
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

export default Navbar;
