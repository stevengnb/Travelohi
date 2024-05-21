package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	ID               uint   `gorm:"primary_key;autoIncrement" json:"id"`
	FirstName        string `json:"firstName"`
	LastName         string `json:"lastName"`
	Gender           string `json:"gender"`
	DateOfBirth      time.Time `json:"dob"`
	Email            string `gorm:"unique;not null" json:"email"`
	Password         []byte `json:"-"`
	SecurityQuestion string `json:"question"`
	Answer           string `json:"answer"`
	ProfilePicture   string `json:"profilePicture"`
	IsEmail		 	 bool   `json:"isEmail"`
	Banned 			 bool `json:"banned"`
	HiWallet 		 int `json:"hiWallet"`
}

func MigrateUser(db *gorm.DB) error {
	err := db.AutoMigrate(&User{})
	return err
}

func SeedData(db *gorm.DB) error {
	users := []User{
		{FirstName: "John", LastName: "Doe", Gender: "Male", DateOfBirth: time.Now(), Email: "john@example.com", SecurityQuestion: "Question1", Answer: "Answer1", ProfilePicture: "profile1.jpg", IsEmail: true, Banned: false},
		{FirstName: "Jane", LastName: "Doe", Gender: "Female", DateOfBirth: time.Now(), Email: "jane@example.com", SecurityQuestion: "Question2", Answer: "Answer2", ProfilePicture: "profile2.jpg", IsEmail: false, Banned: true},
	}

	for _, user := range users {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
		if err != nil {
			return err
		}

		user.Password = hashedPassword

		if err := db.Create(&user).Error; err != nil {
			return err
		}
	}

	return nil
}