const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

const app = express();
app.use(cors());

const BASE_URL = "https://calendarific.com/api/v2/holidays";
// Route: fetch holidays by country & year
// const { getWeek, parseISO } = require("date-fns");

app.get("/api/holidays/:country/:year", async (req, res) => {
  const { country, year } = req.params;
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        api_key: process.env.CALENDARIFIC_API_KEY,
        country,
        year,
      },
    });

    const holidays = response.data.response.holidays.map((h) => ({
      name: h.name,
      date: h.date.iso,
      type: h.type,
    }));

    res.json({ country, year, holidays });
  } catch (error) {
    console.error("Error fetching holidays:", error.message);
    res.status(500).json({ error: "Failed to fetch holidays" });
  }
});

app.get('/api/countries', async(req,res)=>{
    //   try {
    //   const response = await axios.get(
    //     `https://calendarific.com/api/v2/countries?api_key=${API_KEY}`
    //   );
    //   // Response example: response.data.response.countries
    //   res.json(response.data.response.countries);
    // } catch (err) {
    //   console.error(err);
    //   res.status(500).json({ error: "Failed to fetch countries" });
    // }

     try {
      const data = fs.readFileSync("countries.json", "utf8");
      const countries = JSON.parse(data);
      return res.json(countries);
    } catch (err) {
      console.error("Error reading local JSON:", err.message);
      return res.status(500).json({ error: "Failed to read countries" });
    }

})
  
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


