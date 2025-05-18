// content.js

// Excluded domains
const excludedDomains = [
  'google.com', 'facebook.com', 'x.com', 'instagram.com', 'wikipedia.com',
  'wikipedia.org', 'labs.google.com', 'google.co.in', '.wikipedia.org',
  'youtube.com', 'maps.google.com', 'support.google.com', 'accounts.google.com','quora.com','wikipedia.org',
  'policies.google.com', 'twitter.com'
];

async function extractLinks() {
  const searchResults = document.querySelectorAll('a');
  const result = await chrome.storage.local.get(['savedLinks']);
  let links = result.savedLinks || [];

  searchResults.forEach(link => {
    const href = link.href;
    if (href) {
      const url = new URL(href);
      const cleanedUrl = url.toString().split('#:~:text=')[0];
      const domain = new URL(cleanedUrl).hostname.replace(/^www\./, '');
      if (!excludedDomains.includes(domain)) {
        links.push(cleanedUrl);
      }
    }
  });

  const uniqueLinks = [...new Set(links)];
  chrome.storage.local.set({ savedLinks: uniqueLinks });
  console.log('Saved links count:', uniqueLinks.length);
  injectLinkList(uniqueLinks);
}

function injectLinkList(links) {
  // Remove previous container if it exists
  const existing = document.getElementById('link-saver-container');
  if (existing) existing.remove();

  // Create container
  const container = document.createElement('div');
  container.id = 'link-saver-container';
  Object.assign(container.style, {
    position: 'fixed',
    top: '10px',
    right: '10px',
    width: '300px',
    maxHeight: '400px',
    overflowY: 'auto',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    padding: '10px',
    zIndex: '10000',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
    fontFamily: 'Arial, sans-serif',
    fontSize: '10px',
  });

  // Title with count
  const title = document.createElement('h4');
  title.textContent = `Saved Links (${links.length})`;
  title.style.marginTop = '0';
  container.appendChild(title);

  // Link list
  const list = document.createElement('ul');
  list.style.listStyleType = 'none';
  list.style.padding = '0';
  list.style.margin = '0';

  links.forEach(url => {
    const li = document.createElement('li');
    li.style.marginBottom = '5px';

    const a = document.createElement('a');
    a.href = url;
    a.textContent = url;
    a.target = '_blank';
    Object.assign(a.style, {
      color: '#1a0dab',
      textDecoration: 'none',
      wordWrap: 'break-word'
    });

    li.appendChild(a);
    list.appendChild(li);
  });

// Copy All button
  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy All';
  Object.assign(copyBtn.style, {
    backgroundColor: '#5bc0de',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    marginTop: '5px',
	marginBottom: '10px',
    cursor: 'pointer',
    width: '100%'
  });

  copyBtn.addEventListener('click', async () => {
    const textToCopy = links.join('\n');
    try {
      await navigator.clipboard.writeText(textToCopy);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy All'), 1500);
    } catch (err) {
      console.error('Copy failed', err);
      copyBtn.textContent = 'Failed';
    }
  });
  

  // "Clear All" button
  const clearBtn = document.createElement('button');
  clearBtn.textContent = 'Clear All';
  Object.assign(clearBtn.style, {
    backgroundColor: '#d9534f',
    color: 'white',
    border: 'none',
    padding: '5px 10px',
    marginTop: '5px',
	marginBottom: '10px',
    cursor: 'pointer',
    width: '100%'
  });

  clearBtn.addEventListener('click', () => {
    chrome.storage.local.set({ savedLinks: [] }, () => {
      console.log('Links cleared');
      document.getElementById('link-saver-container')?.remove();
    });
  });

  container.appendChild(clearBtn);
  container.appendChild(copyBtn);
  container.appendChild(list);
  
  document.body.appendChild(container);
}


// Check session status before extracting
chrome.storage.local.get('sessionActive', (data) => {
  if (data.sessionActive) {
    extractLinks();
  } else {
    console.log('Session not active, skipping link extraction.');
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startSession') {
    chrome.storage.local.get('sessionActive', (data) => {
      if (data.sessionActive) {
        console.log('Session active: extracting links');
        extractLinks();
      }
    });
  }
});