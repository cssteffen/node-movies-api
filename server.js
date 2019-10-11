require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const MOVIES = require("./movies-data-small.json");

/*
Users can search for movies by
genre -(query string, case insensitive)
country -(query string, case insensitive)
avg_vote -(greater than or equal to the supplied number)

endpoint = GET '/movie'
header {Authorization=Bearer ${API_Token}}
include general security, best practice headers
and support of CORS

 "filmtv_ID": 2,
    "film_title": "Bugs Bunny's Third Movie: 1001 Rabbit Tales",
    "year": 1982,
    "genre": "Animation",
    "duration": 76,
    "country": "United States",
    "director": "David Detiege, Art Davis, Bill Perez",
    "actors": "N/A",
    "avg_vote": 7.7,
    "votes": 28
*/

const app = express();

//app.use(morgan("dev"));
const morganSetting = process.env.NODE_ENV === "production" ? "tiny" : "common";
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
  //const bearerToken = req.get("Authorization").split(" ")[1];
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    return res.status(401).json({ error: "Unauthorized request" });
  }
  //move to the next middleware
  next();
});

// ========= GET MOVIES =========== //

app.get("/movie", function handleGetMovie(req, res) {
  let response = MOVIES;

  //filter our movie by country if country query param is present
  if (req.query.country) {
    response = response.filter(movie =>
      //case insensitive searching
      movie.country.toLowerCase().includes(req.query.country.toLowerCase())
    );
  }

  //filter our movie by genre if genre query param is present
  if (req.query.genre) {
    response = response.filter(movie =>
      movie.genre.toLowerCase().includes(req.query.genre.toLowerCase())
    );
  }

  //filter our movie by rating if rating query param is present
  if (req.query.avg_vote) {
    let userRating = Number(req.query.avg_vote);
    response = response.filter(movie => Number(movie.avg_vote) >= userRating);
  }
  res.json(response);
});

// 4 parameters in middleware, express knows to treat this as error handler
app.use((error, req, res, next) => {
  let response;
  if (process.env.NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { error };
  }
  res.status(500).json(response);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  //console.log(`Server listening at http://localhost: ${PORT}`);
});
