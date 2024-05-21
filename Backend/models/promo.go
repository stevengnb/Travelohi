package models

import (
	"time"

	"gorm.io/gorm"
)

type Promo struct {
	ID      uint   `gorm:"primary_key;autoIncrement" json:"id"`
	Title string `json:"title"`
	Description string `json:"description"`
	Percentage float32 `json:"percentage"`
	StartDate time.Time `json:"start"`
	ExpiryDate time.Time `json:"expired"`
	PromoCode string `json:"promoCode" gorm:"unique"`
	Image   string `json:"image"`
}

func MigratePromo(db *gorm.DB) error {
	err := db.AutoMigrate(&Promo{})
	return err
}

func SeedDataPromo(db *gorm.DB) error {
	promos := []Promo{
		{Title: "Promo1", Description: "Ini promo pertama", Percentage: 0.5, StartDate: time.Now(), ExpiryDate: time.Now().Add(time.Hour * 2), PromoCode: "ABCDEF", Image: "https://res.cloudinary.com/ds6lmapkj/image/upload/v1707025109/promo/promo2_vvmzus.png"},
		{Title: "Promo2", Description: "Ini promo kedua", Percentage: 0.7, StartDate: time.Now(), ExpiryDate: time.Now().Add(time.Hour * 3), PromoCode: "SNEIST", Image: "https://res.cloudinary.com/ds6lmapkj/image/upload/v1707025109/promo/promo1_o97hwx.png"},
	}

	for _, p := range promos {
		if err := db.Create(&p).Error; err != nil {
			return err
		}
	}

	return nil
}