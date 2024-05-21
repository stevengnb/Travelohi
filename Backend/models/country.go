package models

import (
	"fmt"

	"gorm.io/gorm"
)

type Country struct {
	ID   uint   `gorm:"primary_key;autoIncrement" json:"id"`
	Name string `json:"name"`
}

type City struct {
	ID uint `gorm:"primary_key;autoIncrement" json:"id"`
	CountryID uint `json:"countryId"`
	Name string `json:"name"`
}

type Airport struct {
	ID uint `gorm:"primary_key;autoIncrement" json:"id"`
	Name string `json:"name"`
	CityID uint `json:"cityId"`
	Code string `json:"code"`
}

func MigrateCountry(db *gorm.DB) error {
	err := db.AutoMigrate(&Country{})
	return err
}

func MigrateAirport(db *gorm.DB) error {
	err := db.AutoMigrate(&Airport{})
    return err
}

func MigrateCity(db *gorm.DB) error {
    err := db.AutoMigrate(&City{})
    return err
}

func SeedCountries(db* gorm.DB) error {
	countries := []Country{
		{Name: "United States"},
		{Name: "Japan"},
		{Name: "United Kingdom"},
		{Name: "France"},
		{Name: "Germany"},
		{Name: "United Arab Emirates"},
		{Name: "Singapore"},
		{Name: "South Korea"},
		{Name: "Netherlands"},
		{Name: "Australia"},
		{Name: "Canada"},
		{Name: "China"},
		{Name: "India"},
		{Name: "Brazil"},
		{Name: "Russia"},
		{Name: "Mexico"},
		{Name: "Turkey"},
		{Name: "Thailand"},
		{Name: "Indonesia"},
		{Name: "Vietnam"},
	}

	for _, country := range countries {
		if err := db.Create(&country).Error; err != nil {
			return err
		}
		fmt.Println(country)
	}

	return nil
}

func SeedCities(db *gorm.DB) error {
	cities := []City{
		{CountryID: 1, Name: "New York"},
		{CountryID: 2, Name: "Tokyo"},
		{CountryID: 3, Name: "London"},
		{CountryID: 4, Name: "Paris"},
		{CountryID: 5, Name: "Berlin"},
		{CountryID: 6, Name: "Dubai"},
		{CountryID: 7, Name: "Singapore City"},
		{CountryID: 8, Name: "Seoul"},
		{CountryID: 9, Name: "Amsterdam"},
		{CountryID: 10, Name: "Sydney"},
		{CountryID: 11, Name: "Toronto"},
		{CountryID: 12, Name: "Beijing"},
		{CountryID: 13, Name: "Mumbai"},
		{CountryID: 14, Name: "Rio de Janeiro"},
		{CountryID: 15, Name: "Moscow"},
		{CountryID: 16, Name: "Mexico City"},
		{CountryID: 17, Name: "Istanbul"},
		{CountryID: 18, Name: "Bangkok"},
		{CountryID: 19, Name: "Jakarta"},
		{CountryID: 20, Name: "Ho Chi Minh City"},
	}

	for _, city := range cities {
		if err := db.Create(&city).Error; err != nil {
			return err
		}
		fmt.Println(city)
	}

	return nil
}

func SeedAirports(db *gorm.DB) error {
	airports := []Airport{
		{CityID: 1, Name: "John F. Kennedy International Airport", Code: "JFK"},
		{CityID: 2, Name: "Narita International Airport", Code: "NRT"},
		{CityID: 3, Name: "Heathrow Airport", Code: "LHR"},
		{CityID: 4, Name: "Charles de Gaulle Airport", Code: "CDG"},
		{CityID: 5, Name: "Berlin Brandenburg Airport", Code: "BER"},
		{CityID: 6, Name: "Dubai International Airport", Code: "DXB"},
		{CityID: 7, Name: "Changi Airport", Code: "SIN"},
		{CityID: 8, Name: "Incheon International Airport", Code: "ICN"},
		{CityID: 9, Name: "Amsterdam Airport Schiphol", Code: "AMS"},
		{CityID: 10, Name: "Sydney Airport", Code: "SYG"},
		{CityID: 11, Name: "Toronto Pearson International Airport", Code: "YYZ"},
		{CityID: 12, Name: "Beijing Capital International Airport", Code: "PEK"},
		{CityID: 13, Name: "Chhatrapati Shivaji Maharaj International Airport", Code: "BOM"},
		{CityID: 14, Name: "Rio de Janeiro", Code: "GIG"},
		{CityID: 15, Name: "Sheremetyevo International Airport", Code: "SVO"},
		{CityID: 16, Name: "Mexico City International Airport", Code: "MEX"},
		{CityID: 17, Name: "Istanbul Airport", Code: "IST"},
		{CityID: 18, Name: "Suvarnabhumi Airport", Code: "BKK"},
		{CityID: 19, Name: "Soekarno-Hatta International Airport", Code: "CGK"},
		{CityID: 20, Name: "Tan Son Nhat International Airport", Code: "SGN"},
	}

	for _, airport := range airports {
		if err := db.Create(&airport).Error; err != nil {
			return err
		}
		fmt.Println(airport)
	}

	return nil
}

func MigrateACC(connection *gorm.DB) error {
    if err := MigrateCountry(connection); err != nil {
        return fmt.Errorf("error migrating country: %w", err)
    }
    if err := MigrateCity(connection); err != nil {
        return fmt.Errorf("error migrating city: %w", err)
    }
    if err := MigrateAirport(connection); err != nil {
        return fmt.Errorf("error migrating airport: %w", err)
    }
    return nil
}

func SeedACC(db *gorm.DB) error {
    if err := SeedCountries(db); err != nil {
        return fmt.Errorf("error seeding countries: %w", err)
    }

    if err := SeedCities(db); err != nil {
        return fmt.Errorf("error seeding cities: %w", err)
    }

    if err := SeedAirports(db); err != nil {
        return fmt.Errorf("error seeding airports: %w", err)
    }
    return nil
}
