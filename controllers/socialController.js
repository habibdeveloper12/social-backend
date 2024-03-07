import { Post, Comment, User } from "../models/index.js";
import CustomErrorHandler from "../services/CustomErrorHandler.js";

const socialController = {
  async getAllUser(req, res, next) {
    try {
      const allUser = User.find({});
      res.status(201).json(allUser);
    } catch (err) {
      res.status(500).json({ error: err });
    }
  },

  async getUserById(req, res, next) {
    const id = req.params.id;
    console.log(id);
    try {
      const user = await User.findOne({ email: id });
      console.log(user);
      res.status(200).json({ user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async postUser(req, res, next) {
    const { email, name } = req.body;
    let user;
    try {
      // Check if email is provided
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check if user already exists
      const findUser = await User.findOne({ email: email });
      if (findUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Create new user
      user = await User.create({ name, email });
      return res.status(201).json(user);
    } catch (err) {
      return next(err); // Pass the error to error handling middleware
    }
  },

  async updateUser(req, res, next) {
    const id = req.params.id;
    const body = req.body;
    console.log(body);
    try {
      const updatedUser = await User.findOneAndUpdate({ email: id }, body, {
        new: true, // To return the updated document
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json(updatedUser);
    } catch (err) {
      return next(CustomErrorHandler.serverError());
    }
  },
  async deleteUser(req, res, next) {
    const { id } = req.params.id;
    try {
      const deleteOneUser = await User.findByIdAndDelete(id);
      return res.json(deleteOneUser);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  async getAllPost(req, res) {
    try {
      const posts = await Post.find()
        .populate("author")
        .populate({
          path: "comments",
          populate: {
            path: "author",
          },
        });
      res.json({ posts });
    } catch (error) {
      // console.log(error);
      res.status(500).json({ error: error });
    }
  },
  async getAllPostById(req, res) {
    const id = req.params.id;
    try {
      const post = await Post.findById(id).populate("author");
      res.json(post);
      console.log(post);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  async postPost(req, res) {
    const { email, description, image } = req.body;

    try {
      const user = await User.findOne({ email: email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const newPost = await Post.create({
        author: user._id,
        description,
        image,
      });
      await User.findByIdAndUpdate(
        { email: email },
        {
          $push: { comments: newPost._id },
        }
      );

      return res.status(201).json({ newPost });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  async updatePost(req, res) {
    const { postData } = req.body;
    const id = req.params.id;
    try {
      const updatedPost = await Post.findByIdAndUpdate(id, postData, {
        new: true,
        upsert: true,
      });

      res.json({ updatedPost });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  },
  async deletePost(req, res) {
    const id = req.params.id;
    try {
      const deleteOnePost = await Post.findByIdAndDelete(id);
      res.json({ deleteOnePost });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  async createComment(req, res) {
    const { email, postId, description } = req.body;
    try {
      // Find the user by email
      const findUser = await User.findOne({ email: email });

      // Check if user exists
      if (!findUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create a new comment object
      const comment = {
        description,
        post: postId,
        author: findUser._id,
      };

      // Create the comment
      const newComment = await Comment.create(comment);
      console.log(newComment);
      // Update the post to include the new comment
      await Post.findByIdAndUpdate(postId, {
        $push: { comments: newComment._id },
      });

      // Return the newly created comment
      return res.status(201).json({ newComment });
    } catch (error) {
      // Handle any errors
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  },
  async getCommentsForPost(req, res) {
    const id = req.params.id;
    try {
      const comments = await Comment.find({ post: id }).populate("author");
      res.json({ comments });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  // Update comment
  async updateComment(req, res) {
    const id = req.params.id;
    const commentData = req.body;
    try {
      const updatedComment = await Comment.findByIdAndUpdate(id, commentData, {
        new: true,
        upsert: true,
      });
      res.json({ updatedComment });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  // Delete comment
  async deleteComment(req, res) {
    const id = req.params.id;
    try {
      const comment = await Comment.findByIdAndDelete(id);
      res.json({ comment });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
  // Like a post
  async addLike(req, res) {
    const postId = req.params.id;
    const { userId } = req.body;
    console.log(userId, postId);
    try {
      const user = await User.findOne({ email: userId });
      const post = await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: user._id } },
        { new: true }
      );
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Unlike a post
  async unlike(req, res) {
    const id = req.params.id;
    const { userId } = req.body;

    try {
      const user = await User.findOne({ email: userId });
      const post = await Post.findByIdAndUpdate(
        id,
        { $pull: { likes: user._id } },
        { new: true }
      );
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
  async topLike(req, res) {
    try {
      const topPosts = await Post.aggregate([
        {
          $addFields: {
            reactionsCount: {
              $cond: {
                if: { $isArray: "$reactions" }, // Check if reactions is an array
                then: { $size: "$reactions" }, // If yes, count the size of the array
                else: 0, // If not, set reactionsCount to 0
              },
            },
          },
        },
        {
          $sort: { reactionsCount: -1 }, // Sort posts by reactionsCount in descending order
        },
        {
          $limit: 3, // Limit the results to the top 3 posts
        },
      ]);

      res.json(topPosts);
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ error: "Server error" });
    }
  },
};

export default socialController;
