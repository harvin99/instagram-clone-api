const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    caption : {
        type: String,
        required : true
    },
    imageUrl: {
        type : String,
        required : true
    },
    timestamp : {
        type :Date,
        required : true
    },
    ownByUser : String,
    comments : Array,
    likeOfPost : {
        likeNumber : Number,
        peopleLike: Array
    }
})
const Post = mongoose.model('Post', postSchema, 'posts')
module.exports = Post