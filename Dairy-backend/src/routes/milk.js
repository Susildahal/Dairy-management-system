import { allmilk, updatemilk, delatemilk,requestpermission } from "../controlllers/milk.js";
import { createMilkRecords } from "../controlllers/milkCreate.js";
import express from "express";

const milkrouter = express.Router();
import { authenticateUser } from "../middleware/auth.js";

// Manual record creation (replaces cron job)
milkrouter.post("/create-records", authenticateUser, createMilkRecords);

// Save / update / read / delete
milkrouter.put("/updatemilk/:id", authenticateUser, updatemilk);
milkrouter.get("/allmilk", authenticateUser, allmilk);
milkrouter.delete("/:id", authenticateUser, delatemilk);
milkrouter.post("/send-permission-email/:id", authenticateUser, requestpermission);

export default milkrouter;