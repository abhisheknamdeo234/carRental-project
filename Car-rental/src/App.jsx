import React, { useState } from "react";
import Navbar from "./components/Navbar"
import {Routes,Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import MyBookings from "./pages/MyBookings";
import Footer from "./components/Footer";
import Layout from "./pages/owner/Layout";
import DashBoard from "./pages/owner/DashBoard";
import AddCar from "./pages/owner/AddCar";
import ManageCar from "./pages/owner/ManageCar"
import ManageBookings from "./pages/owner/ManageBookings";
import Login from "./components/Login";
import {Toaster} from "react-hot-toast";
import {  useAppContext } from "./context/AppContext";


function App() {

  const {showLogin} = useAppContext();
  const isOwnerPath = useLocation().pathname.startsWith('/owner');   
  
  return (

    <>
    <Toaster/>
    {showLogin && <Login />}
    
    {
      !isOwnerPath && <Navbar />

      }
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/car-details/:id" element={<CarDetails />}/>
        <Route path="/cars" element={<Cars />}/>
        <Route path="/my-bookings" element={<MyBookings />}/>
       
        <Route path="/owner" element={<Layout />}> 
          <Route index element={<DashBoard />}/>
          <Route path="add-car" element={<AddCar />}/>
          <Route path="manage-cars" element={<ManageCar />}/>
          <Route path="manage-bookings" element={<ManageBookings />}/>
        </Route>

      </Routes>
           {!isOwnerPath && <Footer/>} 
    </>
  )
}

export default App
