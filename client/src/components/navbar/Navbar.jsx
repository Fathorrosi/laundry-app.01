import "./navbar.css"
import { useState } from "react";
import {
    RiDashboardFill,
    RiBarChartHorizontalFill,
    RiMessage2Fill,
    RiSettingsFill,
    RiUserFill
} from 'react-icons/ri';
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { default as logo } from '../../assets/logo.svg';

export default function Navbar() {
    const [selected, setSelected] = useState(localStorage.getItem("selectedMenu"))

    useEffect(() => {
        if (localStorage.getItem("selectedMenu") === '') {
            localStorage.setItem("selectedMenu", '1')
        }
    })

    return (
        <div>
            <div className="navbar">
                <div className="logo">
                    <img src={logo} />
                </div>
                <ul>
                    <Link to="/" onClick={() => {
                        localStorage.setItem("selectedMenu", "1")
                        setSelected("1")
                    }
                    } className="link">
                        <li className={selected === "1" ? "list-active" : "list"} value="1">
                            <RiDashboardFill size={20} /> &nbsp; Dashboard</li> </Link>
                    <Link to="/customer" onClick={() => {
                        localStorage.setItem("selectedMenu", "2")
                        setSelected("2")
                    }} className="link">
                        <li className={selected === "2" ? "list-active" : "list"} value="2">
                            <RiBarChartHorizontalFill size={20} /> &nbsp; Customers</li> </Link>
                    <Link to="/blast" onClick={() => {
                        localStorage.setItem("selectedMenu", "3")
                        setSelected("3")
                    }} className="link">
                        <li className={selected === "3" ? "list-active" : "list"} value="3">
                            <RiMessage2Fill size={20} /> &nbsp; Blast</li> </Link>
                    <Link to="/management" onClick={() => {
                        localStorage.setItem("selectedMenu", "4")
                        setSelected("4")
                    }
                    } className="link">
                        <li className={selected === "4" ? "list-active" : "list"} value="4">
                            <RiSettingsFill size={20} /> &nbsp; Management</li> </Link>
                </ul>
                <div className="user">
                    <h4> Renita Fuji &nbsp;&nbsp; <RiUserFill size={15} /></h4>
                </div>
            </div>
        </div >
    )
}
