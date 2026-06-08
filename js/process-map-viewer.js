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

    function taskBox(x, y, width, height, label, className = "pm-task") {
        return [
            `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="4" class="${className}"/>`,
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

    function actionLabel(process) {
        if (/regular reserve maintenance/i.test(process)) {
            return "Perform maintenance checks";
        }
        if (/accounting|reporting/i.test(process)) {
            return "Create accounting or tax records";
        }
        if (/employee access review/i.test(process)) {
            return "Grant, retain, or revoke access rights";
        }
        if (/receive/i.test(process)) {
            return "Receive to verified wallet address";
        }
        if (/spend|withdrawal/i.test(process)) {
            return "Sign and broadcast approved spend";
        }
        if (/recovery/i.test(process)) {
            return "Run approved recovery test";
        }
        if (/deposit|sending|transfer|migration/i.test(process)) {
            return "Send to verified reserve address";
        }

        return "Complete approved action";
    }

    function renderMap(process, actors, protocol) {
        const lanes = uniqueActors(actors);
        const width = 920;
        const centerX = width / 2;
        const boxX = 250;
        const boxWidth = 420;
        const boxHeight = 64;
        const rowWidth = width - 60;
        const requiresBothOwners = actors.includes("Owner A, Owner B");
        const needsTransactionCheck = /address|destination|amount|deposit|spend|withdrawal|wallet|transaction|psbt|fee/i
            .test(`${process} ${protocol}`);
        const needsPrivacyCheck = /\b(seed|signer|signers|signing|psbt|spend|spending|withdrawal|send|sending|receive|receiving|deposit|transfer|migration|recovery|descriptor|xpub|address|keyholder)\b|key c/i
            .test(`${process} ${protocol}`);
        const height = needsPrivacyCheck ? 1060 : 960;
        const verifyOneY = needsPrivacyCheck ? 482 : 386;
        const verifyTwoY = needsPrivacyCheck ? 578 : 482;
        const decisionY = needsPrivacyCheck ? 722 : 626;
        const executeY = needsPrivacyCheck ? 796 : 700;
        const recordY = needsPrivacyCheck ? 892 : 796;
        const endY = needsPrivacyCheck ? 1014 : 918;
        const correctionX = 690;
        const correctionWidth = 190;
        const correctionY = decisionY - 32;
        const verificationSteps = /employee access review/i.test(process)
            ? [
                "Owner A reviews employee access to devices, wallets, records, and information",
                "Owner B independently confirms which rights to grant, retain, or revoke"
            ]
            : /accounting|reporting/i.test(process)
            ? [
                "Access watch-only wallet and business records",
                "Verify accumulated inflows, outflows, balances, and labels"
            ]
            : requiresBothOwners
            ? needsTransactionCheck
                ? [
                    "Owner A verifies address or destination, amount, authority, source, and records",
                    "Owner B independently verifies address or destination, amount, authority, source, and records"
                ]
                : [
                    "Owner A verifies authority, scope, required evidence, and records",
                    "Owner B independently verifies authority, scope, required evidence, and records"
                ]
            : needsTransactionCheck
                ? [
                    "Required actors verify address or destination, amount, authority, proof, and records",
                    "Second required party checks release rule, limits, and documentation"
                ]
                : [
                    "Required actors verify identity, authority, proof, scope, and records",
                    "Second required party checks release rule, limits, and documentation"
                ];
        const participantChips = lanes.map((actor, index) => {
            const chipWidth = 148;
            const gap = 12;
            const totalWidth = lanes.length * chipWidth + (lanes.length - 1) * gap;
            const x = centerX - totalWidth / 2 + index * (chipWidth + gap);
            return [
                `<rect x="${x}" y="146" width="${chipWidth}" height="36" rx="4" class="pm-lane-label"/>`,
                `<text x="${x + chipWidth / 2}" y="170" text-anchor="middle" class="pm-actor">${actor}</text>`
            ].join("");
        }).join("");
        const protocolShort = protocol.length > 100
            ? protocol.slice(0, 100).replace(/\s+\S*$/, "").replace(/[,\s]+$/, "")
            : protocol;
        const privacyStep = needsPrivacyCheck
            ? [
                `${arrow(centerX, 354, centerX, 386)}`,
                `${taskBox(boxX, 386, boxWidth, boxHeight, "Confirm only required actors are present; block observers before exposing seed, signer, address, or PSBT details", "pm-sensitive")}`,
                `${arrow(centerX, 450, centerX, verifyOneY)}`
            ].join("")
            : `${arrow(centerX, 354, centerX, verifyOneY)}`;

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
                    .pm-actor { font: 700 14px Inter, Arial, sans-serif; fill: #050505; }
                    .pm-small { font: 700 13px Inter, Arial, sans-serif; fill: #111; }
                    .pm-white { fill: #fff; }
                    .pm-lane-label { fill: #dceeff; }
                    .pm-task { fill: #dceeff; stroke: none; }
                    .pm-verify { fill: #fff3df; stroke: #f39c12; stroke-width: 2; }
                    .pm-sensitive { fill: #fff8e8; stroke: #d97706; stroke-width: 1.5; }
                    .pm-record { fill: #f7f7f7; stroke: #c7c7c7; stroke-width: 1.5; }
                    .pm-correction { fill: #fff; stroke: #d24b4b; stroke-width: 1.5; }
                    .pm-decision { fill: #085bd8; stroke: #085bd8; stroke-width: 2; }
                    .pm-start-end { fill: #59b1ff; stroke: none; }
                    .pm-arrow { stroke: #2f77d0; stroke-width: 2; }
                </style>
                <rect x="30" y="32" width="${rowWidth}" height="82" fill="url(#pm-title-bg)"/>
                <text x="78" y="88" class="pm-title">Business Process Map</text>
                ${textBlock(process, 78, 130, 80, "pm-subtitle", "start", 19)}
                ${participantChips}
                <circle cx="${centerX}" cy="232" r="26" class="pm-start-end"/>
                <text x="${centerX}" y="236" text-anchor="middle" class="pm-small">Start</text>
                ${arrow(centerX, 258, centerX, 290)}
                ${taskBox(boxX, 290, boxWidth, boxHeight, `Initiate: ${process}`)}
                ${privacyStep}
                ${taskBox(boxX, verifyOneY, boxWidth, boxHeight, verificationSteps[0], "pm-verify")}
                ${arrow(centerX, verifyOneY + boxHeight, centerX, verifyTwoY)}
                ${taskBox(boxX, verifyTwoY, boxWidth, boxHeight, verificationSteps[1], "pm-verify")}
                ${arrow(centerX, verifyTwoY + boxHeight, centerX, decisionY - 34)}
                ${diamond(centerX, decisionY, "Approved?")}
                <text x="${centerX + 22}" y="${decisionY + 56}" class="pm-small">Yes</text>
                ${arrow(centerX + 55, decisionY, correctionX, decisionY)}
                <text x="${centerX + 112}" y="${decisionY - 8}" class="pm-small">No</text>
                ${taskBox(correctionX, correctionY, correctionWidth, boxHeight, "Pause, correct issue, then restart approval", "pm-correction")}
                ${arrow(centerX, decisionY + 34, centerX, executeY)}
                ${taskBox(boxX, executeY, boxWidth, boxHeight, actionLabel(process))}
                ${arrow(centerX, executeY + boxHeight, centerX, recordY)}
                ${taskBox(boxX, recordY, boxWidth, boxHeight, `Record: ${protocolShort}`, "pm-record")}
                ${arrow(centerX, recordY + boxHeight, centerX, endY - 26)}
                <circle cx="${centerX}" cy="${endY}" r="26" class="pm-start-end"/>
                <text x="${centerX}" y="${endY + 4}" text-anchor="middle" class="pm-small">End</text>
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
                viewer.tabIndex = -1;

                window.requestAnimationFrame(() => {
                    viewer.scrollIntoView({ behavior: "smooth", block: "start" });
                    viewer.focus({ preventScroll: true });
                });
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
