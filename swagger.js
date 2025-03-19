const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "My API",
    description: "Automatically generated API documentation",
  },
  host: "localhost:4000", // Match server port
  schemes: ["http"],
  components: {
    securitySchemes: {
      bearerAuth: {  
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token in the format: Bearer <your_token>",
      },
    },
  },
  security: [{ bearerAuth: [] }], // Apply security globally
};

const outputFile = "./swagger-output.json";
const routes = ["./routes/allproducts.js", "./routes/auth.js", "./routes/cart.js"];

swaggerAutogen(outputFile, routes, doc).then(() => {
  console.log("Swagger documentation generated ✅");
});
