const { detectDrift } = require("../../agents/driftDetection.agent");

const driftNode = async (state) => {

    const driftEvents = detectDrift(
        state.previousDataset,
        state.currentDataset
    );

    return {
        driftEvents
    };

};

module.exports = {
    driftNode
};