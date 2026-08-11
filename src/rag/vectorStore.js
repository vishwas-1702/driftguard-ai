const fs = require("fs");
const path = require("path");

const {
    DefaultEmbeddingFunction
} = require("@chroma-core/default-embed");

const VECTOR_STORE_PATH = path.join(
    __dirname,
    "../data/vector-store.json"
);


class LocalVectorStore {

    constructor() {
        this.embedder = new DefaultEmbeddingFunction();
        this.documents = [];
    }


    async addDocuments(chunks) {

        const texts = chunks.map(
            chunk => chunk.content
        );

        console.log(
            `Generating embeddings for ${texts.length} documents...`
        );

        const embeddings =
            await this.embedder.generate(texts);

        this.documents = chunks.map(
            (chunk, index) => ({
                id: chunk.id,
                content: chunk.content,
                metadata: chunk.metadata,
                embedding: embeddings[index]
            })
        );

        this.save();

        console.log(
            `Stored ${this.documents.length} vectors.`
        );
    }


    async search(query, topK = 3) {

        if (this.documents.length === 0) {
            throw new Error(
                "Vector store is empty. Ingest documents first."
            );
        }

        const [queryEmbedding] =
            await this.embedder.generate([query]);


        const results = this.documents.map(
            document => {

                const score = cosineSimilarity(
                    queryEmbedding,
                    document.embedding
                );

                return {
                    ...document,
                    score
                };
            }
        );


        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }


    load() {

        if (!fs.existsSync(VECTOR_STORE_PATH)) {
            this.documents = [];
            return;
        }

        const data =
            fs.readFileSync(
                VECTOR_STORE_PATH,
                "utf8"
            );

        this.documents = JSON.parse(data);
    }


    save() {

        const directory =
            path.dirname(VECTOR_STORE_PATH);

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, {
                recursive: true
            });
        }

        fs.writeFileSync(
            VECTOR_STORE_PATH,
            JSON.stringify(
                this.documents,
                null,
                2
            )
        );
    }


    clear() {

        this.documents = [];

        if (fs.existsSync(VECTOR_STORE_PATH)) {
            fs.unlinkSync(VECTOR_STORE_PATH);
        }
    }
}


const cosineSimilarity = (vectorA, vectorB) => {

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {

        dotProduct +=
            vectorA[i] * vectorB[i];

        magnitudeA +=
            vectorA[i] * vectorA[i];

        magnitudeB +=
            vectorB[i] * vectorB[i];
    }

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return (
        dotProduct /
        (
            Math.sqrt(magnitudeA) *
            Math.sqrt(magnitudeB)
        )
    );
};


module.exports = {
    LocalVectorStore,
    cosineSimilarity
};