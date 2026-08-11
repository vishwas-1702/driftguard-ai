require("dotenv").config();

const express = require("express");

const workflow =
    require("./graph/workflow");

const {
    getPreviousDataset,
    getCurrentDataset
} = require("./services/dataset.service");


const app = express();

app.use(express.json());


app.post(
    "/api/drift/analyze",
    async (req, res) => {

        try {

            // Load existing datasets
            const previousDataset =
                await getPreviousDataset();

            const currentDataset =
                await getCurrentDataset();


            // Run complete workflow
            const result =
                await workflow.invoke({

                    previousDataset,

                    currentDataset

                });


            // Return only final report
            return res.status(200).json(
                result.finalReport
            );

        } catch (error) {

            console.error(
                "Drift analysis failed:",
                error
            );

            return res.status(500).json({

                status: "FAILED",

                message: error.message

            });
        }
    }
);


const PORT =
    process.env.PORT || 3000;


app.listen(
    PORT,
    () => {

        console.log(
            `DriftGuard API running on port ${PORT}`
        );

    }
);