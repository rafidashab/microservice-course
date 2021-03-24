const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// why does the event bus not require cors?
const events = [];

app.post("/events", (req, res) => {
  const event = req.body;
  events.push(event);
  axios
    .post("http://posts-clusterip-srv:4000/events", event)
    .catch((err) => console.log(err.message)); // Post Service
  axios
    .post("http://comments-srv:4001/events", event)
    .catch((err) => console.log(err.message)); // Comment Service
  axios
    .post("http://query-srv:4002/events", event)
    .catch((err) => console.log(err.message)); // Query Service
  axios
    .post("http://moderation-srv:4003/events", event)
    .catch((err) => console.log(err.message)); // Moderation Service
  res.send({ status: "OK" });
});

app.get("/events", (req, res) => {
  res.send(events);
});

const port = 6000;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
