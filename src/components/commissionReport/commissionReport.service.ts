import { db } from "../../utils/db.server";

export const list = async () => {
    return db.commissionReport.findMany({
        include: {
            voucher: true,
        },
        orderBy: {
            date: "desc"
        }
    });
}

export const comReportSalesmanwise = async (startDate: Date, endDate: Date, userId?: any) => {
    // Fetch the data from the database
    const commissionReports = await db.commissionReport.findMany({
        where: {
            voucher: {
                ...(userId ? { authUser: userId } : {})
            },
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        include: {
            voucher: {
                select: {
                    voucherNumber: true,
                    dueDays: true,
                    amount: true,
                    date: true,
                    authUser: true,
                    user: { select: { name: true } },
                }
            },
        },
        orderBy: {
            date: "desc"
        }
    });

    // Group data by `authUser` and format it
    const groupedData = commissionReports.reduce((result: any[], report) => {
        const userId = report.voucher.authUser;
        const username = report.voucher.user?.name || 'Unknown User'; // Adjust this if username is in another field
        const rate = typeof report.comRate === 'string'
            ? parseFloat(report.comRate.replace('%', ''))
            : report.comRate;

        // Calculate the commission for the current report
        const commissionValue = Number(report.amount) * Number(rate / 100);

        // Find if this user already exists in the result array
        let userEntry = result.find(entry => entry.username === username);

        // If not, create a new entry for the user
        if (!userEntry) {
            userEntry = { username, invoices: [], totalCommission: 0 };
            result.push(userEntry);
        }

        // Add the commission value to the user's total
        userEntry.totalCommission += commissionValue;

        // Add the current report (invoice) to the user's invoices
        userEntry.invoices.push({
            voucherNumber: report.voucher.voucherNumber,
            dueDays: report.voucher.dueDays,
            invoiceAmount: report.voucher.amount,
            amount: report.amount,
            percentage: report.comRate,
            invoiceDate: report.voucher.date,
            date: report.date,
            commission: commissionValue // Include the calculated commission per invoice
            // Add other relevant voucher details as needed
        });

        return result;
    }, []);

    return groupedData;
};


export const get = async (id: any) => {
    return db.commissionReport.findUnique({
        where: {
            id,
        }
    });
}

export const create = async (data: any) => {
    return db.commissionReport.create({
        data: data
    });
}

export const update = async (data: any, id: any) => {
    return db.commissionReport.update({
        where: id,
        data: data
    });
}