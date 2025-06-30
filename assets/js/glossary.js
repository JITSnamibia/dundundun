/**
 * @file glossary.js
 * @description Contains the data for the interactive glossary.
 * This makes it easy to add, remove, or edit terms without changing the main app logic.
 */

export const glossaryTerms = {
    '404-error': {
        term: '404 Error',
        definition: 'A standard HTTP response code indicating that the client was able to communicate with a given server, but the server could not find what was requested. In simple terms, it means the page does not exist at that URL.'
    },
    'dns': {
        term: 'DNS (Domain Name System)',
        definition: 'The internet\'s phonebook. It translates human-readable domain names (like www.google.com) into machine-readable IP addresses (like 172.217.14.228). Correct DNS records are essential for your website to be found.'
    },
    'cname-record': {
        term: 'CNAME Record',
        definition: 'A Canonical Name record is a type of DNS record that maps an alias name to a true or canonical domain name. For example, mapping www.yourdomain.com to yourdomain.com.'
    },
    'a-record': {
        term: 'A Record',
        definition: 'An Address Record is a type of DNS record that points a domain or subdomain to an IP address. This is one of the most fundamental records for a website to work.'
    },
    'google-search-console': {
        term: 'Google Search Console',
        definition: 'A free service offered by Google that helps you monitor, maintain, and troubleshoot your site\'s presence in Google Search results. It\'s essential for understanding how Google sees your site.'
    },
    'txt-record': {
        term: 'TXT Record',
        definition: 'A type of DNS record that contains text information for sources outside your domain. It\'s often used to verify domain ownership, as required by services like Google Search Console.'
    },
    'sitemap': {
        term: 'Sitemap',
        definition: 'A file where you provide information about the pages, videos, and other files on your site, and the relationships between them. Search engines like Google read this file to more intelligently crawl your site.'
    },
    'indexing': {
        term: 'Indexing',
        definition: 'The process by which search engines like Google discover, analyze, and store web pages in their database (the "index"). A page must be indexed before it can appear in search results.'
    },
    'robots-txt': {
        term: 'robots.txt',
        definition: 'A text file webmasters create to instruct web robots (typically search engine robots) how to crawl pages on their website. It specifies which areas of the site should not be processed or scanned.'
    },
    '301-redirect': {
        term: '301 Redirect',
        definition: 'A permanent redirect from one URL to another. It tells search engines that a page has permanently moved, and it passes most of the link equity (ranking power) to the new page. This is the best way to handle changed URLs.'
    },
    'htaccess': {
        term: '.htaccess File',
        definition: 'A configuration file used on web servers running the Apache Web Server software. When a visitor requests a file from your website, Apache checks for an .htaccess file to see if there are any special rules to apply, such as redirects.'
    }
};