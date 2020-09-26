const express = require('express')
const User = require('../models/user.model')
const Post = require('../models/post.model')
const router  = express.Router()

router.get('/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(user){
            res.status(200).json({
                user : user
            })
        }
        else {
            res.status(500).json({msg : "User not exist !"})
        }
    } catch (error) {
        res.status(501).json({msg : error.message})
    }
})

module.exports = router