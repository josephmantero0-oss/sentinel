document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const blockedUrl = urlParams.get('url');
    const reasonCode = urlParams.get('reason');

    const blockedUrlSpan = document.getElementById('blocked-url');
    const reasonText = document.getElementById('detection-reason');
    const btnBack = document.getElementById('btn-back');
    const btnAdvanced = document.getElementById('btn-advanced');
    const advancedContent = document.getElementById('advanced-content');
    const btnProceed = document.getElementById('btn-proceed');

    if (blockedUrl) {
        blockedUrlSpan.textContent = blockedUrl;
    } else {
        blockedUrlSpan.textContent = "the requested URL";
    }

    if (reasonCode) {
        // Map reasons to text
        const reasons = {
            'blacklist': 'This URL is on our known malicious blacklist.',
            'insecure_connection': 'This site is not secured (HTTP) and has been blocked automatically.',
            'heuristics_ip': 'This site is using an IP address instead of a domain name, which is common for phishing.',
            'heuristics_subdomain': 'This site is using too many subdomains, which is common for phishing.',
            'heuristics_keywords': 'This site has suspicious keywords in its URL, pretending to be a legitimate service.',
            'heuristics_TLD': 'This site is using a top-level domain often associated with malicious activities.',
            'heuristics_typo': 'This site appears to be typo-squatting a well known brand.'
        };
        reasonText.textContent = reasons[reasonCode] || "Automatic heuristics flagged this site as suspicious.";
    }

    // Go back safely
    btnBack.addEventListener('click', () => {
        window.history.back();
        // If history back fails (e.g. opened in new tab), go to safe page
        setTimeout(() => {
            window.location.href = "https://www.google.com";
        }, 500);
    });

    // Toggle advanced section
    btnAdvanced.addEventListener('click', () => {
        advancedContent.classList.toggle('hidden');
        if (advancedContent.classList.contains('hidden')) {
            btnAdvanced.textContent = 'Show advanced';
        } else {
            btnAdvanced.textContent = 'Hide advanced';
        }
    });

    // Proceed at own risk
    btnProceed.addEventListener('click', () => {
        if (!blockedUrl) return;

        try {
            const urlObj = new URL(blockedUrl);
            const hostname = urlObj.hostname;

            // Save to chrome storage to bypass for this domain
            if (chrome && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get(['whitelist'], (result) => {
                    const whitelist = result.whitelist || [];
                    if (!whitelist.includes(hostname)) {
                        whitelist.push(hostname);
                        chrome.storage.local.set({ whitelist: whitelist }, () => {
                            // After saving, redirect to the blocked URL
                            window.location.replace(blockedUrl);
                        });
                    } else {
                        window.location.replace(blockedUrl);
                    }
                });
            } else {
                // If not in extension context, just redirect (for testing locally)
                window.location.replace(blockedUrl);
            }
        } catch (e) {
            console.error("Invalid URL format");
        }
    });
});
