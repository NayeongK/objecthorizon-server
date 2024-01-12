import { Request, Response } from "express";
import express from "express";

const router = express.Router();

router.get("/", function (req: Request, res: Response) {
  res.status(200).send("success");
});

export default router;
