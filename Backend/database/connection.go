package database

import (
	"backendgo/models"
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
    dbUsername := "postgres"
    dbPassword := "mauganti312"
    dbName := "travelohi"
    connStr:= fmt.Sprintf("host=localhost user=%s database=%s password=%s sslmode=disable", dbUsername, dbName, dbPassword)
    connection, err := gorm.Open(postgres.Open(connStr), &gorm.Config{})

    if err != nil {
        panic(err)
    }
	
	if err := models.MigrateUser(connection); err != nil {
		panic("could not perform database migrations (user): " + err.Error())
    }

    if err := models.MigrateOtp(connection); err != nil {
        panic("could not perform database migrations (otp): " + err.Error())
    }

    if err := models.MigrateCreditCard(connection); err != nil {
        panic("could not perform database migrations (credit card): " + err.Error())
    }

    if err := models.MigrateUserCreditCard(connection); err != nil {
        panic("could not perform database migrations (user credit card): " + err.Error())
    }

    if err := models.MigratePromo(connection); err != nil {
        panic("could not perform database migrations (promo): " + err.Error())
    }

    if err := models.MigrateUserPromo(connection); err != nil {
        panic("could not perform database migrations (user promo): " + err.Error())
    }

    // Country, City, Airport
    models.MigrateACC(connection)
    // models.SeedAirports(connection)
    // models.SeedACC(connection)

    // Hotel
    models.MigrateHotelAll(connection)
    // models.SeedFacility(connection)
    // models.SeedHotel(connection)
    // models.MigrateAirport(connection)
    // models.SeedAirports(connection)

    // Rating, Review
    models.MigrateRatingReview(connection)
    // models.SeedRatingReview(connection)

    // Recent Search
    models.MigrateSearch(connection)
    // models.SeedSearch(connection)

    // Cart
    models.MigrateCarts(connection)

    // Seat + Airplane
    models.MigrateFlightAll(connection)
    // models.SeedFlight(connection)
    
    // Promo
	// if err := models.SeedDataPromo(connection); err != nil {
	// 	panic("could not seed data: " + err.Error())
	// }

	// if err := models.SeedDataUPA(connection); err != nil {
	// 	panic("could not seed data: " + err.Error())
	// }

    DB = connection
}