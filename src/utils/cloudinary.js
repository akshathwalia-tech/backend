import {v2 as cloudinary} from "cloudinary"
import fs from "fs"



const uploadOnCloudinary = async (localFilePath) => {
    try {
        // Enforce lazy evaluation of environment variables so ES Module Hoisting doesn't strip them!
        cloudinary.config({ 
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
          api_key: process.env.CLOUDINARY_API_KEY, 
          api_secret: process.env.CLOUDINARY_API_SECRET 
        });

        if (!localFilePath) return null;
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            timeout: 120000,  // 120 seconds (default 60s causes TimeoutError)
        });
        
        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        console.error("Cloudinary Upload Error Details:", error);
        if (localFilePath) fs.unlinkSync(localFilePath);
        return null;
    }
}

    const deleteFromCloudinary = async (cloudinaryFilePath) => {
        try {
            if(!cloudinaryFilePath) return null

            // Ensure Cloudinary is configured (lazy init, same as uploadOnCloudinary)
            cloudinary.config({ 
              cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
              api_key: process.env.CLOUDINARY_API_KEY, 
              api_secret: process.env.CLOUDINARY_API_SECRET 
            });
        
            //the code below id what we write when we extract the xact information about our image
            const publicId = cloudinaryFilePath.split("/").pop().split(".")[0];
            
            const response = await cloudinary.uploader.destroy(publicId, {
                    resource_type: "auto" 
                });
        
                return response;
        } catch (error) {
            console.log("Error while deleting file from cloudinary",error)
            return null
        }
    }


export {
    uploadOnCloudinary,
    deleteFromCloudinary
}