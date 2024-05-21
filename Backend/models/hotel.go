package models

import (
	"encoding/json"
	"fmt"

	"gorm.io/gorm"
)

type Facility struct {
	ID   uint   `gorm:"primary_key;autoIncrement" json:"id"`
	Name string `json:"name"`
}

type Hotel struct {
	ID          uint     `gorm:"primary_key;autoIncrement" json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Rating      float32  `json:"rating"`
	Address     string   `json:"address"`
	CityID      uint     `json:"cityId"`
	Images      string 	 `gorm:"type:text" json:"images"`
}

type RoomDetail struct {
	ID  			uint 	    `gorm:"primary_key;autoIncrement" json:"id"`
	HotelID 		uint     `json:"hotelId"`
	Name			string   `json:"name"`
	Guest 			int 	 `json:"guest"`
	Availability 	int 	 `json:"availability"`
	Bed 			int 	 `json:"bed"`
	Price 			int 	 `json:"price"`
	Images  		string 	 `gorm:"type:text" json:"images"`
}

type HotelFacility struct {
	HotelID    uint `json:"hotelId"`
	FacilityID uint `json:"facilityId"`
}

func MigrateHotelAll(db *gorm.DB) error {
    if err := MigrateFacility(db); err != nil {
        return fmt.Errorf("error migrating city: %w", err)
    }
    if err := MigrateHotel(db); err != nil {
        return fmt.Errorf("error migrating airport: %w", err)
    }
    if err := MigrateHotelFacility(db); err != nil {
        return fmt.Errorf("error migrating airport: %w", err)
    }
    if err := MigrateRoomDetail(db); err != nil {
        return fmt.Errorf("error migrating airport: %w", err)
    }
    return nil
}

func MigrateFacility(db *gorm.DB) error {
	err := db.AutoMigrate(&Facility{})
    return err
}

func MigrateHotel(db *gorm.DB) error {
	err := db.AutoMigrate(&Hotel{})
    return err
}
func MigrateHotelFacility(db *gorm.DB) error {
	err := db.AutoMigrate(&HotelFacility{})
    return err
}
func MigrateRoomDetail(db *gorm.DB) error {
	err := db.AutoMigrate(&RoomDetail{})
    return err
}

func SeedFacility(db *gorm.DB) error {
	fmt.Println("Seedingnya")
	facilities := []Facility{
		{Name: "Room Service"},
		{Name: "Laundry Service"},
		{Name: "Pet-Friendly"},
		{Name: "Business Center"},
		{Name: "Kids Club"},
		{Name: "Bar/Lounge"},
		{Name: "Sauna"},
		{Name: "Free Breakfast"},
		{Name: "Shuttle Service"},
		{Name: "Golf Course"},
		{Name: "AC"},
		{Name: "WiFi"},
		{Name: "Restaurant"},
		{Name: "Swimming Pool"},
		{Name: "24-Hour Front Desk"},
		{Name: "Parking"},
		{Name: "Elevator"},
		{Name: "Gym"},
		{Name: "Spa"},
		{Name: "Conference Rooms"},
	}
	

	for _, facility := range facilities {
		fmt.Println(facility);
        if err := db.Create(&facility).Error; err!= nil {
			fmt.Println(err)
            return err
        }
    }

	return nil
}

func SeedHotel(db *gorm.DB) error {
	hotel1Images := []string{
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101407/hotel/hotel%201/hotel_1_3_tshvsz.png",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101395/hotel/hotel%201/hotel_1_1_azndqx.png",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101386/hotel/hotel%201/hotel_1_7_ztzkvr.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101385/hotel/hotel%201/hotel_1_6_burxic.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101385/hotel/hotel%201/hotel_1_5_zljg7p.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101384/hotel/hotel%201/hotel_1_4_bqdxg1.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101383/hotel/hotel%201/hotel_1_2_p7kbmv.webp",
	}

	hotel2Images := []string{
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101389/hotel/hotel%202/hotel_2_7_fktpeu.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101389/hotel/hotel%202/hotel_2_6_b6piyp.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101388/hotel/hotel%202/hotel_2_5_ylle9u.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101388/hotel/hotel%202/hotel_2_4_hixi9l.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101388/hotel/hotel%202/hotel_2_3_pwexxf.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101387/hotel/hotel%202/hotel_2_2_f6zdiw.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101386/hotel/hotel%202/hotel_2_1_kvwdz5.webp",
	}

	hotel3Images := []string{
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101395/hotel/hotel%203/hotel_3_7_fk3tgi.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101395/hotel/hotel%203/hotel_3_6_pm2zbx.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101394/hotel/hotel%203/hotel_3_5_lrm4ag.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101394/hotel/hotel%203/hotel_3_4_qlknjl.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101393/hotel/hotel%203/hotel_3_3_nwmdpa.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101392/hotel/hotel%203/hotel_3_2_i27pjx.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101390/hotel/hotel%203/hotel_3_1_ilxfue.webp",
	}

	hotel4Images := []string{
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101381/hotel/hotel%204/hotel_4_6_xsvsjk.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101380/hotel/hotel%204/hotel_4_7_rmruec.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101380/hotel/hotel%204/hotel_4_4_g1reqg.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101380/hotel/hotel%204/hotel_4_3_sn2s6i.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101380/hotel/hotel%204/hotel_4_2_grq6ra.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101380/hotel/hotel%204/hotel_4_5_eevxtc.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101380/hotel/hotel%204/hotel_4_1_cnnroh.webp",	
	}

	hotel5Images := []string{
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101383/hotel/hotel%205/hotel_5_7_ebetmc.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101381/hotel/hotel%205/hotel_5_6_klylas.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101381/hotel/hotel%205/hotel_5_5_ggazex.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101381/hotel/hotel%205/hotel_5_4_brduk6.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101381/hotel/hotel%205/hotel_5_1_s3smli.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101381/hotel/hotel%205/hotel_5_2_e3gqaz.webp",
		"https://res.cloudinary.com/ds6lmapkj/image/upload/v1707101380/hotel/hotel%205/hotel_5_3_b32trq.webp",
	}

	jsonImages1, err := json.Marshal(hotel1Images)
	if err != nil {
		fmt.Println("Error marshaling images:", err)
		return err
	}
	jsonImages2, err := json.Marshal(hotel2Images)
	if err != nil {
		fmt.Println("Error marshaling images:", err)
		return err
	}
	jsonImages3, err := json.Marshal(hotel3Images)
	if err != nil {
		fmt.Println("Error marshaling images:", err)
		return err
	}
	jsonImages4, err := json.Marshal(hotel4Images)
	if err != nil {
		fmt.Println("Error marshaling images:", err)
		return err
	}
	jsonImages5, err := json.Marshal(hotel5Images)	
	if err != nil {
		fmt.Println("Error marshaling images:", err)
		return err
	}

	hotels := []Hotel{
		{
			Name:        "Luxury Hotel",
			Description: `Indulge in the epitome of opulence at our Luxury Hotel. 
					Experience personalized service, exquisite dining, and lavish accommodations. 
					A haven for discerning travelers seeking the finest in hospitality.`,
			Rating:  4.8,
			Address: "123 Broadway, Suite 456, Manhattan",
			CityID:  1,
			Images: string(jsonImages1),
		},
		{
			Name:        "Cozy Retreat Inn",
			Description: `Escape to tranquility at the Cozy Retreat Inn, a charming haven nestled 
					amidst nature. Enjoy warm hospitality, comfortable rooms, and a serene atmosphere. 
					Perfect for a peaceful and rejuvenating getaway.`,
			Rating:  4.2,
			Address: "789 Sakura Street, Shibuya-ku, Tokyo 150-0002",
			CityID:  2,
			Images: string(jsonImages2),
		},
		{
			Name:        "Business Class Suites",
			Description: `Elevate your business stay at our Business Class Suites. 
					Immerse yourself in luxury with modern amenities, dedicated workspaces, 
					and exceptional services. An ideal choice for the corporate traveler.`,
			Rating:  4.5,
			Address: "456 Thames Avenue, Westminster, London SW1A 1AA",
			CityID:  3,
			Images: string(jsonImages3),
		},
		{
			Name:        "Seaside Resort & Spa",
			Description: `Experience the ultimate seaside retreat at our Resort & Spa. 
					Indulge in breathtaking ocean views, rejuvenating spa treatments, 
					and luxurious accommodations. Your perfect escape by the coast.`,
			Rating:  4.6,
			Address: "321 Eiffel Tower Road, Paris 75007, Île-de-France",
			CityID:  4,
			Images: string(jsonImages4),
		},
		{
			Name:        "Mountain Lodge Retreat",
			Description: `Embark on a nature adventure at our Mountain Lodge Retreat. 
					Discover serenity amidst the mountains, cozy lodgings, 
					and outdoor activities. An idyllic getaway for nature enthusiasts.`,
			Rating:  4.4,
			Address: "555 Brandenburg Strasse, Mitte, Berlin 10117",
			CityID:  5,
			Images: string(jsonImages5),
		},
	}

	for _, hotel := range hotels {
        if err := db.Create(&hotel).Error; err!= nil {
            return err
        }
    }

	facilities := map[uint][]uint{
		1: {2, 3, 7, 8, 9, 12, 13, 15, 16, 18},
		2: {1, 4, 6, 8, 10, 12, 14, 16, 17, 18},
		3: {1, 2, 5, 7, 9, 11, 13, 15, 18, 20},
		4: {3, 4, 6, 8, 10, 12, 14, 16, 18, 20},
		5: {2, 4, 7, 9, 11, 13, 15, 17, 18, 20},
	}

	var hotelfacilities []HotelFacility

	for hotelID, facilityIDs := range facilities {
		for _, facilityID := range facilityIDs {
			hotelfacilities = append(hotelfacilities, HotelFacility{
				HotelID:    hotelID,
				FacilityID: facilityID,
			})
		}
	}

	fmt.Println(hotelfacilities)
	for _, hf := range hotelfacilities {
		if err := db.Create(&hf).Error; err != nil {
			return err
		}
	}

	roomDetails := []RoomDetail{
		{HotelID: 1, Name: "Cozy Room", Guest: 2, Availability: 250, Bed: 2, Price: 1048599 , Images: string(jsonImages1)},
		{HotelID: 1, Name: "Deluxe Suite", Guest: 3, Availability: 175, Bed: 2, Price: 1075470 , Images: string(jsonImages1)},
		{HotelID: 1, Name: "Elegant Retreat", Guest: 2, Availability: 50, Bed: 1, Price: 1349071 , Images: string(jsonImages1)},
		{HotelID: 2, Name: "Tranquil Haven", Guest: 2, Availability: 200, Bed: 2, Price: 1458594 , Images: string(jsonImages2)},
		{HotelID: 2, Name: "Seaside Villa", Guest: 4, Availability: 150, Bed: 2, Price: 1129493 , Images: string(jsonImages2)},
		{HotelID: 2, Name: "Mountain Hideaway", Guest: 2, Availability: 75, Bed: 1, Price: 1580113 , Images: string(jsonImages2)},
		{HotelID: 3, Name: "Urban Loft", Guest: 3, Availability: 300, Bed: 2, Price: 1742111 , Images: string(jsonImages3)},
		{HotelID: 3, Name: "Garden View Room", Guest: 4, Availability: 100, Bed: 2, Price: 1254458 , Images: string(jsonImages3)},
		{HotelID: 3, Name: "Sunset Cottage", Guest: 10, Availability: 100, Bed: 5, Price: 1882639 , Images: string(jsonImages3)},
		{HotelID: 4, Name: "Royal Chamber", Guest: 16, Availability: 100, Bed: 8, Price: 1399270 , Images: string(jsonImages4)},
		{HotelID: 4, Name: "Cozy Room", Guest: 4, Availability: 50, Bed: 2, Price: 1650490 , Images: string(jsonImages4)},
		{HotelID: 4, Name: "Deluxe Suite", Guest: 2, Availability: 25, Bed: 1, Price: 1282713 , Images: string(jsonImages4)},
		{HotelID: 5, Name: "Tranquil Haven", Guest: 3, Availability: 500, Bed: 2, Price: 1118505 , Images: string(jsonImages5)},
		{HotelID: 5, Name: "Seaside Villa", Guest: 4, Availability: 250, Bed: 2, Price: 1800428 , Images: string(jsonImages5)},
		{HotelID: 5, Name: "Mountain Hideaway", Guest: 2, Availability: 125, Bed: 1, Price: 1281892 , Images: string(jsonImages5)},
	}

	for _, rd := range roomDetails {
        if err := db.Create(&rd).Error; err!= nil {
            return err
        }
    }

	return nil
}