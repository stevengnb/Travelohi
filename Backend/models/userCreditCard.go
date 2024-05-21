package models

import "gorm.io/gorm"

type UserCreditCard struct {
	UserID      uint `gorm:"primaryKey"`
	CreditCardID uint `gorm:"primaryKey"`
}

func MigrateUserCreditCard(db *gorm.DB) error {
	err := db.AutoMigrate(&UserCreditCard{})
	return err
}

func SeedDataUCC(db *gorm.DB) error {
	var users []User
	if err := db.Find(&users).Error; err != nil {
		return err
	}

	var creditCards []CreditCard
	if err := db.Find(&creditCards).Error; err != nil {
		return err
	}

	userCreditCards := []UserCreditCard{
		{UserID: users[3].ID, CreditCardID: creditCards[0].ID},
		{UserID: users[3].ID, CreditCardID: creditCards[1].ID},
	}

	for _, ucc := range userCreditCards {
		if err := db.Create(&ucc).Error; err != nil {
			return err
		}
	}

	return nil
}