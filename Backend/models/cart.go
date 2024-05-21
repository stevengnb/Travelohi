package models

import (
	"fmt"
	"time"

	"gorm.io/gorm"
)

type CartDetailHotel struct {
	ID     uint      `gorm:"primary_key;autoIncrement" json:"id"`
	HotelID     uint      `json:"hotelId"`
	UserID     uint      `json:"userId"`
	RoomID      uint      `json:"roomId"`
	CheckIn 	time.Time `json:"checkIn"`
	CheckOut 	time.Time `json:"checkOut"`
	Quantity 	int 	  `json:"quantity"`
	Paid 		bool `json:"paid"`
}

type Ticket struct {
	TicketID 	uint `gorm:"primary_key;autoIncrement" json:"id"`
	FlightID 	uint `json:"flightId"`
	SeatID 	 	uint `json:"seatId"`
	Luggage 	int  `json:"luggage"`
	UserID      uint `json:"userId"`
	Paid 		bool `json:"paid"`
	FlightSegmentId uint `json:"flightSegmentId"`
}

func MigrateCartDetailHotel(db *gorm.DB) error {
    err := db.AutoMigrate(&CartDetailHotel{})
    return err
}

func MigrateTicket(db *gorm.DB) error {
    err := db.AutoMigrate(&Ticket{})
    return err
}

func MigrateCarts(connection *gorm.DB) error {
	if err := MigrateCartDetailHotel(connection); err != nil {
        return fmt.Errorf("error migrating cart detail hotel: %w", err)
    }

	if err := MigrateTicket(connection); err != nil {
        return fmt.Errorf("error migrating ticke: %w", err)
    }

	return nil
}
