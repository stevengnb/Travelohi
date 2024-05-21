package controllers

import (
	"backendgo/database"
	"backendgo/models"
	"bytes"
	"errors"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"
	"text/template"
	"time"

	"github.com/gofiber/fiber/v2"
	"gopkg.in/gomail.v2"
	"gorm.io/gorm"
)

func SendOTP(c *fiber.Ctx) error {
	var data map[string]string

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	email := data["email"]

	rand.Seed(time.Now().UnixNano())
	code := rand.Intn(900000) + 100000

	expiresAt := time.Now().Add(time.Minute * 5)

	var user models.User
	database.DB.First(&user, "email = ?", email)
	
	if user.ID == 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"status": "invalid",
			"message": "Invalid email",
		})
	}

	if user.Banned {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "Account banned",
		})
	}
	
	var existUser models.Otp
	result := database.DB.Where("email = ?", email).First(&existUser)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		otp := models.Otp{
			Email:   email,
			Expires: expiresAt,
			Code:    code,
		}

		if err := database.DB.Create(&otp).Error; err != nil {
			return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
				"status": "create error",
				"message": "Failed to create OTP record",
			})
		}
	} else {
		expiresAt := time.Now().Add(5 * time.Minute)
		existUser.Code = code
		existUser.Expires = expiresAt
		
		if err := database.DB.Where("email = ?", existUser.Email).Save(&existUser).Error; err != nil {
			return c.Status(http.StatusBadRequest).JSON(fiber.Map{
				"status": "update error",
				"message": "Failed to update OTP record",
			})
		}
	}

	currentDir, err := os.Getwd()
	if err != nil {
		return err
	}

	templatePath := filepath.Join(currentDir, "template", "otp-html.html")

	SendEmailLoginOtp(email, templatePath, code)

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"status": "success",
		"message": "OTP sent successfully",
	})
}

func SendEmailLoginOtp(toEmail string, templatePath string, code int) error {
	var body bytes.Buffer
	t, err := template.ParseFiles(templatePath)
	if err != nil {
		fmt.Println("Error parsing template:", err)
		return err
	}

	t.Execute(&body, struct{ Code int }{Code: code})

	if err != nil {
		fmt.Println(err)
		return err
	}

	m := gomail.NewMessage()
	m.SetHeader("From", "tpawebtn@gmail.com")
	m.SetHeader("To", toEmail)
	m.SetHeader("Subject", "Login with OTP")
	m.SetBody("text/html", body.String())

	d := gomail.NewDialer("smtp.gmail.com", 587, "tpawebtn@gmail.com", "tnjuasbdhvnpbwgy")

	if err := d.DialAndSend(m); err != nil {
        return err
    }

    return nil
}

func VerifyOTP(c *fiber.Ctx) error {
	var data map[string]string
	if err := c.BodyParser(&data); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Failed to read request body",
		})
	}

	email := data["email"]
	code := data["code"]

	var otp models.Otp
	result := database.DB.Where("email = ?", email).First(&otp)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"status": "not found",
			"message": "OTP record not found for the provided email",
		})
	}

	if code != fmt.Sprintf("%d", otp.Code) {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"status": "invalid",
			"message": "Invalid OTP code",
		})
	}

	if time.Now().After(otp.Expires) {
		return c.Status(http.StatusUnauthorized).JSON(fiber.Map{
			"status": "expired",
			"message": "OTP has expired",
		})
	}

	// database.DB.Delete(&otp)

	return c.JSON(fiber.Map{
		"status": "success",
		"message": "OTP verification successful",
	})
}
