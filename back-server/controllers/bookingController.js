import booking from "../models/booking.js";
import Car from "../models/Car.js";


export const checkAvailability = async (Car,pickupDate,returnDate)=>{
    const bookings = await booking.find({Car, 
        pickupDate:{$lte:returnDate},
        returnDate:{$gte:pickupDate},
    })

    return bookings.length === 0;
}

// api for   chekcing availability of car in given date

export const checkAvailabilityOfCar = async (req,res)=>{
try{
    const{location , pickupDate , returnDate} =req.body;
    //fetch all cars for the given location
    const cars = await Car.find({location,isAvailable:true});

    //check for availblity  for the given  date range using promise
    const availableCarsPromises = cars.map(async (car)=>{
        const isAvailable = await checkAvailability( car._id, pickupDate , returnDate)
        return {...car._doc,isAvailable:isAvailable}
    }) 

    let availableCars = await Promise.all(availableCarsPromises);
    availableCars = availableCars.filter(car=>car.isAvailable===true);

    res.json({success:true,availableCars})



}catch(err){
    console.log(err.message);
    res.json({success:false,message:err.message});
}
}

//api to get owner booking
export const createBooking=async (req,res)=>{
    try {
        const{_id} = req.user;
        const {car,pickupDate,returnDate} = req.body;

        const isAvailable = await checkAvailability(car,pickupDate,returnDate)
        if(!isAvailable){
            return res.json({success:false,message:"Car is not available"})
        }

        const carData = await Car.findById(_id);
        //calculate price based on pickup and returndate
        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);
        const noOfDays = Math.ceil((returned - picked) / (1000*60*60*24) );
        const price = carData.pricePerDay * noOfDays;

        await booking.create({car, owner:carData.owner, user:_id, pickupDate,returnDate, price});
        res.json({success:true,message:"Booking created"});
    } catch (error) {
        res.json({success:false,message:error.message});
    }
}

//api to List user bookings

export const getuserBooking =async (req,res)=>{
    try {
        const{_id} = req.user;
        const bookings = await booking.find({user:_id}).populate("car").sort({createdAt:-1});
        res.json({success:true,bookings});

    } catch (error) {
        res.json({success:false,message:error.message});
    }
}

//api  to get owner bookings
export const getOwnerBooking =async (req,res)=>{
    try {
        if(req.user.role !=='owner'){
           return  res.json({success:false, message:"Unauthorized"});
        }
        const bookings = await booking.find({owner:req.user._id}).populate("car user").select("-user.password").sort({createdAt:-1});
        res.json({success:true,bookings}); 

    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message});
    }
}

//api to change booking status

// export const changeBookingStatus =async (req,res)=>{
//     try {
//          const{_id} = req.user;
//          const {bookingId,status} = req.body;
//         // const bookings = await booking.findById({owner:req.user._id})
//         const bookings = await booking.findById(bookingId)
//         if(bookings.owner.toString() !== _id.toString()){
//             return  res.json({success:false, message:"Unauthorized"});
//         }
//         bookings.status = status;
//         await bookings.save();
//         res.json({success:true,message:"Booking updated"}); 

//     } catch (error) {
//         console.log(error.message)
//         res.json({success:false,message:error.message});
//     }
// }

export const changeBookingStatus = async (req, res) => {
  try {
    const { _id } = req.user;
    const { bookingId, status } = req.body;

    const bookingData = await booking.findById(bookingId);
    if (!bookingData) {
      return res.json({ success: false, message: "Booking not found" });
    }

    if (bookingData.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    bookingData.status = status;
    await bookingData.save();

    res.json({ success: true, message: "Booking updated" });

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

