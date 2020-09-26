const express = require("express");
const {cloudinary} = require('../cloudinary.config')


const User = require("../models/user.model");
const Post = require("../models/post.model");

const authMiddleware = require("../middlewares/authJWT.middleware");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const allPost = await Post.find()
    res.status(200).json({
      posts: allPost.sort((p2, p1) => p1.timestamp - p2.timestamp),
    });
  } catch (error) {
    res.status(500).json({
      msg: "Can not load data !",
    });
  }
});
router.post("/createnewpost", authMiddleware.authenticateToken, async (req, res) => {
  try {
    const { caption, file } = req.body;
    const fileImage = JSON.parse(file)
    const uploaddedResponse = await cloudinary.uploader.upload(fileImage.data, {
      upload_preset: "instagram"
    });

    //console.log(uploaddedResponse.url);
    const newPost = new Post({
      caption,
      imageUrl: uploaddedResponse.url,
      timestamp: new Date(),
      ownByUser: req.user.user._id,
      comments: {},
      likeOfPost: {
        likeNumber: 0,
        peopleLike: [],
      },
    });
    newPost.save()
    const currenAllPost = await Post.find()
    res.status(200).json({ msg: "Added post success !",
    currenAllPost : currenAllPost
  });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});
router.get("/:userid", async (req, res) => {
  try {
    const allPostOfUser = await Post.find({
      ownByUser: req.params.userid,
    });
    if (allPostOfUser.length > 0) {
      res.status(200).json({ allPostOfUser: allPostOfUser });
    } else {
      res.status(500).json({
        msg: `Can not find out post own by userid ${req.params.userid}!`,
      });
    }
  } catch (error) {
    res.status(501).json({ msg: error.message });
  }
});
router.get("/post/:postid", async (req, res)=> {
  try {
    res.status(200).json({
      post : await Post.findById(req.params.postid)
    })
  } catch (error) {
    res.status(501).json({ msg: error.message });
  }
})
router.get('/:postid/getOwnerPost/:ownByUserId', async (req, res) => {
  try {
    //const post = await Post.find({_id: req.params.postid, ownByUser : req.params.ownByUserId})
   
      res.status(200).json({
        user : await User.findById(req.params.ownByUserId)
      })
    
  } catch (error) {
    res.status(501).json({ msg: error.message });
  }
})

router.post("/post/like/:postid",
  authMiddleware.authenticateToken,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.postid);
      const countLike = post.likeOfPost.likeNumber;
      let list = post.likeOfPost.peopleLike;

      if (
        post &&
        post.likeOfPost.peopleLike.includes(req.user.user.username) === false
      ) {
   
        list.push(req.user.user.username);
        await Post.updateOne(
          { _id: req.params.postid },
          {
            $set: {
              "likeOfPost.likeNumber": countLike + 1,
              "likeOfPost.peopleLike": list,
            },
          }
        );
        res.status(200).json({ 
          msg: "liked !",
          totalLike : countLike + 1
       });
      } else {
        res.status(500).json({ msg: "Post is not exist or User liked !" });
      }
    } catch (error) {
      res.status(501).json({ msg: error.message });
    }
  }
);
router.post("/post/unlike/:postid",
  authMiddleware.authenticateToken,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.postid);
      const countLike = post.likeOfPost.likeNumber;
      let list = post.likeOfPost.peopleLike;

      if (
        post &&
        post.likeOfPost.peopleLike.includes(req.user.user.username) === true
      ) {
        let index = list.indexOf(req.user.user.username);
        list = list.slice(0, index).concat(list.slice(index + 1));
        await Post.updateOne(
          { _id: req.params.postid },
          {
            $set: {
              "likeOfPost.likeNumber": countLike - 1,
              "likeOfPost.peopleLike": list,
            },
          }
        );
        res.status(200).json({ 
          msg: "Unliked !",
          totalLike : countLike - 1
        });
      } else {
        res
          .status(500)
          .json({ msg: "Post is not exist or User is not Unliked !" });
      }
    } catch (error) {
      res.status(501).json({ msg: error.message });
    }
  }
);
router.post("/post/comment/:postid",
  authMiddleware.authenticateToken,
  async (req, res) => {
    try {
      const { text } = req.body;
      const post = await Post.findById(req.params.postid);
      //console.log(req.user.user._id);
      let currentComments = post.comments
      currentComments.push({
        text,
        timestamp : new Date(),
        username : req.user.user.username
      })
      if (post) {
        await Post.updateOne(
          { _id: req.params.postid },
          {
            $set: {
              "comments": currentComments.sort((c1, c2) => c2.timestamp - c1.timestamp),
             //Comment by user who has logged in
            },
          }
        );
      }
      res.status(200).json({
        msg: "Added Comment !",
        comments : currentComments
      });
    } catch (error) {
      res.status(501).json({ msg: error.message });
    }
  }
);
module.exports = router
