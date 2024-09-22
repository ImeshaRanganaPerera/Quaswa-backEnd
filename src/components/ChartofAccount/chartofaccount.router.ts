import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as chartofaccService from './chartofaccount.service'
import * as accountGrpservice from '../accountGroup/accountGroup.service'

export const chartofAccRouter = express.Router();

//GET LIST
chartofAccRouter.get("/", async (request: Request, response: Response) => {
    try {
        const data = await chartofaccService.list()
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Chart of Account could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//GET 
chartofAccRouter.get("/:id", async (request: Request, response: Response) => {
    const id: any = request.params.id;
    try {
        const data = await chartofaccService.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Chart of Account could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//GET 
chartofAccRouter.get("/getbyGroup/:name", async (request: Request, response: Response) => {
    const name: any = request.params.name;
    try {
        const accGrp = await accountGrpservice.getbyname(name);

        if (!accGrp) {
            return response.status(404).json({ message: "Account Group not found" });
        }
        
        const data = await chartofaccService.getbygroup(accGrp?.id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Chart of Account could not be found" });
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

//POST
chartofAccRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
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
        const newChartOfAcc = await chartofaccService.create(data)

        if (newChartOfAcc) {
            return response.status(201).json({ message: "Chart of Account Created Successfully", data: newChartOfAcc });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

chartofAccRouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const updateChartofAcc = await chartofaccService.update(data, id)

        if (updateChartofAcc) {
            return response.status(201).json({ message: "Chart of Account Updated Successfully", data: updateChartofAcc });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})


