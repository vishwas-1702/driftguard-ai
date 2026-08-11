const MAX_CHARS = 1800;
const OVERLAP_CHARS = 250;

const splitLargeSection = (text) => {

    const chunks = [];

    let start = 0;

    while (start < text.length) {

        let end = start + MAX_CHARS;

        if (end < text.length) {

            const paragraphBreak =
                text.lastIndexOf("\n\n", end);

            if (paragraphBreak > start) {
                end = paragraphBreak;
            }
        }

        const chunk =
            text.slice(start, end).trim();

        if (chunk) {
            chunks.push(chunk);
        }

        if (end >= text.length) {
            break;
        }

        start = Math.max(
            end - OVERLAP_CHARS,
            start + 1
        );
    }

    return chunks;
};


const chunkMarkdown = (markdown) => {

    const lines = markdown.split("\n");

    const sections = [];

    let currentSection = [];

    for (const line of lines) {

        // Only ## starts a new knowledge section.
        // ### headings remain inside that section.
        if (/^##\s/.test(line)) {

            if (currentSection.length > 0) {

                sections.push(
                    currentSection.join("\n").trim()
                );
            }

            currentSection = [line];

        } else {

            currentSection.push(line);
        }
    }


    if (currentSection.length > 0) {

        sections.push(
            currentSection.join("\n").trim()
        );
    }


    // Remove the document title.
    const filteredSections = sections.filter(
        section =>
            !section.startsWith(
                "# SCD Drift Detection Business Rules"
            )
    );


    const chunks = [];


    for (const section of filteredSections) {

        if (section.length <= MAX_CHARS) {

            chunks.push(section);

            continue;
        }


        const smallerChunks =
            splitLargeSection(section);

        chunks.push(...smallerChunks);
    }


    return chunks.map((content, index) => ({

        id: `scd-rule-${index + 1}`,

        content,

        metadata: {
            source: "scd-business-rules.md",
            chunkIndex: index
        }
    }));
};


module.exports = {
    chunkMarkdown
};