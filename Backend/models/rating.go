package models

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

type Rating struct {
	ID             uint    `gorm:"primary_key;autoIncrement" json:"id"`
	HotelID        uint    `json:"hotel_id"`
	RatingClean    float32 `json:"rating_clean"`
	RatingComfort  float32 `json:"rating_comfort"`
	RatingLocation float32 `json:"rating_location"`
	RatingService  float32 `json:"rating_service"`
	OverallRating  float32 `json:"overal_rating"`
}

type Review struct {
	ID             uint    `gorm:"primary_key;autoIncrement" json:"id"`
	HotelID        uint    `json:"hotel_id"`
	RatingClean    float32 `json:"rating_clean"`
	RatingComfort  float32 `json:"rating_comfort"`
	RatingLocation float32 `json:"rating_location"`
	RatingService  float32 `json:"rating_service"`
	UserID         uint    `json:"user_id"`
	UserEmail       string  `json:"email"`
	UserFirstName       string  `json:"first_name"`
	UserLastName       string  `json:"last_name"`
	UserPicture string `json:"user_picture"`
	Anonymous      bool    `json:"anonymous"`
	Review         string  `json:"review"`
	Date      time.Time `json:"date"`
}

func MigrateReview(db *gorm.DB) error {
	err := db.AutoMigrate(&Review{})
	return err
}

func MigrateRating(db *gorm.DB) error {
	err := db.AutoMigrate(&Rating{})
    return err
}


func MigrateRatingReview(connection *gorm.DB) error {
    if err := MigrateRating(connection); err != nil {
        return fmt.Errorf("error migrating rating: %w", err)
    }
    if err := MigrateReview(connection); err != nil {
        return fmt.Errorf("error migrating review: %w", err)
    }

    return nil
}

func SeedRatingReview(db *gorm.DB) error {
	reviews := []Review{
		{HotelID: 1, RatingClean: 5, RatingComfort: 4.5, RatingLocation: 4, RatingService: 4.7, Review: "This hotel is good", UserID: 1, Anonymous: true, UserEmail: "john@example.com", UserFirstName: "John", UserLastName: "Doe", UserPicture: "example.png", Date: time.Now()},
		{HotelID: 1, RatingClean: 4.2, RatingComfort: 4.3, RatingLocation: 4.1, RatingService: 4.5, Review: "Great experience overall", UserID: 3, Anonymous: false, UserEmail: "blogstevens@gmail.com", UserFirstName: "Steven", UserLastName: "gnbadasd", UserPicture: "http://res.cloudinary.com/ds6lmapkj/image/upload/v1706856772/qmiot0kwdbepdqq0vkbf.jpg", Date: time.Now().Add(-24 * time.Hour)},
		{HotelID: 1, RatingClean: 4.8, RatingComfort: 4.7, RatingLocation: 4.3, RatingService: 4.9, Review: "Nice hotel, friendly staff", UserID: 6, Anonymous: false, UserEmail: "stevsdoang@gmail.com", UserFirstName: "asdasd", UserLastName: "asdasd", UserPicture: "http://res.cloudinary.com/ds6lmapkj/image/upload/v1706950709/ysg3ekhuh5brpqr0clza.jpg", Date: time.Now().Add(-48 * time.Hour)},
		
		{HotelID: 2, RatingClean: 4.5, RatingComfort: 4.2, RatingLocation: 4.6, RatingService: 4.3, Review: "Comfortable stay, good amenities", UserID: 1, Anonymous: true, UserEmail: "john@example.com", UserFirstName: "John", UserLastName: "Doe", UserPicture: "example.png", Date: time.Now()},
		{HotelID: 2, RatingClean: 4.7, RatingComfort: 4.6, RatingLocation: 4.8, RatingService: 4.5, Review: "Excellent service and beautiful location", UserID: 3, Anonymous: false, UserEmail: "blogstevens@gmail.com", UserFirstName: "Steven", UserLastName: "gnbadasd", UserPicture: "http://res.cloudinary.com/ds6lmapkj/image/upload/v1706856772/qmiot0kwdbepdqq0vkbf.jpg", Date: time.Now().Add(-24 * time.Hour)},
		{HotelID: 2, RatingClean: 4.3, RatingComfort: 4.1, RatingLocation: 4.4, RatingService: 4.2, Review: "Decent hotel, needs improvement in cleanliness", UserID: 6, Anonymous: false, UserEmail: "stevsdoang@gmail.com", UserFirstName: "asdasd", UserLastName: "asdasd", UserPicture: "http://res.cloudinary.com/ds6lmapkj/image/upload/v1706950709/ysg3ekhuh5brpqr0clza.jpg", Date: time.Now().Add(-48 * time.Hour)},
		
		{HotelID: 3, RatingClean: 4.9, RatingComfort: 4.8, RatingLocation: 4.7, RatingService: 4.9, Review: "Absolutely fantastic! Highly recommend",UserID: 1, Anonymous: true, UserEmail: "john@example.com", UserFirstName: "John", UserLastName: "Doe", UserPicture: "example.png", Date: time.Now().Add(-2 * time.Hour)},
		{HotelID: 3, RatingClean: 4.6, RatingComfort: 4.5, RatingLocation: 4.6, RatingService: 4.7, Review: "Lovely stay with great amenities", UserID: 3, Anonymous: false, UserEmail: "blogstevens@gmail.com", UserFirstName: "Steven", UserLastName: "gnbadasd", UserPicture: "http://res.cloudinary.com/ds6lmapkj/image/upload/v1706856772/qmiot0kwdbepdqq0vkbf.jpg", Date: time.Now().Add(-24 * time.Hour)},
		{HotelID: 3, RatingClean: 4.4, RatingComfort: 4.3, RatingLocation: 4.5, RatingService: 4.4, Review: "Nice hotel, good value for money", UserID: 6, Anonymous: false, UserEmail: "stevsdoang@gmail.com", UserFirstName: "asdasd", UserLastName: "asdasd", UserPicture: "http://res.cloudinary.com/ds6lmapkj/image/upload/v1706950709/ysg3ekhuh5brpqr0clza.jpg", Date: time.Now().Add(-48 * time.Hour)},
		
		{HotelID: 4, RatingClean: 4.8, RatingComfort: 4.7, RatingLocation: 4.5, RatingService: 4.8, Review: "Wonderful experience, will visit again", UserID: 1, Anonymous: true, UserEmail: "john@example.com", UserFirstName: "John", UserLastName: "Doe", UserPicture: "example.png", Date: time.Now().Add(-2 * time.Hour)},
		{HotelID: 4, RatingClean: 4.5, RatingComfort: 4.4, RatingLocation: 4.6, RatingService: 4.5, Review: "Pleasant stay, clean rooms", UserID: 3, Anonymous: false, UserEmail: "blogstevens@gmail.com", UserFirstName: "Steven", UserLastName: "gnbadasd", UserPicture: "http://res.cloudinary.com/ds6lmapkj/image/upload/v1706856772/qmiot0kwdbepdqq0vkbf.jpg", Date: time.Now().Add(-24 * time.Hour)},
		{HotelID: 4, RatingClean: 4.7, RatingComfort: 4.6, RatingLocation: 4.7, RatingService: 4.6, Review: "Great hotel, friendly staff", UserID: 6, Anonymous: false, UserEmail: "stevsdoang@gmail.com", UserFirstName: "asdasd", UserLastName: "asdasd", UserPicture: "http://res.cloudinary.com/ds6lmapkj/image/upload/v1706950709/ysg3ekhuh5brpqr0clza.jpg", Date: time.Now().Add(-48 * time.Hour)},
		
		{HotelID: 5, RatingClean: 4.3, RatingComfort: 4.2, RatingLocation: 4.4, RatingService: 4.1, Review: "Decent accommodation, could be better", UserID: 1, Anonymous: true, UserEmail: "john@example.com", UserFirstName: "John", UserLastName: "Doe", UserPicture: "example.png", Date: time.Now().Add(-2 * time.Hour)},
		{HotelID: 5, RatingClean: 4.6, RatingComfort: 4.5, RatingLocation: 4.7, RatingService: 4.4, Review: "Good hotel for the price, helpful staff", UserID: 3, Anonymous: false, UserEmail: "blogstevens@gmail.com", UserFirstName: "Steven", UserLastName: "gnbadasd", UserPicture: "http://res.cloudinary.com/ds6lmapkj/image/upload/v1706856772/qmiot0kwdbepdqq0vkbf.jpg", Date: time.Now().Add(-24 * time.Hour)},
		{HotelID: 5, RatingClean: 4.8, RatingComfort: 4.7, RatingLocation: 4.9, RatingService: 4.8, Review: "Excellent stay, everything was perfect", UserID: 6, Anonymous: false, UserEmail: "stevsdoang@gmail.com", UserFirstName: "asdasd", UserLastName: "asdasd", UserPicture: "http://res.cloudinary.com/ds6lmapkj/image/upload/v1706950709/ysg3ekhuh5brpqr0clza.jpg", Date: time.Now().Add(-48 * time.Hour)},
		
		{HotelID: 12, RatingClean: 4.4, RatingComfort: 4.6, RatingLocation: 4.5, RatingService: 4.5, Review: "Convenient location, comfortable rooms, ", UserID: 1, Anonymous: true, UserEmail: "john@example.com", UserFirstName: "John", UserLastName: "Doe", UserPicture: "example.png", Date: time.Now().Add(-2 * time.Hour)},
		{HotelID: 12, RatingClean: 4.1, RatingComfort: 4.8, RatingLocation: 4.2, RatingService: 4.2, Review: "Satisfactory stay, good service", UserID: 3, Anonymous: false, UserEmail: "blogstevens@gmail.com", UserFirstName: "Steven", UserLastName: "gnbadasd", UserPicture: "http://res.cloudinary.com/ds6lmapkj/image/upload/v1706856772/qmiot0kwdbepdqq0vkbf.jpg", Date: time.Now().Add(-24 * time.Hour)},
		{HotelID: 12, RatingClean: 4.8, RatingComfort: 4.1, RatingLocation: 4.4, RatingService: 4.3, Review: "Nice hotel, pleasant ambiance", UserID: 6, Anonymous: false, UserEmail: "stevsdoang@gmail.com", UserFirstName: "asdasd", UserLastName: "asdasd", UserPicture: "http://res.cloudinary.com/ds6lmapkj/image/upload/v1706950709/ysg3ekhuh5brpqr0clza.jpg", Date: time.Now().Add(-48 * time.Hour)},
	
		{HotelID: 13, RatingClean: 4.5, RatingComfort: 4.4, RatingLocation: 4.6, RatingService: 4.3, Review: "Comfortable rooms, convenient location", UserID: 1, Anonymous: true, UserEmail: "john@example.com", UserFirstName: "John", UserLastName: "Doe", UserPicture: "example.png", Date: time.Now().Add(-2 * time.Hour)},
		{HotelID: 13, RatingClean: 4.7, RatingComfort: 4.6, RatingLocation: 4.8, RatingService: 4.5, Review: "Satisfactory stay, good service", UserID: 3, Anonymous: false, UserEmail: "blogstevens@gmail.com", UserFirstName: "Steven", UserLastName: "gnbadasd", UserPicture: "http://res.cloudinary.com/ds6lmapkj/image/upload/v1706856772/qmiot0kwdbepdqq0vkbf.jpg", Date: time.Now().Add(-24 * time.Hour)},
		{HotelID: 13, RatingClean: 4.4, RatingComfort: 4.3, RatingLocation: 4.5, RatingService: 4.2, Review: "Nice hotel, pleasant ambiance", UserID: 6, Anonymous: false, UserEmail: "stevsdoang@gmail.com", UserFirstName: "asdasd", UserLastName: "asdasd", UserPicture: "http://res.cloudinary.com/ds6lmapkj/image/upload/v1706950709/ysg3ekhuh5brpqr0clza.jpg", Date: time.Now().Add(-28 * time.Hour)},
	}
	
	for _, review := range reviews {
		if err := db.Create(&review).Error; err != nil {
			return err
		}
		fmt.Println(review)
	}

	ratings := []Rating{
		{HotelID: 1, RatingClean: 4.67, RatingComfort: 4.5, RatingLocation: 4.13, RatingService: 4.7, OverallRating: 4.75},
		{HotelID: 2, RatingClean: 4.5, RatingComfort: 4.3, RatingLocation: 4.6, RatingService: 4.33, OverallRating: 4.4325},
		{HotelID: 3, RatingClean: 4.63, RatingComfort: 4.53, RatingLocation: 4.6, RatingService: 4.67, OverallRating: 4.5875},
		{HotelID: 4, RatingClean: 4.67, RatingComfort: 4.57, RatingLocation: 4.6, RatingService: 4.7, OverallRating: 4.635},
		{HotelID: 5, RatingClean: 4.57, RatingComfort: 4.47, RatingLocation: 4.67, RatingService: 4.43, OverallRating: 4.535},
		{HotelID: 12, RatingClean: 4.43, RatingComfort: 4.5, RatingLocation: 4.37, RatingService: 4.33, OverallRating: 4.4075},
		{HotelID: 13, RatingClean: 4.53, RatingComfort: 4.43, RatingLocation: 4.63, RatingService: 4.33, OverallRating: 4.4825},
	}

	for _, rating := range ratings {
		if err := db.Create(&rating).Error; err != nil {
			return err
		}
		fmt.Println(rating)
	}
	
	return nil
}