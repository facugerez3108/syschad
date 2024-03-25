import express from "express";
import cors from "cors";
import http from "http";
import compression from "compression";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import routes from "./routes/api";
import passport from "passport";
import morgan from "./config/morgan";
import { errorConverter, errorHandler } from "./middleware/error";
import ApiError from "./utils/ApiError";
import httpStatus from "http-status";
import config from "./config/config";
import helmet from "helmet";

const app = express();

if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use(helmet());

app.use(
  cors({
    credentials: true,
  })
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use("/api", routes);

app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

app.use(errorConverter);

app.use(errorHandler);

const server = http.createServer(app);
server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
