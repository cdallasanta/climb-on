import React, {Component} from 'react';
import { connect } from 'react-redux';
import "./stylesheets/global.scss";
import { withRouter } from 'react-router-dom';
import Home from './containers/home';
import Login from './containers/sessions/login';

class App extends Component {

  handleLogin = (data, remember = true) => {
    this.props.login(data.user);

    if(remember){
      localStorage.setItem("currentUser", JSON.stringify(data.user));
    }
  }

  handleLogout = () => {
    this.props.logout();
    localStorage.removeItem("currentUser");
    this.props.history.push('/');
  }

  loginStatus = () => {
    if (localStorage.getItem("currentUser") !== null){
      this.props.login(JSON.parse(localStorage.getItem("currentUser")));
    } else {
      this.handleLogout();
    }
  }

  componentDidMount() {
    this.loginStatus();
  }

  render() {
    if (this.props.logged_in) {
      return (
        <Home {...this.props} handleLogout={this.handleLogout} />
      );
    } else {
      return (
        <Login {...this.props} handleLogin={this.handleLogin} />
      );
    }
  }
}


const mapStateToProps = state => {
  return {
    logged_in: state.logged_in,
    current_user: state.user
  }
}

const mapDispatchToProps = dispatch => {
  return {
    login: (user) => dispatch({type:"LOGIN", payload:user}),
    logout: () => dispatch({type:"LOGOUT"})
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(App));