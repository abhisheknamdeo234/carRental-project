import express from "express";
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage });

import { protect } from "../middleware/auth.js";
import { changeRoletoOwner,addCar, getOwnerCars, toggleCarAvailablitiy, deleteCar,getDashboardData, updateUserImage } from "../controllers/ownerController.js";

const ownerRouter = express.Router();

ownerRouter.post("/change-role",protect,changeRoletoOwner)
ownerRouter.post("/add-car",upload.single('image'),protect,addCar)
ownerRouter.get("/car",protect,getOwnerCars)
ownerRouter.post("/toggle-car",protect,toggleCarAvailablitiy)
ownerRouter.post("/delete-car",protect,deleteCar)
ownerRouter.get("/dashboard",protect,getDashboardData)

ownerRouter.post("/update-image",upload.single('image'),protect,updateUserImage)

export default ownerRouter;