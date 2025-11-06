// Crisp Chat Integration
(function() {
    console.log('💬 Loading Crisp chat...');
    console.log('📍 Current domain:', window.location.hostname);
    
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "99ea6bb5-9995-4cb4-bf3d-298eefa5b4f0";
    
    var d = document;
    var s = d.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = 1;
    
    s.onload = function() {
        console.log('✅ Crisp chat loaded successfully!');
        console.log('If chat widget doesn\'t appear, check domain whitelist in Crisp dashboard');
    };
    
    s.onerror = function() {
        console.error('❌ Failed to load Crisp chat script');
        console.error('Possible causes:');
        console.error('1. Domain not whitelisted in Crisp dashboard');
        console.error('2. Network/firewall blocking Crisp');
        console.error('3. Ad blocker blocking Crisp');
    };
    
    if (document.head) {
        document.head.appendChild(s);
    } else {
        // Wait for head to be available
        document.addEventListener('DOMContentLoaded', function() {
            document.head.appendChild(s);
        });
    }
})();
