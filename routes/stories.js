const express = require('express')
const Story = require('../models/Story')
const router = express.Router()
const { ensureAuth} = require('../middleware/auth')
//@desc show add page
//@route GET /stories/add
router.get('/add', ensureAuth, async(req, res) => {
    res.render('stories/add')
    const data = await Story.find().lean()
    console.log(data)
})
//@desc process Add form
//@route POST /stories
router.post('/', ensureAuth, async (req, res)=>{
    try {
       req.body.user = req.user.id 
       await Story.create(req.body)
       res.redirect('/dashboard')
    } catch (error) {
        console.error(error)
        res.render('error/500')
    }
})
module.exports = router