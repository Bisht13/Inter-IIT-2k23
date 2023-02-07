// Importing express module
const express=require("express")
const router=express.Router()
  
// Handling request using router
router.get("/test",(req,res,next) => {
    res.send('Hello World! GET')
})

router.post("/test",(req,res,next) => {
    console.log(req.body);
    res.send('Hello World! POST')
})
  
// Importing the router
module.exports = router
