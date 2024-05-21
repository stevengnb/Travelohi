package controllers

import (
	"backendgo/database"
	"backendgo/models"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type PaginationData struct {
	NextPage int
	PreviousPage int
	CurrentPage int
	TotalPages int
}

func GetSearchResult(c *fiber.Ctx) error {
	term := c.Query("term")

	if term == "" {
        return c.Status(http.StatusBadRequest).JSON(fiber.Map{
            "error": "No term",
        })
    }

    var hotels []models.Hotel
	searchQuery := "%" + term + "%"
	database.DB.Joins("JOIN cities ON hotels.city_id = cities.id").
    Joins("JOIN countries ON cities.country_id = countries.id").
    Where("hotels.name ILIKE ? OR cities.name ILIKE ? OR countries.name ILIKE ?", searchQuery, searchQuery, searchQuery).
    Find(&hotels)

	var countries []models.Country
	searchQuery2 := "%" + term + "%"
	database.DB.Where("name ILIKE ?", searchQuery2).Find(&countries)

	var cities []models.City
	searchQuery3 := "%" + term + "%"
	database.DB.
    Table("cities").
    Joins("JOIN countries ON cities.country_id = countries.id").
    Where("cities.name ILIKE ? OR countries.name ILIKE ?", searchQuery3, searchQuery3).
    Find(&cities)

	hotelNames := make([]string, len(hotels))
    for i, hotel := range hotels {
        hotelNames[i] = hotel.Name
    }

    countryNames := make([]string, len(countries))
    for i, country := range countries {
        countryNames[i] = country.Name
    }

    cityNames := make([]string, len(cities))
    for i, city := range cities {
        cityNames[i] = city.Name
    }

    return c.Status(http.StatusOK).JSON(fiber.Map{
        "hotels":    hotelNames,
        "countries": countryNames,
        "cities":    cityNames,
    })
} 	

func GetSearchDetail(c *fiber.Ctx) error {
	term := c.Query("term")
	pageStr := c.Query("page")
	page := 1
	perPage := 5
	
	if pageStr != "null" {
		page, _ = strconv.Atoi(pageStr)

		if(page < 1) {
			page = 1
		}
	}

	var totalData int64
	searchQuery := "%" + term + "%"
	database.DB.Model(&models.Hotel{}).
    Joins("JOIN cities ON hotels.city_id = cities.id").
    Joins("JOIN countries ON cities.country_id = countries.id").
    Where("hotels.name ILIKE ? OR cities.name ILIKE ? OR countries.name ILIKE ?", searchQuery, searchQuery, searchQuery).
    Count(&totalData)

	totalPages := math.Ceil(float64(totalData) / float64(perPage))

	offset := (page - 1) * perPage

	if term == "" {
        return c.Status(http.StatusBadRequest).JSON(fiber.Map{
            "error": "No term",
        })
    }

    var hotels []models.Hotel
	searchQuery = "%" + term + "%"
	database.DB.Joins("JOIN cities ON hotels.city_id = cities.id").
    Joins("JOIN countries ON cities.country_id = countries.id").
    Where("hotels.name ILIKE ? OR cities.name ILIKE ? OR countries.name ILIKE ?", searchQuery, searchQuery, searchQuery).
    Limit(perPage).Offset(offset).Find(&hotels)

	var result []fiber.Map

	for _, hotel := range hotels {
		var images []string
		err := json.Unmarshal([]byte(hotel.Images), &images)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to process images"})
		}

		var city models.City
        if err := database.DB.First(&city, hotel.CityID).Error; err != nil {
            return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get city"})
        }

        var country models.Country
        if err := database.DB.First(&country, city.CountryID).Error; err != nil {
            return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get country"})
        }

		var roomPrice int
        if err := database.DB.Table("room_details").
            Select("MIN(price) AS starting_price").
            Where("hotel_id = ?", hotel.ID).
            Group("hotel_id").
            Scan(&roomPrice).Error; err != nil {
            return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get room price"})
        }

		var hotelFacilities []models.HotelFacility
        var facilityNames []string
        if err := database.DB.Model(&models.HotelFacility{}).Where("hotel_id = ?", hotel.ID).Find(&hotelFacilities).Error; err != nil {
            return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get hotel facilities"})
        }
        for _, hf := range hotelFacilities {
            var facility models.Facility
            if err := database.DB.First(&facility, hf.FacilityID).Error; err != nil {
                return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get facility"})
            }
            facilityNames = append(facilityNames, facility.Name)
        }

		var ratingHotel models.Rating
		var overallRating float32
		if err := database.DB.First(&ratingHotel, "hotel_id = ?", hotel.ID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				overallRating = 0
			} else {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to search for rating"})
			}
		} else {
			overallRating = float32(ratingHotel.OverallRating)
		}

		hotelData := fiber.Map{
			"id":          hotel.ID,
			"name":        hotel.Name,
			"description": hotel.Description,
			"rating":      overallRating,
			"address":     hotel.Address,
			"images":      images,
			"city":    city.Name,
            "country": country.Name,
			"startingPrice": roomPrice,
			"facilities": facilityNames,
		}

		result = append(result, hotelData)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
        "hotels":    result,
		"pagination": PaginationData {
			NextPage: page + 1,
			PreviousPage: page - 1,
			CurrentPage: page,
			TotalPages: int(totalPages),
		},
    })
}

func GetHotelDetails(c *fiber.Ctx) error {
	id := c.Query("term")

	hotelId, err := strconv.ParseUint(id, 10, 0)
    if err != nil {
        fmt.Println("Error converting string to uint:", err)
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse hotel id"})
    }

	var hotel models.Hotel
	database.DB.First(&hotel, "id = ?", hotelId)

	if hotel.ID == 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "hotel not found",
		})
	}

	var images []string
	if err := json.Unmarshal([]byte(hotel.Images), &images); err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to process hotel images"})
	}

	var city models.City
	if err := database.DB.First(&city, hotel.CityID).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get city"})
	}

	var country models.Country
	if err := database.DB.First(&country, city.CountryID).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get country"})
	}

	var hotelFacilities []models.HotelFacility
	var facilityNames []string
	if err := database.DB.Model(&models.HotelFacility{}).Where("hotel_id = ?", hotel.ID).Find(&hotelFacilities).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get hotel facilities"})
	}
	for _, hf := range hotelFacilities {
		var facility models.Facility
		if err := database.DB.First(&facility, hf.FacilityID).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get facility"})
		}
		facilityNames = append(facilityNames, facility.Name)
	}
	
	var roomPrice int
	if err := database.DB.Table("room_details").
		Select("MIN(price) AS starting_price").
		Where("hotel_id = ?", hotel.ID).
		Group("hotel_id").
		Scan(&roomPrice).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get room price"})
	}

	var ratingHotel models.Rating
	var overallRating float32
	if err := database.DB.First(&ratingHotel, "hotel_id = ?", hotel.ID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			overallRating = 0
		} else {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to search for rating"})
		}
	} else {
		overallRating = float32(ratingHotel.OverallRating)
	}
	
	var reviews []models.Review
	if err := database.DB.Find(&reviews, "hotel_id = ?", hotel.ID).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to get reviews for the hotel"})
		}
	}

	hotelData := fiber.Map{
		"id":          hotel.ID,
		"name":        hotel.Name,
		"description": hotel.Description,
		"rating":      overallRating,
		"address":     hotel.Address,
		"images":      images,
		"city":   	   city.Name,
		"country": 	   country.Name,
		"facilities":  facilityNames,
		"price": roomPrice,
		"ratingDetail": ratingHotel,
		"reviews": reviews,
	}

	var rooms []models.RoomDetail
	if err := database.DB.Model(&models.RoomDetail{}).Where("hotel_id = ?", hotel.ID).Find(&rooms).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get rooms"})
	}

	var roomMaps []fiber.Map

	for _, room := range rooms {
		var images []string
		if err := json.Unmarshal([]byte(room.Images), &images); err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to unmarshal images"})
		}

		roomMap := fiber.Map{
			"id":           room.ID,
			"hotelId":      room.HotelID,
			"name":         room.Name,
			"guest":        room.Guest,
			"availability": room.Availability,
			"bed":          room.Bed,
			"price":        room.Price,
			"images":       images,
		}

		roomMaps = append(roomMaps, roomMap)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
        "hotels": hotelData,
		"rooms": roomMaps,
    })
}

func GetUserRecentSearch(c *fiber.Ctx) error {
	id := c.Query("term")

	userId, err := strconv.ParseUint(id, 10, 0)
    if err != nil {
        fmt.Println("Error converting string to uint:", err)
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse user id"})
    }

	var recent []models.Search
	database.DB.Order("search_date DESC").Limit(3).Find(&recent, "user_id = ?", userId)
	if len(recent) == 0 {
		return c.Status(http.StatusOK).JSON(fiber.Map{"recent": nil})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"recent": recent,
	})
}

func AddRecentSearch(c *fiber.Ctx) error {
	var data map[string]string

	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse body",
		})
	}

	userId, err := strconv.ParseUint(data["id"], 10, 64)
    if err != nil {
        fmt.Println("Error converting string to uint:", err)
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse user id"})
    }

	var existingRecent models.Search
	if err := database.DB.Where("user_id = ? AND search_term = ?", userId, data["term"]).First(&existingRecent).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to check existing recent searches",
			})
		}
	}
	
	if existingRecent.ID != 0 {
		existingRecent.SearchDate = time.Now()
	
		if err := database.DB.Save(&existingRecent).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to update existing recent search",
			})
		}
	
		return c.Status(http.StatusOK).JSON(fiber.Map{
			"message": "Search date updated successfully",
		})
	}
	newRecent := models.Search{
		UserID: uint(userId),
		SearchTerm: data["term"],
		SearchDate: time.Now(),
	}

	if err := database.DB.Create(&newRecent).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create new recent searches",
		})	
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
	})
}

func GetHotelRecommendations(c *fiber.Ctx) error {
	var hotels []models.Hotel
	database.DB.Limit(5).Find(&hotels)
	
	var result []fiber.Map

	for _, hotel := range hotels {
		var images []string
		err := json.Unmarshal([]byte(hotel.Images), &images)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to process images"})
		}

		var city models.City
        if err := database.DB.First(&city, hotel.CityID).Error; err != nil {
            return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get city"})
        }

        var country models.Country
        if err := database.DB.First(&country, city.CountryID).Error; err != nil {
            return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get country"})
        }

		var roomPrice int
        if err := database.DB.Table("room_details").
            Select("MIN(price) AS starting_price").
            Where("hotel_id = ?", hotel.ID).
            Group("hotel_id").
            Scan(&roomPrice).Error; err != nil {
            return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get room price"})
        }

		var ratingHotel models.Rating
		var overallRating float32
		if err := database.DB.First(&ratingHotel, "hotel_id = ?", hotel.ID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				overallRating = 0
			} else {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Failed to search for rating"})
			}
		} else {
			overallRating = float32(ratingHotel.OverallRating)
		}

		hotelData := fiber.Map{
			"id":          hotel.ID,
			"name":        hotel.Name,
			"description": hotel.Description,
			"rating":      overallRating,
			"images":      images,
			"city":    city.Name,
            "country": country.Name,
			"startingPrice": roomPrice,
		}

		result = append(result, hotelData)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
        "hotels":    result,
    })
}

func AddToCartFlight(c *fiber.Ctx) error {
	var data map[string] string

	if err:= c.BodyParser(&data); err != nil  {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse body",
		})
	}

	fmt.Println(data);

	totalSegment, err := strconv.Atoi(data["totalSegment"])
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse total segment",
		})
	}

	luggage, err := strconv.Atoi(data["luggage"])
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse luggage",
		})
	}

	userId, err := strconv.ParseUint(data["userId"], 10, 64)
    if err != nil {
        fmt.Println("Error converting string to uint:", err)
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse user id"})
    }

	flightId, err := strconv.ParseUint(data["flightId"], 10, 64)
    if err != nil {
        fmt.Println("Error converting string to uint:", err)
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse flight id"})
    }

	var seats []models.Seat
	for i := 0; i < totalSegment; i++ {
		if val, ok := data[fmt.Sprintf("%d", i)]; ok {
			if val == "undefined" {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Please choose a seat!",
				})
			}
			
			var seat models.Seat
			if err:= database.DB.Where("id = ?", val).First(&seat).Error; err != nil {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Seat error!",
				})
			}

			if seat.IsAvailable {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Please choose another seat!",
				})
			}

			seats = append(seats, seat)
			} else {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Please choose a seat!",
			})
		}
	}

	segments := strings.Split(data["flightSegmentIds"], ",")
    var flightSegmentIds []uint

    for _, segment := range segments {
        segmentID, err := strconv.ParseUint(segment, 10, 64)
        if err != nil {
			fmt.Println("error = ", err)
        }

        flightSegmentIds = append(flightSegmentIds, uint(segmentID))
    }

	fmt.Println(seats);
	var tickets []models.Ticket

	for i:= 0; i < len(seats); i++ {
		ticket := models.Ticket{
			FlightID: uint(flightId),
			SeatID: seats[i].ID,
			Luggage: luggage,
			UserID: uint(userId),
			Paid: false,
			FlightSegmentId: flightSegmentIds[i],
		}

		tickets = append(tickets, ticket)
	}

	for _, ticket := range tickets {
		if err := database.DB.Create(&ticket).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create new ticket",
			})	
		}
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
        "message":    "success",
    })
}

func GetCart(c *fiber.Ctx) error {
	term := c.Query("term") 
	
	var flightSegments []models.FlightSegment
	database.DB.Select("DISTINCT flight_segments.*").Joins("JOIN flight_segs AS fs ON fs.flight_segment_id = flight_segments.id").
	Joins("JOIN tickets AS t ON fs.flight_id = t.flight_id").
    Where("t.user_id = ? and t.paid = false", term).
	Find(&flightSegments)

	var cartDetailHotel []models.CartDetailHotel
	database.DB.Where("user_id = ? AND paid = false", term).Find(&cartDetailHotel)

	flightsMap := make(map[uint][]fiber.Map)
	for _, flightSegment := range flightSegments {
		var flightSeg models.FlightSeg
		var departureAirport, arrivalAirport models.Airport
		var flightRoute models.FlightRoute
		var airline models.Airline
		var airplane models.Airplane
		var ticket models.Ticket
		var seat models.Seat
		var seatType models.SeatType
		
		if err := database.DB.Where("flight_segment_id = ?", flightSegment.ID).First(&flightSeg).Error; err != nil {
			fmt.Println("Error:", err)
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get flight seg"})
		}
		if err := database.DB.First(&flightRoute, flightSegment.FlightRouteID).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get flight route"})
        }
		if err := database.DB.First(&arrivalAirport, flightRoute.ArrivalID).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get arrival airport"})
        }
		if err := database.DB.First(&departureAirport, flightRoute.DepartureID).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get departure airport"})
        }
		if err := database.DB.First(&airplane, flightSegment.AirplaneID).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get airplane"})
        }	
		if err := database.DB.First(&airline, airplane.AirlineID).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get airline"})
        }
		if err := database.DB.Where("flight_segment_id = ? AND paid = false", flightSegment.ID).First(&ticket).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get airline"})
        }
		fmt.Println("TICKETNYA ", ticket)
		if err := database.DB.First(&seat, ticket.SeatID).Error; err!= nil {
            return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get seat"})
        }
		if err := database.DB.Joins("JOIN seats AS s ON s.seat_type_id = seat_types.id").Where("seat_type_id = ?", seat.SeatTypeID).Find(&seatType).Error; err != nil {
            return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get seat type"})
		}

		
		flightData := fiber.Map{
			"flightSegmentID": flightSegment.ID,
			"departureDate": flightSegment.DepartureDate,
			"arrivalDate": flightSegment.ArrivalDate,
			"departureAirport": departureAirport.Name,
			"arrivalAirport": arrivalAirport.Name,
			"departureCode": departureAirport.Code,
			"arrivalCode": arrivalAirport.Code,
			"duration": flightRoute.FlightDuration,
			"price": flightRoute.FlightPrice,
			"airline": airline.AirlineName,
			"airplaneType": airplane.AirplaneType,
			"ticket": ticket,
			"seatCode": seat.Code,
			"seatType": seatType.SeatTypeName,
			"airplaneCode": airplane.AirplaneCode,
			"airportArrivalCode": arrivalAirport.Code,
			"airportDepartureCode": departureAirport.Code,
		}
		
		fmt.Println("fligtData = ", ticket, seat.Code)
		
		flightsMap[flightSeg.FlightID] = append(flightsMap[flightSeg.FlightID], flightData)
	}	

	var result []fiber.Map
	for flightID, flights := range flightsMap {
		transit := 0
		if len(flights) > 0 {
			transit += len(flights)
		}

		flightGroupData := fiber.Map{
			"transit": transit,
			"flights": flights,
			"flightId": flightID,
		}

		result = append(result, flightGroupData)
	}

	var resultHotel []fiber.Map
	for _, cartDetail := range cartDetailHotel {
		var hotel models.Hotel
		var roomDetail models.RoomDetail

		if err := database.DB.First(&hotel, cartDetail.HotelID).Error; err!= nil {
            return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get hotel"})
        }
		if err := database.DB.First(&roomDetail, cartDetail.RoomID).Error; err!= nil {
            return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get room detail"})
        }

		var images []string
		err := json.Unmarshal([]byte(hotel.Images), &images)
		if err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to process images"})
		}

		hotelData := fiber.Map{
			"cartId": cartDetail.ID,
            "hotelName": hotel.Name,
            "hotelAddress": hotel.Address,
            "roomName": roomDetail.Name,
            "roomBed": roomDetail.Bed,
			"roomGuest": roomDetail.Guest,
			"quantity": cartDetail.Quantity,
			"checkin": cartDetail.CheckIn,
			"checkout": cartDetail.CheckOut,
			"pernights": roomDetail.Price,
			"image": images[0],
        }

		resultHotel = append(resultHotel, hotelData)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
        "flight": result,
		"hotel": resultHotel,
    }) 
}

func UpdateCartHotel(c* fiber.Ctx) error {
	var data map[string] string

	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse body",
		})
	}

	fmt.Println(data)

	if(data["checkIn"] == "" || data["checkOut"] == "") {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "All field must be filled!",
        })
	}

	cartHotelId, err := strconv.ParseUint(data["cartHotelId"], 10, 0)
    if err != nil {
        fmt.Println("Error converting string to uint:", err)
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse cart id"})
    }

	checkIn, err := time.Parse("2006-01-02", data["checkIn"])
	if err != nil {
		fmt.Println("Error parsing check-in date:", err)
		return err
	}

	checkOut, err := time.Parse("2006-01-02", data["checkOut"])
	if err != nil {
		fmt.Println("Error parsing check-out date:", err)
		return err
	}

	if checkIn.Before(time.Now().Truncate(24 * time.Hour)) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Check-in date cannot be in the past!",
		})
	}

	if checkOut.Equal(checkIn) || checkOut.Before(checkIn) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Check-out date cannot less than or equal check in date!",
		})
	}

	var cartHotel models.CartDetailHotel
	database.DB.Where("id = ?", cartHotelId).Find(&cartHotel)
	if cartHotel.ID == 0 {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cart not found"})
    }

	cartHotel.CheckIn = checkIn
	cartHotel.CheckOut = checkOut
	
	if err := database.DB.Save(&cartHotel).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update cart ",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Search date updated successfully",
	})
}

func RemoveCartTicket(c *fiber.Ctx) error {
	term := c.Query("term")
	flightTerm := c.Query("flight")

	userId, err := strconv.ParseUint(term, 10, 64)
    if err != nil {
        fmt.Println("Error converting string to uint:", err)
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse user id"})
    }

	flightId, err := strconv.ParseUint(flightTerm, 10, 64)
    if err != nil {
        fmt.Println("Error converting string to uint:", err)
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse flight id"})
    }

	var tickets []models.Ticket
    if err := database.DB.Where("flight_id = ? AND user_id = ?", flightId, userId).Find(&tickets).Error; err != nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
            "error": "ticket not found",
        })
    }

	for _, ticket := range tickets {
		if err := database.DB.Delete(&ticket).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to tickets",
			})
		}
	}


	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
	})
}

func CheckPromo(c *fiber.Ctx) error {
	term := c.Query("term")
	termId := c.Query("user")

	userId, err := strconv.ParseUint(termId, 10, 64)
    if err != nil {
        fmt.Println("Error converting string to uint:", err)
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse user id"})
    }

	var promo models.Promo
	term = strings.ToUpper(term)
	if err:=database.DB.Where("promo_code = ?", term).First(&promo).Error; err!= nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Promo code not found",
			})
		}
	}

	if time.Now().After(promo.ExpiryDate) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Promo code has expired",
		})
	}

	var userPromo models.UserPromo
	database.DB.Where("promo_id = ? AND user_id = ?", promo.ID, userId).First(&userPromo)
	if userPromo.ID != 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Promo code has already been used by the user",
		})
	}

	fmt.Println(promo.Percentage)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": promo.Percentage,
	})
}

func RemoveCartHotel(c *fiber.Ctx) error {
	term := c.Query("term")

	cartId, err := strconv.ParseUint(term, 10, 64)
    if err != nil {
        fmt.Println("Error converting string to uint:", err)
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse cart id"})
    }

	var cart models.CartDetailHotel
    if err := database.DB.Where("id = ?", cartId).Find(&cart).Error; err != nil {
        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
            "error": "cart not found",
        })
    }
	
	if err := database.DB.Delete(&cart).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to tickets",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "success",
	})
}

func AddToCart(c *fiber.Ctx) error {
	var data map[string] string

	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse body",
		})
	}

	if(data["hotelId"] == "" || data["userId"] == "" || data["roomId"] == "") {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map {
			"error": "Unauthorized",
		})
	}


	if(data["checkIn"] == "" || data["checkOut"] == "" || data["quantity"] == "") {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "All field must be filled!",
        })
	}

	checkIn, err := time.Parse("2006-01-02", data["checkIn"])
	if err != nil {
		fmt.Println("Error parsing check-in date:", err)
		return err
	}

	checkOut, err := time.Parse("2006-01-02", data["checkOut"])
	if err != nil {
		fmt.Println("Error parsing check-out date:", err)
		return err
	}

	if checkIn.Before(time.Now().Truncate(24 * time.Hour)) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Check-in date cannot be in the past!",
		})
	}

	if checkOut.Equal(checkIn) || checkOut.Before(checkIn) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Check-out date cannot less than or equal check in date!",
		})
	}

	userId, err := strconv.ParseUint(data["userId"], 10, 64)
    if err != nil {
        fmt.Println("Error converting string to uint:", err)
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse user id"})
    }

	hotelId, err := strconv.ParseUint(data["hotelId"], 10, 64)
    if err != nil {
        fmt.Println("Error converting string to uint:", err)
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse hotel id"})
    }

	roomId, err := strconv.ParseUint(data["roomId"], 10, 64)
    if err != nil {
        fmt.Println("Error converting string to uint:", err)
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse room id"})
    }
	
	quantity, _ := strconv.Atoi(data["quantity"])

	var existingCartDetail models.CartDetailHotel
	database.DB.Where("hotel_id = ? AND room_id = ? AND check_in = ? AND check_out = ? AND paid = false",
		hotelId, roomId, checkIn, checkOut).First(&existingCartDetail)

	if existingCartDetail.ID != 0 {
		existingCartDetail.Quantity += quantity

		if err := database.DB.Model(&models.CartDetailHotel{}).Where("id = ?", existingCartDetail.ID).Updates(&existingCartDetail).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to update cart detail",
			})
		}
		return c.Status(http.StatusOK).JSON(fiber.Map{
			"message": "Cart detail updated!",
		})
	}

	cartDetailHotel := models.CartDetailHotel {
		HotelID: uint(hotelId),
		RoomID: uint(roomId),
		CheckIn: checkIn,
		CheckOut: checkOut,
		Quantity: quantity,
		UserID: uint(userId),
		Paid: false,
	}

	if err := database.DB.Create(&cartDetailHotel).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create new cart detail hotel",
		})	
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
        "message":    "success",
    }) 
}

func BookWithWallet(c *fiber.Ctx) error {
	var data map[string] string

	if err := c.BodyParser(&data); err!= nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Failed to parse body",
        })
    }

	fmt.Println(data);

	ticketIds := strings.Split(data["flightTicketIds"], ",")
	cartHotelIds := strings.Split(data["hotelCartIds"], ",")

	price, err := strconv.ParseFloat(data["price"], 64)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse price",
		})
	}

	userId, err := strconv.ParseUint(data["userId"], 10, 64)
    if err != nil {
        fmt.Println("Error converting string to uint:", err)
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse user id"})
    }

	var user models.User
	database.DB.Where("id = ?", userId).Find(&user);
	walletBalance := float64(user.HiWallet)

	if(walletBalance >= price) {
		// balance enough
		walletBalance -= price

		if !(len(cartHotelIds) == 1 && cartHotelIds[0] == "") {
			fmt.Println("ganti hotel di cart jadi paid")
			var hotelCarts []models.CartDetailHotel
			database.DB.Where("id IN (?)", cartHotelIds).Find(&hotelCarts)
	
			for _, hotel := range hotelCarts {
				hotel.Paid = true;

				if err := database.DB.Save(&hotel).Error; err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"error": "Failed to update cart hotel",
					})
				}
			}
		}

		if !(len(ticketIds) == 1 && ticketIds[0] == "") {
			fmt.Println("ganti flight di cart jadi paid")
			var tickets []models.Ticket
			database.DB.Where("ticket_id IN (?)", ticketIds).Find(&tickets)

			fmt.Println(tickets)

			for _, ticket := range tickets {
                ticket.Paid = true;
				fmt.Println("ticketnya = ", ticket.TicketID)

				var seat models.Seat
				database.DB.Where("id = ?", ticket.SeatID).Find(&seat)

				seat.IsAvailable = true

				if err := database.DB.Save(&seat).Error; err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"error": "Failed to update seat",
					})
				}

				if err := database.DB.Save(&ticket).Error; err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"error": "Failed to update cart flight",
					})
				}
			}
		}

		
		if data["promoCode"] != "" {
			fmt.Println("use promo code")
			var term = strings.ToUpper(data["promoCode"])
			var promo models.Promo
			term = strings.ToUpper(term)

			if err := database.DB.Where("promo_code = ?", term).First(&promo).Error; err!= nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
						"error": "Promo code not found",
					})
				}
			}

			promoNew := models.UserPromo {
				UserID: uint(userId),
				PromoID: promo.ID,
			}

			if err := database.DB.Create(&promoNew).Error; err != nil {
				return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
					"error": "Failed to create new user promo",
				})	
			}
		} else {
			fmt.Println("ga pake promo")
		}

		user.HiWallet = int(walletBalance)

		if err := database.DB.Save(&user).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to update user",
			})
		}
	} else {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Insufficient balance",
        })
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
        "message":    "success",
    }) 
}

func GetSearchDetailFlight(c *fiber.Ctx) error {
	term := c.Query("term")

	var flightSegments []models.FlightSegment
	searchQuery := "%" + term + "%"
	// fmt.Println(searchQuery)
	database.DB.Joins("JOIN flight_routes AS fr ON flight_segments.flight_route_id = fr.id").
    Joins("JOIN airports AS aa ON fr.arrival_id = aa.id").
    Joins("JOIN airports AS ab ON fr.departure_id = ab.id").
    Joins("JOIN cities AS cc ON fr.arrival_id = cc.id").
    Joins("JOIN cities AS cd ON fr.departure_id = cd.id").
    Joins("JOIN countries AS cr ON cc.country_id = cr.id").
    Joins("JOIN countries AS cs ON cd.country_id = cs.id").
    Where("cd.name ILIKE ? OR ab.code ILIKE ? OR ab.name ILIKE ? OR cs.name ILIKE ? OR cc.name ILIKE ? OR aa.code ILIKE ? OR aa.name ILIKE ? OR cr.name ILIKE ?", searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery).
	// Where("NOT EXISTS (SELECT 1 FROM flight_segs WHERE flight_segments.id = flight_segs.flight_segment_id GROUP BY flight_segs.flight_id HAVING COUNT(flight_segs.flight_id) > 1)").
	Find(&flightSegments)

	flightsMap := make(map[uint][]fiber.Map)
	for _, flightSegment := range flightSegments {
		var flightSeg models.FlightSeg
		var departureAirport, arrivalAirport models.Airport
		var flightRoute models.FlightRoute
		var airline models.Airline
		var airplane models.Airplane
		
		if err := database.DB.Where("flight_segment_id = ?", flightSegment.ID).First(&flightSeg).Error; err != nil {
			fmt.Println("Error:", err)
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get flight seg"})
		}
		if err := database.DB.First(&flightRoute, flightSegment.FlightRouteID).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get flight route"})
        }
		if err := database.DB.First(&arrivalAirport, flightRoute.ArrivalID).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get arrival airport"})
        }
		if err := database.DB.First(&departureAirport, flightRoute.DepartureID).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get departure airport"})
        }
		if err := database.DB.First(&airplane, flightSegment.AirplaneID).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get airplane"})
        }	
		if err := database.DB.First(&airline, airplane.AirlineID).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get airline"})
        }

		flightData := fiber.Map{
			"flightSegmentID": flightSegment.ID,
			"departureDate": flightSegment.DepartureDate,
			"arrivalDate": flightSegment.ArrivalDate,
			"departureAirport": departureAirport.Name,
			"arrivalAirport": arrivalAirport.Name,
			"departureCode": departureAirport.Code,
			"arrivalCode": arrivalAirport.Code,
			"duration": flightRoute.FlightDuration,
			"price": flightRoute.FlightPrice,
			"airline": airline.AirlineName,
		}

		flightsMap[flightSeg.FlightID] = append(flightsMap[flightSeg.FlightID], flightData)
	}

	var result []fiber.Map
	for flightID, flights := range flightsMap {
		transit := 0
		if len(flights) > 0 {
			transit += len(flights)
		}

		flightGroupData := fiber.Map{
			"transit": transit,
			"flights": flights,
			"id": flightID,
		}

		result = append(result, flightGroupData)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
        "flight": result,
    }) 
}


func GetFlightSearchResult(c *fiber.Ctx) error {
	term := c.Query("term")

	if term == "" {
        return c.Status(http.StatusBadRequest).JSON(fiber.Map{
            "error": "No term",
        })
    }

    var airports []models.Airport
	searchQuery := "%" + term + "%"
	database.DB.Joins("JOIN cities ON airports.city_id = cities.id").
    Joins("JOIN countries ON cities.country_id = countries.id").
    Where("airports.name ILIKE ? OR airports.code ILIKE ? OR cities.name ILIKE ? OR countries.name ILIKE ?", searchQuery, searchQuery, searchQuery, searchQuery).
    Find(&airports)

	var countries []models.Country
	searchQuery2 := "%" + term + "%"
	database.DB.Where("name ILIKE ?", searchQuery2).Find(&countries)

	var cities []models.City
	searchQuery3 := "%" + term + "%"
	database.DB.
    Table("cities").
    Joins("JOIN countries ON cities.country_id = countries.id").
    Where("cities.name ILIKE ? OR countries.name ILIKE ?", searchQuery3, searchQuery3).
    Find(&cities)

	airportNames := make([]string, len(airports))
    for i, airport := range airports {
        airportNames[i] = airport.Name
    }

    countryNames := make([]string, len(countries))
    for i, country := range countries {
        countryNames[i] = country.Name
    }

    cityNames := make([]string, len(cities))
    for i, city := range cities {
        cityNames[i] = city.Name
    }

    return c.Status(http.StatusOK).JSON(fiber.Map{
        "airports":    airportNames,
        "countries": countryNames,
        "cities":    cityNames,
    })
} 	

func GetFlightDetails(c *fiber.Ctx) error {
	id := c.Query("term")

	flightId, err := strconv.ParseUint(id, 10, 0)
    if err != nil {
        fmt.Println("Error converting string to uint:", err)
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse flight id"})
    }

	var flightSegments []models.FlightSegment
	database.DB.Joins("JOIN flight_segs AS fse ON flight_segments.id = fse.flight_segment_id").
	Where("fse.flight_id = ?", flightId).
	Find(&flightSegments)
	
	
	var result []fiber.Map
	for _, flightSegment := range flightSegments {
		var airplane models.Airplane
		var airline models.Airline
		var flightRoute models.FlightRoute
		var arrivalAirport models.Airport
		var departureAirport models.Airport

		if err := database.DB.First(&flightRoute, flightSegment.FlightRouteID).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get flight route"})
        }
		if err := database.DB.First(&airplane, flightSegment.AirplaneID).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get airplane"})
        }
		if err := database.DB.First(&airline, airplane.AirlineID).Error; err!= nil {
            return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get airline"})
        }
		if err := database.DB.First(&arrivalAirport, flightRoute.ArrivalID).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get arrival airport"})
        }
		if err := database.DB.First(&departureAirport, flightRoute.DepartureID).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get departure airport"})
        }

		var seats []models.Seat
		database.DB.Joins("JOIN airplane_seats AS ais ON ais.seat_id = seats.id").Where("ais.airplane_id = ?", airplane.ID). Order("seats.id").Find(&seats)

		var resultSeat []fiber.Map
		for _, seat := range seats {
			var resultSeatType models.SeatType
			database.DB.Find(&resultSeatType, seat.SeatTypeID)

			resultSeat = append(resultSeat, fiber.Map{
                "ID": seat.ID,
                "code": seat.Code,
                "available": seat.IsAvailable,
                "type": seat.SeatTypeID,
				"typeName": resultSeatType.SeatTypeName,
            })
		}

		flightData := fiber.Map{
			"flightSegmentID": flightSegment.ID,
			"departureDate": flightSegment.DepartureDate,
			"arrivalDate": flightSegment.ArrivalDate,
			"airplaneType": airplane.AirplaneType,
			"airplaneCode": airplane.AirplaneCode,
			"airlineName": airline.AirlineName,
			"price": flightRoute.FlightPrice,
			"duration": flightRoute.FlightDuration,
			"airportArrivalName": arrivalAirport.Name,
			"airportArrivalCode": arrivalAirport.Code,
			"airportDepartureName": departureAirport.Name,
			"airportDepartureCode": departureAirport.Code,
			"seats": resultSeat,
		}

		result = append(result, flightData)
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
        "flight": result, 
    })
}

func UpdateWallet (c *fiber.Ctx) error {
	var data map[string] string

	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to parse body",
		})
	}
	
	userId, err := strconv.ParseUint(data["userId"], 10, 0)
    if err != nil {
        fmt.Println("Error converting string to uint:", err)
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse user id"})
    }

	var user models.User
	database.DB.Where("id = ?", userId).Find(&user)
	if user.ID == 0 {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "user not found"})
    }

	user.HiWallet += 1000000

	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update wallet ",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message": "Search date updated successfully",
	})
}