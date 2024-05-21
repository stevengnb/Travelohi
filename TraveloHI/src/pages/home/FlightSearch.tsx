import { useEffect, useState } from "react";
import styles from "../../css/home.module.css";
import styles1 from "../../css/managepromo.module.css";
import styles2 from "../../css/room-card.module.css";
import { IoSearch } from "react-icons/io5";
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";
import UserContext from "../../context/UserContext";

function FlightSearch() {
  const { user } = UserContext();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState({
    cities: [],
    countries: [],
    airports: [],
  });
  const [recent, setRecent] = useState([] as any);
  const [inputActive, setInputActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = (event: any) => {
    setSearch(event.target.value);
  };

  const queryToBackend = debounce(async () => {
    if (search.trim() === "") {
      setResults({ cities: [], countries: [], airports: [] });
      setRecent([]);
      return;
    }

    setLoading(true);
    fetchRecentSearches();

    try {
      const response = await fetch(
        `http://localhost:8000/searchFlight?term=${search}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setResults({
          cities: result.cities,
          countries: result.countries,
          airports: result.airports,
        });
        console.log(result);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }

    console.log("Fetching data for search term:", search);
  }, 500);

  const fetchRecentSearches = async () => {
    setLoading(true);

    if (user) {
      console.log("usernya ada");
      try {
        const response = await fetch(
          `http://localhost:8000/getRecentSearches?term=${user.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          setRecent(result.recent);
          console.log(result.recent);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    } else {
      setRecent(null);
      setLoading(false);
    }
  };

  const addRecentSearch = async (searchTerm: string) => {
    setLoading(true);

    console.log("masuk recent");
    if (!user) {
      setLoading(false);
      navigate(`/search-flight?query=${encodeURIComponent(search)}`);
      return;
    }

    console.log("mulai fetch add");
    try {
      const response = await fetch(`http://localhost:8000/addRecentSearches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: user.id.toString(), term: searchTerm }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log(result.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      navigate(`/search-flight?query=${encodeURIComponent(search)}`);
    }
  };

  useEffect(() => {
    queryToBackend();

    return () => {
      queryToBackend.cancel();
    };
  }, [search, inputActive]);

  return (
    <div className={styles.content}>
      <div className={styles.contentFields}>
        <div className={styles.container}>
          <div className={styles2.inField}>
            <p className={styles.fieldT}>From</p>
            <input
              type="text"
              name="search"
              placeholder="Origin"
              className={styles1.fields}
              value={search}
              onChange={(e) => {
                handleSearch(e);
                setInputActive(true);
              }}
              autoComplete="off"
              onKeyDown={(e) => {
                console.log(e.key === "Enter");
                if (e.key === "Enter") {
                  addRecentSearch(search);
                }
              }}
              // onFocus={() => setInputActive(true)}
              // onBlur={() => setInputActive(false)}
            />
          </div>
          {(results.cities.length > 0 ||
            results.countries.length > 0 ||
            results.airports.length > 0 ||
            (recent != null && recent?.length > 0)) &&
            inputActive && (
              <div className={styles.searchResult}>
                {recent &&
                  recent.map((search: any, index: any) => (
                    <div
                      key={`search-${index}`}
                      className={styles.searchResultCard}
                      onClick={() => {
                        setSearch(search.searchTerm);
                        setInputActive(false);
                      }}
                    >
                      <p>{search.searchTerm}</p>
                      <div className={styles.srType}>Recent Search</div>
                    </div>
                  ))}
                {results.cities.map((city, index) => (
                  <div
                    key={`city-${index}`}
                    className={styles.searchResultCard}
                    onClick={() => {
                      setSearch(city);
                      setInputActive(false);
                    }}
                  >
                    <p>{city}</p>
                    <div className={styles.srType}>City</div>
                  </div>
                ))}
                {results.countries.map((country, index) => (
                  <div
                    key={`country-${index}`}
                    className={styles.searchResultCard}
                    onClick={() => {
                      setSearch(country);
                      setInputActive(false);
                    }}
                  >
                    <p>{country}</p>
                    <div className={styles.srType}>Country</div>
                  </div>
                ))}
                {results.airports.map((airport, index) => (
                  <div
                    key={`airport-${index}`}
                    className={styles.searchResultCard}
                    onClick={() => {
                      setSearch(airport);
                      setInputActive(false);
                    }}
                  >
                    <p>{airport}</p>
                    <div className={styles.srType}>Airport</div>
                  </div>
                ))}
              </div>
            )}
        </div>
        <div className={styles2.inField}>
          <p className={styles.fieldT}>To</p>
          <input
            type="text"
            name="checkin"
            placeholder="Destination"
            className={styles1.fields}
          />
        </div>
        <div className={styles2.inField}>
          <p className={styles.fieldT}>Check-Out</p>
          <input
            type="date"
            name="checkout"
            placeholder="Check-out"
            className={styles1.fields}
          />
        </div>
        <div className={styles2.inField}>
          <p className={styles.fieldT}>Guests</p>
          <input
            type="number"
            name="guests"
            placeholder="Guests"
            className={styles1.fields}
          />
        </div>
      </div>
      <div className={styles.contentFields2}>
        <div
          className={styles.searchBtn}
          onClick={() =>
            navigate(`/search-flight?query=${encodeURIComponent(search)}`)
          }
        >
          <IoSearch className={styles.icon2} />
        </div>
      </div>
    </div>
  );
}

export default FlightSearch;
