import orgData from './org-data.json';

const isMobile = /Mobi|Android/i.test(navigator.userAgent);

orgData.forEach(entry => {
    const svgElement = document.getElementById(entry.id);

    if (svgElement !== null) {
        svgElement.setAttribute('data-bs-toggle', 'popover');
        svgElement.setAttribute('data-bs-title', entry.title);
        svgElement.setAttribute('data-bs-placement', isMobile ? 'top' : entry.placement);
        svgElement.setAttribute('data-bs-content', entry.content);
        svgElement.setAttribute('data-bs-trigger', isMobile ? 'click' : 'hover');
    } else {
        console.log(`Error: Element with id ${entry.id} does not exist`);
    }
});
