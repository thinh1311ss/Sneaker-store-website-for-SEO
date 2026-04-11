const express = require("express");
const app = express();
const cors = require("cors");

const connectDb = require("./Services/ConnectDbService");
const userRoute = require("./Router/UserRoute");
const authRoute = require("./Router/AuthRoute");
const productRoute = require("./Router/ProductRoute");
const voucherRoute = require("./Router/VoucherRoute");
const orderRoute = require("./Router/OrderRoute");
const contactRoute = require("./Router/ContactRoute");
const blogRoute = require("./Router/BlogRoute");

require("dotenv").config();

const corsOptions = {
  origin: [
    "http://localhost:3000", 
    "http://localhost:3001",
    "https://sneaker-store-website-for-seo-seven.vercel.app",
    "https://sneaker-store-website-for-seo-git-main-thinh1311ss-projects.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// middleware apply cors add all request
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// middleware get info from client by req.body
app.use(express.json());

//connect database
connectDb();

//middleware router
app.use("/auth/admin", userRoute);
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api", productRoute);
app.use("/api", blogRoute);
app.use("/auth/admin", voucherRoute);
app.use("/api/auth", orderRoute);
app.use("/api/auth", contactRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
