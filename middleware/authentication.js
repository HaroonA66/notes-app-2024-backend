const MasterKey = "6e74bd-9a82e7-c1f490-5d68f3";

const verifyAcces = (req, res, next) => {
  const apiKey = req.query.myKey;

  if (!apiKey) {
    res.status(401).json({ Message: "API key is missing" });
  } else if (apiKey !== MasterKey) {
    res.status(403).json({ Message: "Invalid API key" });
  } else if (apiKey === MasterKey) {
    // authorized: go ahead
    next();
  }
};
export default verifyAcces;
