package controllers

import (
	"backendgo/database"
	"backendgo/models"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"text/template"
	"time"

	"github.com/gofiber/fiber/v2"
	"gopkg.in/gomail.v2"
)

func SendNewsletter(c *fiber.Ctx) error {
	var body struct {
		Subject string `json:"subject"`
		Content string `json:"body"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to read body",
		})
	}

	fmt.Println(body.Content);

	var users []models.User
	if err := database.DB.Find(&users).Error; err != nil {
		return err
	}

	currentDir, err := os.Getwd()
	if err != nil {
		return err
	}

	templatePath := filepath.Join(currentDir, "template", "newsletter.html")

	for _, u := range users {
		if !u.Banned && u.IsEmail && (u.Email != "operatortravelohi@gmail.com"){
			fmt.Println("sending email to  = ", u.FirstName)
			SendEmailNewsletter(u.Email, templatePath, u.FirstName, body.Subject, body.Content)
		}
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"message": "success"})
}


func SendEmailNewsletter(toEmail string, templatePath string, name string, subject string, content string) error {
	var body bytes.Buffer
	t, err := template.ParseFiles(templatePath)
	if err != nil {
		fmt.Println("Error parsing template:", err)
		return err
	}

	t.Execute(&body, struct{ Name string; Content string }{Name: name, Content: content})

	if err != nil {
		fmt.Println(err)
		return err
	}

	m := gomail.NewMessage()
	m.SetHeader("From", "tpawebtn@gmail.com")
	m.SetHeader("To", toEmail)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", body.String())

	d := gomail.NewDialer("smtp.gmail.com", 587, "tpawebtn@gmail.com", "tnjuasbdhvnpbwgy")

	if err := d.DialAndSend(m); err != nil {
        return err
    }

    return nil
}

func GetAllUsers(c *fiber.Ctx) error {
	var users []models.User
	if err := database.DB.Find(&users).Error; err != nil {
		return err
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"users": users})
}

func GetAllPromos(c *fiber.Ctx) error {
	var promos []models.Promo
	if err := database.DB.Find(&promos).Error; err != nil {
		return err
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"promos": promos})
}

func GetAllCity(c *fiber.Ctx) error {
	var cities []models.City
	if err := database.DB.Find(&cities).Error; err != nil {
		return err
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"cities": cities})
}

func GetAllFacility(c *fiber.Ctx) error {
	var facilities []models.Facility
	if err := database.DB.Find(&facilities).Error; err != nil {
		return err
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"facilities": facilities})
}

func BanUser(c *fiber.Ctx) error {
	var body struct {
		Id uint `json:"userId"`
	}
	
	if err := c.BodyParser(&body); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to read body",
		})
	}
	
	var user models.User
	if err := database.DB.First(&user, "id = ?", body.Id).Error; err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	user.Banned = true
	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update user",
		})
	}

	return c.JSON(fiber.Map{
		"message": "User banned",
	})
}

func AddPromo(c *fiber.Ctx) error {
	var data map[string]string

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	promoCode := strings.ToUpper(data["promoCode"])

	var existingPromo models.Promo
	result := database.DB.Where("promo_code = ?", promoCode).First(&existingPromo)

	if result.Error == nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Promo with the same code already exists"})
	}

	var start time.Time
	start, err := time.Parse("2006-01-02", data["start"])
	if err != nil {
		fmt.Println("Error parsing start date:", err)
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Failed to parse start date"})
	}

	var expired time.Time
	expired, errr := time.Parse("2006-01-02", data["expired"])
	if errr != nil {
		fmt.Println("Error parsing expiry date:", err)
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Failed to parse expiry date"})
	}

	floatValue, err := strconv.ParseFloat(data["percentage"], 32)
	if err != nil {
		fmt.Println("Error:", err)
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Failed to parse percentage"})
	
	}

	float32Val := float32(floatValue)/100

	newPromo := models.Promo{
		Title:       data["title"],
		Description: data["description"],
		Percentage:  float32Val,
		StartDate:   start,
		ExpiryDate:  expired,
		PromoCode:   promoCode,
		Image: 		 data["image"],
	}

	if err := database.DB.Create(&newPromo).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to create new promo",
		})	
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"message": "Promo added successfully"})

}

func UpdatePromoDetail(c *fiber.Ctx) error {
	var data map[string]string

	if err := c.BodyParser(&data); err != nil {
		return err
	}
	
	promoCode := strings.ToUpper(data["promoCode"])

	var existingPromo models.Promo
	result := database.DB.Where("promo_code = ? AND id != ?", promoCode, data["id"]).First(&existingPromo)

	if result.Error == nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Promo with the same code already exists"})
	}
	
	var start time.Time
	start, err := time.Parse("2006-01-02", data["start"])
	if err != nil {
		fmt.Println("Error parsing start date:", err)
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Failed to parse start date"})
	}

	var expired time.Time
	expired, errr := time.Parse("2006-01-02", data["expired"])
	if errr != nil {
		fmt.Println("Error parsing expiry date:", err)
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Failed to parse expiry date"})
	}

	floatValue, err := strconv.ParseFloat(data["percentage"], 32)
	if err != nil {
		fmt.Println("Error:", err)
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "Failed to parse percentage"})
	
	}

	float32Val := float32(floatValue)

	var promo models.Promo
	database.DB.First(&promo, "id = ?", data["id"])

	fmt.Println("DATANYA GINI")
	fmt.Println(data["title"])
	fmt.Println(data["description"])
	fmt.Println(start)
	fmt.Println(expired)
	fmt.Println(promoCode)
	fmt.Println(float32Val)

	promo.Title = data["title"]
	promo.Description = data["description"]
	promo.StartDate = start
	promo.ExpiryDate = expired
	promo.PromoCode = promoCode
	promo.Percentage = float32Val

	fmt.Println("SETELAH INSERT")
	fmt.Println(promo)
	fmt.Println(promo.Title)
	fmt.Println(promo.Description)
	fmt.Println(promo.StartDate)
	fmt.Println(promo.ExpiryDate)
	fmt.Println(promo.PromoCode)
	fmt.Println(promo.Percentage)

	if err := database.DB.Save(&promo).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update promo details"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Promo updated successfully"})
}

func AddHotel(c *fiber.Ctx) error {
	var data map[string]string

	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err})
	}

	if(data["name"] == "" || data["description"] == "" || data["address"] == "" || data["facilities"] == "" || data["cityId"] == "0" || data["images"] == "") {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "All fields must be filled!"})
	}

	fmt.Println("DATA HOTEL")
	fmt.Println("nama = ", data["name"])
	fmt.Println("address = ", data["address"])
	fmt.Println("desc = ", data["description"])
	fmt.Println("facility = ", data["facilities"])
	fmt.Println("Cityid = ", data["cityId"])

	ratingFloat, err := strconv.ParseFloat(data["rating"], 32)
    if err != nil {
        fmt.Println("Error converting string to float32:", err)
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse rating"})
    }

    rating := float32(ratingFloat)
	fmt.Println("rating: ", rating)

	cityIdUint, err := strconv.ParseUint(data["cityId"], 10, 0)
    if err != nil {
        fmt.Println("Error converting string to uint:", err)
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse city id"})
    }

    cityId := uint(cityIdUint)
	fmt.Println("cityId: ", cityId)

	imageString := data["images"]
	images := strings.Split(imageString, ",")

	jsonImages, err := json.Marshal(images)	
	if err != nil {
		fmt.Println("Error marshaling images:", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to marshal image"})
	}

	facility := strings.Split(data["facilities"], ",")
	var facilities []uint

	for _, f := range facility {
		num, err := strconv.ParseUint(f, 10, 0)
		if err != nil {
			fmt.Println("Error converting string to uint")
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse facility"})
		}
		facilities = append(facilities, uint(num))
	}

	hotel := models.Hotel{
		Name: data["name"],
        Description: data["description"],
        Rating: rating,
        Address: data["address"],
        CityID: cityId,
        Images: string(jsonImages),
	}

	if err := database.DB.Create(&hotel).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create new hotel",
		})	
	}
	
	var hotelfacilities []models.HotelFacility
	for _, facilityID := range facilities {
		hotelfacilities = append(hotelfacilities, models.HotelFacility{
			HotelID: hotel.ID,
			FacilityID: facilityID,
		})
	}

	for _, hf := range hotelfacilities {
		if err := database.DB.Create(&hf).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to insert facilitites",
			})
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": hotel.ID})
}

func AddRoom (c *fiber.Ctx) error {
	var data map[string]string
	
	if err := c.BodyParser(&data); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err})
	}
	// fmt.Println("DATA ROOMNYA KNP GAMASUK YA = ", data)

	hotelIdUint, err := strconv.ParseUint(data["hotelId"], 10, 0)
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse hotel id"})
    }

    hotelId := uint(hotelIdUint)

	guest, err := strconv.Atoi(data["guest"])
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse guest"})
    }

	availability, err := strconv.Atoi(data["availability"])
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse availability"})
    }

	bed, err := strconv.Atoi(data["bed"])
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse bed"})
    }

	price, err := strconv.Atoi(data["price"])
    if err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to parse price"})
    }

	imageString := data["images"]
	images := strings.Split(imageString, ",")

	jsonImages, err := json.Marshal(images)	
	if err != nil {
		
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "failed to marshal image"})
	}

	roomDetail := models.RoomDetail{
		HotelID: hotelId,
		Name: data["name"],
		Guest: guest,
		Availability: availability,
		Bed: bed,
		Price: price,
		Images: string(jsonImages),
	}

	if err := database.DB.Create(&roomDetail).Error; err != nil {
		fmt.Println(err)
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to insert room detail",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "success"})
}
