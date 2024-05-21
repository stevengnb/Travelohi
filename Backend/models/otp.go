package models

import (
	"time"

	"gorm.io/gorm"
)

type Otp struct {
	Email           string `gorm:"unique;not null" json:"email"`
	Expires      	time.Time `json:"expires"`
	Code 			int `json:"code"`
}

func MigrateOtp(db *gorm.DB) error {
	err := db.AutoMigrate(&Otp{})
	return err
}