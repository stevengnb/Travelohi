import { useEffect, useState } from "react";
import styles from "../../css/searchflight.module.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";
import FlightCard from "./FlightCard";

function SearchFlight() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isExist, setIsExist] = useState(false);
  const [searchDetail, setSearchDetail] = useState([] as any[]);
  const [searchDetailCopy, setSearchDetailCopy] = useState([] as any[]);
  const [transits, setTransits] = useState([
    { name: "No transit", checked: false },
    { name: "1 Transit", checked: false },
    { name: "> 1 Transits", checked: false },
  ]);
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query");

  const handleTransit = (e: any) => {
    const { name, checked } = e.target;
    setTransits((prevTransits) =>
      prevTransits.map((transit) =>
        transit.name === name ? { ...transit, checked } : transit
      )
    );
  };

  const filterByTransit = () => {
    if (query && transits.every((transit) => !transit.checked)) {
      fetchSearchDetail(query);
      return;
    }

    let filteredFlight = searchDetailCopy;
    filteredFlight = filteredFlight.filter((flight) => {
      const transitNum = flight.transit;
      return (
        (transits[0].checked && transitNum === 1) ||
        (transits[1].checked && transitNum === 2) ||
        (transits[2].checked && transitNum > 2)
      );
    });

    setSearchDetail(filteredFlight);
  };

  useEffect(() => {
    filterByTransit();
  }, [transits]);

  async function fetchSearchDetail(query: any) {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/searchDetailFlight?term=${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const result = await response.json();
      if (response.ok) {
        if (result.flight == null) {
          setIsExist(false);
        } else {
          setIsExist(true);
          setSearchDetail(result.flight);
          setSearchDetailCopy(result.flight);
          console.log(result.flight);
        }
      } else {
        console.log("unauthorized");
      }
    } catch (error) {
      console.log("unauthorized");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    console.log("QUERY = ", query);
    if (query) {
      fetchSearchDetail(query);
    }
  }, [query]);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Navbar />
          <div className={styles.sfBody}>
            <div className={styles.inBody}>
              <div className={styles.sidebar}>
                <div className={styles.sidebarFacility}>
                  <p className={styles.srP}>Transit</p>
                  {transits.map((transit, index) => (
                    <div key={index} className={styles.transitCheck}>
                      <input
                        type="checkbox"
                        name={transit.name}
                        checked={transit.checked}
                        className={styles.startCb}
                        onChange={handleTransit}
                      />
                      <p>{transit.name}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.content}>
                {isExist ? (
                  searchDetail.map((flight, index) => (
                    <FlightCard key={index} flight={flight} />
                  ))
                ) : (
                  <div className={styles.srP}>
                    There are no results for "{query}".
                  </div>
                )}
              </div>
            </div>
            <Footer />
          </div>
        </>
      )}
    </>
  );
}

export default SearchFlight;
