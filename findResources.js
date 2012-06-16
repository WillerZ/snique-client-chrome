var port = chrome.extension.connect();
function findSrc(element)
{
  if ((element.hasAttribute != undefined) && element.hasAttribute("src"))
  {
    var srcAttribute = element.getAttribute("src");
    var base = element.baseURI;
    port.postMessage({"src":srcAttribute,"base":base});
  }
  var children = element.childNodes;
  for (var i = 0; i < children.length; ++i)
    findSrc(children[i]);
}
findSrc(document);
port.disconnect();
