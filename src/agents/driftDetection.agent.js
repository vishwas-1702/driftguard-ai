const crypto = require("crypto");

const detectDrift = (previousDataset, currentDataset) => {

    const events = [];

    const previousCustomers = new Map();

    previousDataset.forEach(customer => {
        previousCustomers.set(customer.customerId, customer);
    });

    currentDataset.forEach(currentCustomer => {

        const previousCustomer = previousCustomers.get(currentCustomer.customerId);

        if (!previousCustomer) {
            return;
        }

        Object.keys(currentCustomer).forEach(field => {

            if (field === "customerId") {
                return;
            }

            const previousValue = previousCustomer[field];
            const currentValue = currentCustomer[field];

            if (previousValue !== currentValue) {

                events.push({

                    eventId: crypto.randomUUID(),

                    entity: "Customer",

                    entityId: currentCustomer.customerId,

                    eventType: "FIELD_CHANGED",

                    field,

                    previousValue,

                    currentValue,

                    detectedAt: new Date().toISOString()

                });

            }

        });

    });

    return events;

};

module.exports = {
    detectDrift
};