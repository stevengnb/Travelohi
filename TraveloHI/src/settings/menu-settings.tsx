import Admin from "../pages/admin/admin";
import Cart from "../pages/cart/Cart";
import Game from "../pages/game/game";
import Home from "../pages/home/home";
import Location from "../pages/location";
import Login from "../pages/login/login";
import Profile from "../pages/profile/profile";
import Register from "../pages/register";
import FlightDetail from "../pages/search/FlightDetail";
import HotelDetail from "../pages/search/HotelDetail";
import SearchFlight from "../pages/search/SearchFlight";
import SearchHotel from "../pages/search/SearchHotel";

export interface IMenu {
  name: string;
  path: string;
  element: JSX.Element;
}

export const MENU_LIST: IMenu[] = [
  {
    element: <Home />,
    name: "Home",
    path: "/",
  },
  {
    element: <Login />,
    name: "Login",
    path: "/login",
  },
  {
    element: <Register />,
    name: "Register",
    path: "/register",
  },
  {
    element: <Game />,
    name: "Game",
    path: "/game",
  },
  {
    element: <Location />,
    name: "Location",
    path: "/location",
  },
  {
    element: <Profile />,
    name: "Profile",
    path: "/profile",
  },
  {
    element: <Admin />,
    name: "Admin",
    path: "/admin",
  },
  {
    element: <SearchHotel />,
    name: "Search Hotel",
    path: "/search-hotel",
  },
  {
    element: <SearchFlight />,
    name: "Search Flight",
    path: "/search-flight",
  },
  {
    element: <HotelDetail />,
    name: "Hotel Detail",
    path: "/hotels/:hotelId",
  },
  {
    element: <FlightDetail />,
    name: "Flight Detail",
    path: "/flights/:flightId",
  },
  {
    element: <Cart />,
    name: "Cart",
    path: "/cart",
  },
];
