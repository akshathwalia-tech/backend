import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asynchandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if (!name || !description) throw new ApiError(400, "Name and Description required");

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
        videos: []
    })

    return res.status(201).json(new ApiResponse(201, playlist, "Playlist created"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid parameters");

    const playlists = await Playlist.find({ owner: userId });
    
    return res.status(200).json(new ApiResponse(200, playlists, "Playlists fetched"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid parameters");

    const playlist = await Playlist.findById(playlistId).populate("videos");
    if (!playlist) throw new ApiError(404, "Not found");

    return res.status(200).json(new ApiResponse(200, playlist, "Fetched Playlist"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) throw new ApiError(400, "Invalid parameters");

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Not found");
    
    if (playlist.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Permission denied")

    if (!playlist.videos.includes(videoId)) {
        playlist.videos.push(videoId);
        await playlist.save();
    }

    return res.status(200).json(new ApiResponse(200, playlist, "Video added"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) throw new ApiError(400, "Invalid parameters");

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Not found");
    if (playlist.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Permission denied")

    playlist.videos = playlist.videos.filter(vid => vid.toString() !== videoId);
    await playlist.save();

    return res.status(200).json(new ApiResponse(200, playlist, "Video removed"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid parameters");

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Not found");
    if (playlist.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Permission denied")

    await Playlist.findByIdAndDelete(playlistId);
    return res.status(200).json(new ApiResponse(200, {}, "Playlist permanently deleted"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    if (!isValidObjectId(playlistId)) throw new ApiError(400, "Invalid parameters");

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Not found");
    if (playlist.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "Permission denied")

    if (name) playlist.name = name;
    if (description) playlist.description = description;

    await playlist.save();

    return res.status(200).json(new ApiResponse(200, playlist, "Playlist updated"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
