const express = require("express");
const cors = require("cors");
const axios = require("axios");
const app = express();

app.use(express.json());
app.use(cors());

const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

const handleEvents = (type, data) => {
  if (type === "PostCreated") {
    const { id, title } = data;
    posts[id] = { id, title, comments: [] };
  }

  if (type == "CommentCreated") {
    const { id, content, status, postId } = data;
    posts[postId].comments.push({ id, content, status });
  }

  if (type == "CommentUpdated") {
    const { id, content, status, postId } = data;

    const post = posts[postId];
    const comment = post.comments.find((comment) => {
      return comment.id == id;
    });

    comment.status = status;
    comment.content = content;
  }
};

app.post("/events", (req, res) => {
  const { type, data } = req.body;
  handleEvents(type, data);

  res.send({});
});

const port = 4002;
app.listen(port, async () => {
  console.log(`Listening on ${port}`);
  const res = await axios.get("http://event-bus-srv:6000/events");

  for (let event of res.data) {
    console.log("Processing event", event.type);
    handleEvents(event.type, event.data);
  }
});
