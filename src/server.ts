import app from "./app";
const port = parseInt(process.env.PORT || "3000", 10);

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 App listening on port: ${port}`);
});
