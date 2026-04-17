function initEmbeddedMessaging() {
    try {
        // Use inline display mode!      
        embeddedservice_bootstrap.settings.displayMode = 'inline';
        const chatContainer = document.getElementById('search-agentforce');
        embeddedservice_bootstrap.settings.targetElement = chatContainer;
        
        embeddedservice_bootstrap.settings.language = 'en_US';

        embeddedservice_bootstrap.init(
            '00DKB000002Sozi',
            'EnhancedChatWebv2Customized',
            'https://storm-200bc8ffc9c437.my.site.com/ESWEnhancedChatWebv2Custo1776413138702',
            {
                scrt2URL: 'https://storm-200bc8ffc9c437.my.salesforce-scrt.com'
            }
        );
    } catch (err) {
        console.error('Error loading Embedded Messaging: ', err);
    }
};

document.getElementById('search-open').addEventListener('click', function() {
    console.log("Search icon clicked");
    document.getElementById('search-sidepanel').classList.remove('d-none');
});

document.getElementById('search-close').addEventListener('click', function() {
    console.log("Search close button clicked");
    document.getElementById('search-sidepanel').classList.add('d-none');
});

document.getElementById('search-button').addEventListener('click', search);
document.getElementById('search-input').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        search();
    }
});

document.getElementById('search-input').addEventListener('keyup', function(event) {
    if (event.key !== 'Enter') {
        document.getElementById('search-results').classList.add('d-none');
    }
});

async function search() {
    const query = document.getElementById('search-input').value;
    console.log("Search query: ", query);
    document.getElementById('search-results').classList.remove('d-none');

    // launch chat programically
    document.getElementById('search-agentforce').classList.remove('d-none');
    await embeddedservice_bootstrap.utilAPI.launchChat();
    await embeddedservice_bootstrap.utilAPI.sendTextMessage(query);
}