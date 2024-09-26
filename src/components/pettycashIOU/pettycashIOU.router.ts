import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as pettycashIOUService from './pettycashIOU.service'
import * as IOUDetailService from '../pettycashIOUDetails/pettycashIOUDetails.service'


export const pettyCashIOURouter = express.Router();

//GET LIST
pettyCashIOURouter.get("/", async (request: Request, response: Response) => {
    try {
        const pettyCashIOU = await pettycashIOUService.list()
        if (pettyCashIOU) {
            return response.status(200).json({ data: pettyCashIOU });
        }
        return response.status(404).json({ message: "Petty Cash IOU could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//POST
pettyCashIOURouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
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
        const newpettyCashIOU = await pettycashIOUService.create(data)

        if (newpettyCashIOU) {
            return response.status(201).json({ message: "Petty Cash IOU Successfully", data: newpettyCashIOU });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

pettyCashIOURouter.put("/pettyCashDetail/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params.id;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        console.log(data)
        const userId = request.user.id;
        const updateioudetails = {
            spent: data.spent,
            returnDate: data?.returnDate,
            returnAmount: data.returnAmount,
            isReturn: data.isReturn
        }
        await IOUDetailService.deletebyIOUId(id);
        const updateIOUdetails = await pettycashIOUService.update(updateioudetails, id)

        const IOUDetailsPromises = data.pettyCashIOUDetails.map(async (detail: any) => {
            const IOUdetail = await IOUDetailService.create({
                refnumber: detail.refnumber,
                description: detail.description,
                amount: detail.amount,
                pettycashIOUId: id,
                createdBy: userId
            });

            if (!IOUdetail) {
                throw new Error("Failed to update OEM Numbers");
            }
            return IOUdetail;
        });
        try {
            // Wait for all promises
            const [IOUDetails] = await Promise.all([
                Promise.all(IOUDetailsPromises),
            ]);

            // Combine product and OEM numbers into a single data object
            const combinedData = {
                ...updateIOUdetails,
                pettyCashIOUDetails: IOUDetails
            };

            // Return the response including the combined data
            return response.status(201).json({
                message: "IOU Updated Successfully",
                data: combinedData
            });
        } catch (error: any) {
            return response.status(500).json({ message: error.message });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})


pettyCashIOURouter.put("/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const UpdatepettyCashIOU = await pettycashIOUService.update(data, id)
        if (UpdatepettyCashIOU) {
            return response.status(201).json({ message: "Petty Cash IOU Updated Successfully", data: UpdatepettyCashIOU });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
})

