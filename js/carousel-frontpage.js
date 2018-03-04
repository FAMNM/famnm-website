function fillCarousel(listXml)
{
	var carousel = document.getElementById("frontpage-carousel");
	var slideContainer = carousel.getElementsByClassName("carousel-inner")[0];
	var items = listXml.getElementsByTagName("carousel-item");
	
	while (slideContainer.firstChild)
		slideContainer.removeChild(slideContainer.firstChild);
	
	for (var i = 0; i < items.length; i++)
	{
		//INITIALIZE SLIDE INDICATOR *********************************
		var indicator = document.createElement("li");
		indicator.setAttribute("data-target","#frontpage-carousel");
		indicator.setAttribute("data-slide-to",i);
		
		if (i == 0)
			indicator.classList.add("active");
		
		carousel.getElementsByTagName("ol")[0].appendChild(indicator);
		
		//VARIABLES FOR SLIDE ****************************************
		var slideDiv = document.createElement("div");
		var slideImg = document.createElement("img");
		var slideCaption = document.createElement("div");
		var slideTitle = document.createElement("h3");
		var slideDesc = document.createElement("p");
		
		//INITIALIZE SLIDE WRAPPER ***********************************
		slideDiv.classList.add("item");
		
		if (i == 0)
			slideDiv.classList.add("active");
		
		//INITIALIZE SLIDE IMAGE *************************************
		slideImg.src = "img/carousel/" + items[i].getAttribute("fname");
		slideImg.alt = items[i].getElementsByTagName("title")[0].textContent;
		
		slideDiv.appendChild(slideImg);
		
		//INITIALIZE SLIDE CAPTION ***********************************
		slideCaption.classList.add("carousel-caption");
		slideTitle.innerHTML = items[i].getElementsByTagName("title")[0].textContent;
		slideDesc.innerHTML = items[i].getElementsByTagName("description")[0].textContent;
		
		slideCaption.appendChild(slideTitle);
		slideCaption.appendChild(slideDesc);
		slideDiv.appendChild(slideCaption);
		
		slideContainer.appendChild(slideDiv); 
	}
}

function start_fillCarousel()
{
	runAjax("http://famnm.club/img/carousel/list.xml",fillCarousel);
}

function runAjax(url,callback)
{
	var xrq = new XMLHttpRequest();
	
	xrq.open("GET",url,true);
	xrq.responseType = "document";
	xrq.overrideMimeType("text/xml");
	
	xrq.onreadystatechange = function () {
		if (xrq.readyState == 4 && xrq.status == "200")
			callback(xrq.responseXML);
	}
	
	xrq.send();
}