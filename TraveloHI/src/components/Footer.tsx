import { Link, useNavigate } from "react-router-dom";
import styles from "../css/footer.module.css";
import logo from "../../src/images/logo-travelohi.png";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaGooglePlay,
  FaApple,
} from "react-icons/fa";

function Footer() {
  const navigate = useNavigate();

  return (
    <div className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.logos} onClick={() => navigate("/")}>
          <a href="">
            <img src={logo} alt="" />
          </a>
          <p>TraveloHI</p>
        </div>
        <div className={styles.internal}>
          <p>Travelohi</p>
          <Link to="/profile" className={styles.link}>
            My Account
          </Link>
          <Link to="/register" className={styles.link}>
            Register
          </Link>
          <Link to="/game" className={styles.link}>
            Game
          </Link>
          <Link to="/location" className={styles.link}>
            Check Location
          </Link>
        </div>
        <div className={styles.internal}>
          <p>Get In Touch</p>
          <Link to="/" className={styles.link}>
            Help Center
          </Link>
          <Link to="/" className={styles.link}>
            Our Location
          </Link>
        </div>
        <div className={styles.allExternal}>
          <div className={styles.external}>
            <p>Connect with Us</p>
            <div className={styles.inSocial}>
              <div>
                <a href="http://facebook.com">
                  <FaFacebookF className={styles.iconL} />
                </a>
              </div>
              <div>
                <a href="http://twitter.com">
                  <FaTwitter className={styles.iconL} />
                </a>
              </div>
              <div>
                <a href="http://instagram.com">
                  <FaInstagram className={styles.iconL} />
                </a>
              </div>
              <div>
                <a href="http://youtube.com">
                  <FaYoutube className={styles.iconL} />
                </a>
              </div>
            </div>
          </div>
          <div className={styles.external}>
            <p>Download the app</p>
            <div className={styles.inSocial}>
              <div>
                <a href="http://play.google.com">
                  <FaGooglePlay className={styles.iconL} />
                </a>
              </div>
              <div>
                <a href="http://apps.apple.com">
                  <FaApple className={styles.iconL} />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div></div>
      </div>
      <div className={styles.btm}>
        Copyright © 2024 Travelohi. TN23-2. All rights reserved
      </div>
    </div>
  );
}

export default Footer;
