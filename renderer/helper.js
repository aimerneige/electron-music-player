exports.$ = (id) => {
  return document.getElementById(id);
};

exports.convertDuration = (time) => {
  const minutes = "0" + Math.floor(time / 60);
  const second = "0" + Math.floor(time - minutes * 60);
  return minutes.substr(-2) + ":" + second.substr(-2);
};
