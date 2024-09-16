import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as accountSubGroup from './accountSubGroup.service'

export const accSubGrpRoute = express.Router();

//GET LIST
accSubGrpRoute.get("/", async (request: Request, response: Response) => {
    try {
        const data = await accountSubGroup.list()
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Sub Account Group could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//GET 
accSubGrpRoute.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const data = await accountSubGroup.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Sub Account Group could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//POST
accSubGrpRoute.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
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
        const newSubAccGrp = await accountSubGroup.create(data)

        if (newSubAccGrp) {
            return response.status(201).json({ message: "Sub Account Group Created Successfully", data: newSubAccGrp });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

accSubGrpRoute.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateSubAccGrp = await accountSubGroup.update(data, id)

        if (updateSubAccGrp) {
            return response.status(201).json({ message: "Sub Account Group Updated Successfully", data: updateSubAccGrp });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})


