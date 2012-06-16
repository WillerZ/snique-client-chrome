function tryDecode(array)
{
  var IV=[], message='';
  var key = localStorage.aeskey;
  if (!key)
    key = '00112233445566778899aabbccddeeff';
  var key = CryptoJS.enc.Hex.parse(key);
  for (i = 0; i < array.length; ++i)
    message = message + array[i];
  if (message.length < 64)
    return;
  IV = message.slice(0,32);
  IV = CryptoJS.enc.Hex.parse(IV);
  message=message.slice(32);
  message=message.slice(0,Math.floor(message.length/32)*32);
  message=message + '00000000000000000000000000000000';
  message = CryptoJS.enc.Hex.parse(message);
  var aesDecryptor = CryptoJS.algo.AES.createDecryptor(key, {iv: IV, padding: CryptoJS.pad.NoPadding});
  var decoded = aesDecryptor.process(message);
  decoded = decoded.toString();
  var eyecatcher = decoded.slice(0,8);
  if (eyecatcher == 'facef00d')
  {
    var length = decoded.substr(8,8);
    length = parseInt(length,16);
    if (((length * 2) + 16) < decoded.length)
    {
      var messageHex = decoded.substr(16,length * 2);
      var messageBuf = CryptoJS.enc.Hex.parse(messageHex);
      var printMessage = messageBuf.toString(CryptoJS.enc.Utf8);
      var notification = webkitNotifications.createNotification(
	chrome.extension.getURL('icon48.png'),
	'snique',
	printMessage
      );
      notification.show();
    }
  }
  //var finish = aesDecryptor.finalize();
  //console.log("finish=" + finish);
  if (array.length > 1)
  {
    array.shift();
    tryDecode(array);
  }
}
chrome.extension.onConnect.addListener(function(port)
{
  var srcArray = [];
  var xhrArray = [];
  var srcETags = {};
  port.onMessage.addListener(function(msg)
  {
    var src = msg.src;
    if (!((src.substr(0,5) == "http:") || (src.substr(0,6) == "https:")))
      src = msg.base + '/' + src;
    srcArray.push(src);
    xhr = new XMLHttpRequest();
    xhr.open('HEAD',src,false);
    xhr.onreadystatechange = function()
    {
      if (xhr.readyState >= XMLHttpRequest.HEADERS_RECEIVED)
      {
	var ETag = xhr.getResponseHeader("ETag");
	if (!((ETag == undefined) || (ETag == null) || (ETag.length < 2)))
	{
	  srcETags[src] = ETag;
	}
      }
    };
    xhrArray.push(xhr);
    xhr.send();
  });
  port.onDisconnect.addListener(function()
  {
    var srcBytes = [];
    for (i = 0; i < srcArray.length; ++i)
    {
      var ETag = srcETags[srcArray[i]];
      if (!((ETag == undefined) || (ETag == null) || (ETag.length < 2)))
      {
	ETag = ETag.replace(/[^abcdefABCDEF0123456789]/g,'');
	ETag = ETag.substring(0,Math.floor(ETag.length / 2) * 2);
        var bytes = CryptoJS.enc.Hex.parse(ETag);
	srcBytes.push(bytes);
      }
    }
    tryDecode(srcBytes);
  });
});
