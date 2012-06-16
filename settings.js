// Saves options to localStorage.
function save_options()
{
  var keyBox = document.getElementById("key");
  var keyHex = keyBox.value;
  keyHex = keyHex.replace(/[^abcdefABCDEF0123456789]/g,'');
  var status = document.getElementById("status");
  if (keyHex.length == 0)
  {
    localStorage.aeskey=null;
    status.innerHTML = "Key Removed";
    setTimeout(function() {
      status.innerHTML = "";
    }, 750);
  }
  else if (!((keyHex.length == 32) || (keyHex.length == 64)))
  {
    status.innerHTML = "Invalid Key";
    setTimeout(function() {
      status.innerHTML = "";
    }, 750);
  }
  else
  {
    localStorage.aeskey = keyHex
    status.innerHTML = "Key Saved";
    setTimeout(function() {
      status.innerHTML = "";
    }, 750);
  }
}
// Restores select box state to saved value from localStorage.
function restore_options()
{
  var keyHex = localStorage.aeskey;
  if (keyHex)
  {
    var keyBox = document.getElementById("key");
    keyBox.value = keyHex;
  }
}

document.addEventListener('DOMContentLoaded', function ()
{
  document.getElementById('save').addEventListener('click',save_options);
  restore_options();
});
