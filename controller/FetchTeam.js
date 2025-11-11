const express = require("express")
const Router = express.Router();
require("../model/connection")
const { Team } = require("../model/Tables");



Router.get("/Fetch", async(req, res)=>{
    try {
      const FetchAll = await Team.find();
      res.json({message:FetchAll})
        
    } catch (error) {
       res.json({message:"wait...., Error in fetching"}) 
    }
})


module.exports = Router