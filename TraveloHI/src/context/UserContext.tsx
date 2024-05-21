import { createContext, useContext, useEffect, useState } from "react";
import { IChildren } from "../interface/children-interface";
import { ICc } from "../interface/credit-card";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const context = createContext<IUserContext>({} as IUserContext);

interface IUserContext {
  user: IUser | null;
  loading: boolean;
  logout: () => void;
  loginToHome: () => void;
  currency: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (currCurrency: string) => string;
}

export function UserProvider({ children }: IChildren) {
  const navigate = useNavigate();
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem("currency") || "IDR";
  });
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);

  function formatCurrency(currCurrency: string) {
    if (currency === "IDR") {
      const formattedString = parseInt(currCurrency)
        .toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        })
        .replace(",00", "");

      return formattedString;
    } else {
      const usdIdr = 15668;
      const formattedString = (parseInt(currCurrency) / usdIdr)
        .toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })
        .replace(".00", "");

      return formattedString;
    }
  }

  async function logout() {
    try {
      const response = await fetch("http://localhost:8000/api/logout", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        document.cookie =
          "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        setUser(null);
        console.log("berhaisl");
        navigate("/login");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function loginToHome() {
    console.log("fetch user");
    await fetchUser();
  }

  async function fetchUser() {
    setLoading(true);
    const token = Cookies.get("jwt");
    if (token) {
      const decodedToken = jwtDecode(token);
      try {
        const response = await fetch("http://localhost:8000/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: decodedToken.email }),
        });

        const result = await response.json();

        const response2 = await fetch(
          `http://localhost:8000/users/creditCards/${result.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        let creditCards: ICc[] | null = null;
        if (response2.ok) {
          const result2 = await response2.json();

          if (result2.creditCards !== null) {
            creditCards = result2.creditCards.map((card: any) => ({
              name: card.name,
              bankName: card.bankName,
              number: String(card.number),
              cvv: String(card.cvv),
            }));
          }
        }
        setUser({
          firstName: result.firstName,
          lastName: result.lastName,
          email: result.email,
          gender: result.gender,
          answer: result.answer,
          dob: result.dob,
          profilePicture: result.profilePicture,
          id: result.id,
          question: result.question,
          isEmail: result.isEmail,
          banned: result.banned,
          creditCards: creditCards === null ? null : creditCards,
          hiWallet: result.hiWallet,
        });
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    } else {
      setUser(null);
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchUser2 = async () => {
      try {
        await fetchUser();
      } catch (error) {
        console.log(error);
      }
    };

    fetchUser2();
  }, []);

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const data = {
    user,
    logout,
    loginToHome,
    loading,
    formatCurrency,
    currency,
    setCurrency,
  };
  return <context.Provider value={data}>{children}</context.Provider>;
}

export default function UserContext() {
  return useContext(context);
}
