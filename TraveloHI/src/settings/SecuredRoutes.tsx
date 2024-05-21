import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../context/UserContext";
import Loading from "../components/Loading";

interface Props {
  children: React.ReactNode;
}

const SecuredRoute: React.FC<Props> = ({ children }: Props) => {
  const redirectTime = 4000;
  const { user, loading } = UserContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !loading) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, redirectTime);

      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  return loading ? (
    <Loading />
  ) : !user ? (
    <div
      style={{
        fontWeight: "800",
        fontSize: "3rem",
        fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
        letterSpacing: "7px",
      }}
    >
      LOGIN DULS
    </div>
  ) : (
    <>{children}</>
  );
};

export default SecuredRoute;
