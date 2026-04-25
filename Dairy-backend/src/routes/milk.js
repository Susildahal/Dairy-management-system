import { savemilk, allmilk, updatemilk, delatemilk } from "../controlllers/milk.js";
import { createMilkRecords } from "../controlllers/milkCreate.js";
import express from "express";

const milkrouter = express.Router();
import { authenticateUser } from "../middleware/auth.js";

// Manual record creation (replaces cron job)
milkrouter.post("/create-records", authenticateUser, createMilkRecords);

// Save / update / read / delete
milkrouter.post("/savemilk", authenticateUser, savemilk);
milkrouter.put("/updatemilk/:id", authenticateUser, updatemilk);
milkrouter.get("/allmilk", authenticateUser, allmilk);
milkrouter.delete("/:id", authenticateUser, delatemilk);

export default milkrouter;