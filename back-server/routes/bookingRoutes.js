import express from "express";
import { checkAvailabilityOfCar } from "../controllers/bookingController.js";
import { changeBookingStatus, createBooking, getOwnerBookings, getUserBooking } from "../controllers/ownerController.js";
import { protect } from "../middleware/auth.js";

const bookingRouter = express.Router();

bookingRouter.post("/check-availability",checkAvailabilityOfCar);
bookingRouter.post("/create",protect,createBooking);
bookingRouter.get("/user",protect,getUserBooking);
bookingRouter.get("/owner",protect,getOwnerBookings);
bookingRouter.post("/change-status",protect,changeBookingStatus);

export default bookingRouter;