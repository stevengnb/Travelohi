package models

import (
	"gorm.io/gorm"
)

type UserPromo struct {
	gorm.Model
	UserID uint
	PromoID uint
}

func MigrateUserPromo(db *gorm.DB) error {
	err := db.AutoMigrate(&UserPromo{})
	return err
}

func SeedDataUPA(db *gorm.DB) error {
	var users []User
	if err := db.Find(&users).Error; err != nil {
		return err
	}

	var promos []Promo
	if err := db.Find(&promos).Error; err != nil {
		return err
	}

	userPromos := []UserPromo{
		{UserID: 3, PromoID: promos[0].ID},
	}

	for _, upa := range userPromos {
		if err := db.Create(&upa).Error; err != nil {
			return err
		}
	}

	return nil
}