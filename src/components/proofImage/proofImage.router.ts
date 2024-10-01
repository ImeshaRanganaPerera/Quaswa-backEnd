import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as proofImageService from './proofImage.service'

export const proofImageRouter = express.Router();

//GET LIST
proofImageRouter.get("/", async (request: Request, response: Response) => {
    try {
        const data = await proofImageService.list()
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Image could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//GET 
proofImageRouter.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const data = await proofImageService.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Image could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//POST
proofImageRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
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
        const newImage = await proofImageService.create(data)

        if (newImage) {
            return response.status(201).json({ message: "Image Created Successfully", data: newImage });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

proofImageRouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateImage = await proofImageService.update(data, id)

        if (updateImage) {
            return response.status(201).json({ message: "Image Updated Successfully", data: updateImage });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})


