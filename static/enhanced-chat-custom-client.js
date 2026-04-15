const log = document.getElementById("log");

log.innerText += "Started.\n";

const config = {
  "OrganizationId": "00DKB000002Sozi",
  "DeveloperName": "EnhancedChatCustomClient",
  "Url": "https://storm-200bc8ffc9c437.my.salesforce-scrt.com"
}

let accessToken = undefined;
let uuid = undefined;

main();

async function main() {
    await generateAccessTokenForUnauthenticatedUser();
    await createConversation();
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

    logToContainer(JSON.stringify(json, null, 4) + "\n");
    accessToken = json.accessToken;
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
        logToContainer(`Converstation ${uuid} created\n`);        
    }
    else {
        logToContainer(`Error creating converstation\n`);
        const json = await response.json();
        logToContainer(JSON.stringify(json, null, 4) + "\n");
    }
}

let dataBsTargetCounter = 0;
function logToContainer(message) {
    const logContainer = document.getElementById("log-container");
    const logEntry = document.createElement(
`<div class="card mb-3 text-container">
    <div class="card-body">
        <div class="collapse-content collapsed" id="content1" style="font-family: monospace; white-space: pre-wrap;">
            ${message}
        </div>
        <button class="btn btn-link p-0 mt-2 toggle-btn" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#content${dataBsTargetCounter}" 
            aria-expanded="false" 
            aria-controls="content${dataBsTargetCounter}"
        >
            Read More
        </button>
    </div>
</div>`);
    logContainer.appendChild(logEntry);
    dataBsTargetCounter++;
}