import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asynchandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const like = await Like.findOne({ video: videoId, likedBy: req.user._id });

    if (like) {
        await Like.findByIdAndDelete(like._id);
        return res.status(200).json(new ApiResponse(200, { liked: false }, "Unliked video"));
    } else {
        await Like.create({ video: videoId, likedBy: req.user._id });
        return res.status(200).json(new ApiResponse(200, { liked: true }, "Liked video"));
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if (!isValidObjectId(commentId)) throw new ApiError(400, "Invalid comment ID");

    const like = await Like.findOne({ comment: commentId, likedBy: req.user._id });

    if (like) {
        await Like.findByIdAndDelete(like._id);
        return res.status(200).json(new ApiResponse(200, { liked: false }, "Unliked comment"));
    } else {
        await Like.create({ comment: commentId, likedBy: req.user._id });
        return res.status(200).json(new ApiResponse(200, { liked: true }, "Liked comment"));
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideosAggregate = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo"
            }
        },
        { $unwind: "$likedVideo" },
        {
            $project: {
                _id: 0,
                likedVideo: 1
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, likedVideosAggregate, "Fetched liked videos successfully")
    );
})

export {
    toggleCommentLike,
    toggleVideoLike,
    getLikedVideos
}
