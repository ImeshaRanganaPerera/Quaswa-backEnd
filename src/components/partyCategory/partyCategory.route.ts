import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as partyCategoryService from './partyCategory.service'


export const partyCategoryRouter = express.Router();

//GET LIST
partyCategoryRouter.get("/", async (request: Request, response: Response) => {
    try {
        const partyCategory = await partyCategoryService.getlist()
        if (partyCategory) {
            return response.status(200).json({ data: partyCategory });
        }
        return response.status(404).json({ message: "Party could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//POST
partyCategoryRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
    var data: any = request.body;
    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const userId = request.user.id;
        data = {
            ...data,
            createdBy: userId
        }
        const newbrand = await partyCategoryService.create(data)

        if (newbrand) {
            return response.status(201).json({ message: "Brand Created Successfully", data: newbrand });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})
