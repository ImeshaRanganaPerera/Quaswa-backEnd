import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as chartofAccount from './chartofaccount.service'

export const chartofAccRoute = express.Router();

//GET LIST
chartofAccRoute.get("/", async (request: Request, response: Response) => {
    try {
        const data = await chartofAccount.list()
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Chart of Account could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//GET 
chartofAccRoute.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const data = await chartofAccount.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Chart of Account could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//POST
chartofAccRoute.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
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
        const newChartOfAcc = await chartofAccount.create(data)

        if (newChartOfAcc) {
            return response.status(201).json({ message: "Chart of Account Created Successfully", data: newChartOfAcc });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

chartofAccRoute.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateChartofAcc = await chartofAccount.update(data, id)

        if (updateChartofAcc) {
            return response.status(201).json({ message: "Chart of Account Updated Successfully", data: updateChartofAcc });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})


