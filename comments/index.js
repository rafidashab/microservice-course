const express = require("express");
const cors = require("cors");
const { randomBytes } = require("crypto");
const axios = require("axios");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

let commentsByPostId = {};

app.post("/events", async (req, res) => {
  const { type, data } = req.body;

  if (type === "CommentModerated") {
    console.log("updating");
    const { postId, id, content, status } = data;
    const comments = commentsByPostId[data.postId];
    const comment = comments.find((comment) => {
      return comment.id === id;
    });
    comment.status = status;
    console.log(comment);
    await axios.post("http://event-bus-srv:6000/events", {
      type: "CommentUpdated",
      data: {
        id,
        postId,
        content,
        status,
      },
    });
  }
  res.send({});
});

app.get("/post/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/post/:id/comments", (req, res) => {
  const postId = req.params.id;
  const { content } = req.body;
  const commentId = randomBytes(4).toString("hex");
  const status = "pending";
  const comments = commentsByPostId[postId] || [];
  comments.push({ id: commentId, content, status });

  commentsByPostId[postId] = comments;

  axios.post("http://event-bus-srv:6000/events", {
    type: "CommentCreated",
    data: {
      id: commentId,
      content,
      status,
      postId: postId,
    },
  });

  res.status(201).send(commentsByPostId);
});

const port = 4001;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
