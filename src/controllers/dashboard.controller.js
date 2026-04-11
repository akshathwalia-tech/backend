import mongoose from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asynchandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const totalSubscribersPromise = Subscription.countDocuments({ channel: userId });
    
    const videoStatsPromise = Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        { 
            $group: { 
                _id: null, 
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" } 
            } 
        }
    ]);

    const totalLikesPromise = Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        { $unwind: "$videoDetails" },
        {
            $match: {
                "videoDetails.owner": new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $count: "totalLikes"
        }
    ]);

    const [totalSubscribers, videoStats, totalLikesResult] = await Promise.all([
        totalSubscribersPromise,
        videoStatsPromise,
        totalLikesPromise
    ]);

    const stats = {
        totalSubscribers,
        totalVideos: videoStats.length > 0 ? videoStats[0].totalVideos : 0,
        totalViews: videoStats.length > 0 ? videoStats[0].totalViews : 0,
        totalLikes: totalLikesResult.length > 0 ? totalLikesResult[0].totalLikes : 0
    };

    return res.status(200).json(new ApiResponse(200, stats, "Channel stats fetched successfully"));
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // Return all videos owned by the authenticated user to fuel their dashboard
    const videos = await Video.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
})

export {
    getChannelStats, 
    getChannelVideos
}
