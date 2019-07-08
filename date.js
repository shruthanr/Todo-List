module.exports = function () { //Can be anonymously done. module.exports may be written as exports only
  const today = new Date();
  let options = {
    weekday : 'long',
    day : 'numeric',
    month : 'long'
  };

  return today.toLocaleDateString("en-IN", options);

}
// or module.exports.getDate = getDate;
// use let day = date.getdate()
