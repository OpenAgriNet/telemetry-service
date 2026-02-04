const handleCallback = (callback, ...args) => {
    if (callback && typeof callback === 'function') {
      callback(...args);
    }
  };
  
  module.exports = { handleCallback };