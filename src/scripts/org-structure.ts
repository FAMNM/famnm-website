const isMobile = /Mobi|Android/i.test(navigator.userAgent);

const orgDataString = document.getElementById('org-structure-script')?.dataset.orgdata;

if (orgDataString !== undefined) {
    const orgData: [{
        id: string,
        title: string,
        placement: string,
        content: string,
    }] = JSON.parse(orgDataString);

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
} else {
    console.log('Error: orgData not present');
}
