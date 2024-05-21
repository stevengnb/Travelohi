import { useEffect, useState } from "react";
import styles from "../../css/searchhotel.module.css";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import StarRating from "./StarRating";
import FacilityCheckbox from "./FacilityCheckbox";
import Loading from "../../components/Loading";
import HotelCard from "./HotelCard";
import { useNavigate } from "react-router-dom";

function SearchHotel() {
  const navigate = useNavigate();
  const [searchDetail, setSearchDetail] = useState([] as any[]);
  const [pagination, setPagination] = useState(null as any);
  const [searchDetailLevel, setSearchDetailLevel] = useState([] as any[]);
  const [searchDetailCopy, setSearchDetailCopy] = useState([] as any[]);
  const [facilities, setFacilities] = useState([] as any[]);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState({
    min: 0,
    max: 0,
  });
  const [rating, setRating] = useState({
    one: false,
    two: false,
    three: false,
    four: false,
    five: false,
  });
  const [isExist, setIsExist] = useState(false);
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("query");
  const pageParams = new URLSearchParams(location.search);
  const page = pageParams.get("page");

  const handleRating = (e: any) => {
    const { name, checked } = e.target;
    setRating({ ...rating, [name]: checked });
  };

  const handleFacility = (e: any) => {
    const { name, checked } = e.target;
    setFacilities((prevFacilities) =>
      prevFacilities.map((facility) =>
        facility.name === name ? { ...facility, checked } : facility
      )
    );
  };

  async function fetchAllFacilities() {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/getFacilities", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const result = await response.json();
      if (response.ok) {
        setFacilities(
          result.facilities.map((f: any) => ({ ...f, checked: false }))
        );
      } else {
        console.log("unauthorized");
      }
    } catch (error) {
      console.log("unauthorized");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSearchDetail(query: any) {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/searchDetail?term=${query}&page=${page}`,
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
        setPagination(result.pagination);
        if (result.hotels == null) {
          setIsExist(false);
        } else {
          setIsExist(true);
          setSearchDetail(result.hotels);
          setSearchDetailCopy(result.hotels);
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

  const filterHotelByRating = () => {
    if (
      query &&
      !rating.one &&
      !rating.two &&
      !rating.three &&
      !rating.four &&
      !rating.five
    ) {
      fetchSearchDetail(query);
      return;
    }

    let filteredHotels = searchDetailCopy;
    filteredHotels = filteredHotels.filter((hotel) => {
      const hotelRating = Math.floor(hotel.rating);
      return (
        (rating.one && hotelRating === 0) ||
        (rating.one && hotelRating === 1) ||
        (rating.two && hotelRating === 2) ||
        (rating.three && hotelRating === 3) ||
        (rating.four && hotelRating === 4) ||
        (rating.five && hotelRating === 5)
      );
    });

    setSearchDetail(filteredHotels);
  };

  const filterHotelByFacility = () => {
    if (query && facilities.every((facility) => !facility.checked)) {
      fetchSearchDetail(query);
      return;
    }

    let filteredHotels = searchDetailCopy;

    console.log("filtered hotels: " + filteredHotels);
    filteredHotels = filteredHotels.filter((hotel) => {
      return facilities.every((facility) => {
        return !facility.checked || hotel.facilities.includes(facility.name);
      });
    });

    setSearchDetail(filteredHotels);
  };

  const filterHotelByPrice = () => {
    if (query && price.min <= 0 && price.max <= 0) {
      fetchSearchDetail(query);
      return;
    }

    let filteredHotels = searchDetailCopy;
    console.log(searchDetailCopy);
    if (price.min > 0 && price.max <= 0) {
      filteredHotels = filteredHotels.filter((hotel) => {
        return hotel.startingPrice >= price.min;
      });
    } else if (price.max > 0 && price.min <= 0) {
      filteredHotels = filteredHotels.filter((hotel) => {
        return hotel.startingPrice <= price.max;
      });
    } else {
      console.log("harusnya sini");
      filteredHotels = filteredHotels.filter((hotel) => {
        return (
          hotel.startingPrice >= price.min && hotel.startingPrice <= price.max
        );
      });
    }

    setSearchDetail(filteredHotels);
  };

  const countLevel = (rating: number) => {
    let track = rating;
    let level = 0;
    let half = false;

    if (rating < 1) {
      level = 0;
      half = true;
    } else {
      for (let i = 0; i < 5; i++) {
        let rate = (track -= 1);
        if (rate === 0) {
          level = i + 1;
          break;
        } else if (rate < 0) {
          level = i;
          half = true;
          break;
        }
      }
    }

    return { level, half };
  };

  useEffect(() => {
    if (searchDetail) {
      const updatedSearchDetail = searchDetail.map((hotel: any) => {
        const { level, half } = countLevel(hotel.rating);
        return { ...hotel, level, half };
      });
      setSearchDetailLevel(updatedSearchDetail);
    }
  }, [searchDetail]);

  useEffect(() => {
    filterHotelByRating();
  }, [rating]);

  useEffect(() => {
    filterHotelByFacility();
  }, [facilities]);

  useEffect(() => {
    filterHotelByPrice();
  }, [price]);

  useEffect(() => {
    if (page) {
      if (parseInt(page) < 1) {
        navigate(`/search-hotel?query=${query}&page=1`);
      } else if (parseInt(page) > parseInt(pagination?.TotalPages)) {
        navigate(`/search-hotel?query=${query}&page=1`);
      }
    }

    if (query) {
      fetchSearchDetail(query);
    }
  }, [page]);

  useEffect(() => {
    fetchAllFacilities();
  }, []);

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
          <div className={styles.shBody}>
            <div className={styles.inBody}>
              <div className={styles.sidebar}>
                <div className={styles.sidebarPrice}>
                  <div className={styles.spLabel}>
                    <div className={styles.spLeft}>
                      <p className={styles.spLeftP}>Price Range</p>
                      <p className={styles.spLeftP}>Per room, per night</p>
                    </div>
                    <div className={styles.spRight}>
                      <div
                        className={styles.spRightB}
                        onClick={() => setPrice({ min: 0, max: 0 })}
                      >
                        Reset
                      </div>
                    </div>
                  </div>
                  <div className={styles.spField}>
                    <input
                      type="number"
                      name="min"
                      className={styles.fields}
                      placeholder="Min"
                      value={price.min}
                      onChange={(e) =>
                        setPrice({ ...price, min: parseInt(e.target.value) })
                      }
                    />
                    <input
                      type="number"
                      name="max"
                      className={styles.fields}
                      placeholder="Max"
                      value={price.max}
                      onChange={(e) =>
                        setPrice({ ...price, max: parseInt(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div className={styles.sidebarStar}>
                  <div>
                    <p className={styles.srP}>Star Rating</p>
                  </div>
                  <StarRating
                    name="one"
                    checked={rating.one}
                    onChange={handleRating}
                    level={1}
                  />
                  <StarRating
                    name="two"
                    checked={rating.two}
                    onChange={handleRating}
                    level={2}
                  />
                  <StarRating
                    name="three"
                    checked={rating.three}
                    onChange={handleRating}
                    level={3}
                  />
                  <StarRating
                    name="four"
                    checked={rating.four}
                    onChange={handleRating}
                    level={4}
                  />
                  <StarRating
                    name="five"
                    checked={rating.five}
                    onChange={handleRating}
                    level={5}
                  />
                </div>
                <div className={styles.sidebarFacility}>
                  <p className={styles.srP}>Facilities</p>
                  {facilities.map((facility) => (
                    <FacilityCheckbox
                      key={facility.name}
                      facility={facility}
                      onChange={handleFacility}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.content}>
                {isExist ? (
                  searchDetailLevel.map((hotel, index) => (
                    <HotelCard key={index} hotel={hotel} />
                  ))
                ) : (
                  <div className={styles.srP}>
                    There are no results for "{query}".
                  </div>
                )}
                <div className={styles.pages}>
                  {pagination?.CurrentPage > 1 && (
                    <div
                      className={styles.leftPage}
                      onClick={() =>
                        navigate(
                          `/search-hotel?query=${query}&page=${pagination.PreviousPage}`
                        )
                      }
                    >
                      {pagination?.PreviousPage}
                    </div>
                  )}
                  <div className={styles.disabled}>
                    {pagination?.CurrentPage}
                  </div>
                  {pagination?.CurrentPage < pagination?.TotalPages && (
                    <div
                      className={styles.rightPage}
                      onClick={() =>
                        navigate(
                          `/search-hotel?query=${query}&page=${pagination.NextPage}`
                        )
                      }
                    >
                      {pagination?.NextPage}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </>
      )}
    </>
  );
}

export default SearchHotel;
