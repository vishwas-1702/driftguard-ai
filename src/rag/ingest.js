const fs = require("fs");
const path = require("path");

const { chunkMarkdown } = require("./chunker");
const { LocalVectorStore } = require("./vectorStore");

const DOCUMENT_PATH = path.join(
    __dirname,
    "../knowledge/scd-business-rules.md"
);

const ingest = async () => {

    const markdown = fs.readFileSync(
        DOCUMENT_PATH,
        "utf8"
    );

    const chunks = chunkMarkdown(markdown);

    console.log(`Preparing ${chunks.length} chunks...`);

    const vectorStore = new LocalVectorStore();

    await vectorStore.addDocuments(chunks);

    console.log("========== INGESTION COMPLETE ==========");
};

ingest().catch((error) => {
    console.error("Ingestion failed:", error);
});