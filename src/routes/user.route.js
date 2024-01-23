import { Router } from "express";
import { registerUser,loginUser,logoutUser,refreshAccessToken,channgeCurrentPassword,
    updateAccountDetails,
    updateAvatar,
    updateUserCoverImage,
     } from "../controoler/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js" 
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register")
.post( 
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login")
.post(loginUser);

router.route("/logout")
.post(verifyJWT,logoutUser);

router.route("/refresh-token")
.post(refreshAccessToken);

router.route("/channgeCurrentPassword")
.post(channgeCurrentPassword);

router.route("/updateAccountDetails")
.post(updateAccountDetails);

router.route("/updateAvatar")
.post(updateAvatar);

router.route("/updateUserCoverImage")
.post(updateUserCoverImage);




export default router;
