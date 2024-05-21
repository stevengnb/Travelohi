package middleware

import (
	"backendgo/database"
	"backendgo/models"
	"fmt"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gofiber/fiber/v2"
)

func RequireUser(c *fiber.Ctx) error {
	tokenString := c.Cookies("jwt")

	if tokenString == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "token null"})
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("SECRET")), nil
	})

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Error ketika parse"})
	}

	
	if claims, ok := token.Claims.(jwt.MapClaims); ok && time.Now().Before(time.Unix(int64(claims["exp"].(float64)), 0)) {
		userID := claims["sub"].(string)
		
		var user models.User
		if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "No user"})
		}
		
		return c.Next()
	}

	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "tokennya ga valid"})
}


func RequireAdmin(c *fiber.Ctx) error {
	tokenString := c.Cookies("jwt")

	if tokenString == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "token null"})
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("SECRET")), nil
	})

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Error ketika parse"})
	}

	
	if claims, ok := token.Claims.(jwt.MapClaims); ok && time.Now().Before(time.Unix(int64(claims["exp"].(float64)), 0)) {
		userID := claims["sub"].(string)
		
		var user models.User
		if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "No user"})
		}
		
		if user.Email == "operatortravelohi@gmail.com" {
			return c.Next()
		} else {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
		}
	}

	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "tokennya ga valid"})
}
