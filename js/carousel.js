---
---
let carouselLoad = (src) => {
    //Find list source and carousel element

    let listSource = "{{site.url}}/" + src + "list.json"
    let carousel = $(".carousel:first");

    $("meta").each(function () {
        switch ($(this).attr("name")) {
        case "list-src":
            listSource = $(this).attr("content");
            break;
        case "carousel":
            carousel = $($(this).attr("content"));
            break;
        }
    });

    //Run AJAX call
    $.ajax({
        url: listSource,
        dataType: "json"
    }).done(contents => {
        var slideContainer = carousel.children(".carousel-inner:first");

        slideContainer.empty();

        contents.forEach(function (item, i) {
            var indicator = $(document.createElement("li"));
            var slideDiv = $(document.createElement("div"));
            var slideBackImg = $(document.createElement("img"));
            var slideImg = $(document.createElement("img"));
            var slideCaption = $(document.createElement("div"));
            var slideTitle = $(document.createElement("h3"));
            var slideDesc = $(document.createElement("p"));

            //Add slide indicator
            indicator.attr("data-target", '#' + carousel.attr("id"));
            indicator.attr("data-slide-to", i);

            if (i === 0) indicator.addClass("active");

            carousel.children("ol:first").append(indicator);

            //Initialize slide wrapper
            slideDiv.addClass("carousel-item");

            if (i === 0) slideDiv.addClass("active");

            //Initialize slide imagery
            slideBackImg.attr("src", (src + item.img));
            slideBackImg.addClass("carousel-back-image");

            slideImg.attr("src", slideBackImg.attr("src"));
            slideImg.attr("alt", item.title);

            slideDiv.append(slideBackImg);
            slideDiv.append(slideImg);

            //Initialize slide caption
            slideCaption.addClass("carousel-caption");
            slideTitle.text(item.title);
            slideDesc.text(item.description);

            slideCaption.append(slideTitle);
            slideCaption.append(slideDesc);
            slideDiv.append(slideCaption);

            slideContainer.append(slideDiv);
        });
        }).fail((xhr, textStatus, thrownError) => {
            console.log(textStatus, thrownError);
        });;
};
