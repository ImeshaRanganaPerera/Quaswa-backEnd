import express from "express";
import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticate, ExpressRequest } from '../../middleware/auth'

import * as chequeservice from './cheque.service'
import * as journalLineService from '../journalline/journalline.service'
import * as chartofaccService from '../ChartofAccount/chartofaccount.service'

export const chequeRouter = express.Router();

//GET
chequeRouter.get("/", async (request: Request, response: Response) => {
    try {
        const data = await chequeservice.list();
        return response.status(200).json({ data: data });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

chequeRouter.get("/unusedCheque/:id", async (request: Request, response: Response) => {
    const id = request.params.id;
    try {
        const data = await chequeservice.getUnusedChequesByAccountId(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Cheques could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//GET
chequeRouter.get("/:id", async (request: Request, response: Response) => {
    const id = request.params.id;
    try {
        const data = await chequeservice.get(id)
        if (data) {
            return response.status(200).json({ data: data });
        }
        return response.status(404).json({ message: "Cheque could not be found" });
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

chequeRouter.get('/chequeNumber/:chartOfAccountId', async (request: Request, response: Response) => {
    const chartOfAccountId = request.params.chartOfAccountId as string; // Get the account ID from query parameters
    try {
        if (!chartOfAccountId) {
            return response.status(400).json({ message: "Chart of Account ID is required." });
        }
        const chequeNumber = await chequeservice.getNextChequeNumber(chartOfAccountId);
        response.status(200).json({ data: chequeNumber });
    } catch (error: any) {
        response.status(404).json({ message: error.message });
    }
});

//POST
chequeRouter.post("/", authenticate, async (request: ExpressRequest, response: Response) => {
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
        console.log(data)
        const newCheque = await chequeservice.create(data)


        if (newCheque) {
            return response.status(201).json({ message: "Cheque Created Successfully", data: newCheque });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

//UPDATE
chequeRouter.put("/:id", async (request: Request, response: Response) => {
    const id: any = request.params;
    const data: any = request.body;
    try {
        const updateCheque = await chequeservice.update(data, id)
        if (updateCheque) {
            return response.status(201).json({ message: "Cheque Updated Successfully", data: updateCheque });
        }
    } catch (error: any) {
        return response.status(500).json(error.message);
    }
})

chequeRouter.put("/used/:id", authenticate, async (request: ExpressRequest, response: Response) => {
    const id: string = request.params.id; // Correct extraction of the ID
    const data: any = request.body;

    try {
        if (!request.user) {
            return response.status(401).json({ message: "User not authorized" });
        }
        const userId = request.user.id;

        const updateCheque = await chequeservice.updateused({ used: data.used, month: data.month, year: data.year }, id); // Pass 'id' as a string

        // Handle journal entries if present
        if (data.journalEntries && data.journalEntries.length > 0) {
            const journalEntries = data.journalEntries;

            for (let entry of journalEntries) {
                var chartofAccId = entry.accountId;
                if (entry.accountId === "Cheque") {
                    const pendingCheque = await chartofaccService.getbyname('PENDING CHEQUE');
                    chartofAccId = pendingCheque?.id;
                }
                const journalLineData = {
                    chartofAccountId: chartofAccId,
                    debitAmount: entry.debit || 0,
                    creditAmount: entry.credit || 0,
                    ref: entry.ref,
                    createdBy: userId,
                };

                await journalLineService.create(journalLineData);
            }
        }

        if (updateCheque) {
            return response.status(201).json({ message: "Cheque Updated Successfully", data: updateCheque });
        }
    } catch (error: any) {
        return response.status(500).json({ message: error.message });
    }
});
