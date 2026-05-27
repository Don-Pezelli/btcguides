(function () {
    const actorOrder = ["Owner A", "Owner B", "Keyholder C", "Employee", "Customer"];

    function uniqueActors(actorText) {
        const found = actorOrder.filter((actor) => actorText.includes(actor));
        return found.length ? found : ["Owner A", "Owner B"];
    }

    function wrapText(text, maxChars) {
        const words = text.split(/\s+/);
        const lines = [];
        let line = "";

        words.forEach((word) => {
            const next = line ? `${line} ${word}` : word;
            if (next.length > maxChars && line) {
                lines.push(line);
                line = word;
            } else {
                line = next;
            }
        });

        if (line) {
            lines.push(line);
        }

        return lines.slice(0, 4);
    }

    function textBlock(text, x, y, maxChars, className, anchor = "middle", lineHeight = 17) {
        return wrapText(text, maxChars).map((line, index) => (
            `<text x="${x}" y="${y + index * lineHeight}" text-anchor="${anchor}" class="${className}">${line}</text>`
        )).join("");
    }

    function taskBox(x, y, width, height, label) {
        return [
            `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="4" class="pm-task"/>`,
            textBlock(label, x + width / 2, y + 24, Math.floor(width / 7), "pm-small")
        ].join("");
    }

    function diamond(cx, cy, label) {
        return [
            `<path d="M${cx} ${cy - 34} L${cx + 55} ${cy} L${cx} ${cy + 34} L${cx - 55} ${cy} Z" class="pm-decision"/>`,
            textBlock(label, cx, cy - 3, 12, "pm-small pm-white", "middle", 15)
        ].join("");
    }

    function arrow(x1, y1, x2, y2) {
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="pm-arrow" marker-end="url(#pm-arrowhead)"/>`;
    }

    function renderMap(process, actors, protocol) {
        const lanes = uniqueActors(actors);
        const laneHeight = 96;
        const top = 146;
        const width = 1120;
        const height = top + lanes.length * laneHeight + 46;
        const contentLeft = 170;
        const laneLabelWidth = 145;
        const rowWidth = width - 60;
        const actorRows = lanes.map((actor, index) => {
            const y = top + index * laneHeight;
            return [
                `<rect x="30" y="${y}" width="${laneLabelWidth}" height="${laneHeight - 6}" class="pm-lane-label"/>`,
                `<text x="${30 + laneLabelWidth / 2}" y="${y + 52}" text-anchor="middle" class="pm-actor">${actor}</text>`,
                `<line x1="30" y1="${y + laneHeight}" x2="${rowWidth}" y2="${y + laneHeight}" class="pm-separator"/>`
            ].join("");
        }).join("");

        const firstLaneY = top + laneHeight / 2;
        const ownerLaneIndex = lanes.findIndex((actor) => actor === "Owner A" || actor === "Owner B");
        const ownerLaneY = top + (ownerLaneIndex >= 0 ? ownerLaneIndex : 0) * laneHeight + laneHeight / 2;
        const recordLaneIndex = lanes.findIndex((actor) => actor === "Owner A" || actor === "Owner B" || actor === "Employee");
        const recordLaneY = top + (recordLaneIndex >= 0 ? recordLaneIndex : lanes.length - 1) * laneHeight + laneHeight / 2;

        const startX = contentLeft + 35;
        const initiateX = contentLeft + 95;
        const verifyX = contentLeft + 270;
        const decisionX = contentLeft + 470;
        const executeX = contentLeft + 575;
        const recordX = contentLeft + 730;
        const endX = contentLeft + 930;

        const protocolShort = protocol.length > 96 ? `${protocol.slice(0, 93)}...` : protocol;

        return `
            <svg class="process-map-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Business process map for ${process}">
                <defs>
                    <linearGradient id="pm-title-bg" x1="0" x2="1">
                        <stop offset="0%" stop-color="#d9ecff"/>
                        <stop offset="100%" stop-color="#63b4f6"/>
                    </linearGradient>
                    <marker id="pm-arrowhead" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
                        <path d="M2,2 L10,6 L2,10 Z" fill="#2f77d0"/>
                    </marker>
                </defs>
                <style>
                    .pm-title { font: 800 42px Inter, Arial, sans-serif; fill: #050505; }
                    .pm-subtitle { font: 700 18px Inter, Arial, sans-serif; fill: #121212; }
                    .pm-actor { font: 700 17px Inter, Arial, sans-serif; fill: #050505; }
                    .pm-small { font: 700 12px Inter, Arial, sans-serif; fill: #111; }
                    .pm-white { fill: #fff; }
                    .pm-lane-label { fill: #dceeff; }
                    .pm-separator { stroke: #d8d8d8; stroke-width: 2; }
                    .pm-task { fill: #dceeff; stroke: none; }
                    .pm-decision { fill: #085bd8; stroke: #085bd8; stroke-width: 2; }
                    .pm-start-end { fill: #59b1ff; stroke: none; }
                    .pm-arrow { stroke: #2f77d0; stroke-width: 2; }
                </style>
                <rect x="30" y="32" width="${rowWidth}" height="82" fill="url(#pm-title-bg)"/>
                <text x="78" y="88" class="pm-title">Business Process Map</text>
                ${textBlock(process, 78, 130, 80, "pm-subtitle", "start", 19)}
                ${actorRows}
                <circle cx="${startX}" cy="${firstLaneY}" r="26" class="pm-start-end"/>
                <text x="${startX}" y="${firstLaneY + 4}" text-anchor="middle" class="pm-small">Start</text>
                ${taskBox(initiateX, firstLaneY - 28, 128, 56, `Initiate: ${process}`)}
                ${arrow(startX + 26, firstLaneY, initiateX, firstLaneY)}
                ${arrow(initiateX + 128, firstLaneY, verifyX, ownerLaneY)}
                ${taskBox(verifyX, ownerLaneY - 32, 138, 64, "Verify actor, amount, authority, and records")}
                ${arrow(verifyX + 138, ownerLaneY, decisionX - 58, ownerLaneY)}
                ${diamond(decisionX, ownerLaneY, "Approved?")}
                ${taskBox(executeX, firstLaneY - 32, 138, 64, "Execute protocol step")}
                ${arrow(decisionX + 56, ownerLaneY, executeX, firstLaneY)}
                ${arrow(executeX + 138, firstLaneY, recordX, recordLaneY)}
                ${taskBox(recordX, recordLaneY - 34, 150, 68, `Record: ${protocolShort}`)}
                ${arrow(recordX + 150, recordLaneY, endX - 26, recordLaneY)}
                <circle cx="${endX}" cy="${recordLaneY}" r="26" class="pm-start-end"/>
                <text x="${endX}" y="${recordLaneY + 4}" text-anchor="middle" class="pm-small">End</text>
            </svg>
        `;
    }

    function initProcessMapTable(table) {
        const viewer = table.closest(".table-scroll")?.nextElementSibling;
        if (!viewer || !viewer.classList.contains("process-map-viewer")) {
            return;
        }

        table.querySelectorAll("tbody tr").forEach((row) => {
            const cells = Array.from(row.cells).map((cell) => cell.textContent.trim().replace(/\s+/g, " "));
            if (cells.length < 4) {
                return;
            }

            row.classList.add("process-map-row");
            row.tabIndex = 0;
            row.setAttribute("role", "button");
            row.setAttribute("aria-label", `Show process map for ${cells[1]}`);

            const showMap = () => {
                table.querySelectorAll(".process-map-row-active").forEach((activeRow) => {
                    activeRow.classList.remove("process-map-row-active");
                });
                row.classList.add("process-map-row-active");
                viewer.innerHTML = renderMap(cells[1], cells[2], cells[3]);
                viewer.classList.add("is-visible");
            };

            row.addEventListener("click", showMap);
            row.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    showMap();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".process-map-table").forEach(initProcessMapTable);
    });
})();
