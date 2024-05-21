import React, { useEffect, useState } from "react";
import UserContext from "../../context/UserContext";
import Loading from "../../components/Loading";

function MyWallet() {
  const { user, loginToHome, formatCurrency } = UserContext();
  const [loading, setLoading] = useState(false);

  const addWallet = async () => {
    setLoading(true);

    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/updateWallet", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ userId: user.id.toString() }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log(result.message);
        loginToHome();
      } else {
        console.log(result.error);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div>My Wallet</div>
          <div>
            HI Wallet: {user && formatCurrency(user?.hiWallet.toString())}
          </div>
          <button onClick={addWallet}>Add balance</button>
        </>
      )}
    </div>
  );
}

export default MyWallet;
