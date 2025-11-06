// Crisp Chat Integration
(function() {
    console.log('Loading Crisp chat...');
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "99ea6bb5-9995-4cb4-bf3d-298eefa5b4f0";
    
    var d = document;
    var s = d.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = 1;
    
    s.onload = function() {
        console.log('Crisp chat loaded successfully!');
    };
    
    s.onerror = function() {
        console.error('Failed to load Crisp chat');
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
