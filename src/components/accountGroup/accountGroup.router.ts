import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as accountGroup from './accountGroup.service'

export const accGroupRoute = express.Router();

//GET LIST
accGroupRoute.get("/", async (request: Request, response: Response) => {
    try {
        const data = await accountGroup.list()
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Account Group could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//GET 
accGroupRoute.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const data = await accountGroup.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Account Group could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//POST
accGroupRoute.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
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
        const accGrp = await accountGroup.create(data)

        if (accGrp) {
            return response.status(201).json({ message: "Account Group Created Successfully", data: accGrp });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

accGroupRoute.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateAccGrp = await accountGroup.update(data, id)

        if (updateAccGrp) {
            return response.status(201).json({ message: "Account Group Updated Successfully", data: updateAccGrp });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})


