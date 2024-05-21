package controllers

import (
	"backendgo/database"
	"backendgo/models"
	"fmt"
	"net/http"
	"net/mail"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
	"gopkg.in/gomail.v2"
)

const SecretKey = "secret"

// register
func Register(c *fiber.Ctx) error {
	var data map[string]string

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	var userExists models.User

	database.DB.First(&userExists, "email = ?", data["email"])

	if userExists.ID != 0 {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{
			"error": "Email has been registered!",
		})
	}

	var dob time.Time
	dob, err := time.Parse("2006-01-02", data["dob"])
	if err != nil {
		fmt.Println("Error parsing date of birth:", err)
		return err
	}

	age := time.Since(dob).Hours() / 24 / 365

	if age < 13 {
		fmt.Println("User must be at least 13 years old.")
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "User must be at least 13 years old.",
		})
	}

	fmt.Println(age);

	const specialCharacters = "!@#$%^&*()_-+=<>?/{}[]|"

	if len(data["firstName"]) < 5 || len(data["lastName"]) < 5 ||
		!isAlphabetical(data["firstName"]) || !isAlphabetical(data["lastName"]) {
		fmt.Println("First name and last name must be more than 5 characters and contain only alphabetical characters")
		return err
	}

	if !isValidEmail(data["email"]) {
		fmt.Println("Wrong email format!")
		return err
	}

	if data["password"] != data["confirmPassword"] {
		fmt.Println("Confirm password didn't match")
		return err
	}

	if !isValidPassword(data["password"], specialCharacters) {
		fmt.Println("Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be 8-30 characters long.")
		return err
	}

	if data["gender"] != "male" && data["gender"] != "female" {
		fmt.Println("User gender must be male or female!")
		return err
	}

	if data["question"] == "" {
		fmt.Println("Question must be filled!")
		return err
	}

	if data["answer"] == "" {
		fmt.Println("Answer must be filled!")
		return err
	}

	if data["imageUrl"] == "" {
		fmt.Println("Profile picture must be filled!")
		return err
	}

	subs := data["isEmail"] == "true"

	password, _ := bcrypt.GenerateFromPassword([]byte(data["password"]), 14)
	user := models.User{
		FirstName:        data["firstName"],
		LastName:         data["lastName"],
		Gender:           data["gender"],
		DateOfBirth:      dob,
		Email:            data["email"],
		Password:         password,
		SecurityQuestion: data["question"],
		Answer:           data["answer"],
		ProfilePicture:   data["imageUrl"],
		IsEmail: subs,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to register user"})
	}

	if err := sendEmailInform(user.Email); err != nil {
		fmt.Println("Error sending confirmation email:", err)
	}

	return c.Status(fiber.StatusOK).JSON(user)
}

// register validation function
func isAlphabetical(s string) bool {
	return regexp.MustCompile("^[a-zA-Z]+$").MatchString(s)
}

func isValidEmail(email string) bool {
	_, err := mail.ParseAddress(email)
	return err == nil
}

func isValidPassword(password, specialCharacters string) bool {
	return regexp.MustCompile(`[a-z]`).MatchString(password) &&
		regexp.MustCompile(`[A-Z]`).MatchString(password) &&
		regexp.MustCompile(`\d`).MatchString(password) &&
		strings.ContainsAny(password, specialCharacters) &&
		len(password) >= 8 && len(password) <= 30
}

// send register confirmation to email
func sendEmailInform(toEmail string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", "tpawebtn@gmail.com")
	m.SetHeader("To", toEmail)
	m.SetHeader("Subject", "Registration Confirmation")
	m.SetBody("text/html", "<h1> Registration Completed!</h1><p>Your account has been successfully registered!</p>")

	d := gomail.NewDialer("smtp.gmail.com", 587, "tpawebtn@gmail.com", "tnjuasbdhvnpbwgy")

	if err := d.DialAndSend(m); err != nil {
        return err
    }

    return nil
}

func User(c *fiber.Ctx) error {
	var body struct {
		Email string `json:"email"`
	}
	
	if err := c.BodyParser(&body); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "Failed to read body",
		})
	}

	var user models.User

	database.DB.First(&user, "email = ?", body.Email)

	if user.ID == 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid email",
		})
	}

	if user.Banned {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "Account banned",
		})
	}

	return c.Status(http.StatusOK).JSON(user);
}

func Login(c *fiber.Ctx) error {
	var body struct {
	 Email    string `json:"email"`
	 Password string `json:"password"`
	}
   
	if err := c.BodyParser(&body); err != nil {
	 return c.Status(http.StatusBadRequest).JSON(fiber.Map{
	  "error": "Failed to read body",
	 })
	}

	emailPattern := `^[^@]+@[^@.]+\.[^@.]+[^.]$`
	re := regexp.MustCompile(emailPattern)

	if !re.MatchString(body.Email) {
		fmt.Println("WREONG FORM")
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Wrong email format!",
		})
	}

	const specialCharacters = "!@#$%^&*()_-+=<>?/{}[]|"

	if !isValidPassword(body.Password, specialCharacters) {
		fmt.Println("Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be 8-30 characters long.")
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid Passsword",
		})
	}

	var user models.User
   
	database.DB.First(&user, "email = ?", body.Email)
   
	if user.ID == 0 {
	 return c.Status(http.StatusBadRequest).JSON(fiber.Map{
	  "error": "Invalid Email or Password",
	 })
	}
   
	if user.Banned {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Account banned",
		})
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))
	if err != nil {
	 return c.Status(http.StatusBadRequest).JSON(fiber.Map{
	  "error": "Invalid Email or Password",
	 })
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   strconv.Itoa(int(user.ID)),
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
		"email": user.Email,
	})
	
	secretKey := []byte(os.Getenv("SECRET"))
	if secretKey == nil {
	 return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
	  "error": "Secret key not found",
	 })
	}
   
	tokenString, err := token.SignedString(secretKey)
   
	if err != nil {
	 return c.Status(http.StatusBadRequest).JSON(fiber.Map{
	  "error": "Failed to Create Token",
	 })
	}
   
	c.Cookie(&fiber.Cookie{
	 Name:     "jwt",
	 Value:    tokenString,
	 Expires:  time.Now().Add(time.Hour * 24),
	 SameSite: "None",
	})
   
	return c.Status(http.StatusOK).JSON(fiber.Map{"success": true})
}

func LogOut(c *fiber.Ctx) error {
	c.ClearCookie("jwt");

	return c.Status(http.StatusOK).JSON(fiber.Map{
		"message":"success",
	})
}

func ForgotPassword(c *fiber.Ctx) error {
	var data map[string]string

	if err := c.BodyParser(&data); err != nil {
		return err
	}

	var user models.User

	database.DB.First(&user, "email = ?", data["email"])

	if user.ID == 0 {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid email",
		})
	}

	if user.Banned {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Account banned",
		})
	}

	const specialCharacters = "!@#$%^&*()_-+=<>?/{}[]|"

	if !isValidPassword(data["password"], specialCharacters) {
		fmt.Println("Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character, and be 8-30 characters long.")
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid Passsword",
		})
	}

	if strings.ToLower(data["answer"]) != strings.ToLower(user.Answer) {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid Answer",
		})
	}
	
	if data["password"] != data["confirmPassword"] {
		fmt.Println("Confirm password didn't match")
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid Password",
		})
	}
	
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(data["password"]))
	if err == nil {
	 return c.Status(http.StatusBadRequest).JSON(fiber.Map{
	  "message": "Invalid Password",
	 })
	}

	newPassword, err := bcrypt.GenerateFromPassword([]byte(data["password"]), 14)
	if err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
			"message": "Server problem",
		})
	}

	user.Password = newPassword
	if err := database.DB.Where("email = ?", user.Email).Save(&user).Error; err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"message": "Failed to update password",
		})
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"message":"success"})
}


func LoginOtp(c *fiber.Ctx) error {
	var body struct {
	 Email    string `json:"email"`
	}
   
	if err := c.BodyParser(&body); err != nil {
	 return c.Status(http.StatusBadRequest).JSON(fiber.Map{
	  "error": "Failed to read body",
	 })
	}
   
	var user models.User
   
	database.DB.First(&user, "email = ?", body.Email)
   
	if user.ID == 0 {
	 return c.Status(http.StatusBadRequest).JSON(fiber.Map{
	  "error": "Invalid Email or Password",
	 })
	}

	if user.Banned {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{
			"error": "Account banned",
		})
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   strconv.Itoa(int(user.ID)),
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
		"email": user.Email,
	})
	
	secretKey := []byte(os.Getenv("SECRET"))
	if secretKey == nil {
	 return c.Status(http.StatusInternalServerError).JSON(fiber.Map{
	  "error": "Secret key not found",
	 })
	}
   
	tokenString, err := token.SignedString(secretKey)
   
	if err != nil {
	 return c.Status(http.StatusBadRequest).JSON(fiber.Map{
	  "error": "Failed to Create Token",
	 })
	}
   
	c.Cookie(&fiber.Cookie{
	 Name:     "jwt",
	 Value:    tokenString,
	 Expires:  time.Now().Add(time.Hour * 24),
	 SameSite: "None",
	})
   
	return c.Status(http.StatusOK).JSON(fiber.Map{"success": true})
}