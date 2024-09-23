import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as discountLevelservice from './discountLevel.service'

export const discountLevelRouter = express.Router();

//GET LIST
discountLevelRouter.get("/", async (request: Request, response: Response) => {
    try {
        const data = await discountLevelservice.list()
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Discount Level not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//GET 
discountLevelRouter.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const data = await discountLevelservice.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Discount Level not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//POST
discountLevelRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
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
        const newbrand = await discountLevelservice.create(data)

        if (newbrand) {
            return response.status(201).json({ message: "Discount Level Created Successfully", data: newbrand });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

discountLevelRouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateBrand = await discountLevelservice.update(data, id)

        if (updateBrand) {
            return response.status(201).json({ message: "Discount Level Updated Successfully", data: updateBrand });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})


