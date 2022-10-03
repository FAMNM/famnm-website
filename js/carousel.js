---
---
async function carouselLoad(src) {
    //Find list source and carousel element
    const listSource = src + "list.json";
    const carousel = $(".carousel:first");

    //Run fetch call
    try {
        const response = await fetch(listSource)
        if (!response.ok) throw Error(response.statusText);
        const carouselItems = await response.json();
        const slideContainer = carousel.children(".carousel-inner:first");

        slideContainer.empty();

        carouselItems.forEach((carouselItem, i) => {
            
            // Add slide indicator
            const indicator = $(document.createElement("button"));
            
            indicator.attr("data-bs-target", '#' + carousel.attr("id"));
            indicator.attr("data-bs-slide-to", i);
            if (i === 0) indicator.addClass("active");
            
            carousel.children(".carousel-indicators").append(indicator);
            
            // Initialize slide wrapper
            const outerDiv = $(document.createElement("div"));
            
            outerDiv.addClass("carousel-item");
            if (i === 0) outerDiv.addClass("active");

            //Initialize slide imagery
            const mainImage = $(document.createElement("img"));
            const blurredImage = $(document.createElement("img"));

            blurredImage.attr("src", (src + carouselItem.img));
            blurredImage.addClass("carousel-back-image");
            // Let screen readers and Reader Mode ignore the (duplicate) background image
            blurredImage.attr("aria-hidden", true);

            mainImage.attr("src", blurredImage.attr("src"));
            mainImage.attr("alt", carouselItem.title);

            outerDiv.append(blurredImage);
            outerDiv.append(mainImage);
            
            //Initialize slide caption

            const captionContainer = $(document.createElement("div"));
            const captionTitle = $(document.createElement("h3"));
            const captionDesc = $(document.createElement("p"));

            captionContainer.addClass("carousel-caption");
            captionTitle.text(carouselItem.title);
            captionDesc.text(carouselItem.description);

            captionContainer.append(captionTitle);
            captionContainer.append(captionDesc);
            outerDiv.append(captionContainer);

            slideContainer.append(outerDiv);
        });
    } catch (e) {
        console.error(e);
    }
};
