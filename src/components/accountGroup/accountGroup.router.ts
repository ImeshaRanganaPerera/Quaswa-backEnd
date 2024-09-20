import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as accGroup from './accountGroup.service'

export const accGroupRouter = express.Router();

//GET LIST
accGroupRouter.get("/", async (request: Request, response: Response) => {
    try {
        const data = await accGroup.list()
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Account Group could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//GET 
accGroupRouter.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const data = await accGroup.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Account Group could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//POST
accGroupRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
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
        const newSubAccGrp = await accGroup.create(data)

        if (newSubAccGrp) {
            return response.status(201).json({ message: "Account Group Created Successfully", data: newSubAccGrp });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

accGroupRouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateSubAccGrp = await accGroup.update(data, id)

        if (updateSubAccGrp) {
            return response.status(201).json({ message: "Account Group Updated Successfully", data: updateSubAccGrp });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})


