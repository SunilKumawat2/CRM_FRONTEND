import AllRoutes from "./allroutes/AllRoutes";
import UserProvider from "./context/UserContext";


function App() {
  return (
    <div className="App">
      <UserProvider>
      <AllRoutes/>
      </UserProvider>
    </div>
  );
}

export default App;
