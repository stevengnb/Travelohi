package models

import "gorm.io/gorm"

type CreditCard struct {
	ID       uint   `gorm:"primary_key;autoIncrement" json:"id"`
	Name     string `json:"name"`
	BankName string `json:"bankName"`
	Number   int    `json:"number"`
	Cvv      int    `json:"cvv"`
}

func MigrateCreditCard(db *gorm.DB) error {
	err := db.AutoMigrate(&CreditCard{})
	return err
}

func SeedDataCC(db *gorm.DB) error {
	creditCards := []CreditCard{
		{Name: "Steven", BankName: "ABC", Number: 123456789, Cvv: 345},
		{Name: "Bambang", BankName: "ABC", Number: 987654321, Cvv: 543},
	}

	for _, cc := range creditCards {
		if err := db.Create(&cc).Error; err != nil {
			return err
		}
	}

	return nil
}

func GetUserCreditCards(db *gorm.DB, userID string) ([]CreditCard, error) {
    var result []CreditCard

    if err := db.Table("credit_cards cc").
        Select("cc.name, cc.bank_name, cc.number, cc.cvv").
        Joins("JOIN user_credit_cards ucc ON cc.id = ucc.credit_card_id").
        Where("ucc.user_id = ?", userID).
        Scan(&result).Error; err != nil {
        return nil, err
    }

    return result, nil
}