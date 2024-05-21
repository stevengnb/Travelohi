package controllers

import (
	"backendgo/database"
	"backendgo/models"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func UpdateProfilePicture(c *fiber.Ctx) error {

	var body struct {
	 Id    uint `json:"id"`
	 ProfilePicture string `json:"imageUrl"`
	}
   
	if err := c.BodyParser(&body); err != nil {
	 return c.Status(http.StatusBadRequest).JSON(fiber.Map{
	  "error": "Failed to read body",
	 })
	}

	var user models.User
	database.DB.First(&user, "id = ?", body.Id)

	user.ProfilePicture = body.ProfilePicture

	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update profile picture"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Profile picture updated successfully"})
}


func UpdateProfileDetail(c *fiber.Ctx) error {
	var body struct {
	 Id    uint `json:"id"`
	 FirstName string `json:"firstName"`
	 LastName string `json:"lastName"`
	 Gender string `json:"gender"`
	 DateOfBirth string `json:"dob"`
	 IsEmail string `json:"isEmail"`
	 Email string `json:"email"`
	}
   
	if err := c.BodyParser(&body); err != nil {
	 return c.Status(http.StatusBadRequest).JSON(fiber.Map{
	  "error": "Failed to read body",
	 })
	}

	var dob time.Time
	dob, err := time.Parse("2006-01-02", body.DateOfBirth)
	if err != nil {
		fmt.Println("Error parsing date of birth:", err)
		return err
	}

	var user models.User
	database.DB.First(&user, "id = ?", body.Id)

	subs := body.IsEmail == "true"

	if len(body.FirstName) < 5 || len(body.LastName) < 5 ||
		!isAlphabetical(body.FirstName) || !isAlphabetical(body.LastName) {
		fmt.Println("First name and last name must be more than 5 characters and contain only alphabetical characters")
		return err
	}

	if !isValidEmail(body.Email) {
		fmt.Println("Wrong email format!")
		return err
	}

	if body.Gender != "male" && body.Gender != "female" {
		fmt.Println("User gender must be male or female!")
		return err
	}

	user.FirstName = body.FirstName
	user.LastName = body.LastName
	user.IsEmail = subs
	user.DateOfBirth = dob
	user.Gender = body.Gender
	user.Email = body.Email

	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to update profile details"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Profile updated successfully"})
}

func GetUserCreditCards(c *fiber.Ctx) error {
    userID := c.Params("userID")

    creditCards, err := models.GetUserCreditCards(database.DB, userID)
    if err != nil {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to fetch credit cards"})
    }

    return c.Status(http.StatusOK).JSON(fiber.Map{"creditCards": creditCards})
} 	

func AddCreditCard(c *fiber.Ctx) error {
	var body struct {
		UserID         uint   `json:"userId"`
		CreditCardName string `json:"name"`
		BankName       string `json:"bankName"`
		CardNumber     string    `json:"number"`
		CVV            string    `json:"cvv"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to read body",
		})
	}

	cn, err := strconv.Atoi(body.CardNumber)

	if err != nil {
		fmt.Println("Error parsing string to integer")
		return err
	}

	cvv, err := strconv.Atoi(body.CVV)

	if err != nil {
		fmt.Println("Error parsing string to integer")
		return err
	}

	var existingCreditCard models.CreditCard
	if err := database.DB.
		Where("number = ? AND cvv = ?", cn, cvv).
		First(&existingCreditCard).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to check existing credit card"})
		}
	
		newCreditCard := models.CreditCard{
			Name:     body.CreditCardName,
			BankName: body.BankName,
			Number:   cn,
			Cvv:      cvv,
		}
	
		if err := database.DB.Create(&newCreditCard).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to add new credit card"})
		}
		userCreditCard := models.UserCreditCard{
			UserID:       body.UserID,
			CreditCardID: newCreditCard.ID,
		}

		if err := database.DB.Create(&userCreditCard).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to add relation user & cc"})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "New credit card added successfully"})
	}

	var existingUserCreditCard models.UserCreditCard
	if err := database.DB.
		Where("user_id = ? AND credit_card_id = ?", body.UserID, existingCreditCard.ID).
		First(&existingUserCreditCard).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to check existing userCreditCard"})
		}

		userCreditCard := models.UserCreditCard{
			UserID:       body.UserID,
			CreditCardID: existingCreditCard.ID,
		}

		if err := database.DB.Create(&userCreditCard).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to add relation user & cc"})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Credit card added"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Credit card added"})
}