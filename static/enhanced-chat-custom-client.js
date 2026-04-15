const log = document.getElementById("log");

log.innerText += "Started.\n";

const config = {
    "OrganizationId": "00DKB000002Sozi",
    "DeveloperName": "EnhancedChatCustomClient",
    "Url": "https://storm-200bc8ffc9c437.my.salesforce-scrt.com"
}

let accessToken = undefined;
let lastEventId = undefined;
let uuid = undefined;

main();

async function main() {
    await generateAccessTokenForUnauthenticatedUser();
    await createConversation();
    await startSSE();
}

async function generateAccessTokenForUnauthenticatedUser() {
    const body = {
        "orgId": config.OrganizationId,
        "esDeveloperName": config.DeveloperName,
        "capabilitiesVersion": "1",
        "platform": "Web",
        "context": {
            "appName": "EnhancedChatCustomClient",
            "clientVersion": "1.0.0"
        }
    };

    const response = await fetch(config.Url + "/iamessage/api/v2/authorization/unauthenticated/access-token", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const json = await response.json();

    logToContainer("Generate access token for unauthenticated user", JSON.stringify(json, null, 4) + "\n");
    accessToken = json.accessToken;
    lastEventId = json.lastEventId;
}

async function createConversation() {
    uuid = crypto.randomUUID();
    console.log(uuid);

    const body = {        
        "conversationId": uuid,
        "routingAttributes": null,
        "esDeveloperName": config.DeveloperName        
    };

    console.log(accessToken);
    const response = await fetch(config.Url + "/iamessage/api/v2/conversation", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + accessToken
        },
        body: JSON.stringify(body)        
    });

    if(response.ok) {        
        logToContainer("Create conversation", `Converstation ${uuid} created\n`);        
    }
    else {
        logToContainer("Create conversation", `Error creating converstation\n`);
        const json = await response.json();
        logToContainer("Create conversation", JSON.stringify(json, null, 4) + "\n");
    }
}

async function startSSE() {
    try {
        console.log("Starting SSE connection...");
        const eventSource = new EventSourcePolyfill(config.Url + "/eventrouter/v1/sse", {
           headers: {
                "Authorization": "Bearer " + accessToken,
                'Accept': 'text/event-stream',
                'X-Org-Id': config.OrganizationId,
                'Last-Event-ID': lastEventId
            }
        });    
        console.log("SSE connection established.");
        
        eventSource.onerror = (error) => {
            console.error("SSE Error:", error);
            logToContainer("SSE Error", JSON.stringify(error, null, 4) + "\n");
        };

        eventSource.onopen = () => {
            console.log("SSE Connection opened.");
            logToContainer("SSE Connection", "Connection opened.\n");
        };

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("New message received:", data);
            logToContainer("SSE Message Received", JSON.stringify(data, null, 4) + "\n");
        };
    } 
    catch (error) {
        console.error("SSE Connection failed:", error);
    }
}






let dataBsTargetCounter = 0;

/**
 * Creates and appends a log entry to the container
 * @param {string} message - The log text
 * @param {HTMLElement} container - The element to append to
 */
function logToContainer(heading, message) {
    const container = document.getElementById("log-container");
    const id = `logContent_${dataBsTargetCounter++}`;
    
    // 1. Create the card structure
    const logEntry = document.createElement('div');
    logEntry.className = 'card mb-3 overflow-hidden';
    
    logEntry.innerHTML = `
        <div class="card-header toggle-header d-flex align-items-center py-1" 
            data-bs-toggle="collapse" 
            data-bs-target="#content${dataBsTargetCounter}" 
            aria-expanded="false">
            <span class="toggle-icon small text-muted">▶</span>
            <small class="text-muted fw-bold ms-1">${heading}</small>
        </div>
        <div class="card-body p-0">
            <div class="collapse-content collapsed p-3" 
                id="content${dataBsTargetCounter}" 
                style="font-family: monospace; white-space: pre-wrap; word-break: break-all;">
                ${message}
            </div>
        </div>`;

    container.appendChild(logEntry);

    // 2. Optional: Hide the toggle icon if the message is too short to collapse
    const contentDiv = logEntry.querySelector('.collapse-content');
    const header = logEntry.querySelector('.toggle-header');
    
    // If text is short (less than 5 lines / ~115px), disable collapse
    if (contentDiv.scrollHeight < 115) {
        header.removeAttribute('data-bs-toggle');
        header.querySelector('.toggle-icon').style.visibility = 'hidden';
        header.classList.remove('toggle-header');
        contentDiv.classList.remove('collapsed');
    }
}

/**
 * Global Event Listener (Event Delegation)
 * Listens for Bootstrap collapse events to handle any logic 
 * when things open/close (though the CSS handles the icon rotation here).
 */
document.addEventListener('show.bs.collapse', function (e) {
    if (e.target.classList.contains('collapse-content')) {
        // You can add additional logic here if needed
        console.log(`Expanded: ${e.target.id}`);
    }
});

document.addEventListener('hide.bs.collapse', function (e) {
    if (e.target.classList.contains('collapse-content')) {
        console.log(`Collapsed: ${e.target.id}`);
    }
});