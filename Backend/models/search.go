package models

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

type Search struct {
	ID         uint      `gorm:"primary_key;autoIncrement" json:"id"`
	UserID     uint      `json:"userId"`
	SearchTerm string    `json:"searchTerm"`
	SearchDate time.Time `json:"searchDate"`
}

func MigrateSearch(db *gorm.DB) error {
	err := db.AutoMigrate(&Search{})
	return err
}

func SeedSearch(db *gorm.DB) error {
	searchh := []Search {
		{UserID: 3, SearchTerm: "japan", SearchDate: time.Now()},
		{UserID: 3, SearchTerm: "a", SearchDate: time.Now().Add(time.Hour * -2)},
	}

	for _, search := range searchh {
		if err := db.Create(&search).Error; err != nil {
			return err
		}
		fmt.Println(search)
	}

	return nil
}