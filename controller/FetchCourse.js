const express = require("express")
const Router = express.Router();
require("../model/connection")
const { Course } = require("../model/Tables");



Router.get("/Course", async(req, res)=>{
    try {
      const FetchAll = await Course.find();
      res.json({message:FetchAll})
        
    } catch (error) {
       res.json({message:"wait...., Error in fetching"}) 
    }
})


module.exports = Router