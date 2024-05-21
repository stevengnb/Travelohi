package models

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

type FlightRoute struct {
	gorm.Model
	ArrivalID uint `json:"arrivalId"`
	DepartureID uint `json:"departureId"`
	FlightDuration int `json:"duration"`
	FlightPrice int `json:"price"`
}

type FlightRouteAirline struct {
	FlightRouteID uint `json:"flightRoute"`
	AirlineID uint `json:"airlineId"`	
}

type Airline struct {
	gorm.Model
	AirlineName string `json:"airlineName"`
}

type Airplane struct {
	gorm.Model
	AirlineID uint `json:"airlineId"`
	AirplaneType string `json:"airplaneType"`
	AirplaneCode string `json:"airplaneCode"`
	CapacitySeat int `json:"capacitySeat"`
	Seats        []Seat `gorm:"many2many:airplane_seats;" json:"seats"`
}

type Seat struct {
    gorm.Model
    Code   string `json:"code"`
	IsAvailable bool `json:"isAvailable"`
	SeatTypeID uint `json:"seatTypeId"`
}

type SeatType struct {
	gorm.Model
	SeatTypeName string `json:"seatTypeName"`
}

type FlightSegment struct {
	gorm.Model
	DepartureDate time.Time `json:"departureDate"`
	ArrivalDate time.Time `json:"arrivalDate"`
	AirplaneID uint `json:"AirplaneId"`
	FlightRouteID uint `json:"flightRouteId"`
}

type Flight struct {
	gorm.Model
}

type FlightSeg struct {
	FlightID uint `json:"flightId"`
	FlightSegmentID uint `json:"flightSegmentId"`
}

func MigrateFlightRoute(db *gorm.DB) error {
	err := db.AutoMigrate(&FlightRoute{})
    return err
}

func MigrateFlightRouteAirline(db *gorm.DB) error {
	err := db.AutoMigrate(&FlightRouteAirline{})
    return err
}

func MigrateSeat(db *gorm.DB) error {
	err := db.AutoMigrate(&Seat{})
    return err
}

func MigrateSeatType(db *gorm.DB) error {
    err := db.AutoMigrate(&SeatType{})
    return err
}

func MigrateFlightSegment(db *gorm.DB) error {
	err := db.AutoMigrate(&FlightSegment{})
    return err
}

func MigrateFlight (db *gorm.DB) error {
	err := db.AutoMigrate(&Flight{})
    return err
}

func MigrateAirline(db *gorm.DB) error {
	err := db.AutoMigrate(&Airline{})
    return err
}

func MigrateAirplane(db *gorm.DB) error {
	err := db.AutoMigrate(&Airplane{})
    return err
}

func MigrateFlightSeg(db *gorm.DB) error {
	err := db.AutoMigrate(&FlightSeg{})
    return err
}

func MigrateFlightAll(db *gorm.DB) error {
    if err := MigrateFlightRoute(db); err != nil {
        return fmt.Errorf("error migrating flight route: %w", err)
    }
    if err := MigrateFlightRouteAirline(db); err != nil {
        return fmt.Errorf("error migrating flight route airline: %w", err)
    }
    if err := MigrateSeat(db); err != nil {
        return fmt.Errorf("error migrating seat: %w", err)
    }
	if err := MigrateSeatType(db); err != nil {
        return fmt.Errorf("error migrating seat type: %w", err)
    }
	if err := MigrateFlight(db); err != nil {
        return fmt.Errorf("error migrating flight: %w", err)
    }
	if err := MigrateAirline(db); err != nil {
        return fmt.Errorf("error migrating airline: %w", err)
    }
	if err := MigrateAirplane(db); err != nil {
        return fmt.Errorf("error migrating airplane: %w", err)
    }
	if err := MigrateFlightSegment(db); err != nil {
        return fmt.Errorf("error migrating flight segment: %w", err)
    }
	if err := MigrateFlightSeg(db); err != nil {
        return fmt.Errorf("error migrating flight seg: %w", err)
    }

    return nil
}

func generateSeats(totalSeats [3]int, seatType [3]int) []Seat {
    var seats []Seat	

    for i := 0; i < 3; i++ {
        for j := 1; j <= totalSeats[i]; j++ {
            seatCode := fmt.Sprintf("%dA", j)
            seat := Seat{
                Code:        seatCode,
                IsAvailable: false,
                SeatTypeID:  uint(seatType[i]),
            }
            seats = append(seats, seat)
        }
    }

    return seats
}

func SeedFlight(db *gorm.DB) error {
	// Seed Seat Type
	seatTypes := []SeatType{
		{SeatTypeName: "Economy Class"},
		{SeatTypeName: "Business Class"},
		{SeatTypeName: "First Class"},
	}

	for _, seatType := range seatTypes {
		if err := db.Create(&seatType).Error; err!= nil {
			fmt.Println(err)
            return err
        }
	}

	// Seed Airline
	airlines := []Airline{
		{AirlineName: "Emirates"},
		{AirlineName: "Delta Air Lines"},
		{AirlineName: "American Airlines"},
		{AirlineName: "United Airlines"},
		{AirlineName: "Lufthansa"},
		{AirlineName: "British Airways"},
		{AirlineName: "Air France"},
		{AirlineName: "Qatar Airways"},
		{AirlineName: "Singapore Airlines"},
		{AirlineName: "Cathay Pacific Airways"},
	}

	for _, airline := range airlines {
		if err := db.Create(&airline).Error; err!= nil {
			fmt.Println(err)
            return err
        }
	}

	airplaneTypes := []string{
        "Boeing 737",
        "Airbus A380",
        "Boeing 777",
        "Airbus A320",
        "Boeing 747",
        "Airbus A350",
        "Embraer E190",
        "Bombardier CRJ900",
        "Boeing 787 Dreamliner",
        "Airbus A330",
    }

	var airplaneCodes = [20]string{
		"BG-362", "BR-736", "BO-589", "AB-874", "BI-745",
		"SA-647", "EM-126", "BR-510", "DL-654", "DL-921",
		"BO-402", "BG-997", "EM-893", "SA-318", "AI-623",
		"RB-387", "AI-185", "AB-519", "RB-840", "BI-231",
	}
	
	var airplaneTypesIdx = [20] int {
		2, 7, 4, 1, 0,
		5, 6, 7, 8, 8,
		4, 2, 6, 5, 3,
		9, 3, 1, 9, 0,
	}

	totalSeats := [3]int{100, 50, 20}
	seatType := [3]int{1, 2, 3}
	var airlineCounter int = 1
	for i :=  0; i < 20; i++ {
		
		seats := generateSeats(totalSeats, seatType)

		airplane := Airplane{
			AirlineID: uint(airlineCounter),
			AirplaneType: airplaneTypes[airplaneTypesIdx[i]],
			AirplaneCode: airplaneCodes[i],
			CapacitySeat: 185,
			Seats:        seats,
		}

		if err := db.Create(&airplane).Error; err!= nil {
			fmt.Println(err)
			return err
		}
		if i % 2 == 1 {
			airlineCounter++
		}
	}

	// Flight Route
	flightRoutes := []FlightRoute{
		{DepartureID: 1, ArrivalID: 2, FlightDuration: 360, FlightPrice: 5300000},
		{DepartureID: 1, ArrivalID: 5, FlightDuration: 300, FlightPrice: 8800000},
		{DepartureID: 1, ArrivalID: 7, FlightDuration: 210, FlightPrice: 8200000},
		{DepartureID: 1, ArrivalID: 18, FlightDuration: 270, FlightPrice: 7900000},
		{DepartureID: 2, ArrivalID: 1, FlightDuration: 270, FlightPrice: 7300000},
		{DepartureID: 2, ArrivalID: 9, FlightDuration: 360, FlightPrice: 7600000},
		{DepartureID: 2, ArrivalID: 17, FlightDuration: 360, FlightPrice: 7100000},
		{DepartureID: 3, ArrivalID: 4, FlightDuration: 120, FlightPrice: 9300000},
		{DepartureID: 3, ArrivalID: 13, FlightDuration: 270, FlightPrice: 5900000},
		{DepartureID: 4, ArrivalID: 3, FlightDuration: 240, FlightPrice: 6500000},
		{DepartureID: 4, ArrivalID: 7, FlightDuration: 240, FlightPrice: 7700000},
		{DepartureID: 5, ArrivalID: 1, FlightDuration: 240, FlightPrice: 6600000},
		{DepartureID: 6, ArrivalID: 1, FlightDuration: 360, FlightPrice: 6900000},
		{DepartureID: 6, ArrivalID: 17, FlightDuration: 420, FlightPrice: 7800000},
		{DepartureID: 7, ArrivalID: 6, FlightDuration: 300, FlightPrice: 7400000},
		{DepartureID: 7, ArrivalID: 11, FlightDuration: 240, FlightPrice: 9200000},
		{DepartureID: 7, ArrivalID: 13, FlightDuration: 330, FlightPrice: 6600000},
		{DepartureID: 8, ArrivalID: 1, FlightDuration: 270, FlightPrice: 6500000},
		{DepartureID: 9, ArrivalID: 3, FlightDuration: 180, FlightPrice: 5400000},
		{DepartureID: 9, ArrivalID: 9, FlightDuration: 330, FlightPrice: 8700000},
		{DepartureID: 9, ArrivalID: 12, FlightDuration: 210, FlightPrice: 8400000},
		{DepartureID: 9, ArrivalID: 16, FlightDuration: 120, FlightPrice: 7800000},
		{DepartureID: 9, ArrivalID: 18, FlightDuration: 330, FlightPrice: 8700000},
		{DepartureID: 9, ArrivalID: 20, FlightDuration: 240, FlightPrice: 7800000},
		{DepartureID: 10, ArrivalID: 2, FlightDuration: 180, FlightPrice: 7600000},
		{DepartureID: 10, ArrivalID: 19, FlightDuration: 330, FlightPrice: 6800000},
		{DepartureID: 11, ArrivalID: 6, FlightDuration: 240, FlightPrice: 5800000},
		{DepartureID: 11, ArrivalID: 14, FlightDuration: 420, FlightPrice: 5700000},
		{DepartureID: 11, ArrivalID: 15, FlightDuration: 300, FlightPrice: 6400000},
		{DepartureID: 11, ArrivalID: 6, FlightDuration: 240, FlightPrice: 5800000},
		{DepartureID: 12, ArrivalID: 13, FlightDuration: 180, FlightPrice: 5400000},
		{DepartureID: 13, ArrivalID: 6, FlightDuration: 330, FlightPrice: 7300000},
		{DepartureID: 13, ArrivalID: 11, FlightDuration: 360, FlightPrice: 6800000},
		{DepartureID: 14, ArrivalID: 1, FlightDuration: 180, FlightPrice: 9700000},
		{DepartureID: 14, ArrivalID: 3, FlightDuration: 420, FlightPrice: 9100000},
		{DepartureID: 14, ArrivalID: 4, FlightDuration: 240, FlightPrice: 6500000},
		{DepartureID: 14, ArrivalID: 3, FlightDuration: 420, FlightPrice: 9100000},
		{DepartureID: 15, ArrivalID: 10, FlightDuration: 120, FlightPrice: 6200000},
		{DepartureID: 15, ArrivalID: 12, FlightDuration: 120, FlightPrice: 6100000},
		{DepartureID: 16, ArrivalID: 4, FlightDuration: 300, FlightPrice: 9500000},
		{DepartureID: 16, ArrivalID: 17, FlightDuration: 300, FlightPrice: 8900000},
		{DepartureID: 17, ArrivalID: 9, FlightDuration: 210, FlightPrice: 7800000},
		{DepartureID: 17, ArrivalID: 14, FlightDuration: 330, FlightPrice: 6100000},
		{DepartureID: 18, ArrivalID: 5, FlightDuration: 180, FlightPrice: 6200000},
		{DepartureID: 18, ArrivalID: 20, FlightDuration: 330, FlightPrice: 9900000},
		{DepartureID: 19, ArrivalID: 14, FlightDuration: 210, FlightPrice: 9600000},
		{DepartureID: 19, ArrivalID: 16, FlightDuration: 270, FlightPrice: 6900000},
		{DepartureID: 20, ArrivalID: 11, FlightDuration: 300, FlightPrice: 7900000},
	}	

	for _, flightRoute := range flightRoutes {
		if err := db.Create(&flightRoute).Error; err != nil {
			fmt.Println(err)
			return err
		} 
	}

	// Flight Airline Route
	allRoutes := [][]uint{
		1: {1, 3, 5, 7, 8, 9, 10, 11, 13, 15, 16, 18, 19, 20, 21, 22, 23, 24, 25, 27},
		2: {2, 4, 6, 12, 14, 17, 22, 23, 24, 27, 29, 30, 33, 34, 35, 36, 37, 38, 40, 41},
		3: {1, 2, 4, 7, 9, 10, 11, 13, 14, 16, 17, 20, 23, 24, 25, 26, 27, 28, 30, 32},
		4: {3, 5, 6, 8, 12, 15, 18, 19, 21, 22, 26, 28, 31, 32, 36, 37, 39, 40, 42, 43},
		5: {1, 2, 3, 4, 6, 7, 11, 12, 14, 15, 17, 18, 20, 23, 25, 26, 27, 29, 31, 33},
		6: {4, 5, 8, 9, 10, 13, 16, 19, 22, 24, 26, 27, 29, 31, 33, 34, 35, 37, 38, 40},
		7: {1, 2, 3, 5, 6, 7, 9, 11, 12, 14, 15, 17, 19, 21, 22, 25, 26, 28, 30, 32},
		8: {4, 8, 10, 13, 14, 16, 18, 20, 23, 24, 25, 26, 27, 28, 30, 31, 32, 34, 35, 37},
		9: {1, 2, 3, 4, 6, 8, 9, 10, 13, 15, 17, 20, 21, 22, 24, 25, 28, 29, 31, 33},
		10: {5, 7, 11, 12, 14, 16, 18, 19, 21, 23, 25, 26, 27, 28, 29, 30, 32, 34, 36, 37},
	}

	var flightRouteAirlines []FlightRouteAirline

	for airlineID, routeIDs := range allRoutes {
		for _, routeID := range routeIDs {
			flightRouteAirlines = append(flightRouteAirlines, FlightRouteAirline{
				FlightRouteID: routeID,
				AirlineID:     uint(airlineID),
			})
		}
	}

	for _, flightRouteAirline := range flightRouteAirlines {
        if err := db.Create(&flightRouteAirline).Error; err!= nil {
			fmt.Println(err)
			return err
		}
	}

	flightSegments := []FlightSegment{
		{DepartureDate: time.Now().AddDate(0, 0, 4), ArrivalDate: time.Now().Add(360 * time.Minute).AddDate(0, 0, 4), AirplaneID: 1, FlightRouteID: 1},
		{DepartureDate: time.Now().AddDate(0, 0, 5), ArrivalDate: time.Now().Add(270 * time.Minute).AddDate(0, 0, 5), AirplaneID: 15, FlightRouteID: 4},
		{DepartureDate: time.Now().AddDate(0, 0, 6), ArrivalDate: time.Now().Add(210 * time.Minute).AddDate(0, 0, 6), AirplaneID: 9, FlightRouteID: 3},
		{DepartureDate: time.Now().AddDate(0, 0, 8), ArrivalDate: time.Now().Add(240 * time.Minute).AddDate(0, 0, 8), AirplaneID: 5, FlightRouteID: 10},
		{DepartureDate: time.Now().AddDate(0, 0, 10), ArrivalDate: time.Now().Add(420 * time.Minute).AddDate(0, 0, 10), AirplaneID: 3, FlightRouteID: 14},
		{DepartureDate: time.Now().AddDate(0, 0, 12), ArrivalDate: time.Now().Add(210 * time.Minute).AddDate(0, 0, 12), AirplaneID: 2, FlightRouteID: 3},
		{DepartureDate: time.Now().AddDate(0, 0, 13), ArrivalDate: time.Now().Add(330 * time.Minute).AddDate(0, 0, 13), AirplaneID: 10, FlightRouteID: 17},
	}

	for _, flightSegment := range flightSegments {
		if err:= db.Create(&flightSegment).Error; err != nil {
			fmt.Println(err)
			return err
		}
	}

	flights := []Flight{
		{}, {},	{}, {},	{}, {},
	}

	for _, flight := range flights {
		if err:= db.Create(&flight).Error; err != nil {
			fmt.Println(err)
			return err
		}
	}

	flightSegs := []FlightSeg {
		{FlightSegmentID: 1, FlightID: 1},
        {FlightSegmentID: 2, FlightID: 2},
        {FlightSegmentID: 3, FlightID: 3},
        {FlightSegmentID: 4, FlightID: 4},
        {FlightSegmentID: 5, FlightID: 5},
        {FlightSegmentID: 6, FlightID: 6},
        {FlightSegmentID: 7, FlightID: 6},
	}

	for _, flightSeg := range flightSegs {
		if err:= db.Create(&flightSeg).Error; err != nil {
			fmt.Println(err)
			return err
		}
	}

	return nil
}