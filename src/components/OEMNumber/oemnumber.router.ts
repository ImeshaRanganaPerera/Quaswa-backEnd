import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as oeNumberService from './oemnumber.service'

export const oemNumberRoute = express.Router();

//GET LIST
oemNumberRoute.get("/", async (request: Request, response: Response) => {
    try {
        const data = await oeNumberService.list()
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "OE Number could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//GET 
// oemNumberRoute.get("/:id", async (request: Request, response: Response) => {
//     const id: any = request.params.id;
//     try {
//         const data = await oeNumberService.get(id)
//         if (data) {
//             return response.status(200).json({ data: data });
//         }
//         return response.status(404).json({ message: "OE Number could not be found" });
//     } catch (error: any) {
//         return response.status(500).json({ message: error.message });
//     }
// })

//POST
oemNumberRoute.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
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
        const newChartOfAcc = await oeNumberService.create(data)

        if (newChartOfAcc) {
            return response.status(201).json({ message: "OE Number Created Successfully", data: newChartOfAcc });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

oemNumberRoute.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateChartofAcc = await oeNumberService.update(data, id)

        if (updateChartofAcc) {
            return response.status(201).json({ message: "OE Number Updated Successfully", data: updateChartofAcc });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})
