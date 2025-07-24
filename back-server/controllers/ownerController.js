import fs from "fs";
import Car from "../models/Car.js";
import Booking from "../models/booking.js";
import User from "../models/user.js";
import imagekit from "../configs/imagekit.js";
import { checkAvailability } from "./bookingController.js";
// api to change to owner
export const changeRoletoOwner =async (req,res)=>{
    try{
        const{_id} = req.user;
        await User.findByIdAndUpdate(_id, {role:'owner'});
        res.json({success:true,message:"Now you can list cars"})
    }catch(err){
        console.log(err.message);
         res.json({success:false,message:err.message})
    }
} 

export const addCar = async (req,res)=>{
    try{
        const {_id} = req.user;
        let car = JSON.parse(req.body.carData);
        const imageFile = req.file;

        // upload imagr to imagekit
        const fileBuffer = fs.readFileSync(imageFile.path);
        // console.log(fileBuffer);

        const response = await imagekit.upload({
            file:fileBuffer,
            fileName: imageFile.originalname,
            folder: '/cars'
        })

        // optimization through imagekit url  trnasformation
            var optimizedImageUrl = imagekit.url({
            path : response.filePath,
           
            transformation : [{
                "width" : '1280'},  // w resizing
            {quality:'auto'}, //auto compresion
            {
                format:'webp' // modern  format
            }]
        });

        const image = optimizedImageUrl;
         await Car.create({...car,owner:_id,image})

        return  res.json({success:true,message:"Car added"})

    }catch(err){
        console.log(err.message);
        res.json({success:false,message:err.message})

    }
}
//  api to list all owner cars
export const getOwnerCars = async (req,res)=>{
    try{

        const {_id} =req.user;

        const cars = await Car.find({owner:_id});

        console.log("Successfull 1")
        res.json({success:true , cars})
    }catch(err){
        console.log(err.message);
        console.log("error1")
        res.json({success:false,message:err.message})

    }
}

export const toggleCarAvailablitiy = async(req,res)=>{
    try{
        const {_id} =req.user;

        const { carId } = req.body;
        console.log(carId)
        const car = await Car.findById(carId);

        //checking if car belong sto user or not 
        if(car.owner.toString() !== _id.toString()){
            return res.json({success:false,message:"Unauthorized"})
        }
        car.isAvailable = !car.isAvailable;
        await car.save()
        res.json({success:true,message:"Availability Toggled"})
    }catch(err){
        console.log(err.message);
        res.json({success:false,message:err.message})

    }
} 

export const deleteCar = async(req,res)=>{
    try{
        const {_id} =req.user;

        const { carId } = req.body;

        const car = await Car.findById(carId);

        //checking if car belong sto user or not 
        if(car.owner.toString() !== _id.toString()){
            return res.json({success:false,message:"Unauthorized"})
        }
        
        car.owner =null;
        car.isAvailable=false;
        await car.save();
        res.json({success:true,message:"Car removed"})
    }catch(err){
        console.log(err.message);
        res.json({success:false,message:err.message})

    }
} 

//api to get dashboard data

export const getDashboardData = async (req,res)=>{
        try{

            const{ _id, role}  = req.user;

            if(role !== "owner"){
                return res.json({success:false,message: "Unauthorized" });
            }

            const cars = await Car.find({owner:_id});
             const bookings = await Booking.find({owner:_id}).populate("car").sort({createdAt:-1});
             
             const pendingBookings =await Booking.find({owner:_id,status:"pending"})
             const completedBookings =await Booking.find({owner:_id,status:"confirmed"})

             //calculate monthly revenue from bookings where status is confirmed

             const monthlyRevenue = bookings.slice().filter(booking=>booking.status ==="confirmed").reduce((acc,booking)=>acc + booking.price,0);

             const dashboardData={
                totalCars: cars.length,
                totalBookings: bookings.length,
                pendingBookings:pendingBookings.length,
                completedBookings:completedBookings.length,
                recentBookings:bookings.slice(0,3),
                monthlyRevenue
            }
            res.json({success:true,dashboardData})


        }catch(err){
             console.log(err.message);
        res.json({success:false,message:err.message})
        }
} 

// Api to create booking
export const createBooking = async(req,res)=>{
    try{
        const {_id} = req.user;
        const{car , pickupDate , returnDate} = req.body;

        const isAvailable = await checkAvailability(car,pickupDate, returnDate);

        if(!isAvailable){
            return res.json({success:false,message:"Car is not available"})
        }

        const carData = await Car.findById(car);

        //calculatr rize based on pickup and return date';
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);

        const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
        console.log(noOfDays); 
        const price = carData.pricePerDay*noOfDays;

        await Booking.create({car,owner:carData.owner,user:_id,pickupDate,returnDate,price});

        res.json({success:true,message:"Booking Created"});

    }catch(err){
        console.log(err.message);
        res.json({success:false,message:err.message})
    }
} 

//api to list user booking

export const getUserBooking = async(req,res)=>{
    try{
        const {_id} = req.user;
        const bookings = await Booking.find({user:_id}).populate("car").sort({createdAt:-1});
        res.json({success:true,bookings})

    }catch(err){
        console.log(err.message);
        res.json({success:false,message:err.message})
    }
}

//api to get owner booking

export const getOwnerBookings = async(req,res)=>{
    try{
        console.log("ownerbooking success")
       if(req.user.role!=="owner"){
        return res.json({success:false,message:"Unauthorized"})
       }
        const bookings = await Booking.find({owner:req.user._id})
        .populate("car user")
        .select("-user.password")
        .sort({createdAt:-1});
        res.json({success:true,bookings})

    }catch(err){
        console.log(err.message);
        res.json({success:false,message:err.message})
    }
}

//api too change the oboking status

export const changeBookingStatus = async(req,res)=>{
    try{
      const {_id} = req.user;
      const {bookingId,status} = req.body;

      const booking = await Booking.findById(bookingId)

      if(booking.owner.toString()!==_id.toString()){
        return res.json({success:false,message:"Unauthorized"})
      }

      booking.status = status;
      await booking.save();

        res.json({success:true,message:"Status Updated"})

    }catch(err){
        console.log(err.message);
        res.json({success:false,message:err.message})
    }
}
//api too update user image
export const updateUserImage = async(req,res)=>{
    try{
        const {_id} = req.user;
         const imageFile = req.file;

        // upload imagr to imagekit
        const fileBuffer = fs.readFileSync(imageFile.path);
        console.log(fileBuffer);

        const response = await imagekit.upload({
            file:fileBuffer,
            fileName: imageFile.originalname,
            folder: '/users'
        })

        // optimization through imagekit url  trnasformation
            var optimizedImageUrl = imagekit.url({
            path : response.filePath,
           
            transformation : [{
                "width" : '400'},  // w resizing
            {quality:'auto'}, //auto compresion
            {
                format:'webp' // modern  format
            }]
    })
        await User.findByIdAndUpdate(_id,{ image: optimizedImageUrl })
         res.json({success:true,message:"Image Updated"})
    }catch(err){
         console.log(err.message);
        res.json({success:false,message:err.message})
    }
}  