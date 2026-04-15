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

    log.innerText += JSON.stringify(json, null, 4) + "\n";
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
        log.innerText += `Converstation ${uuid} created\n`;        
    }
    else {
        log.innerText += `Error creating converstation\n`;
        const json = await response.json();
        log.innerText += JSON.stringify(json, null, 4) + "\n";
    }
}
