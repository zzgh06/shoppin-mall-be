const randomStringGenerator = () => {
  const randomString = Array.from({length: 10}, () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join('');
  return randomString;
};

module.exports = {randomStringGenerator};