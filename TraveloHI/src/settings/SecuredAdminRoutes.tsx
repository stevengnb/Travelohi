import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../context/UserContext";
import Loading from "../components/Loading";

interface Props {
  children: React.ReactNode;
}

const SecuredAdminRoute: React.FC<Props> = ({ children }: Props) => {
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

  const middlewareStyle = {
    fontWeight: "800",
    fontSize: "3rem",
    fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
    letterSpacing: "7px",
  };

  return loading ? (
    <Loading />
  ) : !user ? (
    <div style={middlewareStyle}>LOGIN DULS</div>
  ) : user.email === "operatortravelohi@gmail.com" ? (
    <>{children}</>
  ) : (
    <div style={middlewareStyle}>UNAUTHORIZED</div>
  );
};

export default SecuredAdminRoute;
