const express = require("express");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");
const app = express();
app.use(express.json());
app.use(cors());
let posts = {};

app.post("/events", (req, res) => {
  console.log("Recieved Event", req.body.type);
  res.send({});
});

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/posts/create", async (req, res) => {
  const id = randomBytes(4).toString("hex");
  const { title } = req.body;

  posts[id] = {
    id,
    title,
  };

  await axios.post("http://event-bus-srv:6000/events", {
    type: "PostCreated",
    data: {
      id,
      title,
    },
  });
  res.send(posts[id]);
});

const port = 4000;
app.listen(port, () => {
  console.log("v30");
  console.log(`Listening on ${port}`);
});
