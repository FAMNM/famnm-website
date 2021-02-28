---
---
let carouselLoad = (src) => {
    //Find list source and carousel element
    let listSource = src + "list.json"
    let carousel = $(".carousel:first");

    //Run fetch call
    fetch(listSource)
    .then( (response) =>{
        if (!response.ok) throw Error(response.statusText);
        return response.json();
    }).then(carouselItems => {
        const slideContainer = carousel.children(".carousel-inner:first");

        slideContainer.empty();

        carouselItems.forEach((carouselItem, i) => {
            
            //Add slide indicator
            const indicator = $(document.createElement("li"));
            
            indicator.attr("data-target", '#' + carousel.attr("id"));
            indicator.attr("data-slide-to", i);
            if (i === 0) indicator.addClass("active");
            
            carousel.children("ol:first").append(indicator);
            
            //Initialize slide wrapper
            
            const outerDiv = $(document.createElement("div"));
            
            outerDiv.addClass("carousel-item");
            if (i === 0) outerDiv.addClass("active");

            //Initialize slide imagery

            const mainImage = $(document.createElement("img"));
            const blurredImage = $(document.createElement("img"));

            blurredImage.attr("src", (src + carouselItem.img));
            blurredImage.addClass("carousel-back-image");

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
    }).catch(console.log);
};
