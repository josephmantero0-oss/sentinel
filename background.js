import HeuristicsAnalyzer from './utils/heuristics.js';
import WhitelistManager from './utils/whitelist.js';
import ContentFilter from './utils/contentFilter.js';

// Dummy basic local blacklist (In a real app, this could be fetched from an API like OpenPhish)
const BLACKLIST = [
    'phishing.com',
    'malicious-site.net',
    'fake-bank-login.com'
];

/**
 * Increment a named counter in chrome.storage.local
 */
async function incrementStat(key) {
    return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
            const newVal = (result[key] || 0) + 1;
            chrome.storage.local.set({ [key]: newVal }, resolve);
        });
    });
}

/**
 * Record a blocked site entry into the history list
 */
async function recordBlockedSite(url, reason) {
    return new Promise((resolve) => {
        chrome.storage.local.get(['blockedSiteHistory'], (result) => {
            const history = result.blockedSiteHistory || [];
            history.unshift({
                url,
                reason,
                time: new Date().toISOString()
            });
            // Keep max 200 entries
            if (history.length > 200) history.splice(200);
            chrome.storage.local.set({ blockedSiteHistory: history }, resolve);
        });
    });
}

/**
 * Handle navigation to detect phishing
 */
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    // Only process main frame navigations
    if (details.frameId !== 0) return;

    try {
        const urlObj = new URL(details.url);

        // Skip extension pages and local pages
        if (urlObj.protocol === 'chrome-extension:' || urlObj.protocol === 'chrome:') {
            return;
        }

        const hostname = urlObj.hostname;

        // Increment total scans counter
        incrementStat('totalScans');

        // 1. Check Whitelist first
        const isSafe = await WhitelistManager.isWhitelisted(hostname);
        if (isSafe) {
            console.log(`[Joseph's Sentinel] ${hostname} is whitelisted.`);
            return;
        }

        let isBlocked = false;
        let blockReason = '';

        // 2. Blacklist match
        if (BLACKLIST.includes(hostname)) {
            isBlocked = true;
            blockReason = 'blacklist';
        }

        // 3. Vulgar / Adult Link Filter
        if (!isBlocked) {
            const contentResult = ContentFilter.analyzeUrl(urlObj);
            if (contentResult.isVulgar) {
                isBlocked = true;
                blockReason = contentResult.reason;
            }
        }

        // 4. Heuristic matching
        if (!isBlocked) {
            const heuristicResult = HeuristicsAnalyzer.analyze(urlObj);
            if (heuristicResult.isPhishing) {
                isBlocked = true;
                blockReason = heuristicResult.reason;
            }
        }

        // 5. Insecure Protocol Check (HTTP)
        if (!isBlocked && urlObj.protocol === 'http:') {
            isBlocked = true;
            blockReason = 'insecure_connection';
        }

        // Action: Block via redirect if suspicious.
        if (isBlocked) {
            console.log(`[Joseph's Sentinel] BLOCKED: ${details.url} Reason: ${blockReason}`);

            // Track stats
            await incrementStat('totalSitesBlocked');
            await recordBlockedSite(details.url, blockReason);

            // Generate the URL for the blocked warning page
            const extensionBlockedUrl = chrome.runtime.getURL(
                `blocked/blocked.html?url=${encodeURIComponent(details.url)}&reason=${blockReason}`
            );

            // Redirect the tab to our blocked warning page
            chrome.tabs.update(details.tabId, { url: extensionBlockedUrl });

            // Update extension icon/badge
            chrome.action.setBadgeText({ tabId: details.tabId, text: "!" });
            chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: "#FF0000" });
        } else {
            // Safe URL, maybe clear badge if re-used tab
            chrome.action.setBadgeText({ tabId: details.tabId, text: "" });
        }

    } catch (e) {
        console.error("Error parsing URL in webNavigation:", e);
    }
});

// Listen for messages from content script (YouTube video blocks)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'YOUTUBE_VIDEO_BLOCKED') {
        incrementStat('totalYouTubeBlocked');
        chrome.storage.local.get(['blockedYouTubeHistory'], (result) => {
            const history = result.blockedYouTubeHistory || [];
            history.unshift({
                title: message.title || 'Unknown',
                keyword: message.keyword || '',
                category: message.category || '',
                url: message.url || '',
                time: new Date().toISOString()
            });
            if (history.length > 200) history.splice(200);
            chrome.storage.local.set({ blockedYouTubeHistory: history });
        });
    }
    return true;
});
