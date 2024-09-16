import { Role, InventoryMode } from "@prisma/client";
import { db } from "../src/utils/db.server"
import { format, toZonedTime } from 'date-fns-tz';
import { hash } from "bcrypt";


async function seed() {
    const currentDateTime = new Date();
    const timezone = 'Asia/Colombo';

    const utcDateTime = format(toZonedTime(currentDateTime, timezone), 'yyyy-MM-dd HH:mm:ss.SSSXXX', { timeZone: 'UTC' });
    const hashedPassword = await hash("1234", 10);
    const user = await db.user.create({
        data: {
            name: "Admin",
            phoneNumber: "0000000000",  // Example phone number
            username: "admin",
            password: hashedPassword,
            role: Role.ADMIN,  // Using the Role enum
        }
    });

    await db.partyGroup.createMany({
        data: [
            { partyGroupName: "CUSTOMER" },
            { partyGroupName: "SUPPLIER" }
        ]
    });

    await db.voucherGroup.createMany({
        data: [
            { voucherName: "SALES", inventoryMode: InventoryMode.MINUS, isAccount: true },
            { voucherName: "SALES-RETURN", inventoryMode: InventoryMode.PLUS, isAccount: true },
            { voucherName: "GRN", inventoryMode: InventoryMode.PLUS, isAccount: true },
            { voucherName: "PURCHASE-RETURN", inventoryMode: InventoryMode.MINUS, isAccount: true },

            { voucherName: "STOCK-TRANSFER", inventoryMode: InventoryMode.DOUBLE, isAccount: false },
            { voucherName: "PURCHASE-ORDER", inventoryMode: InventoryMode.NONE, isAccount: false },
            { voucherName: "PAYMENT", inventoryMode: InventoryMode.NONE, isAccount: true },
            { voucherName: "RECEIPT", inventoryMode: InventoryMode.NONE, isAccount: true },
        ]
    });
    const userid = user.id;

    await db.brand.createMany({
        data: [
            { brandName: "BMW", createdBy: userid },
            { brandName: "TATA", createdBy: userid },
            { brandName: "TOYOTA", createdBy: userid },
        ]
    });

    await db.type.createMany({
        data: [
            { typeName: "OIL FILTER", createdBy: userid },
            { typeName: "RIM", createdBy: userid },
            { typeName: "BUFFER", createdBy: userid },
        ]
    });

    await db.payment.createMany({
        data: [
            { type: "Cash" },
            { type: "Online Tranfer" },
            { type: "Cheque" },
            { type: "Credit" },
        ]
    });

    const assets = await db.accountGroup.create({
        data:
            { accTypes: "ASSETS" },
    });

    const liabilities = await db.accountGroup.create({
        data:
            { accTypes: "LIABILITIES" },
    });

    const equity = await db.accountGroup.create({
        data:
            { accTypes: "EQUITY" },
    });

    const income = await db.accountGroup.create({
        data:
            { accTypes: "INCOME" },
    });

    const expencess = await db.accountGroup.create({
        data:
            { accTypes: "EXPENCESS" },
    });

    const fixassets = await db.accountSubGroup.create({
        data: { accountSubName: "FIX ASSETS", accountGroupId: assets.id, createdBy: userid },
    })

    const currentassets = await db.accountSubGroup.create({
        data: { accountSubName: "CURRENT ASSETS", accountGroupId: assets.id, createdBy: userid }
    })

    const fixliabilities = await db.accountSubGroup.create({
        data: { accountSubName: "FIX LIABILITIES", accountGroupId: liabilities.id, createdBy: userid },
    })
    const currentLiabilites = await db.accountSubGroup.create({
        data: { accountSubName: "CURRENT LIABILITIES", accountGroupId: liabilities.id, createdBy: userid },
    })

    await db.chartofAccount.createMany({
        data: [
            { accountName: "INVENTORY ACCOUNT", accountSubGroupId: currentassets.id, Opening_Balance: 0, createdBy: userid },
            { accountName: "PURCHASING ACCOUNT", accountSubGroupId: currentassets.id, Opening_Balance: 0, createdBy: userid }
        ]
    })

}

seed().catch((error) => {
    console.error("Error seeding data:", error);
}).finally(async () => {
    await db.$disconnect();
});