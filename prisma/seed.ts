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
            { voucherName: "GRN-RETURN", inventoryMode: InventoryMode.MINUS, isAccount: true },

            { voucherName: "STOCK-TRANSFER", inventoryMode: InventoryMode.DOUBLE, isAccount: false },
            { voucherName: "PURCHASE-ORDER", inventoryMode: InventoryMode.NONE, isAccount: false },
            { voucherName: "PAYMENT", inventoryMode: InventoryMode.NONE, isAccount: true },
            { voucherName: "RECEIPT", inventoryMode: InventoryMode.NONE, isAccount: true },
            { voucherName: "CREDIT-NOTE", inventoryMode: InventoryMode.DOUBLE, isAccount: true },
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

}

seed().catch((error) => {
    console.error("Error seeding data:", error);
}).finally(async () => {
    await db.$disconnect();
});