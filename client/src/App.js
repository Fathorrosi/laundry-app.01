import './App.css';
import Navbar from './components/navbar/Navbar';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Dashboard from './pages/dashboard/Dashboard';
import Customer from './pages/customer/Customer';
import Blast from './pages/blast/Blast';

function App() {
  return (
    <Router>
      <div className="content">
        <div className="container">
          <Navbar />
          <div className="page">
            <Switch>
              <Route exact path="/">
                <Dashboard />
              </Route>
              <Route exact path="/customer">
                <Customer />
              </Route>
              <Route exact path="/blast">
                <Blast />
              </Route>
            </Switch>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;