package routes

import (
	"backendgo/controllers"
	"backendgo/middleware"

	"github.com/gofiber/fiber/v2"
)

func Setup(app *fiber.App) {
	// login register otp
	app.Post("/api/register", controllers.Register)
	app.Post("/api/users", controllers.User)
	app.Post("/api/login", controllers.Login)
	app.Get("/api/logout", controllers.LogOut)
	app.Post("/api/sendOtp", controllers.SendOTP)
	app.Post("/api/verifyOtp", controllers.VerifyOTP)
	app.Post("/api/loginOtp", controllers.LoginOtp)
	app.Post("/api/forgotPassword", controllers.ForgotPassword)

	// update user detail
	app.Put("/api/updateProfilePicture", middleware.RequireUser, controllers.UpdateProfilePicture)	
	app.Put("/api/updateProfileDetail", middleware.RequireUser, controllers.UpdateProfileDetail)	
	app.Get("/users/creditCards/:userID", middleware.RequireUser, controllers.GetUserCreditCards)
	app.Post("/users/addCreditCard", middleware.RequireUser, controllers.AddCreditCard)

	// admin control
	app.Post("/admin/sendNewsletter", middleware.RequireAdmin, controllers.SendNewsletter)
	app.Get("/admin/getUsers", middleware.RequireAdmin, controllers.GetAllUsers)
	app.Post("/admin/banUser", middleware.RequireAdmin, controllers.BanUser)
	app.Post("/admin/addPromo",  middleware.RequireAdmin, controllers.AddPromo)
	app.Put("/admin/updatePromo",  middleware.RequireAdmin, controllers.UpdatePromoDetail)
	app.Get("/admin/getCities", middleware.RequireAdmin, controllers.GetAllCity)
	app.Post("/admin/addHotel", middleware.RequireAdmin, controllers.AddHotel)
	app.Post("/admin/addRoom", middleware.RequireAdmin, controllers.AddRoom)
	
	// general
	app.Get("/search", controllers.GetSearchResult)
	app.Get("/searchFlight", controllers.GetFlightSearchResult)
	app.Get("/searchDetailFlight", controllers.GetSearchDetailFlight)
	app.Get("/searchDetail", controllers.GetSearchDetail)
	app.Get("/getPromos", controllers.GetAllPromos)
	app.Get("/getFacilities", controllers.GetAllFacility)
	app.Get("/getHotel", controllers.GetHotelDetails)
	app.Get("/getFlight", controllers.GetFlightDetails)
	app.Get("/getRecentSearches", controllers.GetUserRecentSearch)
	app.Post("/addRecentSearches", controllers.AddRecentSearch)
	app.Get("/hotelRecommendations", controllers.GetHotelRecommendations)
	app.Put("/updateWallet", middleware.RequireUser, controllers.UpdateWallet)

	// cart
	app.Post("/addToCart", middleware.RequireUser, controllers.AddToCart)
	app.Post("/addToCartFlight", middleware.RequireUser, controllers.AddToCartFlight)
	app.Get("/getCart", controllers.GetCart)
	app.Delete("/removeTicketCart", controllers.RemoveCartTicket);
	app.Delete("/removeHotelCart", controllers.RemoveCartHotel);
	app.Put("/updateCartHotel", controllers.UpdateCartHotel);
	app.Get("/getPromoCode", controllers.CheckPromo);
	app.Post("/bookWithWallet", controllers.BookWithWallet);
}