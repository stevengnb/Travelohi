import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import MainTemplate from "./templates/main-template";
import { IMenu, MENU_LIST } from "./settings/menu-settings";

function App() {
  return (
    <>
      <MainTemplate>
        <Router>
          <UserProvider>
            <Routes>
              {MENU_LIST.map(({ path, element, name }: IMenu) => (
                <Route key={name} path={path} element={element} />
              ))}
            </Routes>
          </UserProvider>
        </Router>
      </MainTemplate>
    </>
  );
}

export default App;
