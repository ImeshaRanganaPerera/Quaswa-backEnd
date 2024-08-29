import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as typeService from './type.service'

export const typeRouter = express.Router();

//GET LIST
typeRouter.get("/", async (request: Request, response: Response) => {
    try {
        const data = await typeService.list()
        return response.status(200).json({ data: data });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//GET 
typeRouter.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const data = await typeService.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Type could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//POST
typeRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
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
        const newType = await typeService.create(data)

        if (newType) {
            return response.status(201).json({ message: "Type Created Successfully" });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

typeRouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateType = await typeService.update(data, id)

        if (updateType) {
            return response.status(201).json({ message: "Type Updated Successfully" });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})


