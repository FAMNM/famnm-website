/**
 * Web encapsulation - functions to encapsulate external web content
 */

function openInModal (event, title)
{
    var href;
    
    if (event instanceof Event)
    {
        href = event.target.href;
        event.preventDefault();
    }
    else if (event instanceof String)
        href = event;
    
    var href = event.target.href;
    var modalParts = getLargeModal();
    var webFrame = document.createElement("iframe");
    
    webFrame.css("width", "100%");
    webFrame.css("height", "65vh");
    webFrame.src = href;
    modalParts.body.appendChild(webFrame);
    
    document.body.appendChild(modalParts.div);
    modalParts.div.css("display", "block");
    
    appendChildElt($(modalParts.footer), "button")
    $(modalParts.footer).children.first().addClass("btn btn-primary");
    $(modalParts.footer).children.first().attr("type", "button");
    $(modalParts.footer).children.first().attr("data-dismiss", "modal");
    $(modalParts.footer).children.first().text("Close");
    $(modalParts.footer).children.first().click(e => $(".modal").first().remove());
    
    $(modalParts.div).addClass("show");
    $(modalParts.header).children.first().text(title);
}

appendChildElt = (obj, elt) => $(obj).append(document.createElement(elt));

function getLargeModal ()
{
    var modalParts = new Object();
    
    //Get the divs that compose the modal
    modalParts.div = document.createElement("div");
    modalParts.dialog = appendChildElt($(modalParts.div), "div")
    modalParts.content = appendChildElt($(modalParts.dialog), "div")
    modalParts.header = appendChildElt($(modalParts.content), "div")
    modalParts.body = appendChildElt($(modalParts.content), "div")
    modalParts.footer = appendChildElt($(modalParts.content), "div")
    
    //Set modal properties
    $(modalParts.div).addClass("modal fade bd-example-modal-lg");
    $(modalParts.div).attr("id", "large-modal-open");
    $(modalParts.div).css("backgroundColor", "rgba(0,0,0,0.5)");
    $(modalParts.div).attr("tabIndex", -1);
    $(modalParts.div).attr("role", "dialog");
    $(modalParts.div).attr("aria-labelledby", "modal-header");
    $(modalParts.div).attr("aria-hidden", "true");
    
    $(modalParts.dialog).addClass("modal-dialog modal-lg");
    $(modalParts.content).addClass("modal-content");
    $(modalParts.header).addClass("modal-header");
    $(modalParts.body).addClass("modal-body");
    $(modalParts.footer).addClass("modal-footer");
    
    appendChildElt($(modalParts.header), "h4")
    $(modalParts.header).children.first().addClass("modal-title");
    $(modalParts.header).children.first().addClass("id", "modal-header");
    
    appendChildElt($(modalParts.header), "button")
    $(modalParts.header).children.last().attr("type", "button");
    $(modalParts.header).children.last().addClass("close");
    $(modalParts.header).children.last().attr("data-dismiss", "modal");
    $(modalParts.header).children.last().attr("aria-label", "Close");
    appendChildElt($(modalParts.header).children.last(), "span");
    $(modalParts.header).children.last().children.last().text("\u2a09");
    $(modalParts.header).children.last().click(e => $(".modal").first().remove());
    
    return modalParts;
}
