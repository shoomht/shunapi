import faker_1 from '@faker-js/faker';
async function generateFakeData(type, count) {
    let data;
    switch (type) {
        case "person":
            data = Array.from({ length: Number(count) }, () => ({
                name: faker_1.faker.person.fullName(),
                email: faker_1.faker.internet.email(),
                avatar: faker_1.faker.image.avatar(),
                phone: faker_1.faker.phone.number(),
                birthDate: faker_1.faker.date.past(),
                gender: faker_1.faker.person.gender(),
            }));
            break;
        case "company":
            data = Array.from({ length: Number(count) }, () => ({
                name: faker_1.faker.company.name(),
                catchPhrase: faker_1.faker.company.catchPhrase(),
                address: faker_1.faker.location.streetAddress(),
                website: faker_1.faker.internet.url(),
            }));
            break;
        case "product":
            data = Array.from({ length: Number(count) }, () => ({
                name: faker_1.faker.commerce.productName(),
                price: faker_1.faker.commerce.price(),
                category: faker_1.faker.commerce.department(),
                description: faker_1.faker.commerce.productDescription(),
            }));
            break;
        case "address":
            data = Array.from({ length: Number(count) }, () => ({
                street: faker_1.faker.location.streetAddress(),
                city: faker_1.faker.location.city(),
                country: faker_1.faker.location.country(),
                zipCode: faker_1.faker.location.zipCode(),
            }));
            break;
        case "internet":
            data = Array.from({ length: Number(count) }, () => ({
                email: faker_1.faker.internet.email(),
                username: faker_1.faker.internet.userName(),
                password: faker_1.faker.internet.password(),
                url: faker_1.faker.internet.url(),
            }));
            break;
        case "finance":
            data = Array.from({ length: Number(count) }, () => ({
                accountNumber: faker_1.faker.finance.accountNumber(),
                amount: faker_1.faker.finance.amount(),
                currency: faker_1.faker.finance.currencyName(),
            }));
            break;
        case "vehicle":
            data = Array.from({ length: Number(count) }, () => ({
                manufacturer: faker_1.faker.vehicle.manufacturer(),
                model: faker_1.faker.vehicle.model(),
                type: faker_1.faker.vehicle.type(),
            }));
            break;
        case "lorem":
            data = Array.from({ length: Number(count) }, () => ({
                word: faker_1.faker.lorem.word(),
                sentence: faker_1.faker.lorem.sentence(),
                paragraph: faker_1.faker.lorem.paragraph(),
            }));
            break;
        case "date":
            data = Array.from({ length: Number(count) }, () => ({
                past: faker_1.faker.date.past(),
                future: faker_1.faker.date.future(),
                recent: faker_1.faker.date.recent(),
            }));
            break;
        default:
            throw new Error("Invalid type for fake data generation.");
    }
    return data;
}
export default [
    {
        metode: "GET",
        endpoint: "/api/tools/fake-data",
        name: "fake data",
        category: "Tools",
        description: "This API endpoint allows you to generate various types of fake data for development and testing purposes.",
        tags: ["Tools", "Data", "Generator"],
        example: "?type=person&count=5",
        parameters: [
            {
                name: "type",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    enum: [
                        "person",
                        "company",
                        "product",
                        "address",
                        "internet",
                        "finance",
                        "vehicle",
                        "lorem",
                        "date",
                    ],
                },
                description: "Type of data",
                example: "person",
            },
            {
                name: "count",
                in: "query",
                required: false,
                schema: {
                    type: "integer",
                    default: 1,
                    minimum: 1,
                    maximum: 100,
                },
                description: "Number of entries",
                example: "5",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const availableTypes = [
                "person",
                "company",
                "product",
                "address",
                "internet",
                "finance",
                "vehicle",
                "lorem",
                "date",
            ];
            const { type, count = 1 } = req.query || {};
            if (!type) {
                return {
                    status: false,
                    error: "Type is required",
                    availableTypes: availableTypes,
                    code: 400,
                };
            }
            if (typeof type !== "string" || !availableTypes.includes(type.trim())) {
                return {
                    status: false,
                    error: "Invalid type provided",
                    availableTypes: availableTypes,
                    code: 400,
                };
            }
            const parsedCount = Number(count);
            if (isNaN(parsedCount) || parsedCount < 1 || parsedCount > 100) {
                return {
                    status: false,
                    error: "Count must be a number between 1 and 100",
                    code: 400,
                };
            }
            try {
                const result = await generateFakeData(type.trim(), parsedCount);
                return {
                    status: true,
                    count: result.length,
                    data: result,
                    timestamp: new Date().toISOString(),
                };
            }
            catch (error) {
                return {
                    status: false,
                    error: error.message || "Internal Server Error",
                    code: 500,
                };
            }
        },
    }
];
